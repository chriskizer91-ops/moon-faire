# Her head beside the three views in J3 at one scale: painting | model, with the model's outline drawn over the painting, and a
# table of widths and depths by height. usage: cmp_j3.py out.jpg
import sys, numpy as np, cv2
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of
from PIL import Image
from scipy import ndimage as ndi
from playwright.sync_api import sync_playwright
out = sys.argv[1]
W, H, FOV, DIST, TY = 600, 720, 5.0, 8.0, 1.485
PXM = H / (2 * DIST * np.tan(np.radians(FOV / 2)))
J3 = load('/home/claude/ranger/refs/J3.png'); J1 = load('/home/claude/ranger/refs/J1.png'); fg, _ = mask_of(J3)
gray = lambda a: cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
# the front view is settled onto J1 picture against picture, so J1's landmarks can be carried to it
tm = cv2.resize(gray(J1), (627, 627), interpolation=cv2.INTER_AREA); Wf = np.array([[0.836, 0, 271 - 0.836 * 314.9], [0, 0.836, 403 - 0.836 * 270.5]], np.float32)
fm = np.zeros(J3.shape[:2], np.uint8); cv2.ellipse(fm, (271, 455), (105, 150), 0, 0, 360, 255, -1)
_, Wf = cv2.findTransformECC(tm, gray(J3), Wf, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-7), fm, 5)
to3 = lambda c, r: (Wf[0, 0] * c / 2 + Wf[0, 1] * r / 2 + Wf[0, 2], Wf[1, 0] * c / 2 + Wf[1, 1] * r / 2 + Wf[1, 2])
eL = to3(442.5, 541); eR = to3(838.5, 541); lip = to3(651, 928); nose = to3(651, 700)
HS, EYEX = 0.94, 0.03376
pxF = (eR[0] - eL[0]) / (2 * EYEX * HS); pxFv = (lip[1] - (eL[1] + eR[1]) / 2) / (0.066 * HS)
print('J3 front: eyes', np.round(eL, 1), np.round(eR, 1), 'lip line y', round(lip[1], 1), '| px a metre across', round(pxF), 'and up', round(pxFv))
VIEWS = [('front', 0.0, (0, 520), pxF, pxFv, nose[0], 0.0, (eL[1] + eR[1]) / 2), ('turned', -0.66, (524, 1010), None, None, None, None, None), ('side', -np.pi / 2, (1012, 1536), 1970 / HS, 1970 / HS, 1502.5, 0.107, 405.0)]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 800, 'height': 900}); pg.goto('file:///home/claude/ranger/test_r.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000); pg.wait_for_timeout(2500)
    pg.evaluate('T.j.pose({arm:24,leg:3}); for (const k of ["wire","lens","pad","lock","band","gold","gem"]) if (T.j.meshes[k]) T.j.meshes[k].visible = false;')
    for name, az, *_ in VIEWS:
        for mode in ('mask', 'color'):
            pg.evaluate("T.clean('%s'); T.view(%f,0,%f,%f,%f,%d,%d)" % (mode, az, DIST, TY, FOV, W, H)); pg.locator('#c').screenshot(path='/tmp/_j3_%s_%s.png' % (name, mode))
    b.close()
rows = []
for name, az, (c0, c1), px, pxv, ax, mx, ey in VIEWS:
    mc = Image.open('/tmp/_j3_%s_color.png' % name).convert('RGB'); mk = np.asarray(Image.open('/tmp/_j3_%s_mask.png' % name).convert('RGB')).astype(int); mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
    crop = J3[:, c0:c1]
    if px is None:                                  # the turned view: same size as the front view, placed by eye
        px, pxv = VIEWS[0][3], VIEWS[0][4]; ax, mx, ey = (c1 - c0) / 2 + 20, 0.0, VIEWS[0][7]; overlay = False
    else: ax -= c0; overlay = True
    kx, ky = PXM / px, PXM / pxv
    def place(arr, mode):
        im = Image.fromarray(arr, mode); im = im.resize((round(im.width * kx), round(im.height * ky)), Image.LANCZOS); c = Image.new(mode, (W, H), (59, 47, 67) if mode == 'RGB' else 0)
        c.paste(im, (round(W / 2 + mx * PXM - ax * kx), round(H / 2 - (1.512 - TY) * PXM - ey * ky))); return c
    pa = place(np.clip(crop, 0, 255).astype(np.uint8), 'RGB'); pm = np.asarray(place((fg[:, c0:c1] * 255).astype(np.uint8), 'L')) > 127
    d = np.asarray(pa).copy()
    if overlay:
        edge = mm ^ ndi.binary_erosion(mm, iterations=2); d[edge] = (255, 255, 255)
        print(name, ': height, painting from..to (m), model from..to (m), widths')
        for y in (1.62, 1.58, 1.54, 1.50, 1.46, 1.43, 1.40, 1.37, 1.33):
            r = int(round(H / 2 - (y - TY) * PXM)); a = np.nonzero(pm[r])[0]; m_ = np.nonzero(mm[r])[0]
            if len(a) and len(m_):
                f = lambda v: (v - W / 2) / PXM
                print('  %.2f  %+.3f %+.3f   %+.3f %+.3f   %.3f %.3f' % (y, f(a.min()), f(a.max()), f(m_.min()), f(m_.max()), (a.max() - a.min()) / PXM, (m_.max() - m_.min()) / PXM))
    rows.append(np.concatenate([d, np.asarray(mc)], 1))
sheet = np.concatenate(rows, 1); Image.fromarray(sheet).resize((round(sheet.shape[1] * 0.5), round(sheet.shape[0] * 0.5)), Image.LANCZOS).save(out, quality=86); print(out)
