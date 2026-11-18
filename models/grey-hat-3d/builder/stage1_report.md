# Stage 1 report: the blank doll under Noiz's clothes

Written by the builder, November 13, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures: `/home/claude/builder/work/final/`. Nothing was published. Git was not used.

## In short

- He now has a man's body under his clothes: one smooth skin from the foot of his neck to his feet, 52,832 triangles,
  skinned to his own skeleton.
- `api.setDoll(true)` (and the new "Doll" button on the page) hides the old clothes-shaped skin and shows the doll with
  his head, hair, glasses and hands. Off is the default.
- Both closing checks pass: `build_single.py` made `deliver/Noiz_3D_stage1.html`, and `quick_page.py` pressed all 23
  buttons (the new one included) with 0 errors.
- Four things you should know before telling Chris it is done (details further down):
  1. With the doll off he is **not identical to the last pixel** to the build before. 6 to 12 pixels per test picture differ.
  2. The **tops of the doll's shoulders stick out of the OLD shirt skin** by up to 2.4 cm. It never shows today, because a
     doll region is only drawn where the old skin over it is off. It matters for stage 3.
  3. The **scale of painting B5 was my decision** (900 px per metre). B5 has no whole figure to take a scale from.
  4. The body skin is a **flat orange-tan**. It is near the tone of his neck, but it looks flatter and more orange than
     his painted face. I did not tune it further.
- Movement was **not watched**. Poses were checked as still pictures only.

## What I built, and where

| File | What changed |
|---|---|
| `src/N45_doll.js` (new) | The doll: its tables (trunk, neck, leg, arm, foot), the soft solid they describe, the skin cut from it, bone weights, skin tone per point. |
| `src/N30_body.js` | Only the mesh names: the old skin's trunk, legs and boots now go to `projTrunk`, `projLegs`, `projBoots` (they were one mesh, `proj`). No shape was changed. |
| `src/N99_static.js` | The doll's material; the cut into regions; `setDoll`, `doll`, `setOldSkin`, `oldSkin` on the api; `debug.doll` and `debug.armAt`. The check that every list is as long as the list of points is kept, and a second check was added (no triangle may name a point that is not there). |
| `build.sh` | `N45_doll.js` added to the list, after the glasses. |
| `viewer_n/index.tpl.html` | One new button, "Doll", in the "Show" row; one sentence in the intro; one short note for Chris headed "New: the doll under his clothes". |
| `tools/doll_measure.py` (new) | Measures B5, B3 and D3. Prints tables, writes `out/doll_measure.json`. Run with `python3 -I`. |
| `tools/doll_check.py` (new) | Doll against those numbers; room inside the old skin; mesh lists and triangle count. |
| `tools/doll_cmp.py` (new) | Doll beside a painting with the outlines laid over each other (`b5front`, `b5side`, `b5back`, `b3front`, `b3side`, `b1front`). |
| `README.md` | A new section at the top for this stage, and one row in the folder table. |
| `src_before_doll/` | The source as it was before I touched anything. |

Not touched: head, face, hair, glasses, hands, gold dust, sleeve ruffles, moves, the shape of the old skin.

### How the doll is made (and how that differs from the Ranger's)

I read the Ranger's body code (`R30_body.js`, `R05_tables.js`) and rendered her bare. Her doll is separate tubes (trunk, two
arms, two legs) pushed into each other. Bare, the joins show: bands on the legs, arms that sit on the shoulders like
pegs. Her clothes hide that. His doll has to look right bare, so I kept **her way of writing a body down** (tables of half
width, front and back by height; width and thickness along the arm) and **her bone weights** (spine, shoulder girdle, elbow,
wrist, knee, through his existing `wTrunk`, `wArm`, `wBoot`), but the tables describe **one soft solid** whose parts are
blended where they meet. The skin is then found on a 9 mm grid and cut into triangles. That is the method her hands (and his)
already use. So shoulder, armpit, crotch and neck are one piece of skin with no joins.

This is a real departure from "copy her body builders". I judged it necessary for "looks good as a blank doll". Say so to
Chris if he asks whether it is "the witch's doll": it is her tables and weights, not her tubes.

### Regions, ready for the later stages

| Region | Old skin mesh | Doll mesh under it |
|---|---|---|
| trunk (waist line 1.06 m and up) | `projTrunk` | `dollTrunk` |
| hips (below 1.06 m) | `projHips` | `dollHips` |
| legs | `projLegs` | `dollLegs` (whole legs and feet) |
| boots | `projBoots` | none (the doll's feet are inside) |
| arms | `projArm` | `dollArms` |
| ruffles | `projRuffle` | none |

`api.setOldSkin({ legs: false, hips: false })` switches regions of the old skin off; the doll shows only under those.
The four doll meshes share one list of points, so no seam shows between them. The 1.06 m waist line is one constant
(`OLD_WAIST` in `N99_static.js`); stage 2 may want it elsewhere. `debug.doll.F(x, y, z)` gives the doll's solid (negative
inside), so a garment can ask how far it is from the skin.

## What I measured

All from `tools/doll_measure.py` and `tools/doll_check.py`. The full printout is `final/doll_check.txt`. Metres.

### Hips and seat against B5 (painting less 3 mm for the cloth of the shorts)

| Height | Half width painted | doll | Front painted | doll | Back painted | doll |
|---|---|---|---|---|---|---|
| 1.037 | 0.141 | 0.143 | +0.101 | +0.104 | -0.076 | -0.078 |
| 0.992 | 0.155 | 0.156 | +0.102 | +0.106 | -0.108 | -0.105 |
| 0.946 | 0.167 | 0.168 | +0.107 | +0.108 | -0.118 | -0.114 |
| 0.900 | 0.174 | 0.176 | +0.108 | +0.110 | -0.097 | -0.098 |
| 0.861 | 0.174 | 0.178 | +0.108 | +0.111 | -0.079 | -0.078 |

Largest difference: 4 mm.

### One leg against B5

| Height | Width painted | doll | Front painted | doll | Back painted | doll |
|---|---|---|---|---|---|---|
| 0.780 (thigh) | 0.166 | 0.165 | +0.102 | +0.105 | -0.082 | -0.079 |
| 0.659 | 0.133 | 0.132 | +0.078 | +0.080 | -0.078 | -0.076 |
| 0.538 (knee) | 0.114 | 0.114 | +0.057 | +0.059 | -0.073 | -0.072 |
| 0.486 | 0.104 | 0.105 | +0.030 | +0.037 | -0.088 | -0.087 |
| 0.414 (calf) | 0.117 | 0.117 | +0.015 | +0.015 | -0.108 | -0.108 |
| 0.366 | 0.098 | 0.097 | +0.004 | +0.004 | -0.099 | -0.100 |

Widths agree within 1 mm. The front of the leg just below the knee is 6 to 7 mm fuller than painted (0.46 to 0.49 m).
**Where the leg stands** does not follow B5: B5's legs are 0.5 to 2 cm closer to his centre line than his skeleton's
(feet apart). The doll follows the skeleton. `doll_cmp.py` poses the legs 1.6 degrees closer for the B5 overlays.

Outline overlays (share of the painting's area between 0.353 and 1.065 m):

| View | Both | Painting only | Doll only |
|---|---|---|---|
| B5 front | 0.975 | 0.025 | 0.035 |
| B5 side | 0.991 | 0.009 | 0.020 |
| B5 back | 0.971 | 0.029 | 0.034 |
| B3 front (clothed: doll must be inside) | 0.708 | 0.292 | 0.007 |
| B3 side (clothed) | 0.738 | 0.262 | 0.018 |
| B1 front (clothed) | 0.722 | 0.278 | 0.007 |

On the clothed overlays the "doll only" blue is at the hands and a sliver of hair, not on the body, as far as I could see
in the front views. I did not open the B3 side or B5 back overlays to look; I only read their numbers.

### Trunk against B3 (in shirt and trousers; the doll must be inside)

| Height | Half width clothed | doll | Front clothed | doll | Back clothed | doll |
|---|---|---|---|---|---|---|
| 1.06 | 0.161 | 0.142 | +0.131 | +0.104 | -0.116 | -0.075 |
| 1.16 | 0.182 | 0.139 | +0.155 | +0.103 | -0.143 | -0.076 |
| 1.28 | arms in the way | 0.160 | +0.171 | +0.119 | -0.156 | -0.099 |
| 1.36 | arms in the way | 0.171 | +0.158 | +0.112 | -0.180 | -0.108 |
| 1.44 | arms in the way | 0.225 | +0.113 | +0.066 | -0.196 | -0.102 |

The shirt is loose, so B3 only gives an outer limit above the waist. The chest, back and upper arms are **not measured
from anything**: they are a slim man of his size, kept inside B1 and B3.

### Arm

| From the shoulder | Across, from the front | Across, from the side |
|---|---|---|
| 0.08 | 0.094 | 0.098 |
| 0.20 | 0.085 | 0.090 |
| 0.285 (elbow) | 0.074 | 0.079 |
| 0.36 | 0.076 | 0.079 |
| 0.465 | 0.063 | 0.058 |
| 0.52 (wrist) | 0.052 | 0.042 |

B3 paints the bare forearm 0.070 across at 0.46 from the shoulder; the doll is 0.064 there. I made it 6 mm slimmer than
painted so it stays inside the forearm of the old skin. D3 gives the wrist 0.0555 across.

### Him against the Ranger

| | Ranger (her table) | His doll |
|---|---|---|
| Hips, half width at the widest | 0.187 | 0.178 |
| Waist, half width at the narrowest | 0.102 | 0.139 |
| Chest, half width at the widest | 0.160 | 0.171 |
| Hips minus waist (half widths) | 0.085 | 0.039 |
| Shoulder joint out from the centre line | (not read) | 0.196 |

So: narrower hips, a much straighter waist, a wider chest, and no bust. I did not measure her arms or neck in numbers,
so "thicker arms and wrists than hers" is by eye from the side-by-side picture only (her wrist is 4.7 cm in her own
code comment; his is 5.2).

### Inside his old clothes? (`doll_check.py`, at rest)

| Region | Points | Poking out | Least room |
|---|---|---|---|
| hips and seat | 3177 | 0 | +2.3 mm |
| waist | 3270 | 0 | +6.9 mm |
| leg above the boot | 6303 | 0 | +3.4 mm |
| in the boot | 4554 | 0 | +6.3 mm |
| forearm and wrist | 2144 | 56 | -1.4 mm |
| chest and back | 2636 | 42 | -11.6 mm |
| foot of the neck | 1093 | 86 | -12.1 mm |
| upper arm | 2976 | 106 | -21.8 mm |
| shoulders | 1181 | 400 | -23.7 mm |

### Mesh

27,531 points, 52,832 triangles (trunk 13,408, hips 4,824, legs 24,380, arms 10,220). Lists: position, normal, uv,
skinIndex, skinWeight, color; none of the wrong length. Whole model 397,799 triangles (it was 344,967). It builds in about
1.5 seconds in the headless browser (about 1.0 before).

## What I decided, and why

1. **One blended solid, not her tubes.** See above. Her tubes show their joins when bare.
2. **B5 at 900 px per metre.** Its three cues disagree: 780 makes its boots the size of B1's (hips then 0.41 m, wider than
   his baggy trousers); 850 puts the top of the shorts where B3 has the top of his trousers; 930 puts its knee on his
   skeleton's knee. I first built at 850, found the hips looked wide for a man, and moved to 900, between the two cues that
   come from his body. So B5 gives the **shape** of his hips and legs; their **size** is this choice. One number
   (`S5` in `doll_measure.py`) changes it, but the tables in `N45_doll.js` are set by hand and would need rescaling too.
3. **Heights from his skeleton, not from B5's scale.** B5's lower legs are drawn long. Each landmark of B5 (waist, widest
   hip, crotch, knee, widest calf, boot top, ankle) is put at the height that landmark has on his skeleton.
4. **Shoulders follow the shirt line in B1 and B3 (about 1.45 to 1.46 m over the joint), not the old trunk skin.** The old
   trunk dips there and leaves the top of the shoulder to its sleeves. A body cut to fit inside it had a notch between
   neck and arm. That is why the shoulders poke out of the old skin.
5. **The neck that shows is the one he already had.** The doll's neck runs up 4 mm inside it, hidden. So his neck was not
   made thicker; the brief asked for a thicker neck than hers and I did not compare the two in numbers.
6. **Plain skin, no paint.** B5 is covered in fishnet and B3 shows no bare body, so there is no clean paint to lay on.
   The colour runs point by point from his neck tone (trunk, legs, upper arms) to his hand tone (toward the wrists).
7. **A doll region is drawn only where the old skin over it is off.** Under the old skin it could not be seen anyway, and
   at the shoulders it would poke through.
8. **Small shapes kept shallow:** a little chest, breastbone and spine furrow, shoulder blades, seat with a cleft,
   kneecap. Each is a few millimetres. No navel, nipples, collarbones, ribs or muscle lines.

## What is rough or unfinished

- **Not pixel-identical with the doll off.** The brief says he must look exactly as he does today. Against pictures taken
  before I started, 6 to 12 pixels of 630,000 differ per view (front, three-quarter, back, clay), by 1 to 12 levels of
  255; the side view is identical. Most are near his crotch. Two runs of the new build give identical pictures, so it is a
  real, tiny, steady difference. My guess is draw order, since the old trunk is now its own mesh; I did not prove it.
  I could not see it by eye.
- **Shoulders outside the old shirt skin** (table above). Stage 3's shirt must be cut over the doll's shoulders, not over
  the old trunk's.
- **Armpit with the arms straight out (90 degrees):** a soft crease and a slightly pinched fold under the arm
  (`final/armpit_arms_out_close.jpg`). Arms down and at rest look clean to me.
- **Dark blotches on the back of the bent calf in one walk still** (`final/walk_legs_close.jpg`, left). They went away
  when I switched shadows off, and the surface directions there are smooth, so I take them for shadow artefacts of the
  renderer, not folds. I do not know whether a phone shows them.
- **An edge behind the raised shoulder in the talk still from the side** (`final/talk_idle_stills.jpg`, middle). I did not
  find out what it is.
- **Skin colour:** flat and a bit orange beside his painted face and gloved hands (`final/doll_skin_sheet.jpg`).
- **Something pale and cloth-like shows behind his neck under the hair** when the doll is on (side and back views of the
  same sheet). I believe it is the old hair mesh carrying shirt paint, which the shirt used to hide. I did not check, and
  I was told not to change the hair. Stage 5 should deal with it.
- **Feet** are three soft lumps made to sit inside the boots; bare they look like socks. With the doll on, he stands
  4.8 cm above the floor (his soles are where the boot's insole is) and the gold dust still plays round his bare feet.
- **The uv on the doll** (part number plus distance round, metres along) is there for a later stage but is untested: nothing
  uses it yet.
- **The page's own words** still say "first build" in the small heading and the counter; I only added the button, one
  sentence and one note.
- **Motion was not watched.** I looked at stills: rest, arms down, arms out, two moments of the walk, one of talk, one of
  idle. In those, shoulders, elbows, hips and knees bend without tearing or collapsing. Whether it moves well I cannot say.
- **The phone:** not tested on one. What I can say is that every list on every mesh is as long as its list of points
  (the model throws otherwise), and the page's buttons all press without errors in the headless browser.

## Pictures (all in `/home/claude/builder/work/final/`)

| Shows | File |
|---|---|
| Front, three-quarter, side, back three-quarter, back, in skin | `doll_skin_sheet.jpg` (singles: `skin_front.png`, `skin_q.png`, `skin_side.png`, `skin_qb.png`, `skin_back.png`, `skin_top.png`, `skin_low.png`) |
| The same as clay, plus from above and below | `doll_clay_sheet.jpg` (singles `clay_*.png`) |
| Beside the paintings, with outlines overlaid | `cmp_b5front.jpg`, `cmp_b5side.jpg`, `cmp_b5back.jpg`, `cmp_b3front.jpg`, `cmp_b3side.jpg`, `cmp_b1front.jpg` |
| Beside the Ranger's doll, same scale (hers left of his, four views; his hair is hidden, his glasses are still on; her boots are hidden, so her legs end at the shin) | `beside_ranger.jpg` |
| Mid-walk | `walk_side.png`, `walk_stills.jpg` (two moments, three views each) |
| Talk and idle | `talk_idle_stills.jpg` |
| Arms out, arms down | `armsout_front.png`, `armsdown_front.png` |
| Rough spots | `armpit_arms_out_close.jpg`, `walk_legs_close.jpg` |
| Regions switched one at a time (legs and hips off; then trunk, arms, ruffles off) | `regions_preview.jpg` |
| The page at phone size with "Doll" pressed | `page_doll.jpg` |
| The full check printout | `doll_check.txt` |

## How to run it again

```
cd /home/claude/moon-faire/models/grey-hat-3d
python3 -I tools/doll_measure.py        # paintings -> tables and out/doll_measure.json
./build.sh
python3 tools/doll_check.py             # doll against the numbers, room in the old skin, mesh lists
python3 tools/doll_cmp.py /tmp/x.jpg b5front
python3 -I build_single.py && python3 /home/claude/npc/work/quick_page.py
```

To go back to before this stage: copy `src_before_doll/*` over `src/`, delete `src/N45_doll.js`, and take
`src/N45_doll.js` out of the list in `build.sh`. The page template's "Doll" button would then need removing too.
