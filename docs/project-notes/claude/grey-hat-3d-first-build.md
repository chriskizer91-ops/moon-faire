# The Grey Hat (maybe Noiz): first build, then face and sleeve fixes (November 13, 2026)

Read after `claude/HOW-TO-3d-witch-models.md`, `claude/HOW-TO-3d-witch-faces.md` and `claude/grey-hat-3d-reference-prompts.md`.

- Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794593239-df79`). Republish every change to this link.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`, commit `b6cc117`. Its `README.md` has the code-level detail and the build commands.
- The prompt page: https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x

## What Chris said (his words)

- "You are the gray hats and the name maybe noiz". His name is maybe Noiz. It is kept in data; the folder stays `grey-hat-3d`.
- "his boots do have gold flecks so you'll have to add those in as a code animation of pixel or floating around his feet. When he walks like gold glitter dust follows his boots"
- On seeing the first pictures: "can you make it look more like the 3D models that the witches are? I don't know if you've actually seen them. ... every other, instance has made a blank doll that looked good and then printed the image on top of that."
- Then: "Can you show me what you've got so far? Without building anymore. Like I want to pause unless pausing interrupts you in a big way."
- On seeing the page on his phone: "I think I don't want you to spend a bunch of time like remaking him from scratch. It actually looks pretty good. The transition from his arms to his sleeves could be better. Also in the artifact I'm looking at ... he doesn't have a face".

## The rule for him from here

**Do not rebuild him from scratch.** Chris says he looks pretty good. Improve him in place, one thing at a time, and show each change on the page.

For any new character, the witches' way still holds: a blank doll that looks good first, then the paintings printed on it. Look at a finished witch as a rendered model before building, not only at her code.

## Lessons from this build (they apply to every model)

- **A headless picture does not prove a mesh draws on a phone.** His face was missing on Chris's phone and present in every test picture. One list on the head mesh (`uvSide`) was 399 entries short. A real graphics chip refuses to draw a mesh like that, so the head, ears and neck vanished. The software renderer the tools use (SwiftShader) draws it anyway. His model now stops the build if any mesh carries a list of the wrong length. The witches' models would be safer with the same check.
- The cause was a `//` comment in the middle of a line, which swallowed the code after it. The how-to already says never to do this.
- **A measured outline can read the body as sleeve.** Near the armpit the sleeve runs into the trunk in the front painting. Those readings made a lump that folded through itself and stuck out as a sharp flap. Check where a limb stands clear of the body before trusting its outline.

## What exists

- **All 53 paintings of rounds 1 and 2** (A1 to G3) checked and saved in `references/chatgpt/`. None needs redoing. F8 is a flat cloth sample: the image maker refused the torn hole over skin twice. Round 3 (set H) has not been made.
- **Head:** the Jester's face model, copied from the Ranger's code, at 1.06 times its size, with a man's jaw and a crown 3 cm lower. His face is C1, his profile C3. Glasses are a real object. Hair is one smooth shell. His neck is plain skin colour.
- **Body, legs, boots, arms:** forms measured from B1 and B2, wearing those paintings laid on from four sides. Sleeves take their sides from A3. Outline against the paintings (measured before the sleeve change): 94.5% overlap from the front, 94.7% from the side.
- **Sleeves:** each ends at a gathered band below the elbow. A lace ruffle in two tiers hangs from the band as its own cloth, and the bare forearm runs on inside it to the leather cuff.
- **Hands:** the witches' hand model at a man's size, in two plain colours (glove, skin).
- **Gold dust:** flecks on the boots, motes round his feet, a trail shed by a moving boot. 1,340 single points. The paintings keep plain black boots.
- **Moves:** stand, idle, walk, talk: first drafts from the Ranger's stride. A "Blank doll" button shows his shape without paint.
- About 345,000 triangles.

## Rough, or not built

- The body is his clothes as one smooth skin, not a body with clothes on it. Chris has said not to remake it.
- His hair reads as a hood. Up close the body paint is soft. The ruffle does not bend as cloth; it moves with the forearm.
- Not used yet: C2 (blink and talking mouths), C4 to C14 (hair, hat, glasses), D (hands), E (boots), all of round 2.
- Not built: hat, belt and ring, pouch, scroll, charms, dagger, pearls, feather earring.

## Checked, and not checked

- Every button on the page was pressed in a headless browser at phone size: no errors. Every mesh's lists were counted on the built page and all match.
- Not checked: on a real phone. Chris has not yet said whether the face shows for him now. Movement and the dust's timing cannot be judged in the headless browser.

## Waiting for Chris

- Whether his face shows on the phone now, and whether the sleeves are right.
- What to do next. Claude's suggestion: the hat, since it is his name.
- His height: 1.78 m in his boots is Claude's number.
- Whether Noiz is his name. Who he is and what he can do are in `lore/discussion-notes.md` ("The character they meet"); this session did not edit the lore.
