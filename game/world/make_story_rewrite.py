# Has Claude Opus 5.5 (high effort, through the key) rewrite the story-carrying parts of the map for the chosen story
# (world/story-chosen.json), then merges them into world/world.json. The old map is in git.   Run from game/: python3 world/make_story_rewrite.py
import base64, io, json, os, sys, time
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(G, 'people', 'kit'))
import make_person as MP
MODEL, EFFORT = 'claude-opus-5-5', 'high'; RAW = os.path.join(HERE, 'story-rewrite.json')
def pic(path, w):
    im = Image.open(path).convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=84)
    return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
W = json.load(open(os.path.join(HERE, 'world.json'))); C = json.load(open(os.path.join(HERE, 'story-chosen.json')))
if '--merge-only' not in sys.argv:
    MP.KIT = open(os.path.join(HERE, 'STORY-REWRITE-KIT.md'), encoding='utf-8').read()
    slim = {'story': W['story'], 'areas': [{k: a[k] for k in ('id', 'zone', 'name', 'light', 'look', 'exits', 'people', 'happens', 'fights', 'lamps') if k in a} for a in W['areas']], 'captain': W['captain'], 'needs': W['needs'], 'settled': W.get('settled')}
    content = [{'type': 'text', 'text': open(os.path.join(HERE, 'LORE-BRIEF.md'), encoding='utf-8').read()}, {'type': 'text', 'text': '# The chosen story\n' + json.dumps(C, indent=1, ensure_ascii=False)},
               {'type': 'text', 'text': '# The map as drafted for the old placeholder story\n' + json.dumps(slim, indent=1, ensure_ascii=False)},
               *[x for a in W['areas'] if a['id'].startswith('W') for x in ({'type': 'text', 'text': '%s %s, as Chris painted it:' % (a['id'], a['name'])}, pic(os.path.join(G, 'art', 'pilot' if a['id'] == 'W1' else 'world', a['id'] + '.png'), 900))],
               {'type': 'text', 'text': 'Rewrite the map for the chosen story.'}]
    t0 = time.time(); res = MP.ask(MODEL, [{'role': 'user', 'content': content}], 64000, EFFORT); cost = MP.cost(MODEL, res['usage'])
    text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text'); open(os.path.join(HERE, 'story-rewrite.raw.txt'), 'w', encoding='utf-8').write(text); print('answer', len(text), 'chars', '$%.2f' % cost, res.get('stop_reason'), flush=True)
    R, _ = json.JSONDecoder().raw_decode(text[text.index('{'):]); R['_made'] = {'by': '%s@%s' % (MODEL, EFFORT), 'cost': cost, 'seconds': round(time.time() - t0, 1)}
    json.dump(R, open(RAW, 'w'), indent=1, ensure_ascii=False); os.remove(os.path.join(HERE, 'story-rewrite.raw.txt'))
R = json.load(open(RAW)); notes = []
for a in W['areas']:
    r = R['areas'].get(a['id'], {})
    for p in a.get('people', []):
        n = r.get('people', {}).get(p['who'])
        if n: p['says'] = n.get('says', p['says']); p['doing'] = n.get('doing', p['doing'])
        else: notes.append('%s: no new lines for %s' % (a['id'], p['who']))
    extra = [w for w in r.get('people', {}) if w not in [p['who'] for p in a.get('people', [])]]
    if extra: notes.append('%s: lines for people who are not there: %s' % (a['id'], extra))
    if r.get('happens'): a['happens'] = r['happens']
    else: notes.append('%s: no things that can happen' % a['id'])
    if r.get('fights'): a['fights'] = r['fights']
    if not any(h.get('witch') and h['kind'] != 'fight' for h in a['happens']): notes.append('%s: no witch beat outside a fight' % a['id'])
codes = {h['code'] for a in W['areas'] for h in a['happens']}
for f in R.get('finds', []):
    if f['code'] not in codes: notes.append('find %s has no thing with that code' % f['code'])
W['story'] = R['story']; W['captain'] = R['captain']; W['finds'] = R.get('finds', []); W['needs'] = R['needs']; W['invented'] = R.get('invented', [])
W['questions'] = R.get('questions', []) + ['Fight pictures: seen level, or from above? See "The two kinds of fight picture" on this page.', "Where is the fair gate? It is drafted in the mooring field (W3), with the fair square's left and near paths shut."]
W['chosen'] = C; W['_made']['story_rewrite'] = R['_made']
W['settled'] = [s for s in W.get('settled', []) if not s.startswith('The story is open again')] + ['The story: Chris asked Claude to think about the witches and choose (November 13, late). Chosen: "The fire that would not end". The map\'s lines and things that can happen were rewritten for it by Opus 5.5.']
json.dump(W, open(os.path.join(HERE, 'world.json'), 'w'), indent=1, ensure_ascii=False)
print('merged. things:', sum(len(a['happens']) for a in W['areas']), 'finds:', len(W['finds']), 'witch beats:', {w: sum(1 for a in W['areas'] for h in a['happens'] if h.get('witch') == w) for w in ('Ranger', 'Io', 'Fox', 'Jester')}, 'notes:', notes)
