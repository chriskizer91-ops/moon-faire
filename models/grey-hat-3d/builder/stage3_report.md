# Stage 3 report: painted arms and chest, and a real shirt that moves

Written by the builder, November 14, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures: `/home/claude/builder/work3/final/`. Nothing was published. Git was not used. The network was not used.
The source as it was before this stage: `src_before_shirt/`.

## Read this first

- Everything in the brief is built except one optional item: **the corset is still the old trunk skin cut down to the corset**, not
  its own shell.
- Both checks pass on the final source: `python3 -I build_single.py` (exit 0) and `quick_page.py` (26 buttons, 0 errors).
- **Movement was not watched.** I stepped the clock and looked at stills. Whether the shirt looks good moving has to be judged on a
  phone or laptop.
- **On a still front view the old painted shirt still looks more like the painting than the new one does**
  (`final/new_frozen_old.jpg`: new, new frozen, old). The new shirt is real shapes, has his chest behind the lacing, and moves, but its
  ruffle is flatter and tidier and its sleeves are plainer than painted. The numbers for that are below. Please look at that picture
  before publishing.
- **One count is not zero and I am reporting my reading of it, not a proof.** In the talk move, a picture-based count finds 203 to 395
  pixels of his upper arm where cloth should hide it. A second test that does not depend on the camera finds his arm inside his sleeve
  at every point. My reading is that the arm is seen through the open end of the cuff. Details under "His arms and his sleeves".
- **One fault whose cause I did not find:** dark holes and a short dark bar in the collar's lace over each shoulder.
- **Cost:** the cloth takes about 3 ms a frame in headless desktop Chrome here. It was not measured on a phone. An attempt to halve it
  failed and was put back.

## What I built and where

| What | Where |
|---|---|
| Paint on the doll's trunk and arms | `src/N99_static.js`, the doll's material, from the line "the paint on his trunk and arms (stage 3)"; `dollArm` in `src/N45_doll.js` |
| The cloth engine | `src/N47_shirt.js`, `CLOTH` (new file) |
| The shirt's fourteen sheets and the lacing | `src/N47_shirt.js`, `SHIRT` |
| Linen and lace pictures cut from F13 | `bake_shirt.py` writes `out/tex_shirt.json`; `build.sh` joins it in |
| Shirt and lacing materials | `src/N99_static.js`, `MATS.shirt`, `MATS.lacing` |
| Old trunk skin cut down to the corset | `src/N99_static.js`, `SHIRT_CUT`, `CUT_GLSL`, and the "plain leather" line in `mkProj` |
| Leather wrist cuffs kept from the old arm skin | `src/N99_static.js`, `projCuff`, `CUFF_CUT`, `UNDER_CUFF` |
| Trouser sway | `src/N47_shirt.js`, `TR_SWAY`; two lines in `MATS.trousers` |
| Switches | `api.setOldShirt`, `api.setCloth`, `api.oldShirt`, `api.cloth`; "Old shirt" button in `viewer_n/index.tpl.html` |
| Tools | `tools/shirt_measure.py`, `tools/shirt_cmp.py`, `tools/shirt_walk.py`, `tools/shirt_through.js`; `tools/trouser_walk.py` changed |

Files changed in `src/`: `N45_doll.js`, `N99_static.js`. New: `N47_shirt.js`. Nothing else in `src/` differs from `src_before_shirt/`.
The doll's shape, his head, face, glasses, hands, hair, boots and gold dust were not touched.

**The paint.** Drawn by the material from where each point rests, so it follows him: collarbones and the notch at the neck, breastbone,
chest, nipples, belly lines, navel, spine, shoulder blades, armpits, light and dark along the arms, red at the elbows, and short dark
hairs on the chest, down the belly and on the forearms. The hairs turn into an even tint far away so they do not shimmer. With "Doll"
on, all of it shows (`final/doll.jpg`).

**The shirt.** `body`; `sleeveR`, `sleeveL` (closed tubes from the armhole seam to the band, 0.326 m down the arm); `cuffR0/1`,
`cuffL0/1` (two lace tiers each); `ruffleR0/1/2`, `ruffleL0/1/2` (three tiers each side); `collar`; and `lacing` (cord and eight
eyelets, skinned, not cloth). The old two-tier ruffles of `projRuffle` are off by default and were rebuilt as the cuff sheets.
Lace holes are a hard cut-out; nothing is blended.

## What I took from which witch

| From | What |
|---|---|
| Jester, `src/50_cloth.js` | The whole method: coarse sheets of points, links that keep their length, a target per point carried by bones, a pin per point, capsules on bones, fixed 1/120 s steps, a finer drawn surface with a fixed pattern of pleats |
| Ranger, README, the four tries at sleeves | The lesson that a sleeve must stay a closed loop round the arm with its slack on the ground side. I did not use her last fix (drawing the forearm again on top) |
| Io, README, sleeves and stage nine | Rings that slide toward the ground until the top rests on the arm (`HANG`, `headHang`); a meter for cloth inside capsules (`CLOTH.pen`) |
| Fox | Nothing copied. Her trouser flounces confirmed the Jester's engine is used for trousers there; I did not use it for his |

My own additions to the Jester's method: a leash on every loose point; a smooth curve through the points when drawing; the drawn
points pushed out of his arms as well as the simulated ones; working in his own space so he can be moved or scaled; fold shading
painted per point.

## What I measured

**Sleeve outline against B1, settled cloth, cm from his middle line (model minus painting).** `tools/shirt_cmp.py`,
`final/cmp_front.jpg`, `final/cmp_back.jpg`.

| Height (m) | Front, his right | Front, his left | Back, left edge | Back, right edge |
|---|---|---|---|---|
| 1.20 | -0.2 | +1.3 | -1.2 | +1.3 |
| 1.30 | +0.5 | +0.8 | -0.3 | +0.3 |
| 1.40 | +1.0 | -0.5 | +0.2 | -0.3 |
| 1.45 | -0.8 | +1.2 | -1.8 | +2.5 |
| 1.50 | +0.8 | -1.5 | +0.5 | 0.0 |

Within 1.5 cm at the front. At the back the sleeve heads are 1.8 and 2.5 cm too wide at 1.45 m.

**Cloth colour and fold contrast against B1, front view.** Mean colour, and in brackets the spread of brightness (how much light and
dark the folds make).

| Place | Painting | Model |
|---|---|---|
| His right sleeve | 210, 174, 150 (13.6) | 199, 164, 138 (6.9) |
| His left sleeve | 201, 166, 143 (26.7) | 210, 172, 142 (5.2) |
| Beside the ruffle, his right | 183, 150, 129 (31.3) | 187, 154, 130 (22.1) |
| On his right ruffle | 207, 167, 138 (30.9) | 193, 157, 131 (28.4) |
| On his left ruffle | 200, 164, 138 (43.5) | 199, 163, 136 (26.5) |

The colour is close. **The sleeves have a quarter to a half of the painted fold contrast**; that is the "plainer than painted" above.
In the back view the model's sleeves are darker than painted: his right 198, 161, 135 against 225, 199, 182; his left 211, 171, 146
against 225, 198, 180.

**The ruffled front.** It stands about 4 cm off the shirt's body (measured on the model: 3.9 to 5.2 cm between 1.28 and 1.40 m) and
5.5, 4.5 and 3.4 cm in front of the corset's top edge at 1.28, 1.31 and 1.34 m. From a gridded copy of B2 I read the painted one at
about 4 cm in front of the corset's edge. That reading is by eye; my attempt to measure it by script did not work (the baked side
pictures have no clean background) and I removed it. B2 shows four or five tiers; the model has three.

**The neck join**, one front view, mean colour either side of the line where his painted neck stands in the doll:

| | Neck | Doll just under it | Step |
|---|---|---|---|
| Before | 164, 105, 79 | 178, 112, 86 | 14, 7, 7 |
| Now | 164, 105, 79 | 166, 106, 81 | 2, 2, 2 |

Measured from the front only.

**Triangles.** 429,459 before, 487,453 now: 57,994 added (55,936 cloth, 2,058 lacing). The limit was about 90,000.

**Cost**, headless desktop Chrome on this machine, not a phone: the cloth step 3.08 ms a frame; the model's whole frame 3.15 ms with
cloth and 2.39 ms frozen. 1,947 simulated points. Laying the cloth afresh after `pose()` took 64 ms (timed before the trouser sway
was added).

## His arms and his sleeves

How it is kept: the sleeve is a closed tube pinned at both ends; its targets always enclose the arm; every loose simulated point is
pushed out of the arm's capsules at the end of each step; and the drawn points are pushed out too.

`tools/shirt_walk.py`, final run (`final/walk_final.txt`):

| Test | Walk (8 moments) | Idle (2) | Talk (2) |
|---|---|---|---|
| Doll seen where shirt should be, pixels summed over eight sides | 0 | 0 | 395 and 203 |
| Drawn cloth points inside an arm capsule | 0 | 0 | 0 |
| Arm points outside the sleeve, by rays (1,185 tested each arm, 8 moments in all) | 0 | 0 | 0 |

Checks on the ray test itself: with every tested point first moved 8 cm out from the arm it reports all of them outside (392 of 392,
400 of 400); moved 2 cm out, some (146, 154).

**The talk pixels.** The pixel count marks the doll's arm pink down to 0.30 m; the band is at 0.326 m. In talk the forearm points at
the camera. I drew the cloth's inner faces in other colours (`work3/elbow.jpg`): the pink crescent sits inside the cuff's open end and
is bordered mostly by the cuff's inner face, the sleeve's inner face and the rest of the arm. Some of its border (78 of 574 pixels in
one view) is the cloth's outer face, which I cannot fully explain from the picture. Together with the ray test I read it as his elbow
seen up the open cuff, not arm through cloth. With the pink limit moved to 0.24 m the count is 0 in every move (`final/walk24.txt`).
I had loosened that limit earlier in the work, which hid this; I put it back to 0.30 so the report shows the stricter number.

**Two faults found and fixed on the way:** a hairline slit down each sleeve where the fold pattern did not meet itself round the tube;
and the drawn curve dipping up to 5 mm into a folded elbow.

**The leash.** Loose sleeve points go up to 14.6 mm past their leash. In the walk, idle and talk moments the worst such point was
lying on the arm (gap 0.0 mm): the arm's push comes after the leash and wins, on purpose. The body, ruffles, cuffs and collar touch no
capsule and stayed inside their leashes (0.0 over). My first comment in the code claimed the leash alone meant the doll could never
show; that was wrong for the sleeves and I rewrote it.

**Same every run, no explosion.** The page loaded afresh twice and the same moves played: the same sum both times. After a turn of 2.5
radians in one frame, a 10 m move in one frame, one frame 30 seconds long, a jump from talk to the A pose, and 20 seconds of walking:
no bad numbers; furthest past a leash 7.5 to 12.9 mm. For those I did not print whether the point was on the arm.

## Trousers

They sway a little. They are not cloth: they are still the skinned garment of stage 2. Each leg has two springs (thigh, knee); the
lag of a spring moves the trousers' points in the material, scaled by the room between cloth and leg, with nothing at the waist, the
gathered bottom or the middle seam. In the walk the lag reached 5.5 mm at the thigh and 10.3 mm at the knee, never the 20 mm cap; in
idle 0.1 mm.

`tools/trouser_walk.py` with the sway given to its stand-in cloth: 0 pixels of doll in front of cloth in walk, idle and talk. With the
sway made eight times too big it finds 1,338 to 5,654 pixels in four walk moments, so the test can see the fault. The holes are a mask
in the cloth's own coordinates and were not changed; I did not re-run the hole measurements of stage 2.

## Switches

Nine states were pictured (`final/states.jpg`, `final/states_close.jpg`): default, old shirt, old trousers, both old, doll, blank
doll, blank doll with doll, and two round trips. The round trip through doll, old shirt on and off, doll off gives the default picture
exactly (0 pixels differ). The round trip that ends with the old shirt on gives the old-shirt picture exactly.

## What I decided and why

- **Corset left as the old skin.** A fitted shell was optional and the shirt was not yet as good as the painting; time went there.
- **The sleeve is kept out of his arm only, not his trunk.** With both, points in the armpit were pushed out of one and then the
  other and tore a hole. Under the arm the sleeve runs into the body of the shirt.
- **Wrist cuffs kept as a piece of the old arm skin**, with the doll not drawn under them when he is dressed, because the doll came
  through the cuff in patches when the wrist bent.
- **Step stays at 1/120 s.** At 1/60 every loose piece sagged to the end of its leash and it saved only a tenth.
- **Trousers by springs, not cloth.** Making them cloth would have risked the holes.
- **Linen tone** set by comparing pictures of the model with B1, not from B1's pixel values.

## Things I got wrong and corrected

- The neck shade first made the join worse (step 18 instead of 14): I had written a `smoothstep` with its edges the wrong way round,
  which is undefined in GLSL, and darkened the wrong way. I searched the source for any other reversed `smoothstep` with plain numbers:
  none, and none before this stage.
- A note in the code said the painted ruffle stands 6 to 8 cm off his chest. That was the width of the fan seen from the side. Fixed.

## What is rough

- The ruffled front: three tiers, flatter and tidier than painted.
- The sleeves: plainer than painted (numbers above); sleeve heads 2 cm wide at the back.
- A square step in the cloth at each top corner of the open front, by his neck.
- The collar's lace over each shoulder: a few holes show dark, with a short dark bar at the hem (`work3/k4.jpg`). It stays with the
  old hair skin hidden, with the shirt's body hidden, and with the collar's shadow off. Cause not found.
- The wrist cuffs' top edge is uneven.
- The old hair skin still has the old collar painted on it. That is the hair stage's.
- Low detail (`detail: 0.5`, `0.75`) builds and runs without bad numbers; I did not look at a picture of it.
- The page notes list these in plain words.

## Pictures

- `final/new_frozen_old.jpg`: new shirt, cloth frozen, old painted shirt, same view
- `final/dressed_whole.png`, `final/turn.jpg`: front, side, back
- `final/close.jpg`: chest and lacing, both forearms
- `final/doll.jpg`: the painted doll, front, back, arm
- `final/cmp_front.jpg`, `final/cmp_back.jpg`: painting, model, outlines overlaid, with a metre grid
- `final/shirt_walk_stills.jpg`, `final/shirt_idle_talk_stills.jpg`, `final/shirt_sleeve_stills.jpg`: stills through the moves
- `final/trouser_walk_stills.jpg`: taken before the last change to the linen's tone
- `final/states.jpg`, `final/states_close.jpg`: the nine switch states
- `work3/elbow.jpg`: the talk pixels with the cloth's inner faces coloured
