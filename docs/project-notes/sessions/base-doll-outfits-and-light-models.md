# Session: the base doll, her 21 outfits and their light models (November 14 to 18, 2026)

## What this conversation built

- **The base doll:** Io's body as a realistic bare doll in a sports bra and bike shorts, with her live face, every move, and the Flipbook look.
- **Prompt pages** for Chris to paint the doll's references and then the outfits in ChatGPT.
- **21 outfits** built from Chris's paintings by several Opus 5.5 helpers working from the same kit: Night out and At home (modern), the Moonlit gown, the Peasant dress (and a red-corset version), the Elven gown, Court gown, Summer dress, Winter cloak, Nightgown, Dancer, Sorceress, Devil gown, Airship deckhand, Sky-pirate captain, Woodland fae, Shieldmaiden, Fortune teller, Bard, Masquerade and Paladin. Plus a bun hairstyle.
- **Fixes after Chris's review:** the At home outfit's missing feet, and the missing paint on the sides of outfits where her arms rest (it showed when she walked, most clearly in the Flipbook look).
- **A light model for every outfit:** one mesh of about 50,000 triangles (body, clothes and bun, with the look baked into pictures) instead of 450,000 to 560,000. Her face stays live. The see-through wings, feather and mask stay real pieces. A switch on the doll page changes between full and light.
- **A light-only page**, and the same page as one 70 MB HTML file that works offline.

## Branch and commit

`claude/moon-faire-base-doll-light`. The single file was commit `ed42d9d`. This wrap-up adds the rest under `base-doll-light/` (see its `README.md`) and this note. The last commit is the one that adds this note.

## Links

- The full doll, with the Full/Light switch: https://claude.ai/artifact/TvHFXuVgnHo8e6kkTGcWNC
- The light-only doll: https://claude.ai/artifact/DL4bd5jt1AjxUxQNtae4T1

## Chris's decisions here (not in the project knowledge)

- He asked that this work not be added to the project knowledge or written anywhere until he asked. On November 16 he asked for the push to the repo.
- The doll is built on Io's body, in a sports bra and bike shorts.
- More hairstyles are wanted, not just the long hair. Only the bun was made.
- The outfits are built by several Opus 5.5 helpers at high or extra-high effort (about five at once), all working from the same kit.
- Each outfit gets its own light model of about 50,000 triangles that can be switched with the full one.
- He wanted a separate page called "the base doll light" with only the light models, and then that page as a single HTML file in its own folder in the repo.
- Next is face variations. He assumes the cast will be all women. He wants to keep the same 3D face and only paint it differently.

## Unfinished

- **Face variations:** not started. The options were laid out for Chris: makeup layers, contour shading, eye colour and skin tone, small warps of the painting, mixing features from several painted faces, or a whole new face painting. The recommendation was mixing features, with layers on top. He has not yet picked between a layers-only pilot on Io's face and a face guide for ChatGPT first.
- **Skin tone:** her arms, legs and chest are baked into the light models, so a new skin tone needs a rebake or a skin mask.
- **Hairstyles:** only the bun exists. The light models always wear it.
- **The light models do not have:** the bra-and-shorts look, a hair choice, or the bra and shorts colours.
- **Changing outfits on the light page** takes a second or two, because each outfit's moves (heels, skirts, wings) are still set up from the full outfit's code on a rough, unseen copy.
- **Not checked:** speed on a real phone or laptop, or opening the 70 MB file on a phone.
- Nothing in the game loads the doll yet.
