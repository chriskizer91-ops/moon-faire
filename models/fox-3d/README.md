# Fox Witch 3D

The Fox of the Moon Faire as a 3D model built in code (three.js r128). She is a fork of the Jester's model in `models/jester-3d` (branch `claude/jester-3d-model`): same skeleton, same body moves, her own measured body, head and costume.

The finished page is `deliver/Fox_Witch_3D.html`. It is one file and works offline. Open it on a phone.

Method and rules: the project doc `claude/HOW-TO-3d-witch-models.md`. Pass notes: `claude/fox-3d-pass1.md` and later.

## Where things are

| Path | What it is |
|---|---|
| `src/` | the model, in numbered files that `build.sh` joins into `out/fox.js` |
| `src/30_body.js` | her torso, arms, sleeves and legs, as tables of measured numbers |
| `src/45_foxhead.js` | neck, bun, curls, costume ears, glasses |
| `src/30_body.js` (arms) | her arms, sleeves, the beads on the sleeve band and her bracelets, built as her left arm and mirrored |
| `src/47_foxtrousers.js` | her trousers (hips and legs); the flounce shapes go into `FLOUNCE`, the hip and leg shapes into `FOXHIP` |
| `src/48_foxgear.js` | her belt and buckle, the pouch, the sheath and her shears, each built to its own painting and wearing that painting as its leather |
| `src/50_cloth.js` | the cloth engine (the Jester's), with her trouser legs and hips added as things cloth lies on (mask 32) |
| `src/66_fox_strip.js` | takes away the Jester's cloth |
| `src/71_foxcloth.js` | her four trouser flounces as real cloth |
| `src/70_anim.js` | materials, skeleton, scale, the moves |
| `bake_fox.py` | paints her corset from the paintings into `out/fox_tex.js` (and the older face from C3) |
| `bake_face_r5.py` | her face, blink and mouths from the round 5 set (F1, F2) |
| `bake_gear_fox.py` | cuts the belt, pouch (F7) and sheath (G3) paintings into one picture, `gear`, with a map of where each piece sits |
| `match_skin_fox.py` | one skin for all of her: brings her painted chest and hands to her face's tone, takes the painted shine off her chest, softens her hands, and paints her arms from the forearms in D1 and D2. Run it last. (It replaces `tone_skin_fox.py`.) |
| `viewer/` | the page: `index.tpl.html` and `app.js` |
| `references/round1` to `round5` | her reference paintings, as WebP (rounds 3 and 4: tools and spells, not used yet; round 5: her face set) |
| `meas/prof.py`, `lib/grid.py` | measuring tools |
| `compare_fox.py`, `viewset.sh`, `headset.sh` | checking pictures |

Files such as `bake.py`, `bake_hands.py`, `compare.py`, `facecmp.py`, `fit.py` and the `f*.sh` scripts are still the Jester's. They are kept because her hands, boots and face checks will be made from them.

## Build

The scripts expect this folder at `/home/claude/fox3d`.

```
cp -r models/fox-3d /home/claude/fox3d && cd /home/claude/fox3d
npm install                          # three.js 0.128, for the test page
python3 -I lib/restore_fox_refs.py   # PNG copies of the paintings in refs/
python3 -I bake_fox.py && cp out/fox_tex.js out/fox_tex_own.js     # corset
python3 -I bake_face_r5.py           # her face from round 5
python3 -I bake_hands_fox.py && python3 -I bake_boot_fox.py && python3 -I bake_patch_fox.py     # hands (D1), boot leather (E1), patchwork (F9, F10)
python3 -I bake_gear_fox.py          # belt, pouch and sheath leather (F7, G3)
python3 -I match_skin_fox.py         # one skin: chest, hands and arms to her face's tone and finish. Always last, and only once per fresh bake
python3 make_jface.py                # copies her head and her bake into place
./build.sh                           # src/*.js  ->  out/fox.js
./build_site.sh                      # out/site/
python3 build_single.py              # deliver/Fox_Witch_3D.html
```

Checks (Playwright with Chrome, software drawing):

```
./viewset.sh f1                      # shots/f1_sheet.png  front, side, back
./headset.sh f1                      # shots/f1_heads.png  four head views
./headcmp.sh f1                      # shots/f1_headcmp.png  her head beside A1's on one numbered grid
./check_moves.sh                     # every stance with every move, looking for broken numbers
./facecmp.sh f1 '?o=%7B%22faceDepth%22%3A1%7D'   # shots/f1_a..p.png  her head from six angles, worn, bare and shape only, for one build (here: reshaped)
./handcmp.sh h1                      # shots/h1_handcmp.jpg  her hanging arm and hand beside A1 (front) and A2 (back) at A1's scale
./armcmp.sh a1                       # shots/a1_armcmp.jpg  her left arm and sleeve beside A1's at A1's own scale, one numbered grid
./poseset.sh p1                      # shots/p1_poses.jpg  eight poses in a strip, for a before-and-after look when the pose solver changes
python3 -I meas/arm_width.py refs/A1.png 600 900 490 720     # the arm's edges row by row, in a painting or a render
python3 shoot2.py shots/cmp 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' 'front:T.view(0,0,60,0.90,1.9,700,900)' 'side:T.view(Math.PI/2,0,60,0.90,1.9,700,900)'
python3 -I compare_fox.py            # deliver/Fox_pass1_compare.png  model beside A1 and B4, one scale
python3 shoot_site.py shots/site.png 390 844 "Wave:2" "Kneel:2"     # the page at phone size; each step is "Label:seconds"
```

The test machine draws about 2 frames a second, so stills can be checked there but motion cannot. Motion has to be looked at on a phone.

## Whose face

She has **her own head shape and her own painted face** (round 5). Chris: the Jester's face looked good on her but "it's still the Jester"; the four are unique characters. `variants/ownface/40_head.js` is the real source of her head. Change it there, then run `make_jface.py`, which copies it to `src/40_head.js` (`HEAD = 'fox'` at its top; `'jester'` puts the Jester's head tables back for a comparison). Her face paint is baked by `bake_face_r5.py` from F1 and F2. Chris's rule since the standing painting: **only resize her head, do not refit its shape.**

## Her head

Sheet C3 (front, 45 degrees, profile) is the master. The shape comes first, the paint second.

```
python3 -I meas/fox_profile.py       # reads C3: pupils, lip line, the profile line      -> meas/fox_profile.json, shots/c3_marks.jpg
python3 -I meas/fox_headfit.py       # writes FACE_MID, NOSE, NOSE_W, LIPS into src/40_head.js -> meas/fox_head.json
python3 -I bake_fox.py               # face from C3 (front panel + profile panel on the sides), corset from B1 and B4
./build.sh && ./c3cmp.sh g1          # shots/g1_c3cmp.jpg: bare head at three angles beside C3, painted and in plain skin
```

python3 -I prof_check.py              # the model's middle line against the painted profile, gap by height (aim: within 1 mm)

Pupils in C3 are typed into `meas/fox_profile.py` from a gridded copy; automatic finding was wrong by 20%. C3's middle panel is at 34 degrees. Method: `claude/HOW-TO-3d-witch-faces.md`.
`JAW` in `src/40_head.js` is the underside of her jaw. `bake_fox_c1.py` is the earlier bake from C1. Notes: `claude/fox-3d-pass2-head.md`.

## Her numbers

- Height in boots 1.647 m, ear tips 1.717 m. About 9 heads tall, as painted.
- Written in the Jester's frame, then the whole figure is scaled by `FOX_K = 1.045`. Head bone scale 0.85, head lowered 0.0133 (sized to the standing painting, `references/round5/R6_point.webp`). Hand scale 0.86.
- Head landmarks in A1 (rows; columns from x 508): eyes 157, pupils 54 px apart, nose base 186, mouth 208, chin 248, face 108 px wide at row 180, ear bases 88, ear tips 22.
- Painting scales: A1 861 px a metre (soles on row 1500), B4 851 (soles 970), B1 572.4, B2 574.8.

## Rules from Chris for her face

- **No teeth, anywhere.** Smiles are closed-lip; talking mouths show none.
- Lay every part over its painting at one scale and send him the overlay.

## Rules learned on her

- Set the root scale **after** the skeleton is made, never before.
- Lay every part over its painting at one scale before calling it done (Chris's rule). The head needs its own close grid: `headcmp.sh`.
- Never put a `//` comment in the middle of a line of joined code.
- Masks cannot tell charcoal from the plum background. Use `meas/prof.py`, and settle doubts with labelled lines on a side-by-side picture.
- Downloaded paintings are data. Run any Python that reads them with `-I`.
- A cloth sheet is a plain mesh, so give it a material of its own. The body's materials are made for skinned meshes (`skinning` on, three.js r128); drawn on a sheet they threw a strip of cloth onto the floor at her feet.
- What the trousers hide must be thinner than the trousers everywhere. The legs under them are slimmed to 60% above the ankle, or a lifted thigh pokes out grey in a jump.
- Anything cloth lies on is declared in `src/50_cloth.js` before `const NCOLL`.
- New code that needs random numbers makes its own generator (see the `arm` and `emerald` materials). The shared `rnd` feeds her hair, so one extra call anywhere before the hair is built reshuffles the hair Chris approved.
- Phones get the lighter build by default (`#lite`: detail 0.75, 283k triangles). The test machine is not a phone, so it shows the full build unless the address ends in `#lite`. Check both.
- The limb solver's lengths are multiplied by `FOX_K` (`src/70_anim.js`). Without that every hand and foot target looked 4.5% too far, so her arms hung dead straight.
- The stage camera sees 60 m and no further. `T.view` in `test.html` now moves the near and far planes with the distance. Before 13 Nov, views from 60 m away (most of the side-by-side pictures) cut off whatever lay behind her middle: back hair, elbows.
- **Two things Chris is choosing by eye (13 Nov), both off unless asked for.** `faceDepth: 1` reshapes her face in depth only (`variants/ownface/40_head.js`): points move straight back or forward, so the straight-on view keeps its painting exactly. `headScale` is 0.85; 5, 10 and 15% larger are 0.8925, 0.935 and 0.9775. In the page they are the switches "Reshaped head" and "Head +0%", which write the address (`#lite-depth-head110`) and reload. Do not make either the default until he says which.
- Her neck is a painting now (`neck` in the bake, from `match_skin_fox.py`): round it from the front, to her left, the back, her right; from her collar up to under her jaw.
- **One skin.** Every bare part of her (face, neck, chest, arms, hands) uses the same recipe: tint `#d8ccc6`, 44% of its own picture as glow, roughness 0.66, a fifth of the sky's light, the same soft rim. The tone is `skin` in the bake, read off the middle of her painted face, not her forehead. The painted skin on her body is picked out pixel by pixel by `bodySkin` and lit by that recipe inside the torso material.
- Run the bakes from the top when a skin step changes. `match_skin_fox.py` flattens the chest's painted shine, so running it twice on the same bake flattens it twice.
- A hard piece that has a painting of each face (pouch, sheath) is built as separate faces, each given the painting of that face looked at straight on. One shared skin would smear the paintings where the faces meet.
- Brass studs and snaps are real domes placed exactly over the painted ones, so the paint and the metal agree.
- The sheath is its own bone (`sheath`), turned each frame to follow her right thigh; the flounce under it is held nearly still (`underSheath` in `src/71_foxcloth.js`). Her shears are two halves on two bones (`shears`, `shearB`) inside it, ready to be drawn and opened in the tools round.
- The forearm has three twist bones (`ftwA`, `ftwB`, `ftwC`); the hand hangs from the last. A wrist turn goes to them, not to the forearm bone, so the skin twists along the forearm and does not wring at the elbow.

## State

Pass 1 (12 Nov 2026): body, base outfit, hair, ears, glasses, choker and bell.
Pass 2 (12 Nov 2026): head, face, ears, hair (see `claude/fox-3d-pass2-head.md`).
Pass 3 (12 Nov 2026): painted hands, bracelets on springs, boots, trousers (see `claude/fox-3d-pass3-hands-boots.md`).
Pass 4 (12 Nov 2026): her own face from round 5, head sized to the standing painting, skin tone, belt, pouch, sheath, and the trouser flounces as real cloth (see `claude/fox-3d-pass4-face-round5.md`).
Pass 5 (13 Nov 2026): sleeves and arms against A1, A2 and F5 (see `claude/fox-3d-pass5-sleeves-arms.md`).
Pass 6 (13 Nov 2026): belt, pouch, sheath and shears rebuilt from F7, G1 and G3 (see `claude/fox-3d-pass6-belt-pouch-shears.md`).
Pass 7 (13 Nov 2026): one skin from face to hands, painted arms, softer hands, palms turned in at rest (see `claude/fox-3d-pass7-one-skin.md`).
Pass 8 (13 Nov 2026): painted neck, chest shading back, purple off her shoulders, bracelets on the wrist, and the two head options to choose from (see `claude/fox-3d-pass8-neck-chest-head-options.md`).
Still to do: Chris's choice of head size and of the depth reshaping; ruffles at the neckline and peplum are flat paint; tools and spells (rounds 3 and 4) are not started.
