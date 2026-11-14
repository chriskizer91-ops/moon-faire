# The page, the prompts and the pack for the extra pictures the story needs (fight places, story pictures, two changed paintings, the item
# sheet), from world/pictures/pictures.json (made by make_story_pictures.py). Writes game/out/moon-faire-story-pictures.html,
# world/pictures/prompts.md and game/out/Moon_Faire_Story_Pictures_To_Paint.zip.      Run from game/: python3 world/build_pictures_page.py
import base64, html, io, json, os, re, zipfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); PD = os.path.join(HERE, 'pictures'); E = html.escape
P = json.load(open(os.path.join(PD, 'pictures.json'), encoding='utf-8')); W = json.load(open(os.path.join(HERE, 'world.json'), encoding='utf-8')); AREA = {a['id']: a for a in W['areas']}
RULES = open(os.path.join(G, 'pilot', 'prompts', 'standing-rules.txt'), encoding='utf-8').read().strip()
STYLE = 'STYLE. A realistic, richly detailed, hand-painted picture with believable scale and painterly but detailed surfaces: real canvas, rope, wood, stone, iron, earth and grass. The same hand as the attached paintings. Not pixel art, not a cartoon, not anime, no drawn outlines.'
def jpg(path, w, q=82):
    im = Image.open(path).convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def bullets(xs): return '\n'.join('- ' + x.strip() for x in xs)
PAINT = lambda i: os.path.join(HERE, 'map', 'map.png') if i == 'MAP' else os.path.join(G, 'art', 'pilot', i + '.png') if i in ('W1', 'F1') else os.path.join(G, 'art', 'world', i + '.png')
REFNAME = lambda i: 'ref-world-map.jpg' if i == 'MAP' else 'ref-%s-%s.jpg' % (i, re.sub(r'[^a-z]+', '-', (AREA[i]['name'] if i in AREA else 'moor clearing').lower()).strip('-').replace('the-', '', 1))
pack = {}      # file name in the pack -> bytes
def add_ref(i):
    n = REFNAME(i)
    if n not in pack: b = io.BytesIO(); Image.open(PAINT(i)).convert('RGB').save(b, 'JPEG', quality=93); pack[n] = b.getvalue()
    return n
def add_file(name, path, as_jpg=False):
    if name not in pack:
        if as_jpg: b = io.BytesIO(); Image.open(path).convert('RGB').save(b, 'JPEG', quality=93); pack[name] = b.getvalue()
        else: pack[name] = open(path, 'rb').read()
    return name
def refid(a): m = re.match(r'\s*(MAP|[WF]\d)', a); return m.group(1) if m else None
def why(a): return re.sub(r'^\s*(MAP|[WF]\d)\s*[:,(\-–—]*\s*', '', a).rstrip(') .')

WHAT = {   # code: (title, which beat it serves, must-have?, shape)
 'F5': ('The lamp room', 'The last fight and the ending (F5-a to F5-d). There is no picture of this place at all yet.', True, '4:3, 2048 x 1536 or larger'),
 'S1': ('Warm in her hands', "Io warms a beaten wisp and it goes home (W4-e): the moment the story turns from fighting wisps to walking them home.", True, '2:1, 2048 x 1024 or larger'),
 'S2': ('The threads', 'What the Fox sees at the standing stones (W5-e).', True, '2:1, 2048 x 1024 or larger'),
 'S3': ('The flight to the crag', "The airship carries the four from the fair to the crag (after W3-e). The game has no other way to show a flight.", True, '2:1, 2048 x 1024 or larger'),
 'S4': ('The lights go home', 'After the Curtain Call (F5-c): the ending.', True, '2:1, 2048 x 1024 or larger'),
 'E1': ('Thirteen lights', "The demo's last moment (F5-d): the beacon shows a light again.", True, 'the same size as the painting, 1774 x 887'),
 'I1': ('The item sheet', 'A picture for each of the five item cards, and a lamp for the lamp count.', True, '3:2, 1536 x 1024 or larger'),
 'F2': ('The fair, as a fight place', "The three fights in the fair (W1-a, W2-a, W3-b). The borrowed Envoi picture is a poor fit and is seen from above.", False, '4:3, 2048 x 1536 or larger'),
 'F4': ('The beacon stair, as a fight place', 'Fights on the stair (W9-a). The borrowed Envoi picture is a poor fit and is seen from above.', False, '4:3, 2048 x 1536 or larger'),
 'F3': ('The standing stones, as a fight place', 'The Shadow Wraith that bars the road (W5-b). The borrowed Envoi picture is a fair fit, so this one can wait.', False, '4:3, 2048 x 1536 or larger'),
 'E2': ('The dead post lit', 'For after the end, if the player can still walk the map: the second post at the Last Lantern burns.', False, 'the same size as the painting, 1774 x 887'),
 'T1': ('The title picture', 'The first thing a player sees.', False, '2:1, 2048 x 1024 or larger')}
ORDER = ['F5', 'S1', 'S2', 'S3', 'S4', 'E1', 'I1', 'F2', 'F4', 'F3', 'E2', 'T1']; items = []
for code in ORDER:
    title, serves, must, shape = WHAT[code]; attach = []; show = None
    if code in P['fights']:
        F = P['fights'][code]; attach = [add_file(code + '_guide.png', os.path.join(PD, code + '_guide.png')), add_file('style-moor-clearing.jpg', PAINT('F1'), True), add_file('character-reference.jpg', os.path.join(G, 'pilot', 'references', 'S1_style_jester_standing.jpg'))]
        show = jpg(os.path.join(PD, code + '_key.jpg'), 1100, 80)
        moon = ('- Auros, the moon, is large, bright, detailed and nearly full, with a soft glow round it, exactly where the guide puts it: 31% of the way across and 17% of the way down, about 13% of the picture\'s height across.' if F.get('moon', True) is not False else '- The moon is out of sight here. Its cool, pale lilac light still comes from the upper left.')
        text = '''One production background painting for my fantasy role-playing game, Moon Faire: the backdrop of a battle. The game draws realistic 3D characters, creatures and spell effects on top of it, standing on the open ground across the bottom.

Output exactly ONE landscape 4:3 image, 2048 x 1536 pixels or larger. Not a collage or a contact sheet.

I am attaching three images.
- Image 1 (%s) is the CAMERA AND LAYOUT GUIDE: a grey-box model of this exact scene, drawn from the exact camera the game uses. Keep its camera, its horizon and its layout. Take only layout, scale and the direction of the light from it. Do not copy its grey colours or its blocky shapes: paint real things in their places. The bright magenta figure is a measuring marker 1.70 m tall, standing where a character will stand. Use it for scale, then leave it out and paint the bare ground where it stands.
- Image 2 (style-moor-clearing.jpg) is a finished battle background from this same game, painted for the same camera. Match its craft, its finish, its believable scale and the way haze separates its layers. Do not copy its place.
- Image 3 (character-reference.jpg) is one of the characters who will stand in this scene, shown from the front and the back. It is there to show how realistic the characters are. Never paint her, or anyone, into the scene.

VIEW. As in Image 1: a camera near eye level, tilted very slightly up, with a 38-degree lens feel. The horizon is level and sits 61%% of the way down the picture. Flat, wide, open ground fills the bottom third.

%s

THE OPEN GROUND. %s The bottom third of the picture is entirely level, unobstructed ground, calm and low in contrast, lit softly and evenly, with its detail getting smaller toward the horizon. The game stands its characters here. Nothing stands on it: no rocks, water, steps, rubble, posts, props or cracks wide enough to trip on, and nothing frames the foreground. Everything with a shape of its own is behind the open ground or far away.

THE SCENE: %s
%s
%s%s''' % (code + '_guide.png', RULES, F['ground'].strip(), F['scene'].strip(), bullets(F['shows']), moon, '\n- The fire cradle is cold, dark and empty. Paint no fire, ember or glow in it: the game adds a flame there itself.' if code == 'F5' else '')
    elif code in P['stills']:
        S = P['stills'][code]; refs = [(refid(a), why(a)) for a in S.get('attach', []) if refid(a)][:2] or [('W1', 'for craft')]
        lines = []
        for k, (i, y) in enumerate(refs): attach.append(add_ref(i)); lines.append('- Image %d (%s) is a finished painting from this same game%s. Match its craft, finish and realism, and keep the things it shows looking the same wherever they appear here. Do not copy its view.' % (k + 1, REFNAME(i), (': ' + y) if y else ''))
        if code == 'S1': attach.append(add_file('io-reference.png', os.path.join(G, '..', 'art-pipeline', 'smoothing-pack', 'reference', 'herbal_witch_portrait_ref.png'))); lines.append('- Image %d (io-reference.png) shows the witch whose hands these are, in a drawn style. Take only her hands, her bracelet and the cuffs and colour of her sleeves from it, and paint them as real as the other image. Paint no face and no figure.' % len(attach))
        text = '''One full-screen story painting for my fantasy role-playing game, Moon Faire. The game shows it on its own, with one line of words under it. Nothing is drawn on top of it.

Output exactly ONE landscape image, 2:1 (twice as wide as it is tall), 2048 x 1024 pixels or larger. Not a collage or a contact sheet.

I am attaching %s.
%s

%s

VIEW. %s

WHAT IT SHOWS.
%s

LIGHT. %s Shadows are deep but never black.

LEAVE OUT. %s Animals and creatures of any kind. No lettering anywhere. No captions, labels, borders, UI, grid lines or vignette.''' % ('one image' if len(attach) == 1 else '%d images' % len(attach), '\n'.join(lines), STYLE, S['view'].strip(), bullets(S['shows']), S['light'].strip(),
            'Faces, bodies and figures: only the two hands and their cuffs are in the picture.' if code == 'S1' else 'People, faces and figures of any kind, however small.')
    elif code in P['edits']:
        D = P['edits'][code]; src = {'E1': 'W9', 'E2': 'W4'}[code]; attach = [add_file(src + '.png', PAINT(src))]; show = jpg(PAINT(src), 900, 78)
        text = '''An edit of one finished painting from my fantasy role-playing game, Moon Faire. I am attaching the painting (%s.png).

Give back the SAME painting, at the same size (1774 x 887 pixels) and the same shape, changed only in these ways:
%s

KEEP. %s Same view, same composition, same brushwork, same colours everywhere the new light does not reach. Add no new objects, no people, no creatures and no lettering.''' % (src, bullets(D['change']), D['keep'].strip())
    else:
        I = P['items']; attach = [add_file('style-fair-square.jpg', PAINT('W1'), True)]
        text = '''One sheet of six small item pictures for my fantasy role-playing game, Moon Faire. The game cuts the sheet into six equal squares and shows each one on an item card.

Output exactly ONE landscape image, 3:2, 1536 x 1024 pixels or larger, laid out as two rows of three equal squares. Draw no lines, borders or gaps between the squares: the same cloth runs under all six. Each thing lies alone in the exact middle of its own square and fills about 60%% of it. Nothing crosses from one square into the next.

I am attaching one image.
- Image 1 (style-fair-square.jpg) is a finished painting from this same game. Match its craft, its finish and its realism. Take nothing else from it.

%s

THE CLOTH AND THE LIGHT. %s

THE SIX THINGS, left to right, the top row first and then the bottom row:
%s

LEAVE OUT. Hands, people, lettering, numbers, labels, price tags, frames and shadows of anything outside the picture.''' % (STYLE, I['cloth'].strip(), '\n'.join('%d. %s' % (k + 1, c.strip()) for k, c in enumerate(I['cells'])))
    save = {'I1': 'items.png', 'E1': 'W9-thirteen-lights.png', 'E2': 'W4-both-lit.png'}.get(code, code + '.png')
    done = {'I1': 'art/items/items.png', 'E1': 'art/world/W9-thirteen-lights.png', 'E2': 'art/world/W4-both-lit.png'}.get(code, ('art/fights/%s.png' if code.startswith('F') else 'art/story/%s.png') % code); done = os.path.join(G, done) if os.path.exists(os.path.join(G, done)) else None
    items.append(dict(code=code, title=title, serves=serves, must=must, shape=shape, attach=attach, save=save, text=text, show=show, done=done))
os.makedirs(os.path.join(G, 'out'), exist_ok=True)
md = ['# Moon Faire: the extra pictures the story needs', '', 'Made on November 14, 2026 for the chosen story, "The fire that would not end". For each picture: attach the files named, in that order, and paste the prompt. Save the result under the name given.', '']
for it in items: md += ['## %s  %s%s' % (it['code'], it['title'], '' if it['must'] else '  (can wait)'), '', it['serves'], '', 'Attach: ' + ', then '.join(it['attach']) + '.  Shape: ' + it['shape'] + '.  Save as: `' + it['save'] + '`.', '', '```', it['text'], '```', '']
open(os.path.join(PD, 'prompts.md'), 'w', encoding='utf-8').write('\n'.join(md)); pack['prompts.md'] = '\n'.join(md).encode()
zp = os.path.join(G, 'out', 'Moon_Faire_Story_Pictures_To_Paint.zip')
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_STORED) as z:
    for n in sorted(pack): z.writestr(n, pack[n])
NOTE = {'E1': 'The painter redrew the whole picture a little, so the game uses your original painting with only the new light let through: the glow over the door and the brighter ship. Nothing else moves when one fades into the other.',
        'E2': 'As with the other changed painting, the game uses your original with only the new flame and its glow on the ground let through.', 'I1': 'Cut into six card pictures: the five finds and the ship\'s lamp for the lamp count.'}
def card(it):
    if it['done']:
        fit = os.path.join(PD, it['code'] + '_fit.jpg')
        return ('<section class="card" id="%s"><h3>%s &nbsp; %s <span class="kind done">painted</span></h3><img class="pic" loading="lazy" alt="" src="%s"><p>%s%s</p>%s'
                '<details><summary>The prompt it was painted from</summary><p class="soft">Attached: %s.</p><div class="bar"><span class="soft">The prompt</span><button data-copy>Copy prompt</button></div><textarea readonly rows="9">%s</textarea></details></section>') % (
            it['code'], it['code'], E(it['title']), jpg(it['done'], 1200, 84), E(it['serves'].split('. ')[0].rstrip('.') + '.'), (' ' + E(NOTE[it['code']])) if it['code'] in NOTE else '',
            ('<details><summary>Its guide drawn over it</summary><p class="soft">The green lines are the guide. What matters for the game is that the horizon, the moon and the open ground sit where the guide has them, and they do. The painter made some of the stonework taller than the guide, which harms nothing.</p><img class="pic" loading="lazy" alt="" src="%s"></details>' % jpg(fit, 1100, 78)) if os.path.exists(fit) else '',
            ', then '.join(E(a) for a in it['attach']), E(it['text']))
    return ('<section class="card%s" id="%s"><h3>%s &nbsp; %s <span class="kind%s">%s</span></h3><p>%s</p>%s<p class="soft"><b>Attach, in this order:</b> %s<br><b>Shape:</b> %s<br><b>Save as:</b> %s</p>'
            '<div class="bar"><span class="soft">The prompt</span><button data-copy>Copy prompt</button></div><textarea readonly rows="9">%s</textarea></section>') % (
        ' pick' if it['must'] else '', it['code'], it['code'], E(it['title']), ' must' if it['must'] else '', 'the story needs it' if it['must'] else 'can wait', E(it['serves']),
        ('<img class="pic" loading="lazy" alt="" src="%s"><p class="soft">%s</p>' % (it['show'], 'Its guide with labels (pink: where the party and the foes stand). The file to attach is the plain one in the pack.' if it['code'].startswith('F') else 'The painting it starts from.')) if it['show'] else '',
        ', then '.join('<b>%s</b>' % E(a) for a in it['attach']), E(it['shape']), E(it['save']), E(it['text']))
page = open(os.path.join(HERE, 'pictures-page.tpl.html'), encoding='utf-8').read()
page = page.replace('/*MUST*/', '\n'.join(card(i) for i in items if i['must'])).replace('/*WAIT*/', '\n'.join(card(i) for i in items if not i['must'])).replace('/*NAV*/', ''.join('<a href="#%s">%s %s</a>' % (i['code'], i['code'], E(i['title'])) for i in items))
alldone = all(i['done'] for i in items)
page = page.replace('/*INTRO*/', 'All twelve are painted and in the game\'s folders.' if alldone else '%d the story needs, and %d that can wait.' % (sum(1 for i in items if i['must']), sum(1 for i in items if not i['must'])))
page = page.replace('/*HOW*/', '<li><b>You painted all twelve on November 14.</b> Each is shown here as it now sits in the game\'s folders. The four fight places kept the horizon, the moon and the open ground of their guides. The prompts are kept under each picture.</li>' if alldone else '<li><b>How to use this:</b> unzip <b>Moon_Faire_Story_Pictures_To_Paint.zip</b> from the chat. For each picture, attach the files its card names, in that order, paste its prompt, and save the result under the name on the card.</li>')
page = page.replace('/*H2A*/', 'The pictures the story needs' if alldone else 'The story needs these').replace('/*H2B*/', 'The other five' if alldone else 'These can wait')
page = page.replace('/*NMUST*/', str(sum(1 for i in items if i['must']))).replace('/*NWAIT*/', str(sum(1 for i in items if not i['must']))).replace('/*COST*/', '$%.2f' % P['_made']['cost'])
assert '/*' not in page.split('<style>')[0] + page.split('</style>')[1], 'a placeholder was left in'
open(os.path.join(G, 'out', 'moon-faire-story-pictures.html'), 'w', encoding='utf-8').write(page)
print('pictures', [i['code'] for i in items], 'page %d KB' % (len(page) // 1024), 'pack %d KB' % (os.path.getsize(zp) // 1024), sorted(pack))
