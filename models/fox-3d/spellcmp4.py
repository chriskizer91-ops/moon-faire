# spellcmp4.py: the two round-4 spells beside their paintings -> deliver/Fox_Bell_Falls_Silent_and_Moons_Little_Lie.jpg   (stills from stills.py, see README)
from PIL import Image, ImageDraw, ImageFont
import glob, os
W = '/home/claude/fox3d/'; R = W + 'references/round4/'
if not glob.glob(R + 'J6-*.webp'): R = '/home/claude/moon-faire/models/fox-3d/references/round4/'
RH = 520; PAD = 8
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17); FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
except Exception: F = FB = ImageFont.load_default()
fit = lambda im, h: im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
paint = lambda n: (fit(Image.open(glob.glob(R + n + '-*.webp')[0]).convert('RGB'), RH), 'painting ' + n)
def still(f, t, crop):
    im = Image.open(W + 'shots/' + f).convert('RGB'); im = im.crop((int(crop[0] * im.width), int(crop[1] * im.height), int(crop[2] * im.width), int(crop[3] * im.height))); return fit(im, RH), f'model, {t} s'
rows = [('When the Bell Falls Silent', [paint('J6'), still('cmp_bs_0.png', 3.6, (0.08, 0.0, 0.92, 1.0))]),
        ("The Moon's Little Lie", [paint('J7'), still('cmp_ml_0.png', 1.3, (0.1, 0.0, 0.9, 1.0)), paint('J8'), still('cmp_mw_0.png', 3.8, (0.12, 0.0, 0.88, 1.0)), still('cmp_mw_1.png', 4.45, (0.12, 0.0, 0.88, 1.0))])]
widths = [sum(im.width for im, _ in r[1]) + PAD * (len(r[1]) - 1) for r in rows]; TW = max(widths)
S = Image.new('RGB', (TW + 2 * PAD, (RH + 70) * len(rows) + PAD), (24, 20, 30)); d = ImageDraw.Draw(S); y = PAD
for (name, items), wd in zip(rows, widths):
    d.text((PAD, y + 4), name, fill=(255, 226, 150), font=FB); y += 36; x = PAD
    for im, lab in items: S.paste(im, (x, y)); d.text((x + 4, y + RH + 3), lab, fill=(225, 225, 235), font=F); x += im.width + PAD
    y += RH + 30
S.crop((0, 0, S.width, y + PAD)).save(W + 'deliver/Fox_Bell_Falls_Silent_and_Moons_Little_Lie.jpg', quality=88); print(S.size)
