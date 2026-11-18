# HOW TO: Moon Faire fair folk (NPCs) — painted people who talk, emote, walk and sit (updated November 13, 2026, 8:20 pm)

Follows `claude/moon-faire-people-from-a-template-api-cost.md` and `claude/moon-faire-people-skins-prompts.md`. See also `claude/moon-faire-fair-folk-review-by-fable.md` (the review) and `claude/moon-faire-fair-folk-lighter-weights-and-flipbook.md` (weights and the Flipbook look).

## Where it stands

- **Chris passed all the painted people as NPCs** ("they're all fantastic").
- **Chris's choices since:**
  - The game uses **a quarter of the triangles** for the fair folk. "It actually looks pretty good for what they are, especially with the flipbook turned on."
  - **The farm lad and the gate keeper on the Opus 5.5 shapes are dropped.** Their waist goes missing at the lighter weights. The Fable 5.2 versions of those two are kept.
- The only NPCs are people the party talks to.
- **There are eleven different people.** The menu shows 17, because six of them still exist on two sets of shapes (Fable 5.2 and Opus 5.5). Chris has not yet picked between those six pairs. The reviewer's pick is in the review note.
- They are wired and packed for game code. **Nothing is placed in a game scene yet.**
- The people, their names and their ways are stand-ins, not lore. Chris decides who is in the game and what they are called.

Links:
- Test page: https://claude.ai/artifact/Gqb3KJtYJ76eTn5k1bWkAM
- People page (all models, costs): https://claude.ai/artifact/S2zzMgXm1qwoGEF2Nk491T
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, folder `game/people/`. README sections from "People from a template" down.

## The people

Old lamp-seller, pie seller, ballad singer (one model, made by hand); fortune-teller, old lamplighter; old night-watchman, chestnut roaster; fair baker, ribbon dyer; farm lad, gate keeper.

## How one is made, start to finish

1. **Shapes.** A Claude model writes a small file on the Jester's template: a simple person (38 cents with Opus 5.5 at high effort, $1.08 with Fable 5.2).
2. **Skin prompts.** Opus 5.5 writes two or three different people for those shapes (about 5 cents a model).
3. **Pictures.** Chris makes two pictures per person in ChatGPT: a body sheet over the model's grey guide (front and back) and a face over the face guide.
4. **Painting.** The pictures are laid onto the model by position. Fable 5.2 looks and finishes the fit (about 11 cents a look).
5. **Review.** One Fable 5.2 session saw everyone beside the Jester and set heights, builds, hats and hair ($2.22).
6. **Lighter weights.** Fable 5.2 chose what to leave off and where to keep triangles for half and a quarter ($1.94 for nine sets of shapes). The paint needs no baking: it is read by position.
7. **Wiring.** One shared library of moves; each person has their own choice from it.

## What is wired

- **Talking.** Three talking loops (calm, lively, gruff): mouth, head and hands.
- **Emotes.** Fourteen: nod, shake head, wave, greet bow, shrug, laugh, point, think, surprised, sad, cross, beckon, refuse, thanks.
- **On their own.** They blink, and now and then shift, look about or rub their hands.
- **Facing.** They turn to face a point (the party).
- **Walking and running.** They walk or run to a point, feet in step with the ground. These are the Jester's own walk and run.
- **Sitting.** They sit on a seat the scene gives them and get up again (the Jester's own sit; her conjured stool is hidden). They can talk and emote while seated.
- **Their own way.** Each person has their talking loops, hello, fidgets, pace, three favourite emotes, and an emote for yes, no, happy, unsure, upset, thanks and bye.
- **Not offered:** sitting on the ground. The template's cross-legged sit breaks skirts, coats and aprons.

## For a session wiring them into the game

Game code talks to one thing, `MF_NPC` (`game/people/npc/npc.js`):

- `await MF_NPC.make(id)` builds a person at a quarter of the triangles (`{ weight: 'half' }` or `'full'` for more). `MF_NPC.list()` gives the ids (`old-lamp-seller`, `chestnut-roaster-opus`, ...).
- Add `npc.root` to the cast scene and set `npc.root.position`. Call `npc.update(dt)` every frame.
- `npc.face(x, z)`, `npc.greet()`, `npc.talk(true/false)`, `npc.emote(name)`, `npc.wiring.moods.thanks` and the rest.
- `await npc.walkTo(x, z)`, `await npc.runTo(x, z)`, `npc.stop()`, `npc.moving`.
- `npc.sit()`, `npc.stand()`, `npc.sitting`, `npc.seated`. `npc.seat()` says where the seat's top must be: about 0.45 m up (times the person's height) and 0.36 m behind where they stand.
- `npc.headTop(vec3)` for a speech mark.

Files to load, in order: three.js r128, `meshopt_simplifier.js`, `jester_tex.js`, `jester_kit.js` (not `jester_lod.js`), `lod.js`, the plain face (`window.MF_FACE_PLAIN`), `person-kit.js`, then `emotes.js`, `npcs.js`, `npc_tex.js`, `npc.js`. `game/people/kit/build_npcs.py` packs the people and builds the test page; it shows the order.

The Flipbook look is in the game's stage (`stage.flip`). The witches' shared colours do not suit the fair folk (no green or cream); see the weights-and-flipbook note. Not solved for a scene holding both.

Rules that apply: witches' light rig as is; three.js r128 with plain scripts; the Jester's own model files are not edited by hand (`jester_kit.js` is made by `models/tools/patch_person_kit.py`).

## Known limits

- The eyelids, open mouth and smile are simple shapes painted from each face picture. Right at walking distance, plain in a close-up.
- Hair is a flat-coloured shape round the face; shoulders are angular; under a man's clothes the body is still the Jester's. The old lamplighter reads as an old woman (he is on the fortune-teller's shapes).
- Clothes are stiff: a skirt swings with the legs but nothing blows or drapes.
- Each person is about 2.5 to 2.9 thousand triangles at a quarter and about 15 draws. Speed with several in a scene has not been measured on Chris's laptop; no Claude session can measure it.

## Cost

Everything spent on Chris's API key across the people work: about $23.75. Walking, running and sitting cost nothing: they were already in the template. The key is kept only in the session's workspace, never in the repo, the pages or these notes.
