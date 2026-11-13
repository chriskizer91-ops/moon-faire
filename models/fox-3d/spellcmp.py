# spellcmp.py: the last three round-3 spells beside their paintings -> deliver/Fox_Same_Cloth_Slip_Stitch_Crazy_Quilt.jpg
# Each row is one spell: its paintings (labelled H..) and stills of the model at the seconds shown. The stills come from stills.py:
#   PRE=bench/dummy.js python3 stills.py same_cloth shots/cmp_sc '0.06,0.06,7.6,1.02,1.15,1200,800' 1.95 3.5 4.21 5.9
#   python3 stills.py slip_stitch shots/cmp_ss '0.10,0.06,6.3,1.08,0.42,800,900' 1.1 3.1 3.6 4.5
#   python3 stills.py crazy_quilt shots/cmp_cq '0.10,0.10,9.2,1.0,1.75,1350,800' 1.45 1.9 2.5 3.1
from PIL import Image, ImageDraw, ImageFont
import os
W = '/home/claude/fox3d/'; R = W + 'references/round3/'
if not os.path.exists(R + 'H9.webp'): R = '/home/claude/moon-faire/models/fox-3d/references/round3/'      # the paintings as they sit in the repo
RH = 470; PAD = 8; LAB = 26
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17); FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
except Exception: F = FB = ImageFont.load_default()
def fit(im, h): return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
def paint(n, crop=None):
    im = Image.open(R + n + '.webp').convert('RGB')
    if crop: im = im.crop((int(crop[0] * im.width), int(crop[1] * im.height), int(crop[2] * im.width), int(crop[3] * im.height)))
    return fit(im, RH), 'painting ' + n
def still(pre, i, t, crop=None):
    im = Image.open(W + f'shots/{pre}_{i}.png').convert('RGB')
    if crop: im = im.crop((int(crop[0] * im.width), int(crop[1] * im.height), int(crop[2] * im.width), int(crop[3] * im.height)))
    return fit(im, RH), f'model, {t} s'
rows = [
  ('Same Cloth', [paint('H9'), still('cmp_sc', 0, 1.95, (0.05, 0.08, 0.95, 0.98)), paint('H10'), still('cmp_sc', 1, 3.5, (0.05, 0.08, 0.95, 0.98)), still('cmp_sc', 2, 4.21, (0.05, 0.08, 0.95, 0.98))]),
  ('Slip Stitch', [paint('H11'), still('cmp_ss', 0, 1.1, (0.05, 0.02, 0.80, 0.98)), still('cmp_ss', 1, 3.1, (0.10, 0.02, 0.98, 0.98)), paint('H12'), still('cmp_ss', 2, 3.6, (0.10, 0.02, 0.98, 0.98)), still('cmp_ss', 3, 4.5, (0.25, 0.02, 0.98, 0.98))]),
  ('Crazy Quilt', [paint('H13'), still('cmp_cq', 1, 1.9, (0.0, 0.05, 0.86, 0.95)), still('cmp_cq', 2, 2.5, (0.05, 0.05, 0.98, 0.95)), still('cmp_cq', 3, 3.1, (0.12, 0.05, 1.0, 0.95))]),
]
widths = [sum(im.width for im, _ in r[1]) + PAD * (len(r[1]) - 1) for r in rows]; TW = max(widths)
S = Image.new('RGB', (TW + 2 * PAD, (RH + LAB + 40) * len(rows) + PAD), (24, 20, 30)); d = ImageDraw.Draw(S); y = PAD
for (name, items), wd in zip(rows, widths):
    d.text((PAD, y + 4), name, fill=(255, 226, 150), font=FB); y += 36; k = TW / wd; x = PAD
    for im, lab in items:
        im2 = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS) if k < 1.25 else im
        S.paste(im2, (x, y)); d.text((x + 4, y + im2.height + 3), lab, fill=(225, 225, 235), font=F); x += im2.width + PAD
    y += (round(RH * k) if k < 1.25 else RH) + LAB + 4
S = S.crop((0, 0, S.width, y + PAD)); S.save(W + 'deliver/Fox_Same_Cloth_Slip_Stitch_Crazy_Quilt.jpg', quality=88); print(S.size)
