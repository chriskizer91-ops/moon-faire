# Stage 2 report: painted legs and real trousers with real holes

Written by the builder, November 14, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures: `/home/claude/builder/work2/final/`. Nothing was published. Git was not used. The network was not used.

## In short

- The doll's legs are painted: skin that matches his face and hands, leg shading, and black fishnet tights. The whole doll's
  skin is less orange than in stage 1.
- His trousers are their own cloth over the doll: 31,660 triangles, baggy, gathered into the boots, going up under the corset.
- There are eleven real holes: six on his left leg, five on his right, placed from B1 and B2. Where there is a hole there is no
  cloth and you see the fishnet leg. Edges are frayed. The inside of the cloth is darker.
- By default he wears the new trousers. "Old trousers" puts the old painted leg skin back. "Doll" strips him. "Blank doll" works
  in every state.
- Both end checks pass: `python3 -I build_single.py` and `python3 /home/claude/npc/work/quick_page.py` (25 buttons, 0 errors).
- **Not seen moving and not seen on a phone.** Everything below is from still pictures made by the headless test browser.
- **The weakest thing:** seen straight from the side, most holes are thin slivers at the front edge, not the open ovals B2 paints.
  From the front and from three-quarter views they read well. The reason is in "What I decided".

## What I built and where

| Thing | Where | How |
|---|---|---|
| Doll's skin tone | `src/N45_doll.js`, `DOLL_SKIN` | Its own colour now (`#b9735c`). It still runs into the neck's tone at the neck and the hands' tone at the wrists. |
| Leg shading | `src/N45_doll.js`, `legShade` | Painted per point: kneecap, dip under it, shin, calf, hollow behind the knee, inner thigh, ankle. Subtle. |
| Fishnet | `doll` material in `src/N99_static.js` | Drawn by the material, not a picture. Placed by where each point rests on its leg (`dollLeg`), so it cannot swim. Each thread is worked out as the share of the pixel it covers, so it fades evenly with distance. Solid black above a briefs line (as B5's shorts) and below the ankle. |
| Trousers shape | `src/N46_trousers.js` | Two legs of rings, joined on his centre line. Outline taken from the old skin's tables (measured off B1 and B2). Gathers at hem and waist, soft folds, hem pouched over the boot rim and tucked in, top drawn 8 mm in so it goes under the corset. Top is at 1.115 m (the corset's edge is at 1.00 to 1.08 m). |
| Holes | `TR_SEEN`, `TR_MASK` in `src/N46_trousers.js` | One code-drawn picture says cloth or no cloth. The cloth's material throws away pixels with no cloth (hard cut, alpha test style, no blending). The same picture paints the frayed band and loose threads, so a hole in the paint is always a hole in the cloth. |
| Slack | `slackAt` in `src/N46_trousers.js` | Down the strip of holes the cloth hangs in most of the way toward the leg (88 % of the way to a line 17 mm off the skin; never nearer than 9 mm). Without this a hole in a wide trouser leg shows mostly darkness. |
| Cloth paint | `bake_cloth.py`, `trousers` material | One repeating square cut from F8 (the hole's corner mended from another repeat), recoloured to B1's tones, 11.5 cm a repeat. Laid on by distance round the leg and height: crisp at the sides. No legs or net in it. Inside faces are drawn darker. |
| Movement | `DOLL.wAt` in `src/N45_doll.js` | The cloth uses the bone weights the doll's skin has at the same place (the corset's weights above 0.99 m). No cloth simulation. |
| Corset join | `CORSET_CUT` in `src/N99_static.js` | The old hips skin is kept, but its pixels below the corset's painted bottom edge are thrown away, so the trousers show from the edge down. |
| Switches | `showSkins`, `setOldTrousers` in `src/N99_static.js` | `api.setOldTrousers(true)`, `api.oldTrousers`. Page: "Old trousers" in "Show", and a new view "Close on the holes". |
| Shadow and clay | `src/N99_static.js` | The trousers' shadow material and the "Blank doll" clay use the same hole picture. |
| Page notes | `viewer_n/index.tpl.html` | "New: real trousers" replaces "New: the doll under his clothes". Other blocks kept. |
| README | `README.md` | New section "Stage 2 of the rebuild: painted legs and real trousers", and a row in the folder table. |
| Tools | `tools/trouser_measure.py`, `trouser_cmp.py`, `trouser_walk.py`, `trouser_check.py` | Measure the paintings; model beside painting with a grid; walk stills and poke-through count; skin tones. |
| Before copy | `src_before_trousers/` | The source before this stage. |

Every list on the trousers and on the doll is as long as its list of points (checked on all meshes: none wrong).

## What I measured

### The holes in the paintings (metres; `tools/trouser_measure.py`, same rule as `tools/trouser_cmp.py`)

B1 front, his left leg is +x. "Wide x tall" is the box round the skin that shows.

| Leg | Hole | B1: x, height | B1: wide x tall | B2: z (forward +), height | B2: wide x tall |
|---|---|---|---|---|---|
| Left | 1 | +0.148, 0.865 | 0.064 x 0.097 | +0.069, 0.905 | 0.065 x 0.102 |
| Left | 2 | +0.153, 0.764 | 0.079 x 0.094 | +0.066, 0.800 | 0.064 x 0.084 |
| Left | 3 | +0.153, 0.668 | 0.079 x 0.087 | +0.061, 0.702 | 0.060 x 0.084 |
| Left | 4 | +0.153, 0.582 | 0.070 x 0.072 | +0.052, 0.612 | 0.059 x 0.074 |
| Left | 5 | +0.155, 0.508 | 0.072 x 0.064 | +0.040, 0.532 | 0.062 x 0.062 |
| Left | 6 | +0.159, 0.437 | 0.057 x 0.047 | +0.019, 0.461 | 0.060 x 0.060 |
| Right | 1 | -0.129, 0.756 | 0.084 x 0.059 | +0.079, 0.810 | 0.059 x 0.065 |
| Right | 2 | -0.143, 0.669 | 0.087 x 0.055 | +0.069, 0.721 | 0.064 x 0.062 |
| Right | 3 | -0.148, 0.590 | 0.077 x 0.059 | +0.060, 0.636 | 0.064 x 0.064 |
| Right | 4 | -0.156, 0.514 | 0.070 x 0.052 | +0.049, 0.550 | 0.057 x 0.065 |
| Right | 5 | -0.164, 0.447 | 0.059 x 0.037 | +0.034, 0.466 | 0.064 x 0.052 |

B1's back view has no holes; the model has none at the back. B2 shows every hole 2 to 5.5 cm higher than B1 does.

### The model's holes against B1, front view (`final/beside_front.txt`)

"Opening" is the gap in the cloth itself, measured with the cloth drawn alone.

| Leg | Hole | Painting x, height | Model x, height | Painting wide x tall | Model wide x tall | Painting area cm2 | Model area cm2 |
|---|---|---|---|---|---|---|---|
| Right | 1 | -0.129, 0.756 | -0.146, 0.757 | 0.084 x 0.059 | 0.092 x 0.062 | 34.7 | 33.7 |
| Right | 2 | -0.143, 0.669 | -0.151, 0.670 | 0.087 x 0.055 | 0.074 x 0.055 | 32.3 | 24.0 |
| Right | 3 | -0.148, 0.590 | -0.157, 0.593 | 0.077 x 0.059 | 0.067 x 0.059 | 30.9 | 25.3 |
| Right | 4 | -0.156, 0.514 | -0.161, 0.514 | 0.070 x 0.052 | 0.057 x 0.055 | 25.2 | 21.4 |
| Right | 5 | -0.164, 0.447 | -0.168, 0.447 | 0.059 x 0.037 | 0.044 x 0.037 | 14.5 | 10.0 |
| Left | 1 | +0.148, 0.865 | +0.157, 0.862 | 0.064 x 0.097 | 0.065 x 0.111 | 40.5 | 37.6 |
| Left | 2 | +0.153, 0.764 | +0.164, 0.758 | 0.079 x 0.094 | 0.069 x 0.109 | 41.4 | 35.8 |
| Left | 3 | +0.153, 0.668 | +0.161, 0.663 | 0.079 x 0.087 | 0.059 x 0.099 | 40.0 | 32.5 |
| Left | 4 | +0.153, 0.582 | +0.166, 0.576 | 0.070 x 0.072 | 0.045 x 0.082 | 29.1 | 21.6 |
| Left | 5 | +0.155, 0.508 | +0.166, 0.505 | 0.072 x 0.064 | 0.054 x 0.070 | 27.5 | 19.6 |
| Left | 6 | +0.159, 0.437 | +0.170, 0.435 | 0.057 x 0.047 | 0.049 x 0.054 | 18.9 | 14.8 |

From the front: heights within 6 mm; every hole sits 4 to 17 mm further out than painted; areas are 3 to 31 % smaller.
In the model's holes less leg shows than in B1 (the outer part of a hole shows the dark inside of the cloth). The tool's
"leg %" column puts that at 0 to 78 %, but its skin rule misses leg seen at a steep angle under dense net, so the true
share is higher than it prints. I did not measure it a better way.

From the sides (`final/beside_sideL.txt`, `beside_sideR.txt`): only the top two holes of his left leg (35.5 and 20.4 cm2,
against 42.2 and 34.9 painted, and 1.5 to 4 cm lower, because heights are B1's) and the top one of his right leg (3.8 cm2
against 27.3) are open enough to measure. The rest are slivers.

### The trouser outline against the paintings (model minus painting, mm, at 13 heights from 0.41 to 1.00 m)

| View | Edge on the left of the picture | Edge on the right |
|---|---|---|
| Front (B1) | +0 to +13 | -10 to +3 |
| Back (B1) | +2 to +17 | -7 to +12 |
| His left side (B2) | -3 to +10 | -5 to +12 |
| His right side (B2) | -2 to +7 | -12 to +0 |

The largest misses are at 0.45 to 0.55 m, where the painted leg balloons most.

### The fishnet (cm; nearest repeats of the net)

| Where | Diamond wide x tall |
|---|---|
| B1, in two holes | 1.3 x 2.1 and 1.5 x 2.1 |
| B5, bare legs, five patches | 2.2 to 3.2 x 2.4 to 3.4 |
| F8 (no scale of its own) | wide : tall = 1 : 1.3; by the scale of its cloth, 2.3 x 2.9 |
| Model | about 1.5 x 2.4 round the knee and calf, 1.8 x 2.4 at the top of the thigh (26 diamonds round a leg); thread 2.4 mm |

### The cloth

| Thing | Painting | Model |
|---|---|---|
| Flowers apart (nearest) | 7.7 to 8.5 cm in B1's back view | 8.1 cm (one repeat is 11.5 cm and holds two flowers) |
| F8's repeat | 418 px, three across and three down | one repeat, mended, 512 px |
| Colour, front top (mean; dark part; red part) | 75 32 35; 43 36 38; 128 30 36 | 74 36 39; 44 37 39; 122 34 38 |
| Colour, back seat | 61 26 30; 34 29 30; 104 26 32 | 70 31 36; 41 33 36; 117 29 35 |

### Skin (one test picture of the doll; `tools/trouser_check.py`)

| Patch | R G B | R/G | R/B |
|---|---|---|---|
| Painted forehead | 189 119 93 | 1.59 | 2.03 |
| Painted lit cheek | 172 108 88 | 1.59 | 1.95 |
| Painted fingers | 165 98 85 | 1.68 | 1.94 |
| Doll chest, stage 1 | 189 122 95 | 1.55 | 1.99 |
| Doll chest, now | 178 110 93 | 1.62 | 1.91 |
| Doll thigh between threads, now | 163 100 83 | 1.63 | 1.96 |

### The corset's bottom edge (read by eye off enlarged, gridded copies; not measured by a script)

| Painting | Edge height |
|---|---|
| B1 front | 1.00 m at the middle, rising to 1.05 at the sides (a V) |
| B1 back | 1.03 to 1.05 m |
| B2 sides | about 1.08 m at the side seam |

### Movement and switching

- `tools/trouser_walk.py`: cloth drawn solid white with holes closed, doll pink, eight moments of the walk and two each of idle
  and talk, from eight sides. Pink pixels (doll in front of cloth): **0 in all 96 pictures.** With the trousers hidden the same
  picture has 55,437 pink pixels, so the test does see the doll.
- With "Old trousers" pressed, the front, side and back pictures match the build before this stage to 0, 0 and 2 pixels.
- With the new trousers, above 1.10 m 2 to 3 pixels differ from before. Below 0.40 m 860 to 1,271 pixels differ; I take that
  to be the new hem sitting on the boot tops, but did not prove it.

## What I decided, and why

1. **Where each hole sits.** B1 paints every hole face on from the front. B2 paints the same holes face on from the side.
   Worked by hand for one hole (left leg, third down) as angles round the leg: B1 puts it from about 5 degrees inside the
   front to 38 degrees round; B2 puts it from about 37 to 74 degrees round. They do not overlap. I did not work the others
   out this way, but their numbers are alike. I put each hole on the front-outer quarter, nearer B1 (weights 0.62 right leg,
   0.55 left), and made each a quarter to two fifths longer and about a seventh wider than painted, so that it wraps. B1 is the main painting and the
   front and three-quarter views are what Chris opens on. The cost is the side view.
2. **Heights from B1.** B2 has the holes and the corset edge higher. The rest of him is built on B1.
3. **Slack cloth at the holes.** Not in the paintings as such, but B1 shows a full leg in every hole, and a balloon of cloth
   cannot do that. The dent this makes is part of why holes hide from the side: cloth further round stands in front of them.
4. **Net size.** The paintings disagree by almost two to one. I used B1's width and went a little taller, toward B5 and F8.
5. **Net as drawn threads in the material**, not a picture: sharp close, no fine-line shimmer far off, cannot slide on the leg.
6. **Solid black briefs** at the top of the tights, as B5 shows black shorts. They are under the trousers and only show in "Doll".
7. **Holes by throwing pixels away**, not by leaving triangles out: the ragged edge can be finer than the mesh, and the paint
   and the hole can never disagree. It is a hard cut; nothing is blended or sorted.
8. **The old hips skin stays, cut at the corset edge**, because the corset is still part of the old skin and dips in front.
9. **Cloth repeat 11.5 cm**, between F8 scaled by B1's flower spacing (12.5) and B1's own repeats.
10. **Doll skin colour** set by the R/G and R/B of his painted face and fingers (table above).

## What is rough, and what I did not check

- **Motion was not watched.** Stills only. The cloth is skinned to the legs: it will not swing, lag or flap.
- **Not tested on a phone.** The net uses screen-space derivatives (asked for as an extension for older phones) and both new
  materials throw pixels away. These are ordinary, but I only saw them in the headless browser.
- **Shimmer at a distance** was judged from single stills at 2 m and 6 m (the net fades to an even tone). Shimmer is a moving
  fault, so this is not proof.
- **Side views do not match B2**, as above.
- **Less leg shows in the lower holes from straight in front** than B1 paints, most on his right leg.
- **The trousers' shadow**: its material has the hole picture, but I did not look at a shadow to confirm the holes are in it.
- The cloth has no thickness; a torn edge is a painted band on a single sheet.
- Folds are few and soft, less than B1's; the clay view shows shallow dents round the holes. The outline misses by up to 17 mm.
- The hem's pouch over the boot is plain. The join was looked at in stills from three sides and in four walk moments only.
- The corset edge was read by eye. A wrong edge would show as a thin line of doll or a step in the corset; I saw neither.
- The page's heading still says "first build" and 429k triangles (that is every mesh built, drawn or not).

## Triangle counts

| What | Triangles |
|---|---|
| New trousers (added this stage) | 31,660 (19,012 points) |
| Limit asked for | about 70,000 |
| Drawn by default now | 390,599 |
| Drawn with "Old trousers" (as before this stage) | 344,967 |
| Drawn with "Doll" | 306,071 |
| All meshes built | 429,459 |

The default draws 45,632 more than before: the trousers plus the doll's hips and legs (29,204), less the old leg skin (15,232).

## Pictures (all in `/home/claude/builder/work2/final/`)

| Shows | File |
|---|---|
| Front, his left side, back, his right side, three-quarter | `turn.jpg` (singles: `v_front.png`, `v_sideL.png`, `v_back.png`, `v_sideR.png`, `v_tq.png`) |
| Legs, three-quarter from each side | `legs_tq.jpg` |
| Close on two holes (left leg, right leg) | `holes_close.jpg` (singles: `v_hole_left_leg.png`, `v_hole_right_leg.png`) |
| Beside B1 (front, back) and B2 (both sides) at one scale, with grid and overlay | `beside_B1_B2.jpg` (singles and tables: `beside_front.jpg/.txt`, `beside_back`, `beside_sideL`, `beside_sideR`) |
| Four walk moments from front, side and back | `walk_stills.jpg` |
| Idle and talk moments | `idle_talk_stills.jpg` |
| The doll's painted legs: front, back, close on a knee | `doll_legs.jpg` |
| New trousers, old trousers, doll, blank doll | `states.jpg` |
| The page at phone size: open, close on the holes, old trousers, doll, notes | `page_phone.jpg` |
| Skin tone check picture | `skin_check.png` |

Scratch pictures from along the way are in `/home/claude/builder/work2/`.
