# Light levels, the finer Flipbook look, fight cameras and the map editor

Everything one session built for Chris between November 13 and 16, 2026, kept here so it is not lost. Nothing in this folder is loaded by the game. The game's own copies of the light witches live on branch `claude/moon-faire-fights` (`game/fight/witches/`, built from the same patch scripts) and, for the Jester, in `game/models/jester/`.

## What Chris can open

| What | Link | Copy in `pages/` |
|---|---|---|
| Jester: how light can she go | https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh | `jester-how-light.html` |
| Fox: how light can she go | https://claude.ai/artifact/MtcEi9TdtLCh4CroRm6Jgo | `fox-how-light.html` |
| Ranger: how light can she go | https://claude.ai/artifact/N79UjtHYW2rn1gmHgyt2Ks | `ranger-how-light.html` |
| Io: how light can she go | https://claude.ai/artifact/MUxJCt6d921JK6Yzwa1TXn | `io-how-light.html` |
| Pilot with fight cameras and the Flipbook look | https://claude.ai/artifact/8xmYGwUDoJXSU65FMk9dWg | `pilot-fight-cameras.html` |
| Map editor for Moon Faire's walking places | https://claude.ai/artifact/QB5xWW5fZPFQ1pFBisa7gr | `map-editor.html` |

Each file in `pages/` is the whole page in one file, the same as its link. At its link the map editor has a Send button, which puts Chris's edits in the page's store where a Claude session can read them (collection `edits`, one entry for each map). Opened as a file there is no Send, only Copy my work. Both keep unfinished work in the browser.

## The four weights

Each witch is one function (`makeJester`, `makeFox`, `makeRanger`, `makeIo`). The patch scripts add switches to that function, and a small levels file turns the switches into four weights: Full, Trim, Light and Lightest. With no switches set, she is built exactly as before.

Triangles in one witch standing:

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Jester | 584,000 | 91,000 | 43,000 | 19,000 |
| Fox | 578,000 | 122,000 | 55,000 | 31,000 |
| Ranger | 394,000 | 96,000 | 59,000 | 38,000 |
| Io | 594,000 | 140,000 | 69,000 | 45,000 |

Chris's rule (November 14): Lightest for walking and at full fight distance, Light for conversations and closer moments, Full only in a view-my-character screen.

## What is in each folder

- `tools/`: every script, as written. Patch scripts (`patch.py` for the Jester, `patch_fox.py`, `patch_ranger.py`, `patch_io.py`), page builders (`build_page.py`, `build_fox_page.py`, `build_ranger_page.py`, `build_io_page.py`), `patch_stage.py` (the finer Flipbook look), `patch_pilot_flipbook.py` and `patch_pilot_cameras.py` (the pilot), `mf_maps.py` and `build_mf_editor.py` (the map editor), and the test scripts that take pictures with Playwright (`page.py`, `shot.py`, `fshot.py`, `rshot.py`, `ishot.py`, `pilot_shot.py`, `mfed.py` and the small profilers).
- `work/`: the Jester. `jester_lod.js` (her function with the switches), `lod.js` (her levels), `lodpage.js` and `lod.tpl.html` (her page), `stage_lod.js` (the stage with the finer Flipbook look, shared by all four pages), `meshopt.js` (the thinning library, shared).
- `foxw/`: the Fox. `fox_lod.js`, `lod_fox.js`, `lodpage_fox.js`, `lod_fox.tpl.html`.
- `rangerw/`: the Ranger. `ranger_lod.js`, `lod_ranger.js` (which is `lod_head.js` followed by `lod_tail.js`), `lodpage_ranger.js`, `lod_ranger.tpl.html`, `shot.html`.
- `iow/`: Io. The same set as the Ranger.
- `pages/`: the six built pages.

## Rebuilding

The scripts carry the paths of the workspace they were written in. To run them unchanged, put `tools/`, `work/`, `foxw/`, `rangerw/` and `iow/` at `/home/claude/`, then add the files below. The patch scripts for the Fox, Ranger and Io, the pilot patches and the map scripts take their folders as arguments instead (see the top of each).

| Needed | Where it comes from |
|---|---|
| `three.js` in each witch folder | three.js r128, `build/three.min.js` |
| `palette.js`, `square.js` in each witch folder | `models/jester-3d/out/palette.js` and `models/jester-3d/viewer/square.js`, branch `claude/jester-3d-model` at 31b6351 |
| `work/tex.js` | `models/jester-3d/out/jester_tex.js`, same branch |
| `work/jester.js`, `work/stage.js` | the Jester's `src/*.js` joined in order (her `build.sh`), and `models/jester-3d/viewer/stage.js` |
| `foxw/fox_tex.js` | `models/fox-3d/out/fox_tex.js`, branch `claude/fox-3d-model` at 0a21ddc |
| `rangerw/ranger_tex.js` | `models/ranger-3d/out/ranger_tex.js`, branch `claude/ranger-3d-model` at 3e6706e |
| `iow/io_tex.js` | `models/io-3d/out/io_tex.js`, branch `claude/io-3d-model` at 3bc17a3 |
| the Fox's, Ranger's and Io's own sources | `models/<name>-3d/src/` on their branches, at the commits above |
| the pilot | `game/` on branch `claude/moon-faire-starter-world` at bdaa792. That branch has moved on since, so the two pilot patches may need their search text checked against the newer files. Every replacement stops the script if it is not found. |
| the map editor | Envoi's editor, repo `chriskizer91-ops/envoi-on-the-longest-night`, branch `claude/send-note-gigdew` at 318bc96 (`envoi-final-draft/map-editor/`, `edits-core.js`, `field.js`), read only |

The Ranger's and Io's page builders start from the Fox's page script and template and change them, so the Fox's folder must be in place first.

## What was checked, and what was not

- Full is unchanged: the Ranger's Full picture matches her own page pixel for pixel, and Io's Full has the same triangle count as her own build.
- Every move was played at the lighter weights and looked at in stills: 24 for the Ranger, 27 for Io.
- With the Flipbook switch off, the stage draws exactly the old picture.
- Real speed was not measured. The test browser draws in software, so pictures-a-second figures from it mean nothing. Motion was judged from stills only. Chris's phone and laptop are the real test.

## Notes in the project

The full write-ups, with these scripts quoted whole, are project notes: `claude/HOW-TO-3d-light-levels.md`, `claude/HOW-TO-flipbook-look.md`, `claude/flipbook-look-finer-and-pilot.md`, `claude/ranger-3d-light-levels-and-fight-test.md`, `claude/io-3d-light-levels-and-fight-test.md`, `claude/pilot-fight-cameras.md`, `claude/moon-faire-map-editor.md`, `claude/chris-which-weight-where.md`, `claude/chris-on-flipbook-settings-light-weight-and-fight-camera.md`, `claude/chris-3d-world-decision-and-flipbook-on-all-four.md`.
