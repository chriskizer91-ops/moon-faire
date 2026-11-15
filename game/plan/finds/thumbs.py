# Prints {find id: small JPEG as a data URI} for the item pictures that exist. Argument: the art/items folder.
import sys, os, io, json, base64
from PIL import Image
names = {'cold-lantern-glass': 'cold-lantern-glass', 'cut-thread': 'cut-thread', 'warm-stone': 'warm-stone', 'hollow-amulet': 'hollow-amulet', 'keepers-charm': 'keepers-charm'}
out = {}
for fid, stem in names.items():
    p = os.path.join(sys.argv[1], stem + '.png')
    if not os.path.exists(p): continue
    im = Image.open(p).convert('RGB').resize((168, 168), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    out[fid] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
print(json.dumps(out))
