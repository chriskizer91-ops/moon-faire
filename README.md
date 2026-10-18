# Moon Faire

A 2D game about four witch performers on the Moon Faire, a festival airship touring Aethermoor.

| Folder | What's in it |
|---|---|
| `assets/` | The game asset export: `manifest.json`, HD frames, the 128 px pixel sheet, an example player, and the combat design with its simulator. Its `HANDOFF.md` explains how to use it. |
| `art-pipeline/` | Everything that makes the art: cut frames and their anchors, scripts, the original sheets, and `smoothing-pack/` (the strips for ChatGPT that smooth the Ranger's, Witch's and Fox's moves). |
| `docs/` | `START-HERE-sprite-animation-method.md`: how the animations are made, and what didn't work. |

To try the example player, serve the asset folder and open the player:

```
cd assets && python3 -m http.server 8000
# then open http://localhost:8000/examples/play_clip.html
```

The live flipbook is at https://claude.ai/artifact/TB8mTsAZdzqQdahK5zKCPa.
