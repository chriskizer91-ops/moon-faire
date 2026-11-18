# Ranger 3D, stage 13: hit reactions, dodge, win, fall, and her emotes

November 13, 2026. Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (file `Ranger_3D_stage13.html`).
Code: repo `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`.

## What Chris asked

"Yes, let's move on to the hit reactions, dodge, a win, and a fall. Adding the emotions from the other characters like
bow, wave, kneel, squat, sit."

The other witches were used only as the list of what to make. Every move here is her own, as he asked at stage six
(the sporty one, quick on her feet, a princess taught at court).

The hover was added too, because he told Io's session: "All four witches can hover, and the hover is a cross-legged
magical meditation," and "The whole party shares four moves: jog, squat, kneel, hover."

## What is on the page now

The moves are in three rows. Picking one lets go of the others.

**Her moves:** Stand still, Ready, Walk, Jog, Talk, Cheer, Limber up.

**In a fight:** Moonsteel Draw, Sword, Knives, The gem, Silverglass, and new:

- **Hit.** A blow from screen right. She rocks away with her eyes shut, her left fist comes up, then she rolls her
  shoulder and is ready again. Her feet stay where they are.
- **Hard hit.** Knocked two steps back, turned from the blow and folded over it with an arm across her middle. She
  straightens and steps back into place.
- **Dodge.** She drops low and slips away from screen right on a bent leg, one fist up as a guard, and springs back.
- **Win.** A low pump of both fists, a hop with one fist thrown up, then her weight on one hip, a hand on it, and a
  two-finger salute flicked from her brow.
- **Fall.** She staggers, drops to her knees and slumps with her head and arms hanging. She stays down until another
  move is picked, then gets up.

**Emotes:** all new.

- **Court bow.** Right foot drawn back, right hand to her heart, left arm swept out, bent from the hips.
- **Wave.** Up on her toes, right hand high and going from side to side, left hand on her hip.
- **Kneel.** On one knee, her hand resting on the raised knee.
- **Squat.** Heels down, hands on her knees.
- **Sit.** One leg out straight, one knee up.
- **Hover.** Cross-legged in the air, eyes shut, hands open on her thighs. A round of pale light turns on the ground
  under her, her gem glows, and a few sparks hang round her.

She slides from any of the held ones (kneel, squat, sit, hover, fall) to any other and back to standing. Nothing jumps.

When she is low, her scabbard lies back along the ground instead of going through it.

Each new move brings the camera in closer than the weapon moves, because Chris said the fight camera was too far away.

## Rough

- All of it is tuned from still pictures. The timing needs Chris's eye.
- Going down to kneel, squat or sit, her feet slide to their new places. They do not step.
- The fall ends on her knees, slumped. She does not go flat on the ground.
- Sitting or down, her bags and charms can sink a little into the ground.
- The hard hit and the dodge both move her toward screen left.

## Questions for Chris

1. Should the fall end on her knees as now, or flat on the ground?
2. The gem's two strong shots from the combat notes are still not built. What should they look like: two arrows of
   light from the bow, or something from the gem itself?
3. What does Silverglass do to a blow, or to her next attack? (Still open from stage 12.)

## For the next session: how it is built

All in `src/R99_static.js`.

- **Postures.** `PW` holds an eased weight for each of `kneel`, `squat`, `sit`, `hover`, `down` (`down` is the posture
  the move `fall` ends in). `PE` is the smoothed weight, kept to a sum of 1; `PE.all` is the total. The "postures" block
  in `animate` moves her hips and bends her back by those weights. `PST` gives each posture a place and turn for each
  foot and the way each knee points; the hover's feet are measured from her hips and follow her shins.
  `emoteStage(N, T)` blends the feet, plants them with `plant`, and places her hands with `reach`. `pose()` clears the
  weights. `seek()` jumps straight to the finished posture.
- **Short moves.** `hit`, `hard`, `dodge`, `win`, `bow`, `wave` are in `SHOTS` and `SLOW`. `OS` is what a short move
  asks of her feet: how far each is from its resting spot, its turn, and how firmly both are planted. Body bends are in
  `animate`; hands that must be somewhere exact (across her middle, on her hip, at her brow, to her heart, the waving
  hand) are in `emoteStage`.
- **Hover light.** `hoverLight()` reuses the Silverglass picture laid flat on the ground, the gem's glow, and 10 of the
  gem's sparks. Light only, like the rest.
- **Scabbard.** `scabTick` now also keeps the tip above the ground.
- **Page.** Rows `#moves`, `#fight`, `#emotes`; `pickMove(host)` unpresses the other rows; `CAMS` has a camera for
  each new move.
- **Tools.** `tools/run_seq.sh` steps a move from another move (`FROM`, `MOVE`) and takes stills, for the slides in and
  out. `tools/page_test.py` has a third part: `PART=3` presses every new button and stands her up again.
- **A mistake to avoid.** A text patch that looked for `if (N === 'hard') {` matched the first of two places and cut
  out a large piece of the file. The file was rebuilt from the stage 12 copy. Patches should check that the text they
  look for appears exactly once.

## Checked

Stills of each posture from the front quarter, the side and close up; of her sliding from standing to kneeling, from
kneeling to sitting and through the fall; and through the hit, hard hit, dodge, win, court bow and wave. Feet reached
where they were wanted at every still. Page test at phone size, all three parts: no errors.

Not checked: on a real phone, and nothing was watched in motion.
