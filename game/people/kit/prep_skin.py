# Gets Chris's skin pictures ready to lay onto a model: python3 -I people/kit/prep_skin.py <folder of pictures> [more folders]
# For each <model>-<letter>-body.png and -face.png it writes, in people/skins/<model>/:
#   <letter>-body.webp  the body sheet with the figure's edge colours spread out over the grey background, so a point of the
#                       model that falls a little outside the painted figure still gets cloth, not grey
#   <letter>-face.webp  the face at 1024 x 1024
#   <letter>.json       how the painted figures sit against the guide (front and back: scale x, scale y, offset x, offset y,
#                       in parts of a half picture), and the skin colour taken from the face picture's surround
import glob, json, os, sys
import numpy as np, cv2
from PIL import Image
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); SK = os.path.join(HERE, '..', 'skins')
def figure_mask(rgb):
    # the background is one soft grey that drifts a little across the picture: fit a smooth surface to the picture's edges and
    # middle strip (always background), and call figure whatever stands off from it
    h, w = rgb.shape[:2]; img = cv2.GaussianBlur(rgb, (0, 0), 1.5).astype(np.float32)
    yy, xx = np.mgrid[0:h, 0:w]; u = xx / w; v = yy / h
    edge = (v < 0.02) | (v > 0.975) | (u < 0.07) | (u > 0.93) | ((u > 0.475) & (u < 0.525))
    A = np.stack([np.ones_like(u), u, v, u * u, v * v, u * v], -1); bgm = np.zeros_like(img)
    for c in range(3):
        k, *_ = np.linalg.lstsq(A[edge], img[..., c][edge], rcond=None); bgm[..., c] = A @ k
    d = np.abs(img - bgm).max(2); fig = d > 13
    fig = ndimage.binary_closing(ndimage.binary_opening(fig, iterations=1), iterations=3); lab, n = ndimage.label(fig)
    if n: sizes = ndimage.sum(fig, lab, range(1, n + 1)); fig = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 2500])
    return ndimage.binary_fill_holes(fig)
def box(m):
    ys, xs = np.where(m); return xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
def fit(guide_m, paint_m):
    # both masks are one half, any size. Returns [sx, sy, ox, oy]: a point g of the guide (0..1, y up) is painted at g * s + o
    gh, gw = guide_m.shape; ph, pw = paint_m.shape; a = box(guide_m); b = box(paint_m)
    gx0, gx1, gy0, gy1 = a[0] / gw, a[1] / gw, 1 - a[3] / gh, 1 - a[2] / gh; px0, px1, py0, py1 = b[0] / pw, b[1] / pw, 1 - b[3] / ph, 1 - b[2] / ph
    sx, sy = (px1 - px0) / (gx1 - gx0), (py1 - py0) / (gy1 - gy0); return [round(float(v), 5) for v in (sx, sy, px0 - gx0 * sx, py0 - gy0 * sy)]
for folder in sys.argv[1:]:
    for f in sorted(glob.glob(os.path.join(folder, '*-body.png'))):
        pid, letter = os.path.basename(f).split('-')[:2]; d = os.path.join(SK, pid)
        rgb = np.array(Image.open(f).convert('RGB')); h, w = rgb.shape[:2]; m = figure_mask(rgb)
        g = np.array(Image.open(os.path.join(d, 'guide.png')).convert('RGB')).astype(int); gm = np.abs(g - 0x6e).sum(2) > 6
        fits = {'front': fit(gm[:, :768], m[:, :w // 2]), 'back': fit(gm[:, 768:], m[:, w // 2:])}
        out = rgb.copy()
        # the small face on the front figure is not used (the face has its own picture), and hair or a headcloth that frames the face
        # would pick it up: paint it out from what surrounds it. The face in the guide: x 0, y 1.445 to 1.615 m, 0.15 m wide
        sx, sy, ox, oy = fits['front']; hw = w // 2
        cx, cy = (0.5 * sx + ox) * hw, (1 - ((1.53 + 0.1) / 2.0 * sy + oy)) * h; rx, ry = 0.075 / 1.5 * sx * hw, 0.085 / 2.0 * sy * h
        hole = np.zeros((h, w), np.uint8); cv2.ellipse(hole, (int(round(cx)), int(round(cy))), (int(round(rx)), int(round(ry))), 0, 0, 360, 255, -1)
        rgb = cv2.inpaint(rgb, hole, 7, cv2.INPAINT_TELEA); out = rgb.copy()
        for x0, x1 in ((0, w // 2), (w // 2, w)):                      # spread each half's own colours, never across the middle
            mm = m[:, x0:x1]; inner = ndimage.binary_erosion(mm, iterations=3); idx = ndimage.distance_transform_edt(~inner, return_distances=False, return_indices=True)
            out[:, x0:x1] = rgb[:, x0:x1][idx[0], idx[1]]
        Image.fromarray(out).save(os.path.join(d, letter + '-body.webp'), quality=84, method=6)
        face = Image.open(f.replace('-body.png', '-face.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS); face.save(os.path.join(d, letter + '-face.webp'), quality=90, method=6)
        fa = np.array(face); edge = np.concatenate([fa[:40].reshape(-1, 3), fa[-40:].reshape(-1, 3), fa[:, :40].reshape(-1, 3), fa[:, -40:].reshape(-1, 3)]); skin = '#%02x%02x%02x' % tuple(int(v) for v in np.median(edge, 0))
        # the eyes, if they can be found, say how the face picture sits against the face the head expects (eyes at 356 and 668 across, 309 down)
        ff = [1, 0, 0]
        try:
            casc = cv2.data.haarcascades + 'haarcascade_eye.xml'
            if not os.path.exists(casc): raise IOError('no eye finder here')
            gray = cv2.cvtColor(fa, cv2.COLOR_RGB2GRAY); eyes = cv2.CascadeClassifier(casc).detectMultiScale(gray, 1.1, 6, minSize=(70, 70), maxSize=(260, 260))
            cs = sorted([(x + w2 / 2, y + h2 / 2) for (x, y, w2, h2) in eyes if 180 < y + h2 / 2 < 460], key=lambda c: c[0])
            L = [c for c in cs if c[0] < 512]; R = [c for c in cs if c[0] >= 512]
            if len(L) == 1 and len(R) == 1 and abs(L[0][1] - R[0][1]) < 30:
                k = 312.0 / (R[0][0] - L[0][0]); mx, my = (L[0][0] + R[0][0]) / 2, (L[0][1] + R[0][1]) / 2
                if 0.85 < k < 1.18: ff = [round(k, 4), round(-k * (mx - 512), 1), round(309 - 512 - k * (my - 512), 1)]
        except Exception as e: pass
        json.dump({'fit': fits, 'faceFit': ff, 'skin': skin, 'figure_share': round(float(m.mean()), 4)}, open(os.path.join(d, letter + '.json'), 'w'))
        print(pid, letter, fits['front'], 'face', ff, skin, 'figure %.1f%%' % (m.mean() * 100))
