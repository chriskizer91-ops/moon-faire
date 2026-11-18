# Io in 3D, stage one: her body and base outfit

November 13, 2026. Follows `claude/io-3d-reference-prompts.md` (the prompt list) and `claude/HOW-TO-3d-witch-models.md`
(the method). The Ranger's stage-one note, `claude/ranger-3d-stage1-body.md`, is the recipe this stage followed.

## What Chris asked

He sent the 43 round 1 paintings in seven zips (A whole figure, B clothing layers, C1 to C18 face, hair and hat, D hands and
arms, E boots) with "Here are round ones images". By the way the Ranger and the Fox went, that means: check them, and start
building her from them.

## What arrived

All 43 paintings, each matching the index in its zip. They follow the standing rules as written, so the seven design choices
flagged on the prompt page were left as chosen (hat slumping to her right, two necklaces, pouch on her right hip, slit over
her left leg, platform boots, both blades).

Things to know about the paintings:

- The clothing-layer paintings (B1 to B5) show her with her hair up or short so the clothes can be seen. Her hair for the
  model comes from A1 to A5 and C11 to C13.
- B5 (shorts) gives her legs and hips; B3 (bodice and skirt, no robe) gives her waist, bust, shoulders, arms and the skirt.
- B3's skirt is shorter at the front than at the sides and back. The model's stand-in skirt is one length all round.
- C10's last face is a wink, not both eyes crinkled shut. It is fine for a wink; ask again only if the laugh needs it.

## What is built

- Her torso, with the bodice painted on from B3 (front and back) and B2 (the sides between belt and arm).
- Bare arms and legs to her measurements, and the shared hands.
- The skirt as eight stiff tiers of lace with the slit over her left leg, a black lining and a layer of tulle under it.
- Boots, hands, and a plain head form with no face.

232,000 triangles. Nothing moves yet.

The page is published at https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep (later stages go to the same link) and is
also `Io_3D_stage1.html` (one offline file, 1.4 MB): eight views, three poses (at rest, as painted, arms out), the
painting beside her, the skirt on or off, and a drag to turn her. `Io_stage1_vs_paintings.jpg` shows the model beside B3 and
B2 at one scale with the outlines laid over each other.

## Her measurements

Eye line 1.50 m above her soles in every full figure, the same as the Jester and the Ranger. She stands on platforms about
5.5 cm deep, so her joints sit higher than theirs.

| Painting | Pixels per metre | Fixed points |
|---|---|---|
| A1 (master, front) | 885.7 | middle x 501.5, eyes y 186.5, soles y 1515 |
| B1 front / back | 578 | eyes y 131, soles y 998 / 996 |
| B2 left-facing / right-facing | 578 | eye y 129, soles y 996 |
| B3 front / back | 584.3 | middle x 446.0 / 1085.5, eyes y 130.5, soles y 1007 |
| B5 legs: front / side / back | 890 | soles y 982 / 980 / 979, set by the boot |

Heights in metres: top of the boot leather 0.317; top of the sock 0.359; knee 0.57; crotch 0.862; hip joint 0.935; hips
widest 0.88 (0.367 across); waist 1.10 (0.181 across, 0.130 deep); bust 1.22; shoulder joint 1.285; chin 1.419; mouth 1.45;
eyes 1.50. Pupils 62 mm apart. The skirt is 0.54 m across at its widest.

- Her painted arms are about 2.5 cm shorter than the Jester's, and her legs longer than the Ranger's. The model follows her
  paintings, not the other witches.
- The side paintings lean (hips about 4 cm ahead of the shins). The model stands upright.

## How close it is

Outlines laid over the paintings: front 0.82, back 0.82, right side 0.84, left side 0.85. Most of what does not match is her
head, hat and hair, which are not built. Waist, hips, bust, shoulders, arms and the skirt's outline are within about a
centimetre from the front. From the side her upper back sits about 1.5 cm further forward than painted, because the lean was
taken out.

## Stand-ins and rough spots

- The skirt is stiff, one length all round, and its lace is solid (a piece of B4). It becomes cloth with see-through lace
  later, and wants F8 and F11 from round 2.
- The boots are the Jester's boot made taller and wider. Her own strap, buckle and stitching come from E1 to E8.
- Arms, legs and hands are plain skin, with a small notch where the arm meets the shoulder.
- The head is a plain form. No hat, hair, glasses, robe, belt, pouch, crystal, necklaces, bracelets, book or blades yet.

## Checked and not checked

- Checked: the build, stills from eight views, the outline comparisons, and the page at phone size in a test browser (no
  errors, nothing off the side, every button, a drag).
- Not checked: a real phone. Movement cannot be judged in the test browser, and there is none yet.

## Round 2 arrived the same morning

While stage one was being finished Chris sent round 2: three zips, 21 paintings (F1 to F12 jewellery, robe and fabrics;
G1 to G9 book, blades and herbs). All 21 match their index. They are saved in the repository and nothing is built from
them yet.

- F1, F2: necklaces, bracelets, the pendant front and side. F3: belt, pouch from three sides, the crystal.
- F4 to F6: the robe laid flat, the sleeve on an arm, drape, trim, shoulder cut-out, hem point.
- F7: bodice front, back and neckline. F8: the skirt alone, one tier, the tulle. F9: eight swatches.
- F10 to F12: chiffon square, lace square, trim strip, for repeating textures.
- G1 to G3: the book. G4, G5: pendant into sickle. G6: dagger and sheath. G7: herbs and bottles. G8: where she carries
  everything. G9: her hands holding each thing.

Two things to know:

- F7's bodice back is laced. B3's back has a plain middle seam, and that is what the model wears now. Her hair and robe
  cover most of it. **Chris to choose.**
- F4, F8 and F11 are on light grey, not plum, so the sheer cloth reads. Cut them with their own background colour.

## Where it lives

Repository `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Its `README.md` has the build
commands, the rules learned and a table of the round 2 paintings. The paintings are in `references/round1/` (43) and
`references/round2/` (21).

## Next

1. Her head: the shape from C3, the face from C1 with the states in C9, then glasses (C14), hair (C11 to C13) and hat
   (C15 to C17).
2. Hands and painted arms (D1 to D4), legs painted from B5.
3. Her own boots (E1 to E8).
4. Robe as cloth (F4 to F6, F10, F12), skirt as cloth with see-through lace (F8, F11).
5. Belt, pouch, crystal, necklaces, bracelets (F1 to F3).
6. Book and blades (G1 to G6, placed by G8 and held as in G9).
7. The body moves, then her own moves and spells (rounds 3 and 4, not painted yet).
