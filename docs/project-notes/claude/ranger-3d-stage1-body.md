# Ranger 3D model: stage one, body and base outfit (November 12, 2026)

Read after `claude/HOW-TO-3d-witch-models.md` and `claude/ranger-3d-reference-prompts.md`.

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (first version `1794507410-1d7b`). Republish every stage to this link.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model` (starts from the Jester's branch at pass 20), folder
  `models/ranger-3d/`, commit `1d4c9d6`. Its `README.md` has the code-level detail, her measurements and the build commands.
- File sent to Chris: `Ranger_3D_stage1.html` (2.9 MB, opens offline).

## What Chris asked for (his words)

- "look at the lore document and pick which witch you would like to animate. I think one of them is potentially much harder to
  animate, I think specifically the fox"
- "a prompt request HTML file that includes reference photos and list of prompts for me to take to chatGPT to generate all of
  the reference images for you to make one of these witches"
- "I am open to additions as long as they don't take away from the lore and also artistic interpretations of how to do the
  animations that are described in the lore"
- Then he ran all 67 prompts and sent the paintings in nine zips ("I already have all of the zip folders", "And here's round one").

## What was done

- **Witch chosen: the Ranger.** Her fitted outfit shows the body, and she brings glasses, visible hair and hand-held weapons in
  their simplest form. The lore makes her a fighter. Io is next in difficulty; the Fox is last.
- **All 67 paintings checked** (A1 to I6). They agree with each other; none needs redoing. A1 is the full-outfit master, C1 the
  face master.
- **Her folder** started from a copy of the Jester's model code. The skeleton is the Jester's, except her knee is at 0.51 m
  (the Jester's is 0.47) and her shoulder sits 2 cm further back.
- **Measured** from A1, B1, B2 and B3. Every full figure is 1.665 m from hair-top to soles; eye line 1.50 m, the same as the Jester.
- **Built**: body, corset, lace top, shorts, leggings, boots with scrunched socks, stiff lace sleeves. 188,076 triangles.
  The corset, top and shorts are one picture wrapped right round her, baked from four painted views (front, back, both sides).
- **Page**: drag to turn her; views (Front, Three-quarter, Side, Back, Corset, Legs, Boots); arms and legs (At rest, As painted,
  Arms out); toggles (Painting beside her, Turn slowly, Lace sleeves); a plain list of what is and is not there.

## What is a placeholder, and what is not built

- The head is a plain form: no face, hair, headband or glasses.
- Arms and hands are plain skin. The sleeves are stiff and follow the upper arm.
- Not built: the strap hooks as real objects, belts, satchel, pouch, charms, necklaces, bracelets, bow, sword, knives, cloth,
  and all movement and spells.

## Checked, and not checked

- Outlines, model against painting (`tools/cmp_r.py`): hips, waist, bust, thighs, knees and calves are within about a centimetre
  of B1 (front) and B2 (side). The calf is the furthest out: 0.123 m deep against 0.130 painted.
- The page ran in a headless browser at phone and laptop size: no errors, nothing off the side of the screen, dragging and every
  button work.
- Not checked: on a real phone. Nothing moves yet, so motion cannot be judged.
- Known rough spots: the sides of the torso under the arms are filled in from thin evidence; the shins are straight where B1 has
  them angled a little outward; the side paintings lean (hips about 5.7 cm ahead of the shins) and the model stands upright.

## Choices waiting for Chris

None of these has his yes yet.

- **Is the base outfit right?** The how-to says the base outfit is approved before outer layers go on.
- **Leggings** follow B3: sheer black lace over skin. The F10 tile came out as pale flowers on black and was not used.
- **Boots** have nine rows of eyelets, as painted.
- **Folded bow**: the limbs will curl into the crescents like fern tips. The folding-bow sheet is a concept, not a fixed design.
- **Sword and knives** are new designs (G4, G5). Carry: bow on her back, sword at her left hip, knives across the back of her belt.
- **Additions offered**: the bowstring and arrows are light; "the moment" (things hang still for a breath when she uses magic);
  a court-trained fencing posture; her glasses catch the light.
- **Silverglass** read as something she casts on herself. This changes how a lore spell is shown, so it needs his yes.
- The smaller choices listed in `claude/ranger-3d-reference-prompts.md` (satchel side, shorts over leggings, earrings and so on).

## Next stages, in the how-to's order

1. Head from her profile (C3), face baked on from C1, hair, headband, glasses (C12).
2. Hands and painted arms (D1, D2).
3. Boots against E1 to E8 once more.
4. Strap hooks, belts, satchel and pouch as solid things.
5. Sleeves as cloth.
6. Necklaces, charms, bracelets.
7. Bow, sword, knives (G1 to G7).
8. The Jester's body moves in her clothes (bring over the animation files from `models/jester-3d/src`).
9. Her own moves and spells with effects (I1 to I6).
10. The full page.

## Rules learned this stage

| What happened | Rule |
|---|---|
| Lifting her dark clothes off the plum background by colour distance broke the figure into pieces | Fit the background as a smooth surface first, then weigh colourfulness as well as distance (`tools/sil.py`). |
| A measuring script printed a whole picture as numbers and flooded the session | Scripts print sizes and tables, never arrays. |
| Lace showed as rectangles on the shorts | The leggings must start below the torso (0.80 m), and the cuffs of the shorts must sit outside the leg. |
| Shoulders looked boxy and a different colour from the chest | Start the arm as a dome, and light plain skin the same way as painted skin (the `skinChest` colour). |
| Painted hair and shadow landed on the neck | Fade the wrapped picture to plain skin above the collarbones. |
| Check pictures came out from above and behind | Camera angles in `shoot.py` are in radians, not degrees. |
| The page test ran past ten minutes | Software rendering takes about 27 seconds a picture; run page tests in the background. |
| The side paintings lean | Take the lean out when measuring and baking; build her upright. |
