# patch_ranger.py: puts the light-level switches (opts.lod) into the Ranger's source (branch claude/ranger-3d-model, models/ranger-3d/src)
# and joins it as ranger_lod.js. With no opts.lod she builds exactly as before.
# Copied from the project note claude/ranger-3d-light-levels-and-fight-test.md. Every replacement must be found exactly once.
import os, sys
SRC = sys.argv[1]
OUT = sys.argv[2]
ORDER = ['00_util', 'R05_tables', '10_geom', '20_tex', 'R21_tex', 'R30_body', 'R31_boots', '32_hands', 'R40_head', 'R41_hair', 'R42_glasses', 'R45_gear', 'R46_bow', 'R47_sword', 'R48_knives', 'R49_veins', 'R99_static']      # the order in build_r.sh
names = [SRC + '/' + n + '.js' for n in ORDER]
F = {n: open(n, encoding='utf-8').read() for n in names}
touched = set()
def rep(a, b, only=None):
    hits = [n for n in names if a in F[n] and (only is None or os.path.basename(n) == only)]
    assert len(hits) == 1 and F[hits[0]].count(a) == 1, (a[:70], [(os.path.basename(n), F[n].count(a)) for n in hits])
    F[hits[0]] = F[hits[0]].replace(a, b); touched.add(os.path.basename(hits[0]))
rep("const DET = Math.max(0.5, Math.min(1,", "const LOD = opts.lod || {};\n  const DET = Math.max(LOD.minDetail || 0.5, Math.min(1,")
rep("const TEXS = Math.max(0.5, Math.min(1,", "const TEXS = Math.max(0.25, Math.min(1,")
rep("const h = (opts.handGrid || 0.00125) / (DET * DET);", "const h = LOD.handCell || (opts.handGrid || 0.00125) / (DET * DET);")
rep("    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;",
    "    if (LOD.skip && LOD.skip[key]) return { key, start: 0, count: 0 };\n    const srcKey = key; if (LOD.merge && LOD.merge[key]) key = LOD.merge[key];\n    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;\n    (B.src || (B.src = [])).push([B.n, n, srcKey]);")
rep("""    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key;""",
"""    if (LOD.onGeometry) LOD.onGeometry(key, g, B, { MATS, lin, sheen, std, phys });
    const m = new THREE.SkinnedMesh(g, (LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS.cloth);
    m.name = key;""")
rep("root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;",
    "root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += g.index.count / 3; if (LOD.onMesh) LOD.onMesh(key, m);")
rep("const t = new THREE.CanvasTexture(c);", "const t = new THREE.CanvasTexture(c); TEXLIST.push(t);", only='00_util.js')
rep("const cvs = (w, h) => {", "const TEXLIST = [];\n  const cvs = (w, h) => {")
rep("moves: MOVES, walk,", "moves: MOVES, shots: SHOTS, slow: SLOW, get move() { return mv; }, walk,")
rep("debug: { SK, meshes,", "debug: { textures: TEXLIST, SK, meshes,")
os.makedirs(OUT, exist_ok=True)
open(OUT + '/ranger_lod.js', 'w', encoding='utf-8').write(''.join(F[n] for n in names))
print('ranger: changed files', sorted(touched))
