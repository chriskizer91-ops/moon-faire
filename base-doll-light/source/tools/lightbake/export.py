# export.py CODE : every visible mesh of the doll wearing CODE (with her bun), at rest, to lightbake/out/CODE_full.npz
# (positions, normals, drawn triangles, bone weights, and the face's own attributes), with each mesh's area and material flags.
import sys, os, json, base64, numpy as np
from playwright.sync_api import sync_playwright
code = sys.argv[1]; OUT = '/home/claude/work/lightbake/out/'; os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
JS = r"""() => {
  const b64 = (ta) => { const u = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  T.j.pose({ arm: 15 }); T.j.root.updateMatrixWorld(true);
  const out = [];
  T.j.root.traverse((o) => {
    if (!o.isMesh || !o.name) return; let vis = true, p = o; while (p) { if (!p.visible) { vis = false; break; } p = p.parent; } if (!vis) return;
    const g = o.geometry, ix = g.index; const n = ix ? Math.min(ix.count, g.drawRange.count) : g.attributes.position.count; if (n < 3) return;
    const idx = ix ? new Uint32Array(ix.array.subarray(0, n)) : new Uint32Array(Array.from({ length: n }, (_, i) => i));
    const m = o.material, A = g.attributes, rec = { name: o.name, n: g.attributes.position.count, tris: n / 3, skinned: !!o.isSkinnedMesh,
      transparent: !!m.transparent, side: m.side, painted: !!(m.userData && m.userData.painted), alphaTest: m.alphaTest || 0, type: m.type,
      pos: b64(A.position.array), idx: b64(idx) };
    if (A.normal) rec.nor = b64(A.normal.array);
    if (A.skinIndex) { rec.si = b64(new Uint16Array(A.skinIndex.array)); rec.sw = b64(new Float32Array(A.skinWeight.array)); }
    if (o.name === 'face') for (const k of ['uv', 'faceMix', 'uvSide', 'uvBody']) if (A[k]) rec[k] = b64(new Float32Array(A[k].array));
    out.push(rec);
  });
  return JSON.stringify(out);
}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(); pg.set_default_timeout(1200000)
    pg.goto('file:///home/claude/io/test_doll.html?wear=' + code); pg.wait_for_function('window.T && (T.ok || T.err)'); pg.wait_for_timeout(1500)
    recs = json.loads(pg.evaluate(JS)); b.close()
arr = {}; meta = []
for r in recs:
    k = r['name']; P = np.frombuffer(base64.b64decode(r['pos']), np.float32).reshape(-1, 3); I = np.frombuffer(base64.b64decode(r['idx']), np.uint32).reshape(-1, 3)
    arr[k + '/pos'] = P; arr[k + '/idx'] = I
    if 'nor' in r: arr[k + '/nor'] = np.frombuffer(base64.b64decode(r['nor']), np.float32).reshape(-1, 3)
    if 'si' in r: arr[k + '/si'] = np.frombuffer(base64.b64decode(r['si']), np.uint16).reshape(-1, 4); arr[k + '/sw'] = np.frombuffer(base64.b64decode(r['sw']), np.float32).reshape(-1, 4)
    for a, w in (('uv', 2), ('faceMix', 4), ('uvSide', 2), ('uvBody', 4)):
        if a in r: arr[k + '/' + a] = np.frombuffer(base64.b64decode(r[a]), np.float32).reshape(-1, w)
    a, b_, c = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]; area = float(np.linalg.norm(np.cross(b_ - a, c - a), axis=1).sum() / 2)
    meta.append({k2: r[k2] for k2 in ('name', 'n', 'tris', 'skinned', 'transparent', 'side', 'painted', 'alphaTest', 'type')} | {'area': area})
np.savez_compressed(OUT + code + '_full.npz', **arr); json.dump(meta, open(OUT + code + '_full.json', 'w'), indent=1)
for m in meta: print('%-14s %7d tris  %.4f m2  %s%s' % (m['name'], m['tris'], m['area'], m['type'], ' transparent' if m['transparent'] else ''))
print('total', sum(m['tris'] for m in meta))
