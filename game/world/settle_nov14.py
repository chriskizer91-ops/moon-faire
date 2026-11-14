# One-off, November 14: Chris painted the twelve story pictures. Writes them into the map. Run once from game/: python3 world/settle_nov14.py
import json, os
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); p = os.path.join(G, 'world', 'world.json'); W = json.load(open(p, encoding='utf-8'))
for b in W['backdrops']:
    if os.path.exists(os.path.join(G, 'art', 'fights', b['id'] + '.png')): b['own'] = 'art/fights/%s.png' % b['id']; b['was'] = b.get('envoi'); b['fit'] = 'own'
PICS = {'W4-e': ('art/story/S1.png', 'Warm in her hands'), 'W5-e': ('art/story/S2.png', 'The threads'), 'W3-e': ('art/story/S3.png', 'The flight to the crag, shown after this'), 'F5-c': ('art/story/S4.png', 'The lights go home'), 'F5-d': ('art/world/W9-thirteen-lights.png', 'Thirteen lights: the beacon stair painting, changed')}
for a in W['areas']:
    for h in a['happens']:
        if h['code'] in PICS: h['picture'], h['picture_name'] = PICS[h['code']]
for f, n in zip(W['finds'], ['cold-lantern-glass', 'cut-thread', 'warm-stone', 'hollow-amulet', 'keepers-charm']): f['picture'] = 'art/items/%s.png' % n
W['pictures'] = {'title': 'art/story/T1.png', 'lamp': 'art/items/ship-lamp.png', 'after_the_end': {'W4': 'art/world/W4-both-lit.png', 'W9': 'art/world/W9-thirteen-lights.png'}}
seen = []; W['settled'] = [s for s in W['settled'] if not (s in seen or seen.append(s))]
W['settled'] += ["Every fight is seen level, on Moon Faire's own paintings: Chris painted the fair, the standing stones, the beacon stair and the lamp room as fight places on November 14. With his moor clearing that makes five, and no Envoi picture is used any more.",
                 'The story has its pictures: the four story pictures, the two changed paintings, the item sheet (cut into six cards) and the title picture, all painted by Chris on November 14.']
W['questions'] = [q for q in W['questions'] if not q.startswith('Fight pictures')]
json.dump(W, open(p, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); print('backdrops', [(b['id'], b.get('own')) for b in W['backdrops']], 'questions', len(W['questions']))
