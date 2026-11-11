"""Build out/jester.glb: skeleton, body parts, skin weights and movement clips."""
import sys
import time
import pickle
import os
import numpy as np
import sdf
import jester
from glb import Glb

OUT = os.path.join(os.path.dirname(__file__), '..', 'out')
CACHE = os.path.join(os.path.dirname(__file__), '..', 'work', 'parts.pkl')


def build_parts(only=None):
    names, parents, rest = jester.skeleton()
    cache = {}
    if os.path.exists(CACHE):
        cache = pickle.load(open(CACHE, 'rb'))
    built = {}
    for builder, rough, metal, keep, passes in jester.PARTS:
        nm = builder.__name__.replace('_part', '')
        if only and nm not in only and nm in cache:
            built[nm] = cache[nm]
            continue
        t0 = time.time()
        part = builder()
        V, F = part.mesh()
        n0 = len(F)
        if keep < 1:
            V, F = sdf.simplify(V, F, keep)
        N = part.normals(V)
        W, owner, shapes = part.weights(V, names)
        tags = [shapes[o].tag for o in owner]
        W = sdf.smooth_weights(V, F, W, iters=passes)
        J4, W4 = sdf.top4(W)
        C = part.colour(V, tags)
        built[nm] = dict(V=V, F=F, N=N, J=J4, W=W4, C=C, rough=rough, metal=metal)
        if nm == 'head':
            uv, img = jester.head_face(V)
            import io
            buf = io.BytesIO(); img.save(buf, 'PNG')
            img.save(os.path.join(os.path.dirname(CACHE), 'face_tex.png'))
            built[nm].update(uv=uv, png=buf.getvalue(), C=None)
        print(f'{nm:6s} {n0:7d} -> {len(F):6d} triangles, {len(V):6d} points, {time.time() - t0:.1f}s', flush=True)
    pickle.dump(built, open(CACHE, 'wb'))
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
        extra = None
        if b.get('png'):
            extra = {'pbrMetallicRoughness': {'baseColorTexture': {'index': g.texture(b['png'])}, 'roughnessFactor': b['rough'], 'metallicFactor': b['metal']}}
        mat = g.material(nm, b['rough'], b['metal'], extra)
        m = g.mesh(nm, b['V'], b['N'], b['C'], b['J'], b['W'], b['F'], mat, uv=b.get('uv'))
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
                                    'heightMetres': 1.66, 'faces': '+Z', 'bindPose': 'A1 standing pose'}
    size = g.save(path)
    print(f'wrote {path}: {size / 1e6:.2f} MB, {tris} triangles, {len(names)} bones, {len(clips or [])} clips')


if __name__ == '__main__':
    only = sys.argv[1].split(',') if len(sys.argv) > 1 and sys.argv[1] != 'all' else None
    names, parents, rest, built = build_parts(only)
    clips = []
    try:
        import anim
        clips = anim.all_clips(names, parents, rest)
    except ImportError:
        pass
    os.makedirs(OUT, exist_ok=True)
    write(names, parents, rest, built, clips, os.path.join(OUT, 'jester.glb'))
