# The Fox: reference paintings for her 3D model

Written November 12, 2026, for Chris to run in ChatGPT. This is the text of the page `Fox_Reference_Prompts.html`, which also holds the images to attach.

## What this is for

The Fox in 3D, built the way the HD Jester was (`claude/HOW-TO-3d-witch-models.md`). Chris asked for the Fox to be started while the Ranger is being built in another session. The paintings follow the Jester's and the Ranger's sets: realistic, on flat plum, in fixed views. Her lore is in `lore/discussion-notes.md`; what Chris decided about her look, tools and magic on November 12 is at the end of this doc.

93 prompts in four rounds. Round 1 (sets A to E, 39 images): enough to start building: her body, her face and hair, her hands and her boots. Round 2 (sets F and G, 17 images): details, flat cloth and her tools. Round 3 (sets H and I, 22 images): the flipbook moves, the powers from your lore, and her magic. Round 4 (sets J and K, 15 images): the older moves and three new ones.

## Images to attach

The five starters go into every new chat, in this order. They are in the HTML page and in `Fox_Reference_Starters.zip`.

- **FX1** `FX1_fox_painting.jpg`: Her painting. From the group painting. Her face, her curls, the ears and her colours.
- **FX2** `FX2_fox_character_sheet.jpg`: Her character sheet. The large figure, the three back and side views of her hair, and her faces.
- **FX3** `FX3_fox_sprite_sheet.jpg`: Her sprite sheet. The 24 poses the flipbook was cut from: Hemline Fangs, Blue Mischief, Borrowed Face.
- **S1** `S1_style_jester_standing.jpg`: Style guide: the Jester standing. One of the Jester's finished reference paintings. It shows ChatGPT the pose, the light, the background and how real to paint.
- **S2** `S2_style_jester_face.jpg`: Style guide: the Jester's face. How realistic a face should be.
- **S3** `S3_style_jester_hands.jpg`: Hands guide. Attach with D1 and D2 only.
- **S4** `S4_style_jester_boot.jpg`: Boot guide. Attach with E1 only.

Where they come from in the `moon-faire` repo:
- FX1, FX2: `art-pipeline/smoothing-pack/reference/fox_portrait_ref.png`, `fox_sheet_ref.png` (cut from `four_witches_concept.png`).
- FX3: `art-pipeline/sources/original_sheets/fox.png`.
- S1 to S4: branch `claude/jester-3d-model`, `models/jester-3d/references/`: `chatgpt/05_base_front_back`, `chatgpt/08_face_front`, `hands/hands_young_left`, `boots/boot_side_a`. The same four the Ranger's page uses.
- Flipbook strips (for timing, not for attaching): `assets/hd/fox/` (`hemline_fangs` 12 frames, `blue_mischief` 22, `borrowed_face` 22), placed on the anchors in `assets/manifest.json`.

## How to run it

1. Start a new ChatGPT chat. Attach the five starter images in order: FX1, FX2, FX3, S1, S2. Paste the standing rules and wait for "ready".
2. Paste A1. Redo it until she looks right. Then send: "This is the master painting of the Fox. Every later image in this chat must match her exactly: the same face, the same hair, the same build, the same clothes and the same colours." If you would like a second opinion, send A1 to Claude before you run the rest.
3. Go down the list one prompt at a time. One prompt makes one image. If a result breaks a rule, reply "Redo" and say what to fix.
4. Save each keeper under its code: `A1.png`, `C3.png`. A second keeper of the same prompt is `A1b.png`.
5. When the chat gets long and she drifts, start a new one: attach the five starters plus the kept A1 and C1, paste the standing rules, then send: "Images 6 and 7 are finished paintings of the Fox from this set. Match them exactly."
6. Before the first prompt of set H, paste the magic rules. Paste them again in any new chat that makes H, I, J or K images.
7. Zip each round and send it to Claude. Round 1 is enough to start building.

## Standing rules

```
I'm attaching five images.

Images 1, 2 and 3 show my character, the Fox, one of four witches in my game Moon Faire:
- the painting of her sitting and laughing,
- her character sheet,
- her sprite sheet of 24 small standing poses.
They are her design: her face, hair, body, clothes and colours. Parts of two other characters show at the left and right edges of her painting: ignore them.

Images 4 and 5 are finished reference paintings of a different character from the same game, the Jester. They are style guides only.

I need reference paintings of the Fox for a 3D modeller. These rules apply to every image in this chat:

1. STYLE. Paint her the way the Jester style guides are painted: a realistic, highly detailed painting of a real woman wearing a real costume, like a studio photograph taken for a 3D character model. Real skin, hair, cotton, brocade, leather, fur and metal. Not a cartoon, not anime, not pixel art, no drawn outlines.

2. Take only these things from the Jester style guides: how realistic the painting is, the pose, the camera, the lighting and the background. Never copy the Jester's face, make-up, body, costume or colours.

3. HER FACE, from the Fox painting. A grown woman with a round, friendly face, full cheeks, dimples, and laughter lines at the corners of her eyes. Keep her the age she is in her painting, and keep the eye colour she has there. Dark berry-red lipstick. Round glasses with thin dark metal frames and clear lenses; she wears them in every image unless I say WITHOUT her glasses.

4. HER HAIR is one hairstyle in every image: a real, messy ponytail bun. Her hair is light brown, darker at the roots and honey-gold toward the tips, in tight natural curls. Most of it is pulled up loosely and tied high on the back of her head, where the curls pile up and spill out as a big messy bun. Loose curls are left out all round her face: over her forehead, at her temples and down in front of her ears, the longest reaching her collar. So from the front you see curls all round her face, and from the sides and the back you see the bun. The front of her painting and the back views on her character sheet are the same hairstyle seen from two sides. Her hair never hangs loose down her back.

5. HER FOX EARS are part of her costume, not part of her body. She wears a pair of costume fox ears clipped into her hair on top of her head, one each side, pointing up and slightly outward. Each is a pointed triangle about 9 cm tall, covered in short brown fur with a darker tip and edge, with long, fluffy cream-white fur inside. The clips are hidden in her curls; there is no headband. Her character sheet paints these ears black: that is a mistake, so take their colour from her painting. She also has her own ordinary human ears. She has no tail.

6. HER BODY, from the character sheet and the sprite sheet. A real woman's soft, curvy figure with full hips. Do not slim her and do not lengthen her legs.

7. HER COSTUME never changes:
- A pink leather choker with small silver studs and a small ring at the front. One round gold jingle bell, about 3 cm across, hangs from the ring.
- An emerald-green blouse with a scooped neckline edged in a small ruffle, and short puffed sleeves. Each sleeve is gathered in above the elbow and ends in a ruffle.
- Over the blouse, a corset of red floral tapestry brocade: red, with woven flowers in cream, gold, teal and purple. It has boning seams, red piping along every edge, a scooped neckline that lets the blouse ruffle show above it, a pointed bottom edge at the centre front, and dark lacing up the back. It has wide shoulder straps of the same brocade; each strap meets the front of the corset under a round brass button with two short red cords. A thin dark burgundy ribbon is tied in a small bow at the centre of the neckline, with two long tails. A ruffle of the emerald blouse shows all the way round under the bottom edge of the corset.
- A stack of three beaded bracelets on each wrist: dark wooden beads and small brass beads.
- A brown leather belt with brass studs and a brass ring buckle, worn low and slanted on her hips, lower on her LEFT hip. A brown leather pouch with a flap hangs from it on her LEFT hip.
- Very wide patchwork trousers. They are trousers with two separate legs, never a skirt. Each leg is as wide as a skirt and is gathered in at the ankle. They are sewn from squares about 15 cm across, every square a different printed cotton: reds, oranges, teal, blue, purple, pink and gold, each with its own small print of flowers, dots, stars or paisley. The squares are joined with visible gold running stitches. Each leg has two layers: a full-length layer down to the ankle, and over it a shorter flounce of the same patchwork that hangs from the waist to about the knee, with an uneven hem. The lining is plain magenta-purple. It shows under the hem of each flounce and as a soft puffed ruffle at each ankle.
- Dark brown leather lace-up combat boots with tan laces, brass eyelets, a rounded toe cap and a chunky lug sole. The gathered ankles of the trousers sit on top of the boots.

8. She is not symmetrical. The pouch is always on her left hip. Never mirror her.

9. Smooth, graceful hands with short natural nails. No prominent veins or tendons.

10. No scissors, no needles, no weapons and no magic unless I ask for them.

11. VIEW. Flat and straight-on like a blueprint: no perspective, no wide-angle lens, the camera level with the middle of what is shown, never looking up or down at her unless I ask.

12. LIGHT. Soft, even studio light from the front. No dramatic shadows, no coloured light, no glow and no sparkles unless I ask.

13. BACKGROUND. One flat dark plum colour, the same as the style guides (#3B2F43), and nothing else: no floor, no ground shadow, no text, numbers, labels, borders or grid.

14. Everything I ask for is completely inside the frame with clear space on every side. Nothing is cut off and nothing overlaps.

15. When an image has more than one painting of her, they are all the same size, with their feet on the same line.

"Standing pose" means: standing straight, feet a little apart, toes forward, arms straight and held about 35 degrees away from her sides, hands open and relaxed with fingers slightly apart, head level, a small closed-lip smile, eyes open, looking straight ahead. Her hair, her bell and her trousers hang still.

Reply "ready" and wait for my first request.
```

## Set A: Whole figure, full outfit (round 1)

Her proportions and how the costume is laid out. Start with A1 and stay on it until you like her.

**A1: Front: the master** (tall). Body proportions and costume layout. Every later image gets matched to this one.
```
Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly in front. She is as large as she can be while the tips of her costume ears and the soles of her boots stay inside the image with a little clear space. The pouch on her left hip is on the right side of the image.
```

**A2: Back** (tall). The bun from behind, the back of the corset, and the back of the trousers and belt, which no picture of her has ever shown.
```
Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly behind, at the same size in the frame as the master painting. Show clearly: the messy ponytail bun high on the back of her head, the backs of the two costume ears, the buckle of the choker at the back of her neck, the dark lacing up the back of the corset, the blouse ruffle under it, the belt, the pouch on her left hip (on the left side of this image), and the two wide trouser legs from behind, each with its knee-length flounce.
```

**A3: Both sides** (wide). Her depth: bust, waist and hips, how far the bun stands out behind her head, and how wide the trousers are from the side.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, in exact side view, at exactly the same size. Left: she faces the left edge of the image, so we see her left side, with the pouch. Right: she faces the right edge of the image, so we see her right side, which has no pouch. These are the two different sides of her, not one painting mirrored.
```

**A4: Three-quarter views** (wide). How the corset, the belt and the trousers wrap round her.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, at exactly the same size. Left: turned 45 degrees, halfway between a front view and a view of her facing the right edge of the image. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the right edge.
```

**A5: Arms straight out, front and back** (wide). The puffed sleeves in full, and her sides from armpit to hip.
```
Wide image, landscape 3:2. Two paintings of her side by side, in her full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, palms down, fingers together. Left: from directly in front. Right: from directly behind. Show the whole of each puffed sleeve with its ruffle, and her whole side from armpit to hip.
```

**A6: Legs apart, front and back** (wide). Proof that they are trousers: where the two legs divide, and how much cloth is in each one.
```
Wide image, landscape 3:2. Two paintings of her side by side, in her full outfit, at exactly the same size, standing with her legs straight and her feet about 90 cm apart, her arms as in the standing pose. Left: from directly in front. Right: from directly behind. Show clearly that she is wearing trousers: the two wide legs are separate from the crotch down, and the plum background shows between them from the knees down. Show how each knee-length flounce hangs over its own leg, and the puffed purple ruffle at each ankle.
```

## Set B: Layers off (round 1)

What the belt and the top layer of the trousers hide. I build these layers first and check them before anything goes on top.

**B1: No belt, no jewellery: front and back** (wide). The whole corset, her neck, her waist and hips, and the top of the trousers.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size. Take off these things only: the belt, the pouch, the bracelets, and the choker with its bell. Keep everything else exactly the same: glasses, costume ears, emerald blouse, corset, patchwork trousers and boots. Left: from directly in front. Right: from directly behind. Show the whole corset down to its pointed bottom edge, the blouse ruffle under it, and the waistband of the trousers.
```

**B2: No belt, no jewellery: both sides** (wide). Her body in profile with nothing in the way.
```
Wide image, landscape 3:2. Two paintings of her side by side at exactly the same size, without the belt, pouch, bracelets or choker, in exact side view, standing straight with both arms held straight out to the sides at shoulder height so they do not hide her body. Left: she faces the left edge of the image. Right: she faces the right edge.
```

**B3: Trousers without the flounce** (wide). The shape of the full-length trouser leg by itself.
```
Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size, with no belt and no pouch. For this image only, take the knee-length flounce off both trouser legs, so that only the full-length patchwork layer shows, from the waistband down to the gathered ankles, with the purple ruffles and the boots below. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind.
```

**B4: Legs** (wide). The shape of her legs, which the trousers hide completely. The cloth has to know they are there.
```
Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size. For this image only, she wears plain, close-fitting charcoal-grey leggings in place of the patchwork trousers, with her boots, and no belt or pouch, so that the shape of her hips and legs can be seen. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind.
```

## Set C: Head, face, hair, glasses and ears (round 1)

The face is what you look at first, and her curls are the hardest hair on any of the four, so this is the biggest set. Most are without her glasses, because the glasses will be a real 3D object and must not be painted onto her skin.

**C1: Face from the front, no glasses** (square). The face that gets painted onto the model. Stay on this one until it is her.
```
Square image. One very large close-up painting of her face from directly in front, WITHOUT her glasses and WITHOUT the costume ears. For this image only, her loose curls are pushed back off her forehead and tucked behind her ears, so that her whole face is clear from her hairline to just under her chin, with both of her own ears inside the frame. Relaxed face with the faintest smile, lips closed, eyes open and looking straight at the viewer, head perfectly level, not tilted and not turned. Even light with no shadows across her face. Painted as realistically as the Jester face style guide: real skin with pores and fine laughter lines.
```

**C2: The same face with glasses** (square). Where the glasses sit against her eyes.
```
Square image. Exactly the same close-up as the last image: the same face, the same framing, the same expression, head level, curls still tucked back. This time she is wearing her round glasses. The lenses are clear, with no glare and no reflections, so both eyes are fully visible through them.
```

**C3: Front, three-quarter and profile, no glasses** (wide). The shape of her head. I measure the profile to the millimetre.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, WITHOUT her glasses, each showing from the tips of her costume ears down to her collarbones. Her hair is as usual: loose curls round her face and the messy ponytail bun high at the back. Left: from directly in front. Middle: turned 45 degrees toward the right edge of the image. Right: exact side view, a true profile, facing the right edge. Small closed-lip smile, eyes open, head level. In the profile, the curls at her temple are swept back far enough that her forehead, nose, lips, chin and jawline are clear against the background and her own ear can be seen.
```

**C4: The same three views with glasses** (wide). How the glasses sit on her nose and run back over her ears, through the curls.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, each showing from the tips of her costume ears down to her collarbones: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. She wears her glasses. Show clearly how the glasses sit on her nose, how far the lenses stand from her eyes, and how the arms of the glasses run back over her ears and into her curls.
```

**C5: Other side and the back of her head** (wide). Her hair: how it is gathered, the bun, and the loose curls at her neck.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, wearing her glasses, each showing from the tips of her costume ears down to her collarbones. Left: a true profile facing the LEFT edge of the image. Middle: from directly behind. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the left edge. Show how her hair is pulled up from the nape of her neck and gathered into the messy ponytail bun, how the curls spill out of it, the short loose curls at the nape, and where the two costume ears sit.
```

**C6: Face from above** (square). Checking the brow, cheeks and nose from a high camera.
```
Square image. One large close-up painting of her head WITHOUT her glasses, with the camera above her and in front of her, looking down at her face at about 45 degrees. We see the costume ears, the curls over her forehead, the tops of her cheeks and the bridge of her nose. Her eyes look down. Small closed-lip smile.
```

**C7: Face from below** (square). Under the jaw and chin, which no other painting shows.
```
Square image. One large close-up painting of her head WITHOUT her glasses, with the camera below her and in front of her, looking up at her face at about 45 degrees. We see under her chin and jaw, her nostrils and the underside of her brow. Her eyes look straight ahead. Lips closed.
```

**C8: Top of her head** (square). Where the ears are clipped, and how the curls run from her forehead back into the bun.
```
Square image. One large painting of the top of her head seen from directly above, looking straight down, with her face toward the bottom of the image. Show the loose curls over her forehead, the two costume ears and exactly where they sit, how the hair is drawn back into the messy ponytail bun, and the bun itself. The tops of her shoulders are just visible.
```

**C9: Three-quarter close-up, no glasses** (square). The cheek, ear and jawline up close.
```
Square image. One very large close-up painting of her face WITHOUT her glasses, turned 45 degrees toward the right edge of the image, from her hairline to under her chin. The curls on the near side are tucked behind her ear, so her whole near ear and cheek are clear. Small closed-lip smile, eyes looking the way her head is turned.
```

**C10: Hair alone** (wide). The shape of her hair with nothing sitting in it.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, WITHOUT her glasses and WITHOUT the costume ears, each showing from the top of her hair down to her collarbones. Left: from directly in front. Middle: a true profile facing the right edge of the image. Right: from directly behind. Her hair is exactly as in the other images: loose curls round her face, the rest gathered into the messy ponytail bun high on the back of her head.
```

**C11: The bun, close** (square). How the curls are built: how tight, how thick, and how the colour runs from root to tip.
```
Square image. One very large close-up of her messy ponytail bun, seen from behind and slightly to one side, filling the image, with the nape of her neck at the bottom. Show single curls clearly: how tightly they coil, how thick each lock is, and how the colour runs from darker brown at the roots to honey-gold at the tips.
```

**C12: The costume ears** (wide). The ears as their own objects, and how they fix into her hair.
```
Wide image, landscape 3:2. Only her costume fox ears, with no head and no hair, painted large four times in a row: one ear from the front, showing the long cream-white fur inside; the same ear from behind, showing the brown fur and the darker tip; the same ear from the side, showing how thick it is and how it curves; and both ears as a pair seen from the front, the distance apart that she wears them. Each ear has a small metal hair clip at its base.
```

**C13: Her grin, from three sides** (wide). Her usual face is a grin. It lifts her cheeks and narrows her eyes, so I need it in the round, not only from the front.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, WITHOUT her glasses, each from the tips of her costume ears to her collarbones. In all three she has the big, open, mischievous grin from the Fox painting: mouth open, upper teeth showing, cheeks lifted, eyes narrowed with laughter. Left: from directly in front. Middle: turned 45 degrees toward the right edge of the image. Right: a true profile facing the right edge. Her head is level in all three.
```

**C14: Expressions** (wide). Blinking, her smirk, her wink for Borrowed Face, and her serious face for when the bell falls silent.
```
Wide image, landscape 3:2. Six large paintings of her face from directly in front, in two rows of three, WITHOUT her glasses, each from her hairline to her chin. Her head is in exactly the same position and at the same size in all six; only her expression changes. Top row, left to right: relaxed, with eyes open and lips closed; a closed-lip smirk with one corner of her mouth raised; her big open grin with her teeth showing. Bottom row, left to right: eyes fully closed with a small smile; a wink, with her RIGHT eye closed (the eye on the left side of the image) and a grin; completely serious and calm, not smiling at all, eyes open and steady.
```

**C15: More expressions** (wide). Acting: threading a needle, playing innocent, being hit, laughing.
```
Wide image, landscape 3:2. Six large paintings of her face from directly in front, in two rows of three, WITHOUT her glasses, each from her hairline to her chin. Her head is in exactly the same position and at the same size in all six; only her expression changes. Top row, left to right: concentrating, eyes narrowed and the tip of her tongue showing at the corner of her mouth, as if threading a needle; wide-eyed innocence, eyebrows raised and lips pressed together; surprised, eyebrows up and mouth in a round "oh". Bottom row, left to right: laughing hard, eyes squeezed shut and mouth wide open; wincing, eyes shut tight and teeth clenched, as if she has just been hit; eyes half closed with a sly sideways look toward the right edge of the image.
```

**C16: Mouths for talking** (wide). Her mouth when she speaks.
```
Wide image, landscape 3:2. Six large paintings of her face from directly in front, in two rows of three, WITHOUT her glasses, each from her hairline to her chin. Her head is in exactly the same position and at the same size in all six, and her eyes stay open and relaxed; only her mouth changes. Top row, left to right: lips closed; lips slightly parted; mouth open in a round "oh". Bottom row, left to right: mouth open wide in an "ah"; teeth together and lips drawn back, as for "ee"; lips pushed forward, as for "oo".
```

**C17: The glasses alone** (wide). Building the glasses as their own object.
```
Wide image, landscape 3:2. Only her glasses, with no face, painted large four times in a row: from directly in front; from the side; from above; and in three-quarter view. Perfectly round lenses, thin dark metal frames, clear lenses, small nose pads, and thin straight arms with curved ear tips.
```

## Set D: Hands (round 1)

Attach S3 (the Jester's hands) with D1 and D2 so the framing matches. The hands are bare here because the bracelets get built as real objects.

**D1: Left hand, bare** (square). The shape of her hand and the skin painted onto it. Attach S3 with this one.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of the Fox's LEFT hand and forearm side by side, bare, with no bracelets and no rings, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons.
```

**D2: Right hand, bare** (square). Her right hand, so nothing has to be mirrored. Attach S3 with this one.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of the Fox's RIGHT hand and forearm side by side, bare, with no bracelets and no rings, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons.
```

**D3: Hands with their bracelets** (wide). Which bracelets sit where, and how big the beads are against her wrist.
```
Wide image, landscape 3:2. Two large paintings side by side: the backs of both of her hands and forearms, pointing straight up, fingers slightly apart, each wearing its stack of three beaded bracelets. Left: her left hand. Right: her right hand. Show each strand clearly: the size, colour and order of its dark wooden beads and small brass beads.
```

**D4: Left hand: four poses** (wide). Finger poses for the bell, the little fox, the thread and the puppet strings.
```
Wide image, landscape 3:2. Four large paintings of her bare LEFT hand and wrist in a row, each in a different pose: (1) the first finger hooked and the others loosely curled, as if hooking one finger under a small bell; (2) palm up and slightly cupped, as if something small is sitting on it; (3) thumb and first finger pinched together with the other fingers lifted, as if holding the end of a thread; (4) all five fingers spread wide and curled, like a puppeteer working strings.
```

## Set E: Boots (round 1)

Eight views of one boot, the same eight the Jester's boots were built from. Attach S4 (the Jester's boot) with E1 so the framing matches.

**E1: Outer side** (square). The boot's outline: sole depth, heel, shaft height. Everything is measured from this one. Attach S4 with this one.
```
Square image. I am attaching a boot style guide: copy its framing and realism only, not its boot. One large painting of her right combat boot: dark brown leather with a soft worn shine, laced up the front with tan laces through eight pairs of brass eyelets, a rounded toe with a stitched toe cap, a padded collar, and a chunky dark brown rubber lug sole with a low block heel and a line of tan stitching round the welt. The boot is alone, with no leg and no trouser above it, standing flat. Seen in exact side view from the outside, toe pointing to the right edge of the image.
```

**E2: Inner side** (square). The arch side, which differs from the outside.
```
Square image. The same boot as the last image: her right combat boot, alone, standing flat, at the same size. Seen in exact side view from the inside, toe pointing to the left edge of the image.
```

**E3: Front pair** (square). Width, toe shape and lacing from the front.
```
Square image. Both of her combat boots, as a pair, alone, standing side by side a little apart. Seen from directly in front, toes toward the viewer.
```

**E4: Back** (square). The heel and back seam.
```
Square image. Her right combat boot, alone, standing flat. Seen from directly behind: the heel block, the back seam and the pull loop.
```

**E5: Three-quarter** (square). How the shapes join up in the round.
```
Square image. Her right combat boot, alone, standing flat. Seen in three-quarter view from the front and the outside, from slightly above, the way a boot is shown in a shop.
```

**E6: From above** (square). The plan of the foot, the tongue and the opening.
```
Square image. Her right combat boot, alone. Seen from directly above, looking straight down, toe pointing to the top of the image: the laces, the tongue and the opening.
```

**E7: The sole** (square). The tread pattern.
```
Square image. The sole of her right combat boot, alone. Seen from directly below, flat, toe pointing to the top of the image: the whole lug tread pattern and the heel block.
```

**E8: Laces, close** (square). Eyelets, the bow and the collar.
```
Square image. A very large close-up of the top front of her right combat boot: the upper brass eyelets, the tan laces tied in a bow, the tongue and the padded collar.
```

## Set F: Details, flat pieces and fabrics (round 2)

Everything small, and every cloth laid flat so it can be wrapped onto the model. The patchwork is the biggest surface on her, so it gets three images of its own.

**F1: Choker and bell** (wide). On the model the bell swings as a real hanging object, and half her spells start at it.
```
Wide image, landscape 3:2. Her choker taken off, painted large, with clear space between the paintings. (1) Across the top: the pink leather choker unbuckled and laid out straight at its full length, seen from straight above, showing the small silver studs, the ring at the centre, the buckle and the holes. Below, in a row: (2) the round gold jingle bell hanging from the ring, seen from directly in front; (3) the same bell seen from the side; (4) the same bell seen from below, showing the slot cut across its underside.
```

**F2: Bracelets** (wide). Six bracelets as six real strands.
```
Wide image, landscape 3:2. Her six beaded bracelets taken off, each one separate and painted large, each laid flat in an open ring and seen from straight above. Top row: the three from her left wrist. Bottom row: the three from her right wrist. Dark wooden beads and small brass beads. Show the size, colour and order of the beads on each one.
```

**F3: Corset laid flat** (wide). The corset's pattern pieces, front and back.
```
Wide image, landscape 3:2. Her red floral brocade corset taken off and laid completely flat like a sewing pattern, seen from straight above, painted twice at the same size. Left: the front, outside up, with its scooped neckline, boning seams, red piping, the dark ribbon bow, the pointed bottom edge, and both shoulder straps laid straight up with their brass buttons. Right: the back, outside up, with its dark lacing. No folds, no wrinkles and no body inside it.
```

**F4: Corset close-ups** (wide). The brocade, the strap buttons, the ribbon and the lacing.
```
Wide image, landscape 3:2. Four large close-up paintings in a row, each seen straight on: (1) the centre front of the corset, showing the woven flowers of the brocade, two boning seams and the dark ribbon bow with its two tails; (2) one shoulder strap where it meets the corset, with its round brass button and the two short red cords; (3) the dark lacing at the back of the corset; (4) the pointed bottom edge of the corset at the centre front, with its red piping and the emerald ruffle of the blouse showing under it.
```

**F5: Blouse laid flat** (wide). The blouse under the corset, and how a puffed sleeve is put together.
```
Wide image, landscape 3:2. Two paintings. Left: her emerald-green blouse taken off and laid completely flat, seen from straight above, with its scooped neckline and neckline ruffle, both puffed sleeves spread out to the sides, and the ruffle round its bottom edge. Right: one puffed sleeve alone, painted large, as it looks when worn, seen from the side: the gathers at the shoulder, the puff, the gathered band above the elbow and the ruffle below it.
```

**F6: Trousers laid flat** (wide). The pattern pieces: how wide a leg really is, and the shape of the flounce.
```
Wide image, landscape 3:2. Her patchwork trousers taken off and laid completely flat like sewing pattern pieces, seen from straight above, with no folds and no body inside, as three separate pieces with clear space between them. (1) The whole pair of trousers without the flounces, laid flat with the two legs spread apart, showing the waistband, how very wide each leg is, and the gathered ankles with their purple ruffles. (2) One knee-length flounce alone, opened out flat, showing its uneven hem. (3) The same flounce turned over, showing its plain magenta-purple lining.
```

**F7: Belt and pouch** (wide). The belt gear as separate objects.
```
Wide image, landscape 3:2. Her belt gear taken off, each piece separate and painted large with clear space between them. (1) Across the top: the brown leather belt laid out straight at its full length, showing the brass studs, the brass ring buckle and the holes. Below, in a row: (2) the brown leather pouch from the front, with its flap and fastening; (3) the pouch from the side, showing how deep it is and its belt loop; (4) the pouch from behind.
```

**F8: Material squares** (wide). Flat samples I turn into the model's surfaces.
```
Wide image, landscape 3:2. Eight flat square samples of her materials in two rows of four, each square filled edge to edge with the material, perfectly flat, with no folds, no seams and even light. Top row, left to right: the red floral tapestry brocade of the corset; the emerald-green cloth of the blouse; the plain magenta-purple lining of the trousers; the pink leather of the choker. Bottom row, left to right: the dark brown boot leather; the brown belt leather; the short brown fur of the outside of her costume ears; the long cream-white fur of the inside of her costume ears.
```

**F9: Patchwork, one big square** (square). The cloth she is known by. This becomes the trouser legs.
```
Square image. One large flat square filled edge to edge with the patchwork of her trousers, seen straight on, perfectly flat, with even light and no folds. It is a grid of five patches across and five patches down, twenty-five square patches. Every patch is a different printed cotton: reds, oranges, teal, blue, purple, pink and gold, each with its own small print of flowers, dots, stars or paisley, as in the Fox painting. The patches are joined with visible gold running stitches along every seam. The grid is straight and even, so the image could be tiled.
```

**F10: Patchwork, a second square** (square). A different arrangement, so the two legs and the flounces do not repeat each other.
```
Square image. Exactly like the last image: the same patchwork, the same size of patch, the same gold running stitches, five patches across and five down, perfectly flat. This time every patch is a different print from the ones in the last image, in the same family of colours.
```

**F11: Twelve single prints** (wide). Each printed cotton by itself, so I can sew my own patchwork in code and no two patches on her need to match. Her magic uses them too.
```
Wide image, landscape 3:2. Twelve flat square samples in three rows of four, with a thin gap of background between them. Each square is filled edge to edge with ONE printed cotton from her patchwork trousers, perfectly flat, with no folds, no seams and even light. The twelve prints: a red with small cream flowers; an orange with gold dots; a teal with gold stars; a deep blue with white dots; a purple with pink paisley; a pink with red flowers; a gold with orange leaves; a red with a gold diamond pattern; a teal with blue flowers; a violet with silver stars; a rose with cream dots; a blue-green with gold paisley.
```

**F12: Corset brocade, one big square** (square). The red she is known by.
```
Square image. One large flat square filled edge to edge with the red floral tapestry brocade of her corset, with its woven flowers in cream, gold, teal and purple, seen straight on, perfectly flat, with even light and no folds or seams. The pattern repeats evenly so the square could be tiled.
```

## Set G: Her tools (round 2)

Your lore: she is a fabric artist and the world is her fabric. Scissors that become daggers, needles and thread. Only the scissors have ever been drawn, and only small, so the designs here are mine, made from what the sprites show. Change any wording you like before you run them.

**G1: The shears, closed and open** (wide). Her main tool and her weapon, as a solid object.
```
Wide image, landscape 3:2. Her shears alone, with no figure and no hands, painted in the same realistic style, large, three times. They are big dressmaker's shears of bright polished steel, about 30 cm long: two long, narrow, pointed blades joined by one round brass screw, and two ring handles of the same steel, one ring large enough for three fingers and the other smaller, for the thumb. Each blade comes to a fine point and is sharpened along both edges, like a dagger. Top: the shears closed, lying flat, points toward the right edge of the image. Middle: the shears open wide, lying flat. Bottom: the closed shears seen edge-on, showing how thin they are.
```

**G2: The shears coming apart** (wide). How one pair of shears becomes two daggers.
```
Wide image, landscape 3:2. The same shears as the last image, with no figure and no hands, painted three times at the same scale to show how they come apart. Left: closed. Middle: open wide and lifting apart at the brass screw, which has split into two halves, one staying on each blade. Right: the two halves completely separate, lying side by side. Each half is now a slim dagger about 30 cm long, with a long pointed blade and its own ring handle as the grip. One dagger has the large ring and the other has the small ring.
```

**G3: Needles, thimble and sheath** (wide). The small tools, and where the shears live when she is not using them.
```
Wide image, landscape 3:2. More of her tools, with no figure and no hands, each separate and painted large with clear space between them. (1) One long steel sewing needle, about 12 cm long, with a large eye, lying flat. (2) Five of the same needles pushed in a row through a strip of red felt. (3) A brass thimble with small round dimples, seen from the side and from above. (4) A slim brown leather sheath for the shears, seen from the front and from the side: the same leather as her belt, with brass rivets and a belt loop at the top. (5) The closed shears sitting in the sheath, with only the two ring handles showing above it.
```

**G4: Where she wears them** (wide). Her outline with the shears put away, and where her hand goes to draw them. Attach your kept G1 and G3.
```
Wide image, landscape 3:2. I am attaching the paintings of her shears and their sheath. Three paintings of her side by side in the standing pose, in her full outfit, at exactly the same size, now carrying her shears the way she wears them when they are put away: in the leather sheath, which hangs upright from her belt on her RIGHT hip, with the ring handles at the top and the points down. The knee-length flounce of the trousers falls partly over the sheath. Left: from directly in front, so the sheath is on the left side of the image. Middle: exact side view facing the right edge of the image, so we see her right side and the whole sheath. Right: from directly behind.
```

**G5: Her hands on the tools** (wide). Finger positions for each grip. Attach your kept G1, G2 and G3.
```
Wide image, landscape 3:2. I am attaching the paintings of her shears, her two daggers and her needle. Four large close-up paintings in a row of her hands holding them: (1) her right hand holding the closed shears ready to cut, thumb through the small ring and three fingers through the large ring; (2) the same hand with the shears open wide, in the middle of a cut; (3) her right hand holding one dagger, which is one half of the shears, gripped like a knife with her first finger through its ring; (4) her right hand pinching the long needle between thumb and first finger, with the brass thimble on her middle finger.
```

## Magic rules (paste before H1)

```
From here on, magic is allowed in the images where I ask for it. The Fox is a fabric artist, and the world is her fabric: she cuts it with her shears and sews it with needle and thread. Her magic always looks like this:

- FOXFIRE. A cold, bright flame: sapphire blue with a white-blue heart, and tips that flicker into violet, rose and gold. It gives light but never scorches cloth or skin.
- THREAD. A thin glowing thread, like embroidery floss made of light. Its colour changes slowly along its length: blue, teal, violet, rose, gold. Stitches made with it glow.
- THE CLOTH OF THE WORLD. Where she cuts the air, the cut has bright frayed edges of light, like torn cloth. What shows through a cut is glowing patchwork: squares of other places, each a different vivid colour, like her trousers.
- GHOSTS. Any copy she makes of herself or of anything else is see-through and sapphire blue, with bright outlines and fine stitched seams, as if sewn from light.
- SPARKS. Small four-pointed stars and tiny cross-stitches of light.

The background stays the same flat dark plum, and the magic is painted over it. She always casts toward the right edge of the image. When a target is needed, it is a wooden training dummy: a post with a padded canvas body, a round canvas head and two short arms.

Reply "ready".
```

## Set H: Key poses: the flipbook moves and your lore (round 3)

Paste the magic rules before H1. The first two show how her trousers behave when she moves. H3 to H8 are the three flipbook moves at their strongest moments. H9 to H13 are the powers from your lore that have never been drawn. Where a pose uses a tool, attach your kept painting of it from set G.

**H1: Walking and running** (wide). How the trousers swing. They are two cloths moving side by side, which is the hardest thing about her.
```
Wide image, landscape 3:2. No magic in this image. Two paintings of her whole figure side by side at the same size, in her full outfit, in exact side view, moving toward the right edge of the image. Left: walking, in the middle of a relaxed stride, her front heel just touching the ground, arms swinging loosely. Right: running, in the middle of a stride with both feet off the ground, arms pumping, the wide trouser legs and the bun streaming back behind her.
```

**H2: Sitting and kneeling** (wide). How the trousers pool on the ground.
```
Wide image, landscape 3:2. No magic in this image. Two paintings of her whole figure side by side at the same size, in her full outfit. Left: sitting cross-legged on the ground, seen from directly in front, with an elbow on her knee and her chin on her hand, grinning, as in the Fox painting; the wide trousers pool round her. Right: kneeling on her right knee with her left foot flat on the ground in front of her, back straight, seen in exact side view facing the right edge of the image.
```

**H3: Hemline Fangs: the draw and the split** (wide). Flipbook: Hemline Fangs, frames 2 and 3. Attach your kept G1, G2 and G4.
```
Wide image, landscape 3:2. I am attaching the paintings of her shears, of her two daggers, and of her wearing the sheath. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, as in the top row of her sprite sheet. Left: turned slightly toward the right edge of the image, she has just pulled the closed shears from the sheath on her right hip and holds them up in front of her chest in both hands, points up, with a playful grin. Right: facing the viewer with her feet apart, the shears now pulled apart into the two daggers, one in each hand, held out low at her sides with the points up. A few small blue sparks run along both blades. The empty sheath hangs on her right hip in both.
```

**H4: Hemline Fangs: the two cuts** (wide). Flipbook: Hemline Fangs, frames 5 and 6. Attach your kept G2.
```
Wide image, landscape 3:2. I am attaching the painting of her two daggers. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, as in the top row of her sprite sheet. Left: a deep lunge toward the right edge of the image, front knee bent and back leg straight, both arms thrown forward, the two daggers slashing across each other. Each blade leaves a long thin crescent of blue light, and the two crescents cross. The wide trousers swing with the lunge. Right: the finish: upright again and turned toward the viewer, her arms crossed in front of her waist with a dagger in each hand, and one thin ring of blue light circling her at waist height where the blades have just spun.
```

**H5: Blue Mischief: the spark and the little fox** (wide). Flipbook: Blue Mischief, frames 2 to 4.
```
Wide image, landscape 3:2. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, facing the viewer, as in the middle row of her sprite sheet. Left: one finger of her left hand is hooked under the gold bell at her throat, and a spark of foxfire has jumped from the bell onto her fingertip; she looks down at it, grinning. Right: her left hand is held out to her side at shoulder height, palm up. On her palm sits a fox made entirely of foxfire, no bigger than a kitten, with pointed ears and a curling tail of flame. She smiles at it and it looks back at her.
```

**H6: Blue Mischief: the throw** (wide). Flipbook: Blue Mischief, frame 6. Her signature pose.
```
Wide image, landscape 3:2. Key pose. One painting. On the left half of the image is her whole figure in her full outfit, as in the middle row of her sprite sheet: feet wide apart, knees bent, leaning toward the right edge with her left arm thrown straight out toward it, fingers open, laughing. The foxfire fox has leapt from her hand and fills the right half of the image. It is now the size of a real fox, stretched out in a long running leap toward the right edge, made entirely of flame, trailing ribbons of foxfire and small sparks behind it.
```

**H7: Borrowed Face: the wink and the double** (wide). Flipbook: Borrowed Face, frames 2 to 4.
```
Wide image, landscape 3:2. Key poses. Two paintings side by side at the same size, in her full outfit, facing the viewer, as in the bottom row of her sprite sheet. Left: she covers her right eye with her right hand (the eye on the left side of the image), her head tilted, with a wide, knowing grin. Right: her hand has dropped to her shoulder and she glances sideways toward the right edge, where a ghost double of her has stepped out of her left side and stands next to her, shoulder to shoulder. It is exactly her shape, her clothes and her grin, see-through and sapphire blue.
```

**H8: Borrowed Face: the bow** (wide). Flipbook: Borrowed Face, frames 5 and 6.
```
Wide image, landscape 3:2. Key pose. One scene with two figures, as in the bottom row of her sprite sheet. On the right, her ghost double, see-through and sapphire blue, bends forward in a deep, mocking bow toward the right edge of the image, with one arm swept out behind it. On the left, the real Fox tiptoes one step backward away from it, shoulders hunched, a finger to her lips, grinning at the viewer.
```

**H9: Same Cloth: cutting the copy** (wide). New. Your lore: she can make an enemy attack itself. Attach your kept G1 and G4.
```
Wide image, landscape 3:2. I am attaching the paintings of her shears and of her wearing the sheath. Key pose. One scene. On the left third of the image stands the Fox, whole figure, in her full outfit, side-on, facing the right edge, with the empty sheath on her right hip. On the right third stands the wooden training dummy. She holds the open shears out at arm's length in her right hand toward the dummy, with one eye shut and the tip of her tongue at the corner of her mouth, like a tailor cutting round a pattern from across the room. A bright cut line with frayed edges of light runs round the dummy's outline, as if the air round it were cloth. Where the cut is finished, a ghost copy of the dummy, see-through and sapphire blue, has begun to peel away from it sideways, like a shape cut out of fabric.
```

**H10: Same Cloth: the puppet** (wide). New. The copy turns on the thing it was cut from. Attach your kept G4.
```
Wide image, landscape 3:2. I am attaching the painting of her wearing the sheath with her shears in it. Key pose. One scene. On the left third of the image stands the Fox, whole figure, in her full outfit, facing the right edge, with both hands raised in front of her and her fingers spread like a puppeteer's. A glowing thread runs from each of her fingertips across the image to the ghost copy of the wooden training dummy, which stands in the middle: see-through, sapphire blue, with stitched seams of light. The ghost has turned its back on her and is swinging its arm hard into the real wooden dummy on the right third, which rocks backward from the blow in a burst of sparks. She is laughing. Her shears are back in the sheath on her right hip.
```

**H11: Slip Stitch: cutting the door** (wide). New. Your lore: she is the reason the party can get away from a fight. No copies of anyone are left behind. Attach your kept G1.
```
Wide image, landscape 3:2. I am attaching the painting of her shears. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit. Left: side-on, facing the right edge of the image, up on her toes, she reaches high with the closed shears in her right hand and drags their point straight down through the empty air in front of her. Behind the blade the air is left cut, like cloth: a tall, thin, vertical slit with bright frayed edges of light. Right: the shears are lowered in her right hand, and with her left hand she has taken hold of one edge of the slit and lifts it aside like the flap of a tent, looking back over her shoulder at the viewer with a grin. Through the opening there is glowing patchwork: squares of other places in vivid colours.
```

**H12: Slip Stitch: gone** (tall). New. The way out sews itself shut behind her.
```
Tall image, portrait 2:3. Key pose. One painting. The tall slit in the air stands in the middle of the image, held open like a tent flap, with glowing patchwork behind it. The Fox, whole figure, is halfway through it, stepping away from us: one leg and one arm are already inside, and she leans back out to look at the viewer, grinning, with a small wave of her free hand. At the top of the slit a needle of white light is already sewing the cut shut behind her, pulling a glowing thread through big, even stitches, so that the top third of the slit is closed.
```

**H13: Crazy Quilt** (wide). New. Your lore: much of her magic is confusing the enemy, with illusion and chaos.
```
Wide image, landscape 3:2. Key pose. One painting. The Fox stands on the left third of the image, whole figure, in her full outfit, facing the right edge, with both arms flung up and forward as if shaking out a bedsheet, laughing. From her hands a huge quilt of light billows out across the rest of the image and settles toward the ground: big glowing squares joined by bright stitches, each square a piece of a different place: a night sky with stars, a green meadow, a blue sea with waves, falling snow, a sunset, a chessboard floor. Some squares are sewn in upside down or sideways.
```

## Set I: Magic alone (round 3)

Her magic with nothing else in the picture, so I can layer it into the spells. For this set the background rule changes: pure black, no figure.

**I1: The foxfire fox: three poses** (wide). Blue Mischief. The little fox sitting, ready and leaping.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. A small fox made entirely of foxfire, painted three times in a row at the same size, in exact side view facing the right edge of the image: sitting upright with its tail curled round its feet; crouched low, about to spring; and stretched out in a full running leap. Its body is sapphire-blue flame with a white-blue heart; its ear tips, its paws and the tip of its tail flicker into violet, rose and gold. Pointed ears, a narrow muzzle, bright white eyes and a long full tail.
```

**I2: The foxfire fox from every side** (wide). The fox is a small 3D creature of its own, so I need it in the round.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. The same foxfire fox as the last image, standing still on all four legs, painted four times in a row at the same size: from directly in front; in exact side view facing the right edge of the image; from directly behind; and from directly above.
```

**I3: Foxfire** (square). Flames for her hands, her blades and the bell.
```
Square image. For this image only, the background is pure black (#000000), with no figure and no hands. Six separate flames of foxfire in two rows of three, well apart: a small round spark; a single upright tongue of flame; a flame leaning and streaming to one side; a wide, low flame; a curling wisp that ends in a spiral; and a burst with tongues in every direction. Each is sapphire blue with a white-blue heart and tips that flicker into violet, rose and gold.
```

**I4: Thread and stitches** (wide). The thread she sews the world with.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. Six separate pieces of her glowing thread, well apart, in two rows of three. Top row, left to right: a straight length of thread whose colour changes along it from blue to teal to violet to rose to gold; a loose length lying in soft loops; a small tight knot with two short ends. Bottom row, left to right: a straight row of even running stitches; a row of cross-stitches; a needle made of white light pulling a length of the thread behind it.
```

**I5: Sparks** (square). The small lights around every spell.
```
Square image. For this image only, the background is pure black (#000000), with no figure and no hands. Twelve separate sparks of light in a grid of four rows of three, well apart, in different sizes from tiny to large: four-pointed stars, tiny cross-stitches, small crescents and round points. Most are blue-white; a few are violet, rose or gold.
```

**I6: The cut in the air** (wide). Slip Stitch, and every spell where she cuts the world.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. The same cut in the air painted three times in a row at the same size. Left: a tall, thin, vertical slit, closed: a line of bright light with frayed, thread-like edges. Middle: the same slit pulled open in the middle into a tall pointed oval, with glowing patchwork showing inside it. Right: the same slit being sewn shut from the top with big, even stitches of glowing thread, so that its top half is closed.
```

**I7: Patches of other places** (wide). Crazy Quilt, and what shows through every cut.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. Six separate square patches in two rows of three, well apart, each seen flat from directly in front and each edged with a border of glowing stitches. Each patch is a piece of a different place, painted like glowing printed cloth: a night sky with stars; a green meadow with small flowers; a blue sea with waves; falling snow; a sunset with clouds; a chessboard floor.
```

**I8: The ghost double** (tall). Every copy she makes, of herself or of an enemy, is drawn with this look.
```
Tall image, portrait 2:3. For this image only, the background is pure black (#000000). One painting of her ghost double alone, whole figure, in the standing pose, seen from directly in front: exactly her shape and her full outfit, but made of see-through sapphire-blue light. Its outlines are bright. The patchwork squares and the seams of her costume show as fine lines of lighter blue, like stitching. The black background shows faintly through its body. Its eyes and its grin are bright white-blue.
```

**I9: Blade trails** (wide). Hemline Fangs: the light her daggers leave.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. Two paintings. Left: two long, thin crescents of blue light crossing each other like an X, each bright and sharp along its outer edge and fading to nothing on the inside. Right: one thin, complete ring of the same blue light, seen at a slant as an ellipse, brighter at one point where the blade has just passed.
```

## Set J: Key poses: the older moves and three new ones (round 4)

One image for each of the seven moves from the old sheet that were never drawn, as you asked. Her biggest spell gets two. J9 to J11 are three new ones of mine in her fabric-artist way. Whether any of these go in the game is yours to decide later; here they are for the demo of her.

**J1: Switcheroo** (wide). Old sheet. She swaps an ally and an enemy.
```
Wide image, landscape 3:2. Key pose. One painting of her whole figure in her full outfit in the centre of the image, facing the viewer, feet apart, with her arms crossed at the wrists in front of her chest and one finger of each hand pointing outward. From each pointing finger a loop of glowing thread stretches away, one to the left edge of the image and one to the right edge, both pulled tight as if each has caught something out of the picture. Her eyebrows are raised and her lips are pressed together in a look of complete innocence.
```

**J2: Finders Keepers** (tall). Old sheet. She steals an enemy's enchantment.
```
Tall image, portrait 2:3. Key pose. One painting of her whole figure in her full outfit, turned slightly toward the right edge of the image. With the thumb and two fingers of her right hand she is reeling in a glowing thread that comes in from the right edge, as if drawing a thread out of a seam. Hooked on the end of the thread, close to her hand, is a small bright gold light with a soft halo: the stolen enchantment. Her left hand is cupped under the bell at her throat, ready to catch it. A delighted, greedy grin.
```

**J3: Loose Thread** (wide). Old sheet. A stitch that goes on hurting after it lands. Attach your kept G1 and G3.
```
Wide image, landscape 3:2. I am attaching the paintings of her shears and her needle. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit. Left: she holds the long needle in her right hand and a glowing thread in her left, and is tying a small knot in the thread round a tiny flame of foxfire, with her eyes narrowed and the tip of her tongue at the corner of her mouth. Right: the thread now runs taut from her left hand away to the right edge of the image, and with the shears in her right hand she is snipping it close to her fingers, grinning.
```

**J4: Ninefold Lie** (wide). Old sheet. Nine of her at once.
```
Wide image, landscape 3:2. Key pose. One painting. The real Fox stands in the centre of the image, whole figure, in her full outfit, facing the viewer, holding out a fold of her wide trousers in her right hand like a curtsey, with a finger of her left hand to her lips. Behind her, spread in a curved row like a hand of cards, stand nine ghost doubles of her, see-through and sapphire blue, every one copying her gesture exactly. All nine are whole and inside the frame.
```

**J5: Bellbound Bargain** (tall). Old sheet. She gives an ally power and pays for it herself.
```
Tall image, portrait 2:3. Key pose. One painting of her whole figure in her full outfit, turned slightly toward the right edge of the image. She cradles the gold bell in both hands, lifted a little way from her throat. From the bell a single thread of gold and blue light runs away to the right edge. Her eyes are closed and her smile is tight: this costs her something.
```

**J6: When the Bell Falls Silent** (tall). Old sheet. She stops playing.
```
Tall image, portrait 2:3. Key pose. One painting of her whole figure in her full outfit, standing straight and still, feet together, facing the viewer. Two fingers of her right hand rest on the bell, holding it still. Her face is calm and serious, not smiling at all, with her eyes open and steady. Behind her, nine great fox tails made of foxfire open in a wide fan, like a peacock's tail. A thin mantle of blue flame lies along her shoulders, and the edges of her costume ears are lit.
```

**J7: The Moon's Little Lie: the coin** (tall). Old sheet, her biggest spell. The start.
```
Tall image, portrait 2:3. Key pose. One painting of her whole figure in her full outfit, facing the viewer. She points straight up with her right hand. A tiny, bright crescent moon balances on her fingertip, spinning like a tossed coin. She glances up at it sideways with an amused half-smile, her left hand on her hip.
```

**J8: The Moon's Little Lie: the moon** (wide). Old sheet, her biggest spell. The finish.
```
Wide image, landscape 3:2. Key pose. One painting. The Fox is small, whole figure, at the bottom centre of the image, facing the viewer, arms thrown wide and head back, laughing. Above and behind her an enormous blue moon fills the top of the image. It is sewn onto the dark background like a patch, with big bright stitches all the way round its edge. Nine fox tails of foxfire sweep out across the image from behind her. Two ghost doubles of her stand on each side of her, four in all, see-through and sapphire blue.
```

**J9: Pins and Needles** (wide). New. A handful of needles thrown like darts, each on its own colour of thread. Attach your kept G3.
```
Wide image, landscape 3:2. I am attaching the painting of her needles. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, attacking toward the right edge of the image. Left: the wind-up: her right hand is raised beside her ear holding five long needles fanned out between her fingers like a hand of cards. A glowing thread hangs from each needle, each thread a different colour: blue, teal, violet, rose and gold. Right: the throw: her right arm is snapped straight out toward the right edge and the five needles are in the air in a spreading fan, each trailing its thread back to her left hand, which holds all five threads like reins.
```

**J10: Seam Ripper** (wide). New. She finds the seam in the ground and rips it. Attach your kept G1.
```
Wide image, landscape 3:2. I am attaching the painting of her shears. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, attacking toward the right edge of the image. Left: crouched low on one knee, she presses the point of the closed shears to the ground in front of her, as if finding a seam. Right: she has ripped upward and stands in a long stride with the shears swept high toward the right edge. From her feet a long, jagged tear with bright frayed edges runs away along the ground to the right edge and gapes open, with glowing patchwork light pouring up out of it.
```

**J11: Thimble** (tall). New. Her guard. Attach your kept G3.
```
Tall image, portrait 2:3. I am attaching the painting of her thimble. Key pose. One painting of her whole figure in her full outfit, down on one knee, facing the viewer, with her left arm raised over her head. Her right hand is held up in front of her with the brass thimble on its middle finger. Over and around her stands a dome of golden light shaped like a giant thimble, taller than she is, its surface covered in small round dimples. A few sparks bounce off the outside of it. She peeks out from under her arm with one eye open, grinning.
```

## Set K: Magic alone, for those moves (round 4)

The same as set I: pure black, no figure.

**K1: The nine tails** (wide). When the Bell Falls Silent, and her biggest spell.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. Two paintings. Left: one fox tail made of foxfire, painted large and upright: long and full, sapphire blue with a white-blue heart, its tip flickering into violet, rose and gold. Right: nine of the same tails opened in a wide, even fan from one point at the bottom, like a peacock's tail.
```

**K2: The coin and the moon** (wide). The Moon's Little Lie.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. Two paintings. Left: a small, bright crescent moon like a coin, painted three times in a row to show it spinning: face-on as a crescent; half turned; and edge-on as a thin bright line. Right: a large, round, blue full moon sewn on like a patch, with big bright stitches all the way round its edge and a soft glow.
```

**K3: The thimble dome** (square). Thimble.
```
Square image. For this image only, the background is pure black (#000000), with no figure and no hands. One dome of golden light shaped like a giant thimble, seen from the side: straight sides, a rounded top, a thicker rim at the bottom, and its whole surface covered in rows of small round dimples. It is see-through, brighter at its edges.
```

**K4: The rip** (wide). Seam Ripper.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no hands. One long, jagged tear running from the left edge of the image to the right edge, as if the ground were cloth that has been ripped open: bright frayed edges with loose threads of light, narrow at the left and gaping wide at the right, with glowing patchwork light pouring up out of the opening.
```

## Checklist before keeping an image

- She matches the master: the same face, the same build, the same colours.
- She has not been made taller, thinner or younger than her painting.
- Her hair is the messy ponytail bun: loose curls round her face, the bun high at the back. Not hanging down her back.
- The fox ears are brown with cream-white fur inside, not black, and there is no headband. No tail.
- They are trousers: two wide legs, each with a knee-length flounce, with a purple ruffle at each ankle. Not a skirt.
- The pouch is on her left hip: the right side of a front view, the left side of a back view.
- Glasses on, unless the prompt said without. No glare over her eyes.
- The gold bell hangs from the pink choker.
- Nothing is cut off: the tips of the ears, her fingertips, the soles of her boots.
- Flat plum background with no floor shadow. (Black for sets I and K.)
- No text, numbers or labels anywhere.
- Real cloth, leather and skin: not a cartoon and not pixel art.
- When there is more than one of her, they are the same size and stand on one line.
- Smooth hands.

## What Claude plans to animate (proposal)

Your lore: the chaos-magic witch, an artist who creates reality and can use it. A fabric artist: the fabric of reality, scissors, needle and thread. Several damage attacks at the upper-middle tier. She can make an enemy attack itself. She is how the party gets away, and she can make enemies not attack them. Much of the rest is confusing the enemy with illusion and chaos. Names below are working names and are kept in data, so any of them can change.

| Move | Where it comes from | What it looks like |
|---|---|---|
| Hemline Fangs | Flipbook. | She pulls the shears from her hip, splits them into two daggers, makes two crossing cuts and spins them back together. |
| Blue Mischief | Flipbook. Your lore: a damage attack. | A spark jumps from her bell to her fingertip and grows into a little fox of foxfire on her palm. She throws, and it leaps at the target full-size. |
| Borrowed Face | Flipbook. Your lore: she can make enemies not attack the party. | She covers one eye, and a ghost double steps out of her side, takes a mocking bow and stands in front while she slips behind. |
| Same Cloth | Your lore: she makes an enemy attack itself. New. | She cuts round the enemy's outline from across the field, and a ghost copy of it peels away like a shape cut from cloth. She works it on threads like a puppet, and it turns and strikes the enemy with the enemy's own attack. Then she snips the threads and it unravels. |
| Slip Stitch | Your lore: she is how the party gets away. New. | She cuts a tall slit in the air, lifts the edge like a tent flap, and everyone goes through. A needle sews it shut behind them. Nobody's copy is left standing there. |
| Crazy Quilt | Your lore: confusing the enemy with illusion and chaos. New. | She shakes out a huge quilt of light over the field. Each square is a piece of a different place, some sewn in upside down, and the enemies no longer know which way they are facing. |
| Switcheroo | Old sheet. | Two loops of thread, a cross of the wrists, and two targets change places. |
| Finders Keepers | Old sheet. | She reels an enemy's enchantment in on a thread and pockets it at her bell. |
| Loose Thread | Old sheet. A damage attack. | She ties a knot round a flame, sends it over on a thread and snips the end. The stitch goes on hurting. |
| Ninefold Lie | Old sheet. A damage attack on several enemies. | Nine ghost doubles fan out behind her, all copying one gesture, and strike in three waves. |
| Bellbound Bargain | Old sheet. | A thread of gold and blue runs from her bell to an ally. It costs her. |
| When the Bell Falls Silent | Old sheet. | She stills the bell, stops smiling, and nine tails of foxfire open behind her. |
| The Moon's Little Lie | Old sheet. Her biggest damage spell. | A crescent spun on her fingertip like a coin becomes a huge blue moon, sewn onto the sky like a patch. |
| Pins and Needles | My addition. A damage attack. | Five needles thrown like darts, each on its own colour of thread. She pulls the threads tight. |
| Seam Ripper | My addition. A damage attack. | She finds the seam in the ground with the point of her shears and rips it open all the way to the target. |
| Thimble | My addition. Her guard. | A dome of gold light, dimpled like a giant thimble, drops over her. |
| Walk, run, kneel, sit, jump, talk, wave, bow, twirl, laugh, dance | Carried over from the Jester. | Adjusted for her build and her trousers, and given her own way of standing: weight on one hip, never quite still. |

### What Chris decided (November 12, 2026)

- **Hair.** One hairstyle, a real messy ponytail bun. The front of the painting and the back views on the sheet are both correct: they are the same hair from two sides.
- **Ears.** Fox ears, and they are costume ears her character is wearing, not real ones. No tail, apart from ghost tails in spells.
- **Legs.** Very wide patchwork trousers.
- **Magic colour.** Cold blue foxfire, open to an interpretation that makes it more vibrant and beautiful. An artist who creates reality should have a varied magic colour.
- **What kind of artist.** A fabric artist: the fabric of reality, scissors, needle and thread. The scissors become daggers. Needles, and a bell. She sews reality.
- **Making an enemy attack itself** has to be something special. If a ghost 3D copy of any character in the game is easy to make, that is the direction.
- **Getting away from a fight.** The party is able to flee, shown in some creative way that does not need a copy of each of them left standing while they run.
- **The old sheet's other seven moves.** One image of each, and Claude may use them as it sees fit.
- **More spells than the game needs are welcome,** because this is a demo of her as a model. If a spell needs more than one image, ask for it. Her spells need the most animation of the four.
- **Claude is the artist channeling her** for the details he has not set.

### Claude's additions, not yet confirmed by Chris

- **A ghost copy can be done, and one copy is simple.** The models are built by code, so a foe or the Fox can be built a second time with a see-through blue surface and stitched seams. Same Cloth uses the enemy's own model, and Borrowed Face uses hers. Nine of her at once (Ninefold Lie) will need a lighter copy of her, which has not been tested yet. I8 is the look.
- **Her colours.** Foxfire stays cold blue, with tips that flicker violet, rose and gold. Her thread changes colour along its length like variegated embroidery floss. What shows through a cut in the world is patchwork in the colours of her trousers. That is where the variety comes from.
- **The shears.** About 30 cm, polished steel with a brass screw. Each half is a dagger held by its own ring. They live in a leather sheath on her right hip, so her hand has somewhere to go. The sprites show a dark shape on that hip.
- **Needles and a thimble.** Long needles, about 12 cm, so they can be seen. The thimble is new and only there for her guard.
- **The little fox is a creature.** It gets built in the round, so it can sit on her hand, crouch and leap properly (I1 and I2).
- **The ears are clipped into her hair** with no headband, because none of her pictures shows one. Whatever ties the bun is hidden in the curls.
- **Her nails** are short and natural in the paintings. Their colour is set in code, so it can change without new paintings.
- **Six new names:** Same Cloth, Slip Stitch, Crazy Quilt, Pins and Needles, Seam Ripper and Thimble are mine, all sewing words.

### Where the pictures of her disagree, and what the prompts chose

- **Brown fox ears with cream fur.** The painting and all 24 sprites. The character sheet paints them black.
- **Pouch on her left hip.** The painting, the sheet and the front-view sprites agree. The side-view sprites put a pouch on whichever hip faces the viewer.
- **Two layers on each trouser leg:** a full-length leg with a knee-length flounce over it and a purple lining. That is my reading of the sheet and the sprites. B3 and F6 will show whether ChatGPT reads it the same way.
- **Dark brown boots with tan laces.** All three sources agree.
- **Her own face, not the Jester's.** All four began as the same person, but each painting gives her a different face. Her eye colour is left to her painting, because it is too small there for me to name.
- **Her back has never been drawn** below the shoulders. A2 is where the back of the trousers and belt gets decided, so look at that one closely.
- **A small closed-lip smile in the standing pose.** The Jester and the Ranger stand calm. A blank face is not her.
