# Jester 3D: base outfit first, veil later

Agreed with Chris on November 11, 2026. Newer than `claude/jester-3d-model.md` where they differ. For the current state of the model, see `claude/HANDOFF-jester-3d-and-flipbook.md`.

## The decision

Get her look right in the two base layers shown in paintings `05_base_front_back` and `06_base_sides` (no veil, no shawl), then re-hang the veil and shawl on top. Chris's reasons: the veil does not drape naturally and it hides the outfit, so it takes away from the look.

The viewer has a **Veil and shawl** switch that takes off the sheer veils, ribbon strands, wine shawl and shoulder kerchiefs (cloths marked `outer`, plus any sheer cloth).

Chris then chose not to build a realistic drape for now: "instead of a realistic fabric drape simulation let's just get it to the veil a little better". The veil was fitted to the head and its layers brought together (pass 9).

## Order of work, and where it stands

1. **Skirt** (done, passes 10 to 12): narrow at the hip, widening to mid-shin, four soft tiers, plain olive tier, open at the front. Chris had the front swag removed and the belt pouches made larger. Still open: the tiers read partly as strips.
2. **Sleeves and cuffs** (done, pass 12): a velvet puff at each shoulder; cuffs are large uneven balls of frills. Still open: the sleeve below the puff is a plain tube; cuffs are faceted up close.
3. **Horns and head size** (done, pass 12): horns about 12% thicker, head scale 0.98.
4. **Hand sculpt** (done, pass 13): each hand is one continuous skin with real knuckles, webs, a thumb that grows from the wrist, and nail plates. Still open: rings are paint.
5. **Face from every angle** (first pass done, pass 13): profile matched to painting 07, jaw and nose reshaped, three pictures mixed on one face material, neck showing above a lower ruff. Still open: the eye in full profile; the far edge of the cheek; plain skin under the jaw.
6. Then the shawl and the veil, with simple fixes and not a baked drape.

## Why the veil does not drape, and what it would take (kept for later)

- It is simulated on a coarse grid and pulled toward a preset fan shape ("shape memory"), so it holds a bell instead of hanging from the head and arms.
- Cloth does not collide with other cloth, and the body is a few capsules, so layers cannot rest on each other or on her shoulders.
- Folds are a fixed pattern added when drawing, not folds the cloth made.

Options:
- **Better live simulation:** about four times the points, no preset shape, hung only from head and wrists, proper shoulder, arm, head and horn shapes to collide with, and the layers beneath as a volume. Feasible on a laptop, too heavy for phones.
- **Baked drape:** simulate each move slowly at high quality once, store the result, and play it back. Her moves are fixed clips, so this gives the best folds at almost no running cost. It cannot react to free dragging.
