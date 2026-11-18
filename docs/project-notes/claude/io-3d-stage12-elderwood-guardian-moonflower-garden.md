# Io 3D, stage twelve: Elderwood Guardian and Moonflower Garden

November 14, 2026. Follows `claude/io-3d-stage11-first-spells.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `d1d1d0d`.
One-file copy sent to Chris: `Io_3D_stage12.html`. Picture sent: `Io_stage12_guardian_and_garden.jpg`.

## What Chris said

Of stage eleven (Harvest Crescent and Silverleaf Salve): "Wonderful. Let's continue to the Elderwood Guardian and the Moonflower Guardian. Thornwake, Rootbound, Return, Bramble Cradle, Being Hit, Falling, and Winning. I like that order."

I took "Moonflower Guardian" to mean Moonflower Garden. This stage is the first two on that list.

## What was built

Two new buttons in the Her spells row. During a spell the camera now moves by itself; a drag or a pinch takes it over.

**Elderwood Guardian**, her one-time summon (paintings H7 to H10, I4). 14.6 seconds.

1. She takes a seed from her pouch and holds it up at arm's length. It glows like a small lantern and a tiny shoot opens on it. She looks up at it.
2. She bends her knees and lets it sink into the ground at her right side. Thin roots of light spread over the ground.
3. A sapling of twisted living wood grows to her waist under her open hand, with leaves opening along it.
4. The sapling twists itself into a fawn, lying down, with two small antlers. It lifts its head to her hand.
5. The fawn stands up and grows into the Guardian: a stag of braided roots and vines, moss and small white flowers on its back, antlers like boughs with leaves, eyes of green-gold light. Its shoulder is level with hers and its antlers rise well above her hat. It lowers its head to her and she rests her hand on its cheek, smiling.
6. She sweeps her arm out at the foe. The stag gathers and leaps past her. From the rump forward it comes apart into vines, leaves and gold-green light. What is left bursts on the training dummy, and the vines whip once round it.

For the game it cuts into three clips: the planting (0 to 7.0 s), the arriving (7.0 to 11.6 s), the charge (11.6 s to the end).

**Moonflower Garden**, her heal for the whole party (H11, H12, I6). 12.4 seconds.

1. Her book floats open at her left side, its leaves lifting, with light rising from them.
2. She cups a handful of glowing seeds at her chest, eyes shut.
3. She flings both arms out wide and low. Twelve seeds fly out in a ring round her and her two friends, each trailing a thread of light.
4. Where they land, shoots with tight white buds rise. A dark green vine with heart-shaped leaves creeps round the ring.
5. The flowers open one after another, starting in front of her: large white trumpets that glow like small moons, with small white star-flowers between them. Motes rise from each flower and light rises round her friends. She stands with her arms open and low, palms up, eyes shut.
6. The garden sinks away in sparks.

## Things that are mine, for Chris to keep or drop

- She takes the seed from her pouch. The paintings just show it in her hand.
- She lets the seed go about a hand above the ground and it sinks by itself. In H7 her hand is right at the ground.
- The Guardian lowers its head and her hand rests on its cheek. H9 has her hand on its neck.
- After it strikes, its vines whip once round the foe.
- The Guardian stands behind her right shoulder, turned toward the foe. She is seen from her right and a little in front, so on the screen it stands to her left in side view, as in H9, and springs past her, as in H10.
- The flowers open in one go. The lore has them take root one turn and bloom over the next.
- The garden sinks away in sparks at the end.

## How it is made (for the next spells, and for anyone reading the code)

- `src/I98b_wood.js`: living wood. Everything is a braid: round strands wound round a shape, every other one wound the other way, with a dark core inside. The Guardian is a puppet (body, neck, head, antlers, forelegs of two pieces, hind legs of three) with five poses: stand, lie, gather, leap, land. The fawn is the same creature at about half size, lying, with small antlers. Its body's triangles are sorted from rump to chest, so it can be hidden from the rump forward as it unravels. Solid vines trail behind it and thin as they age.
- `src/I98c_garden.js`: the garden. Each flower is its own small mesh whose points slide from a twisted bud to the open trumpet. The vine is one braid shown outward from where each seed fell.
- The book can now float at her left side with four leaves fluttering (`bookFloat`, `PAGES`).
- The page can move the camera at given seconds of a spell (`SPELL_CAM`), because a phone is too narrow to hold the Guardian, her and the foe at once.
- The Thornwake briar and Bramble Cradle can reuse the braids and the growing trick.

## Checked

- Pass-through meter on both spells: legs at the standing floor (about 100 points, 10 mm), crouch included. Sleeves the same as the stage eleven spells. The Garden's book 0. In the Guardian, 82 points up to 4 mm of her left palm under the book, hidden.
- Full page test at phone size: no errors, all four spells play.
- Both spells photographed on a phone-size page in the smooth look and in the Flipbook look: no errors.

## Honest limits

- First builds, timed from still pictures. I cannot watch them play. Not tried on a real phone.
- The Guardian passes between her and the camera for about a third of a second as it leaps, and hides her.
- Its feet are not pinned to the ground, so they may slide a little as it gathers to leap.
- Its head is plain: a smooth muzzle with ears and glowing eyes. H9's face has more bark and shape.
- In the Flipbook look the 56 shared colours have no green. The Guardian's leaves turn yellow and the garden's vine and leaves turn grey-blue. The flowers and the wood read well.
- The dummy and the grey friends are still plain shapes.

## Next, in Chris's order

1. **Thornwake** (H14, H15, I7, I8): her one damage spell. The dagger, witchfire, the briar.
2. **Rootbound Return** (H13): she brings a fallen friend back.
3. **Bramble Cradle** (H16): her guard.
4. **Being hit, falling, winning** (H17, H18).

Still waiting on him from before: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain seam (B3, as built).
