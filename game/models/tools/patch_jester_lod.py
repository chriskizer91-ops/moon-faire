# Makes jester_lod.js from the Jester's built jester.js: the same model, with a set of optional switches (opts.lod) that
# make her cheaper. With no opts.lod, every line behaves as it did.
# Copied from the project doc claude/jester-3d-light-levels-and-fight-test.md ("The replacements made to jester.js"),
# with only the two file paths changed. Run: python3 patch_jester_lod.py <jester.js> <jester_lod.js>
import re,sys
s=open(sys.argv[1],encoding='utf-8').read()
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
open(sys.argv[2],'w',encoding='utf-8').write(s)
print('ok', len(s))
