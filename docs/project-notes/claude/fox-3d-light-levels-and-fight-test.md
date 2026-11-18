# Fox 3D: her four weights, and the fight test

November 13, 2026. Follows `claude/fox-3d-pass15-bell-falls-silent-moons-little-lie-finished.md` (the Fox finished) and `claude/HOW-TO-3d-light-levels.md` (the method). Nothing about the Full model changed.

- **The page:** "Fox Witch 3D: how light can she go", https://claude.ai/artifact/MtcEi9TdtLCh4CroRm6Jgo
- **Built from:** branch `claude/fox-3d-model`, commit `0a21ddc`, folder `models/fox-3d/`. Her branch was read, not changed.
- **Not in the repo.** The changes are a script that rewrites her `src/` files (`patch_fox.py`, below) and one new file (`lod_fox.js`, below). To build her light weights anywhere: run the script on her `src/`, load `fox_lod.js` in place of `fox.js`, load the meshoptimizer simplifier and `lod_fox.js`, wait for `MeshoptSimplifier.ready`, then call `WITCH_LOD.make('light')` (or `'trim'`, `'lightest'`, `'full'`).

## Her numbers (one Fox, standing, with her shadow)

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Triangles in her | 578k | 122k | 55k | 31k |
| Triangles drawn each picture | 1.16 million | 245k | 103k | 56k |
| Separate draws each picture | 68 | 62 | 51 | 36 |
| Of those triangles, her hair | 159k | 52k | 19k | 9k |
| Points of cloth worked out | 2,912 | 960 | 532 | 336 |
| Memory for her painted surfaces | 110 MB | 58 MB | 27 MB | 27 MB |
| Time for her pose, hair and cloth, each picture (slow test machine) | 3.2 ms | 0.8 ms | 0.4 ms | 0.24 ms |

The fight test (four of her, the night square, 12 stand-in foes, shadows on), each picture:

| Four at | Triangles drawn | Draws |
|---|---|---|
| Full | 4.67 million | 367 |
| Trim | 1.02 million | 343 |
| Light | 457k | 315 |
| Lightest | 268k | 243 |

She is a little heavier than the Jester at Light and Lightest (the Jester: 43k and 19k). That is her hair, kept on purpose.

## How she differs from the Jester

- **Her cost is triangles, not cloth.** She has four flounces and nothing else loose, so working her out takes about a ninth of the Jester's time at Full. Her triangles are in her hair (159k), her hands (121k), her face (87k) and her blouse (37k).
- **Her Full is unchanged, and this was measured.** Built from the changed source with no `opts.lod`, she has the same triangle count in every part, and a still of her is the same as the old build in every pixel.

## The lesson of this build: hair made of ringlets

**Do not thin ringlets with the simplifier.** The first try did, and her hair came out as flat torn shards at Light and Lightest, and thin and sparse at Trim. A ringlet is a thin wound tube; taking points out of it at random shreds it. Building her at `detail: 0.5` also halves how many ringlets she has, which is what made Trim look thin.

What works is to **ask for lighter ringlets as they are made** (`opts.lod.hair`, change 17 in the script):

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Ringlets kept: bun / halo | all | 80% / 70% | 50% / 40% | 32% / 24% |
| Ringlets kept: round her face (hanging, bangs) | all | all | all | 80% / 70% |
| Sides of a ringlet | 6 | 4 | 3 | 3 |
| Steps along it, against Full | 1 | 0.6 | 0.55 | 0.45 |
| How tightly it winds, against Full | 1 | 1 | 0.7 | 0.6 |
| Thickness, against Full | 1 | 1.08 | 1.3 | 1.6 |

- **Fewer, thicker locks keep the mass.** The outline of her hair stays the same size.
- **The ringlets round her face are kept longest,** because they frame the part Chris looks at first.
- **Every lock is still worked out in the same order as at Full,** and the ones left out still use up their random numbers. So the locks that are kept are the same locks in the same places.
- **Too few steps for the winding gives a zig-zag.** Below about six steps a turn a ringlet reads as a bent wire. At Light and Lightest the ringlets wind more loosely, which buys smoothness for the same triangles. At Trim, 0.5 of the steps already showed corners close up; 0.6 does not.
- This should carry to any witch whose hair is built from tubes. The Ranger and Io will need the same kind of switch in their own hair code.

## Her lists

- **Left out from Trim down:** boot stitches, eyelets, lace tips. **At Lightest also:** her nails.
- **Keep their own painting at every level:** face, hands, arms, neck, chest, corset, patchwork trousers, belt and pouch, blouse, boots, hair, scalp, ears.
- **Merged at Lightest:** leggings, laces, soles, frills, the pouch's inside, choker and belt into **matte**; bells, brass and the shears' steel into **metal**; her wooden beads into **gloss**. The matte and metal materials are two-sided, because her frills and her shears' blades are thin sheets.
- **Her glasses' frame is not merged.** Thinned with the rest of the metal it broke into pieces.
- **Her bells and beads are many small balls,** and only gave up triangles when asked for a much smaller share than the rest (0.15 to 0.2 at Light).
- **Shadows:** at Light the small fittings throw none; at Lightest only her big parts do.

## Things in her that a game should know

- **Borrowed Face draws her a second time** as a ghost, using the same parts. At Full that is another 530k triangles for as long as the ghost shows; at Light, 52k. The page's "All cast at once" plays it on all four as the worst case.
- **Same Cloth draws its target a second time.** It is given the target as `fox.target`.
- Her spell light is now given out as `fox.spellLight`, so a scene can keep one shared light (change 16).
- Her own triangle count (`fox.triangles`) leaves her flounces out. The page counts them.

## The page

The same page as the Jester's, with her moves and her eight spells: All four or one alone; Close, Fight distance, Face; the fight test at each weight with 0, 12 or 30 foes; Flipbook look (with her three blouse colours), Night square, Glow, Shadows. The night square and the foes are the Jester's page's. Its script is `claude/light-levels/lodpage.js` with her lists of moves put in.

## Checked, and not

- Full unchanged: same counts, and a still identical in every pixel.
- Every move over every stance at Trim, Light and Lightest: 198 pairs each, plus walk and run. No broken numbers, no cloth flying off.
- Stills at laptop and phone size: all four side by side standing, running, in a twirl, at the face, in Borrowed Face (the ghost shows at every weight) and Hemline Fangs; The Moon's Little Lie alone at Lightest; the Flipbook look; the fight test at all four weights.
- **Not checked:** real speed, and how her lighter hair swings. The test browser draws about two pictures a second with no graphics chip. Both are Chris's to judge on the page.

## The changes to her source (`tools/patch_fox.py`)

```python
# patch_fox.py: puts the light-level switches (opts.lod) into the Fox's source, file by file.
# Reads models/fox-3d/src, writes the changed files to src_lod, and joins them as fox_lod.js. With no opts.lod she builds exactly as before.
# The same changes as the Jester's (claude/jester-3d-light-levels-and-fight-test.md), with four that are the Fox's own: 4, 5, 16 and 17.
import re, os, glob, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/fox/models/fox-3d/src'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/foxw'
names = sorted(glob.glob(SRC + '/[0-8]*.js')) + [SRC + '/90_api.js']
F = {n: open(n, encoding='utf-8').read() for n in names}
touched = set()
def rep(a, b):
    hits = [n for n in names if a in F[n]]
    assert len(hits) == 1 and F[hits[0]].count(a) == 1, (a[:70], [(os.path.basename(n), F[n].count(a)) for n in hits])
    F[hits[0]] = F[hits[0]].replace(a, b); touched.add(os.path.basename(hits[0]))
# 1 detail floor, and a counter of their own for cloth sheets
rep("const DET = Math.max(0.5, Math.min(1,", "const LOD = opts.lod || {};\n  const DET = Math.max(LOD.minDetail || 0.5, Math.min(1,")
rep("const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));",
    "const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));\n  const CQ = (n, min) => (LOD.cloth ? Math.max(LOD.clothMin || 5, Math.round(n * LOD.cloth)) : Q(n, min));      // cloth sheets can go coarser than the rest")
# 2 smaller pictures
rep("const TEXS = Math.max(0.5, Math.min(1,", "const TEXS = Math.max(0.25, Math.min(1,")
# 3 the hand's cells
rep("const h = (opts.handGrid || 0.00125) / (DET * DET);", "const h = LOD.handCell || (opts.handGrid || 0.00125) / (DET * DET);")
# 4 (the Fox's own form) leave a part out, or fold it into a shared part
rep("    if (FOX_SKIP[key]) return { key, start: 0, count: 0 };", "    if (FOX_SKIP[key] || (LOD.skip && LOD.skip[key])) return { key, start: 0, count: 0 };")
rep("    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;",
    "    const srcKey = key; if (LOD.merge && LOD.merge[key]) key = LOD.merge[key];\n    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;\n    (B.src || (B.src = [])).push([B.n, n, srcKey]);")
# 5 (the Fox's own form) her flounces count their own rows and columns
rep("        const NT = Q(12, 7), tr = [];", "        const NT = CQ(12, 7), NUF = CQ(56, 30), tr = [];")
rep("          for (let j = 0; j < NU; j++) {\n            const a = (j / NU) * TAU, y = lerp(yTop,", "          for (let j = 0; j < NUF; j++) {\n            const a = (j / NUF) * TAU, y = lerp(yTop,")
# 5b the Jester's sheets she inherits and then removes: counted the same way, so a light build does not waste time on them
vn = [n for n in names if '(function buildSkirt() {' in F[n]][0]; s = F[vn]
a = s.index("(function buildSkirt() {"); b = s.index("// ---------- the Jester's veils, skirts and drapes are not the Fox's") if "// ---------- the Jester's veils, skirts and drapes are not the Fox's" in s else len(s)
seg = s[a:b]
for k in ["NU = Q(48, 24)", "NA = NP * Q(8, 4), NS = Q(12, 8)"]:
    if k in seg: seg = seg.replace(k, k.replace('Q(', '@Q@('))
seg = re.sub(r'(?<![A-Za-z@])Q\(', 'CQ(', seg).replace('@Q@(', 'Q(')
F[vn] = s[:a] + seg + s[b:]; touched.add(os.path.basename(vn))
# 6 pleats
rep("K = PL ? (PL.k || Q(3, 2)) : 1;", "K = PL ? (LOD.pleatK || PL.k || Q(3, 2)) : 1;")
# 7 cloth steps
rep("const H_SUB = 1 / 120;", "const H_SUB = LOD.clothH || 1 / 120;")
rep("nsub = cl(nsub, dt > 0 ? 1 : 0, 5);", "nsub = cl(nsub, dt > 0 ? 1 : 0, LOD.clothMaxSub || 5);")
rep("c.step(H_SUB, f, time, DET < 0.75 ? 2 : 3); }", "c.step(H_SUB, f, time, LOD.clothIter || (DET < 0.75 ? 2 : 3)); }")
rep("for (let k = 0; k < 90; k++) for (const c of cloths) c.step(H_SUB, 1, time, 3);", "for (let k = 0; k < Math.round(0.75 / H_SUB); k++) for (const c of cloths) c.step(H_SUB, 1, time, 3);")
# 9 hand each finished part to the level
rep("""    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key;""",
"""    if (LOD.onGeometry) LOD.onGeometry(key, g, B, { MATS, lin, sheen, std, phys });
    const m = new THREE.SkinnedMesh(g, (LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS.cloth);
    m.name = key;""")
rep("root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;",
    "root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += g.index.count / 3; if (LOD.onMesh) LOD.onMesh(key, m);")
# 10 a skipped part asked for by name
rep("if (meshes.bells) meshes.bells.visible = meshes.bellslit.visible = !flailOn;", "if (meshes.bells) meshes.bells.visible = !flailOn; if (meshes.bellslit) meshes.bellslit.visible = !flailOn;")
# 13 a list of her pictures
rep("const t = new THREE.CanvasTexture(c);", "const t = new THREE.CanvasTexture(c); TEXLIST.push(t);")
rep("const cvs = (w, h) => {", "const TEXLIST = [];\n  const cvs = (w, h) => {")
rep("debug: { SK, cloths,", "debug: { textures: TEXLIST, SK, cloths,")
# 14 softer bend links
rep("const bendK = o.bend == null ? 0.12 : o.bend;", "const bendK = (o.bend == null ? 0.12 : o.bend) * (LOD.bend == null ? 1 : LOD.bend);")
# 15 a longer cloth step keeps the same pull and drag each second
rep("const margin = o.margin || 0.01, grav = (o.grav == null ? 0.62 : o.grav) * 9.81, keep = 1 - (o.drag == null ? 0.014 : o.drag), flut = o.flutter == null ? 1 : o.flutter;",
    "const HK = (LOD.clothH || 1 / 120) * 120, margin = o.margin || 0.01, grav = (o.grav == null ? 0.62 : o.grav) * 9.81, keep = Math.pow(1 - (o.drag == null ? 0.014 : o.drag), HK), flut = o.flutter == null ? 1 : o.flutter;\n    const pinS = HK === 1 ? pin : pin.map((v) => (v >= 1 ? 1 : 1 - Math.pow(1 - v, HK)));")
rep("if (p > 0) { nx += (tx - nx) * p; ny += (ty - ny) * p; nz += (tz - nz) * p; }", "if (p > 0) { const ps = pinS[i]; nx += (tx - nx) * ps; ny += (ty - ny) * ps; nz += (tz - nz) * ps; }")
# 16 (the Fox's own) her spell light, for a host that shares one light
rep("get triangles() { return triCount; },", "spellLight, get triangles() { return triCount; },")
# 17 (the Fox's own) her hair. Thinning a ringlet with the simplifier shreds it, so a level asks for lighter ringlets as they are made:
#    which share of each group to keep, how many sides a ringlet has, how many steps along it, and how thick it is (fewer, thicker locks keep the mass).
#    Every lock is still worked out in the same order as at Full, so the ones that are kept are the same locks in the same places.
rep("const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));\n  const CQ",
    "const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));\n  const HAIR = LOD.hair || null, HQ = (n, min) => (HAIR ? n : Q(n, min)); let hairGroup = '', hairK = 0;      // hair groups count their locks as at Full when a level thins them its own way\n  const CQ")
rep("    const NS = Math.max(10, Math.round(Q(12, 7) * Math.max(1.2, turns))), pts = [], rad = [];",
    "    if (HAIR) { const s = HAIR.keep && HAIR.keep[hairGroup] != null ? HAIR.keep[hairGroup] : 1; hairK++; if (Math.floor(hairK * s) === Math.floor((hairK - 1) * s)) { hrnd(); return; } tr *= HAIR.thick || 1; turns *= HAIR.turns || 1; }\n    const NS = HAIR ? Math.max(HAIR.minSeg || 6, Math.round(12 * (HAIR.seg || 1) * Math.max(1.2, turns))) : Math.max(10, Math.round(Q(12, 7) * Math.max(1.2, turns))), pts = [], rad = [];")
rep("    const rings = tubeRings(pts, rad, 6);\n    addPart('curl',", "    const rings = tubeRings(pts, rad, (HAIR && HAIR.sides) || 6);\n    addPart('curl',")
rep("lean = V3(0, 0.60, -0.80).normalize(), N = Q(120, 64);", "lean = V3(0, 0.60, -0.80).normalize(), N = HQ(120, 64); hairGroup = 'bun'; hairK = 0;")
rep("    curW = null; const NH = Q(46, 28);", "    curW = null; const NH = HQ(46, 28); hairGroup = 'hang'; hairK = 0;")
rep("    for (const s of [-1, 1]) for (let k = 0; k < 22; k++) {      // the hair swept off her parting", "    hairGroup = 'bang'; hairK = 0;\n    for (const s of [-1, 1]) for (let k = 0; k < 22; k++) {      // the hair swept off her parting")
rep("    const NF = Q(300, 150);", "    const NF = HQ(300, 150); hairGroup = 'halo'; hairK = 0;")
# (8, 11 and 12 of the Jester's list are not needed: her hidden sheets are already removed, she wears no sheer cloth, and she has no fur tufts)
os.makedirs(OUT + '/src_lod', exist_ok=True)
for n in names: open(OUT + '/src_lod/' + os.path.basename(n), 'w', encoding='utf-8').write(F[n])
open(OUT + '/fox_lod.js', 'w', encoding='utf-8').write(''.join(F[n] for n in names))
print('changed files:', sorted(touched))
```

## Her levels (`lod_fox.js`)

```js
// lod_fox.js: the lighter weights of the Fox. Each level is a set of switches handed to makeFox as opts.lod (tools/patch_fox.py shows
// where her model reads them). Nothing here changes how she is built at Full. The first half is the same as the Jester's lod.js.
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
    // the Fox's shared materials are two-sided: her frills, the inside of her pouch and her shears' blades are thin sheets seen from both sides
    lod.material = (key, B, K) => {
      if (key === 'matte') return K.sheen(K.std({ vertexColors: true, roughness: 0.84, envMapIntensity: 0.3, side: THREE.DoubleSide }), '#8a7a70', 2.6, 0.25);
      if (key === 'metal') return K.std({ vertexColors: true, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.3, side: THREE.DoubleSide });
      if (key === 'gloss') return K.std({ vertexColors: true, roughness: 0.34, envMapIntensity: 0.9 });
      return null;
    };
    lod.onMesh = (key, m) => { if (L.shadowOnly && !L.shadowOnly[key]) m.castShadow = false; };
    return lod;
  }
  // ---- the Fox's own lists ----
  const TINY = { stitch: 1, eyelet: 1, aglet: 1 };                               // boot stitches, eyelets and lace tips
  const BIG = { curl: 1, scalp: 1, ear: 1, face: 1, hand: 1, arm: 1, skin: 1, emerald: 1, torso: 1, patch: 1, leggings: 1, boot: 1, sole: 1, gear: 1, beltm: 1, frill: 1 };
  const LEVELS = [
    { id: 'full', name: 'Full', note: 'The model as it is today', opts: { detail: 1, textureScale: 1 } },
    { id: 'trim', name: 'Trim', note: 'Half the rings in every part, four-sided ringlets, the smallest boot fittings left off',
      opts: { detail: 0.5, textureScale: 0.75 },
      lod: { hair: { keep: { bun: 0.8, halo: 0.7 }, sides: 4, seg: 0.6, thick: 1.08 },
        simplify: { curl: 1, face: 0.5, bellm: 0.45, woodbead: 0.5, lace: 0.6, '*': 0.8 }, err: 0.004, skip: TINY, pleatK: 2, clothIter: 2 } },
    { id: 'light', name: 'Light', note: 'Every part thinned again, fewer and thicker three-sided ringlets, flounces of a third the points',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { hair: { keep: { bun: 0.5, halo: 0.4 }, sides: 3, seg: 0.55, turns: 0.7, thick: 1.3 },
        simplify: { curl: 1, face: 0.2, hand: 0.5, emerald: 0.4, boot: 0.4, bellm: 0.15, woodbead: 0.2, lace: 0.3, brass: 0.3, nail: 0.4, '*': 0.5 }, err: 0.01, errOf: { bellm: 0.05, woodbead: 0.05, lace: 0.05, brass: 0.05 }, prune: true, keepSpecks: { curl: 1, bellm: 1, woodbead: 1, lace: 1, brass: 1 }, skip: TINY,
        cloth: 0.34, clothMin: 6, pleatK: 2, clothH: 1 / 60, clothMaxSub: 2, clothIter: 2, bend: 0.6, shadowOnly: BIG } },
    { id: 'lightest', name: 'Lightest', note: 'Small parts share three plain materials, a third of her ringlets, flounces of a quarter the points',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { hair: { keep: { bun: 0.32, halo: 0.24, hang: 0.8, bang: 0.7 }, sides: 3, seg: 0.45, turns: 0.6, minSeg: 5, thick: 1.6 },
        simplify: { curl: 1, face: 0.1, hand: 0.25, arm: 0.4, emerald: 0.25, torso: 0.5, patch: 0.5, metal: 0.12, gloss: 0.15, matte: 0.3, frame: 0.6, '*': 0.3 }, err: 0.03, errOf: { metal: 0.08, gloss: 0.08, frame: 0.004 }, prune: true, keepSpecks: { curl: 1, metal: 1, gloss: 1, frame: 1 }, skip: Object.assign({ nail: 1 }, TINY),
        merge: { leggings: 'matte', lace: 'matte', sole: 'matte', frill: 'matte', gearIn: 'matte', choker: 'matte', beltm: 'matte', bellm: 'metal', brass: 'metal', steel: 'metal', woodbead: 'gloss' },      // her glasses' frame stays its own part: thinned with the rest of the metal it broke into pieces
        cloth: 0.25, clothMin: 5, pleatK: 1, clothH: 1 / 60, clothMaxSub: 2, clothIter: 2, bend: 0.3,
        shadowOnly: { curl: 1, face: 1, hand: 1, arm: 1, emerald: 1, torso: 1, patch: 1, boot: 1, gear: 1, matte: 1 } } }
  ];
  window.WITCH_LOD = { LEVELS, hooks, simplify, make(level, extra) { const L = typeof level === 'string' ? LEVELS.find((x) => x.id === level) : level; const o = Object.assign({}, L.opts, extra || {}); if (L.lod) o.lod = hooks(L.lod); return makeFox(o); } };
})();
```
