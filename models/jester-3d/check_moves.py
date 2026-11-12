# Runs every move over every stance in a headless browser and reports errors and broken numbers.
# usage: python3 check_moves.py [move ...]      (no names: every move)
import sys, json
from playwright.sync_api import sync_playwright
only = sys.argv[1:]
JS = r"""
(only) => { const J = T.j, bad = [], names = Object.keys(J.ACTIONS).filter((n) => !only.length || only.indexOf(n) >= 0), stances = [''].concat(J.STANCES);
  const finite = () => { for (const b of J.bones) { const q = b.quaternion, p = b.position; if (!(isFinite(q.x + q.y + q.z + q.w + p.x + p.y + p.z))) return 'bone ' + b.name; }
    for (const c of J.debug.cloths) { const a = c.geo.attributes.position.array; for (let i = 0; i < a.length; i += 97) if (!isFinite(a[i])) return 'cloth'; }
    let f = ''; J.fx.traverse((o) => { if (o.visible && !(isFinite(o.position.x + o.position.y + o.position.z + o.scale.x + o.scale.y + o.quaternion.w))) f = 'fx ' + (o.name || o.type); }); return f; };
  let n = 0;
  for (const s of stances) for (const a of names) { n++;
    try { J.reset(); J.charge = 0.7; J.setStance(s); T.step(Math.round(2.4 * 20), 1 / 20); J.play(a, true); const fr = Math.round((J.ACTIONS[a].dur + 2.4) * 30);
      for (let i = 0; i < fr; i++) { T.step(1, 1 / 30); if (i % 45 === 20) T.stage.render(); const f = finite(); if (f) { bad.push([s || 'stand', a, 't=' + (i / 30).toFixed(2), f]); break; } }
      if (J.action === a) bad.push([s || 'stand', a, 'did not end']);
    } catch (e) { bad.push([s || 'stand', a, String(e && e.stack || e).slice(0, 300)]); } }
  return { pairs: n, bad }; }
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 400, 'height': 500}); logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:400]) if m.type in ('error', 'warning') and 'GPU stall' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    pg.goto('file:///home/claude/work/test.html?o=' + json.dumps({'detail': 0.5, 'textureScale': 0.5}))
    pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    pg.evaluate('T.stage.resize(200, 260, 1)')
    r = pg.evaluate(JS, only)
    print('pairs run:', r['pairs'], ' problems:', len(r['bad']))
    for x in r['bad']: print('  ', x)
    for l in sorted(set(logs))[:20]: print(l)
    b.close()
