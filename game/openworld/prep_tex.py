# prep_tex.py: every picture the open world is drawn with, cut from Chris's own paintings.
#  - the ground's detail: patches of heather, turf, earth and rock cut from the moor and fair paintings, seen from straight above
#    (rectify.py), their painted lamp-light evened out, and made to repeat without a seam;
#  - the drystone wall's face, from the Last Lantern;  - Auros, from the standing stones' sky;
#  - the painted world map with the places' own pictures (tents, stones, lantern, arch, tor, tower) painted out, as the ground's colour
#    from far off (the places are built in 3D now, so their little pictures would lie flat on the ground);
#  - the seven paintings themselves, to be laid back onto their places.
# usage: python3 -I prep_tex.py <game folder> <out folder>
import sys, os, io, json, math, base64
import numpy as np, cv2
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rectify import topdown
G, OUT = sys.argv[1], sys.argv[2]
P = json.load(open(os.path.join(OUT, 'places.json')))['places']
ART = {'W1': 'art/pilot/W1.png', 'W2': 'art/world/W2.png', 'W3': 'art/world/W3.png', 'W4': 'art/world/W4.png', 'W5': 'art/world/W5.png', 'W6': 'art/world/W6.png', 'W7': 'art/world/W7.png'}
def save(im, name, q=86):
    im.save(os.path.join(OUT, name), 'WEBP', quality=q, method=6); print(name, im.size, os.path.getsize(os.path.join(OUT, name)) // 1024, 'KB')

def even(a, sigma):                       # take out the painted light's slow changes (a lamp's warm pool), keep the texture
    a = a.astype(np.float32); low = cv2.GaussianBlur(a, (0, 0), sigma); m = a.reshape(-1, 3).mean(0)
    return np.clip(a / np.maximum(low, 4) * m, 0, 255)
def seamless(a):                          # a square patch made to repeat: its middle, faded into itself shifted by half at the edges
    n = a.shape[0]; b = np.roll(np.roll(a, n // 2, 0), n // 2, 1); m = a.reshape(-1, 3).mean(0)
    t = np.sin(np.pi * (np.arange(n) + 0.5) / n) ** 2; w = np.minimum.outer(t, t)[..., None]
    w = np.clip((w - 0.08) / 0.84, 0, 1); w = w * w * (3 - 2 * w)
    out = m + (w * (a - m) + (1 - w) * (b - m)) / np.sqrt(w * w + (1 - w) ** 2)
    return np.clip(out, 0, 255)
def tile(pid, x0, z0, size_m, res=0.03, sigma=40, out_px=512):
    im = topdown(os.path.join(G, ART[pid]), P[pid]['camera'], x0, x0 + size_m, z0, z0 + size_m, res)
    a = even(np.asarray(im), sigma); a = seamless(a)
    return Image.fromarray(a.astype(np.uint8)).resize((out_px, out_px), Image.LANCZOS)
def mix(*tiles):                          # two patches of the same ground, half and half in a soft noise, so one patch's quirks repeat less
    a = np.asarray(tiles[0]).astype(np.float32); b = np.asarray(tiles[1]).astype(np.float32); n = a.shape[0]
    rng = np.random.default_rng(7); w = gaussian_filter(rng.random((n, n)).astype(np.float32), n / 10, mode='wrap')
    w = np.clip((w - w.mean()) / (w.std() * 3) + 0.5, 0, 1)[..., None]
    return Image.fromarray(np.clip(a * w + b * (1 - w), 0, 255).astype(np.uint8))

# patches: (place, west edge x, north edge z, metres square). Chosen by eye on look/top_*.jpg, inside each painting's frame
save(mix(tile('W5', -10.5, -10.2, 4.0, 0.015), tile('W6', -8.8, 4.5, 3.4, 0.015)), 'tex_heather.webp')
save(mix(tile('W7', -2.2, 0.2, 5.2, 0.02), tile('W5', -3.2, -6.4, 4.2, 0.02)), 'tex_grass.webp')
save(mix(tile('W5', -2.8, -2.6, 4.4, 0.02), tile('W5', 1.2, -3.8, 3.6, 0.02)), 'tex_earth.webp')
save(tile('W3', -3.0, -3.8, 6.0, 0.02), 'tex_fair.webp')
# rock: from the hollow's right wall as painted (a face seen side on, so straight from the painting)
w7 = np.asarray(Image.open(os.path.join(G, ART['W7'])).convert('RGB'))
rk = w7[190:190 + 180, 1590:1590 + 180]; rk = seamless(even(rk, 40)); save(Image.fromarray(rk.astype(np.uint8)).resize((512, 512), Image.LANCZOS), 'tex_rock.webp')
# the drystone wall's face: the Last Lantern's right-hand run of wall, straight from the painting, made to repeat along its length
w4 = np.asarray(Image.open(os.path.join(G, ART['W4'])).convert('RGB')).astype(np.float32)
wl = w4[268:268 + 120, 1100:1100 + 480]; wl = even(wl, 60)
n = wl.shape[1]; t = np.sin(np.pi * (np.arange(n) + 0.5) / n) ** 2; w = np.clip((t - 0.1) / 0.8, 0, 1)[None, :, None]; b = np.roll(wl, n // 2, 1); m = wl.reshape(-1, 3).mean(0)
wl = np.clip(m + (w * (wl - m) + (1 - w) * (b - m)) / np.sqrt(w * w + (1 - w) ** 2), 0, 255)
save(Image.fromarray(wl.astype(np.uint8)).resize((512, 128), Image.LANCZOS), 'tex_wall.webp')
# Auros, from the standing stones' sky: the painted moon, with the sky round it made see-through
w5 = np.asarray(Image.open(os.path.join(G, ART['W5'])).convert('RGB')).astype(np.float32)
cx, cy, r = int(0.105 * 1774), int(0.072 * 887), 64
mc = w5[max(0, cy - r):cy + r, cx - r:cx + r]; lum = mc.mean(2); sky = np.percentile(lum, 20)
alpha = np.clip((lum - sky - 30) / 60, 0, 1); yy, xx = np.mgrid[0:mc.shape[0], 0:mc.shape[1]]
mrgba = np.dstack([mc, alpha * 255]).astype(np.uint8); Image.fromarray(mrgba, 'RGBA').resize((128, 128), Image.LANCZOS).save(os.path.join(OUT, 'moon.png')); print('moon.png')

# the world map, its places' pictures painted out
mp = cv2.cvtColor(cv2.imread(os.path.join(G, 'world/map/map.png')), cv2.COLOR_BGR2RGB)
mask = np.zeros(mp.shape[:2], np.uint8)
for (x0, y0, x1, y1) in [(232, 604, 668, 782),              # the fair
                         (800, 630, 905, 722),              # the Last Lantern and its dead post
                         (1030, 520, 1150, 625),            # the standing stones
                         (1300, 630, 1420, 760),            # the arch, the pool's trees, the camp
                         (640, 230, 750, 315),              # the tor's rocks
                         (1320, 140, 1370, 225)]:           # the dead tower
    cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
clean = cv2.inpaint(mp, mask, 9, cv2.INPAINT_TELEA)
# the painted-out patches are smooth: give them back grain, taken from a plain stretch of the moor's edge and laid over them repeated
grain = mp.astype(np.float32) - cv2.GaussianBlur(mp.astype(np.float32), (0, 0), 3)
src = grain[440:440 + 96, 420:420 + 96]; reps = np.tile(src, (mp.shape[0] // 96 + 1, mp.shape[1] // 96 + 1, 1))[:mp.shape[0], :mp.shape[1]]
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 6)[..., None]
clean = np.clip(clean.astype(np.float32) * (1 - soft) + cv2.medianBlur(clean, 21).astype(np.float32) * soft + reps * soft, 0, 255).astype(np.uint8)
save(Image.fromarray(clean), 'macro.webp', 88)
Image.fromarray(clean).resize((768, 512)).save(os.path.join(os.path.dirname(OUT), 'look', 'macro_small.jpg'), quality=85)
# the seven paintings, to lay back onto their places
for pid, f in ART.items(): save(Image.open(os.path.join(G, f)).convert('RGB'), 'paint_%s.webp' % pid, 86)

# Chris's Round 1 pictures (round1/): the ground, the wall, the fair's materials and the four tents' skins. Each one present replaces the
# cut patch saved above (or, for a tent, the painting laid on it); a missing one leaves that as it was. See prep_round1.py.
from prep_round1 import round1
round1(OUT, os.path.join(os.path.dirname(OUT), 'look'))
