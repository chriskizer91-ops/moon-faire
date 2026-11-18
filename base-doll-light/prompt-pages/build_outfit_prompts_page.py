# Builds Doll_Outfit_Prompts.html: sixteen outfits for the base doll (eight dresses, eight costumes), two prompts each,
# with the three pictures to attach inside it, and Doll_Outfit_Images.zip holding those three pictures.
import base64, io, html, zipfile
from PIL import Image
W = '/home/claude/work/outfits/'
src = open('/home/claude/work/refsheet/build_page.py').read()
css = src.split("css = '''", 1)[1].split("'''", 1)[0] + '''
.star{display:inline-block;font:700 12px system-ui,sans-serif;color:#1a1420;background:var(--gold);border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:2px}
.tests{color:var(--ink);font-size:14px;margin:6px 0 0}
.sub{font:600 13px system-ui,sans-serif;color:var(--gold);margin:12px 0 0}
'''

def jpg(path, maxside, q=86):
    im = Image.open(path).convert('RGB'); im.thumbnail((maxside, maxside), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return b.getvalue()

REFS = [  # code, file name, source, title, what it is for
    ('O1', 'O1_her_body.jpg', '/home/claude/io/refs2/TO1.png', 'Her body', 'Her whole body, front and back, in the plain sports bra and bike shorts, standing in the standing pose. Attach in every new chat.'),
    ('O2', 'O2_her_face.jpg', '/home/claude/io/refs/C1.png', 'Her face', 'Her face up close, so the face stays hers. Attach in every new chat.'),
    ('O3', 'O3_the_3d_doll.jpg', '/home/claude/work/refsheet/DOLL_turn.jpg', 'The 3D doll', 'The model the clothes are made for: front, her right side, back. Only her proportions and pose are copied from it. Attach in every new chat.'),
]

RULES = '''I'm attaching three images.

Image 1 is a painting of my character's whole body, front and back, in a plain black sports bra and bike shorts. Image 2 is a close-up painting of her face. These two are her: her face, her skin, her build and her colouring. She is a character in my fantasy game Moon Faire, a travelling fair in a Dark Ages fantasy world of airships and sun-crystal machines.

Image 3 is the 3D model of her that the clothes will be made for, seen from the front, from her right side and from behind. Take only her proportions and her pose from it. Never copy its head, its bald scalp, its skin or its lighting.

I need reference paintings of outfits on her body, for a 3D modeller who will build each outfit as real clothes. In every request I will describe one outfit. These rules apply to every image in this chat:

1. STYLE. A realistic, highly detailed painting, like a studio photograph taken for a costume catalogue: real cloth with its weave, seams, stitching and natural folds, real leather and metal. Her skin is real skin, as in images 1 and 2. Not a cartoon, not anime, not pixel art, no drawn outlines.

2. HER BODY, from images 1 and 3. The same grown woman with a soft, curvy figure, a small waist and full hips. Do not slim her, do not make her taller and do not lengthen her legs. Every outfit is cut to fit her body.

3. HER FACE, from image 2: the same face, with a small closed-lip smile. Her teeth never show. Her makeup is natural.

4. HER HAIR: her long dark-brown wavy hair is twisted up into a neat bun high on the back of her head, so that her neck, shoulders and back are completely clear and the neckline and back of every outfit can be seen. No strands fall over her body. A hat, hood or scarf, when I ask for one, sits over the bun.

5. THE OUTFIT is exactly what I describe, in exactly the colours I name, and nothing else: no jewellery, gloves, belts, bags, hats or shoes unless I ask for them, nothing in her hands, no props, no weapons. When I say she is barefoot, she has no shoes or socks.

6. EACH PIECE IS ITS OWN PIECE. Where an outfit has several pieces (a blouse, a bodice, a skirt, an apron, a cloak, boots), each has clear edges, so that it could be taken off on its own.

7. PLAIN CLOTH. The main fabric of each piece is one plain colour, or the subtle pattern I describe, so it can be recoloured later. Embroidery and trims only where I ask for them.

8. STILL CLOTH. Everything hangs naturally and still from her body under its own weight: no wind, no swirl, no fabric flying out. Skirts fall straight down. Nothing glows and there is no magic, sparkle or smoke.

9. VIEW. Flat and straight-on like a blueprint: no perspective, no wide-angle lens, the camera level with her waist for her whole body, never looking up or down unless I ask.

10. LIGHT. Soft, even studio light from the front. No dramatic shadows and no coloured light.

11. BACKGROUND. One flat dark plum colour (#3B2F43) and nothing else: no floor, no shadow under her feet, no text, numbers, labels, borders or grid. She stands on an invisible floor.

12. Everything is completely inside the frame with clear space on every side: the top of her head or hat, her shoes, the ends of her sleeves, skirts and cloaks. Nothing is cut off unless I say so, and nothing overlaps.

13. When an image has more than one painting, they are all the same size, at the same height in the frame, and show exactly the same outfit.

14. Never mirror her. Her right side is her right side: a piece I put on her right side stays on her right.

"Standing pose" means: standing straight, feet about 15 cm apart and pointing forward, arms straight and held about 35 degrees away from her sides, hands open and relaxed with fingers slightly apart, head level, eyes open, looking straight ahead.

Reply "ready" and wait for my first request.'''

NEWCHAT = 'Same rules as before. I will now ask for a new outfit.'

TURN = ('Wide image, landscape 3:2. Paint her in this outfit. {desc}\n\n'
        'Three paintings side by side at exactly the same size, each showing her whole body from the top of her {top} to the soles of her {feet}, in the standing pose: '
        '(1) from directly in front; (2) exact side view, facing the right edge of the image, so we see her right side; (3) from directly behind. '
        'She is as large as she can be with everything inside the image{extra}.')
DETAIL = ('Wide image, landscape 3:2. I am attaching the painting of this outfit: paint exactly the same outfit, with the same colours, trims and fit. '
          'Three large paintings side by side at the same size, in the standing pose: (1) her from the top of her {top} down to her hips, from directly in front; '
          '(2) the same from directly behind; (3) {third}. Show the cloth, the seams, the stitching{show} clearly.')

# code, title, first?, what it tests, description, top word, feet word, extra framing, third panel, extra things to show
DRESSES = [
 ('D1', 'Moonlit festival gown', True, 'A full, floor-length skirt over her legs, and embroidery to paint.',
  'A gown of matte midnight-blue velvet. A fitted bodice with a wide, gentle square neckline that shows her collarbones. Long fitted sleeves to the wrist, ending in a small flare over the back of each hand. From her natural waist a full skirt falls in soft, heavy folds to her ankles, just clearing the floor. A band of silver embroidery about 10 cm deep runs round the hem: small crescent moons and stars. The same silver embroidery, narrower, edges the neckline and the cuffs. A narrow silver ribbon ties round her waist in a small bow at the back, its two ends hanging to her hips. Dark-blue velvet slippers with round toes.',
  'head', 'slippers', '', 'the hem of the skirt and her feet in the slippers, close, from directly in front', ', the embroidery'),
 ('D2', 'Faire peasant dress', True, 'Layers: a chemise under a laced bodice, a skirt, and an apron over it.',
  'A loose chemise of undyed cream linen with a wide gathered neckline resting just on the points of her shoulders, and puffed sleeves gathered into a band just above her elbows. Over it a forest-green bodice of sturdy matte cotton that fits closely from under her arms to her waist, laced up the front with a brown cord through small brass eyelets; the chemise shows above it. A rust-orange wool skirt gathered at the waist, falling to her ankles. A plain half-apron of undyed linen tied at her waist, reaching to her knees, its ties knotted at the back. Brown leather ankle boots, laced, with a low heel.',
  'head', 'boots', '', 'her feet and ankles in the boots, exact side view from her right, close', ', the lacing'),
 ('D3', 'Elven gown', False, 'Long hanging sleeves, and a slim skirt that just touches the floor.',
  'A gown of soft, matte sage-green silk that drapes rather than stands out; the cloth is opaque, not see-through. A V neckline. A high waist just under her bust, marked by a thin plaited gold cord. Long sleeves fitted from the shoulder to the elbow, then opening into wide hanging sleeves whose lower edge falls to mid-thigh. The skirt falls straight and slim from the high waist to just touch the floor, a little longer at the back. A narrow band of gold embroidery, a running vine of small leaves, edges the neckline and the sleeve openings. Soft pale-gold leather slippers.',
  'head', 'slippers', '', 'her right arm, close, from directly in front, from her shoulder to the end of the hanging sleeve, showing how the sleeve opens and hangs', ', the embroidery'),
 ('D4', "Noblewoman's court gown", False, 'A stiff bodice, and a skirt that opens over an underskirt.',
  "A noblewoman's gown of deep burgundy silk damask with a subtle tone-on-tone pattern of small flowers, only a shade darker than the cloth. A low square neckline edged with gold braid. A stiff, smooth bodice coming to a shallow point at the front of her waist. Long fitted sleeves with gold braid at the wrists. A full skirt to the floor, open in an upside-down V at the front from waist to hem, showing a plain gold silk underskirt. A thin gold chain belt following the point of the bodice, its end hanging at the front to her knees. Black velvet shoes with small heels, barely showing under the hem.",
  'head', 'shoes', '', 'the front of the skirt, close, from her waist to the floor, where it opens over the gold underskirt', ', the braid'),
 ('D5', 'Summer day dress', False, 'A simple knee-length dress, bare legs and sandals.',
  'A simple day dress of soft mustard-yellow cotton. A round neckline. Short sleeves that end halfway down her upper arms. Fitted through the bodice to her natural waist, then a gathered skirt that ends just below her knees. A thin brown leather belt with a small brass buckle. Flat brown leather sandals with a strap round each ankle and a strap across the toes.',
  'head', 'sandals', '', 'her feet and lower legs in the sandals, close, from directly in front', ''),
 ('D6', 'Winter dress and hooded cloak', True, 'An outer layer: a cloak over a dress, with its hood down.',
  'Two layers. Underneath: a long-sleeved dress of charcoal-grey wool with a high round neck, fitted to her waist, the skirt falling to her ankles. Over it: a deep-red wool cloak fastened at the base of her neck with a round brass clasp, falling from her shoulders to mid-calf, open down the front so the dress shows down the middle, her arms coming out through the open front. The hood is down, lying in soft folds on her upper back. The cloak is lined with cream wool, which shows along its front edges. Tall brown leather boots to just below the knee.',
  'head', 'boots', '', 'exact side view from her right, from the top of her head to her knees, showing how the cloak falls over her shoulder and arm', ', the clasp, the hood'),
 ('D7', 'Nightgown', False, 'The plainest loose garment: for nights at camp and the inn.',
  'A long, loose nightgown of soft white cotton, falling straight from a gathered round neckline to her ankles. Long loose sleeves gathered into a narrow band at each wrist. A thin white ribbon drawstring at the neckline, tied in a small bow at the front. She is barefoot.',
  'head', 'bare feet', '', 'her bare feet under the hem, close, from directly in front', ', the gathers'),
 ('D8', "Fair dancer's dress", False, 'A light circle skirt for her twirl, barefoot.',
  "A fair dancer's dress. A fitted sleeveless bodice of teal cotton with a scooped neckline and wide straps. A full circle skirt in three tiers, each about 20 cm deep: teal at the top, then gold, then plum at the bottom, ending at mid-calf. A wide gold sash round her waist, knotted at her left hip, its ends hanging to mid-thigh. She is barefoot.",
  'head', 'bare feet', '', 'the skirt, close, exact side view from her right, from her waist to the hem', ', the tiers'),
]
COSTUMES = [
 ('C1', 'Airship deckhand', True, 'Fitted pieces: a shirt, a leather vest, trousers tucked into tall boots, goggles.',
  'An airship deckhand. A loose shirt of cream linen with the sleeves rolled up to just below her elbows and the collar open at the throat. Over it a fitted vest of brown leather that ends at her waist, laced up the front. High-waisted trousers of dark-brown canvas, fitted, tucked into tall black leather boots that reach just below her knees, with flat heels and three buckled straps up the outside. A wide black leather belt with a brass buckle and two small leather pouches on her right hip. Fingerless brown leather gloves. A pair of brass-rimmed goggles with round amber lenses pushed up onto her forehead, their strap round her head above her bun.',
  'head', 'boots', '', 'her right boot, close, exact side view from her right, from the knee down', ', the goggles'),
 ('C2', 'Sky-pirate captain', False, 'A long coat with tails, and a hat.',
  'A sky-pirate captain. A long coat of navy-blue wool to mid-calf, worn open, with wide turned-back cuffs, a high collar and a row of brass buttons down each front edge; it flares a little below the waist. Under it a white linen shirt with a soft ruffle at the open collar. A crimson silk sash round her waist, knotted at her left hip, its ends hanging to mid-thigh. Fitted black trousers. Tall black leather boots to the knee with the tops folded down into a wide cuff. A black tricorn hat with a thin gold edge, worn level over her bun.',
  'hat', 'boots', '', 'her head and the hat, close, exact side view from her right', ', the buttons'),
 ('C3', 'Woodland fae', True, 'See-through wings, and a dress made of leaves.',
  'A woodland fae. A short dress of overlapping leaf-shaped panels in moss green and spring green, each leaf about 12 cm long with a fine vein, covering her from her bust to mid-thigh and ending in a hem of pointed leaf tips. Two thin shoulder straps of twisted green vine. A thin crown of small green leaves round her head. She is barefoot. On her back, two pairs of dragonfly wings rising from between her shoulder blades: the upper pair about as long as her arm, the lower pair a little shorter, held still and spread out to the sides and slightly up. The wings are clear and see-through, with fine dark veins and a faint rainbow sheen, so the plum background shows through them.',
  'head', 'bare feet', ', with both wings completely inside each painting (she can be a little smaller for that)', 'her right wings alone, close, from directly behind, filling the painting, to show their veins', ', the leaves'),
 ('C4', 'Shieldmaiden', False, 'A tunic under leather armour, a cape on one shoulder, wrapped boots.',
  'A shieldmaiden. A knee-length wool tunic in slate blue with long sleeves and a band of woven red-and-cream trim round the neckline, the cuffs and the hem. Over it a cuirass of hardened brown leather covering her chest and back, laced at both sides. Brown leather bracers on her forearms. A wide brown leather belt. Dark-grey wool trousers. Soft brown leather boots to mid-calf, wrapped with crossing leather straps. A short grey wool cape fastened at her right shoulder with a round bronze brooch, hanging to her waist at the back and sweeping across her left shoulder. Her bun is tied with a leather thong.',
  'head', 'boots', '', 'her right boot, close, exact side view from her right, from the knee down', ', the trim, the brooch'),
 ('C5', 'Fair fortune teller', False, 'Layered skirts, a hip scarf hung with coins, a headscarf.',
  'A fair fortune teller. A cream cotton blouse with an off-the-shoulder gathered neckline and loose elbow-length sleeves. A full skirt to her ankles in deep plum, with a second, shorter skirt of mustard yellow over it, gathered up at her right hip. A triangular hip scarf of teal silk tied low round her hips, its edge hung with a fringe of small gold coins. A teal headscarf tied over her bun, its knot and ends at the back of her head. Small gold hoop earrings, and three thin gold bangles on each wrist. Soft brown leather slippers.',
  'headscarf', 'slippers', '', 'the hip scarf and its coins, close, from directly in front', ', the coins'),
 ('C6', 'Travelling bard', False, 'A doublet with puffed, slashed sleeves, a half-cape, a feathered cap.',
  'A travelling bard. A fitted doublet of dark-green velvet that ends just below her waist, closed down the front with small gold buttons, with puffed upper sleeves slashed to show gold silk beneath and fitted lower sleeves. A short half-cape of burgundy wool hanging from her left shoulder to her waist. Fitted tan trousers. Tall brown leather boots to just below the knee. A narrow brown leather belt. A soft, flat, wide cap of burgundy velvet tilted to her right, with one long white feather, worn over her bun.',
  'cap and feather', 'boots', '', 'her head with the cap and feather, close, exact side view from her right', ', the slashed sleeves'),
 ('C7', 'Masquerade', False, 'A mask over her face, long gloves, a structured gown.',
  'A masquerade gown of black satin: a smooth fitted corset bodice with fine gold embroidered scrolls, a sweetheart neckline, and wide straps that sit just off her shoulders. A full black satin skirt to the floor. Black satin gloves to above her elbows. A gold Venetian half-mask covering her eyes, the bridge of her nose and her upper cheeks, with filigree edges, tied with a black ribbon behind her head. A thin black velvet ribbon round her neck. Black satin shoes, barely showing under the hem.',
  'head', 'shoes', '', 'her head and the mask, close, in three-quarter view from in front and to her right', ', the embroidery, the mask'),
 ('C8', 'Paladin', False, 'Rigid metal armour pieces over cloth.',
  'A paladin. A white wool tabard with a gold sun emblem on the chest, falling front and back to her knees, belted at the waist with a brown leather belt. Over it a polished steel breastplate covering her chest, and rounded steel pauldrons on her shoulders. Sleeves of fine steel chain mail to her wrists, and brown leather gloves. Fitted dark-grey trousers. Tall brown leather boots, with steel greaves covering her shins from knee to ankle. No helmet.',
  'head', 'boots', '', 'her right shoulder and arm, close, exact side view from her right: the pauldron, the mail sleeve and the glove', ', the steel'),
]

CHECK = ['The same face, body and skin tone as images 1 and 2. Not slimmer, taller or younger. No bald head from the 3D model.',
 'The outfit exactly as asked: the colours, the lengths, the trims. Nothing added: no extra jewellery, bags, props or anything in her hands.',
 'Hair up in a bun (or under the hat or scarf asked for). Nothing falls over her body.',
 'The three views are front, her RIGHT side facing the right edge, and back, all the same size, and all the same outfit.',
 'Skirts and cloaks hang straight and still. No wind, no glow, no sparkles.',
 'Nothing cut off: the top of her head or hat, her feet or shoes, the ends of sleeves and skirts, the tips of the wings.',
 'Flat plum background, no shadow under her feet, no text or labels.']

def esc(t): return html.escape(t, quote=False)
imgs = {code: (name, jpg(srcp, 1400), title, use) for code, name, srcp, title, use in REFS}
FIRST = [o[0] for o in DRESSES + COSTUMES if o[2]]
out = ['<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
       '<title>The doll: outfit reference paintings (16 outfits)</title><style>' + css + '</style></head><body><div class="wrap">',
       '<p class="eyebrow">Moon Faire · the base doll · outfit paintings</p><h1>Dresses and costumes</h1>',
       '<p>Sixteen outfits for the doll: eight dresses and eight costumes for a travelling fair of airships and sun-crystal machines. '
       'Each outfit has two prompts: <b>A</b>, her whole body from the front, her right side and the back, which I build the outfit from; and <b>B</b>, the same outfit closer, for the cloth, the trims and one detail. '
       'I build each outfit as separate pieces (a bodice, a skirt, a cloak, boots), so the pieces can later be mixed between outfits and recoloured.</p>'
       '<p>The four witches’ own outfits need no new pictures: I already have them, and they can come in new colours too.</p>',
       '<div class="card"><h3>How to run it</h3><ol>'
       '<li>Start a new ChatGPT chat. Attach the three images in order: <b>O1, O2, O3</b>. Paste the standing rules and wait for "ready".</li>'
       '<li>Paste an outfit’s <b>A</b> prompt. Redo it until it is right (reply "Redo" and say what to fix). Save it under its code: <b>D1A.png</b>.</li>'
       '<li>Then paste its <b>B</b> prompt, attaching your kept A image. Save it as <b>D1B.png</b>. If you only have time for one, A is the one I need.</li>'
       '<li>Start a fresh chat every four outfits, or sooner if she starts to drift: attach O1 to O3 again, paste the standing rules, then the new-chat line.</li>'
       f'<li>Start with the five marked <span class="star">first</span>: <b>{", ".join(FIRST)}</b>. Between them they test every kind of clothing: layers, a full skirt, fitted trousers and boots, a cloak over a dress, and see-through wings.</li>'
       '<li>Zip them and send them to me. Those five are enough for me to start on.</li></ol></div>',
       '<h2>Images to attach</h2><p>Tap an image to open it full size, or use "Save" to download it under its name. They are also in the zip that came with this page.</p><div class="refs">']
for code, (name, data, title, use) in imgs.items():
    uri = 'data:image/jpeg;base64,' + base64.b64encode(data).decode()
    out.append(f'<div class="ref"><a href="{uri}" target="_blank"><img src="{uri}" alt="{esc(title)}"></a><div class="t"><span class="code">{code}</span><b>{esc(title)}</b><br><span>{esc(use)}</span><br><a class="save" href="{uri}" download="{name}">Save {name}</a></div></div>')
out.append('</div>')
def block(label, text, idn):
    return f'<div class="card"><button class="copy" data-for="{idn}">Copy</button><h3>{label}</h3><pre id="{idn}">{esc(text)}</pre></div>'
out.append('<h2>Standing rules</h2><p>Paste these first, with O1, O2 and O3 attached.</p>' + block('Standing rules', RULES, 'rules'))
out.append(block('The new-chat line (after the standing rules, in each fresh chat)', NEWCHAT, 'newchat'))
n = 0
for sname, sdesc, items in (('Dresses', 'Eight dresses, from a festival gown to a nightgown.', DRESSES),
                            ('Costumes', 'Eight costumes for the fair and the airships.', COSTUMES)):
    out.append(f'<h2>{esc(sname)}</h2><p>{esc(sdesc)}</p>')
    for code, title, first, tests, desc, top, feet, extra, third, show in items:
        pa = TURN.format(desc=desc, top=top, feet=feet, extra=extra)
        pb = DETAIL.format(top=top, third=third, show=show)
        star = '<span class="star">first</span>' if first else ''
        out.append(f'<div class="card"><h3><span class="code">{code}</span>{esc(title)}{star}</h3><p class="tests">{esc(tests)}</p>'
                   f'<p class="sub">{code}A · the whole outfit, three sides <button class="copy" data-for="p{code}A">Copy</button></p><pre id="p{code}A">{esc(pa)}</pre>'
                   f'<p class="sub">{code}B · closer, front and back, and one detail <button class="copy" data-for="p{code}B">Copy</button></p>'
                   f'<p class="att">Attach: <b>your kept {code}A</b></p><pre id="p{code}B">{esc(pb)}</pre></div>')
        n += 2
out.append('<h2>Before you keep an image</h2><div class="card"><ul>' + ''.join(f'<li>{esc(c)}</li>' for c in CHECK) + '</ul></div>')
script = src.split("out.append('''", 1)[1].split("''')", 1)[0]
out.append(script)
open(W + 'Doll_Outfit_Prompts.html', 'w').write(''.join(out))
with zipfile.ZipFile(W + 'Doll_Outfit_Images.zip', 'w') as z:
    for code, (name, data, title, use) in imgs.items(): z.writestr(name, data)
print('outfits:', len(DRESSES) + len(COSTUMES), '| prompts:', n, '| page', round(len(''.join(out)) / 1e6, 2), 'MB')
