# Pushed to the repo, November 16: the light levels, the finer Flipbook look, the pilot cameras and the map editor

November 16, 2026. Repo `chriskizer91-ops/moon-faire`.

## What Chris asked (his words)

- "Yes, can you push all the things we built and worked on here to the repo?"
- The "Yes" answered: "Do you want me to put the finer look into the Jester's, Fox's and Io's branches, so their own pages get the sliders too?"

## What was pushed

| Branch | Commit | What |
|---|---|---|
| `claude/moon-faire-light-levels` (new, off the default branch) | 150bc62 | folder `light-levels/`: everything this session built, November 13 to 16 |
| `claude/jester-3d-model` | 8b40c5a | the finer Flipbook look on her game moves page |
| `claude/io-3d-model` | 72103c6 | the finer Flipbook look on her page |
| `claude/fox-3d-model` | 458c66f | the finer Flipbook look on her page |

The Ranger's branch was not changed: it already had the finer look.

### The folder `light-levels/`

Nothing in it is loaded by the game. It is the safe copy of the work. Its `README.md` says what each file is, how to rebuild and what was not checked.

- `tools/`: the patch scripts for the four witches (`patch.py`, `patch_fox.py`, `patch_ranger.py`, `patch_io.py`), the page builders, `patch_stage.py`, the two pilot patches (`patch_pilot_flipbook.py`, `patch_pilot_cameras.py`), the map editor scripts (`mf_maps.py`, `build_mf_editor.py`), the new `finer_look.py`, `finer_test.py` and `stage_hunks.py`, and the test scripts.
- `work/` (Jester), `foxw/`, `rangerw/`, `iow/`: each witch's function with the level switches in it, her levels file, and her page script and template.
- `pages/`: the six built pages, each one file, the same as its link.

The game's own copies of the light witches are still on `claude/moon-faire-fights` (`game/fight/witches/`), made by that session from the same scripts. This push does not change them.

## The finer Flipbook look on each witch's own page

All four witches' own pages now have it. Turn Flipbook look on and two sliders show: Pixel size (chunky to fine) and Colours (smooth to flipbook). They open at 1.2 mm of her to a pixel with full flipbook colours. Pixel size all the way to chunky is the look as it was. The look still starts off.

| Witch | Her page | What was done |
|---|---|---|
| Jester | her game moves, https://claude.ai/artifact/MnovyvRW8qZj9DnUMwUP4n | republished to the same link |
| Io | https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep | republished to the same link |
| Fox | https://claude.ai/artifact/NSajYYfjiCixdsi3JL6dUs | a new link. Her own page had no link before, only the file `deliver/Fox_Witch_3D.html`. Later builds of her page should go to this link. |
| Ranger | her own page | already had it |

- **The Jester's night square page was not touched and not republished** (https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh). Its script `viewer/app.js` is unchanged. It shares `viewer/stage.js`, which did change, but it sets neither new setting, so a rebuild of it draws the same picture.
- The Jester's and Io's `viewer/stage.js` are now the same file as the Ranger's. The Fox keeps her own older stage (the little theatre only) with the enlarging pass added.
- The sliders are made by each page's script, so the pages' own markup did not change.

### How it was checked

- Before republishing, the live pages were compared with the branches by checksum. Io's live page was the same file as `deliver/Io_3D_stage14.html`. The Jester's live `index.html`, `jester.js` and `jester_tex.js` were the same as a build from her branch. So each republished page is the old page with only this change.
- Each page was opened before and after at phone size (`tools/finer_test.py`): look off gives the same picture (the Fox's exactly, pixel for pixel; the Jester and Io differ only where she moves), the old look matches Pixel size at chunky, the sliders show and hide with the switch, and there were no errors.
- **Not checked:** on a real phone or laptop. Real speed cannot be measured in the test browser.

## What was not done

- The task board (`claude/TASK-BOARD-moon-faire-game.md`) was read and not edited by this session.
- `claude/HOW-TO-flipbook-look.md`, section 3: its table of which pages have the finer look is out of date. All four have it now.
- `claude/HOW-TO-3d-light-levels.md` does not yet have the lessons from the Ranger and Io. They are in `claude/ranger-3d-light-levels-and-fight-test.md` and `claude/io-3d-light-levels-and-fight-test.md`.
- The pilot patches were built against `claude/moon-faire-starter-world` at bdaa792. That branch has moved on (90919e4 on November 16), so they are kept as scripts and were not applied to it.
- No pull request was opened. The branches sit beside the others.
