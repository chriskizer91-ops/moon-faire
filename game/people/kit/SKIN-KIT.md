You fit a painted skin onto a simple 3D person for a painted fantasy game. A painter has painted one body sheet over a grey guide of the model: the person from the front on the left half, from behind on the right half. A separate face picture has been laid onto the face. The body sheet is read onto the model by position: every point of the model that faces forward takes the colour at its own place on the front figure, every point that faces back takes it from the back figure. A first automatic fit has been made. Your job is to look at the result and write the small file that finishes it.

You are shown the painter's body sheet, then a picture of the person as built with the skin on: front, three-quarter, side, back and walking, then the face from the front and from three-quarters. You are told the names of the model's parts.

Reply with one JavaScript code block that defines `const SKIN = { ... };` and nothing else, or with the single word `DONE` when the picture you are shown is right.

```js
const SKIN = {
  front: { scale: [1, 1], move: [0, 0] },   // the front figure on the model. scale [wider, taller] about the middle of the body; move [right, up] in metres as seen in that view. The person is 1.65 m tall
  back:  { scale: [1, 1], move: [0, 0] },   // the same for the back figure
  face:  { scale: 1, move: [0, 0] },        // the face picture on the face: move [right, down] in pixels of a 1024 x 1024 picture. The eyes sit about 310 pixels apart
  skin: '#bd7c67',                          // the colour of the neck, ears and hands. Match it to the painted face
  flat: { soles: '#2a1d16' },               // parts painted one flat colour instead of from the sheet: part name -> colour
  rough: { boots: 0.5 },                    // how matt a part is: 0.3 polished leather or metal, 0.9 wool (the default is 0.86)
  seam: 0.2,                                // how softly front and back meet at the sides: 0.05 a hard line, 0.5 a wide blend
  move: { hat: [0, -0.03, 0] },             // move a part of the model, with its paint: [to her left, up, forward] in metres
};
```

Leave out anything you do not want to change; `const SKIN = {};` keeps the automatic fit.

What to look for, in order of how much it matters:

1. Painted things on the wrong part. A painted belt should lie on the belt, a hat band on the hat, a hem at the hem, cuffs at the wrists. If the whole figure sits a little high, low, wide or narrow, fix it with `move` and `scale` (small numbers: 0.01 is one centimetre; scale between 0.95 and 1.05). Front and back are fitted separately.
2. A part that shows the wrong picture. Hair or a headcloth around the face often picks up the painted forehead, brows or cheeks of the sheet's small face; a beard shape picks up the mouth; a small thing that sticks out forward (a buckle, a lantern, a knot, a pouch, a hat brim seen from below) picks up whatever is painted behind it. Give such a part a `flat` colour chosen from the painting. Use `flat` only where the sheet clearly gives the wrong result: the painted cloth is the point, and a flat part looks plainer.
3. Skin. The hands and neck must match the painted face: set `skin`.
4. The face. If the eyes, nose or mouth sit off the head's own eyes, nose and mouth, nudge `face` by a few pixels.
5. A hard line or a smear where front and back meet at the sides: adjust `seam`.
6. A hat, cap or headcloth that sits too high. It should sit on the head, its front edge just above the brows (the brows are 1.545 m up, the eyes 1.525 m, the top of the skull 1.645 m), never over the eyes. Hats built on this template usually perch about 3 cm too high. Use `move` on every part that makes up the hat (crown, brim, band, feather, pom-pom), all by the same amount so they stay together.

You cannot change the shapes, the painting or the light. Do not try to fix those. Two looks are usually enough; say `DONE` as soon as what remains is small.
