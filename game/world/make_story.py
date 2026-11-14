# Has Claude Opus 5.5 (through the key) lay out story options for the demo: does it have to be lamps? Writes world/story-options.json.
# Run from game/: python3 world/make_story.py [effort]   (high by default. At xhigh with 40,000 tokens the first try spent them all on thinking and wrote nothing.)
import base64, io, json, os, sys, time
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(G, 'people', 'kit'))
import make_person as MP
MODEL = 'claude-opus-5-5'; EFFORT = sys.argv[1] if len(sys.argv) > 1 else 'high'
def pic(path, w):
    im = Image.open(path).convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=84)
    return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
MP.KIT = open(os.path.join(HERE, 'STORY-KIT.md'), encoding='utf-8').read()
W = json.load(open(os.path.join(HERE, 'world.json')))
lines = ['# The map as drafted', '', 'The evening, beat by beat:'] + ['- ' + s for s in W['story']] + ['']
for a in W['areas']:
    lines += ['## %s %s (zone %s, %s)' % (a['id'], a['name'], a['zone'], a.get('light', '')), a['look'], 'Ways out: ' + json.dumps(a.get('exits')), 'Fights: %s. Lamps: %s.' % (json.dumps(a.get('fights')), json.dumps(a.get('lamps')))]
    for p in a.get('people', []): lines.append('- %s, %s: %s Says: %s' % (p['who'], p['where'], p['doing'], ' / '.join(p['says'])))
    for h in a.get('happens', []): lines.append('- %s %s (%s): %s' % (h['code'], h['title'], h['kind'], h['what']))
    lines.append('')
lines += ['## The captain says', json.dumps(W['captain'], indent=1), '', '## Still needed, as the mapper listed it'] + ['- %s (%s)' % (n['what'], n['for']) for n in W['needs']]
content = [{'type': 'text', 'text': open(os.path.join(HERE, 'LORE-BRIEF.md'), encoding='utf-8').read()}, {'type': 'text', 'text': '\n'.join(lines)},
           *[x for a in W['areas'] if a['id'].startswith('W') for x in ({'type': 'text', 'text': '%s %s, as Chris painted it:' % (a['id'], a['name'])}, pic(os.path.join(G, 'art', 'pilot' if a['id'] == 'W1' else 'world', a['id'] + '.png'), 1000))],
           {'type': 'text', 'text': 'F1, the moor clearing, his fight picture for the moor:'}, pic(os.path.join(G, 'art', 'pilot', 'F1.png'), 700),
           {'type': 'text', 'text': 'Chris has since said yes to three rest spots (the party\'s wagon in the fair square, the camp by the pool, the airship at the landing ledge) and yes to wisps drawn to the sparring ring. Lay out the story options.'}]
t0 = time.time(); res = MP.ask(MODEL, [{'role': 'user', 'content': content}], 60000, EFFORT)
json.dump({'usage': res.get('usage'), 'stop': res.get('stop_reason'), 'cost': MP.cost(MODEL, res['usage'])}, open(os.path.join(HERE, 'story-options.usage.json'), 'w'))
text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text'); open(os.path.join(HERE, 'story-options.raw.txt'), 'w').write(text)
S, _ = json.JSONDecoder().raw_decode(text[text.index('{'):])
S['_made'] = {'by': '%s@%s' % (MODEL, EFFORT), 'cost': MP.cost(MODEL, res['usage']), 'seconds': round(time.time() - t0, 1), 'usage': {k: v for k, v in res['usage'].items() if isinstance(v, int)}}
json.dump(S, open(os.path.join(HERE, 'story-options.json'), 'w'), indent=1)
print('options', [o['id'] + ' ' + o['title'] for o in S['options']], 'pick', S['pick']['id'], '$%.2f' % S['_made']['cost'], '%ss' % S['_made']['seconds'], res.get('stop_reason'))
