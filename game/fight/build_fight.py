# build_fight.py: builds the fight as one piece. Run from anywhere:  python3 game/fight/build_fight.py
#   out/mf-fight.js             everything the fight needs in one script (three.js r128, the four witches, the three foes, the combat
#                               engine, the five paintings). A page that loads it can call MF_FIGHT.start({...}).
#   out/moon-faire-fight.html   a page of its own that does exactly that.
# The witches' files in fight/witches/ are made by tools/build_witches.py from their own branches. src/stage.js is read, never changed.
import base64, io, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(HERE, 'tools')); import stage_cameras
rd = lambda p: open(os.path.join(G, p), encoding='utf-8').read()
def art(path):
    im = Image.open(os.path.join(G, path)).convert('RGB'); b = io.BytesIO(); im.save(b, 'WEBP', quality=88, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
ART = { 'F1': 'art/pilot/F1.png', 'F2': 'art/fights/F2.png', 'F3': 'art/fights/F3.png', 'F4': 'art/fights/F4.png', 'F5': 'art/fights/F5.png' }
engine = ('// The approved combat engine, unchanged (sim/blob-battle-engine.js), wrapped so its names stay its own.\n'
          'window.MF_ENGINE = window.MF_ENGINE || (function () { var module = { exports: {} };\n' + rd('sim/blob-battle-engine.js') + '\nreturn module.exports; })();')
three = 'if (!window.THREE) {\n' + rd('lib/three.r128.min.js') + '\n}' if '--guard-three' in sys.argv else rd('lib/three.r128.min.js')
parts = [three, rd('models/jester/meshopt_simplifier.js'), rd('models/jester/palette.js'),
         rd('models/jester/jester_tex.js'), rd('models/jester/jester_lod.js'), rd('models/jester/lod.js'),
         rd('fight/witches/fox_tex.js'), rd('fight/witches/fox_lod.js'), rd('fight/witches/ranger_tex.js'), rd('fight/witches/ranger_lod.js'), rd('fight/witches/io_tex.js'), rd('fight/witches/io_lod.js'),
         rd('fight/witches/witch_levels.js'), rd('models/foes/wisp.js'), rd('models/foes/wraith.js'), rd('fight/foes.js'), engine, rd('fight/places.js'),
         'window.MF_FIGHT_ART = {' + ', '.join('%s: "%s"' % (k, art(v)) for k, v in ART.items()) + '};',
         stage_cameras.patched(rd('src/stage.js')), rd('fight/actors.js'), rd('fight/fight.js'), rd('fight/api.js')]
for p in parts: assert '</script' not in p.lower(), 'a script holds a closing tag'
os.makedirs(os.path.join(G, 'out'), exist_ok=True)
js = '\n;\n'.join(parts); open(os.path.join(G, 'out/mf-fight.js'), 'w', encoding='utf-8').write(js)
page = rd('fight/fight.tpl.html').replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
open(os.path.join(G, 'out/moon-faire-fight.html'), 'w', encoding='utf-8').write(page)
print('mf-fight.js %.1f MB, moon-faire-fight.html %.1f MB' % (len(js.encode()) / 1048576, len(page.encode()) / 1048576))
