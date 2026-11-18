# prep_round23.py: Chris's "Round 2" and "Round 3" pictures (round2/, round3/), made ready for the page's kit of fair pieces (src/ow-kit.js).
#  - kit_atlas.webp (2048 x 2048, with see-through): every flat view of a single thing (the stall fronts and back, the wagon's side and end,
#    the well's bucket and lantern, the lantern post, the crates and barrels, the big top's door and roof, the booth, the gate, the carts,
#    the bale, rope, brazier and table), its grey background flooded away from the picture's edge, packed on shelves. Lamp glass and
#    glowing coals are marked in the see-through channel (200 in place of 255) so the page can let them shine. kit.json says where each
#    thing is in the atlas and where its parts are in its own picture (the counter's top, the valance, the eaves...).
#  - kit_trim.webp (1024 x 512): bands that repeat left to right: the red and gold scalloped valance (rows 0..255) and the big top's own
#    blue valance cut from its door picture (rows 256..511).
#  - kit_plants.webp (1024 x 1024, with see-through): the bare thorn tree and the row of reeds, for crossed cards.
#  - tiles that repeat (512 px): shingles, rubble, gorse, bracken, leaves, the blue and cream canvas, the red damask, straw, dark planks;
#    and the two new grounds (1024 px): marsh and farm field.
# usage: python3 -I prep_round23.py [out folder]
import sys, os, json, glob
import numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from prep_round1 import match_edges, seam_score, resize, bleed
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'data'); LOOK = os.path.join(HERE, 'look')

def find(name):
    f = glob.glob(os.path.join(HERE, 'round[23]', '*', name + '.png')); assert f, name; return f[0]
_cache = {}
def load(name):
    if name not in _cache: _cache[name] = np.asarray(Image.open(find(name)).convert('RGB')).astype(np.float32)
    return _cache[name]
def save(a, name, q=82, mode='RGB'):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), mode); p = os.path.join(OUT, name); im.save(p, 'WEBP', quality=q, method=6)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB'); return os.path.getsize(p)

def cutout(a, tol=14, seeds='border'):
    # the plain grey background, flooded in from the picture's edge (only grey that touches the edge, so grey stone or iron inside a
    # thing stays), made see-through with a soft one-pixel rim
    bg = np.median(np.concatenate([a[:4].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3), a[-4:].reshape(-1, 3)]), 0)
    d = np.abs(a - bg).max(2); near = (d < tol).astype(np.uint8)
    h, w = near.shape; m = np.zeros((h + 2, w + 2), np.uint8); fill = near.copy()
    pts = [(x, 0) for x in range(0, w, 16)] + [(x, h - 1) for x in range(0, w, 16)] + [(0, y) for y in range(0, h, 16)] + [(w - 1, y) for y in range(0, h, 16)]
    if seeds == 'top': pts = [(x, 0) for x in range(0, w, 8)]
    for (x, y) in pts:
        if fill[y, x] == 1: cv2.floodFill(fill, m, (x, y), 2)
    outside = (fill == 2).astype(np.uint8)
    if seeds == 'all': outside = near                                               # plants: every grey pixel (no grey inside a tree or the reeds)
    else:                                                                           # the background seen through a wheel's spokes or under a table: a pocket of
        n, lab, st, _ = cv2.connectedComponentsWithStats(near * (1 - outside), 4)   # plain, even grey shut in by the thing (grey stone or iron has texture)
        for i in range(1, n):
            if st[i, 4] < 30: continue
            x, y, ww, hh = st[i, :4]; sel = lab[y:y + hh, x:x + ww] == i; px = a[y:y + hh, x:x + ww][sel]
            if px.std(0).max() < 4.5 and np.abs(px.mean(0) - bg).max() < 7: outside[y:y + hh, x:x + ww][sel] = 1
    # grey specks left inside the background (noise) and a thin grey rim: close the outside by one pixel
    outside = cv2.morphologyEx(outside, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    alpha = 1 - cv2.GaussianBlur(outside.astype(np.float32), (0, 0), 0.8)
    return np.clip((alpha - 0.2) / 0.6, 0, 1)

def bbox(alpha, x0=0, x1=None, y0=0, y1=None):
    sub = alpha[y0:y1, x0:x1]; ys, xs = np.where(sub > 0.5); return [int(xs.min() + x0), int(ys.min() + y0), int(xs.max() + 1 + x0), int(ys.max() + 1 + y0)]

# ---- the things: (name in the atlas, source picture, the part of it to take [x0, x1] or None, how big at most in the atlas (px), lamp boxes) ----
# measured parts, in the source picture's own pixels (rows: y): see kit.json and ow-kit.js for how each is used
STALL = {   # yS: where the valance hangs from the awning (the awning's front edge); yT: the valance's tassels' lowest; yC: the counter's top
    'lamp': dict(yS=292, yT=430, yC=618, lamps=[(340, 375, 495, 630), (560, 380, 700, 625)]),
    'brass': dict(yS=300, yT=410, yC=660, lamps=[(245, 395, 355, 610)]),
    'herb': dict(yS=290, yT=365, yC=626, lamps=[]),
    'moon': dict(yS=305, yT=425, yC=664, lamps=[(1095, 420, 1210, 670)]),
}
ITEMS = []
for k, v in STALL.items(): ITEMS.append(dict(name='stall_' + k, src='skin_stall_%s_front' % k, max=600, lamps=v['lamps'], rows=dict(yS=v['yS'], yT=v['yT'], yC=v['yC'])))
ITEMS += [
    dict(name='stall_back', src='skin_stall_back', max=520, rows=dict(yS=300)),
    dict(name='wagon_side', src='skin_wagon_side', cols=(285, 1440), max=680, rows=dict(yE=300, yB=700)),          # yE: eave (roof's lower edge), yB: under the body
    dict(name='wagon_end', src='skin_wagon_end', max=440, rows=dict(yE=369, yB=990), cols2=dict(bx0=286, bx1=968)),
    dict(name='well_hang', src='skin_well', cols=(355, 730), rowsel=(448, 815), max=300, lamps=[(570, 560, 725, 810)]),
    dict(name='post', src='skin_lantern_post', max=600, lamps=[(500, 200, 690, 525)], cols2=dict(px0=400, px1=492, ly=330, lx=585)),
    dict(name='crate', src='skin_crates_barrels', cols=(30, 620), max=300),
    dict(name='crate_tall', src='skin_crates_barrels', cols=(630, 910), max=300),
    dict(name='barrel', src='skin_crates_barrels', cols=(920, 1250), max=280),
    dict(name='keg', src='skin_crates_barrels', cols=(1260, 1510), max=220),
    dict(name='bigtop_door', src='skin_big_top_door', max=960),
    dict(name='bigtop_roof', src='skin_big_top_roof', max=600),
    dict(name='booth', src='skin_booth_front', max=600, rows=dict(yE=276)),
    dict(name='gate', src='skin_fair_gate', max=600, cols2=dict(p0=(132, 272), p1=(982, 1115)), rows=dict(b0=150, b1=240)),
    dict(name='oven', src='skin_oven_cart', max=560, lamps=[(790, 455, 1020, 555)], lumMin=95, rows=dict(yD=548, yB=862), cols2=dict(bx0=300, bx1=1228, dx=816, dr=330, cx0=752, cx1=880)),
    dict(name='pie', src='skin_pie_cart', cols=(420, 1420), max=520, rows=dict(yT=171, yC=370, yS=600, yB=720)),
    dict(name='bale', src='skin_small_things', cols=(20, 420), max=280),
    dict(name='rope', src='skin_small_things', cols=(430, 810), max=240),
    dict(name='brazier', src='skin_small_things', cols=(815, 1135), max=280, lamps=[(830, 340, 1120, 425)], lumMin=95),
    dict(name='table', src='skin_small_things', cols=(1140, 1525), max=260),
]

def valance(name, a, al, yS, yT):
    # the stall's valance alone, its gaps (the dark inside of the stall) see-through: kept are the cloth and gold that hang from the top
    band = a[yS:yT]; lum = band @ np.array([0.3, 0.59, 0.11]); hsv = cv2.cvtColor(band.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    blue = (band[..., 2] > band[..., 0] + 12) & (lum > 45)
    keep = ((lum > 92) | blue | ((hsv[..., 0] > 8) & (hsv[..., 0] < 32) & (hsv[..., 1] > 120) & (lum > 70))).astype(np.uint8)
    keep = cv2.morphologyEx(keep, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)); keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab = cv2.connectedComponents(keep); top = set(np.unique(lab[:6])) - {0}
    m = np.isin(lab, list(top)).astype(np.float32)
    m[:max(4, (yT - yS) // 5)] = 1                                                 # the band's solid top
    m = np.clip(cv2.GaussianBlur(m, (0, 0), 0.8) * 1.4 - 0.2, 0, 1) * al[yS:yT]
    return m

def prep_items():
    out = []
    for it in ITEMS:
        a = load(it['src']); al = cutout(a)
        lamp = np.zeros(al.shape, np.float32)
        for (x0, y0, x1, y1) in it.get('lamps', []):
            sub = a[y0:y1, x0:x1]; lum = sub @ np.array([0.3, 0.59, 0.11])
            g = ((lum > it.get('lumMin', 150)) & (sub[..., 0] > sub[..., 2] + 55)).astype(np.float32); lamp[y0:y1, x0:x1] = np.maximum(lamp[y0:y1, x0:x1], cv2.GaussianBlur(g, (0, 0), 1.0))
        cx = it.get('cols') or (0, a.shape[1]); ry = it.get('rowsel') or (0, a.shape[0])
        if it.get('rowsel'):                                                        # a part inside the thing (the well's bucket): flooded from the part's own edge
            al = np.zeros(al.shape, np.float32); al[ry[0]:ry[1], cx[0]:cx[1]] = cutout(a[ry[0]:ry[1], cx[0]:cx[1]])
        bb = bbox(al, cx[0], cx[1], ry[0], ry[1])
        x0, y0, x1, y1 = bb
        rgb = bleed(a[y0:y1, x0:x1], al[y0:y1, x0:x1])
        A = al[y0:y1, x0:x1] * (1 - 0.216 * np.clip(lamp[y0:y1, x0:x1], 0, 1))         # lamp glass: 200 of 255
        rows = it.get('rows', {})
        if 'yC' in rows or it['name'] in ('stall_back', 'booth'):                    # the body's own width (posts and counter, or the walls), under the awning or roof
            r0 = rows.get('yC', rows.get('yS', rows.get('yE', 0))) + 30; b2 = bbox(al, x0, x1, r0, y1 - 25); it = dict(it, cols2=dict(it.get('cols2', {}), bx0=b2[0], bx1=b2[2]))
        out.append(dict(it, bb=bb, rgb=rgb, a=A))
        if it['name'].startswith('stall_') and it['name'] != 'stall_back':
            r = it['rows']; m = valance(it['name'], a, al, r['yS'], r['yT'])
            vb = [x0, r['yS'], x1, r['yT']]
            out.append(dict(name='val_' + it['name'][6:], src=it['src'], max=600 * (x1 - x0) / max(x1 - x0, y1 - y0), bb=vb, rgb=bleed(a[r['yS']:r['yT'], x0:x1], m[:, x0:x1]), a=m[:, x0:x1], scale_like=it['name']))
    return out

def pack(items, W=2048, H=2048, pad=6):
    s = 1.0
    while True:
        sizes = []
        for it in items:
            w0, h0 = it['bb'][2] - it['bb'][0], it['bb'][3] - it['bb'][1]
            if 'scale_like' in it: k = next(i for i in items if i['name'] == it['scale_like'])['k']
            else: k = min(1.0, it['max'] / max(w0, h0)) * s
            it['k'] = k; sizes.append((max(4, int(round(w0 * k))), max(4, int(round(h0 * k)))))
        order = sorted(range(len(items)), key=lambda i: -sizes[i][1]); x = y = rowh = 0; ok = True; at = {}
        for i in order:
            w, h = sizes[i]
            if x + w + 2 * pad > W: x = 0; y += rowh; rowh = 0
            if y + h + 2 * pad > H: ok = False; break
            at[i] = (x + pad, y + pad); x += w + 2 * pad; rowh = max(rowh, h + 2 * pad)
        if ok: break
        s *= 0.95
    print('atlas scale', round(s, 3))
    rgb = np.zeros((H, W, 3), np.float32) + 110; al = np.zeros((H, W), np.float32)
    for i, it in enumerate(items):
        w, h = sizes[i]; px, py = at[i]
        c = resize(it['rgb'], w, h); a = resize(it['a'][..., None].repeat(3, 2), w, h)[..., 0]
        # the colour runs on past the edge into the padding (alpha 0), so smaller copies of the atlas keep the thing's own colour at its rim
        cp = cv2.copyMakeBorder(c, pad, pad, pad, pad, cv2.BORDER_REPLICATE)
        rgb[py - pad:py + h + pad, px - pad:px + w + pad] = cp; al[py:py + h, px:px + w] = a
        it['rect'] = [px / W, py / H, w / W, h / H]
    return rgb, al

def periodic(b, lo=60):
    # a band that repeats left to right: its own period (autocorrelation of its columns), cut to a whole number of periods, the join faded
    g = b.mean(2); g = g - g.mean(0, keepdims=True); prof = g.T; n = prof.shape[0]
    ac = np.array([(prof[:n - k] * prof[k:]).mean() for k in range(n // 2)]); k = lo + int(np.argmax(ac[lo:n // 2]))
    m = max(1, (n - 24) // k); L = k * m; F = min(24, n - L); seg = b[:, :L].copy()
    if F > 4: t = (np.arange(F) / F)[None, :, None]; seg[:, :F] = b[:, L:L + F] * (1 - t) + b[:, :F] * t
    return seg, k, m

def main():
    meta = {'atlas': {}, 'tiles': {}}
    items = prep_items(); rgb, al = pack(items)
    for it in items:
        meta['atlas'][it['name']] = dict(rect=[round(v, 6) for v in it['rect']], bb=it['bb'], rows=it.get('rows', {}), cols=it.get('cols2', {}), lamps=it.get('lamps', []))
    save(np.dstack([rgb, al * 255]), 'kit_atlas.webp', 80, 'RGBA')
    prev = rgb * al[..., None] + np.array([40, 90, 40]) * (1 - al[..., None]); Image.fromarray(np.clip(resize(prev, 1024, 1024), 0, 255).astype(np.uint8)).save(os.path.join(LOOK, 'r23_atlas.jpg'), quality=85)

    # ---- the trims ----
    trim = np.zeros((512, 1024, 4), np.float32)
    a = load('trim_scallop'); A = cutout(a); x0, y0, x1, y1 = bbox(A)
    band = np.dstack([bleed(a[y0:y1], A[y0:y1]), A[y0:y1] * 255]); seg, k, m = periodic(band[..., :3])
    segA = np.dstack([seg, band[:, :seg.shape[1], 3:]]) ; print('scallop trim: rows', y0, y1, 'period', k, 'x', m)
    trim[0:248] = resize(segA, 1024, 248); trim[248:256] = trim[247:248]
    meta['trim'] = {'scallop': dict(v0=0, v1=248 / 512, aspect=round(seg.shape[1] / (y1 - y0), 4), periods=m)}
    d = load('skin_big_top_door'); Ad = cutout(d); bx0, by0, bx1, by1 = bbox(Ad)
    vb = d[by0 + 2:by0 + 96, bx0 + 8:bx1 - 8]; seg, k, m = periodic(vb, lo=150); print('big top valance: period', k, 'x', m)
    trim[256 + 8:512] = np.dstack([resize(seg, 1024, 248), np.full((248, 1024, 1), 255.0)]); trim[256:264] = trim[264:265]
    meta['trim']['bigtop'] = dict(v0=264 / 512, v1=1.0, aspect=round(seg.shape[1] / 94, 4), periods=m)
    save(trim, 'kit_trim.webp', 82, 'RGBA')

    # ---- the plants: the thorn tree and the reeds, for crossed cards ----
    pl = np.zeros((1024, 1024, 3), np.float32) + 90; pa = np.zeros((1024, 1024), np.float32)
    t = load('plant_thorn_tree'); At = cutout(t, tol=13, seeds='all'); x0, y0, x1, y1 = bbox(At); s = 700 / max(x1 - x0, y1 - y0)
    w, h = int((x1 - x0) * s), int((y1 - y0) * s); pl[2:2 + h, 2:2 + w] = resize(bleed(t[y0:y1, x0:x1], At[y0:y1, x0:x1]), w, h); pa[2:2 + h, 2:2 + w] = resize(At[y0:y1, x0:x1, None].repeat(3, 2), w, h)[..., 0]
    meta['plants'] = {'thorn': dict(rect=[2 / 1024, 2 / 1024, w / 1024, h / 1024], bb=[x0, y0, x1, y1])}
    r = load('plant_reeds'); Ar = cutout(r, tol=13, seeds='all'); x0, y0, x1, y1 = bbox(Ar); h2 = 1024 - 712; s = h2 / (y1 - y0); w2 = min(1020, int((x1 - x0) * s))
    pl[710:710 + h2, 2:2 + w2] = resize(bleed(r[y0:y1, x0:x1], Ar[y0:y1, x0:x1]), w2, h2); pa[710:710 + h2, 2:2 + w2] = resize(Ar[y0:y1, x0:x1, None].repeat(3, 2), w2, h2)[..., 0]
    meta['plants']['reeds'] = dict(rect=[2 / 1024, 710 / 1024, w2 / 1024, h2 / 1024], bb=[x0, y0, x1, y1])
    save(np.dstack([pl, pa * 255]), 'kit_plants.webp', 80, 'RGBA')
    prev = pl * pa[..., None] + np.array([40, 90, 40]) * (1 - pa[..., None]); Image.fromarray(np.clip(resize(prev, 512, 512), 0, 255).astype(np.uint8)).save(os.path.join(LOOK, 'r23_plants.jpg'), quality=85)
    prev = trim[..., :3] * (trim[..., 3:] / 255) + np.array([40, 90, 40]) * (1 - trim[..., 3:] / 255); Image.fromarray(np.clip(np.tile(prev, (1, 2, 1)), 0, 255).astype(np.uint8)).save(os.path.join(LOOK, 'r23_trim.jpg'), quality=85)

    # ---- tiles ----
    sheet = []
    for src, name, px in [('roof_shingles', 'shingles', 512), ('stone_rubble', 'rubble', 512), ('plant_gorse', 'gorse', 512), ('plant_bracken', 'bracken', 512), ('plant_leaves', 'leaves', 512),
                          ('cloth_blue_cream_stripe', 'bluestripe', 512), ('cloth_red_damask', 'damask', 512), ('straw', 'straw', 512), ('wood_dark', 'wooddark', 512),
                          ('ground_marsh', 'marsh', 1024), ('ground_field', 'field', 1024)]:
        a = load(src); s0 = seam_score(a)
        if name == 'wooddark':                                                      # planks left to right: cut top and bottom on the dark gaps between planks
            prof = a.mean((1, 2)); n = len(prof); t0 = int(np.argmin(prof[:n // 8])); t1 = n - n // 8 + int(np.argmin(prof[n - n // 8:])); a = a[t0:t1]
            a = match_edges(a, axes=(1,))
        else: a = match_edges(a, axes=(0,) if ('stripe' in src or 'damask' in src) else (0, 1))
        a = resize(a, px, px)
        save(a, 'tile_%s.webp' % name if px == 512 else 'tex_%s.webp' % name, 82 if px == 512 else 84); print('   seams', s0, '->', seam_score(a))
        meta['tiles'][name] = [round(float(v), 5) for v in ((a / 255) ** 2.2).reshape(-1, 3).mean(0)]
        sheet.append(np.tile(resize(a, 192, 192), (2, 2, 1)))
    rows = [np.concatenate(sheet[i:i + 6] + [np.zeros_like(sheet[0])] * (6 - len(sheet[i:i + 6])), 1) for i in range(0, len(sheet), 6)]
    Image.fromarray(np.concatenate(rows, 0).astype(np.uint8)).save(os.path.join(LOOK, 'r23_tiles.jpg'), quality=85)
    json.dump(meta, open(os.path.join(OUT, 'kit.json'), 'w'), indent=1)

if __name__ == '__main__': main()
