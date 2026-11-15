# patch_fox.py: puts the light-level switches (opts.lod) into the Fox's source, file by file.
# Reads models/fox-3d/src (branch claude/fox-3d-model), writes the changed files to src_lod, and joins them as fox_lod.js. With no opts.lod she builds exactly as before.
# Copied from the project note claude/fox-3d-light-levels-and-fight-test.md. Every replacement must be found exactly once.
import re, os, glob, sys
SRC = sys.argv[1]
OUT = sys.argv[2]
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
# 17 (the Fox's own) her hair: lighter ringlets asked for as they are made
rep("const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));\n  const CQ",
    "const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));\n  const HAIR = LOD.hair || null, HQ = (n, min) => (HAIR ? n : Q(n, min)); let hairGroup = '', hairK = 0;      // hair groups count their locks as at Full when a level thins them its own way\n  const CQ")
rep("    const NS = Math.max(10, Math.round(Q(12, 7) * Math.max(1.2, turns))), pts = [], rad = [];",
    "    if (HAIR) { const s = HAIR.keep && HAIR.keep[hairGroup] != null ? HAIR.keep[hairGroup] : 1; hairK++; if (Math.floor(hairK * s) === Math.floor((hairK - 1) * s)) { hrnd(); return; } tr *= HAIR.thick || 1; turns *= HAIR.turns || 1; }\n    const NS = HAIR ? Math.max(HAIR.minSeg || 6, Math.round(12 * (HAIR.seg || 1) * Math.max(1.2, turns))) : Math.max(10, Math.round(Q(12, 7) * Math.max(1.2, turns))), pts = [], rad = [];")
rep("    const rings = tubeRings(pts, rad, 6);\n    addPart('curl',", "    const rings = tubeRings(pts, rad, (HAIR && HAIR.sides) || 6);\n    addPart('curl',")
rep("lean = V3(0, 0.60, -0.80).normalize(), N = Q(120, 64);", "lean = V3(0, 0.60, -0.80).normalize(), N = HQ(120, 64); hairGroup = 'bun'; hairK = 0;")
rep("    curW = null; const NH = Q(46, 28);", "    curW = null; const NH = HQ(46, 28); hairGroup = 'hang'; hairK = 0;")
rep("    for (const s of [-1, 1]) for (let k = 0; k < 22; k++) {      // the hair swept off her parting", "    hairGroup = 'bang'; hairK = 0;\n    for (const s of [-1, 1]) for (let k = 0; k < 22; k++) {      // the hair swept off her parting")
rep("    const NF = Q(300, 150);", "    const NF = HQ(300, 150); hairGroup = 'halo'; hairK = 0;")
os.makedirs(OUT, exist_ok=True)
open(OUT + '/fox_lod.js', 'w', encoding='utf-8').write(''.join(F[n] for n in names))
print('fox: changed files', sorted(touched))
