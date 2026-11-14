# Stage 7, part A report: his face moves, three talking loops, fourteen emotes, blink and fidgets

Written by the builder, November 14, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures and check outputs: `/home/claude/builder/work7/final/`. Scratch scripts: `/home/claude/builder/work7/scripts/`.
Source before this stage: `src_before_npc_moves/`. Nothing was published. Git was not used. The network was not used.

**Motion was not watched.** The headless browser shows stills only. Everything below about movement comes from stills taken by stepping
the model's clock at 1/30 s, and from numbers. Timing, speed and feel need Chris's eye (or yours on a real screen).

## In short

- His face blinks on its own and changes eyes and mouth from painting C2: eyes `shut`, `half`; mouths `oh` (parted), `oo`, `smile`.
  Face at rest unchanged: front and three-quarter pictures before and after, 0 pixels differ.
- Three talking loops, fourteen emotes and three fidgets, by the fair folk's exact names, all started by one function, `act(name)`.
- They play as a layer over whatever the legs do and end back at his resting stance (measured: 0.0 mm from a fresh stance).
- He blinks, and in "Idle" fidgets on his own every 7 to 13 s (shift, look about, rub hands), never over a move that is playing.
- Page: "Talk" row (Calm, Lively, Gruff, Quiet) and "Emotes" row (14). Part B's buttons are not added.
- Both closing checks pass (output below). Triangles unchanged: 599,059. One new texture file, 156 KB.
- Stance, walk, talk and idle with fidgets off are bone-for-bone the same as before this stage (a sum over every bone's place after
  90 frames of walk, 150 of talk, 150 of idle: 605.876151, 696.323855, 597.323017 in both builds).

## What I built, and where

| What | Where |
|---|---|
| Face patches from C2 | `bake_face_parts.py` (new) -> `out/tex_faceparts.json` (keys `facePart_shut/half/oh/oo/smile`, `faceParts` = rectangles) |
| Face on a canvas, `paintFace(eyes, mouth)` | `src/N40_head.js` (replaces the one-picture `faceT`; the Ranger's `R40_head.js` method) |
| All moves (`ACTS`), the move layer (`act`, `stopAct`, `talkLoop`, `actFrame`, `actSample`), arm solver (`reachQuat`), talking mouth (`sayMouth`), blink and face per frame (`faceFrame`), automatic fidgets (`AUTO`) | `src/N98_moves.js` (new; joined in `build.sh` between `N80_dust.js` and `N99_static.js`) |
| The layer read in `body()`: hips, spine, head, shoulders added; hands mixed (`mixHand`, `mixReach`, `ARMV`); talk_lively runs `talkArms` on its own clock; `faceFrame` called from `animate`; `pose()` stops every move; API | `src/N99_static.js` |
| Page rows and notes | `viewer_n/index.tpl.html` |
| README section | top of the stage sections in `README.md` |

### How a move is written (comment at the top of `N98_moves.js`)

`ACTS[name] = { dur, keys: [{ t, channel: value }] }`. Channels: `hd` (head: nod, turn, tip; a third also on the neck), `sp` (spine
lean, turn, tip, shared over three bones), `sh` (shoulders up, [right, left]), `hip` (metres), `R` / `L` (a hand: `p` wrist position on
his chest as he rests in the A-pose, or on his head with `f: 'head'`; `el` elbow direction; `pa` palm turn; `wr` wrist bend; `c` finger
curl; `i` index curl), `eyes` (0..1), `mouth` ('rest'|'open'|'oo'|'smile', held), `say` (a talking mouth: 'calm'|'lively'|'gruff'|'').
Numbers glide with smoothstep from key to key, from rest before the first key; `'rest'` hands the channel back.

### The arm solver (`reachQuat`)

A key places the wrist; the arm is solved exactly (no search) with his own bone lengths, the elbow on the side `el` points to. His
elbow hinge is the forearm bone's own X axis, which is not square to the A-posed arm (27 degrees out), so the bend lies on a cone: the
bend that gives the needed angle is worked out on that cone. Consequence: his elbow cannot fold closer than about 54 degrees (wrist no
nearer the shoulder than 0.243 m). The solved upper-arm and forearm turns are slerped over the arm the stance/walk/talk gives, by the
hand's weight. My first solver (Gauss-Newton on armSet's out/fwd/elbow/turn) reached the targets but chose absurd elbows (elbow on his
breastbone in the bow); it was replaced.

## Exact names, and how part B starts and stops them

All on the model's api (`makeNoiz(...)` result):

| Call | Does |
|---|---|
| `act(name)` | starts any move below; returns its length in seconds, or `false` for an unknown name. A move already playing is held and melts away over 0.3 s. Works over any leg move (`stand`, `idle`, `walk`, `talk`; seated in part B, untested). |
| `stopAct()` | lets the current move melt away over 0.3 s |
| `acting`, `actTime` | the move playing ('' when none) and its clock |
| `talkLoop(name)` / `talkLoop(null)` | keeps a talking loop going; an emote started meanwhile plays out, then the loop starts again. `null` stops it. `looping` gives the loop's name. |
| `acts` | `{ talk: [...], emotes: [...], fidgets: [...], dur(name) }` |
| `auto` | `{ blink: true, fidget: true, fidgets: [...] }`; set to false to stop either. Blink runs in every leg move except 'stand' and the A-pose. Fidgets run only in 'idle' with no move playing and no walk or talk. |
| `setFace(eyes, mouth)` / `setFace(null)` | holds a face (for pictures); null lets him go |
| `pose()` | stops every move and loop (the measuring pose) |

Names (identical spelling to `witches/people/npc/emotes.js`):
- talking loops: `talk_calm` (7.2 s), `talk_lively` (9.6 s), `talk_gruff` (7.0 s)
- emotes: `nod` 1.6, `shake_head` 2.0, `wave` 2.8, `greet_bow` 3.0, `shrug` 2.2, `laugh` 2.8, `point` 2.6, `think` 3.4, `surprised` 1.8,
  `sad` 3.4, `cross` 2.2, `beckon` 2.6, `refuse` 2.4, `thanks` 2.6
- fidgets: `fidget_shift`, `fidget_look`, `fidget_hands` (3.6 s each)

For part B: `body()` decides "idle" for fidgets as `mv.name === 'idle' && walk weight < 0.01 && talk weight < 0.01`; when part B adds
seated or travelling states it should keep fidgets off while moving. Head/spine are additive on top of whatever part B's legs set;
hand targets are on the chest, so they follow the chest when seated. `play('talk')` (stage 5) still exists and now moves his mouth
(lively voice); it is the same gesture set as `talk_lively`.

## What each one is

- `talk_calm`: slow nods; right hand lifts to waist height, turns open, offers twice, settles. Mouth calm (slower syllables).
- `talk_lively`: his stage 5 talk (right hand offers, both hands open, left finger marks a point), quick mouth.
- `talk_gruff`: his own. Left hand rests on the front of his belt by the dagger, chin down, weight back; the right hand chops twice low
  and short; a slow look to his right. Mouth in short bursts, no smiles.
- `nod`, `shake_head`: deep first, smaller second. `wave`: big open right hand up beside his hat, swung from the elbow, smiling.
- `greet_bow`: a showman's bow: right forearm folds across his waist, left arm sweeps out low with palm up, bow from the waist
  (spine 0.31 rad), eyes lowered, smile. **The hat brim is not touched**: see "Decided" below.
- `shrug`: hands out at belt height, palms up, shoulders up, head tipped, 'oo' mouth. `laugh`: head back, left hand to his belly,
  shoulders bouncing, eyes creased, mouth between open and smile. `point`: right arm ahead and to his right, index out, head and chest
  turn along it. `think`: left hand up just under his beard (back of the hand out), right forearm across under it, head tipped, eyes
  narrowed. `surprised`: lean back, both hands up a little, palms forward, mouth open then 'oo'. `sad`: head down, shoulders a touch
  low, eyes half shut, hands hanging a little out. `cross`: raised right forefinger wagged, chin down. `beckon`: right hand forward palm
  up, fingers drawn in twice. `refuse`: left palm up and out, small head shake. `thanks`: right hand flat on his heart, small bow, smile.

## Face (C2)

`bake_face_parts.py`: C2's cell 1 settled onto his face picture (out/tex_face.json, from C1) by SIFT + RANSAC similarity: scale 2.508,
63 points agree; cells 2-6 onto cell 1 (shifts of 0, 32, 64 px; 103-135 points agree). Patches are toned by blurred ratio (sigma 14 px)
and stored already mixed into the face over their rectangle (eyes x 224-790, y 255-382; mouth x 294-731, y 569-723 of 1024). Mouth
patches keep C1's pixels wherever both pictures have dark hair (luminance below about 95), so the moustache and beard are C1's.
I compared three ways (direct paste, difference transfer, and this one) side by side; difference transfer ghosted, direct paste
softened the moustache to C2's lower resolution (`work7/cmp_parts.png`, `work7/cmp_hyb.png`).

Face at rest: `face_before_front.png` / `face_after_front.png` and `_q` in `work7/` (cloth frozen, stance): 0 pixels differ out of
630,000 in each. The same check shows `setFace` really changes the picture (`final/face_states.jpg`), so the 0 is not a dead test.

Repainting: the 1024 canvas is redrawn and re-uploaded only when the state changes (about 5 to 7 times a second while talking).

## What I checked, and how

All with cloth live unless said. Scripts in `work7/scripts/`; outputs in `work7/final/run_checks.txt` and `hand_clearance.txt`.

1. **Every move end to end** (`numcheck.js`, cloth on, 1/30 s): NaN in any bone matrix: 0 in all 20. Farthest bone from his origin:
   1.55 m (1.69 in wave: the raised hand). Wrist off its target while a hand is fully held: 0 to 1.2 mm (gruff 1.2, laugh 0.3).
   Back at rest after the move: 0.0 mm (hands and head vs a fresh stance).
2. **Layering and robustness**: wave while walking, three emotes cut into each other, a 13 s gruff loop with a nod inside it (loop
   comes back), loop off, 60 s of idle (all three fidgets fired), clock jumps of 5 s, 1e9, -1, NaN, `pose()` during a wave: no NaN,
   nothing flies off, states as expected.
3. **Hands near everything else** (`clear.js`): at 10 moments of each move, distance from 9 bones of each hand to points of the doll's
   trunk, corset, trousers, belt and gear, hat, face, hair, glasses (points moved by their bones; corset points below 1.0 m left out
   because that skin is thrown away there). A hand is about 12 mm either side of its bones. Nearest per move (mm):
   trousers 22-32, gear 16-26, body 62-97, corset 37+; hat, face, hair, glasses never within 6 cm. Two hands: 23 mm apart in
   `fidget_hands` (rubbing: touching, maybe 1-2 mm into each other), 192+ elsewhere.
   Fixed along the way: `sad` fingers 3 mm from the trousers (shoulders dropped the arms in: now 22); `think` thumb 3 mm into the
   pouch as the right hand crossed (now passes in front: 26); `talk_gruff` left hand hovering 9 cm off the belt (now 36 mm).
4. **Arm inside sleeve**: the stage 3 ray test (`tools/shirt_through.js`, copied with my moments) at 16 moments. Arm points 0.08 to
   0.30 m down the arm. With the test's own self-check (every point moved 8 cm out) it reports 384-400 of 392-400 outside, so it can see.
   Real result: 0 outside in 10 moments; 1 to 55 points outside, all between 0.081 and 0.161 m down the arm (just under the shoulder),
   in greet_bow, think, thanks, fidget_hands (arms across his front) and 1 point in talk_gruff. Stage 3 had 0 here in stand/walk/talk.
   I then drew the doll's arms red and trunk green under the cloth (`final/arm_through_sleeve_check.jpg`, four moves, four sides
   including from above): no red shows anywhere except the bare forearm below the sleeve band, which is by design. So I read those
   points as under the shirt's body where the sleeve meets it, not visible. A tiny green speck shows at the top of the shoulder seam in
   two of the three-quarter views of think and fidget_hands (the trunk through the shirt by a pixel or two).
5. **Stills**: every move at four moments, front and three-quarter, cloth live (`final/emotes_1.jpg`, `emotes_2.jpg`, `emotes_3.jpg`,
   `talk_fidgets.jpg`); close-ups of the bow, think, gruff's belt hand.
6. **Closing checks** (both run at the end, after the last edit):
   - `python3 -I build_single.py`: `deliver/Noiz_3D_stage1.html 2.98 MB (offline) | deliver/index.html 2.38 MB (to publish)`, exit 0.
   - `python3 /home/claude/npc/work/quick_page.py`: 50 buttons (all listed, including Calm, Lively, Gruff, Quiet and the 14 emotes),
     `click errors: []`, `errors: 0`, exit 0.
   - The page's new rows at phone width: `final/page_rows_phone.png` (390 px wide, four rows of chips; the 3D view was hidden for that
     picture).

## What I did NOT check

- Motion: nobody watched any move play. Speed, smoothness and the 0.3 s melts are unjudged.
- Anything seated (part B does not exist yet). The layer is written to sit over any legs, but no seated pose was tried.
- The face on a real phone GPU (the canvas texture is the same kind the face used before, same size).
- The old painted shirt / trousers / hair, the blank doll and the doll with these moves (buttons pressed by quick_page without error,
  not looked at).
- The model at less than full detail or texture scale (`TEXS` < 1 is handled in code but not pictured).
- Hair through collar: I did not measure it; in the stills (bow, sad, nod) nothing showed, but the head never turns more than about
  0.47 rad (fidget_look) and leans at most 0.32 (sad), so I did not build a meter.
- Hat brim vs hands: the meter shows no hand within 6 cm of the hat in any move, which is all it shows.
- Fingers against each other and against his own palm (no meter).
- That every emote reads as intended at game distance; framing of the stills is fairly close.

## What I decided, and why

- **No hat tip in the bow.** I built a bow with the right fingers at the brim front (hat meter 7 to 16 mm, so it touched). The ray
  test then found 120 to 156 arm points outside the sleeve at 0.22 to 0.30 m down the arm, and a close picture showed the pink elbow
  through the sleeve. The brim is only about 25 cm in front of his shoulder, so the hand needs the elbow folded almost as far as his
  rig allows, and the sleeve cloth cannot follow that fold. Moving the hand out so the elbow opens left the fingers 4 to 9 cm short of
  the brim. So the bow is a courtly sweep with the arm across his waist instead. If Chris wants the hat tip, it needs either a looser
  sleeve fold at the elbow or a hat that is lifted (the hat bone moved), which is beyond part A.
- **Hand targets on the chest, not angles.** So a move keeps its meaning whatever the spine or legs do, and gear/trouser clearances can
  be reasoned about in metres.
- **Talking mouth is a fixed sequence** of C2's five shapes per syllable slot (hash of the slot), so a picture at a moment is always the
  same. Different syllable length and mix per voice.
- **talk_lively is his stage 5 talk** (allowed by the brief), run on the move's own clock.
- Blink is off in 'stand' (it is the held-still pose used for pictures) and in the A-pose.

## What is rough

- The smile is small (C2's own smile is small and closed-lip) and the patches are softer than the face round them (C2 is 2.5 times
  smaller): visible close up while talking, not at a distance.
- `think`: the hand sits just under the beard (wrist 1.395 m), knuckles not quite on the chin; raising it more would put the hand into
  the beard and was not tried.
- `greet_bow`: the bow is seen mostly from the side; from the front it reads as a nod with an arm across.
- `fidget_hands`: the hands touch (bones 23 mm apart); may overlap by a millimetre or two.
- `nod` and `shake_head` are modest (0.24 and 0.26 rad).
- Shirt shoulder seam: a speck of the trunk at the top of the shoulder in two three-quarter views (see check 4).
- Forearm skin above the leather cuff shows when the forearm is raised; that is the costume (sleeves pushed up), as before.

## Pictures (in `/home/claude/builder/work7/final/`)

| Picture | Shows |
|---|---|
| `face_states.jpg` | rest, shut, half, open, oo, smile: front and three-quarter, beard in frame |
| `emotes_1.jpg` | nod, shake_head, wave, greet_bow, shrug: four moments each, front and three-quarter |
| `emotes_2.jpg` | laugh, point, think, surprised, sad |
| `emotes_3.jpg` | cross, beckon, refuse, thanks |
| `talk_fidgets.jpg` | talk_calm, talk_lively, talk_gruff, fidget_shift, fidget_look, fidget_hands |
| `arm_through_sleeve_check.jpg` | doll arms red, trunk green under the clothes, in thanks, think, fidget_hands, greet_bow, four sides |
| `gruff_belt_hand.jpg` | talk_gruff's left hand on the belt, three sides |
| `page_rows_phone.png` | the Movement, Talk, Emotes and A-pose rows at phone width |
| `run_checks.txt`, `hand_clearance.txt` | the numbers above |

Best three to look at first: `face_states.jpg`, `emotes_1.jpg`, `talk_fidgets.jpg`.
