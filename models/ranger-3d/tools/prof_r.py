# her painted profile (C3, right figure) as [height, forward] in metres
# scale 1837 px/m; eye (y 381) = 1.512 m; tip of the nose (x 1498) = 0.107 m forward of the body's middle line
import sys, numpy as np
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of, figures
PXM, EYE_Y, EYE_H, NOSE_X, NOSE_Z = 1837.0, 381.0, 1.512, 1498.0, 0.107
Ym = lambda y: EYE_H + (EYE_Y - y) / PXM
Zm = lambda x: NOSE_Z + (x - NOSE_X) / PXM
def profile():
    a = load('/home/claude/ranger/refs/C3.png'); m, _ = mask_of(a)
    m = m[:, 1010:]                      # the right-hand figure only
    front = {}
    for y in range(250, 640):
        xs = np.nonzero(m[y])[0]
        if len(xs): front[y] = 1010 + xs.max()
    under = {}
    for x in range(1300, 1480):          # the underside of chin and jaw: lowest figure pixel above the neck gap
        col = m[540:640, x - 1010]; ys = np.nonzero(col)[0]
        if len(ys): under[x] = 540 + ys.max()
    return front, under
if __name__ == '__main__':
    front, under = profile()
    step = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    print('front edge: y px, x px, height m, forward m')
    for y in range(250, 600, step):
        if y in front: print('%4d %5d  %.4f  %.4f' % (y, front[y], Ym(y), Zm(front[y])))

def mid_table(step=3):
    # the midline, smoothed over five rows, eyelash rows bridged, as [height, forward] rising in height
    front, under = profile()
    ys = [y for y in range(286, 577) if y in front]
    xs = {y: float(front[y]) for y in ys}
    for y in range(371, 381): xs[y] = np.interp(y, [370, 381], [front[370], min(front[381], front[382])])   # lashes
    sm5 = {y: np.mean([xs.get(y + d, xs[y]) for d in (-2, -1, 0, 1, 2)]) for y in ys}
    out = [[round(Ym(y), 4), round(Zm(sm5[y]), 4)] for y in range(574, 285, -step)]
    return out
if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[2] == 'js':
    t = mid_table(3)
    print('const MID = [' + ', '.join('[%.4f, %.4f]' % (a, b) for a, b in t) + '];')
