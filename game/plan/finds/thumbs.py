# Prints {find id: small JPEG as a data URI} for the item pictures that exist.
# Arguments: the art/items folder, then the find ids.
import sys, os, io, json, base64
from PIL import Image
out = {}
for fid in sys.argv[2:]:
    p = os.path.join(sys.argv[1], fid + '.png')
    if not os.path.exists(p): continue
    im = Image.open(p).convert('RGB').resize((168, 168), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    out[fid] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
print(json.dumps(out))
