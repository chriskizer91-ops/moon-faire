# Jester Witch 3D model

The code-built three.js (r128) model of the Jester, with Chris's painted references baked on as textures.
Published at https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M. The full history, measurements and open gaps are in the
claude.ai Project "Flip Book Art", doc `claude/jester-3d-model.md`. Read that first.

## What is here

- `src/`: the model, in numbered parts that `build.sh` joins into `out/jester.js` (`makeJester(opts)`).
- `viewer/`: the viewer page (stage, body, move and spell buttons, Flipbook look).
- `bake.py`: turns the reference paintings into `out/jester_tex.js` (`window.JESTER_TEX`): face, expressions, profile layer,
  hands, bodice, veil and fabric swatches.
- `out/jester_tex.js`: the current baked textures. `out/palette.js`, `out/fb.json`, `out/fb/`: palette and flipbook frames for the viewer.
- `references/chatgpt/`: the 23 paintings Chris had ChatGPT make from the model's layout renders (WebP, quality 95).
- `references/hands/`: the younger hand paintings (November 11, 2026); the left-hand picture is the one baked.
- `references/faces/`: five newer paintings of her face (November 11, 2026): front, two three-quarter views, from above and from
  below. They are used to check the head's shape from those angles (`fref.sh` renders the model beside them); the face
  painted on the model is still painting 08.
- `references/boots/`: eight paintings of her boots (November 11, 2026): both sides, front pair, back, three-quarter, from above,
  the sole, and a close view of the laces and sock. The boots in `src/31_boots.js` are built to them.
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
  The face was also slimmed at the jaw after `references/faces/`, and Chris had that undone the same day: the face shape of
  pass 13 is the one he wants. Do not slim the jaw or tilt the jawline again without asking him.
- The ruff sits about 2 cm lower than before so the neck shows, as in the paintings. The hair is a bob that comes out from under the
  cap, lies against the neck and ends at the ruff.

## How she moves (pass 15, November 11, 2026)

Chris asked for running, kneeling, squatting, sitting on a chair, sitting on the ground, jumping, talking with her hands, and more
spells. Motion now has three layers, added one on top of the other each frame in `animate` (`src/90_api.js`):

1. **The base** (`fillBase` in `src/75_pose.js`): breathing, the walk, and the run. `animate(phase, walk, t, dt, run)`: `walk` and
   `run` are blends from 0 to 1 (set both to 1 to run), and the host advances `phase` (about 4.9 a second walking, 9 running).
2. **A stance** (`defStance` in `src/70_anim.js`; the stances are in `src/86_moves.js`): a way she holds her body until told
   otherwise. `setStance('kneel' | 'squat' | 'sit_chair' | 'sit_ground' | 'hover' | '')`. Its keys run from standing to the held
   pose and play backwards to stand up. Going from one stance to another passes through standing. `sit_chair` conjures a stool
   (`stool`, built in `86_moves.js`) and switches on a round seat the cloth rests on (`SEAT` in `src/50_cloth.js`). `hover` is the
   cross-legged pose floating, with a slow bob (`live`) and a wheel of light on the floor (`fx`).
3. **A move** (`defAction`; `play(name, true)`): plays once. Over a stance, a move keeps the stance's legs, its hand targets are
   carried by the chest (`torsoM` works out where the chest is for the stance), and its lean and gaze are added to the
   stance's. So every spell and `talk` work standing, kneeling, sitting or hovering. A move marked `stand: true` (`jump`) stands
   her up first and then plays.

New moves: `jump` (the flight is a true arc, 0.46 m high) and `talk` (11.4 s: nine gestures, with her mouth worked in bursts of
syllables from the three painted mouths). New spells, from `assets/design/moves_v03.json`, in `src/87_spells.js`:
`ill_omen` (2 s), `stop` (4 s), `royal_reversal` (3 s) and `last_toll` (5 s), each timed to its cast and recovery on the sheet.
They have no flipbook frames, so they are built from the eight-step descriptions and are open to Chris's notes.

Things that were added to make them possible:

- Feet have a sixth number, a roll, for lying on their sides when her legs are crossed. Shorter lists are filled from rest.
- `grabCloth(point, reach, spread, n)` and `releaseGrab()` in `src/50_cloth.js`: the loose particles of a veil nearest a point are
  carried by it. Royal Reversal uses it for "two fingers lift an edge of veil". A move that holds cloth is marked `grabs: true`.
- `fxAuto` in `src/80_fx.js`: effect objects made in later files are pushed here and hidden at the start of each frame.
  `oneBell: true` on a move shows the flail as a single bell (The Last Toll).
- Anchors `pendant`, `chest` and `hips`. `debug.applyPose` and `debug.clonePose` pose her directly, which is how the hand for
  touching the pendant was found (a small search that puts her fingertip on it).
- The viewer has three rows: Body (states), Moves and Spells, and on a phone the rows slide sideways. The camera widens and
  shifts toward the target for the spells that travel (`cam` in the `SPELLS` list of `viewer/app.js`).

Checked: every move over every stance (72 pairs) runs with no errors and no broken numbers; each was looked at in stills.
Not yet done: no eyebrow motion (Ill Omen's "eyebrow lifts" is a head tilt and narrowed eyes); getting from one stance to
another always stands up first; the run was tuned from stills, not from video; the hip bells do not rest on her lap when seated.

## Her boots, and crossed legs (pass 16, November 11, 2026)

Chris sent eight boot paintings and said that, sitting cross-legged or hovering, "her feet look like they break".

**Boots** (`src/31_boots.js`, replacing the old block at the end of `30_body.js`). Built in code to the paintings; nothing is
projected. Measured from the side painting at 0.28 mm a pixel: the sole is 26 cm long, 4.5 cm deep at the toe and 6.6 cm at the
heel, and the collar is 26 cm up. Parts:

- the upper: a shaft whose lower rings run out along the instep, and the foot from heel to round toe (`B_SH`, `B_FT`); the
  tongue stands above the collar. Material `boot` is patent leather with a crease normal map made in code (`crinkleTex`).
- the sole: one ridged wall from the lugs up to the welt, cut up at the arch between the block heel and the forefoot
  (`B_YT` top edge, `B_HW` plan, `bBot`), with lugs round the edge and bars under the middle. `soleTex` draws the ridges, and
  `v` is height so they stay level.
- stitching: small yellow dashes laid on the surface in double rows (eyelet stays, back strap, heel counter, collar, toe cap)
  and a bold row round the welt (`stitch`, `dash`). Thin raised tubes mark the panel edges (`seam`).
- ten pairs of silver eyelets, crossed laces, a bow with two loops and two tails with metal tips.
- the sock is its own part now (cream ribs, two grey stripes; `sockTex`), so the stripe band was taken off the leggings.

The new textures use their own random seed, so no other pattern on her changed. Full detail is about 584k triangles.

**Crossed legs.** A foot was always turned to face the ground, whatever its shin was doing, so with her legs folded the ankle
bent the wrong way. Feet now have a seventh number: how far the foot follows its own shin instead of the ground
(`applyPose` in `src/75_pose.js`). `sit_ground` and `hover` set it to 1, with the right shin resting across the left.

Not yet done: the bow is stiff (it does not swing); the boot's leather is one piece of colour, with no painted wear; the thick
sole still bends at the ball when she rises on her toes.

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
