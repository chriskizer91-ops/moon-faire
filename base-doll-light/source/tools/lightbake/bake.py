# bake.py CODE [RES] : wear CODE in the test page, bake its full look onto the light model's picture (bake_page.js), and write
# the light model as one file: /home/claude/io/wardrobe_light/CODE_light.js (DOLLLIGHT[CODE] = { parts, body, face, maps }).
import sys, os, json, base64, numpy as np
from playwright.sync_api import sync_playwright
code = sys.argv[1]; RES = int(sys.argv[2]) if len(sys.argv) > 2 else 2048
L = np.load('out/%s_light.npz' % code); meta = json.load(open('out/%s_light.json' % code))
b64 = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
DROP = {'nail': ['hand', 'handR'], 'hbEdge': ['hbCap']}
data = {'res': RES, 'parts': meta['parts'], 'drop': DROP,
        'body': {'pos': b64(L['body/pos'].astype(np.float32)), 'nor': b64(L['body/nor'].astype(np.float32)), 'uv': b64(L['body/uv'].astype(np.float32)),
                 'idx': b64(L['body/idx'].astype(np.uint32)), 'part': b64(L['body/part'].astype(np.uint8))}}
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(); pg.set_default_timeout(1800000); logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e)[:400]))
    pg.goto('file:///home/claude/io/test_doll.html?wear=' + code); pg.wait_for_function('window.T && (T.ok || T.err)'); pg.wait_for_timeout(1500)
    pg.add_script_tag(path='/home/claude/work/lightbake/bake_page.js')
    r = pg.evaluate('(d) => LIGHTBAKE(d)', data); b.close()
print(code, r['stats']); print('\n'.join(l for l in logs if 'GPU stall' not in l)[:2000])
os.makedirs('out/%s_maps' % code, exist_ok=True)
for k in ('albedo', 'emissive', 'orm', 'rim'): open('out/%s_maps/%s.webp' % (code, k), 'wb').write(base64.b64decode(r[k].split(',', 1)[1]))
# the light model's file
# packed small: directions as 16-bit, picture places as 16-bit, bone weights as 8-bit (summing to 255)
nrm = L['body/nor'].astype(np.float64); nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-9)
sw = L['body/sw'].astype(np.float64); sw /= np.maximum(sw.sum(1, keepdims=True), 1e-9); swq = np.floor(sw * 255 + 0.5).astype(np.int32)
swq[np.arange(len(swq)), swq.argmax(1)] += 255 - swq.sum(1)
body = {'pos': b64(L['body/pos'].astype(np.float32)), 'nor16': b64(np.round(nrm * 32767).astype(np.int16)), 'uv16': b64(np.round(np.clip(L['body/uv'], 0, 1) * 65535).astype(np.uint16)),
        'idx': b64(L['body/idx'].astype(np.uint32)), 'si': b64(L['body/si'].astype(np.uint16)), 'sw8': b64(swq.astype(np.uint8))}
face = {}
if 'face/idx' in L.files:
    for a in ('pos', 'nor', 'si', 'sw', 'uv', 'faceMix', 'uvSide', 'uvBody', 'idx'):
        if 'face/' + a in L.files: face[a] = b64(L['face/' + a].astype(np.uint32 if a == 'idx' else np.uint16 if a == 'si' else np.float32))
out = {'code': code, 'parts': meta['parts'], 'keep': meta.get('keep', []), 'tris': int(len(L['body/idx']) + (len(L['face/idx']) if 'face/idx' in L.files else 0) + meta.get('keepTris', 0)), 'body': body, 'face': face,
       'maps': {k: r[k] for k in ('albedo', 'emissive', 'orm', 'rim')}}
os.makedirs('/home/claude/io/wardrobe_light', exist_ok=True)
s = 'window.DOLLLIGHT = window.DOLLLIGHT || {};\nDOLLLIGHT[%s] = %s;\n' % (json.dumps(code), json.dumps(out))
open('/home/claude/io/wardrobe_light/%s_light.js' % code, 'w').write(s)
print('wrote wardrobe_light/%s_light.js, %.1f MB, %d triangles' % (code, len(s) / 1e6, out['tris']))
