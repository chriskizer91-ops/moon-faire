# How to make the four weights of a Moon Faire character

For any session that has a finished 3D witch (or a foe) and needs her lighter versions for the game.
Written November 13, 2026, after the Jester's were made. Brought up to date the same evening, after the Fox's.

- **The worked example:** "Jester Witch 3D: how light can she go", https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh
- **Its notes, with the code:** `claude/jester-3d-light-levels-and-fight-test.md` (the list of changes to the model, and `lod.js`).
- **The second worked example, the Fox:** "Fox Witch 3D: how light can she go", https://claude.ai/artifact/MtcEi9TdtLCh4CroRm6Jgo, with notes in `claude/fox-3d-light-levels-and-fight-test.md`. Hers is the better one to copy for the Ranger and Io: its script changes her `src/` files one by one, and it has the rule for hair (section 6).
- **The page script:** `claude/light-levels/lodpage.js` in this project.
- **How the witches are built in the first place:** `claude/HOW-TO-3d-witch-models.md`. Read it first.
- **Not in the repo yet.** The Jester's light levels were made from her built single file. Chris has not said whether to push them to `claude/jester-3d-model`. Until he does, the three places above are the source.

## 1. The idea in one paragraph

Each character has **one model and four weights of it**: Full, Trim, Light and Lightest. They are not four models. The lighter ones are made by the same function (`makeJester(opts)`, `makeFox(opts)` and so on) when it is handed a set of switches, `opts.lod`. With no `opts.lod` the function builds exactly what it built before. The lighter weights keep the same skeleton, the same moves, the same spell effects and the same paintings. They have fewer triangles, fewer points of cloth, fewer separate draws and smaller pictures.

## 2. Where each weight is used (Chris, November 13)

| Where in the game | Weight | Notes |
|---|---|---|
| Looking at one character in the menu: turn her round, play her spells | **Full** | One character alone. This is how Chris has been viewing the models. |
| Close-ups | **Full** | |
| Scenes where several come out together, directed for effect | **Trim or Full** | Whichever the scene calls for. |
| Walking around | **Trim** | **One witch walks. The other three do not follow her.** This replaces "all four walking together" in `claude/moon-faire-demo-world-plan.md`. |
| Talking | none | A picture card beside the text box, as in Envoi. |
| Fights: the party of four | **Light** | |
| Fights: the foes | **a light level** | See section 9. |
| No use chosen yet | **Lightest** | Build it anyway: he asked for four versions of each. It is the spare for crowds, far shots and slow machines. |

He said this can still be discussed. Treat it as the plan, not as final.

His one worry: "as long as switching and cutting back and forth isn't too much." Section 8 is about that.

## 3. What to aim for

The Jester's numbers, for one of her standing with her shadow. Use them as the targets for the other three witches.

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Triangles in her | 584k | 91k | 43k | 19k |
| Triangles drawn each picture | 1.28 million | 196k | 80k | 28k |
| Separate draws each picture | 80 | 72 | 60 | 33 |
| Points of cloth worked out | 15,268 | 4,510 | 1,880 | 1,076 |
| Memory for her painted surfaces | 87 MB | 44 MB | 21 MB | 21 MB |
| Time for her pose and cloth, each picture (slow test machine) | 27.5 ms | 4.8 ms | 1.1 ms | 0.55 ms |
| Time to build her (slow test machine) | 1.5 s | 0.6 s | 0.6 s | 0.6 s |

- **Round targets for any witch:** Trim under 100k triangles and 5,000 cloth points; Light under 45k and 2,000; Lightest under 20k and 1,100.
- **The cloth is the biggest cost, not the triangles.** It is processor time, and every character on screen pays it. Get the cloth points down first.
- **Real speed, for one witch:** on Chris's laptop the starter-world pilot ran at 144 pictures a second (very likely his screen's own rate) with the Jester at Trim walking and at Light in a fight (`claude/starter-world-step3-4-pilot-jester-in-the-paintings.md`). Four witches with foes has not been measured on his laptop. The times in the table are from a test machine with no graphics chip.
- **The Fox's numbers** are a little higher at Light and Lightest (55k and 31k) because her hair is kept. A witch with a lot of hair may do the same; do not starve the hair to hit a round number.

## 4. Before starting

- [ ] **She is finished and approved at Full.** Do not make light levels of a witch who is still changing: every change to her parts means redoing the lists below. By the evening of November 13 the Jester and the Fox were finished and both have their four weights.
- [ ] Copy her source to `src_before_light`.
- [ ] Write down her Full numbers: triangles in each part (`debug.meshes`), points in each cloth sheet (`debug.cloths`), draws, and the time one `animate` takes.
- [ ] Take stills of her at Full to compare against: front, side, three-quarter, face, and at fight distance.

**The rule that matters most: Full must not change.** After adding the switches, build her with no `opts.lod` and check that her triangle count and her stills are the same as before.

## 5. Step one: put the switches into her model

The Jester's note lists fifteen small replacements (`tools/patch.py`). Each one is a single line or two, and each checks that it found its line exactly once. The other witches are forks of the Jester's code with the same numbered files, so most lines will be there unchanged. Where a line differs, find the same place and make the same change. Make them in her `src/` files, not in the built file.

| # | What it lets a level do | Where |
|---|---|---|
| 1 | Go below half the cloth rows and columns (`cloth`, `clothMin`), through a second counter `CQ` used only by the cloth sheets | `00_util`, then every cloth sheet in `60_veils` and her own cloth files |
| 2 | Smaller pictures, down to a quarter size | `00_util` (`TEXS`) |
| 3 | Set the size of the hand's cells directly (`handCell`) | `32_hands` |
| 4 | Leave a part out (`skip`), or fold it into a shared part (`merge`) | `10_geom`, `addPart` |
| 6 | Turn the fine pleats down or off (`pleatK`) | `50_cloth` |
| 7 | Step the cloth less often (`clothH`, `clothMaxSub`, `clothIter`) | `50_cloth`, `stepCloth` |
| 8 | Stop working out cloth that is hidden (`dropHidden`) | wherever she has a hidden sheet |
| 9 | Hand each finished part to the level before it is bound (`onGeometry`, `material`, `onMesh`, `onCloth`) | `70_anim`, the bind loop |
| 10 | Not fall over when a skipped part is asked for by name | anything like `meshes.bells.visible = ...` |
| 11 | Draw sheer cloth once (`sheerOnce`). **Tried and not used: it made the veil paler and yellower.** | `60_veils` |
| 12 | Fewer, wider fur tufts (`tufts`) | `40_head` |
| 13 | A list of her pictures (`debug.textures`), so the game can free a copy of her | `00_util`, `90_api` |
| 14 | Soften the cloth's bend links (`bend`) | `50_cloth` |
| 15 | Keep the same pull and drag each second when the cloth step is longer | `50_cloth` |

**Two more, from the Fox:** 16 gives out her spell light (`spellLight`) so a scene can share one; 17 is her hair (section 6). Her script, `patch_fox.py` in her note, makes every change in her `src/` files and joins them, and stops if any line is not found exactly once.

Then add two files to her page:
- `lod.js` from the Jester's note. Change its last line to call her function, not `makeJester`.
- The meshoptimizer simplifier, version 1.3: `npm install meshoptimizer`, take `meshopt_simplifier.js`, and delete its last line (`export { MeshoptSimplifier };`). Wait for `MeshoptSimplifier.ready` before building her.

## 6. Step two: write her own lists

The thinning needs no work for each witch. These four lists do, because they name her parts.

1. **Tiny parts to leave out** (`skip`). Things nobody sees past arm's length: stitches, eyelets, lace tips. Never skip anything that shows in her outline.
2. **Parts that keep their own painting.** Her face, her hands, her painted bodice, and any part with a pattern she is known by (the Jester's leggings). These are never merged.
3. **Parts to merge at Lightest** (`merge`), each into `matte`, `gloss` or `metal`. Glossy things (patent boots, leather, gems) go to `gloss` so they still shine; gold and pearls to `metal`; plain cloth, hair and fur to `matte`. Keep apart any part the model shows and hides by name (the Jester's bells).
4. **What throws a shadow** at Light and Lightest (`shadowOnly`, `clothShadow`): the big parts of the body and the largest cloth sheets only.

Starting numbers. These are the Jester's; change them by eye.

| | Trim | Light | Lightest |
|---|---|---|---|
| `detail` | 0.5 | 0.5 | 0.5 |
| `textureScale` | 0.75 | 0.5 | 0.5 |
| Share of triangles kept, most parts | 0.8 | 0.5 | 0.3 |
| Share kept, face | 0.5 | 0.2 | 0.1 |
| Share kept, hands | all | 0.5 | 0.25 |
| Share kept, frilled parts | 0.5 | 0.2 | 0.12 |
| `err` (how far a surface may move, as a share of her size) | 0.004 | 0.01 | 0.03 |
| `prune` (drop loose specks) | no | yes | yes |
| `tufts` | 0.5 | 0.2 | 0.08 |
| `cloth` (share of rows and columns) | as `detail` | 0.34 | 0.25 |
| `pleatK` | 2 | 2 | 1 |
| `clothH` | 1/120 | 1/60 | 1/60 |
| `clothMaxSub` | 5 | 2 | 2 |
| `bend` | 1 | 0.6 | 0.3 |
| Merged parts | none | none | matte, gloss, metal |

**Hair made of locks or ringlets gets its own switch. Never thin it with the simplifier.** A lock is a thin tube; taking points out of it at random leaves torn shards, and building at `detail: 0.5` halves how many locks she has. What works, from the Fox (`opts.lod.hair`): keep a share of the locks in each group, make the kept ones thicker so the mass stays, give each lock fewer sides (6, then 4, then 3) and fewer steps along it, and wind it more loosely when the steps get few (under about six steps a turn a ringlet looks like bent wire). Keep the locks round the face longest. Work out every lock in the same order as at Full, skipping only the making of it, so the kept locks are the same ones in the same places. Her numbers are in her note.

**If any part to be merged is a thin sheet** seen from both sides (a frill, a blade), the shared material must be two-sided. The Fox's matte and metal are.

**Parts made of many small balls** (bells, beads) only give up triangles when asked for a much smaller share than the rest: 0.15 to 0.2 at Light.

Things the Ranger and Io have that will need their own decisions: the Ranger's belts, bags, hinged charms and sleeves made as cloth loops; Io's hat, robe and cloak. Hair and anything on a spring chain are worked out each picture like cloth, so count them in the cost. A spell that draws her a second time (the Fox's ghost in Borrowed Face) doubles her triangles while it shows: test it as the worst case.

## 7. Step three: look, then check

Look at all four weights **side by side, through one camera, doing the same thing**. The Jester's page does this with four panels (`stage.renderPanels`, added to `stage.js`; the change is at the end of this guide).

- [ ] Close, at fight distance, and at the face. Front, side and three-quarter.
- [ ] Standing, running, a twirl, a jump, and at least one spell with her arms up.
- [ ] The same with the Flipbook look on.
- [ ] Four of her in a fight with foes, at each weight (the fight test).

What to expect, from the Jester:
- **The painted face holds at every weight.** If a face looks wrong at Light, the fault is the list, not the method.
- **The cloth shows it first.** Fewer points make flatter panels and a more regular hem. That is the trade.
- **Coarse cloth is stiffer and balloons in a spin** unless change 15 is in and `bend` is lowered. Check the twirl against Full every time.
- Round things get corners: pompoms, gems, ruffs. Raise that part's share if it shows at the distance the weight is for.
- Judge each weight **at the distance it is for**. Light is for a fight, so judge it at fight distance. It does not have to hold up at the face.

Before publishing:
- [ ] Every move over every stance, at each weight, with no broken numbers and no cloth flying off (her own `check_moves.sh`, run once for each weight).
- [ ] Full rebuilt with no `opts.lod`: same triangle count, same stills.
- [ ] The table of section 3, filled in for her.
- [ ] A page like the Jester's, a note in the project, and say plainly that real speed was not measured.

## 8. Switching between weights in the game

A switch is not free. Two copies of the same character are two builds and two sets of pictures in memory.

- **Building takes time**: Full about three times as long as the others. Never build during play. Build what a scene needs while it loads, behind a fade, or while a text box is up.
- **Memory**: Full holds about 87 MB of pictures, Trim 44, Light 21. Four at Full is about 350 MB. Keep **at most one Full alive at a time**, and free her when she is no longer the one being looked at (`debug.textures`, then her geometry and materials).
- **Switch only on a cut.** The cloth of the new copy starts from rest, so a switch in the middle of a shot shows as a twitch. On a cut of the camera nobody sees it.
- **Hand over her state**: where she stands, which way she faces, her stance, and the move she is in (start it again on the new copy).
- **Never show two weights of the same character at once.**
- **One spell light for the whole scene.** Each copy carries her own spell light; take it out of her effects and keep one shared light that follows the brightest spell. Four lights would be paid for on every surface.

Suggestions, not yet put to Chris:
- The picture cards for talking can be **stills taken of the Full model once** (each face state, each character) and kept as images. They then cost nothing while the game runs, and they match the model exactly.
- A fight needs only Light. The menu needs only one Full. Walking needs only one Trim. So in most of the game there is nothing to switch: one weight is loaded for each kind of scene. Cutting back and forth only happens in directed scenes with close-ups, and there the rule is one Full at a time.

## 9. Foes

Chris: foes get a light level for fights, and a higher-detail model for close-ups, which is then baked onto the lighter one.

- **If a foe is built in code like the witches**, use this same guide: one model, weights by `opts.lod`.
- **"A light level" has to mean lighter than a witch's Light, because there are many foes.** The fight test with four witches at Light and twelve plain stand-ins draws 360k triangles in 329 draws. Twelve foes that each weighed what a Light witch weighs would add about a million triangles. A starting budget, to be changed once Chris's laptop numbers are known: an ordinary foe about 10k triangles and 6 draws, with little or no cloth; a boss up to a Light witch.
- **Envoi's wisp and wraith are already light** (`src/models/wisp.js`, `wraith.js`). Measure them before changing them.
- **Baking the detailed foe onto the light one.** Where the detail is in the painting, the thinning already carries it: it only removes points and never moves one, so the painting stays exactly where it was. Where the detail is in the shape (sculpted folds, scales, armour edges), it has to be turned into pictures: a colour picture and a picture of the bumps, taken from the detailed model and worn by the light one. **That second way has not been tried in this project.** The first session to need it should work it out on one foe and add it here.

## 10. Mistakes already made, and the rule for each

| What happened | Rule |
|---|---|
| The veil ballooned in a twirl at Light and Lightest | A longer cloth step must keep the same pull and drag each second (change 15), and coarse cloth needs softer bend links. |
| At 30 pictures a second the Lightest cloth ran at half speed | Allow at least two cloth steps a picture (`clothMaxSub: 2`). |
| Drawing the sheer veil once changed its colour | Keep both passes. A few draws are not worth a colour shift. |
| Flat purple leggings and matte boots at Lightest | A part with a pattern or a shine she is known by keeps its picture, or goes to `gloss`. |
| A hidden cloth sheet was still being worked out every picture | Look for hidden sheets (`dropHidden`). |
| Four spell lights in one scene | One shared light. |
| The Fox's ringlets came out as torn shards, and thin at Trim | Hair gets its own switch (section 6). Never the simplifier. |
| The Fox's glasses broke into pieces when merged with her other metal | A thin part she is known by stays its own part, thinned gently. |

## 11. What Chris looks for

The same as in the main guide: face first, then hands, then how the cloth reads, then how she moves. For light levels add: he wants to **see them side by side** and judge by eye, with the numbers beside them. Give him the page first and the numbers second. Write anything he reads in plain words.

## 12. Open, for Chris

- What the fight test shows on his laptop with four witches at each weight. One witch is known to run well (section 3).
- Whether the Jester's light levels go into the repo.
- Whether picture cards are stills of the Full model.
- A use for Lightest, or none.
- The foe budget in section 9.

## The change to `stage.js` (`tools/patch_stage.py`)

Two replacements. The first lets the Flipbook look size itself to a panel. The second adds `renderPanels(panels)`; add `renderPanels` to the list the stage returns.

```js
// in drawHer: take the panel's size when one is given
function drawHer(target, PW, PH) {
  if (api.look !== 'flipbook') { renderer.setRenderTarget(target); renderer.render(scene, camera); return; }
  renderer.getDrawingBufferSize(_sz); if (PW) _sz.set(PW, PH);
  // ... the rest as it was

// Several pictures in one frame. panels: [{ x, y, w, h, show }] in CSS pixels, y measured up from the bottom of the canvas;
// show() makes visible whatever that panel is to hold. Every panel looks through the same camera at the same place.
const _css = new THREE.Vector2();
function renderPanels(panels) {
  for (const [l, base, k] of LIT) l.intensity = base * (1 - k * api.dim);
  const sq = api.square && world.children.length > 0, flip = api.look === 'flipbook', glow = api.glow && !glowBad, pr = renderer.getPixelRatio();
  floor.visible = !sq && !flip && !api.noFloor;
  let target = null;
  if (glow) { try { glowSize(); target = main; } catch (e) { glowBad = true; target = null; } }
  const ac = renderer.autoClear; renderer.autoClear = false; scene.background = null; renderer.getSize(_css);
  const b = api.bg || BG;
  const whole = () => { if (target) { target.viewport.set(0, 0, target.width, target.height); target.scissor.set(0, 0, target.width, target.height); target.scissorTest = false; } renderer.setViewport(0, 0, _css.x, _css.y); renderer.setScissor(0, 0, _css.x, _css.y); renderer.setScissorTest(false); };
  whole(); renderer.setRenderTarget(target); renderer.setClearColor(sq ? _black : b, 1); renderer.clear();
  if (sq) postMat.uniforms.uBg.value.set(0.10, 0.075, 0.13); else postMat.uniforms.uBg.value.set(b.r, b.g, b.b);
  for (const p of panels) {
    if (p.show) p.show();
    camera.aspect = p.w / p.h; placeCamera();
    const X = Math.floor(p.x * pr), Y = Math.floor(p.y * pr), W = Math.max(1, Math.floor(p.w * pr)), H = Math.max(1, Math.floor(p.h * pr));
    if (target) { target.viewport.set(X, Y, W, H); target.scissor.set(X, Y, W, H); target.scissorTest = true; }
    renderer.setViewport(p.x, p.y, p.w, p.h); renderer.setScissor(p.x, p.y, p.w, p.h); renderer.setScissorTest(true);
    renderer.setRenderTarget(target);
    if (sq) {
      if (api.worldLight) api.worldLight(api.dim, api.dark);
      renderer.render(world, camera);
      const d = Math.min(1, Math.max(0, api.dark)); if (d > 0.003) { darkMat.color.setScalar(1 - d); pass(darkMat, target); }
    }
    drawHer(target, W, H);
  }
  whole(); renderer.setRenderTarget(target);
  if (glow) { try { bloom(); } catch (e) { glowBad = true; } }
  renderer.setRenderTarget(null); renderer.autoClear = ac;
}
```
