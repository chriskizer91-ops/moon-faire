# Job: stage 4 of rebuilding "the Grey Hat" (maybe named Noiz): his hair, remade over real ears

You are building one stage of a 3D character for Chris's game *Moon Faire*. He is built in code (three.js r128, one function
`makeNoiz(opts)`). Chris looks at the result on his phone and laptop. Another Claude (who wrote this brief) checks your work,
publishes it and talks to Chris. You do the building. You have about 220 steps; you will be warned when 18 are left.
Report to `/home/claude/builder/stage4_report.md`. Scratch: `/home/claude/builder/work4/`.
Also read `builder/stage3_report.md` (the shirt and how its cloth moves).

## What Chris said (his words decide)

- "his ear is printed on his hair"
- "the hair is one piece and has clothing and face printed on it so I hope the head has more work still to come"
- "the hair definitely, there's like ears on the hair. The hair's bad, really bad. The hair even smells bad."
- "the face straight on is good. It could be better. But he is an NPC". So leave his face alone.

His design: long brown wavy hair past his shoulders, parted, tucked behind or falling round his ears, a short beard and
moustache (those are painted on the face and stay). A feather earring and a grey witch hat come in a later stage: leave
room for them but do not build them.

## What is wrong now

`src/N41_hair.js` is one open-ring shell measured from the outline, wearing the side paintings laid on by position
(material `projHair`). So whatever the painting shows at a spot lands on the shell: an ear, a piece of face, a piece of
shirt collar. It reads as a hood.

## What to deliver

1. **Real ears on his head** that look right when hair is pushed back, joined cleanly to the head (the head already has
   ear shapes from the witches' head model: check them from every side with the hair hidden, and fix or repaint them so
   they are skin, with no hair or glasses printed on them).
2. **Hair as hair, built the way the finished witches' hair is built.** Read how the Fox's hair was made (Chris approved it:
   "this is wonderful"), the Ranger's loose hair and tails that move, Io's fringe as real hanging hair, and the Jester's.
   Then build his: a scalp cap so no skull shows, and many overlapping locks or ribbons that follow his waves from the
   parting down past his shoulders, front, sides and back, with thickness and a ragged, natural bottom edge. Measure the
   C paintings (C4 on, and the A and B full figures) for the hairline, the parting, the length, the width of the mass
   and where the waves turn.
3. **Hair colour and strands made for hair,** not the figure paintings laid on by position: a strand texture (code-drawn,
   or baked from a clean hair area of a C painting) in his browns with lighter streaks, soft tips, and shading where locks
   overlap. Nothing but hair may be printed on hair. Hard cut-out is allowed for lock tips; no blended transparency.
4. **It moves.** The long locks lag and settle when he walks, turns his head and talks, hang by gravity at rest in the
   painted shape, do not pass through his shoulders, neck, collar or back, and do not cover his face or glasses. Same
   rules as the cloth: same result every run, no explosions, cheap. It obeys the api's cloth switch or has its own.
5. **Glasses arms** must still reach the ears sensibly: fix them if the new ears or hair leave them floating or buried.
6. **Switch over.** New hair by default. One "Show" button, "Old hair", puts the old shell back to compare. "Hair" hidden
   (if there is such a toggle) must hide the new hair. "Doll" and "Blank doll" keep working; in "Blank doll" the hair is clay.
7. Keep what you add under about 90,000 triangles.

Do not change his face, the doll, the shirt, the trousers, the boots, his walk or his posture. Do not build the hat.

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
