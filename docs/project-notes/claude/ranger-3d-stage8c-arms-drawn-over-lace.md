# Ranger 3D, stage eight third pass: her arms drawn over the lace

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `28cdbd1`.
One-file copy sent to Chris: `Ranger_3D_stage8c.html`.

## What Chris said

With two photos off his laptop: in "Talk" the lace on her bent arm had shrunk to a thin line; in "Take aim" it was a tuft at her armpit. "Again maybe there's a different way to do it. I'd like to be able to continue."

## The four tries, so nobody repeats them

1. Sleeve as a swinging bell (stage seven). Her arm passed through it.
2. Sleeve as a loop that slides across the arm (7b). A bent forearm still cut through the hem.
3. Lace pushed up the arm when the elbow bends (8b). Nothing passed through, but the sleeve all but vanished. Chris did not like it.
4. **This one: leave the lace alone and change how the picture is drawn.** Kept.

## How it works now

- The lace keeps its painted length and shape in every pose. (It still slides a little toward the ground on a raised arm and gathers slightly on a deep fold.)
- The lace is drawn after her body, and it leaves no mark in the depth picture.
- Then her forearms and hands are drawn once more, on top.
- So wherever a forearm and the lace cross, you see her whole forearm with the lace behind it. An arm can never look cut by lace.

Code: `src/R99_static.js`, right after her meshes are made. The extra meshes are `armLOver`, `armROver`, `handOver`, `handROver`: the same geometry as her arms and hands, keeping only the triangles that follow the forearm, hand and finger bones.

## The cost

- If her forearm is truly behind her own sleeve (seen from some angles with the arm folded), it still shows in front. It reads as the arm being in front, which is the lesser fault.
- The far side of a sleeve can draw over its near side. Black lace over black lace, so it does not show.

## Checked

- Stills: "Talk", "Take aim" from the front and from above, and the jog. In each the sleeve is full length and the forearm is whole.
- The one-file page in a phone-size browser: no errors. Not watched in motion, not on a real phone.

## Next

Chris wants to continue to "the rest of her animations and spells and attacks". The plan and its order are in `claude/ranger-3d-stage8b-sleeves-pushed-up-and-next.md`. First: fingers that curl, then her bow and "Moonsteel Draw". The carries (bow on her back, sword at her left hip, knives across the back of her belt) are taken as agreed unless he says otherwise.
