# bake_patch_fox.py: her patchwork, straight from the two swatch sheets (F9, F10): 25 squares each, used as repeating cloth.
# Writes 'patch' and 'patch2' into out/fox_tex_own.js.      run: python3 -I bake_patch_fox.py && python3 make_jface.py
import json, io, base64
from PIL import Image
W = '/home/claude/fox3d/'; OUT = W + 'out/fox_tex_own.js'; raw = open(OUT).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
for key, name, size in (('patch', 'F9', 1024), ('patch2', 'F10', 768)):
    b = io.BytesIO(); Image.open(W + 'refs/%s.png' % name).convert('RGB').resize((size, size), Image.LANCZOS).save(b, 'JPEG', quality=86); T[key] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(); print(key, len(b.getvalue()) // 1024, 'KB')
js = 'window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); open(W + 'variants/ownface/fox_tex_own.js', 'w').write(js)
