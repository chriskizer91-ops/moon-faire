# Io, the Herbal Witch, in 3D

Started November 13, 2026. Built the way the HD Jester was (`claude/HOW-TO-3d-witch-models.md` in the project), following
the Ranger's stage-one recipe: this folder began as a copy of the Ranger's stage-one code (`claude/ranger-3d-model`, commit
`1d4c9d6`), with the Jester's platform boot builder (`claude/jester-3d-model`, pass 20) in place of the Ranger's boots.

## Where she stands: stage ten (November 13, 2026)

Her emotions (the faces in C10), and a slower, smoother hand when she reads.

- **Chris (November 13):** "When she's reading the book her pointer hand ... she's like following the lines reading the book. Can
  you slow that movement down? It's like kind of jerky moving fast. I don't know if that's a rendering issue or that's how you
  timed it ... And move on to doing her emotions for the next pass. The faces in C10."
- **The reading hand was my timing, not his screen.** `tools/tipspeed.py` measures the fingertip's speed over the page, frame by
  frame. Before: it jumped 11 cm back to the top of the page in one frame every 5.2 s (652 cm/s for that frame), and turned the
  leaf in under half a second (over 80 cm/s). Now (`RD` in `readHands`, `src/I99_static.js`): one round takes 12 s: 8.4 s down the
  page with a slow drift along the lines, then lift, out to the edge, across with the leaf, and back to the top. Every stretch
  eases in and out. Mean 3.2 cm/s, fastest 12 cm/s (the leaf), and the speed never changes by more than 0.6 cm/s between frames.
- **Her six emotions** (C10's prompt: "reading, working a spell, being surprised, being hit, being stern, being delighted"):
  `reading` (eyes lowered, a small smile), `casting` (brows drawn together, eyes narrowed; the page calls it Concentrating),
  `surprised`, `hit` (a wince), `stern`, `delighted`.
  - **Baked** by `bake_head_io.py` (the section after C9's states) as whole-face patches `faceParts.emo_<name>`, about 50 KB each.
    An expression moves the whole face, so each patch is her face inside its outline, not eyes or a mouth alone.
  - **Placing them:** C10's faces are 1.19 times larger in their boxes than C9's and do not sit in the same place from box to
    box (the middles are at 258, 226, 290, 258 and 227 px), so each is placed by its own middle (where the face is most alike
    left and right) and its lip line. A free fit by picture-matching (ECC) was tried on top and rejected for all six: it changed
    their size by up to 13% and stretched them. `find_face` is what is used.
  - **Edges:** the patch narrows toward her forehead and drops anything much darker than her skin away from her features (hair
    at her temples), stops above her chin (the head keeps its own chin and jaw), and takes the broad light and colour of the face
    under it, fully at its rim and three-quarters of the way everywhere else.
  - **Painting** (`paintFace(eyes, mouth, emo)` in `src/I40_head.js`): base, then the emotion, then the blink only for `casting`
    and `stern` (the others hold their own eyes), then a talking mouth if there is one. The plain smile is not laid over an emotion.
  - **Holding one** (`setFeel(name)`; `feels`, `feel`): she keeps it through any move. With it goes a small turn of her head and
    shoulders (`FW` in `body()`): surprise and a hit come quickly, the others ease in.
  - **Moves that ask for one themselves** (`emo` returned by `body()`): reading face in `read` and at the bottom of `curtsey`;
    concentrating when the sickle is lifted; delighted in `twirl` and when she smells the herb.
- **Page:** stage ten; a new row, Her feelings (None, Reading, Concentrating, Surprised, Hit, Stern, Delighted). One offline file:
  `deliver/Io_3D_stage10.html` (3.2 MB). `deliver/Io_stage10_feelings.jpg`.
- Limits: the feelings are paint on a head whose shape does not change, so from the side they show less than from the front
  (the side of her head wears the profile painting, which is at rest). Surprised looks paler than the rest because her head tips
  back out of the shade of her hat. Checked in stills from three angles, by the fingertip meter, the pass-through meter and the
  page test. Not watched playing, not on a real phone.

## Stage nine (November 13, 2026)

One pass on things passing through each other: her hands and her book, her legs and her skirt and cloak, her arms and her sleeves.

- **Chris (November 13):** "When she reads her book, the finger that she's using to like point at the book is phasing through
  the book. The hand that's holding the book is the book's hovering above that hand ... the legs pass through the clothes a
  lot, and the arms pass through the sleeves of the cloak. If we can do a one pass of fixing all of those elements, then move
  on to the emotions, then spells and attacks."
- **A meter, so this is measured and not only looked at:** `tools/pen.py` (with `tools/pen.js`) plays every move and counts
  points of cloth inside her legs, points of sleeve inside her arms, and points of her hands inside her book, with the deepest
  of each in millimetres. It applies the same push the cloth is drawn with, so it measures what is on screen. Standing still
  she scores 99 leg points at 10 mm (cloth that lies close at her hips as built); that is the floor.
  - Before: legs 7,499 points over the sixteen moves, up to 74 mm deep; book 4,675 points.
  - After: legs 1,529 (every move at the standing floor, 12 mm at most); book 0 in every move.
  - Sleeves: 1,189 before, 906 after by this count, but the count misses the real change (below): her arm used to leave the
    sleeve altogether. What is left is cloth pinched in the crook of a folded elbow and between a forearm and a thigh.
- **Reading** (`readHands` in `src/I99_static.js`). The order is the fix: her left hand goes to its place, palm up; the book is
  laid on that palm wherever the palm really ended up (`handFrame`); then her right forefinger is brought to a point on the
  page, its tip is measured, and her hand is moved until the tip rests on the paper. Her hand is held level above the page with
  her other fingers folded under her palm. The book grows on her palm once her hand is nearly there, and her right hand comes
  down from above after it.
- **Legs and cloth.** Her legs are six tapered tubes (`LEGCAP`) with six balls along each (`LEGS`). The rule, in the chains
  (`legOut`) and again in the cloth's own drawing (`legPush`, a vertex-shader step on `band`, `tulle`, `skirt`, `robe`, `moss`,
  `fern`): a point of skirt or cloak may never be where a leg is both further out from her middle AND overhead. Such a point
  moves the shorter way, out past the leg or up onto it. Each stretch of chain is tested at its end and at two points along it.
  A point is never pushed further from a leg than it lies when she stands, so standing she looks as she did.
  - Sleeve cloth (`capMode` 1, set from the bones a point follows) only meets her legs: it is lifted onto a leg that lies
    level, and moved straight out of one that stands.
  - Each layer keeps a little further off than the one under it (`LEGPAD`), so pressed layers do not flicker.
  - Tried and dropped: (1) cloth keeps to the side of each leg it was on at rest, turned with the leg's bone: fails when a
    thigh rolls (the hover). (2) Straight out from the leg, leaning up for a level leg, plus a rule tying neighbouring chains
    together: the whole skirt climbed into her lap. (3) For sleeves, "lift onto any leg overhead": standing, sleeve tails
    jumped up her arm; it must be a level leg only.
- **Sleeves** (`src/I45_robe.js`, `sleeveTick` in `src/I99_static.js`). A sleeve was 24 points each hung from a point of her
  arm, so on a raised forearm the whole sleeve hung under it and her arm came out through the cloth. Now each tier is a row of
  rings round her arm (bones `sl<side><tier>_<n>`, eleven a sleeve with the tail; 210 bones in all, down from 236).
  - A ring is carried along her arm and round the bend of her elbow (its place and turn are blended across the joint).
  - Off the vertical, it slides toward the ground until its top rests on her arm (painting F5). How far each ring may slide
    each way is measured when she is built (`slack`), so her arm is always inside it. It follows on a spring.
  - When her elbow folds, the other half of her arm passes through the ring's place: the ring slides toward it and, if that is
    not enough, opens up to 45% wider.
  - The long point of the last tier hangs from the cuff ring as a soft chain (`svt<side>`).
  - Hanging at her side a sleeve does not slide at all, so standing she looks as she did.
- **Page:** stage nine. One offline file: `deliver/Io_3D_stage9.html`. `deliver/Io_stage9_pass_through_fixes.jpg`.
- Still passing through: hair and sleeves at her shoulders; a sleeve and her skirt or side when her arm is close to her body;
  cloth pinched in the crook of a folded elbow; in the hover a boot can show through the thin edge of the skirt.
- Checked: the meter, stills of every move from two sides, the quick page check and the full page test. Not watched playing,
  not on a real phone.

## Stage eight (November 13, 2026)

The moves the whole party shares, and the book appears only when she reads.

- **Chris (November 13):** "her book should like appear when she does the read her book animation. I don't think she should just be
  holding it, in the same way that I think her sickle should just appear, which it kind of does. Let's do the party moves and
  that adjustment."
- **Rule:** she carries nothing by default. Her book and her sickle appear when a move uses them and go when it ends.
- **Book:** `BK_FLOAT` is empty and the held state is switched off (`hold = 0`); only the open book is ever shown, while `bkR` is
  above 0.03, and the `book` bone is scaled from nothing to full size as `bkR` rises (`bookPlace`). The shut book's parts are
  still built but never shown.
- **Party moves** (`body()` in `src/I99_static.js`); each slides in and out on its own weight (`jg`, `hSq`, `hKn`, `hHv`):
  - `jog`: the walk made quick (0.72 s a cycle), a longer stride, knees higher, elbows bent, a little lean. Same ankle rules.
  - `squat`: hips down 42 cm and back 5, feet planted a little apart, leaning in, hands on her knees. Held until another move.
  - `kneel`: right knee down, left foot forward, left hand on her raised knee (the herb move's legs). Held.
  - `hover`: 30 cm up, bobbing; cross-legged with knees wide and each shin folded level across her front, the left over the
    right; hands open on her knees, eyes shut, a small smile. Held. Her thighs are set by direction and hinge axis directly
    (a basis, not Euler angles: two tries with angles crossed her legs the wrong way or too far).
- **Page:** stage eight; Jog, Squat, Kneel and Hover are the last four Moves buttons. One offline file:
  `deliver/Io_3D_stage8.html`. `deliver/Io_stage8_party_moves.jpg` shows the four and the book appearing.
- Checked in stills and with the quick page check (loads, plays hover, no errors). The full page test was not run again.
- Stage nine changed how the book is placed: see `readHands` above; `bookPlace` now only slides `bkR`.

## Stage seven (November 13, 2026)

Her book, her dagger and her sickle.

- **Chris (November 13):** "Yes, let's continue on to the books and blades. This looks good. I don't think we need to do detail to
  her boots. Her boots can be the same as the other, which they already look really good. Some more detail on the belt, pouches,
  and necklace. Not necessary considering how small they already are. But we do need to work on her emotions, the faces in C10,
  and her spells and attacks." Then: "We also need to do the motions that the rest of the party do, like there's squat, there's
  kneel, there's hover, and jog. And I like the idea that they all can hover, and it's like a crisscross magical meditation."
- **Settled:** the coy wave looks good. Her boots stay as they are. Belt, pouch and necklace need no more detail.
- **Page:** the same link. One offline file: `deliver/Io_3D_stage7.html`. `deliver/Io_stage7_book_blades.jpg` shows her holding
  the book, reading, holding the sickle, the book floating in a curtsey, and her hip from the side.
- **Book (`src/I47_props.js`, G1 and G2).** One bone, `book`, a child of the model's root and not of her body; `bookPlace` in
  `src/I99_static.js` sets where it is every frame from three places: held shut against the front of her left side (carried by her
  chest), floating open at her left side (by her hips' heading, bobbing), and open in front of her to read. `bkF` and `bkR` slide
  between them. Moves in `BK_FLOAT` (talk, hat, curtsey, twirl, herb) let it float. Her left hand reaches for the held book; both
  hands reach for the open one. Shut and open are two sets of parts swapped at the halfway point. Cover and page pictures are
  drawn by code (`bookCoverTexIo`, `bookPageTexIo`).
- **Dagger (G6):** sheath, gold throat and tip, turned grip, pommel and crescent guard, at her left hip on one soft bone (`dagger_0`).
- **Sickle (G5):** a dark grip and a golden crescent blade built in her right hand, shown only during the `sickle` move.
- **New moves:** `read` (a loop) and `sickle` (3.4 s). Held still (`pose`) she carries nothing.
- `opts.noProps` builds her without them. 236 bones.

Limits: her fingers do not wrap the book or the grip exactly; the dagger cannot be drawn; the sickle appears in her hand with no
change from the pendant yet; the book swaps from shut to open in one frame.

## Stage six (November 13, 2026)

Her ankles and wrists move as real ones do.

- **Chris (November 13), after stage five:** "the skeleton movement animation needs to be worked on the way her ankles move when
  she's walking or not bending the right way at the back of her step as well as the way her wrists move when she waves and
  does a few other things".
- **Page:** the same link as every stage. One offline file: `deliver/Io_3D_stage6.html`. `deliver/Io_stage6_ankles_wrists.jpg`
  is eight moments of one step from the side, the wave, and her open hand in the talk.
- **Ankles (`body()` in `src/I99_static.js`, the walk).** The cause was the Ranger's (her stage 6c): the foot was kept level at
  all times, so behind her the ankle bent past what an ankle can do. Now: on the ground the sole lies flat until the leg is too
  far back, then the heel lifts; in the air the foot hangs loose, toes down, and comes up to land on the heel. The ankle is held
  to 0.26 rad up and 0.30 down. Her boots are stiff, so the toe bone is never turned (walk, twirl, curtsey). Her knee gives by
  0.30 rad as the foot leaves the ground.
- **Wrists.** A new bone on each forearm, `ftwL` / `ftwR` (`src/10_geom.js`), carries the turn of her hand: `wristFix` splits what
  a move asked of the hand into the turn about the arm's own line and the bend that is left; 80% of the turn goes to the
  forearm bone, and the bend is held to 0.62 rad (`WRIST_MAX`). The arm's skin goes over to that bone down the forearm (`wArm`),
  and the bracelets ride it. It runs every frame for both hands, after the reaches and aims.
- **Wave.** It comes from her elbow: the wrist target swings 7.5 cm each way and the hand's lean follows 0.8 rad of phase behind.
  3.0 s now (was 2.6), 1.35 swings a second (was 1.75).
- **Rule for every witch's moves from here:** never hold a foot level by force; clamp the ankle and let the heel lift. Never turn
  a hand at the wrist alone; give the turn to the forearm. Stiff boots do not fold at the toe.
- **Second pass on the wave (Chris, the same day):** "her hand needs to be maybe mid-chest height, and her elbow needs to be lower, so
  she's just kind of like more coyly waving. Rather than that, let's move on." Done: wrist at 1.165 m, 17.5 cm in front of her,
  elbow down by her side (swivel -0.25), swing 3.8 cm each way, head tipped toward her hand. File `deliver/Io_3D_stage6b.html`.
  The walk and the other hand moves passed his eye.
- 234 bones.

## Stage five (November 13, 2026)

Belt, pouch, crystal, both necklaces and her bracelets are on her, over the cloak with its moss.

- **Chris (November 13), after stage four:** "Yes overcloak was correct and it looks good the moss on it It looks good. Let's
  move on to the belt pouch and Crystal the necklace and bracelets". So the cloak reading is confirmed and the moss is approved.
- **Page:** the same link as every stage. One offline file: `deliver/Io_3D_stage5.html` (2.8 MB).
  `deliver/Io_stage5_belt_jewellery.jpg` shows the new pieces beside F1, F2 and F3.
- Details are under "Stage five" below.

## Stage four (November 13, 2026)

She wears her cloak, with the mossy frill Chris asked for, and her hands are painted.

- **Chris (November 13), after stage three:** "Oh my goodness she's fantastic. Very nice. Well done. Let's continue". Then, with
  a picture of her from three sides (`references/moss/M1.webp`): "This ... is how IO should look adding a little bit of moss to
  her. Overclock changing. Nothing else. Just giving like a mossy green frill to her outfit". Read as: only her cloak changes;
  it gets moss and small ferns along its hems. **M1 is the master for her cloak.** He has been told how it was read.
- **Page:** the same link as every stage. One offline file: `deliver/Io_3D_stage4.html` (2.8 MB).
  `deliver/Io_stage4_cloak_moss_hands.jpg` is the cloak beside M1, the cloak moving, and her hands.
- Details are under "Stage four" below.

## Stage three (November 13, 2026)


She moves. Her arms are shaped and painted from D3, her hair and skirt hang from chains of bones that swing with her, and she
has her first eleven moves (poses and emotes, not attacks).

- **Chris asked (November 13):** "let's make the fabric. That's on her move with her as she moves and let's do her posturing
  posing and moves. Not her attacks but her like animations her emotes and these are to test that the clothes work good and
  also work on her arms Because I do think her arms are still just tubes".
- **Page:** the same link as every stage. One offline file: `deliver/Io_3D_stage3.html` (2.5 MB). It opens with her standing
  and breathing. `deliver/Io_stage3_arms_and_moves.jpg` is her arm beside D3 and a still from each move.
- Everything about this stage is under "Stage three" below. Stage two's notes follow unchanged.

## Stage two (November 13, 2026)

Body and base outfit (stage one), and her head, face, glasses, hair and hat. She blinks and can talk.

- **Page:** https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep (republish each stage's page to that link). The same page as one
  offline file is `deliver/Io_3D_stage2.html` (2.4 MB). Twelve views, six faces (blinking, talking, four held), three poses, the
  painting beside her, and buttons to take off her hat, glasses, hair and skirt. `deliver/Io_stage2_vs_paintings.jpg` is her head, hat and hair beside C4 and C5 at one scale.
- **Stage two built:** her face (C1) on a head shaped to her profile (C3), ears, neck; her blink and talking mouths (C9); round
  glasses; about 120 wavy tresses of hair and a fringe of 24 locks that frame her face; the hat with its brim, lace band, chain,
  three crosses, ringed cross, two horns and slumping crown. 563,000 triangles.
- **Stage two, second pass (Chris, November 13):** "her face needs to be her face without hair in the painted on image. And then
  the hair that's in front of her face is actually like 3D rendered hair hanging in front of her face"; the hat down by 15% of
  the way from its bottom edge to the top of her glasses; blinking and talking; the fringe; "a little sharp edge that points
  out" at the very bottom of her chin from the side. All five are done (see "Second pass" under the rules below). He called her
  face "almost perfect": do not reshape it while fixing details.
- **Stage two, third pass (Chris, November 13):** "her bangs should frame her face, not obscure her face ... slide them back so
  that there's no gap between her bangs and the rest of her hair. And her face is more open, because you did a good job on the
  face. And then bring the hat down. Another 30%." Done: see "Third pass" below.
- **The Flipbook look (Chris, November 13):** "there's a flipbook-like filter that I want to add. It's just going to be a button."
  It is the switch "Flipbook look" under Show, off when the page opens. "Other than that, she looks fantastic."
- **The order from here, in his words:** "I believe her arms need to be worked on, and then we need to get her like body moving
  around before we add more of her outfit."
- **Stage one, approved by Chris** ("round one is fantastic", "The body looks fantastic as it is"): torso with the bodice painted
  on (B3 front and back, B2 at the sides), bare arms and legs, the skirt as eight stiff tiers with the slit over her left leg,
  boots, hands. Do not reshape these without asking. Stage two only cleaned the tops of her shoulders in the body picture (a dark
  patch and purple streaks) and carried the bodice straps over them.
- **Stand-ins and rough spots:** her hair is stiff (no movement, does not part round raised arms), a tress reads as a ribbon up
  close; the top of her head under the hat is bare; her brows do not move and the emotions in C10 are not in; the hat's crown has soft creases, not the deep folds of the paintings; the skirt is stiff with solid
  lace; the boots are the Jester's boot made taller; arms, legs and hands are plain skin.
- **Not built:** robe, belt, pouch, crystal, necklaces, bracelets, book, sickle, dagger, cloth that hangs, movement, spells.

## What is here

- `references/starters/`: the 14 images Chris attaches in ChatGPT. `references/prompts/`: the 104 prompts and the scripts
  that build `Io_Reference_Prompts.html` (see the README text below and `claude/io-3d-reference-prompts.md` in the project).
- `references/round1/`: the 43 round 1 paintings (A1 to E8) as WebP, with the index Chris's zips came with.
- `references/round2/`: the 21 round 2 paintings (F1 to F12, G1 to G9) as WebP, with their index. Only F9's swatches are used so far; see "Round 2" below.
- `references/round3/`: the 26 round 3 paintings (H1 to H18, I1 to I8) as WebP, with their index. Not used yet; see "Round 3" below.
- `src/`: the model, joined in this order by `build_io.sh` into `out/io.js` (one function, `makeIo(opts)`):
  `00_util`, `I05_tables` (written by `tools/tables.py`), `10_geom` (skeleton and part builders), `20_tex`, `I21_tex`,
  `I30_body` (torso, arms, legs, skirt), `I31_boots`, `32_hands`, `I40_head` (head, face, ears, neck), `I42_glasses`,
  `I43_hat`, `I41_hair` (after the hat, because the hair starts under it), `I99_static` (materials, and `pose({arm, leg})`
  in degrees for checking her against the paintings).
- `tools/tables.py`: every measurement, in one place, for both the model and the bake. Edit numbers there.
- `bake_io.py`: cuts the paintings into `out/io_tex.js` (`window.IO_TEX`: the wrapped body picture, the skirt's lace, two
  skin colours). `bake_head_io.py`, run after it, adds her face (C1), her profile (C3), her neck's tone (C18), the hat's felt,
  lace and horn (F9) and her hair colours (C13).
- `tools/`: `sil.py` (figure outlines off the plum background), `measure.py` (outline tables in metres), `cmp_io.py` (model
  beside a painting with both outlines), `page_test_io.py` (the page at phone size), `zoomgrid.py` (a zoomed, gridded crop for reading landmarks),
  `prof_io.py` (her painted profile against the model's middle line), `fit_prof_io.py` (moves the model's middle line onto it),
  `cmp_head_io.py` (her head, hat and hair beside C4 and C5 at one scale). `lib/grid.py` puts a labelled grid on a
  painting; `lib/restore_refs.py` turns the WebP paintings back into the `refs/*.png` the tools read.

## Her measurements

Her eye line is 1.50 m above her soles in every full figure, as on the Jester and the Ranger. She stands on platforms about
5.5 cm deep, so her joints sit higher than theirs.

| Painting | Pixels per metre | Fixed points |
|---|---|---|
| A1 (master, front) | 885.7 | middle x 501.5, eyes y 186.5, soles y 1515 |
| B1 front / back | 578 | eyes y 131, soles y 998 / 996 |
| B2 left-facing / right-facing | 578 | eye y 129, soles y 996; skirt-middle axis x 472.6 / 1062.2 |
| B3 front / back | 584.3 | middle x 446.0 / 1085.5, eyes y 130.5, soles y 1007 |
| B5 legs: front / side / back | 890 | soles y 982 / 980 / 979; fixed by the boot (0.317 m to its leather top, 0.359 m to the sock top, as in B3) |

Heights in metres: sole about 0.055 deep; top of the boot leather 0.317; top of the sock 0.359; knee 0.57; crotch 0.862;
hip joint 0.935; hips widest 0.88 (0.367 across in B5); waist 1.10 (0.181 across, 0.130 deep); skirt waistband 1.05 to 1.06;
bust 1.22; shoulder joint 1.285 (0.119 out from the middle); chin 1.419; mouth 1.450; eyes 1.50. Her pupils are 62 mm apart.
The skirt is 0.54 m across and 0.43 m deep at its widest (0.30 to 0.35 m up) and its hem points reach about 0.13 m.

- The side paintings lean: her hips stand about 4 cm ahead of her shins. The model stands upright (`LEAN` in `bake_io.py`,
  and the note at the top of `tools/tables.py`).
- Her painted arms are about 2.5 cm shorter than the Jester's, so her arm bones are (0.232 and 0.212 m).
- B5 (in shorts) has a wider waist than B3 (in the bodice). The model follows B3 from the waist up and B5 at the hips and legs.
- B3's feet are 32 cm apart and B5's 19 cm. `pose({arm: 28, leg: 5.5})` is the stance in B3.

### Her head (stage two)

The head is the Jester's face model (as the Ranger's is), worn at 0.95 of its size and 0.95 as wide above the nose. Her chin
stays where her whole-figure paintings put it (1.408 m), so her **eye line is 1.511 m**, not 1.50; the tip of her nose is
0.107 m forward of the body's middle line.

| Painting | Pixels per metre of the model | Fixed points |
|---|---|---|
| C1 (front face) | 4689 | pupils (487, 533) and (767, 533), middle of nose and mouth x 630, brows y 462, under the nose 745, lip line 828, under the chin 1006 |
| C2 (with glasses) | 4689, same framing as C1 | each ring 44 mm across, its middle 2.6 mm outside the pupil and 7 mm below the eye line |
| C3 profile (right figure) | 2169 | eye y 420, tip of the nose x 1513, lip line 556, under the chin 644, ear x 1195 to 1262, y 405 to 522 |
| C4 front (left figure) | 1370 | middle x 287, eyes y 453.5 |
| C4 profile (right figure) | 1290 | tip of the nose x 1432, eye y 462 |
| C5 from behind (middle figure) | 1235 | middle x 742, back edge of the brim y 372 = 1.44 m |

- Heights: chin 1.408, lip line 1.448, under the nose 1.466, eyes 1.511, brows 1.526, hairline 1.58. Eyes 59 mm apart.
- The whole-figure paintings (A1, B3) draw a shorter face than the close-ups: 8.4 to 9.1 cm from eye to chin against 10.3 cm in
  C1 and C3, with the eyes as far apart. The close-ups are the master for her face, as on the Ranger.
- A1's eyes are at y 198, not 186.5 as first read (that was the top of her glasses). A1 is 878 px a metre by its eye line.
  Nothing was measured off A1 in stage one, so nothing built is affected.
- Hat: the opening is 17 by 25 cm on a plane rising to the front (1.570 m in front, 1.511 m behind); the brim 33 by 39 cm,
  level in front, 4.5 cm lower at the sides and 9 cm lower behind; the band 4.6 cm; the top of the crown 1.71 m; its tip
  hangs behind her right shoulder at 1.39 m. These are 7 mm lower than first measured: Chris asked for the hat down by 15% of
  the gap between its bottom edge in front (then 1.577 m) and the top of her glasses (1.529 m). He then asked for another 30%:
  read as 30% of that same 4.81 cm gap, 14.4 mm more. The hat is now 21.4 mm lower than first measured (every height in this
  bullet less another 14 mm): its bottom edge in front is at 1.556 m, 2.7 cm above her glasses.
- Hair: the curtain down her back is 33 cm wide at her shoulder blades and ends about 0.72 m up; the bunches in front end
  between her waist and hips; waves are 11 to 15 cm long.
- Glasses: C2 and C14 show thin 44 mm rings; every whole-figure painting shows them bigger and darker. Built at 50 mm, dark bronze.

## Checking

- **Stage one:** `tools/cmp_io.py` lays the model's outline over the painting's: front (B3) overlap 0.82, back 0.82, right side
  (B2) 0.84, left side 0.85. Waist, hips, bust, shoulders, arms, boots and the skirt's outline are within about a centimetre
  from the front; from the side the upper back sits about 1.5 cm further forward than painted, which is the lean taken out.
  (These were measured before she had hair and a hat; run with her hair and hat hidden to repeat them.)
- **Stage two:** `tools/prof_io.py`: the model's middle line is within 1.0 mm of her painted profile from chin to forehead.
  `tools/cmp_head_io.py`: her head, hat and hair beside C4 (front and profile) and C5 (from behind) at one scale, judged by eye.
  Stills from the front, both three-quarters, both sides, behind, above and below.
- The page ran at phone size in a headless browser: no errors, nothing off the side, every button, and a drag. Not checked on a
  real phone.
- **Stage nine:** `python3 tools/pen.py [move ...]` prints, for each move, the worst pass-through seen while it plays (cloth
  in her legs, sleeve in her arms, hands in her book). `tools/s9.sh <tag> [move ...]` takes stills of the moves where cloth
  and limbs meet, each from two sides. Run both after any change to her moves, her cloth or her sleeves.

## Building

The scripts use the absolute path `/home/claude/io`. In a fresh session:

```
mkdir -p /home/claude/io && cp -r models/io-3d/. /home/claude/io/ && cd /home/claude/io
npm install three@0.128.0          # playwright and Chrome are needed for the pictures
mkdir -p shots deliver
python3 -I lib/restore_refs.py     # PNG copies of the paintings into refs/
python3 -I bake_io.py              # out/io_tex.js (needs Pillow, numpy, scipy)
python3 -I bake_head_io.py         # adds her face, profile, skin tones, hat swatches and hair colours to it
python3 -I bake_arms_io.py         # adds her arm skin from D3
python3 -I bake_hands_io.py        # adds her hands from D1 and D2 (landmarks in hand_marks.json)
./build_io.sh                      # tools/tables.py, then out/io.js
python3 -I build_single_io.py      # deliver/Io_3D_stage8.html, one offline file
python3 tools/prof_io.py 8 shots/prof.png             # her profile against the model's, by height
python3 tools/cmp_head_io.py shots/cmp_head.jpg       # head, hat and hair beside C4 and C5
python3 tools/cmp_io.py shots/cmp_front.jpg front     # also back, sideR, sideL
python3 shoot.py shots/x 'T.j.pose({arm:28,leg:5.5})' front:0,0.03,6.6,0.9,22     # a still; angles are in radians
python3 tools/page_test_io.py      # the page at phone size (slow: software rendering)
tools/allmoves.sh                  # shots/m/mv_<move>.jpg: stills through each move (tools/strip.py does one)
tools/armclose.sh x; tools/shoulder.sh x      # her arm and her shoulder close, hair hidden
```

The paintings are data: run Python that reads them with `-I`.

## Rules learned in stage one

- `spline()` in `00_util.js` reads its keys from low to high. Tables written from the top down (legs, skirt) must be reversed
  first, or use `prof()`.
- When patching a line, never leave a `//` comment in the middle of a statement (it swallowed a `const`).
- The legs must start inside the hips, and the hips must be narrower than the skirt that covers them, or skin shows through.
- Check the scale of a part painting (B5) against a full figure by something both show (the boot), not by its own height.

## Rules learned in stage two

- Hair that hangs is placed by height: its x is given, and its depth is whatever keeps it clear of her (`zBack`, `zFront` in
  `I41_hair.js`). That rule cannot put hair on the **side** of her head: it pushed the side hair round to the front of her face.
  Hair beside her head is placed by its own rule (`bunchPts`): on the side of the head, as wide as the head has been on the way down.
- Do not let hair follow the jaw: below the cheekbones the head narrows, and hair that follows it meets under her chin.
- Each layer of hair must start close to the head under the hat and stand off only below it, or its roots poke out through the band.
- A tress takes a narrow strip of a wide strand picture. A wide strip makes each tress two-toned.
- The sheet of plain hair under the tresses must be narrower than the tresses, or its edge shows as a black band.
- Take the hat's shape from both views at once and check both at one scale (`cmp_head_io.py`): the first crown matched the
  measurements along its middle line and was still 5 cm too tall and far too thin.
- Where a strand rule needs a surface that is not there, give it a fallback: three points went nine metres away.

### Second pass (the same day)

- **No hair is painted on her face.** The front picture (C1) never had any. The side picture (C3) had fine strands across her
  temple, cheek, ear and neck; `bake_head_io.py` now paints out anything on her skin there that is darker than the skin round it.
- **Hair in front of her face is geometry.** The fringe was flat strips lying on her skin, and read as painted. It is now 13 small
  tresses a side that leave her hairline under the hat, stand 0.5 to 1.7 cm clear of her skin and hang (`FR` in `I41_hair.js`).
- **Strand ends are pointed.** The picture that says where a tress has hair drew each strand as a bar with a round end, so a
  tress ended in a row of square teeth. Each strand now narrows to a point (`hairAlphaIo` in `I21_tex.js`).
- **The point under her chin** was the profile fit overshooting at its lowest key (0.0943 between 0.0889 and 0.0926). The fit is
  unsteady there because the outline runs nearly level. The bottom four keys of `FACE_MID` were set by hand to a round chin. If
  `fit_prof_io.py` is run again, check those keys afterwards.
- **Her faces** come from C9 the way the Ranger's come from J2: cell 1 is settled onto C1 picture against picture, the other
  cells onto cell 1 by what did not change, and only the eyes or the mouth are lifted as soft patches. The cells sit up to 24
  pixels off their grid, so do not assume the faces are centred. The mouth patches must reach past the corners of her resting
  mouth, or its corners show beside a pursed one. `animate(dt)` runs the blink; `talk(true)` the mouths and small nods;
  `setFace(eyes, mouth)` holds a face and `setFace()` lets go.

### Third pass (the same day)

- **Bangs frame, they do not cover.** Each lock leaves her parting under the hat, runs out across the top of her forehead
  above her brows to her temple, and from there lies along the side of her face, outside her cheek. Nothing crosses her brows,
  eyes, glasses or cheeks (`FR` in `I41_hair.js`: start x, how far down the side it runs, clearance, half-width, wave).
- **No gap between bangs and the rest.** The bunches over her shoulders used to start above her ear; they now start at her
  temple (`bunchPts`: 1.14 rad round from the front, was 1.38). The tresses nearest her face are slimmer and wave less.
- **A lower hat meets a wider forehead.** Dropped 14 mm, the foot of the crown cut through her forehead and the roots of her
  fringe. The foot is now squarer at its corners and sits 11 mm further forward (`crown.pt` in `I43_hat.js`). When the hat
  moves again, look at the band from the three-quarter views and from above.

### The Flipbook look

The method is the project doc `claude/HOW-TO-flipbook-look.md`. Her `viewer/stage.js` already had the look and `out/palette.js`
already had the 56 colours, so the switch is one line in `viewer_io/index.tpl.html` that sets `stage.look`. Checked as that
doc's section 7 asks:

- Her face reads up close and at whole-figure distance; glasses, the hat's chain, crosses and horns stay visible.
- Colours: `tools/far.py` on a smooth still finds one skin tone (0.2% of her) further than 40 from the 56. No extra colours added.
  Her browns land on browns and oranges, the felt on the wine reds, her skin on one family of tones from face to legs.
- One clean dark outline. The smooth look is the same with the switch off. Her floor shadow stays smooth, as the place does.
- Not checked: her blink and talking mouth in motion with the look on (stills only); and she has no spells yet.

## Stage three: arms, soft hair and skirt, first moves

### Arms (`src/I30_body.js`, `bake_arms_io.py`)

- **Shape.** `ARM_X` gives, every 2 cm down the arm, how far the skin is from the bone on four sides: outer, inner, front, back.
  Outer and inner are measured off D3 (`tools/arm_d3.py` finds the arm's top and bottom edge in both halves of the painting;
  `tools/arm_fit.py` turns them into distances). Her arm held out is her hanging arm turned up, so D3's top line is her outer
  side. Front and back are not painted anywhere; they follow a slim arm (biceps, triceps, the point of the elbow, the crease).
  The painted centre line is moved only 60% of the way from the old round tube, so the arm does not lean toward her body when
  it hangs. D3's forearm is longer than its upper arm; her bones were not changed, so each half is fitted on its own.
- **Scale.** 2016 pixels to a metre in D3 (shoulder joint to wrist, 0.444 m). Mid upper arm 6.6 cm across, elbow 6.3,
  forearm 6.7 at its widest, wrist 3.5 thick.
- **Wrist.** The hand model's wrist is 2.9 cm thick and sits 5.5 mm toward the thumb side of the forearm's line
  (`tools`: measure with the snippet in the stage-three project note). The arm narrows to that, squares off (flat on the
  back and the palm side) so it covers the hand's own cuff, and ends hidden 1.4 cm inside the hand.
- **Shoulder.** Above the joint the arm ends in a ball that sits on the joint itself (`ARM_CAP`), and the whole arm is carried
  by the upper-arm bone alone. So however it turns, the ball stays in place inside her shoulder and nothing is pulled two ways.
  Under the joint her body's skin goes 30% of the way with the arm, only in the middle of the armpit (`ku` in `wTorso`).
  The same idea as the Ranger's stage 6d. The elbow's skin goes over to the forearm a little above the joint at the back
  (the point of the elbow belongs to the forearm) and folds at the crease in front (`wArm`).
- **Paint.** `arms` in `out/io_tex.js`, 512 x 1024, one arm unrolled: across, once round the arm from the outer side through
  the front; down, wrist at the top row. The front half of the arm is D3's front view, the back half its back view, mixed at the
  top and bottom lines. Half of the painting's own light is kept; the tone drift along the arm is taken out; the whole is
  brought to the plain arm colour so it meets her shoulder and her plain hand. Both arms wear the same picture.
- Not done: her hands are still plain skin. D1 and D2 can be painted onto them the way the Ranger's were
  (`bake_hands_r.py` and `hand_marks.json` on `claude/ranger-3d-model`); the marks have to be measured again for Io's paintings.

### Soft chains: hair and skirt (`CHAINS` in `src/10_geom.js`, stepped in `src/I99_static.js`)

- A chain is a row of points from a root down to a tip; each stretch between two points is a bone. `addChain` makes one;
  `chainW` says which bones carry a point at a given height (the stretch it lies on, shared with the next near each joint);
  `mixW` blends two chains.
- **Hair:** 5 chains down her back (`hb0` to `hb4`, joints at 1.40, 1.28, 1.16, 1.04, 0.92, 0.80, 0.68 m) and 2 down the front
  of each shoulder (`hfR0`, `hfR1`, `hfL0`, `hfL1`, to 0.92 m), all hanging from her chest (spine3). Above 1.46 m her hair goes
  with her head, as before, and blends to the chains between 1.46 and 1.36 m. Each tress follows the two chains nearest it.
  The fringe goes with her head.
- **Skirt:** 12 chains round her hips (`sk0` to `sk11`, joints every 12 cm from 1.02 to 0.18 m). All layers of the skirt use them.
- **How a point moves (`softStep`).** It is pulled toward where it would rest: the way it was built, carried by its body bone,
  leaning toward plain hanging the further down the chain it is (`g`). It keeps most of its speed (`d`), so it lags behind her
  and swings in after. Then it is put back at its fixed length from the point above, pushed out of the balls (`COL`: her neck,
  chest, waist, hips, arms and hands for hair; thighs, knees, shins, feet, arms and hands for the skirt) and lifted onto the
  floor (`FLOOR`). Sixty steps a second whatever the frame rate.
- **Her standing look is unchanged.** At rest every point sits where stage two built it: a ball never pushes a point out of
  its place at rest (each pair's reach is cut to the distance they have at rest).
- `pose()` settles everything at once (`softSettle`). `lift` on a skirt chain spreads it outward (the curtsey holds the skirt
  out; the twirl flares it).
- Plain black shorts above mid-thigh (0.845 m) so a moving thigh cannot show through the lace. My choice; Chris has been told.
- 182 bones in all now. One frame of walking costs 0.13 ms of script on the build machine (the drawing is the cost, not this).

### Moves (`body()` in `src/I99_static.js`)

`play(name)` starts one; `pose()` holds her still. Short moves end by themselves and she goes back to `idle`.

| Button | Name | What she does | Seconds |
|---|---|---|---|
| Standing | `idle` | Breathes, shifts her weight slowly, her head drifts a little. Feet planted. | loop |
| Walk | `walk` | An unhurried step on the spot; hips turn a little; small arm swing. | 1.12 a cycle |
| Talk | `talk` | Her left hand opens palm-up at her waist and moves with her words; small nods and tilts; her painted mouths. | loop |
| Push up glasses | `glasses` | Right index finger to the bridge of her glasses, a small push, her head dips and lifts. | 2.4 |
| Tip her hat | `hat` | Left hand to the brim, a nod, a smile. | 2.6 |
| Curtsey | `curtsey` | Holds her skirt out at both sides, right foot behind, dips and bows her head. | 3.0 |
| Twirl | `twirl` | One full turn on her toes, arms out; hair and skirt fly. | 2.6 |
| Pick a herb | `herb` | Kneels on her right knee, picks at the ground with her right hand, brings it to her nose, shuts her eyes, smiles, stands. | 5.0 |
| Wave | `wave` | Right hand up beside her hat, palm out, waving; head tilted; smiling. | 2.6 |
| Look round | `look` | Over her right shoulder, then her left. | 3.6 |

How they are written: every frame all body bones go back to rest (`restAll`), the move is laid on top (`add`), then her feet
are planted and her hands brought to their points by a two-bone reach (`ik2`; `reach` for an arm), hands are turned to face
the right way (`aimHand`), feet set level (`flatFoot`), fingers curled (`fingers`), and the soft chains are stepped. A hand
travels from where it hangs to its point along a line that bows forward, so its elbow bends on the way. Points on her head
(her glasses, her hat brim, her nose) are followed with `carried('head', ...)`, so the hand stays on them when she nods.

Limits: tuned from stills (`tools/strip.py`, `tools/allmoves.sh`), never watched playing. Hair and skirt bend in 12 cm
stretches. A hand can pass through a lock of hair. When she stands up from kneeling her left thigh shows at the slit for a moment.

## Stage four: painted hands, the cloak, the moss

### Hands (`bake_hands_io.py`, `hand_marks.json`)

- D1 is her left hand, D2 her right (flipped into a left-hand layout for baking, as the Ranger's). Landmarks were measured with
  `tools/hand_measure.py` and checked by eye with `tools/hand_marks.py`; `tools/flip_hand.py` flips D2 for those two.
- Each hand has its own scale across (`KX`: little knuckle to index knuckle is the model's 57.3 mm; D1 234.6 px, D2 224.7 px).
  Her painted middle finger is about 340 px from web to tip; each finger strip is fitted root to tip on its own.
- `hands` and `handsR` in `out/io_tex.js`, 1024 x 1024 each, in the layout `src/32_hands.js` reads. The nail plates are now only a
  clear gloss over the painted nails.
- The hand's tone where it leaves the arm is brought to the plain arm colour, and the arm's paint fades to that colour over its
  last 7 cm, so they meet without a step in tone. A faint line of shape remains at the wrist.
- The thin edges of the hand are soft paint: neither painting shows them.

### The cloak (`src/I45_robe.js`, textures in `src/I21_tex.js`)

- Shape from F4 (laid flat), F5 (the sleeve on an arm) and F6 (cloth, trim, shoulder cut-out, hem point); the moss from M1.
- `tier()` builds one tier of cloth from a point function, a top and a hem, and puts the moss strip and the ferns on the hem.
- **Body:** two layers with zigzag hems, open 29 degrees each side of the middle of her front. Above her waist it lies on her
  torso (`wTorso`); below it rides the skirt's twelve chains, 1.2 cm outside the skirt (`robeS`). Under her arms it starts at
  the armpit; in front and behind it runs up over her shoulders by her neck.
- **Sleeves:** a gold band round the upper arm, cloth in front of and behind the bare shoulder, then three tiers; the third ends
  in a long point at the back of her arm on the side toward her body. Toward her body the sleeve stays close to her arm.
- **How a sleeve moves:** 24 soft points a sleeve (4 round the arm at 6 heights). Each is a one-bone chain hung from a point
  further up her arm (`SLA`), carried by her upper arm or forearm, and wants to keep the direction it hangs in at rest whatever
  her arm does (`g` 0.80 to 0.93, measured against her chest's heading, `yaw: 'spine3'`). So the cloth drops below a lifted
  arm, slides to the elbow when the forearm rises, and flies out in a twirl. A chain can now carry its own settings (`soft`).
- **Cloth and trim** are drawn by code (`robeTexIo`): burgundy with a fine weave, gold dots, and a gold vine band in the bottom
  tenth of the picture, which every hem reads. Not sheer.
- **Moss** (`mossTexIo`, `fernTexIo`): a strip of tufts with gaps on every hem, and a small fern card every few columns.
- 230 bones in all. `opts.noRobe` builds her without the cloak; "Cloak" under Show hides it.

Limits: the body is rounder and fuller than M1 because it rides the skirt; the sleeves are narrower than M1's wide wings; hair
and sleeves pass through each other at her shoulders; a forearm can show through a sleeve when the elbow bends; the cloth is
not cut from the F10 and F12 swatches yet.

## Stage five: belt, pouch, crystal, necklaces, bracelets (`src/I46_gear.js`)

- **Necklaces (F1, F2):** a fine silver chain on her collarbones with a clear drop; a dark cord to mid-chest with a small gold
  loop, a large crescent moon, a small crescent and a cross. Both lie on her torso (`frontZ` finds its front surface) and follow
  her chest; the pendant does not swing.
- **Belt (F3):** a dark leather strap at 1.056 m, 8.5 mm outside the skirt's waistband and under the cloak, with a gold ring
  buckle and prong at the middle of her front. It goes with her hips, as the waistband does.
- **Pouch (F3, placed by M1 and G8):** on her right hip (38 degrees round from the front), from the belt to 0.925 m, with two gold
  lozenges for the filigree, a gold ball under it and two belt loops. One soft bone (`pouch_0`) hangs it from the belt.
- **Crystal (F3):** a six-sided clear point with a gold cap and four small gold balls, on a gold chain from a ring on the belt,
  at the front of her left hip. One soft bone (`cryst_0`).
- **Bracelets (F1, D4):** on each wrist, from her hand up: 19 black beads, 17 wood beads, 36 small gold beads. They follow the
  outline of her arm and go with her forearm.
- The cloak's two lower sleeve tiers now end short of her wrist on the outside (`src/I45_robe.js`), so the bracelets show.
- New parts: `leather`, `bead`, `wood`, `crystal`, and `gearGold` / `gearSilver` (the hat's metals under their own names, so
  the page can hide them). `opts.noGear` builds her without them; "Belt and jewellery" under Show hides them.
- 232 bones, 593,000 triangles.

Limits: plain shapes. The belt has no gold vine, holes or pointed tip; the pouch has no flap, studs or real filigree; the leather
is one flat colour (F9 has leather swatches); the crescents are simple; hair can lie through the cord.

## Round 2 paintings (arrived November 13, 2026, after stage one was built)

All 21 arrived and match their index. Nothing is built from them yet.

| Painting | Shows | For |
|---|---|---|
| F1, F2 | both necklaces, the six bracelets; the pendant front and side | jewellery |
| F3 | belt laid flat, pouch from three sides, the crystal on its chain | belt stage |
| F4, F5, F6 | robe laid flat front and back, the sleeve on an arm, drape, trim, shoulder cut-out, hem point | robe as cloth |
| F7 | bodice front, back and neckline close-up | a sharper bodice than B3 gives |
| F8 | skirt alone, one tier, the tulle underlayer | skirt as cloth |
| F9 | eight swatches (felt, two laces, bodice cloth, two black leathers, horn, brown leather) | materials |
| F10, F11, F12 | chiffon square, lace square, trim strip | repeating textures |
| G1, G2, G3 | the book shut, open, and four spreads | the book |
| G4, G5 | pendant turning into the sickle; the sickle | plain attack |
| G6 | dagger and sheath | Thornwake |
| G7 | herbs, leaves, seed, bottles, cup | small props |
| G8 | where she carries everything, front, side and back | placing things on her |
| G9 | her hands holding the book, sickle, dagger and a leaf | grips |

- F4, F8 and F11 are on light grey, not plum (the prompts asked for that so the sheer cloth reads). `tools/sil.py` keys on
  plum, so cut these with their own background colour.
- F7's bodice back is laced; B3's back has a plain middle seam. The model wears B3's for now. Her hair and robe cover most of
  it. Chris to choose.
- F3's pouch carries a gold filigree and a hanging gold ball; G8 shows the pouch on her right hip and the dagger on her left.

## Round 3 paintings (arrived November 13, 2026, while stage two was being built)

All 26 arrived and match their index. Nothing is built from them yet.

| Painting | Shows |
|---|---|
| H1, H2 | walking and running; sitting reading and kneeling |
| H3, H4 | the pendant becoming the sickle; the sickle's sweep and low cut |
| H5, H6 | a leaf lifting from the book; the healing ribbon of leaves reaching a friend |
| H7 to H10 | the seed raised and planted; the sapling and the fawn; the grown stag of wood; the stag leaping |
| H11, H12 | Moonflowers: the book floating, motes rising; the ring of white flowers with two friends inside |
| H13 | kneeling to raise a fallen friend |
| H14, H15 | the dagger drawn and driven into the ground; thorns and roses binding a foe in violet fire |
| H16 | a guard of woven thorn round her |
| H17, H18 | hit, and fallen with her hat off; victory |
| I1 to I8 | on black, for effects: leaves, sparks and moons, gold arcs, the seed growing, vines, moonflowers, violet fire, thorns rising |

They also show her whole look from many sides, with the robe: useful when the robe and the cloth are built.

## Next stages, in Chris's order (November 13)

1. His eye on her feelings and on the slower reading hand (stage ten).
2. **Her spells and attacks** (H1 to H18, I1 to I8, and round 4): the pendant becoming the sickle, the dagger drawn with
   witchfire, the book floating with its pages turning.
3. Not wanted: more work on her boots; more detail on belt, pouch and necklace.
4. Still open if he asks: the cloak nearer to M1; hair on top of her head; bringing her jog, squat, kneel and hover into line
   with the other witches' versions.
