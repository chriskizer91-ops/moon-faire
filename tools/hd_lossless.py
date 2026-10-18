"""Rebuild the lossless HD frames from art-pipeline/frames.

This is the HD half of art-pipeline/scripts/build.py (stray clean-up, then
one shared scale for every set), run on its own so we can re-encode frames
from clean pixels instead of from the q90 WebP export.

    python3 tools/hd_lossless.py <out_dir>
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.join(os.path.dirname(__file__), "..", "art-pipeline")
out_dir = sys.argv[1]
os.makedirs(out_dir, exist_ok=True)
meta = json.load(open(os.path.join(ROOT, "frames", "meta.json")))

# Same lists and rules as build.py.
CAST = {"A04", "A05", "B01", "B10"} | {f"{t}{i:02d}" for t in "CD" for i in range(13, 19)} \
    | {f"K{i:02d}" for i in range(1, 49)} | {f"O{i:02d}" for i in range(1, 25)} \
    | {f"S{i:02d}" for i in range(1, 17)} | {f"{t}{i:02d}" for t in "GRHF" for i in range(24)} \
    | {f"{t}{i:02d}" for t in "UVEMNPQXYJLT" for i in range(1, 30)}

def grp(n):
    t, i = n[0], int(n[1:])
    if t in "CD": return t + ("side" if i < 8 else "front")
    if t == "A": return "Aside" if 6 <= i <= 12 else "A"
    return t

hts = {}
for fr in meta.values():
    for m in fr: hts.setdefault(grp(m["name"]), []).append(m["footY"] - m["bodyTop"])
G = {g: np.percentile(v, 25) for g, v in hts.items()}
REF = {g: G["A"] for g in G}
REF.update(Aside=G["Aside"], B=G["B"], Cside=G["Aside"], Dside=G["Aside"])
H = {g: G[g] * G["A"] / REF[g] for g in G}
H["K"] = 2 * H["Cfront"]
for t in "MNPQUVERHFXYJLT": H[t] = H["G"]
H["I"] = H["A"]
H["O"] = 2 * H["A"]; H["S"] = 2 * H["A"]; H["W"] = 2 * H["Cside"]

out = {}
for tag, fr in meta.items():
    for m in fr:
        name = m["name"]
        im = np.array(Image.open(os.path.join(ROOT, "frames", name + ".png")).convert("RGBA")).astype(float)
        a = im[..., 3] > 12
        lab, n = nd.label(a, structure=np.ones((3, 3)))
        sizes = nd.sum(a, lab, range(1, n + 1)); main = np.argmax(sizes) + 1
        dist = nd.distance_transform_edt(lab != main)
        keep = np.zeros_like(a)
        for k in range(1, n + 1):
            comp = lab == k
            if k == main or (name in CAST and sizes[k - 1] > 20 and im[comp][:, :3].max(-1).mean() > 110) \
                    or (sizes[k - 1] > 250 and dist[comp].min() < 20):
                keep |= comp
        im[..., 3] *= keep
        sh = H["A"] / H[grp(name)]
        hd = Image.fromarray(im.astype(np.uint8), "RGBA")
        if abs(sh - 1) > 0.01:
            hd = hd.resize((round(hd.width * sh), round(hd.height * sh)), Image.LANCZOS)
        hd.save(os.path.join(out_dir, name + ".png"), optimize=False, compress_level=1)
        out[name] = dict(w=hd.width, h=hd.height, anchorX=m["footX"] * sh, anchorY=m["footY"] * sh)
json.dump(out, open(os.path.join(out_dir, "frames.json"), "w"), indent=1)
print(len(out), "frames")
