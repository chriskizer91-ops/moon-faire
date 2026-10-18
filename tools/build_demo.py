"""Build dist/moon-faire-demo.html: one self-contained page with every clip.

Reads game-assets/ (run tools/pack_assets.py first), the stage paintings in
art/backdrops/ and the lossless frames in build/lossless/, and writes a
single HTML file with everything embedded, for Chris's phone.

    python3 tools/build_demo.py
"""
import base64, io, json, os
from multiprocessing import Pool
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
GA = os.path.join(ROOT, "game-assets")
LOSSLESS = os.path.join(ROOT, "build", "lossless")
OUT = os.path.join(ROOT, "dist", "moon-faire-demo.html")
SMALL_Q = 65   # the next step down, shown for comparison

# Power order, weakest first. Names are still open in the lore, so they live here as data.
CAST = [
    ("ranger", "Ranger", "Full Moon", ("silverglass_ward", 0)),
    ("herbal_witch", "Herbal Witch", "Waxing Moon", ("silverleaf_salve", 0)),
    ("fox", "Fox", "Waning Crescent", ("borrowed_face", 0)),
    ("jester", "Jester", "New Moon", ("idle", 0)),
]
BACKDROPS = [("Boardwalk", "boardwalk-night.webp"), ("Clearing", "clearing-night.webp"),
             ("Cottage", "cottage-night.webp"), ("Fen", "open-fen-night.webp")]
SAMPLES = [("Jester", "jester", "curtain_call", 31), ("Fox", "fox", "blue_mischief", 15),
           ("Witch", "herbal_witch", "elderwood_guardian", 12)]   # each one's release frame (0-based)


def uri(data, mime):
    return f"data:{mime};base64," + base64.b64encode(data).decode()


def enc(im, fmt, **kw):
    b = io.BytesIO(); im.save(b, fmt, **kw); return b.getvalue()


def small_size(source):
    im = Image.open(os.path.join(LOSSLESS, source + ".png")).convert("RGBA")
    return len(enc(im, "AVIF", quality=SMALL_Q, subsampling="4:4:4", speed=6))


def main():
    man = json.load(open(os.path.join(GA, "manifest.json")))
    src = json.load(open(os.path.join(ROOT, "assets", "manifest.json")))
    quality = int(man["hd"]["format"].split(" q")[1].split()[0])

    imgs, index, chars, sources = [], {}, [], {}
    for cid, name, moon, (sc, sf) in CAST:
        cv = man["characters"][cid]
        clips = []
        for clid, d in cv["clips"].items():
            frames = []
            for k, f in enumerate(d["frames"]):
                if f["hd"] not in index:
                    index[f["hd"]] = len(imgs)
                    imgs.append(uri(open(os.path.join(GA, f["hd"]), "rb").read(), "image/avif"))
                    sources[f["hd"]] = (f["source"], src["characters"][cid]["clips"][clid]["frames"][k]["hd"])
                p = f["pixel"]
                frames.append([index[f["hd"]], f["w"], f["h"], round(f["anchorX"], 1), round(f["anchorY"], 1), p["x"], p["y"]])
            clips.append(dict(id=clid, name=clid.replace("_", " ").title(), fps=d["fps"], loop=d["loop"],
                              flipX=d["flipX"], release=d.get("release_frame"),
                              draft=d["status"].startswith("draft"), frames=frames))
        sheet = open(os.path.join(GA, cv["pixel_sheet"]), "rb").read()
        chars.append(dict(id=cid, name=name, moon=moon, stand=dict(clip=sc, frame=sf),
                          sheet=uri(sheet, "image/png"), clips=clips))

    with Pool(4) as pool:
        small = sum(pool.map(small_size, [s for s, _ in sources.values()]))
    sizes = dict(
        frames=len(imgs), quality=quality, small_quality=SMALL_Q,
        now=sum(os.path.getsize(os.path.join(ROOT, "assets", h)) for _, h in sources.values()),
        avif=sum(os.path.getsize(os.path.join(GA, h)) for h in sources),
        small=small,
        pixel_now=os.path.getsize(os.path.join(ROOT, "assets", "pixel", "moonfaire_pixel_128.png")),
        pixel=sum(os.path.getsize(os.path.join(GA, c["pixel_sheet"])) for c in man["characters"].values()),
    )

    compare = []
    for label, cid, clid, k in SAMPLES:
        f = man["characters"][cid]["clips"][clid]["frames"][k]
        old = src["characters"][cid]["clips"][clid]["frames"][k]["hd"]
        im = Image.open(os.path.join(LOSSLESS, f["source"] + ".png")).convert("RGBA")
        box = im.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox()
        side = 180
        x0 = int(min(max(f["anchorX"] - side / 2, 0), max(im.width - side, 0)))
        y0 = int(min(max(box[1] + 6, 0), max(im.height - side, 0)))
        png = enc(im, "PNG", optimize=True)
        avif = open(os.path.join(GA, f["hd"]), "rb").read()
        webp = open(os.path.join(ROOT, "assets", old), "rb").read()
        smaller = enc(im, "AVIF", quality=SMALL_Q, subsampling="4:4:4", speed=6)
        compare.append(dict(label=label, w=im.width, h=im.height, crop=[x0, y0, side, side], variants=[
            dict(name="Original", note="lossless PNG", bytes=len(png), uri=uri(png, "image/png")),
            dict(name="Now", note="WebP q90", bytes=len(webp), uri=uri(webp, "image/webp")),
            dict(name="This page", note=f"AVIF q{quality}", bytes=len(avif), uri=uri(avif, "image/avif"), used=True),
            dict(name="Smaller", note=f"AVIF q{SMALL_Q}", bytes=len(smaller), uri=uri(smaller, "image/avif")),
        ]))

    t = Image.new("RGBA", (16, 16))
    t.putdata([(200, 60 + i * 8, 120, 40 + i * 12) for i in range(16)] * 16)
    tests = dict(avif444=uri(enc(t, "AVIF", quality=70, subsampling="4:4:4"), "image/avif"),
                 avif420=uri(enc(t, "AVIF", quality=70, subsampling="4:2:0"), "image/avif"),
                 webp=uri(enc(t, "WEBP", quality=90), "image/webp"))

    # the paintings go in as standard AVIF too, about half their WebP size
    backdrops = [dict(name=n, uri=uri(enc(Image.open(os.path.join(ROOT, "art", "backdrops", p)).convert("RGB"), "AVIF", quality=55, speed=6), "image/avif"))
                 for n, p in BACKDROPS]
    cell = man["pixel"]["cell"]
    data = dict(chars=chars, imgs=imgs, backdrops=backdrops, compare=compare, tests=tests, sizes=sizes,
                cell=dict(w=cell["w"], h=cell["h"], ax=cell["anchorX"], ay=cell["anchorY"]),
                foot=f"Frames from the Flip Book Art export of {src['version']}, re-encoded by tools/pack_assets.py. "
                     "Stage paintings from the 20-min repo (art/battle/). Draft moves are the 8-key versions; "
                     "the smoothed ones replace them with the same names.")

    template = open(os.path.join(ROOT, "tools", "demo_template.html")).read()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    for _ in range(2):   # second pass writes the page's own final size into it
        html = template.replace("/*DATA*/", json.dumps(data, separators=(",", ":")).replace("</", "<\\/"))
        sizes["page"] = len(html.encode())
    open(OUT, "w").write(html)
    print(f"{OUT}: {sizes['page'] / 1e6:.2f} MB; {len(imgs)} frames, AVIF {sizes['avif'] / 1e6:.2f} MB "
          f"(was {sizes['now'] / 1e6:.2f} MB), q{SMALL_Q} would be {small / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
