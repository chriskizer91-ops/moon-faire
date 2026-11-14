# Builds the skin prompts from people/skins/*/skins.json: people/skins/prompts.md, the page people/out/moon-faire-skin-prompts.html
# and the starter pack people/out/Moon_Faire_Skin_Starters.zip (guides, the face guide, the style reference, the prompts).
# Run from game/: python3 people/kit/build_skin_prompts.py
import base64, html, io, json, os, zipfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '..', '..'); SK = os.path.join(GAME, 'people', 'skins'); OUT = os.path.join(GAME, 'people', 'out')
ORDER = ['lampseller', 'fortune', 'watchman', 'baker', 'farmhand']
MODEL = {'lampseller': 'the lamp-seller model (made by hand)', 'fortune': 'the fortune-teller model', 'watchman': 'the night-watchman model', 'baker': 'the baker model', 'farmhand': 'the farm lad model'}
BODY = '''Attach two pictures: first {guide}, then style-reference.jpg.

Paint over the first picture. It is a grey guide of one person shown twice: from the front on the left, from the back on the right, standing with the arms a little out from the sides.

WHO: {name}. {who}

WHAT TO PAINT: {body}

RULES
- Keep the picture exactly this shape (3 wide by 2 tall). Keep both figures exactly where they are and exactly this size. Trace the guide's outlines: the same head covering, hair, sleeves, hands, clothes, legs and boots, and the same gaps between the arms and the body. Do not move, resize, crop, turn or re-pose the figures.
- Add nothing outside the grey shapes: nothing held in the hands, nothing hanging, blowing or sticking out past the outline.
- Paint in the style of the second picture: hand-painted, soft brushwork, rich but slightly muted colours. Take only the style from it, not the character.
- Light both figures flat and evenly from straight ahead, like a costume sheet. No cast shadows, no ground, no glow, no rim light, no dark side. The game adds its own light.
- The two figures are the same person in the same clothes. Every colour, pattern and detail on the front carries round to the back.
- The right figure is seen from behind: the back of the head, no face.
- Paint the face on the left figure simply. A separate close-up replaces it.
- Fill the background with one flat mid-grey. No text, no labels, no border.'''
FACE = '''Attach one picture: face-guide.png.

Repaint the face in this picture as a different person. It is a face painting that gets wrapped onto a 3D head, so its layout must not change.

WHO: {name}. {face}

RULES
- Keep the picture square and exactly this size.
- Keep the eyes, brows, nose, mouth and chin exactly where they are and the same size. Front view, looking straight ahead, mouth closed.
- Keep the plain surround: only the face in the middle, fading softly into one flat skin colour all round, in the new person's skin colour. No hair, no ears, no neck, no hat, no background.
- Paint it in the same hand-painted style as the picture, with soft brushwork.
- Flat even light from straight ahead: no shadow down one side, no lamp highlights.
- No text, no border.'''
models = []
for pid in ORDER:
    f = os.path.join(SK, pid, 'skins.json')
    if not os.path.exists(f): continue
    d = json.load(open(f)); d['guide'] = '%s-guide.png' % pid
    for i, k in enumerate(d['skins']):
        k['code'] = '%s-%s' % (pid, 'ABC'[i]); k['body_prompt'] = BODY.format(guide=d['guide'], **k); k['face_prompt'] = FACE.format(**k)
    models.append(d)
md = ['# Moon Faire: skin prompts (November 13, 2026)\n', 'Each person model gets two or three skins. Each skin is two pictures made in ChatGPT: the body sheet (painted over the model\'s grey guide) and the face (painted over the face guide). The people are stand-ins written by Claude Opus 5.5 for this test, not Moon Faire lore.\n']
for d in models:
    md.append('\n## %s\n\nGuide: `%s`\n' % (MODEL[d['id']].capitalize(), d['guide']))
    for k in d['skins']: md.append('\n### %s: %s\n\n**Body sheet (save as `%s-body.png`)**\n\n```\n%s\n```\n\n**Face (save as `%s-face.png`)**\n\n```\n%s\n```\n' % (k['code'], k['name'], k['code'], k['body_prompt'], k['code'], k['face_prompt']))
open(os.path.join(SK, 'prompts.md'), 'w', encoding='utf-8').write(''.join(md))
Image.open(os.path.join(HERE, 'face_plain.webp')).convert('RGB').save(os.path.join(SK, 'face-guide.png'))
z = zipfile.ZipFile(os.path.join(OUT, 'Moon_Faire_Skin_Starters.zip'), 'w', zipfile.ZIP_DEFLATED)
for d in models: z.write(os.path.join(SK, d['id'], 'guide.png'), d['guide'])
z.write(os.path.join(SK, 'face-guide.png'), 'face-guide.png'); z.write(os.path.join(GAME, 'pilot', 'references', 'S1_style_jester_standing.jpg'), 'style-reference.jpg'); z.write(os.path.join(SK, 'prompts.md'), 'prompts.md'); z.close()
def jpg(path, w):
    im = Image.open(path).convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=82); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
E = html.escape; rows = []
for d in models:
    rows.append('<h2>%s</h2><p class="soft">Guide file: <b>%s</b></p><img class="guide" alt="" src="%s">' % (E(MODEL[d['id']].capitalize()), d['guide'], jpg(os.path.join(SK, d['id'], 'guide.png'), 900)))
    for k in d['skins']:
        rows.append('<div class="card"><h3>%s &nbsp; %s</h3><p>%s</p>' % (k['code'], E(k['name']), E(k['who'])))
        for kind, label, text in [('body', 'Body sheet', k['body_prompt']), ('face', 'Face', k['face_prompt'])]:
            rows.append('<div class="bar"><b>%s</b><span class="soft">save as %s-%s.png</span><button data-copy>Copy prompt</button></div><textarea readonly rows="7">%s</textarea>' % (label, k['code'], kind, E(text)))
        rows.append('</div>')
n = sum(len(d['skins']) for d in models)
page = open(os.path.join(HERE, 'skin-prompts.tpl.html'), encoding='utf-8').read().replace('/*COUNT*/', '%d skins on %d models, %d pictures' % (n, len(models), n * 2)).replace('/*FACE*/', jpg(os.path.join(SK, 'face-guide.png'), 360)).replace('/*ROWS*/', '\n'.join(rows))
open(os.path.join(OUT, 'moon-faire-skin-prompts.html'), 'w', encoding='utf-8').write(page)
print('skins', n, 'page', len(page) // 1024, 'KB', 'zip', os.path.getsize(os.path.join(OUT, 'Moon_Faire_Skin_Starters.zip')) // 1024, 'KB')
