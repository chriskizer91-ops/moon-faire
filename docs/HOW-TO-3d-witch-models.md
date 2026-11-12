# How to build a Moon Faire witch in 3D

The method that made the Jester Witch, written down so the Ranger, the Herbal Witch and the Fox can be built as well, in less time.
Written November 12, 2026, after pass 18 of the Jester.

- The finished example: https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M
- Her source: `chriskizer91-ops/moon-faire`, branch `claude/jester-3d-model`, folder `models/jester-3d/`. Its `README.md` has the
  code-level notes for every pass. Read it beside this guide.
- Project notes: `claude/HANDOFF-jester-3d-and-flipbook.md`, `claude/jester-3d-pass15-16-moves-and-boots.md`,
  `claude/jester-3d-pass18-playable.md`.
- This guide is for the high-detail model. The lighter game model has its own notes (`claude/jester-game-model.md`).

## 1. The idea in one paragraph

The witch is not sculpted in a 3D program. She is **built in code** (three.js r128) from measurements taken off Chris's
paintings, and the paintings are then **baked onto her** as textures. Shapes come from tables of numbers read off the
paintings; cloth is simulated; movement is keyed by hand in a small pose language. Everything is one function,
`makeJester(opts)`, assembled from numbered files. Because it is all code and tables, most of it can be reused for the next
witch by changing the tables, the costume and the paintings.

## 2. Ask for these paintings before writing any code

The Jester took extra rounds because paintings arrived as problems appeared. Ask for the whole set first. Plain background,
even light, no dramatic shadows, the whole subject in frame.

| Set | Views | Used for |
|---|---|---|
| Turnaround in full costume | front, back, both sides | overall proportions, costume layout |
| **Base outfit**, outer layers off | front, back, both sides | body and under-layers; build this before veils, cloaks or coats |
| Face | front, true profile, three-quarter, from above, from below | head shape and the baked face |
| Hands | back of the hand and palm, fingers apart | hand shape and the hand texture |
| Footwear | both sides, front pair, back, three-quarter, from above, the sole, a close view of fastenings | boots or shoes |
| Detail sheet | jewellery, trims, belt, weapon, anything that hangs | accessories |
| One key pose | her most typical spell pose | checking the costume in motion |
| Her flipbook | the sprite frames, and an HD flipbook if there is one | cloth, light and motion to match |

Also needed: her ten moves from the move sheet (`assets/design/moves_v03.json`, eight steps each with cast and recovery
times; check it holds the witch being built), and which hand hides her weapon.

## 3. Measure, do not guess

Every good result on the Jester came from measuring a painting; most wasted rounds came from judging by eye.

- **Put a labelled grid on the painting** (`lib/grid.py src out x0,y0,x1,y1 step`) and read the numbers off the labels.
  Read the labels, never the position on screen: that mistake was made more than once.
- **Fix one scale per painting** and write it in the code. Jester examples: the profile at 1500 pixels a meter; the hand
  painting at 0.2366 mm a pixel; the boot painting at 0.28 mm a pixel.
- **Turn outlines into tables.** A table is a list of `[position, value]` pairs read along the painting, such as the face
  profile by height or the boot's width by length. `prof(table, x)` and `spline(table, x)` read them back smoothly. Use
  `spline`: joining keys with separate smooth steps left visible bands.
- **Check the build against the painting with a script**, not by eye. `prof_cmp.py` laid the model's face profile over the
  painting and it was brought to within 1 mm.
- **Find awkward hand poses by search.** To put two fingertips on her pendant, a small search moved the wrist until the
  fingertip met the target (`debug.applyPose` and `anchor` make this possible). Minutes, where hand-tuning took rounds.
- Finding landmarks automatically failed on painted faces. Read eyes, mouth and chin by eye on a gridded picture.

## 4. How she is put together

Files are concatenated in number order by `build.sh` into one script.

| File | What it holds | Technique |
|---|---|---|
| `00_util`, `10_geom` | maths, skeleton, part builders | `loft(rings)` skins a surface over rings of points; `ringXZ` makes a rounded ring; `tubeRings` makes cords and rolls; `addPart(material, part, weights)` adds it. **Skin weights are a function of position**, so no weight painting. `Q(n, min)` scales detail for phones. |
| `20_tex` | textures and materials | Baked paintings (see below) plus textures drawn in code on a canvas: fabric weaves, the ridged sole, the ribbed sock, and a crease normal map for patent leather. Each code-made texture uses **its own random seed** so adding one never changes another. |
| `30_body`, `31_boots` | body, legs, boots | Lofts from profile tables. Boots are built to the eight paintings: shaft, foot, sole wall, lugs, stitches as small dashes laid on the surface, eyelets, laces, sock. |
| `32_hands` | hands | The hand is described as a solid (palm slab from the painted outline, pads, five fingers as tubes with knuckle and crease tables), turned into a mesh by **surface nets**, then each point is pulled onto the solid. Fingers bend by soft membership of each finger. Nails are separate plates. |
| `40_head` | head, face, hat, hair | Rings by height from the profile table, with separate tables for nose and cheek. The face material mixes three sources by a per-point weight: the front painting, the profile painting on the sides, and plain skin under the jaw. Eyes and mouth are painted states swapped on the face canvas. |
| `50_cloth` | cloth | Sheets of points held by pins on the body, pulled by gravity and wind, kept off the body by capsules, off the floor, and off a seat. It runs in world space, so cloth trails when she moves. Fingers can take hold of it. |
| `60_veils`, `65_access` | outer cloth, jewellery, ruffles, bells | Cloth sheets with a sheen that shifts between two colours by angle (one two-toned fabric, not strips). Hanging things are spring chains. |
| `70_anim`, `75_pose`, `90_api` | movement | See section 6. |
| `80_fx`, `85_actions`, `86_moves`, `87_spells` | effects, spells, body moves | See section 6. |

**Baking.** `bake.py` (and `bake_hands.py`) cut and warp the paintings into the textures the model wears, using the
landmarks measured in section 3, and write them into `out/jester_tex.js`. Re-run it only when a painting or a landmark
changes. `lib/restore_refs.py` turns the stored paintings back into the folders the bake reads.

**Build order that worked:** skeleton and proportions, body and base outfit, head from the profile, baked face, hands,
solid costume parts, cloth, accessories, then movement. Build the base outfit before the outer layers; doing it the other
way round hid body mistakes under cloth.

## 5. Size and speed

Full detail is about 584,000 triangles (hands about 118,000, face and neck about 87,000). Phones get `detail: 0.75`, about
241,000. Chris's laptop handles close to a million, and he has said it may be laptop-only if that is what the look needs.
Spend triangles where he looks: face, hands, then feet.

## 6. How she moves

A pose is a small set of numbers: where each hand and foot is, where the elbows and knees point, lean, gaze, fingers, eyes
and mouth. Arms and legs are solved from those targets. A move is a list of keyed poses over time (`defAction`).

Three layers are added each frame:

1. **Base**: breathing, the walk and the run, driven by a phase the host advances by distance covered.
2. **Stance**: how she holds herself until told otherwise (kneel, squat, sit, hover), keyed from standing and played
   backwards to stand up.
3. **Move**: plays once over the stance. The stance keeps the legs and the chest carries the move's hands, so one spell works
   standing, kneeling or seated.

Rules learned:

- **A walk is not a slow run.** Each foot is on the ground for about 62% of the stride, the heel lands first, the toe leaves
  last, the swinging foot stays low, and the arms hang. The first walk had none of this and Chris saw it at once.
- **A foot follows the ground when standing and its own shin when the legs are folded.** Otherwise ankles look broken.
- **Spells come from the move sheet.** Time each to its cast and recovery, key the eight steps, then add effects. The six
  with flipbook frames were matched to the frames; the rest were built from the descriptions.
- She casts toward her own left, the target at screen right. Never mirror a spell: the costumes are not symmetric.
- The model reports when a blow lands (`state.hitN`). The viewer answers with a jolt or sway of the picture, a flash, and
  motes across the stage, a different kind for each spell.
- Body moves (walk, run, stances, jump, talk, wave, bow, twirl, laugh, dance) are not about the Jester. They should carry
  over to the next witch with small changes for her build and clothes.

## 7. The page, and saving the work

- `viewer/stage.js` is the lit stage; `viewer/app.js` is the page: Body, Moves and Spells rows, quick buttons on the stage,
  Walk around with a pad, the practice dummy, the flipbook picture for the same moment, and Flipbook look.
- `build_site.sh` builds the page; `build_single.py` makes one offline file.
- **Every pass ends the same way:** publish to the same link, push to the branch, add a README section, update the project
  notes, and send Chris the single file. He tries things on his phone, so every step must end with something he can open.
- Before each pass, copy the source to `src_before_passN`. When Chris asked for the previous face back, it was restored
  exactly because that copy existed.

## 8. Checking the work

- Renders are made in a headless browser (`shoot2.py`, views written as small scripts; `lib/montage.py` joins them). Look at
  every new shape and move from several sides before showing it.
- Run every move over every stance and check for broken numbers before publishing. It takes a few minutes, has found no
  faults so far, and is what lets a new move be published without fear for the old ones.
- `shoot_site.py` loads the real page, presses buttons and keys, and reports errors.
- **Motion cannot be judged this way.** The headless browser runs at under two frames a second. Say so plainly each time;
  timing and feel are Chris's to judge.

## 9. For the next three witches: reuse, and what is new

| Part | Reuse as it is | Change for each witch |
|---|---|---|
| Maths, part builders, cloth, chains, pose and move system, the three layers | yes | nothing |
| Body moves and stances | yes | small pose changes for her build and skirt or coat |
| Hands | the method and code | size, nail colour, a new bake from her hand painting |
| Head | the method | new profile tables, new face bake, her hair and headwear |
| Body and legs | the builders | her proportion tables |
| Footwear | the boot builder as a pattern | her own tables and details |
| Costume and cloth layers | the cloth sheets and sheen | all new: this is most of the work |
| Spells and effects | effect building blocks | her ten moves, her colours, her weapon |
| Viewer page | yes | her name, her spell list, her flipbook frames |

**A faster order for witch two**

1. Collect the full painting set (section 2) and her move sheet.
2. Copy `models/jester-3d` to a new folder. Do not start by reorganising shared code; that can wait until two witches
   exist and the shared part is plain to see. This split has not been done yet.
3. Measure: proportions, face profile, hands, footwear. Fill the tables.
4. Body and base outfit, checked against the base paintings. Show Chris.
5. Head and baked face. Show Chris, and expect more than one round here.
6. Hands (re-bake), footwear.
7. Costume solids, then cloth, then accessories and weapon.
8. Switch on the body moves already made; fix what her clothes break.
9. Her ten spells and their effects.
10. Page, publish, repo, notes.

## 10. Mistakes that cost time, and the rule for each

| What happened | Rule |
|---|---|
| A face Chris had approved was slimmed while "fixing details"; he asked for the old one back | Never reshape an approved part without asking. Record what is approved. |
| Veil ribbons read as "strips of fabric" | Model a fabric as the single sheet it is. |
| The hat, hands and cuffs needed size changes late | Compare sizes against the sprite and paintings early, side by side at one scale (`compare.py`). |
| The walk looked like a jog; crossed feet looked broken | Check each move against how a body does it, not only against the keys. |
| Grid numbers read from the screen, not the labels | Read the labels. |
| A comment added in the middle of a long line swallowed the code after it | When patching, never put a `//` comment mid-line. |
| A new texture shifted the random pattern of others | Give each its own seed. |
| A value was stored on the wrong object and a test name clashed | After wiring anything new, print it once to see it is alive. |

## 11. What Chris looks for

In his words: "a realistic 3D model of this character", "as perfect as we can". He notices the face first from every
angle, then hands, then how cloth reads, then how she moves. He gives notes from his phone or laptop screen; ask for a photo
when a note is unclear. Names for the four, the moon and the planets are still open, so keep names in data, not in code.
Write anything he reads in plain words.

## 12. Checklist for each witch

- [ ] Full painting set and move sheet in hand
- [ ] Scales and landmark tables written down
- [ ] Base outfit approved before outer layers
- [ ] Face approved from front, side, three-quarter, above, below
- [ ] Hands and footwear approved
- [ ] Cloth reads as her fabrics, in motion
- [ ] Body moves run in her clothes
- [ ] Ten spells timed to the sheet, with effects
- [ ] Every move over every stance runs clean
- [ ] Page published, single file sent, repo pushed, notes updated
