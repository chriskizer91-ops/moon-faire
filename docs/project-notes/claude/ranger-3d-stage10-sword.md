# Ranger 3D, stage ten: her sword

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `48f71b7`.
One-file copy sent to Chris: `Ranger_3D_stage10.html`.

## What Chris said

After stage nine (fingers, bow, Moonsteel Draw): "Let's continue she's looking good."

So this is the next thing in the order he agreed: the sword.

## What is new

**Her sword** (painting G4)
- A slim moonsteel blade with two edges, 57.5 cm long and 2.4 cm wide at the guard.
- A crescent guard with its horns toward the blade.
- A dark blue leather grip bound with silver wire.
- An oval blue gem in gold, ringed with gold beads, for a pommel.
- 74 cm long in all.

**Its scabbard** (worn as in painting G6)
- Black leather with a silver mouth and tip, hung by two straps from her belt.
- At the front of her left hip, tip down and back.
- It swings as she moves. Her left thigh pushes it aside and does not pass through it.

**The "Sword" move** (painting H7)
1. Her left hand tips the scabbard. Her right hand crosses and takes the grip.
2. The blade slides out as she hops round to face screen right. She lands on guard, right foot leading, blade raised.
3. The blade goes back over her shoulder.
4. One full cut over the top with a long step. It leaves a crescent of light (painting I5).
5. She holds the lunge, left arm thrown back.
6. Back to guard, round to the front, and the sword goes away.

**Planted feet**
- In this move each foot is put on a spot on the ground and her legs are worked out from it, the same way as her arms.

**Page**
- "Sword" button in the moves row. It turns the camera to the front and pulls it back so the lunge fits.
- "Sword" switch under "More views and switches".

## Checked

- Stills at 16 moments of the move from the front.
- The lunge from the target's side, from behind and from above.
- Her hand on the grip, close up.
- The sword at her hip from four sides, and in Ready, Walk, Jog and at full draw of the bow.
- The cut in the Flipbook look: the crescent stays soft, with no ink line.
- At every still her hands and feet reached where they were wanted.
- The page at phone size: no errors, and a drag turns her.

Not watched in motion. Not tried on a real phone.

## Still rough

- One cut only. More cuts and a thrust can follow.
- No vine engraved on the blade, no leaf work on the guard. The straps are plain.
- When she walks or jogs her left arm can swing through the hilt.
- As the blade leaves the scabbard its point passes through the scabbard's side for a moment.
- In Moonsteel Draw her feet still slide out to the wide stance. The planted feet could be used there too.
- Timing is tuned from stills. It needs Chris's eye.

## For the next session

- Files: `src/R47_sword.js` (sword and scabbard), `src/R99_static.js` (`solve`, `reach`, `plant`, `scabTick`, `swordBeats`, `swordHand`, `swordStage`).
- Stills of a move: `MOVE=sword TX=0.45 tools/seq.sh name az el dist ty fov t1 t2 ...`. It prints how far hands and feet fell short.
- `tools/page_test.py`: `PART=1` covers the bow, the draw and the sword. `PART=2` covers the rest.

## Next, in the order Chris agreed

1. Knives across the back of her belt: wind-up and throw (G5, H8).
2. Silverglass (H6) and the gem (H9).
3. Hit reactions, a dodge, a win and a fall.
