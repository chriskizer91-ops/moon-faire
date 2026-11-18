# Jester 3D: four weights of the same witch, and the fight test

November 13, 2026. This follows `claude/jester-3d-pass21-game-moves.md`. It is a side study, not a new pass of the model: nothing about the Full model changed.

- **The page:** "Jester Witch 3D: how light can she go", https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh
- **Built from:** the single file `Jester_Witch_3D_game_moves.html` that Chris shared (pass 21). The page's own source holds every script.
- **Not in the repo yet.** The changes were made as a list of replacements on the built `jester.js` (below), so they still have to be carried into `models/jester-3d/src/` on branch `claude/jester-3d-model`. Chris has not been asked whether he wants that.

## What Chris asked for

The game will put at least four witches, a place and a crowd of foes in one scene. He asked for two or three cheaper levels of the Jester, to see them side by side and find how cheap she can go and still look good in a fight.

## The four levels (one witch, standing, with her shadow)

| | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Triangles in her | 584k | 91k | 43k | 19k |
| Triangles drawn each picture | 1.28 million | 196k | 80k | 28k |
| Separate draws each picture | 80 | 72 | 60 | 33 |
| Points of cloth worked out | 15,268 | 4,510 | 1,880 | 1,076 |
| Memory for her painted surfaces | 87 MB | 44 MB | 21 MB | 21 MB |
| Time for her pose and cloth, each picture, on the slow test machine | 27.5 ms | 4.8 ms | 1.1 ms | 0.55 ms |

The fight test (four of her, the night square, 12 stand-in foes, shadows on), each picture:

| Four at | Triangles drawn | Draws |
|---|---|---|
| Full | 5.16 million | 414 |
| Trim | 824k | 377 |
| Light | 360k | 329 |
| Lightest | 156k | 226 |

## What was found

- **The cloth is the biggest cost, not the triangles.** At Full she works out 15,268 points of cloth several times each picture. That is processor time, and four witches pay it four times. Lightest costs about a fiftieth of Full here.
- **Her painted face holds at every level.** The face is a painting on the head, so thinning the head to a tenth of its triangles barely shows, even close.
- **At fight distance the four levels are hard to tell apart.** With the Flipbook look on they are nearly the same picture.
- **What shows first, close up:** the veil. At Light and Lightest it hangs in flatter panels with a more regular hem, because it has fewer points and no fine pleats. Then the pompoms (spikier) and the throat ruff (smoother rolls).
- **A real two-pass draw of the sheer veil is worth keeping.** Drawing it once made it paler and yellower, so Lightest keeps both passes.
- **One spell light for everyone.** Each copy of her carries her own spell light. The page takes those out and keeps one shared light that follows the brightest spell; four lights would be paid for on every surface in the scene.

## How each level is made

All from the same `makeJester(opts)`, through a new `opts.lod`. With no `opts.lod` every line behaves as before.

- **Trim:** `detail: 0.5` (half the rings and cloth rows), then the face and cuffs thinned by half again and everything else by a fifth; boot stitches, eyelets, lace tips and bell slits left out; half the pompom tufts.
- **Light:** the same start, every part thinned further; cloth sheets at about a third of the columns and rows, stepped at 1/60 s, not 1/120 s; small fittings throw no shadow.
- **Lightest:** face, hands, bodice, leggings and cuffs keep their own paintings; every other solid part is merged into one of three plain materials (matte, glossy, metal) that carry the old colours as paint on each point; cloth at a quarter, no pleats; only the big parts and the four biggest sheets throw a shadow.
- **Thinning** uses meshoptimizer's simplifier (version 1.3, built into the page). It only removes points and never moves one, so the paintings, the skin weights and the face's three-picture mix stay right with no extra work. This should carry to the other witches as it is.
- **Coarser cloth needed two fixes** to move like the Full cloth: a longer step keeps the same pull toward its pins and the same drag each second, and the bend links are softened (0.6 at Light, 0.3 at Lightest). Before that, the veil ballooned in a twirl.

## The page

- **Show:** All four (four panels, the same camera, each showing one level standing on the same spot), or one level alone.
- **How far away:** Close, Fight distance, Face.
- **Body, Spells in the game, Moves:** all four do the same thing together.
- **The fight test:** Four at Full, Trim, Light or Lightest, with 0, 12 or 30 foes. They take turns casting; "All cast at once" is the worst case. The foes are plain hooded stand-ins of about 2,000 triangles and three draws each.
- **Switches:** Flipbook look, Night square, Glow, Shadows, Slow motion, Turn the view.
- A table of what each level costs, measured from what the page really built, with the pose-and-cloth time measured live on the device.
- On a phone, Full is the three-quarter model, as on her other pages, and copies the picture no longer needs are let go to save memory.

## Suggested use in the game (not decided)

- **Light or Lightest for everyone during a fight.** Full only where the camera comes close: portraits, the training page, a close shot of a big spell.
- Because the game is turn-based, a further saving is open: the witch who is acting could be one level up from the three who are waiting.
- Each witch needs her own set of levels built the same way. The merge list in Lightest names the Jester's parts, so each witch needs her own list.

## For the next session

- `stage.js` gained `renderPanels(panels)`: several panels in one frame, each with its own list of what is visible. Glow and the Flipbook look work through it.
- `makeJester` gained `debug.textures`, so a host can free a copy of her.
- The page script is `lodpage.js` inside the page; `window.LODPAGE` steps time by hand for checking (`?shot=1`).

## Checked, and not

- Every move over every stance at Trim, Light and Lightest: 186 pairs each, plus walk and run. No broken numbers.
- Stills at laptop and phone size: all four side by side (standing, running, twirl, jump, three spells), each alone, the Flipbook look, glow in the square, and the fight test at all four levels.
- **Not checked:** real speed. The test browser draws with no graphics chip, so pictures a second on Chris's laptop and phone are his to read off the page. Whether the levels look right in motion is his to judge too.

## The replacements made to `jester.js` (`tools/patch.py`)

```python
# Makes jester_lod.js from jester.js: the same model, with a set of optional switches (opts.lod) that make her cheaper.
# With no opts.lod, every line behaves as it did.
import re,sys
s=open('/home/claude/work/jester.js',encoding='utf-8').read()
def rep(a,b,count=1):
    global s
    n=s.count(a)
    assert n==count, (a[:70], n)
    s=s.replace(a,b)
# 1 detail floor, cloth scale
rep("const DET = Math.max(0.5, Math.min(1,", "const LOD = opts.lod || {};\n  const DET = Math.max(LOD.minDetail || 0.5, Math.min(1,")
rep("const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));",
    "const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));\n  const CQ = (n, min) => (LOD.cloth ? Math.max(LOD.clothMin || 5, Math.round(n * LOD.cloth)) : Q(n, min));      // cloth sheets can go coarser than the rest")
# 2 texture floor
rep("const TEXS = Math.max(0.5, Math.min(1,", "const TEXS = Math.max(0.25, Math.min(1,")
# 3 hand cell
rep("const h = (opts.handGrid || 0.00125) / (DET * DET);", "const h = LOD.handCell || (opts.handGrid || 0.00125) / (DET * DET);")
# 4 addPart: skip and merge
rep("""    o = o || {};
    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;""",
"""    o = o || {};
    if (LOD.skip && LOD.skip[key]) return { key, start: 0, count: 0 };
    const srcKey = key; if (LOD.merge && LOD.merge[key]) key = LOD.merge[key];
    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;
    (B.src || (B.src = [])).push([B.n, n, srcKey]);""")
# 5 cloth dims
a=s.index("(function buildSkirt() {"); b=s.index("// ---------- bind: one skinned mesh per material ----------")
seg=s[a:b]
keep_solid=["NU = Q(48, 24)","NA = NP * Q(8, 4), NS = Q(12, 8)"]
for i,k in enumerate(keep_solid):
    assert seg.count(k)==1,(k,seg.count(k)); seg=seg.replace(k,k.replace('Q(','@Q@('))
nq=seg.count(' Q(')+seg.count('[Q(')+seg.count(',Q(')
seg2=re.sub(r'(?<![A-Za-z@])Q\(', 'CQ(', seg)
print('cloth Q calls ->CQ:', seg2.count('CQ('))
seg2=seg2.replace('@Q@(','Q(')
s=s[:a]+seg2+s[b:]
# 6 pleats
rep("K = PL ? (PL.k || Q(3, 2)) : 1;", "K = PL ? (LOD.pleatK || PL.k || Q(3, 2)) : 1;")
# 7 cloth stepping
rep("const H_SUB = 1 / 120;", "const H_SUB = LOD.clothH || 1 / 120;")
rep("nsub = cl(nsub, dt > 0 ? 1 : 0, 5);", "nsub = cl(nsub, dt > 0 ? 1 : 0, LOD.clothMaxSub || 5);")
rep("c.step(H_SUB, f, time, DET < 0.75 ? 2 : 3); }", "c.step(H_SUB, f, time, LOD.clothIter || (DET < 0.75 ? 2 : 3)); }")
rep("for (let k = 0; k < 90; k++) for (const c of cloths) c.step(H_SUB, 1, time, 3);", "for (let k = 0; k < Math.round(0.75 / H_SUB); k++) for (const c of cloths) c.step(H_SUB, 1, time, 3);")
# 8 hidden apron
rep("apronCloth.meshes.forEach((m) => { m.visible = false; });", "apronCloth.meshes.forEach((m) => { m.visible = false; }); if (LOD.dropHidden) cloths.splice(cloths.indexOf(apronCloth), 1);")
# 9 bind hooks
rep("""    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key;""",
"""    if (LOD.onGeometry) LOD.onGeometry(key, g, B, { MATS, lin, sheen, std, phys });
    const m = new THREE.SkinnedMesh(g, (LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS.cloth);
    m.name = key;""")
rep("root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;",
    "root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += g.index.count / 3; if (LOD.onMesh) LOD.onMesh(key, m);")
rep("for (const c of cloths) triCount += c.tris;", "for (const c of cloths) { triCount += c.tris; if (LOD.onCloth) LOD.onCloth(c); }")
# 10 guard
rep("if (meshes.bells) meshes.bells.visible = meshes.bellslit.visible = !flailOn;", "if (meshes.bells) meshes.bells.visible = !flailOn; if (meshes.bellslit) meshes.bellslit.visible = !flailOn;")
# 11 sheer in one pass
rep("for (const side of [THREE.BackSide, THREE.FrontSide]) {", "for (const side of (LOD.sheerOnce ? [THREE.DoubleSide] : [THREE.BackSide, THREE.FrontSide])) {")
rep("mesh.castShadow = side === THREE.FrontSide; mesh.receiveShadow = false;", "mesh.castShadow = side !== THREE.BackSide; mesh.receiveShadow = false;")
# 12 fur tufts
rep("""    const pos = [], uv = [], idx = [];
    for (let i = 0; i < n; i++) {
      const { p, n: nm } = basePt(i)""", """    const pos = [], uv = [], idx = [];
    if (LOD.tufts) { n = Math.round(n * LOD.tufts); wid /= Math.sqrt(LOD.tufts); len *= 1.1; }      // fewer, wider tufts keep the same fuzzy edge
    for (let i = 0; i < n; i++) {
      const { p, n: nm } = basePt(i)""")
# 13 a list of her textures, so a host can free them when it lets a copy of her go
rep("const t = new THREE.CanvasTexture(c);", "const t = new THREE.CanvasTexture(c); TEXLIST.push(t);")
rep("const cvs = (w, h) => {", "const TEXLIST = [];\n  const cvs = (w, h) => {")
rep("debug: { SK, cloths,", "debug: { textures: TEXLIST, SK, cloths,")
# 14 coarse cloth is stiffer for the same numbers: let a level soften its bend links
rep("const bendK = o.bend == null ? 0.12 : o.bend;", "const bendK = (o.bend == null ? 0.12 : o.bend) * (LOD.bend == null ? 1 : LOD.bend);")
# 15 a longer cloth step keeps the same pull and the same drag each second
rep("const margin = o.margin || 0.01, grav = (o.grav == null ? 0.62 : o.grav) * 9.81, keep = 1 - (o.drag == null ? 0.014 : o.drag), flut = o.flutter == null ? 1 : o.flutter;",
    "const HK = (LOD.clothH || 1 / 120) * 120, margin = o.margin || 0.01, grav = (o.grav == null ? 0.62 : o.grav) * 9.81, keep = Math.pow(1 - (o.drag == null ? 0.014 : o.drag), HK), flut = o.flutter == null ? 1 : o.flutter;\n    const pinS = HK === 1 ? pin : pin.map((v) => (v >= 1 ? 1 : 1 - Math.pow(1 - v, HK)));")
rep("if (p > 0) { nx += (tx - nx) * p; ny += (ty - ny) * p; nz += (tz - nz) * p; }", "if (p > 0) { const ps = pinS[i]; nx += (tx - nx) * ps; ny += (ty - ny) * ps; nz += (tz - nz) * ps; }")
# name
rep("function makeJester(opts) {", "function makeJester(opts) {")
open('/home/claude/work/jester_lod.js','w',encoding='utf-8').write(s)
print('ok', len(s))
```

## The levels (`lod.js`)

```js
// lod.js: the cheaper versions of a witch. Each level is a set of switches handed to makeJester as opts.lod (see tools/patch.py for
// where the model reads them). Nothing here changes how she is built at full detail.
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
  // level: { simplify: { part: share kept, '*': share kept }, err, prune, skip, merge, shadow: { part: false }, ... } -> opts.lod
  function hooks(L) {
    const lod = Object.assign({}, L);
    lod.onGeometry = (key, g, B, K) => {
      if (L.merge && (key === 'matte' || key === 'metal' || key === 'gloss')) {                 // merged parts wear their old colours as paint on each point
        const col = new Float32Array(B.n * 3);
        for (const [start, count, src] of B.src) { const c = meanColour(K.MATS[src] || K.MATS.cloth); for (let i = start; i < start + count; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      const sp = L.simplify || {}, r = sp[key] != null ? sp[key] : sp['*'];
      if (r != null && r < 1) simplify(g, r, L.err, L.prune);
    };
    lod.material = (key, B, K) => {
      if (key === 'matte') return K.sheen(K.std({ vertexColors: true, roughness: 0.82, envMapIntensity: 0.35 }), '#7a6470', 2.6, 0.32);
      if (key === 'metal') return K.std({ vertexColors: true, roughness: 0.27, metalness: 1, envMapIntensity: 1.6 });
      if (key === 'gloss') return K.std({ vertexColors: true, roughness: 0.3, envMapIntensity: 1.1 });
      return null;
    };
    // shadows: the cheapest level throws hers from the few big parts only (the body, and the largest sheets of cloth)
    lod.onMesh = (key, m) => { if (L.shadowOnly && !L.shadowOnly[key]) m.castShadow = false; };
    const sheets = [];
    lod.onCloth = (c) => { if (!L.clothShadow) return; sheets.push(c); sheets.sort((a, b) => b.n - a.n); sheets.forEach((s, i) => s.meshes.forEach((m) => { if (i >= L.clothShadow) m.castShadow = false; })); };
    return lod;
  }
  const TINY = { stitch: 1, eyelet: 1, aglet: 1, bellslit: 1 };
  const LEVELS = [
    { id: 'full', name: 'Full', note: 'The model as it is today', opts: { detail: 1, textureScale: 1 } },
    { id: 'trim', name: 'Trim', note: 'Half the rings in every part, coarser cloth, the smallest fittings left off',
      opts: { detail: 0.5, textureScale: 0.75 }, shadowMap: 1024,
      lod: { simplify: { face: 0.5, ruffle: 0.5, fur: 1, '*': 0.8 }, err: 0.004, skip: TINY, tufts: 0.5, pleatK: 2, clothIter: 2, dropHidden: true } },
    { id: 'light', name: 'Light', note: 'Every part thinned again, cloth of a third the points', opts: { detail: 0.5, textureScale: 0.5 }, shadowMap: 512,
      lod: { simplify: { face: 0.2, ruffle: 0.2, hand: 0.5, boot: 0.4, '*': 0.5 }, err: 0.01, prune: true, skip: TINY, tufts: 0.2, cloth: 0.34, clothMin: 6, pleatK: 2, clothH: 1 / 60, clothMaxSub: 2, clothIter: 2, bend: 0.6, dropHidden: true,
        shadowOnly: { torso: 1, wine: 1, cloth: 1, leggings: 1, boot: 1, sole: 1, hand: 1, face: 1, hair: 1, cap: 1, velvet: 1, fur: 1, ruffle: 1, leather: 1 }, clothShadow: 8 } },
    { id: 'lightest', name: 'Lightest', note: 'Small parts share three plain materials, cloth of a quarter the points', opts: { detail: 0.5, textureScale: 0.5 },
      lod: { simplify: { face: 0.1, ruffle: 0.12, hand: 0.25, torso: 0.5, leggings: 0.5, '*': 0.3 }, err: 0.03, prune: true, skip: Object.assign({ nail: 1, sock: 1 }, TINY), tufts: 0.08,
        merge: { wine: 'matte', cloth: 'matte', sole: 'matte', lace: 'matte', hair: 'matte', cap: 'matte', velvet: 'matte', fur: 'matte', boot: 'gloss', leather: 'gloss', gem: 'gloss', pearl: 'metal', gold: 'metal' },
        cloth: 0.25, clothMin: 5, pleatK: 1, clothH: 1 / 60, clothMaxSub: 2, clothIter: 2, bend: 0.3, dropHidden: true,
        shadowOnly: { matte: 1, torso: 1, gloss: 1 }, clothShadow: 4 } }
  ];
  window.WITCH_LOD = { LEVELS, hooks, simplify, make(level, extra) { const L = typeof level === 'string' ? LEVELS.find((x) => x.id === level) : level; const o = Object.assign({}, L.opts, extra || {}); if (L.lod) o.lod = hooks(L.lod); return makeJester(o); } };
})();
```
