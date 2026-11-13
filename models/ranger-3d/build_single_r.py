# one offline file: deliver/Ranger_3D_stage9.html (three.js, the stage, her textures, her model and the page, all inline)
import base64, io, sys
sys.path.insert(0, '/home/claude/ranger/tools')
from PIL import Image
from sil import load, mask_of, figures
R = '/home/claude/ranger/'
def crop(name, fi, pad=14, h=520, box=None):
    a = load(R + 'refs/' + name); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]
    x0, y0, x1, y1 = (f[0] - pad, f[1] - pad, f[2] + pad, f[3] + pad) if box is None else box
    im = Image.open(R + 'refs/' + name).convert('RGB').crop((max(0, x0), max(0, y0), x1, y1)); im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=84); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
import json
def whole(name, box, h=520):
    im = Image.open(R + 'refs/' + name).convert('RGB').crop(box); im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=84); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
refs = {'face': whole('J1.png', (60, 0, 1194, 1254)), 'faceq': whole('J3.png', (524, 40, 1010, 700)), 'prof': whole('J3.png', (1012, 40, 1536, 700)), 'hback': whole('C5.png', (548, 40, 1024, 700)), 'top': whole('C8.png', (150, 0, 1104, 1160)), 'below': whole('C7.png', (100, 60, 1154, 1254)), 'front': crop('B1.png', 0), 'back': crop('B1.png', 1), 'side': crop('B2.png', 0), 'legs': crop('B3.png', 0, h=480), 'boot': crop('E5.png', 0, h=360)}
refs.update({'handLb': whole('D1.png', (70, 20, 620, 790)), 'handLp': whole('D1.png', (640, 20, 1190, 790)), 'handRb': whole('D2.png', (30, 20, 580, 790)), 'handRp': whole('D2.png', (680, 20, 1230, 790)), 'armL': whole('D1.png', (90, 0, 600, 1254)), 'armR': whole('D2.png', (40, 0, 550, 1254))})
refs['hairS'] = whole('C3.png', (1012, 20, 1536, 700))
refs.update({'bootQ': whole('E5.png', (60, 0, 1194, 1254)), 'bootS': whole('E1.png', (100, 40, 1180, 1240)), 'bootF': whole('E3.png', (160, 40, 1100, 1240)), 'bootB': whole('E4.png', (300, 40, 960, 1240)), 'bootT': whole('E6.png', (330, 0, 930, 1254))})
def on_her(name, cx, soles, ppm, x0, x1, y0, y1): return whole(name, (round(cx + x0 * ppm), round(soles - y1 * ppm), round(cx + x1 * ppm), round(soles - y0 * ppm)))       # a box given in metres on her
A1, A2 = ('A1.png', 512.5, 1507, 898), ('A2.png', 507, 1505, 898)
refs.update({'gearF': on_her(*A1, -0.29, 0.29, 0.70, 1.10), 'gearB': on_her(*A2, -0.29, 0.29, 0.70, 1.10), 'gearBk': on_her(*A1, -0.15, 0.15, 0.90, 1.06), 'hookF': on_her(*A1, -0.185, -0.045, 1.27, 1.375), 'hookB': on_her(*A2, -0.18, -0.04, 1.275, 1.38),
             'charmF': on_her(*A1, -0.30, 0.30, 0.62, 1.02), 'charmS': whole('F7.png', (60, 50, 620, 840)),
             'gearSat': whole('F6.png', (40, 432, 520, 942)), 'gearPou': whole('F6.png', (1262, 492, 1488, 880))})
t = open(R + 'viewer_r/index.tpl.html').read()
rd = lambda p: open(R + p).read()
t = t.replace('/*THREE*/', rd('node_modules/three/build/three.min.js').replace('</script>', '<\\/script>')).replace('/*PAL*/', rd('out/palette.js')).replace('/*STAGE*/', rd('viewer/stage.js'))
t = t.replace('/*TEX*/', rd('out/ranger_tex.js')).replace('/*MODEL*/', rd('out/ranger.js')).replace('/*REFS*/{}', json.dumps(refs))
open(R + 'deliver/Ranger_3D_stage9.html', 'w').write(t); print('deliver/Ranger_3D_stage9.html', round(len(t) / 1e6, 2), 'MB')
