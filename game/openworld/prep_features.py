# prep_features.py: the open world's layout, read from the world map's reference drawing (world/map/map.svg, the drawing the
# painted map was made from, so every road, coast and stone sits where the painting has it). Writes data/features.json:
# polygons and lines in world metres. World: x east, z south, 0.5 m to a pixel of the map, the map's middle at 0, 0.
# usage: python3 -I prep_features.py <game folder> <out folder>
import sys, os, re, json, math
G, OUT = sys.argv[1], sys.argv[2]
S = 0.5                                   # metres to a map pixel
W, H = 1536, 1024
def wx(p): return [round((p[0] - W / 2) * S, 2), round((p[1] - H / 2) * S, 2)]
svg = open(os.path.join(G, 'world/map/map.svg'), encoding='utf-8').read()

# ---- a small path reader: M L H V C S Z and their relative forms; curves sampled every few pixels ----
def path(d, step=4.0):
    toks = re.findall(r'[MmLlHhVvCcSsZz]|-?\d*\.?\d+(?:e-?\d+)?', d); i = 0; cmd = None; cur = [0.0, 0.0]; start = [0.0, 0.0]; last_c2 = None
    subs, pts = [], []
    def num():
        nonlocal i; v = float(toks[i]); i += 1; return v
    def bez(p0, p1, p2, p3):
        L = math.dist(p0, p1) + math.dist(p1, p2) + math.dist(p2, p3); n = max(2, int(L / step))
        for k in range(1, n + 1):
            t = k / n; u = 1 - t
            pts.append([u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0], u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]])
    while i < len(toks):
        t = toks[i]
        if re.match(r'[A-Za-z]', t): cmd = t; i += 1
        if cmd in 'Mm':
            x, y = num(), num()
            if cmd == 'm': x += cur[0]; y += cur[1]
            if pts: subs.append(pts)
            pts = [[x, y]]; cur = [x, y]; start = [x, y]; cmd = 'L' if cmd == 'M' else 'l'; last_c2 = None
        elif cmd in 'Ll':
            x, y = num(), num()
            if cmd == 'l': x += cur[0]; y += cur[1]
            pts.append([x, y]); cur = [x, y]; last_c2 = None
        elif cmd in 'Hh':
            x = num(); x = x + cur[0] if cmd == 'h' else x; pts.append([x, cur[1]]); cur = [x, cur[1]]; last_c2 = None
        elif cmd in 'Vv':
            y = num(); y = y + cur[1] if cmd == 'v' else y; pts.append([cur[0], y]); cur = [cur[0], y]; last_c2 = None
        elif cmd in 'Cc':
            a = [num(), num()]; b = [num(), num()]; e = [num(), num()]
            if cmd == 'c': a = [a[0] + cur[0], a[1] + cur[1]]; b = [b[0] + cur[0], b[1] + cur[1]]; e = [e[0] + cur[0], e[1] + cur[1]]
            bez(cur, a, b, e); last_c2 = b; cur = e
        elif cmd in 'Ss':
            b = [num(), num()]; e = [num(), num()]
            if cmd == 's': b = [b[0] + cur[0], b[1] + cur[1]]; e = [e[0] + cur[0], e[1] + cur[1]]
            a = [2 * cur[0] - last_c2[0], 2 * cur[1] - last_c2[1]] if last_c2 else cur[:]
            bez(cur, a, b, e); last_c2 = b; cur = e
        elif cmd in 'Zz':
            if pts and pts[0] != pts[-1]: pts.append(pts[0][:])
            cur = start[:]; last_c2 = None; cmd = None
        else: i += 1
    if pts: subs.append(pts)
    return subs
def poly(s): v = [float(a) for a in re.split(r'[ ,]+', s.strip())]; return [[v[k], v[k + 1]] for k in range(0, len(v), 2)]
def find_poly(start): m = re.search(r'points="(%s[^"]*)"' % re.escape(start), svg); assert m, start; return poly(m.group(1))
def find_path(start): m = re.search(r'd="(%s[^"]*)"' % re.escape(start), svg); assert m, start; return path(m.group(1))
W_ = lambda P: [wx(p) for p in P]

F = {'scale': S, 'map': [W, H], 'bounds': [-W / 2 * S, -H / 2 * S, W / 2 * S, H / 2 * S]}
# the sea: the cliff line is the edge of the dark band; the band itself is the cliff face seen from the south
F['sea'] = W_(find_poly('858,-40 862,0')[:-1] + [[3500, 700], [3500, -2400], [858, -2400]])      # carried on past the map's edges, so the sea goes on to the horizon
F['crag'] = W_(find_poly('1164,348 1156,318'))
F['crag_ledge'] = W_(find_poly('1172,306 1200,298'))           # the landing ledge (W8)
F['crag_top'] = W_(find_poly('1296,150 1326,128'))             # the high shelf under the dead tower
F['crag_stair'] = W_(find_poly('1210,272 1232,264'))
F['tower'] = wx([1345, 196])
F['woods'] = W_([[-1600, -1600], [470, -1600]] + find_poly('0,0 470,0 455,60')[1:] + [[-1600, 215]])
F['fields'] = W_([[-1600, 225]] + find_poly('0,225 60,245 150,262')[1:-2] + [[290, 2600], [-1600, 2600]])
F['field_plots'] = [W_(poly(m)) for m in re.findall(r'<polygon points="([^"]+)"/>', svg.split('<g fill="#9aa56a"')[1].split('</g>')[0])]
F['marsh'] = W_(find_poly('262,880 360,905')[:-3] + [[3500, 860], [3500, 2600], [285, 2600]])
F['river'] = [W_([[262, -1600], [255, -300]] + p + [[1536 + 1600, 900]]) for p in find_path('M250,0 C230,80')]
F['stream'] = [W_(p) for p in find_path('M1094,758 C1100,792')]
roads = {'west': 'M0,598 C50,604', 'moor': 'M832,712 C890,704', 'pool': 'M1132,582 C1180,584', 'loop': 'M1322,744 C1350,756', 'beacon': 'M1150,584 C1172,556', 'gorse': 'M1089,621 C1084,640'}
F['roads_map'] = {k: [W_(p) for p in find_path(v)] for k, v in roads.items()}
F['walls'] = [W_(p) for p in find_path('M236,468 L330,452')]
F['fold'] = [wx([610, 806]), 12 * S]
# circles and ellipses by their fill
def circles(fill):
    g = svg.split('<g fill="%s">' % fill)[1].split('</g>')[0]
    out = [[float(a), float(b), float(c)] for a, b, c in re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"', g)]
    out += [[float(a), float(b), float(c), float(d)] for a, b, c, d in re.findall(r'<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"', g)]
    return out
F['gorse'] = [wx(c[:2]) + [round(c[2] * S, 2)] for c in circles('#5d6b3a')]
F['pools'] = [wx(c[:2]) + [round(c[2] * S, 2), round(c[3] * S, 2)] for c in circles('#3b5a8c')]
F['tree_clumps'] = [wx(c[:2]) + [round(c[2] * S, 2)] for c in re.findall(r'x', '')]
gw = svg.split('<g fill="#3f5f45">')[1].split('</g>')[0]
F['tree_clumps'] = [wx([float(a), float(b)]) + [round(float(c) * S, 2)] for a, b, c in re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"', gw)]
gr = svg.split('<g fill="#7d8466">')[1].split('</g>')[0]
F['rises'] = [wx([float(a), float(b)]) + [round(float(c) * S, 2), round(float(d) * S, 2)] for a, b, c, d in re.findall(r'<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"', gr)]
F['bare_tops'] = [wx([120, 95]) + [18, 10], wx([335, 62]) + [15, 8.5]]
# rocks: the tor, the lone boulders (their lit tops), the lone standing stones, rocks in the sea, the old pier stumps
F['tor'] = W_(path('M660,280 L672,252 L690,244 L706,250 L722,262 L726,284 L704,292 L680,292 Z')[0])
F['boulders'] = [wx([float(a) + 9, float(b) - 4]) for a, b in re.findall(r'M(\d+),(\d+) l4,-10 l10,-3 l8,6 v8 l-12,3 z', svg)]
F['menhirs'] = [wx([float(a) + 4, float(b)]) for a, b in re.findall(r'M(\d+),(\d+) h8 l1,-14 l-4,-5 l-5,4 z', svg)][:5]
F['sea_rocks'] = [wx([float(a) + 6, float(b) - 3]) for a, b in re.findall(r'M(\d+),(\d+) l5,-8 l8,-1 l4,8 l-7,4 z', svg)]
F['piers'] = [wx([1180.5, 432.5]), wx([1197.5, 405.5])]
F['farms'] = [wx([48, 436]), wx([196, 608]), wx([70, 782])]
F['bridge'] = wx([141, 628])
open(os.path.join(OUT, 'features.json'), 'w').write(json.dumps(F, separators=(',', ':')))
print({k: (len(v) if isinstance(v, list) else v) for k, v in F.items()})
