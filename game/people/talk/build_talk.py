#!/usr/bin/env python3
"""build_talk.py: the two writers' files joined into what the game reads.

  python3 -I game/people/talk/build_talk.py            (from the repo's top folder, or anywhere)

Reads lines-A.json and lines-B.json beside it, checks them with check_lines.py, and writes
  lines.json   everything, as data
  lines.js     the same as window.MF_LINES, for a page
  out/moon-faire-fair-folk-lines.html   every line laid out to read, person by person
"""
import json, os, subprocess, sys, html
HERE = os.path.dirname(os.path.abspath(__file__))
files = [os.path.join(HERE, f) for f in ('lines-A.json', 'lines-B.json') if os.path.exists(os.path.join(HERE, f))]
if not files: sys.exit('no lines-A.json or lines-B.json yet')
r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'check_lines.py')] + files, capture_output=True, text=True)
print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr)
if r.returncode and '--anyway' not in sys.argv: print(r.stdout); sys.exit('the lines do not pass the check (add --anyway to build regardless)')
people, pairs = {}, []
for f in files:
    D = json.load(open(f, encoding='utf-8')); people.update(D.get('people', {})); pairs += D.get('pairs', [])
ORDER = ['old-lamp-seller', 'ribbon-dyer', 'fortune-teller', 'ballad-singer', 'fair-baker', 'old-night-watchman', 'pie-seller', 'gate-keeper', 'chestnut-roaster', 'captain', 'old-lamplighter', 'farm-lad']
people = {k: people[k] for k in ORDER if k in people}
out = {'people': people, 'pairs': pairs}
json.dump(out, open(os.path.join(HERE, 'lines.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'lines.js'), 'w', encoding='utf-8').write('// made by build_talk.py from lines-A.json and lines-B.json: do not edit by hand\nwindow.MF_LINES = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')

# ---- the page to read ----
NAME = {'old-lamp-seller': 'The lamp-seller', 'ribbon-dyer': 'The ribbon-dyer', 'fortune-teller': 'The fortune-teller', 'ballad-singer': 'The ballad-singer', 'fair-baker': 'The baker', 'old-night-watchman': 'The night watchman', 'pie-seller': 'The pie-seller', 'gate-keeper': 'The gate keeper', 'chestnut-roaster': 'The chestnut roaster', 'captain': 'The captain', 'old-lamplighter': 'The old lamplighter', 'farm-lad': 'The farm lad'}
STAGE = ['at dusk', 'once the lamps have flown', 'while lamps are coming home', 'with all twelve home', 'while the four are on the crag', 'after the end']
NEWS = {'lamps-gone': 'the lamps flew', 'first-lamp': 'a lamp came home', 'wisp-warmed': 'Io warmed a wisp', 'wraith-down': 'the thing at the stones is gone', 'card': 'the Jester’s card', 'wick': 'the wick went out', 'pie': 'the captain got his pie', 'flat': 'the four were knocked flat', 'stitched': 'the Fox sewed the flames down', 'beacon': 'a light on the crag'}
JUST = {'won': 'she has just won a fight', 'lost': 'the four were knocked flat', 'hurt': 'one of the four is hurt', 'away': 'she has been away a long while', 'lamp': 'a lamp has come home since'}
DOING = {'work': 'at work', 'rest': 'sitting down', 'warm': 'warming at a fire', 'walk': 'walking somewhere', 'watch': 'watching the east', 'chat': 'talking with someone'}
HAS = {'glass': 'the cold lantern glass', 'thread': 'the cut thread', 'stone': 'the warm stone', 'amulet': 'the hollow amulet', 'charm': 'the keeper’s charm'}
SLOT = [('hello', 'The first hello'), ('stage', 'What they make of the night'), ('count', 'As they get to know her'), ('just', 'After something has just happened'), ('gossip', 'About other people and news'), ('level', 'How the four are getting on'), ('lamps', 'Counting lamps'), ('thing', 'Finds and errands'), ('doing', 'Caught doing something'), ('bark', 'Called out as she passes')]
def stages(s): return STAGE[s[0]] if s[0] == s[1] else 'from ' + STAGE[s[0]].replace('at ', '').replace('once ', '').replace('while ', '').replace('with ', '') + ' to ' + STAGE[s[1]].replace('at ', '').replace('once ', '').replace('while ', '').replace('with ', '')
def when(w):
    b = []
    if 'stage' in w: b.append(stages(w['stage']))
    if 'talks' in w: t = w['talks']; b.append('first meeting' if t == [0, 0] else 'second talk' if t == [1, 1] else 'talk %d and on' % (t[0] + 1) if t[1] >= 99 else 'talks %d to %d' % (t[0] + 1, t[1] + 1))
    if 'met' in w: b.append('she has met ' + NAME.get(w['met'], w['met']).replace('The ', 'the '))
    if 'heard' in w: b.append('has heard: ' + NEWS.get(w['heard'], w['heard']))
    if 'lamps' in w: l = w['lamps']; b.append('%d lamps home' % l[0] if l[0] == l[1] else '%d to %d lamps home' % tuple(l))
    if 'level' in w: l = w['level']; b.append('level %d to %d' % tuple(l))
    if 'just' in w: b.append(JUST[w['just']])
    if 'doing' in w: b.append(DOING[w['doing']])
    if 'has' in w: b.append('she carries ' + HAS[w['has']])
    if 'errand' in w: k, v = list(w['errand'].items())[0]; b.append(('the %s errand is under way' if v == 'open' else 'the %s errand is done') % k)
    if 'where' in w: b.append('in the mooring field' if w['where'] == 'W3' else 'on the landing ledge')
    return ', '.join(b) or 'any time'
E = html.escape; body = []
body.append('<nav>' + ' '.join('<a href="#%s">%s</a>' % (k, E(NAME[k].replace('The ', ''))) for k in people) + ' <a href="#pairs">overheard</a></nav>')
for k, R in people.items():
    body.append('<section id="%s"><h2>%s</h2><p class="guess"><b>Their guess about the wisps:</b> %s</p>' % (k, E(NAME[k]), E(R.get('guess', ''))))
    if R.get('invented'): body.append('<p class="inv"><b>Made up for them:</b> ' + E(' '.join(x if x.endswith('.') else x + '.' for x in R['invented'])) + '</p>')
    for s, title in SLOT:
        L = [l for l in R['lines'] if l['slot'] == s]
        if not L: continue
        body.append('<h3>%s</h3>' % title)
        for l in sorted(L, key=lambda l: (l['when'].get('stage', [9])[0], l['when'].get('talks', [0])[0])) if s in ('stage', 'hello', 'count') else L:
            body.append('<div class="ln"><p class="t">%s</p><p class="w">%s</p></div>' % (E(l['text']), E(when(l.get('when', {})))))
    body.append('</section>')
body.append('<section id="pairs"><h2>Overheard: two of them talking</h2>')
for pr in pairs:
    body.append('<div class="pair"><p class="w">%s and %s%s%s</p>' % (E(NAME[pr['who'][0]]), E(NAME[pr['who'][1]].replace('The ', 'the ')), (', ' + stages(pr['when']['stage'])) if pr.get('when', {}).get('stage') else '', (', passing on: ' + NEWS.get(pr['news'], pr['news'])) if pr.get('news') else ''))
    for l in pr['lines']: body.append('<p class="t"><b>%s:</b> %s</p>' % (E(NAME[l['by']].replace('The ', '')), E(l['text'])))
    body.append('</div>')
body.append('</section>')
n = sum(len(R['lines']) for R in people.values())
page = '''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Moon Faire: what the fair folk say</title>
<style>
:root { --bg: #1d1222; --panel: #2a1c31; --text: #f4ead8; --muted: #c4b2c2; --gilt: #d9a75a; --gilt-hi: #ffd99a; --paper: #f3e3c3; --ink: #26172b; --paper-muted: #6a4a5e; }
* { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.5 Georgia, 'Iowan Old Style', serif; }
main { max-width: 720px; margin: 0 auto; padding: 18px 14px 60px; }
h1 { font-weight: 400; font-size: 28px; color: var(--gilt-hi); margin: 8px 0 4px; } .lede { color: var(--muted); margin: 0 0 14px; }
nav { position: sticky; top: 0; background: var(--bg); padding: 8px 0; display: flex; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid rgba(217,167,90,.3); z-index: 2; }
nav a { color: var(--gilt-hi); text-decoration: none; font-size: 13px; padding: 4px 9px; border: 1px solid rgba(217,167,90,.45); border-radius: 12px; }
h2 { font-weight: 400; font-size: 23px; color: var(--gilt-hi); margin: 30px 0 6px; scroll-margin-top: 90px; } section { scroll-margin-top: 90px; }
h3 { font: 700 12px/1.2 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: var(--gilt); margin: 20px 0 8px; }
.guess, .inv { margin: 4px 0; color: var(--muted); font-size: 14.5px; } .guess b, .inv b { color: var(--text); font-weight: 600; }
.ln, .pair { background: var(--paper); color: var(--ink); border-radius: 13px 16px 12px 15px; padding: 9px 13px; margin: 0 0 8px; }
.t { margin: 0; } .w { margin: 3px 0 0; font: 12.5px/1.3 system-ui, sans-serif; color: var(--paper-muted); } .pair .w { margin: 0 0 4px; } .pair .t { margin: 2px 0; }
</style></head><body><main>
<h1>What the fair folk say</h1>
<p class="lede">%d lines for %d people, and %d overheard exchanges. Under each line is when it can be said. The game picks the most particular line that fits and that the person has not said yet. Names and small made-up facts are stand-ins until you say otherwise.</p>
%s
</main></body></html>''' % (n, len(people), len(pairs), '\n'.join(body))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
open(os.path.join(HERE, 'out', 'moon-faire-fair-folk-lines.html'), 'w', encoding='utf-8').write(page)
print('built: %d people, %d lines, %d pairs' % (len(people), n, len(pairs)))
