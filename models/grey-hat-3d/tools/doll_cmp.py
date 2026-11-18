# The blank doll beside a painting at one scale, soles of the boots on one line, with the two outlines laid over each other.
# usage: python3 tools/doll_cmp.py out.jpg view       view: b3front | b3side | b1front | b5front | b5side | b5back
# Three panels: the painting, the doll, the two outlines.
#   grey  both          red  the painting reaches further than the doll          blue  the doll reaches further than the painting
# B3 is him in shirt and trousers, B1 in the whole outfit: there the doll must lie INSIDE the painting (red all round it is right, blue on the body is wrong).
# B5 is his legs in shorts and fishnet: there the two outlines should agree. B5 is placed by tools/doll_measure.py's rules: widths at
# S5 px/m, and each landmark row of the painting at the height the same landmark has on his skeleton (so the painting is stretched
# up and down between landmarks; outside the measured band, 0.353 to 1.065 m, the overlay is left dark). For B5 from the front and
# the back his legs are posed 1.6 degrees closer together than he rests, which is how B5 stands.
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, view = sys.argv[1], sys.argv[2]
W, H = 900, 1500; PXM = 357.6 * H / 900; GY = H / 2 + 0.93 * PXM; ZOFF = 0.035
M = json.load(open(os.path.join(ROOT, 'out', 'doll_measure.json'))); S5 = M['S5']; LR = [l[0] for l in M['land']]; LH = [l[1] for l in M['land']]
name, fi, az, pose, part = {'b3front': ('B3.png', 0, 0.0, '{}', 0), 'b1front': ('B1.png', 0, 0.0, '{}', 0), 'b3side': ('B3.png', 1, -1.57079633, '{arm: 8}', 0), 'b5front': ('B5.png', 0, 0.0, '{leg: -1.6}', 1),
                            'b5side': ('B5.png', 1, -1.57079633, '{}', 1), 'b5back': ('B5.png', 2, 3.14159265, '{leg: -1.6}', 1)}[view]
a = load(os.path.join(ROOT, 'refs', name)); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; fm = lab == f[5]
def mid(rows, pick):          # the middle of the figure: mean middle of the chosen span over some rows
    v = []
    for y in rows:
        r = np.nonzero(fm[y])[0]
        if len(r): sp = np.split(r, np.nonzero(np.diff(r) > 3)[0] + 1); s = pick(sp); v.append((s[0] + s[-1]) / 2)
    return float(np.mean(v))
big = lambda sp: max(sp, key=len)
if name != 'B5.png':
    pxm = (f[3] - f[1]) / 1.78; rowof = lambda h: f[3] - h * pxm
    cx = mid(range(int(rowof(1.09)), int(rowof(1.04))), lambda sp: min(sp, key=lambda s: abs((s[0] + s[-1]) / 2 - (f[0] + f[2]) / 2))) if fi == 0 else mid(range(int(rowof(0.30)), int(rowof(0.16))), big)
    band = (0.0, 1.80)
else:
    pxm = S5; rowof = lambda h: float(np.interp(h, LH[::-1], LR[::-1]))
    cx = mid(range(120, 240, 10), big) if fi != 1 else mid(range(735, 800, 5), big)
    band = (LH[-2], LH[0])
off = 0 if 'side' not in view else -ZOFF * PXM; flip = -1 if view == 'b5back' else 1
# the painting laid on the model's picture: for every picture row, the painting row of the same height; for every column, the painting column at the same distance from his middle
ys = np.arange(H); hs = (GY - ys) / PXM; pr = np.array([rowof(h) for h in hs]); xs = np.arange(W); pc = cx + (xs - W / 2 - off) / PXM * pxm
ok = (hs >= band[0]) & (hs <= band[1]); ri = np.clip(np.round(pr).astype(int), 0, a.shape[0] - 1); ci = np.clip(np.round(pc).astype(int), 0, a.shape[1] - 1); inx = (pc >= 0) & (pc < a.shape[1])
pa = np.zeros((H, W, 3), np.uint8); pa[...] = (56, 48, 67); pm = np.zeros((H, W), bool)
sub = a[ri][:, ci].astype(np.uint8); sm_ = fm[ri][:, ci]; keep = ok[:, None] & inx[None, :]; pa[keep] = sub[keep]; pm[keep] = sm_[keep]
only = "['dollTrunk','dollHips','dollLegs']" if part else 'null'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1600}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.j.setDoll(true); T.j.pose(%s); const only = %s; if (only) for (const k in T.j.meshes) T.j.meshes[k].visible = only.includes(k); 1' % (pose, only))
    pg.evaluate("T.clean('mask'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_dm.png')
    pg.evaluate("T.clean('nodust'); T.j.setBlank(true); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_dc.png')
    for e in errs[:5]: print('ERR', e)
    b.close()
mk = np.asarray(Image.open('/tmp/_dm.png').convert('RGB')).astype(int); mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
mc = Image.open('/tmp/_dc.png').convert('RGB')
d = np.zeros((H, W, 3), np.uint8); d[...] = (30, 26, 36); B = ok[:, None] & np.ones((1, W), bool)
d[pm & mm & B] = (105, 105, 115); d[pm & ~mm & B] = (235, 70, 70); d[mm & ~pm & B] = (70, 140, 245); d[mm & ~B] = (60, 56, 70)
dd = Image.fromarray(d); dr = ImageDraw.Draw(dd)
for yy in np.arange(0, 1.9, 0.1): y = GY - yy * PXM; dr.line([(0, y), (W, y)], fill=(70, 62, 84)); dr.text((4, y - 11), '%.1f' % yy, fill=(210, 200, 230))
sheet = Image.new('RGB', (W * 3, H)); sheet.paste(Image.fromarray(pa), (0, 0)); sheet.paste(mc, (W, 0)); sheet.paste(dd, (W * 2, 0))
if part: sheet = sheet.crop((0, int(GY - 1.12 * PXM), W * 3, int(GY - 0.28 * PXM)))
sheet = sheet.resize((sheet.width * 2 // 3, sheet.height * 2 // 3), Image.LANCZOS); sheet.save(out, quality=90)
pmb = pm & B; mmb = mm & B
print(view, 'both %.3f of the painting | painting only (red) %.3f | doll only (blue) %.3f' % ((pmb & mmb).sum() / max(1, pmb.sum()), (pmb & ~mmb).sum() / max(1, pmb.sum()), (mmb & ~pmb).sum() / max(1, pmb.sum())))
