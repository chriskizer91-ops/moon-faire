"""Build dist/jester-night.html: the Jester's two-minute scene in one file.

Embeds her frames from game-assets/ (AVIF), a bloom map per frame (a blurred
bright-pass of her spell light, made here), the boardwalk painting and the
title font, then the scene code from scenes/jester-night/.

    python3 tools/build_scene.py
"""
import base64, io, json, os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
SCENE = os.path.join(ROOT, "scenes", "jester-night")
GA = os.path.join(ROOT, "game-assets")
LOSSLESS = os.path.join(ROOT, "build", "lossless")
OUT = os.path.join(ROOT, "dist", "jester-night.html")
CODE = ["util.js", "script.js", "world.js", "actors.js", "fx.js", "render.js", "audio.js", "player.js"]


def uri(data, mime):
    return f"data:{mime};base64," + base64.b64encode(data).decode()


def glow_map(source):
    """Her spell light only: bright, saturated violet/magenta/gold and white sparkle cores."""
    im = Image.open(os.path.join(LOSSLESS, source + ".png")).convert("RGBA")
    a = np.asarray(im).astype(np.float32) / 255
    rgb, al = a[..., :3], a[..., 3]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    violet = (b > g * 1.25) & (r > g * 1.1)
    gold = (r > b * 1.6) & (g > b * 1.2)
    w = np.clip((mx - 0.8) / 0.2, 0, 1) * np.clip((sat - 0.35) / 0.3, 0, 1) * (violet | gold)
    w = np.maximum(w, np.clip((mn - 0.9) / 0.1, 0, 1) * 0.8)
    w *= al
    power = float(w.sum()) / 900.0
    small = (max(1, im.width // 4), max(1, im.height // 4))
    out = np.zeros(a.shape, np.float32)
    out[..., :3] = rgb * w[..., None]
    out[..., 3] = w
    img = Image.fromarray((out * 255).astype(np.uint8), "RGBA").resize(small, Image.BOX)
    img = img.filter(ImageFilter.GaussianBlur(1.6))
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = np.clip(arr[..., :3] * 2.2, 0, 255)       # brighten: this is light, drawn additively
    arr[..., 3] = np.clip(arr[..., 3] * 2.2, 0, 255)
    b = io.BytesIO()
    Image.fromarray(arr.astype(np.uint8), "RGBA").save(b, "WEBP", quality=80)
    return b.getvalue(), min(1.0, power)


def main():
    man = json.load(open(os.path.join(GA, "manifest.json")))["characters"]["jester"]["clips"]
    imgs, glows, index, clips = [], [], {}, {}
    for name, d in man.items():
        frames = []
        for f in d["frames"]:
            if f["hd"] not in index:
                gl, power = glow_map(f["source"])
                index[f["hd"]] = (len(imgs), len(glows), round(power, 3))
                imgs.append(uri(open(os.path.join(GA, f["hd"]), "rb").read(), "image/avif"))
                glows.append(uri(gl, "image/webp"))
            i, gi, power = index[f["hd"]]
            frames.append([i, f["w"], f["h"], round(f["anchorX"], 1), round(f["anchorY"], 1), gi, power])
        clips[name] = dict(fps=d["fps"], n=len(frames), loop=d["loop"], flipX=d["flipX"],
                           release=d.get("release_frame"), frames=frames)
    data = dict(clips=clips, imgs=imgs, glows=glows,
                backdrop=uri(open(os.path.join(ROOT, "art", "backdrops", "boardwalk-night.webp"), "rb").read(), "image/webp"))
    code = "\n".join(f"// ---- {n} ----\n" + open(os.path.join(SCENE, n)).read() for n in CODE)
    font = base64.b64encode(open(os.path.join(ROOT, "art", "fonts", "jacquard24-latin.woff2"), "rb").read()).decode()
    html = open(os.path.join(SCENE, "index.html")).read()
    html = html.replace("/*FONT*/", font).replace("/*DATA*/null", json.dumps(data, separators=(",", ":")).replace("</", "<\\/"))
    html = html.replace("/*CODE*/", code.replace("</script", "<\\/script"))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, "w").write(html)
    gsize = sum(len(g) for g in glows) * 3 / 4
    print(f"{OUT}: {len(html.encode()) / 1e6:.2f} MB, {len(imgs)} frames, glow maps {gsize / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
