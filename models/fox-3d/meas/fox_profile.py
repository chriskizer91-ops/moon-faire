# Reads her head sheet C3 (front, three-quarter, true profile at one size) and measures:
#   front panel: pupils, mouth line  ->  pixels per metre of head (eye to mouth is 0.066 m in the head's own frame, as the face bake sets it)
#   profile panel: the line of forehead, nose, lips and chin against the backdrop, row by row
# Writes meas/fox_profile.json and a check picture shots/c3_marks.jpg.     run: python3 -I meas/fox_profile.py
import json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
W = '/home/claude/fox3d/'; im = Image.open(W + 'refs/C3.png').convert('RGB'); a = np.asarray(im).astype(np.float32)
lum = a.mean(-1)
def dark_blob(cx, cy, r=26):
    win = lum[cy - r:cy + r, cx - r:cx + r]; m = win < np.percentile(win, 9); m = ndi.binary_opening(m, np.ones((3, 3), bool)); lab, n = ndi.label(m)
    k = 1 + int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))); yy, xx = np.nonzero(lab == k); return cx - r + xx.mean(), cy - r + yy.mean()
# Pupils read by eye off a gridded copy (shots/c3_grid.jpg). Automatic finding caught the dark lash corners instead and made her eyes 20% too far apart.
eR = (235.0, 381.0); eL = (342.5, 379.0); eyeRow = (eR[1] + eL[1]) / 2; cx = (eR[0] + eL[0]) / 2; PD = eL[0] - eR[0]
col = lum[430:540, int(cx) - 14:int(cx) + 14].mean(1); mouthRow = 430 + int(np.argmin(ndi.gaussian_filter1d(col, 2)))
PPM = (mouthRow - eyeRow) / 0.066
# profile panel
X0, X1, Y0, Y1 = 1300, 1536, 200, 660; c = a[Y0:Y1, X0:X1]
skin = (c[..., 0] > 112) & (c[..., 0] - c[..., 2] > 24) & (c[..., 0] > c[..., 1] + 6); skin = ndi.binary_closing(skin, np.ones((7, 7), bool)); skin = ndi.binary_fill_holes(skin)
lab, n = ndi.label(skin); skin = lab == (1 + int(np.argmax(ndi.sum(skin, lab, range(1, n + 1)))))
edge = np.array([(len(r) - 1 - np.argmax(r[::-1])) if r.any() else -1 for r in skin], float)       # the right-most skin pixel in each row
rows = np.nonzero(edge >= 0)[0]; es = edge.copy(); es[rows] = ndi.gaussian_filter1d(edge[rows], 1.2)
r_eye = int(round(eyeRow)) - Y0
tip = int(np.argmax(np.where((np.arange(len(es)) > r_eye + 15) & (np.arange(len(es)) < r_eye + 90), es, -1)))
nas = r_eye - 25 + int(np.argmin(es[r_eye - 25:tip - 12]))
out = {'eyeRow': float(eyeRow), 'cx': float(cx), 'PD': float(PD), 'mouthRow': int(mouthRow), 'PPM': float(PPM), 'tipRow': tip + Y0, 'tipCol': float(es[tip] + X0), 'nasRow': nas + Y0, 'nasCol': float(es[nas] + X0),
       'profile': [[int(r + Y0), float(es[r] + X0)] for r in rows]}
json.dump(out, open(W + 'meas/fox_profile.json', 'w'))
print({k: (round(v, 2) if isinstance(v, float) else v) for k, v in out.items() if k != 'profile'}, 'rows', rows[0] + Y0, rows[-1] + Y0)
# check picture
d = ImageDraw.Draw(im)
for (x, y) in (eR, eL): d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(0, 255, 0), width=2)
d.line([(cx - 60, mouthRow), (cx + 60, mouthRow)], fill=(0, 255, 0), width=1); d.line([(0, eyeRow), (1536, eyeRow)], fill=(0, 255, 255), width=1); d.line([(0, mouthRow), (1536, mouthRow)], fill=(0, 255, 255), width=1)
for r in rows[::1]: d.point((es[r] + X0 + 1, r + Y0), fill=(0, 255, 0))
for (r, cc) in ((tip, es[tip]), (nas, es[nas])): d.ellipse([cc + X0 - 4, r + Y0 - 4, cc + X0 + 4, r + Y0 + 4], outline=(255, 255, 0), width=2)
fr = im.crop((120, 250, 440, 610)).resize((640, 720), Image.LANCZOS); pr = im.crop((1300, 250, 1536, 610)).resize((472, 720), Image.LANCZOS)
sh = Image.new('RGB', (1120, 720)); sh.paste(fr, (0, 0)); sh.paste(pr, (648, 0)); sh.save(W + 'shots/c3_marks.jpg', quality=88)
