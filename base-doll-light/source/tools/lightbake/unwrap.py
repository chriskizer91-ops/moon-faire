# unwrap.py CODE [RES] : the thinned parts (all but her face) joined into one mesh and laid out flat on one picture (xatlas),
# her face kept as its own thinned mesh with its own painting's attributes. Writes out/CODE_light.npz.
import sys, json, time, numpy as np, xatlas
code = sys.argv[1]; RES = int(sys.argv[2]) if len(sys.argv) > 2 else 2048
full = np.load('out/%s_full.npz' % code); simp = json.load(open('out/%s_simp.json' % code))
names = [n for n in simp['parts']]
def part(n):
    idx = np.fromfile('out/%s_simp/%s.idx' % (code, n), np.uint32).reshape(-1, 3)
    used, inv = np.unique(idx, return_inverse=True)
    d = {'idx': inv.reshape(-1, 3).astype(np.uint32)}
    for a in ('pos', 'nor', 'si', 'sw', 'uv', 'faceMix', 'uvSide', 'uvBody'):
        k = n + '/' + a
        if k in full.files: d[a] = full[k][used]
    return d
out = {}; body = [n for n in names if n != 'face']
P, N, SI, SW, ID, IX, base = [], [], [], [], [], [], 0
for pi, n in enumerate(body):
    d = part(n); m = len(d['pos'])
    P.append(d['pos']); N.append(d['nor'] if 'nor' in d else np.zeros((m, 3), np.float32))
    SI.append(d['si'] if 'si' in d else np.zeros((m, 4), np.uint16)); SW.append(d['sw'] if 'sw' in d else np.tile(np.array([1, 0, 0, 0], np.float32), (m, 1)))
    ID.append(np.full(m, pi, np.uint8)); IX.append(d['idx'] + base); base += m
P, N, SI, SW, ID, IX = map(np.concatenate, (P, N, SI, SW, ID, IX))
t0 = time.time()
atlas = xatlas.Atlas(); atlas.add_mesh(P, IX)
co = xatlas.ChartOptions(); co.max_iterations = 2
po = xatlas.PackOptions(); po.resolution = RES; po.padding = 3; po.bilinear = True; po.bruteForce = False; po.blockAlign = True
atlas.generate(co, po)
vm, ix2, uv = atlas[0]
print('%s: xatlas %.1f s, %d charts, %dx%d, %d -> %d points, %d triangles' % (code, time.time() - t0, atlas.chart_count, atlas.width, atlas.height, len(P), len(vm), len(ix2)))
out.update({'body/pos': P[vm], 'body/nor': N[vm], 'body/si': SI[vm], 'body/sw': SW[vm], 'body/part': ID[vm], 'body/uv': uv.astype(np.float32), 'body/idx': ix2.astype(np.uint32)})
if 'face' in names:
    d = part('face')
    for a, v in d.items(): out['face/' + a] = v
np.savez_compressed('out/%s_light.npz' % code, **out)
json.dump({'parts': body, 'keep': simp.get('keep', []), 'keepTris': simp.get('keepTris', 0), 'res': RES, 'atlas': [atlas.width, atlas.height]}, open('out/%s_light.json' % code, 'w'))
print('triangles: body %d, face %d' % (len(ix2), len(out.get('face/idx', []))))
