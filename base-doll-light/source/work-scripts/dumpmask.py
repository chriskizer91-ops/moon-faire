import sys, base64, json
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np
code = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(); pg.set_default_timeout(900000)
    pg.goto('file:///home/claude/io/test_doll.html?wear=' + code); pg.wait_for_function('window.T && (T.ok || T.err)'); pg.wait_for_timeout(2000)
    r = pg.evaluate("(c)=>{ const t = T.j.wardrobe.paintings(c); const M = t.armMask; return { mw: M.mw, mh: M.mh, m: Array.from(M.m1).join(''), img: t.t.image.toDataURL('image/png') }; }", code)
    b.close()
m = np.array([int(ch) for ch in r['m']], np.uint8).reshape(r['mh'], r['mw'])
import io
im = Image.open(io.BytesIO(base64.b64decode(r['img'].split(',',1)[1]))).convert('RGB')
mk = Image.fromarray(m * 255).resize(im.size)
a = np.asarray(im).astype(float); k = np.asarray(mk)[..., None] > 127
a = np.where(k, a * 0.5 + np.array([0, 255, 0]) * 0.5, a)
Image.fromarray(a.astype(np.uint8)).resize((im.size[0] // 2, im.size[1] // 2)).save('/home/claude/work/%s_mask.jpg' % code)
print('ok', m.sum())
