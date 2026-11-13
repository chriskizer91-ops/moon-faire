# one offline file: deliver/Ranger_3D_stage2d.html (three.js, the stage, her textures, her model and the page, all inline)
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
t = open(R + 'viewer_r/index.tpl.html').read()
rd = lambda p: open(R + p).read()
t = t.replace('/*THREE*/', rd('node_modules/three/build/three.min.js').replace('</script>', '<\\/script>')).replace('/*PAL*/', rd('out/palette.js')).replace('/*STAGE*/', rd('viewer/stage.js'))
t = t.replace('/*TEX*/', rd('out/ranger_tex.js')).replace('/*MODEL*/', rd('out/ranger.js')).replace('/*REFS*/{}', json.dumps(refs))
open(R + 'deliver/Ranger_3D_stage2d.html', 'w').write(t); print('deliver/Ranger_3D_stage2d.html', round(len(t) / 1e6, 2), 'MB')
