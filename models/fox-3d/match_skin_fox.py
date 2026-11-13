# match_skin_fox.py: one skin for all of her (Chris, 13 Nov: "the skin tone of her hands compared to her arms compared to her chest compared to her face
# are not the same ... both colour match and matte level match"; arms need more painted detail; hands a little softer; her chest is too shiny).
# The tone everything is brought to is T['skin'], which bake_face_r5.py reads off the painted skin of her face. This script, run after every other bake:
#   body      her painted chest and back: brought to that tone, the painted shine taken off (highlights flattened, soft shading and freckles kept)
#   bodySkin  a picture of where the body painting is skin, so the model can light that skin the way it lights her face (see the torso material)
#   hands     brought to that tone, and the painted detail (veins, tendons, creases) softened by 40%
#   arm       new: the skin of her arms, painted from the forearms in the hand paintings D1 and D2, so arm and hand are one piece of painting
# It replaces tone_skin_fox.py. run: python3 -I match_skin_fox.py && python3 make_jface.py
import json, io, base64, numpy as np
from PIL import Image
from scipy import ndimage as ndi
W = '/home/claude/fox3d/'; OUT = W + 'out/fox_tex_own.js'; raw = open(OUT).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
TONE = np.array([int(T['skin'][i:i + 2], 16) for i in (1, 3, 5)], np.float32); print('tone', T['skin'], TONE)
def load(key): return np.asarray(Image.open(io.BytesIO(base64.b64decode(T[key].split(',', 1)[1]))).convert('RGB')).astype(np.float32)
def save(key, a, q=90, fmt='JPEG'): bb = io.BytesIO(); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(bb, fmt, quality=q); T[key] = 'data:image/%s;base64,' % fmt.lower() + base64.b64encode(bb.getvalue()).decode()
def lum(a): return 0.30 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]
def mblur(a, m, s):                                 # a blur that only counts the pixels in m
    den = np.maximum(ndi.gaussian_filter(m, s), 1e-4); return ndi.gaussian_filter(a * m, s) / den
SHADE = np.array([0.90, 1.00, 1.10], np.float32)    # skin in shade is a little redder, not just darker

# ---- her chest and back ----
a = load('body'); H, Wd = a.shape[:2]; R, G, B = a[..., 0], a[..., 1], a[..., 2]
like = (R > 140) & (R >= G - 2) & (G >= B - 6) & (R - B > 6) & (R - B < 150) & (G / np.maximum(R, 1) > 0.52) & (G / np.maximum(R, 1) < 0.975)
lab, n = ndi.label(like); seeds = [(int(H * 0.07), int(Wd * 0.25)), (int(H * 0.07), int(Wd * 0.75))]       # the bare skin above the neckline, front and back
sk = np.zeros((H, Wd), bool)
for sy, sx in seeds:
    if lab[sy, sx]: sk |= lab == lab[sy, sx]
sk = ndi.binary_fill_holes(sk); sk = ndi.binary_opening(sk, iterations=1); m = sk.astype(np.float32)
L = lum(a); Lmed = np.median(L[sk]); low = mblur(L, m, 9) / Lmed; fine = np.clip(L / np.maximum(mblur(L, m, 2.2), 1), 0.86, 1.07)
s = np.where(low < 1, 1 + 0.60 * (low - 1), 1 + 0.18 * (low - 1)); s = np.clip(s, 0.70, 1.045)          # shadows kept at 60%, highlights at 18%: the paint no longer shines
new = 0.95 * TONE[None, None, :] * (s[..., None] ** SHADE[None, None, :]) * fine[..., None]      # 5% under the tone: her chest faces the light more than her face does, and read brighter at the same paint
soft = ndi.gaussian_filter(m, 1.3)[..., None]; body = a * (1 - soft) + new * soft; save('body', body, 90)
print('body: skin pixels', int(sk.sum()), 'was', np.median(a[sk], 0).astype(int), 'now', np.median(body[sk], 0).astype(int))
mk = Image.fromarray((np.clip(ndi.gaussian_filter(ndi.binary_erosion(sk, iterations=1).astype(np.float32), 1.6), 0, 1) * 255).astype(np.uint8)).resize((512, 384), Image.LANCZOS).convert('RGB')
bb = io.BytesIO(); mk.save(bb, 'PNG'); T['bodySkin'] = 'data:image/png;base64,' + base64.b64encode(bb.getvalue()).decode(); mk.save(W + 'shots/match_bodyskin.png')
Image.fromarray(np.clip(body, 0, 255).astype(np.uint8)).save(W + 'shots/match_body.jpg', quality=90)

# ---- her hands ----
a = load('hands'); R, G, B = a[..., 0], a[..., 1], a[..., 2]
sk = (R > 120) & (R > G) & (G > B - 4) & (R - B > 18) & (R - B < 150) & (G / np.maximum(R, 1) > 0.50) & (G / np.maximum(R, 1) < 0.93); m = sk.astype(np.float32)
med = np.median(a[sk], 0); gain = TONE / med; toned = a * gain[None, None, :]
blur = np.stack([mblur(toned[..., c], m, 7) for c in range(3)], -1); softd = blur + 0.60 * (toned - blur)                 # 40% of the painted detail taken off
# and its broad lights and darks evened out, so the back of her hand is not a paler patch at the end of her arm; knuckles, tendons and creases stay
broad = np.stack([mblur(softd[..., c], m, 55) for c in range(3)], -1); softd = TONE[None, None, :] * (softd / np.maximum(broad, 1)) ** 0.85
wsk = ndi.gaussian_filter(m, 1.5)[..., None]; hands = a * (1 - wsk) + softd * wsk; save('hands', hands, 90)
print('hands: was', med.astype(int), 'now', np.median(hands[sk], 0).astype(int)); Image.fromarray(np.clip(hands, 0, 255).astype(np.uint8)).save(W + 'shots/match_hands.jpg', quality=88)

# ---- her arms: 512 round by 1024 long. Across: outside of the arm, front, inside, back. Down: 2 cm above the shoulder joint to just past the wrist. ----
AW, AH, S0, S1 = 512, 1024, -0.022, 0.478; KB = 0.0002569 * 0.86                                 # one D1 pixel on the model: the paintings are life size, her hands are 86% of it
strips = {}
for nm, cols in (('D1', ((0, 627), (627, 1254))), ('D2', ((0, 627), (627, 1254)))):
    im = np.asarray(Image.open(W + 'refs/%s.png' % nm).convert('RGB')).astype(np.float32); R, G, B = im[..., 0], im[..., 1], im[..., 2]
    skn = (R > 140) & (R - B > 40) & (R > G) & (G > 70); mm = skn.astype(np.float32)
    det = np.stack([im[..., c] / np.maximum(mblur(im[..., c], mm, 26), 1) for c in range(3)], -1)                  # the painting's own lighting divided out: what is left is skin
    for side, (x0, x1) in zip(('dorsal', 'volar'), cols):
        ext = {}
        for y in range(730, 1254):
            xs = np.where(skn[y, x0:x1])[0]; runs = np.split(xs, np.where(np.diff(xs) > 3)[0] + 1); r = max(runs, key=len); ext[y] = (r[0] + x0 + 3, r[-1] + x0 - 3)
        strips[(nm, side)] = (det, ext)
def sample(key, row, phi):                           # the painting looked at straight on is the half of the arm that faces it; phi is the angle round from the middle of that half
    det, ext = strips[key]; row = int(np.clip(row, 741, 1253)); xl, xr = ext[row]; cx, hw = (xl + xr) / 2, (xr - xl) / 2
    x = cx + hw * 0.97 * np.sin(phi) * (1 if key[1] == 'dorsal' else -1); x0 = int(np.floor(x)); f = x - x0; x0 = int(np.clip(x0, 0, det.shape[1] - 2))
    return det[row, x0] * (1 - f) + det[row, x0 + 1] * f
def rows_at(sl):                                     # which painting and row paints this distance down the arm
    if sl >= 0.357: return [('D1', 741 + (0.47 - sl) / KB, 1.0)]
    t = (0.357 - sl) / KB; P = 294.0; n = int(t // P); f = t - n * P; seq = [('D2', -1), ('D2', 1), ('D1', -1), ('D1', 1), ('D2', -1)][min(n, 4)]
    return [(seq[0], 1254 - f if seq[1] < 0 else 960 + f, 1.0)]
arm = np.zeros((AH, AW, 3), np.float32)
for j in range(AH):
    sl = S0 + (S1 - S0) * (j + 0.5) / AH; src = rows_at(sl)[0]; turn = 0.6 * max(0.0, 0.357 - sl)       # above the real paint the borrowed skin winds slowly round the arm, so its repeats do not line up
    for i in range(AW):
        u = ((i + 0.5) / AW + turn) % 1.0; ph_d = ((u + 0.5) % 1.0 - 0.5) * 2 * np.pi; ph_v = (0.5 - u) * 2 * np.pi
        wd, wv = max(0.0, np.cos(ph_d)) ** 1.2 + 1e-3, max(0.0, np.cos(ph_v)) ** 1.2 + 1e-3
        cd = sample((src[0], 'dorsal'), src[1], np.clip(ph_d, -1.45, 1.45)); cv = sample((src[0], 'volar'), src[1], np.clip(ph_v, -1.45, 1.45))
        arm[j, i] = (cd * wd + cv * wv) / (wd + wv)
arm = np.clip(arm, 0.80, 1.12)
# where one painting hands over to the next, a short cross-fade
for sl0 in (0.357, 0.357 - 2 * 294 * KB):
    j0 = int((sl0 - S0) / (S1 - S0) * AH); k = 10; a0 = arm[j0 - k - 1].copy(); a1 = arm[j0 + k + 1].copy()
    for d in range(-k, k + 1): w = (d + k) / (2.0 * k); arm[j0 + d] = a0 * (1 - w) + a1 * w
rng = np.random.RandomState(4177); yy, xx = np.mgrid[0:AH, 0:AW].astype(np.float32); jof = lambda sl: (sl - S0) / (S1 - S0) * AH
def blob(u, sl, ru, rs):                             # a soft spot, wrapping round the arm
    du = np.minimum(np.abs(xx - u * AW), AW - np.abs(xx - u * AW)); return np.exp(-(du / (ru * AW)) ** 2 - ((yy - jof(sl)) / (rs / (S1 - S0) * AH)) ** 2)
tint = np.ones((AH, AW, 3), np.float32)
tint *= 1 + 0.035 * blob(0.42, 0.37, 0.13, 0.10)[..., None]                                       # the paler inside of her forearm
tint *= 1 - blob(0.75, 0.244, 0.085, 0.016)[..., None] * np.array([0.02, 0.13, 0.12], np.float32)   # the flush on the point of her elbow
for dsl, du, wu in ((-0.004, 0.0, 0.050), (0.004, 0.012, 0.040), (0.011, -0.010, 0.030)):          # the wrinkles across it
    tint *= 1 - 0.10 * blob(0.75 + du, 0.244 + dsl, wu, 0.0011)[..., None] * np.array([0.7, 1.0, 1.0], np.float32)
for dsl, wu in ((0.000, 0.060), (0.007, 0.045)):                                                     # the creases inside her elbow
    tint *= 1 - 0.085 * blob(0.25, 0.249 + dsl, wu, 0.0010)[..., None] * np.array([0.6, 1.0, 1.0], np.float32)
tint *= 1 - blob(0.80, 0.456, 0.05, 0.008)[..., None] * np.array([0.0, 0.05, 0.05], np.float32)     # her wrist bone
for _ in range(190):                                 # freckles, as in A1 and A5: most on the outside and back of the forearm, some above the elbow
    u = (0.90 + (rng.rand() + rng.rand() + rng.rand() - 1.5) * 0.40) % 1.0; sl = 0.185 + 0.25 * rng.rand() ** 0.8; r = (0.9 + 2.4 * rng.rand() * rng.rand())
    du = np.minimum(np.abs(xx - u * AW), AW - np.abs(xx - u * AW)); g = np.exp(-(du ** 2 + (yy - jof(sl)) ** 2) / (r * r)); tint *= 1 - (0.10 + 0.16 * rng.rand()) * g[..., None] * np.array([0.55, 1.0, 1.25], np.float32)
arm = TONE[None, None, :] * arm * tint; save('arm', arm, 90); Image.fromarray(np.clip(arm, 0, 255).astype(np.uint8)).save(W + 'shots/match_arm.jpg', quality=90)
print('arm: middle tone', np.median(arm.reshape(-1, 3), 0).astype(int))
T['skinChest'] = T['skin']
js = 'window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); open(W + 'variants/ownface/fox_tex_own.js', 'w').write(js)
