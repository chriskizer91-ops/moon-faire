# Lays a painted skin on a person and has a Claude model (through the key) look at the result and finish the fit.
#   python3 people/kit/paint_person.py --person <person.js> --skin <model>/<letter> --tag <name> [--model claude-fable-5-2] [--effort high] [--rounds 3]
# Reads people/skins/<model>/<letter>-body.webp, -face.webp and <letter>.json (from prep_skin.py). Writes people/painted/<model>-<letter>__<tag>/:
# skin.js (the fitter's file), auto.jpg (the automatic fit alone), v<n>.jpg, final.jpg and log.json (tokens, seconds, cost per look).
import argparse, asyncio, base64, io, json, os, sys, time
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
import make_person as MP
SK = os.path.join(HERE, '..', 'skins'); OUT = os.path.join(HERE, '..', 'painted')
uri = lambda p, t: 'data:image/%s;base64,' % t + base64.b64encode(open(p, 'rb').read()).decode()
def b64jpg(im, q=82): b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q); return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
def load_skin(model, letter):
    d = os.path.join(SK, model); j = json.load(open(os.path.join(d, letter + '.json')))
    return {'body': uri(os.path.join(d, letter + '-body.webp'), 'webp'), 'face': uri(os.path.join(d, letter + '-face.webp'), 'webp'), 'fit': j['fit'], 'faceFit': j.get('faceFit', [1, 0, 0]), 'skin': j['skin']}
async def paint(shooter, person_path, model_id, letter, tag, model, effort, rounds, who=''):
    code = open(person_path, encoding='utf-8').read(); skin = load_skin(model_id, letter); d = os.path.join(OUT, '%s-%s__%s' % (model_id, letter, tag)); os.makedirs(d, exist_ok=True)
    facts, sheet = await shooter.shoot(code, 0.85, skin)
    if not sheet: raise RuntimeError('the person did not build: %s' % facts)
    sheet.save(os.path.join(d, 'auto.jpg'), quality=86); parts = facts.get('partNames', [])
    painter = Image.open(os.path.join(SK, model_id, letter + '-body.webp')).resize((1152, 768), Image.LANCZOS)
    MP.KIT = open(os.path.join(HERE, 'SKIN-KIT.md'), encoding='utf-8').read()
    start = 'const SKIN = { skin: %s };' % json.dumps(skin['skin'])
    messages = [{'role': 'user', 'content': [b64jpg(painter), b64jpg(sheet), {'type': 'text', 'text': 'First picture: the painter\'s body sheet. Second picture: the person as built with the automatic fit.%s\nThe model\'s parts: %s.\nThe file so far (the skin colour was read from the edge of the face picture): %s\nReply with the finished file, or DONE if nothing needs changing.' % ((' The person: ' + who) if who else '', ', '.join(parts), start)}]}]
    log = {'person': os.path.relpath(person_path, os.path.join(HERE, '..')), 'skin': '%s-%s' % (model_id, letter), 'tag': tag, 'model': model, 'effort': effort, 'rounds': [], 'parts': parts}
    best, n_ok = start, 0
    for n in range(1, rounds + 1):
        t0 = time.time(); res = await asyncio.to_thread(MP.ask, model, messages, 32000, effort); u = res['usage']
        text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text')
        rd = {'n': n, 'seconds': round(time.time() - t0, 1), 'usage': {k: u.get(k) for k in ('input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens')}, 'cost': MP.cost(model, u)}
        log['rounds'].append(rd); messages.append({'role': 'assistant', 'content': res['content']})
        if text.strip().upper().startswith('DONE'): rd['said'] = 'DONE'; break
        file = MP.code_of(text); bad = [b for b in MP.BANNED if b in file]; rd['said'] = 'file'
        if 'const SKIN' not in file or bad: note, sheet2 = 'The reply held no usable "const SKIN = {...}" block.', None
        else:
            facts2, sheet2 = await shooter.shoot(code, 0.85, dict(skin, SKIN_TEXT=file))
            note = '' if sheet2 else 'The file did not run: ' + ' | '.join(facts2.get('errors', []))
        if sheet2: best = file; n_ok = n; sheet2.save(os.path.join(d, 'v%d.jpg' % n), quality=86); open(os.path.join(d, 'skin.js'), 'w', encoding='utf-8').write(file + '\n')
        if n == rounds: break
        messages.append({'role': 'user', 'content': ([b64jpg(sheet2)] if sheet2 else []) + [{'type': 'text', 'text': (note + ' ' if note else 'The person with your file. ') + 'Reply DONE if it is right, or the whole corrected file.'}]})
    if not os.path.exists(os.path.join(d, 'skin.js')): open(os.path.join(d, 'skin.js'), 'w', encoding='utf-8').write(best + '\n')
    _, final = await shooter.shoot(code, 0.6, dict(skin, SKIN_TEXT=open(os.path.join(d, 'skin.js'), encoding='utf-8').read())); final.save(os.path.join(d, 'final.jpg'), quality=84)
    log['cost'] = sum(r['cost'] for r in log['rounds']); log['seconds'] = round(sum(r['seconds'] for r in log['rounds']), 1); log['looks'] = len(log['rounds'])
    json.dump(log, open(os.path.join(d, 'log.json'), 'w'), indent=1)
    return log
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--jobs', help='a JSON list of [person.js, model, letter, tag, who]'); ap.add_argument('--person'); ap.add_argument('--skin'); ap.add_argument('--tag', default='fable')
    ap.add_argument('--model', default='claude-fable-5-2'); ap.add_argument('--effort', default='high'); ap.add_argument('--rounds', type=int, default=3)
    a = ap.parse_args(); jobs = json.loads(a.jobs) if a.jobs else [[a.person] + a.skin.split('/') + [a.tag, '']]
    s = await Shooter().start()
    for person, mid, letter, tag, who in jobs:
        try:
            L = await paint(s, person, mid, letter, tag, a.model, a.effort, a.rounds, who)
            print('%s-%s %s looks %d $%.3f %ss %s' % (mid, letter, tag, L['looks'], L['cost'], L['seconds'], [r.get('said') for r in L['rounds']]), flush=True)
        except Exception as e: print(mid, letter, tag, 'FAILED', str(e)[:300], flush=True)
    await s.stop()
if __name__ == '__main__': asyncio.run(main())
