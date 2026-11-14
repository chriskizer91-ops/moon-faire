# Has a Claude model (through the key) choose each person's own way of talking and moving from the emote library.
# Writes people/npc/wiring.json. Run after make_emotes.py: python3 people/kit/make_wiring.py
import json, os, re, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_person as MP
NPC = os.path.join(HERE, '..', 'npc'); SK = os.path.join(HERE, '..', 'skins')
src = open(os.path.join(NPC, 'emotes.src.js'), encoding='utf-8').read(); names = re.findall(r'^\s{2}([a-z_]+):\s*\{', src, re.M)
people = []
for pid in ['lampseller', 'fortune', 'watchman', 'baker', 'farmhand']:
    for i, k in enumerate(json.load(open(os.path.join(SK, pid, 'skins.json')))['skins']): people.append({'key': '%s-%s' % (pid, 'ABC'[i]), 'name': k['name'], 'who': k['who'], 'looks': k['face']})
MP.KIT = '''You give the people of a painted fantasy game their own body language. Each person can play any move from one shared library. For each person choose, to fit who they are:
- "talk": one or two talking loops, in the order to alternate them
- "greet": the emote they use to say hello
- "fidgets": one to three idle fidgets
- "pace": how fast they move, 0.8 (slow and old) to 1.15 (quick and young); 1 is ordinary
- "likes": three emotes that are most like them, most typical first
- "moods": which emote they use for each of: "yes", "no", "happy", "unsure", "upset", "thanks", "bye"
Use only names from the library. Make the people differ from one another. Reply with JSON only: an object keyed by each person's key.'''
t0 = time.time(); res = MP.ask('claude-fable-5-2', [{'role': 'user', 'content': 'The library: %s\n\nThe people:\n%s' % (', '.join(names), json.dumps(people, indent=1))}], 16000, 'high')
text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text'); W, _ = json.JSONDecoder().raw_decode(text[text.index('{'):])
for k, w in W.items():
    for f in ('talk', 'fidgets', 'likes'): w[f] = [n for n in w.get(f, []) if n in names]
    w['moods'] = {m: n for m, n in (w.get('moods') or {}).items() if n in names}
    if w.get('greet') not in names: w['greet'] = 'nod'
json.dump({'wiring': W, 'cost': MP.cost('claude-fable-5-2', res['usage']), 'seconds': round(time.time() - t0, 1), 'emotes': names}, open(os.path.join(NPC, 'wiring.json'), 'w'), indent=1)
print('wiring for', len(W), 'people', '$%.3f' % MP.cost('claude-fable-5-2', res['usage']), names)
