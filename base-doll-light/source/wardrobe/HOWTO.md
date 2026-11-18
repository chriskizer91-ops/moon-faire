# Building an outfit (or hairstyle) for the base doll

You are one of several builders, each making one outfit for the same 3D doll at the same time. Everyone works from this guide and the
same code. The doll is a realistic three.js r128 model built in code (`/home/claude/io`); the outfits are painted from reference
paintings Chris (the person this is for) had generated: `refs_outfits/<CODE>A.png` (the whole outfit: front, her RIGHT side facing
the image's right edge, back) and `refs_outfits/<CODE>B.png` (closer: front, back, and one detail). Look at both carefully before you
start, and at `shots/wear/D5_check.jpg` (the pilot) to see what the tools give you.

Read `src/D95_wardrobe.js` (the wardrobe: about 300 lines) and the pilot module `wardrobe/D5.js` first. Read `src/D50_wear.js` (the
sports bra and shorts) for the close-fitting method.

## Rules (please keep every one)

1. **Only write your own files**: `wardrobe/<CODE>.js` (your module), `wardrobe/<CODE>_tex.js` (made by the prep tool),
   `wardrobe/<CODE>_prep.json` (optional), anything under `shots/wear/<CODE>_*`, and scratch files under `/home/claude/agents/<CODE>/`.
   Never edit `src/`, `tools/`, `test_doll.html`, `shoot.py`, `build_doll.sh`, `out/`, another builder's files, or this guide. Other
   builders are testing against them right now. If the shared code needs a change, say so in your final report (what and why);
   do not work around it by copying it into your module unless that is small and clean.
2. Never write to the claude.ai project, memory, any git repository, or the network. Nothing leaves this machine.
3. The machine has 2 processors shared by several builders. Rendering is slow (each check takes about a minute). Render what you need
   to see, not more; never run renders in parallel.
4. Do not ask the person questions. Make sensible choices, and list them in your report.

## The doll (rest pose; metres; y up; her front is +z; her LEFT is +x, her RIGHT is -x)

- The bottom of her bare feet is y = 0.038 (`W.SOLE`); the floor is there. Knee joint 0.570 (`W.KNEE`). Shoulder joints at
  (±0.119, 1.285, -0.018). Narrowest of her neck: 1.41 (front view). Top of her head about 1.63.
- Her trunk, half width and front/back by height, `W.trunkAt(y) -> [half width, front z, back z]`:
  0.86 [0.156, 0.086, -0.114] (crotch) · 0.90 [0.177, 0.091, -0.128] (widest hips) · 0.98 [0.158, 0.094, -0.106] · 1.02 [0.141, 0.093, -0.077] ·
  1.06 [0.118, 0.089, -0.057] · 1.10 [0.099, 0.083, -0.049] (waist) · 1.14 [0.102, 0.085, -0.054] · 1.22 [0.116, 0.081, -0.079] (bust) ·
  1.30 [0.131, 0.058, -0.088] · 1.34 [0.098, 0.036, -0.080] · 1.38 [0.045, 0.028, -0.073] (neck).
- Her legs, `W.legAt(y) -> [half width, front, back, centre x, centre z]` (one leg; the other is mirrored): 0.10 ankle [0.031, 0.032, 0.046, 0.081, -0.013] ·
  0.34 [0.045, 0.048, 0.048, 0.083, -0.011] (calf) · 0.58 knee [0.054, 0.057, 0.057, 0.081, 0.006] · 0.74 [0.077, 0.087, 0.087, 0.087, 0.008] · 0.82 [0.091, 0.093, 0.095, 0.09, 0.003].
- Her arms hang 15 degrees out from her sides at rest (`W.A_POSE`), straight down otherwise. In the paintings she holds them about
  30 degrees out (`wardrobe.paintPose`): your pieces are built at rest and painted in that pose automatically.
- Her body's surface: `W.F(x, y, z)` (signed distance, negative inside; trunk, neck and legs down to the ankle; NOT her feet, arms, hands or head;
  `W.Ffeet` is the same with her feet, and `W.snug(..., { feet: true })` wraps her feet: socks, tights) and
  `W.Fsnug` (the same with the hollows a cloth would bridge filled). Her arms: `W.armPt(S, sl, a)` gives a point of her arm's skin at
  rest (S 'R' or 'L'; sl metres down the arm from the ball of her shoulder, about -0.047 at the top of the shoulder to 0.458 at the
  wrist; a the angle round the arm, 0 the outer side, PI/2 the front). Her hands and head are separate meshes you cannot reshape.
- She always wears a black sports bra (`wearBra`) and bike shorts (`wearShorts`, mid-thigh). Hide them under your clothes
  (`W.hideMeshes(['wearBra'])`) when they would poke through or cannot be seen; leave them when they are part of the outfit.

## Hairstyles

A hairstyle is a module like an outfit, with `kind: 'hair'`; `wardrobe.hair('<code>')` puts it on and hides her long hair (meshes
'tress', 'tressIn', 'wisp', 'lock', 'hairmass'); `wardrobe.hair('long')` brings it back. Outfits name the hairstyle they come with.
`W.hair` holds her own hair's tools from `src/D41_hair.js` (`SKR` her skull's radius by direction, `HV` a point of the hair's surface,
`hvDir`, `hvAngles`, `HCX` the middle of her head, `hairT` the hair's thickness, `wHair` the bones that carry hair, `HAIRC` her hair
colours), and `W.headPoint`, `W.headHalfW` her head (`src/I40_head.js`). Her own hair materials can be reused
(`W.meshes.hairmass.material`); give such a piece `keepMat: true` so taking it off does not dispose a shared material.
Test a hairstyle with `PAGE=test_doll.html Q='?hair=<code>' python3 shoot.py ...` or with an outfit: `Q='?wear=D5&hair=<code>'`.

## Your module

```js
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.<CODE> = { name: '...', kind: 'outfit', hair: 'hair_bun', build(W) { ... } };
```
`build(W)` makes the pieces. Every piece is its own skinned mesh on her skeleton, so it moves as she does. Name every piece
`<code>Something` (e.g. `d2Bodice`, `d2Skirt`, `d2BootR`), one piece per garment part, so pieces can later be mixed between outfits
and recoloured. The tools in `W` (see `src/D95_wardrobe.js` for exact arguments):

- `W.snug(key, R, th, box, h, o)` a close-fitting piece: her body swollen by `th(x,y,z)` metres, kept where the outline `R(x,y,z) < 0`.
  Bodices, trousers, tights, socks, tight sleeves on the trunk, belts, boots' shafts. Layer outward: a piece over another needs a
  larger `th` (bra up to 3 mm; give each layer 2-4 mm more than the one under it).
- `W.sleeve(key, S, sl0, sl1, off, o)` a tube round her arm from sl0 to sl1, standing `off(sl, a)` off her skin.
- `W.surface(key, G, box, h, wf, o)` any closed surface (signed distance `G`), found on a grid of step `h`; `wf` gives each point's bones.
- `W.part(key, {pos, idx, nor?}, wf, o)` any mesh you make yourself (e.g. with `W.loft(rings, o)`, rings of [x,y,z] points).
- Weights (which bones carry a point): `W.wBody(x,y,z)` (her skin there), `W.wArm(S,x,y,z)`, `W.wSkirt(x,y,z)` (twelve soft chains
  round her hips that swing as she moves, hanging from 1.02 down to 0.18: use for skirts and anything hanging below her waist;
  above 1.02 it is her hips), `W.wBone(name)` (one bone, rigid: hats, buckles, armour plates; bones are in `W.SK`, e.g. 'head',
  'spine3', 'hips', 'footR'), `W.mixW(a, b, t)` to blend two.
- `W.paint(o)` the painted material: the piece takes its colour from your paintings, from whichever view it faces, in the paintings'
  pose. Options: `rough`, `metal`, `env` (reflections), `color` (multiplies the painting; for recolouring later), `emis`, `double`
  (both sides drawn: thin cloth whose inside shows, skirts, capes), `alpha` (see-through: the painting's outline alpha, for wings).
  A piece can also use a plain material (`W.std({...})`, `W.phys({...})`, `W.lin('#hex')` for colours) where painting does not suit it.
- `W.hideSkin(pred, keys)` her skin that can never be seen under your clothes is not drawn (pred(x,y,z) at rest; keys of her skin
  meshes: 'dollTrunk', 'dollLeg', 'dollFoot', 'toenail', 'arm'). Keep a centimetre of skin inside every edge so no gap opens.
  Hidden skin also stops skin poking through clothes in a deep bend. Do this for every piece that covers skin.
- `W.hideMeshes(keys)` hide one of her own meshes while worn (the bra, the shorts, 'hand' for gloves that replace the hand, ...).
- `W.swapMat(key, material)` lend one of her meshes another material while worn (e.g. 'hand' and 'handR' in a glove colour; 'dollLeg'
  in a tights colour).
- `W.onFrame(fn)` fn(SK, API) runs after every frame of her moves (bones may be changed there; e.g. heels: raise `SK.hips.position.y`
  by the heel height and tip her feet; the bones are reset every frame, so add, do not accumulate).
- `W.afterPaint(fn)` fn(parts) runs once the painted pieces know where they sit in the paintings (geometry attributes `aPP` the point
  in the paintings' pose, `aPN` its direction, `aPE` how well the front, back and side views saw it, 0 to 1): change `aPE` to keep a
  view off a part (e.g. the side painting where a sleeve hangs over the body in it), or `aPP` to read the painting a little elsewhere.
- Everything you make or hide is undone when she takes the outfit off.

## Tips from the first builders

- A prop or a hand painted over the clothes (a laptop held against the hip) can be painted out of a copy of the painting under
  `/home/claude/agents/<CODE>/`, and the prep run on it with `--img path`; `outfit_check.py --img path` compares against that copy.
- Turned-in edges (neck ribs, hems, cuffs) take the colour of the cloth just outside them: move their `aPP` a little outward in
  `W.afterPaint`, so they do not pick up skin or the clothes beneath.
- Legs painted standing wider apart than hers: read the front and back paintings a little further out for leg pieces (shift `aPP.x`).
- If her own sports bra or shorts are part of the outfit, keep them and extend or recolour them rather than rebuilding them.
- Her bare arms (below the armpit) and her hands are cleaned out of the paintings when the outfit is worn (widened 3.5 cm to the
  sides, 3 cm up, 5 cm down, filled from the cloth around; not where a piece of yours lies within 2.5 cm of her arm, or right on her
  hand), and they do not count as occluders: the side of a dress under her hanging arm reads the side painting's cloth. No need to
  paint her hands out of a copy of the painting yourself (check a walk from her sides: `T.j.wardrobe.paintings(code).armMask`).
- Hiding the bra or shorts (`W.hideMeshes`) gives back her skin under them, so a low neckline shows her chest: no need to rebuild skin.
- `shoot.py` now waits up to 5 minutes for a busy machine; `T.wore.ms` is the outfit's own build time.
- `W.prof(..., true)` eases to a stop at every key and can show as bands on smooth shapes; use a smooth curve of your own there.
- `wear()` puts the outfit's hairstyle (the bun) on BEFORE building the outfit, so hats, headbands and ties can measure the hair
  (`W.hairNow()` names it, `W.hairParts()` gives its meshes at rest, e.g. 'hbCap' and 'hbBun'; X2.js and C7.js measured its outer surface).
  `test_doll.html?wear=<CODE>` loads the bun by itself now.
- Finished modules to learn from (read, never edit): long skirts kept off her legs in kneel/squat: `D1.js`, `D6.js`, `C7.js`, `D2.js`;
  heels (lifting her and tipping her feet in `W.onFrame`): `M1.js`, `D4.js`, `X2.js`; hanging sleeves/cloth swung by spare bones of
  the base doll's cloak-sleeve rig (`slR*`, `slS*`, unused by other outfits): `X1.js`, `D3.js`; a hat/headband on the bun: `X2.js`,
  `C7.js` (mask on the face); wings moving on their own: `C3.js`; boots with buckles and gloves: `C1.js`.

## Workflow

1. `python3 tools/outfit_prep.py <CODE>` makes `wardrobe/<CODE>_tex.js` from `refs_outfits/<CODE>A.png`, and `shots/wear/<CODE>_prep.jpg`
   (open it: the green lines are the neck and the yellow the feet it lined up by). If a mark is wrong (a high collar, a hat), put the
   right rows in `wardrobe/<CODE>_prep.json` and run it again. If she stands in heels, give `--heel 0.07` (metres) or "heel" in the json.
2. Write `wardrobe/<CODE>.js`. Measure the painting: heights of hems, seams, necklines, cuffs; widths of skirts at their hems; in metres
   by the prep marks (`y = 0.035 + (sole_row - row) / k`, `x = (col - mid) / k`; `z = -0.023 + (col - mid) / k` in the side view, her front toward the image's right). The
   numbers are in `wardrobe/<CODE>_tex.js` (`views.front.marks`, `.k`).
3. `python3 tools/outfit_check.py <CODE>` renders her wearing it from the front, her right side and the back, beside the paintings at
   the same scale, and the paintings with the model's outline: `shots/wear/<CODE>_check.jpg`. Look at it (Read the image) and make
   the outline match the painted outline: lengths, widths, how a skirt flares, where sleeves end. This is the main loop. Chris's
   own words for it: overlay the model on the reference at the same height, depth and width.
4. Check her moving: `python3 tools/outfit_check.py <CODE> --move walk:1.3` and `--move kneel:2.0` and `--move squat:1.6`
   (`shots/wear/<CODE>_walk.jpg`, ...). Nothing of her may come through the clothes (legs through a skirt, arms through a bodice),
   and nothing may tear open. Skirts must swing, not stand stiff.
5. Look closely at a part when needed: `PAGE=test_doll.html Q='?wear=<CODE>' python3 shoot.py shots/wear/<CODE>_x "(()=>{ T.j.pose({arm:15}); T.clean(); return 1 })()" a:0.6,0.2,4,1.1,9,700,700`
   (views are az,el in RADIANS, distance, target height, field of view in degrees, width, height; az 0 front, az -1.5708 her RIGHT side as the paintings show it (she faces the image's right edge), az 3.1416 back). `T.j.wardrobe.W` is the tool box,
   `T.j.wardrobe.parts()` lists your pieces.

## What good looks like

- From the front, side and back the outline matches the painting (the check's green outline sits on the painted outline), and the
  painted colours land on the right pieces (the belt's brown on the belt, not on the dress).
- Hems, edges and seams are where the painting has them. Cloth has thickness at its edges (hems are a few millimetres thick).
- Skirts and loose cloth hang and swing; fitted cloth moves with her; nothing pokes through in walk, kneel, squat.
- Shoes and boots sit on the floor (the floor is y = 0.038 at rest). Boots hide the foot skin under them.
- Under 150,000 triangles for the whole outfit; it builds in under 3 seconds (`T.wore.ms` in the check's output).
- Hair: say `hair: 'hair_bun'`. The bun is being built by another builder; until it exists she keeps her long hair, and the head in
  your checks will not match. Ignore the head; hats and hair pieces sit on a bun.

## Your final report (your last message)

Short and plain: what you built (each piece), what still differs from the painting, what you decided without asking, how many
triangles, how long it takes to build, and anything the shared code should change. Include the paths of your best check images.
