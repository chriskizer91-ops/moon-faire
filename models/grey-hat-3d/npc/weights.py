# His half and quarter weights, made the way the fair folk's were (game/people/kit/make_weights.py): parts left off that cannot be
# seen, and a share of each other part's triangles kept. One number then scales every share so the total lands on the budget.
# The budgets are the fair folk's own: half about 5,500 triangles, quarter about 2,800 (theirs are 4.9 to 5.6 thousand, and 2.5 to 2.9).
#   python3 npc/weights.py            writes npc/weights.json and the pictures npc/out/weight-<name>.jpg
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look
from shoot import Shooter
# The template's torso, legs and upper arms are all under his own clothes (shirt and corset, trousers and boot shafts, full
# sleeves), so they are left off at every weight. The head keeps the most: his face, blink and mouth are on it.
HIDDEN = ['torso', 'legs', 'sleeve']
W = {
  'full':    {'drop': HIDDEN, 'rest': 1},
  'half':    {'drop': HIDDEN, 'keep': {'head': 0.85, 'hands': 0.4, 'boots': 0.24, 'soles': 0.1, 'forearm': 0.7, 'hat': 0.95, 'brim': 0.9, 'glasses': 1.0, 'hair': 0.9, 'beard': 0.9,
              'shirt': 0.8, 'trousers': 0.75, 'sleeves': 0.75, 'lace': 0.6, 'boot': 0.7, 'glove': 0.7, 'cuff': 0.7, 'belt': 0.9, 'pouch': 0.5, 'scroll': 0.8}, 'rest': 0.6},
  'quarter': {'drop': HIDDEN, 'keep': {'head': 0.52, 'hands': 0.2, 'boots': 0.12, 'soles': 0.05, 'forearm': 0.45, 'hat': 0.75, 'brim': 0.6, 'glasses': 0.8, 'hair': 0.6, 'beard': 0.6,
              'shirt': 0.45, 'trousers': 0.42, 'sleeves': 0.42, 'lace': 0.35, 'boot': 0.4, 'glove': 0.45, 'cuff': 0.5, 'belt': 0.8, 'pouch': 0.3, 'scroll': 0.6}, 'rest': 0.35},
}
TARGET = {'half': 5500, 'quarter': 2800}
async def build(s, w, sheet=False):
    facts, pic = await s.shoot(look.code(json.dumps(w)), 0.85, look.skin()) if sheet else (await s.body.evaluate('([c, k]) => { const S = k; S.SKIN = new Function(S.SKIN_TEXT + "\\n;return SKIN;")(); return PV.show(c, S); }', [look.code(json.dumps(w)), look.skin()]), None)
    return facts['partTris'], facts.get('triangles'), pic
async def main():
    s = await Shooter().start(); out = {}
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    for name in ['full', 'half', 'quarter']:
        w = dict(W[name])
        if name in TARGET:
            lo, hi, best = 0.3, 2.5, None
            for _ in range(14):
                mid = (lo * hi) ** 0.5; tris, _, _ = await build(s, dict(w, scale=mid)); n = sum(tris.values())
                if best is None or abs(n - TARGET[name]) < abs(best[1] - TARGET[name]): best = (mid, n)
                if abs(n - TARGET[name]) <= 0.02 * TARGET[name]: break
                if n > TARGET[name]: hi = mid
                else: lo = mid
            w['scale'] = round(best[0], 4)
        tris, _, pic = await build(s, w, True)
        pic.save(os.path.join(HERE, 'out', 'weight-%s.jpg' % name), quality=86)
        out[name] = {'weight': w, 'triangles': sum(tris.values()), 'parts': tris}
        print(name, sum(tris.values()), json.dumps(tris))
    await s.stop()
    json.dump(out, open(os.path.join(HERE, 'weights.json'), 'w'), indent=1)
asyncio.run(main())
