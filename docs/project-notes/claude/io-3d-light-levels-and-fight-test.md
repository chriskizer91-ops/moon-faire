# Io 3D: her four weights, and the fight test

November 14, 2026. The fourth and last witch to get the set. The others: `claude/jester-3d-light-levels-and-fight-test.md`, `claude/fox-3d-light-levels-and-fight-test.md`, `claude/ranger-3d-light-levels-and-fight-test.md`. The method is `claude/HOW-TO-3d-light-levels.md`.

- **Page:** "Io 3D: how light can she go", https://claude.ai/artifact/MUxJCt6d921JK6Yzwa1TXn. Four panels side by side, each level alone, the fight test (four of her and 0, 12 or 30 stand-in foes in the night square), the Flipbook look with its two sliders (opening at 1.2 mm of her to a pixel).
- **Built from:** branch `claude/io-3d-model`, commit `3bc17a3` (stage fourteen), `models/io-3d/`. The branch was only read. Nothing was pushed.
- **What Chris asked:** "can you do a lod for io the witch now she is done".

## The numbers

One of her, standing, with her shadow. Measured in the test browser.

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Triangles in her | 594,000 | 140,000 | 69,000 | 45,000 |
| Triangles drawn each picture, with her shadow | 1,188,000 | 280,000 | 126,000 | 82,000 |
| Separate draws each picture | 97 | 91 | 70 | 49 |
| Memory for her painted surfaces | 74 MB | 56 MB | 44 MB | 44 MB |
| Time to work out her pose, each picture (test machine) | 0.8 ms | 0.9 ms | 0.7 ms | 0.7 ms |

The fight test, four of her and 12 foes in the night square: 4.79 million triangles in 429 draws at Full, 1.16 million in 405 at Trim, 548,000 in 340 at Light, 373,000 in 263 at Lightest.

Full is unchanged: the same triangle count as her own page.

## What is different about her

- **Her hair is her biggest cost.** 160 wavy ribbons, each a flattened tube six points round: 184,000 triangles at Full, nearly a third of her. Then her face (94,000) and her hands (59,000 each).
- **No cloth worked out point by point**, like the Ranger. Her robe, sleeves, hair and hat hang on bones, so her pose costs under a millisecond at every level.
- **What her spells bring is not thinned.** The Guardian, the garden, the thorns, the training dummy and the rest are about 94,000 triangles in 218 pieces, built once with her and the same at every level. They are drawn only while a spell shows them. A spell at Lightest can cost more than she does. Thinning them is the next thing to do for her if spells stutter.
- **She casts at whoever stands in front of her.** The Fox and the Ranger cast to their left. Her spells land 1.4 m ahead, where her own page stands a training dummy. In the fight test the dummy is hidden, so a spell falls short of the foe. The game will need her spells aimed at a foe's place.

## What each level does

- **Trim:** `detail: 0.5`, pictures at three quarters. Hair ribbons four-sided with fewer steps along. Face 60%, robe 70%, everything else 85% or left alone. No boot stitches, eyelets or lace tips.
- **Light:** pictures at half. Hair ribbons flat and 15% wider, with most of their turning taken out. Face 30%, robe 45%, jewellery and laces 30 to 50%. Only the big parts throw a shadow.
- **Lightest:** seven in ten of her hair ribbons, 35% wider, no turning. Face 15%. Belt gear, beads, laces, soles and socks share `matte`, `gloss` or `metal`. No nails, no nose pads.

## Found on the way (for the manual)

1. **Hair ribbons are changed where they are made, never thinned afterwards** (the Fox's rule again). A level's `hair` switch sets: `sides` (points round; 2 makes a flat ribbon seen from both sides), `sub` (steps along), `keep` (share of ribbons), `wide`, `twist`.
2. **Leaving out every other step makes waves zig-zag.** The first try did that and her waves went angular. `sub` is a step count that need not be whole: 0.8 keeps the waves round.
3. **A flat ribbon that turns as it waves is seen edge-on in places**, and shows as dark gaps and pale slivers. Taking the turning out (`twist: 0.2`, then `0`) makes them lie outward like playing cards, and the hair reads full again.
4. **Parts her model shows, hides or copies by name must stay their own parts:** her hat (`felt`, `brim`, `hatband`, `silver`, `gold`, `horn`: it comes off when she falls, and the fallen hat is a copy of those parts), her book (five parts), her sickle (two). `face` and `torso` are read while she is built.
5. **The page's count of draws was wrong for her at first.** It only looked at whether a part's own group was hidden. What her spells bring lies several groups deep. It now checks every group above a part.
6. **A note in the middle of a line cuts off the rest of the line.** It happened in my build script (the aiming line) and stopped the page. The same mistake is why the camera's height does not ease on the Jester's and the Fox's pages.

## Checked, and not

- All 27 of her moves played to their end at Trim, Light and Lightest: no errors, no bone gone astray.
- Stills of all four levels: whole body, head from the front, side and back; Harvest Crescent and the Elderwood Guardian in the four panels; the fight test at every level; Thornwake in the fight with the Flipbook look on.
- Her face reads the same at all four. Her hair is where the levels show: at Light it is a little flatter close up; at Lightest some ribbon ends are blunt.
- **Not checked: real speed, and motion.** The test browser draws about two pictures a second.
- **Not checked:** each spell at each level by eye, beyond the two named.
- **Not done:** `claude/HOW-TO-3d-light-levels.md` has not been updated with the points above or the Ranger's.

## The code

Two files, both below in full. `patch_io.py` puts the switches into her source (fourteen replacements in five files; each must be found exactly once). `lod_io.js` holds the levels, the thinning step and the wrapper that gives her the interface the page expects. The page also needs `meshopt_simplifier.js` and `stage_lod.js` (`patch_stage.py` in `claude/flipbook-look-finer-and-pilot.md`). Its page script is the Fox's with her moves swapped in, and three lines changed because she casts forward: the aiming line (`atan2(dx, dz)`), the camera's shift (along z, not x), and a turn to her side when a spell is picked.

### patch_io.py

```python
# patch_io.py: puts the light-level switches (opts.lod) into Io's source, file by file.
# Reads models/io-3d/src, writes the changed files to src_lod, and joins them as io_lod.js. With no opts.lod she builds exactly as before.
# Io is built on the same base as the Ranger and, like her, has no cloth worked out point by point (her robe, sleeves, cloak, hair and hat
# hang on bones). So this is the Ranger's short list: 1, 2, 3, 4, 9, 13 of the Jester's numbering. Her model already hands back which
# move she is in (move, moveT, shots), so the Ranger's number 18 is not needed.
import os, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/io/models/io-3d/src'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/iow'
ORDER = ['00_util', 'I05_tables', '10_geom', '20_tex', 'I21_tex', 'I30_body', 'I31_boots', '32_hands', 'I40_head', 'I42_glasses', 'I43_hat', 'I41_hair', 'I45_robe', 'I46_gear', 'I47_props', 'I98_fx', 'I98b_wood', 'I98c_garden', 'I98d_thorn', 'I98e_react', 'I99_static']      # the order in build_io.sh
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
# 17 her hair: 160 wavy ribbons, each a flattened tube six points round. Tubes are never thinned afterwards (the Fox's lesson): a level
# asks for fewer points round (2 makes a flat ribbon, seen from both sides), fewer steps along (sub: steps for each point of the tress's
# middle line; she has 2 at Full and 1 at half detail, and it need not be a whole number), fewer ribbons, each a little wider.
# Leaving out every other step made the waves zig-zag; a step count just under 1 keeps them round.
rep("""    const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
    const L = len[n - 1], NC = 6, rings = [], vs = [], w0 = o.w, sub = Q(2, 1),""",
"""    const HL = LOD.hair || {}; if (HL.keep != null && ((tressN * 0.618034) % 1) >= HL.keep) { tressN++; return; }
    const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
    const L = len[n - 1], NC = HL.sides || 6, rings = [], vs = [], w0 = o.w * (HL.wide || 1), sub = HL.sub || Q(2, 1),""")
rep("M = (n - 1) * sub, q1 = o.ph * 1.7,", "M = Math.ceil((n - 1) * sub), q1 = o.ph * 1.7,")
rep("      const f = k / sub, i0 = Math.min(n - 2, Math.floor(f)), u = f - i0, P = mid[i0].clone().lerp(mid[i0 + 1], u), s = lerp(len[i0], len[i0 + 1], u), t = s / L;", "      const f = Math.min(n - 1, k / sub), i0 = Math.min(n - 2, Math.floor(f)), u = f - i0, P = mid[i0].clone().lerp(mid[i0 + 1], u), s = lerp(len[i0], len[i0 + 1], u), t = s / L;")
# a flat ribbon that turns as it waves is seen edge-on in places and leaves dark gaps: a level can ask for less of the turn (twist)
rep("const tau = 0.75 * env * Math.cos(ph),", "const tau = 0.75 * (HL.twist == null ? 1 : HL.twist) * env * Math.cos(ph),")
rep("const part = loft(rings, { v: vs }); tressN++;", "const part = loft(rings, NC === 2 ? { v: vs, open: true } : { v: vs }); tressN++;")
rep("debug: { SK, meshes,", "debug: { textures: TEXLIST, SK, meshes,")
os.makedirs(OUT + '/src_lod', exist_ok=True)
for n in names: open(OUT + '/src_lod/' + os.path.basename(n), 'w', encoding='utf-8').write(F[n])
open(OUT + '/io_lod.js', 'w', encoding='utf-8').write(''.join(F[n] for n in names))
print('changed files:', sorted(touched))
```

### lod_io.js

```js
// lod_io.js: the lighter weights of Io. Each level is a set of switches handed to makeIo as opts.lod (tools/patch_io.py
// shows where her model reads them). Nothing here changes how she is built at Full. The first half is the same as the other three witches'.
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
  // ---- Io's own lists ----
  // Like the Ranger she has no cloth worked out point by point. Her cost is triangles: her hair first (160 wavy ribbons), then her face and hands.
  const TINY = { stitch: 1, eyelet: 1, aglet: 1 };                               // boot stitches, eyelets and lace tips
  const BIG = { face: 1, tress: 1, tressIn: 1, hairmass: 1, torso: 1, skin: 1, arm: 1, hand: 1, handR: 1, skirt: 1, robe: 1, tulle: 1, boot: 1, sole: 1, sock: 1, felt: 1, brim: 1, horn: 1, cloth: 1, band: 1, wood: 1, bookOpen: 1, bookShut: 1 };      // the parts big enough to throw a shadow worth drawing
  const BEADS = { bead: 1, silver: 1, gold: 1, gearGold: 1, gearSilver: 1, propGold: 1, crystal: 1, wire: 1, lace: 1, moss: 1, fern: 1, sickleGold: 1 };      // many small separate pieces: never pruned as specks
  // Never left out or folded into a shared part, because her model shows, hides or copies them by name: her hat (felt, brim, hatband,
  // silver, gold, horn: it comes off when she falls), her book (five parts), her sickle (two), and face and torso (read while she is built).
  const LEVELS = [
    { id: 'full', name: 'Full', note: 'The model as it is today', opts: { detail: 1, textureScale: 1 } },
    { id: 'trim', name: 'Trim', note: 'Half the rings in every part; her hair ribbons four-sided with fewer steps',
      opts: { detail: 0.5, textureScale: 0.75 },
      lod: { hair: { sides: 4, sub: 0.8 }, simplify: { face: 0.6, robe: 0.7, gearGold: 0.6, silver: 0.8, lace: 0.6, tress: 1, tressIn: 1, wire: 1, lens: 1, moss: 1, fern: 1, tulle: 1, '*': 0.85 }, err: 0.004, errOf: { lace: 0.02 }, skip: TINY } },
    { id: 'light', name: 'Light', note: 'Her hair as flat ribbons; every part thinned again, her jewellery and laces most of all',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { hair: { sides: 2, sub: 0.8, wide: 1.15, twist: 0.2 }, simplify: { face: 0.3, robe: 0.45, skirt: 0.6, hairmass: 0.5, felt: 0.6, brim: 0.7, boot: 0.85, gearGold: 0.3, silver: 0.5, gold: 0.5, bead: 0.35, lace: 0.3, wood: 0.5, leather: 0.5, nail: 0.4, tress: 1, tressIn: 1, wire: 0.7, lens: 1, moss: 1, fern: 1, tulle: 1, '*': 0.5 },
        err: 0.01, errOf: { gearGold: 0.04, silver: 0.02, bead: 0.05, lace: 0.05, wire: 0.004, boot: 0.004 }, prune: true, keepSpecks: BEADS, skip: TINY, shadowOnly: BIG, normalScale: { boot: 0.4 } } },
    { id: 'lightest', name: 'Lightest', note: 'Two in three of her hair ribbons, wider; small parts share three plain materials; her hat, book, sickle and glasses keep their own',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { hair: { sides: 2, sub: 0.6, keep: 0.7, wide: 1.35, twist: 0 }, simplify: { face: 0.15, robe: 0.25, skirt: 0.4, hairmass: 0.35, felt: 0.4, brim: 0.5, boot: 0.5, hand: 0.5, handR: 0.5, torso: 0.6, silver: 0.35, gold: 0.4, metal: 0.15, gloss: 0.3, matte: 0.3, tress: 1, tressIn: 1, wire: 0.6, lens: 1, moss: 1, fern: 1, tulle: 1, '*': 0.4 },
        err: 0.03, errOf: { metal: 0.08, gloss: 0.08, silver: 0.03, wire: 0.004, boot: 0.008 }, prune: true, keepSpecks: Object.assign({ metal: 1, gloss: 1, matte: 1 }, BEADS), skip: Object.assign({ nail: 1, pad: 1 }, TINY), normalScale: { boot: 0.4 },
        merge: { gearSilver: 'metal', gearGold: 'metal', propGold: 'metal', cloth: 'matte', band: 'matte', lace: 'matte', leather: 'matte', wood: 'matte', propLeather: 'matte', propWood: 'matte', sole: 'matte', sock: 'matte', bead: 'gloss', crystal: 'gloss' },
        shadowOnly: { face: 1, tress: 1, tressIn: 1, hairmass: 1, torso: 1, skin: 1, arm: 1, hand: 1, handR: 1, skirt: 1, robe: 1, boot: 1, felt: 1, brim: 1, matte: 1 } } }
  ];
  // The pages that show a witch at four weights were written for the Jester's interface (animate(phase, walk, time, dt, run), play(id, force),
  // action, busy, state.hitN, fx, spellLight). This gives Io that face without changing her: she has her own (animate(dt), play(name)).
  // standIns: her spells bring a training dummy or a friend to cast at; in a fight with real foes they are hidden.
  function wrap(R) {
    const light = new THREE.PointLight(0xb8f0c0, 0, 3, 1.6), own = Object.assign({}, R.meshes), X = R.spellFx;
    let cur = '', once = false, hitAt = 0;
    const J = { R, root: R.root, fx: new THREE.Group(), spellLight: light, skeleton: R.skeleton, fade: 1, spin: 0, dim: 0, dark: 0, action: '', pending: null, time: 0, target: null, targetDist: 0, state: { hitN: 0 }, standIns: true,
      debug: { cloths: [], textures: R.debug.textures, meshes: own }, get busy() { return !!J.action && once; }, get triangles() { return R.triangles; },
      stop() { J.action = ''; once = false; J.standIns = true; },
      play(id, force, one) { if (R.moves.indexOf(id) < 0) return; J.action = id; once = !!one; cur = id; R.play(id); hitAt = R.shots[id] ? 0.6 * R.shots[id] : 0; },
      animate(phase, wb, time, dt, rb) {
        if (J.action && once && R.shots[J.action] && R.moveT >= R.shots[J.action]) { J.action = ''; once = false; }
        if (J.action && hitAt && R.moveT >= hitAt) { hitAt = 0; J.state.hitN++; }
        const want = J.action || (wb > 0.5 ? (rb > 0.5 ? 'jog' : 'walk') : 'idle');
        if (want !== cur) { cur = want; R.play(want); }
        J.time = R.moveT; R.animate(dt);
        if (!J.standIns && X) { X.dummy.visible = false; X.ally.visible = false; X.ally2.visible = false; }
      } };
    R.play('idle'); cur = 'idle';
    return J;
  }
  window.WITCH_LOD = { LEVELS, hooks, simplify, wrap,
    raw(level, extra) { const L = typeof level === 'string' ? LEVELS.find((x) => x.id === level) : level; const o = Object.assign({}, L.opts, extra || {}); if (L.lod) o.lod = hooks(L.lod); return makeIo(o); },
    make(level, extra) { return wrap(this.raw(level, extra)); } };
})();
```
