# Frames in the HD flipbook are base64 AVIF in a JS object FR={...}. Extract them as data; nothing from the page is run.
import sys, re, json, base64, os, io
src, out = sys.argv[1], sys.argv[2]
s = open(src, 'r', errors='replace').read()
i = s.find('const FR='); j = s.find('};', i); FR = json.loads(s[i+9:j+1]); keys = list(FR.keys()); print('frames', len(keys), keys[:6], '...', keys[-4:])
pre = {}
for k in keys: pre.setdefault(re.sub(r'\d+$', '', k), []).append(k)
print({p: len(v) for p, v in pre.items()})
rest = s[:i] + s[j+2:]; m = re.search(r'const\s+(?:CLIPS|META|MOVES|SEQ|ANIMS?)\s*=\s*(\{.*?\}|\[.*?\]);', rest, re.S); print('meta', (m.group(0)[:700] if m else None))
ok = 0
try:
    from PIL import Image, features
    print('PIL avif support', features.check('avif') if hasattr(features, 'check') else None)
    im = Image.open(io.BytesIO(base64.b64decode(FR[keys[0]]))); im.load(); print('decoded', im.size, im.mode); ok = 1
except Exception as e: print('PIL cannot decode:', str(e)[:120])
json.dump(FR, open(os.path.join(out, 'frames.json'), 'w'))
