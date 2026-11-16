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
