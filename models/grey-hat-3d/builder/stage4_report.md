# Stage 4 report: his hair, remade over real ears

Written by the builder, November 14, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures: `/home/claude/builder/work4/final/`. Nothing was published. Git was not used. The network was not used.
The source before this stage is `src_before_hair/`. About 140 of the 220 steps were used.

## In short

- The one-piece painted shell is no longer worn. His hair is 131 separate locks in three layers over a scalp cap, from a
  middle parting to past his shoulders, wearing only a strand picture drawn for hair. Nothing else is printed on it.
- He has skin ears where C4 paints them, with his hair tucked behind them, and a plug in each lobe.
- The hanging hair moves on nine chains. It was checked by numbers and stills. **It was not watched moving.**
- Both checks pass: `python3 -I build_single.py` and `python3 /home/claude/npc/work/quick_page.py` (27 buttons, 0 errors).
- It is recognisably hair now and it matches C4's outline, but it is **not as good as the painting**: flatter on top,
  thinner and tidier in the waves, no curls. See "What is rough".

## What I built, and where

| Thing | Where | Notes |
|---|---|---|
| The hair | `src/N45b_hair.js`, `HAIR` | new file, added to `build.sh` after `N45_doll.js` (it needs the doll's shape) |
| How it moves | `src/N45b_hair.js`, `HAIRSIM` | stepped from `animate`, `pose` and `setCloth` in `N99_static.js` |
| Strand pictures | `hairTexN`, `hairAlphaN` in `N45b_hair.js` | drawn in code; colours measured from C12 |
| Hair materials | `hairMat` in `N99_static.js` | keys `hair`, `hairIn`, `hairCap`, `hairMass`; hard cut-out, no blending |
| Ears | `src/N40_head.js`: `EAR`, `EAR_TEX`, `sideZ`, `SKIN_UV`, the plug | ear moved to C4's place, repainted as skin |
| Glasses arms | `src/N42_glasses.js` | over the top of the ear, hooked down behind it |
| Switches | `N99_static.js`: `setOldHair`, `setHair`, `showHair` | page button "Old hair" in `viewer_n/index.tpl.html` |
| Tools | `tools/hair_measure.py`, `tools/hair_cmp.py`, `tools/hair_walk.py` | measure the paintings; model beside C4; step the hair |

The four hair meshes:

- `hairCap`: a thin shell on his scalp from the crown to the hairline, so no skull shows between locks.
- `hairMass`: a plain dark sheet inside the hanging hair, narrower and shorter than the locks.
- `hair`: the outer locks: 52 from the parting, 9 down the back of his head from the crown, 8 at the front edges beside his jaw.
- `hairIn`: two under layers of locks (28 and 34), darker.

## What I took from which witch

| From | What | Used how |
|---|---|---|
| Io, `I41_hair.js` `tress` | a lock as a flat wavy ribbon of strands along a middle line, each lock on its own narrow strip of one strand picture, pointed tips by hard cut-out | `lock()`, nearly line for line; added a per-point shade |
| Io, `I41_hair.js` | a plain sheet under the tresses, kept narrower than them | `buildMass()` |
| Io, `I21_tex.js` `hairTexIo`, `hairAlphaIo` | the strand picture and the tip mask | `hairTexN`, `hairAlphaN`, in his colours, finer strands |
| Io, `10_geom.js` and `I99_static.js` `softStep`, `softApply`, `chainW`, `mixW` | chains of bones pulled toward rest, kept speed, fixed length, pushed out of balls; weights shared between neighbouring chains | `HAIRSIM`, `chainW`, `mixW`, `wLock` |
| The Fox, `45_foxhead.js` | the plan: a cap, a body, many separate locks; the hair's own dice so nothing else reshuffles | the structure of `HAIR`, `hrnd` |
| His own shirt, `N47_shirt.js` | fixed time step, settle at once on a jump, obey `setCloth` | `HAIRSIM.step` |

The Ranger's loose locks and the Jester's hair were read but nothing was copied from them: Io's tresses are the same idea
at the length he needs.

## What I measured

All from `tools/hair_measure.py` and `tools/hair_cmp.py`. C4 is 2000 px to the metre in both its figures (1940 by his
pupils, 2059 and 1997 by eye line to lips). Full tables: `work4/measure_final.txt`, `work4/cmp_final.txt`.

Outline from the front, half-width in metres (his right, his left). Below 1.50 the model's outline is his shirt, not hair,
so those rows are left out.

| Height | C4 | Model |
|---|---|---|
| 1.76 | 0.059, 0.051 | 0.066, 0.063 |
| 1.72 | 0.086, 0.080 | 0.098, 0.096 |
| 1.68 | 0.104, 0.094 | 0.105, 0.103 |
| 1.64 | 0.109, 0.102 | 0.114, 0.099 |
| 1.60 | 0.119, 0.106 | 0.120, 0.112 |
| 1.56 | 0.126, 0.117 | 0.133, 0.122 |
| 1.52 | 0.134, 0.122 | 0.137, 0.128 |
| Top of his hair | 1.778 | 1.781 |

The model is about 1 cm too wide each side at 1.72 to 1.76 (the hair stands off his skull there more than painted).

Profile, how far back the hair reaches (metres behind the middle of his head):

| Height | C4 | Model |
|---|---|---|
| 1.74 | 0.100 | 0.112 |
| 1.70 | 0.120 | 0.133 |
| 1.66 | 0.132 | 0.135 |
| 1.62 | 0.138 | 0.140 |
| 1.58 | 0.142 | 0.145 |
| 1.54 | 0.141 | 0.148 |
| 1.50 | 0.146 | 0.149 |
| 1.46 | 0.140 | 0.150 |
| 1.42 | 0.129 | 0.155 |

Below 1.46 the model is fuller and longer than C4 on purpose (see "C4 or B1").

Other numbers:

| What | Value | From |
|---|---|---|
| Hairline, middle of forehead | 1.733 m | C4 front, read off a gridded copy |
| Hairline, corners | 1.71 m, 5.5 cm out | C4 front, same |
| Ear, middle | 0.119 m behind the tip of his nose | C4 profile (the model had it at 0.137) |
| Waves, crest to crest | about 0.10 m (medians 0.111, 0.115, 0.094) | C4 profile, C4 front, C12 |
| Hair colours, dark to light | `#251915 #34231d #422c25 #53382e #684739` | C12, the back view |

I first guessed the waves at 6 cm by eye. The measurement said 10, which is what the locks already had, so I left the
wavelength alone and only raised the height of the waves.

Colour of the model's hair beside C4's, same patch of the side-by-side picture (`work4/col_final.txt`):

| Patch | C4 mean | Model mean | C4 darkest tenth | Model darkest tenth |
|---|---|---|---|---|
| Side, below the ear | `#392820` | `#3a2b28` | `#1b1513` | `#2e1a15` |
| Top of the head | `#392b26` | `#41312e` | `#241917` | `#3a211a` |

The means match. The model's shadows are not as deep as the painting's, most of all on top.

## Triangles

| Part | Triangles |
|---|---|
| `hair` | 38,100 |
| `hairIn` | 28,272 |
| `hairCap` | 5,856 |
| `hairMass` | 2,400 |
| Plug rims (`steel`) | 240 |
| Sum | 74,868 |
| Whole model before / after | 487,453 / 562,697 (added 75,244, under the 90,000 asked) |

The old shell (27,243 triangles) is still built and hidden, for the "Old hair" button. Bones went from 52 to 97.

## Movement: numbers, not watching

`python3 -I tools/hair_walk.py` (`work4/walk_final.txt`). "Far" is how far the furthest chain joint is from where it would
rest. "Deep" is how far the deepest joint is inside a ball on his neck, shoulders, chest or back.

| Test | Far (mm) | Deep (mm) |
|---|---|---|
| At rest | 0 | none (3 clear) |
| Idle, 3 s | 1.8 | 0 |
| Walk, 4 s at 60 frames a second | 23.1 | 2.1 |
| Talk, 4 s | 23.4 | 3.0 |
| Walk at 30, at 5 and at 144 frames a second | 23.5, 22.2, 23.0 | 1.9, 0.9, 5.1 |
| After clock jumps of 30 s, 1e9 s, -5 s and NaN | finite, 18.4 | 1.2 |
| Head turned 35 degrees in 0.3 s, one second later | 54 (at its leash) | 1.3 |
| Head nodded 20 degrees | 13 at most, 2.2 settled | none |
| Back to rest | 0.3 | none |
| Frozen with `setCloth(false)`, walking | 9.3 | 2.3 |

- Same result on two runs (checksums equal). Back at rest the checksum is the same as before the walk.
- Cost: 0.02 ms a frame for the chains.
- Joints do go a few millimetres into a ball for a step (5.5 mm at worst, in a head tilt). The locks are skinned between
  chains, so a lock can pass a little further than its chain. In the stills I saw none through his shoulders or neck.
- One extreme case looks stiff: a 35 degree turn of the head in a single frame leaves the hair on one side standing out
  about 5 cm for a moment (`final/turn_a.jpg`, last column). No animation he has does that.

## What I decided, and why

1. **C4 or B1.** They disagree. B1 (the whole figure) paints his hair about 3 cm wider each side below his ears and about
   6 cm longer at the back than C4 (the head study). I built the top, hairline and sides of his head to C4, and went a
   third of the way toward B1 below his ears (1 cm wider, tips at about 1.385 m at the middle of his back). The B1
   reading is rough: my brown filter also catches his corset, so I read the hair's end off the width column, not the
   printed "lowest" figure. If Chris wants B1's bigger hair, the two numbers are `B1_WIDE` and `endY`.
2. **The ear moved, the face did not.** The built ear went 18 mm forward to where C4 has it, and the profile painting is
   slid back under it so the painted ear is not seen twice. This stretches the profile painting between mid-beard and ear
   by up to a third. I compared the head from the front before and after, hair hidden: the only pixels that changed are
   the ears and a thin line along the edge of his cheeks (`work4/facediff_f.jpg`). The side view of his cheek did change.
3. **Plugs as objects.** Not asked for. The painted plug sat in the wrong place on the built lobe, so each ear has a
   small steel-rimmed black plug over it. The feather earring can hang from the left one. Easy to remove (one block in
   `buildEars`).
4. **The hair obeys the cloth switch.** `api.setCloth(false)` freezes it; there is no separate switch.
5. **No "Hair" button existed on the page.** I added `api.setHair(false)` (hides whichever hair is worn) but no button.
6. **Room for the hat.** Above 1.665 m the hair is carried by his head bone alone and does not swing, so a hat can sit on
   it. Nothing of the hat or the feather was built.

## A bug worth knowing about

For most of the stage the two halves of his head were two different browns, split at the parting. I took it for the
strand picture and changed colours and wave phases twice without fixing it. The cause was `addPart`'s `out` option: for a
closed ribbon it picked the wrong facing for about half the locks, so those were lit from underneath. `lock()` now works
out the facing itself from every triangle. After the fix a per-ring count gives 3,243 rings facing out and 1 in on `hair`,
2,409 and 9 on `hairIn`; I did not look at those 10 one by one. Colours were re-measured after the fix (the table above).
Io's `tress` uses the same `out` option; I did not check whether her hair has the same fault.

## What is rough

- **The top of his head** reads as hair combed flat from the parting, in two smooth planes. C4 has soft waves there.
- **The hairline** across his forehead is the smooth side of a lock, a hard edge, not strand tips.
- **The waves** are the right length but thinner and tidier than painted, and there are no curls at the ends. Side by
  side with C4 (`final/cmp.jpg`) the painting is plainly richer.
- **The old shell's painted texture is prettier at the back** than the new strands (`final/toggles.jpg`, first column).
  What the new hair fixes is what Chris named: the printed ear, face and collar, and the hood shape.
- **Too wide by about 1 cm** at 1.72 to 1.76 m.
- **Shadows are not as deep** as painted.
- **Close up the strands look scratchy.**
- With the hair hidden, the profile painting's own hair still shows on his temples. The new hair covers it.
- The ears' backs are plain skin colour with no painting of their own.
- `shoot.py` sometimes returns without printing the result of its setup line. I re-ran it when that happened.

## Not checked

- Movement was not watched (the headless browser is too slow). Stills and numbers only.
- Nothing was looked at on a phone. Every hair mesh passes the attribute-length check, and the new `hshade` list has its
  own check that throws if it is the wrong length.
- I did not look at every animation frame for hair through the collar, only the stills listed below.

## Pictures

All in `/home/claude/builder/work4/final/`.

| File | Shows |
|---|---|
| `head.jpg` | eight views of the head and shoulders (also as `head_f.png`, `head_q.png`, `head_s.png`, `head_b.png`, `head_s2.png`, `head_r.png`, `head_t.png`, `head_q2.png`) |
| `cmp.jpg` | C4 beside the model at one scale, front and profile, lines every 5 cm (`cmp_front.png`, `cmp_side.png`) |
| `ears.jpg` | the bare head from six sides, hair hidden: ears, plugs, glasses arms |
| `toggles.jpg` | Old hair, Blank doll, Doll, hair hidden, Blank doll with old hair, and back to new |
| `walk.jpg` | three moments of the walk, from the side, the back and the front |
| `turn_a.jpg`, `turn_b.jpg` | a head turn, a one-frame snap back, a nod, a tilt, and rest again |
| `whole.jpg` | the whole figure from four sides |
| `../facediff_f.jpg` | the face from the front before, after, and what changed |
