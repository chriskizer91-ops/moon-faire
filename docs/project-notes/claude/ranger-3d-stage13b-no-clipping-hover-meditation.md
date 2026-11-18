# Ranger 3D, stage 13b: nothing passes through, and the hover as meditation

November 13, 2026. Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (file `Ranger_3D_stage13b.html`).
Code: repo `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`.

## What Chris said

"The fall is good as it is. the two strong shots should be arrows of light. Also her hands pass through her bag and her
legs and the hover animation should look like meditation it is close but her hands are inside her thighs basically just
stop the body part clipping or phasing whatever it's called"

## Decisions

- **The fall stays as it is** (on her knees, slumped).
- **The gem's two strong shots are arrows of light.** Not built yet. This is the next thing to build.

## What changed

- Her hands and forearms no longer pass through her satchel, her pouch or her legs, in any move or on the way from one
  move to the next.
- Standing, walking and jogging, her arms hang and swing a little wider: 15 degrees from her side where they were 9.
  The satchel and the pouch sit just where her hands used to hang, so her hands now go round them.
- **Hover** reads as meditation: the backs of her hands rest on her thighs just above her knees, palms up, finger and
  thumb together.
- **Sit**: both hands hold her raised knee. Her right hand used to lie where the satchel is.
- **Hard hit, Court bow, Win, Wave**: a hand on its way to her middle, her heart or her hip goes round her hip and bag.
- **Sword**: between the cut and putting the sword away, her left hand goes round her hip. It used to pass through her.

## What it was before (measured)

Standing in "Ready", her right hand was 48 mm inside the satchel. Walking, 45 mm. On the way down to sit a hand went
103 mm into a thigh; 79 mm in the squat; 73 mm in the hover. After the fix, 1 mm or less is left in every move where
her hands are free.

## Not covered yet

- Only hands and forearms are kept out, and only out of the bags and legs. Elbows and upper arms, weapons, charms and
  hair can still pass through her or each other. There is no shape for her body itself.
- While a hand holds the bow, the sword or a knife it is left exactly where the weapon needs it.
- "Stand still" is left as posed, to compare with the paintings, so there her right hand still touches the satchel.

## For the next session: how it is built

All in `src/R99_static.js` unless said.

- **`clearHands(N, dt, snap)`** runs in `animate` after `emoteStage` and `hoverLight`, before `fingersTick`.
  - `CLR.balls[S]`: six balls on each hand (wrist, two on the palm, two on the knuckles, one on the fingers) and two on
    the forearm.
  - `CLR.rods`: each thigh and shin as a rod with round ends, widths from the leg table (`prof(R_LEG, y)`).
  - `CLR.bags`: each bag as a dome on its own bone, from `BAGBOX` (filled in by `src/R45_gear.js`): an egg shape whose
    middle is 5 cm inside her hip, 5 cm wider than the bag each way and as deep.
  - `clrPush` finds the way out for one ball. Just inside, it is straight through the skin. The deeper the ball, the
    more it leans to one fixed side: out from her hip for a bag, out to that hand's own side and up for a leg. This is
    what stops a hand flipping across when it goes through the middle.
  - The wrist is moved by the worst push and the arm worked out again with `reach`, up to four rounds, faded in over
    the first 6 mm so it never starts with a jump.
  - In `draw`, `sword` and `knives` a hand is moved only while it holds nothing (`CLR.free`, eased; a hand "holds" when
    its finger shape is hook, hold, grip or fist).
  - `D.clip`, `D.clipAt`, `D.clipLeg`, `D.clipLeft` report each frame. `D.clearOff = true` turns the fix off.
- **Paths had to change too.** A hand whose own path goes deep through her cannot be pushed out smoothly; the push
  jumps when the worst shape changes. So: posture hands take a small arc (out, up, forward) on the way; `hand()` in
  `emoteStage` sends a travelling hand out and forward; the sword's left hand is pushed out from her hips mid-way.
  **When adding a move, give the hands a path that goes round her, then let `clearHands` tidy the rest.**
- **Hover hands**: placed on the thigh's skin at up to 82% of the way to the knee, moved toward the hip until the arm
  reaches; `handQ` turns the palm up; finger shape `FP.mudra`.
- **Two tools to run after adding or changing any move:**
  - `tools/clip_audit.sh` (add `off` to see it without the fix): for every move, how deep her hands went, where, and
    what is left.
  - `tools/pop_audit.sh`: the furthest a wrist moves in one frame with the fix off and on. A much bigger second number
    means the fix is making a hand jump.
- **Two mistakes made and fixed here.** A first bag shape counted everything behind the bag's back face as inside, which
  caught hands crossing in front of her and held them back. And a `//` comment put in the middle of a long line cut off
  the rest of that line.

## Checked

`clip_audit.sh` and `pop_audit.sh` over all 22 moves; stills of standing, walking, the five postures, the hard hit, the
bow and the sword. Page test at phone size, three parts: no errors.

Not checked: on a real phone, and nothing was watched in motion.
