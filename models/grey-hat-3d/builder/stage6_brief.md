# Job: stage 6 for "the Grey Hat" (maybe named Noiz): his hat, belt, pouch, scroll and jewellery

You are building one stage of a 3D character for Chris's game *Moon Faire*. He is built in code (three.js r128, one function
`makeNoiz(opts)`). Chris looks at the result on his phone and laptop. Another Claude (who wrote this brief) checks your work,
publishes it and talks to Chris. You do the building. You have about 220 steps; you will be warned when 18 are left.
Report to `/home/claude/builder/stage6_report.md`. Scratch: `/home/claude/builder/work6/`.
Also read `builder/stage3_report.md`, `stage4_report.md` and `stage5_report.md` (shirt cloth, hair chains, stance and walk).

## What Chris said (his words decide)

- After the walk and stance stage: "he looks good as he is. Let's just go ahead and give him his hat, his belt and pouch
  and scroll and jewelry as well as all of the animations that the NPCs have". (The animations are the next stage, not yours.)
- He is called "the Grey Hat" after his hat: it is the thing people will know him by. Get it right first.
- Chris likes how the Ranger's gear turned out: "the way her bags and charms move is great". Her belts, satchel, pouch and
  strap hooks are real objects (`/home/claude/witches/ranger`, `R45_gear.js`, README stages 5 and 5b). Take that method.

His design, from the cartoon and the paintings (read the prompt list for every item, and look at sets C, F and G, which
were painted for exactly these): a grey witch hat with a wide brim and a bent point; black rectangular glasses (done); a
string or strings of pearls at his neck; a feather earring; a belt of rings low on his hips over the corset's point, with a
leather pouch and a rolled scroll hanging from it, and whatever else the paintings hang there (charms, a dagger). The
small plugs in his earlobes from stage 4 stay.

## What to deliver

1. **The hat** as a real object on his head: crown, bent point, wide brim with its own thickness and a soft uneven edge,
   band and any trim the paintings show, in grey felt with a felt texture made for it (code-drawn or baked from a clean
   area of a painting; nothing but hat printed on the hat). Sized and seated from the C paintings and B1/B2: measure where
   the brim sits on his brow and how far it stands out. His hair must come out from under it naturally and never poke
   through it; his face and glasses must stay visible from the front under the brim. The point may sway a little.
2. **Pearls** as real beads on a strand that lies on his chest and collar, over the shirt, and moves a little with him
   without passing through the shirt ruffles or his neck.
3. **The feather earring**, hanging from the ear the paintings put it on (never mirror), swinging lightly, clear of his
   hair and collar.
4. **The belt of rings** round his hips with its buckle or fastening, sitting on the corset and trousers with no gap and
   no passing through either, in the stance and through the walk.
5. **The pouch and the scroll** (and any other thing the paintings hang from the belt) as real objects, each hung where
   the paintings put it, swinging and settling with his walk on spring chains as the Ranger's bags do, never passing
   through his leg, his hand or the trousers.
6. Materials that look like what they are: felt, pearl, feather, worn leather, brass or iron rings, parchment.
7. **Page:** one "Show" button for the hat ("Hat", on by default) and one for the rest ("Belt and jewellery", on by
   default). New view buttons: "Hat" and "Belt". Everything keeps working in "Doll" (props hidden with the clothes),
   "Blank doll" (props are clay), "A-pose", "Old hair", "Old shirt", "Old trousers".
8. Keep what you add under about 80,000 triangles.

Check the props in the resting stance from eight sides, in the A-pose beside B1 and B2 at one scale, and in twelve moments
of the walk and four of talk (nothing passing through anything; hanging things in believable places).

Do not change his face, body, clothes, hair design, walk or stance. Do not start on new animations.

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
