# bake_boot_fox.py: a tile of her boot leather in the colours and grain of painting E1 (outer side).
# A straight cut of the painting repeated showed as a pattern, so: soft worn blotches are made fresh (they wrap, so the tile has no seam), in the dark and
# worn tones measured from the painting's shaft, and the painting's own fine grain is laid over them.
# Writes 'bootLeather' into out/fox_tex_own.js.      run: python3 -I bake_boot_fox.py && python3 make_jface.py
import json, io, base64, numpy as np
from PIL import Image, ImageOps
from scipy import ndimage as ndi
W = '/home/claude/fox3d/'; sw = np.asarray(Image.open(W + 'refs/E1.png').convert('RGB').crop((185, 330, 375, 520)).resize((256, 256), Image.LANCZOS)).astype(np.float32)
lum = sw.mean(-1); dark = sw[lum < np.percentile(lum, 25)].mean(0); worn = sw[lum > np.percentile(lum, 85)].mean(0); print('dark', dark.astype(int), 'worn', worn.astype(int))
rng = np.random.default_rng(11); n = ndi.gaussian_filter(rng.random((512, 512)), 30, mode='wrap') + 0.5 * ndi.gaussian_filter(rng.random((512, 512)), 9, mode='wrap'); n = (n - n.min()) / (n.max() - n.min()); n = np.clip((n - 0.25) / 0.6, 0, 1) ** 1.3
base = dark[None, None] * (1 - n[..., None]) + worn[None, None] * n[..., None]
im = Image.fromarray(sw.astype(np.uint8)); t = Image.new('RGB', (512, 512)); t.paste(im, (0, 0)); t.paste(ImageOps.mirror(im), (256, 0)); t.paste(ImageOps.flip(im), (0, 256)); t.paste(ImageOps.flip(ImageOps.mirror(im)), (256, 256))
g = np.asarray(t).astype(np.float32); grain = g - np.stack([ndi.gaussian_filter(g[..., c], 4, mode='wrap') for c in range(3)], -1)
out = Image.fromarray(np.clip(base + grain * 0.9, 0, 255).astype(np.uint8)); out.save(W + 'shots/bake_boot.jpg', quality=88)
b = io.BytesIO(); out.save(b, 'JPEG', quality=88); OUT = W + 'out/fox_tex_own.js'; raw = open(OUT).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
T['bootLeather'] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
js = 'window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); open(W + 'variants/ownface/fox_tex_own.js', 'w').write(js); print('bootLeather', len(b.getvalue()) // 1024, 'KB')
