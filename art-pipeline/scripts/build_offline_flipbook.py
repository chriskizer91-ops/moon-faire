"""Single-file offline flipbook: main clips only, HD frames embedded as WebP q90."""
import json, base64, io, re
from PIL import Image
SP = "/home/claude/sprites"
t = open(f"{SP}/flipbook_template.html", encoding="utf-8").read()
d = json.load(open(f"{SP}/jester_witch_spritesheet.json"))
# drop the "Older drafts" group
a = t.index(' ["#","Older drafts"]'); b = t.index("]];", a)
t = t[:a].rstrip().rstrip(",") + "];" + t[b + 3:]
clips = re.findall(r'\["([a-z0-9_]+)","', t[t.index("const CLIPS=["):t.index("];", t.index("const CLIPS=["))])
clips = [c for c in clips if c in d["animations"]]
used = sorted({n for c in clips for n in d["animations"][c]["frames"]})
hd = {}
for n in used:
    buf = io.BytesIO(); Image.open(f"{SP}/hd/{n}.webp").convert("RGBA").save(buf, "WEBP", quality=90, method=6, alpha_quality=100)
    hd[n] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
meta = {"frames": {n: d["frames"][n] for n in used}, "cell": d["cell"], "palette": d["palette"],
        "animations": {c: d["animations"][c] for c in clips}}
sheet = "data:image/png;base64," + base64.b64encode(open(f"{SP}/jester_witch_spritesheet.png", "rb").read()).decode()
t = t.replace("/*HD*/{}", json.dumps(hd)).replace("/*SHEET*/", sheet).replace("/*META*/{}", json.dumps(meta))
t = t.replace('<meta charset="utf-8">\n', "", 1).replace("<title>Jester Witch Flipbook</title>", "<title>Moon Faire Flipbook</title>", 1)
html = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + t + "\n</html>\n")
open("/home/claude/Moon_Faire_Flipbook.html", "w", encoding="utf-8").write(html)
print(len(clips), "clips,", len(used), "frames,", round(len(html) / 1e6, 1), "MB")
