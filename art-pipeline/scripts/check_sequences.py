import numpy as np, json, sys
from PIL import Image, ImageDraw
from scipy import ndimage as nd
sys.path.insert(0, "/home/claude/gen4"); import extract as X
FR = X.FR; META = json.load(open(FR + "/meta.json"))
def mainm(nm):
    al = np.array(Image.open(f"{FR}/{nm}.png"))[..., 3] > 128; lab, n = nd.label(al); sz = nd.sum(al, lab, range(1, n + 1)); return lab == (np.argmax(sz) + 1)
def sheet(tag, out, cols=11, cw=260, chh=330, sc=.42):
    fr = META[tag]; rows = (len(fr) + cols - 1) // cols
    W = Image.new("RGB", (cols * cw, rows * chh), (56, 48, 67)); d = ImageDraw.Draw(W)
    for i, f in enumerate(fr):
        im = Image.open(f"{FR}/{f['name']}.png"); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
        cx, cy = (i % cols) * cw + cw // 2, (i // cols) * chh + chh - 30
        W.paste(im, (int(cx - f['footX'] * sc), int(cy - f['footY'] * sc)), im)
        d.line([(cx - 60, cy), (cx + 60, cy)], fill=(120, 110, 140))
        d.text((cx - 20, cy + 6), f"{f['name']}{'' if f.get('src')=='new' else ' k'}", fill=(230, 220, 240))
    # head guide from first key
    W.save(out, quality=85)
for tag in sys.argv[1]:
    hs = [round(X.center_height(mainm(f['name']))) for f in META[tag]]
    print(tag, " ".join(f"{h}{'*' if f.get('src')=='new' else ''}" for h, f in zip(hs, META[tag])))
    sheet(tag, f"/home/claude/gen7/sheet_{tag}.jpg")
