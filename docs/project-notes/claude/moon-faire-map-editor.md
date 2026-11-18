# The Moon Faire map editor (Envoi's map editor, set up for the nine painted places)

November 14, 2026.

- **Page:** "Moon Faire map editor", https://claude.ai/artifact/QB5xWW5fZPFQ1pFBisa7gr. Made for a laptop, as Envoi's was.
- **What Chris asked:** "I have a map fixing tool in the Envoi on the Longest Night game, and I can use that to fix the maps. So let's get that tool, and I'll use that on the maps for the current game."
- **Where the tool came from:** `chriskizer91-ops/envoi-on-the-longest-night`, branch `claude/send-note-gigdew`, commit `318bc96`, folder `envoi-final-draft/map-editor/` (with `envoi-game-pass-3/map-paths/edits-core.js`, `src/game/field.js` and the pixel figures). Both repos were only read. Nothing was pushed.

## What it is

Chris's own editor, unchanged in how it works. It now opens Moon Faire's nine walking paintings (W1 the fair square to W9 the beacon stair) in place of Envoi's maps.

- **Green: walk areas.** Where her feet can go.
- **Red: blocks.** Cut out of the walk areas.
- **Purple: fronts.** Pieces of the painting drawn over her when she walks behind them, each with a base line.
- **Exits, where she arrives, people and rest spots** can be dragged. None can be added or taken away in the editor.
- **Where Io can reach**, **Smooth**, undo and redo, and **Walk it** all work. Walk it uses Envoi's small pixel Io and plain hooded figures for people, as stand-ins.
- **Send everything new** sends each changed map to Claude. **Copy my work** gives the same as text to paste.
- Left out: Envoi's keepsakes (the switch and its two layers are hidden) and its painted paper dolls.

Every position is in the painting's own 1,774 by 887 pixels.

## What each map starts from

The game's own data, sent through each scene's camera into painting pixels. These are the shapes the paintings were made from, so they are close but not exact. Pulling them onto the painting is the fixing.

| | Walk areas | Blocks | Fronts | Exits | People | Rest spot |
|---|---|---|---|---|---|---|
| W1 The fair square | 2 | 9 | 11 | 1 | 4 | the party's wagon |
| W2 The stall row and the sparring ring | 3 | 4 | 4 | 2 | 3 | |
| W3 The mooring field | 4 | 1 | 2 | 3 | 3 | |
| W4 The Last Lantern | 3 | 1 | 1 | 2 | 1 | |
| W5 The standing stones | 4 | 0 | 2 | 3 | 0 | |
| W6 The still pool and the broken arch | 4 | 1 | 0 | 1 | 1 | the camp by the pool |
| W7 The hollow | 2 | 0 | 0 | 1 | 0 | |
| W8 The landing ledge | 2 | 0 | 0 | 2 | 1 | the airship |
| W9 The beacon stair | 5 | 0 | 0 | 2 | 0 | |

- Walk areas come from each layout's `ground` (W2 to W9: `game/world/scenes/W*.json`; W1: `game/src/scenes.js`).
- A block is the foot of any solid that stands on a walk area. A front is the outline of any solid that covers part of a walk area. Lantern posts get both, as Envoi's lamps do.
- Exits come from the layouts. Where she arrives is just inside the matching way back in the other place.

**Guesses of mine, to be put right in the editor:**

- W1's four people. The game has no places for them, only words ("on the red rug", "at the lamp stall on the near left"). I put them by those words.
- The three rest spots' places.
- W1 has one way out (right, to the stall row), as the map of November 13 has it. The pilot's older data also had a way out on the left; the lane is still walkable but leads nowhere.

## Reading what Chris sends

- **Sent from the page:** the page's store, collection `edits`, one document for each map (`edits/W1` and so on). Read with `db_list` on the page's slug, `bbaaae88-52fa-46de-ba90-4fcef02c2747`. The store was empty when the page was made. The page declares `db` and `user`.
- **Copied:** the text has `maps`, one entry for each changed map, in the same shape.
- A document holds that map's `walk`, `block`, `front` (`{ pts, base }`), and the moved `exits`, `people`, `spots`, `start` and `arrivals`, in painting pixels. The editor's own check (`MapEdits.validate` in `edits-core.js`) reads it.
- Once a map is in the game, delete its document, so the next reading finds only what is new.

## Getting it into the game (not done)

The game does not read these shapes yet. Today `game/src/field.js` reads discs and boxes in metres, and hides her behind the grey-box solids drawn in depth only. To use Chris's tracing:

1. **Pixels to ground.** Every scene has a fixed camera and flat ground, so a pixel of the painting is one point on the ground. `ground()` in `mf_maps.py` below does it, and the script checks that a pixel sent to the ground and back lands on itself. Cameras: W1 has `span: 15`; W2 to W9 have `span: 10.7`; all are a 12 degree lens pitched 24 degrees down at `[0, 0, -2.5]`.
2. **Walk areas and blocks** become polygons on the ground. `open(x, z)` in `field.js` needs a point-in-polygon test in place of its discs and boxes.
3. **Fronts** become flat upright cut-outs. A front's base line is a row of the painting; that row is one distance from the camera. The front's points are sent onto an upright sheet standing at that distance and drawn in depth only, in place of the grey-box solid. That makes the hiding follow the painting exactly.
4. Exits, people and rest spots are single points: `ground()` each.

## Checked, and not

- All nine maps open with their paintings; the starting shapes sit on the painted ground and lantern posts to within what the layouts allow (stills of W1, W2, W5).
- The editor's reach check finds nothing out of reach on any of the nine.
- Walk it starts and walks on W8.
- The page's store answers (empty).
- **Not checked:** the page on claude.ai itself, with Send. In the test browser there is no store, so only Copy was there. If Send does not show for Chris, Copy my work is the way.
- **Not checked:** on a phone. The editor is laid out for a laptop.

## The code

Two scripts, both below in full. `mf_maps.py` makes `mf-maps.js` (the nine maps with their paintings inside) from the starter-world branch's `game/` folder. `build_mf_editor.py` takes the editor's files from the Envoi repo with a handful of replacements (the painting size, how near she must stand, the walker's height, the page's names, the keepsakes hidden) and joins everything into one page. Each replacement must be found the stated number of times.

### mf_maps.py

```python
# mf_maps.py: Moon Faire's nine walking places in the shapes Envoi's map editor reads (window.MAPS), each position in the painting's own
# 1774 x 887 pixels. The starting shapes are the game's own data (the grey-box layouts the paintings were made from), sent through each
# scene's camera: walk areas from its ground, blocks and fronts from the solids that stand on or in front of the walk areas, exits,
# people and rest spots. Chris then pulls them onto the painting in the editor.
# usage: python3 -I mf_maps.py <game folder of branch claude/moon-faire-starter-world> <out folder>
import sys, os, json, math, io, base64
from PIL import Image, ImageDraw
G = sys.argv[1]; OUT = sys.argv[2]
FW, FH = 1774, 887
RAD = math.pi / 180

# ---------- the walking camera (game/src/stage.js setScene, 'walk') ----------
def camera(C):
    t = math.tan(C['fov'] / 2 * RAD); d = (C['span'] / 2) / t; p = C['pitch'] * RAD; T = C['target']
    pos = (T[0], T[1] + d * math.sin(p), T[2] + d * math.cos(p)); s, c = math.sin(p), math.cos(p)
    return {'pos': pos, 't': t, 's': s, 'c': c}
def project(K, x, y, z):
    vx, vy, vz = x - K['pos'][0], y - K['pos'][1], z - K['pos'][2]
    xc = vx; yc = vy * K['c'] - vz * K['s']; zc = -vy * K['s'] - vz * K['c']
    return ((xc / (zc * K['t'] * (FW / FH)) + 1) / 2 * FW, (1 - yc / (zc * K['t'])) / 2 * FH)
def ground(K, px, py):          # a pixel of the painting back to the ground (y = 0): what the game will do with Chris's shapes
    nx = (px / FW * 2 - 1) * K['t'] * (FW / FH); ny = (1 - py / FH * 2) * K['t']
    dx, dy, dz = nx, ny * K['c'] - K['s'], -ny * K['s'] - K['c']
    k = -K['pos'][1] / dy
    return (K['pos'][0] + k * dx, K['pos'][2] + k * dz)

# ---------- shapes ----------
def turn(x, z, deg):            # three.js rotation.y
    a = deg * RAD; return (x * math.cos(a) + z * math.sin(a), -x * math.sin(a) + z * math.cos(a))
def ring(x, z, r, n=24): return [(x + r * math.cos(i / n * 2 * math.pi), z + r * math.sin(i / n * 2 * math.pi)) for i in range(n)]
def rect(x, z, w, d, deg=0):
    return [(x + q[0], z + q[1]) for q in (turn(sx * w / 2, sz * d / 2, deg) for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1)))]
def foot(g):                    # a ground shape or a solid's footprint, in metres
    k = g['kind']
    if k == 'disc' or k in ('cyl', 'cone', 'tent-round', 'fire'): return ring(g['x'], g['z'], g.get('r', 0.5))
    if k == 'path':
        (ax, az), (bx, bz) = g['a'], g['b']; dx, dz = bx - ax, bz - az; L = math.hypot(dx, dz) or 1; nx, nz = -dz / L * g['w'] / 2, dx / L * g['w'] / 2
        return [(ax + nx, az + nz), (bx + nx, bz + nz), (bx - nx, bz - nz), (ax - nx, az - nz)]
    if k == 'post': return rect(g['x'], g['z'], 0.5, 0.5)
    return rect(g['x'], g['z'], g['w'], g['d'], g.get('turn', 0))
def points3(s):                 # the corners of a solid, for its outline
    k = s['kind']; y0 = s.get('y', 0); P = []
    def lay(pts, y): P.extend((x, y, z) for x, z in pts)
    if k == 'cyl': lay(ring(s['x'], s['z'], s['r'], 16), y0); lay(ring(s['x'], s['z'], s['r'], 16), y0 + s['h'])
    elif k == 'cone': lay(ring(s['x'], s['z'], s['r'], 16), y0); P.append((s['x'], y0 + s['h'], s['z']))
    elif k == 'tent-round': lay(ring(s['x'], s['z'], s['r'], 16), 0); lay(ring(s['x'], s['z'], s['r'] * 1.08, 16), s['wall']); P.append((s['x'], s['top'], s['z']))
    elif k == 'tent-square':
        lay(rect(s['x'], s['z'], s['w'], s['d'], s.get('turn', 0)), 0); r = max(s['w'], s['d']) * 0.74
        lay([(s['x'] + q[0], s['z'] + q[1]) for q in (turn(r * math.cos(i * math.pi / 2), r * math.sin(i * math.pi / 2), s.get('turn', 0) + 45) for i in range(4))], s['wall']); P.append((s['x'], s['top'], s['z']))
    elif k == 'stall': h = s.get('h', 2.3); lay(rect(s['x'], s['z'], s['w'], s['d'], s.get('turn', 0)), 0); lay(rect(s['x'], s['z'], s['w'] + 0.4, s['d'] + 0.5, s.get('turn', 0)), h + 0.06)
    else: lay(rect(s['x'], s['z'], s['w'], s['d'], s.get('turn', 0)), y0); lay(rect(s['x'], s['z'], s['w'], s['d'], s.get('turn', 0)), y0 + s['h'])
    return P
def hull(pts):
    pts = sorted(set((round(x, 2), round(y, 2)) for x, y in pts))
    if len(pts) < 3: return pts
    cr = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]
def thin(poly, most=14):        # drop the points that add least, so a shape is easy to drag about
    poly = list(poly)
    while len(poly) > most:
        best, bi = 1e18, 0
        for i in range(len(poly)):
            a, b, c = poly[i - 1], poly[i], poly[(i + 1) % len(poly)]; ar = abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
            if ar < best: best, bi = ar, i
        poly.pop(bi)
    return poly
def clip(poly):                 # keep a shape inside the painting
    def cut(P, inside, cross):
        out = []
        for i in range(len(P)):
            a, b = P[i - 1], P[i]
            if inside(b):
                if not inside(a): out.append(cross(a, b))
                out.append(b)
            elif inside(a): out.append(cross(a, b))
        return out
    def X(v): return lambda a, b: (v, a[1] + (b[1] - a[1]) * (v - a[0]) / (b[0] - a[0]))
    def Y(v): return lambda a, b: (a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]), v)
    for inside, cross in ((lambda p: p[0] >= 0, X(0)), (lambda p: p[0] <= FW, X(FW)), (lambda p: p[1] >= 0, Y(0)), (lambda p: p[1] <= FH, Y(FH))):
        poly = cut(poly, inside, cross)
        if len(poly) < 3: return []
    return poly
def whole(poly):
    out = []
    for x, y in poly:
        p = [int(round(min(FW, max(0, x)))), int(round(min(FH, max(0, y))))]
        if not out or out[-1] != p: out.append(p)
    if len(out) > 1 and out[0] == out[-1]: out.pop()
    return out
def area(P): return abs(sum((P[i - 1][0] + P[i][0]) * (P[i - 1][1] - P[i][1]) for i in range(len(P))) / 2)

# ---------- the scenes ----------
W = json.load(open(os.path.join(G, 'world/world.json')))
AREAS = {a['id']: a for a in W['areas']}
SC = {}
for i in range(2, 10): SC['W%d' % i] = json.load(open(os.path.join(G, 'world/scenes/W%d.json' % i)))
# W1, the fair square: the pilot's layout (game/pilot/scenes-pilot.js) and walk data (game/src/scenes.js), written out here because they are
# JavaScript. Its way out is the one the map of November 13 gives it (right, to W2); the lane on the left stays walkable and leads nowhere.
# Its four people have no places in the game yet: these are read off the words in world.json and are guesses.
posts = [(math.cos(a * RAD) * 7.9, -math.sin(a * RAD) * 7.9) for a in (28, 62, 118, 152, 208, 242, 298, 332)]
SC['W1'] = {'id': 'W1', 'name': 'The fair square', 'camera': {'fov': 12, 'pitch': 24, 'target': [0, 0, -2.5], 'span': 15}, 'figure': [-1.6, 3.4],
    'ground': [{'kind': 'disc', 'x': 0, 'z': 0, 'r': 8.7}, {'kind': 'box', 'x': 0, 'z': 0.575, 'w': 21.8, 'd': 4.25}],
    'solids': [{'kind': 'cyl', 'name': 'the well', 'x': 3.9, 'z': 2.6, 'r': 1.35, 'h': 2.6}] + [{'kind': 'post', 'x': x, 'z': z, 'h': 3.3} for x, z in posts] + [
        {'kind': 'tent-round', 'name': 'round striped tent', 'x': -8.6, 'z': -12.0, 'r': 2.7, 'wall': 2.2, 'top': 5.0}, {'kind': 'stall', 'name': 'stall', 'x': -2.2, 'z': -11.2, 'w': 3.4, 'd': 1.7, 'h': 2.3},
        {'kind': 'stall', 'name': 'stall', 'x': 2.6, 'z': -11.4, 'w': 3.0, 'd': 1.7, 'h': 2.3}, {'kind': 'tent-square', 'name': 'square tent', 'x': 9.2, 'z': -12.0, 'w': 4.6, 'd': 4.2, 'wall': 2.3, 'top': 4.6},
        {'kind': 'tent-square', 'name': 'square tent', 'x': -12.6, 'z': -5.6, 'w': 4.2, 'd': 4.0, 'wall': 2.2, 'top': 4.3}, {'kind': 'stall', 'name': 'stall', 'x': -11.4, 'z': 5.4, 'w': 3.2, 'd': 1.7, 'h': 2.3, 'turn': 55},
        {'kind': 'stall', 'name': 'stall', 'x': 11.6, 'z': -5.2, 'w': 3.2, 'd': 1.7, 'h': 2.3, 'turn': -60}, {'kind': 'tent-round', 'name': 'round tent', 'x': 12.8, 'z': 5.8, 'r': 2.4, 'wall': 2.1, 'top': 4.4},
        {'kind': 'box', 'name': 'wagon', 'x': -5.2, 'z': 10.4, 'w': 3.2, 'd': 1.6, 'h': 1.5, 'turn': 12}, {'kind': 'box', 'name': 'crates and barrels', 'x': 5.6, 'z': 10.2, 'w': 2.2, 'd': 1.4, 'h': 1.0, 'turn': -8},
        {'kind': 'box', 'name': 'crates', 'x': 7.4, 'z': 9.6, 'w': 0.9, 'd': 0.9, 'h': 1.5}],
    'exits': [{'to': 'W2', 'side': 'right', 'x': 10.5, 'z': 0.5}],
    'people': [{'who': 'ballad-singer', 'x': 0, 'z': -3.6}, {'who': 'old-lamp-seller', 'x': -5.6, 'z': 7.4}, {'who': 'ribbon-dyer', 'x': 2.6, 'z': -8.2}, {'who': 'fortune-teller', 'x': 6.6, 'z': -6.2}]}
REST = {'W1': ("The party's wagon", (-4.4, 7.6)), 'W6': ('The camp by the pool', None), 'W8': ('The airship', None)}      # the three rest spots Chris settled on November 13
NAMES = {'old-lamp-seller': 'The lamp-seller', 'ribbon-dyer': 'The ribbon-dyer', 'fortune-teller': 'The fortune-teller', 'ballad-singer': 'The ballad-singer', 'fair-baker': 'The baker', 'old-night-watchman': 'The night watchman',
         'pie-seller': 'The pie-seller', 'gate-keeper': 'The gate keeper', 'chestnut-roaster': 'The chestnut roaster', 'captain': 'The captain', 'the captain': 'The captain', 'old-lamplighter': 'The old lamplighter', 'farm-lad': 'The farm lad'}
INWARD = {'left': (1.7, 0), 'right': (-1.7, 0), 'near': (0, -1.7), 'far': (0, 1.7)}
DIR = {'left': 'e', 'right': 'w', 'near': 'n', 'far': 's'}

MAPS, report = {}, []
for id in sorted(SC):
    S = SC[id]; K = camera(S['camera']); pp = lambda x, z, y=0: project(K, x, y, z)
    walk = [whole(clip([pp(x, z) for x, z in foot(g)])) for g in S['ground']]; walk = [p for p in walk if len(p) >= 3 and area(p) > 50]
    mask = Image.new('L', (FW, FH), 0); dr = ImageDraw.Draw(mask)
    for p in walk: dr.polygon([tuple(q) for q in p], fill=255)
    def on_walk(poly):
        if len(poly) < 3: return 0
        m = Image.new('L', (FW, FH), 0); ImageDraw.Draw(m).polygon([tuple(q) for q in poly], fill=255)
        box = m.getbbox()
        if not box: return 0
        return sum(1 for a, b in zip(m.crop(box).getdata(), mask.crop(box).getdata()) if a and b)
    block, front = [], []
    for s in S['solids']:
        fp = whole(clip([pp(x, z) for x, z in foot(s)]))
        if s['kind'] == 'post':                 # a lantern post: its foot is a block, the post and its lantern a front (as Envoi's lamps are)
            x, base = pp(s['x'], s['z']); top = pp(s['x'], s['z'], s.get('h', 3.3))[1]; lw = abs(pp(s['x'] + 0.16, s['z'])[0] - x); lh = abs(pp(s['x'], s['z'], s.get('h', 3.3) - 0.5)[1] - top)
            if on_walk(whole(clip([(x - 60, base - 60), (x + 60, base - 60), (x + 60, base + 30), (x - 60, base + 30)]))) == 0: continue
            block.append(whole([(x - 7, base - 8), (x + 7, base - 8), (x + 7, base + 3), (x - 7, base + 3)]))
            front.append({'pts': whole([(x - lw, top), (x + lw, top), (x + lw, top + lh), (x + 4, top + lh + 5), (x + 5, base + 2), (x - 5, base + 2), (x - 4, top + lh + 5), (x - lw, top + lh)]), 'base': int(round(base))})
            continue
        if len(fp) >= 3 and on_walk(fp) > 0: block.append(thin(fp, 12))
        if s['kind'] == 'fire': continue
        sil = whole(clip(thin(hull([project(K, *q) for q in points3(s)]))))
        if len(sil) >= 3 and on_walk(sil) > 40 and fp: front.append({'pts': sil, 'base': max(q[1] for q in fp)})
    exits = []
    for e in S['exits']:
        x, y = pp(e['x'], e['z']); hh = abs(pp(e['x'], e['z'] + 2.0)[1] - pp(e['x'], e['z'] - 2.0)[1]) / 2; hw = abs(pp(e['x'] + 2.2, e['z'])[0] - x)
        r = {'left': [0, y - hh, max(40, x), y + hh], 'right': [min(FW - 40, x), y - hh, FW, y + hh], 'near': [x - hw, min(FH - 36, y), x + hw, FH], 'far': [x - hw, y - 22, x + hw, y + 22]}[e['side']]
        r = [int(round(min(FW, max(0, r[0])))), int(round(min(FH, max(0, r[1])))), int(round(min(FW, max(0, r[2])))), int(round(min(FH, max(0, r[3]))))]
        D = SC.get(e['to']); ex = {'rect': r, 'to': e['to'], 'label': (AREAS.get(e['to']) or {}).get('name', e['to'])}
        if D:                                   # where she arrives there: just inside the way that leads back here, or where a new walk starts
            KD = camera(D['camera']); back = [b for b in D['exits'] if b['to'] == id]
            if back: b = back[0]; dx, dz = INWARD[b['side']]; ex['at'] = [int(round(v)) for v in project(KD, b['x'] + dx, 0, b['z'] + dz)]; ex['dir'] = DIR[b['side']]
            else: ex['at'] = [int(round(v)) for v in project(KD, D['figure'][0], 0, D['figure'][1])]
        else: ex['at'] = [int(round(v)) for v in pp(*S['figure'])]; ex['say'] = 'notYet'
        exits.append(ex)
    people = [{'id': p['who'].replace('the ', ''), 'name': NAMES.get(p['who'], p['who']), 'at': [int(round(v)) for v in pp(p['x'], p['z'])], 'look': 'hooded'} for p in S.get('people', [])]
    spots = []
    if id in REST:
        label, at = REST[id]
        if at is None: f = [s for s in S['solids'] if s['kind'] == 'fire'] if id == 'W6' else []; at = (f[0]['x'] + 1.3, f[0]['z'] + 0.6) if f else (S['people'][0]['x'] + 1.4, S['people'][0]['z'] + 0.4) if S.get('people') else tuple(S['figure'])
        spots.append({'kind': 'rest', 'at': [int(round(v)) for v in pp(*at)], 'label': label, 'note': 'A rest spot: HP and MP back, and the game is saved.'})
    im = Image.open(os.path.join(G, 'art/pilot/W1.png' if id == 'W1' else 'art/world/%s.png' % id)).convert('RGB'); assert im.size == (FW, FH), im.size
    b = io.BytesIO(); im.save(b, 'WEBP', quality=88, method=6)
    MAPS[id] = {'name': AREAS[id]['name'], 'src': 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(), 'zone': AREAS[id]['zone'], 'camera': S['camera'], 'zoom': 0.7,
                'start': [int(round(v)) for v in pp(*S['figure'])], 'walk': walk, 'block': block, 'front': front, 'exits': exits, 'people': people, 'spots': spots}
    report.append('%s %-36s walk %d  block %d  front %d  exits %d  people %d  spots %d  painting %d KB' % (id, AREAS[id]['name'], len(walk), len(block), len(front), len(exits), len(people), len(spots), len(b.getvalue()) // 1024))
    # the way back must be exact: a pixel sent to the ground and through the camera again lands on itself
    gx, gz = ground(K, 600, 500); bx, by = pp(gx, gz); assert abs(bx - 600) < 1e-6 and abs(by - 500) < 1e-6
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'mf-maps.js'), 'w', encoding='utf-8').write(
    "// mf-maps.js: Moon Faire's nine walking places as Envoi's map editor reads them (made by tools/mf_maps.py from branch\n"
    "// claude/moon-faire-starter-world). Every position is in the paintings' own 1774 x 887 pixels. Defines globalThis.MAPS.\n"
    "(function (G) { 'use strict'; G.MAPS = " + json.dumps(MAPS, separators=(',', ':')) + '; })(typeof window !== "undefined" ? window : globalThis);\n')
print('\n'.join(report))
```

### build_mf_editor.py

```python
# build_mf_editor.py: Chris's Envoi map editor, set up for Moon Faire's walking places, as one file that needs nothing else.
# It takes the editor's own files from the Envoi repo (branch claude/send-note-gigdew) unchanged but for the few replacements below, puts
# Moon Faire's maps (mf-maps.js, from tools/mf_maps.py) where Envoi's were, and leaves out what belongs to Envoi alone (the keepsakes,
# the painted paper dolls). Every replacement must be found the stated number of times, or the script stops.
# usage: python3 -I build_mf_editor.py <envoi repo> <folder holding mf-maps.js> <out.html>
import sys, os, re
E, M, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
rd = lambda p: open(os.path.join(E, p), encoding='utf-8').read()
def swap(s, pairs, what):
    for a, b, n in pairs:
        assert s.count(a) == n, (what, a[:70], s.count(a), n); s = s.replace(a, b)
    return s
W, H = 1774, 887
core = swap(rd('envoi-game-pass-3/map-paths/edits-core.js'), [
    ("const MW = 1536, MH = 1024, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL), REACH = 58;", "const MW = %d, MH = %d, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL), REACH = 120;      // Moon Faire: its paintings' size; a person is about twice as tall in them as in Envoi's" % (W, H), 1),
    ("const MAGPIE_IN = { wickhollow:", "const MAGPIE_IN = {}, ENVOI_MAGPIE_IN = { wickhollow:", 1),      # nobody lands from an airship onto a Moon Faire map here
    ("is outside the painting (1536 x 1024)", "is outside the painting (%d x %d)" % (W, H), 1),
    ("start: clone(m.start || [768, 512]),", "start: clone(m.start || [%d, %d])," % (W // 2, H // 2), 1),
], 'edits-core.js')
field = swap(rd('src/game/field.js'), [
    ("const MW = 1536, MH = 1024, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL);", "const MW = %d, MH = %d, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL);" % (W, H), 1),
    ("const REACH = 58;", "const REACH = 120;", 1),
], 'field.js')
editor = swap(rd('envoi-final-draft/map-editor/map-editor.js'), [
    ("const STORE = 'envoi.map-paths.v1', UI_STORE = 'envoi.map-paths.ui.v1', KEEP_STORE = 'envoi.map-editor.keepsakes.v1';", "const STORE = 'moonfaire.map-paths.v1', UI_STORE = 'moonfaire.map-paths.ui.v1', KEEP_STORE = 'moonfaire.map-editor.keepsakes.v1';", 1),
    ("speed: 110, zoom: 0.7, ioH: 52, paintedIo, paintedFolk, pace: 1.7, ioScreen: 0.15,", "speed: 220, zoom: 0.7, ioH: (MAPS[id].camera && MAPS[id].camera.span > 12 ? 100 : 140), paintedIo, paintedFolk, pace: 1.7, ioScreen: 0.15,", 1),      # a person 1.7 m tall, in the painting's pixels, by that place's camera
    ("return { game: 'Envoi on the Longest Night', what: 'the map editor: walking-path edits, and where the keepsakes are',", "return { game: 'Moon Faire', what: 'the map editor: walking-path edits, in each painting\\'s own 1774 x 887 pixels',", 1),
], 'map-editor.js')
html = swap(rd('envoi-final-draft/map-editor/map-editor.html'), [
    ("<title>Envoi Map Editor</title>", "<title>Moon Faire map editor</title>", 1),
    ("<span>Envoi on the Longest Night · walking paths and keepsakes</span>", "<span>Moon Faire · walking paths for the nine painted places</span>", 1),
    ('<div class="me-modes" role="group" aria-label="What you are working on">', '<div class="me-modes" role="group" aria-label="What you are working on" hidden>', 1),
    ('          <label><input type="checkbox" id="mp-l-items"><i class="mp-sw items"></i>Keepsakes</label>\n', '          <label hidden><input type="checkbox" id="mp-l-items"><i class="mp-sw items"></i>Keepsakes</label>\n', 1),
    ('          <label><input type="checkbox" id="mp-l-names"><i class="mp-sw items"></i>Every keepsake’s name</label>\n', '          <label hidden><input type="checkbox" id="mp-l-names"><i class="mp-sw items"></i>Every keepsake’s name</label>\n', 1),
    ('aria-label="The painting, with Io\'s walking paths and the keepsakes drawn over it"', 'aria-label="The painting, with the walking paths drawn over it"', 1),
], 'map-editor.html')
css = '\n'.join(rd(p) for p in ('src/game/game.css', 'envoi-game-pass-3/map-paths/map-paths.css', 'envoi-final-draft/map-editor/map-editor.css'))
css += '\n/* Moon Faire: the keepsakes are Envoi\'s own and are left out */\n.me-modes[hidden], .mp-layers label[hidden] { display: none !important; }\n'
assert 'url(' not in css.replace('url(data:', ''), 'a stylesheet reaches outside the page'
html = re.sub(r'<link rel="stylesheet" href="[^"]+">\n', '', html)
html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>', 1)
scripts = [('src/walk/pixel-io.js', rd('src/walk/pixel-io.js')), ('src/walk/walkers.js', rd('src/walk/walkers.js')), ('src/game/sprites.js', rd('src/game/sprites.js')),
           ('mf-maps.js', open(os.path.join(M, 'mf-maps.js'), encoding='utf-8').read()), ('src/game/field.js', field), ('envoi-game-pass-3/map-paths/edits-core.js', core), ('envoi-final-draft/map-editor/map-editor.js', editor)]
a = html.index('<script src="../../src/walk/pixel-io.js"></script>'); b = html.index('</body>')
body = ''
for name, s in scripts:
    assert '</script' not in s.lower(), name
    body += '<!-- ' + name + (' (Envoi on the Longest Night, branch claude/send-note-gigdew)' if name != 'mf-maps.js' else ' (Moon Faire)') + ' -->\n<script>\n' + s + '\n</script>\n'
html = html[:a] + body + html[b:]
assert not re.search(r'(src|href)="\.\.?/', html), 'something still loads from beside the page'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(html); print(OUT, len(html) // 1024, 'KB')
```
