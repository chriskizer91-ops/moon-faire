# patch_io.py: puts the light-level switches (opts.lod) into Io's source (branch claude/io-3d-model, models/io-3d/src) and joins it as io_lod.js.
# With no opts.lod she builds exactly as before.
# Copied from the project note claude/io-3d-light-levels-and-fight-test.md. Every replacement must be found exactly once.
import os, sys
SRC = sys.argv[1]
OUT = sys.argv[2]
ORDER = ['00_util', 'I05_tables', '10_geom', '20_tex', 'I21_tex', 'I30_body', 'I31_boots', '32_hands', 'I40_head', 'I42_glasses', 'I43_hat', 'I41_hair', 'I45_robe', 'I46_gear', 'I47_props', 'I98_fx', 'I98b_wood', 'I98c_garden', 'I98d_thorn', 'I98e_react', 'I99_static']      # the order in build_io.sh
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
# 17 her hair: ribbons changed where they are made
rep("""    const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
    const L = len[n - 1], NC = 6, rings = [], vs = [], w0 = o.w, sub = Q(2, 1),""",
"""    const HL = LOD.hair || {}; if (HL.keep != null && ((tressN * 0.618034) % 1) >= HL.keep) { tressN++; return; }
    const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
    const L = len[n - 1], NC = HL.sides || 6, rings = [], vs = [], w0 = o.w * (HL.wide || 1), sub = HL.sub || Q(2, 1),""")
rep("M = (n - 1) * sub, q1 = o.ph * 1.7,", "M = Math.ceil((n - 1) * sub), q1 = o.ph * 1.7,")
rep("      const f = k / sub, i0 = Math.min(n - 2, Math.floor(f)), u = f - i0, P = mid[i0].clone().lerp(mid[i0 + 1], u), s = lerp(len[i0], len[i0 + 1], u), t = s / L;", "      const f = Math.min(n - 1, k / sub), i0 = Math.min(n - 2, Math.floor(f)), u = f - i0, P = mid[i0].clone().lerp(mid[i0 + 1], u), s = lerp(len[i0], len[i0 + 1], u), t = s / L;")
rep("const tau = 0.75 * env * Math.cos(ph),", "const tau = 0.75 * (HL.twist == null ? 1 : HL.twist) * env * Math.cos(ph),")
rep("const part = loft(rings, { v: vs }); tressN++;", "const part = loft(rings, NC === 2 ? { v: vs, open: true } : { v: vs }); tressN++;")
rep("debug: { SK, meshes,", "debug: { textures: TEXLIST, SK, meshes,")
os.makedirs(OUT, exist_ok=True)
open(OUT + '/io_lod.js', 'w', encoding='utf-8').write(''.join(F[n] for n in names))
print('io: changed files', sorted(touched))
