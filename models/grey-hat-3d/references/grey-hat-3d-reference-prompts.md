# The Grey Hat: reference paintings for his 3D model

Written November 13, 2026, for Chris to run in ChatGPT. This is the text of the page `Grey_Hat_Reference_Prompts.html`, which also holds the images to attach. Built by `models/grey-hat-3d/references/build_prompts.py` in the `moon-faire` repo.

## What this is for

- Chris, November 13: a non-player character the four witches meet, who "might like join them in a fight or something or just talks to them". He shared one picture of him as the visual reference, asked for him to be described in the same artistic style as the four witches, and for him to have his own folder in the repo.
- **"The Grey Hat" is a working name**, taken from his hat. His name, who he is and what he can do are not set. Nothing here is lore.
- He will be built the way the witches were (`claude/HOW-TO-3d-witch-models.md`, `claude/HOW-TO-3d-witch-faces.md`): from realistic paintings on flat plum, in fixed views.
- 62 prompts in three rounds. Round 1 (sets A to E, 37 images): enough to start building: his body, his face and hair, the hat, his hands and his boots. Round 2 (sets F and G, 16 images): details, flat cloth, and his scroll and dagger. Round 3 (set H, 9 images): how he stands, talks and moves.
- His face set (C1 to C3 and C9) uses what the Ranger's and the Fox's faces taught: the bare face straight on with nothing in the way, six states cut from it, a clean profile, and the in-between angles checked from the start.

## Where it lives

- Repo `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`. Its `README.md` says where he stands.
- The page: https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x
- Kept paintings go in `models/grey-hat-3d/references/chatgpt/` as webp, named by code (`A1.webp`).
- `lore/discussion-notes.md` has a section "The character they meet". This session did not edit it.

## Images to attach

The five starters go into every new chat, in this order. They are in the page and in `Grey_Hat_Reference_Starters.zip`.

- **N1** `N1_grey_hat_picture.jpg`: His picture. The only picture of him so far. His face, hair, hat, clothes and colours.
- **N2** `N2_grey_hat_head_and_chest.jpg`: His head and chest, close. Cut from his picture and enlarged, so the hat, glasses, beard, earring, pearls, shirt and corset can be seen.
- **N3** `N3_grey_hat_belt_legs_boots.jpg`: His belt, legs and boots, close. Cut from his picture and enlarged: the ring belt, pouch, scroll, dagger, torn trousers and boots.
- **S1** `S1_style_jester_standing.jpg`: Style guide: the Jester standing. One of the Jester's finished reference paintings. It shows ChatGPT the pose, the light, the background and how real to paint.
- **S2** `S2_style_jester_face.jpg`: Style guide: the Jester's face. How realistic a face should be.
- **S3** `S3_style_jester_hands.jpg`: Hands guide. Framing for the hand paintings. With D1 and D2 only.
- **S4** `S4_style_jester_boot.jpg`: Boot guide. Framing for the boot paintings. With E1 only.

Where they come from in the `moon-faire` repo:
- N1: `models/grey-hat-3d/references/source/grey_hat_picture.png`, the picture Chris shared. N2 and N3 are cut from it and enlarged two times.
- S1 to S4: branch `claude/jester-3d-model`, `models/jester-3d/references/`: `chatgpt/05_base_front_back`, `chatgpt/08_face_front`, `hands/hands_young_left`, `boots/boot_side_a`. The same four the Ranger's and the Fox's pages use.

## How to run it

1. Start a new ChatGPT chat. Attach the five starter images in order: N1, N2, N3, S1, S2. Paste the standing rules and wait for "ready".
2. Paste A1. Redo it until he looks right. Then send: "This is the master painting of the Grey Hat. Every later image in this chat must match him exactly: the same face, the same beard, the same build, the same clothes and the same colours." A1 decides his face and build, so send it to me before you run the rest if you would like a second look.
3. Go down the list one prompt at a time. One prompt makes one image. If a result breaks a rule, reply "Redo" and say what to fix.
4. Save each keeper under its code: A1.png, C3.png. A second keeper of the same prompt is A1b.png.
5. When the chat gets long and he drifts, start a new one: attach the five starters plus the kept A1 and C1, paste the standing rules, then send: "Images 6 and 7 are finished paintings of the Grey Hat from this set. Match them exactly."
6. Zip each round and send it to me. Round 1 is enough to start building.

## Standing rules

```
I'm attaching five images.

Images 1, 2 and 3 show my character, the Grey Hat, a man the four witches meet in my game Moon Faire:
- his picture, standing in the fair with his hands on his hips,
- a close-up of his head and chest, cut from that picture,
- a close-up of his belt, legs and boots, cut from that picture.
They are his design: his face, hair, hat, body, clothes and colours. His picture is a cartoon lit by a golden sunset. Take his design from it, but not its drawing style, not its big-headed cartoon proportions, not its golden light and not its background.

Images 4 and 5 are finished reference paintings of a different character from the same game, the Jester. They are style guides only.

I need reference paintings of the Grey Hat for a 3D modeller. These rules apply to every image in this chat:

1. STYLE. Paint him the way the Jester style guides are painted: a realistic, highly detailed painting of a real man wearing a real costume, like a studio photograph taken for a 3D character model. Real skin, hair, wool felt, linen, lace, leather, printed cloth and metal. Not a cartoon, not anime, not pixel art, no drawn outlines.

2. Take only these things from the Jester style guides: how realistic the painting is, the pose, the camera, the lighting and the background. Never copy the Jester's face, make-up, body, costume or colours.

3. HIS FACE, from his picture. A grown man with a warm, friendly face, warm tan skin, dark brown eyes and thick dark eyebrows. A short, full, neatly kept dark brown beard and moustache. Keep him the age he is in his picture. Black glasses with thick rectangular frames and clear lenses; he wears them in every image unless I say WITHOUT his glasses. His lips are closed in every image unless I ask, and no teeth show.

4. HIS HAIR. Dark brown, long and wavy, parted near the middle and worn loose. It is tucked behind his ears and falls in waves to just past his shoulders.

5. HIS HAT. A witch's hat of soft, weathered charcoal-grey wool felt. It has a very wide, slightly wavy brim, about 55 cm across, and a tall pointed crown that has slumped: it is creased and folded over partway up, so its tip falls toward HIS LEFT. A plain band of darker grey felt runs round the base of the crown. He wears it in every image unless I say WITHOUT his hat.

6. HIS BODY. A real man of average height with broad shoulders and a solid, sturdy build. Real adult proportions, about seven and a half heads tall. His picture is a cartoon with a large head, large hands and large boots: do not copy those proportions. Do not make him taller, slimmer, more muscular or younger. The corset draws his waist in a little and changes nothing else about his build.

7. HIS COSTUME never changes:
- In his LEFT earlobe, a round black ear plug with a thin silver rim, about 14 mm across. A small silver charm hangs from it, and one black feather about 6 cm long hangs from the charm. His right earlobe has the same black plug with nothing hanging from it.
- A short necklace of round cream pearls at the base of his throat, inside the open collar.
- A loose cream-white linen poet's shirt. It has a wide pointed collar, worn open. The front opening is laced with dark red cord through black eyelets, in four crossings, loosely tied at the bottom with the two cord ends hanging. A deep ruffle of the same linen, edged with cream lace, runs down each side of the lacing, and cream lace edges the collar. The sleeves are very full, gathered at the shoulder, and pushed up so that each ends at the middle of the forearm in a gathered band and a wide ruffle of cream lace.
- Over the shirt, a black leather underbust corset, from the bottom of his ribs to the top of his hips. It is made of vertical panels with stitched boning seams and small steel rivets. Its top edge is straight, and its bottom edge dips to a shallow point at the centre front. Two black leather straps cross the centre front, one above the other, each fastened with a rectangular silver buckle. It laces up the back with black cord.
- Black leather fingerless gloves: every finger and the thumb are cut off at the first knuckle. Over each glove, a wide black leather cuff with small steel studs is buckled round the wrist. A little of his forearm, with dark hair on it, shows between each cuff and the lace ruffle of the sleeve.
- A wide black leather belt on his hips, just under the corset, a little higher on his LEFT hip. It fastens at the centre front with one large silver ring about 7 cm across. A second, shorter black leather strap leaves the ring and drops slantwise to his RIGHT hip.
- On his RIGHT hip: a brown leather belt pouch with a flap and one brass stud. Under the pouch, a rolled parchment scroll about 30 cm long sits in a brown leather loop, slanting, with its front end higher. Two small charms hang from the belt between the ring and the pouch: a silver skull and a gold leaf.
- On his LEFT hip: a dagger in a dark brown leather sheath, hanging straight down along his thigh from a black leather hanger with small brass studs. Only the dagger's plain black grip shows above the sheath.
- Baggy black trousers printed all over with dark red flowers, leaves and curling stems, like a damask. The legs are full and loose, and are tucked into the tops of his boots, where the cloth blouses over a little. The trousers are slashed: long oval holes with rough black edges are torn through the cloth on the front and outer side of each leg. His right leg has five holes, from the middle of the thigh down to the calf. His left leg has six holes in a column, from the hip down to the calf. The back of the trousers has no holes.
- Under the trousers, black fishnet tights with an open diamond net, so every hole shows black fishnet over his skin.
- Heavy black leather boots that reach the middle of the calf: glossy, creased at the ankle, with a round, bulbous toe, a thick black lug sole about 4 cm deep and a low block heel. They have no laces. Three black leather straps wrap the shaft, each fastened with a steel snap stud, and the top of the shaft is turned down in a cuff of the same leather with round steel studs and one pointed tab hanging at each side. The leather is plain black, with no gold on it.

8. He is not symmetrical. The pouch and the scroll are always on his RIGHT hip, the dagger is always on his LEFT hip, the feather hangs from his LEFT ear only, and the tip of the hat falls to his LEFT. Never mirror him.

9. A man's hands: broad palms, short clean natural nails, a little dark hair on the backs of his forearms. No prominent veins or tendons.

10. The dagger stays in its sheath and the scroll stays rolled at his hip unless I ask. No magic unless I ask.

11. VIEW. Flat and straight-on like a blueprint: no perspective, no wide-angle lens, the camera level with the middle of what is shown, never looking up or down at him unless I ask.

12. LIGHT. Soft, even studio light from the front. No dramatic shadows, no golden or coloured light, no glow and no sparkles. Light his face evenly under the brim of the hat: the brim must never put his eyes in shadow.

13. BACKGROUND. One flat dark plum colour, the same as the style guides (#3B2F43), and nothing else: no floor, no ground shadow, no text, numbers, labels, borders or grid.

14. Everything I ask for is completely inside the frame with clear space on every side. Nothing is cut off and nothing overlaps.

15. When an image has more than one painting of him, they are all the same size, with their feet on the same line.

"Standing pose" means: standing straight, feet a little apart, toes forward, arms straight and held about 35 degrees away from his sides, hands open and relaxed with fingers slightly apart, head level, a calm, friendly face with a slight closed-lip smile, eyes open, looking straight ahead. His hands are NOT on his hips. His hair, the feather, the lace and everything on his belt hang still.

Reply "ready" and wait for my first request.
```

## Set A: Whole figure, full outfit (round 1)

His proportions and how the costume is laid out. Start with A1 and stay on it until you like him.

**A1: Front: the master** (tall). Body proportions and costume layout. Every later image gets matched to this one.
```
Tall image, portrait 2:3. One painting of him in the standing pose, in his full outfit, seen from directly in front. He is as large as he can be while the tip of his hat, the whole brim and the soles of his boots stay inside the image with a little clear space. The pouch and the scroll on his right hip are on the left side of the image, the dagger on his left hip is on the right side of the image, and the tip of the hat falls toward the right side of the image.
```

**A2: Back** (tall). His back has never been drawn: the hair, the back of the corset, the belt and the backs of the trousers get decided here.
```
Tall image, portrait 2:3. One painting of him in the standing pose, in his full outfit, seen from directly behind, at the same size in the frame as the master painting. Show clearly: the back of the hat and its brim, his long hair hanging over the back of the shirt collar, the shirt across his shoulders, the black lacing up the back of the corset, the belt going round, the pouch and the scroll on his right hip (on the right side of this image), the dagger on his left hip (on the left side of this image), the backs of the baggy trousers, which have no holes, and the backs of the boots.
```

**A3: Both sides** (wide). His depth: chest, stomach and seat, how far the hat brim reaches, and how far the pouch and scroll stand out.
```
Wide image, landscape 3:2. Two paintings of him side by side in the standing pose, in his full outfit, in exact side view, at exactly the same size. Left: he faces the left edge of the image, so we see his left side, with the dagger and the feather earring. Right: he faces the right edge of the image, so we see his right side, with the pouch and the scroll. These are the two different sides of him, not one painting mirrored.
```

**A4: Three-quarter views** (wide). How the corset, the belt and the second strap wrap round him.
```
Wide image, landscape 3:2. Two paintings of him side by side in the standing pose, in his full outfit, at exactly the same size. Left: turned 45 degrees, halfway between a front view and a view of him facing the right edge of the image. Right: turned 45 degrees seen from behind, halfway between a back view and a view of him facing the right edge.
```

**A5: Arms straight out, front and back** (wide). The big sleeves in full, and his sides from armpit to hip.
```
Wide image, landscape 3:2. Two paintings of him side by side, in his full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, palms down, fingers together. Left: from directly in front. Right: from directly behind. Show the whole of each full sleeve with its gathered band and lace ruffle, how the cloth hangs under each arm, and his whole side from armpit to hip.
```

**A6: Arms straight out, both sides** (wide). His hips with nothing in front of them: belt, pouch, scroll, charms and dagger.
```
Wide image, landscape 3:2. Two paintings of him side by side, in his full outfit, at exactly the same size, standing straight with both arms held straight out to the sides at shoulder height, in exact side view. Left: he faces the left edge of the image. Right: he faces the right edge of the image. With his arms out of the way, show his whole side clearly from armpit to boot: the side of the corset, the belt, the dagger on his left hip, and the pouch, the scroll and the two charms on his right hip.
```

## Set B: Layers off (round 1)

What the hat, the belt and the corset hide. I build these layers first and check them before anything goes on top.

**B1: No hat, no belt, no jewellery: front and back** (wide). The whole corset, the top of his head, and where the trousers begin.
```
Wide image, landscape 3:2. Two paintings of him side by side in the standing pose, at exactly the same size. Take off these things only: the hat, the belt with its ring and its second strap, the pouch, the scroll, the two charms, the dagger with its sheath, the pearl necklace, and the charm and feather that hang from his left ear. Keep everything else exactly the same: glasses, the black plugs in both ears, shirt, corset, gloves and wrist cuffs, trousers and boots. Left: from directly in front. Right: from directly behind. Show the top of his head and his hair without the hat, the whole corset from its top edge to its bottom edge, and the waistband of the trousers under it.
```

**B2: No hat, no belt, no jewellery: both sides** (wide). His body in profile with nothing in the way.
```
Wide image, landscape 3:2. Two paintings of him side by side at exactly the same size, without the hat, belt, pouch, scroll, charms, dagger, pearls or feather, in exact side view, standing straight with both arms held straight out to the sides at shoulder height so they do not hide his body. Left: he faces the left edge of the image. Right: he faces the right edge.
```

**B3: Shirt and trousers only** (wide). His real waist and stomach, which the corset pulls in. The body is built to this, and the corset goes on after.
```
Wide image, landscape 3:2. Two paintings of him side by side at exactly the same size, standing straight. For this image only he wears just his glasses, the shirt, the gloves and wrist cuffs, the trousers and the boots: no hat, no corset, no belt or anything that hangs from it, no pearls and no feather. The shirt is tucked into the trousers. Left: from directly in front, in the standing pose. Right: exact side view facing the right edge of the image, with both arms held straight out to the sides at shoulder height so they do not hide his body. Show his real waist and stomach under the loose shirt, without the corset pulling them in, and the plain black waistband of the trousers.
```

**B4: Legs, in the trousers** (wide). Where every hole is, and how baggy the cloth is from each side.
```
Wide image, landscape 3:2. Three paintings side by side of him from the waist down only, at the same size: the trousers and the boots, with no belt, pouch, scroll, charms or dagger. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind. Show where every hole in the trousers is, the fishnet inside each one, and how the loose cloth is tucked into the tops of the boots.
```

**B5: Legs, without the trousers** (wide). The shape of his legs, which the trousers hide. The cloth has to know they are there.
```
Wide image, landscape 3:2. Three paintings side by side of him from the waist down only, at the same size. For this image only, he wears plain, close-fitting black shorts in place of the trousers, with the black fishnet tights and the boots, and no belt or anything that hangs from it, so that the shape of his hips and legs can be seen and the fishnet shows from the shorts down to the boots. Legs straight, feet a little apart. Left: from directly in front. Middle: exact side view facing the right edge of the image. Right: from directly behind.
```

## Set C: Head, face, beard, hair, hat and glasses (round 1)

The face is what you look at first, so this is the biggest set. C1 to C3 are the three that made the Ranger's and the Fox's faces work: his bare face straight on, its six states, and a clean profile. The hat and glasses are off for those because both get built as real objects.

**C1: His face, straight on** (square). The face that gets painted onto the model. Stay on this one until it is him.
```
Square image. One very large close-up painting of his face from directly in front, WITHOUT his hat and WITHOUT his glasses, filling the frame from his hairline to just under his beard, with both ears inside the frame. For this image only, his hair is drawn straight back off his face and tied behind his head, out of sight: no hair crosses his forehead, temples, ears or cheeks, and his whole hairline shows. Both ears have their black plugs, with nothing hanging from them. Lips closed and relaxed, with only the faintest smile; no teeth show. Eyes open, looking straight at the viewer. Head perfectly level, not tilted and not turned. Even light with no shadow across his face. Painted as realistically as the Jester face style guide: real skin with pores and fine lines, and a real beard in which single hairs can be seen.
```

**C2: Six states of his face** (wide). His blink, his talking mouths and his smile. Each face must sit in the same place in its box. Attach: your kept C1.
```
Wide image, landscape 3:2. I am attaching the finished painting of his face. A grid of six close-up paintings of the same face, three across and two down, each exactly the same size, each from directly in front with the head perfectly level, each in exactly the same position inside its box, each showing from the top of his eyebrows to just under his beard. WITHOUT his hat and WITHOUT his glasses, with his hair tied back as in the attached face. Every one matches the attached face exactly except for the one change named. Top row, left to right: (1) the attached face unchanged; (2) both eyes gently closed, as in the middle of a blink, mouth unchanged; (3) both eyes half closed, upper lids lowered halfway over the eyes, mouth unchanged. Bottom row, left to right: (4) lips just parted as if starting to speak, eyes unchanged; (5) lips rounded in a small 'oo', eyes unchanged; (6) a broad, warm closed-lip smile with his cheeks lifted, eyes unchanged. No teeth are visible in any of the six.
```

**C3: Front, turned and side, bare head** (wide). The shape of his head. I measure the profile to the millimetre, so nothing may cross it. Attach: your kept C1.
```
Wide image, landscape 3:2. I am attaching the finished painting of his face. Three large paintings of his head and neck side by side at exactly the same size, WITHOUT his hat and WITHOUT his glasses, each showing from the top of his head down to his collarbones. Left: from directly in front. Middle: his head turned 45 degrees toward the right edge of the image. Right: an exact side view, a true profile, facing the right edge. His hair is drawn back and tied behind his head as in the attached face, so that his forehead and hairline, the bridge and tip of his nose, his lips, the front edge of his beard, his chin, his jawline, his whole ear and the line of his neck are clear against the background. Lips closed with only the faintest smile, eyes open, head level.
```

**C4: The same three views, hair down, glasses on** (wide). His hair as he wears it, and how the glasses sit on his nose and ears.
```
Wide image, landscape 3:2. Three large paintings of his head and shoulders side by side at exactly the same size, WITHOUT his hat, each showing from the top of his head down to his collarbones: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. He wears his glasses, and his hair is loose as usual: parted near the middle, tucked behind his ears and falling in waves to just past his shoulders. Show clearly how the glasses sit on his nose, how far the lenses stand from his eyes, and how the arms of the glasses run back over his ears and under his hair. The lenses are clear, with no glare and no reflections.
```

**C5: The same three views with the hat** (wide). How low the hat sits, where its band meets his forehead, and how the crown folds.
```
Wide image, landscape 3:2. Three large paintings of his head and shoulders side by side at exactly the same size, wearing his hat and his glasses, each showing from the tip of the hat down to his collarbones, with the whole brim inside the frame: from directly in front; turned 45 degrees toward the right edge of the image; and a true profile facing the right edge. Show clearly how low the hat sits on his head, where its band meets his forehead and his hair, how the brim dips and waves, and how the crown is creased and folded over toward his left. His face is evenly lit under the brim.
```

**C6: Other side and the back of his head** (wide). The feather earring, the fold of the hat from its other side, and his hair from behind.
```
Wide image, landscape 3:2. Three large paintings of his head and shoulders side by side at exactly the same size, wearing his hat and his glasses, each showing from the tip of the hat down to his collarbones, with the whole brim inside the frame. Left: a true profile facing the LEFT edge of the image, so we see his left ear with its black plug, the small silver charm and the black feather. Middle: from directly behind. Right: turned 45 degrees seen from behind, halfway between a back view and a view of him facing the left edge. Show how his hair falls from under the hat and down his back, and the back of the hat with its folded crown.
```

**C7: Face from above** (square). Checking the brow, cheeks and nose from a high camera.
```
Square image. One large close-up painting of his head WITHOUT his hat and WITHOUT his glasses, hair tied back, with the camera above him and in front of him, looking down at his face at about 45 degrees. We see the top of his head, his hairline and forehead, the tops of his cheeks, the bridge of his nose and the top of his moustache. His eyes look down. Lips closed.
```

**C8: Face from below** (square). Under the jaw and the underside of the beard, which no other painting shows.
```
Square image. One large close-up painting of his head WITHOUT his hat and WITHOUT his glasses, hair tied back, with the camera below him and in front of him, looking up at his face at about 45 degrees. We see under his chin and jaw, the underside of his beard and where it ends on his neck, his nostrils and the underside of his brow. His eyes look straight ahead. Lips closed.
```

**C9: Nine views of his head** (square). The in-between angles. The Fox looked right straight on and wrong halfway to the side; this is the check for that. Attach: your kept C1 and C3.
```
Square image. I am attaching the finished paintings of his face and of his head from three sides. A grid of nine paintings of his bare head, three across and three down, each exactly the same size and in the same position inside its box, WITHOUT his hat and WITHOUT his glasses, hair tied back, lips closed, the same calm face in all nine. Each box shows from the top of his head to the base of his neck. The three columns, left to right: seen from directly in front; turned 45 degrees toward the right edge of the image; a true profile facing the right edge. The three rows, top to bottom: the camera raised, looking down at him at about 30 degrees; the camera level with his eyes; the camera lowered, looking up at him at about 30 degrees. His head itself stays level in all nine: only the camera moves.
```

**C10: The hat alone** (wide). Building the hat as its own object: the brim, the fold, and the inside.
```
Wide image, landscape 3:2. Only his hat, with no head, painted large four times in a row at the same size: from directly in front; from the wearer's right side; from directly above, looking straight down onto the brim and the folded crown; and from below, looking up into the hat, showing the underside of the brim and the opening for his head with its inner band. Soft, weathered charcoal-grey wool felt, a very wide and slightly wavy brim, and a darker grey felt band round the base of the crown. The crown is creased and folded over partway up, and its tip falls toward the wearer's left.
```

**C11: The hat on him, from above and below** (wide). How much of his face the brim covers from a high camera, and the underside of the brim round his face.
```
Wide image, landscape 3:2. Two large paintings of his head and shoulders side by side at the same size, wearing his hat and his glasses. Left: the camera is above him and in front of him, looking down at about 45 degrees: we see the top of the brim, the folded crown, and as much of his face, beard and shoulders as the brim leaves in view. Right: the camera is below him and in front of him, looking up at about 45 degrees: we see the underside of the brim all round his head, and his whole face, evenly lit.
```

**C12: His hair without the hat, from behind and above** (wide). His hair in the round, for when the hat comes off.
```
Wide image, landscape 3:2. Three large paintings of his head and shoulders side by side at exactly the same size, WITHOUT his hat, wearing his glasses, his hair loose as usual. Left: from directly behind. Middle: turned 45 degrees seen from behind, halfway between a back view and a view of him facing the left edge of the image. Right: the top of his head seen from directly above, looking straight down, with his face toward the bottom of the image. Show the parting, how the hair falls from it, how long it is at the back, and how it waves.
```

**C13: Beard and ear, close** (square). Where the beard starts and stops, and the earring up close.
```
Square image. One very large close-up painting of his face WITHOUT his hat and WITHOUT his glasses, turned 45 degrees toward the LEFT edge of the image, from his hairline to under his beard. His hair on the near side is tucked behind his ear, so his whole left ear, with its black plug, the small silver charm and the black feather, and his cheek and jaw are clear. Show how the beard grows: its upper edge across the cheek, the moustache, the patch under his lower lip, and where it ends under the jaw. Lips closed, eyes looking the way his head is turned.
```

**C14: The glasses alone** (wide). Building the glasses as their own object.
```
Wide image, landscape 3:2. Only his glasses, with no face, painted large four times in a row: from directly in front; from the side; from above; and in three-quarter view. Thick black rectangular frames with slightly rounded corners, clear lenses, and wide straight arms with curved ear tips.
```

## Set D: Hands (round 1)

Attach S3 (the Jester's hands) with D1 and D2 so the framing matches. He wears his gloves in these, because he never takes them off; D3 is what is under them.

**D1: Left hand, gloved** (square). The shape of his hand, the glove and the wrist cuff, painted onto the model. Attach: S3.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of The Grey Hat's LEFT hand and forearm side by side, pointing straight up, fingers straight and slightly apart, thumb held out a little, wearing the black leather fingerless glove and the black studded wrist cuff. The shirt sleeve is pushed up out of the picture, so the forearm above the cuff is bare. Left: the back of the hand. Right: the palm. A man's hand with a broad palm, short clean natural nails and a little dark hair on the forearm, with no prominent veins or tendons. Show where the glove ends on each finger and on the thumb, its seams, and how the cuff buckles.
```

**D2: Right hand, gloved** (square). His right hand, so nothing has to be mirrored. Attach: S3.
```
Square image. I am attaching a hand style guide: copy its pose and framing only. Two large paintings of The Grey Hat's RIGHT hand and forearm side by side, pointing straight up, fingers straight and slightly apart, thumb held out a little, wearing the black leather fingerless glove and the black studded wrist cuff. The shirt sleeve is pushed up out of the picture, so the forearm above the cuff is bare. Left: the back of the hand. Right: the palm. A man's hand with a broad palm, short clean natural nails and a little dark hair on the forearm, with no prominent veins or tendons. Show where the glove ends on each finger and on the thumb, its seams, and how the cuff buckles.
```

**D3: Bare hands and forearms** (wide). His skin under the gloves, and his forearms, which show between cuff and sleeve.
```
Wide image, landscape 3:2. Two large paintings side by side: the backs of both of his hands and forearms, bare, with no gloves, no wrist cuffs and no sleeves, from the fingertips to just below the elbow, pointing straight up, fingers slightly apart. Left: his left hand. Right: his right hand. A man's hands with broad palms, short clean natural nails and a little dark hair on the forearms, with no prominent veins or tendons.
```

**D4: Right hand: four poses** (wide). Finger poses for standing, talking, pointing and holding the scroll.
```
Wide image, landscape 3:2. Four large paintings of his gloved RIGHT hand and wrist in a row, each in a different pose: (1) completely relaxed, hanging at his side; (2) open and palm up, held out as if explaining something; (3) the first finger pointing, the others folded; (4) closed loosely round something as thick as a broom handle, as if holding a rolled scroll.
```

## Set E: Boots (round 1)

Eight views of one boot, the same eight the witches' boots were built from. Attach S4 (the Jester's boot) with E1 so the framing matches.

**E1: Outer side** (square). The boot's outline: sole depth, heel, shaft height. Everything is measured from this one. Attach: S4.
```
Square image. I am attaching a boot style guide: copy its framing and realism only, not its boot. One large painting of his right boot: heavy, glossy black leather, reaching the middle of the calf, creased at the ankle, with a round, bulbous toe, a thick black rubber lug sole about 4 cm deep and a low block heel. It has no laces. Three black leather straps wrap the shaft, each fastened with a steel snap stud. The top of the shaft is turned down in a cuff of the same leather with round steel studs and one pointed tab hanging at each side. The boot is alone, with no leg and no trouser above it, standing flat. Seen in exact side view from the outside, toe pointing to the right edge of the image.
```

**E2: Inner side** (square). The arch side, which differs from the outside.
```
Square image. The same boot as the last image: his right boot, alone, standing flat, at the same size. Seen in exact side view from the inside, toe pointing to the left edge of the image.
```

**E3: Front pair** (square). Width, toe shape and the straps from the front.
```
Square image. Both of his boots, as a pair, alone, standing side by side a little apart. Seen from directly in front, toes toward the viewer.
```

**E4: Back** (square). The heel, the back seam and the cuff from behind.
```
Square image. His right boot, alone, standing flat. Seen from directly behind: the heel block, the back seam, the three straps going round, and the turned-down cuff.
```

**E5: Three-quarter** (square). How the shapes join up in the round.
```
Square image. His right boot, alone, standing flat. Seen in three-quarter view from the front and the outside, from slightly above, the way a boot is shown in a shop.
```

**E6: From above** (square). The plan of the foot and the opening.
```
Square image. His right boot, alone. Seen from directly above, looking straight down, toe pointing to the top of the image: the round toe, the straps across the front and the opening inside the cuff.
```

**E7: The sole** (square). The tread pattern.
```
Square image. The sole of his right boot, alone. Seen from directly below, flat, toe pointing to the top of the image: the whole lug tread pattern and the heel block.
```

**E8: Cuff and straps, close** (square). Studs, snaps, the pointed tabs and how the cuff folds.
```
Square image. A very large close-up of the top half of his right boot, seen from the front and slightly to the outside: the turned-down leather cuff with its round steel studs, one pointed tab, and the top two straps with their steel snap studs.
```

## Set F: Details, flat pieces and fabrics (round 2)

Everything small, and every cloth laid flat so it can be wrapped onto the model. F9 uses a light grey background on purpose, so the holes in the net show.

**F1: Pearls and earrings** (wide). The pearls as a real strand, and the feather earring, which swings on the model.
```
Wide image, landscape 3:2. His jewellery taken off and laid out flat, each piece separate and painted large, seen from straight above, with clear space between them: (1) the short pearl necklace, laid in an open U so its whole length and its clasp can be seen, with round cream pearls about 8 mm across; (2) his left earring: the round black plug with its thin silver rim, the small silver charm that hangs from it, and the black feather that hangs from the charm; (3) the plain black plug from his right ear, seen from the front and from the side.
```

**F2: Shirt laid flat** (wide). The shirt's pattern pieces, and how much cloth is in a sleeve.
```
Wide image, landscape 3:2. Two paintings. Left: his cream linen shirt taken off and laid completely flat, seen from straight above, front up, with the collar spread open, the laced front opening with its two lace-edged ruffles, and both full sleeves spread out to the sides at their whole length, each ending in its gathered band and lace ruffle. Right: one sleeve alone, painted large, as it looks when worn and pushed up the forearm, seen from the side: the gathers at the shoulder, the fullness of the sleeve, the band and the lace ruffle.
```

**F3: Shirt close-ups** (wide). The lacing, the ruffles and the lace.
```
Wide image, landscape 3:2. Four large close-up paintings in a row, each seen straight on: (1) the laced front opening of the shirt, showing the black eyelets, the dark red cord in its four crossings and the two hanging cord ends; (2) one front ruffle with its cream lace edge; (3) one point of the collar with its lace edge; (4) one sleeve band with its wide lace ruffle.
```

**F4: Corset laid flat** (wide). The corset's panels, outside and inside.
```
Wide image, landscape 3:2. His black leather corset taken off, unbuckled and unlaced, and laid completely flat like a sewing pattern, seen from straight above, painted twice at the same size. Left: the outside, showing every panel, the stitched boning seams, the steel rivets, the two front straps with their rectangular silver buckles, and the row of lacing eyelets down each back edge. Right: the inside, showing its lining. No folds and no body inside it.
```

**F5: Corset close-ups** (wide). Buckles, seams, the point and the lacing.
```
Wide image, landscape 3:2. Four large close-up paintings in a row, each seen straight on: (1) the two front straps of the corset and their rectangular silver buckles; (2) two boning seams with their stitching and steel rivets; (3) the bottom edge of the corset where it dips to a shallow point at the centre front; (4) the black cord lacing at the back of the corset.
```

**F6: Trousers laid flat** (wide). How wide a leg really is, and a map of the holes.
```
Wide image, landscape 3:2. His trousers taken off and laid completely flat like a sewing pattern, seen from straight above, painted twice at the same size, with the background showing through every hole. Left: the front, showing the plain black waistband, how wide each leg is, the hems, and every torn hole in its place: five on the front and outer side of his right leg and six on the front and outer side of his left leg. Right: the back, which has no holes.
```

**F7: Trouser print, one big square** (square). The cloth he is known by. This becomes both legs.
```
Square image. One large flat square filled edge to edge with the printed cloth of his trousers: black, printed all over with dark red flowers, leaves and curling stems, like a damask, seen straight on, perfectly flat, with even light and no folds, holes or seams. The flowers are about 6 cm across, as they would be on his thigh, and the pattern repeats evenly so the square could be tiled.
```

**F8: One torn hole, close** (square). The frayed edge, and how the net sits on skin.
```
Square image. A very large close-up of one of the torn holes in his trousers as it is worn on his thigh, seen straight on: the long oval opening, its rough, frayed black edge, and the black fishnet stretched over his skin inside it. The printed black and red cloth fills the rest of the image.
```

**F9: Fishnet, one big square** (square). The net that shows through every hole.
```
Square image. For this image only, the background is flat light grey (#D0D0D0). One large flat square filled edge to edge with his black fishnet: an open diamond net with holes about 1.5 cm across, seen straight on, perfectly flat and evenly stretched, so the light grey shows through every hole. Even light. The pattern repeats evenly so the square could be tiled.
```

**F10: Belt, strap and pouch** (wide). The belt gear as separate objects.
```
Wide image, landscape 3:2. His belt gear taken off, each piece separate and painted large with clear space between them. (1) Across the top: the wide black leather belt laid out straight at its whole length, with the large silver ring, its holes, and the shorter second strap that hangs from the ring. Below, in a row: (2) the brown leather pouch from the front, with its flap and brass stud; (3) the pouch from the side, showing how deep it is and its belt loop; (4) the pouch from behind; (5) the silver ring alone, painted large, showing how the two ends of the belt fasten to it.
```

**F11: Everything that hangs from the belt** (wide). The charms, the scroll loop and the sheath. On the model these hang and swing.
```
Wide image, landscape 3:2. Everything else that hangs from his belt, taken off and hung straight down side by side, each painted large with clear space between: (1) the small silver skull charm on its clip; (2) the small gold leaf charm on its clip; (3) the brown leather loop that carries the scroll, empty, showing how it hangs from the strap; (4) the same loop with the rolled scroll in it; (5) the dark brown leather sheath on its black leather hanger with small brass studs, with the dagger in it and only the black grip showing.
```

**F12: Glove and wrist cuff** (wide). The glove and the cuff as objects.
```
Wide image, landscape 3:2. One of his gloves and one of his wrist cuffs taken off and painted large, in a row: (1) the black leather fingerless glove laid flat, back up; (2) the same glove laid flat, palm up; (3) the black leather wrist cuff unbuckled and opened out flat, outside up, showing its steel studs, its strap and its buckle; (4) the same cuff buckled closed into a ring, seen from the side.
```

**F13: Material squares** (wide). Flat samples I turn into the model's surfaces.
```
Wide image, landscape 3:2. Eight flat square samples of his materials in two rows of four, each square filled edge to edge with the material, perfectly flat, with no folds, no seams and even light. Top row, left to right: the weathered charcoal-grey wool felt of the hat; the cream linen of the shirt; the cream lace of the ruffles, laid over the plum background so the plum shows through its holes; the parchment of the scroll. Bottom row, left to right: the black leather of the corset; the black leather of the belt; the brown leather of the pouch; the glossy black leather of the boots.
```

## Set G: His things (round 2)

The scroll and the dagger as solid objects. The picture shows only the grip end of whatever hangs on his left thigh, so the dagger is my design, kept plain. Change any wording you like before you run it.

**G1: The scroll** (wide). Rolled, half open and open, so he can take it out and read it.
```
Wide image, landscape 3:2. His scroll alone, with no figure and no hands, painted in the same realistic style, large, three times. It is one sheet of thick cream parchment about 30 cm wide and 60 cm long, with slightly uneven, aged edges. It is blank on both sides: no writing, no drawings and no symbols. Top: rolled up tight and lying on its side, as he carries it. Middle: half unrolled and lying flat, with both ends still curled. Bottom: unrolled and held flat, seen from straight above, with a slight curl left at each end.
```

**G2: The dagger** (wide). New design. What is in the sheath on his left hip.
```
Wide image, landscape 3:2. A new object for him, with no figure and no hands, painted in the same realistic style: a plain, well-used dagger about 28 cm long, with a straight double-edged steel blade about 16 cm long, a short straight steel crossguard, a grip wrapped in black leather and a small round steel pommel. Four paintings in a row: (1) the dagger seen flat, point toward the right edge of the image; (2) the same dagger seen edge-on; (3) its sheath alone: dark brown leather with a stitched edge, on a black leather hanger with small brass studs and a belt loop; (4) the dagger in its sheath, with only the grip and the crossguard showing.
```

**G3: His hands on his things** (wide). Finger positions for each grip. Attach: your kept G1 and G2.
```
Wide image, landscape 3:2. I am attaching the paintings of his scroll and his dagger. Four large close-up paintings in a row of his gloved hands: (1) his right hand holding the rolled scroll round its middle; (2) both hands holding the scroll open in front of him, one at each curled end; (3) his right hand closed round the grip of the dagger while it is still in its sheath, about to draw it; (4) his right hand pinching the front of the brim of his hat between thumb and fingers.
```

## Set H: How he stands, talks and moves (round 3)

A character the four meet needs to stand, listen, talk and walk before anything else, so that is what these are. H9 is there in case he joins a fight. He has no magic in any of them: what his magic is, or whether he has any, is yours to decide.

**H1: His stance, from his picture** (tall). The pose from his picture. This becomes how he stands when nobody is talking to him.
```
Tall image, portrait 2:3. Key pose. One painting of his whole figure in his full outfit, seen from directly in front, standing exactly as in his picture: feet wide apart, both hands on his hips with the fingers forward, elbows out, chest up. His head is turned a little toward the left edge of the image and he looks that way with a satisfied closed-lip smirk.
```

**H2: The same stance from two other sides** (wide). The same pose in the round, so it holds up from any camera. Attach: your kept H1.
```
Wide image, landscape 3:2. I am attaching the painting of his stance. Two paintings side by side, at the same size, of exactly that pose seen from two other sides. Left: turned 45 degrees, halfway between a front view and a view of him facing the right edge of the image. Right: from directly behind.
```

**H3: Talking** (wide). Two gestures for when he speaks to the four.
```
Wide image, landscape 3:2. Key poses. Two paintings of his whole figure side by side at the same size, in his full outfit, facing the viewer. Left: explaining something: his weight on one leg, his right hand held out in front of him with the palm up, his left hand resting on his hip, his eyebrows raised and his lips just parted, as if in the middle of a sentence. Right: pointing the way: his left arm stretched out toward the right edge of the image with one finger pointing, his head turned to look where he points, and his right hand resting on the pouch at his hip.
```

**H4: The scroll** (wide). Taking the scroll out and reading it. Attach: your kept G1.
```
Wide image, landscape 3:2. I am attaching the painting of his scroll. Key poses. Two paintings of his whole figure side by side at the same size, in his full outfit, facing the viewer. Left: his right hand draws the rolled scroll up out of its leather loop on his right hip, and he glances down at it. Right: he holds the scroll open in both hands at chest height and reads it, his head bowed a little, looking down through his glasses, lips closed. The scroll is blank: no writing shows.
```

**H5: The hat** (wide). A greeting and a bow. The bow is the one time the hat comes off.
```
Wide image, landscape 3:2. Key poses. Two paintings of his whole figure side by side at the same size, in his full outfit, facing the viewer. Left: a greeting: his right hand pinches the front of the brim and tips the hat forward a little, with a nod and a closed-lip smile. Right: a deep bow: he bends forward from the hips with his right foot drawn back and his left hand flat on his chest, and his right arm is swept out to the side holding the hat by its brim, so that the top of his head and his hair falling forward can be seen.
```

**H6: Walking and running** (wide). How the baggy trousers, the hair and the things on his belt swing.
```
Wide image, landscape 3:2. Two paintings of his whole figure side by side at the same size, in his full outfit, in exact side view, moving toward the right edge of the image. Left: walking, in the middle of an easy stride, his front heel just touching the ground, arms swinging loosely. Right: running, in the middle of a stride with both feet off the ground, one hand holding the brim of his hat to keep it on, and his hair, the feather and the scroll swinging back behind him.
```

**H7: Sitting and listening** (wide). How the trousers and the belt gear sit when he does.
```
Wide image, landscape 3:2. Two paintings of his whole figure side by side at the same size, in his full outfit. Left: sitting on a plain wooden crate, seen from directly in front, leaning forward with his forearms on his knees and his hands loosely together. The crate is the only thing in the image besides him. Right: standing at ease, turned 45 degrees toward the right edge of the image, with his arms folded across his chest and his weight on one leg, listening.
```

**H8: Expressions** (wide). Acting, for when he talks: his smirk, a grin, surprise, thinking, serious.
```
Wide image, landscape 3:2. Six large paintings of his face from directly in front, in two rows of three, WITHOUT his hat and WITHOUT his glasses, hair tied back, each from his hairline to under his beard. His head is in exactly the same position and at the same size in all six; only his expression changes, and no teeth show in any of them. Top row, left to right: calm, with the faintest smile; his satisfied smirk, with one corner of his mouth raised and one eyebrow lifted; a broad, warm closed-lip grin that narrows his eyes. Bottom row, left to right: surprised, with his eyebrows up and his lips parted in a small 'oh'; thinking, with his eyes turned up and to one side and his lips pressed together; serious and steady, not smiling at all.
```

**H9: In case he fights: the dagger** (wide). Optional. Only if you want him to join a fight. Attach: your kept G2.
```
Wide image, landscape 3:2. I am attaching the painting of his dagger. Key poses. Two paintings of his whole figure side by side at the same size, in his full outfit, his body turned toward the right edge of the image, holding the dagger in his right hand. Left: on guard: feet apart, knees bent, the dagger held low in front of him with its point toward the right edge, his left hand open and held out for balance. Right: a quick lunge: a long step onto his front foot, his right arm thrust straight out toward the right edge with the dagger, his left arm thrown back, and his hair and the feather swinging with the move. The empty sheath hangs on his left hip in both.
```

## Checklist before keeping an image

- He matches the master: the same face, the same beard, the same build, the same colours.
- He has real proportions, not the cartoon's big head and big boots, and he has not been made taller, slimmer, more muscular or younger.
- The hat is grey with a very wide brim, and its tip falls to his left: the right side of a front view.
- His face is evenly lit under the brim. No shadow over his eyes.
- Glasses on, unless the prompt said without. No glare over his eyes.
- Lips closed and no teeth, unless the prompt asked for parted lips.
- The pouch and the scroll are on his right hip: the left side of a front view, the right side of a back view. The dagger is on his left hip.
- The feather hangs from his left ear only.
- The trousers are black with dark red flowers, torn into holes on the front with fishnet showing, and tucked into the boots.
- The boots and gloves are plain black: no gold flecks.
- Nothing is cut off: the tip of the hat, the brim, his fingertips, the soles of his boots.
- Flat plum background with no floor shadow. (Light grey for F9.)
- No text, numbers or labels anywhere, and nothing written on the scroll.
- Real cloth, leather and skin: not a cartoon and not pixel art.
- When there is more than one of him, they are the same size and stand on one line.

## What Claude read from the picture, and where it guessed

He has one picture, from the front. Chris knows the outfit; correct anything here.

- **His name.** "The Grey Hat" is only a working name, taken from his hat. Tell me his real one and I will change it everywhere.
- **The gold flecks on his boots, gloves and cuffs.** I read them as the sunset glinting on shiny black leather, so the prompts ask for plain black. If they are real gold spatter on the leather, say so and I will put it back.
- **What hangs on his left thigh.** I read it as a dagger in a brown sheath on a black hanger. Only the top of it shows, so the dagger itself (G2) is my design, kept plain.
- **The scroll.** Blank for now. What is written on it is yours to decide.
- **His back.** It has never been drawn. I chose black lacing up the back of the corset, no holes in the back of the trousers, and hair to just past his shoulders. A2 is where that gets decided, so look at that one closely.
- **His right ear.** The picture shows only his left ear. I gave the right one the same black plug with no feather.
- **The holes in the trousers.** Five on his right leg and six on his left, counted off the picture. The image maker will not count exactly; I will build whatever the kept A1 and B4 show.
- **The boots.** Straps and snap studs with a turned-down cuff, and no laces, because the picture shows none.
- **Two small things I could not make out.** A small blue and gold fitting on the belt beside the ring, on his left, and an orange shape behind the pouch. I left both out.
- **No teeth.** Carried over from your rule for the Fox. His mouth stays closed or just parted.

## What Claude plans to build first (proposal)

| Move | What it looks like |
|---|---|
| Stand | His hands-on-hips stance from the picture, breathing, looking about, blinking. |
| Talk | Talking mouths and a few gestures: explaining, pointing the way, a nod. |
| The hat | A tip of the brim as a greeting, and a bow with the hat swept off. |
| The scroll | Taking it from its loop, unrolling it and reading it. |
| Walk, run, sit, wave | Carried over from the witches and adjusted for his build, his trousers and the hat. |
| If he fights | Dagger: a guard and a lunge. Anything more waits on what you decide he is. |

Not planned until Chris decides: any magic, and any spells. The combat rework (`lore/combat-balance.md`) has no place for him yet.
