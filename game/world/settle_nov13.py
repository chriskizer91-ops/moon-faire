# One-off, November 13: writes Chris's answers into the map and the people's notes. Run once from game/: python3 world/settle_nov13.py
# - yes to three rest spots (the party's wagon in W1, the camp in W6, the airship at W8); yes to wisps drawn to the sparring ring
# - where a person's 3D model looks different from their note, the note changes (lamp-seller, lamplighter, gate keeper)
import json, os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); rd = lambda p: open(os.path.join(G, p), encoding='utf-8').read()
def wr(p, s): open(os.path.join(G, p), 'w', encoding='utf-8').write(s)
NOTES = {  # skins folder, key -> (id kept for code, name, new note)
    ('lampseller', 'Old lamp-seller'): ('old-lamp-seller', 'Lamp-seller', 'A small woman in an ochre kerchief who has sold oil lamps and wicks at the fair all her life.'),
    ('fortune', 'Old lamplighter'): ('old-lamplighter', 'Old lamplighter', 'An elderly woman in a red dress and headscarf who walks the fair at dusk, lighting and trimming the lanterns along the stalls.'),
    ('farmhand', 'Gate keeper'): ('gate-keeper', 'Gate keeper', 'A stern middle-aged man in a flat hat and waistcoat who takes the coins at the fair gate and watches who comes and goes after dark.')}
npcs = rd('people/npc/npcs.js'); brief = rd('world/LORE-BRIEF.md')
for (pid, old), (nid, name, who) in NOTES.items():
    p = 'people/skins/%s/skins.json' % pid; J = json.loads(rd(p)); k = [k for k in J['skins'] if k['name'] in (old, name)][0]; was = k['who']
    k['id'] = nid; k['name'] = name; k['who'] = who; wr(p, json.dumps(J, indent=1, ensure_ascii=False))
    n = npcs.count(json.dumps(was)); npcs = npcs.replace('name: %s, who: %s' % (json.dumps(old), json.dumps(was)), 'name: %s, who: %s' % (json.dumps(name), json.dumps(who)))
    brief = brief.replace(was, who); print(nid, 'npcs.js notes changed:', n)
wr('people/npc/npcs.js', npcs)
brief = brief.replace('- W6 the still pool and the broken arch (5 lamps): a camp, a rest spot.', '- W6 the still pool and the broken arch (5 lamps): a camp, a rest spot.\n- Rest spots (Chris, November 13): three. The party\'s own wagon in the fair square (W1), the camp by the pool (W6) and the airship at the landing ledge (W8).')
brief = brief.replace('practice bouts in the ring.', 'practice bouts in the ring against wisps drawn to its lamps (Chris, November 13).')
wr('world/LORE-BRIEF.md', brief)
W = json.loads(rd('world/world.json')); H = {h['code']: h for a in W['areas'] for h in a.get('happens', [])}
for a in W['areas']:
    for p in a.get('people', []):
        if p['who'] == 'old-lamp-seller': p['says'] = [s.replace("Forty years I've sold lamps.", "I've sold lamps since I could count change.") for s in p['says']]
H['W1-b'].update(what="The moon-painted wagon is the party's own and the first rest spot: they wake here after any loss at the fair.", needs='nothing new (Chris said yes, November 13)')
H['W1-d']['what'] = H['W1-d']['what'].replace('The old lamp-seller', 'The lamp-seller')
H['W2-b'].update(needs='nothing new (Chris said yes to wisps, November 13)')
H['W8-b'].update(what='A rest spot at the ladder: a loss on the stair or in the lamp room wakes the party here and not back at the pool.', needs='nothing new (Chris said yes, November 13)')
W['settled'] = ["Three rest spots: the party's own wagon in the fair square, the camp by the pool, and the airship at the landing ledge.",
                'The sparring ring: the party fights wisps that keep drifting to the ring lamps.',
                "Where a person's 3D model looks different from their note, the note changes. Three notes changed: the lamp-seller is no longer called old, the old lamplighter is an elderly woman, and the gate keeper is a man in a flat hat and waistcoat.",
                'The story is open again: does it have to be lamps? Opus 5.5 laid out options (below).']
W['questions'] = ['Which story? See "Does it have to be lamps?" on this page.',
                  'Fight pictures: seen level, or from above? See "The two kinds of fight picture" on this page.',
                  "Where is the fair gate? It is drafted in the mooring field (W3), with the fair square's left and near paths shut."]
wr('world/world.json', json.dumps(W, indent=1, ensure_ascii=False))
