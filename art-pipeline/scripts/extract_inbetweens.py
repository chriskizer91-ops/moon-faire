"""Cut generated in-between strips, scale each figure to the original key by matching her head,
anchor on torso + soles exactly like cut.py, and register the result as a new frame set."""
import cv2, numpy as np, json, os, shutil, sys
from PIL import Image
from scipy import ndimage as nd
SP = "/home/claude/sprites"; FR = SP + "/frames"
META = json.load(open(FR + "/meta.json"))
FLAT = {m['name']: m for t in META.values() for m in t}
STAGE = np.array([56., 48., 67.])

def load_strip(path):
    a = np.array(Image.open(path).convert("RGB")).astype(np.float32)
    # drop white/very light letterbox bands
    rows = np.nonzero(a.mean((1, 2)) < 200)[0]; cols = np.nonzero(a.mean((0, 2)) < 200)[0]
    a = a[rows.min():rows.max() + 1, cols.min():cols.max() + 1]
    b = np.concatenate([a[:6].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    return a, np.median(b, 0)

def bands(p, th, minlen):
    on = p > th; out = []; s = None
    for i, v in enumerate(on):
        if v and s is None: s = i
        if not v and s is not None:
            if i - s > minlen: out.append((s, i))
            s = None
    if s is not None: out.append((s, len(on)))
    return out

def figures(a, bg, n):
    d = np.sqrt(((a - bg) ** 2).sum(-1)); m = nd.binary_opening(d > 24, iterations=2)
    rb = bands(m.mean(1), 0.003, 40); r0, r1 = max(rb, key=lambda r: r[1] - r[0])   # tallest band = figures, not labels
    sub = m[r0:r1]
    # columns: body mass only (lower 60% of the band, where effects are rare) for clean valleys
    low = sub[int(.35 * (r1 - r0)):]
    prof = nd.uniform_filter1d(low.sum(0).astype(float), 15)
    nz = np.nonzero(prof > 2)[0]; L, R = nz[0], nz[-1]; exp = (R - L) / n; cuts = []
    for k in range(1, n):
        c0 = int(L + k * exp); lo, hi = int(c0 - exp * .4), int(c0 + exp * .4)
        cuts.append(lo + int(np.argmin(prof[lo:hi])))
    edges = [0] + cuts + [a.shape[1]]
    return d, m, (r0, r1), edges

def cut_figure(a, d, m, rows, x0, x1):
    r0, r1 = rows
    region = np.zeros(m.shape, bool); region[max(0, r0 - 4):r1 + 4, x0:x1] = True
    body = m & region
    lab, k = nd.label(body); sz = nd.sum(body, lab, range(1, k + 1)); main = lab == (np.argmax(sz) + 1)
    alpha = np.clip((d - 9) / 24, 0, 1) * region
    cl, cn = nd.label(alpha > .05, structure=np.ones((3, 3))); dist = nd.distance_transform_edt(~main); keep = np.zeros_like(main)
    for i, sl in enumerate(nd.find_objects(cl)):
        comp = cl[sl] == i + 1; px = a[sl][comp]
        if dist[sl][comp].min() < 6 or (px.max(-1).mean() > 100 and comp.sum() > 6): keep[sl] |= comp
    filled = nd.binary_fill_holes(nd.binary_closing(main, iterations=3))
    alpha = np.maximum(alpha * keep, filled * 1.0)
    ys, xs = np.nonzero(main); sole = ys.max()
    alpha[sole + 22:] = 0
    soft = (alpha > .02) & (alpha < .98); aa = np.maximum(alpha, 1e-3)[..., None]
    col = np.where(soft[..., None], np.clip((a - STAGE * (1 - aa)) / aa, 0, 255), a)
    yy, xx = np.nonzero(alpha > .05); y0, y1, x0b, x1b = yy.min(), yy.max() + 1, xx.min(), xx.max() + 1
    rgba = np.dstack([col, alpha * 255]).clip(0, 255).astype(np.uint8)[y0:y1, x0b:x1b]
    mainc = main[y0:y1, x0b:x1b]
    return rgba, mainc

def center_height(main):
    """sole minus hat-top measured only in a narrow column band at the torso centre, so raised arms and effects don't count"""
    ys, xs = np.nonzero(main); fb = ys.max(); h0 = fb - ys.min()
    band = (ys > ys.min() + .30 * h0) & (ys < ys.min() + .55 * h0); tx = int(np.median(xs[band]))
    w = max(3, int(.035 * h0)); cols = main[:, max(0, tx - w):tx + w + 1]
    tops = [np.nonzero(c)[0].min() for c in cols.T if c.any()]
    return fb - float(np.median(tops))

def key_height(key_name):
    al = np.array(Image.open(f"{FR}/{key_name}.png"))[..., 3] > 128
    lab, k = nd.label(al); sz = nd.sum(al, lab, range(1, k + 1)); return center_height(lab == (np.argmax(sz) + 1))

def head_scale(key_name, rgba, main):
    return 1.0, key_height(key_name) / center_height(main)

def anchor(rgba, main):
    ys, xs = np.nonzero(main); fb = ys.max(); hgt = fb - ys.min()
    band = (ys > ys.min() + .30 * hgt) & (ys < ys.min() + .55 * hgt)
    return float(np.median(xs[band])), float(fb), int(ys.min())

def run(tag, jobs, out_keys):
    """jobs: list of (strip_path, left_key, right_key, n_new). out_keys: ordered key list.
    Writes frames TAG01.. with keys copied verbatim."""
    names = []; meta_out = []; report = []
    seq = []
    for gi, (path, ka, kb, nb) in enumerate(jobs):
        a, bg = load_strip(path); d, m, rows, edges = figures(a, bg, nb + 2)
        seq.append(('key', ka))
        cuts = [cut_figure(a, d, m, rows, edges[j], edges[j + 1]) for j in range(1, nb + 1)]
        sc_list = [key_height(ka) / center_height(mn) for _, mn in cuts]
        med = float(np.median(sc_list))
        for j, (rgba, main) in enumerate(cuts, start=1):
            s = sc_list[j - 1]; sc = 1.0
            if abs(s / med - 1) > .06: s = med     # raised arm / flail over the head inflates the height: use the strip's median
            im = Image.fromarray(rgba, "RGBA"); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
            mi = Image.fromarray((main * 255).astype(np.uint8)).resize(im.size, Image.NEAREST)
            seq.append(('new', im, np.array(mi) > 127)); report.append((os.path.basename(path), j, round(sc, 2), round(s, 3)))
    if out_keys[-1] is not None: seq.append(('key', out_keys[-1]))
    meta_new = []
    for i, it in enumerate(seq):
        name = f"{tag}{i + 1:02d}"
        if it[0] == 'key':
            shutil.copy(f"{FR}/{it[1]}.png", f"{FR}/{name}.png"); f = dict(FLAT[it[1]]); f['name'] = name; f['src'] = it[1]
        else:
            im, main = it[1], it[2]; im.save(f"{FR}/{name}.png"); fx, fy, top = anchor(np.array(im), main)
            f = dict(name=name, footX=fx, footY=fy, bodyTop=top)
        meta_new.append(f)
    META[tag] = meta_new
    return report, len(meta_new)

if __name__ == "__main__":
    G = "/home/claude/gen4"
    H = [f"G{i:02d}" for i in range(8, 16)]; V = [f"G{i:02d}" for i in range(16, 24)]
    jobs = [(f"{G}/Hush/hush/gap_{g + 1:02d}_{H[g]}-to-{H[g + 1]}.png", H[g], H[g + 1], 3) for g in range(7)]
    print(run("U", jobs, H)[0][:3])
    jobs = [(f"{G}/Gravity/gravity/gap_{g + 1:02d}_{V[g]}-to-{V[g + 1]}.png", V[g], V[g + 1], 1) for g in range(7)]
    print(run("V", jobs, V))
    print(run("I", [(f"{G}/Idle_and_Flail/idle/idle_breath.png", "A00", "A00", 7)], ["A00", None]))
    print(run("E", [(f"{G}/Idle_and_Flail/gilded_rebuke_redo/rebuke_redo.png", "G00", "G07", 6)], ["G00", "G07"]))
    json.dump(META, open(FR + "/meta.json", "w"), indent=1)
    print({t: len(META[t]) for t in "UVIE"})
