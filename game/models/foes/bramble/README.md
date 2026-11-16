# The three bramble foes (task board F3)

Brought into Moon Faire on November 15, 2026 by the "Levelling" session. Project note: `claude/bramble-foes.md`.
**Every name is a stand-in.**

Chris, November 15 (4:24 pm): "Two different brambles and then making the bigger bramble a great bramble. So that's
three models, one of which you'll have to modify the large bramble to make it a great bramble. And then you'll have to
make small model versions of each of the brambles." And: "their attacks should just be using the the strategy and the
numbers that the wraiths use ... different names and different animations but mathematically be the same as they would
if they were a wraith. That way the balance of combat stays the same".

## Where they come from

Both models are Envoi's, from `chriskizer91-ops/envoi-on-the-longest-night`, branch `work/arenas` (commit `865677d`).
They are not on Envoi's main branch. Envoi's lore for them is not brought over.

| File here | Envoi's file | What was changed |
|---|---|---|
| `bramble.js` (`makeBramble`) | `src/models/bramble.js`, the Bramble Horror | Detail may go down to .25; it stopped at .5. |
| `colossus.js` (`makeBrambleColossus`) | `3d-model-new-character-ideas/bramble-colossus/colossus.js`, the Bramble Colossus as the game uses it | Detail may go down to .25. A new switch, `opts.great`, for the great bramble. |

With the options they had in Envoi, both build exactly what they built there: 76,312 and 102,456 triangles, checked.
Envoi also has a far heavier Colossus (`3d-model-field-studies/`, about a million triangles); it is not used.

## The three, and how to make one

`brambles.js` gives `MF_BRAMBLES.make(kind, weight, { level, size })`. It needs three.js r128, the two model files
and, for the light weight, `game/models/jester/meshopt_simplifier.js`.

| Kind | Name | In a fight it is | Stands | Light | Fine |
|---|---|---|---|---|---|
| `bramble` | Bramble | the wisp | 1.0 m tall, 2.9 m across | 11,965 triangles | 76,312 |
| `flowering` | Flowering Bramble | the Shadow Wraith | 2.1 m tall, 3.1 m across | 14,351 | 102,456 |
| `great` | Great Bramble | the great wraith | 5.6 m tall, 7.3 m across | 25,057 | 135,784 |

- **Light** is for a fight seen from the fight distance: the model's own low detail, then every large part thinned
  again by the step the witches and the wraiths use. **Fine** is the model as Envoi drew it, for close-ups.
- Each is 6 to 8 draws for its body, plus its sparks and dust. Each has a skeleton: 108 to 251 bones.
- **The great bramble** is the large one changed: nine legs where it had six, four mane canes where it had two, a taller
  spire and longer thorns (`opts.great`), at its own highest level, held in its wrath with its flower open and its heart
  bare. The large one only shows that for a moment.
- The sizes are a first guess, set beside the wraiths' (0.95, 2.0 and 5.6 m tall). `size` in the options changes one.

## Moves

`m.does('blow')` plays the engine's move by the bramble's own move. `m.movesFor` is the whole table.

| The engine's move | Bramble | Flowering Bramble | Great Bramble |
|---|---|---|---|
| blow | `strike`, lands at 0.5 s | `lance`, 0.8 s | `lance`, 0.8 s |
| heavy | | `slam`, 1.5 s | |
| crush (one witch) | | | `briar`, 1.75 s |
| eclipse (everyone) | | | `volley`, 1.9 s |
| hurt, fall, appear, guard | `hurt`, `die`, `appear`, `block` | the same | the same |

Set `m.state.target` to where its prey stands (a `THREE.Vector3`) before a blow. Both models have more moves than
these (`lure`, `grab`, `consume`, `sweep`, `whirl`, `devour` and others); `m.ACTIONS` lists them.

The numbers for the fight are in `game/plan/foes/brambles.json`, read straight from the approved rules.

## The page to look at them

`python3 build_view.py` writes `out/brambles-view.html`, one 336 KB file that loads only three.js from cdnjs: the three
side by side with a person for scale. Light and Fine at the top right; the buttons play the engine's moves on whichever
of the three has them. `--three FILE_URL --out PATH` makes a test copy that loads three.js from somewhere else.

## What is rough, or not done

- Only seen through a software renderer (`shots/`), not on Chris's phone or laptop, and not under the witches' stage
  lights or the Flipbook look. Envoi draws without the screen's brightening step; the fight piece's `foes.js` has the
  fix it uses for the wraiths, and the brambles will need the same.
- At the light weight the leaves and fruit are sparser than at fine. From the fight distance they read the same.
- They are wide and rooted, where wraiths are narrow and walk up to strike. Where each stands in a fight, and how far
  it must be from the party for its blow to reach, is for the fight piece.
- The Flowering Bramble's fall takes 5.6 seconds (its spire topples). That may be long for a foe met in every fight.
- Every move of all three runs clean at the light weight (no broken numbers). They are not joined to the fight piece.
