# The Ranger: reference paintings for her 3D model

Written November 12, 2026, for Chris to run in ChatGPT. This is the text of the page `Ranger_Reference_Prompts.html`, which also holds the images to attach.

## What this is for

The second Moon Faire witch in 3D, built the way the HD Jester was (`claude/HOW-TO-3d-witch-models.md`). Chris asked Claude to pick which witch to build next; Claude picked the Ranger. The paintings follow the Jester's set: realistic, on flat plum, in fixed views. Her lore is in `lore/discussion-notes.md`.

67 prompts in three rounds. Round 1 (sets A to E, 33 images) is enough to start building. Round 2 (F and G, 19) is details and weapons. Round 3 (H and I, 15) is poses and magic.

## Why the Ranger next

- **Her body shows.** Her outfit is fitted, so nothing hides a mistake. The Jester's body is mostly under cloth. The Ranger proves the method can build a second, different woman before Io's robe and the Fox's trousers cover everything up.
- **She brings three things the Jester never needed.** Glasses, hair you can see, and weapons held in the hand. All three of the witches still to build need all three, and hers are the simplest version of each.
- **Your lore makes her a fighter first.** Bow, sword and knives, with magic only to sharpen them. That is a new kind of animation after the Jester's spells, and Io's sickle and the Fox's daggers can borrow from it.
- **I agree the Fox is the hardest.** Curls, ears, wide trousers that are two moving cloths side by side, and chaos magic that needs copies of her on screen. She should come last, when the model is quick enough to draw more than once. Io would come between them.

## Images to attach

The five starters go into every new chat, in this order. They are in the HTML page and the zip sent with it.

- **R1** `R1_ranger_painting.jpg`: Her painting. From the group painting. Her face, hair and colours.
- **R2** `R2_ranger_character_sheet.jpg`: Her character sheet. Standing front, the three turnaround views, the headband gem.
- **R3** `R3_ranger_sprite_sheet.jpg`: Her sprite sheet. The 24 poses the flipbook was cut from: Moonsteel Draw, Silver Arrow, Silverglass Ward.
- **S1** `S1_style_jester_standing.jpg`: Style guide: the Jester standing. One of the Jester's finished reference paintings. It shows ChatGPT the pose, the light, the background and how real to paint.
- **S2** `S2_style_jester_face.jpg`: Style guide: the Jester's face. How realistic a face should be.
- **S3** `S3_style_jester_hands.jpg`: Hands guide. Attach with D1 and D2 only.
- **S4** `S4_style_jester_boot.jpg`: Boot guide. Attach with E1 only.

Where they come from in the `moon-faire` repo:
- R1, R2: `art-pipeline/smoothing-pack/reference/ranger_portrait_ref.png`, `ranger_sheet_ref.png` (cut from `four_witches_concept.png`).
- R3: `art-pipeline/sources/original_sheets/ranger.png`.
- S1 to S4: branch `claude/jester-3d-model`, `models/jester-3d/references/`: `chatgpt/05_base_front_back`, `chatgpt/08_face_front`, `hands/hands_young_left`, `boots/boot_side_a`.
- Flipbook strips (for timing, not for attaching): `assets/hd/ranger/` (`moonsteel_draw` 10 frames, `silver_arrow` 10, `silverglass_ward` 11), placed on the anchors in `assets/manifest.json`.

## How to run it

1. Start a new ChatGPT chat. Attach the five starter images in order: R1, R2, R3, S1, S2. Paste the standing rules and wait for "ready".
2. Paste A1. Redo it until she looks right. Then send: "This is the master painting of the Ranger. Every later image in this chat must match her exactly: the same face, the same build, the same clothes and the same colours."
3. Go down the list one prompt at a time. One prompt makes one image. If a result breaks a rule, reply "Redo" and say what to fix.
4. Save each keeper under its code: `A1.png`, `C3.png`. A second keeper of the same prompt is `A1b.png`.
5. When the chat gets long and she drifts, start a new one: attach the five starters plus the kept A1 and C1, paste the standing rules, then send: "Images 6 and 7 are finished paintings of the Ranger from this set. Match them exactly."
6. Zip each round and send it to Claude.

## Standing rules

```
I'm attaching five images.

Images 1, 2 and 3 show my character, the Ranger, one of four witches in my game Moon Faire:
- the painting of her sitting by the castle,
- her character sheet,
- her sprite sheet of 24 small standing poses.
They are her design: her face, hair, body, clothes and colours.

Images 4 and 5 are finished reference paintings of a different character from the same game, the Jester. They are style guides only.

I need reference paintings of the Ranger for a 3D modeller. These rules apply to every image in this chat:

1. STYLE. Paint her the way the Jester style guides are painted: a realistic, highly detailed painting of a real woman wearing a real costume, like a studio photograph taken for a 3D character model. Real skin, hair, lace, brocade, leather and metal. Not a cartoon, not anime, not pixel art, no drawn outlines.

2. Take only these things from the Jester style guides: how realistic the painting is, the pose, the camera, the lighting and the background. Never copy the Jester's face, body, costume or colours.

3. HER FACE AND HAIR, from the Ranger painting. A grown woman with a warm, kind face and soft smile lines. Keep her the age she is in her painting. Round wire glasses with thin dark frames and a faint blue-lilac tint in the lenses; she wears them in every image unless I say WITHOUT her glasses. Dark grey hair streaked with silver, pulled up into a loose, messy bun high on the back of her head, with wavy strands left loose at her temples and in front of her ears. A wide royal-blue cloth headband with small gold and orange embroidery, knotted at the back, with one oval blue gemstone in an ornate gold setting at the centre of her forehead and a tiny gold drop hanging under it. Long gold drop earrings with small blue beads.

4. HER BODY, from the character sheet. A real woman's soft, curvy figure with full hips and thighs. Do not slim her and do not lengthen her legs.

5. HER COSTUME never changes:
- A royal-blue brocade corset with small gold and orange woven flowers, visible boning seams, a scooped neckline, a pointed bottom edge at the centre front, black lacing up the back, and wide shoulder straps of the same blue cloth. Each strap fastens with a small buckle and has two black wrought-iron scroll curls at the shoulder.
- Under the corset, a black top with a scalloped lace edge across the chest and short, wide, sheer black lace sleeves worn off the shoulder, ending in ragged lace points at about the elbow. Her shoulders are bare.
- Four necklaces: a short fine silver chain with a small teal drop; a long strand of blue and turquoise beads; a longer strand of pearl and pale pink beads; and a long chain with a small ornate gold pendant resting on the corset.
- A wide bronze cuff bracelet on her left wrist. Thin gold bangles and a teal bead bracelet on her right wrist. A few thin silver rings on her right hand.
- Two brown leather belts worn slanted on her hips and crossing each other, with silver studs and a silver ring buckle.
- A black leather satchel with two buckled straps on her RIGHT hip, and a smaller black pouch behind her LEFT hip.
- Hanging from the belts: a bunch of teal-blue crystal drops in gold caps under the satchel, and strings of amber and gold beads ending in drops at the front and on her left.
- Short, fitted black shorts over black lace-patterned leggings (a floral lace pattern, charcoal on black) that run down into her boots.
- Grey ribbed socks pushed down over the tops of charcoal-grey matte leather lace-up combat boots with tan laces, metal eyelets and a chunky lug sole. They are ordinary combat boots, not platforms.

6. She is not symmetrical. The satchel is always on her right hip. Never mirror her.

7. Smooth, graceful hands with short natural nails. No prominent veins or tendons.

8. No weapons unless I ask for them.

9. VIEW. Flat and straight-on like a blueprint: no perspective, no wide-angle lens, the camera level with the middle of what is shown, never looking up or down at her unless I ask.

10. LIGHT. Soft, even studio light from the front. No dramatic shadows, no coloured light, no glow, no sparkles and no magic unless I ask.

11. BACKGROUND. One flat dark plum colour, the same as the style guides (#3B2F43), and nothing else: no floor, no ground shadow, no text, numbers, labels, borders or grid.

12. Everything I ask for is completely inside the frame with clear space on every side. Nothing is cut off and nothing overlaps.

13. When an image has more than one painting of her, they are all the same size, with their feet on the same line.

"Standing pose" means: standing straight, feet a little apart, toes forward, arms straight and held about 35 degrees away from her sides, hands open and relaxed with fingers slightly apart, head level, calm face with lips closed, eyes open, looking straight ahead. Her hair, her sleeves and everything that hangs from her belts hang still.

Reply "ready" and wait for my first request.
```

## Set A: Whole figure, full outfit (round 1)

Her proportions and how the costume is laid out. Start with A1 and stay on it until you like her.

**A1: Front: the master** (tall). Body proportions and costume layout. Every later image gets matched to this one.
```
Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly in front. She is as large as she can be while the top of her hair and the soles of her boots stay inside the image with a little clear space. The satchel on her right hip is on the left side of the image.
```

**A2: Back** (tall). The back of the corset, the bun, and the gear behind her hips.
```
Tall image, portrait 2:3. One painting of her in the standing pose, in her full outfit, seen from directly behind, at the same size in the frame as the master painting. Show clearly: how her hair is gathered into the bun, the knot and two short tails of the headband, the black lacing up the back of the corset, the lace sleeves from behind, both belts, the satchel on her right hip (on the right side of this image) and the small pouch behind her left hip.
```

**A3: Both sides** (wide). Her depth: bust, waist, hips, and how far the satchel stands out.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, in exact side view, at exactly the same size. Left: she faces the left edge of the image, so we see her left side, with the small pouch. Right: she faces the right edge of the image, so we see her right side, with the satchel and the teal crystals. These are the two different sides of her, not one painting mirrored.
```

**A4: Three-quarter views** (wide). How the corset and belts wrap round her.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, in her full outfit, at exactly the same size. Left: turned 45 degrees, halfway between a front view and a view of her facing the right edge of the image. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the right edge.
```

**A5: Arms straight out, front and back** (wide). The lace sleeves in full, and her sides from armpit to hip.
```
Wide image, landscape 3:2. Two paintings of her side by side, in her full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, palms down, fingers together. Left: from directly in front. Right: from directly behind. Show how the lace sleeves hang from her arms, and her whole side from armpit to hip.
```

**A6: Arms straight out, both sides** (wide). Her hips with nothing in front of them: belts, satchel, pouch, charms.
```
Wide image, landscape 3:2. Two paintings of her side by side, in her full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, in exact side view. Left: she faces the left edge of the image. Right: she faces the right edge of the image. With her arms out of the way, show her whole side clearly from armpit to boot: the side of the corset, the belts, the satchel on her right hip, the pouch behind her left hip, and everything that hangs from the belts.
```

## Set B: Layers off (round 1)

What the belts and jewellery hide. I build this layer first and check it before anything goes on top.

**B1: No belts, no jewellery: front and back** (wide). The whole corset, her waist and hips, and where the shorts end.
```
Wide image, landscape 3:2. Two paintings of her side by side in the standing pose, at exactly the same size. Take off these things only: both belts, the satchel, the pouch, everything that hangs from the belts, all four necklaces, the bracelets and the rings. Keep everything else exactly the same: headband, glasses, earrings, black lace top and sleeves, blue corset, black shorts, lace leggings, socks and boots. Left: from directly in front. Right: from directly behind. Show the whole corset down to its pointed bottom edge, and where the shorts end on the leggings.
```

**B2: No belts, no jewellery: both sides** (wide). Her body in profile with nothing in the way.
```
Wide image, landscape 3:2. Two paintings of her side by side at exactly the same size, without the belts, satchel, pouch, hanging charms, necklaces, bracelets or rings, in exact side view, standing straight with both arms held straight out to the sides at shoulder height so they do not hide her body. Left: she faces the left edge of the image. Right: she faces the right edge.
```

**B3: Legs** (wide). Leg shape and how the lace pattern runs round the leg.
```
Wide image, landscape 3:2. Three paintings side by side of her from the waist down only, at the same size: black shorts, lace leggings, socks and boots, with no belts, satchel, pouch or hanging charms. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind.
```

## Set C: Head, face, hair and glasses (round 1)

The face is what you look at first, so this is the biggest set. Most are without her glasses, because the glasses will be a real 3D object and must not be painted onto her skin.

**C1: Face from the front, no glasses** (square). The face that gets painted onto the model. Stay on this one until it is her.
```
Square image. One very large close-up painting of her face from directly in front, WITHOUT her glasses. It shows from the top of the headband to just under her chin, with both ears inside the frame. Calm, relaxed face, lips closed, eyes open and looking straight at the viewer, head perfectly level, not tilted and not turned. Even light with no shadows across her face. Painted as realistically as the Jester face style guide: real skin with pores and fine lines.
```

**C2: The same face with glasses** (square). Where the glasses sit against her eyes, and how tinted the lenses are.
```
Square image. Exactly the same close-up as the last image: the same face, the same framing, the same calm expression, head level. This time she is wearing her round wire glasses. The lenses are clear with only a faint blue-lilac tint, with no glare and no reflections, so both eyes are fully visible through them.
```

**C3: Front, three-quarter and profile, no glasses** (wide). The shape of her head. I measure the profile to the millimetre.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, WITHOUT her glasses, each showing from the top of her bun down to her collarbones. Left: from directly in front. Middle: turned 45 degrees toward the right edge of the image. Right: exact side view, a true profile, facing the right edge. Calm face, lips closed, eyes open, head level. In the profile her whole ear, the bun and the knot of the headband are visible.
```

**C4: The same three views with glasses** (wide). How the glasses sit on her nose and run back over her ears.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, each showing from the top of her bun down to her collarbones: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. She wears her glasses. Show clearly how the glasses sit on her nose, how far the lenses stand from her eyes, and how the arms of the glasses run back over her ears and under her hair.
```

**C5: Other side and the back of her head** (wide). Her hair: the bun, the loose strands, the headband knot.
```
Wide image, landscape 3:2. Three large paintings of her head and shoulders side by side at exactly the same size, wearing her glasses, each showing from the top of her bun down to her collarbones. Left: a true profile facing the LEFT edge of the image. Middle: from directly behind. Right: turned 45 degrees seen from behind, halfway between a back view and a view of her facing the left edge. Show how her hair is pulled up into the bun, the loose strands at her neck and temples, and how the headband is knotted, with its two short tails.
```

**C6: Face from above** (square). Checking the brow, cheeks and nose from a high camera.
```
Square image. One large close-up painting of her head WITHOUT her glasses, with the camera above her and in front of her, looking down at her face at about 45 degrees. We see the top of the headband and the gem, her forehead, the tops of her cheeks and the bridge of her nose. Her eyes look down. Calm face, lips closed.
```

**C7: Face from below** (square). Under the jaw and chin, which no other painting shows.
```
Square image. One large close-up painting of her head WITHOUT her glasses, with the camera below her and in front of her, looking up at her face at about 45 degrees. We see under her chin and jaw, her nostrils and the underside of her brow. Her eyes look straight ahead. Calm face, lips closed.
```

**C8: Top of her head** (square). How the hair sweeps back into the bun.
```
Square image. One large painting of the top of her head seen from directly above, looking straight down, with her face toward the bottom of the image. Show the headband going all the way round, the gem at the front, how the hair is swept back from the band into the bun, the bun itself, and the loose strands. The tops of her shoulders are just visible.
```

**C9: Three-quarter close-up, no glasses** (square). The cheek, ear and jawline up close.
```
Square image. One very large close-up painting of her face WITHOUT her glasses, turned 45 degrees toward the right edge of the image, from the top of the headband to under her chin, with her whole near ear in the frame. Calm face, lips closed, eyes looking the way her head is turned.
```

**C10: Expressions** (wide). Blinking, her smile, aiming and effort.
```
Wide image, landscape 3:2. Six large paintings of her face from directly in front, in two rows of three, WITHOUT her glasses, each from the headband to her chin. Her head is in exactly the same position and at the same size in all six; only her expression changes. Top row, left to right: calm with eyes open; her usual warm closed-lip smile; eyes half closed. Bottom row, left to right: eyes fully closed and calm; narrowed eyes and a level brow, concentrating as she aims; brows drawn down and teeth set with effort, as if swinging a sword.
```

**C11: Mouths for talking** (wide). Her mouth when she speaks and laughs.
```
Wide image, landscape 3:2. Six large paintings of her face from directly in front, in two rows of three, WITHOUT her glasses, each from the headband to her chin. Her head is in exactly the same position and at the same size in all six, and her eyes stay open and calm; only her mouth changes. Top row, left to right: lips closed; lips slightly parted; mouth open in a round "oh". Bottom row, left to right: mouth open wide in an "ah"; a wide smile showing her teeth; laughing with her mouth open.
```

**C12: The glasses alone** (wide). Building the glasses as their own object.
```
Wide image, landscape 3:2. Only her glasses, with no face, painted large four times in a row: from directly in front; from the side; from above; and in three-quarter view. Round lenses, thin dark wire frames, a faint blue-lilac tint in the lenses, small nose pads, and thin straight arms with curved ear tips.
```

## Set D: Hands (round 1)

Attach S3 (the Jester's hands) with D1 and D2 so the framing matches. The hands are bare here because rings and bracelets get built as real objects.

**D1: Left hand, bare** (square). The shape of her hand and the skin painted onto it. Attach: S3.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of the Ranger's LEFT hand and forearm side by side, bare, with no rings and no bracelets, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons.
```

**D2: Right hand, bare** (square). Her right hand, so nothing has to be mirrored. Attach: S3.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of the Ranger's RIGHT hand and forearm side by side, bare, with no rings and no bracelets, pointing straight up, fingers straight and slightly apart, thumb held out a little. Left: the back of the hand. Right: the palm. A smooth, graceful hand with short natural nails and no prominent veins or tendons.
```

**D3: Hands with their jewellery** (wide). Which ring is on which finger, and which bracelet on which wrist.
```
Wide image, landscape 3:2. Two large paintings side by side: the backs of both of her hands and forearms, pointing straight up, fingers slightly apart, wearing all of her hand and wrist jewellery. Left: her left hand, with the wide bronze cuff bracelet. Right: her right hand, with the thin gold bangles, the teal bead bracelet and the thin silver rings. Show clearly which finger each ring is on.
```

**D4: Right hand: four poses** (wide). Finger poses for drawing the bow, her spell gesture and pushing the glass.
```
Wide image, landscape 3:2. Four large paintings of her bare RIGHT hand and wrist in a row, each in a different pose: (1) three fingers hooked as if drawing a bowstring, thumb tucked in; (2) the first and second fingers raised straight and together, the others folded, as if touching her temple; (3) an open palm pushed forward with the fingers together and upright, as if pressing on a pane of glass, seen from the side; (4) completely relaxed, hanging at her side.
```

## Set E: Boots (round 1)

Eight views of one boot, the same eight the Jester's boots were built from. Attach S4 (the Jester's boot) with E1 so the framing matches.

**E1: Outer side** (square). The boot's outline: sole depth, heel, shaft height. Everything is measured from this one. Attach: S4.
```
Square image. I am attaching a boot style guide: copy its framing and realism only, not its boot. One large painting of her right combat boot with its sock: charcoal-grey matte leather, laced up the front with tan laces through eight pairs of metal eyelets, a rounded toe with a stitched toe cap, a padded collar, a chunky black rubber lug sole with a low block heel, and a grey ribbed sock pushed down over the top of the boot. The boot is alone, with no leg above the sock, standing flat. Seen in exact side view from the outside, toe pointing to the right edge of the image.
```

**E2: Inner side** (square). The arch side, which differs from the outside.
```
Square image. The same boot as the last image: her right combat boot with its grey sock, alone, standing flat, at the same size. Seen in exact side view from the inside, toe pointing to the left edge of the image.
```

**E3: Front pair** (square). Width, toe shape and lacing from the front.
```
Square image. Both of her combat boots with their grey socks, as a pair, alone, standing side by side a little apart. Seen from directly in front, toes toward the viewer.
```

**E4: Back** (square). The heel, back seam and sock from behind.
```
Square image. Her right combat boot with its grey sock, alone, standing flat. Seen from directly behind: the heel block, the back seam, the pull loop and the sock.
```

**E5: Three-quarter** (square). How the shapes join up in the round.
```
Square image. Her right combat boot with its grey sock, alone, standing flat. Seen in three-quarter view from the front and the outside, from slightly above, the way a boot is shown in a shop.
```

**E6: From above** (square). The plan of the foot, the tongue and the opening.
```
Square image. Her right combat boot with its grey sock, alone. Seen from directly above, looking straight down, toe pointing to the top of the image: the laces, the tongue, and the opening with the sock.
```

**E7: The sole** (square). The tread pattern.
```
Square image. The sole of her right combat boot, alone. Seen from directly below, flat, toe pointing to the top of the image: the whole lug tread pattern and the heel block.
```

**E8: Laces and sock, close** (square). Eyelets, the bow, the collar and the sock rib.
```
Square image. A very large close-up of the top front of her right combat boot: the upper eyelets, the tan laces tied in a bow, the tongue, the padded collar, and the grey ribbed sock pushed down over it.
```

## Set F: Details, flat pieces and fabrics (round 2)

Everything small, and every cloth laid flat so it can be wrapped onto the model. F5 and F11 use a light grey background on purpose, so the holes in the lace show.

**F1: Necklaces and earrings** (wide). Four necklaces as four real strands, at their true lengths.
```
Wide image, landscape 3:2. Her jewellery taken off and laid out flat, each piece separate and painted large, seen from straight above, with clear space between them: (1) the short fine silver chain with the small teal drop; (2) the long strand of blue and turquoise beads; (3) the longer strand of pearl and pale pink beads; (4) the long chain with the small ornate gold pendant; (5) the pair of long gold drop earrings with small blue beads. Each necklace is laid in an open U shape so its whole length and its clasp can be seen.
```

**F2: Headband and gem** (wide). The band's embroidery from end to end, and the gem as a solid object.
```
Wide image, landscape 3:2. Three paintings. (1) Across the top: her blue headband untied and laid completely flat at its full length, seen from straight above, showing the royal-blue cloth and its small gold and orange embroidery from end to end. (2) Bottom left: a very large close-up of the oval blue gemstone in its ornate gold setting with the tiny gold drop under it, seen from directly in front. (3) Bottom right: the same gem and setting seen from the side, showing how far it stands out from the band.
```

**F3: Corset laid flat** (wide). The corset's pattern pieces, front and back.
```
Wide image, landscape 3:2. Her blue corset taken off and laid completely flat like a sewing pattern, seen from straight above, painted twice at the same size. Left: the front, outside up, with its scooped neckline, boning seams, pointed bottom edge and both shoulder straps laid straight up. Right: the back, outside up, with its black lacing. No folds, no wrinkles and no body inside it.
```

**F4: Corset close-ups** (wide). The brocade, the strap fittings and the lacing.
```
Wide image, landscape 3:2. Four large close-up paintings in a row, each seen straight on: (1) the centre front of the corset, showing the blue brocade, the small gold and orange woven flowers and two boning seams; (2) one shoulder strap where it joins the corset, with its small buckle and the two black wrought-iron scroll curls; (3) the black lacing at the back of the corset; (4) the pointed bottom edge of the corset at the centre front, with its edging.
```

**F5: Lace top and sleeve laid flat** (wide). The see-through lace of her sleeves.
```
Wide image, landscape 3:2. For this image only, the background is flat light grey (#D0D0D0), so the holes in the lace show. Two paintings, seen from straight above, laid completely flat with no folds. Left: her black off-the-shoulder top taken off and laid flat, with its scalloped lace edge and both lace sleeves spread out to the sides. Right: one lace sleeve alone, opened out flat as a single piece of lace, painted large, showing the whole lace pattern and its ragged pointed hem.
```

**F6: Belts, satchel and pouch** (wide). The belt gear as separate objects.
```
Wide image, landscape 3:2. Her belt gear taken off, each piece separate and painted large with clear space between them. (1) Across the top: both brown leather belts laid out straight at full length, showing the silver studs, the silver ring buckle and the holes. Below, in a row: (2) the black leather satchel from the front, with its flap and two buckled straps; (3) the satchel from the side, showing how deep it is and its belt loop; (4) the satchel from behind; (5) the small black pouch from the front.
```

**F7: Everything that hangs from the belts** (wide). The crystals and bead strings. On the model these swing as real chains.
```
Wide image, landscape 3:2. Everything that hangs from her belts, taken off and hung straight down side by side, each painted large with clear space between: the bunch of teal-blue crystal drops in gold caps on their chains; each string of amber and gold beads with the drop at its end; and any other charm that hangs from her belts in the Ranger painting. Show the ring or clip at the top of each one, where it fastens to the belt.
```

**F8: Bracelets and rings** (wide). Wrist and finger jewellery as separate objects.
```
Wide image, landscape 3:2. Her wrist and finger jewellery taken off, each piece separate and painted large, seen straight on: the wide bronze cuff bracelet from the front and from the side; the thin gold bangles; the teal bead bracelet; and each thin silver ring.
```

**F9: Material squares** (wide). Flat samples I turn into the model's surfaces.
```
Wide image, landscape 3:2. Eight flat square samples of her materials in two rows of four, each square filled edge to edge with the material, perfectly flat, with no folds, no seams and even light. Top row, left to right: the blue corset brocade with its small gold and orange flowers; the royal-blue headband cloth with its embroidery; the plain black cloth of her top; the black cloth of her shorts. Bottom row, left to right: the charcoal-grey boot leather; the brown belt leather; the black satchel leather; the grey ribbed sock knit.
```

**F10: Leggings lace, one big square** (square). The pattern that covers both legs, so it gets a whole image.
```
Square image. One large flat square filled edge to edge with the lace pattern of her leggings: a floral lace, charcoal grey on black, seen straight on, perfectly flat, with even light and no folds. The flowers are a few centimetres across, as they would be on her thigh, and the pattern repeats evenly so the square could be tiled.
```

**F11: Sleeve lace, one big square** (square). The lace the light shines through.
```
Square image. For this image only, the background is flat light grey (#D0D0D0). One large flat square filled edge to edge with the sheer black lace of her sleeves, seen straight on, perfectly flat, so the light grey shows through every hole in the lace. Even light, no folds. The pattern repeats evenly so the square could be tiled.
```

**F12: Corset brocade, one big square** (square). The blue she is known by.
```
Square image. One large flat square filled edge to edge with the royal-blue brocade of her corset, with its small gold and orange woven flowers, seen straight on, perfectly flat, with even light and no folds or seams. The pattern repeats evenly so the square could be tiled.
```

## Set G: Weapons (round 2)

Your lore gives her a bow, a sword and knives. Only the bow has ever been drawn, so the sword and knives here are my designs, made to match the bow. Change any wording you like before you run them.

**G1: The bow, open** (wide). Her bow as a solid object. In the flipbook it is all glow.
```
Wide image, landscape 3:2. Her bow alone, with no figure, painted in the same realistic style, large, twice. Her bow is a slender recurve bow of pale silver-white metal called moonsteel, about 130 cm tall when open. Its two limbs are open filigree, like silver vines with small blade-shaped leaves, curling forward at the tips. Above and below the grip there is a crescent moon holding a small round blue gem, like the gem on her headband. The grip is wrapped in dark blue leather. It has no ordinary string: its string is a thin line of pale blue-white light. Top: the bow lying on its side, seen flat so its whole recurve shape shows, with its string of light. Bottom: the same bow seen edge-on, as the target would see it, showing how thin it is.
```

**G2: The bow, folding** (wide). How it opens when she pulls it from behind her back.
```
Wide image, landscape 3:2. The same bow as the last image, with no figure, painted three times at the same scale to show how it folds. It has a hinge at each end of the grip. Left: folded flat, both limbs swung in to lie side by side along the grip, with no string, a compact flat bundle about 55 cm long. Middle: half open, the limbs swinging outward. Right: fully open and locked, with the string of light just appearing between the tips.
```

**G3: The grip, close** (square). The crescents, gems and hinges.
```
Square image. A very large close-up of the middle of her bow, seen flat from the side: the grip wrapped in dark blue leather, the crescent moon above it and the crescent moon below it, each holding a small round blue gem, and the two hinges.
```

**G4: The sword** (wide). New design. A court sword for a princess.
```
Wide image, landscape 3:2. A new weapon for her, with no figure, painted in the same realistic style and made to match her bow: a slim, straight, one-handed sword of pale silver-white moonsteel, about 75 cm long overall. A narrow double-edged blade with a fine vine pattern engraved along its centre. A small crossguard shaped like two crescent moons curving toward the blade. A grip wrapped in dark blue leather with silver wire. An oval blue gemstone in a gold setting as the pommel, matching the gem on her headband. Three paintings: (1) across the top, the whole sword seen flat, pointing right; (2) bottom left, a large close-up of the hilt; (3) bottom right, its scabbard alone: black leather with a silver mouth and tip, and two small rings for hanging it from a belt.
```

**G5: The knives** (wide). New design. A pair, for throwing.
```
Wide image, landscape 3:2. New weapons for her, with no figure, painted in the same realistic style and made to match her bow: a pair of identical throwing knives of pale silver-white moonsteel, each about 20 cm long and made from one piece of metal. A narrow leaf-shaped blade, a small crescent-moon hole cut through the handle, and the handle bound in dark blue cord. Four paintings in a row: (1) one knife seen flat; (2) the same knife seen edge-on; (3) both knives side by side; (4) both knives in their black leather double sheath, which holds them side by side and has two loops so it sits flat on a belt.
```

**G6: Where she wears them** (wide). Her outline when armed, and where each hand goes to draw. Attach: your kept G2, G4 and G5.
```
Wide image, landscape 3:2. I am attaching the paintings of her folded bow, her sword and her knives. Three paintings of her side by side in the standing pose, in her full outfit, at exactly the same size, now carrying her weapons the way she wears them when they are put away. The folded bow lies flat and upright against the middle of the back of her corset. The sword hangs in its scabbard at her LEFT hip from the lower belt, its tip pointing down and back. The double knife sheath sits level across the back of her belt at the small of her back, below the folded bow. Left: from directly behind. Middle: exact side view facing the left edge of the image, so we see the sword on her left hip. Right: from directly in front.
```

**G7: Her hands on the weapons** (wide). Finger positions for each grip. Attach: your kept G1, G4 and G5.
```
Wide image, landscape 3:2. I am attaching the paintings of her bow, her sword and her knives. Four large close-up paintings in a row of her hands holding them: (1) her left hand closed round the grip of the open bow, seen from the side; (2) her right hand drawing the string of light with three fingers, the string resting on her fingertips; (3) her right hand holding the sword by its grip; (4) her right hand holding one throwing knife by the blade between thumb and fingers, ready to throw.
```

## Set H: Key poses (round 3)

Her moves, painted at their strongest moment. The first six come straight from the flipbook; the last three are new. Magic light is allowed in these. She always attacks toward the right edge of the image. Where a pose uses a weapon, attach your kept painting of it from set G.

**H1: Taking out the bow** (wide). Flipbook: Moonsteel Draw, frames 2 and 3. Attach: your kept G1 and G2.
```
Wide image, landscape 3:2. I am attaching the paintings of her bow, open and folded. Key poses, with magic light allowed. Two paintings of her whole figure side by side at the same size, in her full outfit, as in the top row of her sprite sheet. Left: standing turned slightly toward the right edge of the image, her right hand reaching behind her back at waist height to pull the folded bow free. Right: the bow brought round in front of her in her left hand, its limbs swinging open, with small sparks of pale blue light where the string will be.
```

**H2: Full draw** (tall). Flipbook: Moonsteel Draw, frame 4. Her signature pose. Attach: your kept G1.
```
Tall image, portrait 2:3. I am attaching the painting of her bow. Key pose, with magic light allowed. One painting of her whole figure in her full outfit at full draw, as in her sprite sheet: feet wide apart, her body facing the viewer and turned slightly toward the right edge of the image, her left arm straight out toward the right edge holding the open bow upright, her right hand drawing the string of light back to her cheek with her right elbow high. An arrow of pale blue-white light lies on the bow, pointing at the right edge. Her eyes are on the target and her face is calm. The lace sleeves hang from her raised arms.
```

**H3: Full draw from two other sides** (wide). The same pose in the round, so it holds up from any camera. Attach: your kept H2.
```
Wide image, landscape 3:2. I am attaching the full-draw painting. Two paintings side by side, at the same size, of exactly that pose seen from two other sides. Left: seen from behind her, so we see her back, the bun and the lacing of the corset, and the arrow points toward the left edge of the image. Right: seen from where the target stands, looking straight back along the arrow at her: the bow is upright and edge-on in front of her, the arrowhead points at the viewer, and her face looks at us past her left arm.
```

**H4: Release and follow-through** (wide). Flipbook: Moonsteel Draw, frames 5 to 7. Attach: your kept G1.
```
Wide image, landscape 3:2. I am attaching the painting of her bow. Key poses, with magic light allowed. Two paintings of her whole figure side by side at the same size, in her full outfit, as in her sprite sheet. Left: the moment after she lets go: her right hand has sprung back past her ear with the fingers open, the bow is still held out in her left hand, and the arrow of light is just leaving toward the right edge with a thin bright trail. Right: the follow-through: the bow dips forward and down in her left hand, her right hand lowers, the string of light is fading, and she watches the arrow go.
```

**H5: Silver Arrow** (tall). Flipbook: Silver Arrow. The same shot with her magic in it. Attach: your kept G1.
```
Tall image, portrait 2:3. I am attaching the painting of her bow. Key pose, with magic light allowed. One painting of her whole figure in her full outfit at full draw toward the right edge of the image, as in the middle row of her sprite sheet. This time she has poured her magic into the shot: the arrow is a blazing white point drawn out into a long thin line of light, the gem on her headband glows pale blue, a faint light runs along the bowstring and down both her forearms, and small sparks hang still in the air around the bow. Her lenses catch the light. Her face is calm and certain.
```

**H6: Silverglass** (tall). Flipbook: Silverglass Ward, frame 5.
```
Tall image, portrait 2:3. Key pose, with magic light allowed. One painting of her whole figure in her full outfit, as in the bottom row of her sprite sheet: feet apart, her body turned slightly toward the right edge of the image, her left palm pushed flat out toward the right edge, her right hand raised behind it. In front of her palm stands a round pane of pale silver-blue glass almost as tall as she is, made of thin crescent-shaped facets joined like a window, with a crescent moon at its centre. Small loose shards of the same glass float beside it.
```

**H7: Sword: guard and cut** (wide). New. Your lore: very good with a sword. Attach: your kept G4.
```
Wide image, landscape 3:2. I am attaching the painting of her sword. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, holding her sword in her right hand, her body turned toward the right edge of the image. Left: on guard like a trained fencer: right foot forward, knees bent, back straight, the sword held out in front of her at chest height with its point toward the right edge, her left hand held back for balance. Right: the end of a full cut: a long step forward onto her right foot, her right arm stretched out with the sword swept across toward the right edge, her left arm thrown back, her hair and lace sleeves swinging with the turn.
```

**H8: Knives: wind-up and throw** (wide). New. Your lore: very good with knives. Attach: your kept G5.
```
Wide image, landscape 3:2. I am attaching the painting of her knives. Key poses. Two paintings of her whole figure side by side at the same size, in her full outfit, throwing her knives toward the right edge of the image. Left: the wind-up: her weight on her back foot, her right hand raised beside her ear holding one knife by the blade, her left hand low in front of her holding the second knife ready. Right: the release: her weight thrown onto her front foot, her right arm snapped straight out toward the right edge with the fingers open, the knife in the air just beyond her hand, her left hand already bringing the second knife up.
```

**H9: The gem: her magic on herself** (tall). New. Your lore: her magic strengthens her own attacks.
```
Tall image, portrait 2:3. Key pose, with magic light allowed. One painting of her whole figure in her full outfit, standing straight and still, feet together, facing the viewer. The first two fingers of her right hand touch the gem on her headband. The gem is lit pale blue-white. Thin lines of the same light run from it down her neck and along both arms to her hands, and the lace of her sleeves glows faintly where the light passes under it. Her lenses catch the light. Her eyes are closed and she is smiling slightly. A few small sparks hang perfectly still in the air around her, as if time has stopped for one breath.
```

## Set I: Magic alone (round 3)

Her light with nothing else in the picture, so I can layer it into the spells. For this set the background rule changes: pure black, no figure.

**I1: Arrow of light** (wide). Every bow shot.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure, no hands and no bow. One arrow made of pale blue-white light, lying level and pointing right, filling most of the width of the image: a thin straight shaft of light, a bright broad arrowhead and a soft fading trail behind it, like the arrows in her sprite sheet, painted as glowing light.
```

**I2: The glass pane** (square). Silverglass.
```
Square image. For this image only, the background is pure black (#000000), with no figure and no hands. The round pane of pale silver-blue glass from her sprite sheet, seen flat from directly in front as a perfect circle filling most of the image: thin crescent-shaped facets joined like a window, with a crescent moon at the centre, glowing softly along its edges.
```

**I3: Glass shards** (square). Silverglass breaking and riding with her attacks.
```
Square image. For this image only, the background is pure black (#000000), with no figure. Twelve separate shards of the same pale silver-blue glass in a grid of four rows of three, well apart, each a different shape: thin crescents, long diamonds and small slivers, each glowing softly along its edges.
```

**I4: Sparks** (square). The still sparks around every spell.
```
Square image. For this image only, the background is pure black (#000000), with no figure. Twelve separate sparks of pale blue-white light in a grid of four rows of three, well apart, in different sizes from tiny to large: round points, four-pointed stars and small crescents, like the ones around her bow in the sprite sheet.
```

**I5: Sword trail** (wide). The arc her blade leaves.
```
Wide image, landscape 3:2. For this image only, the background is pure black (#000000), with no figure and no sword. One wide crescent-shaped sweep of pale silver-blue light, like the trail left by a fast sword cut, bright and sharp along its outer edge and fading to nothing on the inside.
```

**I6: Gem light** (square). The headband gem when she casts.
```
Square image. For this image only, the background is pure black (#000000), with no figure. Four separate glows of pale blue-white light in a two by two grid, well apart, like the light of her headband gem: a soft round glow; a bright star-shaped flare with four long rays; a thin ring of light; and a narrow straight beam.
```

## Checklist before keeping an image

- She matches the master: the same face, the same build, the same colours.
- She has not been made taller, thinner or younger than her painting.
- The satchel is on her right hip: the left side of a front view, the right side of a back view.
- Glasses on, unless the prompt said without. No glare over her eyes.
- The gem sits in the middle of her forehead and the bun is high at the back.
- Nothing is cut off: the top of the bun, her fingertips, the soles of her boots.
- Flat plum background with no floor shadow. (Light grey for F5 and F11, black for set I.)
- No text, numbers or labels anywhere.
- Real cloth, leather and skin: not a cartoon and not pixel art.
- When there is more than one of her, they are the same size and stand on one line.
- Smooth hands.

## What Claude plans to animate (proposal)

Chris's lore: weakest magic, not the weakest fighter; a princess; very good with a bow, a sword and knives; her magic strengthens her own attacks.

| Move | Where it comes from | What it looks like |
|---|---|---|
| Moonsteel Draw | Flipbook. Your lore: her regular attack is her strength. | She pulls the folded bow from behind her back, it swings open, a string of light catches, she draws to her cheek and looses. |
| Silver Arrow | Flipbook. Your lore: her magic strengthens her own attacks. | The same shot with her magic poured in. The arrow burns white and the gem on her headband lights. |
| Silverglass | Flipbook, changed. Needs your yes. | In the flipbook she sends the glass to an ally. Your lore now keeps her magic for herself, so instead she raises the pane and shoots through it. It breaks into crescents that ride with her next few attacks. |
| The gem | My addition. | Two fingers to the headband gem. Light runs down her arms, and for one breath everything around her hangs still. This is how she powers up before a big attack. |
| Sword | Your lore. New. | A fencer's guard, two cuts and a thrust. Upright and trained, the way a princess would have been taught. |
| Knives | Your lore. New. | Two thrown in one motion from the back of her belt. |
| Finishing run | My addition, from the lore notes: after the Jester's big spell, her companions finish what is left. | Knives, then sword, then an arrow at arm's length, in one unbroken run. |
| Walk, run, kneel, sit, jump, talk, wave, bow | Carried over from the Jester. | Adjusted for her build and given her posture. |

### Claude's additions, not yet confirmed by Chris

- **The bow is real metal and folds. Its string and arrows are light.** It keeps her outline clean, with no quiver, as in every picture of her. It also fits "weakest magic, strongest attack": her magic lives only inside her weapons.
- **"The moment."** You named the four levels as the moment, nature, chaos and infinity. I have taken the moment to be hers, and I'd show it literally: when she uses magic, the sparks and her sleeves hang still for one breath, then everything lets go at once.
- **She fights like someone taught at court.** Straight back, a fencer's feet, a small salute with the blade. It is the only place the princess shows.
- **Her glasses catch the light when she casts.** A small tell that her magic is on.

### Where the pictures of her disagree, and what the prompts chose

- **Satchel on her right hip.** Her character sheet and all 24 sprites have it there. The seated painting shows it on her left.
- **Black shorts over lace leggings.** That is how the sheet and sprites read. The seated painting looks like lace all the way up with a black wrap at the hip.
- **Charcoal boots with tan laces.** From the seated painting. The sheet paints them a lighter grey.
- **Long gold earrings with blue beads.** The painting and the sprites disagree on what hangs beside her face. It could also be the tails of the headband.
- **Four necklaces, a bronze cuff on her left wrist, bangles and rings on her right.** That is my count from the seated painting, where they are small. Correct me if the real outfit differs.
- **Her own face, not the Jester's.** All four began as the same person, but each painting gives her a different face, and you wanted the Jester to match her own art.
- **The sword and knives are new designs, and so is where she carries them.** Bow on her back, sword on her left hip, knives across the back of her belt. Set G is the place to change that.
