# Makes two lighter weights of each set of shapes: half the triangles and a quarter. A Claude model (through the key) decides which parts
# to leave off and how to share the triangles between the rest, looking at the result; the tool holds each total to its budget.
#   python3 people/kit/make_weights.py [--only lampseller,fortune-fable] [--model claude-fable-5-2] [--effort high] [--rounds 3]
# Writes people/weights/<shapes>.json (the weights, the triangle counts, the cost) and <shapes>.jpg (full, half and quarter, one above the other).
import argparse, asyncio, io, json, os, sys, time
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
import make_person as MP
from paint_person import load_skin, b64jpg
P = os.path.join(HERE, '..'); OUT = os.path.join(P, 'weights')
def shapes():
    out = []
    for tag in ['hand', 'fable', 'opus']:
        for pid in (['lampseller'] if tag == 'hand' else ['fortune', 'watchman', 'baker', 'farmhand']):
            d = os.path.join(P, 'painted', '%s-A__%s' % (pid, tag)); lg = json.load(open(d + '/log.json'))
            out.append({'id': pid if tag == 'hand' else '%s-%s' % (pid, tag), 'pid': pid, 'dir': d, 'person': lg['person'], 'code': open(os.path.join(P, lg['person']), encoding='utf-8').read(),
                        'scale': json.load(open(d + '/person-scale.json')) if os.path.exists(d + '/person-scale.json') else {}})
    return out
async def build(s, sh, wt, sheet=True):
    skin = dict(load_skin(sh['pid'], 'A'), SKIN_TEXT=open(sh['dir'] + '/skin.js').read(), person=dict(sh['scale'], weight=wt))
    if sheet: facts, im = await s.shoot(sh['code'], 0.6, skin)
    else: facts, im = await s.body.evaluate('([c, k]) => { k.SKIN = new Function(k.SKIN_TEXT + "\\n;return SKIN;")(); return PV.show(c, k); }', [sh['code'], skin]), None
    if facts.get('errors'): raise RuntimeError(' | '.join(facts['errors']))
    return facts['partTris'], im
async def fit(s, sh, wt, target):
    # one number scales every share so the total lands on the budget
    lo, hi, best = 0.05, 6.0, None
    for i in range(11):
        mid = (lo * hi) ** 0.5; w = dict(wt, scale=mid); tris, _ = await build(s, sh, w, False); n = sum(tris.values())
        if best is None or abs(n - target) < abs(best[1] - target): best = (w, n)
        if abs(n - target) <= 0.02 * target: break
        if n > target: hi = mid
        else: lo = mid
    return best[0]
def clean(w):
    w = w or {}; return {'drop': [str(x) for x in (w.get('drop') or [])], 'keep': {str(k): max(0.05, min(1.0, float(v))) for k, v in (w.get('keep') or {}).items()}, 'rest': max(0.05, min(1.0, float(w.get('rest', 0.5))))}
def table(full, half, quarter):
    rows = ['part: full, half, quarter'] + ['%s: %d, %s, %s' % (k, v, half.get(k, 'left off'), quarter.get(k, 'left off')) for k, v in full.items()]
    return '\n'.join(rows) + '\ntotal: %d, %d, %d' % (sum(full.values()), sum(half.values()), sum(quarter.values()))
def stack(ims, labels):
    W = ims[0].width; out = Image.new('RGB', (W, sum(i.height for i in ims))); y = 0; g = ImageDraw.Draw(out)
    for im, lb in zip(ims, labels): out.paste(im, (0, y)); g.text((8, y + 6), lb, fill=(255, 255, 255)); y += im.height
    return out
async def one(s, sh, model, effort, rounds):
    full, im_full = await build(s, sh, None); T = sum(full.values()); W = {'half': {'drop': [], 'keep': {}, 'rest': 0.5}, 'quarter': {'drop': [], 'keep': {}, 'rest': 0.25}}; tgt = {'half': T / 2, 'quarter': T / 4}
    async def both(W):
        res = {}
        for k in ('half', 'quarter'):
            w = await fit(s, sh, W[k], tgt[k]); tris, im = await build(s, sh, w); res[k] = (w, tris, im)
        return res
    R = await both(W); first = R
    def show(R, note):
        im = stack([im_full, R['half'][2], R['quarter'][2]], ['full: %d triangles' % T, 'half: %d' % sum(R['half'][1].values()), 'quarter: %d' % sum(R['quarter'][1].values())])
        return im, [b64jpg(im, 84), {'type': 'text', 'text': '%s\nTop to bottom: full, half, quarter.\n%s\nReply with WEIGHTS, or DONE.' % (note, table(full, R['half'][1], R['quarter'][1]))}]
    MP.KIT = open(os.path.join(HERE, 'WEIGHT-KIT.md'), encoding='utf-8').read()
    im, content = show(R, 'The person: %s. The half and quarter here were made by thinning every part equally.' % sh['id']); messages = [{'role': 'user', 'content': content}]; log = []
    for n in range(1, rounds + 1):
        t0 = time.time(); res = await asyncio.to_thread(MP.ask, model, messages, 32000, effort); u = res['usage']; text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text')
        log.append({'n': n, 'seconds': round(time.time() - t0, 1), 'cost': MP.cost(model, u), 'said': 'DONE' if text.strip().upper().startswith('DONE') else 'file'}); messages.append({'role': 'assistant', 'content': res['content']})
        if log[-1]['said'] == 'DONE': break
        code = MP.code_of(text); note = 'With your weights.'
        try:
            if 'const WEIGHTS' not in code or [b for b in MP.BANNED if b in code]: raise RuntimeError('no usable "const WEIGHTS = {...}" block')
            got = json.loads(await s.body.evaluate('(c) => PV.data(c, "WEIGHTS")', code)); W2 = {k: clean(got.get(k)) for k in ('half', 'quarter')}; R = await both(W2); W = W2
        except Exception as e: note = 'That did not build (%s); the pictures are as before.' % str(e).split('\n')[0][:200]
        if n == rounds: break
        im, content = show(R, note); messages.append({'role': 'user', 'content': content})
    im, _ = show(R, ''); im.save(os.path.join(OUT, sh['id'] + '.jpg'), quality=85)
    eq = stack([im_full, first['half'][2], first['quarter'][2]], ['full', 'half, every part thinned equally', 'quarter, every part thinned equally']); eq.save(os.path.join(OUT, sh['id'] + '.equal.jpg'), quality=82)
    out = {'shapes': sh['id'], 'person': sh['person'], 'full': {'triangles': T, 'parts': full}, 'model': model, 'effort': effort, 'rounds': log, 'cost': sum(r['cost'] for r in log), 'seconds': round(sum(r['seconds'] for r in log), 1)}
    for k in ('half', 'quarter'): out[k] = {'weight': R[k][0], 'triangles': sum(R[k][1].values()), 'parts': R[k][1]}
    json.dump(out, open(os.path.join(OUT, sh['id'] + '.json'), 'w'), indent=1); return out
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--only'); ap.add_argument('--model', default='claude-fable-5-2'); ap.add_argument('--effort', default='high'); ap.add_argument('--rounds', type=int, default=3); a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True); s = await Shooter().start()
    for sh in shapes():
        if a.only and sh['id'] not in a.only.split(','): continue
        try:
            o = await one(s, sh, a.model, a.effort, a.rounds); print('%s full %d half %d quarter %d  drops %s / %s  $%.2f %ss %s' % (sh['id'], o['full']['triangles'], o['half']['triangles'], o['quarter']['triangles'], o['half']['weight']['drop'], o['quarter']['weight']['drop'], o['cost'], o['seconds'], [r['said'] for r in o['rounds']]), flush=True)
        except Exception as e: print(sh['id'], 'FAILED', str(e)[:300], flush=True)
    await s.stop()
if __name__ == '__main__': asyncio.run(main())
