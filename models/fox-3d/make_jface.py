# THE MAIN BUILD since 12 Nov: the Fox wears the JESTER's face. Chris compared the two and chose it ("continue with the rest of the Fox model using the Jester face").
# The Fox's own face (from her sheet C3) is kept in variants/ownface/ in case he wants it back.
# Takes the Jester's head tables and her baked face pictures, keeps everything else of the Fox (body, hair, costume ears, glasses, choker, jawline, neck).
# Her face pictures are shifted to the Fox's skin tone so face, neck and chest agree.
# Reads variants/ownface/40_head.js (the Fox's head code with her own tables) and out/fox_tex_own.js (her own bake: body, skin, chest tone).
# Writes src/40_head.js and out/fox_tex.js.        run, after bake_fox.py:  cp out/fox_tex.js out/fox_tex_own.js && python3 make_jface.py && ./build.sh
import re, json, io, base64, glob, subprocess, numpy as np
from PIL import Image
W = '/home/claude/fox3d/'; J = '/home/claude/work/build/models/jester-3d/'
HEAD = 'fox'          # whose HEAD SHAPE: 'fox' = her own tables (fitted to her profile), with her own painting; 'jester' = the Jester's tables (then PAINT below chooses the painting)
if HEAD == 'fox':
    # Round 5 (12 Nov, evening): her new face set arrived, and Chris wants her to be her own character, not the Jester.
    import shutil; shutil.copy(W + 'variants/ownface/40_head.js', W + 'src/40_head.js'); shutil.copy(W + 'out/fox_tex_own.js', W + 'out/fox_tex.js'); print('her own head shape and her own painting'); raise SystemExit
fx = open(W + 'variants/ownface/40_head.js').read(); js = open(J + 'src/40_head.js').read()
def take(pat, flags=re.S):
    m = re.search(pat, js, flags); assert m, pat; return m.group(0)
for name in ('FACE_MID', 'NOSE', 'NOSE_W', 'FACE_V'):
    pat = r"const %s = \[\[.*?\]\];" % name; new = take(pat); assert re.search(pat, fx, re.S), name; fx = re.sub(pat, lambda m: new, fx, count=1, flags=re.S)
hr = take(r"HR = \{[^}]*\}"); fx = re.sub(r"HR = \{[^}]*\}", lambda m: hr, fx, count=1)
fx = re.sub(r"const LIPS = \{.*?\};", "const LIPS = {uy: 1.4644, ua: 0.0056, ly: 1.4512, la: 0.0044, chinY: 1.4300, cheekY: 1.4975, hollowY: 1.4670};", fx, count=1, flags=re.S)
for a, b in (("Math.pow(SIN9, 0.42)", "Math.pow(SIN9, 0.60)"), ("Math.pow(sp, 0.42)", "Math.pow(sp, 0.60)"), ("(1 - 0.08 * sm(0.5, 1.0, t))", "(1 - 0.16 * sm(0.5, 1.0, t))"),
             ("G(ax - 0.046, Y - LIPS.cheekY", "G(ax - 0.043, Y - LIPS.cheekY"), ("G(ax - 0.050, Y - LIPS.hollowY", "G(ax - 0.047, Y - LIPS.hollowY")):
    assert a in fx, a; fx = fx.replace(a, b)
open(W + 'variants/jface/40_head.js', 'w').write(fx); open(W + 'src/40_head.js', 'w').write(fx)
def load(p): s = open(p).read(); return json.loads(s[s.index('{'):s.rindex('}') + 1])
F = load(W + 'out/fox_tex_own.js'); T = load(J + 'out/jester_tex.js'); rgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
gain = np.clip(rgb(F['skin']) / rgb(T['skin']), 0.75, 1.25); print('Jester skin', T['skin'], 'Fox skin', F['skin'], 'tone gain', np.round(gain, 3))
def tone(uri):
    head, b = uri.split(',', 1); im = Image.open(io.BytesIO(base64.b64decode(b))); a = np.asarray(im.convert('RGBA')).astype(float); a[..., :3] = np.clip(a[..., :3] * gain, 0, 255); bb = io.BytesIO()
    if im.mode == 'RGBA': Image.fromarray(a.astype(np.uint8), 'RGBA').save(bb, 'WEBP', quality=90, method=6); return 'data:image/webp;base64,' + base64.b64encode(bb.getvalue()).decode()
    Image.fromarray(a[..., :3].astype(np.uint8)).save(bb, 'JPEG', quality=90); return 'data:image/jpeg;base64,' + base64.b64encode(bb.getvalue()).decode()
PAINT = 'fox'          # whose PAINTING goes on the Jester's head: 'fox' (her own face from sheet C3, Chris 12 Nov: "use the 3D model from the Jester and put a new painting on it") or 'jester'
N = dict(F)
if PAINT == 'jester':
    for k in ('faceSide', 'faceSideA', 'faceSideWin'): N.pop(k, None)
    for k in ('face', 'faceSide'):
        if k in T: N[k] = tone(T[k])
    for k in ('faceSideA', 'faceSideWin', 'layout', 'faceEyes'):
        if k in T: N[k] = T[k]
    N['face'] = clear_cap_mark(N['face'])
    N['faceParts'] = {n: dict(p, src=tone(p['src'])) for n, p in T['faceParts'].items()}
    N['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.clip(rgb(T['skinJaw']) * gain, 0, 255))
else:
    # The Fox's painted face is already laid out on the Jester's lines: eyes at 1.5246, lip line 0.066 below, under the nose and chin within 1.5 mm.
    # Only her eyes are 1 mm further apart each side. Squeeze her picture and her face states sideways by that much, so each painted eye sits on its sculpted socket.
    k = T['layout']['eyeX'] / F['layout']['eyeX']; print('sideways fit of her painting to the Jester head: x %.4f' % k)
    im = Image.open(io.BytesIO(base64.b64decode(F['face'].split(',', 1)[1]))).convert('RGB'); w, h = im.size
    im = im.transform((w, h), Image.AFFINE, (1 / k, 0, (w / 2) * (1 - 1 / k), 0, 1, 0), Image.BICUBIC); a = np.asarray(im).copy(); m = int(np.ceil(w / 2 * (1 - k))) + 2; a[:, :m] = a[:, m:m + 1]; a[:, -m:] = a[:, -m - 1:-m]
    bb = io.BytesIO(); Image.fromarray(a).save(bb, 'JPEG', quality=92); N['face'] = 'data:image/jpeg;base64,' + base64.b64encode(bb.getvalue()).decode()
    N['layout'] = T['layout']; N['faceEyes'] = [[round(0.5 + (x - 0.5) * k, 4), y] for x, y in F['faceEyes']]
    N['faceParts'] = {n: dict(p, x=round(0.5 + (p['x'] - 0.5) * k, 4), w=round(p['w'] * k, 4)) for n, p in F['faceParts'].items()}
open(W + 'out/fox_tex.js', 'w').write('window.FOX_TEX=' + json.dumps(N) + ';'); print('keys', [k for k in N if k != 'body'], 'layout', N['layout'])
