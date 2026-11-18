# Session: light levels, the finer Flipbook look, fight cameras, the map editor

November 13 to 18, 2026. Written at wrap-up, before the game is merged into a new repo.

## What this conversation built

- **Four weights for each witch** (Full, Trim, Light, Lightest) for the Jester, Fox, Ranger and Io, with a "how light can she go" page for each. With no switches set, each witch is built exactly as before.
- **The finer Flipbook look**: two sliders, Pixel size and Colours, that show while the look is on. It is on all four "how light" pages, on the pilot copy, and on each witch's own page.
- **Closer fight cameras** on a copy of the pilot: wide, near, on whoever acts, over the shoulder, and low.
- **A map editor** for Moon Faire's painted walking places, made from Envoi's editor.

## Branch and last commit

- This session's own branch: `claude/moon-faire-light-levels`. Everything is in `light-levels/` (start with its `README.md`). The last commit is the one that adds this note.
- The finer look was also added on three witch branches, one or two commits each: `claude/jester-3d-model` (8b40c5a), `claude/io-3d-model` (72103c6), `claude/fox-3d-model` (6cf7eef, 458c66f). Those branches belong to the witches' own sessions.

## Artifact links

- Jester, how light can she go: https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh
- Fox, how light can she go: https://claude.ai/artifact/MtcEi9TdtLCh4CroRm6Jgo
- Ranger, how light can she go: https://claude.ai/artifact/N79UjtHYW2rn1gmHgyt2Ks
- Io, how light can she go: https://claude.ai/artifact/MUxJCt6d921JK6Yzwa1TXn
- Pilot with fight cameras and the Flipbook look: https://claude.ai/artifact/8xmYGwUDoJXSU65FMk9dWg
- Map editor: https://claude.ai/artifact/QB5xWW5fZPFQ1pFBisa7gr
- Fox's own page (new link, November 16): https://claude.ai/artifact/NSajYYfjiCixdsi3JL6dUs
- Republished with the finer look: the Jester's game moves, https://claude.ai/artifact/MnovyvRW8qZj9DnUMwUP4n, and Io, https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep

A copy of the first six is in `light-levels/pages/`. The Fox's own page is `models/fox-3d/deliver/Fox_Witch_3D.html` on her branch.

## Chris's decisions made here

All of these are also in the project knowledge (the `claude/chris-...` notes and `claude/pushed-nov16-light-levels-and-finer-flipbook-look.md`). None is only in this conversation.

- Flipbook look on the witches: 1.2 mm of her to a pixel with full flipbook colours is good. 1.7 is interesting, about 2.2 is good, 2.4 takes too much away. On the pilot he likes the finest pixel setting with full colours.
- The fight camera was too far away. He wants interesting camera angles.
- Which weight where (November 14): Lightest for walking and at full fight distance, Light for conversations and closer moments, Full only in a view-my-character screen in the menu.
- The game moves forward with a 3D map and world (November 14).
- All four witches' own pages get the finer Flipbook look (November 16).
- The Jester's night square page stays exactly as it is and is never republished.

## Unfinished

- Nothing here was seen on a real phone or laptop. Real speed was never measured: the test browser draws in software.
- The pilot patches (`patch_pilot_flipbook.py`, `patch_pilot_cameras.py`) are scripts only. They were written against `claude/moon-faire-starter-world` at bdaa792 and were not applied to that branch, which has moved on.
- The pilot's "As planned" weights do not follow the which-weight-where rule yet. Whether Trim is still needed is not decided.
- The map editor has been used on no map yet. Its saved edits were empty when last looked at.
- The camera height does not ease on the Jester's and Fox's "how light" pages (fixed only on the Ranger's and Io's).
- Project notes not brought up to date: `claude/HOW-TO-flipbook-look.md` (its table of which pages have the finer look) and `claude/HOW-TO-3d-light-levels.md` (the lessons from the Ranger and Io).
- The task board was read and never edited by this session.
