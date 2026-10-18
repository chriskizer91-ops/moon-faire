"""Build a scene's page: one self-contained HTML file.

    python3 tools/build_scene.py jester-night      # -> dist/jester-night.html
    python3 tools/build_scene.py jester-square     # -> dist/jester-square.html

scenes/<name>/scene.json says what goes in: the page's title and words, the
painting, any extra pictures (named, for the scene's code to find in ART), and
the code files in order (shared ones from scenes/lib/). Every scene gets the
Jester's frames from game-assets/ (AVIF) with a bloom map per frame, made here
from the lossless frames, and the title font.
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
SCENES = os.path.join(ROOT, "scenes")
GA = os.path.join(ROOT, "game-assets")
LOSSLESS = os.path.join(ROOT, "build", "lossless")


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


def picture(spec):
    """One extra picture: a path, or {src, max (longest side), q}. Paintings stay as they are; sprites go to WebP."""
    if isinstance(spec, str):
        spec = {"src": spec}
    path = os.path.join(ROOT, spec["src"])
    if path.endswith(".webp") and "max" not in spec:
        return uri(open(path, "rb").read(), "image/webp")
    im = Image.open(path)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if "max" in spec and max(im.size) > spec["max"]:
        k = spec["max"] / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "WEBP", quality=spec.get("q", 86), method=4)
    return uri(b.getvalue(), "image/webp")


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "jester-night"
    scene = json.load(open(os.path.join(SCENES, name, "scene.json")))
    man = json.load(open(os.path.join(GA, "manifest.json")))["characters"]["jester"]["clips"]
    imgs, glows, index, clips = [], [], {}, {}
    for cname, d in man.items():
        frames = []
        for f in d["frames"]:
            if f["hd"] not in index:
                gl, power = glow_map(f["source"])
                index[f["hd"]] = (len(imgs), len(glows), round(power, 3))
                imgs.append(uri(open(os.path.join(GA, f["hd"]), "rb").read(), "image/avif"))
                glows.append(uri(gl, "image/webp"))
            i, gi, power = index[f["hd"]]
            frames.append([i, f["w"], f["h"], round(f["anchorX"], 1), round(f["anchorY"], 1), gi, power])
        clips[cname] = dict(fps=d["fps"], n=len(frames), loop=d["loop"], flipX=d["flipX"],
                            release=d.get("release_frame"), frames=frames)
    art = {k: picture(v) for k, v in scene.get("art", {}).items()}
    data = dict(clips=clips, imgs=imgs, glows=glows, art=art,
                meta={k: json.load(open(os.path.join(ROOT, v))) for k, v in scene.get("meta", {}).items()},
                backdrop=uri(open(os.path.join(ROOT, scene["backdrop"]), "rb").read(), "image/webp"))
    code = "\n".join(f"// ---- {n} ----\n" + open(os.path.join(SCENES, n)).read() for n in scene["code"])
    font = base64.b64encode(open(os.path.join(ROOT, "art", "fonts", "jacquard24-latin.woff2"), "rb").read()).decode()
    html = open(os.path.join(SCENES, "lib", "page.html")).read()
    html = html.replace("/*TITLE*/", scene["title"]).replace("/*INTRO*/", scene["intro"]).replace("/*FOOTER*/", scene["footer"])
    html = html.replace("/*FONT*/", font).replace("/*DATA*/null", json.dumps(data, separators=(",", ":")).replace("</", "<\\/"))
    html = html.replace("/*CODE*/", code.replace("</script", "<\\/script"))
    out = os.path.join(ROOT, scene["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w").write(html)
    print(f"{out}: {len(html.encode()) / 1e6:.2f} MB, {len(imgs)} frames, {len(art)} extra pictures")


if __name__ == "__main__":
    main()
