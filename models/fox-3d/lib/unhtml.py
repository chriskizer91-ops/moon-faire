# Pull the embedded images out of an uploaded flipbook page. The page is data only: nothing in it is run.
import sys, re, base64, os, io
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
s = open(src, 'r', errors='replace').read(); print('bytes', len(s))
t = re.search(r'<title>(.*?)</title>', s, re.S); print('title', (t.group(1)[:80] if t else None))
imgs = re.findall(r'data:image/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)', s); print('embedded images', len(imgs))
sizes = {}
for i, (ext, b) in enumerate(imgs):
    raw = base64.b64decode(b)
    try: im = Image.open(io.BytesIO(raw)); im.load()
    except Exception as e: print('bad', i, e); continue
    sizes.setdefault(im.size, []).append(i)
    im.convert('RGBA').save(os.path.join(out, 'f%03d.png' % i))
for k, v in sizes.items(): print(k, len(v), 'first', v[:3], 'last', v[-1])
names = re.findall(r'"(?:name|label|title|id)"\s*:\s*"([^"]{1,40})"', s); print('labels', len(names), sorted(set(names))[:40])
