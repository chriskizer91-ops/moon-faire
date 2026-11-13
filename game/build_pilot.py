# Builds out/moon-faire-pilot.html: the pilot page as one offline file (three.js r128, the Jester, the wisp, the combat
# engine and both paintings inside it). Run from game/: python3 build_pilot.py
import base64, io, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(HERE, p), encoding='utf-8').read()
def art(code):
    im = Image.open(os.path.join(HERE, 'art/pilot/%s.png' % code)).convert('RGB'); b = io.BytesIO(); im.save(b, 'WEBP', quality=90, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
engine = ('// The approved combat engine, unchanged (lore/sim/blob-battle-engine.js), wrapped so its names stay its own.\n'
          'window.MF_ENGINE = (function () { var module = { exports: {} };\n' + rd('sim/blob-battle-engine.js') + '\nreturn module.exports; })();')
parts = [rd('lib/three.r128.min.js'), rd('models/jester/meshopt_simplifier.js'), rd('models/jester/jester_tex.js'), rd('models/jester/jester_lod.js'), rd('models/jester/lod.js'),
         rd('models/foes/wisp.js'), engine, rd('pilot/scenes-pilot.js'), rd('pilot/greybox.js'), rd('src/scenes.js'),
         'window.MF_ART = { W1: "%s", F1: "%s" };' % (art('W1'), art('F1')),
         rd('src/stage.js'), rd('src/field.js'), rd('src/fight.js'), rd('src/main.js')]
for p in parts: assert '</script' not in p.lower(), 'a script holds a closing tag'
page = rd('src/pilot.tpl.html').replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
open(os.path.join(HERE, 'out/moon-faire-pilot.html'), 'w', encoding='utf-8').write(page)
print('pilot page', len(page) // 1024, 'KB')
