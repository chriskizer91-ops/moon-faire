# The Grey Hat (maybe Noiz): rebuild stage 4, hair over real ears (November 14, 2026)

Read after `claude/grey-hat-3d-rebuild-stage3-shirt.md`.

- Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794681908-d990`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`, commit `70f92cd`. The builder's brief and full report: `builder/stage4_brief.md`, `builder/stage4_report.md`.

## What Chris said (his words)

- "the hair is one piece and has clothing and face printed on it"
- "the hair definitely, there's like ears on the hair. The hair's bad, really bad. The hair even smells bad."
- "the face straight on is good. It could be better. But he is an NPC". His face was left alone.

## What exists now

- **Hair** (`src/N45b_hair.js`): 131 locks in three layers over a scalp cap and a dark inner sheet, from a middle parting to past his shoulders, tucked behind his ears. It wears only a strand picture drawn in code, in browns measured from painting C12. Method: Io's tresses and chains on the Fox's cap-and-locks plan.
- **Ears:** skin, moved 18 mm forward to where painting C4 has them. Each lobe has a small plug, which Chris did not ask for (one block of code to remove).
- **Glasses arms** run over the ear and hook down behind it.
- **It moves:** nine chains of five bones from his head, with collision balls on head, neck, shoulders, chest and back. At rest it is exactly as built; same result every run; costs about 0.02 ms a frame. `setCloth(false)` freezes it.
- **Buttons:** "Old hair" puts the old shell back to compare.
- Whole model: about 563,000 triangles, 97 bones.

## Where it falls short

- The top of his head reads as combed flat in two planes; the hairline is a hard edge, not strand tips.
- Waves are the right length (about 10 cm crest to crest) but tidier and thinner than painted, with no curls at the ends.
- The outline is about 1 cm too wide each side near the top; shadows are not as deep as C4's.
- C4 and B1 disagree on the hair (B1 is about 3 cm wider each side and 6 cm longer). Built to C4, a third of the way toward B1 below the ears. The two numbers to change are `B1_WIDE` and `endY`.
- Moving the ears stretched the profile painting slightly between mid-beard and ear. From the front only the ears and a thin line at the cheek edges changed.
- Movement was not watched (numbers and stills only). Not seen on a real phone.

## What the key spent on stage 4

166 turns: about 202,000 output tokens, 20.0 million cached-read tokens, 0.7 million cache-write tokens.

## Next

Stage 5 (ankles, walk, posture) is running. A polish pass on the shirt front is still owed.
