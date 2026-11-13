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
| `src/88_foxmoves.js` | her own everyday moves: talk, laugh, dance, curtsey, pounce. She keeps the Jester's bow, twirl, wave and jump. The Jester's talk, laugh and dance are renamed `jester_...` there and are off her page |
| `src/89_foxspells.js`, `89b_foxspells2.js`, `89c_foxspells3.js` | her spells: Hemline Fangs; Blue Mischief and Borrowed Face (with her ghost double and foxfire fox); Same Cloth, Slip Stitch and Crazy Quilt (with her thread, the cut in the air, the quilt, and a ghost copy of an enemy) |
| `bake_places_fox.py` | cuts the six patches of other places out of painting I7 into one small picture, `places` (Slip Stitch and Crazy Quilt) |
| `poses.py`, `stills.py`, `strip2.py`, `tile.py`, `page_shots.py`, `spellcmp.py` | looking at spells: standing poses side by side (with a solver that puts her shears' point on a spot); big stills of a move; a strip folded into rows; pictures in a row; stills of the real page at chosen seconds of a move; the stills beside the paintings |
| `bench/armdiag.js` | how her arms and hands move, in numbers: reach, elbow and wrist speeds, fingertip speed, for every move at 60 frames a second |
| `bench.py`, `bench/*.js`, `strip.py`, `sheet.py` | the move workbench: pose her, land a fingertip on a point of her (`T.reach`), take stills of a move at chosen seconds |
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
python3 -I bake_places_fox.py        # the six patches of other places (I7), for Slip Stitch and Crazy Quilt
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
python3 strip.py laugh '0,0.03;-0.9,0.05' 2.6 1.22 0.6 1.25 1.75   # shots/strip_laugh.jpg: stills of a move at those seconds, a row for each camera angle
python3 bench.py bench/contacts.js shots/ct                        # prints the hand keys that put a fingertip on her glasses, bell and lips
./headfit.sh f1 ''                   # shots/f1_a..l.png  head, neck and shoulders from twelve angles, for checking the fit after a head change
python3 test_single.py lite          # opens deliver/Fox_Witch_3D.html at phone size with the network cut off and plays her moves
PRE=bench/dummy.js python3 stills.py same_cloth shots/sc '0.06,0.06,7.6,1.02,1.15,1200,800' 1.95 3.5 4.21   # big stills of a move at those seconds; PRE stands a practice dummy to her left
python3 page_shots.py shots/pg same_cloth smooth 1 '' 2.6 4.22       # the real page at phone size, Walk around on, at those seconds of the move (slow: about a minute a still)
python3 poses.py name '<js returning { label: pose }>'               # standing poses side by side, with reach and where her shears' point is
python3 bench.py bench/armdiag3.js   # reach and speeds through her spells
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
- Written in the Jester's frame, then the whole figure is scaled by `FOX_K = 1.045`. Head bone scale 0.935 since 13 Nov (0.85 was the size measured off `references/round5/R6_point.webp`; Chris chose 10% more), head lowered 0.0133. Hand scale 0.86.
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
- **Her head is 10% larger and her face is reshaped in depth (Chris, 13 Nov).** Both are built in: `HEAD_K = 0.935` and `FACE_DEPTH = 1` in `src/00_util.js` (`headScale` and `faceDepth` can still be passed to `makeFox` to compare). The reshaping (`variants/ownface/40_head.js`) moves points of her face straight back or forward only, so the straight-on view keeps its painting exactly. This replaces his 12 Nov rule that her head was only to be resized, and the 0.85 that was measured off `R6_point`. Against A1 the larger head is the closer one: her pupils are 54 px apart in A1, 47 at 0.85 and 52 at 0.935. Picture: `deliver/Fox_head_locked_vs_painting.jpg`. Hair, scalp and ears are the same meshes as before (checked by sum).
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
Pass 9 (13 Nov 2026): head 10% larger and the depth reshaping built in; her own talk, laugh, dance, curtsey and pounce (see `claude/fox-3d-pass9-head-locked-own-moves.md`).
Pass 10 (13 Nov 2026): Chris approved the five moves and keeps the Jester's bow, twirl, wave and jump; how her arms and hands move (see `claude/fox-3d-pass10-arms-hands-motion.md`).
Pass 11 (13 Nov 2026): the lowest bracelet no longer sinks into the root of her thumb; her fingers are 5% shorter, which is their length in her own painting (see `claude/fox-3d-pass11-bracelet-fingers.md`).
Pass 12 (13 Nov 2026): fingers 12% thicker (D1's width); her shears come out of the sheath into her hands; her first spell, Hemline Fangs (see `claude/fox-3d-pass12-shears-hemline-fangs.md`).
Pass 13 (13 Nov 2026): the Flipbook look switch (with her three blouse greens added to the 56 colours); Blue Mischief and Borrowed Face, so all three flipbook moves are in; a ghost double and a foxfire fox (see `claude/fox-3d-pass13-flipbook-look-blue-mischief-borrowed-face.md`).
Pass 14 (13 Nov 2026): Same Cloth, Slip Stitch and Crazy Quilt, which finishes round 3 (see `claude/fox-3d-pass14-same-cloth-slip-stitch-crazy-quilt.md`).
Still to do: round 4 (J1 to J11, K1 to K4: the older moves and three new ones); the paintings are in `references/round4`, none used yet. Ruffles at the neckline and peplum are flat paint; her choker is plain where A1's has studs and a larger bell; under her jaw and the sides of her head are plain skin tone.

## Same Cloth, Slip Stitch, Crazy Quilt (pass 14)

New spells from her lore: no flipbook clips, so the timing is ours. Paintings H9 to H13 and her magic set I4, I6, I7, I8. All in `src/89c_foxspells3.js`.

Pieces any spell can use:

- **`RIB`**: her thread (I4). Ribbons of light that face the eye, coloured blue, teal, violet, rose, gold along their length; all the threads of a frame are one mesh. A spell calls `RIB.begin()` once a frame, then `RIB.path(fn, width, alpha, hue, span, ends)` for each thread. It also remembers where the picture was last taken from (`RIB.eye`), so a spell can turn a flat thing to face whoever is looking.
- **`PLACES`**: the six patches of other places (I7), baked by `bake_places_fox.py` into `places` in `out/fox_tex.js` (86 KB). `placeCol` in its shader picks a place and a quarter turn for each square of a grid and draws the stitched seams. Without the picture each place is a plain colour.
- **`SLIT`**: the cut in the air (I6). `place(foot, across, facing)`, then `show(cut, open, flap, sew, opacity, time)`: a line of light while it is cut from the top down, a pointed opening with the patches behind it, big even stitches where it is sewn shut from the top down. `flapFor(point)` says how far the near edge must be lifted to pass through a hand; `needle(point, direction, opacity)` draws the needle. **The patches are a solid surface.** Whoever steps in behind the lifted edge is hidden by it, as behind a tent flap; nothing is clipped.
- **`EGHOST`**: a ghost copy of an enemy (I8, and the lore's "ghost 3D copy of any character"). The host says what she is aiming at: `fox.target = anObject3D` (the page gives the practice dummy). `from(object)` draws its plain meshes a second time in see-through blue with seams of light; with nothing given, a cloth doll on a post stands in. It measures how wide the thing is at each height, and `edge(u)` gives the line a hand's breadth outside it: the cut-out's edge. `show(opacity, foot, turn, tiltX, tiltZ, top, time)`; everything above `top` has unravelled. Skinned meshes are not copied yet (a 3D enemy with bones would need the same second-skeleton trick as her own double).
- **`QUILT`**: a quilt of light (H13). Cloth worked out afresh each frame: it leaves her two hands far end first, billows, banks so the audience sees its face, and settles into a dome over the target.
- **`tipOf(S, i, out)`**: any fingertip (0 thumb to 4 little finger).
- **`foxAwayAsk`**: a spell sets it each frame she is not to be drawn (she has gone through the cut). `fox.state.away` tells the host. If the spell is cut short she is back the next frame.

The moves:

- **`same_cloth`** (6.7 s; the blow at 4.2 s). Shears out and pointed at her target, four snips while the outline is drawn round it (it faces whoever is looking, since an outline is what the eye sees); the copy peels away toward her; shears away; both hands up with a thread from each fingertip (H10); she draws it back and throws it, and it whirls into the thing it was cut from; she laughs; shears out again, snip, the threads fall and the copy unravels from the top.
- **`slip_stitch`** (6.6 s on her page). She turns to her left, reaches high on her toes and drags the point of her shears straight down a line (keys solved so the point stays on it: `poses.py` with `bench/stroke.poses.js`); shears away; she steps in, takes the cut and draws its edge back like a curtain (the edge follows her fingers); waves; sidesteps in behind it; she is gone at 4.0 s; the needle sews it shut by 5.05 s. On her page she then pops back where she began at 5.8 s. **In the game the move should end at about 5.4 s with her gone.** She is not turned toward the dummy for this one.
- **`crazy_quilt`** (4.6 s; it lands at 3.0 s). She gathers it at her hip, swings it over her head, shakes it out, a second flick, lets go; it settles over the target, its squares keep changing places and stars circle where a head would be.

Numbers (`bench/armdiag3.js`): reach never past 0.96 of her arm; fingertips at most 2.5 m/s in Same Cloth, 3.2 in Slip Stitch, 3.5 in Crazy Quilt. Every stance with every move: 126 pairs, no broken numbers. Her hair is unchanged (same vertex sums as the last build).

Where they differ from the paintings:

- H10: the copy swings one arm. Here the copy is rigid, so it whirls round its post and its arm comes round with it.
- H9: the cut-away copy trails a veil of cloth back to the outline. Here there is no veil.
- H12: she steps through with her back to us and looks over her shoulder. Here she faces us, waves, and steps in sideways behind the lifted edge. From the side or behind you can see her standing behind the patches until she is gone: the trick is made for the audience's side.
- H11: the slit is taller than her raised hand can reach. Here it starts where her shears can reach (1.96 m) and runs on down to the ground by itself after her stroke ends at knee height.
- H13: one quilt with seven or so big pictures and wild frayed edges. Here six square pictures in a neat three-by-two, each place once (a longer throw repeats them), with a plain bright rim.
- None of the paintings' teeth: she smiles with her mouth shut, as everywhere.

## The Flipbook look, and two more spells (pass 13)

- **Flipbook look** (`claude/HOW-TO-flipbook-look.md`): a switch on her page, off to start. `out/palette.js` (the 56 colours all four witches share) is now in her branch. The 56 have no green and her blouse snapped to blue, so `viewer/app.js` passes three more, the blouse colours of her own flipbook frames: `[84,122,116]`, `[51,82,82]`, `[22,45,47]`. Three of the eight spare places. A fourth (the pale of her foxfire) was tried and removed: it turned the white of her costume ears ice blue.
- For the look, sparks (`pPoints` in `src/80_fx.js`) are sized by the height of the picture being drawn into. The page's own hit flash has her foxfire colour (`LOOK` in `viewer/app.js`) and each spell sets `fxHitP` so it lands where the spell does.
- Check: `python3 flip_shots.py shots/fl` (the real page, look off and on: standing, talking, each spell).
- **Her spells act toward her left** (+x in her space: screen right when she faces you), as on the sprite sheet, and the page turns her so that is the dummy. A move that strikes forward turns her with its `spin` track (Hemline Fangs a quarter turn, Blue Mischief 1.25 radians for the throw). `tdir()` in `src/89b_foxspells2.js` gives the true direction of her target whatever turn the move has given her.
- **`GHOST`** (`src/89b_foxspells2.js`): a ghost double. Her own skinned meshes are drawn a second time on a second set of bones in one see-through blue material: no new geometry, no textures. A spell sets `GHOST.P` (any pose), calls `GHOST.show(opacity, x, y, z, turn)` each frame it should be seen, and it is gone the frame nothing asks for it. Its pose is worked out on her bones and copied across before her own pose is laid over them (`animate`, `poseQuiet`). The cloth flounces of her trousers are not in it. This is the piece Same Cloth (a ghost copy of an enemy) will need.
- **`FOXFIRE`**: a fox of light built from a dozen simple shapes in one glowing material; `place(point, direction, length, stretch, opacity, time)`. It is plain: it reads as a four-legged thing with ears and a brush, not as the fox of painting H6.
- **`blue_mischief`** (3.67 s, the flipbook's own length; the throw on frame 16, the hit 0.42 s later): bell, spark on her fingertip, the little fox on her palm, turn and wind-up, throw, the leap (it grows from 17 cm to 95 cm), burst.
- **`borrowed_face`** (3.67 s; the double is in place on frame 10): palm over her right eye, the double steps out of her left side and makes the Jester's bow she keeps (H8), she leans away behind it with a finger to her lips, the double fades at the end.
- Not as the paintings: in H5 the fox sits on her left hand, here her right; in H8 she tiptoes away, here she stays and leans; the double has no lace or flounces.

## Her shears in her hands, and her spells (pass 12, round 3)

- **Channels** (in `REST`, `src/70_anim.js`), keyed like any other: `shr` 0 sheathed to 1 in her right hand; `shs` 1 when the back half is in her left hand (two daggers); `sho` how far they are open, in radians; `shl` how the blades lean in her fists (0.44 back toward her wrists for carrying, below 0 forward for a cut).
- **How a half follows a hand** (`TOOL`, `heldAt`, `poseTools` in `src/75_pose.js`): the half's ring is put in her fist, its blade out of the thumb side, flat to her palm. Bone `shears` is the front half (the bigger ring, her right hand); `shearB` the back half.
- **They grow.** On her belt the shears are 26 cm (G1, G3). In H3 and H4 each dagger is about 45 cm. They grow 1.7 times as they leave the sheath (`GROW`; `makeFox({ shearsGrow: 1 })` keeps them belt-sized). Lore: "her scissors become daggers".
- **Aiming a blade.** `bench/blades.js` searches, pose by pose, the forearm turn, wrist bend and lean that point a blade where it should go, and prints them. Use it before keying any move with a blade in it.
- **Moves** (`src/89_foxspells.js`): `shears_out` (5.5 s; draw, two snips, part into two daggers, show, rejoin, sheath: for looking at the tools) and `hemline_fangs` (2.4 s; the flipbook's twelve frames at 1.22 times their length; the blow on frame 7, 1.22 s; `hits` and `cues` set). Effects: foxfire strewn over the strip each blade swept since the last frame, sparks and a small ring where the cuts cross, a flat ring round her as the halves come back together (H4). Colours `COL.fox`, `COL.foxPale`.
- Anchors `bladeA`, `bladeB` (the points), `bladeAm`, `bladeBm` (the middles).
- Not done: the hand takes the ring through the sheath's mouth without the fingers going through the ring; nothing is cut (no target reacts beyond the hit count); the other two flipbook moves (Blue Mischief, Borrowed Face) and the rest of rounds 3 and 4.

## Her fingers and bracelets (pass 11)

- **Fingers.** `FINGER_K = 0.95` in `src/10_geom.js` scales the four fingers and the thumb's two free bones. The lengths in `FINGERS` are the Jester's; her painting D1 had been scaled to them by its middle finger, so her palm was never checked. In D1 her middle finger (web to tip) is 0.88 to 0.91 of her palm (web to wrist); the model was 0.94 and is now 0.89. Picture: `deliver/Fox_fingers_vs_painting.jpg`. `makeFox({ fingerLen: 1 })` gives the old length. The fingertip anchors (`tipR`, `tipL`) follow the table, and the seven touch keys were worked out again.
- **Width.** Her fingers were also about 12% thinner than in D1 (all four, at two heights). Chris, the same day: thicken them. `FINGER_W = 1.12` (fingers and thumb); they are now within 3 pixels of D1's at three heights. `makeFox({ fingerWide: 1 })` gives the old width.
- **Bracelets.** The beads are strung in `src/33_bracelets.js`, after her hands exist, so each strand lies on whatever is under it: the wrist's oval, or her hand where her hand is wider (the root of her thumb). The lowest strand, on the line where arm meets hand, rides the bone `wrm`, which turns half as far as her hand, so a bent wrist does not push her hand through it. Check: `./wristset.sh w1` (ten views at rest).

## How her arms and hands move (pass 10)

Chris, 13 Nov: "her arms and hands could use more work ... it's more of how they're moving. Not changing the way they look." Motion cannot be seen on the test machine, so it was measured: `python3 bench.py bench/armdiag.js` plays every move at 60 frames a second and reports each arm's reach, elbow and wrist speeds and fingertip speed. What it found, and what was changed:

| Found | Why | Change | Where |
|---|---|---|---|
| The forearm snapped round 49 degrees in three frames whenever a hand left or came back to her side (wrist turning at 1300 to 1800 deg/s) | the elbow tuck and forearm turn of a hanging arm faded with the hand's height alone | the fade now takes about a fifth of a second however fast the hand goes | `armSt`, `poseDt` in `src/75_pose.js` |
| Arms locked straight and snapped when they let go (curtsey, pounce, the Jester's bow and jump) | hand keys beyond the arm's length; the solver clamps hard | past 96% of its length the arm eases toward straight (`SOFT_FROM`); her own keys moved within reach | `src/75_pose.js`, `src/88_foxmoves.js` |
| One frame where the elbow flipped (pounce) | the elbow's given direction lay along the arm | the elbow keeps the direction it had when its key cannot tell | `src/75_pose.js` |
| Hands flew at 6 to 17 m/s at the start of her moves and in the pounce | first keys at 0.2 s; hands keyed far from where the body was | later first keys; the pounce's hands placed from her shoulder's position at each moment | `src/88_foxmoves.js` |
| Shoulders did not move with the arms | the collar bone only moved for a shrug | it lifts as the hand rises above the shoulder and comes forward as she reaches ahead or across (`SHOULDER`) | `src/75_pose.js` |
| Hands carried like boards; every finger moving at the same instant | keys were applied straight to the bones | `armLife` in `src/90_api.js`: fingers follow their keys a little late and each by a different amount, wrist keys are eased, and the hand drags behind its travel and swings through when it stops |

- Her resting pose is unchanged: every rule is zero for an arm hanging at her side.
- A held pose settles to exactly its key, so a fingertip keyed onto her lips still lands there. The seven touch keys were worked out again with `bench/contacts.js` after the shoulders changed (they moved by up to 8 mm).
- `makeFox({ shoulderFollow: 0, softReach: 0, handLife: 0 })` gives the arms as they were, for comparing.
- Numbers for her five moves, before and after: fastest wrist turn 1300 to 1800 deg/s, now 240 to 660. Fastest fingertip: talk 3.9 to 2.6 m/s, laugh 7.8 to 3.8, dance 6.5 to 3.8, pounce 17 to 3.8. Hardest elbow jolt in the pounce: a quarter of what it was. Hand not turning on the forearm while it travels: walk 47% of the time to 24%, run 55% to 0, jump 79% to 15.
- Left alone: the Jester's jump still throws her arms up in a sixth of a second (9 m/s at the fingertip). Legs have none of these rules yet.

## Her own moves (`src/88_foxmoves.js`)

Chris, 13 Nov: "so it's like her talk and she's not the jester"; she "would have different moves than bow twirl", her own laugh and her own dance. The Jester plays to the back row: big, even, both arms wide. The Fox is a trickster who sews: one hand busy while the other rests on her pouch or her shears, small quick moves close to her face and then a stillness, her head cocked, fingers that pinch a thread or snip it, eyes on you, and bells she likes to ring.

| Move | In place of | What she does |
|---|---|---|
| `talk` (11.6 s) | the Jester's talk | one finger up; finds a thread in the air and draws it out; holds it up and snips it twice with two fingers; "who, me?" with her shoulders up; pushes her glasses up and goes still; flicks her bell twice; wags a finger; a finger to her lips; both hands flick open, low |
| `laugh` (3.6 s) | the Jester's laugh | a snicker behind curled fingers, chin down and turned away, the other arm across her middle; she folds over it, peeks, it gets away again, she flicks it off |
| `dance` (5.8 s) | the Jester's jig | four slow swaying steps, weight on one hip and the far wrist shaking by her ear; a hop that turns her back to you; two bumps of her hips; a hop back round into a pose |
| `curtsey` (3.5 s) | her own (she keeps the bow too) | a foot slips behind, she dips, a fold of her trousers held out, a finger to her lips (the gesture of painting J4), one slow blink, head up throughout |
| `pounce` (4.9 s) | her own (she keeps the twirl too) | crouch, a wiggle of her hips with her head still, a spring up and 40 cm forward, down with cupped hands on her catch, a peek, a look up at you, a hop back |

- Keys are written as **beats** in `talk`: she arrives in a pose and holds it. A channel left out of a key keeps gliding toward its next key, so a pose that should hold needs a second key at the end of the hold.
- Hand keys that touch her (glasses, bell, lips) come from `bench/contacts.js`, which moves the hand until the fingertip is on the point for the lean and head turn of that moment. Run it again after any change to her head, neck or arms and paste the numbers into `88_foxmoves.js`.
- Chris, 13 Nov, after trying them: all five stay. She also keeps the Jester's bow and twirl, and the Jester's wave and jump are fine as they are. He likes that each witch can hover and talk while hovering, and wants the four to hover together one day.
- Not done: the trouser cloth does not lift in her fingers in the curtsey; the bell does not swing when flicked; she cannot wink (her eyes shut together).
- Motion has not been seen: the test machine draws about two frames a second. Timing came from arithmetic (a 30 cm jump is 0.5 s in the air) and from the Jester's moves.
