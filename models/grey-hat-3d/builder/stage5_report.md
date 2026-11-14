# Stage 5 report: ankles, a walk with weight, and a stance that is not an A-pose

Written by the builder, November 14, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures: `/home/claude/builder/work5/final/`. Nothing was published. Git was not used. The network was not used.
The source before this stage is in `src_before_walk/`.

**Motion was not watched.** The headless browser is too slow. Everything below is from stills taken by stepping the model's
clock, and from numbers. The timing and feel of the walk, and the half second of easing between moves, need Chris's eye.

## In short

- He opens in a resting stance, not the A-pose: weight on his right leg, left foot forward and turned out, arms hanging with
  the palms in, chest open, head up. Idle breathes and shifts over planted feet.
- The walk is rebuilt from the feet up: heel lands toes-up, the foot rolls flat, the heel lifts and the boot bends at the ball,
  the toe leaves last, the swinging foot stays low. Each foot is down 62% of the stride.
- A planted boot moves over the ground by at most 0.13 mm from one frame to the next, measured on the boot's own skin.
- Hips shift over the standing leg and turn; the shoulders turn against them; arms swing from the shoulder with soft elbows;
  the head stays on his heading.
- Talk has three gestures of its own (offers with the right hand, opens both, marks a point with the left).
- The A-pose is untouched and is one button on the page ("A-pose" under Show). In it the boots are the same picture as
  before this stage, pixel for pixel.
- Triangles are unchanged: 562,697. Bones went from 97 to 99 (one forearm-turn bone a side).
- Both checks pass: `python3 -I build_single.py` and `python3 /home/claude/npc/work/quick_page.py` (28 buttons, no errors).

## What I built and where

| What | Where |
|---|---|
| Stance, idle, walk, talk; `pose`, `play`, `animate` | `src/N99_static.js`, the block "holding still, standing, walking and talking" |
| A foot on the ground: heel edge, flat, ball, toe tip (`footOn`), the swinging foot (`walkFoot`), heel lifts if the leg cannot reach (`heelFor`) | same block |
| A leg turned exactly onto its ankle (`legTo`), the foot turned to the ground whatever the shin does (`footTo`) | same block |
| Hanging arm, palm-in hand, wrist limit, forearm turn (`armSet`, `wristFix`, `fingers`) | same block |
| Talk gestures (`talkArms`) | same block |
| How the boot's leather follows shin, foot and toe (`wBoot`); the doll's foot uses the same | `src/N30_body.js` |
| Forearm-turn bone `ftw` and its weights | `src/10_geom.js`, `wArm` in `src/N30_body.js`, `src/32_hands.js` |
| Page: opens in the stance, "A-pose" button, "Hands" view follows the hand, notes | `viewer_n/index.tpl.html` |
| Checks | `tools/walk_check.py`, `tools/hand_clear.py` |
| README section | top of the stage sections in `README.md` |

`play` now takes `'stand'` (the stance held still), `'idle'`, `'walk'`, `'talk'`. `play(name, true)` goes there at once and
lays the cloth afresh, for still pictures. `pose(o)` is the measuring pose exactly as before, and the model still starts in it,
so every tool that lays him over a painting works unchanged. The page calls `play('idle', true)` as it opens.

## What I took from which witch

| From | What | How it is used here |
|---|---|---|
| Jester, `src/75_pose.js` (her walk) | "Each foot is down for 62% of the stride, the heel lands first and the toe leaves last, the swinging foot stays low." Feet are placed and the legs worked out from them. | The whole plan of the walk. `W_ST = 0.62`. |
| Io, README stage six (ankles) | "Never hold a foot level by force; clamp the ankle and let the heel lift." | The foot is never held level. It stands on a line (heel edge, ball or toe tip) and the ankle's place follows. `heelFor` lifts the heel further when the leg cannot reach. |
| Jester (crossed legs) | "A foot follows the ground when standing and its own shin when the legs are folded." | On the ground `footTo` turns the foot to the ground whatever the shin does. In the air the foot has its own pitch. |
| Ranger, 6c ("Terminator running") | Looser: each part of the spine follows a beat behind the part below; forearm and hand trail the upper arm. | Lags on spine, neck, head and forearm in the walk. |
| Io, `wristFix` and her `ftw` bone | A hand is never turned at the wrist alone; the turn goes along the forearm. | Copied as `wristFix` and bone `ftw`. Needed here because his hands are built backs-forward and must turn 52 degrees to hang palm-in. |
| Io, `fingers` | Finger curl by one number. | Copied, with the hinge worked out from his own hand's frame. |

Two things differ from the witches on purpose:

- **The leg solver is exact.** Io's and the Ranger's takes thigh and shin to lie in one line at rest. His are 3.3 degrees off.
  That would put the ankle about 2 cm from where it was asked to be, which is a sliding foot. `legTo` solves his real leg.
- **The boot bends at the ball.** The witches' boots never fold at the toe. The brief asks for his to, so the toe bone turns
  by up to 27 degrees (`TOE_MAX`) while the toe piece stays flat on the ground.

## What I measured

All from `python3 tools/walk_check.py 48` (output saved in `work5/walk_check.txt`) and `python3 tools/hand_clear.py`
(`work5/hand_clear.txt`).

### The stride

1.32 m in 1.22 s, 1.08 m/s. Each foot on the ground 62% of the stride; both feet down 25% of it.

Degrees. "Heel-up" is the foot's pitch (negative: toes up). "Ankle" is plus when the toes point down from the shin.
"Low" is the sole's lowest point above the ground in mm. `#` on the ground, `.` in the air. His right foot; the left is
the same half a stride later.

| q | on | heel-up | knee | ankle | bend at ball | low |
|---|---|---|---|---|---|---|
| 0.00 | # | -17.2 | 13.2 | -5.4 | 0 | 0 |
| 0.08 | # | -1.3 | 18.7 | 2.3 | 0 | 0 |
| 0.17 | # | 0 | 22.1 | -5.5 | 0 | 0 |
| 0.25 | # | 0 | 16.1 | -10.1 | 0 | 0 |
| 0.33 | # | 1.7 | 6.7 | -11.0 | 1.7 | 0 |
| 0.42 | # | 7.9 | 8.3 | -12.6 | 7.9 | 0 |
| 0.50 | # | 21.2 | 13.8 | -8.4 | 21.2 | 0 |
| 0.58 | # | 39.3 | 23.3 | -0.2 | 27.5 | 0 |
| 0.67 | . | 49.8 | 40.0 | 1.0 | 17.4 | 11.6 |
| 0.75 | . | 37.3 | 62.6 | -10.1 | 0 | 24.9 |
| 0.83 | . | 8.1 | 48.4 | -12.3 | 0 | 27.5 |
| 0.92 | . | -13.1 | 25.2 | -8.2 | 0 | 18.6 |

The swinging sole's lowest point is never more than 28 mm up. The ankle only reaches about 1 degree of toes-down at
push-off; a bare foot would do 15 or more. I left it, reading it as a stiff heavy boot. It is one number (`W_OFF`) if
Chris wants more spring.

### Foot slide

He walks on the spot and the ground passes back at 1.082 m/s (27.5 mm a frame at 48 frames a stride). A planted point must
go back with the ground. Slide is how far it moved over the ground between two frames.

Measured on the boot's own skin (the middle of the sole's points at the heel's back edge and at the toe's tip, moved by
their bones as the graphics card moves them):

| Foot | Point | Frames | Worst slide (mm) | Mean (mm) | Total drift (mm) |
|---|---|---|---|---|---|
| R | heel | 14 | 0.111 | 0.016 | 0.230 |
| R | toe tip | 24 | 0.128 | 0.010 | 0.247 |
| L | heel | 14 | 0.111 | 0.016 | 0.230 |
| L | toe tip | 24 | 0.128 | 0.010 | 0.247 |

What these numbers do and do not show:

- The same check on the bones prints 0.000 everywhere. That is close to true by construction (the foot is built about a
  line that does not move), so it is mainly a check that the leg always reaches its ankle. The skin table above is the
  independent one, and it is the one to quote.
- The skin points are a small patch, not one point. A patch that turns about its own edge moves its middle a little, which
  is where the 0.1 mm comes from. The same patch reads up to 1.5 mm "off the ground" at the heel for the same reason: its
  middle is ahead of the edge the boot is standing on while the toes are up.
- The deepest any point of the boots' skin goes into the ground over the stride is 0.87 mm, at the ball, where the sole
  blends between two bones as it bends.
- **This is the steady walk only.** While he eases from standing to walking and back (about half a second) his feet glide
  to their new places. That is not measured and is listed under rough.
- Standing: over 24 s of idle and 24 s of talk no heel or toe point of either boot moves (0.000 mm).

One false reading, kept here because it nearly went in the table: at 24 frames a stride the first version of the check
printed a steady 0.9 mm slide on every planted frame. The cause was the check, not the walk: `animate` never takes a step
longer than 0.05 s, the check asked for 0.0508 s and assumed it got it. The tool now cuts long steps in two, and at 24
frames a stride the skin table reads 0.18 mm worst.

### Weight and posture in the walk

| What | Measured |
|---|---|
| Hips rise and fall | 21 mm |
| Hips side to side (over the standing leg) | 40 mm in all |
| Hips turn | 4.9 degrees each way |
| Shoulders at the moment the hips are turned most | 3.8 degrees the other way |
| Head turn | 1.2 degrees at most |
| Head tips sideways | 0.8 degrees at most |
| Face rises and falls / side to side | 23 mm / 44 mm |
| Hands swing | about 19 cm ahead of and behind his middle |

The first version had no counter-turn at all: with the hips at 4.9 degrees the shoulders read -0.1. The spine was turning
against the hips, but I had the collarbones' sign backwards, so each shoulder moved against its own arm and cancelled it.
The stills did not show it; the number did.

His face moves 44 mm side to side with his hips. That is the swagger. It can be damped if it reads as too much.

### Hands clear of the cloth

Nearest cloth to the bones of each hand (wrist, knuckles, finger ends). A hand is about 12 mm thick either side of its
bones, so 25 mm is about 13 mm of air.

| Moment | Right hand (mm) | Left hand (mm) |
|---|---|---|
| Stance | 30.0 | 32.4 |
| Talk, nearest of four moments | 25.5 | 27.1 |
| Walk, nearest of twelve moments | 61.6 | 52.9 |

The trousers' own sway (a few mm) is left out of this. The sleeves were judged by eye only (`final/stance_cloth_close.jpg`).

### The A-pose

The boots in the A-pose, four views, before and after this stage: largest difference 0 on every pixel. The A-pose after
having been in idle comes back whole (`final/apose.jpg`).

## What I decided and why

- **The stance's hip height is worked out, not chosen.** It is whatever leaves the standing leg nearly straight (measured: 6 to 12 degrees off straight as he breathes and shifts).
  My first numbers had that knee 15 degrees bent, which the baggy trousers hid in the pictures; the printed knee angle
  did not.
- **Arms hang 8.5 degrees out from straight down.** Closer and the full sleeves and the trousers get in the way.
- **"Stand still" on the page now holds the stance,** not the A-pose. The A-pose is the new "A-pose" button, as asked. The
  three "Arms" buttons are versions of the A-pose, so pressing one switches it on, and the row is labelled so.
- **The "Hands" view looks at wherever his left hand is.** It was aimed at where the hand is in the A-pose.
- **Page notes:** the hair block is replaced by this stage's, with two lines kept about the hair under "Before that".
- **The boots are still the old painted skin.** Only how it follows the bones changed.

## What is rough

- Nobody has watched him move.
- Starting and stopping the walk: his feet glide into place for about half a second.
- The walk is on the spot.
- Talk's second gesture (both hands open) is wide. It may read as too much.
- Not checked in the new poses: the old painted trousers and shirt ("Old trousers", "Old shirt"), the blank doll (the
  button was pressed by the page check without error, but I did not look at it), and the model built at less than full
  detail.
- The ankle crease is a soft blend of the painted leather, not modelled folds.
- The underside of the soles is plain black with no tread. Nobody could see it before; now it shows from behind as each
  heel lifts (`final/walk_back_boots.jpg`). It belongs to rebuilding the boots.

## Triangles

562,697 before and after. No geometry was added.

## Pictures

In `/home/claude/builder/work5/final/`:

| Picture | Shows |
|---|---|
| `walk_side_whole.jpg`, `walk_front_whole.jpg`, `walk_back_whole.jpg` | 12 moments round one stride, whole figure |
| `walk_side_boots.jpg`, `walk_front_boots.jpg`, `walk_back_boots.jpg` | the same 12 moments, close on the boots, on the floor |
| `boots_close.jpg` | heel landing, toe leaving, swing, heel rising, larger |
| `boots_close_doll.jpg` | the same moments with the clothes off: the doll's foot and ankle |
| `stance_8_sides.jpg` | the resting stance from eight sides |
| `stance_cloth_close.jpg` | sleeves, cuffs and hair in the stance, close |
| `talk_4_moments.jpg` | four moments of talk, each from two sides |
| `apose.jpg` | the A-pose after having been in idle |
| `page_opens.png`, `page_apose.png`, `page_walk.png` | the delivered page on a phone-sized screen |

Best three to look at first: `walk_side_boots.jpg`, `walk_side_whole.jpg`, `stance_8_sides.jpg`.
