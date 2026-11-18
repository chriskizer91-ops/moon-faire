# The Grey Hat (maybe Noiz): rebuild stage 3, painted arms and chest, a shirt of real cloth (November 14, 2026)

Read after `claude/grey-hat-3d-rebuild-stage2-legs-trousers.md`.

- Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794676014-49ba`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`, commit `a83c9e7`. The builder's brief and full report: `builder/stage3_brief.md`, `builder/stage3_report.md`.

## What Chris said (his words), on seeing the trousers

"Okay, so now we need to paint onto his at least his lower arms and his upper chest so that we can then put the shirt on top of that. So that it looks real, and the shirt's actual fabric that moves because it's like flowy and billowy like the pants are.. The hair still needs to be done. And then like the face straight on is good. It could be better. But he is an NPC, so but the hair definitely, there's like ears on the hair. The hair's bad, really bad. The hair even smells bad. And then the boots, the ankles need to make a realistic motion as he walks. And I think the posturing of the whole body could be improved as well. There is a how to do this. And you could also look at one of the other models for the witches, because they are finished."

So the order from here: shirt (this stage), hair over real ears (stage 4), ankles, walk and posture (stage 5). His face stays. The four finished witches' folders are now fetched for the builder to take methods from.

## What exists now

- **Painted doll:** forearms (skin, shading, hair), chest and collarbones, neck join, soft shading over the trunk and upper arms. All drawn in code.
- **Shirt as its own garment** (`src/N47_shirt.js`): body, sleeves gathered at the band, two-tier lace cuffs, a three-tier ruffled front, collar, dark red lacing with eyelets. Linen and lace come from painting F13. Nothing of his body is printed on it.
- **It moves:** the Jester's cloth-sheet method, with the Ranger's and Io's sleeve lessons. `api.setCloth(on)` freezes it. Same result every run; it survived a 30-second frame, a 10 m jump and a sharp turn.
- **Trousers** sway a little on four springs. The holes are untouched.
- **Buttons:** "Old shirt" puts the old painted shirt back to compare.
- **Corset:** still the old trunk skin, cut down to the corset. Not yet its own piece.
- Whole model: about 487,000 triangles.

## Where it falls short (the builder said so itself)

- **On a still front view the old painted shirt still looks more like the painting than the new one.** The new ruffled front has three flat, tidy tiers where the painting has four or five loose ones.
- Sleeve folds have a quarter to a half of the painted contrast. Sleeve heads are about 2 cm too wide at the back.
- A square step in the cloth at each top corner of the open front. The top edge of the wrist cuffs is uneven.
- In "Talk", a picture-based count finds a patch of upper arm showing where cloth should hide it; a ray test says the arm is inside the sleeve. Not explained.
- Over each shoulder a few lace holes show dark. Cause not found.
- The cloth costs about 3 ms a frame in a desktop test browser. Not measured on a phone.
- Movement was not watched (stills only). Not seen on a real phone.

A polish pass on the shirt front, collar corners and sleeve folds is owed. It has not been scheduled; hair and walk come first because Chris ranked them.

## What the key spent on stage 3

206 turns: about 379,000 output tokens, 28.5 million cached-read tokens, 2.6 million cache-write tokens.
