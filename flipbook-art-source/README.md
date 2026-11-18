# Flipbook art source

Everything from the Flip Book Art project on claude.ai that wasn't in this repo yet, copied in on October 19, 2026. It holds the flipbook, the Night of No Moon game, and the project's planning docs and lore.

## Open them on your phone

- **Flipbook:** https://claude.ai/artifact/TB8mTsAZdzqQdahK5zKCPa
- **Night of No Moon:** https://claude.ai/artifact/JoP7S96fhVk4kD9JW751C4
- **Lore Bible and Spellbook (the doc to edit):** https://claude.ai/code/artifact/7760c8bf-ce71-4a49-a92a-1934db9ac5ab

The live links are the master copies. This folder is a snapshot of them.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The flipbook: every clip of all four performers, in HD or Pixel 128, with speed, onion skin and backdrop controls. |
| `night-of-no-moon.html` | Night of No Moon, the Jester's FF9-style mini game. It can show her in HD or as pixel art at 128, 96, 64, 48 or 32, at any size, and it has a Sprite Theater that compares every version side by side. |
| `hd/` | All 474 HD frames the flipbook plays, as WebP, named by their pipeline frame (A00, K32, …). Both pages load them. |
| `jester_witch_spritesheet.png` | The 128 pixel sheet: every frame in a 278×193 cell, anchored at (139, 185), on one 56-colour palette. |
| `flipbook-frames.json` | The flipbook's frame data: each frame's HD size and anchor (`hdFootX`, `hdFootY`), its cell in the pixel sheet, every clip with its frames and speed, and the palette. |
| `night-of-no-moon-src/` | The game's source page, `build.py` (rebuilds `night-of-no-moon.html`), `sim.py` (an auto-player that checks balance) and `playthrough.py` (plays the whole game once and saves screenshots). |
| `project-docs/` | The Lore Bible and Spellbook (exported from the doc), the Jester's animation decisions, the Ranger, Witch and Fox animation plan, and the Night of No Moon notes. |

Two project docs already live elsewhere in the repo, so they aren't copied here: the animation method is `docs/START-HERE-sprite-animation-method.md` and the game handoff is `assets/HANDOFF.md`.

## How this relates to the rest of the repo

- `assets/` and `game-assets/` hold the same art, exported per character and clip with `manifest.json`. The game build should keep reading those.
- `art-pipeline/` holds the raw cut frames and scripts that make the art. Its `scripts/flipbook_template.html` and `assemble.py` built the flipbook in this folder.
- The frame names here (A00, K32, …) are the pipeline's own names, so `art-pipeline/frames/meta.json` and the `source` field in `assets/manifest.json` both point to the same frames.

## Run them on a computer

The pages load their frames from this folder, so serve it rather than double-clicking:

```
cd flipbook-art-source
python3 -m http.server 8000
# flipbook:  http://localhost:8000/index.html
# game:      http://localhost:8000/night-of-no-moon.html
```

After editing the game, rebuild it with `python3 night-of-no-moon-src/build.py`. Then republish `night-of-no-moon-src/build/night-of-no-moon.artifact.html` to the game's link.
