# Checks his light version on its test page (npc/out/grey-hat-npc.html): builds him at each weight through MF_NPC.make, counts
# triangles, checks every mesh's lists are as long as its points, plays every emote and talking loop, walks, runs, sits and
# stands, and looks for broken numbers. Then pictures from the page itself.   python3 npc/check.py <out folder>
import os, sys, json
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
JS = '''async (w) => {
  const n = await MF_NPC.make('grey-hat-captain', { weight: w }), J = n.model, out = { weight: n.weight, triangles: n.triangles, bad: [] };
  n.root.updateMatrixWorld(true);
  n.root.traverse((m) => { if (m.isMesh && m.geometry) { const g = m.geometry, c = g.attributes.position.count; for (const a in g.attributes) if (g.attributes[a].count !== c) out.bad.push(m.name + '.' + a); } });
  const broken = () => { for (const b of J.bones) { const e = b.matrixWorld.elements; for (let i = 0; i < 16; i++) if (!isFinite(e[i])) return b.name; } return ''; };
  const run = (s) => { for (let i = 0; i < s * 30; i++) { n.update(1 / 30); n.root.updateMatrixWorld(true); const k = broken(); if (k) return k; } return ''; };
  out.emotes = n.emotes.length; out.moves = {};
  for (const e of n.emotes) { n.emote(e); out.moves[e] = run(3.5) || 'ok'; }
  n.talk(true); out.moves.talk = run(6) || 'ok'; n.talk(false); run(1);
  let done = null; n.walkTo(1.5, 1.0).then((v) => { done = v; }); for (let i = 0; i < 600 && done === null; i++) { out.moves.walk = run(0.1) || 'ok'; await Promise.resolve(); }
  out.walkArrived = done; done = null; n.runTo(-1.5, -1.0).then((v) => { done = v; }); for (let i = 0; i < 600 && done === null; i++) { out.moves.run = run(0.1) || 'ok'; await Promise.resolve(); }
  out.runArrived = done; n.sit(); out.moves.sit = run(3) || 'ok'; out.seated = n.seated; n.emote('wave'); out.moves.seatedWave = run(3) || 'ok'; n.stand(); out.moves.stand = run(3) || 'ok';
  n.dispose(); return out;
}'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(HERE, 'out', 'grey-hat-npc.html')); pg.wait_for_function('window.MF_NPC && document.getElementById("pick").options.length > 0', timeout=180000); pg.wait_for_timeout(4000)
    print('first in the list:', pg.evaluate('document.getElementById("pick").value'), '| people', pg.evaluate('MF_NPC.list().length'))
    for w in ['quarter', 'half', 'full']:
        r = pg.evaluate(JS, w); bad = {k: v for k, v in r['moves'].items() if v != 'ok'}
        print(w, '| triangles', r['triangles'], '| lists wrong:', r['bad'], '| emotes', r['emotes'], '| moves broken:', bad or 'none', '| walked there', r['walkArrived'], 'ran there', r['runArrived'], 'seated', r['seated'])
    pg.screenshot(path=os.path.join(OUT, 'page_top.png'))
    print('errors:', errs[:6])
    b.close()
