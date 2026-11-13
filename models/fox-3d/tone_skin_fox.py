# tone_skin_fox.py: Chris, 12 Nov: "repaint her skin to match her face skin tone, and her physical form also."
# Shifts the skin in her painted chest and back (the 'body' picture, from B1 and B4) and in her painted hands (from D1) to the tone of her new face.
# Only skin-coloured pixels move; cloth, nails' shine and shadows keep their own colour relationships. Sets the neck's lower tone to match.
# Run after the other bakes: python3 -I tone_skin_fox.py && python3 make_jface.py
import json, io, base64, numpy as np
from PIL import Image
from scipy import ndimage as ndi
W = '/home/claude/fox3d/'; OUT = W + 'out/fox_tex_own.js'; raw = open(OUT).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
face = np.array([int(T['skin'][i:i + 2], 16) for i in (1, 3, 5)], float)
def retone(key, q=90):
    head, b = T[key].split(',', 1); a = np.asarray(Image.open(io.BytesIO(base64.b64decode(b))).convert('RGB')).astype(np.float32); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    sk = (R > 150) & (R > G) & (G > B) & (R - B > 25) & (R - B < 130) & (G / np.maximum(R, 1) > 0.55) & (G / np.maximum(R, 1) < 0.86)
    if sk.sum() < 500: print(key, 'no skin found'); return
    med = np.median(a[sk], 0); gain = np.clip(face / med, 0.8, 1.2); m = ndi.gaussian_filter(sk.astype(np.float32), 1.5)[..., None]
    out = np.clip(a * (1 + (gain - 1) * m), 0, 255).astype(np.uint8); bb = io.BytesIO(); Image.fromarray(out).save(bb, 'JPEG', quality=q); T[key] = 'data:image/jpeg;base64,' + base64.b64encode(bb.getvalue()).decode()
    print(key, 'skin was', med.astype(int), 'face is', face.astype(int), 'gain', np.round(gain, 3))
retone('body'); retone('hands'); T['skinChest'] = T['skin']
js = 'window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); open(W + 'variants/ownface/fox_tex_own.js', 'w').write(js)
