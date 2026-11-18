# Ranger 3D, stage eight: the Flipbook look, and the sleeves once more

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `bd860db`.
One-file copy sent to Chris: `Ranger_3D_stage8.html`.

## What Chris said

With a phone screenshot of "Take aim" seen from above: "Her arms are still passing through the lace. Also, can you add the flipbook look button." He passed on the note from the Jester's session: all four witches share the same 56 colours; the 56 have no green; eight slots are free for extra colours.

## The Flipbook look

- Added as a switch, "Flipbook look", beside "Half speed". It is off when the page opens, as the how-to says.
- Done exactly as `claude/HOW-TO-flipbook-look.md` describes: the switch sets `stage.look` to `'flipbook'` or `'smooth'`. Her folder already had the stage code and the shared colour file, so nothing else was needed.
- This is the first time the look has been turned on for her. What it showed:
  - Her face reads: eyes, glasses, brows and mouth are all there close up.
  - One clean dark outline round her.
  - Her skin lands on the same colours on face, neck, chest and arms.
  - **Her grey hair lands on olive brown.** The 56 have no grey close to it. Chris wants her hair grey, so this needs fixing.
- Not done yet: the fix the how-to gives. Add up to eight colours for her, taken from her own flipbook frames (not from the 3D picture), and pass the list as `makeStage(canvas, { palette: [...] })`. Greys for her hair first; then run the how-to's `far.py` on a still to see what else lands wrong (her brown leather, the lace).
- Not checked with the look on: her moves, the charms and thin chains, the wire glasses at fight distance.

## The sleeves

- Folded elbow: the lace now gathers to 55% of its size, close round her upper arm and short of her forearm. The smaller the loop, the less it is allowed to slide, so her upper arm stays inside it.
- Raised arm: the loop slides 1.7 cm toward the ground instead of 2.6, so it rides a little above her arm. Before, it lay on her arm and its ragged folds dipped into her skin.
- Code: `sleeveTick` in `src/R99_static.js`.

## Checked

- "Take aim" from above and behind: the drawing arm's sleeve is gathered near her shoulder and her forearm is clear; on the bow arm the lace sits over the arm with the arm inside.
- The Flipbook look on the one-file page in a phone-size browser: whole body and head, no errors.
- Not watched in motion. Not on a real phone.

## Next

1. Greys (and any other missing colours) for her Flipbook look.
2. Chris's eye on the sleeves in motion, and on the walk and jog.
3. More of her own moves; her bow and sword.
