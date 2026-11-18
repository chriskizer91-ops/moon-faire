# crops.py: close-ups of the fair's pieces cut from their paintings (each thing's box in the layout, sent through the painting's camera)
import sys, os, json
sys.path.insert(0, '/home/claude/ow')
from rectify import camera, project
from PIL import Image
G = '/home/claude/chriskizer91-ops/moon-faire/game/'
ART = {'W1': 'art/pilot/W1.png', 'W2': 'art/world/W2.png', 'W3': 'art/world/W3.png', 'W4': 'art/world/W4.png', 'W5': 'art/world/W5.png', 'W6': 'art/world/W6.png', 'W7': 'art/world/W7.png'}
P = json.load(open('/home/claude/ow/data/places.json'))['places']
def box(pid, idxs, pad=0.22):
    K = camera(P[pid]['camera']); us, vs = [], []
    for i in idxs:
        s = P[pid]['solids'][i]; hw = s.get('r', s.get('w', 0.5) / 2) + 0.3; hd = s.get('r', s.get('d', 0.5) / 2) + 0.3; top = s.get('top', s.get('h', 2.4)) + s.get('y', 0)
        if s['kind'] in ('p-stall', 'stall'): hw += 0.3; hd += 0.5; top += 0.5
        if s['kind'] == 'well': top = 2.6
        if s['kind'] == 'wagon': top += 0.6
        for x in (s['x'] - hw, s['x'] + hw):
            for y in (0, top):
                for z in (s['z'] - hd, s['z'] + hd): u, v = project(K, x, y, z); us.append(u); vs.append(v)
    w, h = max(us) - min(us), max(vs) - min(vs)
    return [int(max(0, min(us) - w * pad)), int(max(0, min(vs) - h * pad)), int(min(1774, max(us) + w * pad)), int(min(887, max(vs) + h * pad))]
CROPS = {'red_tent': ('W1', [9]), 'gold_tent': ('W1', [13]), 'star_tent': ('W1', [12]), 'green_tent': ('W1', [16]), 'potion_stall': ('W1', [10]), 'moon_stall': ('W1', [11]), 'lamp_stall': ('W1', [14]), 'herb_stall': ('W1', [15]),
         'wagon': ('W1', [19]), 'well': ('W1', [0]), 'crates': ('W1', [20, 21]), 'post': ('W1', [5]),
         'big_top': ('W2', [1]), 'purple_tent': ('W2', [2]), 'booth': ('W2', [5]), 'oven_cart': ('W2', [12]), 'pie_cart': ('W2', [15]), 'bales': ('W2', [18]),
         'airship': ('W3', [0, 1, 2]), 'gate': ('W3', [9, 10]), 'brazier': ('W3', [12, 11])}
if __name__ == '__main__':
    out = '/home/claude/ow/prompts/refs'; ims = []
    for name, (pid, idxs) in CROPS.items():
        b = box(pid, idxs); im = Image.open(G + ART[pid]).convert('RGB').crop(b); im.save('%s/crop_%s.jpg' % (out, name), quality=90); ims.append((name, im)); print(name, pid, b)
    W = Image.new('RGB', (1500, 1000), (30, 30, 30)); x = y = 0; rowh = 0
    for name, im in ims:
        t = im.copy(); t.thumbnail((290, 240))
        if x + t.width > 1500: x = 0; y += rowh + 6; rowh = 0
        W.paste(t, (x, y)); x += t.width + 6; rowh = max(rowh, t.height)
    W.crop((0, 0, 1500, y + rowh)).save('/home/claude/ow/look/crops.jpg', quality=82)
