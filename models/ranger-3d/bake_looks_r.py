# Two more faces for her to try on (an experiment Chris asked for on November 13), added to out/ranger_tex.js:
#   faceYoung, facePartsYoung : her own face (J1 and the J2 states) with the lines of age taken out. Creases, crow's feet and the
#                               shade under her eyes are lifted toward the skin round them; eyes, brows, lashes and lips are kept.
#   faceFox, facePartsFox     : the Fox's painted face (round 5, F1 and F2) as baked for the Fox's model, read from refs_fox/fox_face.json (its face, faceParts and layout,
#                               copied from moon-faire, branch claude/fox-3d-model, commit f7cac64, models/fox-3d/out/fox_tex_own.js). Both heads are the Jester's
#                               face model and both pictures use its window (20 cm across, 1.385 to 1.585 m), so it lays straight on.
#                               Her eyes are 2.8 mm nearer the middle than the Ranger's sculpted eyes, so the eye band is slid outward
#                               by that much; her skin is toned to the Ranger's cheek so face and neck agree.
# The pictures are data: run with python3 -I.
import json, io, base64, sys
import numpy as np
from PIL import Image
import scipy.ndimage as ndi
OUT = '/home/claude/ranger/out/'; SH = '/home/claude/ranger/shots/'
def load_js(p): t = open(p).read(); return t, json.loads(t[t.index('{'):t.rindex('}') + 1])
def dec(uri): return Image.open(io.BytesIO(base64.b64decode(uri.split(',')[1])))
def enc(a, q=92): b = io.BytesIO(); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def enc_rgba(rgb, al): b = io.BytesIO(); Image.fromarray(np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8), 'RGBA').save(b, 'WEBP', quality=92); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
sm = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))
txt, T = load_js(OUT + 'ranger_tex.js'); F = json.load(open('/home/claude/ranger/refs_fox/fox_face.json'))
own = np.asarray(dec(T['face']).convert('RGB'), np.float32); H, W = own.shape[:2]; PX = W / 0.2          # pixels to a metre of the head's window
def cheek(a): h, w = a.shape[:2]; yy = slice(int((1.585 - 1.492) / 0.2 * h), int((1.585 - 1.470) / 0.2 * h)); return np.median(np.concatenate([a[yy, int(0.26 * w):int(0.33 * w)].reshape(-1, 3), a[yy, int(0.67 * w):int(0.74 * w)].reshape(-1, 3)]), 0)
SKIN = cheek(own); print('her cheek', SKIN.round(0).tolist(), 'canvas', own.shape)

# ---------- younger ----------
def younger(a, scale=1.0):
    a = a.astype(np.float32); lum = a @ np.array([0.3, 0.59, 0.11], np.float32); s = a.sum(2) + 1e-3
    ch = np.hypot(a[..., 0] / s - SKIN[0] / SKIN.sum(), a[..., 1] / s - SKIN[1] / SKIN.sum())          # how far from skin colour
    keep = np.clip(sm(0.022, 0.040, ch) + sm(0.62, 0.50, lum / (SKIN @ np.array([0.3, 0.59, 0.11]))), 0, 1)   # lips, eyes, brows, lashes, nostrils
    keep = np.clip(ndi.gaussian_filter(ndi.maximum_filter(keep, size=int(5 * scale) | 1), 2.0 * scale) * 1.2, 0, 1)
    out = a.copy()
    for sig, thr, k in ((0.0007, 13.0, 0.95), (0.0018, 18.0, 0.9), (0.0045, 23.0, 0.75)):                 # fine lines, folds, the shade of bags and hollows
        sg = sig * PX * scale; base = np.stack([ndi.gaussian_filter(out[..., c], sg) for c in range(3)], -1)
        d = (base - out) @ np.array([0.3, 0.59, 0.11], np.float32); lift = np.clip(d, 0, None) * sm(2.8 * thr, 1.3 * thr, d) * k * (1 - keep)
        out += (base - out) * (lift / np.maximum(d, 1e-3))[..., None] * (d > 0)[..., None]
    soft = np.stack([ndi.gaussian_filter(out[..., c], 0.0012 * PX * scale) for c in range(3)], -1); out = out + (soft - out) * 0.34 * (1 - keep)[..., None]   # a little smoother skin
    return out
young = younger(own); T['faceYoung'] = enc(young, 93)
T['facePartsYoung'] = {}
for n, p in T['faceParts'].items():
    im = np.asarray(dec(p['src']).convert('RGBA'), np.float32); sc = (im.shape[1] / (p['w'] * W))
    T['facePartsYoung'][n] = dict(src=enc_rgba(younger(im[..., :3], sc), im[..., 3]), x=p['x'], y=p['y'], w=p['w'], h=p['h'])

# ---------- the Fox's ----------
fox = np.asarray(dec(F['face']).convert('RGB'), np.float32); gain = np.clip(SKIN / cheek(fox), 0.86, 1.16); print('fox cheek', cheek(fox).round(0).tolist(), 'gain', gain.round(3).tolist(), 'canvas', fox.shape)
SHIFT = T['layout']['eyeX'] - F['layout']['eyeX']
def slide(a, x0, y0, w, h):                           # a: a picture covering the window part (x0, y0, w, h), all as shares of the window
    hh, ww = a.shape[:2]; jj, ii = np.meshgrid(np.arange(ww), np.arange(hh)); X = (x0 + (jj + 0.5) / ww * w - 0.5) * 0.2; Y = 1.585 - (y0 + (ii + 0.5) / hh * h) * 0.2
    ax = np.abs(X); bump = sm(0.0, 0.026, ax) * sm(0.095, 0.050, ax) * sm(1.490, 1.508, Y) * sm(1.566, 1.550, Y)
    src = jj - np.sign(X) * SHIFT * bump / (0.2 * w) * ww
    return np.stack([ndi.map_coordinates(a[..., c], [ii, src], order=1, mode='nearest') for c in range(a.shape[2])], -1)
T['faceFox'] = enc(slide(fox, 0, 0, 1, 1) * gain, 93)
T['facePartsFox'] = {}
for n, p in F['faceParts'].items():
    im = slide(np.asarray(dec(p['src']).convert('RGBA'), np.float32), p['x'], p['y'], p['w'], p['h'])
    T['facePartsFox']['oo' if n == 'oh2' else n] = dict(src=enc_rgba(im[..., :3] * gain, im[..., 3]), x=p['x'], y=p['y'], w=p['w'], h=p['h'])
js = txt[:txt.index('{')] + json.dumps(T, separators=(',', ':')) + ';'; open(OUT + 'ranger_tex.js', 'w').write(js)
row = np.hstack([np.asarray(Image.fromarray(np.clip(v, 0, 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS)) for v in (own, young, slide(fox, 0, 0, 1, 1) * gain)]); Image.fromarray(row).save(SH + 'bake_looks.jpg', quality=88)
print('eye band slid out by %.1f mm; ranger_tex.js %d KB' % (SHIFT * 1000, len(js) // 1024))
