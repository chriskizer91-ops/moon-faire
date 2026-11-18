# Ranger 3D model: stage two, head, face, hair, headband and glasses (November 12, 2026)

Read after `claude/ranger-3d-stage1-body.md`.

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (version `1794513939-a4e8`; the page is now titled "The Ranger 3D").
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`, commit `b9415c7`.
  Its `README.md` has the code-level detail, every scale and landmark, and the build commands.
- File sent to Chris: `Ranger_3D_stage2.html` (4.4 MB, opens offline).

## What Chris said (his words)

- On stage one: "This looks very good so far on to her head, face hair, headband and glasses."
- "The transition from the hand to the forearm is a little weird at the wrist, but the hands look really good already and that
  was took a whole session to do the gesture witch so we're doing good. Let's move on to the face"

So her **body and base outfit are approved**. Do not reshape them without asking. The hands were left exactly as they are.

## What was done

- **Head shape.** Rings by height, as for the Jester. The middle line of her face is her profile traced from C3; the width at
  each height is read off C1. From brow to chin the model is within 0.4 mm of the painted profile.
- **Face.** C1 from the front, the C3 profile on the sides, plain skin under the jaw, mixed by which way the skin faces. The
  headband, gem and earrings are painted out of both, because they are real objects.
- **Ears**, shaped and painted from the profile.
- **Hair.** One shell that swells into the bun. It wears four paintings at once (C3 profile, C3 front, C5 from behind, C8 from
  above), each laid on from its own side. Eight loose locks a side, drawn in code as wispy ribbons.
- **Headband** wrapped round in a tilted plane, with its knot and two tails; the turquoise in its gold setting; the drop on her forehead.
- **Glasses**: thin wire, lenses 46 by 39 mm (from C2), lilac tint. The page has a button to take them off.
- **Wrists.** The forearm narrows above the joint, then widens into the heel of the hand and runs on inside it.
- **Page.** A row of Head views (Face, Three-quarter, Profile, Back of head, From above, From below, Head and shoulders), each
  with its painting beside her; a Glasses button; new lists of what is there and what is not.

Triangles: 328,588.

## Scales and landmarks fixed this stage

- C1: 4541 pixels a metre (from her pupils, 61 mm apart in A1 and B1), middle x 633.5, eyes y 628.
- C3 profile: 1837 pixels a metre (eye to chin made equal to C1), eye y 381, tip of the nose x 1498.
- Heights: under the chin 1.405, mouth 1.4494, under the nose 1.466, tip of the nose 1.4805, eyes 1.512, brows 1.525, ear 1.4636 to
  1.5218, middle of the band on the forehead 1.589, knot 1.4935, top of the bun about 1.67.
- Forward of the body's middle line: tip of the nose 0.107, ear line -0.0215 (B2 agrees with C3 on this to a millimetre).
- Stage one had guessed the chin at 1.428. The paintings put it at 1.405.

## Where the paintings disagree, and what was chosen

- C1 and the profile differ by 2 to 3 mm in the heights of nose and mouth. The profile shapes the head, and C1's rows are moved to fit it.
- C3's front view is a little larger than C1 and shows wider hair. C1 is the master.
- The view from behind (C5) is painted wider than the front views allow. It is used for the hair picture only, squeezed to fit.
- The glasses in A1 have bigger lenses and a narrower bridge than in C2 and C12. C2 was followed.
- B1's small face is about a centimetre shorter from eye to chin than A1, C1 and C3. B1 was not used for the face.

## Checked, and not checked

- Profile against C3, millimetre by millimetre (`tools/prof_cmp_r.py`). Head outlines against C3 from the side and the front
  (`tools/cmp_head.py`). Stills from front, three-quarter, side, back, above.
- The page ran in a headless browser at phone and laptop size: no errors, nothing off the side of the screen, every button
  pressed, and a drag turns her.
- Not checked: on a real phone. Nothing moves yet.

## Rough, and known

- Her face does not move: no blink, no expressions. C10 and C11 are ready for that.
- The hair has a smooth edge. The fine flyaway wisps in the paintings are missing, and from the front the painted loose hair
  spreads about 1.5 cm wider on each side than the model's. The loose locks are simple.
- The bun is a smooth mound, not a ball with a waist under it.
- Just behind the band the hair picture is folded-over texture and can read as crimped.
- From the front the hair above the band is a little tall and flat-topped.
- A faint line remains where forearm skin meets hand skin, until both are painted.
- A pale smudge at the base of the back of her neck, left from stage one.
- Not built: earrings, necklaces and the rest of the jewellery; painted arms and hands; belts, satchel, pouch; cloth; weapons; movement.

## Tried and dropped

- Cutting the loose hanging hair out of the paintings as see-through cards. Strands that cross skin could not be told from the
  skin by colour, so most of them were lost. The locks are drawn in code instead.
- Loose locks as round tubes: they read as cords. Flat twisting ribbons with gaps between the strands read as hair.

## Rules learned this stage

| What happened | Rule |
|---|---|
| The head's lower back made a flat floor behind the jaw | Below the ears, tuck the back of each ring in to the neck. |
| Hair hung below the band like a visor | The band holds the hair flat: thickness must be small at the band and lift only behind it. |
| Filling outside the painted hair from its edge gave pale shards | The wispy edge is half background. Fill from well inside the hair. |
| Painting the band out with an average gave streaks | Fold the hair next to the band over it instead. |
| A spike stuck out of the wrist | When a tube gets an end cap, give the cap's point the weights of that end, not of the start. |
| The forearm poked through the back of the hand | Measure the hand's own cross-section at the wrist and shape the arm's end to it. |
| The page test timed out, then reported no drag | Under software rendering, take clipped page screenshots, not element screenshots, and scroll back to the stage before a drag. |
| The second bake kept pictures from a dropped trial | `bake_head.py` adds to the file `bake_ranger.py` writes; run them in that order and clear trial keys. |

## Choices still waiting for Chris

Everything listed in `claude/ranger-3d-stage1-body.md` under "Choices waiting for Chris" except the base outfit, which he has
now approved: leggings from B3, nine eyelet rows, the folded bow curling like fern tips, the sword and knife designs and where
she carries them, the offered additions, and Silverglass.

## Next stages, in the how-to's order

1. Hands and painted arms (D1, D2).
2. Boots against E1 to E8 once more.
3. Strap hooks, belts, satchel and pouch as solid things.
4. Sleeves and headband tails as cloth.
5. Necklaces, earrings, charms, bracelets.
6. Bow, sword, knives (G1 to G7).
7. The Jester's body moves in her clothes, and a face that blinks and changes expression.
8. Her own moves and spells with effects (I1 to I6).
9. The full page.
