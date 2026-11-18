# Job: stage 2 of rebuilding "the Grey Hat" (maybe named Noiz): painted legs, and real trousers with real holes

You are building one stage of a 3D character for Chris's game *Moon Faire*. He is built in code (three.js r128, one function
`makeNoiz(opts)`). Chris looks at the result on his phone. Another Claude (who wrote this brief) checks your work, publishes it
and talks to Chris. You do the building. You have about 200 steps; you will be warned when 18 are left.

## Where things are

- **His model (the only place you write):** `/home/claude/moon-faire/models/grey-hat-3d/` (your working directory).
  Read `README.md` first (the top section is stage 1, the doll), then `builder/stage1_report.md`: it says how the doll is made,
  how the old clothes-shaped skin is cut into regions, and what `setDoll` and `setOldSkin` do.
- **His paintings:** `refs/*.png`. B1 = full outfit, front and back. B2 = both sides. B5 = body with outer clothes off.
  Set F (round 2) is details and flat fabrics; **F8 is the trouser cloth with one torn hole, close**. E = boots.
  `references/grey-hat-3d-reference-prompts.md` says what every painting is; read the parts on his trousers, fishnets and legs.
  The cartoon he comes from: `references/source/grey_hat_picture.png`.
- **The Ranger (read-only reference):** source `/home/claude/npc/ranger_src/`, built copy `/home/claude/ranger/`.
- Scratch space: `/home/claude/builder/work2/` (make it).

## What Chris said (his words decide)

- "his legs are printed on the surface of his pants. I think it would be better to use one of the witches like blank dolls for
  their body ... then put the clothes over the doll."
- On stage 1: "the dolls shape looks good". So do not reshape the doll.
- For this stage: "the pants are going to have actual holes should the skin of the doll be painted before putting clothes
  over it". The answer is yes, and it is the first half of this stage.

His design: baggy red-and-black patterned trousers, torn open in large holes down both legs, over black fishnet on bare legs,
gathered into tall black strap boots. The two legs are torn differently. **Never mirror him.**

## What to deliver

1. **Painted legs on the doll.** From hip to foot the doll wears skin that matches his face, neck and hands (the plain doll
   colour is a little too orange: fix that for the whole doll), with believable leg shading, and **black fishnet over it** as
   the paintings show (F8 shows how the net sits on skin; measure the size of the net's diamonds). The net must read as net
   close up and from two metres, with no shimmer of fine lines at a distance, and must follow the leg, not swim on it when he
   walks. A code-drawn net is fine, as a texture or as its own thin layer just off the skin.
2. **Trousers as their own garment** over the doll's hips and legs: from the waist (it goes under his corset, so take it a
   little higher than the corset's bottom edge) down to where they gather into the boot tops. Baggy, with the volume and
   the folds the paintings show, standing clear of the legs.
   - **Real holes.** Where the paintings show torn holes, there is no cloth, and you see the fishnet leg inside. Place and
     shape every hole from the paintings: front from B1, back from B1's back view, sides from B2. Each leg has its own holes.
   - Torn edges look frayed, not laser cut. Through a hole you can see the inside of the cloth beyond it (darker), not nothing.
   - **Cloth paint with no legs or net printed on it.** Use the cloth pattern itself (F8 and the whole areas of B1 and B2), so
     the pattern is crisp and not smeared at the sides. Whatever you do, a hole in the paint must be a hole in the cloth.
   - Holes must work on a phone: cut them by leaving the cloth out, or with alpha test (a hard cut-out). Do not use blended
     transparency: it sorts wrongly. Keep the rule that every list on a mesh is as long as its list of points.
3. **Movement.** The trousers follow his legs in idle, walk and talk. The doll must not poke through the cloth (through a
   hole is the point; through cloth is a fault). Check stills of the walk at four moments from front, side and back. Simple
   skinning is enough; no cloth simulation in this stage.
4. **Switch over.** By default he now wears: old trunk, arms, ruffles and boots as before, **new trousers and the doll's
   legs and hips** in place of the old `projLegs` and `projHips` skin. Where trousers meet boots and corset there must be no
   gap and no doll showing. "Doll" still strips him to the doll (trousers off as well), and the painted legs show there.
   "Blank doll" still works in every state. Add one "Show" button, "Old trousers", that puts the old leg skin back for
   comparison.
5. **Page notes** in `viewer_n/index.tpl.html`: replace the "New: the doll under his clothes" block with a short "New: real
   trousers" block in plain words (what changed, what to press, what is rough). Keep the other blocks.
6. **README**: a new section at the top of the stage sections, "Stage 2 of the rebuild: painted legs and real trousers".
7. **A report** at `/home/claude/builder/stage2_report.md`: what you built and where, what you measured (small tables), what
   you decided and why, what is rough, triangle counts, and the paths of the pictures that best show it (front, both sides,
   back, three-quarter, close on two holes, beside B1 and B2 at one scale, four walk stills, the page at phone size). Plain words.

Do not start on the shirt, corset, hair or boots. Do not change his head, face, hair, glasses, hands, gold dust, sleeve
ruffles, the doll's shape, or his moves. Keep what you add under about 70,000 triangles.

## How to work

- Before changing anything, copy `src/` to `src_before_trousers/`.
- Small verified steps: change, `./build.sh`, `python3 shoot.py ...` (angles in radians; see README and the top of
  `shoot.py`), then LOOK with `view_image`, close up as well as whole. Each picture takes 10 to 30 seconds.
- Measure the paintings (`tools/sil.py`, `lib/grid.py`, the `tools/doll_*.py` scripts as patterns). Put the model beside the
  painting at one scale and compare the trouser outline and each hole's place and size. Read grid labels, never screen positions.
- At the end both must pass: `python3 -I build_single.py` and `python3 /home/claude/npc/work/quick_page.py`.

## Rules that have already cost time

- **A headless picture does not prove a mesh draws on a phone.** Lists as long as the list of points; the model throws if not.
- **Never put a `//` comment in the middle of a line of code.** The source uses very long lines; rebuild after every edit.
- Run Python that opens a painting with `python3 -I`. Measuring scripts print small tables, never whole arrays.
- Movement cannot be judged in the headless browser. Say in the report that motion was not watched.
- Do not use git. Do not publish. Do not use the network. Write only in his model folder and your scratch folder.
- Comments in code: plain words, saying why. Text on the page: plain words Chris can read on a phone.

When all of this is done, both checks pass and the report is written, call `finish`.
