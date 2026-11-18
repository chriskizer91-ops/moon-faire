# The Grey Hat captain: his light version at the fair folk's size (November 16, 2026)

Read after `claude/grey-hat-3d-DONE.md` and `claude/HOW-TO-moon-faire-fair-folk-npcs.md`.

**Chris:** "Can you make A level of detail model of the gray hat Captain and only matching the model size that the other NPCs are, which I think is like the 6000 triangles or something like that".

The fair folk in the game are actually about 2,800 triangles (a quarter, the weight Chris chose for them); about 5,500 is their half. So he was made at both, and at their "full".

- **Page:** https://claude.ai/artifact/JLyeUSnZWjme7DPzWpdwVQ: the fair folk's test page, with him first in the list and the fair folk after him to compare.
- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/npc/` (start with its `README.md`), commit `4521ff7`.

## What he is

- **Made on the fair folk's own kit:** the Jester's skeleton, body, hands, head, moves, emotes, walk, run and sit, with his own shapes and paint. Game code makes him the way it makes them: load `npc/greyhat_npc.js` after the fair folk's files, then `await MF_NPC.make('grey-hat-captain')`. Every call they have works for him (`face`, `greet`, `talk`, `emote`, `walkTo`, `runTo`, `sit`, `stand`, `headTop`).
- **Size:**

| Weight | Him | The fair folk |
|---|---|---|
| Quarter (the game's) | 2,781 | 2,483 to 2,872 |
| Half | 5,608 | 4.9 to 5.6 thousand |
| Full | 10,775 | 9.8 to 11.3 thousand |

His finished model is about 599,000.

- **Painted from his finished model, with no painter and no API key.** His finished model is drawn flat-on in the kit's painting frame, posed so his arms and legs land on the template's. So the paint needs no fitting. His face picture is his painting C1, moved so his eyes and mouth sit on the template's.
- **His own shapes,** measured off that drawing: the hat (tipped back, point bent to his left), hair, a beard along the jaw, glasses, shirt with the ruffled front, full sleeves, lace and leather cuffs, fingerless gloves, baggy trousers, wide boot shafts, belt, pouch, and the scroll strapped to his right thigh.
- **Wiring** (gruff talk, a bow for hello, his moods): a stand-in, the same as his full model's.

## Checked

Built through `MF_NPC.make` at all three weights; every mesh's lists match their points; all 14 emotes, the talking, walking, running, sitting, a seated wave and standing up run with no broken numbers. Stills of all of it, and a line-up beside five of the fair folk (he is the tallest, in his hat).

## Rough

- He moves as the fair folk do, not with his full model's own walk and moves. The face is the template's face wearing his painting.
- Hair, beard, brim, sleeves and gloves are plain colours, without the full model's waves and folds. Painted, they picked up the wrong paint (the sleeves' inner side showed the corset when an arm was raised; the brim's underside showed skin).
- The beard has a hard top edge on the cheeks up close. No gold dust at this weight.
- Not watched moving. Not seen on a real phone or laptop.

## Not done

Placing him in the open world in place of the grey stand-in (task board C6b): the light version is ready for it.
