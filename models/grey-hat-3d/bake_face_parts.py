# His blink, half-shut eyes, talking mouths and smile, from painting C2, as patches over his baked face (stage 7).
# The method is the Ranger's (her README, "States"): C2's first cell is settled onto his face picture (out/tex_face.json 'face',
# which is C1 laid on), every other cell onto the first, and only the eyes or the mouth are lifted out, as soft-edged patches.
#   - Settling: SIFT points matched and a turn-scale-shift fitted with RANSAC (OpenCV). C2's cells are about 2.5 times smaller
#     than C1 on the face, so a patch is softer than the face round it; it is only seen for a blink or while his mouth moves.
#   - Tone: each patch is multiplied by (the face picture blurred) / (C2's first cell blurred), so its light and colour are C1's.
#   - His beard and moustache stay C1's: inside a mouth patch, wherever BOTH pictures have dark hair the face picture is kept.
#     Only lips, the gap between them and the skin round them come from C2.
#   - Each patch is stored already mixed into the face picture over its rectangle, so drawing the rectangle over the face is seamless.
# Names are the Ranger's and the Jester's: shut, half (eyes), oh, oo, smile (mouth).
# usage: python3 -I bake_face_parts.py  -> out/tex_faceparts.json (build.sh joins it into out/noiz_tex.js)
import os, io, json, base64, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(ROOT, 'out', 'tex_face.json')))
base_im = Image.open(io.BytesIO(base64.b64decode(d['face'].split(',')[1]))).convert('RGB')
base = np.asarray(base_im).astype(np.float32); S = base.shape[0]
c2 = np.asarray(Image.open(os.path.join(ROOT, 'refs', 'C2.png')).convert('RGB'))
cells = [np.ascontiguousarray(c2[r * 512:(r + 1) * 512, c * 512:(c + 1) * 512]) for r in range(2) for c in range(3)]
sift = cv2.SIFT_create(4000); gray = lambda a: cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
def fit(a, b):
    ka, da = sift.detectAndCompute(gray(a), None); kb, db = sift.detectAndCompute(gray(b), None)
    good = [x for x, y in cv2.BFMatcher().knnMatch(da, db, k=2) if x.distance < 0.75 * y.distance]
    M, inl = cv2.estimateAffinePartial2D(np.float32([ka[x.queryIdx].pt for x in good]), np.float32([kb[x.trainIdx].pt for x in good]), ransacReprojThreshold=4.0)
    return np.vstack([M, [0, 0, 1]]), int(inl.sum())
M1, n1 = fit(cells[0], base); print('C2 cell 1 onto his face: scale %.3f, %d points agree' % (np.hypot(M1[0, 0], M1[1, 0]), n1))
warped = [cv2.warpAffine(cells[0], M1[:2], (S, S), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)]
for i in range(1, 6):
    M, n = fit(cells[i], cells[0]); print('cell %d onto cell 1: shift %.1f, %.1f px, %d points agree' % (i + 1, M[0, 2], M[1, 2], n))
    warped.append(cv2.warpAffine(cells[i], (M1 @ M)[:2], (S, S), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE).astype(np.float32))
yy, xx = np.mgrid[0:S, 0:S]
def ell(cx, cy, rx, ry, soft=0.35): return np.clip((1 - np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)) / soft, 0, 1)
lp = lambda a, s: cv2.GaussianBlur(a, (0, 0), s)
lum = lambda a: a @ np.array([0.3, 0.59, 0.11], np.float32)
dark = lambda a: np.clip((95 - lp(lum(a), 2.0)) / 40, 0, 1)
gain = lp(base, 14) / np.maximum(lp(warped[0], 14), 1)
EYES = np.maximum(ell(345, 318, 120, 62), ell(668, 318, 120, 62)); MOUTH = ell(512, 645, 215, 72)     # in the face picture's pixels (eyes at row 318, lips at 645)
parts, out = {}, {}
for name, k, m in [('shut', 1, EYES), ('half', 2, EYES), ('oh', 3, MOUTH), ('oo', 4, MOUTH), ('smile', 5, MOUTH)]:
    if m is MOUTH: m = lp(m * (1 - np.minimum(dark(base), dark(warped[k]))), 2.5)
    mix = base * (1 - m[..., None]) + warped[k] * gain * m[..., None]
    ys, xs = np.where(m > 0.004); x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    im = Image.fromarray(np.clip(mix[y0:y1, x0:x1], 0, 255).astype(np.uint8)); b = io.BytesIO(); im.save(b, 'JPEG', quality=93)
    out['facePart_' + name] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    parts[name] = dict(x=x0 / S, y=y0 / S, w=(x1 - x0) / S, h=(y1 - y0) / S)
    print('%-6s rectangle x %d..%d, y %d..%d, %d KB' % (name, x0, x1, y0, y1, len(b.getvalue()) // 1024))
out['faceParts'] = parts
json.dump(out, open(os.path.join(ROOT, 'out', 'tex_faceparts.json'), 'w'))
