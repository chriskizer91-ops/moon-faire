# Session: the Grey Hat captain's 3D model (November 2026)

## What this conversation built

- **The Grey Hat airship captain ("maybe Noiz"),** a 3D model built in code, in `models/grey-hat-3d/`.
  - A man's blank doll under real clothes, made the same way as the witches.
  - He has his hat, belt, pouch, scroll and jewellery, gold dust from his boots, and everything the fair folk NPCs can do.
  - About 599,000 triangles.
- **His reference painting prompts** (`references/`), and the paintings themselves, stored as webp in `references/chatgpt/`.
- **His light version at the fair folk's size,** in `models/grey-hat-3d/npc/`.
  - It is built on the fair folk kit from `game/people/kit` on the starter-world branch.
  - Triangles: quarter 2,781, half 5,608, full 10,775.
  - `npc/pack.py` writes `greyhat_npc.js`, which adds him to `MF_NPCS` and `MF_NPC_TEX` as `grey-hat-captain`.
- **The stage builder** in `models/grey-hat-3d/builder/`: the briefs, the reports and the spend for each stage.
  - Its raw run logs were scratch and were not kept.

## Branch and commit

- Branch: `claude/grey-hat-3d-model`.
- Last work commit: `4521ff7`, "Grey Hat 3D: his light version at the fair folk's size".
  - It was checked on GitHub on November 18.
- This note is the only commit after it.
- The branch is not merged anywhere, the same as the witches' model branches.

## Artifact links

All three pages can be rebuilt from the repo; the README says how.

- His full model: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe
- His light version, beside the fair folk: https://claude.ai/artifact/JLyeUSnZWjme7DPzWpdwVQ
- His reference prompts page: https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x

## Chris's decisions made here

Most of these are also in the project notes `claude/grey-hat-3d-*.md`.

- Rebuild him as a blank doll with real clothes over it, not paintings on one surface.
  - The skin was painted first and the clothes put over it.
- The stages were built by a Fable 5.2 builder on Chris's own API budget.
  - When the budget ran out, Opus sub-agents took over, with review.
  - Chris then asked this session to finish him directly.
- His face straight on is good enough for an NPC.
- After stage 5, "he looks good as he is". Shirt polish stopped there, and the hat, gear and NPC moves came next.
- He is done as long as he is in the repo (November 15). Don't rebuild or restyle him unless Chris asks.
- His light version matches the size of the other NPCs.

## Unfinished

- **Placing his light version in the open world** in place of the grey stand-in: in the mooring field and on the ledge. This is task board row C6b.
- **Never watched moving in real time,** and never tried on a real phone or laptop.
- **Rough edges Chris accepted:**
  - The shirt front is flat.
  - The corset and boots are painted skin, not their own pieces.
  - The hair's top is flat.
  - The scroll sticks out.
  - He swivels when turning on the spot.
  - On the light version, the hair, beard, brim and sleeves are plain colours, and there is no gold dust.
- **Questions Chris hasn't answered:**
  - Should the scroll hang or be tucked in?
  - Should the shirt get more polish?
  - Should the corset and boots become their own pieces?
- **Who he is, his name and his lines** are Chris's to decide. His `wiring` is a stand-in.
