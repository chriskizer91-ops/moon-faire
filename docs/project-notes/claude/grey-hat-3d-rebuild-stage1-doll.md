# The Grey Hat (maybe Noiz): rebuild stage 1, the blank doll (November 13, 2026)

Read after `claude/grey-hat-3d-first-build.md`.

- Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794633318-0d5b`). Press "Doll" in the "Show" row.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`, commit `3a1a5da`.

## What Chris said (his words)

- On the build with the face fixed: "his ear is printed on his hair and his legs are printed on the surface of his pants. I think it would be better to use one of the witches like blank dolls for their body and then adjust from there into a man shape, then put the clothes over the doll."
- On who builds it: "I would like you to use the API key to have a fable 5.2 ... do all of the rebuild of this model. You give it everything it needs. We build it in stages. That way you're not having to waste tokens of my usage. The API needs to be spent."
- The key is one he made for this project and watches himself. It is not stored in the repo, the project or memory.

## How the rebuild is run

A second Fable 5.2 at high effort does the building through the API. The session Claude writes a brief for each stage, starts the builder, then checks its work, publishes and pushes. The script, the stage 1 brief and the builder's report are in the repo at `models/grey-hat-3d/builder/` (its `README.md` says how to run it and what went wrong the first time).

The stages: 1 the blank doll (done), 2 trousers with real holes over his fishnet legs, 3 shirt, 4 corset, 5 hair over a real ear.

## Stage 1: what exists

- **The doll:** a man's body under his clothes, one smooth skin from the foot of his neck to his feet (52,832 triangles), in `src/N45_doll.js`. It uses the Ranger's tables and bone weights, reshaped to him from paintings B3 and B5. It is made as one blended solid (the way the hands are made), not as her separate tubes, because her tubes show their joins when bare.
- **Fit:** hips and seat within 4 mm of B5; leg widths within 1 mm; outline overlap with B5 0.97 to 0.99. His chest, back and upper arms are not measured: no painting shows them bare.
- **Seeing it:** `api.setDoll(on)` and a "Doll" button. With it off he looks as before. "Blank doll" works in both states.
- **Ready for the clothes:** the old clothes-shaped skin is cut into regions (trunk, hips, legs, boots, arms, ruffles). `api.setOldSkin({...})` switches them off one at a time, and the doll shows only under a region that is off.
- Whole model: about 398,000 triangles.

## Rough

- The doll's skin is one plain colour, a little more orange than his face.
- His shoulders sit slightly outside the old shirt skin, so stage 3's shirt must be cut over the doll, not over the old skin.
- With the doll on, a patch of shirt paint shows on the hair behind his neck. That is the old hair shell, for stage 5.
- Movement was not watched (stills only). Not tested on a real phone; every mesh's lists were counted and match.

## What the key spent on stage 1

176 turns: about 282,000 output tokens, 24.0 million cached-read tokens, 1.0 million cache-write tokens.

## Waiting for Chris

- Whether the doll's shape is right (shoulders, chest, legs) before trousers go over it.
- Whether "high" is the effort he wants for the builder; his message did not name a level.
