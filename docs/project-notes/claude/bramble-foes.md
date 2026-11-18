# The three bramble foes: Envoi's two brambles, and a great bramble made from the larger (task board F3)

November 15, 2026, by the "Levelling" session. **Every name is a stand-in.** Chris has not seen them yet.

- **Where it is:** repo `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-levelling` (commit `b830e20`), `game/models/foes/bramble/` (start with its `README.md`) and `game/plan/foes/brambles.json`. Pushed.
- **The page to look at them:** sent to Chris as one file, `moon-faire-brambles.html` (925 KB, needs no network). It is not a link: the page carries Envoi's two model files, about 260 KB of code, which this session ran, measured and read in part but did not read line by line, so it was not published. `python3 build_view.py` in the folder builds it again.

## What Chris said (4:24 pm)

"Two different brambles and then making the bigger bramble a great bramble. So that's three models, one of which you'll have to modify the large bramble to make it a great bramble. And then you'll have to make small model versions of each of the brambles. But you need to look at them first cuz they're kind of interestingly complex. I think that their attacks should just be using the the strategy and the numbers that the wraiths use or would use at a higher level cuz we've already balanced the game fights for the creatures you fight at the level that they are. So the attacks will just have different names and different animations but mathematically be the same as they would if they were a wraith. That way the balance of combat stays the same".

## What Envoi has

The brambles are **not on Envoi's main branch**. They are on several of its work branches; the newest is `work/arenas` (commit `865677d`, October 5).

- **The Bramble Horror** (`src/models/bramble.js`, `makeBramble`): a blackberry thicket with six thorny canes on a root crown, about 2.5 m tall and 5 m across. 76,312 triangles, 127 bones, 13 moves, four shapes (classic, ambush, towering, ancient) and levels 1 to 20 that change its look.
- **The Bramble Colossus** (`3d-model-new-character-ideas/bramble-colossus/colossus.js`, `makeBrambleColossus`): the same plant grown as big as a house, with a spire, a flower bud that opens round a glowing heart, four great canes and six legs. 9.4 m tall and 15 m across. 102,456 triangles, 201 bones, 15 moves.
- A third, far heavier Colossus (`3d-model-field-studies/`, about a million triangles, a laptop study) and a "Bramble Ancient" on one branch. Neither is used.

Both are built like the witches' foes: three.js r128, everything made and painted in code, with a skeleton, and the same calls (`animate`, `play`, `anchor`, `reset`). Envoi's lore for them is not brought over.

## What was built

`MF_BRAMBLES.make(kind, weight, { level, size })` in `game/models/foes/bramble/brambles.js`.

| Kind | Name | In a fight it is | Stands | Light | Fine |
|---|---|---|---|---|---|
| `bramble` | Bramble | the wisp | 1.0 m tall, 2.9 m across | 11,965 triangles | 76,312 |
| `flowering` | Flowering Bramble | the Shadow Wraith | 2.1 m tall, 3.1 m across | 14,351 | 102,456 |
| `great` | Great Bramble | the great wraith | 5.6 m tall, 7.3 m across | 25,057 | 135,784 |

- **The copies are Envoi's files with two small changes:** detail may go down to .25 (it stopped at .5), and the Colossus has a new switch, `opts.great`. With Envoi's options both build exactly what they built there (the triangle counts match).
- **The great bramble** is the large one changed: nine legs where it had six, four mane canes where it had two, a taller spire and longer thorns, at its own highest level, held in its wrath with its flower open and its heart bare.
- **Light** is the model's own low detail, then every large part thinned again by the step the witches and the wraiths use (points are only removed). **Fine** is the model as Envoi drew it.
- **Sizes are a first guess,** set beside the wraiths' (0.95, 2.0 and 5.6 m tall).
- **Every move of all three runs clean** at the light weight.

## The fight: nothing changes

By Chris's word a bramble is the wraith of its size in every number and rule. `game/plan/foes/brambles.json` reads the numbers straight from the approved rules: Bramble 300 Life and a blow of 50; Flowering Bramble 1,000 Life, blow 100, heavy 200; Great Bramble 8,000 Life, blow 130, crush 440, a blow on everyone of 110 growing by 25. Each grows 20% a level like every foe.

| The engine's move | Bramble | Flowering Bramble | Great Bramble |
|---|---|---|---|
| blow | `strike` (Envoi's Strike), lands at 0.5 s | `lance` (Thorn Lance), 0.8 s | `lance`, 0.8 s |
| heavy | | `slam` (Hammerfall), 1.5 s | |
| crush, at one witch | | | `briar` (Thornwood), 1.75 s |
| eclipse, on everyone | | | `volley` (Thorn Volley), 1.9 s |
| hurt, fall, appear, guard | `hurt`, `die`, `appear`, `block` | the same | the same |

`m.does('blow')` plays the engine's move by the bramble's own.

## Suggested, not decided (for row F5)

Because a bramble and a wraith of one size are the same in a fight, which of the two a foe is drawn as changes no number.

- Share of foes drawn as brambles: about half at levels 10 to 14, two thirds at 14 to 17, three quarters at 17 to 20.
- The great bramble gate: one great bramble, two flowering brambles, one bramble and one wisp.
- The final fight's helpers: one Shadow Wraith, one flowering bramble, one wisp, one bramble.

## Rough, or not done

- Only seen through a software renderer, not on Chris's phone or laptop, and not under the witches' stage lights or the Flipbook look. Envoi draws without the screen's brightening step; the fight piece's `foes.js` has the fix it uses for the wraiths, and the brambles will need the same.
- At the light weight the leaves and fruit are sparser than at fine.
- They are wide and rooted where wraiths are narrow and walk up to strike. Where each stands in a fight, and how its blow reaches the party, is for the fight piece (rows F6 and F12).
- The Flowering Bramble's fall takes 5.6 seconds, which may be long for a foe met in every fight.
- Names for the three and their moves.
- Not joined to the fight piece.
