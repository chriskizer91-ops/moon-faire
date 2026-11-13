# Asks a Claude model to make one person from the kit, draws what it wrote, shows it the picture, and lets it fix it.
# Counts every token and prices it. The key is read from the file named by MF_KEY_FILE (default ~/.mf/key), never printed or saved.
#   python3 people/kit/make_person.py --model claude-haiku-5-5 --id baker --desc "A stout baker ..." [--rounds 3] [--out people/runs]
import argparse, asyncio, base64, io, json, os, re, sys, time
import requests
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
# US dollars per million tokens: input, output, 5-minute cache write, cache read (platform.claude.com/docs/en/about-claude/pricing, read November 13 2026)
PRICES = {'claude-haiku-5-5': (0.10, 0.50, 0.125, 0.01), 'claude-sonnet-5-5': (2.0, 10.0, 2.50, 0.10), 'claude-opus-5-5': (4.0, 20.0, 5.0, 0.20)}
BANNED = ['fetch(', 'XMLHttpRequest', 'document.', 'window.', 'eval(', 'Function(', 'import(', 'import ', 'localStorage', 'location', 'navigator', 'WebSocket', 'require(', 'globalThis', 'setTimeout', 'setInterval', 'while (true', 'while(true']
KIT = open(os.path.join(HERE, 'PERSON-KIT.md'), encoding='utf-8').read()
def key(): return open(os.path.expanduser(os.environ.get('MF_KEY_FILE', '~/.mf/key'))).read().strip()
def cost(model, u):
    p = PRICES[model]; return (u.get('input_tokens', 0) * p[0] + u.get('output_tokens', 0) * p[1] + (u.get('cache_creation_input_tokens') or 0) * p[2] + (u.get('cache_read_input_tokens') or 0) * p[3]) / 1e6
def ask(model, messages, max_tokens):
    body = {'model': model, 'max_tokens': max_tokens, 'system': [{'type': 'text', 'text': KIT, 'cache_control': {'type': 'ephemeral'}}], 'messages': messages}
    for attempt in range(4):
        r = requests.post('https://api.anthropic.com/v1/messages', headers={'x-api-key': key(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json'}, data=json.dumps(body), timeout=600)
        if r.status_code in (429, 500, 502, 503, 529): time.sleep(8 * (attempt + 1)); continue
        break
    if r.status_code != 200: raise RuntimeError('API %d: %s' % (r.status_code, r.text[:300]))
    return r.json()
def code_of(text):
    m = re.search(r'```(?:js|javascript)?\s*\n(.*?)```', text, re.S)
    return (m.group(1) if m else text).strip()
async def run(model, pid, desc, rounds, out, shooter, max_tokens=12000):
    d = os.path.join(out, '%s__%s' % (pid, model)); os.makedirs(d, exist_ok=True)
    messages = [{'role': 'user', 'content': 'Person: ' + desc}]; log = {'model': model, 'id': pid, 'desc': desc, 'rounds': [], 'kit_chars': len(KIT)}
    last = None
    for n in range(1, rounds + 1):
        t0 = time.time(); res = await asyncio.to_thread(ask, model, messages, max_tokens); secs = time.time() - t0
        text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text'); u = res['usage']
        rd = {'n': n, 'seconds': round(secs, 1), 'usage': {k: u.get(k) for k in ('input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens')}, 'cost': cost(model, u),
              'thought': any(b['type'] in ('thinking', 'redacted_thinking') for b in res['content']), 'stop': res.get('stop_reason')}
        log['rounds'].append(rd); messages.append({'role': 'assistant', 'content': res['content']})
        if text.strip().upper().startswith('DONE') and last: rd['said'] = 'DONE'; break
        code = code_of(text); bad = [b for b in BANNED if b in code]
        if 'const PERSON' not in code: facts, sheet = {'errors': ['the reply held no "const PERSON = {...}" code block']}, None
        elif bad: facts, sheet = {'errors': ['not allowed in a person file: ' + ', '.join(bad)]}, None
        else: facts, sheet = await shooter.shoot(code, 0.85)
        rd['facts'] = facts; rd['said'] = 'file'
        open(os.path.join(d, 'v%d.js' % n), 'w', encoding='utf-8').write(code + '\n')
        if sheet:
            sheet.save(os.path.join(d, 'v%d.jpg' % n), quality=86); last = n
        if n == rounds: break
        note = []
        if facts.get('errors'): note.append('Errors: ' + ' | '.join(facts['errors']))
        if sheet: note.append('Built: %d triangles in your own shapes %s.' % (sum(facts['own'].values()), json.dumps(facts['own'])))
        note.append(('The picture shows it as built: front, three-quarter, side, back and walking, then the face from the front and from the side. ' if sheet else 'Nothing could be drawn. ') +
                    'If it is right, reply DONE. If not, reply with the whole corrected file.')
        content = []
        if sheet:
            b = io.BytesIO(); sheet.save(b, 'JPEG', quality=80); content.append({'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}})
        content.append({'type': 'text', 'text': ' '.join(note)}); messages.append({'role': 'user', 'content': content})
    log['final'] = last; log['cost'] = sum(r['cost'] for r in log['rounds']); log['seconds'] = round(sum(r['seconds'] for r in log['rounds']), 1)
    for k in ('input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens'): log[k] = sum((r['usage'].get(k) or 0) for r in log['rounds'])
    json.dump(log, open(os.path.join(d, 'log.json'), 'w'), indent=1)
    return log
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--model', required=True); ap.add_argument('--id'); ap.add_argument('--desc'); ap.add_argument('--list'); ap.add_argument('--rounds', type=int, default=3); ap.add_argument('--out', default=os.path.join(HERE, '..', 'runs'))
    a = ap.parse_args(); todo = json.load(open(a.list)) if a.list else [{'id': a.id, 'desc': a.desc}]
    s = await Shooter().start()
    for p in todo:
        try:
            L = await run(a.model, p['id'], p['desc'], a.rounds, a.out, s)
            print('%-12s %-18s rounds %d  in %d  out %d  cache w %d r %d  $%.4f  %ss  final v%s  %s' % (p['id'], a.model, len(L['rounds']), L['input_tokens'], L['output_tokens'], L['cache_creation_input_tokens'], L['cache_read_input_tokens'], L['cost'], L['seconds'], L['final'], [r.get('said') for r in L['rounds']]), flush=True)
        except Exception as e: print(p['id'], a.model, 'FAILED', str(e)[:300], flush=True)
    await s.stop()
if __name__ == '__main__': asyncio.run(main())
