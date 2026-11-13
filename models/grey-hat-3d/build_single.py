# Builds his page from viewer_n/index.tpl.html:
#   deliver/Noiz_3D_stage1.html   one offline file (three.js, the stage, his paintings, his model and the page, all inline)
#   deliver/index.html            the same page with three.js loaded from cdnjs: this is the one to publish to his link
# usage: python3 -I build_single.py      (after ./build.sh and bake_proj.py)
import base64, io, os, sys, json
R = os.path.dirname(os.path.abspath(__file__)) + '/'; sys.path.insert(0, R + 'tools')
from PIL import Image
from sil import load, mask_of, figures
def uri(im, h, q=84):
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def crop(name, fi, pad=14, h=520):
    a = load(R + 'refs/' + name); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]
    return uri(Image.open(R + 'refs/' + name).convert('RGB').crop((max(0, f[0] - pad), max(0, f[1] - pad), f[2] + pad, f[3] + pad)), h)
def whole(name, box, h=520): return uri(Image.open(R + 'refs/' + name).convert('RGB').crop(box), h)
reg = json.load(open(R + 'out/registration.json'))['front']
def on_him(x0, x1, y0, y1, h=460):          # a box given in metres on him, cut from the front painting
    return whole(reg['name'], (round(reg['c'] + x0 * reg['pxm']), round(reg['y1'] - y1 * reg['pxm']), round(reg['c'] + x1 * reg['pxm']), round(reg['y1'] - y0 * reg['pxm'])), h)
refs = {'front': crop('B1.png', 0), 'back': crop('B1.png', 1), 'side': crop('B2.png', 1), 'chest': on_him(-0.36, 0.36, 0.98, 1.56), 'legs': crop('B4.png', 0, h=480),
        'boot': whole('E5.png', (60, 0, 1194, 1254), 380), 'hand': whole('D1.png', (40, 0, 640, 1254), 460),
        'face': whole('C1.png', (60, 0, 1194, 1254), 460), 'faceq': whole('C3.png', (524, 60, 1010, 760), 460), 'prof': whole('C3.png', (1012, 60, 1536, 760), 460)}
rd = lambda p: open(R + p).read()
t = rd('viewer_n/index.tpl.html')
t = t.replace('/*PAL*/', rd('out/palette.js')).replace('/*STAGE*/', rd('viewer/stage.js')).replace('/*TEX*/', rd('out/noiz_tex.js')).replace('/*MODEL*/', rd('out/noiz.js')).replace('/*REFS*/{}', json.dumps(refs))
assert '<!--THREE-->' in t
os.makedirs(R + 'deliver', exist_ok=True)
off = t.replace('<!--THREE-->', '<script>' + rd('node_modules/three/build/three.min.js').replace('</script>', '<\\/script>') + '</script>')
web = t.replace('<!--THREE-->', '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>')
open(R + 'deliver/Noiz_3D_stage1.html', 'w').write(off); open(R + 'deliver/index.html', 'w').write(web)
print('deliver/Noiz_3D_stage1.html %.2f MB (offline) | deliver/index.html %.2f MB (to publish)' % (len(off) / 1e6, len(web) / 1e6))
