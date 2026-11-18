# Io, the Herbal Witch: reference paintings for her 3D model

Written November 13, 2026, for Chris to run in ChatGPT. This is the text of the page `Io_Reference_Prompts.html`, which also holds the images to attach.

## What this is for

Chris asked for Io's 3D model to be started from scratch: an HTML file holding her reference pictures (the picture of all four, the pixel painting of her from Envoi, and her flipbook frames) and the list of prompts, to take to the image generator. He gave more artistic freedom over her spells than the flipbook shows. Her lore is in `lore/discussion-notes.md` and `lore/combat-balance.md`; the method is `claude/HOW-TO-3d-witch-models.md` and `claude/HOW-TO-3d-witch-faces.md`.

- Io in 3D, built the way the HD Jester was. The paintings follow the Jester's, the Ranger's and the Fox's sets: realistic, on flat plum, in fixed views.
- 104 prompts in four rounds. **Round 1** (sets A to E, 43 images) is enough to start building: her body, her face, hair and hat, her hands and her boots. **Round 2** (F and G, 21) is details, flat cloth, her book and her blades. **Round 3** (H and I, 26) is the flipbook moves, the powers from your lore, and her magic. **Round 4** (J and K, 14) is the Guardian as a creature, and extra moves.
- Rounds 3 and 4 are where I used the freedom you gave me with her spells. Read "What I plan to animate" near the bottom before you run them, and change anything you like.

## Seven choices Claude made, for Chris to check before round 1

- **Hair:** Long, loose and very wavy, down to her hips, as in her painting, her sheet and the flipbook. The Envoi picture has it tied back with grey in it.
- **Hat:** Wine-red with two small ridged horns that point up, as in her painting. The Envoi picture has a plum hat with curled ram's horns.
- **Robe:** Sheer wine-red chiffon with tiny gold dots and a gold band on every edge, with the huge three-tier sleeves from her sheet.
- **Blades:** Both. The gold sickle that unfolds from her moon pendant (flipbook) is her plain attack. The dagger from the Envoi picture sits in a sheath on her left hip and is used for her one harmful spell.
- **Magic colour:** Both. Gold-green growing light for everything that heals or grows (flipbook). Violet witchfire for the little that harms (Envoi).
- **Teeth:** None showing, in any picture. I carried your Fox rule over to her.
- **Book:** In her left hand, as in every flipbook frame. For the big new spells it floats open beside her so both hands are free. That part is my idea.

## Images to attach

The five starters go into every new chat, in this order. They are in the HTML page and in `Io_Reference_Starters.zip`.

- **IO1** `IO1_io_painting.jpg`: Her painting. From the group painting. Her face, her hair, the hat and her colours.
- **IO2** `IO2_io_character_sheet.jpg`: Her character sheet. The large standing figure, the three back and side views, and her faces.
- **IO3** `IO3_io_sprite_sheet.jpg`: Her sprite sheet. The 24 poses the flipbook was cut from: Harvest Crescent, Silverleaf Salve, Elderwood Guardian.
- **S1** `S1_style_jester_standing.jpg`: Style guide: the Jester standing. One of the Jester's finished reference paintings. It shows ChatGPT the pose, the light, the background and how real to paint.
- **S2** `S2_style_jester_face.jpg`: Style guide: the Jester's face. How realistic a face should be.
- **IO4** `IO4_io_envoi_picture.jpg`: Io as she is in Envoi. The picture you sent of her with the dagger and the purple flame. Attach only where a prompt asks for it: it shows the hat band, the dagger and the witchfire, but its hair and dress are different.
- **IO5** `IO5_closeup_hat_and_face.jpg`: Close-up: hat and face. Her painting, enlarged: the horns, the chain, the gold charm, her glasses and fringe.
- **IO6** `IO6_closeup_necklaces_pouch_crystal_book.jpg`: Close-up: necklaces, pouch, crystal, book. Her painting, enlarged: the moon pendant, the bracelets, the belt pouch, the crystal and the book cover.
- **IO7** `IO7_closeup_skirt_and_boots.jpg`: Close-up: skirt and boots. Her character sheet and two sprites, enlarged: the tiers of the skirt, the slit, the belt and the boots.
- **IO8** `IO8_flipbook_harvest_crescent.jpg`: Flipbook: Harvest Crescent. All 12 flipbook frames of the move, in order.
- **IO9** `IO9_flipbook_silverleaf_salve.jpg`: Flipbook: Silverleaf Salve. All 22 flipbook frames of the move, in order.
- **IO10** `IO10_flipbook_elderwood_guardian.jpg`: Flipbook: Elderwood Guardian. All 22 flipbook frames of the move, in order.
- **S3** `S3_style_jester_hands.jpg`: Hands guide. Attach with D1 and D2 only.
- **S4** `S4_style_jester_boot.jpg`: Boot guide. Attach with E1 only.

Where they come from:

- IO1, IO2: art-pipeline/smoothing-pack/reference/herbal_witch_portrait_ref.png, herbal_witch_sheet_ref.png (cut from four_witches_concept.png, the picture of all four you sent again today).
- IO3: art-pipeline/smoothing-pack/reference/herbal_witch_moves_sheet.png (the same file as art-pipeline/sources/original_sheets/witch.png).
- IO4: the pixel painting of Io you sent on November 13. It matches her Envoi model (src/models/witch.js in envoi-on-the-longest-night): the same hat band, dagger and flame.
- IO5, IO6, IO7: enlarged pieces of IO1, IO2 and IO3.
- IO8, IO9, IO10: the flipbook frames in assets/hd/herbal_witch/ (harvest_crescent 12 frames, silverleaf_salve 22, elderwood_guardian 22), placed on the anchors in assets/manifest.json. The flipbook file you sent holds the 8 key frames of each; these are the same moves with the in-between frames.
- S1 to S4: branch claude/jester-3d-model, models/jester-3d/references/: chatgpt/05_base_front_back, chatgpt/08_face_front, hands/hands_young_left, boots/boot_side_a. The same four the Ranger's and the Fox's pages use.
- All 14 files, and the scripts that build the page from them, are in the moon-faire repo on branch claude/io-3d-model, in models/io-3d/references/.

## How to run it

1. Start a new ChatGPT chat. Attach the five starter images in order: IO1, IO2, IO3, S1, S2. Paste the standing rules and wait for "ready".
2. Paste A1. Redo it until she looks right. Then send the master line (below the standing rules). If you would like a second opinion, send A1 to me before you run the rest.
3. Go down the list one prompt at a time. One prompt makes one image. Where a prompt says "Attach", add those images to the same message. If a result breaks a rule, reply "Redo" and say what to fix.
4. Save each keeper under its code: A1.png, C3.png. A second keeper of the same prompt is A1b.png.
5. When the chat gets long and she drifts, start a new one: attach the five starters plus your kept A1 and C4, paste the standing rules, then send the new-chat line.
6. Before the first prompt of set H, paste the magic rules. Paste them again in any new chat that makes H, I, J or K images.
7. Zip each round and send it to me. Round 1 is enough to start building.

The master line:

```
This is the master painting of Io. Every later image in this chat must match her exactly: the same face, the same hair, the same hat, the same build, the same clothes and the same colours.
```

The new-chat line:

```
Images 6 and 7 are finished paintings of Io from this set. Match them exactly.
```

## Standing rules

```
I'm attaching five images.

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

Reply "ready" and wait for my first request.
```

## Set A: Whole figure, full outfit (round 1)

Her proportions and how the costume is laid out. Start with A1 and stay on it until you like her.

**A1: Front: the master** (tall, 2:3). Body proportions and costume layout. Every later image gets matched to this one.
```
Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly in front. She is as large as she can be while the highest point of her hat and the soles of her boots stay inside the image with a little clear space. The tip of her hat hangs on the left side of the image, the pouch on her right hip is on the left side of the image, and her bare left leg shows through the slit on the right side of the image.
```

**A2: Back** (tall, 2:3). The back of the hat, her hair down her back, and the back of the robe and skirt. Her back has never been drawn at this size.
```
Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly behind, at the same size in the frame as the master painting. Show clearly: the back of the hat and how its crown slumps over (the tip is on the right side of this image), the black lace band and the chain going round the back of the crown, her hair falling down her back over the robe as far as her hips, the back of the robe with its long pointed hem, both great sleeves from behind, and the back of the skirt and the boots below the robe.
```

**A3: Both sides** (wide, 3:2). Her depth: bust, waist and hips, how far the brim reaches, and how the hair, robe and skirt hang from the side.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, in exact side view, at exactly the same size. Left: she faces the left edge of the image, so we see her left side. Right: she faces the right edge of the image, so we see her right side, with the pouch, and with the tip of the hat hanging toward us. These are the two different sides of her, not one painting mirrored. In both, show how far the brim of the hat reaches in front of her face and behind her head, how her hair falls in front of and behind her shoulder, and how the skirt opens over her left leg at the front.
```

**A4: Three-quarter views** (wide, 3:2). How the robe, the belt and the skirt wrap round her.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, at exactly the same size. Left: turned 45 degrees, halfway between a front view and a view of her facing the right edge of the image. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the right edge.
```

**A5: Arms straight out, front and back** (wide, 3:2). The great sleeves in full. They are the biggest cloth on her after the skirt.
```
Wide image, landscape 3:2. Two paintings of her side by side, in her full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, palms down, fingers together. Left: from directly in front. Right: from directly behind. Show the whole of each great bell sleeve hanging from her arm, with its three tiers and their gold-edged hems, the cut-out at each shoulder, and how the open robe hangs from her shoulders to her calves.
```

**A6: How she really stands, with her book** (wide, 3:2). Her resting pose. In every picture of her the book is in her left hand, and her arms do not stick out. Flipbook: the first frame of every move.
```
Wide image, landscape 3:2. Two paintings of her whole figure side by side at exactly the same size, in her full outfit, standing relaxed the way she does in her sprite sheet: her weight even on both feet, her shoulders soft, her right arm hanging naturally at her side with the hand relaxed and the palm turned in toward her thigh, and her spellbook held open in her LEFT hand at waist height, resting on her palm and forearm. Her spellbook is an old book about 25 cm tall, 18 cm wide and 6 cm thick, bound in worn dark brown leather, with an eight-pointed compass star tooled in gold on the front cover, brass corner pieces and thick cream pages with rough edges. She looks straight ahead with a small closed-lip smile. Left: from directly in front. Right: exact side view facing the left edge of the image, so we see her left side and the book.
```

## Set B: Layers off (round 1)

What the robe, the belt and the skirt hide. I build these layers first and check them before anything goes on top. Her hair is tucked up in these so her back and shoulders can be seen.

**B1: Robe off: front and back** (wide, 3:2). The whole bodice, her bare arms and shoulders, the belt and the top of the skirt.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size. Take off the robe only. Keep everything else exactly the same: hat, glasses, both necklaces, bracelets, black bodice, belt, pouch, crystal, skirt and boots. Her arms and shoulders are bare. For this image only, her hair is twisted up and tucked under her hat, so that her neck, shoulders, arms and back are completely clear. Left: from directly in front. Right: from directly behind. Show the whole bodice, front and back, and how it meets the belt and the skirt.
```

**B2: Robe off: both sides** (wide, 3:2). Her body in profile with nothing in the way.
```
Wide image, landscape 3:2. Two paintings of her side by side at exactly the same size, without the robe, with her hair twisted up and tucked under her hat, in exact side view, standing straight with both arms held straight out to the sides at shoulder height so they do not hide her body. Left: she faces the left edge of the image. Right: she faces the right edge of the image, so we see the pouch on her right hip.
```

**B3: Bodice and skirt only: front and back** (wide, 3:2). Her waist and hips with no belt, and where the skirt begins.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size. Take off these things: the robe, the belt with its pouch and crystal, both necklaces and all the bracelets. Her hair is twisted up and tucked under her hat. Keep everything else exactly the same: hat, glasses, black bodice, skirt and boots. Left: from directly in front. Right: from directly behind. Show the bottom edge of the bodice, the waistband of the skirt, and where the slit over her left leg begins.
```

**B4: The skirt from three sides** (wide, 3:2). The tiers of the skirt and the slit, with no robe over them.
```
Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size: the skirt, her bare left leg and the boots, with no robe, no belt, no pouch and no crystal. Legs straight, feet a little apart. Left: from directly in front, with her bare left leg showing through the slit on the right side of the image. Middle: exact side view facing the left edge of the image. Right: from directly behind. Show each tier of the skirt with its ragged, pointed hem, and the sheer tulle under the lace.
```

**B5: Legs** (wide, 3:2). The shape of her hips and legs, which the skirt mostly hides. The cloth has to know they are there.
```
Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size. For this image only, she wears plain, close-fitting black shorts in place of the skirt, with her boots and their sock cuffs, and no belt, pouch or crystal, so that the shape of her hips and bare legs can be seen. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind.
```

## Set C: Head, face, hair, glasses and hat (round 1)

The face is what you look at first, and she has the most on her head of the four: the hat, the horns, the glasses and hair to her hips. So this is the biggest set. The face paintings are without her hat and glasses, because those will be real 3D objects and must not be painted onto her skin or shade it.

**C1: Face from the front: no hat, no glasses** (square). The face that gets painted onto the model. Stay on this one until it is her.
```
Square image. One very large close-up painting of her face from directly in front, WITHOUT her hat and WITHOUT her glasses. For this image only, her hair is drawn back off her face and tucked behind her ears, with no strands across her forehead, so that her whole face is clear from her hairline to just under her chin, with both ears inside the frame. Relaxed face with the faintest closed-lip smile, eyes open and looking straight at the viewer, head perfectly level, not tilted and not turned. Even light with no shadows across her face. Painted as realistically as the Jester face style guide: real skin with pores and fine lines.
```

**C2: The same face with glasses** (square). Where the glasses sit against her eyes.
```
Square image. Exactly the same close-up as the last image: the same face, the same framing, the same expression, head level, hair still drawn back, still WITHOUT her hat. This time she is wearing her round glasses. The lenses are clear, with no glare and no reflections, so both eyes are fully visible through them.
```

**C3: Front, three-quarter and profile: no hat, no glasses** (wide, 3:2). The shape of her head. I measure the profile to the millimetre.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, WITHOUT her hat and WITHOUT her glasses, each showing from the top of her head down to her collarbones. Her hair is drawn back off her face, tucked behind her ears, and hangs down behind her shoulders. Left: from directly in front. Middle: turned 45 degrees toward the right edge of the image. Right: exact side view, a true profile, facing the right edge. Small closed-lip smile, eyes open, head level. In the profile her forehead, the bridge and tip of her nose, her lips, her chin, her jawline and her whole ear are clear against the background.
```

**C4: The same three views with hat and glasses** (wide, 3:2). How low the hat sits, how far the brim reaches, and how the glasses run back into her hair.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, each showing from the highest point of her hat down to her collarbones: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. She wears her hat and her glasses, and her hair is loose as usual. Show clearly how low the hat sits on her forehead, how far the brim reaches in front and behind, how the glasses sit on her nose, how far the lenses stand from her eyes, and how the arms of the glasses run back into her hair.
```

**C5: Other side and the back of her head** (wide, 3:2). The far side of the hat, and how her hair comes out from under the brim.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, wearing her hat and glasses, each showing from the highest point of her hat down to her shoulder blades. Left: a true profile facing the LEFT edge of the image. Middle: from directly behind. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the left edge. Show the back of the hat, the black lace band and the chain going all the way round, both horns, and how her hair comes out from under the brim and falls over her shoulders and down her back.
```

**C6: Face from above** (square). Checking the brow, cheeks and nose from a high camera.
```
Square image. One large close-up painting of her head WITHOUT her hat and WITHOUT her glasses, with the camera above her and in front of her, looking down at her face at about 45 degrees. Her hair is drawn back behind her ears. We see the top of her head and her parting, her forehead, the tops of her cheeks and the bridge of her nose. Her eyes look down. Small closed-lip smile.
```

**C7: Face from below** (square). Under the jaw and chin, which no other painting shows.
```
Square image. One large close-up painting of her head WITHOUT her hat and WITHOUT her glasses, with the camera below her and in front of her, looking up at her face at about 45 degrees. Her hair is drawn back behind her ears. We see under her chin and jaw, her nostrils and the underside of her brow. Her eyes look straight ahead. Lips closed.
```

**C8: Three-quarter close-up** (square). The cheek, ear and jawline up close.
```
Square image. One very large close-up painting of her face WITHOUT her hat and WITHOUT her glasses, turned 45 degrees toward the right edge of the image, from her hairline to under her chin. Her hair is tucked behind her near ear, so her whole near ear and cheek are clear. Small closed-lip smile, eyes looking the way her head is turned.
```

**C9: Six states of her face** (wide, 3:2). Her blink, her talking mouths and her smile. Each face has to sit in the same place in its box, because I cut the eyes and mouths out as patches. Attach: your kept C1.
```
Wide image, landscape 3:2. I am attaching the finished close-up of her face. A grid of six close-up paintings of that same face, three across and two down, each exactly the same size, each from directly in front with her head perfectly level, each in exactly the same position inside its box, each showing from her hairline to just under her chin. WITHOUT her hat and WITHOUT her glasses, with her hair drawn back as in the attached face. Every one matches the attached face exactly except for the one change named. Top row, left to right: (1) the attached face unchanged; (2) both eyes gently closed, as in the middle of a blink, mouth unchanged; (3) both eyes half closed, the upper lids lowered halfway over the eyes, mouth unchanged. Bottom row, left to right: (4) lips just parted, as if starting to speak, eyes unchanged; (5) lips rounded in a small "oo", eyes unchanged; (6) a broader, happy closed-lip smile with her cheeks lifted, eyes unchanged. No teeth show in any of them.
```

**C10: Expressions** (wide, 3:2). Acting: reading, working a spell, being surprised, being hit, being stern, being delighted. Attach: your kept C1.
```
Wide image, landscape 3:2. I am attaching the finished close-up of her face. Six large paintings of that same face from directly in front, in two rows of three, WITHOUT her hat and WITHOUT her glasses, with her hair drawn back, each from her hairline to her chin. Her head is in exactly the same position and at the same size in all six; only her expression changes. Top row, left to right: eyes lowered, as if reading a book held at her waist, with a small smile; concentrating, with her brows drawn a little together and her eyes narrowed; surprised, with her eyebrows raised and her lips parted in a small round "oh". Bottom row, left to right: wincing, with her eyes shut tight and her lips pressed together, as if she has just been hit; calm and stern, not smiling at all, with her eyes open and steady; delighted, with her eyes crinkled nearly shut by a big closed-lip smile. No teeth show in any of them.
```

**C11: Hair alone, from three sides** (wide, 3:2). The shape of her hair with no hat on it and no robe behind it. It is the hardest thing on her to build.
```
Wide image, landscape 3:2. Three paintings of her side by side at exactly the same size, each showing from the top of her head down to her hips. WITHOUT her hat, WITHOUT her glasses and WITHOUT her robe: she wears the black bodice, so her hair shows clearly against her bare shoulders and arms. Her hair is loose as usual. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind. Show where it parts, the wispy strands across her forehead, how it falls in front of and behind each shoulder, and how the waves grow bigger and looser toward the ends at her hips.
```

**C12: Top of her head** (square). The parting, and how the hair leaves her head, for when the hat comes off.
```
Square image. One large painting of the top of her head seen from directly above, looking straight down, with her face toward the bottom of the image, WITHOUT her hat. Show the parting near the middle, how the hair leaves the crown of her head in waves, the wispy strands at the front, and the tops of her shoulders with the hair falling over them.
```

**C13: Her waves, close** (square). How the hair is built: how wide a wave is, how thick a lock, and how the lighter strands run through it.
```
Square image. One very large close-up of her hair hanging down her back, filling the image. Show single locks clearly: how wide each wave is, how thick each lock is, the fine loose hairs at the edges, and how the lighter ash-brown strands run through the dark brown.
```

**C14: The glasses alone** (wide, 3:2). Building the glasses as their own object.
```
Wide image, landscape 3:2. Only her glasses, with no face, painted large four times in a row: from directly in front; from the side; from above; and in three-quarter view. Perfectly round lenses, thin dark metal frames, clear lenses, small nose pads, and thin straight arms with curved ear tips.
```

**C15: The hat alone, from four sides** (wide, 3:2). The hat as its own object. It gets built separately and set on her head. Attach: IO5.
```
Wide image, landscape 3:2. I am attaching an enlarged piece of her painting that shows the hat. Only her hat, with no head and no hair, sitting upright as if she were wearing it, painted large four times in a row at the same size: from directly in front; from the side its tip hangs on; from directly behind; and from the other side. Show the wide, slightly wavy brim, the soft crown slumping over to one side with its drooping tip, the band of black lace, the fine silver chain with its three tiny gold crosses, the large gold charm at the front, and the two cream-white ridged horns.
```

**C16: The hat from above and below** (wide, 3:2). The outline of the brim, how the crown folds, and the inside of the hat. Attach: your kept C15.
```
Wide image, landscape 3:2. I am attaching the painting of her hat. The same hat alone, with no head, painted twice at the same size. Left: seen from directly above, looking straight down, with the front of the hat toward the bottom of the image: the whole outline of the brim, the two horns, and the crown folded over to one side. Right: turned over and seen from directly below: the underside of the brim, and the round opening for her head with its inner band.
```

**C17: Hat details** (wide, 3:2). The horns, the gold charm, the chain and the tip, large enough to build. Attach: IO4, IO5.
```
Wide image, landscape 3:2. I am attaching two pictures that show her hat closely: an enlarged piece of her painting, and an older pixel painting of her. Use the pixel painting only for the hat band, the chain and the charm: its horns and its colours are different. Four large close-up paintings in a row: (1) one horn seen from the side, cream-white and ridged, with the place where it is fixed to the hat; (2) the large gold charm seen from directly in front: a ring with a straight bar running down through it and a short crossbar, with the cord that ties it to the band; (3) a length of the band, showing the black lace, the fine silver chain and the three tiny gold crosses hanging from it; (4) the drooping tip of the crown, with its creases.
```

**C18: Neck, shoulders and collarbones** (square). The skin of her neck and chest, so it can be painted to match her face. The Fox needed this later; Io gets it now.
```
Square image. One large close-up painting of her from just under her nose down to the top of her bodice, from directly in front, WITHOUT her hat, her glasses, her robe and both necklaces, with her hair held back behind her shoulders: her chin, her neck, her collarbones, her bare shoulders and her upper chest, in soft even light, with real skin texture.
```

## Set D: Hands and arms (round 1)

Attach S3 (the Jester's hands) with D1 and D2 so the framing matches. The hands are bare here because the bracelets get built as real objects.

**D1: Left hand, bare** (square). The shape of her hand and the skin painted onto it. Attach: S3.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of Io's LEFT hand and forearm side by side, bare, with no bracelets and no rings, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons.
```

**D2: Right hand, bare** (square). Her right hand, so nothing has to be mirrored. Attach: S3.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of Io's RIGHT hand and forearm side by side, bare, with no bracelets and no rings, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons.
```

**D3: A whole bare arm** (wide, 3:2). The skin of her arm from shoulder to wrist. Her shoulders show through the robe, and the robe is sheer.
```
Wide image, landscape 3:2. Two paintings, one above the other, at the same size, of her bare RIGHT arm from the shoulder to the fingertips, held straight out to the side at shoulder height with the palm down, with no robe and no bracelets. Top: seen from the front. Bottom: seen from behind. Smooth skin with real texture and soft, even shading.
```

**D4: Hands with their bracelets** (wide, 3:2). Which bracelets sit where, and how big the beads are against her wrist.
```
Wide image, landscape 3:2. Two large paintings side by side: the backs of both of her hands and forearms, pointing straight up, fingers slightly apart, each wearing its stack of three beaded bracelets. Left: her left hand. Right: her right hand. Show each strand clearly: the size, colour and order of its black beads, dark wooden beads and small gold beads.
```

**D5: Right hand: four poses** (wide, 3:2). Finger poses for the pendant, the leaf, the seed and the sickle.
```
Wide image, landscape 3:2. Four large paintings of her bare RIGHT hand and wrist in a row, each in a different pose, each with nothing in the hand: (1) fingers closed lightly round something small at her chest, thumb on top, as if holding a pendant; (2) thumb and first finger pinched together with the other fingers lifted, as if holding a leaf by its stem; (3) palm up and slightly cupped, as if a seed is resting on it; (4) closed in a firm grip, as if round a short handle, seen from the side.
```

**D6: Left hand: three poses** (wide, 3:2). How her left hand carries the book.
```
Wide image, landscape 3:2. Three large paintings of her bare LEFT hand and forearm in a row, each with nothing in the hand: (1) palm up and flat with the fingers spread wide, as if an open book is resting on the palm and forearm, seen from the front; (2) the same pose seen from the side; (3) the fingers curled round the spine of a closed book carried against her hip, seen from the side.
```

## Set E: Boots (round 1)

Eight views of one boot, the same eight the Jester's boots were built from. Attach S4 (the Jester's boot) with E1 so the framing matches.

**E1: Outer side** (square). The boot's outline: sole depth, heel, shaft height. Everything is measured from this one. Attach: S4, IO7.
```
Square image. I am attaching a boot style guide: copy its framing and realism only, not its boot. I am also attaching an enlarged piece of her character sheet that shows her boots. One large painting of her right platform combat boot with its sock: glossy black leather, laced up the front with black laces through ten pairs of antique-gold eyelets, a rounded toe with a stitched toe cap, a buckled strap round the top of the shaft, a pull loop at the back, and a thick black platform lug sole about 5 cm deep with a slightly higher block heel. A short black ribbed sock cuff shows above the top of the boot. The boot is alone, with no leg above the sock, standing flat. Seen in exact side view from the outside, toe pointing to the right edge of the image.
```

**E2: Inner side** (square). The arch side, which differs from the outside.
```
Square image. The same boot as the last image: her right platform combat boot with its black sock cuff, alone, standing flat, at the same size. Seen in exact side view from the inside, toe pointing to the left edge of the image.
```

**E3: Front pair** (square). Width, toe shape and lacing from the front.
```
Square image. Both of her platform combat boots with their black sock cuffs, as a pair, alone, standing side by side a little apart. Seen from directly in front, toes toward the viewer.
```

**E4: Back** (square). The heel, back seam and pull loop.
```
Square image. Her right platform combat boot with its black sock cuff, alone, standing flat. Seen from directly behind: the heel block, the depth of the platform, the back seam, the pull loop and the buckled strap.
```

**E5: Three-quarter** (square). How the shapes join up in the round.
```
Square image. Her right platform combat boot with its black sock cuff, alone, standing flat. Seen in three-quarter view from the front and the outside, from slightly above, the way a boot is shown in a shop.
```

**E6: From above** (square). The plan of the foot, the tongue and the opening.
```
Square image. Her right platform combat boot with its black sock cuff, alone. Seen from directly above, looking straight down, toe pointing to the top of the image: the laces, the tongue, the buckled strap and the opening with the sock.
```

**E7: The sole** (square). The tread pattern.
```
Square image. The sole of her right platform combat boot, alone. Seen from directly below, flat, toe pointing to the top of the image: the whole lug tread pattern and the heel block.
```

**E8: Laces, strap and sock, close** (square). Eyelets, the bow, the buckle and the sock rib.
```
Square image. A very large close-up of the top front of her right platform combat boot: the upper antique-gold eyelets, the black laces tied in a bow, the tongue, the buckled strap with its buckle, and the black ribbed sock cuff above it.
```

## Rounds 2 to 4

Sets F to K (61 prompts) and the magic rules are in `claude/io-3d-reference-prompts-rounds-2-4.md`. The project could not take the whole list as one doc; the single-file version is in the repo at `models/io-3d/references/prompts/io-3d-reference-prompts.md`, branch `claude/io-3d-model`.

## Checklist before keeping an image

- She matches the master: the same face, the same build, the same colours.
- She has not been made taller, thinner or younger than her painting.
- Her hair is long, loose and very wavy, down to her hips. Not tied back, and not grey.
- The hat is wine-red and its crown slumps toward her right: the left side of a front view, the right side of a back view.
- Two small cream horns, on the hat. Not growing from her head, and not curled like a ram's.
- The black lace band, the chain with three tiny crosses and the large gold charm are on the hat.
- The robe is sheer wine-red with gold dots, open down the front, with a cut-out at each shoulder and three-tier bell sleeves.
- The pouch is on her right hip: the left side of a front view. The slit is over her left leg: the right side of a front view.
- Glasses on, unless the prompt said without. No glare over her eyes.
- No teeth showing.
- When she has the book it is in her left hand, or floating at her left. The sickle and the dagger are in her right.
- Nothing is cut off: the top of the hat, her fingertips, the ends of the sleeves, the soles of her boots.
- Flat plum background with no floor shadow. (Light grey for F4, F6, F8, F10 and F11. Black for set I and K1.)
- No text, numbers or labels anywhere.
- Real cloth, leather and skin: not a cartoon and not pixel art.
- When there is more than one of her, they are the same size and stand on one line.
- Smooth hands.

## What Claude plans to animate (proposal)

Your lore: she is nature. Low-tier attacks; good heals at the middle tier, for the whole party by a share or for one person by a lot; one-time summons at the upper-middle tier; she calls deities, with a paladin-like energy; and she is why the party has herbs and potions. In the reworked combat her magic grows: it takes root on one turn and blooms over the next, and her summon is planted ahead and arrives when it blooms. Names below are working names and are kept in data, so any of them can change.

| Move | Where it comes from | What it looks like |
|---|---|---|
| Harvest Crescent | Flipbook. Her plain attack. | Her hand closes on the moon pendant, it unfolds into a gold sickle, and she makes one wide cut that leaves a crescent of gold light. The sickle folds back into the pendant. |
| Silverleaf Salve | Flipbook. Heals one friend now. | She lifts a pressed leaf from the page. It turns fresh and silver-green, floats over her palm, and breaks into a ribbon of light and leaves that winds round the friend. |
| Elderwood Guardian | Flipbook. Your lore: her one-time summon, planted and then arriving. | She holds a glowing seed up, lets it sink into the ground, and a sapling grows. Later it twists into a fawn, stands up as a stag of living wood, and leaps at the foe, unravelling into a rush of vines as it lands. |
| Moonflower Garden | Your lore: she heals the whole party. New. | The book floats. She scatters a handful of glowing seeds in a ring, buds rise where they land, and over the next turns they open into white flowers that glow like small moons. |
| Rootbound Return | Old sheet, and the reworked combat: revive. | She kneels by the fallen friend with a seed on her palm. Roots of light trace their outline, small white flowers open along them, and she helps them sit up. |
| Thornwake | Your lore: one damage move. Old sheet name, new look. | She draws the dagger, witchfire wakes on the blade, and she drives it into the ground. A crack of violet light runs to the foe and a briar of thorned roots closes on it like a hand. Roses open on the briar. |
| Bramble Cradle | Old sheet. Her guard. | A dome of woven living branches grows over her, covered in small leaves, with its thorns pointing out. |
| Moondew | Old sheet. A heal that keeps working. | She uncorks a small bottle. A bead of dew rises, divides into six drops that circle her pendant, and the ring goes to a friend. |
| Bitter Remedy | Old sheet. A cure. | She crumbles a dark herb into a tiny floating cup and stirs the steam into a spiral. |
| Witchfire | From Envoi. | The violet flame she carries in Envoi, standing on her left palm, then thrown. |
| Dagger strike | From Envoi. | Her guard and lunge with the dagger, as she fights in Envoi. |
| Pressed Flower | My addition. | She catches a spell thrown at her between the pages of her book and claps it shut. |
| Moth wings | My addition, from her name. | A great moth settles on her back and its wings open behind her as her own. |
| The Guardian in full glory | My addition, from "she calls deities". | She kneels with her hand on her heart, and the stag rears behind her at three times her height, its antlers the crown of a tree hung with lantern seeds. |
| Hit, down, revived, victory | Every witch needs them. | She holds her hat on when she is hit, loses it when she falls, and tips its brim when she wins. |
| Walk, run, kneel, sit, jump, talk, wave, bow | Carried over from the Jester. | Adjusted for her build, her robe and her skirt. She holds her hat when she runs, and she reads when she sits. |

### Claude's additions, not yet confirmed by Chris

- **The floating book.** In the flipbook the book never leaves her left hand. In 3D that would keep her from ever using two hands, so for the big new spells it floats open at her left side with its pages turning. For the three flipbook moves it stays in her hand.
- **Two colours of magic.** Gold-green growing light for everything that heals or grows, as in the flipbook. Violet witchfire, from Envoi and from the little sprites on her character sheet, for the little that harms. You can tell what a spell does from its colour.
- **The Guardian as the deity she calls.** Your lore says she calls deities and leaves open which ones in this game. I used the stag from the flipbook, treated as a forest god in the shape of a stag. The flipbook already shows it planted as a seed and growing, which is how the reworked combat says her summon arrives.
- **The moth.** Her name is the io moth's, the old sheet gave her a moth, and in Envoi she calls one. It is in round 4 and easy to leave out.
- **Moonflowers.** Real moonflowers open at night. Here they glow like small moons, which felt right for a story set at new moon. The lore does not say this; it is only a look.
- **Both blades have a job.** The sickle harvests: it is her plain attack. The dagger marks the ground: it is how she casts Thornwake. The dagger lives in a sheath on her left hip, so her right hand can draw it across her body while her left holds the book.
- **The horns are part of the hat,** like the Fox's ears are costume ears. Every picture of her puts them on the hat band.
- **The herbs, seed, bottles and cup** in G7 are designed from the old move sheet's descriptions.
- **New names:** Moonflower Garden and Pressed Flower are mine. Thornwake, Rootbound Return, Bramble Cradle, Moondew and Bitter Remedy are the old sheet's names.

### Where the pictures of her disagree, and what the prompts chose

- **Long loose hair.** Her painting, her sheet and all 24 sprites. The Envoi picture ties it back and streaks it grey.
- **Wine-red hat.** Her painting, and your lore calls her "the one with the red hat". Her sheet and the Envoi picture lean plum.
- **Small ridged horns that point up.** Her painting and sprites. The Envoi picture and the Envoi model have curled ram's horns.
- **The hat band.** The black lace band and the chain of small crosses are clearest in the Envoi picture, and the painting has the chain too, so I used them. The large gold charm is in every picture.
- **A sheer robe with gold dots.** The painting and the Envoi picture show it sheer and glittering. The sheet paints it as heavier cloth with gold bands. The prompts ask for sheer chiffon with a gold band on the edges, and the sheet's three-tier sleeves.
- **A black bodice with a lace neckline.** The painting shows lace, the sheet a plain black top, and the Envoi picture a sequin mesh dress.
- **Bare legs with a short sock cuff.** Her sheet and sprites. The Envoi picture has knee-high black socks.
- **Platform boots with gold eyelets and a strap at the top.** Her sheet and sprites. The Envoi picture has plainer boots with an ankle buckle.
- **The crystal hangs at the centre front.** The sprites. The painting hangs it beside the pouch.
- **Bracelets on both wrists.** The sheet. The painting shows her right wrist, and the Envoi picture her left.
- **Pouch on her right hip.** The painting. The sheet and sprites are too small to tell.
- **Her own face,** not the Jester's. You settled that for the Fox: the four are inspired by one person but are their own characters.
- **No teeth.** Your rule for the Fox, carried over.

### What the earlier witches taught, used here

- The face paintings are without hat and glasses, with the hair drawn back, so nothing shades or covers the skin that gets baked (Ranger, Fox).
- C9 is the six-state grid from the Fox's round 5, framed so eyes and mouths can be cut as patches.
- No teeth (Chris's rule for the Fox).
- A resting stance (A6) and a bare arm (D3) and a neck close-up (C18) are in round 1, because the Fox needed all three later.
- Hair gets its own views without the hat (C11 to C13): it is to her hips and will move.
- The hat, glasses, book and blades are painted as separate objects, because they are built as separate objects.
