# Io 3D, stage eight: the party's moves, and her book appears only when she reads

November 13, 2026. Follows `claude/io-3d-stage7-book-blades-and-next-order.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `696b62f`.
One-file copy sent to Chris: `Io_3D_stage8.html`. Picture sent: `Io_stage8_party_moves.jpg`.

## What Chris said

"So I think that her book should like appear when she does the read her book animation. I don't think she should just be holding it, in the same way that I think her sickle should just appear, which it kind of does. Let's do the party moves and that adjustment."

Earlier the same evening: "We also need to do the motions that the rest of the party do, like there's squat, there's kneel, there's hover, and jog. And I like the idea that they all can hover, and it's like a crisscross magical meditation."

## Rules to keep

1. **She carries nothing by default.** Her book and her sickle appear when a move uses them and go when it ends. This replaces stage seven's book held in her left arm and floating beside her.
2. **All four witches can hover, and the hover is a cross-legged magical meditation.**
3. The whole party shares four moves: jog, squat, kneel, hover.

## What changed

- **Book.** It is shown only while she reads. It grows out of nothing in front of her as she starts, and shrinks away when she stops. She no longer holds it while standing, and it no longer floats beside her in other moves.
- **Jog.** Her walk made quick and light: a longer stride, knees higher, elbows bent, a little lean.
- **Squat.** Down on her heels, feet a little apart, leaning in, hands on her knees. She stays until another move is picked.
- **Kneel.** Right knee down, left foot forward, left hand on her raised knee. She stays.
- **Hover.** She floats 30 cm up, rising and falling a little, cross-legged with her knees wide and her shins crossed in front, hands open on her knees, eyes shut, a small smile. She stays.
- Each of the four slides in and out, so she does not snap between them.
- On the page they are the last four Moves buttons.

## Honest limits

- First drafts, tuned from still pictures. I cannot watch them play. Not checked on a real phone.
- In the hover her boots cross in front of her and may pass through each other or through her skirt a little.
- In the squat and kneel her cloak and skirt pile on the floor by the simple floor rule; they do not fold.
- I did not look at how the Jester's, Fox's and Ranger's versions of these four are built, so hers may differ from theirs in height, timing or pose. That comparison is still to do.
- The full page test was not run again for this stage. The quick check passed: the page loads at phone size and plays the hover with no errors.

## Checked

- Stills of jog (side), squat, kneel, hover (front, side, with and without cloak), and the book appearing at the start of the read.

## Where things are

- `body()` in `src/I99_static.js`: the weights `jg`, `hSq`, `hKn`, `hHv`; the `knee(S)` point for hands; the hover's thighs set by direction and hinge axis (a basis, not angles).
- Book: `bookPlace`, `propVis`, `BK_FLOAT` (now empty) in the same file.

## Next, in Chris's order

1. His eye on the four party moves and on the book appearing.
2. Compare the four with the other witches' versions and bring them into line where they should match.
3. Her emotions: the faces in C10.
4. Her spells and attacks (H1 to H18, I1 to I8, round 4): the pendant becoming the sickle, the dagger drawn with witchfire, the book with its pages turning.

Still waiting on him from before: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain seam (B3, as built).
