"""Integrate the 23 smoothing strips: one uniform scale per strip (fitted on its key copies), originals for keys."""
import numpy as np, json, sys
from PIL import Image
sys.path.insert(0, "/home/claude/gen7"); from fit import *
FR = X.FR; Z = "/home/claude/gen6/z"
META = json.load(open(FR + "/meta_backup_gen6.json"))                       # clean state before any smoothing writes
plan = json.load(open(f"{Z}/plan.json")); KF = json.load(open("/home/claude/gen7/keyfit.json"))
OUT = {"fox_blue_mischief": "X", "fox_borrowed_face": "Y", "fox_hemline_fangs": "Q", "witch_silverleaf_salve": "N",
       "witch_elderwood_guardian": "P", "witch_harvest_crescent": "M", "ranger_moonsteel_draw": "J",
       "ranger_silver_arrow": "L", "ranger_silverglass_ward": "T"}
KEY = {k: (key_img(k).copy(), dict(FLAT[k])) for p in plan.values() for k in p["keys"]}
CH = {}   # centre-height scales per strip key, as a fallback
report = {}
for mv, p in plan.items():
    keys = p["keys"]; tl = p["timeline"]; strip_new = {}
    for fn, skeys, nnew in p["strips"]:
        figs = E2.cut(f"{Z}/{mv}/{fn}", len(skeys) + nnew); it = iter(figs)
        fits = KF[f"{mv}/{fn}"]; good = [s for _, s, iou in fits if iou >= .6]
        chs = []
        for gi, k in enumerate(skeys):
            _, mn = next(it); chs.append(X.center_height(key_main(k)) / X.center_height(mn))
            if gi < len(skeys) - 1:
                news = [next(it) for _ in range(sum(1 for _, t in tl if t.startswith(f"new {k}->")))]
                strip_new[keys.index(k)] = news
        s = float(np.median(good)) if good else float(np.median([f[1] for f in fits] + chs))
        for gi, k in enumerate(skeys[:-1]): strip_new[keys.index(k)] = (strip_new[keys.index(k)], s)
        report.setdefault(mv, []).append((fn[:8], round(s, 3), len(good)))
    seq = []
    for gi, k in enumerate(keys):
        seq.append(("key", k))
        if mv == "ranger_silverglass_ward" and k == "R20": seq.append(("key", k))     # full shield held twice
        if gi in strip_new:
            news, s = strip_new[gi]
            for rgba, mn in news:
                im = Image.fromarray(rgba, "RGBA"); size = (max(1, round(im.width * s)), max(1, round(im.height * s)))
                seq.append(("new", im.resize(size, Image.LANCZOS), np.array(Image.fromarray((mn * 255).astype(np.uint8)).resize(size, Image.NEAREST)) > 127))
    tag = OUT[mv]; meta = []
    for i, it in enumerate(seq):
        nm = f"{tag}{i + 1:02d}"
        if it[0] == "key":
            img, f = KEY[it[1]]; img.save(f"{FR}/{nm}.png"); f = dict(f); f["name"] = nm; f["src"] = it[1]
        else:
            it[1].save(f"{FR}/{nm}.png"); fx, fy, top = anchor(it[2]); f = dict(name=nm, footX=fx, footY=fy, bodyTop=top, src="new")
        meta.append(f)
    META[tag] = meta; report[mv].insert(0, (tag, len(seq)))
json.dump(META, open(FR + "/meta.json", "w"), indent=1)
for k, v in report.items(): print(k, v)
