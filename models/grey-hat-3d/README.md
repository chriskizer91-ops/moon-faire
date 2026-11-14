# The Grey Hat: 3D model (working name)

A character the four witches meet. He is not playable. Chris, November 13, 2026: he "might like join them in a fight or
something or just talks to them", and he gets his own folder because he is a character in the game that they meet.

- **"The Grey Hat" is a working name**, taken from his hat. His name, who he is and what he can do are not set, and nothing in
  this folder is lore. The lore lives in the claude.ai Project "Flip Book Art", folder `lore/` (`discussion-notes.md`, section
  "The character they meet").
- He will be built the way the witches were: a code-built three.js model with realistic paintings baked on. The method is the
  Project docs `claude/HOW-TO-3d-witch-models.md` and `claude/HOW-TO-3d-witch-faces.md`. Read both before writing any code.
- Project note for this folder: `claude/grey-hat-3d-reference-prompts.md`.

## Stage 1 of the rebuild: the blank doll under his clothes (November 13, 2026)

Chris, on the build with one clothes-shaped skin: "his ear is printed on his hair and his legs are printed on the surface of his
pants. I think it would be better to use one of the witches like blank dolls for their body and then adjust from there into a man
shape, then put the clothes over the doll." The plan: (1) the blank doll, (2) trousers over its legs with real holes, (3) shirt,
(4) corset, (5) hair over a real ear. **Stage 1 is built. Nothing is published yet.** Report: `/home/claude/builder/stage1_report.md`.

- **The doll** is `src/N45_doll.js`: one skin of 52,832 triangles from the foot of his neck to his feet. Its tables (trunk, neck,
  leg, arm, foot) are written the way the Ranger's body tables are, and it uses her bone weights, but it is not her tubes pushed
  together: the tables describe one soft solid and the skin is found on a 9 mm grid (the way the hands are made), so shoulders,
  armpits, crotch and neck have no joins. The numbers are his, from `tools/doll_measure.py` (B5, B3, D3).
- **Seeing it:** `api.setDoll(true)` hides the old skin and shows the doll with his head, hair, glasses and hands. `api.doll` reads it.
  On the page: the "Doll" button in the "Show" row. "Blank doll" (clay look) works in both states. Default is off, and then he
  looks as he did, but not to the last pixel: in 700 x 900 test pictures 6 to 12 pixels differ from the build before, most near
  his crotch. The likely cause is that the old trunk is now its own mesh and is drawn in a different order; that was not proved.
- **Regions, for the next stages:** the old skin is now `projTrunk` (waist up), `projHips` (below 1.06 m), `projLegs`, `projBoots`,
  `projArm`, `projRuffle`; the doll is drawn as `dollTrunk`, `dollHips`, `dollLegs`, `dollArms` (one shared list of points).
  `api.setOldSkin({ legs: false, hips: false })` switches regions of the old skin off, and the doll shows only under those.
  `debug.doll.F(x, y, z)` is the doll's solid (negative inside): a garment can ask it how far it is from the skin.
- **Checks:** `python3 -I tools/doll_measure.py` (measures the paintings, writes `out/doll_measure.json`), `python3 tools/doll_check.py`
  (doll against those numbers, room inside the old skin, mesh lists), `python3 tools/doll_cmp.py out.jpg b5front` (outlines laid
  over each other; also `b5side`, `b5back`, `b3front`, `b3side`, `b1front`).
- **Decided here, not by Chris:** the scale of B5 (900 px/m; it has no whole figure, see the top of `tools/doll_measure.py`); his
  chest, back and upper arms (under cloth in every painting: a slim man, kept inside B1 and B3); plain skin, no paint from B5.
- **Rough:** the tops of the doll's shoulders stand up to 2.4 cm proud of the OLD trunk skin (which dips there), so a doll region
  must not be drawn with the old skin over it (the code never does). The armpit creases when the arms are straight out. The feet
  are simple lumps for inside the boots. No chest or belly detail. Motion was checked as stills only.
- `src_before_doll/` is the source as it was before this stage.

## Second step: his face on a phone, and his sleeves (November 13, 2026)

What Chris said on seeing the first build on his phone: "I think I don't want you to spend a bunch of time like remaking him
from scratch. It actually looks pretty good. The transition from his arms to his sleeves could be better. Also in the artifact
I'm looking at ... he doesn't have a face".

**So he is not to be rebuilt from scratch.** Improve him in place, one thing at a time.

- **The missing face was a bug in `src/N40_head.js`.** In the neck, a `//` comment sat in the middle of a line and swallowed
  the half that fills `uvSide`, so that list was 399 entries short (7 neck rings of 57 points). A real graphics chip refuses to
  draw a mesh with a short list, so the whole `face` mesh (head, ears and neck) vanished on his phone. SwiftShader, the software
  renderer `shoot.py` uses, drew it anyway, so every test picture showed a face. **A headless picture does not prove a mesh draws
  on a phone.** `src/N99_static.js` now throws if any mesh carries a list of the wrong length, so the build fails instead.
  The same bug was what streaked his neck; it is plain skin now.
- **Never put a `//` comment in the middle of a line** when patching: it eats the rest of the line. (The witches' how-to says
  this too.)
- **Sleeve to arm** (`src/N30_body.js`, `A_BAND`, `A_EDGE`, `A_CUFF`, `armAt`, `tier`): the sleeve ends at a gathered band
  0.318 m down the arm. A lace ruffle in two fluted tiers (its own bucket, `projRuffle`, drawn from both sides, moving with
  the forearm) hangs from the band to a free hem at 0.405 m, and the bare forearm (radius about 0.04 m) runs on inside it to
  the leather cuff. Before, the ruffle was only a swelling of the arm tube, smoothed into a funnel.
- **A sharp flap at each upper arm is gone** (`tools/tables.py`). Out to 16 cm from the shoulder the under-side of the sleeve
  runs into the trunk in B1, and the old repair stopped at 13 cm, so three readings took the trunk for sleeve: a lump that
  folded through itself. The under-side is now grown from the top side over that stretch.
- About 345,000 triangles. Page version `1794593239-df79`.
- Not checked: a real phone. Chris has not yet said whether the face shows for him.

## Where he stands: first build, paused part-way (November 13, 2026)

Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (republish every change to that link). About 330,000 triangles.
Project note: `claude/grey-hat-3d-first-build.md`.

What Chris said this session:

- His name is maybe **Noiz** ("the name maybe noiz"). Kept in data (`api.name`, the page title); the folder stays `grey-hat-3d`.
- "his boots do have gold flecks so you'll have to add those in as a code animation of pixel or floating around his feet. When he
  walks like gold glitter dust follows his boots". So the paintings keep plain black boots and the gold is code (`src/N80_dust.js`).
- Seeing the first pictures: "can you make it look more like the 3D models that the witches are? ... every other instance has
  made a blank doll that looked good and then printed the image on top of that." **This is the rule for him from here on.**
- Then: "Can you show me what you've got so far? Without building anymore." So the build stopped where it was.

What exists:

- **All 53 paintings of rounds 1 and 2** are checked and saved in `references/chatgpt/` (A1 to G3). None needs redoing. F8 is a
  flat cloth sample, because the image maker refused the torn hole over skin twice.
- **Head:** the Jester's face model (the head every witch wears), copied from the Ranger's `R40_head.js` into `src/N40_head.js`,
  at 1.06 times its size, eye line at 1.660 m, nose tip 0.096 m forward. Two changes to its shape: a man's jaw (the lower face
  keeps its width further down) and a crown 3 cm lower, so the skull ends under his hair. His face is C1, placed by his pupils and
  lip line; his profile is C3's right figure (`bake_face.py`, landmarks read off gridded copies). Ears from the Ranger's ear code.
- **Glasses** as a real object (`src/N42_glasses.js`). **Hair** as one smooth shell (`src/N41_hair.js`).
- **Body, legs, boots, arms:** forms measured from B1 (front, back) and B2 (sides) by `tools/tables.py`, wearing those paintings
  laid on from four sides by rest position and mixed by which way the surface faces (material `proj`, `bake_proj.py`). The
  sleeves take their sides from A3. Outline against the paintings (`tools/cmp.py`): 94.5% overlap from the front, 94.7% from the side.
- **Hands:** the witches' hand model at 1.10 size, turned as painted (backs forward), in two plain colours (glove, skin).
- **Gold dust:** flecks on the boots, motes round his feet, a trail shed by a moving boot. 1,340 single points.
- **Moves:** `pose`, `idle`, `walk`, `talk`: first drafts from the Ranger's stride. `setBlank(true)` shows the blank doll.

Rough, and why Chris stopped it:

- **The body is his clothes as one smooth skin,** built outline-first and painted by projection, where the witches were built
  as a good blank doll first, then painted. Chris has since said not to remake him from scratch (see the second step above),
  so this stays unless he asks.
- His neck is one plain skin colour (the streaks were the bug fixed in the second step). His hair reads as a hood, with wrong-coloured patches where it
  turns in beside his neck. Up close the body paint is soft (it comes from whole-figure paintings).
- Not used yet: C2 (blink and talking mouths), C4 to C14 (hair, hat, glasses), D (hands), E (boots), all of round 2.
- Not built: hat, belt and ring, pouch, scroll, charms, dagger, pearls, feather earring.
- He stands 1.78 m in his boots. That is Claude's number; Chris has not confirmed it.

Build and check:

```
python3 -I lib/restore_refs.py                 # refs/*.png from references/chatgpt/*.webp
npm install                                    # three.js r128
python3 -I tools/tables.py && python3 -I bake_proj.py && python3 -I bake_face.py
./build.sh                                     # out/noiz.js and out/noiz_tex.js
python3 shoot.py /tmp/s "T.clean('nodust')" front:0,0.03,7.2,0.92,16,700,900     # angles in radians
python3 tools/cmp.py /tmp/cmp_front.jpg front  # outline against the painting
python3 -I build_single.py                     # deliver/Noiz_3D_stage1.html: publish this one (three.js inline, tested)
```

## What is in this folder

| Path | What it is |
|---|---|
| `references/source/grey_hat_picture.png` | The picture Chris shared. The only source for his design so far. |
| `references/starters/` | The seven images Chris attaches in ChatGPT. N1 to N3 are his picture and two enlarged cuts of it. S1 to S4 are the Jester style guides the Ranger's and the Fox's pages also use (from branch `claude/jester-3d-model`, `models/jester-3d/references/`). |
| `references/grey-hat-3d-reference-prompts.md` | Every prompt, the standing rules, the checklist, and what was guessed from the picture. |
| `references/build_prompts.py`, `page.tpl.html` | Build the prompt list, the page, the starters and the zip. All the words live in `build_prompts.py`. |
| `references/chatgpt/` | The kept paintings, as webp, named by code: rounds 1 and 2 (A1 to G3). |
| `src/N45_doll.js`, `tools/doll_measure.py`, `tools/doll_check.py`, `tools/doll_cmp.py` | The blank doll under his clothes, and the tools that measure and check it (stage 1 of the rebuild, above). |
| `src/`, `tools/`, `bake_*.py`, `build.sh`, `shoot.py`, `viewer_n/`, `viewer/stage.js` | The model, its measuring and baking tools, and his page. `00_util`, `10_geom`, `N20_tex`, `32_hands` and `stage.js` come from the Ranger's folder. |

Rebuild the page and the list after changing any wording (the page and the zip are not committed):

```
pip install pillow
python3 -I models/grey-hat-3d/references/build_prompts.py \
    models/grey-hat-3d/references/source/grey_hat_picture.png - models/grey-hat-3d/references \
    https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x
```

To rename him, change `NAME`, `CAP` and `SLUG` at the top of `build_prompts.py` and rebuild; then `git mv` this folder.

## His design, as read from the picture

Never mirror him. Seen from his own side:

- **Head:** a slumped grey felt witch's hat with a very wide brim, its tip falling to his left. Thick black rectangular glasses.
  Long wavy dark brown hair to just past his shoulders. A short full beard. A black plug in each ear; a small silver charm and a
  black feather hang from the left one. A short strand of pearls.
- **Body:** a cream linen poet's shirt with a red-laced front, lace-edged ruffles and very full sleeves pushed up the forearm.
  A black leather underbust corset with two buckled straps at the front. Black fingerless gloves under studded wrist cuffs.
- **Hips:** a wide black belt closed by a large silver ring, higher on his left hip, with a second strap dropping to his right
  hip. Right hip: a brown pouch, a rolled scroll in a leather loop, a silver skull charm and a gold leaf charm. Left hip: a
  sheathed dagger.
- **Legs:** baggy black trousers printed with dark red flowers, torn into long oval holes down the front of each leg, over
  black fishnet. Heavy glossy black strap boots with a turned-down studded cuff and a thick lug sole.

Where the picture was unclear, the prompt list says what was chosen (its section "What Claude read from the picture, and
where it guessed"). The open ones: whether the gold flecks on the boots and gloves are real, what exactly hangs on his left
thigh, and everything about his back.

## When the paintings come back

Follow the how-to's order: measure first, body and base layers, head and face, hands, boots, costume solids, cloth,
accessories, then movement. Show Chris each stage, and record what he approves.

- **Start from the Ranger's code** (branch `claude/ranger-3d-model`, `models/ranger-3d/`): it already has glasses, hair you
  can see, painted hands and arms, and belts, a satchel and a pouch as real objects (`src/R45_gear.js`). Take the wide cloth
  trousers and anything that swings from the Fox (branch `claude/fox-3d-model`, `models/fox-3d/`). Copy; do not reorganise
  shared code.
- **His body is a man's.** New proportion tables from A1, A3, B3 and B5. Build the body to B3 and B5 (no corset, no trousers)
  and check it before the corset and trousers go on.
- **His face is his own.** The Ranger and the Fox both ended up on the Jester's face model with their own painted faces. His
  brow, nose and jaw are heavier, so measure his profile from C3 before deciding whether that head can be reshaped to him or
  he needs his own tables. C1 is the painted face, C2 its blink and talking mouths, C9 the check between straight on and the
  side. The beard is paint from C1 over shallow relief; look at it in profile and from below (C8, C13) before adding anything.
- **No teeth**, as on the Fox: his mouth is closed or just parted in every painting.
- **The hat is a solid object** (C10), like the Jester's cap. The brim hides his hairline from most cameras; C12 is his hair
  for when the hat comes off in the bow.
- **Shirt:** the full sleeves are cloth sheets pinned at the shoulder and at the forearm band. The ruffles and lace are cut
  out with the lace's own holes.
- **Trousers:** one baggy cloth per leg with the holes cut out of it (map in F6 and B4), over legs that wear the fishnet (F9)
  on skin.
- **Belt gear:** belt and second strap as loops round the hips, pouch and scroll loop hung like the Ranger's bags, the two
  charms and the feather earring as spring chains.
- **Movement:** he is someone the four talk to, so standing, listening, talking, walking and the hat come first (set H). A
  dagger guard and lunge exist as one optional painting (H9). He has no magic until Chris says what he is.
