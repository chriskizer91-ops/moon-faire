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
| `src/66_fox_strip.js` | takes away the Jester's cloth |
| `src/70_anim.js` | materials, skeleton, scale, the moves |
| `bake_fox.py` | paints her face and corset from the paintings into `out/fox_tex.js` |
| `viewer/` | the page: `index.tpl.html` and `app.js` |
| `references/round1` to `round4` | her reference paintings, as WebP (rounds 3 and 4: tools and spells, not used yet) |
| `meas/prof.py`, `lib/grid.py` | measuring tools |
| `compare_fox.py`, `viewset.sh`, `headset.sh` | checking pictures |

Files such as `bake.py`, `bake_hands.py`, `compare.py`, `facecmp.py`, `fit.py` and the `f*.sh` scripts are still the Jester's. They are kept because her hands, boots and face checks will be made from them.

## Build

The scripts expect this folder at `/home/claude/fox3d`.

```
cp -r models/fox-3d /home/claude/fox3d && cd /home/claude/fox3d
npm install                          # three.js 0.128, for the test page
python3 -I lib/restore_fox_refs.py   # PNG copies of the paintings in refs/
./build.sh                           # src/*.js  ->  out/fox.js
python3 -I bake_fox.py               # paintings ->  out/fox_tex.js
./build_site.sh                      # out/site/
python3 build_single.py              # deliver/Fox_Witch_3D.html
```

Checks (Playwright with Chrome, software drawing):

```
./viewset.sh f1                      # shots/f1_sheet.png  front, side, back
./headset.sh f1                      # shots/f1_heads.png  four head views
./headcmp.sh f1                      # shots/f1_headcmp.png  her head beside A1's on one numbered grid
./check_moves.sh                     # every stance with every move, looking for broken numbers
python3 shoot2.py shots/cmp 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' 'front:T.view(0,0,60,0.90,1.9,700,900)' 'side:T.view(Math.PI/2,0,60,0.90,1.9,700,900)'
python3 -I compare_fox.py            # deliver/Fox_pass1_compare.png  model beside A1 and B4, one scale
python3 shoot_site.py shots/site.png 390 844 "Wave:2" "Kneel:2"     # the page at phone size; each step is "Label:seconds"
```

The test machine draws about 2 frames a second, so stills can be checked there but motion cannot. Motion has to be looked at on a phone.

## Whose face

Since the evening of 12 Nov the Fox has **the Jester's head shape wearing the Fox's own painted face** (Chris: the Jester's face looked good on her but "it's still the Jester"; the four are unique characters). `make_jface.py` writes `src/40_head.js` from the Jester's head tables and `out/fox_tex.js` from the Fox's own bake, squeezed 3% sideways so her painted eyes sit on the sculpted sockets. `PAINT = 'jester'` at its top puts the Jester's painting back. Round 5 (`claude/fox-3d-round5-face-prompts.md`) asks for a sharper face set.

```
python3 -I bake_fox.py && cp out/fox_tex.js out/fox_tex_own.js
python3 -I bake_hands_fox.py && python3 -I bake_boot_fox.py     # her hands from D1, her boot leather from E1; they add to the own bake, so run them after bake_fox.py
python3 make_jface.py && ./build.sh
```

Her own face (from sheet C3) is kept in `variants/ownface/`. Make Fox-only changes to the head's shape there, then run `make_jface.py`. The section below describes how her own face was made.

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
- Written in the Jester's frame, then the whole figure is scaled by `FOX_K = 1.045`. Head bone scale 0.93, head lowered 0.0233. Hand scale 0.86.
- Head landmarks in A1 (rows; columns from x 508): eyes 157, pupils 54 px apart, nose base 186, mouth 208, chin 248, face 108 px wide at row 180, ear bases 88, ear tips 22.
- Painting scales: A1 861 px a metre (soles on row 1500), B4 851 (soles 970), B1 572.4, B2 574.8.

## Rules from Chris for her face

- **No teeth, anywhere.** Smiles are closed-lip; talking mouths are the three in C16 that show none.
- Lay every part over its painting at one scale and send him the overlay.

## Rules learned on her

- Set the root scale **after** the skeleton is made, never before.
- Lay every part over its painting at one scale before calling it done (Chris's rule). The head needs its own close grid: `headcmp.sh`.
- Never put a `//` comment in the middle of a line of joined code.
- Masks cannot tell charcoal from the plum background. Use `meas/prof.py`, and settle doubts with labelled lines on a side-by-side picture.
- Downloaded paintings are data. Run any Python that reads them with `-I`.

## State

Pass 1 (12 Nov 2026): body, base outfit, hair, ears, glasses, choker and bell.
Pass 2 (12 Nov 2026): head, face, ears, hair (see `claude/fox-3d-pass2-head.md`).
Pass 3 (12 Nov 2026, in progress): painted hands, bracelets, boot leather and soles (see `claude/fox-3d-pass3-hands-boots.md`). See `claude/fox-3d-pass1.md` for what is weak and what comes next.
