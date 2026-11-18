# The Grey Hat (maybe Noiz): rebuild stage 2, painted legs and real trousers (November 14, 2026)

Read after `claude/grey-hat-3d-rebuild-stage1-doll.md`.

- Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794665304-8651`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`. The builder's brief and full report are in `builder/stage2_brief.md` and `builder/stage2_report.md`.

## What Chris said (his words)

- "Yes go onto stage two the dolls shape looks good the head the face is fine the hair is one piece and has clothing and face printed on it so I hope the head has more work still to come"
- "the pants are going to have actual holes should the skin of the doll be painted before putting clothes over it."
- "Fable 5.2 high is good to continue"

So: the doll's shape is approved (do not reshape it). His face is fine. The hair is still to be remade (stage 5). The builder stays Fable 5.2 at high effort.

## What exists now

- **Painted legs:** the whole doll's skin now matches his face and hands. From the hips down it has leg shading and black fishnet, drawn in code from where each point rests on the leg, so the net follows the leg.
- **Trousers:** their own garment over the doll (`src/N46_trousers.js`), from under the corset to the boot tops.
- **Real holes:** eleven, six on his left leg and five on his right, none at the back. They are cut with a hard cut-out (no blended transparency), with frayed edges and a darker inside. His fishnet leg shows through.
- **Cloth:** one repeating square taken from painting F8, recoloured to B1's tones. No legs or net are printed on it.
- **Buttons:** new trousers by default. "Old trousers" puts the old leg skin back to compare. "Doll" and "Blank doll" work in every state. New view: "Close on the holes".
- Whole model: about 429,000 triangles.

## Rough, and choices Chris may want changed

- **From straight side on, most holes are thin slivers**, not the open ovals painting B2 shows. B1 and B2 disagree about where the holes sit; they were placed nearer B1. They read well from the front and three-quarter.
- Against B1 from the front: hole heights within 6 mm; each hole 4 to 17 mm further out than painted; openings 3 to 31% smaller. Less leg shows in the lower holes than painted, most on his right leg.
- **Net size:** the paintings disagree by almost two to one. Used about 1.5 cm wide and 2.4 cm tall.
- The cloth hangs in toward the leg along the strip of holes so that leg, not darkness, shows through. That is not in the paintings.
- The join under the corset was read by eye.
- Movement was not watched (96 stills of walk, idle and talk showed no doll through cloth). Not seen on a real phone; every mesh's lists were counted and match.

## What the key spent on stage 2

128 turns: about 243,000 output tokens, 16.5 million cached-read tokens, 0.6 million cache-write tokens.

## Next

Stage 3 the shirt, 4 the corset, 5 the hair over a real ear. Waiting for Chris to look at the trousers first.
