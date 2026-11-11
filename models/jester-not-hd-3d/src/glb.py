"""Minimal glTF 2.0 binary writer: skinned meshes with vertex colours, one skin, animation clips."""
import json
import struct
import numpy as np

F32, U32, U16, U8 = 5126, 5125, 5123, 5121


def srgb_to_linear(c):
    c = np.asarray(c, float) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def weights8(W):
    """Skin weights as bytes that still add up to exactly one."""
    w = np.floor(np.asarray(W, np.float64) * 255 + 0.5).astype(np.int64)
    w[np.arange(len(w)), np.argmax(w, axis=1)] += 255 - w.sum(axis=1)
    return w.astype(np.uint8)


class Glb:
    def __init__(self):
        self.bin = bytearray()
        self.views = []; self.accessors = []
        self.j = {"asset": {"version": "2.0", "generator": "moon-faire jester-game build"},
                  "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [], "meshes": [], "materials": [],
                  "skins": [], "animations": []}

    def _view(self, data, target=None):
        while len(self.bin) % 4:
            self.bin.append(0)
        v = {"buffer": 0, "byteOffset": len(self.bin), "byteLength": len(data)}
        if target:
            v["target"] = target
        self.bin += data
        self.views.append(v)
        return len(self.views) - 1

    def acc(self, arr, ctype, atype, target=None, normalized=False, minmax=False):
        dt = {F32: np.float32, U32: np.uint32, U16: np.uint16, U8: np.uint8}[ctype]
        a = np.ascontiguousarray(arr, dtype=dt)
        view = self._view(a.tobytes(), target)
        d = {"bufferView": view, "componentType": ctype, "count": int(a.shape[0]), "type": atype}
        if normalized:
            d["normalized"] = True
        if minmax:
            flat = a.reshape(a.shape[0], -1)
            d["min"] = [float(x) for x in flat.min(0)]; d["max"] = [float(x) for x in flat.max(0)]
        self.accessors.append(d)
        return len(self.accessors) - 1

    def node(self, **kw):
        self.j["nodes"].append(kw)
        return len(self.j["nodes"]) - 1

    def material(self, name, rough, metal, extra=None):
        m = {"name": name, "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "roughnessFactor": rough, "metallicFactor": metal}}
        if extra:
            m.update(extra)
        self.j["materials"].append(m)
        return len(self.j["materials"]) - 1

    def texture(self, png_bytes, nearest=True):
        view = self._view(png_bytes)
        self.j.setdefault("images", []).append({"bufferView": view, "mimeType": "image/png"})
        self.j.setdefault("samplers", []).append({"magFilter": 9728 if nearest else 9729, "minFilter": 9987, "wrapS": 33071, "wrapT": 33071})
        self.j.setdefault("textures", []).append({"source": len(self.j["images"]) - 1, "sampler": len(self.j["samplers"]) - 1})
        return len(self.j["textures"]) - 1

    def mesh(self, name, V, N, C, J, W, F, material, uv=None):
        attrs = {
            "POSITION": self.acc(V, F32, "VEC3", 34962, minmax=True),
            "NORMAL": self.acc(N, F32, "VEC3", 34962),
            "JOINTS_0": self.acc(J, U8, "VEC4", 34962),
            "WEIGHTS_0": self.acc(weights8(W), U8, "VEC4", 34962, normalized=True),
        }
        if C is not None:
            c8 = np.clip(np.round(srgb_to_linear(C) * 255), 0, 255).astype(np.uint8)
            c8 = np.concatenate([c8, np.full((len(c8), 1), 255, np.uint8)], axis=1)
            attrs["COLOR_0"] = self.acc(c8, U8, "VEC4", 34962, normalized=True)
        if uv is not None:
            attrs["TEXCOORD_0"] = self.acc(uv, F32, "VEC2", 34962)
        idx = self.acc(np.asarray(F).reshape(-1), U32, "SCALAR", 34963)
        self.j["meshes"].append({"name": name, "primitives": [{"attributes": attrs, "indices": idx, "material": material}]})
        return len(self.j["meshes"]) - 1

    def skin(self, joint_nodes, rest_pos, skeleton_root):
        ibm = np.tile(np.eye(4, dtype=np.float32), (len(joint_nodes), 1, 1))
        ibm[:, 3, :3] = -np.asarray(rest_pos, np.float32)        # column-major: translation in the last column
        a = self.acc(ibm.reshape(-1, 16), F32, "MAT4")
        self.j["skins"].append({"joints": joint_nodes, "inverseBindMatrices": a, "skeleton": skeleton_root, "name": "JesterSkin"})
        return len(self.j["skins"]) - 1

    def animation(self, name, times, tracks):
        """tracks: list of (node, 'rotation'|'translation', array (T,4) or (T,3))."""
        tin = self.acc(np.asarray(times, np.float32).reshape(-1, 1), F32, "SCALAR", minmax=True)
        samplers = []; channels = []
        for node, path, data in tracks:
            out = self.acc(data, F32, "VEC4" if path == "rotation" else "VEC3")
            samplers.append({"input": tin, "output": out, "interpolation": "LINEAR"})
            channels.append({"sampler": len(samplers) - 1, "target": {"node": node, "path": path}})
        self.j["animations"].append({"name": name, "samplers": samplers, "channels": channels})

    def save(self, path):
        while len(self.bin) % 4:
            self.bin.append(0)
        self.j["bufferViews"] = self.views
        self.j["accessors"] = self.accessors
        self.j["buffers"] = [{"byteLength": len(self.bin)}]
        if not self.j["animations"]:
            del self.j["animations"]
        js = json.dumps(self.j, separators=(",", ":")).encode()
        while len(js) % 4:
            js += b" "
        total = 12 + 8 + len(js) + 8 + len(self.bin)
        with open(path, "wb") as f:
            f.write(struct.pack("<4sII", b"glTF", 2, total))
            f.write(struct.pack("<I4s", len(js), b"JSON")); f.write(js)
            f.write(struct.pack("<I4s", len(self.bin), b"BIN\x00")); f.write(bytes(self.bin))
        return total
