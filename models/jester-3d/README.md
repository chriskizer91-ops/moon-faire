# Jester Witch 3D model

The code-built three.js (r128) model of the Jester, with Chris's painted references baked on as textures.
Published at https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M. The full history, measurements and open gaps are in the
claude.ai Project "Flip Book Art", doc `claude/jester-3d-model.md`. Read that first.

## What is here

- `src/`: the model, in numbered parts that `build.sh` joins into `out/jester.js` (`makeJester(opts)`).
- `viewer/`: the viewer page (stage, move buttons, Flipbook look).
- `bake.py`: turns the reference paintings into `out/jester_tex.js` (`window.JESTER_TEX`): face, expressions, profile layer,
  hands, bodice, veil and fabric swatches.
- `out/jester_tex.js`: the current baked textures. `out/palette.js`, `out/fb.json`, `out/fb/`: palette and flipbook frames for the viewer.
- `references/chatgpt/`: the 23 paintings Chris had ChatGPT make from the model's layout renders (WebP, quality 95).
- `references/hands/`: the younger hand paintings (November 11, 2026); the left-hand picture is the one baked.
- `references/faces/`: five newer paintings of her face (November 11, 2026): front, two three-quarter views, from above and from
  below. They are used to check the head's shape from those angles (`fref.sh` renders the model beside them); the face
  painted on the model is still painting 08.
- `references/Jester_Witch_HD_Flipbook.html`: Chris's HD flipbook, 58 painted frames stored as base64 AVIF in `const FR={...}`.
  This is the look to match. `lib/unavif.py` lists and extracts the frames.
- `bake_hands.py`: makes the hands picture inside `jester_tex.js` (called by `bake.py`; can be run alone).
- `shoot.py`, `shoot_site.py`, `fit.py`, `lib/`: headless render and comparison tools (Playwright with Chrome and SwiftShader).
- `shoot2.py`: like `shoot.py`, but each view is a line of script, so the camera can be aimed anywhere. `hshots.sh` renders a hand
  square-on from five sides, `fshots.sh` and `fclose.sh` render the head from eight and six angles, `fref.sh` renders it beside
  the paintings in `references/faces/`, and `prof_cmp.py` prints her
  painted profile beside the model's, millimetre by millimetre.

## How the hands and the head are made (pass 13, November 11, 2026)

- **Hands** (`src/32_hands.js`). Each hand is one continuous skin. The hand is described as a soft solid: a palm slab whose outline is
  read off the hand painting, the two mounds at its heel, and four fingers and a thumb as tubes with their own width, pad and crease
  tables, blended where they meet. Its surface is found on a 1.25 mm grid (2.2 mm at phone detail) with surface nets, each point is
  then settled onto the solid, and the normals come from the solid, so creases and knuckles shade. The knuckle joints sit inside the
  back of the hand, a little above the webs; the thumb's first bone runs from the wrist inside the heel of the hand and the thumb is
  rolled 60 degrees so its pad faces the fingers. Sizes are in `FINGERS` and `THUMB` in `src/10_geom.js` (1 painting pixel = 0.2366 mm).
  Nails are separate thin plates. The hands picture is 1024 x 1024: five finger strips on top, each wrapping once round its finger,
  and the back and the palm laid flat below. Painted nails are removed from it, because the model has real ones.
- **Head** (`src/40_head.js`). The head is a stack of rings, one per height. `FACE_MID` is her profile read off painting 07 with the
  nose and lips taken away, `NOSE` is the nose that stands on it, and `FACE_V` says how the face turns back toward the ears at each
  height. The outline seen from the front still comes from painting 08. Run `prof_cmp.py` after any change: the model's profile
  should stay within about a millimetre of the painted one.
- **Face paint.** One material mixes three pictures by which way the skin faces (`faceMix` in `buildHead`, the shader patch on
  `MATS.face`): the front painting, the profile painting at the far edge of the cheek, and plain skin under the jaw and on the neck,
  dimmed where the jaw shades it. The front painting is far sharper than the profile one, so it is used as far round as it will go.
- **Pass 14.** Horns leave the head thick, arc over low and thin to a point; the pompom hangs from the very tip (`HORN_CTRL`,
  `HORN_R`). Hands are 7% smaller (`HAND_S` in `handPt`), cuffs about 8% smaller. The fourteen ribbon strands are gone: the veil
  now has one wide front fall on each side, built from the same paths and wearing the edge of the great veil's own painting. The
  sheer veil is "shot": `sheen(..., shot)` keeps its red where you look straight at it and turns it gold where it turns away. The
  jaw is a little slimmer and its line climbs from the chin toward the ear, after `references/faces/`.
- The ruff sits about 2 cm lower than before so the neck shows, as in the paintings. The hair is a bob that comes out from under the
  cap, lies against the neck and ends at the ruff.

## Building

The scripts use the absolute path `/home/claude/work`. In a fresh session:

```
mkdir -p /home/claude/work && cp -r models/jester-3d/. /home/claude/work/ && cd /home/claude/work
npm install three@0.128.0 playwright
python3 -I lib/restore_refs.py        # PNG copies of the references into in/ and in3/
python3 -I bake.py                    # out/jester_tex.js (needs Pillow, numpy, scipy)
./build.sh                            # out/jester.js
./build_site.sh                       # out/site/: index.html, jester.js, jester_tex.js
python3 build_single.py               # deliver/Jester_Witch_3D.html, one offline file
python3 shoot.py shots/x 'new Promise(r => setTimeout(() => { T.step(200, 1/60); r(1); }, 2500))' front:0,0.04,7.6,0.86,18,560,820
```

`build_site.sh` expects `out/site/fb/` (copy `out/fb` there). The reference files are data: run Python that reads them with `-I`.
