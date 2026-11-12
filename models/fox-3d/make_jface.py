# A test build: the Fox with the JESTER's face (Chris, 12 Nov: "take the face from the Jester and have them all look like the same person").
# Takes the Jester's head tables and her baked face pictures, keeps everything else of the Fox (body, hair, costume ears, glasses, choker, jawline, neck).
# Her face pictures are shifted to the Fox's skin tone so face, neck and chest agree.
# Writes variants/jface/40_head.js, out/fox_jface.js and out/fox_tex_jface.js.        run: python3 make_jface.py
import re, json, io, base64, glob, subprocess, numpy as np
from PIL import Image
W = '/home/claude/fox3d/'; J = '/home/claude/work/build/models/jester-3d/'
fx = open(W + 'src/40_head.js').read(); js = open(J + 'src/40_head.js').read()
def take(pat, flags=re.S):
    m = re.search(pat, js, flags); assert m, pat; return m.group(0)
for name in ('FACE_MID', 'NOSE', 'NOSE_W', 'FACE_V'):
    pat = r"const %s = \[\[.*?\]\];" % name; new = take(pat); assert re.search(pat, fx, re.S), name; fx = re.sub(pat, lambda m: new, fx, count=1, flags=re.S)
hr = take(r"HR = \{[^}]*\}"); fx = re.sub(r"HR = \{[^}]*\}", lambda m: hr, fx, count=1)
fx = re.sub(r"const LIPS = \{.*?\};", "const LIPS = {uy: 1.4644, ua: 0.0056, ly: 1.4512, la: 0.0044, chinY: 1.4300, cheekY: 1.4975, hollowY: 1.4670};", fx, count=1, flags=re.S)
for a, b in (("Math.pow(SIN9, 0.42)", "Math.pow(SIN9, 0.60)"), ("Math.pow(sp, 0.42)", "Math.pow(sp, 0.60)"), ("(1 - 0.08 * sm(0.5, 1.0, t))", "(1 - 0.16 * sm(0.5, 1.0, t))"),
             ("G(ax - 0.046, Y - LIPS.cheekY", "G(ax - 0.043, Y - LIPS.cheekY"), ("G(ax - 0.050, Y - LIPS.hollowY", "G(ax - 0.047, Y - LIPS.hollowY")):
    assert a in fx, a; fx = fx.replace(a, b)
open(W + 'variants/jface/40_head.js', 'w').write(fx)
files = sorted(glob.glob(W + 'src/[0-8]*.js')) + [W + 'src/90_api.js']
open(W + 'out/fox_jface.js', 'w').write(''.join(open(W + 'variants/jface/40_head.js' if f.endswith('40_head.js') else f).read() for f in files))
print(subprocess.run(['node', '--check', W + 'out/fox_jface.js'], capture_output=True, text=True).stderr[:300] or 'syntax ok')
def load(p): s = open(p).read(); return json.loads(s[s.index('{'):s.rindex('}') + 1])
F = load(W + 'out/fox_tex.js'); T = load(J + 'out/jester_tex.js'); rgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
gain = np.clip(rgb(F['skin']) / rgb(T['skin']), 0.75, 1.25); print('Jester skin', T['skin'], 'Fox skin', F['skin'], 'tone gain', np.round(gain, 3))
def tone(uri):
    head, b = uri.split(',', 1); im = Image.open(io.BytesIO(base64.b64decode(b))); a = np.asarray(im.convert('RGBA')).astype(float); a[..., :3] = np.clip(a[..., :3] * gain, 0, 255); bb = io.BytesIO()
    if im.mode == 'RGBA': Image.fromarray(a.astype(np.uint8), 'RGBA').save(bb, 'WEBP', quality=90, method=6); return 'data:image/webp;base64,' + base64.b64encode(bb.getvalue()).decode()
    Image.fromarray(a[..., :3].astype(np.uint8)).save(bb, 'JPEG', quality=90); return 'data:image/jpeg;base64,' + base64.b64encode(bb.getvalue()).decode()
N = dict(F)
for k in ('faceSide', 'faceSideA', 'faceSideWin'): N.pop(k, None)
for k in ('face', 'faceSide'):
    if k in T: N[k] = tone(T[k])
for k in ('faceSideA', 'faceSideWin', 'layout', 'faceEyes'):
    if k in T: N[k] = T[k]
N['faceParts'] = {n: dict(p, src=tone(p['src'])) for n, p in T['faceParts'].items()}
N['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.clip(rgb(T['skinJaw']) * gain, 0, 255))
open(W + 'out/fox_tex_jface.js', 'w').write('window.FOX_TEX=' + json.dumps(N) + ';'); print('keys', [k for k in N if k != 'body'], 'layout', N['layout'])
