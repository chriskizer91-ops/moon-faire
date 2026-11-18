# Ranger 3D, stage six second pass: her own first moves

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `5388789`.
One-file copy sent to Chris: `Ranger_3D_stage6b.html`.

## What Chris said

- Keep the younger face as made. Leave her hair grey.
- "Working on making her walk look better is where we are now, and then making her body and her fabric and materials move on her body as she walks."
- The Jester's set of moves is the reference, "but she should have her own moves as the character that she is."
- Who she is: very dexterous, maybe acrobatic, the sporty one of the group. She draws a bow and is good with a sword. Quick on her feet. Her animations should lean that way.
- She needs a talking animation, and it should be different: the four should not all have the same one.
- She should have a couple of emotes that use her face, her hands and her body.

## Rules to keep for her

1. Younger face, grey hair. Both settled.
2. Her moves are her own. The Jester's are only a list of what a full set holds.
3. Athletic and quick in everything: light on her feet, ready, direct.
4. Each witch gets her own talking animation.
5. Emotes use face, hands and body together.

## What is built (first drafts)

All in `src/R99_static.js`. `play(name)` starts a move; `pose()` holds her still for checking against the paintings.

| Button | Name | What she does |
|---|---|---|
| Ready | `idle` | Breathes, shifts her weight, bounces twice on her toes every 4 seconds. |
| Walk | `walk` | Lands on her heel, pushes off her toes, her knee gives as each foot lands, hips turn and dip with each stride, shoulders turn against hips, head stays on her heading. One cycle is 0.98 s. |
| Jog | `jog` | The same stride made quick: leaning in, heels kicking up, elbows bent and pumping. One cycle is 0.62 s. |
| Talk | `talk` | Weight on one hip, one quick hand at chest height, small nods, her mouth moving through her painted mouths. |
| Take aim | `aim` | Bow arm out to her left, head turned to it, draws to her jaw, narrows her eyes, holds, lets go. 3 seconds. The bow is not built yet. |
| Cheer | `cheer` | A dip, a jump with one arm thrown up, a soft landing, a smile. 1.5 seconds. |
| Limber up | `limber` | Bounces on her toes, rolls her shoulders, shakes out her arms, tips her head side to side. 2.6 seconds. |

- She blinks in every move.
- Her bags and charms move with all of it (the stage 5b code).
- Walking and jogging share one cycle and blend into each other.

How it is written: every frame each bone goes back to rest, then each layer is added on top (`restAll`, `add`). That makes it easy to add a new move or to mix two.

## Honest limits

- I tuned these from still pictures. I cannot watch them play, so timing and feel need Chris's eye.
- Her fingers do not curl, so her hands stay open in every move.
- Her sleeves, headband tails and loose locks are stiff. That is the next job by his order.
- Her feet slide a little when she walks on the spot.
- The hand in "take aim" comes to her temple more than her jaw.

## Next, in Chris's order

1. Make the walk look better, from his notes on this draft.
2. Make her body, fabric and materials move on her as she walks: sleeves, headband tails, loose locks, then the small give of her body.
3. More of her own moves. Ideas that fit her: a quick sidestep, a spin on one foot, a roll, a ready crouch, drawing and loosing a real arrow once the bow is built, a sword flourish once the sword is built, a two-finger salute, a shrug, a laugh.

## Checked

- Six stills: two moments of the walk, one of the jog, the held aim, the top of the cheer, the talk.
- The one-file page in a phone-size browser: Walk, Take aim, Talk, Stand still, a drag, no errors. Not checked on a real phone.
