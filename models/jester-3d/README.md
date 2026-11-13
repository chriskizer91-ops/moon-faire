# Jester Witch 3D model

The code-built three.js (r128) model of the Jester, with Chris's painted references baked on as textures.
Published at https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M. The full history, measurements and open gaps are in the
claude.ai Project "Flip Book Art", doc `claude/jester-3d-model.md`. Read that first.

## What is here

- `src/`: the model, in numbered parts that `build.sh` joins into `out/jester.js` (`makeJester(opts)`).
- `viewer/`: the viewer page (stage, the night square, body, move, spell and lore buttons, Flipbook look).
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
- `shoot_page.py`, `seq.py`: stills of the real page stepped by hand, and of one move at chosen moments. `check_moves.py`: every move over every stance.
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

## Walking her around, and more moves (pass 17, November 11, 2026)

Chris: "I want to see more of her moves animated, or like more animation done to her moves, and the ability to walk her around
a small space".

**Walk around** (viewer only: `viewer/app.js`, `roamStep`). A switch at the head of the Body row puts a round pad on the stage.
She moves the way the pad points as the camera sees it, turns to face the way she goes, walks at up to about 0.7 m/s and runs
at 2.3 m/s when the pad is pushed to its edge. Keys: W A S D or arrows, Shift to run, Space to jump. The stage is a circle
2.85 m in radius with lanterns round it (`stage.lanterns`), and the key light and its shadow follow her (`stage.follow`).
Her step keeps pace with the ground she covers (the phase advances by distance, about 10.1 a meter walking and 4.2 running).
The model is told it is not on a treadmill (`opts.treadmill = false`), so the cloth trails from her real motion. She gets up
before she goes if she is sitting, stands still to cast, and can talk, wave, laugh or jump on the move.

**New moves** (`src/86_moves.js`): `wave`, `bow` (a deep one, one foot drawn back), `twirl` (two turns on the ball of her right
foot), `laugh`, `dance` (a jig with a finish), and two she does by herself when left standing, `look_around` and `settle`
(the viewer plays one every 6 to 13 seconds). A move can now turn her whole body: `spin: [[time, angle], ...]` on a move, read
by the host as `J.spin` and added to the root's turn. The twirl ends on a whole number of turns, so nothing unwinds.

Checked: the new moves over standing, the stool and the hover, and a walk with a wave, ran with no errors; stills were looked
at; the walk pad was driven with keys in a headless browser and she went where she was sent. Not checked: how any of it feels
at real speed, and the pad under a real thumb.

## A true walk, quick buttons, room effects and a practice dummy (pass 18, November 11, 2026)

Chris: the walk "looks like a slow run" (the run is good); the buttons for spells and moves should be easier; spells should
"really invoke something happening in her environment", such as a screen shake, a wobble, or particles across the whole screen;
and next he wants her in a space where she can attack a dummy or a character, as a playable character.

- **Walk** (`fillBase`, `src/75_pose.js`). Rewritten as a walk: each foot is down for 62% of the stride so one is always on the
  ground, heel first and toe last, the swinging foot low, hips lowest when both feet are down, arms hanging and swinging.
  One stride covers about 0.82 m, so hosts advance the phase by about 7.66 for each meter walked.
- **Hits** (`src/90_api.js`). When a move passes one of its hit times the model counts it: `J.state.hitN`, `hitName`, `hitK`
  (how hard, from `impact` on the move; set per spell at the end of `src/87_spells.js`). `J.targetDist = meters` moves where
  aimed spells land (the usual 2.6 m is scaled).
- **Room effects** (viewer, `roomHit` and `roomStep`). On a hit the picture jolts, heavy spells make it sway, light flashes from
  where the blow lands, and motes cross the whole stage, a different kind for each spell (`LOOK`): silver rain for The Last Toll,
  motes that hang still for Stop, confetti for Curtain Call, and so on. Jolt and sway are skipped for people who ask their
  device for reduced motion.
- **Quick buttons** on the stage (`#pad2`): Cast the chosen spell, arrows to choose it, Jump, and Move (a flourish, a new one
  each press). Keys: 1 to 0 cast spells, Q and E choose, F casts, R flourish, Space jumps. The flipbook inset moved to the top.
- **Practice dummy** (viewer, with Walk around; the Dummy switch hides it). When she casts an aimed spell she turns to put the
  dummy on her casting side, the spell lands where it stands, the camera takes both in, and the dummy rocks and glows when
  struck. It is the first step toward a space with a real opponent.

Checked: no errors on the page; a hit was forced in a headless browser and the jolt, flash and confetti showed. Not checked:
all of it at real speed, and whether every spell's effect lines up on the dummy from every angle.

## In the night square, with her moves from the lore (pass 19, November 12, 2026)

Chris: every button stays (standing, sitting, walking, running, laughing, talking, dancing, twirling and the rest); put this HD
witch into the not-HD night square with the tents and the dummy; and build her spells as the lore describes them
(the Project's `lore/jester-3d-and-lore.md`), adding, never removing. So nothing that was there is changed: the ten spells and
the body moves play as before. Everything below is added beside them.

Published as its own page for now, https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh ("Jester Witch 3D: the night square").
The first page (the link at the top of this file) still shows pass 18 until Chris has seen this one and says to move it over.

**Where she stands** (`viewer/square.js`, `viewer/stage.js`). The square is the not-HD model's training square
(branch `claude/jester-not-hd-3d-model`, `viewer/world.js`), rewritten for three.js r128: flagstones round a new-moon
medallion, lantern posts with bunting, striped tents, stars, the new moon, fireflies. It is turned half round so the big tents
are behind her, and the moon hangs lower so her long lens can find it.

- The stage now has two scenes. `stage.world` (the square, with its own lights and fog) is drawn first; `stage.scene` (her, her
  spell effects, the dummy, her own lights and shadow) is drawn over it. Her look is the one tuned in the theatre, wherever
  she stands. `stage.square = false` goes back to the little theatre, drawn exactly as before.
- `stage.dark` (0 to 1) turns the world down toward black before she is drawn, so a spell can put the square out and leave
  her and its own light showing. `stage.dim` still lowers her own lights, as the old spells ask.
- **Glow** (`stage.glow`). The frame is drawn into a half-float picture kept in screen values (so her sheer cloth and her
  spell light mix exactly as they do drawn straight to the screen), whatever is brighter than white is blurred at four sizes,
  and the sum is laid back over it. It needs WebGL 2; without it, or with the switch off, the frame is drawn straight to the
  screen. Colours in `square.js` and `88_void.js` go brighter than white on purpose.
- The Flipbook look now lays her pixel picture over whatever is behind her, so the square stays smooth.
- r128 counts light differently from the newer three.js the not-HD square was tuned in: sun, sky and fill are those values over
  pi (then a little up), and the lantern lights were refitted by hand.
- The camera in the square: a 30 degree lens (22 for the Face view and in the theatre), kept inside the ring of lanterns and
  above the ground; where it cannot back away it widens its lens instead. It is settled before `animate`, so effects that
  face the camera or hang in front of it are drawn for the frame's own view.
- The dummy is the not-HD one (burlap, straw, target board), 2.8 m to her casting side. Aimed spells turn her to it whether or
  not Walk around is on. With the pad at rest, Walk and Run send her on a lap of the square.

**The look of her power** (`src/88_void.js`). The not-HD model's effect building blocks (`viewer/fx.js` on its branch), moved
into the model: holes with the night sky inside (`VF.voidBall`, `VF.voidFlat`, `VF.hole`), darkness (`VF.shade`), thin cold
light (`VF.hoop`, `VF.rune`, `VF.wave`, `VF.flare`, `VF.strip`, `VF.orb`, `VF.pillar`), and round star dust (`VF.motes`).
Each is drawn afresh every frame from the move's own clock under a name; what is not asked for again is hidden next frame.
The reference-set F pictures were not brought over. Shaders end with `linearToOutputTexel`, and `VF.shade` raises what it
leaves to the power 0.45, because the frame is kept in screen values.

**Her moves under the lore** (`src/89_lore.js`). Keys go through `autoHold`: a channel holds what it had until shortly before
its next key, then moves (the older moves let a channel drift from rest toward its first key). Keys taken from an older move
are marked `raw` and left alone. `defAction` now keeps a move's keys, so a new move can be built from an old one.

- `doom` (5.4 s): her big spell. Sealed Fate's own opening from the flipbook, then she turns, throws the seal, holds her open
  hand on her target while the rings turn, and closes her fist as they clamp shut into one. Blows: `land`, `clamp`.
- `doom_end` (12.9 s): the cast that brings every foe to zero. The same, then her flipbook's Curtain Call with the night
  closing over it: a new moon lit between her hands and lifted in three thin rings, the ground under her the night sky, a
  black hole falling on what is left of her foe, a new moon rising behind until the sky is stars, and two curtains of night
  that meet as her arms come down and part on her bow. Blows: `land`, `zero`, `doom`, `gone`.
- **The charge** (`J.charge`, 0 to 1; pass 20, below). In pass 19 this was a ring for each hit; Chris chose dust instead.
- `taunt_attack` (6.0 s): two steps of her jig, a twirl with the black hole gathering over her raised left hand, the fling up
  and over, her hand pressing it down onto her target, a laugh. Blows: `press`, `burst`.
- `taunt_heal` (8.0 s): Against All Odds's opening, then a jig through one full turn with her arms up inside the circle,
  a laugh, a flourish. Seven stars join into a figure round her and their light runs down into her alone. Blow: `heal`.
- `hit_laugh`, `hit_dust`: taking a hit at full power. She rocks back, bounces up, and laughs with her hands on her hips or
  brushes her shoulder off. Her bells jingle. Over a stance only her body above the hips moves.
- `caper`, `prance`, `juggle`: more dancing and jester acting. Juggle is three small new moons tossed from hand to hand, and
  works over any stance.

**What the model tells its host** (`src/90_api.js`): `J.dark`, `J.shake` (a rumble), `J.charge`, `J.camera` (set it: effects
face it), `J.arena` (how far the open ground runs), `J.spellLight`, and for each blow `state.hitTag` and `state.hitI` beside
`hitN`, `hitName`, `hitK`. A move can name its blows (`tags`), weigh each (`impacts`) and act on one (`onHit`). A hit
reaction's blow is tagged `struck`.

**The page** (`viewer/app.js`, `viewer/index.tpl.html`): a From the lore row (Big spell, Big spell: the ending, Attack taunt,
Heal taunt, Take a hit, Empty the charge) with what she has absorbed under it; Caper, Prance and Juggle in the Moves row; a Hit
quick button; Night square and Glow switches; keys H, B, N, T, Y. The dummy answers each kind of blow: pressed flat, knocked
back, left hanging at zero, drawn in, taken, and stood up again a few seconds later. `JESTER.step(n, dt)` steps the page by
hand for checks.

Checked: every move over every stance (`check_moves.py`), no errors and no broken numbers; stills of each new move
(`seq.py`, `shoot_page.py`) at phone and laptop size, in the square and the theatre, with glow on and off and in the Flipbook
look. Not checked: any of it at real speed. The headless browser here runs at under two frames a second, so timing and feel,
the weight of the hit reactions, and how the dances read in motion are Chris's to judge. Not on a real phone either: the
glow pass is the new cost there.

Not yet done: a guard; a real victory and defeat; expressions beyond her three mouths and eyelids; the battle, the wraith and
the sound from the not-HD demo; the old six spells still wear their own effects.

## The charge as dust (pass 20, November 12, 2026)

Chris, after seeing pass 19: the charge counts damage, not hits. Every blow aimed at her charges her, whether or not she drew it
by taunting, and it is full when the blows add up to 75% of her own HP. She is the tank; how little of that damage she really
takes (halved, or healed back) is balance for later. On screen it is "an aura of dust that gets thicker and thicker until she
uses it", and then it "manifests out of the air as those rings". He likes the moves and their timing as they are.

- **Model** (`src/89_lore.js`). `J.charge` is 0 to 1; the model does not know what a blow is worth. The dust is one `THREE.Points`
  of up to 560 single points (420 on a phone) moved in the vertex shader, so it is one draw call and no work per frame on
  the processor. A point comes out when the charge passes its own mark, so the dust thickens evenly; the dust a blow has just
  added shows brighter for a moment; the light near her dims a little (`VF.shade`). Points are about one sprite pixel wide.
- **The cast** (`fxDoom`). The dust draws into a band round her (`dustBand`), her rings come out of the air one after another
  (three at the least, five from a full charge), and what is left streams to the seal (`dustPull`). From there the cast is
  as it was in pass 19. The charge is spent at the release.
- **Page** (`viewer/app.js`). `HER_HP` (1,000), `FULL` (75% of it) and `BLOW` (160 to 320 a hit) are stand-ins so the charge
  can be watched. A hit reaction's blow (`struck`) adds to `J.charge`. The Big spell button works at any charge.

Checked: the lore's moves and the two flipbook spells they are built from over every stance; stills of the dust at each
charge, in the cast, walking, in the theatre and in the Flipbook look. Not checked: at real speed, or on a real phone.

## Her moves in the game (pass 21, November 13, 2026)

The moves each witch uses in the game were settled on November 13, in the claude.ai Project "Flip Book Art", doc
`lore/combat-balance.md`. Chris asked for a new page of the Jester with only the spells she uses in the game, every Move and
every Body state, adding to her moves where the new rules ask for it and removing nothing. The night square page
(https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh) stays exactly as it is. He also wants the **Flipbook look kept as a switch
on every model**: a model has to look right without it first, and then the look can be laid over it. It must not be used to
hide a model that does not look good without it.

Published as its own page, "Jester Witch 3D: her game moves": https://claude.ai/artifact/MnovyvRW8qZj9DnUMwUP4n

**Her five moves in the game, and what each is here:**

| In the game | In the model | What the rule adds |
|---|---|---|
| Gilded Rebuke: 40 to one foe | `g_rebuke`: `gilded_rebuke` played whole | The chain draws a thin gold ring, and the blow is thrown from the bells to the foe as a thread of gold |
| Attack taunt: 50, and she catches the next 3 blows | `taunt_attack`, as it was | Three small new moons circle her, one for each blow she will still catch (`J.game.catches`) |
| Heal taunt: 10 MP, heals her 120, and taunts | `taunt_heal`, as it was | The same three moons |
| Sealed Fate: ends a sealed foe; every other foe loses 20% of its full Life | `g_seal`: `doom` played whole | The foe is drawn into the seal and goes out as the rings shut; a streak runs along the ground to each other foe |
| Curtain Call: the same cast when it leaves no foe standing; fainted friends stand at 25% | `g_curtain`: `doom_end` played whole | The splash, the other foes taken with the first, and a light standing up where each fainted friend lay |

- **Model** (`src/89b_game.js`, and one line in `src/90_api.js`). Nothing older is changed: `doom`, `doom_end`, `gilded_rebuke` and
  the rest play as before, and the three new moves call the old moves' own keys and effects, then add theirs. The rules belong
  to the game, so the host tells the model what it needs through `J.game`:
  - `fates`: one entry for each foe, kept in the same place in the list (`null` for a foe that is gone):
    `{ x, y, z, r, h, k, sealed }`. `k` is the foe's Fate as a share of the Life it has left. It shows as dust falling round
    the foe like sand (one `THREE.Points` for each foe, moved in the vertex shader). Sealed, the fall stops, the dust locks
    into a tilted ring, and a small eclipse hangs over the foe.
  - `others`: where the foes she is not casting at stand. The splash goes to each.
  - `friends`: where her fainted friends lie. With none given, three places behind her are used.
  - `catches`: 0 to 3.
  - `J.charge` (pass 20) is still there. This page sets it to the Fate share of the foe nearest its seal, so the dust round
    her still thickens and still becomes the rings when she casts.
- **Fate replaces the charge of pass 20 in the rules.** Fate is on each foe, not on her: a blow a foe lands on her gives that
  foe 500, a heavy one 1,000, and a friend dropping below half gives every foe 5% of its Life. A foe is sealed when its Fate
  covers all the Life it has left.
- **Page** (`viewer/game.js`, `viewer/game.tpl.html`, `build_game.sh`). The same stage, square and model as the night square
  page; `viewer/app.js` and its template are untouched, so that page still builds as it was. All words and numbers are data
  at the top of `game.js`: `GAME` (the five moves), `RULES`, `FOES` (two sacks with a knight's and a wisp's numbers),
  `FRIENDS`, `WORDS`. Each foe has a bar over it (its Life, with Fate growing over it) and numbers rise from each blow.
  The buttons always work, so any move can be watched at any time: Sealed Fate seals its foe first if it was not sealed,
  and switches to Curtain Call by itself when it would leave no foe standing. The camera takes in the foes while she casts
  at them and for a moment after a blow. The flipbook inset is on the left here and only carries the 20 frames this page
  can show.
- **Not built:** the three friends themselves (the lights stand in for them), her fainting (on this page her HP stops at 1),
  the turn bar, and the Fox's and Io's moves that feed Fate (Same Cloth, healing). The swing of up to 25% on damage and
  heals is left out so the numbers can be read.

Checked: every move over every stance (186 pairs, no errors or broken numbers), and the three new moves again on the final build; stills of a whole fight at phone size (blows, both taunts, Gilded Rebuke, Sealed Fate with its splash, the cast that runs on into Curtain Call, new foes standing up), in the little theatre, in the Flipbook look and at laptop size; the single file run on its own clock with its buttons pressed, with no errors. Not checked: at real speed, or on a real phone.

## What is kept here

Everything needed to rebuild her is in this folder: the model source (`src/`), the viewer (`viewer/`), the bake and build scripts,
the test and measuring tools (`shoot*.py`, `compare.py`, `facecmp.py`, `guides.py`, `prof_cmp.py`, `lib/`; `package.json` names
the node packages they use), the baked textures and flipbook frames (`out/`), and every reference painting Chris has sent
(`references/`: 23 character paintings, 2 hands, 5 faces, 8 boots, and the HD flipbook page with its 58 painted frames inside
it). The paintings are stored as high-quality WebP copies; `lib/restore_refs.py` turns them back into the PNG folders the bake
reads. Not kept: scratch renders, old copies of the source from each pass, and Chris's phone photos of his screen.

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
./build_game.sh                       # out/game/: the page for her moves in the game (pass 21)
python3 build_single.py game          # deliver/Jester_Witch_3D_game_moves.html
python3 fight_shots.py                # stills of a whole fight on that page, as sheets in shots/
python3 smoke.py /home/claude/work/deliver/Jester_Witch_3D_game_moves.html "A foe hits her" "Sealed Fate"   # run a built file on its own clock and press buttons
python3 check_moves.py                # every move over every stance: errors and broken numbers (about half an hour; name moves to run a few)
python3 seq.py doom doom "1.3 3.2 4.0"  # stills of one move at chosen seconds on the real page, joined into shots/doom_sheet.png
PAGE=out/game/test_local.html python3 seq.py seal g_seal "3.4 4.0 4.3"   # the same on the game moves page
python3 shoot.py shots/x 'new Promise(r => setTimeout(() => { T.step(200, 1/60); r(1); }, 2500))' front:0,0.04,7.6,0.86,18,560,820
```

`build_site.sh` expects `out/site/fb/` (copy `out/fb` there). The reference files are data: run Python that reads them with `-I`.
