# Has a Claude model (through the key) write the people's talking loops and emotes, shows it film strips of each on a painted
# person, and lets it fix them. Writes people/npc/emotes.src.js (the file as the model wrote it), strips in people/npc/strips/ and a log.
#   python3 people/kit/make_emotes.py [--model claude-fable-5-2] [--effort high] [--rounds 3]
import argparse, asyncio, base64, io, json, os, sys, time
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
import make_person as MP
from paint_person import load_skin, b64jpg, OUT as PAINTED
NPC = os.path.join(HERE, '..', 'npc')
async def strips(shooter, person_code, skin, code):
    pg = shooter.body
    await pg.evaluate('([c, s]) => { if (s && s.SKIN_TEXT) s.SKIN = new Function(s.SKIN_TEXT + "\\n;return SKIN;")(); return PV.show(c, s); }', [person_code, skin]); await pg.wait_for_timeout(700)
    try: info = await pg.evaluate('(c) => PV.defEmotes(c)', code)
    except Exception as e: return {'durs': {}, 'bad': ['the file did not run: ' + str(e).split('\n')[0][:300]]}, {}
    rows = {}
    for name, dur in info['durs'].items():
        frames = await pg.evaluate('([n, d]) => PV.strip(n, 6, d)', [name, dur]); row = Image.new('RGB', (150 * 6 + 130, 280), (40, 34, 50))
        for i, f in enumerate(frames): row.paste(Image.open(io.BytesIO(base64.b64decode(f.split(',')[1]))).resize((150, 280), Image.LANCZOS), (130 + 150 * i, 0))
        ImageDraw.Draw(row).text((8, 126), '%s\n%.1f s' % (name, dur), fill=(255, 255, 255)); rows[name] = row
    return info, rows
def sheets(rows, per=5):
    names = list(rows); out = []
    for i in range(0, len(names), per):
        part = names[i:i + per]; sh = Image.new('RGB', (1030, 280 * len(part)))
        for j, n in enumerate(part): sh.paste(rows[n], (0, 280 * j))
        out.append(sh)
    return out
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--model', default='claude-fable-5-2'); ap.add_argument('--effort', default='high'); ap.add_argument('--rounds', type=int, default=3)
    ap.add_argument('--on', default='lampseller-A__hand'); a = ap.parse_args()
    os.makedirs(os.path.join(NPC, 'strips'), exist_ok=True); d = os.path.join(PAINTED, a.on); lg = json.load(open(d + '/log.json')); mid, letter = lg['skin'].split('-')
    person = open(os.path.join(HERE, '..', lg['person']), encoding='utf-8').read(); skin = dict(load_skin(mid, letter), SKIN_TEXT=open(d + '/skin.js').read())
    MP.KIT = open(os.path.join(HERE, 'EMOTE-KIT.md'), encoding='utf-8').read(); s = await Shooter().start()
    messages = [{'role': 'user', 'content': 'Write the library.'}]; log = {'model': a.model, 'effort': a.effort, 'rounds': []}; best = None
    for n in range(1, a.rounds + 1):
        t0 = time.time(); res = await asyncio.to_thread(MP.ask, a.model, messages, 48000, a.effort); u = res['usage']
        text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text')
        rd = {'n': n, 'seconds': round(time.time() - t0, 1), 'usage': {k: u.get(k) for k in ('input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens')}, 'cost': MP.cost(a.model, u)}
        log['rounds'].append(rd); messages.append({'role': 'assistant', 'content': res['content']})
        if text.strip().upper().startswith('DONE') and best: rd['said'] = 'DONE'; break
        code = MP.code_of(text); bad = [b for b in MP.BANNED if b in code]; rd['said'] = 'file'
        if 'const EMOTES' not in code or bad: info, rows = {'durs': {}, 'bad': ['no usable "const EMOTES = {...}" block' + (': ' + ', '.join(bad) if bad else '')]}, {}
        else: info, rows = await strips(s, person, skin, code)
        rd['emotes'] = len(info['durs']); rd['bad'] = info['bad']
        if rows:
            best = code; open(os.path.join(NPC, 'emotes.src.js'), 'w', encoding='utf-8').write(code + '\n'); open(os.path.join(NPC, 'emotes.v%d.js' % n), 'w', encoding='utf-8').write(code + '\n')
            for nm, row in rows.items(): row.save(os.path.join(NPC, 'strips', '%s.jpg' % nm), quality=84)
        print('round', n, 'emotes', len(info['durs']), 'bad', info['bad'], '$%.3f' % rd['cost'], '%ss' % rd['seconds'], flush=True)
        if n == a.rounds: break
        content = [b64jpg(sh, 80) for sh in sheets(rows)]
        content.append({'type': 'text', 'text': ('Errors: ' + ' | '.join(info['bad']) + '\n' if info['bad'] else '') + ('Each row is one move: six pictures evenly through it, on the old lamp-seller. ' if rows else 'Nothing could be drawn. ') + 'Reply DONE if they are right, or the whole corrected file.'})
        messages.append({'role': 'user', 'content': content})
    log['cost'] = sum(r['cost'] for r in log['rounds']); log['seconds'] = round(sum(r['seconds'] for r in log['rounds']), 1); json.dump(log, open(os.path.join(NPC, 'emotes.log.json'), 'w'), indent=1)
    print('emotes: $%.2f, %ss, %s' % (log['cost'], log['seconds'], [r.get('said') for r in log['rounds']])); await s.stop()
if __name__ == '__main__': asyncio.run(main())
