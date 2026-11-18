# Ranger 3D: her four weights, and the fight test

November 14, 2026. The third witch to get the set, after the Jester (`claude/jester-3d-light-levels-and-fight-test.md`) and the Fox (`claude/fox-3d-light-levels-and-fight-test.md`). The method is `claude/HOW-TO-3d-light-levels.md`.

- **Page:** "Ranger 3D: how light can she go", https://claude.ai/artifact/N79UjtHYW2rn1gmHgyt2Ks. Four panels side by side, each level alone, the fight test (four of her and 0, 12 or 30 stand-in foes in the night square), the Flipbook look with its two sliders (opening at 1.2 mm of her to a pixel, as Chris liked).
- **Built from:** branch `claude/ranger-3d-model`, commit `3e6706e` (stage 14), `models/ranger-3d/`. The branch was only read. Nothing was pushed.
- **What Chris asked:** "the ranger Witch is done so could you do a lod set for her now please".

## The numbers

One of her, standing in "Ready", with her shadow. Measured in the test browser.

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Triangles in her | 394,000 | 96,000 | 59,000 | 38,000 |
| Triangles drawn each picture, with her shadow | 902,000 | 191,000 | 100,000 | 72,000 |
| Separate draws each picture | 110 | 102 | 74 | 41 |
| Memory for her painted surfaces | 70 MB | 42 MB | 22 MB | 22 MB |
| Time to work out her pose, each picture (test machine) | 0.8 ms | 0.6 ms | 0.6 ms | 0.5 ms |

The fight test, four of her and 12 foes in the night square: 3.65 million triangles in 536 draws at Full, 809,000 in 504 at Trim, 445,000 in 392 at Light, 332,000 in 260 at Lightest.

Full is unchanged: the same triangle count as her own page and the same picture, pixel for pixel.

## What is different about her

- **She has no cloth worked out point by point.** Her sleeves, band tails, loose locks, bags and charms hang on bones. So her pose costs under a millisecond at every level, and none of the cloth changes in the Jester's and the Fox's patches are needed. Her cost is triangles and draws.
- **Her triangles are in her face and hands.** At Full her face is 94,000 and each hand 59,000. Her hands are also drawn twice (see the next point). The model's own `detail: 0.5` switch already takes her from 394,000 to 140,000 with nothing visible lost; the levels start from there.
- **Her forearms, hands and nails are drawn a second time** over the lace sleeves (`handOver`, `armLOver` and so on, in `R99_static.js`), so the lace can never show through an arm. That is why "drawn each picture" is so far above "in her" at Full. The second copies share the thinned parts, so they shrink with them. They are kept at every level.
- **About sixty materials.** Each is a separate draw, twice with a shadow. Light stops the small parts throwing shadows. Lightest folds 28 small parts into three shared plain materials.

## What each level does

- **Trim:** `detail: 0.5`, pictures at three quarters. Face thinned to 60%, charms to 40%, everything else to 85% or left alone. No boot stitches, eyelets, lace tips or eyelet holes.
- **Light:** pictures at half. Face 30%, hair 60%, charms 12%, buckles, hooks and weapon fittings 30 to 40%. Only the big parts throw a shadow.
- **Lightest:** face 15%, hair 40%. Charms, buckles, hooks, belts, soles, socks, sword, knives and sheaths share `matte`, `gloss` or `metal`, wearing their old colour as paint on each point. No nails, no nose pads.

## Found on the way (for the manual)

1. **Thin rods stay their own part and are thinned gently.** Her bow (`moon`) is open filigree. At 30% it went faceted and at Lightest, merged with the rest of the metal, it broke up. It is kept as its own part at every level: 60% with a tight limit at Light, 45% at Lightest. Her glasses' frame (`wire`) the same, as on the Fox.
2. **Smaller pictures make painted creases stand out harder.** At half-size pictures her boot leather looked crumpled: the crease picture (`crinkleTex`) comes out stronger at small sizes. A level can now calm a part's creases: `normalScale: { boot: 0.4 }`. With that, and boots thinned to only 85%, they look as they do at Full. Her boots are approved as they are, so this mattered.
3. **Parts the build reads by name must not be skipped or merged:** `face`, `torso`, `band`, `armL`, `armR` (later steps read `buckets.face` and so on). Parts her moves light must keep their own material: `gem`, `lens`, `veins`, `bowGem`, `swordGem`, `knifeGem`.
4. **Lace sleeves are left whole** (`lacesl: 1`). They are only about 500 triangles, and thinning a see-through sheet gains nothing.
5. **Her interface is her own** (`animate(dt)`, `play(name)`, moves that repeat while chosen). The page was written for the Jester's interface, so `lod_ranger.js` has a small `wrap()` that gives her that face without changing her. Three things were added to what her model hands back, for that: `shots`, `slow` and `move`.
6. A small fault found in the Jester's and the Fox's page script and put right in hers only: the camera's height never eased, because a note in the middle of the line cut off the easing. It jumps on their pages. Harmless.

## Checked, and not

- All 24 of her moves played at Trim, Light and Lightest for five seconds each: no errors, no bone gone astray.
- Stills of all four levels: whole body, head, hips and charms, back (bow and knives), boots; Moonsteel Draw, sword, knives, the gem, Silverglass and sitting at Light and Lightest. The face reads the same at all four.
- The page at laptop and phone size; the fight test at every level; the Flipbook look in the fight and close up.
- **Not checked: real speed, and motion.** The test browser draws about two pictures a second. Chris's laptop is the one that counts.
- **Not checked:** her hair in the Flipbook look. Her own page's note says her grey hair lands on olive brown in the 56 colours and wants greys added. This page uses the plain 56, as hers does.
- **Not done:** `claude/HOW-TO-3d-light-levels.md` has not been updated with the six points above.

## The code

Two files, both below in full. `patch_ranger.py` puts the switches into her source (ten replacements in four files; each must be found exactly once). `lod_ranger.js` holds the levels, the thinning step and the wrapper. The page also needs `meshopt_simplifier.js`, and `stage_lod.js` (the stage with panels: `patch_stage.py` in `claude/flipbook-look-finer-and-pilot.md`). Its page script is the Fox's with her moves and wording swapped in by a small build script.

### patch_ranger.py

```python
# patch_ranger.py: puts the light-level switches (opts.lod) into the Ranger's source, file by file.
# Reads models/ranger-3d/src, writes the changed files to src_lod, and joins them as ranger_lod.js. With no opts.lod she builds exactly as before.
# The Ranger has no cloth worked out point by point (her sleeves, band tails and locks hang on bones), so the cloth changes of the Jester's
# and the Fox's patches are not needed. What is left is the short list below: 1, 2, 3, 4, 9, 13 of the Jester's numbering, and one of her own (18).
import os, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ranger/models/ranger-3d/src'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/rangerw'
ORDER = ['00_util', 'R05_tables', '10_geom', '20_tex', 'R21_tex', 'R30_body', 'R31_boots', '32_hands', 'R40_head', 'R41_hair', 'R42_glasses', 'R45_gear', 'R46_bow', 'R47_sword', 'R48_knives', 'R49_veins', 'R99_static']      # the order in build_r.sh
names = [SRC + '/' + n + '.js' for n in ORDER]
F = {n: open(n, encoding='utf-8').read() for n in names}
touched = set()
def rep(a, b, only=None):
    hits = [n for n in names if a in F[n] and (only is None or os.path.basename(n) == only)]
    assert len(hits) == 1 and F[hits[0]].count(a) == 1, (a[:70], [(os.path.basename(n), F[n].count(a)) for n in hits])
    F[hits[0]] = F[hits[0]].replace(a, b); touched.add(os.path.basename(hits[0]))
# 1 the level's switches
rep("const DET = Math.max(0.5, Math.min(1,", "const LOD = opts.lod || {};\n  const DET = Math.max(LOD.minDetail || 0.5, Math.min(1,")
# 2 smaller pictures
rep("const TEXS = Math.max(0.5, Math.min(1,", "const TEXS = Math.max(0.25, Math.min(1,")
# 3 the hand's cells
rep("const h = (opts.handGrid || 0.00125) / (DET * DET);", "const h = LOD.handCell || (opts.handGrid || 0.00125) / (DET * DET);")
# 4 leave a part out, or fold it into a shared part (never face, torso, band, armL or armR: later steps of her build read those by name)
rep("    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;",
    "    if (LOD.skip && LOD.skip[key]) return { key, start: 0, count: 0 };\n    const srcKey = key; if (LOD.merge && LOD.merge[key]) key = LOD.merge[key];\n    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;\n    (B.src || (B.src = [])).push([B.n, n, srcKey]);")
# 9 hand each finished part to the level
rep("""    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key;""",
"""    if (LOD.onGeometry) LOD.onGeometry(key, g, B, { MATS, lin, sheen, std, phys });
    const m = new THREE.SkinnedMesh(g, (LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS.cloth);
    m.name = key;""")
rep("root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;",
    "root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += g.index.count / 3; if (LOD.onMesh) LOD.onMesh(key, m);")
# 13 a list of her pictures, to add up their memory
rep("const t = new THREE.CanvasTexture(c);", "const t = new THREE.CanvasTexture(c); TEXLIST.push(t);", only='00_util.js')
rep("const cvs = (w, h) => {", "const TEXLIST = [];\n  const cvs = (w, h) => {")
# 18 (the Ranger's own) what a host needs to run her beside others: which move she is in and how long each short move lasts
rep("moves: MOVES, walk,", "moves: MOVES, shots: SHOTS, slow: SLOW, get move() { return mv; }, walk,")
rep("debug: { SK, meshes,", "debug: { textures: TEXLIST, SK, meshes,")
os.makedirs(OUT + '/src_lod', exist_ok=True)
for n in names: open(OUT + '/src_lod/' + os.path.basename(n), 'w', encoding='utf-8').write(F[n])
open(OUT + '/ranger_lod.js', 'w', encoding='utf-8').write(''.join(F[n] for n in names))
print('changed files:', sorted(touched))
```

### lod_ranger.js

```js
// lod_ranger.js: the lighter weights of the Ranger. Each level is a set of switches handed to makeRanger as opts.lod (tools/patch_ranger.py
// shows where her model reads them). Nothing here changes how she is built at Full. The first half is the same as the Jester's and the Fox's.
(function () {
  'use strict';
  // Take triangles out of a finished part. The simplifier only ever removes points, it never moves one or makes a new one, so the
  // painting on the part (its uv), its skin weights and anything else stored on each point stay exactly right.
  function simplify(g, ratio, err, prune) {
    const S = window.MeshoptSimplifier; if (!S || !S.supported || window.WITCH_LOD.thin === false || ratio >= 1) return;
    const src = g.index.array instanceof Uint32Array ? g.index.array : new Uint32Array(g.index.array), pos = g.attributes.position.array;
    const target = Math.max(3, Math.floor(src.length * ratio / 3) * 3);
    let out; try { out = S.simplify(src, pos, 3, target, err == null ? 0.02 : err, prune ? ['Prune'] : [])[0]; } catch (e) { return; }
    if (!out || out.length < 3) return;
    const nv = pos.length / 3, remap = new Int32Array(nv).fill(-1); let n = 0;
    for (let i = 0; i < out.length; i++) { const v = out[i]; if (remap[v] < 0) remap[v] = n++; }
    for (const name in g.attributes) {
      const a = g.attributes[name], k = a.itemSize, A = a.array, B = new A.constructor(n * k);
      for (let v = 0; v < nv; v++) { const r = remap[v]; if (r >= 0) for (let q = 0; q < k; q++) B[r * k + q] = A[v * k + q]; }
      g.setAttribute(name, new THREE.BufferAttribute(B, k, a.normalized));
    }
    const idx = n > 65535 ? new Uint32Array(out.length) : new Uint16Array(out.length);
    for (let i = 0; i < out.length; i++) idx[i] = remap[out[i]];
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  // the colour a painted cloth averages to, for parts that give up their own picture
  function meanColour(mat) {
    const c = new THREE.Color(1, 1, 1);
    try {
      const im = mat.map && mat.map.image;
      if (im && im.width) { const k = document.createElement('canvas'); k.width = k.height = 8; const g = k.getContext('2d'); g.drawImage(im, 0, 0, 8, 8); const d = g.getImageData(0, 0, 8, 8).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; } c.setRGB(r / 64 / 255, gg / 64 / 255, b / 64 / 255).convertSRGBToLinear(); }
    } catch (e) { /* a picture that cannot be read keeps white */ }
    if (mat.color) c.multiply(mat.color);
    return c;
  }
  const SHARED = { matte: 1, metal: 1, gloss: 1 };
  function hooks(L) {
    const lod = Object.assign({}, L);
    lod.onGeometry = (key, g, B, K) => {
      if (L.merge && SHARED[key]) {                 // merged parts wear their old colours as paint on each point
        const col = new Float32Array(B.n * 3);
        for (const [start, count, src] of B.src) { const c = meanColour(K.MATS[src] || K.MATS.cloth); for (let i = start; i < start + count; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      const sp = L.simplify || {}, r = sp[key] != null ? sp[key] : sp['*'];
      if (r != null && r < 1) simplify(g, r, (L.errOf && L.errOf[key]) != null ? L.errOf[key] : L.err, L.prune && !(L.keepSpecks && L.keepSpecks[key]));
    };
    // the shared materials are two-sided: straps, blades and the insides of sheaths are thin sheets seen from both sides
    lod.material = (key, B, K) => {
      if (key === 'matte') return K.sheen(K.std({ vertexColors: true, roughness: 0.84, envMapIntensity: 0.3, side: THREE.DoubleSide }), '#8a7a70', 2.6, 0.25);
      if (key === 'metal') return K.std({ vertexColors: true, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.3, side: THREE.DoubleSide });
      if (key === 'gloss') return K.std({ vertexColors: true, roughness: 0.34, envMapIntensity: 0.9 });
      return null;
    };
    // normalScale: smaller pictures make a part's painted creases stand out harder than at Full; a level can calm them
    lod.onMesh = (key, m) => { if (L.shadowOnly && !L.shadowOnly[key]) m.castShadow = false; if (L.normalScale && L.normalScale[key] != null && m.material.normalScale) m.material.normalScale.multiplyScalar(L.normalScale[key]); };
    return lod;
  }
  // ---- the Ranger's own lists ----
  // She has no cloth worked out point by point, so her cost is triangles and separate draws (she is made of about sixty materials).
  const TINY = { stitch: 1, eyelet: 1, aglet: 1, hole: 1 };                      // boot stitches, eyelets, lace tips and the dark of the eyelet holes
  const BIG = { face: 1, hair: 1, torso: 1, skin: 1, form: 1, hand: 1, handR: 1, armL: 1, armR: 1, leggings: 1, lacesl: 1, boot: 1, sole: 1, sock: 1, gear: 1, belt: 1, moon: 1, scab: 1, blade: 1, swordSteel: 1, sheath: 1 };      // the parts big enough to throw a shadow worth drawing
  const BEADS = { charmGold: 1, teal: 1, pearl: 1, amber: 1, crystal: 1, gold: 1, gearBrass: 1, hookBrass: 1, iron: 1, steel: 1, lace: 1, moon: 1, swordGold: 1, swordSteel: 1, knifeSteel: 1, knifeCord: 1, wire: 1, bowGem: 1, swordGem: 1, knifeGem: 1, gem: 1 };      // many small separate pieces: never pruned as specks
  const LEVELS = [
    { id: 'full', name: 'Full', note: 'The model as it is today', opts: { detail: 1, textureScale: 1 } },
    { id: 'trim', name: 'Trim', note: 'Half the rings in every part, the smallest boot fittings left off',
      opts: { detail: 0.5, textureScale: 0.75 },
      lod: { simplify: { face: 0.6, charmGold: 0.4, moon: 0.6, lace: 0.6, iron: 0.6, steel: 0.7, veins: 0.5, wire: 1, lock: 1, lens: 1, '*': 0.85 }, err: 0.004, errOf: { charmGold: 0.03, lace: 0.02 }, skip: TINY } },
    { id: 'light', name: 'Light', note: 'Every part thinned again; charms, buckles and weapons most of all',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { simplify: { face: 0.3, hair: 0.6, boot: 0.85, charmGold: 0.12, teal: 0.3, pearl: 0.4, amber: 0.5, moon: 0.6, lace: 0.3, iron: 0.3, steel: 0.35, gold: 0.35, hookBrass: 0.35, gearBrass: 0.5, swordSteel: 0.4, swordGold: 0.35, knifeSteel: 0.4, knifeCord: 0.4, bowWrap: 0.4, veins: 0.3, nail: 0.4, wire: 0.7, lock: 1, lens: 1, lacesl: 1, '*': 0.5 },
        err: 0.01, errOf: { charmGold: 0.06, teal: 0.05, pearl: 0.05, lace: 0.05, iron: 0.03, steel: 0.03, gold: 0.03, hookBrass: 0.03, wire: 0.004, moon: 0.004, boot: 0.004 }, prune: true, keepSpecks: BEADS, skip: TINY, shadowOnly: BIG, normalScale: { boot: 0.4 } } },
    { id: 'lightest', name: 'Lightest', note: 'Small parts share three plain materials; her glasses, gems, face, hair, lace and leather keep their own',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { simplify: { face: 0.15, hair: 0.4, hand: 0.5, handR: 0.5, torso: 0.6, boot: 0.5, moon: 0.45, metal: 0.11, gloss: 0.3, matte: 0.24, veins: 0.2, wire: 0.6, lock: 0.75, lens: 1, gem: 0.6, lacesl: 1, '*': 0.4 },
        err: 0.03, errOf: { metal: 0.08, gloss: 0.08, wire: 0.004, moon: 0.006, boot: 0.008 }, normalScale: { boot: 0.4 }, prune: true, keepSpecks: Object.assign({ metal: 1, gloss: 1, matte: 1 }, BEADS), skip: Object.assign({ nail: 1, pad: 1 }, TINY),
        // her glasses' frame (wire) and her bow (moon) stay their own parts: thin rods thinned with the rest of the metal break into pieces. The gems keep their own
        // materials because her moves light them.
        merge: { gold: 'metal', charmGold: 'metal', gearBrass: 'metal', hookBrass: 'metal', steel: 'metal', iron: 'metal', blade: 'metal', swordSteel: 'metal', swordGold: 'metal', knifeBlade: 'metal', knifeSteel: 'metal',
          laceband: 'matte', lace: 'matte', keeperB: 'matte', bowWrap: 'matte', swordGrip: 'matte', scab: 'matte', scabStrap: 'matte', knifeCord: 'matte', sheath: 'matte', sole: 'matte', sock: 'matte', belt: 'matte', beltHole: 'matte',
          teal: 'gloss', pearl: 'gloss', amber: 'gloss', crystal: 'gloss' },
        shadowOnly: { face: 1, hair: 1, torso: 1, skin: 1, form: 1, hand: 1, handR: 1, armL: 1, armR: 1, leggings: 1, lacesl: 1, boot: 1, gear: 1, matte: 1, metal: 1, moon: 1 } } }
  ];
  // The pages that show a witch at four weights were written for the Jester's interface (animate(phase, walk, time, dt, run), play(id, force),
  // action, busy, state.hitN, fx, spellLight). This gives the Ranger that face without changing her: she has her own (animate(dt), play(name)).
  function wrap(R) {
    const light = new THREE.PointLight(0x9fd0ff, 0, 3, 1.6), own = {}; for (const k in R.meshes) if (!/Over$/.test(k)) own[k] = R.meshes[k];
    let cur = '', once = false, hitAt = 0;
    const J = { R, root: R.root, fx: new THREE.Group(), spellLight: light, skeleton: R.skeleton, fade: 1, spin: 0, dim: 0, dark: 0, action: '', pending: null, time: 0, target: null, targetDist: 0, state: { hitN: 0 },
      debug: { cloths: [], textures: R.debug.textures, meshes: own }, get busy() { return !!J.action && once; }, get triangles() { return R.triangles; },
      stop() { J.action = ''; once = false; },
      play(id, force, one) { if (R.moves.indexOf(id) < 0) return; J.action = id; once = !!one; cur = id; R.play(id); hitAt = R.shots[id] ? 0.6 * R.shots[id] : 0; },
      animate(phase, wb, time, dt, rb) {
        if (J.action && once && R.shots[J.action] && R.move.t >= R.shots[J.action]) { J.action = ''; once = false; }
        if (J.action && hitAt && R.move.t >= hitAt) { hitAt = 0; J.state.hitN++; }
        const want = J.action || (wb > 0.5 ? (rb > 0.5 ? 'jog' : 'walk') : 'idle');
        if (want !== cur) { cur = want; R.play(want); }
        J.time = R.move.t; R.animate(dt);
      } };
    R.play('idle'); cur = 'idle';
    return J;
  }
  window.WITCH_LOD = { LEVELS, hooks, simplify, wrap,
    raw(level, extra) { const L = typeof level === 'string' ? LEVELS.find((x) => x.id === level) : level; const o = Object.assign({}, L.opts, extra || {}); if (L.lod) o.lod = hooks(L.lod); return makeRanger(o); },
    make(level, extra) { return wrap(this.raw(level, extra)); } };
})();
```
