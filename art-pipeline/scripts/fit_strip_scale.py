"""Per-strip uniform scale: fit each generated key copy to its original key by silhouette overlap."""
import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as nd
sys.path.insert(0, "/home/claude/gen5"); import extract2 as E2
X = E2.X
SRC = "/home/claude/export/moonfaire_art_pipeline/frames"           # untouched originals (M/N/P/Q were rewritten in sprites/frames)
BK = json.load(open("/home/claude/sprites/frames/meta_backup_gen6.json")); FLAT = {m['name']: m for t in BK.values() for m in t}

def anchor(main):
    ys, xs = np.nonzero(main); fb = ys.max(); h = fb - ys.min()
    boots = ys > fb - .08 * h; bx = np.median(xs[boots])
    band = (ys > ys.min() + .30 * h) & (ys < ys.min() + .55 * h) & (np.abs(xs - bx) < .18 * h)
    return float(np.median(xs[band])), float(fb), int(ys.min())

def key_img(k): return Image.open(f"{SRC}/{k}.png").convert("RGBA")
def key_main(k):
    al = np.array(key_img(k))[..., 3] > 128; lab, n = nd.label(al); sz = nd.sum(al, lab, range(1, n + 1)); return lab == (np.argmax(sz) + 1)

def place(mask, ax, ay, s, W=900, H=900, ox=450, oy=820):
    """resize mask by s and paste so the anchor lands on (ox, oy)"""
    im = Image.fromarray((mask * 255).astype(np.uint8)); w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    m = np.array(im.resize((w, h), Image.BILINEAR)) > 127
    out = np.zeros((H, W), bool); x0, y0 = int(round(ox - ax * s)), int(round(oy - ay * s))
    xs0, ys0 = max(0, -x0), max(0, -y0); xs1, ys1 = min(w, W - x0), min(h, H - y0)
    if xs1 > xs0 and ys1 > ys0: out[y0 + ys0:y0 + ys1, x0 + xs0:x0 + xs1] = m[ys0:ys1, xs0:xs1]
    return out

def fit(copy_main, k):
    """scale that best overlays the strip's copy of key k on the original key (body masks, anchored at the soles)"""
    km = key_main(k); kax, kay, _ = anchor(km); ref = place(km, kax, kay, 1.0)
    cax, cay, _ = anchor(copy_main); s0 = X.center_height(km) / X.center_height(copy_main)
    best = (-1, s0)
    for s in s0 * np.exp(np.linspace(np.log(.6), np.log(1.6), 61)):
        m = place(copy_main, cax, cay, s); iou = (m & ref).sum() / max(1, (m | ref).sum())
        if iou > best[0]: best = (iou, s)
    # fine pass
    c = best[1]
    for s in c * np.exp(np.linspace(-.03, .03, 13)):
        m = place(copy_main, cax, cay, s); iou = (m & ref).sum() / max(1, (m | ref).sum())
        if iou > best[0]: best = (iou, s)
    return best[1], best[0]

def body_only(rgba, main):
    """drop glowing effect pixels (bright, or bright+saturated) so shields/arcs/bows don't steer the fit"""
    c = rgba[..., :3].astype(float); mx = c.max(-1); mn = c.min(-1); lum = c.mean(-1)
    glow = (lum > 150) | ((mx > 170) & (mx - mn > 70))
    b = main & ~glow
    b = nd.binary_opening(b, iterations=2); lab, n = nd.label(b)
    if n == 0: return main
    sz = nd.sum(b, lab, range(1, n + 1)); b = lab == (np.argmax(sz) + 1)
    return nd.binary_fill_holes(nd.binary_closing(b, iterations=3))

def fit_body(copy_rgba, copy_main, k):
    kr = np.array(key_img(k)); km = body_only(kr, key_main(k)); kax, kay, _ = anchor(km); ref = place(km, kax, kay, 1.0)
    cm = body_only(copy_rgba, copy_main); cax, cay, _ = anchor(cm); s0 = X.center_height(km) / X.center_height(cm)
    best = (-1, s0)
    for s in s0 * np.exp(np.linspace(np.log(.6), np.log(1.6), 61)):
        m = place(cm, cax, cay, s); iou = (m & ref).sum() / max(1, (m | ref).sum())
        if iou > best[0]: best = (iou, s)
    c = best[1]
    for s in c * np.exp(np.linspace(-.03, .03, 13)):
        m = place(cm, cax, cay, s); iou = (m & ref).sum() / max(1, (m | ref).sum())
        if iou > best[0]: best = (iou, s)
    return best[1], best[0]
