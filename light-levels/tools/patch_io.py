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
