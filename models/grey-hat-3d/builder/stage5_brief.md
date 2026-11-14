# Job: stage 5 of rebuilding "the Grey Hat" (maybe named Noiz): ankles, walk and posture

You are building one stage of a 3D character for Chris's game *Moon Faire*. He is built in code (three.js r128, one function
`makeNoiz(opts)`). Chris looks at the result on his phone and laptop. Another Claude (who wrote this brief) checks your work,
publishes it and talks to Chris. You do the building. You have about 200 steps; you will be warned when 18 are left.
Report to `/home/claude/builder/stage5_report.md`. Scratch: `/home/claude/builder/work5/`.
Also read `builder/stage3_report.md` and `builder/stage4_report.md` (the cloth and hair that your poses will move).

## What Chris said (his words decide)

- "the boots, the ankles need to make a realistic motion as he walks. And I think the posturing of the whole body could be
  improved as well. There is a how to do this. And you could also look at one of the other models for the witches,
  because they are finished."
- He gave the same note on two witches before it was fixed: on the Ranger, her first walk and run were too stiff
  ("Terminator running") with her feet bending unnaturally at the back of each step; on Io, her ankles did not bend the
  right way at the back of her step. Both were fixed: find those fixes in their READMEs and code and take them.
- From the witches' how-to: "A walk is not a slow run. Each foot is on the ground for about 62% of the stride, the heel
  lands first, the toe leaves last, the swinging foot stays low, and the arms hang." And: "A foot follows the ground when
  standing and its own shin when the legs are folded. Otherwise ankles look broken."

## What is there now

His moves (`pose`, `play('idle'|'walk'|'talk')`, `animate(dt)` in `src/N99_static.js`) are first drafts copied from an
early Ranger stride. His stance is a plain A-pose with the arms out. His boots are still the old skin (`projBoots`),
weighted by `wBoot`.

## What to deliver

1. **Ankles and feet that work in the boots.** Heel strikes first, the foot rolls flat, the heel lifts and the boot bends
   at the ball as the toe pushes off, the swinging foot clears the ground low, toes do not dig in or float, feet do not
   slide on the ground while planted. The boot shaft follows the shin and the foot follows the ground, with a believable
   crease at the ankle and no tearing, no collapsing, no boot passing through the trouser hem. Fix the skinning of the
   boots (and the doll's ankle under them) as needed.
2. **A man's walk with weight,** not a stiff march: hips shift over the standing leg, a little counter-turn of shoulders
   against hips, arms swinging from the shoulder with soft elbows and relaxed hands, a slight rise and fall, head steady.
   He is a showman in heavy boots: unhurried, a bit of swagger, nothing cartoonish.
3. **A resting stance that is not an A-pose.** Arms hang naturally by his sides (clear of the sleeves' cloth and the trousers,
   palms turned in), weight slightly on one leg, chest open, head up; breathing and small shifts in idle. "Talk" gets
   gestures of its own from the hands and head. The A-pose stays available as a pose for measuring (the views that compare
   him with paintings need it).
4. **Clothes and hair survive it.** The shirt sleeves, trousers and hair must behave in the new stance and walk: nothing
   passing through anything, sleeves hanging by gravity from the lowered arms. Fix what the new poses break.
5. **Check as stills in sequence:** at least 12 moments round one full stride from the side, front and back, close on the
   boots and whole figure; the rest stance from eight sides; four moments of talk. Measure foot slide (a planted foot's
   place on the ground from frame to frame) and print it as a small table.
6. The page: "Walk", "Idle", "Talk" keep working, the default view shows him in his new resting stance, and one "Show"
   button, "A-pose", puts the measuring pose back.

Do not change his face, the doll's shape, the garments' design or his hair's design. Do not build the hat or the other props.

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
