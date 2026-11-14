# Has Claude Fable 5.2 (high effort, through the key) map the demo: who stands where, what can happen in each of the ten areas, and which
# borrowed Envoi battle backdrop stands in for each fight place. Writes world/world.json. Run from game/: python3 world/make_map.py
import base64, io, json, os, sys, time
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(G, 'people', 'kit'))
import make_person as MP
def pic(path, w):
    im = Image.open(path).convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=84)
    return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
MP.KIT = open(os.path.join(HERE, 'MAP-KIT.md'), encoding='utf-8').read()
content = [{'type': 'text', 'text': open(os.path.join(HERE, 'LORE-BRIEF.md'), encoding='utf-8').read()},
           {'type': 'text', 'text': 'The eleven people, standing beside the Jester (far left) for scale:'}, pic(os.path.join(G, 'people', 'npc', 'review', 'lineup-now-a.jpg'), 1560),
           {'type': 'text', 'text': 'W1, the fair square, as the maker painted it:'}, pic(os.path.join(G, 'art', 'pilot', 'W1.png'), 1200),
           {'type': 'text', 'text': 'F1, the moor clearing, the maker\'s own fight backdrop:'}, pic(os.path.join(G, 'art', 'pilot', 'F1.png'), 800),
           {'type': 'text', 'text': 'The battle backdrops that can be borrowed from the maker\'s earlier game, each labelled with its file name:'}, pic(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/work/world/fight-sheet.jpg', 1536),
           {'type': 'text', 'text': 'Map the demo.'}]
t0 = time.time(); res = MP.ask('claude-fable-5-2', [{'role': 'user', 'content': content}], 48000, 'high')
text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text'); W, _ = json.JSONDecoder().raw_decode(text[text.index('{'):])
W['_made'] = {'by': 'claude-fable-5-2@high', 'cost': MP.cost('claude-fable-5-2', res['usage']), 'seconds': round(time.time() - t0, 1)}
json.dump(W, open(os.path.join(HERE, 'world.json'), 'w'), indent=1)
print('areas', [a['id'] for a in W['areas']], 'people', sum(len(a.get('people', [])) for a in W['areas']), 'things', sum(len(a.get('happens', [])) for a in W['areas']), '$%.2f' % W['_made']['cost'], '%ss' % W['_made']['seconds'])
