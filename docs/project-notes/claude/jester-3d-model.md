# Jester 3D model

Artifact: **Jester Witch 3D**, https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M
First build, second pass, sheer-veil update and bake pass 1 on November 10, 2026; bake passes 2 to 6 on November 11, 2026.

## What it is

A code-built three.js r128 model of the Jester, playing her flipbook moves at the flipbook's timings, with Chris's painted references baked on as textures. About 223k triangles at full detail (phones get `detail: 0.75`).

The artifact holds four things:
- `index.html`: the viewer (move chips, views, turntable, Flipbook look, half speed, and an inset that shows the flipbook frame for the same moment).
- `jester.js`: the model. It defines `makeJester(opts)` only, with the same interface as Io and Sol: `root`, `fx`, `animate(phase, wb, t, dt)`, `play(name, force)`, `ACTIONS` (dur, hits, cues), `anchor(name)`, `setFade`, `reset`, `stop`, `dim`.
- `jester_tex.js`: the baked paintings, as `window.JESTER_TEX` (load it before `jester.js`; without it the model falls back to its code-painted textures).
- `fb/`: half-size flipbook frames for the inset.

To continue the work in a new chat, read `jester.js` and `jester_tex.js` from the artifact. The build workspace was temporary.

## References, in order of authority

1. **Jester Witch HD Flipbook** (Chris's own, uploaded November 11 as `Jester_Witch_HD_Flipbook.html`): 58 painted frames at 1152×1680, stored as base64 AVIF in `const FR={...}`. Curtain Call in 48 frames (`K01` to `K48`) plus key poses for Whisper Sigil (`WS1-3`), Raise the House (`RH1-3`) and Curtain Call (`CK1-4`). This is the look to match. `K01` is the standing pose; `K28` and `RH3` have both arms raised.
2. The 23 ChatGPT paintings (`01` to `23`), made from the model's layout renders. Good for flat cloth, face, hands and the base outfit; they disagree with each other and with the HD flipbook on proportions.
3. The original pixel flipbook (sprites), for timings and the Flipbook look.

What the HD flipbook shows:
- About 8 heads tall with long legs and a small head; slim horns and small pompoms at ear height, black and clear of the veil.
- The **sheer veil is the main garment**: draped over head, shoulders and arms like a great cape, open at the front, falling to the ankles in layered ragged points, with gold dotted lines and gold moons and stars near the hem.
- Long ragged black skirt to the ankles at sides and back, wide open at the front from the hips down.

## Chris's design notes

- The red and gold fabric (the veil) is sheer organza and should stay **translucent**. The wine and olive layers under it are velvet.
- He wants a more detailed model with the paintings baked onto it. His laptop can render close to a million triangles.
- The head must hold up from the side and at an angle.
- **No cross on the cap's forehead.**
- Light shafts must cover the whole figure.
- Build in layers: body proportions first, then each garment on top.
- **Hands looked creepy and old** with the painted veins and tendons. He is open to generating new hand references.
- His honest view (November 11): the model is impressive but not as gorgeous as the art. He is considering a second session that takes another direction: more of the painting printed on the model, or a better flipbook. He asked what 400k triangles or more would do.

## What is baked

| Painting | Where it went |
|---|---|
| `08_face_front` | Her face, projected flat from the front onto the head. |
| `09_face_expressions` | Eyes shut, eyes half shut, "oh" mouth and smile, set into the neutral face. |
| `07_head_views` (side view) | A second layer over cheek, temple and jaw on both sides, fading out toward the front and left out around the eye. |
| `16_hands` | Each finger and the palm wrapped once round with the painted hand. Skin is smoothed in the bake (veins, tendons and fine wrinkles eased back); rings and nails untouched. |
| `10_veil_flat` | The great veil, straightened into a rectangle and mapped onto the whole cloth. The pointed hem is pressed into the last seventh of the length so the veil stays whole nearly to its end. Its top half is the short top tier; strips of it are the ribbon strands. |
| `11_swatches_colour` | Wine velvet (sleeves, shawl), olive brocade (overskirt, kerchiefs), flocked purple (leggings). |
| `12_swatches_black` | Gauze (skirt and tiers), ruffle (cuffs and ruff), quilted satin (horns). |
| `05_base_front_back` | The bodice: front and back of the painted torso projected onto the torso. |

## Shape, pass by pass

- Pass 1: head rebuilt to the painted face; coif cap; ruff; pendant; wrist beads.
- Pass 2: waist and bust raised and slimmed (`WAIST` = 1.04 m); wine velvet shawl over shoulders and arms; belt pouch.
- Pass 3: head in the round (lower head leans forward, `z += 0.050 * t * t`; nose, lips, chin from the profile painting); two ragged black skirt tiers; boots tapered with a lugged sole.
- Pass 4: boots 12% smaller; ruff as soft pleated rolls; cross removed; painted hands; profile layer on the face.
- Pass 5: light shaft drawn without a depth test and wider; cuffs as soft rolls; hands with knuckles, pads and creases; head 8% smaller; slimmer horns; great veil wide again (108° either side); finer face mesh.
- Pass 6 (the layering pass):
  - **Body:** everything above the waist is 10% smaller (`UPK` = 0.90, applied as a scale on the first spine bone after the bind), so her legs are a larger share of her height: about 8 heads, as in the HD flipbook. Arm lengths in the limb solver and the hand targets shrink toward the waist joint by the same factor, so every pose keeps its shape. Horns are scaled back up so they keep their size.
  - **Skirts:** long black skirt to about 13 cm from the floor at sides and back, open at the front from the hips; the two black tiers lowered to about 0.36 m and 0.60 m with deeper points.
  - **Veil:** to the ankles all round, wider toward the floor (±0.44 m), a little less see-through.
  - Ruff closer to the neck. Hand relief gentler.

## How the projections were aligned

- **Face:** pupils and lip line read off painting 08 in pixels (pupils 392 and 856 on row 408, lips on row 912), eye-to-lip distance 6.6 cm.
- **Profile layer:** nose tip found as the most forward skin pixel and tied to the model's nose tip; 1500 px per metre. Opacity 0 within 13 mm of the profile's edge, full from 37 mm behind it, 0 in an oval round the eye. Colour and opacity are separate images.
- **Hands:** base and tip of every finger read off painting 16, back and palm views. Each finger gets a strip [palm half, back, palm half] that wraps once round it.
- **Bodice:** height anchors between painting 05 and the model (belt row 392 = 1.04 m, bust row 283 = 1.215 m, shoulder row 225 = 1.33 m); each painted row stretched to the torso's width.
- **Backdrop:** flood fill from the picture's border over flat, backdrop-coloured pixels.
- **Reading landmarks off a gridded picture:** read the grid's labels, not the position in the shown image.

The viewer opens in the smooth look. Flipbook look is still a switch.

## Why it is not yet as gorgeous as the art, and what would close the gap

Triangle count is not the limit. What the paintings have and the model lacks:
1. **Painted light and shade.** The model is lit evenly; the art has deep shadow in the folds, rim light and glow.
2. **Folds in the cloth.** Each garment is one smooth simulated sheet with a tiling texture. The art has dozens of ragged layers with real folds. This is where 400k or more triangles would go: more sheets, and pleats modelled into them.
3. **Painted detail everywhere**, not only on face, hands, bodice and veil.

Directions discussed with Chris:
- **More painting on the model:** ask ChatGPT for the HD flipbook's own look as straight-on turnarounds and flat garments (veil with moons and stars, each skirt tier, sleeves), then bake those.
- **A 2.5D flipbook:** play the HD frames themselves as the performer on a 3D stage with 3D spell effects. It keeps the art exactly as painted; the camera cannot orbit.
- A hybrid is possible: HD frames from the front, the 3D model for turns.

## Next passes: gaps against the HD flipbook

1. Veil: gold moons and stars near the hem; more layers; the horns should sit clear of it (the sheer cloth now tints them).
2. Skirt and veil hems: many more ragged layers.
3. Sleeves are plain wine tubes when the arms are raised.
4. Hands: new, younger hand references would do better than smoothing the old painting.
5. Eye in full profile is still the front-view eye seen edge-on.
6. Boots and cap: painted creases, highlights and seams not projected. Brooch, necklace and rings are paint. Belt pouch is a simple shape. The bell chain starts below the belt.
7. HD frames could replace the pixel frames in the viewer's inset.
8. Collision capsules were not scaled with the upper body, so cloth sits slightly off the torso.

Unused so far: `13_flat_pieces`, `14_details`, `15_hat`, `17` to `23`.

Testing: every move runs with no errors in a headless browser at phone and laptop sizes. Chris has run it on his laptop. Not checked on a phone. The cloth step measures 10 to 14 ms a frame in the test browser; thin the skirt tiers first if it stutters.

## The Flipbook look

A render mode that draws the 3D model at the sprites' pixel size, snaps colours to her own 56-colour palette (`META.palette`), and inks the outline. Spell effects and the profile layer must leave the picture's alpha alone (custom blending). Sheer cloth is composited over the backdrop before the snap.

## Build notes

- **Body:** one skinned mesh per material; arms and legs solved onto hand and foot targets.
- **Cloth:** wine shawl (solid), great veil and short top tier (sheer), two black skirt tiers, olive overskirt and shoulder kerchiefs, long black skirt, front drape and fourteen sheer ribbon strands. All are particle sheets pinned to the skeleton, with a little shape memory. Pins and colliders follow bone matrices, so scaling a bone after the bind scales what hangs from it.
- **Lighting:** no filmic tone curve; even front and back keys. Face, hands and skin are lit partly by their own glow.
- Blacks in the art are warm, about (44, 32, 38). Many blended sheer layers turn to mud: keep solid velvet beneath and only the outer veils sheer.

| Move | Length | Release |
|---|---:|---:|
| Curtain Call | 8.0 s | 5.17 s (frame 32) |
| Sealed Fate | 4.8 s | 3.0 s (frame 16) |
| Against All Odds | 8.0 s | 1.5 s (frame 4) |
| Gilded Rebuke | 2.0 s | 1.0 s (frame 5) |
| Hush | 4.8 s | 2.67 s (frame 17) |
| Gravity | 1.7 s | 1.11 s (frame 11) |

She faces the audience and casts toward her own left (screen right), as in the sprites.

## r128 notes that cost time

- Material colours are linear in r128: pass `new THREE.Color(hex).convertSRGBToLinear()`.
- Call `root.updateMatrixWorld(true)` before `new THREE.Skeleton(bones)`.
- A render target needs `texture.encoding = THREE.sRGBEncoding` to hold display colours for a palette pass.
- Baked images decode after the model is built: paint the code texture first, then redraw the canvas and set `needsUpdate`.
- A camera-facing glow plane with depth testing cuts through the figure. Turn depth testing off for light shafts.
- To change proportions without touching poses: scale a bone after the bind, and scale the solver's limb lengths and targets about the same joint.
