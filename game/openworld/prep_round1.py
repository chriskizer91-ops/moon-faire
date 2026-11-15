# prep_round1.py: Chris's "Round 1" pictures (round1/), made ready for the page. Called at the end of prep_tex.py, after the old cut patches
# are saved, so a Round 1 picture that is missing simply leaves the old patch (or, for a tent, the painting) in its place.
#  - the ground: heather, turf, track, fair ground, rock and the drystone wall, 1024 px, their edges matched so they repeat cleanly;
#  - the fair's own materials for the unseen sides: cream awning cloth, wood planks, the red and cream striped canvas;
#  - the fair square's four tents: their door sides and roofs (grey background cut away) in one picture (tent_skin.webp), and for each
#    tent a band that wraps round its walls (tent_wrap.webp): its own canvas, with the top valance and the bottom border cut from its
#    door picture and made to repeat. tents.json says where everything is.
# usage: python3 -I prep_round1.py <out folder>     (or from prep_tex.py)
import sys, os, json, glob
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); R1 = os.path.join(HERE, 'round1')
def find(name):
    f = glob.glob(os.path.join(R1, '*', name)); return f[0] if f else None
def load(name):
    f = find(name); return None if not f else np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
def save(a, out, name, q=84, mode='RGB'):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), mode); p = os.path.join(out, name); im.save(p, 'WEBP', quality=q, method=6)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB')

def match_edges(a, axes=(0, 1), band=None):
    # a painted tile whose opposite edges are slightly different in colour: spread half the difference back from each edge, smoothly
    # (only the slow colour change; the brushwork is untouched), so the edges meet when it repeats
    a = a.copy()
    for ax in axes:
        n = a.shape[ax]; b = band or n // 6
        e0 = np.take(a, range(0, 3), axis=ax).mean(ax); e1 = np.take(a, range(n - 3, n), axis=ax).mean(ax)
        d = cv2.GaussianBlur((e1 - e0)[None], (0, 0), 6)[0]                     # along the edge, smoothed
        t = np.clip(1 - np.arange(b) / b, 0, 1); t = t * t * (3 - 2 * t)
        sl0 = [slice(None)] * 3; sl0[ax] = slice(0, b); sl1 = [slice(None)] * 3; sl1[ax] = slice(n - b, n)
        shp = [1, 1, 1]; shp[ax] = b
        a[tuple(sl0)] += (d[None] if ax == 0 else d[:, None]) * 0.5 * t.reshape(shp)
        a[tuple(sl1)] -= (d[None] if ax == 0 else d[:, None]) * 0.5 * t[::-1].reshape(shp)
    return np.clip(a, 0, 255)
def seam_score(a):
    return [round(float(np.abs(a[:, 0] - a[:, -1]).mean() / max(np.abs(np.diff(a, axis=1)).mean(), 1e-3)), 2),
            round(float(np.abs(a[0] - a[-1]).mean() / max(np.abs(np.diff(a, axis=0)).mean(), 1e-3)), 2)]
def resize(a, w, h):
    return cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA if w < a.shape[1] else cv2.INTER_CUBIC)

def period_crop(a, ax):
    # a regular pattern whose repeat does not land on the picture's edge (the blue stars: a wider gap at the join): find the pattern's own
    # period along that axis and keep a whole number of periods
    prof = a.mean(2).mean(1 - ax); prof = prof - prof.mean(); n = len(prof)
    ac = np.array([np.dot(prof[:n - k], prof[k:]) / (n - k) for k in range(n // 2)])
    lo = 40; k = lo + int(np.argmax(ac[lo:])); m = n // k
    # refine: the best period near k (sub-pixel is not needed at 1254 px)
    start = (n - m * k) // 2
    return np.take(a, range(start, start + m * k), axis=ax), k, m

def round1(OUT, LOOK=None):
    LOOK = LOOK or os.path.join(HERE, 'look')
    made = {}
    # ---- the ground: (round 1 file, the page's name, its width in metres) ----
    sheet = []
    for src, name in [('ground_heather.png', 'heather'), ('ground_turf.png', 'grass'), ('ground_track.png', 'earth'), ('ground_fair.png', 'fair'), ('ground_rock.png', 'rock')]:
        a = load(src)
        if a is None: print('round 1:', src, 'missing, the cut patch stays'); continue
        s0 = seam_score(a); a = match_edges(a); a = resize(a, 1024, 1024); s1 = seam_score(a)
        save(a, OUT, 'tex_%s.webp' % name, 86); made[name] = True; print('   seams (edge step / mean step, x and y)', s0, '->', s1)
        sheet.append(np.tile(resize(a, 256, 256), (2, 2, 1)))
    a = load('wall_drystone.png')
    if a is not None:
        s0 = seam_score(a); a = match_edges(a, axes=(1,)); a = resize(a, 1024, 683); save(a, OUT, 'tex_wall.webp', 84); made['wall'] = True
        print('   wall seams', s0, '->', seam_score(a)); sheet.append(np.tile(resize(a, 256, 171), (1, 2, 1)))
    # ---- the fair's materials, for the sides the paintings cannot see ----
    for src, name in [('cloth_cream_awning.png', 'mat_awning'), ('wood_planks.png', 'mat_wood'), ('cloth_red_cream_stripe.png', 'mat_stripe')]:
        a = load(src)
        if a is None: print('round 1:', src, 'missing'); continue
        a = match_edges(a, axes=(0,) if 'stripe' in name else (0, 1)); save(resize(a, 512, 512), OUT, name + '.webp', 84)       # stripes: their edge is a stripe's edge already; made[name] = True; sheet.append(np.tile(resize(a, 256, 256), (2, 2, 1)))
    if sheet:
        w = max(s.shape[1] for s in sheet); rows = [np.pad(s, ((0, 520 - s.shape[0]), (0, w - s.shape[1]), (0, 0))) for s in sheet]
        grid = np.concatenate([np.concatenate(rows[i:i + 3] + [np.zeros_like(rows[0])] * (3 - len(rows[i:i + 3])), 1) for i in range(0, len(rows), 3)], 0)
        Image.fromarray(grid.astype(np.uint8)).save(os.path.join(LOOK, 'r1_tiled.jpg'), quality=85)
    made['tents'] = tents(OUT, LOOK)
    return made

# ---- the four tents of the fair square ----
# for each: its round 1 name, its canvas, the canvas's width in metres on the tent, and where the door picture's bands are (rows of the
# 1536 x 1024 picture: the valance's solid part ends at val, its tassels hang to tas, the bottom border starts at bot) and the stretch of
# plain side wall the bands are cut from (x0..x1)
TENTS = [
    dict(id='red', cloth='cloth_red_cream_stripe.png', matW=3.8, val=226, tas=274, bot=866, x0=60, x1=560),
    dict(id='gold', cloth='cloth_gold_brocade.png', matW=2.6, val=218, tas=218, bot=686, x0=60, x1=530),
    dict(id='star', cloth='cloth_blue_stars.png', matW=2.4, val=206, tas=256, bot=822, x0=118, x1=480),
    dict(id='green', cloth='cloth_green_gold_leaf.png', matW=2.8, val=246, tas=322, bot=812, x0=44, x1=495),
]
SKIN_W, SKIN_H, DOOR_W, DOOR_H, ROOF = 2048, 1536, 1024, 512, 512
STRIP_W, STRIP_H, PAD = 1024, 512, 16

def cutout(a):
    # the plain grey background, flooded in from the picture's edge, made see-through
    bg = np.median(np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)]), 0)
    d = np.abs(a - bg).max(2); near = (d < 16).astype(np.uint8)
    h, w = near.shape; m = np.zeros((h + 2, w + 2), np.uint8); fill = near.copy()
    for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if fill[y, x] == 1: cv2.floodFill(fill, m, (x, y), 2)
    outside = (fill == 2).astype(np.float32)
    alpha = 1 - cv2.GaussianBlur(outside, (0, 0), 1.0)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    return alpha, bg
def bleed(rgb, alpha):
    # colour under the see-through parts taken from the nearest opaque colour, so the picture's smaller copies (mipmaps) have no grey rim
    out = rgb.copy(); acc = np.zeros_like(rgb); wsum = np.zeros(alpha.shape, np.float32)
    for s in (2, 6, 18, 54):
        pa = cv2.GaussianBlur(rgb * alpha[..., None], (0, 0), s); wa = cv2.GaussianBlur(alpha, (0, 0), s)
        take = (wsum < 1e-3) & (wa > 0.02); acc[take] = pa[take] / wa[take][:, None]; wsum[take] = 1
    fill = acc; fill[wsum < 1e-3] = (rgb * alpha[..., None]).sum((0, 1)) / max(alpha.sum(), 1)
    return out * alpha[..., None] + fill * (1 - alpha[..., None])
def bbox(alpha):
    ys, xs = np.where(alpha > 0.5); return xs.min(), xs.max() + 1, ys.min(), ys.max() + 1

def band_tile(b, ppm_x, metres, out_w):
    # a band cut from the door picture, made to repeat: its own period (autocorrelation of its columns), a whole number of periods,
    # the last few columns faded into the first; then repeated a whole number of times across the strip
    g = b.mean(2); g = g - g.mean(0, keepdims=True); prof = g.T; n = prof.shape[0]
    ac = np.array([(prof[:n - k] * prof[k:]).mean() for k in range(n // 2)]); lo = 60
    k = lo + int(np.argmax(ac[lo:n // 2])) if n // 2 > lo + 4 else n - 24
    m = max(1, (n - 24) // k); L = k * m; F = min(24, n - L)
    seg = b[:, :L].copy()
    if F > 4:
        t = (np.arange(F) / F)[None, :, None]; seg[:, :F] = b[:, L:L + F] * (1 - t) + b[:, :F] * t
    seg_m = L / ppm_x; reps = max(1, int(round(metres / seg_m)))
    one = resize(seg, max(8, int(round(out_w / reps))), b.shape[0])
    tiled = np.tile(one, (1, reps + 1, 1))[:, :out_w]
    return resize(tiled, out_w, b.shape[0]) if tiled.shape[1] != out_w else tiled, k, reps

def tents(OUT, LOOK):
    skin = np.zeros((SKIN_H, SKIN_W, 4), np.float32); wrap = np.zeros((4 * STRIP_H, STRIP_W, 3), np.float32); info = {}
    for i, T in enumerate(TENTS):
        door, roof, cloth = load('skin_%s_tent_door.png' % T['id']), load('skin_%s_tent_roof.png' % T['id']), load(T['cloth'])
        if door is None or roof is None or cloth is None: print('round 1: the', T['id'], 'tent is missing a picture; it keeps the painting'); continue
        # the door side, cut out, cropped to the tent's wall (top of the valance to the ground), into its place in the skin picture
        al, _ = cutout(door); x0, x1, y0, y1 = bbox(al); y0 += 3; y1 -= 3                  # off the soft rim
        rgb = bleed(door, al)
        dx, dy = (i % 2) * DOOR_W, (i // 2) * DOOR_H
        crop = np.dstack([rgb[y0:y1, x0:x1], al[y0:y1, x0:x1, None] * 255])
        skin[dy:dy + DOOR_H, dx:dx + DOOR_W] = resize(crop, DOOR_W, DOOR_H)
        # the roof, seen from above: round roofs keep their circle (the rest see-through), square roofs fill the square
        ra, _ = cutout(roof); rrgb = bleed(roof, ra); rx, ry = i * ROOF, 2 * DOOR_H
        skin[ry:ry + ROOF, rx:rx + ROOF] = resize(np.dstack([rrgb, ra[..., None] * 255]), ROOF, ROOF)
        # the band round the walls: the canvas, coloured like the door picture's own wall, with the valance and the bottom border on it
        H = y1 - y0; side = rgb[y0:y1, T['x0']:T['x1']]
        if T['id'] == 'star': cloth, _, _ = period_crop(cloth, 1); cloth, _, _ = period_crop(cloth, 0)
        body_rows = side[(T['tas'] - y0) + 8:(T['bot'] - y0) - 8]
        c_mean = cloth.reshape(-1, 3).mean(0); b_mean = body_rows.reshape(-1, 3).mean(0); gain = np.clip(b_mean / np.maximum(c_mean, 1), 0.55, 1.8)
        door_aspect = (x1 - x0) / H                                  # door picture width / wall height
        info[T['id']] = dict(index=i, doorAspect=round(float(door_aspect), 4), door=[dx / SKIN_W, dy / SKIN_H, DOOR_W / SKIN_W, DOOR_H / SKIN_H],
                             roof=[rx / SKIN_W, ry / SKIN_H, ROOF / SKIN_W, ROOF / SKIN_H], strip=[i * STRIP_H / (4 * STRIP_H), STRIP_H / (4 * STRIP_H), PAD / (4 * STRIP_H)],
                             matW=T['matW'], gain=[round(float(g), 3) for g in gain])
        WALL = {'red': 2.2, 'gold': 2.2, 'star': 2.3, 'green': 2.1}[T['id']]
        ppm = H / WALL                                               # door picture pixels per metre on this tent
        hgt = STRIP_H - 2 * PAD
        yy = (np.arange(hgt) + 0.5) / hgt * WALL                     # metres up from the top of the wall, down the strip
        xx = (np.arange(STRIP_W) + 0.5) / STRIP_W * T['matW']
        cx = (xx / T['matW'] * cloth.shape[1]).astype(np.float32); cy = ((yy / T['matW'] * cloth.shape[0]) % cloth.shape[0]).astype(np.float32)
        mx, my = np.meshgrid(cx, cy); body = cv2.remap(cloth, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP) * gain
        strip = body.copy()
        sideH = resize(side, side.shape[1], hgt)                     # the side wall, its rows matched to the strip's
        r_val, r_tas, r_bot = [int(round((T[k] - y0) / H * hgt)) for k in ('val', 'tas', 'bot')]
        top, kt, rt = band_tile(sideH[:r_tas + 6], ppm, T['matW'], STRIP_W)
        bot, kb, rb = band_tile(sideH[r_bot - 6:], ppm, T['matW'], STRIP_W)
        # where the valance's tassels hang over the canvas: their gold, found by colour
        hsv = cv2.cvtColor(np.clip(top, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
        gold = ((hsv[..., 0] > 8) & (hsv[..., 0] < 30) & (hsv[..., 1] > 110) & (hsv[..., 2] > 95)).astype(np.float32)
        gold = cv2.GaussianBlur(cv2.dilate(gold, np.ones((3, 3), np.uint8)), (0, 0), 1.2)
        rr = np.arange(top.shape[0])[:, None].astype(np.float32)
        at = np.clip((r_val + 3 - rr) / 6, 0, 1) * np.ones_like(gold)                         # the solid valance, a soft lower edge
        hang = (rr >= r_val - 3) * np.clip((r_tas + 2 - rr) / 5, 0, 1)                      # the tassels below it, by their gold
        at = np.maximum(at, gold * hang)
        strip[:top.shape[0]] = strip[:top.shape[0]] * (1 - at[..., None]) + top * at[..., None]
        ab = np.clip((np.arange(bot.shape[0]) - 3) / 6, 0, 1)[:, None, None]
        strip[r_bot - 6:] = strip[r_bot - 6:] * (1 - ab) + bot * ab
        full = np.concatenate([np.repeat(strip[:1], PAD, 0), strip, np.repeat(strip[-1:], PAD, 0)], 0)
        wrap[i * STRIP_H:(i + 1) * STRIP_H] = full
        print('tent', T['id'], 'door', (x1 - x0, y1 - y0), 'aspect %.2f' % door_aspect, 'valance period', kt, 'x', rt, 'border period', kb, 'x', rb, 'canvas gain', gain.round(2))
    if not info: return False
    # the colour under the skin picture's empty quarter: a mid colour, so its mipmaps stay quiet
    save(skin, OUT, 'tent_skin.webp', 82, 'RGBA'); save(wrap, OUT, 'tent_wrap.webp', 82)
    json.dump(info, open(os.path.join(OUT, 'tents.json'), 'w'), indent=1)
    prev = np.concatenate([resize(skin[..., :3] * (skin[..., 3:] / 255) + 60 * (1 - skin[..., 3:] / 255), 1024, 768), resize(np.tile(wrap, (1, 2, 1)), 1024, 1024)[:, :1024]], 0)
    Image.fromarray(np.clip(prev, 0, 255).astype(np.uint8)).save(os.path.join(LOOK, 'r1_tents.jpg'), quality=85)
    return True

if __name__ == '__main__':
    print(round1(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'data')))
