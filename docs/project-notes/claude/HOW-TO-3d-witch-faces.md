# How the Jester's face was made, step by step

For the sessions building the Ranger, the Fox and the Herbal Witch. This goes with `HOW-TO-3d-witch-models.md`, which gives the
face only a few lines. Written November 12, 2026. The working code is in `models/jester-3d/src/40_head.js` (shape),
`bake.py` (pictures) and the `face` material in `src/70_anim.js` (mixing); read them beside this.

## The idea

The face is three things laid exactly on top of each other:

1. **A head whose side view is her painted profile**, to the millimetre.
2. **Shallow relief** (a few millimetres) for nose, eye sockets, eyeballs, cheekbones, lips and chin, placed on the same
   landmarks the painting uses.
3. **Her front painting laid on flat from the front**, with the profile painting only at the far edge of the cheek and plain
   skin under the jaw.

Most faces that look wrong have one of these out of step with the others: paint on a smooth head, relief that does not sit
under the painted feature, or a painting used where it cannot see. The paint makes her look right from the front. The
shape makes her look right from everywhere else, and that is where Chris looks: his first note on the Jester was that she
looked perfect head on and wrong from 45 degrees, from the side, from above and from below.

## Step 1. One set of landmarks, used by everything

Pick the neutral, evenly lit front face. Read these off it in pixels on a gridded copy (`lib/grid.py`; automatic finding
failed on painted faces): both pupils, the line between the lips, the brow, the bottom of the nose, the chin.

- The scale comes from two of them. For the Jester: eye line to lip line is 0.066 m, which gave pixels per metre.
- The middle of the face is halfway between the pupils.
- `bake.py` writes these out as `layout` (`eyeY`, `eyeX`, `mouthY`, `noseY`, `browY`, `chinY`), and the head code reads the
  same numbers (`FC`). **The sculpted eye socket and the painted eye are placed from one number.** If the shape code has its
  own guesses for where the eyes and mouth are, the two drift apart and the face looks doubled or dead.

## Step 2. The head as rings

One ring of points per height, from crown to chin (`headPoint(angle, height)`).

- **Width from the front** follows the front painting's outline, narrowing by about 16% toward the jaw.
- **The middle line is her profile** from the side painting, with the nose and lips taken off (`FACE_MID`, a table of
  height and how far forward). The nose is its own table (`NOSE`, with `NOSE_W` for its width at each height), so it can be a
  narrow ridge on a broad face.
- **How the face turns back toward the ears** is a third table, `FACE_V`, one number per height:
  `z = zc + rz * (c - v * s*s * c^1.5)`, where `c` and `s` are the cosine and sine of the angle round from the front. A
  larger `v` makes that height fall back sooner as the face turns, which gives a narrower, more pointed face there; zero is
  round; a negative `v` is fuller. The Jester's run from about 0.4 around the mouth and jaw, to near zero at the cheekbones,
  to about -0.12 at eye level. **This table is what fixes a face that is right from the front and wrong at 45 degrees.**
- **The lower head sits forward** by `0.050 * t^3` (t runs from 0 at about brow height to 1 at the chin), so the chin hangs under the
  mouth while the corners of the jaw stay back by the ears. Behind the ears this shift is faded out, so the back of the head
  runs straight down into the nape.
- **Spend the mesh on the face.** 256 columns by 168 rings at full detail. Columns are crowded toward the front with
  `angle = PI * (0.35 v + 0.65 v^3)`, and about 72% of the rings lie below the top of the forehead.

Check with `prof_cmp.py`: it lays the model's middle line over the painted profile and prints the gap by height. Bring it
within 1 mm from brow to chin. Run it again after every change to the head.

## Step 3. Relief, as small bumps and hollows

On top of the rings, add soft bumps (`G` is a bell shape: centre, then width across and width up). Each is placed from the
landmarks of step 1, and all of them fade out as the surface turns to the side. These are the Jester's, in metres, as a
starting point; `ax` is distance from the middle line, `Y` is height.

```js
d += spline(NOSE, Y) * Math.exp(-Math.pow(x / spline(NOSE_W, Y), 2));                    // the nose ridge and tip
d += 0.0062 * G(ax - 0.0116, Y - (noseY - 0.0054), 0.0052, 0.0052);                      // wings of the nostrils
d -= 0.0014 * G(ax - 0.0186, Y - (noseY - 0.0040), 0.0030, 0.0066);                      // the fold where wing meets cheek
d -= 0.0030 * G(ax - 0.0062, Y - (noseY - 0.0096), 0.0030, 0.0021);                      // hollows under the nose
d -= 0.0064 * G(ax - eyeX, Y - eyeY, 0.017, 0.0105) + 0.0026 * G(ax - 0.014, Y - (eyeY - 0.002), 0.007, 0.010);   // eye sockets, deepest beside the bridge
d += 0.0030 * G(ax - 0.027, Y - (browY + 0.002), 0.026, 0.008);                          // brow
d += 0.0030 * G(ax - eyeX, Y - eyeY, 0.0105, 0.0066);                                    // the eyeball rounding out of its socket
d -= 0.0010 * G(ax - eyeX, Y - (eyeY + 0.0088), 0.014, 0.0024);                          // the crease of the lid above it
d += 0.0040 * G(ax - 0.043, Y - 1.4975, 0.020, 0.016);                                   // cheekbones
d -= 0.0022 * G(ax - 0.047, Y - 1.4670, 0.016, 0.014);                                   // the hollow under them
d -= 0.0010 * G(x, Y - (mouthY + 0.0135), 0.0034, 0.0055);                               // the groove under the nose
d += 0.0056 * G(x, Y - (mouthY + 0.0058), 0.020, 0.0054) + 0.0044 * G(x, Y - (mouthY - 0.0074), 0.016, 0.0054);  // upper and lower lip
d -= 0.0016 * G(ax - 0.024, Y - mouthY, 0.006, 0.008);                                   // corners of the mouth
d += 0.0026 * G(x, Y - 1.4300, 0.017, 0.0095);                                           // the ball of the chin
z += d * Math.cos(angle);
```

Rules:

- **Keep it shallow.** The largest is 6 mm. The painting already carries the shading; the relief only has to catch the light
  and break the outline. Deep relief stretches the paint and looks carved.
- Because nose and lips were taken off the profile table, add them back here and then run `prof_cmp.py` again: the total
  must still match the painted profile.
- An eye needs both the socket (in) and the eyeball (out). Without the second she looks hollow-eyed from the side.

## Step 4. Preparing the front painting

`bake.py` turns the front face into a 1024 by 1024 picture covering a window 0.2 m square (about 5 pixels a millimetre).

- Find what is **not skin** (hat, hair, backdrop: dark or grey pixels), grow that mask a little, and keep brows and eye liner
  out of it.
- **Carry the skin outward** past the edge of the face: blur the skin into the masked area at two sizes and fade to her
  middle skin tone. Without this, the dark of the hat or backdrop is pulled onto the cheek when the surface turns, as a dirty
  fringe.
- Record her skin tone, and separately **the tone along her jaw** (`skinJaw`), for the plain skin under it and on the neck.
- **Expressions:** only the eyes or the mouth are lifted from the expression sheet, as soft-edged patches set into the neutral
  face, with their tone matched to the neutral face around the rim. Nothing else moves when she blinks or speaks.

The picture is laid on **flat from the front**: `u` from sideways position, `v` from height. It is not wrapped round the head.

## Step 5. Three pictures, mixed by which way the skin faces

Every point of the head gets three numbers (`faceMix`), and one material blends by them.

- **Front painting** everywhere it can see. It is far sharper than the profile, so use it as far round as it will go.
- **Profile painting** only where the skin faces sideways (sideways part of the direction between 0.70 and 0.93) **and** the
  point is more than 34 to 50 mm from the middle line. The second test keeps it off the sides of the nose, where it smears.
  Its picture is anchored at the tip of the nose (1500 pixels a metre for the Jester), its edges are feathered, the eye is
  masked out of it, and its **tone is matched to the cheek of the front painting** (gain held between 0.70 and 1.20).
- **Plain skin** under the jaw only: where the skin faces down **and** is below the jaw line (about 1.444 m to 1.428 m for the
  Jester), and behind the ear line. The height test matters: the nose and lips have undersides too, and they must keep their
  paint.
- **Shade** under the jaw: the colour is dimmed by up to 40% there, and the neck is dimmed toward the chin, so the jaw reads
  as a jaw.

## Step 6. Look from eight sides, with the painting beside her

`fshots.sh` renders the head from the front, three-quarter, steep three-quarter, side, two from above and two from below;
`fref.sh` puts the paintings beside them. Do not show Chris a face that has only been checked from the front.

| What you see | The likely cause | What to change |
|---|---|---|
| Right from the front, wrong at 45 degrees | the cross-section, not the paint | `FACE_V` at cheek height; cheekbone and hollow |
| Flat, like a mask | no relief | eye sockets, eyeballs, lips, nose wings |
| Features look doubled or slightly off | shape and paint use different landmarks | one `layout`, read by both |
| Streaks down the side of the nose or cheek | front painting stretched where the skin turns away, or profile painting on the nose | the 34 to 50 mm test; shallower relief |
| Nose or lips go pale from below | plain skin put on anything that faces down | add the height test |
| A dark or pale fringe at the edge of the face | hat, hair or backdrop in the picture | carry skin outward in the bake |
| A step in tone on the cheek | profile painting lit differently | match its tone to the front cheek |
| Chin juts or sinks, jaw corners too far forward | the forward shift of the lower head | the `t^3` term; fade it behind the ears |
| Hollow eyes from the side | socket without eyeball | add the eyeball bump |
| Profile is right but the face is not | the two paintings disagree | let the profile shape the head, keep the front painting's face, and say which was chosen |

## What helped the Jester, and what is still rough

- Her cap hides her hairline and ears. A witch with open hair and ears has those as separate jobs; the face method is the same.
- Still rough on the Jester: in full profile her eye is the front eye seen edge-on; the strip of cheek by the cap uses the
  softer profile painting; her brows do not move.
- Once Chris approves a face shape, **do not reshape it while fixing details**. The Jester's jaw was slimmed after new
  paintings arrived and he had it put back the same day.
