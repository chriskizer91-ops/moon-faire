import json, sys
sys.path.insert(0, "/home/claude/gen7"); from fit import *
plan = json.load(open("/home/claude/gen6/z/plan.json")); res = {}
for mv, p in plan.items():
    for fn, skeys, nnew in p["strips"]:
        figs = E2.cut(f"/home/claude/gen6/z/{mv}/{fn}", len(skeys) + nnew); it = iter(figs); ks = []
        for gi, k in enumerate(skeys):
            _, mn = next(it); s, iou = fit(mn, k); ks.append((k, float(round(s, 3)), float(round(iou, 2))))
            if gi < len(skeys) - 1:
                for _ in range(sum(1 for _, t in p["timeline"] if t.startswith(f"new {k}->"))): next(it)
        res[f"{mv}/{fn}"] = ks; print(f"{mv:26s} {fn[:8]}", ks, flush=True)
json.dump(res, open("keyfit.json", "w"))
