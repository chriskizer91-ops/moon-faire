# Moon Faire

A 2D game about four witch performers on the Moon Faire, a festival airship touring Aethermoor.

| Folder | What's in it |
|---|---|
| `assets/` | The game asset export: `manifest.json`, HD frames, the 128 px pixel sheet, an example player, and the combat design with its simulator. Its `HANDOFF.md` explains how to use it. |
| `game-assets/` | The same frames packed for the game: AVIF instead of WebP (8.5 MB instead of 13 MB, and cleaner), one pixel sheet per witch. Built by `tools/pack_assets.py`. |
| `art/backdrops/` | Four side-on night stages, from the 20-min repo's battle backdrops. |
| `scenes/jester-night/` | *The Jester's Curtain Call*: a two-minute film of the Jester in code, with synthesized sound. Built by `tools/build_scene.py`, rendered to MP4 by `tools/render_video.mjs`. |
| `tools/` | `pack_assets.py` builds `game-assets/`. `build_demo.py` builds `dist/moon-faire-demo.html`, a single-file demo with everything embedded. |
| `art-pipeline/` | Everything that makes the art: cut frames and their anchors, scripts, the original sheets, and `smoothing-pack/` (the strips for ChatGPT that smooth the Ranger's, Witch's and Fox's moves). |
| `docs/` | `START-HERE-sprite-animation-method.md`: how the animations are made, and what didn't work. |

To try the example player, serve the asset folder and open the player:

```
cd assets && python3 -m http.server 8000
# then open http://localhost:8000/examples/play_clip.html
```

The stage demo is at https://claude.ai/artifact/NvHGfCNmn7Y5eeGBsp94D3 and the Jester film at https://claude.ai/artifact/7U5xf4Qm6iPbN6czP7n32K. The live flipbook is at https://claude.ai/artifact/TB8mTsAZdzqQdahK5zKCPa.
