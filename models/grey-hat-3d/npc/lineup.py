# Him beside some of the fair folk, at the game's weight, on the kit's stage.   python3 npc/lineup.py <out.jpg> [weight]
import os, sys, io
from PIL import Image
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); G = '/home/claude/sw/game'
W = sys.argv[2] if len(sys.argv) > 2 else 'quarter'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1500, 'height': 640})
    pg.goto('file://' + G + '/people/out/person-stage.html'); pg.wait_for_function('window.PV && PV.ready', timeout=120000)
    for f in [G + '/models/jester/palette.js', G + '/people/npc/emotes.js', G + '/people/npc/npcs.js', G + '/people/npc/npc_tex.js', HERE + '/greyhat_npc.js', G + '/people/npc/npc.js']: pg.add_script_tag(path=f)
    ids = ['old-lamp-seller', 'grey-hat-captain'] + [i for i in pg.evaluate('MF_NPC.list()') if i not in ('old-lamp-seller', 'grey-hat-captain') and not i.endswith('-opus')][:4]
    r = pg.evaluate('''async ([ids, w]) => { const st = PV.stage, out = [];
      st.cast.traverse((o) => { if (o.isSkinnedMesh) o.visible = false; });
      for (let i = 0; i < ids.length; i++) { const n = await MF_NPC.make(ids[i], { weight: w }); n.root.position.set((i - (ids.length - 1) / 2) * 0.72, 0, 0); st.cast.add(n.root); for (let k = 0; k < 40; k++) n.update(1 / 30); out.push([ids[i], n.name, n.triangles]); }
      PV.draw('front'); const c = st.camera; c.position.set(0, 1.0, 9.5); c.fov = 22; c.aspect = 1500 / 640; c.updateProjectionMatrix(); c.lookAt(0, 0.95, 0); c.updateMatrixWorld(); st.render(); return out; }''', [ids, W])
    pg.wait_for_timeout(500); pg.screenshot(path=sys.argv[1]); print(r)
    b.close()
