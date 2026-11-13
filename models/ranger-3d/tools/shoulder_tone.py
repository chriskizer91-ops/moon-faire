import sys, json
from playwright.sync_api import sync_playwright
JS = '''() => { const tg = T.j.meshes.torso.geometry, ag = T.j.meshes.armL.geometry, tp = tg.attributes.position, tu = tg.attributes.uv, ap = ag.attributes.position, au = ag.attributes.uv;
  const img = T.j.meshes.torso.material.map.image, W = img.width, H = img.height, ctx = img.getContext('2d'), px = ctx.getImageData(0, 0, W, H).data;
  const arm = []; for (let i = 0; i < ap.count; i++) { const v = au.getY(i); if (v > 0.93 && v < 0.97) arm.push([ap.getX(i), ap.getY(i), ap.getZ(i)]); }
  const bins = { top: [0, 0, 0, 0], front: [0, 0, 0, 0], back: [0, 0, 0, 0], all: [0, 0, 0, 0] }; let n = 0;
  for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i); if (x < 0.08 || y < 1.22) continue; let d = 1; for (const a of arm) { const q = Math.hypot(x - a[0], y - a[1], z - a[2]); if (q < d) d = q; }
    if (d > 0.022 || d < 0.004) continue; const u = tu.getX(i), v = tu.getY(i), X = Math.min(W - 1, Math.max(0, Math.round(u * W))), Y = Math.min(H - 1, Math.max(0, Math.round((1 - v) * H))), o = (Y * W + X) * 4, r = px[o], g = px[o + 1], b = px[o + 2];
    if (!(r > 150 && r > g + 25 && g > b + 8)) continue; const k = y > 1.36 ? 'top' : z > 0 ? 'front' : 'back'; for (const kk of [k, 'all']) { bins[kk][0] += r; bins[kk][1] += g; bins[kk][2] += b; bins[kk][3]++; } }
  const out = {}; for (const k in bins) out[k] = bins[k][3] ? [Math.round(bins[k][0] / bins[k][3]), Math.round(bins[k][1] / bins[k][3]), Math.round(bins[k][2] / bins[k][3]), bins[k][3]] : null; out.armRing = arm.length; return out; }'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(); pg.goto('file:///home/claude/ranger/test_r.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000); pg.wait_for_timeout(1500)
    print(json.dumps(pg.evaluate(JS))); b.close()
