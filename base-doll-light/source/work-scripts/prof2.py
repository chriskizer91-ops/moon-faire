# the side outline row by row: back edge and front edge (u: 0 heel tip, 1 toe tip) at each height, model (shot a) vs both paintings
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
exec(open('/home/claude/work/prof.py').read().split('res = {}')[0])
def edges(m):
    sole, a, b, L, top = prof(m)
    hi = m[: sole - int(0.45 * L)]; c = np.where(hi.any(0))[0]; hl = (c.mean() - a) / L < 0.5
    out = []
    for h in (0.3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11):
        y = int(sole - h / 23.7 * L); xs = np.where(m[y])[0]
        if len(xs) == 0: out.append((np.nan, np.nan)); continue
        u0, u1 = (xs.min() - a) / L, (xs.max() - a) / L
        if not hl: u0, u1 = 1 - u1, 1 - u0
        out.append((u0, u1))
    return out
rm = msk(np.asarray(Image.open('shots/of_a.png').convert('RGB')).astype(float)); E = {'model': edges(rm)}
for ft in ('FT1', 'FT2'): E[ft] = edges(np.load('/home/claude/work/ref2/m_%s.npy' % ft))
print('h cm  ' + '  '.join('%-13s' % k for k in E))
for i, h in enumerate((0.3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)):
    print('%4.1f  ' % h + '  '.join('%5.2f..%5.2f ' % E[k][i] for k in E))
