# Fox Witch 3D – pass 2: her head, sculpted first and painted second

Written by Claude, 12 Nov 2026. Follows `claude/fox-3d-pass1.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`.

## What Chris said (12 Nov, after pass 1)

- "Her face has to look like her face from multiple angles." The HD Jester looks like a person; the pass-1 Fox did not.
- The Jester's face was made to look like a face **as a 3D shape first, with nothing printed on it**, so it could blink, talk and hold up from any side. The painting went over it afterwards.
- The face will carry much more detail than the rest of the body, as the hands do.
- Lay the model over the reference, side by side, at the same height, width and depth.

## What was wrong in pass 1

Pass 1 printed face sheet C1 onto the **Jester's** skull. Nothing of the Fox's own profile, jaw or neck was in the shape, so only the straight-on view could look like her. That skipped step 3 and step 5 of the HOW-TO's order ("measure the face profile", "head from the profile, then baked face").

## The method now

**Sheet C3 is the master for her head.** It shows her from the front, at 45 degrees and in true profile at one size, painted in one go, so the three views agree with each other. C1 and A1 do not agree with it (see "The paintings disagree").

1. `meas/fox_profile.py` reads C3: both pupils and the lip line in the front panel, and the line of forehead, nose, lips and chin in the profile panel, row by row. Check picture: `shots/c3_marks.jpg`.
2. `meas/fox_headfit.py` finds the landmarks on that line (nasion, nose tip, under the nose, both lips, lip line, the fold above the chin, chin point, under the chin) and **writes the head's tables into `src/40_head.js`**: `FACE_MID` (the middle line of the face), `NOSE`, `NOSE_W`, `LIPS` (heights and sizes of both lips, chin, cheekbones) and the chin length. It saves `meas/fox_head.json` for the bake. Nothing is typed in by hand.
3. `src/40_head.js` also gained `JAW`: the underside of her jaw by depth. Nothing of the head hangs below it, so she has a jawline that runs flat under the chin, turns at the corner of the jaw and rises to the ear. The Jester never needed this because her ruff and cap hid it.
4. Her neck (`foxNeck` in `src/45_foxhead.js`) runs up into the skull and leans forward to meet the jaw 4.5 cm behind the chin. The Jester's own neck is shrunk to a core inside it; the two used to fight.
5. `bake_fox.py` now paints from C3: the **front panel** on the front of the face and the **profile panel** on cheek and jaw at the sides, with plain skin under the jaw. Loose curls that cross her temples in the painting are masked out and filled from the skin beside them. The old C1 bake is kept as `bake_fox_c1.py`.
6. `c3cmp.sh` is the check: her bare head (no hair, ears or glasses) from the front, at 45 degrees and in profile, beside C3's three panels at one scale, with lines at eyes, nose tip, lip line and under the chin. The bottom row is the **bare sculpt in plain skin**, which is how to judge the shape alone.

## Second round the same day: the other session's face guide

Chris passed on `claude/HOW-TO-3d-witch-faces.md` (how the Jester's face was made). Worked through as a checklist:

| Its step | What it found on the Fox | What was done |
|---|---|---|
| 1. Landmarks read off a grid, not found automatically | **My automatic pupil finder had caught the dark lash corners.** It put her pupils 128 px apart; on the grid (`shots/c3_grid.jpg`) they are 107.5. Her eyes were set 20% too wide and the whole head sized from a wrong number. | Pupils are now typed in from the grid: (235, 381) and (342.5, 379) in C3. `eyeX` 0.0314. |
| 2. Profile within 1 mm | No check existed. | New `prof_check.py`: the model's middle line against the painted profile by height. Every landmark is within 0.4 mm; mean gap 0.16 mm; worst 1.12 mm on the bridge of the nose. |
| 2. `FACE_V` fixes "right from the front, wrong at 45 degrees" | It was still the Jester's. Against C3's middle panel her far cheek fell away about 12 mm too soon. | `FACE_V` made rounder (fuller cheeks and jaw). C3's middle panel is painted at **34 degrees, not 45**: its pupils are 89 px apart against 107.5 from the front. `c3cmp.sh` now renders at 34. |
| 2. Width from the front painting | Guessed. | Half-widths measured in C3 at nine heights; skull half-width 0.070, jaw fuller (power 0.42, taper 8%). |
| 3. Keep relief shallow (6 mm at most) | I had deepened the sockets to 8 mm to make the bare sculpt read. | Back to the Jester's depths, eyeball a little rounder. |
| 5. Plain skin only under the jaw, with a height test | The height test was the Jester's flat line; her jaw rises to the ear. | The test follows her `JAW` table. |

Also: chin lowered 3 mm and rounded, under-chin flattened to the neck as in C3's profile.

## Numbers

- The head's own frame keeps the Jester's convention: eyes at 1.5246, lip line 0.066 below. C3 is then 1725 px a metre of head.
- Head bone scale **0.93**, head lowered 0.0233. Skull half-width 0.070. Eyes 0.0314 either side of the middle. C3 is 1712 px a metre of head.
- Landmarks (height, metres forward): nasion 1.5305 / 0.0985, nose tip 1.4934 / 0.1205, under the nose 1.4783, upper lip 1.4678, lip line 1.4586, lower lip 1.4526, chin point 1.4306, under the chin 1.4174. Nose stands 17.4 mm proud.
- Against A1 on the grid (`headcmp.sh`): eyes row 157 (A1 157), mouth 210 (208), chin 248 (248), face 114 px wide (108), glasses on A1's columns.

## The paintings disagree

**Corrected:** I first wrote that C3's face was 10 to 15% wider-eyed than C1's. That was my wrong pupil reading. Read off the grid, pupil distance over eye-to-mouth distance is C3 0.95, C1 0.98, A1 1.06 (A1 is a broader smile). The sheets agree well. The model follows C3 and is sized to A1's head. Her neck: C3 shows about 9.5 cm across, A1 about 7.3; the model is 8.

## Hair in this pass

Restyled toward C3: drawn up off her ears and neck, the mass only above the ear at the sides and down to the nape at the back, ringlets hanging by her temples. It is still made of ribbons and needs its own pass.

## Known weak points

- **The bare sculpt's eyes are soft dents, as the Jester's are.** The Jester's method keeps relief to a few millimetres and lets the painting carry the eye; her blink is a painted state, not moving lids. Modelled lids would be a new method, and Chris has not asked for one.
- No blink, talk or smile yet: expression sheets C13 to C16 are not cut into face states (`faceParts` is empty).
- No modelled human ears. The profile painting's ear is left out on purpose; a flat painted ear looked wrong from 45 degrees.
- Hair: ribbons, a dark smooth ball showing where the bun starts, a cap-like top. Costume ears are smoother and narrower than painted.
- The chin is a little flat-bottomed from the front. Texture is soft close up, because C3's front face is only 128 px between the pupils.
- Motion cannot be judged on the test machine (about 2 frames a second).

## Lessons

1. Fork the code, not the face. A new witch's head starts with her own profile tables, before any painting goes on.
2. Use one sheet that shows several angles as the master for a head.
5. **Read face landmarks off a grid by eye.** Automatic finding fails on painted faces: lashes and shadows are darker than pupils. I trusted a marked check picture at too small a size.
6. Work out the real angle of a "45 degree" painting from its pupils before comparing.
3. Judge the head with hair, ears and glasses off, painted and unpainted, at three angles.
4. If hair is worn up, the jaw and neck are on show and must be modelled.

## Next

1. The expression states from C13 to C16 (eyes shut, half shut, mouth shapes) set into the face, so she blinks and talks. Views from above and below against C6 and C7.
2. Human ears. Hair pass (C5, C8, C10, C11).
3. Then back to the HOW-TO order: hands, boots, trousers and the rest of the costume from round 2, tools, spells.

## Third round the same day: blink, talk and laugh; the neck's tone

Chris: cut the expression sheets in, and he suspected a skin-tone step between neck and face.

**Face states** (`bake_fox.py`, after the side layer; the engine already had the slots):

| State | From | How it is placed |
|---|---|---|
| `shut` (and `half`, the same patch) | C14, lower left (eyes closed) | the middle of each closed lash line, (219, 727) and (365, 727), goes 11 px under each of C3's pupils |
| `oh` (talking) | C16, upper right (the "oo" mouth) | by the distance from its pupil row (191.8) to the middle of its mouth (1314.6, 356.8) |
| `smile` (laughing) | C14, upper right (open grin) | pupil row 188.6, mouth middle (1253.4, 345) |

- All points were read by eye off gridded copies (`shots/C14_grid.jpg`, `shots/C16_grid.jpg`). Pupils in C14 and C16 are 142 to 143 px apart; in C3, 107.5. So the sheets are finer than C3's front face.
- Only the eyes or the mouth are lifted, as soft-edged boxes with their tone matched to the neutral face round the rim.
- The talking patch had to be wider than the mouth (66 px either side), or the corners of her resting smile showed beside the "oo".
- Check picture of the canvas: `shots/bake_states.jpg`. Check on the model: `./states.sh e1` (rest, mid-blink, talk at 0.40 s, laugh at 0.70 s; front and turned).
- The talk move opens her mouth at 0.4, 0.6 and 0.9 s; a still at 0.3 s shows it closed.

**Neck tone.** Measured: face `#d89780`, under the jaw `#bc765e`, chest (B1) `#efa886`. The neck had been one flat face tone, lit brighter than the painted face above it and darker than the painted chest below. It is now its own material (`neck` in `src/70_anim.js`): chest tone below the choker, face tone above it, darkening into the shade under the jaw. The oval of the front painting was also pulled in (0.061 by 0.088 m) so the shade her hair throws on the edge of her face is not carried round her cheeks.

**Not done:** no half-shut painting exists (ask for one in a later round, or the blink stays a snap). C16 has six mouths and C15 six more expressions; the engine has one talking mouth, so using the rest needs a small change to `paintFace`. A1's neck is short (the choker meets the chin); C3's is about 25 mm longer. The model follows A1.

## Fourth round the same day: no teeth, three talking mouths, above and below, round 3 stored

**Chris, 12 Nov: "Please don't make her smile show teeth. Take out all of the teeth." This is a standing rule for her face.** He also set the order for what is left on her head: extra talking mouths, the checks from above and below, her own ears, then her hair.

- The open grin (C14, upper right) is no longer used. When she laughs she keeps her closed-lip smile and shuts her eyes.
- Talking mouths, none showing teeth, all from C16: lips just parted (upper middle), the "oo" (upper right), the pucker (lower right). `paintFace` in `src/40_head.js` takes the next one each time her mouth opens (`TALK`). C16's "ah" (lower left) and "ee" (lower middle) show teeth and are left out.
- Landmarks for the two new mouths: `shots/C16_grid2.jpg`. The pucker cell's face is a little larger (pupils 148 px apart, not 142).
- **Above and below** (`deliver/Fox_above_below.jpg`, against C6 and C7): the face holds as a face from both. Nose and lips keep their paint from below. Two things to fix later, neither in the face's shape: from above, the top of her hair is a smooth dark cap and the bun's core shows as a ball (hair pass); from below, the edge of her jaw is too sharp and the neck reads as a separate block under it.
- **Round 3 arrived and is stored**: 22 paintings, H1 to H13 and I1 to I9, as WebP in `models/fox-3d/references/round3/`. Not used yet; they are for her tools and spells.

**Chris's question, not yet decided:** could all four witches literally take the Jester's face, so they are one person in different outfits? It can be done: the Fox is built from the Jester's code, so the Jester's head tables and face pictures drop in. What comes with it: the Jester's blink and mouth states (including the half-shut eyes the Fox lacks), her make-up unless repainted, and a tone match to each body's neck and chest. What is lost: the Fox's own face from C3 and her expression sheets. If he wants it, do it **before** her ears and hair, because both sit on the head's shape.

## Next

Her hair (C5, C8, C10, C11): the top is a smooth dark cap, the bun's core shows as a ball, the curls are ribbons. Then the HOW-TO order: hands, boots, trousers and the rest of the costume from round 2, tools and spells from round 3.

## The Jester-face test (12 Nov, late)

Chris asked for the comparison: the Fox as she is now, beside the Fox with the Jester's face swapped in and glasses on.

- `make_jface.py` builds the test. It takes the Jester's head tables (`FACE_MID`, `NOSE`, `NOSE_W`, `FACE_V`, `HR`, her lip, chin and cheek numbers, her jaw taper) and her baked face pictures (front, side layer, layout, blink and mouth states), and keeps everything else of the Fox: body, hair, costume ears, glasses, choker, jawline, neck.
- Her face pictures are shifted to the Fox's skin tone (gain 0.995, 0.95, 0.883; the Jester's skin `#d99f91` is pinker than the Fox's `#d89780`).
- Outputs: `variants/jface/40_head.js`, `out/fox_jface.js`, `out/fox_tex_jface.js`. To get a page from them, copy the two `out` files over `out/fox.js` and `out/fox_tex.js`, run `./build_site.sh` and `python3 build_single.py`, then put the Fox's own files back (`out/fox_own.js`, `out/fox_tex_own.js`).
- Delivered: `deliver/Fox_face_comparison.jpg` (front, turned, profile, laughing; own face on top, Jester's below), `deliver/Fox_Jester_face.html`, `deliver/Fox_own_face.html`. `facetrio.sh` makes each row.
- All 54 stance and move pairs run on the test build. Glasses, hair and ears place themselves from the face's own landmarks, so nothing needed moving.

**What the test shows**

- It works with no hand-fitting: the swap is one script.
- **The Jester's make-up comes with her face**: winged liner, the painted marks under her eyes, rouge. On the Fox it reads as the Jester in a wig and glasses. One shared face for all four would need a clean, un-made-up face painting, with each witch's make-up as a layer on top.
- Her face is narrower and longer in the jaw than the Fox's, and her nose sharper in profile.
- Her laughing mouth is closed, so it keeps the no-teeth rule. She also has the half-shut eyes the Fox lacks.

## Decided, 12 Nov: the Fox wears the Jester's face

Chris compared the two builds and chose: **"Use the Jester's face. Continue with the rest of the Fox model using the Jester face."** Her make-up comes with it, as he saw it.

- `make_jface.py` is now part of the main build. It writes `src/40_head.js` and `out/fox_tex.js`. Order: `python3 -I bake_fox.py`, `cp out/fox_tex.js out/fox_tex_own.js`, `python3 make_jface.py`, `./build.sh`.
- The Fox's own face is kept, not deleted: her head code with her own tables in `variants/ownface/40_head.js`, her own bake in `out/fox_tex_own.js` (copy in `variants/ownface/`). `meas/fox_headfit.py` now writes there. To go back, copy that head file over `src/40_head.js` and that bake over `out/fox_tex.js`.
- Edits to the head's shape that are the Fox's own (her jawline `JAW`, the neck core, the talking-mouth cycle) are made in `variants/ownface/40_head.js`; `make_jface.py` carries them across and swaps in only the Jester's tables.
- The Jester's picture had a dark smudge above the forehead where the point of her cap sat. Her cap hid it; the Fox's hair is drawn back. `clear_cap_mark` in `make_jface.py` fills it.
- Her states are the Jester's: eyes shut, eyes half shut, one talking mouth, a closed smile. None shows teeth. The Fox's three talking mouths from C16 are not used now.
- This is a choice about the Fox only. Whether the Ranger and the Herbal Witch also take the Jester's face is for Chris to say to those sessions.

## Her own ears

`foxHumanEars` in `src/45_foxhead.js`: a thin shell with a rolled rim, a bowl and the ridge inside the rim, 3.2 cm front to back and 5.8 cm tall, top level with her eyes and lobe level with the foot of her nose (measured in C3's profile), back edge standing off the head. Plain skin tone. The arms of her glasses run to them. Check with the curls hidden: `T.j.debug.meshes.curl.visible = false`.

The edge of her jaw is softer from below (`e` 0.0035 to 0.0060 in the jaw floor).

## Later on 12 Nov: her own painting on the Jester's head; forehead; hair to the hair sheet; round 4

**Chris changed the face decision the same evening.** After seeing the Jester's face on her: "I do like how good the face looks, but it's still the Jester ... it needs to be a slightly different face." The four are unique characters. He wants the Fox to look like she does in round 4, and proposed: use the Jester's 3D model and put a new painting on it, "stretched perfectly".

**What the main build is now:** the **Jester's head shape** (her tables, via `make_jface.py`) wearing the **Fox's own painted face** (sheet C3, with her blink and three toothless talking mouths from C14 and C16). `PAINT = 'fox'` at the top of `make_jface.py`; `'jester'` gives the Jester's painting back.

- The fit needed almost nothing. Her painting is already laid out on the Jester's lines: eyes at 1.5246, lip line 0.066 below, under the nose and under the chin within 1.5 mm. Only her eyes are 1 mm further apart each side, so her picture and her face states are squeezed sideways by 0.968.
- Her face picture is soft close up: C3's front face is 107 px between the pupils; the Jester's was painted far larger.

**Round 5 asked for:** `claude/fox-3d-round5-face-prompts.md` (three prompts: F1 her face straight on, F2 six states, F3 front, turned and side), made to look like round 4 and to lay onto this head. When they arrive: read pupils and lip line off a grid, bake F1 in place of C3's front panel, cut the states from F2, check the shape against F3.

**Forehead.** Chris: "her forehead might be a little big ... pull the top of the head down half an inch, without changing anything else." `FORE_DROP = 0.0131` in the head code (`variants/ownface/40_head.js`): everything above the brow slides down 12.7 mm on her; the brow and all below stay. Hairline, hair and costume ears come down with it. Not measured from a painting; it is his call by eye.

**Hair, restyled to C10 (her hair alone).** The comparison (`deliver/Fox_hair_vs_C10.jpg`) showed the first hair was wrong in kind: a mane down the back and a mass at the sides. C10 shows the sides and nape drawn up close and dark, the ears clear, **one tall pile of curls** on top that spills back behind the head (its top about 11 cm above the skull), two long ringlets in front of each ear and a few at the nape.

- `massGrow` returns nothing now (no body of hair at the sides or back).
- The close hair (`scalp` material) is drawn strands, dark with a few gold ones, running back to the pile.
- `foxBun` is the pile: centre (0, 1.660, -0.112), 300 curls, none pointing forward over the costume ears.
- Hanging ringlets: 16, by the ears and at the nape. Halo curls only round the foot of the pile. Curl ribbons rounder (0.72), colour warmer and more copper.
- Lesson repeated: a `//` comment in the middle of a line swallowed half a statement and broke the build. The HOW-TO already says never to do it.

**Round 4 stored:** 15 paintings (J1 to J11, K1 to K4) as WebP in `references/round4/`. Not used yet; they are her spells.

**Still weak:** her curls are tubes, not soft hair; the pile is plainer than painted; her glasses are thin wire where round 4 paints thicker dark frames; her face is soft close up until round 5 arrives.

## Next (Chris's order)

Hands, boots, trousers, then the rest of the costume. Then tools and spells. The face waits for round 5.

## Hair, third style: loose, messy, heavy bangs, and it moves (Chris, 12 Nov evening)

Chris, after the tall pile: "Make it a smaller messy bun and use the loose messy hair to cover her whole head, so it's almost unkempt looking, and heavy, heavy parted bangs, so her ears are there but they're being hid. They're behind moving hair, and the hair moves." This replaces the C10 pile. It is his direction, not a painting's.

**Style** (`src/45_foxhead.js`):
- Bun: small, centre (0, 1.648, -0.086), 120 short curls. It sits in the mess at the back of the top; it does not stand out.
- Loose curls all over: 300, from near the crown down to her ear lobes at the sides and her nape at the back, hanging (droop 3 to 9 cm).
- Hanging locks: 46, rooted above her ears all the way round, 10 to 20 cm long, standing 1.6 to 3.4 cm off her head so they clear her ears. Her ears are modelled and hidden.
- Bangs: 22 thick locks each side, off a centre parting, across the corners of her forehead and down beside her eyes to her cheeks.
- From the front her face is clear. From the side her hair hides her face almost wholly.

**Movement.** Seven spring chains hang from her head bone (`hairChain` at the top of `45_foxhead.js`; registered in `src/70_anim.js` with `makeChain`, the same springs as the Jester's horn tips): bangs each side, the hair over each ear, the hair each side of her nape (four bones each), and the bun (three bones, held firmer). Each loose lock is skinned to the nearest chain by height (`hairW`, `sideOf`, `curW`): the top of a lock stays with her head, the lower part swings. Short forehead wisps and the curls high on her head stay rigid.

- Measured swing of the chain bones: 0.1 to 0.4 degrees at rest; 9 to 18 degrees for bangs and sides in a jump; 5 to 6 in a twirl. The bun reached 41 degrees before it was stiffened.
- All 54 stance and move pairs run. **How the swing looks in motion has not been seen**: the test machine draws about 2 frames a second. Chris judges it on his phone. The numbers to turn are in the `makeChain` call: `stiff` (higher = stiffer), `damp`, `grav`.
- A copy of the hair before this change: the C10 pile is in the repo history (commit "her own painted face on the Jester's head; hair to the hair sheet").
