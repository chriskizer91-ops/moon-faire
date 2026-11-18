# The Ranger in 3D, stage 2d: a fidelity pass on her head

November 12. Follows `claude/ranger-3d-stage2c-new-face.md`.

## What Chris asked

"Her hair band is floating above her forehead and I think she needs another head and face fidelity pass."

## What changed

- **Headband.** It was wrapped round the outside of her hair everywhere, so at the front it stood off her forehead. Now it lies on her skin wherever there is no hair under it, and on her hair elsewhere, pressing the hair flat beneath it. The gem and the little drop moved with it. (`bandPt` in `src/R41_hair.js`.)
- **Neck.** Her neck now leans forward as it rises, front and back, as in the side view of J3. Before, it stood straight up like a post.
- **Neck colour.** Her neck and the very top of her chest take the tone painted on her neck in J3, which is a little darker and warmer than her chest. The sides of her neck wear J3's profile painting.
- **The line across her neck.** The neck leans from its foot and the top of the chest does not, so the light broke in a line where they meet. The lowest rows of the neck now take the chest's surface direction at the join. No shape was changed for this.
- **Hair.** Rounder on top, fuller at the back of the head and at the nape.
- **Back of her neck.** The shadows of loose hair and of the band's tails, which came from the body painting, are gone.
- **Glasses.** The lenses are fainter, so her eyes read more clearly.

Her body, base outfit and hands were not reshaped.

## How it was checked

A new tool, `tools/cmp_j3.py`, lays her head over J3's front and side views at one scale and prints widths and depths by height.

| Where | Model | Painting (J3) |
| --- | --- | --- |
| Jaw width | 0.094 m | 0.096 m |
| Width below the ears | 0.112 m | 0.117 m |
| Width across the ears | 0.166 m | 0.161 m |
| Brow, forward of the body's middle line | 0.092 m | 0.090 m |
| Cheek, forward | 0.092 m | 0.094 m |
| Chin, forward | 0.084 m | 0.089 m |
| Back of the hair at 1.54 m | -0.127 m | -0.124 m |
| Nape at 1.43 m | -0.066 m | -0.061 m |

The page was opened in a phone-size browser on the build machine: the six face buttons work and a drag turns her. It has not been tried on a real phone by me.

## Where the paintings disagree, and which one rules

- J3's shoulders sit about 3 cm lower than B1's, which makes a longer neck. The body paintings rule, because the body is approved.
- J3's neck is about 1 cm narrower just under the chin.
- J3's bun is smaller and lower than C3's. The hair still follows C3 and A1.
- Her chin is the Jester's chin, about 5 mm shorter than J3's, because the head is the Jester's face model by Chris's choice.

## Still rough

- Her hair is still painted from C3, C5 and C8, not from J3. A hair pass from J3 is waiting for his word.
- A faint line shows where forearm skin meets hand skin, until both are painted from D1 and D2.
- The shoulder strap blurs at the side of the shoulder. That is from stage one's body painting and was not part of this pass.
- No teeth in any of her mouths. That was my choice in the face prompts; Chris has not said either way.

## Where things are

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (same link as every stage). One offline file: `Ranger_3D_stage2d.html`.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commits `b43d21a` and `3958882`.

## Next, in the how-to's order

Hands and painted arms (D1, D2), boots again, strap hooks, belts, satchel and pouch, cloth, jewellery, weapons, then movement.
