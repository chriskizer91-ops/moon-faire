# Packs the painted people for the game and builds their test page. Run from game/: python3 people/kit/build_npcs.py
# Writes people/npc/npcs.js (window.MF_NPCS: each person's shapes, skin fit and wiring), npc_tex.js (window.MF_NPC_TEX: the skin
# pictures), emotes.js (window.MF_EMOTES) and people/out/moon-faire-npcs.html (everything in one file).
import base64, glob, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '..', '..'); sys.path.insert(0, HERE)
from build_viewer import scripts, rd
P = os.path.join(GAME, 'people'); NPC = os.path.join(P, 'npc')
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
webp = lambda p: 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
wiring = json.load(open(os.path.join(NPC, 'wiring.json')))['wiring']; MAKER = {'hand': 'made by hand', 'fable': 'shapes by Fable 5.2', 'opus': 'shapes by Opus 5.5'}
DROPPED = {('opus', 'farmhand')}      # Chris, November 13: the farm lad and the gate keeper on the Opus 5.5 shapes are out (the waist goes missing at the lighter weights)
people, tex, order = [], {}, []
for tag in ['hand', 'fable', 'opus']:
    for pid in ['lampseller', 'fortune', 'watchman', 'baker', 'farmhand']:
        sj = json.load(open(os.path.join(P, 'skins', pid, 'skins.json')))
        for i, k in enumerate(sj['skins']):
            L = 'ABC'[i]; key = '%s-%s' % (pid, L); d = os.path.join(P, 'painted', '%s__%s' % (key, tag))
            if not os.path.exists(d + '/log.json') or (tag, pid) in DROPPED: continue
            lg = json.load(open(d + '/log.json')); j = json.load(open(os.path.join(P, 'skins', pid, L + '.json'))); nid = (k.get('id') or slug(k['name'])) + ('-opus' if tag == 'opus' else '')
            tex[key] = {'body': webp(os.path.join(P, 'skins', pid, L + '-body.webp')), 'face': webp(os.path.join(P, 'skins', pid, L + '-face.webp'))}
            sc = json.load(open(d + '/person-scale.json')) if os.path.exists(d + '/person-scale.json') else {}
            people.append('  %s: { name: %s, who: %s, shapes: %s, shapeId: %s, skin: %s, fit: %s, faceFit: %s, skinColour: %s, scale: %s,\n    wiring: %s,\n    SKIN: (function () {\n%s\n      return SKIN; })(),\n    person: function () {\n%s\n      return PERSON; } }' % (
                json.dumps(nid), json.dumps(k['name'][0].upper() + k['name'][1:]), json.dumps(k['who']), json.dumps(MAKER[tag]), json.dumps(pid if tag == 'hand' else pid + '-' + tag), json.dumps(key), json.dumps(j['fit']), json.dumps(j.get('faceFit', [1, 0, 0])), json.dumps(j['skin']), json.dumps(sc),
                json.dumps(wiring.get(key, {})), open(d + '/skin.js').read().strip(), open(os.path.join(P, lg['person'])).read().strip()))
            order.append(nid)
weights = {}
for f in sorted(glob.glob(os.path.join(P, 'weights', '*.json'))):
    w = json.load(open(f)); weights[w['shapes']] = {'full': {'triangles': w['full']['triangles']}, 'half': {'weight': w['half']['weight'], 'triangles': w['half']['triangles']}, 'quarter': {'weight': w['quarter']['weight'], 'triangles': w['quarter']['triangles']}}
npcs = '// Made by people/kit/build_npcs.py. The people are stand-ins, not Moon Faire lore: names and words are Chris\'s to change.\nwindow.MF_NPCS = { people: {\n' + ',\n'.join(people) + '\n},\n  // lighter builds of each set of shapes (people/kit/make_weights.py): parts left off and the share of each part kept\n  weights: ' + json.dumps(weights) + ' };\n'
open(os.path.join(NPC, 'npcs.js'), 'w', encoding='utf-8').write(npcs)
textures = '// Made by people/kit/build_npcs.py: each skin\'s body sheet and face picture.\nwindow.MF_NPC_TEX = ' + json.dumps(tex) + ';\n'; open(os.path.join(NPC, 'npc_tex.js'), 'w', encoding='utf-8').write(textures)
emotes = '// Made by people/kit/build_npcs.py from emotes.src.js, which Claude Fable 5.2 wrote through the API (people/kit/make_emotes.py).\nwindow.MF_EMOTES = function (FP) {\n' + open(os.path.join(NPC, 'emotes.src.js'), encoding='utf-8').read().strip() + '\nreturn EMOTES; };\n'
open(os.path.join(NPC, 'emotes.js'), 'w', encoding='utf-8').write(emotes)
parts = scripts() + [rd('models/jester/palette.js'), emotes, npcs, textures, rd('people/npc/npc.js')]
for p in parts: assert '</script' not in p.lower()
page = rd('people/npc/npc-demo.tpl.html').replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
open(os.path.join(P, 'out', 'moon-faire-npcs.html'), 'w', encoding='utf-8').write(page)
print('people', len(order), 'page', len(page) // 1024, 'KB')
