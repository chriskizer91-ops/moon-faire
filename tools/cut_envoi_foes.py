"""Cut Envoi's foes out of their sheets, as sprites for Moon Faire scenes.

Sources (copied from chriskizer91-ops/envoi-on-the-longest-night, reference/art/):
  art/foes/envoi-sheets/wisp-actions.png           wisp action poses on grey
  art/foes/envoi-sheets/great-wraith.webp          great wraith (A: stolen flames) on grey
  art/foes/envoi-sheets/shadow-wraith-pose-sheet.png  wraith poses, transparent, violet

Writes art/foes/<foe>_<pose>.png and art/foes/foes.json. Each sprite records its
ground point (gx, gy: the bottom middle of the figure) and px_per_m, so a scene
can draw it at its true size: the wisp is 0.8 m, the wraith 2.2 m, and the great
wraith is measured against the 1.6 m figure on its sheet.

The wraith sheet is violet, but Envoi's lore makes the wraith soul-green
(lore answer 18), so its violets are turned green here.

    python3 tools/cut_envoi_foes.py
"""
import colorsys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
SHEETS = os.path.join(ROOT, "art", "foes", "envoi-sheets")
OUT = os.path.join(ROOT, "art", "foes")

# x0, y0, x1, y1 on the sheet
WISP = {"idle": (25, 15, 300, 462), "flicker": (325, 35, 795, 462), "cling": (795, 25, 1160, 462),
        "gutter": (1185, 135, 1490, 458), "wail": (5, 510, 385, 952), "hurt": (395, 515, 725, 952),
        "released": (1185, 520, 1525, 952), "moth": (1425, 518, 1524, 614)}
GREAT = {"front": (0, 15, 520, 612), "sweep": (0, 665, 388, 1128), "swallow": (382, 645, 645, 1130),
         "breath": (645, 690, 1052, 1130), "released": (1035, 640, 1300, 1130)}
WRAITH = ["idle", "idle_turn", "side", "back", "raise", "sweep", "sweep_low", "cast",
          "reach", "aura", "heart", "kneel"]


def key_grey(rgb, bg, t0=7.0, t1=62.0):
    """Alpha from distance to the flat grey, then pull the colour out of the grey."""
    d = np.sqrt(((rgb - bg) ** 2).sum(-1))
    a = np.clip((d - t0) / (t1 - t0), 0, 1)
    f = bg + (rgb - bg) / np.maximum(a, 0.02)[..., None]
    return np.clip(f, 0, 255), a


def save(name, rgba, gx, gy, ppm, meta):
    im = Image.fromarray(rgba.astype(np.uint8), "RGBA")
    box = im.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    im = im.crop(box)
    im.save(os.path.join(OUT, name + ".png"), optimize=True)
    meta[name] = dict(w=im.width, h=im.height, gx=round(float(gx) - box[0], 1), gy=round(float(gy) - box[1], 1), px_per_m=ppm)


def cut_grey(sheet, boxes, prefix, ppm, meta, ground=None, erase=()):
    im = np.asarray(Image.open(os.path.join(SHEETS, sheet)).convert("RGB")).astype(np.float32)
    bg = np.median(np.concatenate([im[:8, :8].reshape(-1, 3), im[-8:, -8:].reshape(-1, 3), im[:8, -8:].reshape(-1, 3)]), 0)
    rgb, a = key_grey(im, bg)
    for x0, y0, x1, y1 in erase:
        a[y0:y1, x0:x1] = 0
    for pose, (x0, y0, x1, y1) in boxes.items():
        c = np.concatenate([rgb[y0:y1, x0:x1], a[y0:y1, x0:x1, None] * 255], -1)
        # drop specks that are not part of the figure
        m = c[..., 3] > 20
        lab, n = nd.label(nd.binary_dilation(m, iterations=3))
        if n > 1:
            sizes = nd.sum(m, lab, range(1, n + 1))
            keep = np.isin(lab, 1 + np.flatnonzero(sizes > max(60, sizes.max() * 0.004)))
            c[..., 3] *= keep
        ys, xs = np.nonzero(c[..., 3] > 60)
        gy = ys.max() if ground is None else ground.get(pose, ys.max())
        gx = np.median(xs[ys > gy - 40]) if ground is None else xs.mean()
        save(f"{prefix}_{pose}", c, gx, gy, ppm, meta)


def cut_wraith(meta):
    a = np.asarray(Image.open(os.path.join(SHEETS, "shadow-wraith-pose-sheet.png")).convert("RGBA")).astype(np.float32)
    # violet to soul-green: shift the hue of the coloured pixels, calm the cloth
    rgb = a[..., :3] / 255
    flat = rgb.reshape(-1, 3)
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in flat]).reshape(rgb.shape)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    violet = ((h > 0.62) & (h < 0.95)) & (s > 0.18)
    h = np.where(violet, 0.41, h)
    s = np.where(violet & (v < 0.55), s * 0.45, s)
    hsv = np.stack([h, s, v], -1).reshape(-1, 3)
    rgb2 = np.array([colorsys.hsv_to_rgb(*p) for p in hsv]).reshape(rgb.shape) * 255
    a = np.concatenate([rgb2, a[..., 3:]], -1)
    m = nd.binary_dilation(a[..., 3] > 24, iterations=4)
    lab, n = nd.label(m)
    objs = [(i + 1, s) for i, s in enumerate(nd.find_objects(lab)) if (lab[s] == i + 1).sum() > 4000]
    objs.sort(key=lambda o: (o[1][0].start // 300, o[1][1].start))
    ppm = 182.0   # the standing poses are about 400 px for the wraith's 2.2 m
    for pose, (i, s) in zip(WRAITH, objs):
        c = a[s].copy()
        c[..., 3] *= (lab[s] == i)
        ys, xs = np.nonzero(c[..., 3] > 60)
        gy = ys.max()
        save(f"wraith_{pose}", c, np.median(xs[ys > gy - 60]), gy, ppm, meta)


def main():
    meta = {}
    cut_grey("wisp-actions.png", WISP, "wisp", 525.0, meta)
    # the 1.6 m figure and ruler stand beside the great wraith's front view: wipe them first
    cut_grey("great-wraith.webp", GREAT, "great", 119.0, meta, erase=[(0, 410, 142, 640), (0, 400, 80, 620), (468, 0, 530, 150)])   # the ruler figure, and the next view's scythe tip
    cut_wraith(meta)
    json.dump(meta, open(os.path.join(OUT, "foes.json"), "w"), indent=1)
    print(len(meta), "sprites:", ", ".join(f"{k} {v['w']}x{v['h']}" for k, v in meta.items()))


if __name__ == "__main__":
    main()
