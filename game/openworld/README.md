# Moon Faire: the open world

The game's map. Walking and exploring happen here, in 3D; fights stay on painted backdrops (Chris, November 14, 2026). The story of how it was built, Chris's decisions and what is still rough are in the project note `claude/moon-faire-open-world-map.md`. What is left to do, and who is doing it, is on `claude/TASK-BOARD-moon-faire-game.md`.

## Open it

- `out/moon-faire-open-world.html`: the world. Works offline, about 15 MB.
- `out/moon-faire-square-test.html`: the same world started in the fair square with four witches and all eleven fair folk, as a speed test.
- `out/moon-faire-open-world-picture-prompts.html`: the 52 prompts Chris painted the texture packs and skin sheets from, with their reference pictures.

Keys: WASD or the arrows walk; a direction pressed twice (or Shift) runs; drag, Q and E, or C (mouse-look) turn the camera; Z switches the near and far view; the wheel or a pinch zooms; E, Space or Enter talks; M is the map; F is the Flipbook look. Esc opens the menu.

The camera zooms by itself: closest when she stands still, 10% wider as she walks, another 15% wider as she runs (Chris, Nov 14: he likes to be as close as it goes). The distance set by Z, the wheel or a pinch is the standing distance.

Everything drawn over the picture lives in `src/ow.tpl.html` (markup and CSS) and the lower part of `src/ow-main.js`: dark plum tickets with a gilt line for what the game says (place name, buttons, menu, toasts, cards), lamp-lit paper bubbles for what people say. A bubble hangs over the speaker's head (`headTop` through the camera) with its tail pointing at them; lines type out, a crescent means more, a full moon means the last line. Glinting eyes by the place name mean foes may be near. Jacquard 24 is embedded by `build.py` for names and titles.

## Build it

It reads the rest of `game/` (the Jester's light model, the fair folk, the places' layouts, the paintings, the world map) and changes nothing there.

```
cd game/openworld
python3 -I build.py ..            # writes the two pages into out/
```

`data/` is already made, so that is all a build needs. To remake `data/` from the paintings and Chris's pictures (Pillow, numpy, scipy, opencv):

```
python3 -I prep_features.py .. data     # the land's lines, from world/map/map.svg
python3 -I prep_places.py .. data       # the seven places, their people and the roads
python3 -I prep_tex.py .. data          # the painted map with the places painted out, the paintings, then round 1 (prep_round1.py)
python3 -I prep_round23.py              # the kit's picture sheets, from round2/ and round3/
python3 -I prep_palette.py data         # the land's 64 colours for the Flipbook look
```

To look at a build without a graphics card: `python3 check.py '["name", x, z, face, yaw, pitch, dist]' ...` (Playwright and Chrome) loads the page, puts her there and writes `look/v_<name>.png`. `check_test.py` loads the square test; `check_lane.py` runs her the length of the fair; `check_play2.py` checks speeds, the encounter card and the Flipbook look. `check_ui.py [lap|phone]` takes the interface's screenshots (`look/ui_*.png`).

## What is where

| | |
|---|---|
| `src/land.js` | The land as rules: a height and a kind of ground for every spot, from the painted map's own lines. Also runs in a background worker. |
| `src/ow-core.js` | Light and fog shared by every world surface, the sky, the cast's light rig. |
| `src/ow-terrain.js` | The land drawn in 32 m squares round the camera at four levels of detail; the water. |
| `src/ow-kit.js` | The kit of fair pieces in Chris's painted skins: tents, stalls, booth, wagon, well, lantern post, crates, barrels, carts, gate, brazier. One batch is one draw. |
| `src/ow-places.js` | The seven painted places, built from their layouts, with their paintings laid back on from the painting's own camera. |
| `src/ow-props.js` | Rocks, gorse, the woods, drystone walls, reeds, farms, the dead tower. |
| `src/ow-flora.js` | Flowers, grasses and shrubs sown round her; 144 trees across the map. |
| `src/ow-dressing.js` | The bigger fairground (lanes, rows of tents and stalls, wagons, bunting) and what was added round each moor place. Everything is in tables at the top of the file. |
| `src/ow-main.js` | The page: her, the camera, the controls, talking, the unseen encounters, the map, the Flipbook look. |
| `round1/`, `round2/`, `round3/` | Chris's 52 pictures as he sent them. |
| `data/` | Everything a build reads, made by the `prep_*.py` scripts. |
| `prompts/` | How the prompts page was made. Its two scripts still carry paths from the workspace they were written in (`/home/claude/...`). |

## Good to know

- World axes: x east, z south, metres. 0.5 m to a pixel of the world map; the map's middle is 0, 0. Where each place stands is in the project note.
- Every world surface writes 0 into the picture's see-through channel and the cast writes 1. The Flipbook look inks the cast by that, and inks the world where depth jumps, so cut-outs must use `discard`, never blending.
- The witches in the world are the Jester at her Lightest weight. The Fox's, the Ranger's and Io's light versions were not saved as files when this was pushed.
- An encounter shows a card with the painted fight place. The fight itself is another session's piece (task board, F1 and F6).
- `src/ow-dressing.js` was written by a sub-agent that was cut off before it reported. What it left was rebuilt and checked afterwards: the pages start without errors, she can run the whole lane from the west road to beyond the gate, and no encounter can start inside the fairground. Its own notes on what is rough were lost.
