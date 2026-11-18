# Packs his light version for game code, the way game/people/kit/build_npcs.py packs the fair folk, and builds a test page.
#   python3 -I npc/pack.py [path to a checkout of claude/moon-faire-starter-world's game/ folder]
# Writes npc/greyhat_npc.js: adds him to window.MF_NPCS (people, weights) and window.MF_NPC_TEX. Load it after the fair folk's
# npcs.js and npc_tex.js (or alone, before npc.js), and then:  const cap = await MF_NPC.make('grey-hat-captain');   // a quarter of the triangles
# MF_NPC.make('grey-hat-captain', { weight: 'half' }) or 'full' for more. Everything else is the fair folk's (npc.js).
# Writes npc/out/grey-hat-npc.html: the fair folk's test page with him first.
import base64, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/sw/game'
sys.path.insert(0, os.path.join(GAME, 'people', 'kit'))
from build_viewer import scripts, rd
webp = lambda p: 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
fit = json.load(open(os.path.join(HERE, 'fit.json'))); wts = json.load(open(os.path.join(HERE, 'weights.json'))); wiring = json.load(open(os.path.join(HERE, 'wiring.json')))
wiring.pop('note', None)
person = open(os.path.join(HERE, 'person.js')).read().strip(); skin = open(os.path.join(HERE, 'skin.js')).read().strip()
for t in (person, skin): assert '</script' not in t.lower()
D = ('{ name: %s, who: %s, shapes: %s, shapeId: "grey-hat", skin: "grey-hat", fit: %s, faceFit: %s, skinColour: %s, scale: {},\n  wiring: %s,\n'
     '  SKIN: (function () {\n%s\n  return SKIN; })(),\n  person: function () {\n%s\n  return PERSON; } }') % (
    json.dumps('The Grey Hat'), json.dumps('The airship captain the four meet. Stand-in words: who he is is Chris\'s to say.'), json.dumps('his light version'),
    json.dumps(fit['fit']), json.dumps(fit['faceFit']), json.dumps(fit['skin']), json.dumps(wiring), skin, person)
W = {k: {'weight': v['weight'], 'triangles': v['triangles']} for k, v in wts.items()}
js = ('// Made by models/grey-hat-3d/npc/pack.py on branch claude/grey-hat-3d-model: the Grey Hat captain as one of the fair folk.\n'
      '// Load after the fair folk\'s npcs.js and npc_tex.js (or on its own), before npc.js. Then: await MF_NPC.make(\'grey-hat-captain\').\n'
      '(function () {\n  const N = window.MF_NPCS || (window.MF_NPCS = { people: {}, weights: {} }); N.weights = N.weights || {};\n'
      '  N.people = Object.assign({ \'grey-hat-captain\': %s }, N.people);      // first in the list\n'
      '  N.weights[\'grey-hat\'] = %s;\n'
      '  (window.MF_NPC_TEX || (window.MF_NPC_TEX = {}))[\'grey-hat\'] = { body: %s, face: %s };\n})();\n') % (D, json.dumps(W), json.dumps(webp(os.path.join(HERE, 'body.webp'))), json.dumps(webp(os.path.join(HERE, 'face.webp'))))
open(os.path.join(HERE, 'greyhat_npc.js'), 'w', encoding='utf-8').write(js)
P = os.path.join(GAME, 'people', 'npc')
parts = scripts() + [rd('models/jester/palette.js'), rd('people/npc/emotes.js'), rd('people/npc/npcs.js'), rd('people/npc/npc_tex.js'), js, rd('people/npc/npc.js')]
for p in parts: assert '</script' not in p.lower()
page = rd('people/npc/npc-demo.tpl.html')
page = page.replace('<title>Moon Faire: fair folk who talk</title>', '<title>The Grey Hat: his light version among the fair folk</title>')
page = page.replace('<h1>Fair folk who talk</h1>', '<h1>The Grey Hat, at the fair folk\'s size</h1>')
old = page[page.index('<p class="soft">Moon Faire, November 13.'):page.index('</p>', page.index('<p class="soft">Moon Faire, November 13.')) + 4]
page = page.replace(old, '<p class="soft">Moon Faire, November 16. The captain made as one of the fair folk: the same body, moves and emotes as them, and the same number of triangles. He is first in the list; the fair folk follow, to compare. Drag to look round him.</p>')
page = page.replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); open(os.path.join(HERE, 'out', 'grey-hat-npc.html'), 'w', encoding='utf-8').write(page)
print('greyhat_npc.js', len(js) // 1024, 'KB; page', len(page) // 1024, 'KB')
