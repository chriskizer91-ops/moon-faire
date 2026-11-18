# Builds Doll_Reference_Prompts.html: the doll's body reference sheet (15 prompts) with its reference pictures inside it.
import base64, io, html, json, zipfile
from PIL import Image
R = '/home/claude/io/refs/'; W = '/home/claude/work/refsheet/'

def jpg(path, maxside, q=84):
    im = Image.open(path).convert('RGB'); im.thumbnail((maxside, maxside), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return b.getvalue(), im.size

REFS = [  # code, file name, source, title, what it is for
    ('R1', 'R1_io_master.jpg', R + 'A1.png', 'Her master painting', 'Io in her full outfit: her face, hair, build and colours. Attach in every new chat.'),
    ('R2', 'R2_io_face.jpg', R + 'C1.png', 'Her face', 'Her face up close, so the face stays hers. Attach in every new chat.'),
    ('R3', 'R3_io_legs.jpg', R + 'B5.png', 'Her legs and hips', 'Her bare legs in close black shorts, front, side and back. Attach in every new chat, and again with LG1.'),
    ('R4', 'R4_io_neck_chest.jpg', R + 'C18.png', 'Her neck and chest', 'Her skin, painted to match her face. Attach in every new chat.'),
    ('R5', 'R5_doll_3d_now.jpg', W + 'DOLL_now.jpg', 'The doll as she is now', 'The 3D model in its outfit: the sports bra, the bike shorts, bare feet. Only the clothes and their fit are to be copied from it. Attach in every new chat.'),
    ('R6', 'R6_io_hand.jpg', R + 'D1.png', 'Her hand', 'Her left hand, back and palm. Attach with HN1 and HN2 only.'),
    ('R7', 'R7_io_arm.jpg', R + 'D3.png', 'Her arm', 'Her right arm, front and back. Attach with AR1 only.'),
]

RULES = '''I'm attaching five images.

Image 1 is the master painting of my character, Io, one of four witches in my game Moon Faire. Image 2 is a close-up painting of her face. Image 3 is a painting of her legs and hips in close-fitting black shorts. Image 4 is a close-up painting of her neck, shoulders and upper chest. These four are her: her face, her skin, her build and her colouring.

Image 5 is a rough 3D model of her in the outfit for this chat. Take only the clothes and how they fit from it. Never copy its look, its skin, its hair or its lighting.

I need reference paintings of Io's body for a 3D modeller. In this chat she is barefoot and wears only a plain sports bra and bike shorts. These rules apply to every image in this chat:

1. STYLE. Paint her exactly as realistically as images 1 to 4: a realistic, highly detailed painting of a real woman, like a studio photograph taken for a 3D character model. Real skin with pores, fine lines, a few soft freckles and the faint changes of colour real skin has. Not a cartoon, not anime, not pixel art, no drawn outlines, and not the smooth plastic look of the 3D model.

2. HER BODY, from images 1, 3 and 4. A grown woman with a soft, curvy figure, a small waist and full hips. Do not slim her, do not make her muscular and do not lengthen her legs. Her skin is the same warm, light tone as in her paintings, the same from her face to her toes.

3. HER FACE, when it shows, from images 1 and 2: the same face, with a small closed-lip smile. Her teeth never show. No glasses and no hat.

4. HER HAIR in this chat: her long dark-brown wavy hair is twisted up into a loose bun high on the back of her head, so that her neck, shoulders, back and arms are completely clear. No strands fall over her body.

5. HER OUTFIT never changes:
- A plain black sports bra of soft matte knit: a band about 3 cm deep under her bust, a smooth rounded scoop at the front, and two straps about 2 cm wide that run straight over the tops of her shoulders and straight down her back to the band. No logo, no lace, no seams on show, no clasp.
- Plain black bike shorts of the same matte knit: a smooth waistband about 4 cm deep that sits just below her navel, and close-fitting legs that end in a plain hem halfway down her thighs, about 10 cm above her knees. No logo, no pockets, no stripes.
- Nothing else: she is barefoot. No socks, no shoes, no jewellery, no rings, no anklets, no bracelets, no tattoos and no nail polish.

6. HER FEET. A grown woman's slender bare feet, clean, with short natural toenails, unpainted, a soft natural pink. Her toes are straight and lie close together; her second toe is about as long as her big toe. A clear arch on the inside of each foot. No calluses, no dirt, no redness.

7. HER HANDS. Smooth, graceful hands with short natural nails, unpainted. No prominent veins or tendons.

8. VIEW. Flat and straight-on like a blueprint: no perspective, no wide-angle lens, the camera level with the middle of what is shown, never looking up or down unless I ask.

9. LIGHT. Soft, even studio light from the front. No dramatic shadows, no coloured light and no oily shine on the skin.

10. BACKGROUND. One flat dark plum colour (#3B2F43) and nothing else: no floor, no shadow under her feet, no text, numbers, labels, borders or grid. When she stands, she stands on an invisible floor.

11. Everything I ask for is completely inside the frame with clear space on every side. Nothing is cut off unless I say so, and nothing overlaps.

12. When an image has more than one painting, they are all the same size, at the same height in the frame.

13. Never mirror her. When I ask for her RIGHT foot, hand or arm, paint her right one.

"Standing pose" means: standing straight, feet about 15 cm apart and pointing forward, arms straight and held about 35 degrees away from her sides, hands open and relaxed with fingers slightly apart, head level, eyes open, looking straight ahead.

Reply "ready" and wait for my first request.'''

MASTER = 'This is the master painting of Io for this chat. Every later image must match her exactly: the same face, the same body, the same skin, the same sports bra and bike shorts, the same bare feet.'
NEWCHAT = 'Image 6 is the master painting of Io from this set. Match it exactly.'

SETS = [
 ('Torso and whole body', 'Her bare middle, back and sides. Right now the model’s midriff and back are painted from her chest’s tone with no painting behind them; these give them real skin. TO1 is the master for the set: do it first.', [
  ('TO1', 'Whole figure, front and back: the master', 'wide, 3:2', 'Her skin from neck to toes, all the way round, and her proportions to check the model against. Every later image is matched to this one.', None,
   'Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size, each showing her whole body from the top of her bun to the soles of her feet. Left: from directly in front. Right: from directly behind. She is as large as she can be with her whole body inside the image and a little clear space above and below.'),
  ('TO2', 'Both sides, arms up', 'wide, 3:2', 'Her depth from shoulders to feet, and the skin of her sides and under her arms, which no painting shows.', None,
   'Wide image, landscape 3:2. Two paintings of her side by side at exactly the same size, each showing her whole body, in exact side view, standing straight with both arms raised straight up above her head, so that nothing hides the sides of her body. Left: she faces the left edge of the image, so we see her left side. Right: she faces the right edge of the image, so we see her right side. Show the curve of her back, her waist and hips, her bust in the sports bra, and her armpits.'),
  ('TO3', 'Her middle, close: front and back', 'wide, 3:2', 'The skin of her bare midriff and back, large enough to paint from.', None,
   'Wide image, landscape 3:2. Two large paintings of her body side by side at exactly the same size, each from her collarbones down to the hem of her shorts, standing straight with her arms held out about 45 degrees from her sides so they do not cover her body. Left: from directly in front. Right: from directly behind. Show the skin of her bare midriff clearly: her navel, the soft line down the middle of her belly, her lower ribs under the band of the sports bra and her waist; and on her back, her shoulder blades, the groove of her spine and the small of her back above the waistband.'),
 ]),
 ('Arms', 'Her right arm is already painted (R7). These add her left arm, and the place where arm meets shoulder, which on the model still looks a little joined on when she lifts her arms.', [
  ('AR1', 'Left arm, front and back', 'wide, 3:2', 'Her left arm, so the right one does not have to be mirrored.', 'R7',
   'Wide image, landscape 3:2. I am attaching a painting of her right arm: copy its pose, framing and realism. Two paintings, one above the other, at the same size, of her bare LEFT arm from the shoulder to the fingertips, held straight out to the side at shoulder height with the palm down. Top: seen from the front. Bottom: seen from behind. Smooth skin with real texture and soft, even shading.'),
  ('AR2', 'Shoulder and armpit, three sides', 'wide, 3:2', 'How her arm meets her shoulder and chest, front, side and back.', None,
   'Wide image, landscape 3:2. Three large paintings side by side at the same size of her right shoulder and upper arm, each from her neck to her elbow, with her arm hanging relaxed about 35 degrees from her side as in the standing pose: (1) from directly in front; (2) exact side view from her right; (3) from directly behind. Show how her arm meets her shoulder and chest, the front and the back of her armpit, her collarbone, and the strap of the sports bra over the top of her shoulder.'),
 ]),
 ('Hands', 'Her hands are already painted from the back and the palm (R6). These add their edges, and how they look at rest.', [
  ('HN1', 'Right hand, four sides', 'wide, 3:2', 'The back, palm and both edges of her right hand.', 'R6',
   'Wide image, landscape 3:2. I am attaching a painting of her hand: copy its framing and realism. Four large paintings in a row of her bare RIGHT hand and wrist, pointing straight up, fingers straight and slightly apart, thumb held out a little: (1) the back of the hand; (2) the palm; (3) seen from the thumb side; (4) seen from the little-finger side. Short natural nails, unpainted.'),
  ('HN2', 'Left hand, four sides', 'wide, 3:2', 'The same four for her left hand.', 'R6',
   'Wide image, landscape 3:2. I am attaching a painting of her hand: copy its framing and realism. Four large paintings in a row of her bare LEFT hand and wrist, pointing straight up, fingers straight and slightly apart, thumb held out a little: (1) the back of the hand; (2) the palm; (3) seen from the thumb side; (4) seen from the little-finger side. Short natural nails, unpainted.'),
  ('HN3', 'Hand at rest', 'wide, 3:2', 'How her hand hangs when she stands: the fingers softly curled. No painting shows it, and it is how she stands most of the time.', None,
   'Wide image, landscape 3:2. Three large paintings side by side at the same size of her bare right hand and forearm hanging relaxed at her side as in the standing pose, the fingers softly curled, not straight, the thumb resting beside the first finger: (1) from directly in front, so we see the back of the hand; (2) exact side view from her right, so we see the thumb side; (3) from directly behind, so we see the palm side.'),
 ]),
 ('Legs', 'B5 (R3) gave her legs, but in socks and boots below the calf. These give her shins and ankles bare, and the inside of her legs.', [
  ('LG1', 'Legs barefoot: front, side, back', 'wide, 3:2', 'Her whole bare legs and feet together, at the same scale as B5, so the legs and feet can be joined in one painting.', 'R3',
   'Wide image, landscape 3:2. I am attaching the earlier painting of her legs: match its framing and size, but this time she wears the bike shorts and is barefoot. Three paintings side by side of her from the waist down only, at the same size, legs straight, feet about 15 cm apart and pointing forward, flat on an invisible floor: (1) from directly in front; (2) exact side view facing the right edge of the image; (3) from directly behind. Show her bare legs all the way down: knees, shins, calves, ankles and feet.'),
  ('LG2', 'Knees and lower legs, close', 'wide, 3:2', 'Her knees, shins, calves and ankles large, including the inside of the leg, which a front, side or back view cannot see.', None,
   'Wide image, landscape 3:2. Three large paintings side by side at the same size of her legs from the hem of her shorts down to the floor, standing straight and barefoot: (1) from directly in front; (2) from directly behind; (3) in three-quarter view from in front and to her left, so the inside of her right knee, calf and ankle can be seen. Show the shape of her kneecaps, the backs of her knees, her calves, her shins and both ankle bones clearly.'),
 ]),
 ('Feet', 'The most important set. No painting of her has ever shown her feet, so the model’s feet are built from a foot’s measurements and painted plain. These five give their shape from every side and the skin to paint onto them, the way her hands were made.', [
  ('FT1', 'Right foot, outside', 'square', 'The outline of her foot from the outside: heel, sole, instep and toes. I measure the foot from this one.', None,
   'Square image. One large painting of her bare RIGHT foot and lower leg from mid-calf down, standing flat on an invisible floor, seen in exact side view from the outside, toes pointing to the right edge of the image. Show the shape of her heel, the line of the sole along the floor, the outer ankle bone, the top of her foot from her ankle down to her toes, and her little toe.'),
  ('FT2', 'Right foot, inside', 'square', 'The inside of her foot: the arch, the inner ankle bone, the ball of the big toe.', None,
   'Square image. One large painting of her bare RIGHT foot and lower leg from mid-calf down, standing flat on an invisible floor, seen in exact side view from the inside, toes pointing to the left edge of the image. Show the arch lifting off the floor, the inner ankle bone, the ball of her big toe, and her big toe.'),
  ('FT3', 'Both feet from above', 'square', 'The tops of her feet, her toes and her toenails. This is the painting that gets laid onto the model’s feet.', None,
   'Square image. Both of her bare feet standing flat on an invisible floor, about 10 cm apart and pointing forward, seen from above: the camera looks down at them steeply, almost straight down, so the tops of both feet and all ten toes and toenails fill most of the image. Her legs leave the top edge of the image just above her ankles; that is the only thing that leaves the frame. Show each toe, each toenail, the tendons on the tops of her feet, and both ankle bones.'),
  ('FT4', 'Both feet, front and back', 'wide, 3:2', 'Her feet from in front (the toes and how they sit together) and from behind (heels and the tendons above them).', None,
   'Wide image, landscape 3:2. Two paintings side by side at the same size of both of her bare feet and lower legs from mid-calf down, standing flat on an invisible floor about 10 cm apart, with the camera level with her ankles. Left: from directly in front, toes toward the viewer. Right: from directly behind: both heels, the tendons running up from them, and the edges of her soles.'),
  ('FT5', 'The soles', 'wide, 3:2', 'The undersides of her feet, which every kneel, sit and step shows.', None,
   'Wide image, landscape 3:2. Both of her bare soles seen from directly below, as if she were standing on a sheet of clear glass and the camera were under the glass looking straight up. Only her feet and ankles are seen; her legs rise away from the camera. Heels toward the bottom of the image, toes toward the top. Show her heels, her arches, the balls of her feet and the pads of all ten toes, with soft natural pink where her feet press on the glass.'),
 ]),
]

CHECK = ['The same face, body and skin tone as the master. Not slimmer, taller, younger or more muscular.',
 'A plain black sports bra and plain black bike shorts: no logos, lace or stripes. The shorts end halfway down her thighs.',
 'Barefoot. No jewellery, nail polish, tattoos, socks or shoes.',
 'Toes straight and close together; short, unpainted, pale-pink toenails; a clear arch.',
 'Her RIGHT foot or hand when the prompt says right (the big toe is on the inside; on a right foot seen from the outside, the toes point right).',
 'Hair up in a bun; nothing falls over her body.',
 'Nothing cut off, except the legs in FT3 and the close-ups that ask for it.',
 'Flat plum background, no shadow under her feet, no text or labels.',
 'Real skin, not the smooth look of the 3D model in R5.']

def esc(t): return html.escape(t, quote=False)
imgs = {}
for code, name, src, title, use in REFS:
    data, size = jpg(src, 1100)
    imgs[code] = (name, data, size, title, use)

css = '''
:root{--bg:#15121c;--card:#211b2b;--line:#3a3046;--plum:#3B2F43;--ink:#efe6f2;--muted:#b6a8bf;--gold:#d9b24c;--rose:#d0567c}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
.wrap{max-width:980px;margin:0 auto;padding:22px 16px 60px}
.eyebrow{font:600 11px ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin:0 0 6px}
h1{font:400 clamp(30px,8vw,46px)/1.05 Georgia,serif;margin:0 0 10px}
h2{font:400 26px/1.2 Georgia,serif;margin:34px 0 6px;color:var(--gold)}
h3{font:600 17px/1.3 system-ui,sans-serif;margin:0}
p,li{color:var(--muted)} p b,li b{color:var(--ink)}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}
.refs{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.ref{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.ref img{display:block;width:100%;height:190px;object-fit:contain;background:var(--plum)}
.ref .t{padding:8px 10px 10px;font-size:14px}.ref .t b{color:var(--ink)}.ref .t span{color:var(--muted)}
.code{display:inline-block;font:700 13px ui-monospace,Menlo,monospace;background:var(--rose);color:#fff;border-radius:6px;padding:1px 7px;margin-right:6px}
a.save{display:inline-block;margin-top:6px;color:var(--gold);font-size:13px}
pre{white-space:pre-wrap;word-wrap:break-word;background:#120f18;border:1px solid var(--line);border-radius:10px;padding:12px;margin:8px 0 0;font:14px/1.5 ui-monospace,Menlo,monospace;color:#e8dcef}
button.copy{float:right;min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid var(--gold);background:transparent;color:var(--gold);font:600 14px system-ui,sans-serif;cursor:pointer}
button.copy.ok{background:var(--gold);color:#1a1420}
.meta{font-size:13px;color:var(--muted);margin:2px 0 0}.meta b{color:var(--ink)}
ol li,ul li{margin:4px 0}
.att{color:var(--ink);font-size:14px;margin-top:4px}
'''
out = ['<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
       '<title>The doll: body reference paintings (15)</title><style>' + css + '</style></head><body><div class="wrap">',
       '<p class="eyebrow">Moon Faire · the base doll · reference paintings</p><h1>Her feet, hands, legs, body and arms</h1>',
       '<p>Fifteen paintings of the doll (Io, barefoot, in a plain black sports bra and bike shorts) for her 3D model. Feet are the most important: no painting of her has ever shown them. '
       'With these I can bake real painted skin onto her feet, middle, back, shins and the far side of her arms and hands, and measure her feet the way her hands were measured.</p>',
       '<div class="card"><h3>How to run it</h3><ol>'
       '<li>Start a new ChatGPT chat. Attach the five starter images in order: <b>R1, R2, R3, R4, R5</b>. Paste the standing rules and wait for "ready".</li>'
       '<li>Paste <b>TO1</b> first. Redo it until she looks right, then send the master line.</li>'
       '<li>Go down the list one prompt at a time. One prompt makes one image. Where a prompt says <b>Attach</b>, add that image to the same message. If a result breaks a rule, reply "Redo" and say what to fix.</li>'
       '<li>Save each keeper under its code: <b>FT1.png</b>, <b>TO3.png</b>. A second keeper of the same prompt is <b>FT1b.png</b>.</li>'
       '<li>If the chat gets long and she drifts, start a new one: attach R1 to R5 plus your kept TO1, paste the standing rules, then the new-chat line.</li>'
       '<li>Zip them and send them to me. The feet (FT1 to FT5) are enough to start on if you want to send those first.</li></ol></div>',
       '<h2>Images to attach</h2><p>Tap an image to open it full size, or use "Save" to download it under its name.</p><div class="refs">']
for code, (name, data, size, title, use) in imgs.items():
    uri = 'data:image/jpeg;base64,' + base64.b64encode(data).decode()
    out.append(f'<div class="ref"><a href="{uri}" target="_blank"><img src="{uri}" alt="{esc(title)}"></a><div class="t"><span class="code">{code}</span><b>{esc(title)}</b><br><span>{esc(use)}</span><br><a class="save" href="{uri}" download="{name}">Save {name}</a></div></div>')
out.append('</div>')
def block(label, text, idn):
    return f'<div class="card"><button class="copy" data-for="{idn}">Copy</button><h3>{label}</h3><pre id="{idn}">{esc(text)}</pre></div>'
out.append('<h2>Standing rules</h2><p>Paste these first, with R1 to R5 attached.</p>' + block('Standing rules', RULES, 'rules'))
out.append(block('The master line (after you keep TO1)', MASTER, 'master'))
out.append(block('The new-chat line (with R1 to R5 and your kept TO1 attached)', NEWCHAT, 'newchat'))
n = 0
for sname, sdesc, items in SETS:
    out.append(f'<h2>{esc(sname)}</h2><p>{esc(sdesc)}</p>')
    for code, title, shape, use, attach, prompt in items:
        n += 1
        att = f'<p class="att">Attach: <b>{attach}</b></p>' if attach else ''
        out.append(f'<div class="card"><button class="copy" data-for="p{code}">Copy</button><h3><span class="code">{code}</span>{esc(title)}</h3>'
                   f'<p class="meta"><b>{esc(shape)}</b> · {esc(use)}</p>{att}<pre id="p{code}">{esc(prompt)}</pre></div>')
out.append('<h2>Before you keep an image</h2><div class="card"><ul>' + ''.join(f'<li>{esc(c)}</li>' for c in CHECK) + '</ul></div>')
out.append('''<script>
document.querySelectorAll('button.copy').forEach(function (b) {
  b.addEventListener('click', function () {
    var t = document.getElementById(b.getAttribute('data-for')).textContent;
    var done = function () { b.textContent = 'Copied'; b.classList.add('ok'); setTimeout(function () { b.textContent = 'Copy'; b.classList.remove('ok'); }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { fallback(t); done(); });
    else { fallback(t); done(); }
  });
});
function fallback(t) { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(a); }
</script></div></body></html>''')
open(W + 'Doll_Reference_Prompts.html', 'w').write(''.join(out))
with zipfile.ZipFile(W + 'Doll_Reference_Images.zip', 'w') as z:
    for code, (name, data, size, title, use) in imgs.items(): z.writestr(name, data)
print('prompts:', n, '| page', round(len(''.join(out)) / 1e6, 2), 'MB')
