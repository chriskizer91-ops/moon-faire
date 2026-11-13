# Io, the Herbal Witch, in 3D

Started November 13, 2026. Built the way the HD Jester was (`claude/HOW-TO-3d-witch-models.md` in the project), following
the Ranger's stage-one recipe: this folder began as a copy of the Ranger's stage-one code (`claude/ranger-3d-model`, commit
`1d4c9d6`), with the Jester's platform boot builder (`claude/jester-3d-model`, pass 20) in place of the Ranger's boots.

## Where she stands: stage one (November 13, 2026)

Body and base outfit, checked against her round 1 paintings. Nothing moves yet.

- **Built:** torso with the bodice painted on (B3 front and back, B2 at the sides), bare arms and legs, the skirt as eight
  stiff tiers with the slit over her left leg, boots, hands, a plain head form. 232,000 triangles.
- **Page:** `deliver/Io_3D_stage1.html` (one offline file, 1.4 MB), published at
  https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep. Republish each stage's page to that link. Views, three poses, the painting beside her, the skirt on
  or off. `deliver/Io_stage1_vs_paintings.jpg` is the model beside B3 and B2 at one scale with the outlines laid over.
- **Stand-ins:** the skirt is stiff and its lace is solid (one tier cut from B4, with a drawn scalloped hem); the boots are
  the Jester's boot made 5.5 cm taller and a little wider (no strap, buckle or gold stitching yet); arms, legs and hands are
  plain skin; the head is a form with no face.
- **Not built:** face, hair, glasses, hat, robe, belt, pouch, crystal, necklaces, bracelets, book, sickle, dagger, cloth
  that hangs, movement, spells.

## What is here

- `references/starters/`: the 14 images Chris attaches in ChatGPT. `references/prompts/`: the 104 prompts and the scripts
  that build `Io_Reference_Prompts.html` (see the README text below and `claude/io-3d-reference-prompts.md` in the project).
- `references/round1/`: the 43 round 1 paintings (A1 to E8) as WebP, with the index Chris's zips came with.
- `references/round2/`: the 21 round 2 paintings (F1 to F12, G1 to G9) as WebP, with their index. Not used yet; see "Round 2" below.
- `src/`: the model, joined in this order by `build_io.sh` into `out/io.js` (one function, `makeIo(opts)`):
  `00_util`, `I05_tables` (written by `tools/tables.py`), `10_geom` (skeleton and part builders), `20_tex`, `I21_tex`,
  `I30_body` (torso, arms, legs, skirt), `I31_boots`, `32_hands`, `I40_head` (the plain form), `I99_static` (materials, and
  `pose({arm, leg})` in degrees for checking her against the paintings).
- `tools/tables.py`: every measurement, in one place, for both the model and the bake. Edit numbers there.
- `bake_io.py`: cuts the paintings into `out/io_tex.js` (`window.IO_TEX`: the wrapped body picture, the skirt's lace, two
  skin colours).
- `tools/`: `sil.py` (figure outlines off the plum background), `measure.py` (outline tables in metres), `cmp_io.py` (model
  beside a painting with both outlines), `page_test_io.py` (the page at phone size). `lib/grid.py` puts a labelled grid on a
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

## Checking

`tools/cmp_io.py` lays the model's outline over the painting's. Stage one: front (B3) overlap 0.82, back 0.82, right side (B2)
0.84, left side 0.85; the rest is mostly her head, hat and hair, which are not built. By height, waist, hips, bust, shoulders,
arms, boots and the skirt's outline are within about a centimetre from the front; from the side the upper back sits about
1.5 cm further forward than painted, which is the lean taken out. The page ran at phone size in a headless browser: no
errors, nothing off the side, buttons and a drag work. Not checked on a real phone.

## Building

The scripts use the absolute path `/home/claude/io`. In a fresh session:

```
mkdir -p /home/claude/io && cp -r models/io-3d/. /home/claude/io/ && cd /home/claude/io
npm install three@0.128.0          # playwright and Chrome are needed for the pictures
mkdir -p shots deliver
python3 -I lib/restore_refs.py     # PNG copies of the paintings into refs/
python3 -I bake_io.py              # out/io_tex.js (needs Pillow, numpy, scipy)
./build_io.sh                      # tools/tables.py, then out/io.js
python3 -I build_single_io.py      # deliver/Io_3D_stage1.html, one offline file
python3 tools/cmp_io.py shots/cmp_front.jpg front     # also back, sideR, sideL
python3 shoot.py shots/x 'T.j.pose({arm:28,leg:5.5})' front:0,0.03,6.6,0.9,22     # a still; angles are in radians
python3 tools/page_test_io.py      # the page at phone size (slow: software rendering)
```

The paintings are data: run Python that reads them with `-I`.

## Rules learned this stage

- `spline()` in `00_util.js` reads its keys from low to high. Tables written from the top down (legs, skirt) must be reversed
  first, or use `prof()`.
- When patching a line, never leave a `//` comment in the middle of a statement (it swallowed a `const`).
- The legs must start inside the hips, and the hips must be narrower than the skirt that covers them, or skin shows through.
- Check the scale of a part painting (B5) against a full figure by something both show (the boot), not by its own height.

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

## Next stages, in the how-to's order

1. Head from her profile (C3), face baked from C1 with the states in C9, then glasses (C14), hair (C11 to C13) and hat (C15 to C17).
2. Hands and painted arms (D1 to D4), and her legs painted from B5.
3. Her own boots (E1 to E8).
4. Robe as cloth (A1 to A5; wants F4 to F6 and F10 from round 2), skirt as cloth with see-through lace (wants F8 and F11).
5. Belt, pouch, crystal, necklaces, bracelets (wants F1 to F3).
6. Book and blades (round 2, set G).
7. The body moves, then her own moves and spells (rounds 3 and 4).
