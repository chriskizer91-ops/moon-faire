# Io, the Herbal Witch, in 3D

Started November 13, 2026. Built the way the HD Jester was (`claude/HOW-TO-3d-witch-models.md` in the project), following
the Ranger's stage-one recipe: this folder began as a copy of the Ranger's stage-one code (`claude/ranger-3d-model`, commit
`1d4c9d6`), with the Jester's platform boot builder (`claude/jester-3d-model`, pass 20) in place of the Ranger's boots.

## Where she stands: stage two (November 13, 2026)

Body and base outfit (stage one), and now her head, face, glasses, hair and hat. She blinks and can talk; her body does not move yet.

- **Page:** https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep (republish each stage's page to that link). The same page as one
  offline file is `deliver/Io_3D_stage2.html` (2.4 MB). Twelve views, six faces (blinking, talking, four held), three poses, the
  painting beside her, and buttons to take off her hat, glasses, hair and skirt. `deliver/Io_stage2_vs_paintings.jpg` is her head, hat and hair beside C4 and C5 at one scale.
- **Stage two built:** her face (C1) on a head shaped to her profile (C3), ears, neck; her blink and talking mouths (C9); round
  glasses; about 110 wavy tresses of hair and a fringe of 26 hanging locks; the hat with its brim, lace band, chain, three
  crosses, ringed cross, two horns and slumping crown. 551,000 triangles.
- **Stage two, second pass (Chris, November 13):** "her face needs to be her face without hair in the painted on image. And then
  the hair that's in front of her face is actually like 3D rendered hair hanging in front of her face"; the hat down by 15% of
  the way from its bottom edge to the top of her glasses; blinking and talking; the fringe; "a little sharp edge that points
  out" at the very bottom of her chin from the side. All five are done (see "Second pass" under the rules below). He called her
  face "almost perfect": do not reshape it while fixing details.
- **Stage one, approved by Chris** ("round one is fantastic", "The body looks fantastic as it is"): torso with the bodice painted
  on (B3 front and back, B2 at the sides), bare arms and legs, the skirt as eight stiff tiers with the slit over her left leg,
  boots, hands. Do not reshape these without asking. Stage two only cleaned the tops of her shoulders in the body picture (a dark
  patch and purple streaks) and carried the bodice straps over them.
- **Stand-ins and rough spots:** her hair is stiff (no movement, does not part round raised arms), a tress reads as a ribbon up
  close; the top of her head under the hat is bare; her brows do not move and the emotions in C10 are not in; the hat's crown has soft creases, not the deep folds of the paintings; the skirt is stiff with solid
  lace; the boots are the Jester's boot made taller; arms, legs and hands are plain skin.
- **Not built:** robe, belt, pouch, crystal, necklaces, bracelets, book, sickle, dagger, cloth that hangs, movement, spells.

## What is here

- `references/starters/`: the 14 images Chris attaches in ChatGPT. `references/prompts/`: the 104 prompts and the scripts
  that build `Io_Reference_Prompts.html` (see the README text below and `claude/io-3d-reference-prompts.md` in the project).
- `references/round1/`: the 43 round 1 paintings (A1 to E8) as WebP, with the index Chris's zips came with.
- `references/round2/`: the 21 round 2 paintings (F1 to F12, G1 to G9) as WebP, with their index. Only F9's swatches are used so far; see "Round 2" below.
- `references/round3/`: the 26 round 3 paintings (H1 to H18, I1 to I8) as WebP, with their index. Not used yet; see "Round 3" below.
- `src/`: the model, joined in this order by `build_io.sh` into `out/io.js` (one function, `makeIo(opts)`):
  `00_util`, `I05_tables` (written by `tools/tables.py`), `10_geom` (skeleton and part builders), `20_tex`, `I21_tex`,
  `I30_body` (torso, arms, legs, skirt), `I31_boots`, `32_hands`, `I40_head` (head, face, ears, neck), `I42_glasses`,
  `I43_hat`, `I41_hair` (after the hat, because the hair starts under it), `I99_static` (materials, and `pose({arm, leg})`
  in degrees for checking her against the paintings).
- `tools/tables.py`: every measurement, in one place, for both the model and the bake. Edit numbers there.
- `bake_io.py`: cuts the paintings into `out/io_tex.js` (`window.IO_TEX`: the wrapped body picture, the skirt's lace, two
  skin colours). `bake_head_io.py`, run after it, adds her face (C1), her profile (C3), her neck's tone (C18), the hat's felt,
  lace and horn (F9) and her hair colours (C13).
- `tools/`: `sil.py` (figure outlines off the plum background), `measure.py` (outline tables in metres), `cmp_io.py` (model
  beside a painting with both outlines), `page_test_io.py` (the page at phone size), `zoomgrid.py` (a zoomed, gridded crop for reading landmarks),
  `prof_io.py` (her painted profile against the model's middle line), `fit_prof_io.py` (moves the model's middle line onto it),
  `cmp_head_io.py` (her head, hat and hair beside C4 and C5 at one scale). `lib/grid.py` puts a labelled grid on a
  painting; `lib/restore_refs.py` turns the WebP paintings back into the `refs/*.png` the tools read.

## Her measurements

Her eye line is 1.50 m above her soles in every full figure, as on the Jester and the Ranger. She stands on platforms about
5.5 cm deep, so her joints sit higher than theirs.

| Painting | Pixels per metre | Fixed points |
|---|---|---|
| A1 (master, front) | 885.7 | middle x 501.5, eyes y 186.5, soles y 1515 |
| B1 front / back | 578 | eyes y 131, soles y 998 / 996 |
| B2 left-facing / right-facing | 578 | eye y 129, soles y 996; skirt-middle axis x 472.6 / 1062.2 |
| B3 front / back | 584.3 | middle x 446.0 / 1085.5, eyes y 130.5, soles y 1007 |
| B5 legs: front / side / back | 890 | soles y 982 / 980 / 979; fixed by the boot (0.317 m to its leather top, 0.359 m to the sock top, as in B3) |

Heights in metres: sole about 0.055 deep; top of the boot leather 0.317; top of the sock 0.359; knee 0.57; crotch 0.862;
hip joint 0.935; hips widest 0.88 (0.367 across in B5); waist 1.10 (0.181 across, 0.130 deep); skirt waistband 1.05 to 1.06;
bust 1.22; shoulder joint 1.285 (0.119 out from the middle); chin 1.419; mouth 1.450; eyes 1.50. Her pupils are 62 mm apart.
The skirt is 0.54 m across and 0.43 m deep at its widest (0.30 to 0.35 m up) and its hem points reach about 0.13 m.

- The side paintings lean: her hips stand about 4 cm ahead of her shins. The model stands upright (`LEAN` in `bake_io.py`,
  and the note at the top of `tools/tables.py`).
- Her painted arms are about 2.5 cm shorter than the Jester's, so her arm bones are (0.232 and 0.212 m).
- B5 (in shorts) has a wider waist than B3 (in the bodice). The model follows B3 from the waist up and B5 at the hips and legs.
- B3's feet are 32 cm apart and B5's 19 cm. `pose({arm: 28, leg: 5.5})` is the stance in B3.

### Her head (stage two)

The head is the Jester's face model (as the Ranger's is), worn at 0.95 of its size and 0.95 as wide above the nose. Her chin
stays where her whole-figure paintings put it (1.408 m), so her **eye line is 1.511 m**, not 1.50; the tip of her nose is
0.107 m forward of the body's middle line.

| Painting | Pixels per metre of the model | Fixed points |
|---|---|---|
| C1 (front face) | 4689 | pupils (487, 533) and (767, 533), middle of nose and mouth x 630, brows y 462, under the nose 745, lip line 828, under the chin 1006 |
| C2 (with glasses) | 4689, same framing as C1 | each ring 44 mm across, its middle 2.6 mm outside the pupil and 7 mm below the eye line |
| C3 profile (right figure) | 2169 | eye y 420, tip of the nose x 1513, lip line 556, under the chin 644, ear x 1195 to 1262, y 405 to 522 |
| C4 front (left figure) | 1370 | middle x 287, eyes y 453.5 |
| C4 profile (right figure) | 1290 | tip of the nose x 1432, eye y 462 |
| C5 from behind (middle figure) | 1235 | middle x 742, back edge of the brim y 372 = 1.44 m |

- Heights: chin 1.408, lip line 1.448, under the nose 1.466, eyes 1.511, brows 1.526, hairline 1.58. Eyes 59 mm apart.
- The whole-figure paintings (A1, B3) draw a shorter face than the close-ups: 8.4 to 9.1 cm from eye to chin against 10.3 cm in
  C1 and C3, with the eyes as far apart. The close-ups are the master for her face, as on the Ranger.
- A1's eyes are at y 198, not 186.5 as first read (that was the top of her glasses). A1 is 878 px a metre by its eye line.
  Nothing was measured off A1 in stage one, so nothing built is affected.
- Hat: the opening is 17 by 25 cm on a plane rising to the front (1.570 m in front, 1.511 m behind); the brim 33 by 39 cm,
  level in front, 4.5 cm lower at the sides and 9 cm lower behind; the band 4.6 cm; the top of the crown 1.71 m; its tip
  hangs behind her right shoulder at 1.39 m. These are 7 mm lower than first measured: Chris asked for the hat down by 15% of
  the gap between its bottom edge in front (then 1.577 m) and the top of her glasses (1.529 m).
- Hair: the curtain down her back is 33 cm wide at her shoulder blades and ends about 0.72 m up; the bunches in front end
  between her waist and hips; waves are 11 to 15 cm long.
- Glasses: C2 and C14 show thin 44 mm rings; every whole-figure painting shows them bigger and darker. Built at 50 mm, dark bronze.

## Checking

- **Stage one:** `tools/cmp_io.py` lays the model's outline over the painting's: front (B3) overlap 0.82, back 0.82, right side
  (B2) 0.84, left side 0.85. Waist, hips, bust, shoulders, arms, boots and the skirt's outline are within about a centimetre
  from the front; from the side the upper back sits about 1.5 cm further forward than painted, which is the lean taken out.
  (These were measured before she had hair and a hat; run with her hair and hat hidden to repeat them.)
- **Stage two:** `tools/prof_io.py`: the model's middle line is within 1.0 mm of her painted profile from chin to forehead.
  `tools/cmp_head_io.py`: her head, hat and hair beside C4 (front and profile) and C5 (from behind) at one scale, judged by eye.
  Stills from the front, both three-quarters, both sides, behind, above and below.
- The page ran at phone size in a headless browser: no errors, nothing off the side, every button, and a drag. Not checked on a
  real phone.

## Building

The scripts use the absolute path `/home/claude/io`. In a fresh session:

```
mkdir -p /home/claude/io && cp -r models/io-3d/. /home/claude/io/ && cd /home/claude/io
npm install three@0.128.0          # playwright and Chrome are needed for the pictures
mkdir -p shots deliver
python3 -I lib/restore_refs.py     # PNG copies of the paintings into refs/
python3 -I bake_io.py              # out/io_tex.js (needs Pillow, numpy, scipy)
python3 -I bake_head_io.py         # adds her face, profile, skin tones, hat swatches and hair colours to it
./build_io.sh                      # tools/tables.py, then out/io.js
python3 -I build_single_io.py      # deliver/Io_3D_stage2.html, one offline file
python3 tools/prof_io.py 8 shots/prof.png             # her profile against the model's, by height
python3 tools/cmp_head_io.py shots/cmp_head.jpg       # head, hat and hair beside C4 and C5
python3 tools/cmp_io.py shots/cmp_front.jpg front     # also back, sideR, sideL
python3 shoot.py shots/x 'T.j.pose({arm:28,leg:5.5})' front:0,0.03,6.6,0.9,22     # a still; angles are in radians
python3 tools/page_test_io.py      # the page at phone size (slow: software rendering)
```

The paintings are data: run Python that reads them with `-I`.

## Rules learned in stage one

- `spline()` in `00_util.js` reads its keys from low to high. Tables written from the top down (legs, skirt) must be reversed
  first, or use `prof()`.
- When patching a line, never leave a `//` comment in the middle of a statement (it swallowed a `const`).
- The legs must start inside the hips, and the hips must be narrower than the skirt that covers them, or skin shows through.
- Check the scale of a part painting (B5) against a full figure by something both show (the boot), not by its own height.

## Rules learned in stage two

- Hair that hangs is placed by height: its x is given, and its depth is whatever keeps it clear of her (`zBack`, `zFront` in
  `I41_hair.js`). That rule cannot put hair on the **side** of her head: it pushed the side hair round to the front of her face.
  Hair beside her head is placed by its own rule (`bunchPts`): on the side of the head, as wide as the head has been on the way down.
- Do not let hair follow the jaw: below the cheekbones the head narrows, and hair that follows it meets under her chin.
- Each layer of hair must start close to the head under the hat and stand off only below it, or its roots poke out through the band.
- A tress takes a narrow strip of a wide strand picture. A wide strip makes each tress two-toned.
- The sheet of plain hair under the tresses must be narrower than the tresses, or its edge shows as a black band.
- Take the hat's shape from both views at once and check both at one scale (`cmp_head_io.py`): the first crown matched the
  measurements along its middle line and was still 5 cm too tall and far too thin.
- Where a strand rule needs a surface that is not there, give it a fallback: three points went nine metres away.

### Second pass (the same day)

- **No hair is painted on her face.** The front picture (C1) never had any. The side picture (C3) had fine strands across her
  temple, cheek, ear and neck; `bake_head_io.py` now paints out anything on her skin there that is darker than the skin round it.
- **Hair in front of her face is geometry.** The fringe was flat strips lying on her skin, and read as painted. It is now 13 small
  tresses a side that leave her hairline under the hat, stand 0.5 to 1.7 cm clear of her skin and hang (`FR` in `I41_hair.js`).
- **Strand ends are pointed.** The picture that says where a tress has hair drew each strand as a bar with a round end, so a
  tress ended in a row of square teeth. Each strand now narrows to a point (`hairAlphaIo` in `I21_tex.js`).
- **The point under her chin** was the profile fit overshooting at its lowest key (0.0943 between 0.0889 and 0.0926). The fit is
  unsteady there because the outline runs nearly level. The bottom four keys of `FACE_MID` were set by hand to a round chin. If
  `fit_prof_io.py` is run again, check those keys afterwards.
- **Her faces** come from C9 the way the Ranger's come from J2: cell 1 is settled onto C1 picture against picture, the other
  cells onto cell 1 by what did not change, and only the eyes or the mouth are lifted as soft patches. The cells sit up to 24
  pixels off their grid, so do not assume the faces are centred. The mouth patches must reach past the corners of her resting
  mouth, or its corners show beside a pursed one. `animate(dt)` runs the blink; `talk(true)` the mouths and small nods;
  `setFace(eyes, mouth)` holds a face and `setFace()` lets go.

## Round 2 paintings (arrived November 13, 2026, after stage one was built)

All 21 arrived and match their index. Nothing is built from them yet.

| Painting | Shows | For |
|---|---|---|
| F1, F2 | both necklaces, the six bracelets; the pendant front and side | jewellery |
| F3 | belt laid flat, pouch from three sides, the crystal on its chain | belt stage |
| F4, F5, F6 | robe laid flat front and back, the sleeve on an arm, drape, trim, shoulder cut-out, hem point | robe as cloth |
| F7 | bodice front, back and neckline close-up | a sharper bodice than B3 gives |
| F8 | skirt alone, one tier, the tulle underlayer | skirt as cloth |
| F9 | eight swatches (felt, two laces, bodice cloth, two black leathers, horn, brown leather) | materials |
| F10, F11, F12 | chiffon square, lace square, trim strip | repeating textures |
| G1, G2, G3 | the book shut, open, and four spreads | the book |
| G4, G5 | pendant turning into the sickle; the sickle | plain attack |
| G6 | dagger and sheath | Thornwake |
| G7 | herbs, leaves, seed, bottles, cup | small props |
| G8 | where she carries everything, front, side and back | placing things on her |
| G9 | her hands holding the book, sickle, dagger and a leaf | grips |

- F4, F8 and F11 are on light grey, not plum (the prompts asked for that so the sheer cloth reads). `tools/sil.py` keys on
  plum, so cut these with their own background colour.
- F7's bodice back is laced; B3's back has a plain middle seam. The model wears B3's for now. Her hair and robe cover most of
  it. Chris to choose.
- F3's pouch carries a gold filigree and a hanging gold ball; G8 shows the pouch on her right hip and the dagger on her left.

## Round 3 paintings (arrived November 13, 2026, while stage two was being built)

All 26 arrived and match their index. Nothing is built from them yet.

| Painting | Shows |
|---|---|
| H1, H2 | walking and running; sitting reading and kneeling |
| H3, H4 | the pendant becoming the sickle; the sickle's sweep and low cut |
| H5, H6 | a leaf lifting from the book; the healing ribbon of leaves reaching a friend |
| H7 to H10 | the seed raised and planted; the sapling and the fawn; the grown stag of wood; the stag leaping |
| H11, H12 | Moonflowers: the book floating, motes rising; the ring of white flowers with two friends inside |
| H13 | kneeling to raise a fallen friend |
| H14, H15 | the dagger drawn and driven into the ground; thorns and roses binding a foe in violet fire |
| H16 | a guard of woven thorn round her |
| H17, H18 | hit, and fallen with her hat off; victory |
| I1 to I8 | on black, for effects: leaves, sparks and moons, gold arcs, the seed growing, vines, moonflowers, violet fire, thorns rising |

They also show her whole look from many sides, with the robe: useful when the robe and the cloth are built.

## Next stages, in the how-to's order

1. The emotions in C10 and moving brows; hair on top of her head.
2. Hands and painted arms (D1 to D4), and her legs painted from B5; her neck and chest painted from C18.
3. Her own boots (E1 to E8).
4. Robe as cloth (A1 to A5, F4 to F6, F10, F12), skirt as cloth with see-through lace (F8, F11).
5. Belt, pouch, crystal, necklaces, bracelets (F1 to F3).
6. Book and blades (G1 to G6, placed by G8, held as in G9).
7. The body moves, with her hair on spring chains as the Fox's is; then her own moves and spells (H1 to H18, I1 to I8, and round 4).
