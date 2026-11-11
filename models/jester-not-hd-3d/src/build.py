"""Build out/jester.glb: skeleton, parts, skin weights, painted textures and movement clips.

  python3 src/build.py all          rebuild everything
  python3 src/build.py body,boots   rebuild some parts, reuse the rest from work/parts.pkl
  python3 src/build.py paint        keep every mesh, repaint the textures
  python3 src/build.py none         keep meshes and textures, rewrite the clips and the file
"""
import sys
import io
import time
import pickle
import os
import inspect
import numpy as np
from PIL import Image
import sdf
import bake
import jester
import paint
import cloth
from glb import Glb

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, '..', 'out')
WORK = os.path.join(HERE, '..', 'work')
CACHE = os.path.join(WORK, 'parts.pkl')


def geometry(part, names, keep, passes, tres):
    V, F = part.mesh()
    n0 = len(F)
    if keep < 1:
        V, F = sdf.simplify(V, F, keep)
    W, _, _ = part.weights(V, names)
    W = sdf.smooth_weights(V, F, W, iters=passes)
    vmap, idx, uv = bake.unwrap(V, F, tres)
    F2 = idx.reshape(-1, 3)
    V2 = V[vmap]
    N2 = part.normals(V2)
    J4, W4 = sdf.top4(W[vmap])
    img, mask = bake.raster(uv, F2, np.concatenate([V2, N2], axis=1), tres)
    return dict(V=V2, F=F2, N=N2, J=J4, W=W4, uv=uv.astype(np.float32), pos=img, mask=mask, n0=n0)


def texture(part, nm, g):
    mask = g['mask']
    P = g['pos'][mask][:, :3].astype(np.float64)
    N = g['pos'][mask][:, 3:6].astype(np.float64)
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
    owner, shapes = sdf.part_owner(part, P)
    tag = np.array([s.tag or '' for s in shapes])[owner]
    fn = paint.PAINT[nm]
    kw = dict(owner=owner, shapes=shapes) if 'owner' in inspect.signature(fn).parameters else {}
    rgb = np.clip(fn(P, N, tag, **kw), 0, 255)
    tex = np.zeros(mask.shape + (3,), np.float64)
    tex[mask] = rgb
    tex = bake.spread(tex, mask).astype(np.uint8)
    buf = io.BytesIO(); Image.fromarray(tex).save(buf, 'PNG', optimize=True)
    Image.fromarray(tex).save(os.path.join(WORK, f'tex_{nm}.png'))
    return buf.getvalue()


def build_parts(only):
    names, parents, rest = jester.skeleton()
    os.makedirs(WORK, exist_ok=True)
    cache = pickle.load(open(CACHE, 'rb')) if os.path.exists(CACHE) else {}
    built = {}
    for builder, rough, keep, passes, tres in jester.PARTS:
        nm = builder.__name__.replace('_part', '')
        t0 = time.time()
        part = builder()
        redo_geo = only == 'all' or (isinstance(only, list) and nm in only) or nm not in cache
        g = geometry(part, names, keep, passes, tres) if redo_geo else cache[nm]
        if redo_geo or only == 'paint' or 'png' not in g:
            g['png'] = texture(part, nm, g)
        g['rough'] = rough
        built[nm] = g
        if redo_geo or only == 'paint':
            print(f'{nm:6s} {g["n0"]:7d} -> {len(g["F"]):6d} triangles, {len(g["V"]):6d} points, texture {tres}, {time.time() - t0:.1f}s', flush=True)
    pickle.dump(built, open(CACHE, 'wb'))
    for nm, fn in (('skirt', cloth.skirt), ('veil', cloth.veil)):
        t0 = time.time()
        built[nm] = fn(names)
        Image.open(io.BytesIO(built[nm]['png'])).save(os.path.join(WORK, f'tex_{nm}.png'))
        print(f'{nm:6s} {len(built[nm]["F"]):6d} triangles (sheets), {time.time() - t0:.1f}s', flush=True)
    return names, parents, rest, built


def write(names, parents, rest, built, clips, path):
    g = Glb()
    root = g.node(name='Jester', children=[])
    joint_nodes = []
    for i, n in enumerate(names):
        p = parents[i]
        t = rest[i] - (rest[p] if p is not None else 0)
        joint_nodes.append(g.node(name=n, translation=[float(x) for x in t]))
    for i, p in enumerate(parents):
        if p is None:
            g.j['nodes'][root]['children'].append(joint_nodes[i])
        else:
            g.j['nodes'][joint_nodes[p]].setdefault('children', []).append(joint_nodes[i])
    skin = g.skin(joint_nodes, rest, joint_nodes[0])
    tris = 0
    for nm, b in built.items():
        extra = {'pbrMetallicRoughness': {'baseColorTexture': {'index': g.texture(b['png'])}, 'roughnessFactor': b['rough'], 'metallicFactor': 0.0}}
        if b.get('blend'):
            extra.update(alphaMode='BLEND', doubleSided=True)
        elif b.get('cloth'):
            extra.update(alphaMode='MASK', alphaCutoff=0.5, doubleSided=True)
        mat = g.material(nm, b['rough'], 0.0, extra)
        m = g.mesh(nm, b['V'], b['N'], None, b['J'], b['W'], b['F'], mat, uv=b['uv'])
        g.j['scenes'][0]['nodes'].append(g.node(name='mesh_' + nm, mesh=m, skin=skin))
        tris += len(b['F'])
    for clip in clips or []:
        tracks = []
        for bone, q in clip['rot'].items():
            tracks.append((joint_nodes[names.index(bone)], 'rotation', q))
        if clip.get('hips') is not None:
            tracks.append((joint_nodes[0], 'translation', clip['hips']))
        g.animation(clip['name'], clip['times'], tracks)
    g.j['nodes'][root]['extras'] = {'clips': {c['name']: {'speed': float(c['speed']), 'loop': bool(c['loop']), 'label': c['label']} for c in clips or []},
                                    'heightMetres': 1.66, 'faces': '+Z', 'bindPose': 'standing pose of drawings A1 and B1'}
    size = g.save(path)
    print(f'wrote {os.path.relpath(path)}: {size / 1e6:.2f} MB, {tris} triangles, {len(names)} bones, {len(clips or [])} clips')


if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else 'all'
    only = arg if arg in ('all', 'paint', 'none') else arg.split(',')
    names, parents, rest, built = build_parts(only)
    import anim
    clips = anim.all_clips(names, parents, rest)
    os.makedirs(OUT, exist_ok=True)
    write(names, parents, rest, built, clips, os.path.join(OUT, 'jester.glb'))
