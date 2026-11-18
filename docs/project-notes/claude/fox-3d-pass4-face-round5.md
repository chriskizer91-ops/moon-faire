# Fox Witch 3D – pass 4: her face from the round 5 set (12 Nov 2026, evening)

Written by Claude. Follows `claude/fox-3d-pass2-head.md` and `claude/fox-3d-pass3-hands-boots.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model`.

## What arrived

Chris made the face set asked for in `claude/fox-3d-round5-face-prompts.md`, plus nine more views:

| File (in `references/round5/`) | What it is |
|---|---|
| `F1r5` (1254 square) | her face straight on, hair back, no glasses, closed-lip smile |
| `F2r5` (1536 x 1024) | six states in a 3 x 2 grid: unchanged, eyes shut, eyes half shut; lips parted, "oo", broader closed smile |
| `F3r5` (1536 x 1024) | front, turned, true profile, with the tall pile of curls |
| `01-Front` to `09-Low-right` (1024 x 1536) | nine head views: front, left and right 45, left and right 90, high left and right, low left and right |

No teeth in any of them.

## What the build is now

**Her own head shape wearing her own new painting.** `HEAD = 'fox'` at the top of `make_jface.py`: it copies `variants/ownface/40_head.js` to `src/40_head.js` and her own bake to `out/fox_tex.js`. The Jester's head tables and painting are no longer in her build (set `HEAD = 'jester'` to see them again).

- Why her own head again and not the Jester's: the paint must sit on the relief. Her painted nostrils are 7 mm lower than the Jester's sculpted ones, so on the Jester's head her nose would be doubled. Her own tables (fitted to her profile in sheet C3) agree with F1 to about 3 mm: under the nose 1.4815 against 1.4783, under the chin 1.4149 against 1.4171.
- **The head has not been refitted to F3's profile yet.** It still uses the C3 fit.

## The bake (`bake_face_r5.py`)

- F1 landmarks, read by eye off `shots/F1_grid.jpg`: pupils (459, 532) and (809, 532); the line between the lips 904. So 5636 px a metre of head, and her eyes 31.0 mm either side of the middle. F1 goes onto the canvas at almost one pixel for one (the canvas is 5120 px a metre); the old C3 face was 1712.
- Hair and backdrop are masked out and her skin carried outward, as before. Her skin in this set is warm and freckled (red minus blue up to about 115), so the hair test had to be set above that (dark below 105, or red minus blue above 128), and the middle of her face is never treated as hair. With the old thresholds her cheeks were masked and came out blurred.
- **States are placed by matching, not by eye.** The first box of F2 is "the face unchanged", so F1's own eyes, shrunk, are slid over it to find its pupils: (149, 100) and (363, 100), which makes F1 1.636 times F2. Every other box is placed by its nose against the first box's nose (offsets within 3 px of the 512 grid). Then eyes or mouth are lifted as soft-edged patches with their tone matched round the rim.
  - `shut` box 2, `half` box 3, `oh` box 4 (lips parted), `oh2` box 5 ("oo"), `smile` box 6. She has real half-shut eyes now.
- It writes into `out/fox_tex_own.js` and removes the side pictures cut from C3 (`faceSide`).
- Check picture: `shots/bake_face_r5.jpg`.
- Tones: face `#e1a086`, under the jaw `#ce7e65`. Arms and hands take the face tone.

## Glasses

The lenses are no longer drawn. Even at 3% they laid a pale blue-grey film over her eyes and made hazel eyes look grey. The frames stay.

## Build order now

```
python3 -I bake_fox.py && cp out/fox_tex.js out/fox_tex_own.js      # body atlas (and the old C3 face, which the next line replaces)
python3 -I bake_face_r5.py                                         # her face and its states
python3 -I bake_hands_fox.py && python3 -I bake_boot_fox.py && python3 -I bake_patch_fox.py
python3 make_jface.py && ./build.sh && ./build_site.sh && python3 build_single.py
```

## Not done

1. **Refit the head to her new profile.** F3's side view, and `04-Left-90` and `05-Right-90`, show her profile at a larger size than C3. Run `meas/fox_profile.py` and `meas/fox_headfit.py` on it (new crop boxes and grid-read pupils), then `prof_check.py`.
2. **Paint for the sides of her face** from the 90-degree views. Her loose hair covers most of it.
3. **Check against the nine views** from the same angles (`c3cmp.sh` pattern): 45s, 90s, high, low.
4. Her hair in round 5 is the tall pile again, but Chris approved the loose, messy hair with heavy bangs. The hair stays as approved unless he says otherwise.
5. Glasses: round 4 paints thicker dark frames; the model's are thin wire.
6. Motion cannot be judged on the test machine.

## After the new face (Chris, 12 Nov, 19:45): "that is much better"

His instructions, with a new standing painting (raised finger, belt, pouch, sheath; stored as `refs/R6_point.png`):

1. **Do not refit her head to the new side views. Only resize it to the standing painting.** Read off a grid (`shots/R6_head_grid.jpg`): eye row 161, lip line 211, chin 243, soles 1505, so eye to lip is 50 px and eye to chin 83 px of 1344 px from soles to eyes. That is 8 to 9% smaller than A1's head. Head bone scale 0.93 to **0.85**, head lowered 0.0133 instead of 0.0233, which keeps her eyes at the same height and shows about 2 cm of neck above the choker, as the painting does. That painting is 861.7 px a metre, the same as A1; her ribs, waist and shoulder height already agree with it.
2. **Her skin repainted to her face's tone, body too.** `tone_skin_fox.py` shifts only skin-coloured pixels in her painted chest and back and her painted hands to the face tone `#e1a086` (chest was `(220,151,116)`, hands `(215,145,128)`) and sets the neck's lower tone to match. Run it after the other bakes.
3. **Trousers: same size, reshaped.** The two flounces over each leg are longer and end in three deep points (upper hem about 0.52, lower about 0.375, dips of 10 and 8.5 cm), standing further off at the hem, as the painting's layered pointed tiers do. Leg size is unchanged.
4. **Belt, pouch, sheath** (`src/47_foxtrousers.js`, end): a leather belt slung 2 cm lower on her left hip, brass studs and buckle, a pouch with a flap on her left, a sheath on her right with the two bows of her shears standing out of it. Simple rounded shapes carried by her hips. Materials `belt`, `pouch`, `steel`.

Build order gains one line: `python3 -I tone_skin_fox.py` after the hands, boot and patchwork bakes.

## The flounces as real cloth (Chris, 12 Nov, 20:38: "Yes let's turn the trousers into real cloth flounces")

The four flounces (two over each leg) are now cloth that hangs, swings and settles. The legs and hips of the trousers are still shapes carried by her legs.

- `src/47_foxtrousers.js` no longer adds the flounces as parts. It stores their shapes in `FLOUNCE`.
- `src/71_foxcloth.js` turns each one into a cloth sheet with the Jester's cloth engine (`makeCloth`): wrapped round the leg, pleated, the top row sewn to the leg, the second row half held, the rest free. It must come after `70_anim.js`.
- `src/50_cloth.js` gains what the cloth lies on: her two trouser legs (thigh and shin) and her hips, as mask 32, declared before `const NCOLL`.
- Picture: `deliver/Fox_cloth_flounces.jpg` (front, side, twirl, kneel, jump).

Two faults found and mended on the way:

1. **A strip of patchwork lay on the floor by her foot.** The sheets were drawn with the trousers' own material, which is made for skinned meshes (three.js r128, `skinning` on). A cloth sheet is a plain mesh. Each sheet now has a material of its own (`clothMat` in `71_foxcloth.js`), with the same patchwork.
2. **Grey showed at her hips in a jump.** The plain legs under the trousers poked out through them when a thigh lifted. The rigid flounces had been hiding it. The hidden legs are now 60% as thick above the ankle (`src/30_body.js`).

Checks: all 54 stance and move pairs run with no broken numbers. The page loads and runs offline at phone size; the only thing it cannot fetch offline is the web lettering, so it falls back to the phone's own. One frame of her moves costs about 2 ms on the test machine in the phone build.

Not checked: **how the cloth moves.** The test machine draws about 2 frames a second, so only stills can be judged there. Chris has to look at the swing on his phone. If it is too floaty or too stiff, the numbers to turn are in `71_foxcloth.js`: `grav` (weight), `drag` (air), `bend` (stiffness), `flutter`, and the `pin` values for how much of the top is held.

Still to do from his list: the trouser legs themselves as cloth, if he wants that after seeing the flounces.
