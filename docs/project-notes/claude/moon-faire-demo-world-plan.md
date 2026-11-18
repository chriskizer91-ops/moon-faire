# The Moon Faire demo world: a tent town and a wild area (plan, in discussion)

Written November 13, 2026, by the lore and combat session, from a brainstorm with a Fable 5.2 agent at high effort.
Nothing here is decided until Chris answers the questions below. The numbers are starting values, to be tuned by eye.

**Partly replaced, November 13, by `claude/moon-faire-starter-world-brief.md`.** Chris wants a small game (levels 1 to 5,
at least three zones), not a demo, and its places are **paintings with the 3D characters on top**, for walking and for
fights, not 3D places. What still holds from this doc: the light rig as a description of the place (now written into the
image prompts), the fixed set of lights, the foes and where they stand, the character interface, and the speed notes. The
3D layout, the world's `buildTown`/`buildWild` contract and the world-modelling brief below are replaced.

**Decided by Chris, November 13: a laptop game.** "I think this is also only a laptop game as well." Speed targets are for
his laptop; the phone is not a target. Pages can still be opened on the phone to look at.

## What Chris asked

"get all four of these witches and the NPC. And then I guess all of the enemies from Envoi that we've already used. Maybe
we'll make some simple enemies as well. I want to get them all on the same page. I want to get them into at least like one
little Moon Faire tent town and then one wild area to coordinate all of this. It has to be done correctly. I'll have another
conversation that will 3D model it ... It just has to be modeled in a way that the lighting and the type of models that the
witches are can work in."

## The demo, in one paragraph

The four start in the fair square at dusk. One leads, steered with the pad, and the other three follow her path. They walk a
lantern lane to the mooring field, where the airship captain stands under his moored ship, and talk to him. They leave by
the gate onto a moonlit moor, with the fair small and glowing behind them and the moon Auros hanging over the road. Just
past the last lantern, three wisps drift over a ring of flat stones. Walking into them starts the fight where everyone
stands: the party runs to its places on the left, the foes settle on the right, the turn bar slides in, and the approved
rules (`lore/combat-balance.md`) play out with the real models. Further along the road, a Shadow Wraith waits with two
wisps, and at the end, the great wraith. Beaten foes are released as pale moths. About five to eight minutes, in two places.

## Decisions for Chris

Each has a suggested answer. The world can be started before they are answered; the grey-box step (below) needs none of them.

1. **Answered: a laptop game,** so the picture is wide. (The witches' long lens needs a wide picture to fit four of them
   facing foes 8 m away; a phone held upright would show only about 2.6 m across at walking distance.)
2. **Dusk with lanterns, or full night like the square?** Suggested: dusk, with a switch on the page to see both.
3. **Where does Auros hang?** Straight overhead never shows with the witches' long lens. Suggested: lower, over the road
   ahead, so it is in the picture.
4. **All four walking together,** with "only the leader" as a switch for slow computers? Suggested: yes.
5. **The three foe tiers:** wisp (normal), Shadow Wraith (difficult), great wraith (boss), all one family from Envoi? Or
   Halcyon, the Gloam Knight, as the difficult one? Suggested: the wraith family. The "knight" in the balance sheet is only
   numbers, and the wraith's scythe can be its heavy blow.
6. **The captain's airship moored in the town, as scenery only?** Suggested: yes, a new ship built for this game, not
   Envoi's Magpie.
7. **The Flipbook look in a place:** pixel the whole picture, or only the characters? Suggested: the whole picture. In the
   not-HD demo only the witch was pixelled, and the wraiths beside her looked out of place.
8. **Later, would you paint about a dozen texture sheets** (tent canvas, planks, earth, rope, grass, stone) in ChatGPT, as
   you did for the witches? Suggested: yes, after the layout is approved. Until then, everything is painted in code.

## What already exists (checked in the repos on November 13)

| | Branch, folder | three.js | Height | Triangles (full / detail 0.75) |
|---|---|---|---|---|
| Jester | `claude/jester-3d-model`, `models/jester-3d` | r128 | eye line 1.50 m | 584k / 241k |
| Ranger | `claude/ranger-3d-model`, `models/ranger-3d` | r128 | eye line 1.50 m | about 355k |
| Fox | `claude/fox-3d-model`, `models/fox-3d` | r128 | 1.647 m in boots, ear tips 1.717 m | / 283k |
| Io | `claude/io-3d-model`, `models/io-3d` | r128 | eye line 1.50 m, on 5.5 cm platforms | 232k (no head, hair or robe yet) |
| The captain | `claude/grey-hat-3d-model`, `models/grey-hat-3d` | not built | average height, sturdy | none yet: only his painting prompts |

- All four witches are built in code the same way (`claude/HOW-TO-3d-witch-models.md`): one function each (`makeJester(opts)`
  and so on), global `THREE`, meters, y up, facing +z.
- **One light rig for all four.** `viewer/stage.js` is the same file on the Jester, Ranger and Io branches; the Fox's is an
  older copy with the same six lights but no place, glow or darkening. sRGB output, no tone mapping, soft shadows. Hemisphere
  (sky `#c8bcc4`, ground `#4a3438`, 0.40); a warm key (`#ffeedd`, 0.72) from in front, right and above, which casts her
  shadow; a lilac rim (`#d8b8ff`, 0.30) and a warm back light (`#ffeedd`, 0.42) from behind and to the left; a pink rim
  (`#ffc8d8`, 0.16); a cool fill (`#c8ccff`, 0.26). The rig's colours are given straight, without the sRGB-to-linear step the
  square uses for its own colours. Camera: a long lens (22 degrees), about 6.4 m back.
- **How a witch stands in a place** (the Jester's night square): the place is drawn first with its own lights, and she is
  drawn over it with her rig. Depth is shared, so a tent can hide her, but the place's lanterns never light her and her
  lights never light the place. Her shadow falls on a disc that follows her. Glow (bloom) and the Flipbook look are switches.
- **The Jester's game page** puts its practice foes in her scene, not the place's, and her spells are tuned to a 9 m circle
  (`J.arena = 9`). Her meshes are never culled by three.js, so a host must hide her itself. Her `detail` option goes from
  0.5 to 1.
- **The night square** (`models/jester-3d/viewer/square.js`): a 9 m circle of flagstones, lantern posts with bunting and warm
  lights, striped tents, stars, a dark moon disc, fireflies, a cool moon light and plum-dark fog. Its page
  (https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh) must never be republished.
- **Envoi's models** (`chriskizer91-ops/envoi-on-the-longest-night`, read-only, branch `claude/send-note-gigdew`,
  `src/models/`) are the same kind: three.js r128, one function each, meters, y up, facing +z.
  - `wisp.js`: about 0.85 m, all glow, no textures and no lights.
  - `wraith.js`: the Shadow Wraith, with a soul light of its own; `opts.great` builds the great wraith of Bogmire, about
    three times as tall, with a second, warm light.
  - `halcyon.js` (Halcyon, the Gloam Knight), `noctara.js`, `lunara.js` (the moth summon), `colossus.js`, `bramble.js`, and
    `magpie.js` (Quill's sunstone skiff, an airship, toon-shaded).
  - Envoi's `src/stage/*.js` are paintings with cameras, not 3D places. Two code-built 3D places exist:
    `3d-model-new-character-ideas/bramble-horror/glade.js` and `meadow.js` (grass that waves and answers a blast).
  - Briefs for simple wild creatures are in `envoi-final-draft/model-studio/briefs/` (thornhound, moss bear, moor boar and
    others).
- Used in Moon Faire so far: the Shadow Wraith as a 3D foe in the not-HD Jester's demo (moved to a newer three.js there; use
  Envoi's r128 original instead), and wisps and the great wraith only as flat pictures.

## The key idea for the light: the rig already describes a place

The witches' rig is fixed to the world, not to the camera, so it already says where the light comes from. The place is
built so that its light comes from the same directions:

| Rig light | Comes from | In the place |
|---|---|---|
| Warm key, 0.72 | The camera's side, right, 45 degrees up | Dusk afterglow behind the camera, and the lamps of the lane |
| Lilac rim, 0.30 | Behind and to the left, 35 degrees up | **Auros, the moon** |
| Warm back light, 0.42 | Behind | The glow of the fair behind them |
| Cool fill, 0.26 | Low on the left | The sky |
| Hemisphere ground `#4a3438` | Below | Warm earth: the ground's colour stays near this |

How it is kept true:

- **Keep the two scenes.** The place is lit by its own lights; everyone who moves is in one cast scene with one rig. The
  witches keep the look they were tuned in.
- **The place copies the rig:** a key light of the rig's colour from the key's direction (about 0.55), a lilac moon from the
  rim's direction (about 0.45), and a hemisphere with the same warm ground. A light meant to match a rig light uses the rig's
  colour straight, as the rig does; every other colour in the place goes through the sRGB-to-linear step.
- **The two-ball test.** A matte grey ball in the place and one in the cast scene, at the same spot, must look the same:
  within about 10% on the lit side and 15% on the shaded side, the same hue. This is how the world session checks itself.
- **Each zone may only nudge the rig:** key ×0.85 to 1.1, rim ×0.8 to 1.4, the hemisphere's colours, and a turn of the
  whole rig (none in either demo zone).
- **The same fog in both scenes,** about `FogExp2` 0.012: barely there at talking distance, about 40% at 60 m, so faraway
  characters do not look cut out.
- **A few lights for nearby things,** made once at load and never added or removed (adding a light makes every material
  rebuild, a freeze of seconds): 4. The page uses them for spell light, a foe's glow and
  the nearest lanterns. The wraith's own lights are taken off and stood in for by these.
- **Shadows:**
  - The cast's shadows on the ground: one shadow fitted round everyone in view, falling on one shadow plane (2048, everyone casts;
    if that is too slow, only the leader or the fighter acting).
  - A soft dark patch at every character's feet in the place; a green pool of light under a wisp.
  - Tents, posts and stones cast painted shadows on the ground, along the moon's direction. No live shadow map for the place.
  - Shade on the characters: the place lists shaded areas (awnings, the big top's mouth), and in one the page turns the
    party's key light down about a third.
- Nothing behind a face is brighter than her skin, except lamps, the moon and the sky. Bloom stays a switch, on by default. No tone
  mapping.

## The places (suggested layout)

Axes: meters, y up. The camera looks from +z toward −z; screen right is +x. Every walk area and fight ring is flat at y = 0.

**Claude's change to the agent's layout:** the journey always runs from screen left to screen right, the way the witches
cast. So the mooring field is on the left of the square and the gate to the wild is on the right, and in the wild the road
runs toward +x, where the foes stand.

**The tent town, about 70 by 50 m**

- **The fair square:** a 9 m circle at the middle. It is also a fight ring, and the Jester's stage (a floor cloth with
  footlights, not a raised platform, so the ground stays flat).
- **Stalls and tents:** six to eight, 2.2 to 3.3 m across, in a ring 12 to 16 m out, with gaps for the two lanes.
- **The big top:** 14 m across and 9 m tall, behind the square on the right, the town's landmark on the skyline.
- **Lanterns:** posts 3.3 m tall, eight round the square with bunting (as in the night square), then one every 6 m on the
  lanes.
- **The mooring field (left):** a 6 m lane to a clear 10 m circle about 32 m from the square, a 12 m mooring mast, and the
  captain's airship as scenery (hull about 24 m, keel about 3 m up, a gangplank down). The captain stands near the foot of the
  gangplank, facing the lane.
- **The gate (right):** an arch of poles and banners. Walking through fades to the wild.
- **Edges:** tent backs, guy ropes, wagons and rope fences. People are suggested, not modelled: shadows moving on lit tent
  walls, swaying bunting and flaps, cook-fire smoke, moths.

**The wild area, a moor of pale moon-grass along an old road, about 100 by 50 m**

- The fair is on the skyline behind the road, with the big top, its lamp glow and the airship, and Auros above.
- **Ring 1, "the Last Lantern",** about 30 m along: wisps hang just past the fair's light.
- **Ring 2, a circle of standing stones,** about 60 m along.
- **Ring 3, a still pool by a broken arch,** about 90 m along: the pool shows Auros, and the arch frames it.
- Edges are banks, brambles and mist. Envoi's `meadow.js` is the example for the grass.

**Cameras:** all keep the witches' long lens, so their faces keep their shape.

- Walking: about 15 m back, a little above, looking a step ahead of the leader, turning at most 35 degrees either way.
- Talking: the portrait framing the witches were tuned in.
- Fighting: a wide shot that fits everyone, and a closer shot on the caster and her target for each move.

## Foes, and where everyone stands in a fight

- **The tiers (suggested):** wisp, Shadow Wraith, great wraith. One family, one lore (a wisp is a soul going hollow, a
  wraith is what it becomes), all r128, and all lit mostly by their own glow, so they sit well beside the witches.
- **Simple new foes for the wild (ideas):**
  - a lamp-thief wisp carrying a stolen fair lantern (a variant, almost free);
  - Envoi's Gloamwing (already built, to be looked at);
  - a ragflag, a torn fair banner come alive (a cloth foe, for the Fox);
  - later, a thornhound pack from Envoi's brief, which needs paintings.
  Spirits first: furred animals show the gap between styles most.
- Foes go in the cast scene, through a small adapter, so they share the rig, stay lit when the place darkens for a big spell,
  and are part of the Flipbook look.
- **Places on a ring** (ring centre at 0):
  - The party on the left: Jester (−2.2, +0.6), Ranger (−3.6, −1.4), Fox (−3.8, +2.0), Io (−5.2, +0.2).
  - Foes on the right, between x +2.4 and +5.5, staggered; a boss at (+4.5, 0).
  - At least 1.6 m between any two.
  - A witch facing the camera has her left hand toward +x, so she casts at the foes without turning her back.
  - Nobody is ever mirrored.
- The fight starts where the party stands: they run to their places in under a second and the camera swings. No separate
  battle screen.

## Will it run on the laptop?

It is a laptop game (Chris, November 13). Chris has said his laptop handles close to a million triangles. Four Jesters at
detail 0.75 are already about 960,000 before shadows, which draw everyone a second time, and the captain and foes come on
top. So a lighter version of each witch is still needed when all four are on screen, but it can be less extreme than a phone
would need. Targets, to be checked against the meter on his laptop:

| | Laptop |
|---|---|
| Frame rate | 60 |
| Each witch, walking or in a wide fight shot | a new lighter "field" version, about 100k to 150k triangles |
| The witch in a close shot (talking, her turn in a fight) | full HD |
| The captain (town only) | field version in the town, HD when talking |
| Foes in view | at most 150k |
| The place in view | at most 300k, 150 draw calls |
| Shadow map | 2048, everyone casts |
| Bloom | on |

- **The field version** is made from the same code at a lower detail, not as a separate model, so it shares her skeleton and
  all her moves, and every later fix lands on both. Cut the hands and face first (over a third of the Jester's triangles,
  and tiny at walking distance); keep what makes her outline (hat, bells, veils, skirt edge); one texture sheet if it saves
  draws; a coarser cloth.
- **Turn-based fights make the swap easy to hide:** only one witch acts at a time, the camera cuts to her, and she becomes HD
  during the cut while the others stay light.
- The heaviest moment is a fight during her big spells: four witches and the foes, a second pass for shadows, four cloth
  simulations, and spell light, darkening and glow over the whole picture. Triangles are only one of those costs.
- The page shows its own meter (frame rate, triangles, draw calls, time spent on cloth and poses), because no Claude session
  can measure real speed: the test browser runs at under two frames a second. Chris reads the meter on his laptop.
- **Do this first:** four copies of the Jester in a fight layout with the meter, and switches for detail, shadows, glow,
  cloth, screen sharpness and the Flipbook look; then a ladder of lighter versions (240k, 120k, 60k, 30k) in side-by-side
  stills at walking, wide-fight, close-fight and talking distance. Chris is starting this with the Jester in another
  conversation (November 13).

## Who does what

- **The world session** (the separate conversation Chris starts): new branch `claude/world-fair-and-wild`, folder
  `worlds/faire/`. Builds the town and the wild to the contract. Touches nothing else.
- **Each witch's session:** keeps her model as it is, adds the field detail when asked, and keeps her built single script
  on her branch.
- **The captain's session:** builds him as planned; until then the demo uses a stand-in in his hat.
- **An assembly session** (later; new branch `claude/demo-assembly`, folder `demo/`): takes one copy of the Jester's
  `stage.js` and adds the fitted shadow, the fixed lights, the shared fog, the zone presets and the whole-picture Flipbook.
  Writes the small adapters for each witch and foe, the party walking, the fight on the blob battle engine
  (`lore/sim/blob-battle-engine.js`), and the cameras and buttons. It copies built files from the other branches and never
  edits them.

## The contract (every session follows this)

1. **Engine:** three.js r128, global `THREE`, plain scripts, no modules. The only outside load is the r128 script, which the
   offline file carries inside it.
2. **Renderer:** sRGB output, no tone mapping, soft shadow maps. Nobody changes these.
3. **Colour:** the place's colours go through `new THREE.Color(hex).convertSRGBToLinear()`; canvas textures are marked
   sRGB; a light meant to equal a rig light uses the rig's colour unconverted. Colours brighter than 1 only on small glowing
   things (lamps, the moon's rim, fireflies, windows).
4. **Units and axes:** meters, y up. A zone's origin is the middle of its main ring. The default camera looks from +z
   toward −z; screen right is +x. Auros is toward (−0.40, 0.58, −0.71), the rim light's direction.
5. **Characters:** face +z at no turn; their right side is −x; soles on y = 0. They cast toward their own left, the target on
   screen right. No character, foe or spell is ever mirrored.
6. **Ground:** every walk area and ring is flat at y = 0. Hills and banks only outside walk areas. The place still offers
   `ground(x, z)` (0 everywhere for now).
7. **Scenes:** the place goes in `stage.world`, drawn first, with its own lights and fog. Everyone who moves goes in the
   cast scene, drawn over it with shared depth. The place adds nothing to the cast scene; it lists its lanterns and shaded
   areas, and the page does the rest.
8. **The rig:** one per cast scene, with the numbers in `stage.js`. A zone may only scale key ×0.85–1.1 and rim ×0.8–1.4,
   set the hemisphere's colours, and turn the whole rig.
9. **Lights are fixed at load:** the rig and 4 extra point lights, always there. Foes' own lights are
   removed and stood in for.
10. **Fog:** the same colour and density in both scenes, from the zone.
11. **What a character offers** (the Jester's set is the model): `root, fx, animate(phase, wb, t, dt, rb), play, stop, reset,
    setStance, ACTIONS, STANCES, anchor, setFade, state.hitN, spin, targetDist, dark, dim, shake, spellLight, triangles`. The
    assembly session's adapter adds `height, radius, mark(), setActive(on)` (hide her and skip her update) and `dispose()`.
12. **Aiming:** the page turns the caster so the target is on her left (`yaw = atan2(−dz, dx)`) and sets `targetDist`.
13. **Detail:** full HD for close shots, and a new field version (about 100k to 150k triangles) for walking and wide shots,
    made from the same code. Same skeleton, same silhouette, same moves.
14. **Delivery of a model:** its branch holds its built single script, defining one global `makeX(opts)`. Seeded randoms only.
15. **Delivery of the place:** `worlds/faire/out/world.js` defines `buildTown(stage, o)` and `buildWild(stage, o)`, with
    `o = {time: 'dusk' | 'night', seed}`. Each returns:
    - `id, group, update(t, dt, camera), setTime(name), setLight(dim, dark), dispose(), stats`
    - `light`: fog, hemisphere colours, key and rim scales, the rig's turn
    - `ground(x, z)`
    - `walk: {polys: [[[x, z], ...]], blockers: [{x, z, r}]}`
    - `spawns: {name: {x, z, face}}` and `exits: [{to, a: [x, z], b: [x, z], spawn}]`
    - `arenas: [{id, x, z, r, partySlots, foeSlots, cam}]`
    - `cams: {explore, talk: [...], rails: [...]}`
    - `lanterns: [{x, y, z, color, k}]` and `shade: [{poly, k}]`
16. **Names:** lower case with hyphens (`ring-last-lantern`, `spawn-captain`). Source files numbered `src/NN_name.js`,
    joined by `build.sh`.
17. **Flipbook:** everything must still read when the whole picture is drawn at low resolution with square pixels: no detail
    that depends on lines thinner than about 1 cm.
18. **Pages:** every step ends with a new published page and one offline HTML file. Speed is judged on Chris's laptop;
    he may also look at pages on his phone. The night
    square page is never republished.

## Brief for the world-modelling conversation

**Start here.** You are building two places for the Moon Faire demo, a tent town and a moor, in three.js r128, to the
contract above. The characters are not your job; your job is that they look right standing in your place. Read this doc,
`claude/HOW-TO-3d-witch-models.md` and `lore/README.md` first. Repo: `chriskizer91-ops/moon-faire`, new branch
`claude/world-fair-and-wild`, folder `worlds/faire/`. Envoi's repo is read-only.

**What you start from**

- The contract and the layout above.
- The Jester's `viewer/stage.js` and `viewer/square.js` (branch `claude/jester-3d-model`): the technique and the look to
  match.
- The Jester's built model, for look checks.
- A stand-in you make yourself: 1.70 m, eye line 1.50 m, matte skin and grey, plus a copy with a 55 cm hat brim for the
  captain.
- Envoi's `meadow.js` and `glade.js`, for grass and mist.

**Order, each step ending in a page Chris opens on his laptop**

1. **Grey boxes.** Flat walk areas, blocks for tents, stalls, the big top, the mast and the ship, walk outlines, spawn
   points, fight rings, cameras and the gate, and a map from above. A stand-in walks it with the pad. No decisions needed.
2. **Light and sky.** Dusk and night, Auros, fog, the place's key and moon copied from the rig. The two-ball test, and the
   Jester standing at the square's middle, the captain's spot and ring 1, in stills at laptop size.
3. **The town, painted in code:** ground, tents, stalls, lanterns and bunting, the big top, the gate, the moored airship,
   painted shadows, lamp pools, shadows on tent walls.
4. **The wild:** moon-grass, the road, the Last Lantern, the standing stones, the pool and arch, the fair on the skyline.
5. **A list of at most 14 texture prompts** for Chris to paint in ChatGPT (straight on, flat even light, tileable, on flat
   plum), then put them in.
6. **Speed:** instancing and merging, the on-page meter.
7. **Hand over:** `out/world.js`, a short note on its API, the maps, the stills and the offline file.

**Check your own work**

- The two-ball test passes at dusk and at night.
- Squint at the Jester in your place and in her theatre: no brighter, no darker.
- At the talking spots, nothing behind a face outshines her skin except lamps and the moon.
- People-sized things are people-sized: doors 2.1 m, stall counters 0.95 m, lantern posts 3.3 m.
- Triangles and draw calls (from `renderer.info`) are within the budget.
- Every walk area is flat and clear, and every fight ring is clear for 9 m.
- Say plainly what you could not check, real speed above all.

**Must not**

- Edit any model folder, a rig number, or a renderer setting.
- Add lights or objects to the cast scene.
- Use another three.js version, modules, or tone mapping.
- Raise any walk area.
- Use live shadow maps for the place, textures over 2048, outside links, or unseeded randoms.
- Bring back the new-moon disc or moon-phase symbols (moon phases are out of the lore).
- Model fairgoers.
- Republish the night square page.

## Risks, most serious first

1. **Four HD witches at once** may not hold 60 frames a second on Chris's laptop. The first test and the field version
   answer it; "only the leader" is the fallback.
2. **Characters that look pasted on.** Studio-lit witches against a dark place. Dusk, the copied light, shared fog, the
   patches at their feet and the two-ball test are the answer; night stays one switch away.
3. **Four sessions drifting apart.** The Fox's stage is already older, and whether the Ranger, Fox and Io offer the same
   functions as the Jester has not been checked. The adapters absorb this.
4. **Freezes when lights are added at run time.** The fixed set of lights prevents it.
5. **The Flipbook look in a place** needs rework before it can be judged: the place cannot hide her in it now, its palette is
   the Jester's own, and its pixels do not grow with distance.
6. **Style gap:** Envoi's painted creatures and toon-shaded airship next to realistic witches. Spirits first, and a new ship.
7. **The captain is not built yet.** A stand-in in his hat until he is.
8. **Flat ground only,** for now: no steps, slopes or raised stages underfoot.
9. **Loading time and memory** with five models in one offline file: not measured yet.
