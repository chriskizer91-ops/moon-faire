# cmp_boot.py out_prefix : her boot beside the boot paintings E1 to E8 at one scale.
# For each view: painting (scaled to the model, with the model's outline drawn over it in white) | model. Prints outline tables in millimetres.
# The painting of the outer side (E1) is scaled so its sole is as long as the model's; the others so their height (ground to sock top),
# or their length for the views from above and below, matches E1's.
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from playwright.sync_api import sync_playwright
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of
out = sys.argv[1]
R = '/home/claude/ranger/'; W = H = 760; DIST, FOV = 8.0, 3.4
PXM = H / (2 * DIST * np.tan(np.radians(FOV / 2)))          # pixels a metre in the model pictures
BX = -0.081                                                  # her right boot
# name, painting, azimuth, elevation, target (x, y, z), slab kept either side of the target along the view (m), which half to keep (None, 'L', 'R')
VIEWS = [('outer', 'E1', -np.pi / 2, 0.0, (BX, 0.170, 0.050), 0.075, None), ('inner', 'E2', np.pi / 2, 0.0, (BX, 0.170, 0.050), 0.075, None),
         ('front', 'E3', 0.0, 0.0, (BX, 0.170, 0.050), 0.40, 'L'), ('back', 'E4', np.pi, 0.0, (BX, 0.170, 0.050), 0.40, 'R'),
         ('top', 'E6', np.pi, 1.5607, (BX, 0.100, 0.050), 0.235, 'R'), ('sole', 'E7', 0.0, -1.5607, (BX, 0.100, 0.050), 0.40, 'L'),
         ('quarter', 'E5', -0.75, 0.38, (BX, 0.170, 0.050), 0.40, None)]
JS_HIDE = 'for (const k in T.j.meshes) T.j.meshes[k].visible = ["boot","sole","stitch","eyelet","lace","aglet","sock","hole"].includes(k);'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 900, 'height': 900}); pg.goto('file://' + R + 'test_r.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000); pg.wait_for_timeout(2500)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.evaluate('T.j.pose({arm:24,leg:0}); ' + JS_HIDE)
    for name, ref, az, el, t, slab, half in VIEWS:
        pg.evaluate('T.stage.orbit.target.set(%f,%f,%f); T.stage.camera.near = %f; T.stage.camera.far = %f;' % (t[0], t[1], t[2], DIST - slab, DIST + slab))
        for mode in ('mask', 'color'):
            pg.evaluate("T.clean('%s'); T.view(%f,%f,%f,%f,%f,%d,%d)" % (mode, az, el, DIST, t[1], FOV, W, H)); pg.locator('#c').screenshot(path='/tmp/_boot_%s_%s.png' % (name, mode))
    b.close()

def model(name, half):
    mc = np.asarray(Image.open('/tmp/_boot_%s_color.png' % name).convert('RGB')).copy(); mk = np.asarray(Image.open('/tmp/_boot_%s_mask.png' % name).convert('RGB')).astype(int)
    mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
    if half:                                             # the pair is in view: keep her right boot only
        cut = int(W / 2 + (0.081 if half == 'L' else -0.081) * PXM)
        if half == 'L': mm[:, cut:] = False
        else: mm[:, :cut] = False
    return mc, mm
def painting(ref, half):
    a = load(R + 'refs/%s.png' % ref); m, _ = mask_of(a)
    lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1)); order = np.argsort(sizes)[::-1]
    if half and ref == 'E3':                             # two boots in E3: take the one on the picture's left (her right boot)
        blobs = [lab == (i + 1) for i in order[:2] if sizes[i] > 0.25 * sizes[order[0]]]
        blobs.sort(key=lambda bm: np.nonzero(bm.any(0))[0].mean()); m = blobs[0] if half == 'L' else blobs[-1]
    else: m = lab == (order[0] + 1)
    return a, m
def bbox(m):
    ys, xs = np.nonzero(m); return xs.min(), ys.min(), xs.max(), ys.max()

res = {}; sheets = []
for name, ref, az, el, t, slab, half in VIEWS:
    mc, mm = model(name, half); a, pm = painting(ref, half)
    if name == 'quarter': sheets.append((name, np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)), mc)); continue
    mx0, my0, mx1, my1 = bbox(mm); px0, py0, px1, py1 = bbox(pm)
    if name == 'outer': k = (mx1 - mx0) / (px1 - px0); res['e1_h'] = (py1 - py0) * k / PXM; res['e1_len'] = (px1 - px0) * k / PXM
    elif name in ('top', 'sole'): k = res['e1_len'] * PXM / (py1 - py0)
    else: k = res['e1_h'] * PXM / (py1 - py0)
    # place the painting: ground (or heel end) on the model's, and the same side edge / middle
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((round(a.shape[1] * k), round(a.shape[0] * k)), Image.LANCZOS)
    pmk = np.asarray(Image.fromarray((pm * 255).astype(np.uint8)).resize(im.size, Image.LANCZOS)) > 127
    qx0, qy0, qx1, qy1 = bbox(pmk)
    if name in ('outer', 'inner'): ox = (mx0 - qx0) if name == 'outer' else (mx1 - qx1); oy = my1 - qy1
    elif name in ('front', 'back'): ox = round((mx0 + mx1) / 2 - (qx0 + qx1) / 2); oy = my1 - qy1
    else: ox = round((mx0 + mx1) / 2 - (qx0 + qx1) / 2); oy = my1 - qy1
    canvas = Image.new('RGB', (W, H), (59, 47, 67)); canvas.paste(im, (int(ox), int(oy))); d = np.asarray(canvas).copy()
    pmc = np.zeros((H, W), bool); src = Image.new('L', (W, H), 0); src.paste(Image.fromarray((pmk * 255).astype(np.uint8)), (int(ox), int(oy))); pmc = np.asarray(src) > 127
    edge = mm ^ ndi.binary_erosion(mm, iterations=2); d[edge] = (255, 255, 255)
    sheets.append((name, d, mc)); Image.fromarray(np.concatenate([d, mc], 1)).save('%s_%s.png' % (out, name))
    print('\n== %s (%s): painting scaled by %.4f; 1 painting px = %.3f mm' % (name, ref, k, 1000 / (PXM / k)))
    ground = my1
    if name in ('outer', 'inner', 'front', 'back'):
        print('  height mm | painting from..to (mm)   width | model from..to (mm)   width')
        x_ref = mx0 if name in ('outer',) else (mx1 if name == 'inner' else (mx0 + mx1) / 2)
        sgn = -1 if name == 'inner' else 1
        for hmm in (8, 20, 32, 44, 56, 70, 85, 100, 120, 140, 160, 180, 200, 220, 232, 250, 270, 290, 305):
            r = int(round(ground - hmm / 1000 * PXM))
            if r < 0: continue
            pa = np.nonzero(pmc[r])[0]; ma = np.nonzero(mm[r])[0]
            f = lambda v: sgn * (v - x_ref) / PXM * 1000
            ps = '%6.1f %6.1f  %6.1f' % (min(f(pa.min()), f(pa.max())), max(f(pa.min()), f(pa.max())), (pa.max() - pa.min()) / PXM * 1000) if len(pa) else '   --     --      -- '
            ms = '%6.1f %6.1f  %6.1f' % (min(f(ma.min()), f(ma.max())), max(f(ma.min()), f(ma.max())), (ma.max() - ma.min()) / PXM * 1000) if len(ma) else '   --     --      -- '
            print('   %4d     | %s      | %s' % (hmm, ps, ms))
        if name in ('outer', 'inner'):
            print('  along the foot, mm from the heel end | top of the outline, mm above the ground: painting, model')
            for zmm in (10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 225, 235, 245):
                c = int(round(x_ref + sgn * zmm / 1000 * PXM))
                if c < 0 or c >= W: continue
                pa = np.nonzero(pmc[:, c])[0]; ma = np.nonzero(mm[:, c])[0]
                print('   %4d  | %6.1f   %6.1f' % (zmm, (ground - pa.min()) / PXM * 1000 if len(pa) else -1, (ground - ma.min()) / PXM * 1000 if len(ma) else -1))
        print('  whole outline: painting %.1f mm long/wide, %.1f mm tall; model %.1f, %.1f' % ((qx1 - qx0) / PXM * 1000, (qy1 - qy0) / PXM * 1000, (mx1 - mx0) / PXM * 1000, (my1 - my0) / PXM * 1000))
    else:
        print('  mm from the heel end | painting from..to, width | model from..to, width (mm from the middle line)')
        xm = (mx0 + mx1) / 2
        for zmm in (8, 25, 45, 65, 85, 105, 125, 145, 165, 185, 205, 225, 240, 250, 258):
            r = int(round(ground - zmm / 1000 * PXM))
            if r < 0: continue
            pa = np.nonzero(pmc[r])[0]; ma = np.nonzero(mm[r])[0]; f = lambda v: (v - xm) / PXM * 1000
            ps = '%6.1f %6.1f  %6.1f' % (f(pa.min()), f(pa.max()), (pa.max() - pa.min()) / PXM * 1000) if len(pa) else '   --     --      -- '
            ms = '%6.1f %6.1f  %6.1f' % (f(ma.min()), f(ma.max()), (ma.max() - ma.min()) / PXM * 1000) if len(ma) else '   --     --      -- '
            print('   %4d  | %s | %s' % (zmm, ps, ms))
        print('  whole outline: painting %.1f mm wide, %.1f mm long; model %.1f, %.1f' % ((qx1 - qx0) / PXM * 1000, (qy1 - qy0) / PXM * 1000, (mx1 - mx0) / PXM * 1000, (my1 - my0) / PXM * 1000))
for i in range(0, len(sheets), 2):
    row = np.concatenate([np.concatenate([d, mc], 1) for _, d, mc in sheets[i:i + 2]], 1)
    Image.fromarray(row).resize((round(row.shape[1] * 0.66), round(row.shape[0] * 0.66)), Image.LANCZOS).save('%s_%d.jpg' % (out, i // 2), quality=88); print('%s_%d.jpg' % (out, i // 2), [s[0] for s in sheets[i:i + 2]])
