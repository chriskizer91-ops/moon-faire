# Io's painted profile (C3, right-hand figure) beside the model's middle line, millimetre by millimetre.
# C3: 2169 px per model metre (eye line to lip line = 0.0627 m, as on the model); eye y 420 = 1.511 m; tip of the nose x 1513 = 0.107 m forward.
# usage: python3 tools/prof_io.py [step] [out.png]
import sys, numpy as np
sys.path.insert(0, '/home/claude/io/tools')
from sil import load, mask_of
from playwright.sync_api import sync_playwright
PXM, EYE_Y, EYE_H, NOSE_X, NOSE_Z = 2060.6 / 0.95, 420.0, 1.511, 1513.0, 0.107
Ym = lambda y: EYE_H + (EYE_Y - y) / PXM
Zm = lambda x: NOSE_Z + (x - NOSE_X) / PXM
def measure():
    a = load('/home/claude/io/refs/C3.png'); m, _ = mask_of(a); m[:, :1046] = False
    front = {}
    for y in range(270, 652):
        xs = np.nonzero(m[y])[0]
        if len(xs): front[y] = float(xs.max())
    ys = sorted(front); xs = np.array([front[y] for y in ys]); xs5 = np.convolve(np.pad(xs, 2, mode='edge'), np.ones(5) / 5, mode='valid')
    painted = np.array([[Ym(y), Zm(x)] for y, x in zip(ys, xs5)])[::-1]          # rising in height
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
        pg = b.new_page(); pg.goto('file:///home/claude/io/test_io.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
        if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
        mdl = np.array(pg.evaluate('''(() => { const d = T.j.debug, out = []; for (let i = 0; i <= 6000; i++) { const p = d.headPoint(0, 0.9 + (Math.PI - 0.9) * i / 6000); out.push([p[1], p[2]]); } return out; })()'''))
        b.close()
    o = np.argsort(mdl[:, 0]); return painted, mdl[o]
if __name__ == '__main__':
    painted, mdl = measure()
    step = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    print('height   painted  model   model - painted (mm)')
    for Y, Z in painted[::step]:
        if Y < mdl[0, 0] or Y > mdl[-1, 0]: continue
        zm = np.interp(Y, mdl[:, 0], mdl[:, 1]); print('%.4f   %.4f  %.4f  %+5.1f' % (Y, Z, zm, (zm - Z) * 1000))
    if len(sys.argv) > 2:
        from PIL import Image, ImageDraw
        S = 3000.0; W, H = 520, 900; im = Image.new('RGB', (W, H), (30, 26, 36)); d = ImageDraw.Draw(im)
        P = lambda Y, Z: (W - 60 - (0.125 - Z) * S, 40 + (1.66 - Y) * S)
        d.line([P(Y, Z) for Y, Z in painted], fill=(240, 80, 80), width=2); d.line([P(Y, Z) for Y, Z in mdl if 1.39 < Y < 1.66], fill=(90, 160, 250), width=2)
        for Y in np.arange(1.40, 1.66, 0.02): d.line([(0, P(Y, 0)[1]), (W, P(Y, 0)[1])], fill=(60, 54, 70)); d.text((4, P(Y, 0)[1] - 11), '%.2f' % Y, fill=(170, 160, 185))
        d.text((8, 8), 'red: painted profile (C3)   blue: the model', fill=(230, 225, 240)); im.save(sys.argv[2])
