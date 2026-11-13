# Builds the pilot prompts page (one file, images inside it) and its text copy. Run from game/pilot after shoot_guides.py.
import base64, html, os
HERE = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(HERE, p), encoding='utf-8').read().strip()
def uri(p):
    mime = 'image/png' if p.endswith('.png') else 'image/jpeg'
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(os.path.join(HERE, 'references', p), 'rb').read()).decode())

RULES = rd('prompts/standing-rules.txt')
PROMPT = {k: rd('prompts/%s.txt' % k).replace('{RULES}', RULES) for k in ('W1', 'F1')}

IMAGES = [
    ('G1', 'W1_guide.png', 'Layout guide: the fair square', 'Attach first with prompt W1. Grey boxes drawn from the game\'s walking camera.'),
    ('G2', 'F1_guide.png', 'Layout guide: the moor clearing', 'Attach first with prompt F1. Drawn from the game\'s fight camera.'),
    ('P1', 'P1_envoi_moor_painting.jpg', 'Finish guide: your Envoi moor painting', 'Attach second with both prompts. It shows the craft and finish to match.'),
    ('S1', 'S1_style_jester_standing.jpg', 'Realism guide: the Jester', 'Attach third with both prompts. It shows how real the characters are.'),
]
PAINT = [
    dict(code='W1', name='The fair square', kind='Walking scene', shape='Wide, 2:1, 2048 x 1024 or larger', attach='G1, then P1, then S1', save='W1.png', key='W1_key.jpg',
         why='The first walking scene: the game starts here. It is twice as wide as it is tall so the screen can pan across it as she walks.'),
    dict(code='F1', name='The moor clearing', kind='Fight backdrop', shape='Landscape, 4:3, 2048 x 1536 or larger', attach='G2, then P1, then S1', save='F1.png', key='F1_key.jpg',
         why='The backdrop for fights on the moor. The witches stand on the left of the clearing and the foes on the right.'),
]
STEPS = [
    'Look at the two labelled layouts below. If a layout is not what you want, tell me before you paint anything.',
    'Save the four images to attach. They are on this page, and in the zip I sent in the chat.',
    'Start a new ChatGPT chat for each painting. Attach its three images in the order given, then paste its prompt.',
    'Make each one two to four times. Keep the one whose layout matches the guide best, even if another is prettier.',
    'Save the keepers as W1.png and F1.png. A second keeper is W1b.png. Send them back as they come, with no squeezing.',
]
CHECK = [
    ('Both', ['No people, creatures or magenta figure anywhere.', 'No lettering, labels or borders.', 'Painted and realistic: not pixel art, not a cartoon.', 'Auros is in the upper left, where the guide has it.', 'Lit sides face the viewer and the right; shadows fall up and to the left.']),
    ('W1, the fair square', ['The tents, stalls, posts and well stand where the guide\'s boxes are.', 'The square is the same flattened oval as the guide, and both lanes reach the picture\'s edges.', 'You can see the ground everywhere a witch could walk: nothing hangs over it.', 'The floor cloth lies flat. No stage.', 'No bunting strung across the square.']),
    ('F1, the moor clearing', ['The horizon is level and about 61% of the way down.', 'The bottom third is flat, open and empty.', 'The fair is tiny and far off on the left.', 'The road, wall, tree and stone all stay behind the clearing.']),
]
CHOSE = [
    'The two cameras are Envoi\'s, because they already work with paintings: the night square\'s for walking (a long lens looking down at 24 degrees) and the arena\'s for fights (2 m up, 18 m back, the horizon 61% down).',
    'Auros has one fixed spot in every fight backdrop (31% across, 17% down, as in Envoi) and one in every walking scene (the upper left of the top band).',
    'A person is about a tenth of the walking painting\'s height. On screen the game shows about two thirds of the painting\'s width, so she is about a seventh of the screen\'s height.',
    'In a fight a witch is about a seventh of the backdrop\'s height in the wide shot. Closer shots are crops of the same picture.',
    'What is in the square is my guess at a fair: the tents\' colours, the well, the wagon. The Jester\'s floor cloth comes from the earlier plan. Change any words in the scene part of a prompt.',
    'I asked for 2048 pixels wide. ChatGPT gave you 1448 and 1536 wide for Envoi. Either is enough to fit and judge the pilot.',
]

def page():
    e = html.escape
    imgs = ''.join('<li><img src="%s" alt="%s" loading="eager"><div><b class="c">%s</b> <b>%s</b><br><span class="muted small">%s<br>File: %s</span></div></li>' % (uri(f), e(t), c, e(t), e(d), f) for c, f, t, d in IMAGES)
    steps = ''.join('<li>%s</li>' % e(s) for s in STEPS)
    paints = ''
    for p in PAINT:
        paints += '''
<section id="%(code)s">
  <h2>%(code)s: %(name)s</h2>
  <p>%(why)s</p>
  <figure><div class="wide" tabindex="0"><img class="key" src="%(keyuri)s" alt="The %(name)s layout with labels"></div><figcaption>The layout with labels, for you to read. Slide it sideways on a phone. Do not attach this one: it has words on it.</figcaption></figure>
  <ul class="facts2">
    <li><span>Kind</span><b>%(kind)s</b></li>
    <li><span>Shape</span><b>%(shape)s</b></li>
    <li><span>Attach, in this order</span><b>%(attach)s</b></li>
    <li><span>Save as</span><b>%(save)s</b></li>
  </ul>
  <div class="prompt">
    <div class="bar"><b>Prompt %(code)s</b><button type="button" class="copy" data-for="pre-%(code)s">Copy the prompt</button></div>
    <pre id="pre-%(code)s" tabindex="0">%(text)s</pre>
  </div>
</section>''' % dict(p, keyuri=uri(p['key']), text=e(PROMPT[p['code']]))
    check = ''.join('<div class="zone"><h3>%s</h3><ul class="plain">%s</ul></div>' % (e(h), ''.join('<li>%s</li>' % e(x) for x in xs)) for h, xs in CHECK)
    chose = ''.join('<li>%s</li>' % e(x) for x in CHOSE)
    return TEMPLATE.replace('{{STEPS}}', steps).replace('{{IMGS}}', imgs).replace('{{PAINTS}}', paints).replace('{{CHECK}}', check).replace('{{CHOSE}}', chose).replace('{{RULES}}', e(RULES))

TEMPLATE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moon Faire pilot painting prompts</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Jacquard+24&display=swap" rel="stylesheet">
<style>
/* Layout idea: one reading column for a phone: what to do, the images to attach, then each prompt with a copy button.
   Colours come from the witches' own light rig: warm key, lilac moon, plum-brown earth. Same tokens as the plan page. */
:root {
  --bg: #f4f1f6; --panel: #ffffff; --ink: #2a1f2e; --muted: #6a5c70; --line: #ddd4e3;
  --amber: #9a5200; --amber-soft: #fbe9d2; --lilac: #6447a6; --lilac-soft: #ebe4f7;
  --display: "Jacquard 24", "Palatino Linotype", Palatino, Georgia, serif;
  --body: "Atkinson Hyperlegible", "Segoe UI", system-ui, -apple-system, Arial, sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; --bg: #1c151f; --panel: #271d2b; --ink: #f2e9ee; --muted: #b6a7ba; --line: #40323f; --amber: #ffb964; --amber-soft: #43301c; --lilac: #cdb4ff; --lilac-soft: #342a48; }
}
:root[data-theme="dark"] { color-scheme: dark; --bg: #1c151f; --panel: #271d2b; --ink: #f2e9ee; --muted: #b6a7ba; --line: #40323f; --amber: #ffb964; --amber-soft: #43301c; --lilac: #cdb4ff; --lilac-soft: #342a48; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 17px; line-height: 1.5; }
main { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; display: flex; flex-direction: column; gap: 36px; }
header, section { display: flex; flex-direction: column; gap: 14px; }
h1 { font-family: var(--display); font-weight: 400; font-size: clamp(38px, 9vw, 56px); line-height: 1; margin: 0; text-wrap: balance; }
h2 { font-family: var(--display); font-weight: 400; font-size: 32px; line-height: 1.1; margin: 0; text-wrap: balance; }
h3 { font-size: 18px; margin: 0; line-height: 1.3; }
p { margin: 0; }
img { max-width: 100%; height: auto; display: block; border-radius: 8px; }
.lede { font-size: 19px; }
.status { align-self: flex-start; background: var(--amber-soft); color: var(--amber); border-radius: 999px; padding: 4px 12px; font-size: 14px; font-weight: 700; }
.muted { color: var(--muted); } .small { font-size: 15px; }
ol.steps { margin: 0; padding-left: 24px; display: flex; flex-direction: column; gap: 8px; }
ul.plain { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
ul.imgs { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
ul.imgs li { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
b.c { color: var(--amber); }
figure { margin: 0; display: flex; flex-direction: column; gap: 6px; }
figcaption { color: var(--muted); font-size: 15px; }
.wide { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; }
.wide img.key { min-width: 980px; border-radius: 0; }
ul.facts2 { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
ul.facts2 li { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; display: flex; flex-direction: column; }
ul.facts2 span { color: var(--muted); font-size: 13px; }
.prompt { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); overflow: hidden; }
.prompt .bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--panel); }
button.copy { font: 700 15px var(--body); color: var(--bg); background: var(--lilac); border: 0; border-radius: 999px; padding: 9px 16px; cursor: pointer; }
button.copy:focus-visible, pre:focus-visible { outline: 3px solid var(--amber); outline-offset: 2px; }
pre { margin: 0; padding: 12px; font: 13.5px/1.5 var(--mono); white-space: pre-wrap; overflow-wrap: anywhere; max-height: 420px; overflow-y: auto; }
.zone { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.note { background: var(--lilac-soft); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
footer { color: var(--muted); font-size: 14px; border-top: 1px solid var(--line); padding-top: 16px; }
</style>
</head>
<body>
<main>
<header>
  <span class="status">Step 2, the pilot: two paintings</span>
  <h1>Pilot painting prompts</h1>
  <p class="lede">Two paintings to make in ChatGPT before any others: the fair square for walking, and the moor clearing for fights. Each prompt comes with a grey-box picture drawn from the game's own camera, so the painting comes back already lined up.</p>
  <p class="muted small">When these two are in, I fit them, put the Jester in them, and you judge the look. The other twelve wait until then.</p>
</header>

<section>
  <h2>How to run it</h2>
  <ol class="steps">{{STEPS}}</ol>
</section>

<section>
  <h2>The four images to attach</h2>
  <p class="muted small">Press and hold a picture to save it, or use the zip from the chat.</p>
  <ul class="imgs">{{IMGS}}</ul>
</section>
{{PAINTS}}

<section>
  <h2>Before you keep one</h2>
  {{CHECK}}
</section>

<section>
  <h2>The standing rules</h2>
  <p>These are already inside both prompts. Every later painting will carry the same ones, so they are worth a read.</p>
  <div class="prompt"><pre tabindex="0">{{RULES}}</pre></div>
</section>

<section>
  <h2>What I chose, for you to check</h2>
  <ul class="plain">{{CHOSE}}</ul>
  <div class="note">
    <h3>Next: step 3</h3>
    <p>The walking screen and the fight screen, built on these grey-box pictures with the Jester, so the paintings can drop straight in. Tell me to start and it will be under way while you paint.</p>
  </div>
</section>

<footer>Moon Faire starter world, step 2 of the brief. November 13, 2026. Branch claude/moon-faire-starter-world, folder game/pilot.</footer>
</main>
<script>
document.querySelectorAll('button.copy').forEach(function (b) {
  b.addEventListener('click', function () {
    var pre = document.getElementById(b.getAttribute('data-for')), text = pre.textContent, said = b.textContent;
    function done(ok) { b.textContent = ok ? 'Copied' : 'Selected: now press Copy'; setTimeout(function () { b.textContent = said; }, 2600); }
    function select() { try { var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} done(false); }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, select); } catch (e) { select(); }
  });
});
</script>
</body>
</html>
'''

def markdown():
    out = ['# Moon Faire pilot painting prompts', '', 'The text of the page `pilot-prompts.html`, which also holds the images to attach.', '', '## How to run it', '']
    out += ['%d. %s' % (i + 1, s) for i, s in enumerate(STEPS)]
    out += ['', '## Images to attach', ''] + ['- **%s** `%s`: %s. %s' % (c, f, t, d) for c, f, t, d in IMAGES]
    for p in PAINT:
        out += ['', '## %s: %s' % (p['code'], p['name']), '', p['why'], '', '- %s. %s.' % (p['kind'], p['shape']), '- Attach, in this order: %s.' % p['attach'], '- Save as `%s`.' % p['save'], '', '```', PROMPT[p['code']], '```']
    out += ['', '## Before you keep one', '']
    for h, xs in CHECK: out += ['**%s**' % h, ''] + ['- ' + x for x in xs] + ['']
    out += ['## What Claude chose, for Chris to check', ''] + ['- ' + x for x in CHOSE]
    return '\n'.join(out) + '\n'

open(os.path.join(HERE, 'pilot-prompts.html'), 'w', encoding='utf-8').write(page())
open(os.path.join(HERE, 'pilot-prompts.md'), 'w', encoding='utf-8').write(markdown())
print('page', os.path.getsize(os.path.join(HERE, 'pilot-prompts.html')) // 1024, 'KB')
