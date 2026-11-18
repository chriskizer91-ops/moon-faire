# Io, the Herbal Witch: every word of her reference-painting list.
# One place for the text, so the HTML page, the project note and the repo copy can never disagree.

DATE = "November 13, 2026"

# ---------------------------------------------------------------- images to attach
# code, file name, title, what it is, when to attach
IMAGES = [
    ("IO1", "IO1_io_painting.jpg", "Her painting",
     "From the group painting. Her face, her hair, the hat and her colours.", "starter"),
    ("IO2", "IO2_io_character_sheet.jpg", "Her character sheet",
     "The large standing figure, the three back and side views, and her faces.", "starter"),
    ("IO3", "IO3_io_sprite_sheet.jpg", "Her sprite sheet",
     "The 24 poses the flipbook was cut from: Harvest Crescent, Silverleaf Salve, Elderwood Guardian.", "starter"),
    ("S1", "S1_style_jester_standing.jpg", "Style guide: the Jester standing",
     "One of the Jester's finished reference paintings. It shows ChatGPT the pose, the light, the background and how real to paint.", "starter"),
    ("S2", "S2_style_jester_face.jpg", "Style guide: the Jester's face",
     "How realistic a face should be.", "starter"),
    ("IO4", "IO4_io_envoi_picture.jpg", "Io as she is in Envoi",
     "The picture you sent of her with the dagger and the purple flame. Attach only where a prompt asks for it: it shows the hat band, the dagger and the witchfire, but its hair and dress are different.", "extra"),
    ("IO5", "IO5_closeup_hat_and_face.jpg", "Close-up: hat and face",
     "Her painting, enlarged: the horns, the chain, the gold charm, her glasses and fringe.", "extra"),
    ("IO6", "IO6_closeup_necklaces_pouch_crystal_book.jpg", "Close-up: necklaces, pouch, crystal, book",
     "Her painting, enlarged: the moon pendant, the bracelets, the belt pouch, the crystal and the book cover.", "extra"),
    ("IO7", "IO7_closeup_skirt_and_boots.jpg", "Close-up: skirt and boots",
     "Her character sheet and two sprites, enlarged: the tiers of the skirt, the slit, the belt and the boots.", "extra"),
    ("IO8", "IO8_flipbook_harvest_crescent.jpg", "Flipbook: Harvest Crescent",
     "All 12 flipbook frames of the move, in order.", "extra"),
    ("IO9", "IO9_flipbook_silverleaf_salve.jpg", "Flipbook: Silverleaf Salve",
     "All 22 flipbook frames of the move, in order.", "extra"),
    ("IO10", "IO10_flipbook_elderwood_guardian.jpg", "Flipbook: Elderwood Guardian",
     "All 22 flipbook frames of the move, in order.", "extra"),
    ("S3", "S3_style_jester_hands.jpg", "Hands guide",
     "Attach with D1 and D2 only.", "extra"),
    ("S4", "S4_style_jester_boot.jpg", "Boot guide",
     "Attach with E1 only.", "extra"),
]

WHAT = [
    "Io in 3D, built the way the HD Jester was. The paintings follow the Jester's, the Ranger's and the Fox's sets: realistic, on flat plum, in fixed views.",
    "104 prompts in four rounds. <b>Round 1</b> (sets A to E, 43 images) is enough to start building: her body, her face, hair and hat, her hands and her boots. <b>Round 2</b> (F and G, 21) is details, flat cloth, her book and her blades. <b>Round 3</b> (H and I, 26) is the flipbook moves, the powers from your lore, and her magic. <b>Round 4</b> (J and K, 14) is the Guardian as a creature, and extra moves.",
    "Rounds 3 and 4 are where I used the freedom you gave me with her spells. Read \"What I plan to animate\" near the bottom before you run them, and change anything you like.",
]

# The choices that would cost the most to get wrong. Shown at the top of the page.
CHOICES_TOP = [
    ("Hair", "Long, loose and very wavy, down to her hips, as in her painting, her sheet and the flipbook. The Envoi picture has it tied back with grey in it."),
    ("Hat", "Wine-red with two small ridged horns that point up, as in her painting. The Envoi picture has a plum hat with curled ram's horns."),
    ("Robe", "Sheer wine-red chiffon with tiny gold dots and a gold band on every edge, with the huge three-tier sleeves from her sheet."),
    ("Blades", "Both. The gold sickle that unfolds from her moon pendant (flipbook) is her plain attack. The dagger from the Envoi picture sits in a sheath on her left hip and is used for her one harmful spell."),
    ("Magic colour", "Both. Gold-green growing light for everything that heals or grows (flipbook). Violet witchfire for the little that harms (Envoi)."),
    ("Teeth", "None showing, in any picture. I carried your Fox rule over to her."),
    ("Book", "In her left hand, as in every flipbook frame. For the big new spells it floats open beside her so both hands are free. That part is my idea."),
]

HOW = [
    "Start a new ChatGPT chat. Attach the five starter images in order: IO1, IO2, IO3, S1, S2. Paste the standing rules and wait for \"ready\".",
    "Paste A1. Redo it until she looks right. Then send the master line (below the standing rules). If you would like a second opinion, send A1 to me before you run the rest.",
    "Go down the list one prompt at a time. One prompt makes one image. Where a prompt says \"Attach\", add those images to the same message. If a result breaks a rule, reply \"Redo\" and say what to fix.",
    "Save each keeper under its code: A1.png, C3.png. A second keeper of the same prompt is A1b.png.",
    "When the chat gets long and she drifts, start a new one: attach the five starters plus your kept A1 and C4, paste the standing rules, then send the new-chat line.",
    "Before the first prompt of set H, paste the magic rules. Paste them again in any new chat that makes H, I, J or K images.",
    "Zip each round and send it to me. Round 1 is enough to start building.",
]

MASTER_LINE = "This is the master painting of Io. Every later image in this chat must match her exactly: the same face, the same hair, the same hat, the same build, the same clothes and the same colours."
NEWCHAT_LINE = "Images 6 and 7 are finished paintings of Io from this set. Match them exactly."

RULES = """I'm attaching five images.

Images 1, 2 and 3 show my character, Io, the Herbal Witch, one of four witches in my game Moon Faire:
- the painting of her sitting and reading,
- her character sheet,
- her sprite sheet of 24 small standing poses.
They are her design: her face, hair, body, clothes and colours. Parts of two other characters show at the left and right edges of her painting: ignore them.

Images 4 and 5 are finished reference paintings of a different character from the same game, the Jester. They are style guides only.

I need reference paintings of Io for a 3D modeller. These rules apply to every image in this chat:

1. STYLE. Paint her the way the Jester style guides are painted: a realistic, highly detailed painting of a real woman wearing a real costume, like a studio photograph taken for a 3D character model. Real skin, hair, chiffon, lace, felt, leather, horn and metal. Not a cartoon, not anime, not pixel art, no drawn outlines.

2. Take only these things from the Jester style guides: how realistic the painting is, the pose, the camera, the lighting and the background. Never copy the Jester's face, make-up, body, costume or colours.

3. HER FACE, from the Io painting. A grown woman with a soft, heart-shaped face, a small chin, dark brown eyes and a gentle, knowing smile. Keep her the age she is in her painting. Light, natural make-up. Her lips are closed, or only just parted when I ask for it: her teeth never show in any image. Round glasses with thin dark metal frames and clear lenses; she wears them in every image unless I say WITHOUT her glasses.

4. HER HAIR is one hairstyle in every image: very long, loose and very wavy. It is dark brown with lighter ash-brown strands running through it: take the colour from her painting. It is parted near the middle, with a few long wispy strands across her forehead, and it falls in big loose waves in front of both shoulders and down her back as far as her hips. It is never tied back, plaited or cut shorter.

5. HER HAT. She wears it in every image unless I say WITHOUT her hat. A soft witch's hat of wine-red felt with tiny gold flecks. The brim is wide, about 45 cm across, and a little wavy. The crown is tall and pointed but has gone soft: it creases, slumps over and hangs down toward HER RIGHT side, ending in a blunt drooping tip. Round the base of the crown there is a band of black lace, and over the lace a fine silver chain with three tiny gold crosses hanging from it. At the front of the band, a little toward her left, hangs one large gold charm about 9 cm tall: a ring with a straight bar running down through it and a short crossbar on the bar. Two small horns are fixed to the hat, one on each side of the crown just above the brim. They are cream-white and ridged like a goat's horns, each about 8 cm long, curving up and slightly outward to a blunt point. The horns are part of the hat, not part of her.

6. HER BODY, from the character sheet and the sprite sheet. A real woman's soft, curvy figure with full hips. Do not slim her and do not lengthen her legs.

7. HER COSTUME never changes:
- A long, open robe of wine-red chiffon. It is sheer: light shows through a single layer of it, and it turns solid wine-red where layers overlap. It is scattered all over with tiny gold dots and has a narrow band of gold embroidery along every edge. It is worn open down the front and is never fastened. There is a cut-out at the top of each sleeve, so the point of each shoulder is bare. The sleeves are enormous bell sleeves, each made of three tiers of cloth, every tier wider than the one above it; with her arms down, the lowest tier hangs to her knees. The body of the robe falls to her calves and ends in long, uneven points.
- Under the robe, a fitted black bodice with thin shoulder straps and a scooped neckline edged with scalloped black lace. The black cloth has a fine, dark sparkle.
- Two necklaces. A short, fine silver chain with one small clear teardrop crystal, resting at the base of her throat. And a long black cord carrying her gold moon pendant at the middle of her chest: a large gold crescent moon about 5 cm across with its horns pointing up; under it a smaller gold crescent, horns up; and under that a small gold cross.
- A stack of three beaded bracelets on each wrist: black beads, dark wooden beads and small gold beads.
- A wide black leather belt with a round antique-gold ring buckle at the centre front, worn at her waist over the bodice. On her RIGHT hip the belt carries a black leather pouch with a flap and gold filigree fittings. From the belt at the centre front hangs her crystal on a short gold chain: a clear quartz point about 8 cm long with a faint blue tint, held in a small gold cap.
- A long black skirt to her ankles, made of many overlapping tiers with ragged, pointed hems: soft, sheer black tulle underneath, and black lace sprinkled with tiny gold sequins on top. The skirt is open in a high slit at the front over her LEFT leg, so her bare left leg shows from the middle of her thigh down to her boot.
- Black leather lace-up platform combat boots that reach the middle of her calf: glossy black leather, black laces through ten pairs of antique-gold eyelets, a buckled strap round the top, a rounded toe, and a thick black lug sole about 5 cm deep. A short black sock cuff shows above each boot.

8. She is not symmetrical. The tip of her hat hangs toward her right. The pouch is on her right hip. The slit in the skirt is over her left leg. Never mirror her.

9. Smooth, graceful hands with short natural nails. No prominent veins or tendons.

10. No book, no sickle, no dagger and no magic unless I ask for them.

11. VIEW. Flat and straight-on like a blueprint: no perspective, no wide-angle lens, the camera level with the middle of what is shown, never looking up or down at her unless I ask.

12. LIGHT. Soft, even studio light from the front. No dramatic shadows, no coloured light, no glow and no sparkles unless I ask. The brim of her hat does not throw a dark shadow over her face.

13. BACKGROUND. One flat dark plum colour, the same as the style guides (#3B2F43), and nothing else: no floor, no ground shadow, no text, numbers, labels, borders or grid.

14. Everything I ask for is completely inside the frame with clear space on every side. Nothing is cut off and nothing overlaps.

15. When an image has more than one painting of her, they are all the same size, with their feet on the same line.

"Standing pose" means: standing straight, feet a little apart, toes forward, arms straight and held about 35 degrees away from her sides, hands open and relaxed with fingers slightly apart, head level, a small closed-lip smile, eyes open, looking straight ahead. Her hair, her sleeves, her skirt and her crystal hang still.

Reply "ready" and wait for my first request."""

MAGIC = """From here on, magic is allowed in the images where I ask for it. Io is a herbalist and a healer. Her magic is nature growing fast, and it always looks like this:

- GROWING LIGHT. Her healing magic is warm light in the colours of spring: soft gold with a fresh green edge, and pearl-white where it is brightest. It drifts as small motes, like pollen or fireflies. It never looks like fire.
- SILVERLEAF AND SEEDS. Silverleaf is a slim, pointed leaf about 8 cm long, silver-green, that glows gold along its edges and veins when she uses it. Her seeds are the size of a walnut and glow from inside like small lanterns.
- ROOTS AND VINES. Living wood, pale brown and green, that grows in spirals and puts out small new leaves as it grows. For an attack it grows dark and thorned.
- MOONFLOWERS. Large white trumpet-shaped flowers that open at night and glow pearl-white like small moons, on dark green vines with heart-shaped leaves. Small white star-shaped flowers grow with them.
- HER BOOK. When she lets go of her spellbook it stays floating in the air at her left side, at the height of her waist, open, with its pages turning by themselves and a soft gold light rising from them.
- WITCHFIRE. Her one harmful magic: a cool violet-magenta flame with a pale pink-white heart. It burns only on the blade of her dagger, in her open hand, and in the cracks of her thorns. It never scorches her.
- SPIRITS she calls are made of living wood, moss and leaves, with eyes of green-gold light.
- SPARKS. Small four-pointed stars and tiny crescent moons of gold light.

The background stays the same flat dark plum, and the magic is painted over it. She always casts toward the right edge of the image. Her spellbook is in her LEFT hand unless I say it floats, and she casts, cuts and plants with her RIGHT hand. When a target is needed, it is a wooden training dummy: a post with a padded canvas body, a round canvas head and two short arms. When an ally is needed, it is a plain grey artist's mannequin the same height as her, with no face and no clothes.

Reply "ready"."""

BOOK = "Her spellbook is an old book about 25 cm tall, 18 cm wide and 6 cm thick, bound in worn dark brown leather, with an eight-pointed compass star tooled in gold on the front cover, brass corner pieces and thick cream pages with rough edges."

# ---------------------------------------------------------------- the sets
# Each prompt: code, title, shape, why, attach (list of codes or words), source note (or ""), prompt text
T, W, Q = "Tall, 2:3", "Wide, 3:2", "Square"

SETS = []

SETS.append(dict(key="A", round=1, title="Whole figure, full outfit",
    intro="Her proportions and how the costume is laid out. Start with A1 and stay on it until you like her.",
    prompts=[
    ("A1", "Front: the master", T, "Body proportions and costume layout. Every later image gets matched to this one.", [], "",
     "Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly in front. She is as large as she can be while the highest point of her hat and the soles of her boots stay inside the image with a little clear space. The tip of her hat hangs on the left side of the image, the pouch on her right hip is on the left side of the image, and her bare left leg shows through the slit on the right side of the image."),
    ("A2", "Back", T, "The back of the hat, her hair down her back, and the back of the robe and skirt. Her back has never been drawn at this size.", [], "",
     "Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly behind, at the same size in the frame as the master painting. Show clearly: the back of the hat and how its crown slumps over (the tip is on the right side of this image), the black lace band and the chain going round the back of the crown, her hair falling down her back over the robe as far as her hips, the back of the robe with its long pointed hem, both great sleeves from behind, and the back of the skirt and the boots below the robe."),
    ("A3", "Both sides", W, "Her depth: bust, waist and hips, how far the brim reaches, and how the hair, robe and skirt hang from the side.", [], "",
     "Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, in exact side view, at exactly the same size. Left: she faces the left edge of the image, so we see her left side. Right: she faces the right edge of the image, so we see her right side, with the pouch, and with the tip of the hat hanging toward us. These are the two different sides of her, not one painting mirrored. In both, show how far the brim of the hat reaches in front of her face and behind her head, how her hair falls in front of and behind her shoulder, and how the skirt opens over her left leg at the front."),
    ("A4", "Three-quarter views", W, "How the robe, the belt and the skirt wrap round her.", [], "",
     "Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, at exactly the same size. Left: turned 45 degrees, halfway between a front view and a view of her facing the right edge of the image. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the right edge."),
    ("A5", "Arms straight out, front and back", W, "The great sleeves in full. They are the biggest cloth on her after the skirt.", [], "",
     "Wide image, landscape 3:2. Two paintings of her side by side, in her full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, palms down, fingers together. Left: from directly in front. Right: from directly behind. Show the whole of each great bell sleeve hanging from her arm, with its three tiers and their gold-edged hems, the cut-out at each shoulder, and how the open robe hangs from her shoulders to her calves."),
    ("A6", "How she really stands, with her book", W, "Her resting pose. In every picture of her the book is in her left hand, and her arms do not stick out.", [], "Flipbook: the first frame of every move.",
     "Wide image, landscape 3:2. Two paintings of her whole figure side by side at exactly the same size, in her full outfit, standing relaxed the way she does in her sprite sheet: her weight even on both feet, her shoulders soft, her right arm hanging naturally at her side with the hand relaxed and the palm turned in toward her thigh, and her spellbook held open in her LEFT hand at waist height, resting on her palm and forearm. " + BOOK + " She looks straight ahead with a small closed-lip smile. Left: from directly in front. Right: exact side view facing the left edge of the image, so we see her left side and the book."),
]))

SETS.append(dict(key="B", round=1, title="Layers off",
    intro="What the robe, the belt and the skirt hide. I build these layers first and check them before anything goes on top. Her hair is tucked up in these so her back and shoulders can be seen.",
    prompts=[
    ("B1", "Robe off: front and back", W, "The whole bodice, her bare arms and shoulders, the belt and the top of the skirt.", [], "",
     "Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size. Take off the robe only. Keep everything else exactly the same: hat, glasses, both necklaces, bracelets, black bodice, belt, pouch, crystal, skirt and boots. Her arms and shoulders are bare. For this image only, her hair is twisted up and tucked under her hat, so that her neck, shoulders, arms and back are completely clear. Left: from directly in front. Right: from directly behind. Show the whole bodice, front and back, and how it meets the belt and the skirt."),
    ("B2", "Robe off: both sides", W, "Her body in profile with nothing in the way.", [], "",
     "Wide image, landscape 3:2. Two paintings of her side by side at exactly the same size, without the robe, with her hair twisted up and tucked under her hat, in exact side view, standing straight with both arms held straight out to the sides at shoulder height so they do not hide her body. Left: she faces the left edge of the image. Right: she faces the right edge of the image, so we see the pouch on her right hip."),
    ("B3", "Bodice and skirt only: front and back", W, "Her waist and hips with no belt, and where the skirt begins.", [], "",
     "Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size. Take off these things: the robe, the belt with its pouch and crystal, both necklaces and all the bracelets. Her hair is twisted up and tucked under her hat. Keep everything else exactly the same: hat, glasses, black bodice, skirt and boots. Left: from directly in front. Right: from directly behind. Show the bottom edge of the bodice, the waistband of the skirt, and where the slit over her left leg begins."),
    ("B4", "The skirt from three sides", W, "The tiers of the skirt and the slit, with no robe over them.", [], "",
     "Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size: the skirt, her bare left leg and the boots, with no robe, no belt, no pouch and no crystal. Legs straight, feet a little apart. Left: from directly in front, with her bare left leg showing through the slit on the right side of the image. Middle: exact side view facing the left edge of the image. Right: from directly behind. Show each tier of the skirt with its ragged, pointed hem, and the sheer tulle under the lace."),
    ("B5", "Legs", W, "The shape of her hips and legs, which the skirt mostly hides. The cloth has to know they are there.", [], "",
     "Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size. For this image only, she wears plain, close-fitting black shorts in place of the skirt, with her boots and their sock cuffs, and no belt, pouch or crystal, so that the shape of her hips and bare legs can be seen. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind."),
]))

SETS.append(dict(key="C", round=1, title="Head, face, hair, glasses and hat",
    intro="The face is what you look at first, and she has the most on her head of the four: the hat, the horns, the glasses and hair to her hips. So this is the biggest set. The face paintings are without her hat and glasses, because those will be real 3D objects and must not be painted onto her skin or shade it.",
    prompts=[
    ("C1", "Face from the front: no hat, no glasses", Q, "The face that gets painted onto the model. Stay on this one until it is her.", [], "",
     "Square image. One very large close-up painting of her face from directly in front, WITHOUT her hat and WITHOUT her glasses. For this image only, her hair is drawn back off her face and tucked behind her ears, with no strands across her forehead, so that her whole face is clear from her hairline to just under her chin, with both ears inside the frame. Relaxed face with the faintest closed-lip smile, eyes open and looking straight at the viewer, head perfectly level, not tilted and not turned. Even light with no shadows across her face. Painted as realistically as the Jester face style guide: real skin with pores and fine lines."),
    ("C2", "The same face with glasses", Q, "Where the glasses sit against her eyes.", [], "",
     "Square image. Exactly the same close-up as the last image: the same face, the same framing, the same expression, head level, hair still drawn back, still WITHOUT her hat. This time she is wearing her round glasses. The lenses are clear, with no glare and no reflections, so both eyes are fully visible through them."),
    ("C3", "Front, three-quarter and profile: no hat, no glasses", W, "The shape of her head. I measure the profile to the millimetre.", [], "",
     "Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, WITHOUT her hat and WITHOUT her glasses, each showing from the top of her head down to her collarbones. Her hair is drawn back off her face, tucked behind her ears, and hangs down behind her shoulders. Left: from directly in front. Middle: turned 45 degrees toward the right edge of the image. Right: exact side view, a true profile, facing the right edge. Small closed-lip smile, eyes open, head level. In the profile her forehead, the bridge and tip of her nose, her lips, her chin, her jawline and her whole ear are clear against the background."),
    ("C4", "The same three views with hat and glasses", W, "How low the hat sits, how far the brim reaches, and how the glasses run back into her hair.", [], "",
     "Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, each showing from the highest point of her hat down to her collarbones: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. She wears her hat and her glasses, and her hair is loose as usual. Show clearly how low the hat sits on her forehead, how far the brim reaches in front and behind, how the glasses sit on her nose, how far the lenses stand from her eyes, and how the arms of the glasses run back into her hair."),
    ("C5", "Other side and the back of her head", W, "The far side of the hat, and how her hair comes out from under the brim.", [], "",
     "Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, wearing her hat and glasses, each showing from the highest point of her hat down to her shoulder blades. Left: a true profile facing the LEFT edge of the image. Middle: from directly behind. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the left edge. Show the back of the hat, the black lace band and the chain going all the way round, both horns, and how her hair comes out from under the brim and falls over her shoulders and down her back."),
    ("C6", "Face from above", Q, "Checking the brow, cheeks and nose from a high camera.", [], "",
     "Square image. One large close-up painting of her head WITHOUT her hat and WITHOUT her glasses, with the camera above her and in front of her, looking down at her face at about 45 degrees. Her hair is drawn back behind her ears. We see the top of her head and her parting, her forehead, the tops of her cheeks and the bridge of her nose. Her eyes look down. Small closed-lip smile."),
    ("C7", "Face from below", Q, "Under the jaw and chin, which no other painting shows.", [], "",
     "Square image. One large close-up painting of her head WITHOUT her hat and WITHOUT her glasses, with the camera below her and in front of her, looking up at her face at about 45 degrees. Her hair is drawn back behind her ears. We see under her chin and jaw, her nostrils and the underside of her brow. Her eyes look straight ahead. Lips closed."),
    ("C8", "Three-quarter close-up", Q, "The cheek, ear and jawline up close.", [], "",
     "Square image. One very large close-up painting of her face WITHOUT her hat and WITHOUT her glasses, turned 45 degrees toward the right edge of the image, from her hairline to under her chin. Her hair is tucked behind her near ear, so her whole near ear and cheek are clear. Small closed-lip smile, eyes looking the way her head is turned."),
    ("C9", "Six states of her face", W, "Her blink, her talking mouths and her smile. Each face has to sit in the same place in its box, because I cut the eyes and mouths out as patches.", ["your kept C1"], "",
     "Wide image, landscape 3:2. I am attaching the finished close-up of her face. A grid of six close-up paintings of that same face, three across and two down, each exactly the same size, each from directly in front with her head perfectly level, each in exactly the same position inside its box, each showing from her hairline to just under her chin. WITHOUT her hat and WITHOUT her glasses, with her hair drawn back as in the attached face. Every one matches the attached face exactly except for the one change named. Top row, left to right: (1) the attached face unchanged; (2) both eyes gently closed, as in the middle of a blink, mouth unchanged; (3) both eyes half closed, the upper lids lowered halfway over the eyes, mouth unchanged. Bottom row, left to right: (4) lips just parted, as if starting to speak, eyes unchanged; (5) lips rounded in a small \"oo\", eyes unchanged; (6) a broader, happy closed-lip smile with her cheeks lifted, eyes unchanged. No teeth show in any of them."),
    ("C10", "Expressions", W, "Acting: reading, working a spell, being surprised, being hit, being stern, being delighted.", ["your kept C1"], "",
     "Wide image, landscape 3:2. I am attaching the finished close-up of her face. Six large paintings of that same face from directly in front, in two rows of three, WITHOUT her hat and WITHOUT her glasses, with her hair drawn back, each from her hairline to her chin. Her head is in exactly the same position and at the same size in all six; only her expression changes. Top row, left to right: eyes lowered, as if reading a book held at her waist, with a small smile; concentrating, with her brows drawn a little together and her eyes narrowed; surprised, with her eyebrows raised and her lips parted in a small round \"oh\". Bottom row, left to right: wincing, with her eyes shut tight and her lips pressed together, as if she has just been hit; calm and stern, not smiling at all, with her eyes open and steady; delighted, with her eyes crinkled nearly shut by a big closed-lip smile. No teeth show in any of them."),
    ("C11", "Hair alone, from three sides", W, "The shape of her hair with no hat on it and no robe behind it. It is the hardest thing on her to build.", [], "",
     "Wide image, landscape 3:2. Three paintings of her side by side at exactly the same size, each showing from the top of her head down to her hips. WITHOUT her hat, WITHOUT her glasses and WITHOUT her robe: she wears the black bodice, so her hair shows clearly against her bare shoulders and arms. Her hair is loose as usual. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind. Show where it parts, the wispy strands across her forehead, how it falls in front of and behind each shoulder, and how the waves grow bigger and looser toward the ends at her hips."),
    ("C12", "Top of her head", Q, "The parting, and how the hair leaves her head, for when the hat comes off.", [], "",
     "Square image. One large painting of the top of her head seen from directly above, looking straight down, with her face toward the bottom of the image, WITHOUT her hat. Show the parting near the middle, how the hair leaves the crown of her head in waves, the wispy strands at the front, and the tops of her shoulders with the hair falling over them."),
    ("C13", "Her waves, close", Q, "How the hair is built: how wide a wave is, how thick a lock, and how the lighter strands run through it.", [], "",
     "Square image. One very large close-up of her hair hanging down her back, filling the image. Show single locks clearly: how wide each wave is, how thick each lock is, the fine loose hairs at the edges, and how the lighter ash-brown strands run through the dark brown."),
    ("C14", "The glasses alone", W, "Building the glasses as their own object.", [], "",
     "Wide image, landscape 3:2. Only her glasses, with no face, painted large four times in a row: from directly in front; from the side; from above; and in three-quarter view. Perfectly round lenses, thin dark metal frames, clear lenses, small nose pads, and thin straight arms with curved ear tips."),
    ("C15", "The hat alone, from four sides", W, "The hat as its own object. It gets built separately and set on her head.", ["IO5"], "",
     "Wide image, landscape 3:2. I am attaching an enlarged piece of her painting that shows the hat. Only her hat, with no head and no hair, sitting upright as if she were wearing it, painted large four times in a row at the same size: from directly in front; from the side its tip hangs on; from directly behind; and from the other side. Show the wide, slightly wavy brim, the soft crown slumping over to one side with its drooping tip, the band of black lace, the fine silver chain with its three tiny gold crosses, the large gold charm at the front, and the two cream-white ridged horns."),
    ("C16", "The hat from above and below", W, "The outline of the brim, how the crown folds, and the inside of the hat.", ["your kept C15"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her hat. The same hat alone, with no head, painted twice at the same size. Left: seen from directly above, looking straight down, with the front of the hat toward the bottom of the image: the whole outline of the brim, the two horns, and the crown folded over to one side. Right: turned over and seen from directly below: the underside of the brim, and the round opening for her head with its inner band."),
    ("C17", "Hat details", W, "The horns, the gold charm, the chain and the tip, large enough to build.", ["IO4", "IO5"], "",
     "Wide image, landscape 3:2. I am attaching two pictures that show her hat closely: an enlarged piece of her painting, and an older pixel painting of her. Use the pixel painting only for the hat band, the chain and the charm: its horns and its colours are different. Four large close-up paintings in a row: (1) one horn seen from the side, cream-white and ridged, with the place where it is fixed to the hat; (2) the large gold charm seen from directly in front: a ring with a straight bar running down through it and a short crossbar, with the cord that ties it to the band; (3) a length of the band, showing the black lace, the fine silver chain and the three tiny gold crosses hanging from it; (4) the drooping tip of the crown, with its creases."),
    ("C18", "Neck, shoulders and collarbones", Q, "The skin of her neck and chest, so it can be painted to match her face. The Fox needed this later; Io gets it now.", [], "",
     "Square image. One large close-up painting of her from just under her nose down to the top of her bodice, from directly in front, WITHOUT her hat, her glasses, her robe and both necklaces, with her hair held back behind her shoulders: her chin, her neck, her collarbones, her bare shoulders and her upper chest, in soft even light, with real skin texture."),
]))

SETS.append(dict(key="D", round=1, title="Hands and arms",
    intro="Attach S3 (the Jester's hands) with D1 and D2 so the framing matches. The hands are bare here because the bracelets get built as real objects.",
    prompts=[
    ("D1", "Left hand, bare", Q, "The shape of her hand and the skin painted onto it.", ["S3"], "",
     "Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of Io's LEFT hand and forearm side by side, bare, with no bracelets and no rings, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons."),
    ("D2", "Right hand, bare", Q, "Her right hand, so nothing has to be mirrored.", ["S3"], "",
     "Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of Io's RIGHT hand and forearm side by side, bare, with no bracelets and no rings, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons."),
    ("D3", "A whole bare arm", W, "The skin of her arm from shoulder to wrist. Her shoulders show through the robe, and the robe is sheer.", [], "",
     "Wide image, landscape 3:2. Two paintings, one above the other, at the same size, of her bare RIGHT arm from the shoulder to the fingertips, held straight out to the side at shoulder height with the palm down, with no robe and no bracelets. Top: seen from the front. Bottom: seen from behind. Smooth skin with real texture and soft, even shading."),
    ("D4", "Hands with their bracelets", W, "Which bracelets sit where, and how big the beads are against her wrist.", [], "",
     "Wide image, landscape 3:2. Two large paintings side by side: the backs of both of her hands and forearms, pointing straight up, fingers slightly apart, each wearing its stack of three beaded bracelets. Left: her left hand. Right: her right hand. Show each strand clearly: the size, colour and order of its black beads, dark wooden beads and small gold beads."),
    ("D5", "Right hand: four poses", W, "Finger poses for the pendant, the leaf, the seed and the sickle.", [], "",
     "Wide image, landscape 3:2. Four large paintings of her bare RIGHT hand and wrist in a row, each in a different pose, each with nothing in the hand: (1) fingers closed lightly round something small at her chest, thumb on top, as if holding a pendant; (2) thumb and first finger pinched together with the other fingers lifted, as if holding a leaf by its stem; (3) palm up and slightly cupped, as if a seed is resting on it; (4) closed in a firm grip, as if round a short handle, seen from the side."),
    ("D6", "Left hand: three poses", W, "How her left hand carries the book.", [], "",
     "Wide image, landscape 3:2. Three large paintings of her bare LEFT hand and forearm in a row, each with nothing in the hand: (1) palm up and flat with the fingers spread wide, as if an open book is resting on the palm and forearm, seen from the front; (2) the same pose seen from the side; (3) the fingers curled round the spine of a closed book carried against her hip, seen from the side."),
]))

BOOT = "glossy black leather, laced up the front with black laces through ten pairs of antique-gold eyelets, a rounded toe with a stitched toe cap, a buckled strap round the top of the shaft, a pull loop at the back, and a thick black platform lug sole about 5 cm deep with a slightly higher block heel"
SETS.append(dict(key="E", round=1, title="Boots",
    intro="Eight views of one boot, the same eight the Jester's boots were built from. Attach S4 (the Jester's boot) with E1 so the framing matches.",
    prompts=[
    ("E1", "Outer side", Q, "The boot's outline: sole depth, heel, shaft height. Everything is measured from this one.", ["S4", "IO7"], "",
     "Square image. I am attaching a boot style guide: copy its framing and realism only, not its boot. I am also attaching an enlarged piece of her character sheet that shows her boots. One large painting of her right platform combat boot with its sock: " + BOOT + ". A short black ribbed sock cuff shows above the top of the boot. The boot is alone, with no leg above the sock, standing flat. Seen in exact side view from the outside, toe pointing to the right edge of the image."),
    ("E2", "Inner side", Q, "The arch side, which differs from the outside.", [], "",
     "Square image. The same boot as the last image: her right platform combat boot with its black sock cuff, alone, standing flat, at the same size. Seen in exact side view from the inside, toe pointing to the left edge of the image."),
    ("E3", "Front pair", Q, "Width, toe shape and lacing from the front.", [], "",
     "Square image. Both of her platform combat boots with their black sock cuffs, as a pair, alone, standing side by side a little apart. Seen from directly in front, toes toward the viewer."),
    ("E4", "Back", Q, "The heel, back seam and pull loop.", [], "",
     "Square image. Her right platform combat boot with its black sock cuff, alone, standing flat. Seen from directly behind: the heel block, the depth of the platform, the back seam, the pull loop and the buckled strap."),
    ("E5", "Three-quarter", Q, "How the shapes join up in the round.", [], "",
     "Square image. Her right platform combat boot with its black sock cuff, alone, standing flat. Seen in three-quarter view from the front and the outside, from slightly above, the way a boot is shown in a shop."),
    ("E6", "From above", Q, "The plan of the foot, the tongue and the opening.", [], "",
     "Square image. Her right platform combat boot with its black sock cuff, alone. Seen from directly above, looking straight down, toe pointing to the top of the image: the laces, the tongue, the buckled strap and the opening with the sock."),
    ("E7", "The sole", Q, "The tread pattern.", [], "",
     "Square image. The sole of her right platform combat boot, alone. Seen from directly below, flat, toe pointing to the top of the image: the whole lug tread pattern and the heel block."),
    ("E8", "Laces, strap and sock, close", Q, "Eyelets, the bow, the buckle and the sock rib.", [], "",
     "Square image. A very large close-up of the top front of her right platform combat boot: the upper antique-gold eyelets, the black laces tied in a bow, the tongue, the buckled strap with its buckle, and the black ribbed sock cuff above it."),
]))

GREY = "For this image only, the background is flat light grey (#D0D0D0), so that the sheer cloth shows."
SETS.append(dict(key="F", round=2, title="Details, flat pieces and fabrics",
    intro="Everything small, and every cloth laid flat so it can be wrapped onto the model. Five of these use a light grey background on purpose, so the sheer cloth shows.",
    prompts=[
    ("F1", "Necklaces and bracelets", W, "Two necklaces and six bracelets as real strands, at their true lengths.", ["IO6"], "",
     "Wide image, landscape 3:2. I am attaching an enlarged piece of her painting that shows her jewellery. Her jewellery taken off and laid out flat, each piece separate and painted large, seen from straight above, with clear space between them: (1) the short, fine silver chain with its small clear teardrop crystal; (2) the long black cord with the gold moon pendant: the large crescent, the smaller crescent under it and the small gold cross; (3) her six beaded bracelets in two rows of three, each laid in an open ring: black beads, dark wooden beads and small gold beads. Each necklace is laid in an open U shape so its whole length and its fastening can be seen."),
    ("F2", "The moon pendant, close", Q, "Her hidden weapon before it changes, as a solid object.", ["IO6"], "",
     "Square image. I am attaching an enlarged piece of her painting that shows the pendant. A very large close-up of her gold moon pendant alone, hanging straight down from its black cord, painted twice side by side at the same size: from directly in front, and from the side, showing how thick the gold is. The large crescent moon is about 5 cm across with its horns pointing up; the smaller crescent hangs under it from a tiny ring, horns up; and the small gold cross hangs under that."),
    ("F3", "Belt, pouch and crystal", W, "The belt gear as separate objects.", ["IO6"], "",
     "Wide image, landscape 3:2. I am attaching an enlarged piece of her painting that shows her pouch and crystal. Her belt gear taken off, each piece separate and painted large with clear space between them. (1) Across the top: the wide black leather belt laid out straight at its full length, showing the round antique-gold ring buckle and the holes. Below, in a row: (2) the black leather pouch from the front, with its flap and gold filigree fittings; (3) the pouch from the side, showing how deep it is and its belt loop; (4) the pouch from behind; (5) the crystal: the clear quartz point with its faint blue tint, its small gold cap and its short gold chain."),
    ("F4", "The robe laid flat", W, "The robe's pattern pieces. This is how I learn how much cloth is in it.", [], "",
     "Wide image, landscape 3:2. " + GREY + " Her robe taken off and laid completely flat like a sewing pattern, seen from straight above, painted twice at the same size, with no folds and no body inside it. Left: the front, opened out, with both sleeves spread straight out to the sides so that the three tiers of each bell sleeve lie flat. Right: the back. Show the cut-out at the top of each sleeve, the gold embroidered band along every edge, the tiny gold dots, and the long uneven points of the hem."),
    ("F5", "One sleeve", W, "How a three-tier bell sleeve hangs, arm up and arm down.", [], "",
     "Wide image, landscape 3:2. Two large paintings of one sleeve of her robe as it looks when worn, with her bare arm inside it and nothing else of her in the picture. Left: the arm held straight out to the side at shoulder height, seen from the front: the cut-out at the shoulder, and the three tiers hanging down from the arm in deep folds, each wider than the one above. Right: the arm hanging down at her side, seen from the side: the tiers gathered round the arm and falling to knee height."),
    ("F6", "Robe close-ups", W, "The chiffon, the gold band, the shoulder cut-out and a hem point.", [], "",
     "Wide image, landscape 3:2. " + GREY + " Four large close-up paintings in a row, each seen straight on: (1) a single layer of the wine-red chiffon held flat, with the light grey showing through it, and its tiny gold dots; (2) the narrow gold embroidered band along an edge of the robe; (3) the cut-out at the top of a sleeve, with her bare shoulder showing through it; (4) one long point of the hem."),
    ("F7", "Bodice laid flat", W, "The bodice's pattern pieces, and its lace edge.", [], "",
     "Wide image, landscape 3:2. Her black bodice taken off and laid completely flat like a sewing pattern, seen from straight above, with no folds and no body inside it, as three paintings. Left: the front, with its thin shoulder straps and its scooped neckline edged with scalloped black lace. Middle: the back, with black lacing. Right: a large close-up of the scalloped lace edge and the fine dark sparkle of the cloth."),
    ("F8", "Skirt laid flat", W, "How many tiers there are, how they overlap, and where the slit is.", ["IO7"], "",
     "Wide image, landscape 3:2. " + GREY + " I am attaching an enlarged piece of her character sheet that shows the skirt. Her skirt taken off and laid completely flat like sewing pattern pieces, seen from straight above, with no folds and no body inside, as three separate pieces with clear space between them: (1) the whole skirt opened out flat, showing the waistband, every tier with its ragged pointed hem, and the slit; (2) one tier of the black lace with its tiny gold sequins, alone, opened out flat; (3) one tier of the sheer black tulle, alone, opened out flat."),
    ("F9", "Material squares", W, "Flat samples I turn into the model's surfaces.", [], "",
     "Wide image, landscape 3:2. Eight flat square samples of her materials in two rows of four, each square filled edge to edge with the material, perfectly flat, with no folds, no seams and even light. Top row, left to right: the wine-red felt of her hat with its tiny gold flecks; the black lace of the hat band; the black cloth of her bodice with its fine dark sparkle; the black scalloped lace of her neckline. Bottom row, left to right: the glossy black boot leather; the black belt leather; the cream-white ridged horn; the worn dark brown leather of her spellbook."),
    ("F10", "Robe chiffon, one big square", Q, "The cloth she is known by.", [], "",
     "Square image. " + GREY + " One large flat square filled edge to edge with the sheer wine-red chiffon of her robe, with its tiny gold dots, seen straight on, perfectly flat, so that the light grey shows faintly through the cloth. Even light, no folds and no seams. The dots are scattered evenly so the square could be tiled."),
    ("F11", "Skirt lace, one big square", Q, "The top layer of the skirt.", [], "",
     "Square image. " + GREY + " One large flat square filled edge to edge with the black lace of her skirt, sprinkled with tiny gold sequins, seen straight on, perfectly flat, so that the light grey shows through every hole in the lace. Even light, no folds. The pattern repeats evenly so the square could be tiled."),
    ("F12", "The gold band", W, "The trim on every edge of the robe.", [], "",
     "Wide image, landscape 3:2. One long, straight strip of the narrow gold embroidered band that edges her robe, running from the left edge of the image to the right edge, painted very large and perfectly flat on wine-red chiffon, seen straight on. Its pattern repeats evenly, so the strip could be joined end to end."),
]))

SETS.append(dict(key="G", round=2, title="Her book, her blades and her herbs",
    intro="The book and the pendant sickle come from the flipbook. The dagger comes from the Envoi picture. The herbs, seeds and bottles are mine, made from the move sheet. Change any wording you like before you run them.",
    prompts=[
    ("G1", "The spellbook, closed", W, "Her book as a solid object. It is in her hand in every flipbook frame.", ["IO6"], "",
     "Wide image, landscape 3:2. I am attaching an enlarged piece of her painting that shows the book. Her spellbook alone, with no figure and no hands, painted in the same realistic style, large, four times in a row at the same scale: the front cover; the back cover; the spine; and a three-quarter view that shows how thick it is. It is an old book about 25 cm tall, 18 cm wide and 6 cm thick, bound in worn dark brown leather. The front cover is tooled in gold: an eight-pointed compass star inside two rings, with small symbols round it and a thin gold border. It has brass corner pieces, raised bands across the spine, a dark red ribbon marker, and thick cream pages with rough, uneven edges."),
    ("G2", "The spellbook, open", W, "How it looks open in her hand, and how the pages lift.", ["your kept G1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her spellbook. The same book, open, with no figure and no hands, painted three times at the same scale. Left: lying open flat, seen from straight above: two full pages of small handwriting in an invented script that cannot be read, with ink drawings of herbs, and one real pressed leaf lying on the page. Middle: held open at a slant, as it sits in her hand, seen from the front. Right: open, seen from the side, showing how the pages fan out and lift."),
    ("G3", "Four pairs of pages", W, "What is written in it. These become the pages you see when it floats and turns.", ["your kept G1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her spellbook. Four separate open double pages from that book, in two rows of two, each seen flat from straight above, on aged cream paper, with handwriting in an invented script that cannot be read: (1) ink drawings of herbs and roots with notes beside them; (2) the phases of the moon drawn in a row, with a chart of stars; (3) three real pressed silver-green leaves and one pressed white flower, held to the page under thin strips of paper; (4) a large circle drawn in ink, with a stag's antlered head at its centre and small symbols round it."),
    ("G4", "The pendant becomes the sickle", W, "How her hidden weapon unfolds.", ["your kept F2"], "Flipbook: Harvest Crescent, frames 2 to 4.",
     "Wide image, landscape 3:2. I am attaching the painting of her moon pendant. Her hidden weapon, with no figure and no hands, painted three times at the same scale to show how it changes: the large crescent of her pendant unfolds into a golden harvest sickle. Left: the pendant as she wears it, on its black cord. Middle: half changed: the large crescent has grown to the size of her hand, and a short handle is growing down from one end of it, with the black cord winding itself round the handle. Right: the finished sickle, about 35 cm long: a crescent blade of bright gold, sharp along its inside curve and engraved with a fine vine pattern, on a short handle wrapped in the black cord, with the small gold cross hanging from the end of the handle."),
    ("G5", "The sickle alone", W, "The sickle as a solid object.", ["your kept G4"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her sickle. The same golden sickle alone, with no figure and no hands, painted large, three times: lying flat, seen from the side, so that its whole crescent shape shows; seen edge-on, showing how thin the blade is; and a large close-up of the handle, with its cord wrapping and the small gold cross hanging from its end."),
    ("G6", "The dagger and its sheath", W, "Her second blade, from the Envoi picture.", ["IO4"], "",
     "Wide image, landscape 3:2. I am attaching an older pixel painting of her: use it only for the dagger in her hand. Her dagger, with no figure and no hands, painted in the same realistic style: a slim dagger about 28 cm long, with a narrow, double-edged steel blade with a ridge down its centre; a guard shaped like a gold crescent moon, its horns pointing toward the tip of the blade; a grip of black wood; and a small round steel pommel. A short, fine chain hangs from the guard, carrying a small gold crescent and a tiny gold cross. Four paintings in a row: (1) the dagger lying flat; (2) the dagger seen edge-on; (3) a large close-up of the crescent guard and the charm chain; (4) its sheath alone: black leather, with a gold mouth and a gold tip, and a loop for hanging it from a belt."),
    ("G7", "Herbs, seeds and bottles", W, "The small things her spells start from.", [], "",
     "Wide image, landscape 3:2. The small things she works with, with no figure and no hands, each separate and painted large with clear space between them: (1) a bundle of dried herbs tied with string; (2) three silverleaf leaves: slim, pointed leaves about 8 cm long, silver-green on top and paler underneath; (3) one large seed the size of a walnut, golden brown, with a spiral grain; (4) three small glass bottles with cork stoppers, each about 6 cm tall: one holding clear dew, one a green remedy and one a dark tincture; (5) a tiny brass cup."),
    ("G8", "Where she wears them", W, "Her outline with everything put away, and where her hand goes to draw the dagger.", ["your kept G1", "your kept G6"], "",
     "Wide image, landscape 3:2. I am attaching the paintings of her spellbook and of her dagger with its sheath. Three paintings of her side by side in her full outfit, at exactly the same size, standing straight, now carrying her things the way she wears them. The dagger is in its black sheath, which hangs upright from her belt on her LEFT hip, hilt up. She carries the closed spellbook in the crook of her LEFT arm, held against her side. Her right arm is held as in the standing pose. Left: from directly in front. Middle: exact side view facing the left edge of the image, so we see her left side, the sheath and the book. Right: from directly behind."),
    ("G9", "Her hands on her things", W, "Finger positions for each grip.", ["your kept G2", "your kept G5", "your kept G6"], "",
     "Wide image, landscape 3:2. I am attaching the paintings of her open spellbook, her sickle and her dagger. Four large close-up paintings of her hands in a row: (1) her left hand holding the open spellbook from underneath, the book resting on her palm and forearm, her fingers spread under the cover; (2) her right hand holding the gold sickle by its handle; (3) her right hand holding the dagger by its grip, point up; (4) her right hand lifting one silverleaf leaf by its stem, between thumb and first finger, above the open page."),
]))

SETS.append(dict(key="H", round=3, title="Key poses: the flipbook moves and your lore",
    intro="Paste the magic rules before H1. The first two show how her cloth and hair behave when she moves. H3 to H10 are the three flipbook moves at their strongest moments. H11 to H16 are the powers your lore gives her that have never been drawn. H17 and H18 are what every witch needs: being hit, falling and winning.",
    prompts=[
    ("H1", "Walking and running", W, "How the robe, the sleeves, the skirt and all that hair trail behind her.", ["your kept G1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her spellbook. No magic in this image. Two paintings of her whole figure side by side at the same size, in her full outfit, in exact side view, moving toward the right edge of the image. Left: walking, in the middle of an unhurried stride, her front heel just touching the ground, the closed spellbook carried in the crook of her left arm, her right arm swinging loosely; the robe, the sleeves and her hair sway gently behind her. Right: running, in the middle of a stride with both feet off the ground, her right hand holding the brim of her hat to keep it on, the book hugged to her chest in her left arm; her hair, her sleeves, the robe and the skirt stream back behind her."),
    ("H2", "Sitting and kneeling", W, "How the robe and skirt pool on the ground.", ["your kept G2"], "The sitting pose is her painting.",
     "Wide image, landscape 3:2. I am attaching the painting of her open spellbook. No magic in this image. Two paintings of her whole figure side by side at the same size, in her full outfit. Left: sitting on the ground reading, as in the Io painting, seen from directly in front: her legs folded to one side under her skirt, the spellbook open on her lap in her left hand, her eyes lowered to the page, with a small smile; the robe and the skirt pool round her. Right: kneeling on her right knee with her left foot flat on the ground in front of her, her back straight, the closed book in the crook of her left arm, seen in exact side view facing the right edge of the image."),
    ("H3", "Harvest Crescent: the pendant and the guard", W, "The start of her plain attack.", ["your kept G4", "IO8"], "Flipbook: Harvest Crescent, frames 2 to 6.",
     "Wide image, landscape 3:2. I am attaching the painting of her pendant turning into the sickle, and the frames of this move from her flipbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, as in the top row of her sprite sheet. In both she holds her open spellbook in her left hand at waist height. Left: facing the viewer, her right hand closed round the moon pendant at her chest, with gold light leaking out between her fingers; she looks down at it with a small smile. Right: feet wide apart and knees bent, turned slightly toward the right edge of the image; the pendant has unfolded into the gold sickle, which she holds in her right hand, raised up and back behind her right shoulder, ready to cut; a thin trail of gold light follows the blade."),
    ("H4", "Harvest Crescent: the cut", W, "The cut and its end. Her signature attack pose.", ["your kept G5", "IO8"], "Flipbook: Harvest Crescent, frames 7 to 10.",
     "Wide image, landscape 3:2. I am attaching the painting of her sickle, and the frames of this move from her flipbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, as in the top row of her sprite sheet. In both, the open spellbook stays in her left hand, held back out of the way. Left: the cut itself: a wide, low stance, her right arm sweeping the sickle across in front of her toward the right edge of the image; the blade leaves one broad crescent of gold light that curves all the way round her; her hair, her sleeves and the robe swing out with the turn. Right: the end of the cut: she is bent low over her front knee, the sickle at the bottom of its swing near the ground on the right side of the image, and the gold crescent is breaking up into sparks."),
    ("H5", "Silverleaf Salve: the leaf", W, "The start of her heal.", ["your kept G2", "IO9"], "Flipbook: Silverleaf Salve, frames 2 to 9.",
     "Wide image, landscape 3:2. I am attaching the painting of her open spellbook, and the frames of this move from her flipbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, facing the viewer, as in the middle row of her sprite sheet. Left: she holds the open book in her left hand at waist height and looks down at it; with the thumb and first finger of her right hand she lifts a pressed leaf from the page, and where she touches it the dry leaf is turning fresh silver-green. Right: the leaf now floats upright, a hand's width above her open right palm, which she holds out beside the book; the leaf glows gold along its edges and veins, warm light gathers under it, and small motes drift up from the pages."),
    ("H6", "Silverleaf Salve: the gift", W, "The heal arriving on a friend.", ["IO9"], "Flipbook: Silverleaf Salve, frames 13 to 18.",
     "Wide image, landscape 3:2. I am attaching the frames of this move from her flipbook. Key pose. One scene. On the left third of the image stands Io, whole figure, in her full outfit, turned toward the right edge, her right arm stretched out toward it with the palm open and the fingers spread, the open book still in her left hand. The leaf has broken into a ribbon of gold-green motes and small silver leaves, which curves across the image from her hand to an ally standing on the right third: the plain grey mannequin. The ribbon winds once round the mannequin from its feet to its shoulders, and soft light rises where it touches. Her face is gentle."),
    ("H7", "Elderwood Guardian: the seed", W, "The planting. In the reworked combat this is the turn the summon is planted.", ["your kept G7", "IO10"], "Flipbook: Elderwood Guardian, frames 2 to 7.",
     "Wide image, landscape 3:2. I am attaching the painting of her herbs and seed, and the frames of this move from her flipbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, as in the bottom row of her sprite sheet. In both, the open book is in her left hand. Left: she holds the large seed up at arm's length in her right hand, high beside her on the left side of the image, and looks up at it; it glows from inside like a small lantern, and one tiny green shoot has opened at its top. Right: bending her knees, she reaches down with her right hand and lets the seed sink to the ground at her right side, on the left side of the image; thin glowing roots are already spreading from it across the ground."),
    ("H8", "Elderwood Guardian: it grows", W, "From sapling to fawn.", ["IO10"], "Flipbook: Elderwood Guardian, frames 8 to 11.",
     "Wide image, landscape 3:2. I am attaching the frames of this move from her flipbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, with the open book in her left hand. Left: a sapling of twisting living wood, as high as her waist, has grown from the seed on the left side of the image, with small new leaves opening along it; she holds her right hand out over it, palm down, as if drawing it upward. Right: the sapling has twisted itself into the shape of a young deer lying with its legs folded under it, made of braided wood and roots, with two small branching antlers and leaves down its back; it lifts its head toward her hand."),
    ("H9", "Elderwood Guardian: the Guardian stands", W, "The summon, arrived. The picture I will build the creature from.", ["IO10"], "Flipbook: Elderwood Guardian, frame 13.",
     "Wide image, landscape 3:2. I am attaching the frames of this move from her flipbook. Key pose. One scene with two figures, both whole and inside the frame. On the left stands the Guardian, full grown, in exact side view facing the right edge of the image: a stag made entirely of living wood, with a body and legs of braided roots and vines, bark on its face, moss along its back, and small green leaves growing along its neck and legs. Its shoulder is level with her shoulder, and its antlers are wide, branching boughs that rise well above her hat. Its eyes glow green-gold. On the right stands Io, whole figure, in her full outfit, facing the viewer, the open book in her left hand and her right hand resting on the Guardian's neck; she looks at it with a warm smile."),
    ("H10", "Elderwood Guardian: the charge", W, "The summon striking. In the flipbook it turns into a rushing column of vines; here it does that mid-leap.", ["IO10"], "Flipbook: Elderwood Guardian, frames 14 to 18.",
     "Wide image, landscape 3:2. I am attaching the frames of this move from her flipbook. Key pose. One scene. Io stands on the left third of the image, whole figure, in her full outfit, her right arm swept out toward the right edge, the open book in her left hand. The Guardian has sprung past her and fills the rest of the image in a long leap toward the right edge: its head, its antlers and its forelegs are still a stag of living wood, but from the shoulders back its body is unravelling into a rushing spiral of vines, roots, leaves and gold-green light, like the tail of a comet."),
    ("H11", "Moonflower Garden: the sowing", W, "New. Your lore: she heals the whole party. In the reworked combat her heals take root one turn and bloom over the next.", ["your kept G2"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her open spellbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, facing the viewer. In both, her spellbook floats open in the air at her left side at waist height, its pages lifting, with a soft gold light rising from them. Left: feet together, she holds both hands cupped at her chest, full of small glowing seeds; her eyes are closed. Right: she has flung both arms out wide and low, and the seeds are in the air all round her in a ring, each trailing a thin thread of gold light toward the ground; where the first ones have landed, small green shoots with tight white buds are already rising."),
    ("H12", "Moonflower Garden: in bloom", W, "New. The heal in flower: flowers that glow like small moons, for a story set at new moon.", ["your kept H11"], "",
     "Wide image, landscape 3:2. I am attaching the last painting. Key pose. One scene. Io stands in the centre of the image, whole figure, in her full outfit, facing the viewer, her arms open and low with the palms turned up, her eyes closed and her face calm; the book floats open at her left side. All round her feet, in a wide ring that fills the bottom of the image, a garden has grown: dark green vines with heart-shaped leaves, and on them a dozen large white trumpet-shaped moonflowers, fully open, each glowing pearl-white like a small moon, with small white star-shaped flowers between them. Soft gold-green motes rise from every flower. On each side of her, inside the ring, stands an ally: the plain grey mannequin, with the light rising round it."),
    ("H13", "Rootbound Return", W, "Old sheet, and the reworked combat: she brings a fallen friend back.", [], "",
     "Wide image, landscape 3:2. Key poses. Two paintings side by side at the same size. Left: Io, whole figure, in her full outfit, kneels on her right knee beside an ally who lies flat on their back on the ground: the plain grey mannequin, lying along the bottom of the image with its head toward the right edge. Her book floats open beside her. She holds a glowing seed on her open right palm above the mannequin's chest, and her head is bowed. Right: the same scene a moment later: fine roots of light have spread out from where the seed fell and traced the whole outline of the lying figure on the ground; small white star-shaped flowers have opened all along the roots; and the mannequin is sitting up, its hand in her right hand as she helps it rise."),
    ("H14", "Thornwake: the dagger", W, "New. Your lore: one damage move. This is where the dagger from Envoi earns its place.", ["your kept G6", "your kept G8"], "",
     "Wide image, landscape 3:2. I am attaching the paintings of her dagger and of her wearing its sheath. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, turned toward the right edge of the image. Left: standing, with the closed book held against her chest in her left arm; her right hand has just drawn the dagger from the sheath on her left hip and holds it point-down in front of her; violet witchfire is waking along the blade; her face is calm and stern, not smiling. Right: down on her right knee, she has driven the dagger point-first into the ground in front of her with her right hand; from the blade a jagged crack of violet light runs away along the ground to the right edge of the image, and small thorned roots are pushing up along it."),
    ("H15", "Thornwake: the briar", W, "New. The strike landing.", ["your kept H14"], "",
     "Wide image, landscape 3:2. I am attaching the last painting. Key pose. One scene. Io kneels on the left third of the image, whole figure, in her full outfit, her right hand on the hilt of the dagger standing in the ground, looking toward the right edge with a steady face. On the right stands the wooden training dummy. A great briar of dark, thorned roots, each as thick as her arm, has burst out of the ground beneath the dummy and closed round it like the fingers of a hand, lifting it off the ground. Violet witchfire glows in the cracks of the wood, and small wine-red roses are opening along the briar."),
    ("H16", "Bramble Cradle", T, "Old sheet. Her guard.", [], "",
     "Tall image, portrait 2:3. Key pose. One painting of her whole figure in her full outfit, standing and facing the viewer, the closed book hugged to her chest in her left arm and her right hand raised with the palm outward. Around and over her stands a dome of living branches, woven like an upturned basket, taller than her hat, with small gold-green leaves growing all over it and its thorns pointing outward. We see her through the gaps in the weave. A few sparks bounce off the outside of it. Her face is calm."),
    ("H17", "Hit, and down", W, "Every witch needs these two. They also show the hat off her head.", ["your kept G1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her spellbook. No magic in this image. Two paintings of her whole figure side by side at the same size, in her full outfit. Left: struck from the right: she staggers back toward the left edge of the image, her body bent, her right hand clapped on top of her hat to hold it on, the closed book hugged tight to her chest in her left arm, her eyes shut tight and her lips pressed together, her hair and sleeves thrown forward. Right: down: she has sunk to the ground and sits on her hip with her legs folded to one side, leaning on her right hand, her head bowed and her eyes closed; her hat has fallen off and lies on the ground beside her, and the closed book lies under her left hand."),
    ("H18", "Victory", T, "Her win pose.", ["your kept G1"], "",
     "Tall image, portrait 2:3. I am attaching the painting of her spellbook. No magic in this image. One painting of her whole figure in her full outfit, facing the viewer, her weight on one hip. She holds the spellbook up beside her in her left hand and has just snapped it shut, with a small puff of dust from its pages. With two fingers of her right hand she tips the brim of her hat. A big, delighted closed-lip smile, her eyes crinkled."),
]))

BLACK = "For this image only, the background is pure black (#000000), with no figure and no hands."
SETS.append(dict(key="I", round=3, title="Magic alone",
    intro="Her magic with nothing else in the picture, so I can layer it into the spells. For this set the background rule changes: pure black, no figure.",
    prompts=[
    ("I1", "Silverleaf", Q, "Silverleaf Salve, and the leaves that ride on every heal.", [], "",
     "Square image. " + BLACK + " Twelve separate silverleaf leaves in a grid of four rows of three, well apart, seen from different sides: flat, curled, and edge-on. In the top row they are dry and pale brown, like leaves pressed in a book. In the second row they are fresh silver-green. In the bottom two rows they are silver-green and glowing gold along their edges and veins."),
    ("I2", "Motes and sparks", Q, "The small lights around every spell.", [], "",
     "Square image. " + BLACK + " Twelve separate small lights in a grid of four rows of three, well apart, in different sizes from tiny to large: soft round motes like pollen, four-pointed stars, and tiny crescent moons. Most are warm gold; a few are fresh green or pearl-white."),
    ("I3", "The sickle's light", W, "Harvest Crescent: the arc her blade leaves.", [], "",
     "Wide image, landscape 3:2. " + BLACK + " Two paintings. Left: one broad crescent sweep of gold light, like the trail left by a sickle swung through half a circle, bright and sharp along its outer edge and fading to nothing on the inside. Right: the same crescent breaking up into sparks and a few small gold leaves."),
    ("I4", "Seed to sapling", W, "Elderwood Guardian: the growing.", [], "",
     "Wide image, landscape 3:2. " + BLACK + " Four stages of one thing growing, painted in a row at the same scale, standing on the same line: (1) the seed alone, glowing from inside like a small lantern; (2) the seed with one green shoot above it and thin glowing roots below it; (3) a knee-high sapling of twisting living wood with a few new leaves; (4) a waist-high sapling, thicker and more twisted, with leaves opening all along it and a gold-green light at its heart."),
    ("I5", "Roots, vines and thorns", W, "The living wood in every spell.", [], "",
     "Wide image, landscape 3:2. " + BLACK + " Six separate pieces of her living wood, well apart, in two rows of three. Top row, left to right: a straight length of pale brown root; a vine growing in a loose spiral; a vine with small green leaves opening along it. Bottom row, left to right: a length of dark briar with long thorns; three roots braided together; the curled growing tip of a root, glowing gold-green at its very end."),
    ("I6", "Moonflowers", W, "Moonflower Garden.", [], "",
     "Wide image, landscape 3:2. " + BLACK + " Six separate paintings in two rows of three, well apart. Top row, left to right: a moonflower bud, tightly twisted and closed; the same flower half open; the same flower fully open, seen from directly in front as a round white face with a five-pointed star creased into it. Bottom row, left to right: the fully open flower seen from the side, as a long trumpet; the open flower seen from behind; and a small cluster of white star-shaped flowers. Every open flower glows pearl-white from inside, like a small moon."),
    ("I7", "Witchfire", Q, "Thornwake, and the flame she carries in Envoi.", ["IO4"], "",
     "Square image. I am attaching an older pixel painting of her: use it only for the purple flame beside her. " + BLACK + " Six separate flames of witchfire in two rows of three, well apart: a small round spark; a single upright tongue of flame; a flame leaning and streaming to one side; a wide, low flame; a tall wisp that twists into a spiral; and a burst with tongues in every direction. Each is a cool violet-magenta with a pale pink-white heart."),
    ("I8", "The briar", W, "Thornwake breaking the ground.", [], "",
     "Wide image, landscape 3:2. " + BLACK + " The same thing painted three times in a row at the same size, to show it happening. Left: a jagged crack in the ground, seen from the side, with violet light shining up out of it. Middle: dark, thorned roots bursting up out of the crack. Right: the roots full grown and closed together like the fingers of a hand, with violet witchfire in the cracks of the wood and small wine-red roses opening on them."),
]))

GUARD = "a stag made entirely of living wood: a body and legs of braided roots and vines, bark on its face, moss along its back, small green leaves growing along its neck and legs, and wide antlers of branching boughs with a few leaves on them. Its eyes are green-gold light"
SETS.append(dict(key="J", round=4, title="The Guardian as a creature, and more moves",
    intro="The Guardian gets built in the round like the Fox's little fox, so it needs its own turnaround. J5 to J7 are two bigger ideas of mine for what she calls. J8 and J9 are the old sheet's potions. J10 and J11 bring her two Envoi attacks over. J12 is new. Whether any of these go in the game is yours to decide later.",
    prompts=[
    ("J1", "The Guardian from four sides", W, "The creature's shape, for building it.", ["your kept H9", "IO10"], "",
     "Wide image, landscape 3:2. I am attaching the painting of the Guardian standing beside Io, and the frames of this move from her flipbook. No magic in this image. The Guardian alone, with no other figure, standing still on all four legs, painted four times in a row at the same size: from directly in front; in exact side view facing the right edge of the image; from directly behind; and from directly above. It is " + GUARD + ". Nothing else glows."),
    ("J2", "The Guardian's head", W, "Its face and antlers up close.", ["your kept J1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of the Guardian. No magic in this image. Three large paintings of the Guardian's head and neck side by side at exactly the same size, each showing from the tips of its antlers down to the base of its neck: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. Show the bark of its face, how the antlers grow out of its head and branch, the leaves on them, and its green-gold eyes."),
    ("J3", "The Guardian: young, rearing, leaping", W, "Its three other shapes.", ["your kept J1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of the Guardian. No magic in this image. The Guardian alone, painted three times in a row in exact side view facing the right edge of the image: as a young deer lying with its legs folded under it, with two small branching antlers; full grown, rearing on its hind legs with its forelegs in the air; and full grown, stretched out in a long leap with all four legs off the ground. The full-grown ones are the same size as each other."),
    ("J4", "The Guardian beside Io", W, "How big it is next to her.", ["your kept J1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of the Guardian. No magic in this image. One painting with two figures standing on the same line, not touching and not overlapping, both in exact side view facing the right edge of the image. On the left, Io in her full outfit in the standing pose. On the right, the Guardian standing still. Its shoulder is level with her shoulder, and the tips of its antlers rise above the highest point of her hat."),
    ("J5", "The Guardian in full glory", W, "My idea. Your lore says she calls deities. This is the stag as one: the same creature, grown huge, for when the summon should feel like the biggest thing she can do.", ["your kept J1"], "",
     "Wide image, landscape 3:2. I am attaching the painting of the Guardian. Key pose. One scene. Io is small, whole figure, at the bottom left of the image, kneeling on one knee with her head bowed and her right hand on her heart, her book floating open beside her. Above and behind her the Guardian has grown enormous, three times her height. It rears with its forelegs in the air, and its antlers have spread into the whole crown of a tree, full of leaves and hung with dozens of seeds that glow like small lanterns. Roots pour from its hooves into the ground. Gold-green light fills the air round it."),
    ("J6", "The moth", W, "My idea, from her name: the io moth. The old sheet had a moth summon too, and in Envoi she calls Lunara. Skip it if Moon Faire should have no moth.", [], "",
     "Wide image, landscape 3:2. A second spirit she can call, with no other figure: a great moth with wings as wide as Io is tall. Painted three times in a row at the same size: from directly above, with its wings spread flat; from directly in front, with its wings raised; and in exact side view, with its wings folded over its back. Its body is furred and cream-white. Its fore wings are pale gold, fading to soft green at their edges, with veins like the veins of a leaf. Each hind wing has one large round eyespot like a full moon: pearl-white, ringed in dark violet and gold. Long feathered antennae. It glows softly, as if lit from inside."),
    ("J7", "Moth wings", T, "My idea. The moth settles on her back and its wings become hers. In Envoi her trance gives her ghost moth wings; this is that, made real.", ["your kept J6"], "",
     "Tall image, portrait 2:3. I am attaching the painting of the moth. Key pose. One painting of her whole figure in her full outfit, facing the viewer, standing straight with her feet together, her arms a little away from her sides with the palms forward, her eyes closed and her face calm. Her book floats open at her left side. The great moth has settled on her back, so that only its wings show behind her, spread wide to both sides like her own wings, with the two moon eyespots glowing on the hind wings. Motes of gold light fall from the wings like pollen."),
    ("J8", "Moondew", W, "Old sheet. A heal that keeps working: six drops, one for each turn.", ["your kept G7"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her herbs and bottles. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, facing the viewer. In both, her book floats open at her left side. Left: she holds one of her small glass bottles in her left hand and has just pulled the cork out with her right; one bright bead of dew is rising out of the neck of the bottle. Right: the bead has divided into six droplets of clear, glowing dew, which circle the moon pendant at her chest in a ring; she holds her open hands on either side of the ring and watches it."),
    ("J9", "Bitter Remedy", W, "Old sheet. She cures what ails a friend.", ["your kept G7"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her herbs and bottles. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, facing the viewer. In both, her book floats open at her left side. Left: the tiny brass cup floats in the air in front of her chest, and she crumbles a dark dried herb into it between the fingers of her right hand, with her nose slightly wrinkled. Right: the cup steams with green-gold vapour, and with one finger of her right hand she stirs the vapour into a rising spiral that leans toward the right edge of the image."),
    ("J10", "Witchfire", W, "From Envoi: the flame in her left hand, and the throw.", ["IO4", "your kept G6"], "",
     "Wide image, landscape 3:2. I am attaching an older pixel painting of her with a purple flame, and the painting of her dagger. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit as in the master painting, not as in the pixel painting. In both, her book floats open behind her left shoulder and the dagger is in her right hand, held low. Left: she holds her LEFT hand up beside her at shoulder height, palm up, and a tall, twisting flame of violet witchfire stands on it; she looks at it calmly. Right: she has thrown it: her left arm is flung out toward the right edge of the image with the fingers open, and the witchfire streaks away from her hand toward the right edge like a violet comet with a pale heart."),
    ("J11", "The dagger: guard and lunge", W, "From Envoi: her dagger strike.", ["your kept G6"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her dagger. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, attacking toward the right edge of the image, with the closed book held against her chest in her left arm. Left: on guard: turned toward the right edge, right foot forward, knees bent, the dagger held out in front of her in her right hand at chest height with its point toward the right edge. Right: a long lunge onto her right foot, her right arm stretched out with the dagger driven toward the right edge, her back leg straight; her hair, the tip of her hat, her sleeves and the robe stream back, and the blade leaves one thin line of pale violet light."),
    ("J12", "Pressed Flower", W, "New, and mine. She catches a spell thrown at her between the pages of her book and presses it flat, the way she presses flowers.", ["your kept G2"], "",
     "Wide image, landscape 3:2. I am attaching the painting of her open spellbook. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, side-on, facing the right edge of the image. Left: a ball of red fire with a long tail is flying at her from the right edge; she stands braced with her feet apart, holding the spellbook wide open in both hands in front of her, like someone about to catch a ball. Right: she has clapped the book shut on it with both hands; light and a few sparks squeeze out from between the pages; she leans back from it with one eye shut and her lips pressed together."),
]))

SETS.append(dict(key="K", round=4, title="Surfaces for those",
    intro="Two sheets of flat surfaces for the creatures.",
    prompts=[
    ("K1", "Moth wings, flat", W, "The wing pattern, to wrap onto the moth.", ["your kept J6"], "",
     "Wide image, landscape 3:2. I am attaching the painting of the moth. " + BLACK + " The great moth's four wings alone, laid out flat and separate, seen from straight above, painted large: the left fore wing and the right fore wing in the top row, the left hind wing and the right hind wing in the bottom row. The fore wings are pale gold fading to soft green at the edges, with veins like the veins of a leaf. Each hind wing has one large round eyespot like a full moon: pearl-white, ringed in dark violet and gold."),
    ("K2", "The Guardian's materials", W, "Flat samples for the creature and the briar.", [], "",
     "Wide image, landscape 3:2. Eight flat square samples in two rows of four, each square filled edge to edge with the material, perfectly flat, with even light. Top row, left to right: pale brown living roots and vines braided tightly together; rough grey-brown bark; deep green moss; a mass of small fresh green leaves. Bottom row, left to right: the smooth pale wood of a branch, with its grain; dark briar wood with thorns; wine-red rose petals; the white petal of a moonflower, with its soft creases."),
]))

CHECK = [
    "She matches the master: the same face, the same build, the same colours.",
    "She has not been made taller, thinner or younger than her painting.",
    "Her hair is long, loose and very wavy, down to her hips. Not tied back, and not grey.",
    "The hat is wine-red and its crown slumps toward her right: the left side of a front view, the right side of a back view.",
    "Two small cream horns, on the hat. Not growing from her head, and not curled like a ram's.",
    "The black lace band, the chain with three tiny crosses and the large gold charm are on the hat.",
    "The robe is sheer wine-red with gold dots, open down the front, with a cut-out at each shoulder and three-tier bell sleeves.",
    "The pouch is on her right hip: the left side of a front view. The slit is over her left leg: the right side of a front view.",
    "Glasses on, unless the prompt said without. No glare over her eyes.",
    "No teeth showing.",
    "When she has the book it is in her left hand, or floating at her left. The sickle and the dagger are in her right.",
    "Nothing is cut off: the top of the hat, her fingertips, the ends of the sleeves, the soles of her boots.",
    "Flat plum background with no floor shadow. (Light grey for F4, F6, F8, F10 and F11. Black for set I and K1.)",
    "No text, numbers or labels anywhere.",
    "Real cloth, leather and skin: not a cartoon and not pixel art.",
    "When there is more than one of her, they are the same size and stand on one line.",
    "Smooth hands.",
]

LORE_LINE = "Your lore: she is nature. Low-tier attacks; good heals at the middle tier, for the whole party by a share or for one person by a lot; one-time summons at the upper-middle tier; she calls deities, with a paladin-like energy; and she is why the party has herbs and potions. In the reworked combat her magic grows: it takes root on one turn and blooms over the next, and her summon is planted ahead and arrives when it blooms. Names below are working names and are kept in data, so any of them can change."

# move, where it comes from, what it looks like
PLAN = [
    ("Harvest Crescent", "Flipbook. Her plain attack.", "Her hand closes on the moon pendant, it unfolds into a gold sickle, and she makes one wide cut that leaves a crescent of gold light. The sickle folds back into the pendant."),
    ("Silverleaf Salve", "Flipbook. Heals one friend now.", "She lifts a pressed leaf from the page. It turns fresh and silver-green, floats over her palm, and breaks into a ribbon of light and leaves that winds round the friend."),
    ("Elderwood Guardian", "Flipbook. Your lore: her one-time summon, planted and then arriving.", "She holds a glowing seed up, lets it sink into the ground, and a sapling grows. Later it twists into a fawn, stands up as a stag of living wood, and leaps at the foe, unravelling into a rush of vines as it lands."),
    ("Moonflower Garden", "Your lore: she heals the whole party. New.", "The book floats. She scatters a handful of glowing seeds in a ring, buds rise where they land, and over the next turns they open into white flowers that glow like small moons."),
    ("Rootbound Return", "Old sheet, and the reworked combat: revive.", "She kneels by the fallen friend with a seed on her palm. Roots of light trace their outline, small white flowers open along them, and she helps them sit up."),
    ("Thornwake", "Your lore: one damage move. Old sheet name, new look.", "She draws the dagger, witchfire wakes on the blade, and she drives it into the ground. A crack of violet light runs to the foe and a briar of thorned roots closes on it like a hand. Roses open on the briar."),
    ("Bramble Cradle", "Old sheet. Her guard.", "A dome of woven living branches grows over her, covered in small leaves, with its thorns pointing out."),
    ("Moondew", "Old sheet. A heal that keeps working.", "She uncorks a small bottle. A bead of dew rises, divides into six drops that circle her pendant, and the ring goes to a friend."),
    ("Bitter Remedy", "Old sheet. A cure.", "She crumbles a dark herb into a tiny floating cup and stirs the steam into a spiral."),
    ("Witchfire", "From Envoi.", "The violet flame she carries in Envoi, standing on her left palm, then thrown."),
    ("Dagger strike", "From Envoi.", "Her guard and lunge with the dagger, as she fights in Envoi."),
    ("Pressed Flower", "My addition.", "She catches a spell thrown at her between the pages of her book and claps it shut."),
    ("Moth wings", "My addition, from her name.", "A great moth settles on her back and its wings open behind her as her own."),
    ("The Guardian in full glory", "My addition, from \"she calls deities\".", "She kneels with her hand on her heart, and the stag rears behind her at three times her height, its antlers the crown of a tree hung with lantern seeds."),
    ("Hit, down, revived, victory", "Every witch needs them.", "She holds her hat on when she is hit, loses it when she falls, and tips its brim when she wins."),
    ("Walk, run, kneel, sit, jump, talk, wave, bow", "Carried over from the Jester.", "Adjusted for her build, her robe and her skirt. She holds her hat when she runs, and she reads when she sits."),
]

ADDITIONS = [
    ("The floating book.", "In the flipbook the book never leaves her left hand. In 3D that would keep her from ever using two hands, so for the big new spells it floats open at her left side with its pages turning. For the three flipbook moves it stays in her hand."),
    ("Two colours of magic.", "Gold-green growing light for everything that heals or grows, as in the flipbook. Violet witchfire, from Envoi and from the little sprites on her character sheet, for the little that harms. You can tell what a spell does from its colour."),
    ("The Guardian as the deity she calls.", "Your lore says she calls deities and leaves open which ones in this game. I used the stag from the flipbook, treated as a forest god in the shape of a stag. The flipbook already shows it planted as a seed and growing, which is how the reworked combat says her summon arrives."),
    ("The moth.", "Her name is the io moth's, the old sheet gave her a moth, and in Envoi she calls one. It is in round 4 and easy to leave out."),
    ("Moonflowers.", "Real moonflowers open at night. Here they glow like small moons, which felt right for a story set at new moon. The lore does not say this; it is only a look."),
    ("Both blades have a job.", "The sickle harvests: it is her plain attack. The dagger marks the ground: it is how she casts Thornwake. The dagger lives in a sheath on her left hip, so her right hand can draw it across her body while her left holds the book."),
    ("The horns are part of the hat,", "like the Fox's ears are costume ears. Every picture of her puts them on the hat band."),
    ("The herbs, seed, bottles and cup", "in G7 are designed from the old move sheet's descriptions."),
    ("New names:", "Moonflower Garden and Pressed Flower are mine. Thornwake, Rootbound Return, Bramble Cradle, Moondew and Bitter Remedy are the old sheet's names."),
]

DISAGREE = [
    ("Long loose hair.", "Her painting, her sheet and all 24 sprites. The Envoi picture ties it back and streaks it grey."),
    ("Wine-red hat.", "Her painting, and your lore calls her \"the one with the red hat\". Her sheet and the Envoi picture lean plum."),
    ("Small ridged horns that point up.", "Her painting and sprites. The Envoi picture and the Envoi model have curled ram's horns."),
    ("The hat band.", "The black lace band and the chain of small crosses are clearest in the Envoi picture, and the painting has the chain too, so I used them. The large gold charm is in every picture."),
    ("A sheer robe with gold dots.", "The painting and the Envoi picture show it sheer and glittering. The sheet paints it as heavier cloth with gold bands. The prompts ask for sheer chiffon with a gold band on the edges, and the sheet's three-tier sleeves."),
    ("A black bodice with a lace neckline.", "The painting shows lace, the sheet a plain black top, and the Envoi picture a sequin mesh dress."),
    ("Bare legs with a short sock cuff.", "Her sheet and sprites. The Envoi picture has knee-high black socks."),
    ("Platform boots with gold eyelets and a strap at the top.", "Her sheet and sprites. The Envoi picture has plainer boots with an ankle buckle."),
    ("The crystal hangs at the centre front.", "The sprites. The painting hangs it beside the pouch."),
    ("Bracelets on both wrists.", "The sheet. The painting shows her right wrist, and the Envoi picture her left."),
    ("Pouch on her right hip.", "The painting. The sheet and sprites are too small to tell."),
    ("Her own face,", "not the Jester's. You settled that for the Fox: the four are inspired by one person but are their own characters."),
    ("No teeth.", "Your rule for the Fox, carried over."),
]

SOURCES = [
    "IO1, IO2: art-pipeline/smoothing-pack/reference/herbal_witch_portrait_ref.png, herbal_witch_sheet_ref.png (cut from four_witches_concept.png, the picture of all four you sent again today).",
    "IO3: art-pipeline/smoothing-pack/reference/herbal_witch_moves_sheet.png (the same file as art-pipeline/sources/original_sheets/witch.png).",
    "IO4: the pixel painting of Io you sent on November 13. It matches her Envoi model (src/models/witch.js in envoi-on-the-longest-night): the same hat band, dagger and flame.",
    "IO5, IO6, IO7: enlarged pieces of IO1, IO2 and IO3.",
    "IO8, IO9, IO10: the flipbook frames in assets/hd/herbal_witch/ (harvest_crescent 12 frames, silverleaf_salve 22, elderwood_guardian 22), placed on the anchors in assets/manifest.json. The flipbook file you sent holds the 8 key frames of each; these are the same moves with the in-between frames.",
    "S1 to S4: branch claude/jester-3d-model, models/jester-3d/references/: chatgpt/05_base_front_back, chatgpt/08_face_front, hands/hands_young_left, boots/boot_side_a. The same four the Ranger's and the Fox's pages use.",
    "All 14 files, and the scripts that build the page from them, are in the moon-faire repo on branch claude/io-3d-model, in models/io-3d/references/.",
]
