# Builds the demo's map page from world/world.json and world/scenes/*.json: out/moon-faire-demo-map.html (one offline file),
# world/prompts.md, and out/Moon_Faire_Demo_Painting_Starters.zip (the guides, the two reference pictures and the prompts).
# Run from game/: python3 world/build_world_page.py
import base64, glob, html, io, json, os, re, zipfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); OUT = os.path.join(G, 'out'); E = html.escape
W = json.load(open(os.path.join(HERE, 'world.json'))); RULES = open(os.path.join(G, 'pilot', 'prompts', 'standing-rules.txt'), encoding='utf-8').read().strip()
def jpg(path, w, crop=None, q=82):
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
# faces of the fair folk, from their painted sheets (the version the reviewer preferred where a person exists twice)
PREF = {'lampseller': 'hand', 'fortune': 'fable', 'farmhand': 'fable', 'watchman': 'opus', 'baker': 'opus'}; faces, names = {}, {}
for pid, tag in PREF.items():
    for i, k in enumerate(json.load(open(os.path.join(G, 'people', 'skins', pid, 'skins.json')))['skins']):
        f = os.path.join(G, 'people', 'painted', '%s-%s__%s' % (pid, 'ABC'[i], tag), 'final.jpg'); faces[slug(k['name'])] = jpg(f, 96, (912, 6, 1086, 180)); names[slug(k['name'])] = k['name'][0].upper() + k['name'][1:]
HOUR = {'dusk': 'It is dusk, as in Image 2: a deep blue-violet sky with a last low band of rose and amber, and the lanterns just lit.',
        'night': 'It is full night on the open moor. The painting is darker and cooler than Image 2: moonlit silver and violet, with deep blue shadows that are never black. The ground the characters walk on is still clearly readable by moonlight. The only warm lights are the ones the guide shows.',
        'deep night': 'It is the darkest hour, on a bare crag far from the fair. The painting is darker, colder and starker than Image 2: slate, iron-blue and pale moon-silver, with shadows that are deep but never black. The ground the characters walk on is still clearly readable by moonlight. The only warm lights are the ones the guide shows.'}
def prompt(S, area):
    P = S['painting']; hour = HOUR.get(area['light'], HOUR['night'])
    return '''One production background painting for my fantasy role-playing game, Moon Faire. The game draws realistic 3D characters on top of this painting, walking on its ground.

Output exactly ONE landscape image, 2:1 (twice as wide as it is tall), 2048 x 1024 pixels or larger. Not a collage or a contact sheet.

I am attaching three images.
- Image 1 (%s_guide.png) is the CAMERA AND LAYOUT GUIDE: a grey-box model of this exact scene, drawn from the exact camera the game uses. Keep its camera, its perspective and its layout. Everything stays where the guide puts it and the size the guide makes it. Take only layout, scale and the direction of the light from it. Do not copy its grey colours or its blocky shapes: paint real things in their places. The pale areas are the ground the characters walk on. The bright magenta figure is a measuring marker 1.70 m tall, the height of a person here. Use it for scale, then leave it out and paint the bare ground where it stands.
- Image 2 (style-fair-square.jpg) is the finished painting of another place in this same game, the fair square. Match its craft, its finish, its realism and the way its lanterns glow. Take nothing else from it: not its layout or its tents, and not its hour unless this scene is at dusk too.
- Image 3 (character-reference.jpg) is one of the characters who will stand in this scene, shown from the front and the back. It is there to show how realistic the characters are. Never paint her, or anyone, into the scene.

VIEW. As in Image 1: a high three-quarter view, looking down at about 24 degrees through a long lens, like the painted backgrounds of classic role-playing games. The perspective is flattened: things at the back are only a little smaller than things at the front, and upright things stay upright. Not isometric, not straight down.

%s

THE HOUR. %s

GROUND THE CHARACTERS WALK ON. The pale ground in the guide is level, clear and easy to read in the finished painting. Nothing hangs over it or hides it: no roof, awning, banner, rope, branch or string of flags crosses walkable ground. Every way out of the scene that the guide shows stays open and visible. Keep the open ground empty except for what the guide shows.

THE SCENE: %s.
%s
%s
- The top of the picture is a narrow band, as in the guide. %s''' % (S['id'], RULES, hour, P['title'].rstrip('.'), P['intro'], '\n'.join('- ' + b.lstrip('- ').strip() for b in P['bullets']), P['top'])
scenes = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(os.path.join(HERE, 'scenes', 'W*.json'))}
area = {a['id']: a for a in W['areas']}; back = {b['id']: b for b in W['backdrops']}
# ---------- the text of the prompts, and the starter pack ----------
md = ['# Moon Faire demo: painting prompts for the places still to paint (November 13, 2026)\n\nFor each place attach three pictures: its guide, `style-fair-square.jpg` and `character-reference.jpg`. Save the result as `<id>.png` (W2.png and so on).\n']
z = zipfile.ZipFile(os.path.join(OUT, 'Moon_Faire_Demo_Painting_Starters.zip'), 'w', zipfile.ZIP_DEFLATED)
for sid in sorted(scenes): md.append('\n## %s %s\n\nGuide: `%s_guide.png`\n\n```\n%s\n```\n' % (sid, area[sid]['name'], sid, prompt(scenes[sid], area[sid]))); z.write(os.path.join(HERE, 'scenes', sid + '_guide.png'), sid + '_guide.png')
open(os.path.join(HERE, 'prompts.md'), 'w', encoding='utf-8').write(''.join(md))
b = io.BytesIO(); Image.open(os.path.join(G, 'art', 'pilot', 'W1.png')).convert('RGB').save(b, 'JPEG', quality=92); z.writestr('style-fair-square.jpg', b.getvalue())
z.write(os.path.join(G, 'pilot', 'references', 'S1_style_jester_standing.jpg'), 'character-reference.jpg'); z.write(os.path.join(HERE, 'prompts.md'), 'prompts.md'); z.close()
# ---------- the page ----------
ZONE = {1: 'The Moon Faire', 2: 'The wilds', 3: 'The Dark Beacon'}; KIND = {'talk': 'talk', 'errand': 'errand', 'fight': 'fight', 'find': 'find', 'scene': 'little scene', 'gate': 'gate', 'rest': 'rest'}
def backdrop(bid):
    b = back.get(bid)
    if not b: return ''
    if bid == 'F1': src, cap = jpg(os.path.join(G, 'art', 'pilot', 'F1.png'), 420), 'F1 %s: your own painting.' % b['name']
    elif b.get('envoi'):
        f = os.path.join(HERE, 'envoi-fight-backdrops', os.path.basename(b['envoi']).replace('.avif', '') + '.jpg'); src = jpg(f, 420) if os.path.exists(f) else ''
        cap = '%s %s: borrowed from Envoi (%s). Fit: %s. %s' % (bid, b['name'], os.path.basename(b['envoi']), b.get('fit', ''), b.get('why', ''))
    else: src, cap = '', '%s %s: no picture yet.' % (bid, b['name'])
    return '<figure class="bd">%s<figcaption>%s</figcaption></figure>' % ('<img loading="lazy" alt="" src="%s">' % src if src else '', E(cap))
cards = []; zone_now = 0
for a in W['areas']:
    if a['zone'] != zone_now: zone_now = a['zone']; cards.append('<h2>Zone %d: %s</h2>' % (zone_now, ZONE[zone_now]))
    sid = a['id']; S = scenes.get(sid)
    if sid == 'W1': pic = '<img class="pic" loading="lazy" alt="" src="%s"><p class="tag ok">In use: your painting</p>' % jpg(os.path.join(G, 'art', 'pilot', 'W1.png'), 1100)
    elif S: pic = '<img class="pic" loading="lazy" alt="" src="%s"><p class="tag todo">To paint. This is its guide with labels (green: ways out; blue: where people stand; pink: a 1.70 m figure). Guide file: <b>%s_guide.png</b></p>' % (jpg(os.path.join(HERE, 'scenes', sid + '_key.jpg'), 1100), sid)
    else: pic = '<p class="tag">%s</p>' % ('A fight place: no walking picture.' if sid.startswith('F') else 'No guide yet.')
    ppl = ''.join('<div class="who">%s<div><b>%s</b> <span class="soft">%s; %s</span>%s</div></div>' % ('<img alt="" src="%s">' % faces[p['who']] if p['who'] in faces else '<span class="noface"></span>', E(names.get(p['who'], p['who'][0].upper() + p['who'][1:])), E(p['where']), E(p['doing']), ''.join('<div class="say">“%s”</div>' % E(s) for s in p.get('says', []))) for p in a.get('people', []))
    hap = ''.join('<li><b>%s</b> %s <span class="kind">%s</span><br>%s%s</li>' % (E(h['code']), E(h['title']), E(KIND.get(h['kind'], h['kind'])), E(h['what']), '' if h.get('needs', '').lower().startswith('nothing') else '<br><span class="soft">Needs: %s</span>' % E(h.get('needs', ''))) for h in a.get('happens', []))
    ex = ', '.join('%s to %s (%s)' % (e['side'], e['to'], e['how']) for e in a['exits'])
    pr = '<details><summary>The painting prompt for %s</summary><div class="bar"><span class="soft">Attach %s_guide.png, style-fair-square.jpg and character-reference.jpg. Save the result as %s.png.</span><button data-copy>Copy prompt</button></div><textarea readonly rows="9">%s</textarea></details>' % (sid, sid, sid, E(prompt(S, a))) if S else ''
    cards.append('<section class="card" id="%s"><h3>%s &nbsp; %s <span class="soft">%s</span></h3>%s<p>%s</p><p class="soft">Ways out: %s</p>%s<h4>Things that can happen</h4><ul class="hap">%s</ul><p><b>Fights:</b> %s%s</p>%s%s</section>' % (
        sid, sid, E(a['name']), E(a['light']), pic, E(a['look']), E(ex), ('<h4>Who is here</h4>' + ppl) if ppl else '', hap, E(a.get('fights') or 'none'), (' <b>Lamps won here:</b> %d.' % a['lamps']) if a.get('lamps') else '', backdrop(a.get('backdrop')), pr))
cap = W.get('captain') or {}
extra = '<h2>The captain</h2><div class="card">%s<p class="soft">His model is being built in another session.</p></div>' % ''.join('<p><b>%s:</b> %s</p>' % (k, ' '.join('“%s”' % E(s) for s in v)) for k, v in cap.items())
extra += '<h2>Backgrounds in use now</h2><div class="card"><div class="grid">%s%s</div></div>' % ('<figure class="bd"><img loading="lazy" alt="" src="%s"><figcaption>W1 The fair square: your own painting.</figcaption></figure>' % jpg(os.path.join(G, 'art', 'pilot', 'W1.png'), 420), ''.join(backdrop(b['id']) for b in W['backdrops']))
extra += '<h2>Still needed</h2><div class="card"><ul>%s</ul></div>' % ''.join('<li><b>%s.</b> %s <span class="soft">(%s)</span></li>' % (E(n['what'].rstrip('.')), E(n['why']), E(n['for'] if isinstance(n['for'], str) else ', '.join(n['for']))) for n in W.get('needs', []))
extra += '<h2>Questions for you</h2><div class="card"><ol>%s</ol></div>' % ''.join('<li>%s</li>' % E(q) for q in W.get('questions', []))
cost = W['_made']['cost'] + sum(s['_made']['cost'] for s in scenes.values())
page = open(os.path.join(HERE, 'world-page.tpl.html'), encoding='utf-8').read().replace('/*STORY*/', ''.join('<li>%s</li>' % E(s) for s in W['story'])).replace('/*CARDS*/', '\n'.join(cards)).replace('/*EXTRA*/', extra).replace('/*COUNT*/', '%d places still to paint' % len(scenes)).replace('/*COST*/', '$%.2f' % cost)
open(os.path.join(OUT, 'moon-faire-demo-map.html'), 'w', encoding='utf-8').write(page); print('scenes', sorted(scenes), 'page', len(page) // 1024, 'KB', 'cost $%.2f' % cost)
