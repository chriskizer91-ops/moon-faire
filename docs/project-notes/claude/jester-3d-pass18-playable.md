# Jester Witch HD 3D model: pass 18, toward a playable character (November 11, 2026)

Read after `claude/HANDOFF-jester-3d-and-flipbook.md` and `claude/jester-3d-pass15-16-moves-and-boots.md`.

- Page: https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M (live version `1794453799-b389`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/jester-3d-model`, folder `models/jester-3d/`, commit `ffdc462`.
  The README section "A true walk, quick buttons, room effects and a practice dummy" has the code-level detail.

## What Chris asked for (his words)

- "we need to work on the UI for her spells and moves to make this easier"
- "adding effects or things to her spells to make them like really invoke something happening in her environment. Whether
  that's like a screen shake or screen wobble or particle effects across the whole screen"
- "Next after we get the other things I said I want to see her animated in the space where she can like attack a dummy or a
  character from something so focus on the looks of her as a playable character"
- "I meant more new moves and more detail in the current moves, but basically working on the 3D model control animation"
- "her walking skeletal movement needs to be adjusted to a more normal walking gate. The gate for walking looks like a slow
  run. The running gain actually looks pretty good"

## What was done

- **Walk**: rewritten as a real walk (one foot always down, heel first, toe last, low swing, arms hanging). The run is untouched.
- **Room effects**: when a spell lands the picture jolts, heavy spells make it sway, light flashes from where it lands, and
  motes cross the whole stage, a different kind for each spell. The model reports hits (`J.state.hitN`, `hitName`, `hitK`).
- **Quick buttons** on the stage: Cast, arrows to choose the spell, Jump, Move. Number keys 1 to 0 cast on a keyboard.
- **Practice dummy** in Walk around: she turns to it, aimed spells land on it (`J.targetDist`), it rocks and glows when struck.
  This is a first step, done early; Chris framed the dummy or opponent space as the next stage.

## Not done yet

- More new moves and more detail inside the existing moves: only the room effects were added this pass.
- A real opponent, health, damage numbers, dodging, or a designed arena. Chris has not said which character she should face.
- Nothing here has been watched at real speed by me (headless runs under 2 frames a second). Chris's notes on the walk, the
  effects and the buttons are still to come.

## Rules that still stand

Keep the pass-13 face shape, hands at 7% smaller, one two-toned sheer veil with no strips. She casts toward her own left.
