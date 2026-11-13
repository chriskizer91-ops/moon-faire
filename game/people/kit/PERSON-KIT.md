You make a background person for a painted fantasy game by filling in one small JavaScript object. A finished 3D character is the template: her skeleton, her moves, her body, hands, head and boots are reused. You give the new person colours, skin, a repainted face, hair, headwear and clothes. This is a person the player walks up to and talks with, so they are looked at closely: they must read as one particular person, with a clear silhouette, a few well-chosen colours, clothes that sit properly on the body with smooth curves, and two or three telling details (a collar, a trim, a brooch, a pocket, a patch, a tied knot).

Reply with one JavaScript code block and nothing else. It must define `const PERSON = { ... };` in the format below. No other statements, no imports, no comments longer than a few words.

## The body you start from

Metres. y is up, the ground is y = 0. She faces +z. Her LEFT is +x. She stands 1.65 tall in a relaxed A-pose.

- Head: centre (0, 1.555, 0). Half-width 0.070. Top of skull y 1.645, chin y 1.415. Face front z +0.098, back of skull z −0.083. Neck y 1.34 to 1.41, radius 0.048.
- Torso half-sizes at each height, as [y, half-width, half-depth front, half-depth back]: [1.315, 0.138, 0.074, 0.088] shoulders; [1.215, 0.134, 0.106, 0.094] chest; [1.14, 0.120, 0.095, 0.088]; [1.04, 0.106, 0.082, 0.082] waist; [0.95, 0.148, 0.095, 0.106]; [0.87, 0.165, 0.100, 0.118] hips; [0.79, 0.150, 0.095, 0.110].
- Arms hang 15 degrees out from straight down. Left arm: shoulder (0.150, 1.300, −0.008), elbow (0.213, 1.063, −0.008), wrist (0.272, 0.846, −0.008), fingertips near (0.31, 0.70, 0). Arm radius 0.05 at the shoulder, 0.047 at the elbow, 0.026 at the wrist. The right arm is the mirror (x negative).
- Legs: centre x = ±0.085. Radius 0.09 at y 0.87, 0.06 at y 0.70, 0.045 at the knee (y 0.47), 0.037 at y 0.26. Boots cover y 0 to 0.30 and reach z −0.09 to +0.17, about 0.055 wide.

The body is always there, fully dressed in close-fitting cloth: a top (`torso`, shoulders to hips, high neck), upper sleeves (`sleeve`), forearms (`forearm`), legs (`legs`, tight like hose or narrow trousers) and boots (`boots`, `soles`). You colour these. Anything looser (skirt, robe, tunic hem, apron, hat, hair, beard, belt, cloak, bag) you add as parts.

## Format

```js
const PERSON = {
  name: 'Lamp-seller',
  height: 0.94,            // 1 = 1.65 m. Keep between 0.85 and 1.12
  build: [1.08, 1.06],     // [width, depth] of the whole body. 0.9 thin, 1 as she is, 1.25 stout
  head: [1.04, 0.97, 1],   // optional [width, height, depth] of the head
  skin: '#c9967c',         // the template's own skin is #d99f91. Any skin colour works
  colors: { torso: '#3f4a2e', sleeve: '#3f4a2e', forearm: '#d9cfb9', legs: '#4a3b32', boots: '#2b1f1a' },
  parts: { skirt: { color: '#8a4226', rough: 0.95 }, apron: '#e3d9c2', hair: '#9a9590',
           kerchief: { color: '#c58f2e', pattern: { kind: 'dots', color: '#f0deb0', n: 6 } }, belt: '#2b1f1a' },
  face(F) {
    F.lips('#b08078', 0.75); F.brows('#a8a29c', 0.75, 13); F.eyes('#6b5a3c', 0.6);
    F.lines(0.85); F.underEye(0.3); F.blush('#c06a5c', 0.14); F.mole(640, 590, 6);
  },
  make(K) {
    K.shell('skirt', [[1.05, 0.116, 0.092, 0.092], [0.98, 0.150, 0.125, 0.130], [0.86, 0.185, 0.160, 0.170], [0.60, 0.230, 0.200, 0.215], [0.34, 0.265, 0.230, 0.245], [0.16, 0.285, 0.245, 0.262]], K.w.skirt, { n: 28 });
    K.panel('apron', [[1.035, 0.132, 0.112], [0.86, 0.198, 0.174], [0.60, 0.244, 0.214], [0.38, 0.272, 0.238]], -52, 52, K.w.skirt);
    K.shell('belt', [[1.075, 0.126, 0.104, 0.102], [1.035, 0.140, 0.120, 0.116]], K.w.torso);
    K.panel('hair', [[1.640, 0.030, 0.040, 0.040, 0, -0.010], [1.615, 0.066, 0.078, 0.082], [1.560, 0.079, 0.092, 0.096], [1.500, 0.078, 0.086, 0.094], [1.450, 0.066, 0.070, 0.086]], 62, 298, K.w.head, { n: 22 });
    K.ball('hair', [0, 1.505, -0.105], [0.046, 0.044, 0.040], K.w.head);
    K.panel('kerchief', [[1.662, 0.012, 0.014, 0.014, 0, 0.004], [1.648, 0.050, 0.060, 0.062], [1.615, 0.074, 0.092, 0.090], [1.575, 0.084, 0.103, 0.100], [1.545, 0.086, 0.100, 0.102]], -62, 242, K.w.head, { n: 26 });
    K.panel('kerchief', [[1.662, 0.012, 0.014, 0.014, 0, 0.004], [1.648, 0.050, 0.060, 0.062], [1.615, 0.074, 0.092, 0.090], [1.575, 0.084, 0.103, 0.100], [1.545, 0.086, 0.100, 0.102]], 238, 300, K.w.head, { n: 8 });
  },
};
```

That example is a complete, working person: an old woman who sells lamps, in a dotted kerchief with her grey hair in a bun, a green top, a long rust skirt and a cream apron.

## colors

Keys: `torso`, `sleeve`, `forearm`, `legs`, `boots`, `soles`. A value is a hex colour, or `'skin'` for bare skin (bare forearms: `forearm: 'skin'`; short sleeves: `sleeve` too; bare legs: `legs: 'skin'`), or a material object as in `parts`.

## parts

Each key names a material that `make` uses. A value is a hex colour or `{ color, rough, metal, pattern }`. `rough` 0.3 is shiny leather, 0.9 is wool (the default). `metal: 1` for brass, gold, steel. `pattern`: `{ kind: 'stripes' | 'hoops' | 'check' | 'dots', color, n }` (`stripes` run down the cloth, `hoops` run round it, `n` is how many repeats).

## make(K): the shapes

Every shape takes the material key first and is drawn in the standing pose. Shapes are two-sided thin surfaces.

- `K.shell(key, rows, weight, { n })`: a tube of cloth through rings, top to bottom. Each row is `[y, halfWidth, halfDepthFront, halfDepthBack, centreX, centreZ]` (the last three are optional). Use it for skirts, robes, tunics, belts, collars, hat crowns and brims. Add `{ capFirst: true }` or `{ capLast: true }` to close the first or last ring (a hat top).
- `K.panel(key, rows, fromAngle, toAngle, weight, { n })`: the same, but only part of the way round. Angles in degrees: 0 is her front, 90 her left, 180 her back, 270 (or −90) her right. Use it for aprons, hair that leaves the face open, hoods, cloaks, a beard, a bib.
- `K.tube(key, points, radii, weight)`: a round tube along points `[x, y, z]`, with one radius per point. Use it for a staff, a strap, a scarf end, a braid, a hat feather, rolled sleeves.
- `K.ball(key, [x, y, z], [rx, ry, rz], weight)`: a ball or egg. Use it for a bun, a pom-pom, a nose, a belly, a pouch, a bead.
- `K.beard(key, style)`: a ready-made beard shape under the mouth: `'short'`, `'full'` or `'long'`.
- `K.hair(key, style, { underHat })`: ready-made hair fitted to the head. `style` is `'short'`, `'bob'` (to the jaw), `'long'` (down the back), `'bun'` or `'topknot'`. With `underHat: true` the crown is left off so a hat or scarf can sit on the head. The head is BALD unless you add hair, a hood or a hat that covers it.

`weight` says which bones a shape follows:

- `K.w.head` for anything on the head. `K.w.hair` for long hair or a veil that falls past the neck.
- `K.w.torso` for anything on the trunk above the hips (it bends with the spine).
- `K.w.skirt` for anything that hangs from the waist over the legs (it swings with both legs).
- `K.w.bone('name')` to fix a shape to one bone: `hips`, `spine3` (chest), `neck`, `head`, `uarmL`, `farmL`, `handL`, `thighL`, `shinL`, `footL` (and the same with `R`). A bracelet goes on `farmL`; a staff in the hand on `handR`; a puffed sleeve on `uarmL`.

## Rules that keep it clean

- Keep every layer at least 0.008 m outside what is under it, all the way round, or the two surfaces flicker. Check each row against the torso and head sizes above. Ready-made hair is half-width 0.081, front 0.099, back 0.097 at its widest (y 1.56 to 1.60). A hat or scarf over the head needs half-width at least 0.089 and depths at least 0.107 front and 0.105 back from y 1.56 to 1.61, and should not come lower than y 1.585 at the front or it covers the eyes.
- The body has a woman's narrow waist. For a man, a stout person or anyone in a coat, cover the trunk with a straight `shell` (a tunic, jerkin, coat or shirt body) from y 1.30 down past the hips, and use `build` for width.
- Anything you shape by hand around the head must leave the face open: the face spans angles −55 to 55 between y 1.42 and 1.60.
- A skirt or robe hanging below the hips needs half-width 0.20 or more and half-depth 0.19 or more from knee height down, or the knees come through when walking.
- The top ends in a square edge below the hips. Hide it with a tunic or coat hem, an apron or a skirt, unless the person wears a tucked-in shirt and a belt.
- Shapes do not blow in the wind; keep hanging things short or close to the body. Nothing below y 0.03.
- Use 6 to 16 shapes. Give a long garment 6 or more rows so its curve is smooth, and `n` of 24 to 32. No loops that make dozens of shapes.
- What suits this body best: long skirts, robes, coats, aprons, shawls, wraps, headscarves and hats. Shape the clothes to the person's age and trade; do not leave the bare template body as the whole costume.
- Things held in a hand: the right hand rests near (−0.30, 0.74, 0.0); a staff can run from (−0.30, 0.02, 0.06) to (−0.30, 1.75, 0.02) on `K.w.bone('handR')`, but it will swing with the arm when walking, so prefer things worn over things held.

## face(F): repainting the face

The face is a painting of a young woman's face, 1024 × 1024, with the make-up removed. You paint over it; the skin colour is applied afterwards for you. Useful points (x, y in pixels): eyes at (356, 309) and (668, 309); brows at y 236; nose tip (518, 500); mouth (518, 652); chin (518, 800); cheeks (300, 480) and (735, 480); forehead (518, 150).

- `F.lips(color, strength)`: lip colour. `F.lipShade(strength)` darkens them instead.
- `F.brows(color, strength, width)`: brows. Width 10 is thin, 22 is heavy.
- `F.eyes(color, strength)`: the colour of the irises.
- `F.eyeshadow(color, strength)`, `F.underEye(strength)` for tired or older eyes.
- `F.blush(color, strength)`: cheeks. 0.1 is faint, 0.4 is ruddy.
- `F.lines(strength)`: the lines of age. 0.3 is forty, 0.9 is very old.
- `F.freckles(count, color, strength)`, `F.mole(x, y, radius)`.
- `F.beard(color, strength, 'stubble' | 'beard')`: a moustache and chin hair painted flat round the mouth (the painting does not reach the jaw). For a real beard also call `K.beard` in `make`.
- `F.pale(strength)`: a paler, cooler face.
- `F.air(x, y, radiusX, radiusY, color, strength, mode)`: one soft airbrushed oval, for anything else. `mode` is `'multiply'` to darken, `'screen'` to lighten, `'color'` to tint, or `'source-over'` to cover.
- `F.stroke([[x, y], [x, y], [x, y]], color, strength, width)`: one soft dark line (two points, or three for a curve).

The face cannot change shape here; use `head` for a wider, longer or smaller head, and hair, hats and beards for the rest.

## When you are shown pictures

After your first answer you may be shown one picture of the person as built: front, three-quarter, side, back, walking, and the face twice, with a note of any errors. Look for: the wrong silhouette for the description; body or clothes poking through a layer; a hat or hair cutting into the face or floating; colours that do not read; anything that looks broken when walking. If it is right, reply with the single word `DONE`. If not, reply with the whole corrected file in one code block.
