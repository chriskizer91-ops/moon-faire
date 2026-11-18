# Fox Witch 3D – pass 9 (her head locked in; her own everyday moves)

Written by Claude, 13 Nov 2026. Follows `claude/fox-3d-pass8-neck-chest-head-options.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, commit `9509be2`.

## What Chris asked (13 Nov, 09:25 and 09:26)

- "Yes head size plus 15% and reshaping on so lock those in", then a minute later: **"10% head size."** So: head 10% larger, depth reshaping on.
- "What's left of her look."
- Her own moves: "so it's like her talk and she's not the jester". She "would have different moves than bow twirl", and "a different kind of laugh and a different kind of dance".

## Her head: decided

- **Head 10% larger, face reshaped in depth.** Built in as `HEAD_K = 0.935` and `FACE_DEPTH = 1` in `src/00_util.js`. The two switches on the page are gone. `headScale` and `faceDepth` can still be passed to `makeFox` for a comparison.
- This replaces Chris's 12 Nov rule that her head was only to be resized, never reshaped, and the size 0.85 measured off painting `R6_point`.
- **Against painting A1 the larger head is the closer one.** Her pupils are 54 px apart in A1, 47 at the old size and 52 now. Picture: `deliver/Fox_head_locked_vs_painting.jpg` (A1, before, now, at one scale).
- Hair, scalp and costume ears are the same meshes as the approved build (same vertex counts and sums). Only the face mesh changed.
- Fit at the new size, checked from twelve angles and in a nod, a laugh, a look round and a squat (`headfit.sh`): her chin clears the choker, her hair still covers her head, her glasses sit on her nose.

## Her own moves (first versions)

File: `src/88_foxmoves.js`. The Jester's talk, bow, twirl, laugh and dance are renamed `jester_talk` and so on and kept. On the page they sit in a second row, "The Jester's, to compare". **Drop them when Chris says so.**

**How she differs from the Jester.** The Jester plays to the back row: big, even, both arms wide. The Fox is a trickster who sews. One hand is busy while the other rests on her pouch or her shears. Her moves are small and quick and close to her face, and then she is still. Her head cocks like a fox listening. Her fingers pinch a thread or snip it. She keeps her eyes on you. She likes to ring her bells. (From `lore/discussion-notes.md`, "The Fox": playful, a fabric artist, scissors, needle and thread, a bell. Chris: "You are the artist channeling her as the character.")

| Move | In place of | What she does |
|---|---|---|
| Talk (11.5 s) | the Jester's talk | One finger up. She finds a thread in the air and draws it out, holds it up by one end and snips it twice with two fingers. "Who, me?" with her shoulders up. She pushes her glasses up and goes still. She flicks her bell twice. A wagging finger. A finger to her lips. Both hands flick open, low. |
| Laugh (3.4 s) | the Jester's laugh | A snicker she tries to hide: chin down and turned away, curled fingers over her mouth, the other arm across her middle. She folds over it, peeks to see how it landed, it gets away from her again, and she flicks it off. |
| Dance (5.4 s) | the Jester's jig | Four slow swaying steps, her weight on one hip and the far wrist shaking by her ear. A hop that turns her back to you, two bumps of her hips. A hop back round into a pose. |
| Curtsey (3.5 s) | bow | A foot slips behind, she dips, holds a fold of her trousers out and puts a finger to her lips. This is the gesture of painting J4. She keeps her head up and watches you, with one slow blink. |
| Pounce (4.6 s) | twirl | The way a fox takes a mouse. She crouches, her hips wiggle while her head stays still, she springs up and 40 cm forward, comes down with cupped hands on her catch, peeks in, looks up at you, and hops back. |

Names are working names and live in the page's list (`viewer/app.js`).

Picture: `deliver/Fox_her_own_moves.jpg` (stills of all five, labelled).

**Not seen in motion.** The test machine draws about two frames a second, so the moves were built and checked as stills. Timing came from arithmetic (a 30 cm jump is half a second in the air) and from the Jester's moves. Chris judges how they flow on his phone; "Half speed" on the page slows a move down.

## What is not done in the moves

- In the curtsey her fingers hold the trouser cloth but the cloth does not lift.
- The bell does not swing when she flicks it.
- She cannot wink: her eyes shut together.
- Wave, jump and the two small things she does when left alone (look round, settle) are still the Jester's.

## How the moves were made (for the next witch)

1. **Decide the character before the keys.** One paragraph on how she moves that the first witch does not. Every move is then tested against it.
2. **Use the workbench.** `bench.py` loads the model and runs a small script. `T.pose` applies a pose. `T.reach` moves a hand until a fingertip sits on a named point of her (lips, glasses, bell), for the lean and head turn she has at that moment. Hand keys are in root space and do not follow her head, so every touch has to be worked out this way. `bench/contacts.js` holds all seven and prints the numbers that are pasted into the moves file.
3. **Try hand shapes side by side.** Four variants, front and side, one picture. A "pinch" that looked right as numbers read as a hand on her chest.
4. **A pose that should hold needs two keys.** A channel left out of a key keeps gliding toward its next key. The first talk drifted through every gesture until each beat named both arms, head and lean, at its start and at the end of its hold.
5. **Look at stills from two sides** (`strip.py move views distance height seconds...`). The front alone hides a hand that is inside her chest.
6. **Her wide trousers hide her legs.** Hip and knee moves must be larger than on the Jester to show at all.
7. **A move that travels must come back in the air.** The pounce goes 40 cm forward. She returns with a hop, because feet that are on the ground cannot be slid back.
8. **A turn belongs in a hop.** The dance turns her only while both feet are off the ground.
9. Run every stance with every move (`check_moves.sh`, 84 pairs now), and open the single file at phone size with the network off (`test_single.py`).

## What is left of her look

1. Ruffles at her neckline and the green peplum under her corset are flat paint. In A1 the peplum hangs over the belt.
2. Her choker is plain. A1's has studs and a larger bell.
3. Under her jaw and the sides of her head are plain skin tone.
4. The tops of her shoulders are a few stretched pixels of strap colour.
5. Sleeves and pouch are rigid: the sleeve narrows at the shoulder when her arm goes up, and the pouch does not swing.
6. Hair and ears are approved for now. A1 beside the model shows the painting's ears larger and darker and its hair browner; left alone until Chris says.
7. Then round 3 (her tools in her hands) and round 4 (her spells as visual effects), and her three flipbook moves.
