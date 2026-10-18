"""Cut redraw strips where effects spill into the neighbour's space.
Cells come from the printed labels under each figure, and every connected piece (body,
guardian, slash trail, sparkle) goes to the cell that holds its centre, so effects stay whole."""
import numpy as np, json, os, sys
from PIL import Image
from scipy import ndimage as nd
sys.path.insert(0, "/home/claude/gen4")
import extract as X          # load_strip, center_height, key_height, anchor, FR, META, FLAT, STAGE

def label_centres(a, bg, n):
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    m = nd.binary_opening(d > 24, iterations=2)
    rows = X.bands(m.mean(1), .003, 40); fr = max(rows, key=lambda r: r[1] - r[0])
    lo = a[fr[1]:]                                   # everything under the figure band
    g = lo.mean(-1); sat = lo.max(-1) - lo.min(-1)
    txt = (g > 120) & (sat < 45)
    txt = nd.binary_dilation(txt, structure=np.ones((5, 25)))
    lab, k = nd.label(txt); objs = nd.find_objects(lab)
    blobs = sorted([((s[1].start + s[1].stop) / 2, (s[1].stop - s[1].start)) for s in objs], key=lambda b: b[0])
    blobs = [b for b in blobs if b[1] > 15]
    while len(blobs) > n:     # big fonts split '22 key' into two blobs: merge the closest pair
        i = min(range(len(blobs) - 1), key=lambda i: blobs[i + 1][0] - blobs[i][0])
        (c1, w1), (c2, w2) = blobs[i], blobs[i + 1]; l, r = c1 - w1 / 2, c2 + w2 / 2
        blobs[i:i + 2] = [((l + r) / 2, r - l)]
    assert len(blobs) == n, (len(blobs), n, blobs)
    return [b[0] for b in blobs], fr, d

def cut(path, n):
    a, bg = X.load_strip(path)
    cx, fr, d = label_centres(a, bg, n)
    bounds = [0] + [(cx[i] + cx[i + 1]) / 2 for i in range(n - 1)] + [a.shape[1]]
    alpha = np.clip((d - 9) / 24, 0, 1); alpha[fr[1] + 6:] = 0; alpha[:max(0, fr[0] - 40)] = 0
    m = nd.binary_opening(d > 24, iterations=2); m[fr[1] + 6:] = False
    comp, k = nd.label(alpha > .05, structure=np.ones((3, 3)))
    cents = nd.center_of_mass(alpha > .05, comp, range(1, k + 1))
    owner = np.zeros(k + 1, int)
    for i, (cy, cxm) in enumerate(cents):
        owner[i + 1] = int(np.searchsorted(bounds, cxm) - 1)
    out = []
    for j in range(n):
        sel = np.isin(comp, np.nonzero(owner == j)[0])
        body = m & sel
        lab, kk = nd.label(body); sz = nd.sum(body, lab, range(1, kk + 1))
        main = lab == (np.argmax(sz) + 1)
        for _ in range(8):      # dark lace leggings can split a figure at the hip: absorb nearby sizeable pieces (boots, shins)
            near = nd.binary_dilation(main, iterations=18)
            ids = [i for i in np.unique(lab[near & body]) if i and sz[i - 1] > 60]
            grown = np.isin(lab, ids)
            if grown.sum() == main.sum(): break
            main = grown
        closed = nd.binary_closing(main, iterations=3); filled = nd.binary_fill_holes(closed)
        hl, hn = nd.label(filled & ~closed)                # holes that are just backdrop (between legs, inside an arc) stay open
        for i, sl in enumerate(nd.find_objects(hl)):
            hc = hl[sl] == i + 1
            if hc.sum() > 300 and d[sl][hc].mean() < 22: filled[sl][hc] = False
        al = np.maximum(alpha * sel, filled * 1.0)
        # drop specks: tiny dark pieces far from the body
        cl, cn = nd.label(al > .05, structure=np.ones((3, 3))); dist = nd.distance_transform_edt(~main)
        keep = np.zeros_like(main)
        for i, sl in enumerate(nd.find_objects(cl)):
            c = cl[sl] == i + 1; px = a[sl][c]
            if dist[sl][c].min() < 6 or (px.max(-1).mean() > 90 and c.sum() > 8) or c.sum() > 400: keep[sl] |= c
        al = al * keep
        ys, xs = np.nonzero(main); al[ys.max() + 22:] = 0
        soft = (al > .02) & (al < .98); aa = np.maximum(al, 1e-3)[..., None]
        col = np.where(soft[..., None], np.clip((a - X.STAGE * (1 - aa)) / aa, 0, 255), a)
        yy, xx = np.nonzero(al > .05); y0, y1, x0, x1 = yy.min(), yy.max() + 1, xx.min(), xx.max() + 1
        out.append((np.dstack([col, al * 255]).clip(0, 255).astype(np.uint8)[y0:y1, x0:x1], main[y0:y1, x0:x1]))
    return out

if __name__ == "__main__":
    Z = "/home/claude/gen5/z/redo"
    for name, n, ka in [("witch_harvest_crescent", 8, "H00"), ("witch_silverleaf_salve", 8, "H08"), ("witch_elderwood_guardian", 8, "H16"),
                        ("fox_hemline_fangs", 8, "F00"), ("ranger_silver_arrow_R14", 3, "R13")]:
        figs = cut(f"{Z}/{name}.png", n)
        s = [X.key_height(ka) / X.center_height(mn) for _, mn in figs]
        print(name, "keys", round(s[0], 3), round(s[-1], 3), "mid", [round(v, 3) for v in s[1:-1]])
        os.makedirs("/home/claude/gen5/cuts", exist_ok=True)
        for j, (rgba, mn) in enumerate(figs):
            Image.fromarray(rgba, "RGBA").save(f"/home/claude/gen5/cuts/{name}_{j + 1:02d}.png")
