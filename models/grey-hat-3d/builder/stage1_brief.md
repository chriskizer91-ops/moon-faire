# Job: stage 1 of rebuilding "the Grey Hat" (maybe named Noiz) as a doll with clothes over it

You are building one stage of a 3D character for Chris's game *Moon Faire*. The character is built in code (three.js r128, one
function `makeNoiz(opts)`), not in a 3D program. Chris looks at the result on his phone. Another Claude (the one who wrote this
brief) will check your work, publish it and talk to Chris. You do the building.

## Where things are

- **His model (the only place you write):** `/home/claude/moon-faire/models/grey-hat-3d/` (your working directory).
  Read its `README.md` first, top to bottom: it says what exists, how it is built and tested, and what is rough.
  Source is `src/*.js`, concatenated in number order by `./build.sh` into `out/noiz.js`.
- **His paintings:** `refs/*.png` (A1 to G3). B1 = full outfit front and back. B2 = sides. **B3 and B5 show his body with outer
  clothes off**: look at them, they are your target for this stage. A3 = arms hanging. The cartoon he comes from is
  `references/source/grey_hat_picture.png`. The prompt list that explains every painting: `references/grey-hat-3d-reference-prompts.md`.
- **The Ranger, a finished witch, to take the doll from (read-only):** source in `/home/claude/npc/ranger_src/` (its `README.md`
  has notes for every stage; body code is in its `src/`), and a built, renderable copy in `/home/claude/ranger/` (it has its
  own `shoot.py` and test page). Do not change either folder. Copy code out of them into his `src/`.
- Scratch space for pictures and experiments: `/home/claude/builder/work/` (make it).

## What Chris said (his words decide)

- On the first build: "every other, instance has made a blank doll that looked good and then printed the image on top of that."
- On the current build (one smooth skin shaped like his clothes, with the paintings laid on by position): "his ear is printed
  on his hair and his legs are printed on the surface of his pants. I think it would be better to use one of the witches like
  blank dolls for their body and then adjust from there into a man shape, then put the clothes over the doll."
- Earlier: "It actually looks pretty good" (so keep what works: head, face, glasses, hands, sleeve ruffles, gold dust, moves, page).

## The whole plan (so you build this stage to fit the later ones)

1. **This stage: the blank doll.** A man's body taken from the Ranger's doll and reshaped.
2. Trousers as their own layer over the doll's legs, with real holes that show his fishnet legs underneath.
3. Shirt as its own layer. 4. Corset. 5. Hair over a real ear.

Each later stage will switch off one region of the old clothes-shaped skin and put a real garment over the doll there. So the
old skin must stay working for now, and be easy to switch off by region (trunk, legs, arms) later.

## This stage: what to deliver

1. **A man's body under the clothes**: trunk (chest, shoulders, waist, hips, seat), neck joining the head he already has, whole
   arms down to the wrists where his existing hands join, legs, and feet simple enough to go inside his boots. Start from the
   Ranger's body builders and proportion tables, then reshape to a man and to HIM: measure B3 and B5 (use `tools/sil.py`,
   `lib/grid.py`, and the way `tools/tables.py` measures; he stands 1.78 m in his boots, and the skeleton in `src/10_geom.js`
   is already his). Wider shoulders, flatter chest, straighter waist, narrower hips, thicker neck, arms and wrists than hers.
   It must look good as a blank doll: smooth, no folds through itself, clean joins at neck, shoulders, armpits, crotch, wrists.
2. **It is skinned to his skeleton** so idle, walk and talk move it properly (shoulders, elbows, hips and knees bend without
   tearing or collapsing).
3. **A way to see it.** In the model: `api.setDoll(on)` (and `api.doll`): when on, the old clothes-shaped skin (trunk, legs,
   boots, sleeves, ruffles) is hidden and the doll shows with his head, hair, glasses and hands. When off (the default for
   now) he looks exactly as he does today. On the page (`viewer_n/index.tpl.html`): one new button in the "Show" row called
   "Doll". The "Blank doll" button must keep working in both states (unpainted clay look).
4. **Skin on the doll**: a plain matte skin colour that matches his face, neck and hands (see how `N99_static.js` and
   `bake_face.py` get `skin`, `skinNeck`, `skinHand`). If B3 or B5 give you good paint for his bare body, you may lay it on, but
   only if it looks better than plain skin from every side. No paint is better than smeared paint.
5. **A report** at `/home/claude/builder/stage1_report.md`: what you built and in which files, what you measured (as tables),
   what you decided and why, what is rough or unfinished, the triangle count, and the paths of the pictures that best show
   the result (front, side, back, three-quarter, beside the painting, beside the Ranger's doll, one mid-walk pose). Plain words.

Do not start on the clothes. Do not change his head, face, hair, glasses, hands, gold dust, sleeve ruffles or moves.
Do not reshape the old skin. Keep the added triangles reasonable (about 60,000 for the doll is plenty).

## How to work

- Small verified steps: change, `./build.sh`, take pictures with `python3 shoot.py ...` (angles in radians; see the README
  and the top of `shoot.py`), then LOOK at them with `view_image`. Each picture takes 10 to 30 seconds to draw. Look from the
  front, both sides, back, three-quarter, above and below before you call a shape good.
- Render the Ranger's doll early (in `/home/claude/ranger/`, read her README for her blank or unpainted switch) so you know
  what "a blank doll that looks good" means here. Put his doll beside hers and beside B3 and B5 at the same scale.
- Check outlines by measuring, not by eye: `tools/cmp.py` shows how the old skin was compared with B1; do the same for the doll
  against B3 and B5.
- `python3 -I build_single.py` makes the one-file page `deliver/Noiz_3D_stage1.html`;
  `python3 /home/claude/npc/work/quick_page.py` presses every button on it and reports errors. Both must pass at the end.

## Rules that have already cost time

- **A picture from the headless browser does not prove a mesh draws on a phone.** Every attribute list on a mesh must be exactly
  as long as its list of points. The model now throws if not; keep that check and never weaken it.
- **Never put a `//` comment in the middle of a line of code.** It swallows the rest of the line. Comments go at the end of a
  line or on their own line. The source uses very long lines; edit with care and rebuild after every edit.
- **Never mirror him.** His costume is not symmetric. (A plain body may be built for both sides from one description.)
- Run any Python that opens a painting with `python3 -I`. Measuring scripts print small tables, never whole arrays.
- Read grid labels, never positions on the screen.
- Movement cannot be judged in the headless browser. Check poses as stills (pose him mid-walk, arms out, arms down) and say in
  the report that motion was not watched.
- Before changing anything, copy `src/` to `src_before_doll/` so the present build can be restored.
- Do not use git. Do not publish. Do not use the network. Do not edit anything outside his model folder and your scratch folder.
- Comments in code: plain words, saying why. Text on the page: plain words Chris can read on a phone.

When everything above is done, both checks pass and the report is written, call `finish`.
