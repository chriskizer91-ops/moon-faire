# usage: probe.py 'JS expression returning JSON-able'    runs it on the test page after the model has settled
import sys, json, os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 600, 'height': 600})
    pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:500]))
    pg.goto('file:///home/claude/fox3d/test.html' + os.environ.get('Q',''))
    pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    pg.evaluate('''() => { T.step(60, 1/60);
      T.bb = (key, filt) => { const m = T.j.debug.meshes[key], g = m.geometry, p = g.attributes.position, v = new THREE.Vector3(), lo = [9,9,9], hi = [-9,-9,-9], K = 1.045; m.updateMatrixWorld(true);
        const st = Math.max(1, Math.floor(p.count / 6000));
        for (let i = 0; i < p.count; i += st) { if (m.isSkinnedMesh) { m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); } else { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); }
          const a = [v.x / K, v.y / K, v.z / K]; if (filt && !filt(a)) continue; for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], a[k]); hi[k] = Math.max(hi[k], a[k]); } }
        return lo.concat(hi).map((x) => +x.toFixed(3)); };
      T.bp = (name) => { const v = new THREE.Vector3(); T.j.debug.SK[name].getWorldPosition(v); return [v.x / 1.045, v.y / 1.045, v.z / 1.045].map((x) => +x.toFixed(3)); }; }''')
    print(json.dumps(pg.evaluate(sys.argv[1])))
    b.close()
