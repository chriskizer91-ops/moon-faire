# Job: stage 3 of rebuilding "the Grey Hat" (maybe named Noiz): painted arms and chest, and a real shirt that moves

You are building one stage of a 3D character for Chris's game *Moon Faire*. He is built in code (three.js r128, one function
`makeNoiz(opts)`). Chris looks at the result on his phone and laptop. Another Claude (who wrote this brief) checks your work,
publishes it and talks to Chris. You do the building. You have about 230 steps; you will be warned when 18 are left.
Report to `/home/claude/builder/stage3_report.md`. Scratch: `/home/claude/builder/work3/`.

## What Chris said (his words decide)

- "now we need to paint onto his at least his lower arms and his upper chest so that we can then put the shirt on top of
  that. So that it looks real, and the shirt's actual fabric that moves because it's like flowy and billowy like the pants
  are."
- Earlier: "his ear is printed on his hair and his legs are printed on the surface of his pants ... put the clothes over the doll."
- Stages still to come after this one (not yours): his hair remade over a real ear; ankles, walk and posture.

His design: a cream poet shirt, open at the chest with dark red lacing and a big ruffled front, a wide collar, very full
sleeves gathered into a band below the elbow, lace ruffle cuffs hanging over the forearm, tucked into a black leather
corset with buckles. Bare forearms, leather cuffs and fingerless gloves.

## What to deliver

1. **Paint on the doll where skin shows or could show:** his forearms (A3 and the D set show them: skin, hair, shading), his
   upper chest and collarbones in the shirt's opening (B1, B3, and the close paintings), the neck join, and soft
   shading over the rest of the trunk and upper arms so nothing under the shirt looks like plastic if cloth lifts. Match the
   skin already set in stage 2. Code-drawn detail is fine. No smears: plain skin is better than a stretched painting.
2. **The shirt as its own garment over the doll,** with nothing of his body printed on it:
   - body of the shirt from the collar down to under the corset; the open front with its lacing; the ruffled front and the
     collar as real shapes that stand off the chest;
   - the full sleeves, gathered at the band; the lace cuffs (stage "second step" made two-tier ruffles in `N30_body.js`,
     bucket `projRuffle`: keep them, or rebuild them as part of the new sleeve if that is cleaner);
   - cloth paint from the fabric itself (the F and G paintings and the plain areas of B1, B2, B3), with believable folds.
3. **It is real fabric that moves.** The sleeves and the loose body of the shirt lag, swing and settle when he walks, talks
   and turns, and hang by gravity at rest in the shape the paintings show. Use the cloth method the witches use (the
   Jester's cloth sheets; the Ranger's sleeves, whose README lists four tries and why three failed; Io's cloak). His arms
   must never pass through his sleeves: read how the Ranger solved that before you choose. A `setCloth(on)` switch on the
   api lets it be frozen.
4. **The trousers move a little too** if the cloth method makes that cheap (Chris thinks of them as flowy): a light sway of
   the baggy part, holes and all. Only after the shirt is right. If it is not cheap or risks the holes, leave them and say so.
5. **The corset stays for now** as the piece of the old trunk skin that is corset (cut the old skin down to it, the way
   stage 2 cut the old hips skin down to the corset's bottom edge), sitting over the shirt with no gap and no doll showing.
   If you have time left, make it its own fitted shell instead; say which you did.
6. **Switch over.** By default he now wears the new shirt over the painted doll; old `projTrunk` (above the corset),
   `projArm` and, if you rebuilt them, `projRuffle` are off. One new "Show" button, "Old shirt", puts the old skin back to
   compare. "Old trousers", "Doll" and "Blank doll" keep working in every state. With "Doll" on, the painted arms and chest show.
7. Keep what you add under about 90,000 triangles.

Do not start on his hair, ears, boots, ankles, walk or posture. Do not change his head, face, glasses, hands or gold dust.

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
