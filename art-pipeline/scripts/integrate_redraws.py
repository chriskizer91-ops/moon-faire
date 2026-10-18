import numpy as np, json, shutil
from PIL import Image
from scipy import ndimage as nd
import extract2 as E2
X = E2.X
FR = X.FR; META = json.load(open(FR + "/meta.json")); FLAT = {m['name']: m for t in META.values() for m in t}
Z = "/home/claude/gen5/z/redo"

def anchor(main):
    ys, xs = np.nonzero(main); fb = ys.max(); h = fb - ys.min()
    boots = ys > fb - .08 * h; bx = np.median(xs[boots])
    band = (ys > ys.min() + .30 * h) & (ys < ys.min() + .55 * h) & (np.abs(xs - bx) < .18 * h)
    return float(np.median(xs[band])), float(fb), int(ys.min())

def scaled(figs, ka):
    s = [X.key_height(ka) / X.center_height(mn) for _, mn in figs[1:-1]]
    med = float(np.median(s)); s = [v if abs(v / med - 1) <= .06 else med for v in s]
    out = []
    for (rgba, mn), k in zip(figs[1:-1], s):
        im = Image.fromarray(rgba, "RGBA"); size = (max(1, round(im.width * k)), max(1, round(im.height * k)))
        im = im.resize(size, Image.LANCZOS); mm = np.array(Image.fromarray((mn * 255).astype(np.uint8)).resize(size, Image.NEAREST)) > 127
        out.append((im, mm))
    return out, s

report = {}
for tag, name, ka, kb in [("M", "witch_harvest_crescent", "H00", "H07"), ("N", "witch_silverleaf_salve", "H08", "H15"),
                          ("P", "witch_elderwood_guardian", "H16", "H23"), ("Q", "fox_hemline_fangs", "F00", "F07")]:
    figs = E2.cut(f"{Z}/{name}.png", 8); mids, s = scaled(figs, ka)
    meta = []
    for i, it in enumerate([ka] + mids + [kb]):
        nm = f"{tag}{i + 1:02d}"
        if isinstance(it, str):
            shutil.copy(f"{FR}/{it}.png", f"{FR}/{nm}.png"); f = dict(FLAT[it]); f['name'] = nm; f['src'] = it
        else:
            im, mm = it; im.save(f"{FR}/{nm}.png"); fx, fy, top = anchor(mm); f = dict(name=nm, footX=fx, footY=fy, bodyTop=top)
        meta.append(f)
    META[tag] = meta; report[name] = [round(v, 3) for v in s]

# Ranger R14: replace the single frame in place (keep the old one as R14_old)
figs = E2.cut(f"{Z}/ranger_silver_arrow_R14.png", 3); mids, s = scaled(figs, "R13")
shutil.copy(f"{FR}/R14.png", f"{FR}/R14_old.png")
im, mm = mids[0]; im.save(f"{FR}/R14.png"); fx, fy, top = anchor(mm)
for f in META["R"]:
    if f['name'] == "R14": f.update(footX=fx, footY=fy, bodyTop=top)
report["R14"] = s
json.dump(META, open(FR + "/meta.json", "w"), indent=1)
print(report)
