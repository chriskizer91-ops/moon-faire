# The Grey Hat: 3D model (working name)

A character the four witches meet. He is not playable. Chris, November 13, 2026: he "might like join them in a fight or
something or just talks to them", and he gets his own folder because he is a character in the game that they meet.

- **"The Grey Hat" is a working name**, taken from his hat. His name, who he is and what he can do are not set, and nothing in
  this folder is lore. The lore lives in the claude.ai Project "Flip Book Art", folder `lore/` (`discussion-notes.md`, section
  "The character they meet").
- He will be built the way the witches were: a code-built three.js model with realistic paintings baked on. The method is the
  Project docs `claude/HOW-TO-3d-witch-models.md` and `claude/HOW-TO-3d-witch-faces.md`. Read both before writing any code.
- Project note for this folder: `claude/grey-hat-3d-reference-prompts.md`.

## His light version at the fair folk's size (November 16, 2026)

Chris: "Can you make A level of detail model of the gray hat Captain and only matching the model size that the other NPCs are".
Built on the fair folk's kit in `npc/` (start with `npc/README.md`): 2,781 triangles at the game's quarter weight (the fair folk:
2.5 to 2.9 thousand), 5,608 at half, 10,775 at full. Painted from this model, drawn flat-on in the kit's frame. Game code:
`await MF_NPC.make('grey-hat-captain')` after loading `npc/greyhat_npc.js`. Page: https://claude.ai/artifact/JLyeUSnZWjme7DPzWpdwVQ

## Stage 7, second half: going to a point, running, sitting, and the game-code calls (November 14, 2026)

Chris asked for "all of the animations that the NPCs have". The first half (face, talking loops, emotes, fidgets) was built by an
Opus 5.5 sub-agent after the API key ran out; its section is below and its report is `builder/stage7a_report.md`. Chris then
asked the session Claude to finish him itself. This half is in `src/N99_static.js`.

**Driving him from game code.** The same calls as a fair folk NPC (`game/people/npc/npc.js` on the starter-world branch):

- `update(dt)` every frame (the same as `animate`).
- `face(x, z)`, `greet()`, `talk(true/false)`, `emote(name)`.
- `await walkTo(x, z)`, `await runTo(x, z)` (they give `true` on arrival, `false` if stopped), `stop()`, `moving`.
- `sit()`, `stand()`, `sitting`, `seated`, and `seat()`: `{ x, z, height, back }`, where the top of his seat must be (0.46 m up,
  0.34 m behind where he stands).
- `headTop(vec3)` for a speech mark; `wiring` (his talking loops, hello, fidgets, likes and moods: stand-ins, not lore).

**How it works.**

- The walk's numbers are a set, `GW`, and the run's a second set, `GR`; `G` is the mix in use, so one piece of code plants the feet
  for both. The run is 1.92 m in 0.74 s (2.6 m/s), each foot down 38% of the stride.
- **He is moved by the foot he stands on** (`travel`): after each frame's pose, his root is put where it keeps the point of the sole
  that is on the ground (heel edge, toe joint or toe tip) exactly where it was. Measured: 0.002 mm a frame at full walk or run.
- He steps off left foot first, and shortens his last strides (`NAV.k`, never longer) to arrive at the moment of his stride that
  looks like his stance.
- Sitting (`sk`, `SEAT`, `SEATF`): hips back and down in 1.15 s with a lean forward on the way; feet stay on the floor; hands rest
  on his thighs. Talking loops and emotes play over it.
- `tools/seq.py` pictures him at chosen moments of a move from one loading of the test page.

**Rough.** Turning on the spot is a swivel with no steps. He can stop up to about 13 cm short on a short hop (1 to 6 cm on longer
ones). The run's arms are held a little stiffly forward. Seated, the dagger hangs beside the stool and the scroll lies on his
thigh. Nothing was watched moving; not seen on a real phone.

## Stage 7, part A: his face moves, three talking loops, the fair folk's fourteen emotes, blinks and fidgets (November 14, 2026)

Chris: "give him his hat, his belt and pouch and scroll and jewelry as well as all of the animations that the NPCs have". Stage 7 is in
two parts. **Part A (this)**: face, talking loops, emotes, blink and fidgets. **Part B (next)**: facing a point, walking and running to a
point, the run, sitting, and the game-code calls (`face`, `walkTo`, `sit`, `wiring` ...). Report: `/home/claude/builder/stage7a_report.md`.
Source before this stage: `src_before_npc_moves/`.

- **His face** (`src/N40_head.js`, `paintFace(eyes, mouth)`; the Ranger's method, her `R40_head.js`). The face picture is kept on a
  canvas; patches from C2 are drawn over it: eyes `shut` and `half`, mouths `oh` (parted), `oo`, `smile`. `bake_face_parts.py` makes
  them (`out/tex_faceparts.json`): C2's first cell is settled on C1's face picture by SIFT points (scale 2.51, so the patches are softer
  than the face), each other cell on the first; each patch is toned to C1 by the ratio of blurred pictures and stored already mixed into
  the face over its rectangle. **His beard and moustache stay C1's**: inside a mouth patch, wherever both pictures have dark hair the
  face picture is kept. At rest the canvas is the face picture exactly (front picture before and after: 0 pixels differ).
- **Moves** (`src/N98_moves.js`, new, joined before `N99_static.js`). `ACTS` holds every move as keys on channels (head, spine,
  shoulders, hips, each hand, eyes, mouth, talking voice); the comment at the top of the file says how to write one. They play as a
  layer over whatever the legs do (`body()` in `N99_static.js` reads `actFrame()`): head and spine are added, a hand is mixed in by
  its weight, and every move ends back at rest. A move cut short melts away over 0.3 s.
- **Hands are placed, arms worked out** (`reachQuat`): a key gives where the wrist goes on his chest (or head) and which way the elbow
  points; the arm is solved exactly with his own bone lengths. His elbow hinge is the forearm bone's X, which is not square to his
  arm as it rests in the A-pose, so the bend is worked out on that cone; the elbow cannot fold closer than about 54 degrees.
- **Names** (exactly the fair folk's, `witches/people/npc/emotes.js`): talking loops `talk_calm`, `talk_lively` (his stage 5 talk,
  `talkArms`, on the move's clock), `talk_gruff`; emotes `nod`, `shake_head`, `wave`, `greet_bow`, `shrug`, `laugh`, `point`, `think`,
  `surprised`, `sad`, `cross`, `beckon`, `refuse`, `thanks`; fidgets `fidget_shift`, `fidget_look`, `fidget_hands`.
- **API.** `act(name)` starts any of them (returns its length in seconds, or false); `stopAct()` lets it melt away; `acting` (name or
  ''), `actTime`; `talkLoop(name)` keeps a talking loop going (emotes started meanwhile play out, then the loop comes back),
  `talkLoop(null)` stops it; `looping`; `acts` = `{ talk, emotes, fidgets, dur(name) }`; `auto` = `{ blink, fidget, fidgets }` (what he
  does on his own: blinks except in 'stand' and the A-pose; a fidget every 7 to 13 s in 'idle' when nothing else plays);
  `setFace(eyes, mouth)` holds a face for pictures, `setFace(null)` lets go. `pose()` stops every move. `play('talk')` still works and
  now moves his mouth.
- **Page:** a "Talk" row (Calm, Lively, Gruff, Quiet) and an "Emotes" row (fourteen). Pressing either in the A-pose first puts him in Idle.
- **Checks** (scripts in `/home/claude/builder/work7/scripts/`): every move run end to end, cloth on, for NaN, bones flying off, wrist
  reach error, and coming back to rest (all 0 / 0 / at most 1.2 mm / 0 mm); how near each hand comes to cloth, belt and gear, hat,
  face, hair and glasses; the stage 3 ray test of arm inside sleeve at 16 moments (plus a picture with the arms painted red under the
  cloth); stills at four moments of every move from the front and three-quarter.
- **Rough:** see the report. Motion was not watched; the bow does not touch the hat (the elbow came out through the sleeve);
  the smile is small; "think" holds the hand just under the beard; the talking mouth is not matched to words.

## Stage 6 of the rebuild: his hat, pearls, feather earring, belt, pouch, scroll, charms and dagger (November 14, 2026)

Chris: "he looks good as he is. Let's just go ahead and give him his hat, his belt and pouch and scroll and jewelry". All of it is in
`src/N48_gear.js` (built after the shirt, before the dust), its materials are in `src/N99_static.js` ("His hat, belt and jewellery"),
its surfaces come from `bake_gear.py`. Report: `builder/stage6_report.md`. The source before this stage: `src_before_gear/`.

**Method (the Ranger's, `witches/ranger/src/R45_gear.js`, her stages 5 and 5b).** Every piece is a real shape lying on the real surface
of his body. A thing that hangs has its own bone at its hinge and is a weight on that hinge with two angles (out from him, and along
the belt): gravity pulls it in, the cloth under it is a floor it cannot go below, and the movement of the hinge sets it swinging.

- **Bones added:** `hat` (child of `head`), `hatTip1`, `hatTip2` (the fold and the point); `ear` (child of `head`); `pouch`, `scroll`,
  `charmS`, `charmL`, `dagger` (children of `hips`). `N47_shirt.js` `readBones` now makes room for bones added after it.
- **Meshes added:** `hatFelt`, `hatBand`, `gPearl`, `gSteel`, `gFeather`, `gBelt`, `gPouch`, `gParch`, `gBrass`, `gDark`, `gLeaf`.
  36,362 triangles in all (the hat 14,720). The whole model is 599,059.
- **`HAT`** (top of the file): the hat's own frame. The opening for his head is an oval (0.088 by 0.117 m half-widths) in a plane tipped
  back 23 degrees, its middle at (0, 1.687, -0.042). `HAT.kc(height)` is how the inside of the crown narrows. The crown's first three
  rings are that same oval, level with the opening, so the crown round his head is exactly the room his hair is given.
- **His hair under the hat: `hatPress` in `N99_static.js`.** A piece added to the vertex shader of every hair material (and the clay
  hair, and the old painted hair): after the hair's bones and chains have moved a point, a point outside the hat's room (inside the
  crown above the opening, under a cone below the brim outside it) is pulled straight in toward the hat's middle line. The hair's
  design and its chains are not touched; with the hat off (`setHat(false)`, or the doll) the uniform `uHatOn` is 0 and the hair is as
  it was. `hatRoom()` gives the shader the hat bone's place every frame. The crown's dents are limited to 3 mm where his head is, and
  the hair is kept 5 mm inside, so no dent can show hair.
- **The crown** is a loft along a bent middle line (`SP`: x, y, z, half-width across, half-width front to back), with folds, dents
  and wrinkles added by `crownPt`; each point carries a brightness (`GEAR.SHADE`, a `color` attribute, checked against the point count)
  so folds and the brim's under side are darker. `shadeGlow` makes that brightness dim the material's own glow as well.
- **Pearls:** round the back and sides each bead sits on the collar's fold and takes the bone shares of the point of the fold under it
  (the fold is a pinned edge of the shirt, so it goes exactly where the bones go); across the open front each bead sits on his skin or
  on the cloth there and takes the skin's shares. Beads are rigid balls; there is no simulation in the strand.
- **The belt** follows `beltY(u)` round the corset's bottom edge; `bodyAt(u, y)` is the corset's surface pushed out to the trouser
  cloth wherever the trousers stand further out (`over`). Belt and second strap are skinned with `wTrouser`, so they move exactly as
  the cloth they lie on. The ring leans on the corset at its top and the trousers at its bottom.
- **`GEAR.step(dt, jump)`** is called from `animate`, `pose` and `play(name, true)` before the hair and cloth. A frame is cut into steps
  of 8 ms or less and never taken longer than 0.05 s; every angle and speed is clamped. `floorOf(h)` first puts the thing's hinge where
  the belt is now (`h.follow`), then finds every point of trouser cloth under it where that cloth is now (the cloth's own bone shares),
  and returns the smallest angle that keeps the thing's back clear of all of them. The pouch also rests on the scroll's strap
  (`restsOn`). The hat's point is two soft springs (`SPRING`).
- **API:** `setHat(on)`, `hat`, `setProps(on)`, `props`, `gearKick()`; `debug.gear` (HANG, SPRING, step, settle), `debug.hat`.
  `setDoll(true)` hides both; "Blank doll" turns them to clay (the hair's clay material is `CLAY_H`, which keeps the hat's press).
- **Tools:** `tools/gear_cmp.py out.jpg hat|neck|belt|beltA|whole` (model beside the paintings at one scale, gridded in model metres);
  `tools/gear_clear.py` (how deep any hanging thing is inside the trouser cloth, and how near his hands come, through stance, walk and
  talk; it first turns the pouch into him on purpose to prove the meter reads); `tools/gear_walk.py prefix` (stills through walk and
  talk); `tools/gear_checks.py` (same result on every run, clock jumps, rest, cost, triangles, attribute lengths).
- **Known and not changed:** repeating a run inside one page does not give the same angles for the earring and the hat's point (up to
  0.2 degrees), because his body's idle sway runs on a clock that `play()` does not reset, so his head is not in the same place. Two
  fresh loads agree to six decimal places. The five things hung from his hips repeat exactly either way.
- **Rough:** see the report. In short: the hat's folds are simpler than painted; the ring, pouch and dagger are smaller and sit a
  little differently than in A1 (to clear his hands and the stance); the scroll has no writing; nothing here was watched moving.

## Stage 5 of the rebuild: ankles, a walk with weight, and a stance that is not an A-pose (November 14, 2026)

Chris: "the boots, the ankles need to make a realistic motion as he walks. And I think the posturing of the whole body could be
improved as well. There is a how to do this. And you could also look at one of the other models for the witches, because they
are finished." Report: `builder/stage5_report.md`. Before this stage: `src_before_walk/`.

- **Where it is.** All of it is the block "holding still, standing, walking and talking" in `src/N99_static.js` (`pose`, `play`,
  `body`, `footOn`, `walkFoot`, `legTo`, `footTo`, `armSet`, `wristFix`, `talkArms`), plus `wBoot` in `src/N30_body.js` (how the
  boot's leather follows shin, foot and toe), one new bone a side in `src/10_geom.js` (`ftw`, the turn of the forearm) and its
  weights in `wArm` and `src/32_hands.js`.
- **What `play` and `pose` do now.** `pose(o)` is the measuring pose of his paintings (the A-pose), exactly as before: every tool
  that lays him over a painting uses it, and the model still starts in it. `play('stand')` is his resting stance held still,
  `play('idle')` the same stance breathing and shifting, `play('walk')`, `play('talk')`. `play(name, true)` goes there at once and
  lays the cloth afresh (for still pictures); without `true` he eases from one move to the next.
- **Feet are placed, legs follow** (the Jester's walk, `witches/jester/src/75_pose.js`). A foot on the ground is given by where it
  stands, which way it points and how far its heel is up (`footOn`). It turns about the back edge of the heel while the toes are
  up, lies flat, then the toe piece stays flat on the ground and the foot turns about the toe joint (the boot bends at the ball,
  by at most `TOE_MAX`, 27 degrees), then all of it turns about the tip of the toe. The line it stands on never moves, so a
  planted foot cannot slide. The ankle's place follows from that, and `legTo` turns thigh and shin to put the ankle joint exactly
  there. Exact matters: the witches' leg solver takes thigh and shin to lie in one line at rest; his are 3.3 degrees off, which
  would be 2 cm at the ankle.
- **The ankle is never held level by force** (Io's README, stage six; the Ranger's 6c was the same fault). If the hip has gone too
  far ahead for the back leg to reach, the heel lifts further until it can (`heelFor`). In the air the foot is given its own
  pitch: it leaves heel-high, levels, and arrives toes-up 17 degrees on the heel's edge, moving back at the ground's own speed.
- **The walk's numbers** (`W_T`, `W_L`, `W_ST` and the rest, one line of constants): a stride of 1.32 m in 1.22 s (1.08 m/s), each
  foot down 62% of it, both down 25%, the swinging sole 28 mm clear at most. Hips: 21 mm rise and fall, 20 mm to each side over
  the standing leg, 4.9 degrees of turn; the chest turns against them (shoulders 3.8 degrees the other way at that moment), each
  part of the spine a beat later than the one below (the Ranger's 6c), and neck and head turn back so his face stays on his
  heading (1.2 degrees). Arms swing from the shoulder, each against its own leg, elbows soft, forearm trailing.
- **The stance.** Weight on his right leg (hips 44 mm over it and tipped, left hip low), left foot forward and turned out, its
  knee soft; chest leaning back the other way and open; arms 8.5 degrees out from straight down (the full sleeves and baggy
  trousers need the room), elbows never straight, hands turned palm-in. The height of his hips is not chosen: it is what leaves
  the standing leg almost straight, so it can never be asked to reach further than it is long.
- **Hands turn along the forearm** (Io's `wristFix` and `ftw` bone). His hands are built with their backs forward, as B1 paints
  them; to hang palm-in the hand is turned 52 degrees about the arm's own line, 80% of which the lower forearm's skin and the
  leather cuff take up on `ftw`. The wrist itself bends 36 degrees at most.
- **The boots' skin** (`wBoot`): shaft whole on the shin from 22.5 cm up; foot to shin over 10 cm of height, lower at the front
  (the crease across the instep) and 3 cm higher at the back (above the stiff cup round the heel); the front of the foot goes over
  to the toe bone across 9 cm at the ball, sole and upper together. The doll's foot uses the same weights. In the A-pose the
  boots are the same picture as before, pixel for pixel.
- **Checks:** `python3 tools/walk_check.py [frames a stride]` prints the stride as a table (heel-up angle, knee, shin, ankle, bend
  at the ball, the sole's lowest point), foot slide measured twice (on the bones and on the boot's own skin), the turn of hips,
  shoulders and head, and how far the boots move in 24 s of idle and of talk. `python3 tools/hand_clear.py` prints how near his
  hands come to the trousers and corset. Keep the frames a stride at 25 or more, or think about it: `animate` never takes a step
  longer than 0.05 s, and a check that assumes it did reports a slide that is not there (the tool now cuts long steps in two).
- **The page:** it opens with him in the stance ("Idle"). "A-pose" under Show puts the measuring pose back; the three "Arms"
  buttons are versions of the A-pose and switch it on. The "Hands" view looks at wherever his left hand is.
- **Rough:** while he eases from standing to walking and back (about half a second) his feet glide to their new places; nobody
  has watched him move (stills only); the walk is on the spot; the boots are still the old painted skin, and the underside of the
  soles, which now shows from behind as each heel lifts, is plain black; the old painted
  trousers and shirt ("Old trousers", "Old shirt") were not checked in the new poses.

## Stage 4 of the rebuild: his hair, remade over real ears (November 14, 2026)

Chris: "his ear is printed on his hair", "the hair is one piece and has clothing and face printed on it", "The hair's bad,
really bad." And: "the face straight on is good", so the face was left alone. Report: `builder/stage4_report.md`.
Before this stage: `src_before_hair/`.

- **The hair is `src/N45b_hair.js`** (`HAIR` builds it, `HAIRSIM` moves it; pictures `hairTexN`, `hairAlphaN` at the foot of the
  first half). Four meshes: `hairCap` (a thin shell on his scalp from the crown to the hairline), `hairMass` (a plain dark sheet
  inside the hanging hair), `hair` (the locks you see) and `hairIn` (two layers of locks underneath, darker). 131 locks, 74,868
  triangles with the two plugs in his ears. The old shell (`N41_hair.js`, mesh `projHair`) is still built, hidden, for the
  "Old hair" button.
- **Whose method.** Io's hair (`witches/io/src/I41_hair.js`): a lock is her `tress` (a flat wavy ribbon of strands along a
  middle line, each taking its own narrow strip of one strand picture, tips cut out hard), her plain sheet under the locks, her
  soft chains (`softStep` in `I99_static.js`) and her strand pictures (`I21_tex.js`). The Fox's plan (`45_foxhead.js`): a cap,
  a body of hair, many separate locks over it, its own dice so nothing else reshuffles. His own: locks rooted on a middle
  parting and led round his ears, and a shade stored point by point (`hshade`).
- **Where a lock goes.** `lockLine(f, lam, ...)`: `f` is its place round him (-1 the front edge on his right, 0 the middle of
  his back, 1 the front edge on his left), `lam` its layer (0 next to him, 1 outside). On his head it runs over his skull from
  a root on the parting; below `Y_REL` it hangs between two surfaces: `rIn` (his head, neck, collar band and the doll's
  shoulders with 24 mm for the shirt, sampled once into a table) and `rOut` (the outline measured from C4, `H_ENV`). `H_OPEN`
  says how far round the hair reaches at each height: that is what tucks it behind his ears. Locks of the middle of his back
  run straight down the back of his head from roots at different heights.
- **Measured** with `tools/hair_measure.py` (C4 is 2000 px to the metre by his pupils and by eye to lip): top of his hair
  1.78 m, hairline 1.733 m, outline by height, hair colours from C12, crest to crest of his waves about 0.10 m. And
  `tools/hair_cmp.py` puts the model beside C4 at one scale and prints both outlines.
- **A trap that cost time:** `addPart`'s `out` test (a point inside the head) gets a closed ribbon's facing wrong about half
  the time, because the seam's doubled points outweigh the rest. Half his locks were lit from underneath and the two halves of
  his head were two colours, split at the parting. `lock()` now works the facing out itself from every triangle. Do not go
  back to `out` for ribbons.
- **How it moves** (`HAIRSIM`): nine chains of five bones hang from his head bone, round him from one front edge to the other.
  Each joint is pulled toward where it would rest (the built shape turned with his head, leaning toward plain hanging further
  down), keeps most of its speed, is put back at its length, pushed out of thirteen balls on his head, neck, shoulders, chest
  and back, and held within a leash (2 to 6 cm). The speed a joint keeps from one step to the next is capped at 12 mm. Sixty steps a second, at most four a
  frame; `pose()` and jumps settle it at once. A ball never pushes a joint out of its resting place, so at rest he is exactly
  as built. `api.setCloth(false)` freezes it. Cost: 0.02 ms a frame. `tools/hair_walk.py` prints the numbers.
- **His ears** (`N40_head.js`, `EAR`, `EAR_TEX`, `sideZ`): the built ear moved 18 mm forward to where C4 has it and wears only
  the painted ear from the profile picture; the profile picture is slid back under it so the painted ear is not seen twice.
  Points of the ear that the front painting would have covered take a plain skin spot (`SKIN_UV`). Each lobe has a plug as
  its own small object (material `steel` and `frame`); the feather earring of a later stage hangs from his left one.
- **Glasses** (`N42_glasses.js`): each arm now runs over the top of the ear and hooks down behind it.
- **Switches:** `api.setOldHair(true)` (page button "Old hair") puts the old shell back; `api.setHair(false)` hides whichever
  is worn. In "Blank doll" the hair is clay. `api.debug.hair` and `api.debug.hairSim` are for the tools.
- **Rough:** the top of his head reads as combed flat and the hairline is a hard edge (a lock's side, not strand tips). The
  waves are thinner and tidier than painted and there are no curls at the ends. B1 paints his hair 3 cm wider each side and
  6 cm longer than C4 does; the model follows C4 and goes a third of the way toward B1 below his ears (`B1_WIDE`, `endY`).
  With the hair hidden, the profile painting's own hair still shows on his temples (it is under the hair). Movement was
  checked by stepping the clock and looking at stills, not watched.

## Stage 3 of the rebuild: painted arms and chest, and a real shirt that moves (November 14, 2026)

Chris: "now we need to paint onto his at least his lower arms and his upper chest so that we can then put the shirt on top of
that. So that it looks real, and the shirt's actual fabric that moves because it's like flowy and billowy like the pants are."
**Stage 3 is built. Nothing is published yet.** Report: `/home/claude/builder/stage3_report.md`. Pictures:
`/home/claude/builder/work3/final/`. The source as it was before: `src_before_shirt/`.

- **Paint on the doll** (`src/N99_static.js`, the doll's material, "the paint on his trunk and arms"; `dollArm` in `src/N45_doll.js`).
  Drawn by the material, not stored point by point: collarbones, the notch at the neck, breastbone, chest, nipples, belly, navel, spine
  and shoulder blades, armpits, the shade under his chin where the painted neck stands in the doll, light and dark along the arms, red at
  the elbows, and body hair (short strokes on a grid, which turn into an even tint far away so they never shimmer) on the chest, down the
  belly and on the forearms. It is placed by where a point rests, so it follows him. The doll's shape was not changed.
- **The shirt** (`src/N47_shirt.js`): fourteen sheets of cloth and a small skinned shape. `body` (neck to inside the corset, open in a V),
  `sleeveR` / `sleeveL` (a closed tube from the armhole seam to the band 0.326 m down the arm), `cuffR0/1`, `cuffL0/1` (two lace-edged
  tiers from each band), `ruffleR0/1/2`, `ruffleL0/1/2` (three tiers each side of the lacing), `collar`, and `lacing` (cord and eight
  eyelets, skinned). Cloth paint: `bake_shirt.py` cuts the linen square and one repeat of the lace band out of F13 into
  `out/tex_shirt.json` (linen, lace, laceMask). Lace holes are a hard cut-out. Folds are shape (the `fold` and `shift` of each sheet)
  and paint (each point is darker down in a fold, lighter on a crest).
- **How it moves** (`CLOTH` at the top of `src/N47_shirt.js`; the engine is the Jester's `50_cloth.js`): coarse sheets of points with
  links, each point with a target carried by bones and a pin; gravity, kept speed, push out of capsules on his arms. His own additions:
  a leash on every loose point; sleeves whose slack is slid toward the ground (`HANG`, from the Ranger's and Io's sleeve notes); a smooth
  curve through the points when drawing; the drawn points pushed out of his arms as well as the simulated ones. It works in his own
  space (`root`), is the same on every run, and lays itself afresh after `pose()` or a jump. `api.setCloth(false)` freezes it.
  **Do not change `H_SUB` from 1/120**: pins are counted per step, so at 1/60 every loose piece sags to the end of its leash (tried).
- **The sleeve is kept out of his arm only, not out of his trunk.** In the armpit the arm is inside the trunk's capsule; pushing out of
  both tore a hole. Under the arm the sleeve runs into the body of the shirt and is hidden there.
- **Trousers** sway a little (`TR_SWAY` in `src/N47_shirt.js`): four springs (thigh and knee of each leg) whose lag moves the trousers'
  points in the material, scaled by the room between cloth and leg. They are still the skinned garment of stage 2; the holes are untouched.
- **The corset** is still the old trunk skin, cut down to the corset (`SHIRT_CUT`, `CUT_GLSL` in `src/N99_static.js`): it is thrown
  away above the corset's top edge, and where the paintings have ruffle or cord over the corset it is given plain leather. It is not
  yet its own shell.
- **The leather wrist cuffs** are a piece cut out of the old arm skin (`projCuff`). The doll is not drawn under them when he is dressed.
- **Switches.** Default: new shirt over the painted doll; `projArm` and `projRuffle` off; `projTrunk` drawn as the corset only.
  `api.setOldShirt(true)` ("Old shirt" on the page) puts the old painted shirt back. `setOldTrousers`, `setDoll`, `setBlank` work in
  every state (nine states were pictured). `api.setCloth(on)`.
- **Tools.** `tools/shirt_measure.py` (the shirt and corset edge off B1 and B2, gridded pictures), `tools/shirt_cmp.py` (painting beside
  model, outline and cloth colour tables), `tools/shirt_walk.py` (stills; doll seen where shirt should be; the cloth's meters; thrown
  about; same every run) with `tools/shirt_through.js` (is the arm inside the sleeve, by rays, with a check on the test itself).
  `tools/trouser_walk.py` now gives its white stand-in trousers the sway too, and takes a multiplier to check it can see a fault.
- **Rough:** the ruffled front has three tiers (B2 shows four or five) and is flatter and tidier than painted; the sleeves are plainer
  than painted; a square step in the cloth at each top corner of the open front; where the collar's lace crosses the top of each
  shoulder, a few of its holes show dark and there is a short dark bar at the hem (cause not found: it stays with the old hair skin
  hidden, with the shirt's body hidden and with the collar's shadow off); the old hair skin still has the old collar painted on
  it. Movement was judged from stills only.
- Triangles: 429,459 before, 487,453 now (57,994 added: 55,936 cloth, 2,058 lacing).

## Stage 2 of the rebuild: painted legs and real trousers (November 14, 2026)

Chris: "the pants are going to have actual holes should the skin of the doll be painted before putting clothes over it". Yes.
**Stage 2 is built. Nothing is published yet.** Report: `/home/claude/builder/stage2_report.md`.

- **What he wears by default now:** old trunk, arms, ruffles and boots as before; **new trousers** (`trousers`) over the doll's
  hips and legs (`dollHips`, `dollLegs`), in place of the old `projLegs` skin. The old `projHips` skin is still drawn, but only
  down to the corset's painted bottom edge: below that edge its pixels are thrown away (`CORSET_CUT` in `src/N99_static.js`),
  because the corset comes down in a point lower than the top of the trousers.
- **The doll's paint** (`src/N45_doll.js`, and the `doll` material in `src/N99_static.js`): the body's skin tone is now its own
  colour, `DOLL_SKIN`, less orange than stage 1's (which used the tone of his neck). From the hips down: painted shading
  (`legShade`) and black fishnet tights. The net is drawn by the material from where each point rests on its leg (`dollLeg`),
  so it follows the leg, is sharp close up and fades evenly far away. Solid black above a briefs line and below the ankle.
- **The trousers** are `src/N46_trousers.js`: 31,660 triangles, one cloth, two legs joined on his centre line. The outline is the
  old skin's (measured off B1 and B2), drawn in under the corset from 0.96 m up, with gathers at hem and waist, soft folds, and
  a hem that pouches over the boot's rim. Bone weights are the doll's own (`debug.doll.wAt`), so cloth follows the skin under it.
- **The holes are real.** Eleven (six on his left leg, five on his right), each placed from B1 and B2 (`TR_SEEN`). One picture
  (`TR_MASK`, drawn in code) says where there is cloth; the material throws away the pixels where there is none (a hard cut, no
  blending), and paints the frayed edge and loose threads from the same picture. The inside of the cloth is drawn darker. His
  shadow and the "Blank doll" clay have the same holes. Down the strip of holes the cloth hangs in toward the leg (`slackAt`).
- **The cloth** is one repeating square taken from F8 by `bake_cloth.py` (11.5 cm a repeat), recoloured to B1's tones. It is laid
  on by distance round the leg and height, so it is not smeared at the sides. `out/tex_cloth.json` is not committed: run
  `python3 -I bake_cloth.py` before `./build.sh`.
- **Switches:** `api.setOldTrousers(true)` puts the old leg skin back (`api.oldTrousers` reads it); on the page, "Old trousers"
  in the "Show" row. "Doll" takes the trousers off too. "Blank doll" works in every state. New view: "Close on the holes".
- **Checks:** `python3 -I tools/trouser_measure.py` (holes, net and cloth off the paintings), `python3 tools/trouser_cmp.py out.jpg
  front` (model beside the painting at one scale with a grid; also `back`, `sideL`, `sideR`), `python3 tools/trouser_walk.py folder`
  (walk, idle and talk stills, and a count of doll showing through cloth: 0 everywhere), `python3 tools/trouser_check.py` (skin tones).
- **Decided here, not by Chris:** where each hole sits (B1 and B2 cannot both be right: see the report); the size of the net
  (the paintings disagree; this is B1's width); solid black briefs at the top of the tights (as B5); 11.5 cm for the cloth's repeat.
- **Rough:** from straight to the side the holes are thin slivers at the front edge, not the open ovals of B2. The cloth has no
  thickness and does not swing. Folds are few and soft. The hem's pouch is plain. Motion was checked as stills only.
- `src_before_trousers/` is the source as it was before this stage.

## Stage 1 of the rebuild: the blank doll under his clothes (November 13, 2026)

Chris, on the build with one clothes-shaped skin: "his ear is printed on his hair and his legs are printed on the surface of his
pants. I think it would be better to use one of the witches like blank dolls for their body and then adjust from there into a man
shape, then put the clothes over the doll." The plan: (1) the blank doll, (2) trousers over its legs with real holes, (3) shirt,
(4) corset, (5) hair over a real ear. **Stage 1 is built. Nothing is published yet.** Report: `/home/claude/builder/stage1_report.md`.

- **The doll** is `src/N45_doll.js`: one skin of 52,832 triangles from the foot of his neck to his feet. Its tables (trunk, neck,
  leg, arm, foot) are written the way the Ranger's body tables are, and it uses her bone weights, but it is not her tubes pushed
  together: the tables describe one soft solid and the skin is found on a 9 mm grid (the way the hands are made), so shoulders,
  armpits, crotch and neck have no joins. The numbers are his, from `tools/doll_measure.py` (B5, B3, D3).
- **Seeing it:** `api.setDoll(true)` hides the old skin and shows the doll with his head, hair, glasses and hands. `api.doll` reads it.
  On the page: the "Doll" button in the "Show" row. "Blank doll" (clay look) works in both states. Default is off, and then he
  looks as he did, but not to the last pixel: in 700 x 900 test pictures 6 to 12 pixels differ from the build before, most near
  his crotch. The likely cause is that the old trunk is now its own mesh and is drawn in a different order; that was not proved.
- **Regions, for the next stages:** the old skin is now `projTrunk` (waist up), `projHips` (below 1.06 m), `projLegs`, `projBoots`,
  `projArm`, `projRuffle`; the doll is drawn as `dollTrunk`, `dollHips`, `dollLegs`, `dollArms` (one shared list of points).
  `api.setOldSkin({ legs: false, hips: false })` switches regions of the old skin off, and the doll shows only under those.
  `debug.doll.F(x, y, z)` is the doll's solid (negative inside): a garment can ask it how far it is from the skin.
- **Checks:** `python3 -I tools/doll_measure.py` (measures the paintings, writes `out/doll_measure.json`), `python3 tools/doll_check.py`
  (doll against those numbers, room inside the old skin, mesh lists), `python3 tools/doll_cmp.py out.jpg b5front` (outlines laid
  over each other; also `b5side`, `b5back`, `b3front`, `b3side`, `b1front`).
- **Decided here, not by Chris:** the scale of B5 (900 px/m; it has no whole figure, see the top of `tools/doll_measure.py`); his
  chest, back and upper arms (under cloth in every painting: a slim man, kept inside B1 and B3); plain skin, no paint from B5.
- **Rough:** the tops of the doll's shoulders stand up to 2.4 cm proud of the OLD trunk skin (which dips there), so a doll region
  must not be drawn with the old skin over it (the code never does). The armpit creases when the arms are straight out. The feet
  are simple lumps for inside the boots. No chest or belly detail. Motion was checked as stills only.
- `src_before_doll/` is the source as it was before this stage.

## Second step: his face on a phone, and his sleeves (November 13, 2026)

What Chris said on seeing the first build on his phone: "I think I don't want you to spend a bunch of time like remaking him
from scratch. It actually looks pretty good. The transition from his arms to his sleeves could be better. Also in the artifact
I'm looking at ... he doesn't have a face".

**So he is not to be rebuilt from scratch.** Improve him in place, one thing at a time.

- **The missing face was a bug in `src/N40_head.js`.** In the neck, a `//` comment sat in the middle of a line and swallowed
  the half that fills `uvSide`, so that list was 399 entries short (7 neck rings of 57 points). A real graphics chip refuses to
  draw a mesh with a short list, so the whole `face` mesh (head, ears and neck) vanished on his phone. SwiftShader, the software
  renderer `shoot.py` uses, drew it anyway, so every test picture showed a face. **A headless picture does not prove a mesh draws
  on a phone.** `src/N99_static.js` now throws if any mesh carries a list of the wrong length, so the build fails instead.
  The same bug was what streaked his neck; it is plain skin now.
- **Never put a `//` comment in the middle of a line** when patching: it eats the rest of the line. (The witches' how-to says
  this too.)
- **Sleeve to arm** (`src/N30_body.js`, `A_BAND`, `A_EDGE`, `A_CUFF`, `armAt`, `tier`): the sleeve ends at a gathered band
  0.318 m down the arm. A lace ruffle in two fluted tiers (its own bucket, `projRuffle`, drawn from both sides, moving with
  the forearm) hangs from the band to a free hem at 0.405 m, and the bare forearm (radius about 0.04 m) runs on inside it to
  the leather cuff. Before, the ruffle was only a swelling of the arm tube, smoothed into a funnel.
- **A sharp flap at each upper arm is gone** (`tools/tables.py`). Out to 16 cm from the shoulder the under-side of the sleeve
  runs into the trunk in B1, and the old repair stopped at 13 cm, so three readings took the trunk for sleeve: a lump that
  folded through itself. The under-side is now grown from the top side over that stretch.
- About 345,000 triangles. Page version `1794593239-df79`.
- Not checked: a real phone. Chris has not yet said whether the face shows for him.

## Where he stands: first build, paused part-way (November 13, 2026)

Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (republish every change to that link). About 330,000 triangles.
Project note: `claude/grey-hat-3d-first-build.md`.

What Chris said this session:

- His name is maybe **Noiz** ("the name maybe noiz"). Kept in data (`api.name`, the page title); the folder stays `grey-hat-3d`.
- "his boots do have gold flecks so you'll have to add those in as a code animation of pixel or floating around his feet. When he
  walks like gold glitter dust follows his boots". So the paintings keep plain black boots and the gold is code (`src/N80_dust.js`).
- Seeing the first pictures: "can you make it look more like the 3D models that the witches are? ... every other instance has
  made a blank doll that looked good and then printed the image on top of that." **This is the rule for him from here on.**
- Then: "Can you show me what you've got so far? Without building anymore." So the build stopped where it was.

What exists:

- **All 53 paintings of rounds 1 and 2** are checked and saved in `references/chatgpt/` (A1 to G3). None needs redoing. F8 is a
  flat cloth sample, because the image maker refused the torn hole over skin twice.
- **Head:** the Jester's face model (the head every witch wears), copied from the Ranger's `R40_head.js` into `src/N40_head.js`,
  at 1.06 times its size, eye line at 1.660 m, nose tip 0.096 m forward. Two changes to its shape: a man's jaw (the lower face
  keeps its width further down) and a crown 3 cm lower, so the skull ends under his hair. His face is C1, placed by his pupils and
  lip line; his profile is C3's right figure (`bake_face.py`, landmarks read off gridded copies). Ears from the Ranger's ear code.
- **Glasses** as a real object (`src/N42_glasses.js`). **Hair** as one smooth shell (`src/N41_hair.js`).
- **Body, legs, boots, arms:** forms measured from B1 (front, back) and B2 (sides) by `tools/tables.py`, wearing those paintings
  laid on from four sides by rest position and mixed by which way the surface faces (material `proj`, `bake_proj.py`). The
  sleeves take their sides from A3. Outline against the paintings (`tools/cmp.py`): 94.5% overlap from the front, 94.7% from the side.
- **Hands:** the witches' hand model at 1.10 size, turned as painted (backs forward), in two plain colours (glove, skin).
- **Gold dust:** flecks on the boots, motes round his feet, a trail shed by a moving boot. 1,340 single points.
- **Moves:** `pose`, `idle`, `walk`, `talk`: first drafts from the Ranger's stride. `setBlank(true)` shows the blank doll.

Rough, and why Chris stopped it:

- **The body is his clothes as one smooth skin,** built outline-first and painted by projection, where the witches were built
  as a good blank doll first, then painted. Chris has since said not to remake him from scratch (see the second step above),
  so this stays unless he asks.
- His neck is one plain skin colour (the streaks were the bug fixed in the second step). His hair reads as a hood, with wrong-coloured patches where it
  turns in beside his neck. Up close the body paint is soft (it comes from whole-figure paintings).
- Not used yet: C2 (blink and talking mouths), C4 to C14 (hair, hat, glasses), D (hands), E (boots), all of round 2.
- Not built: hat, belt and ring, pouch, scroll, charms, dagger, pearls, feather earring.
- He stands 1.78 m in his boots. That is Claude's number; Chris has not confirmed it.

Build and check:

```
python3 -I lib/restore_refs.py                 # refs/*.png from references/chatgpt/*.webp
npm install                                    # three.js r128
python3 -I tools/tables.py && python3 -I bake_proj.py && python3 -I bake_face.py
./build.sh                                     # out/noiz.js and out/noiz_tex.js
python3 shoot.py /tmp/s "T.clean('nodust')" front:0,0.03,7.2,0.92,16,700,900     # angles in radians
python3 tools/cmp.py /tmp/cmp_front.jpg front  # outline against the painting
python3 -I build_single.py                     # deliver/Noiz_3D_stage1.html: publish this one (three.js inline, tested)
```

## What is in this folder

| Path | What it is |
|---|---|
| `references/source/grey_hat_picture.png` | The picture Chris shared. The only source for his design so far. |
| `references/starters/` | The seven images Chris attaches in ChatGPT. N1 to N3 are his picture and two enlarged cuts of it. S1 to S4 are the Jester style guides the Ranger's and the Fox's pages also use (from branch `claude/jester-3d-model`, `models/jester-3d/references/`). |
| `references/grey-hat-3d-reference-prompts.md` | Every prompt, the standing rules, the checklist, and what was guessed from the picture. |
| `references/build_prompts.py`, `page.tpl.html` | Build the prompt list, the page, the starters and the zip. All the words live in `build_prompts.py`. |
| `references/chatgpt/` | The kept paintings, as webp, named by code: rounds 1 and 2 (A1 to G3). |
| `src/N46_trousers.js`, `bake_cloth.py`, `tools/trouser_measure.py`, `tools/trouser_cmp.py`, `tools/trouser_walk.py`, `tools/trouser_check.py` | His trousers with real holes, the cloth's repeating square, and the tools that measure and check them and the painted legs (stage 2 of the rebuild, above). |
| `src/N45b_hair.js`, `tools/hair_measure.py`, `tools/hair_cmp.py`, `tools/hair_walk.py` | His hair (cap, locks, the chains that move it) and the tools that measure the paintings, compare him with C4 and step the hair through a walk (stage 4, above) |
| `src/N45_doll.js`, `tools/doll_measure.py`, `tools/doll_check.py`, `tools/doll_cmp.py` | The blank doll under his clothes, and the tools that measure and check it (stage 1 of the rebuild, above). |
| `src/`, `tools/`, `bake_*.py`, `build.sh`, `shoot.py`, `viewer_n/`, `viewer/stage.js` | The model, its measuring and baking tools, and his page. `00_util`, `10_geom`, `N20_tex`, `32_hands` and `stage.js` come from the Ranger's folder. |

Rebuild the page and the list after changing any wording (the page and the zip are not committed):

```
pip install pillow
python3 -I models/grey-hat-3d/references/build_prompts.py \
    models/grey-hat-3d/references/source/grey_hat_picture.png - models/grey-hat-3d/references \
    https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x
```

To rename him, change `NAME`, `CAP` and `SLUG` at the top of `build_prompts.py` and rebuild; then `git mv` this folder.

## His design, as read from the picture

Never mirror him. Seen from his own side:

- **Head:** a slumped grey felt witch's hat with a very wide brim, its tip falling to his left. Thick black rectangular glasses.
  Long wavy dark brown hair to just past his shoulders. A short full beard. A black plug in each ear; a small silver charm and a
  black feather hang from the left one. A short strand of pearls.
- **Body:** a cream linen poet's shirt with a red-laced front, lace-edged ruffles and very full sleeves pushed up the forearm.
  A black leather underbust corset with two buckled straps at the front. Black fingerless gloves under studded wrist cuffs.
- **Hips:** a wide black belt closed by a large silver ring, higher on his left hip, with a second strap dropping to his right
  hip. Right hip: a brown pouch, a rolled scroll in a leather loop, a silver skull charm and a gold leaf charm. Left hip: a
  sheathed dagger.
- **Legs:** baggy black trousers printed with dark red flowers, torn into long oval holes down the front of each leg, over
  black fishnet. Heavy glossy black strap boots with a turned-down studded cuff and a thick lug sole.

Where the picture was unclear, the prompt list says what was chosen (its section "What Claude read from the picture, and
where it guessed"). The open ones: whether the gold flecks on the boots and gloves are real, what exactly hangs on his left
thigh, and everything about his back.

## When the paintings come back

Follow the how-to's order: measure first, body and base layers, head and face, hands, boots, costume solids, cloth,
accessories, then movement. Show Chris each stage, and record what he approves.

- **Start from the Ranger's code** (branch `claude/ranger-3d-model`, `models/ranger-3d/`): it already has glasses, hair you
  can see, painted hands and arms, and belts, a satchel and a pouch as real objects (`src/R45_gear.js`). Take the wide cloth
  trousers and anything that swings from the Fox (branch `claude/fox-3d-model`, `models/fox-3d/`). Copy; do not reorganise
  shared code.
- **His body is a man's.** New proportion tables from A1, A3, B3 and B5. Build the body to B3 and B5 (no corset, no trousers)
  and check it before the corset and trousers go on.
- **His face is his own.** The Ranger and the Fox both ended up on the Jester's face model with their own painted faces. His
  brow, nose and jaw are heavier, so measure his profile from C3 before deciding whether that head can be reshaped to him or
  he needs his own tables. C1 is the painted face, C2 its blink and talking mouths, C9 the check between straight on and the
  side. The beard is paint from C1 over shallow relief; look at it in profile and from below (C8, C13) before adding anything.
- **No teeth**, as on the Fox: his mouth is closed or just parted in every painting.
- **The hat is a solid object** (C10), like the Jester's cap. The brim hides his hairline from most cameras; C12 is his hair
  for when the hat comes off in the bow.
- **Shirt:** the full sleeves are cloth sheets pinned at the shoulder and at the forearm band. The ruffles and lace are cut
  out with the lace's own holes.
- **Trousers:** one baggy cloth per leg with the holes cut out of it (map in F6 and B4), over legs that wear the fishnet (F9)
  on skin.
- **Belt gear:** belt and second strap as loops round the hips, pouch and scroll loop hung like the Ranger's bags, the two
  charms and the feather earring as spring chains.
- **Movement:** he is someone the four talk to, so standing, listening, talking, walking and the hat come first (set H). A
  dagger guard and lunge exist as one optional painting (H9). He has no magic until Chris says what he is.
