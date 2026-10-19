# Ranger, Herbal Witch and Fox: animation plan

Chris's speed choices, October 18, 2026. Every move ends at about 6 fps with the same pacing he liked.

**Status: done.** All 9 moves were smoothed from the 23 returned strips (70 new poses) on October 18, 2026. They are in the flipbook and the game export.

| Move | Was | Now | Plays at | Release frame | How |
|---|---|---|---|---:|---|
| Fox: Blue Mischief | 8 @ 2 fps | 22 frames | 6 fps | 16 | 2 in-betweens per gap (≈3×) |
| Fox: Borrowed Face | 8 @ 2 fps | 22 frames | 6 fps | 10 | 2 in-betweens per gap |
| Fox: Hemline Fangs | 8 @ 4 fps | 12 frames | 6 fps | 7 | +50%: 1 in-between in each of the 4 action gaps |
| Witch: Silverleaf Salve | 8 @ 2 fps | 22 frames | 6 fps | 16 | 2 in-betweens per gap |
| Witch: Elderwood Guardian | 8 @ 2 fps | 22 frames | 6 fps | 13 | 2 in-betweens per gap |
| Witch: Harvest Crescent | 8 @ 4 fps | 12 frames | 6 fps | 8 | +50%: 1 in-between in each of the 4 action gaps |
| Ranger: Moonsteel Draw | 8 @ 6 fps | 10 frames | 6 fps | 5 | 2 extra finishing frames |
| Ranger: Silver Arrow | 8 @ 6 fps | 10 frames | 6 fps | 5 | 2 extra finishing frames |
| Ranger: Silverglass Ward | 8 @ 4 fps | 11 frames | 4 fps | 6 | 1 frame while the shield builds, 1 while it disperses, full shield (R20) shown twice |

Release frames follow the original key pose, so cast times in seconds didn't change. For example, Salve still releases at 2.5 s and Guardian at 2.0 s, which keeps the v0.3 balance sim valid.

## Pipeline notes from this round (for the next art session)

- **Pipeline tags:**
  - M (Harvest Crescent), N (Salve), P (Guardian) and Q (Fangs) now hold the smoothed sequences.
  - New tags: X (Blue Mischief), Y (Borrowed Face), J (Moonsteel Draw), L (Silver Arrow), T (Silverglass Ward).
  - Each frame's `src` in meta.json names its original key, or is `new` for an in-between. The old 8-frame drafts are rebuilt from those keys and stay in the flipbook under "Older drafts".
- **Scale, one per strip:** ChatGPT draws every figure in a strip at the same size, but each strip comes back at a different size (0.48× to 1.5× of the keys). So use one uniform scale per strip, fitted by overlaying that strip's key copies on the original keys (silhouette overlap ≥ 0.6). Don't scale each pose by its own height: crouches and leaps would get stretched to standing height.
- **Ranger's dark lace leggings:** they're close to the backdrop colour, so the body mask can stop at the hip, and the floor cleanup then cut off her legs. The cutter (extract2.py) now absorbs nearby sizeable pieces (boots, shins) into the body before anchoring.
- **Check every move:** a contact sheet of all frames on one baseline, plus a per-frame height list.
