# Io 3D, stage seven: her book, her dagger and her sickle; and the order from here

November 13, 2026. Follows `claude/io-3d-stage6b-coy-wave.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`.
One-file copy sent to Chris: `Io_3D_stage7.html`. Picture sent: `Io_stage7_book_blades.jpg`.

## What Chris said

1. "Yes, let's continue on to the books and blades. This looks good. I don't think we need to do detail to her boots. Her boots can be the same as the other, which they already look really good. Some more detail on the belt, pouches, and necklace. Not necessary considering how small they already are. But we do need to work on her emotions, the faces in C10, and her spells and attacks."
2. While that was being built: "We also need to do the motions that the rest of the party do, like there's squat, there's kneel, there's hover, and jog. And I like the idea that they all can hover, and it's like a crisscross magical meditation."

## Settled by this

- The coy wave looks good.
- **Her boots stay as they are.** No own-boots stage.
- **Belt, pouch and necklace need no more detail.**
- **All four witches can hover, and the hover is a cross-legged magical meditation.**

## The order from here

1. **The moves the rest of the party have:** squat, kneel, hover, jog. Look first at how the Jester's, the Fox's and the Ranger's are built, so hers match in what they are and stay her own in how she does them.
2. **Her emotions:** the faces in C10.
3. **Her spells and attacks** (H1 to H18, I1 to I8, round 4).

## What was built

- **Book (G1, G2).** Dark leather, gold corners, the gold star on the cover, cream pages with writing, a sprig and a leaf. She carries it shut in her left arm, as in G8.
- **Read her book** (a new move). She holds it open in front of her, looks down, follows the lines with a finger and turns a leaf now and then.
- **The book floats.** When a move needs her left hand or both hands (talk, tip her hat, curtsey, twirl, pick a herb), she lets go and it floats open at her left side. This is the rule in her prompts.
- **Dagger (G6).** In its black sheath with gold ends at her left hip, with the crescent guard. It swings on her belt.
- **Sickle (G5).** "Hold her sickle" (a new move) lifts it in her right hand: a golden crescent blade on a dark grip.
- Held still, for checking against the paintings, she carries nothing.
- "Book and blades" under Show takes them off.

## Honest limits

- A first build. Her fingers do not wrap the book or the sickle's grip exactly.
- The dagger cannot be drawn yet. The sickle simply appears in her hand; the pendant does not turn into it yet.
- The book changes from shut to open in one frame.
- Tuned from still pictures; not watched playing. Not checked on a real phone.

## Checked

- Stills of her holding the book, reading, holding the sickle, the book floating during a curtsey, and her hip from the side.
- The one-file page at phone size on the build machine: all twelve Moves buttons start their moves, the new switch and the old ones work, a drag turns her, no errors. 236 bones; one frame of walking costs 0.27 ms of script there.

## Where things are

- `src/I47_props.js`: book parts (`bookShut`, `bookOpen`, pages, ribbon), `bookCoverTexIo`, `bookPageTexIo`, the dagger, the sickle.
- `src/I99_static.js`: `bookPlace`, `BK_FLOAT`, `propVis`, the `read` and `sickle` blocks of `body()`, `setProps`.

## Still waiting on Chris from before

- Glasses bigger and bolder as in A1, or as built?
- Bodice back laced (F7) or a plain seam (B3, as built)?
