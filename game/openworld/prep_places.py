# prep_places.py: the seven painted places of the fair and the moor, as the open world places them. Each keeps its own layout (the
# grey-box shapes its painting was made from, so the painting can be laid back onto them from the camera it was painted for), and is
# set down in the world where the painted map has it. Writes data/places.json.
# usage: python3 -I prep_places.py <game folder> <out folder>
import sys, os, json, math, re
G, OUT = sys.argv[1], sys.argv[2]
RAD = math.pi / 180
FW, FH = 1774, 887
start = json.load(open(os.path.join(G, 'world/maps/start.json'), encoding='utf-8'))
W = json.load(open(os.path.join(G, 'world/world.json'), encoding='utf-8')); AREAS = {a['id']: a for a in W['areas']}

# where each place's own 0, 0 stands in the world (x east, z south, metres) and the height of its flat ground.
# The fair's three places are closer together than the map's squares, so the fair reads as one fairground; the moor's four sit on the
# painted map's own landmarks (the lit lantern, the ring of stones, the hollow, the pool).
AT = {'W1': (-228.0, 96.5, 3.0), 'W2': (-188.0, 96.5, 3.0), 'W3': (-148.0, 96.5, 3.0),
      'W4': (31.75, 101.9, 5.0), 'W5': (161.0, 37.5, 11.0), 'W7': (161.0, 97.0, 4.2), 'W6': (289.0, 97.0, 6.5)}

def camera(C):
    t = math.tan(C['fov'] / 2 * RAD); d = (C['span'] / 2) / t; p = C['pitch'] * RAD; T = C['target']
    return {'pos': [T[0], T[1] + d * math.sin(p), T[2] + d * math.cos(p)], 't': t, 's': math.sin(p), 'c': math.cos(p)}
def ground(K, px, py):
    nx = (px / FW * 2 - 1) * K['t'] * (FW / FH); ny = (1 - py / FH * 2) * K['t']
    dx, dy, dz = nx, ny * K['c'] - K['s'], -ny * K['s'] - K['c']; k = -K['pos'][1] / dy
    return [K['pos'][0] + k * dx, K['pos'][2] + k * dz]

def pilot_w1():
    """The fair square as the pilot's grey box built it (game/pilot/greybox.js), the guide its painting was made from."""
    s = open(os.path.join(G, 'pilot/scenes-pilot.js'), encoding='utf-8').read()
    S = {'camera': {'fov': 12, 'pitch': 24, 'target': [0, 0, -2.5], 'span': 15}, 'skyBand': 0.15, 'moon': {'u': 0.105, 'v': 0.072, 'd': 0.085}}
    sol = [{'kind': 'well', 'x': 3.9, 'z': 2.6, 'r': 0.95, 'name': 'the well'}]
    for a in [28, 62, 118, 152, 208, 242, 298, 332]: sol.append({'kind': 'post', 'x': round(math.cos(a * RAD) * 7.9, 3), 'z': round(-math.sin(a * RAD) * 7.9, 3), 'h': 3.3, 'pilot': True})
    tents = [('round', 'round striped tent', -8.6, -12.0, dict(r=2.7, wall=2.2, top=5.0)), ('stall', 'stall', -2.2, -11.2, dict(w=3.4, d=1.7, h=2.3)), ('stall', 'stall', 2.6, -11.4, dict(w=3.0, d=1.7, h=2.3)),
             ('square', 'square tent', 9.2, -12.0, dict(w=4.6, d=4.2, wall=2.3, top=4.6)), ('square', 'square tent', -12.6, -5.6, dict(w=4.2, d=4.0, wall=2.2, top=4.3)),
             ('stall', 'stall', -11.4, 5.4, dict(w=3.2, d=1.7, h=2.3)), ('stall', 'stall', 11.6, -5.2, dict(w=3.2, d=1.7, h=2.3)), ('round', 'round tent', 12.8, 5.8, dict(r=2.4, wall=2.1, top=4.4))]
    for k, n, x, z, o in tents: sol.append(dict({'kind': {'round': 'p-tent-round', 'square': 'p-tent-square', 'stall': 'p-stall'}[k], 'name': n, 'x': x, 'z': z}, **o))
    for sx in (-1, 1): sol.append({'kind': 'p-tent-round', 'name': 'round tent', 'x': sx * 13.6, 'z': 12.42 + 1.6, 'r': 2.6, 'wall': 2.1, 'top': 4.6})
    sol += [{'kind': 'wagon', 'name': 'the painted wagon', 'x': -5.2, 'z': 10.4, 'w': 3.2, 'd': 1.6, 'h': 1.5, 'turn': 12},
            {'kind': 'box', 'tone': 'wood', 'name': 'crates and barrels', 'x': 5.6, 'z': 10.2, 'w': 2.2, 'd': 1.4, 'h': 1.0, 'turn': -8},
            {'kind': 'box', 'tone': 'wood', 'name': 'crates', 'x': 7.4, 'z': 9.6, 'w': 0.9, 'd': 0.9, 'h': 1.5}]
    S['solids'] = sol
    S['ground'] = [{'kind': 'disc', 'name': 'the square', 'x': 0, 'z': 0, 'r': 7}, {'kind': 'path', 'name': 'lane west', 'a': [-6, 0.3], 'b': [-17, 0.8], 'w': 4.2}, {'kind': 'path', 'name': 'lane east', 'a': [6, 0.3], 'b': [17, 0.8], 'w': 4.2}]
    S['flats'] = [{'kind': 'box', 'tone': 'cloth', 'name': "the Jester's floor cloth", 'x': 0, 'z': -3.6, 'w': 4.4, 'd': 3.0}]
    return S

places = {}
for pid in ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']:
    S = pilot_w1() if pid == 'W1' else json.load(open(os.path.join(G, 'world/scenes/%s.json' % pid), encoding='utf-8'))
    C = S['camera']; K = camera(C); M = start[pid]; A = AREAS[pid]
    ox, oz, base = AT[pid]
    # the ground the painting shows: its four corners, from the bottom edge up to where the sky band starts
    band = S.get('skyBand', 0.15) * FH + 6
    foot = [ground(K, 0, FH), ground(K, FW, FH), ground(K, FW, band), ground(K, 0, band)]
    words = {p['who'].replace('the ', ''): p for p in A.get('people', [])}
    people = []
    for p in M['people']:
        g = ground(K, *p['at']); w = words.get(p['id'], {})
        says = w.get('says') or (W['captain'].get(pid, []) if p['id'] == 'captain' else [])
        people.append({'id': p['id'], 'name': p['name'], 'x': round(g[0], 3), 'z': round(g[1], 3), 'says': says, 'doing': w.get('doing', '')})
    spots = [{'kind': s['kind'], 'label': s['label'], 'at': [round(v, 3) for v in ground(K, *s['at'])]} for s in M.get('spots', [])]
    places[pid] = {'id': pid, 'name': M['name'], 'zone': M['zone'], 'light': A.get('light', ''), 'at': [ox, oz], 'base': base, 'camera': C, 'skyBand': S.get('skyBand', 0.15), 'moon': S.get('moon'),
                   'camPos': [round(v, 4) for v in K['pos']], 'figure': S.get('figure', [-2.2, 2.4]), 'foot': [[round(a, 2), round(b, 2)] for a, b in foot], 'solids': S['solids'], 'ground': S.get('ground', []), 'flats': S.get('flats', []),
                   'exits': S.get('exits', []), 'people': people, 'spots': spots, 'lamps': M.get('lamps', []), 'happens': [{k: h[k] for k in ('code', 'title', 'kind') if k in h} for h in A.get('happens', [])]}
    print(pid, M['name'], 'foot', places[pid]['foot'], 'people', [p['id'] for p in people])

# ---- the roads between the places: each starts and ends where a place's own path leaves it, and between them follows the painted map ----
F = json.load(open(os.path.join(OUT, 'features.json')))
def wpt(pid, p): a = places[pid]['at']; return [round(a[0] + p[0], 2), round(a[1] + p[1], 2)]
def between(line, keep): return [p for p in line if keep(p)]
R = F['roads_map']
roads = [
    {'name': 'the west road', 'w': 4.0, 'k': 1.0, 'pts': between(R['west'][0], lambda p: p[0] < -251) + [wpt('W1', [-17, 0.8])]},
    {'name': 'the fair lane', 'w': 4.2, 'k': 1.0, 'pts': [wpt('W1', [17, 0.8]), wpt('W2', [-11, 0.5])]},
    {'name': 'the fair lane, east', 'w': 3.6, 'k': 1.0, 'pts': [wpt('W2', [11, 0.5]), wpt('W3', [-11, 0.0])]},
    {'name': 'the moor road', 'w': 4.5, 'k': 1.0, 'pts': [wpt('W3', [10.6, 0.0]), wpt('W3', [16, 0.1])] + between(R['west'][1], lambda p: -126 < p[0] < 8) + [wpt('W4', [-17, 0.5]), wpt('W4', [-12, 0.4])]},
    {'name': 'the stones track', 'w': 3.6, 'k': 0.95, 'pts': [wpt('W4', [12, -1.4]), wpt('W4', [17, -2.4])] + between(R['moor'][0], lambda p: 56 < p[0] < 138) + [wpt('W5', [-16, -1.0]), wpt('W5', [-11, -1])]},
    {'name': 'the pool road', 'w': 3.0, 'k': 0.9, 'pts': [wpt('W5', [11, -2]), wpt('W5', [16, -2])] + between(R['pool'][0], lambda p: 184 < p[0] < 262 and p[1] < 104) + [wpt('W6', [-17, 3.0]), wpt('W6', [-12, 3.2])]},
    {'name': 'the gorse gap', 'w': 1.6, 'k': 0.55, 'pts': [wpt('W5', [2.6, 8.5]), wpt('W5', [2.4, 12])] + between(R['gorse'][0], lambda p: 52 < p[1] < 80) + [wpt('W7', [1.5, -16]), wpt('W7', [1.5, -12.5])]},
    {'name': 'the old beacon road', 'w': 2.6, 'k': 0.45, 'pts': [wpt('W5', [17, -3])] + between(R['beacon'][0], lambda p: p[1] < 30)},
]
for r in roads: print(r['name'], len(r['pts']), r['pts'][0], r['pts'][-1])
open(os.path.join(OUT, 'places.json'), 'w', encoding='utf-8').write(json.dumps({'places': places, 'roads': roads}, separators=(',', ':')))
