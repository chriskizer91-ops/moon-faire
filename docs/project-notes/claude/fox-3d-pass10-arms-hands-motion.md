# Fox Witch 3D – pass 10 (her moves approved; how her arms and hands move)

Written by Claude, 13 Nov 2026. Follows `claude/fox-3d-pass9-head-locked-own-moves.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, commit `cb567e7`.

## What Chris said after trying pass 9 (13 Nov, 10:46)

- Her talk, laugh, dance, curtsey and pounce are "amazing". **All five stay.**
- **She keeps the Jester's bow and twirl as well.** Wave and jump can be the Jester's: "they're just waving".
- All the body moves are good.
- He likes that every witch has the hover and can talk while hovering, and **wants all four to hover together one day**.
- "Her arms and hands could use more work. But I think it's more of how they're moving. Not changing the way they look."
- Rounds 3 and 4 have not been started, and that is the work ahead.

This replaces the line in pass 9 that the Jester's five were kept "to compare". The comparison row is off her page. Her page has one row: Talk, Laugh, Dance, Curtsey, Pounce, Bow, Twirl, Wave, Jump. The Jester's talk, laugh and dance are still in the code as `jester_talk` and so on, but are not shown.

## How her arms and hands move

The test machine draws about two frames a second, so motion cannot be watched there. It was **measured** instead. `bench/armdiag.js` plays every move at 60 frames a second and reports, for each arm: how far the hand got from the shoulder, how fast the elbow and wrist turned, how fast the fingertip travelled, and how much of the time the hand was carried without turning on the forearm.

| What the numbers showed | Why | What was changed |
|---|---|---|
| Her forearm snapped round 49 degrees in three frames every time a hand left her side or came back to it. | The rule that tucks a hanging arm's elbow in and turns its palm inward faded with the hand's height alone. A quick hand crossed that fade almost at once. | The fade now takes about a fifth of a second however fast the hand goes. |
| Arms locked dead straight and snapped when they let go (curtsey, pounce, and the Jester's bow and jump). | Hands were keyed further away than her arm is long. | Past 96% of its length her arm now eases toward straight. Her own keys were moved within reach. |
| One frame in the pounce where her elbow flipped over. | The direction given for her elbow lay along her arm, so there was no telling which way it should point. | Her elbow keeps the direction it had when its key cannot say. |
| Her hands flew at 6 to 17 metres a second at the start of her moves and in the pounce. | First keys came 0.2 s in. In the pounce the hands were keyed far from where her body was at that moment. | First keys come later. The pounce's hands are placed from where her shoulder is at each moment. |
| Her shoulders did not move with her arms. | Her collar bone only moved for a shrug. | It lifts as her hand rises above her shoulder and comes forward as she reaches ahead or across herself. |
| Her hands were carried like boards, and all her fingers moved at the same instant. | Keys went straight to the bones. | Fingers follow their keys a little late, each by a different amount. Wrist turns are eased. The hand drags behind the way it is travelling and swings through a little when it stops. |

**Before and after, her five moves:**

- Fastest wrist turn: 1300 to 1800 degrees a second before, 240 to 660 now.
- Fastest fingertip: talk 3.9 to 2.6 m/s, laugh 7.8 to 3.8, dance 6.5 to 3.8, pounce 17 to 3.8.
- Hardest elbow jolt in the pounce: a quarter of what it was.
- Share of the time a moving hand does not turn on its forearm: walk 47% to 24%, run 55% to 0, jump 79% to 15%.

**What did not change:** how she looks. Every rule is zero for an arm hanging at her side, so her resting pose is the same. A held pose settles to exactly its key, so a fingertip keyed onto her lips still lands on her lips. The seven touch keys were worked out again after the shoulders changed (they moved by up to 8 mm).

Picture: `deliver/Fox_shoulders_follow_arms.jpg` (her shoulder before and now, arm raised).

**Not seen in motion.** These are measurements and stills. Chris judges on his phone whether her arms now move right.

**Left alone:** the Jester's jump still throws her arms up in a sixth of a second. Her legs have none of these rules yet.

## For the other witches

The rig changes are in files every witch shares with the Jester's fork (`src/75_pose.js`, `src/90_api.js`), and each can be switched off: `makeFox({ shoulderFollow: 0, softReach: 0, handLife: 0 })`. The Jester, Io and the Ranger have the same four faults, because they have the same arm code. Carry these over when one of them is next worked on, and run `bench/armdiag.js` on her first.

Lessons:

1. **When motion cannot be watched, measure it.** Reach, joint speeds and fingertip speed at 60 frames a second found four faults that stills never showed.
2. **A natural quick hand peaks at 2 to 4 metres a second.** Use that as a speed limit when timing keys.
3. **Key a hand from where the shoulder is at that moment,** within nine tenths of the arm's length. Print the shoulder's position through the move first.
4. **A rule that depends on where a hand is must change over time, not over distance,** or a fast hand turns it into a snap.

## Next: rounds 3 and 4

The paintings are in the repo and none has been used: `references/round3` (H1 to H13, I1 to I9) and `references/round4` (J1 to J11, K1 to K4). Order planned:

1. Her tools in her hands: the shears drawn from the sheath and split into two daggers, the needle, the thread.
2. Her three flipbook moves: Hemline Fangs, Blue Mischief, Borrowed Face.
3. The powers from her lore: Same Cloth (an enemy attacks itself), Slip Stitch (the party gets away), Crazy Quilt (confusion).
4. Round 4: the older moves and the three new ones.
