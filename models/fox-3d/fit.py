# Measures the model against the turnaround sprites at the same scale.
# usage: fit.py [tag] [setup-js]   -> prints outline overlap, extents per height band, regional colours; saves shots/fit_<tag>.png
import sys, json, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
tag = sys.argv[1] if len(sys.argv) > 1 else 'x'; setup = sys.argv[2] if len(sys.argv) > 2 else ''
M = json.load(open('/home/claude/fox3d/ref/meta.json'))['frames']
W, H, PXM, SPR = 620, 900, 357.5, 4.75e-3
K = SPR * PXM; GY = H / 2 + 0.93 * PXM
VIEWS = [('front', 'A00', 0.0), ('side', 'A06', 1.5708), ('back', 'A16', 3.14159)]
REG = {'face': (-0.045, 0.045, 1.445, 1.515), 'cap': (-0.05, 0.05, 1.585, 1.66), 'hornL': (0.2, 0.3, 1.70, 1.78), 'bodice': (-0.06, 0.06, 1.12, 1.19), 'corset': (-0.06, 0.06, 1.02, 1.08),
       'skirt': (-0.08, 0.08, 0.68, 0.88), 'legR': (-0.14, -0.05, 0.40, 0.60), 'bootR': (-0.13, -0.05, 0.10, 0.25), 'veilR': (-0.38, -0.27, 0.45, 0.80), 'veilL': (0.27, 0.38, 0.45, 0.80),
       'panelL': (0.2, 0.3, 1.08, 1.22), 'ribbonL': (0.09, 0.14, 1.2, 1.4), 'cuffR': (-0.32, -0.22, 0.92, 1.02)}
def sprite(frame):
    f = Image.open(f'/home/claude/fox3d/ref/hd/{frame}.webp').convert('RGBA'); m = M[frame]
    f = f.resize((round(f.width * K), round(f.height * K)), Image.LANCZOS)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); im.paste(f, (round(W / 2 - m['hdFootX'] * K), round(GY - m['hdFootY'] * K)), f)
    a = np.asarray(im).astype(float); bg = np.array([56, 48, 67.0]); al = a[..., 3:4] / 255
    return a[..., :3] * al + bg * (1 - al), a[..., 3] > 90
def box(x0, x1, y0, y1): return slice(int(GY - y1 * PXM), int(GY - y0 * PXM)), slice(int(W / 2 + x0 * PXM), int(W / 2 + x1 * PXM))
out = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:500]))
    pg.goto('file:///home/claude/fox3d/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.evaluate('T.step(90, 1/60)');
    if setup: pg.evaluate(setup)
    print('tris', pg.evaluate('T.j.triangles'))
    cells = []
    for name, frame, az in VIEWS:
        sc, sm = sprite(frame)
        pg.evaluate(f"T.clean('mask'); T.view({az},0,18,0.93,8,{W},{H})"); pg.locator('#c').screenshot(path='/tmp/_m.png')
        mk = np.asarray(Image.open('/tmp/_m.png').convert('RGB')).astype(int); mm = (np.abs(mk - np.array([0, 255, 0])).sum(-1) > 60)
        pg.evaluate(f"T.clean('color'); T.view({az},0,18,0.93,8,{W},{H})"); pg.locator('#c').screenshot(path='/tmp/_c.png')
        mc = np.asarray(Image.open('/tmp/_c.png').convert('RGB')).astype(float)
        top = int(GY - 0.07 * PXM); A, B = sm[:top], mm[:top]
        iou = (A & B).sum() / max(1, (A | B).sum()); both = A & B
        dcol = np.abs(sc[:top] - mc[:top]).mean(-1)[both].mean() if both.any() else -1
        print(f'== {name} vs {frame}: overlap {iou:.3f}  sprite-only {(A & ~B).sum() / A.sum():.2f}  model-only {(B & ~A).sum() / A.sum():.2f}  colour diff {dcol:.0f}')
        rows = []
        for yy in [1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]:
            r0, r1 = int(GY - (yy + 0.02) * PXM), int(GY - (yy - 0.02) * PXM)
            def ext(m):
                c = np.where(m[r0:r1].any(0))[0]
                return (f'{(c[0] - W / 2) / PXM:+.2f},{(c[-1] - W / 2) / PXM:+.2f}') if len(c) else '  -  '
            rows.append(f'{yy:.1f}: S[{ext(sm)}] M[{ext(mm)}]')
        for i in range(0, len(rows), 3): print('   ' + '   '.join(rows[i:i + 3]))
        if name == 'front':
            for k, (x0, x1, y0, y1) in REG.items():
                sl = box(x0, x1, y0, y1); s_ = sc[sl].reshape(-1, 3).mean(0); m_ = mc[sl].reshape(-1, 3).mean(0)
                out.append(f'{k}: S({s_[0]:.0f},{s_[1]:.0f},{s_[2]:.0f}) M({m_[0]:.0f},{m_[1]:.0f},{m_[2]:.0f})')
        d = np.zeros((H, W, 3), np.uint8); d[...] = (30, 26, 36); d[sm & mm] = (110, 110, 120); d[sm & ~mm] = (230, 70, 70); d[mm & ~sm] = (70, 140, 240)
        cells += [Image.fromarray(sc.astype(np.uint8)), Image.fromarray(mc.astype(np.uint8)), Image.fromarray(d)]
    for e in errs[:5]: print('ERR', e)
    b.close()
print('colours  ' + '  '.join(out))
sheet = Image.new('RGB', (W * len(cells), H)); [sheet.paste(c, (i * W, 0)) for i, c in enumerate(cells)]
s = 0.36; sheet.resize((int(sheet.width * s), int(sheet.height * s)), Image.LANCZOS).save(f'/home/claude/fox3d/shots/fit_{tag}.png')
