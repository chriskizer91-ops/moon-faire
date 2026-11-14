# Job: stage 7 for "the Grey Hat" (maybe named Noiz): all the animations the fair folk NPCs have

You are building one stage of a 3D character for Chris's game *Moon Faire*. He is built in code (three.js r128, one function
`makeNoiz(opts)`). Chris looks at the result on his phone and laptop. Another Claude (who wrote this brief) checks your work,
publishes it and talks to Chris. You do the building. You have about 230 steps; you will be warned when 18 are left.
Report to `/home/claude/builder/stage7_report.md`. Scratch: `/home/claude/builder/work7/`.
Also read `builder/stage5_report.md` (his stance, walk, talk and how moves are written) and `builder/stage6_report.md`
(his hat, belt and hanging things, which your moves must not break).

## What Chris said (his words decide)

- "give him his hat, his belt and pouch and scroll and jewelry as well as all of the animations that the NPCs have".
- He is a character the four witches meet: he talks to them and may join a fight. So game code must be able to drive him
  the way it drives the fair folk.

## What the fair folk NPCs have (this is the list to match)

Their code is in `/home/claude/witches/people/` (read-only; from the starter-world branch, folder `game/people/`). Read its
README sections from "People from a template" down, `npc/emotes.js` (the shared library of moves) and `npc/npc.js` (what
game code calls). They are built on the Jester's template, so their moves are written for her skeleton: take the list, the
timing and the intent, and write his versions in his own move system for his body, stance and clothes.

- **Talking:** three talking loops (calm, lively, gruff): mouth, head and hands.
- **Emotes, fourteen:** nod, shake head, wave, greet bow, shrug, laugh, point, think, surprised, sad, cross, beckon,
  refuse, thanks.
- **On their own:** they blink, and now and then shift, look about or rub their hands.
- **Facing:** they turn to face a point.
- **Walking and running:** they walk or run to a point, feet in step with the ground.
- **Sitting:** they sit on a seat the scene gives them and get up again, and can talk and emote while seated.
- **Their own way:** each person has their own talking loops, hello, fidgets, pace, three favourite emotes, and an emote
  for yes, no, happy, unsure, upset, thanks and bye.
- What game code calls on an NPC: `update(dt)`, `face(x, z)`, `greet()`, `talk(true/false)`, `emote(name)`,
  `walkTo(x, z)` and `runTo(x, z)` (promises), `stop()`, `moving`, `sit()`, `stand()`, `sitting`, `seated`, `seat()`,
  `headTop(vec3)`, and `wiring.moods`.

## What to deliver

1. **His face can move.** He blinks, and his mouth moves when he talks and smiles or opens in emotes. Painting C2 was made
   for this (blink and talking mouths); the finished witches' faces show how painted eye and mouth states are swapped on
   the face (read the Ranger's and the Fox's README on blinking and talking). His beard and moustache must stay right. Do
   not change his face at rest.
2. **Every item in the list above, as his own:** the three talking loops, all fourteen emotes by the same names, blink
   and fidgets, facing a point, walking to a point (his stage 5 walk, now travelling over the ground and turning to his
   heading, with a proper start and stop so his feet do not glide), **a run** in his heavy boots, and sitting on a seat
   and getting up, with talk and emotes working while seated.
3. **In character.** He is a showman in heavy boots and a big hat: unhurried, a bit of swagger, generous with his hands.
   The gruff talking loop and the greet bow should be unmistakably his (a bow can use the hat: a touch or a tip of the
   brim, if the hat's build allows it without the hair breaking). Nothing cartoonish.
4. **The same calls game code uses for the fair folk**, on his api, with the same names and meanings as the list above,
   plus his own `wiring` (his talking loop, hello, fidgets, pace, three favourite emotes, and his emote for yes, no,
   happy, unsure, upset, thanks, bye). Write a short section in the README: "Driving him from game code".
5. **Clothes, hair, hat and hanging things survive every move:** no arm through a sleeve, no hand through the hat brim,
   pouch or trousers, no hair through the collar, no doll through cloth, seated included (the trousers and the belt's
   hanging things must sit sensibly on a seat).
6. **Page:** a "Talk" row (calm, lively, gruff), an "Emotes" row (all fourteen), "Walk to" and "Run to" (he goes to a spot
   and comes back, or walks a small loop), "Sit" and "Stand" (the page provides a simple stool), and "Face me". Keep the
   page easy on a phone: Chris found one witch's page had too many buttons, so group them and keep labels short.
7. **Check as stills in sequence:** every emote at four moments from the front and three-quarter; each talking loop at
   six moments; the run at twelve moments from the side with a foot-slide table like stage 5's; walking to a point (start,
   two strides, turn, stop); sitting down, seated talk, getting up. Run every move over standing and seated and check for
   bad numbers (NaN, bones flying off) before finishing.

Do not change how he looks: face at rest, body, clothes, hair, props. Do not change the steady walk's shape or the stance.

## Where things are

- **His model (the only place you write):** `/home/claude/moon-faire/models/grey-hat-3d/` (your working directory).
  Read `README.md` first (the stage sections at the top are the newest), then `builder/stage1_report.md` and
  `builder/stage2_report.md`: they say how the doll and trousers are made, how the old clothes-shaped skin is cut into
  regions, and what `setDoll` and `setOldSkin` do.
- **His paintings:** `refs/*.png` (A1 to G3). `references/grey-hat-3d-reference-prompts.md` says what every painting is.
  B1 = full outfit front and back, B2 = both sides, B3 and B5 = outer clothes off, A3 = arms hanging, C = head, hair, hat and
  glasses, D = hands, E = boots, F and G (round 2) = details and flat fabrics. The cartoon he comes from:
  `references/source/grey_hat_picture.png`.
- **The four finished witches (read-only, the best reference there is):** `/home/claude/witches/ranger`, `/fox`, `/jester`,
  `/io`. Each has a `README.md` with code-level notes for every stage (cloth, sleeves, hair that moves, ankles, walks,
  posture, light levels) and its `src/`. Chris: "There is a how to do this. And you could also look at one of the other
  models for the witches, because they are finished." Search their READMEs for the thing you are building BEFORE you
  design it, and take their method and code. Do not change those folders; copy code out into his `src/`.
- Scratch space: `/home/claude/builder/workN/` for your stage (make it).

## How to work

- Before changing anything, copy `src/` to `src_before_<stage name>/`.
- Small verified steps: change, `./build.sh`, `python3 shoot.py ...` (angles in radians; see README and the top of
  `shoot.py`), then LOOK with `view_image`, close up as well as whole. Each picture takes 10 to 30 seconds.
- Measure the paintings rather than judging by eye (`tools/sil.py`, `lib/grid.py`, the `tools/doll_*.py` and
  `tools/trouser_*.py` scripts as patterns). Put model and painting side by side at one scale. Read grid labels, never
  screen positions.
- At the end both must pass: `python3 -I build_single.py` and `python3 /home/claude/npc/work/quick_page.py`.
- Page notes (`viewer_n/index.tpl.html`): replace the newest "New: ..." block with a short one for this stage in plain words
  (what changed, what to press, what is rough). README: a new section at the top of the stage sections.
- Write a report (path given above): what you built and where, what you took from which witch, what you measured (small
  tables), what you decided and why, what is rough, triangle counts, and the paths of the pictures that best show it.

## Rules that have already cost time

- **A headless picture does not prove a mesh draws on a phone.** Every attribute list on a mesh must be as long as its list
  of points; the model throws if not. Keep that check.
- **Never put a `//` comment in the middle of a line of code.** The source uses very long lines; rebuild after every edit.
- **Never mirror him.** His costume is not symmetric.
- No blended transparency for cloth (it sorts wrongly): leave cloth out, or use a hard cut-out.
- Run Python that opens a painting with `python3 -I`. Measuring scripts print small tables, never whole arrays.
- Movement cannot be judged in the headless browser (it runs at under two frames a second). Step the model's clock yourself
  and look at stills in sequence; say in the report that motion was not watched.
- Anything that simulates (cloth, hair) must give the same result on every run, must not explode after a jump of the clock
  or a tab left in the background, and must stay cheap: Chris's laptop and phone both run this.
- Do not reshape the doll (Chris: "the dolls shape looks good") and do not change his face.
- Do not use git. Do not publish. Do not use the network. Write only in his model folder and your scratch folder.
- Comments in code: plain words, saying why. Text on the page: plain words Chris can read on a phone.

When all of it is done, both checks pass and the report is written, call `finish`.
