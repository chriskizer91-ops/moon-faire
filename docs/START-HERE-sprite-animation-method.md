# START HERE: how we animate the Moon Faire witches

Read this before making any character animation in this project. It records what worked and what didn't, so new conversations don't repeat the failed approach.

## Where work happens (since October 18, 2026)

- **This project (Flip Book Art):** lore, new ideas, new characters and outfits, and all new art. Art means ChatGPT strips cut by Claude's pipeline.
- **The game repo:** the game itself, built in a Claude Code session. It uses the exported asset folder and never makes art.
- **The handoff between them:** `HANDOFF-game-build.md`. It covers the asset format, clip list, anchors, release frames, combat numbers, and tips for building with Claude.

When an art round finishes, re-export the game asset folder (`manifest.json`, `hd/`, `pixel/`) and give it to the repo. Clip names stay stable.

**Continuing art work in a new chat:** this chat's workspace is temporary. Upload the `moonfaire_art_pipeline_part1-of-6.zip` through `part6` files: cut frames, `frames/meta.json`, scripts and original sheets. Then continue from there. Uploads must be zips under 20 MB, so every pack is split to fit.

## The characters

Four Renaissance Faire outfits Chris's wife wore, turned into characters set in Thareia (Chris's world: a planet, its moon, and other planets in the lore). All four are magic users with a hidden weapon and a moonlight theme. Ranked by magical power, weakest first:

| Character | Moon phase | Magic | Hidden weapon |
|---|---|---|---|
| Ranger (blue princess, silver-grey bun) | Full Moon | Light | Folding moonsteel bow |
| Herbal Witch (wine-red horned hat, spellbook) | Waxing Moon | Healing and summoning | Crescent pendant that unfolds into a sickle |
| Fox (fox ears, bell collar, patchwork pants) | Waning Crescent | Foxfire and mischief | Shears that split into twin daggers |
| Jester (noble witch, black jester hat, sheer veils) | New Moon | Fate: Doom, Stop, Gravity | Hip bells that form a chain flail |

More witches and outfits may be added to this project later.

## What works: in-between strips with fixed keys

This is how the Jester's smooth flipbook was made. Use it for every character.

1. **Key poses:** ChatGPT image generation makes one move as a single sheet of about 8 key poses in a row. One image keeps the character consistent from pose to pose.
2. **Cutting:** Claude cuts the sheet into frames. Each frame gets a transparent background and is pinned at the torso and the boot soles, so the clip doesn't drift.
3. **In-betweens:** for smoothness, Claude builds a strip template for each gap between two keys. The left and right boxes hold the existing key poses, already filled in. The middle has 1–3 empty numbered boxes. A strip can cover two gaps that share a middle key. ChatGPT fills only the empty boxes. The fixed keys on both sides keep the new poses on-model, at the same scale, and lined up.
4. **Clean-up:** Claude cuts the returned strips and scales each new pose to match the keys. The scale comes from the body height measured along the torso centre line, so raised arms don't skew it. Then Claude re-anchors each pose and adds the clip to the flipbook.

Rules that keep it working:
- Every prompt says **"exactly two arms and two hands"**. Earlier batches had three-handed frames.
- Every prompt says **every effect must stay inside its own box**, with wide boxes for big effects.
- **Number labels under every box.** ChatGPT sometimes draws effects (a summoned deer, slash trails) in the gap between poses. Claude uses the labels to give each piece to the right pose, so nothing gets cut off.
- Use a flat backdrop, #383043.
- Keep the same pixel-art HD-2D style and adult proportions as the Jester's sheets. Not chibi.
- ChatGPT often draws the new poses at a slightly different size than the keys (up to about 20%). That's fine, because Claude rescales them, but always check the returned strips side by side.

## What doesn't work

- **Generating frames as separate images.** Each new image changes the character slightly: face, costume details, scale and position. Played in a row, it flickers instead of moving smoothly. This was tried for a high-definition version in another conversation in this project, and it wasn't smooth.
- **Asking for many frames at once without fixed keys.** Without both ends of the motion as anchors, poses drift and the motion spacing is uneven.

## Speeds and storage

- About 6 fps suits most moves. Chris picks each move's speed by watching the 8-key draft. Then the frame count is multiplied so it plays at about 6 fps with the same pacing: 2 fps → about 3× the frames, 4 fps → +50%. His choices are in `jester-animation-decisions.md` and `three-witches-animation-plan.md`.
- Walk left is the walk right cycle mirrored. Don't mirror spells, because the costumes are asymmetric.
- Store frames as HD WebP at 90% quality. It looked identical to lossless in a zoomed comparison and is about 3× smaller. The 128-pixel pixel-art version uses a shared palette and a packed sheet.

## Where things are

- **Live flipbook artifact:** https://claude.ai/artifact/TB8mTsAZdzqQdahK5zKCPa (the page is titled Moon Faire). It also exists as an offline single file, Moon_Faire_Flipbook_viewer.html.
- **Lore:** "Moon Faire: Lore Bible" doc, https://claude.ai/code/artifact/7760c8bf-ce71-4a49-a92a-1934db9ac5ab, with a Spellbook tab.
- **Combat design:** move list v0.3, balance simulator and review. They are in the game asset folder under `design/` and summarised in `HANDOFF-game-build.md`.
- **Status (October 18):** the Jester is finished. The Ranger, Herbal Witch and Fox have 3 moves each. They are playable 8-key drafts, with the smoothing round out to ChatGPT (`three-witches-animation-plan.md`).
