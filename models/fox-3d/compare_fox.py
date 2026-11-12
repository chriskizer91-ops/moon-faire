# Lays the model beside her paintings at one scale, soles on one line, with lines at the heights measured off the paintings.
# usage: python3 -I compare_fox.py   (after shoot2.py has written shots/cmp_front.png and shots/cmp_side.png; see the README)
from PIL import Image, ImageDraw, ImageFont
S = 452.29                                  # the render's pixels a metre: its row for a height h is 450 - (h - 0.90) * S
def row(h): return 450 - (h - 0.90) * S
m = Image.open('shots/cmp_front.png').convert('RGB'); ms = Image.open('shots/cmp_side.png').convert('RGB')
def fit(path, box, scale_src, sole_row):
    im = Image.open(path).convert('RGB').crop(box); k = S / scale_src
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS), (sole_row - box[1]) * k
a1, a1s = fit('refs/A1.png', (150, 0, 874, 1536), 861.0, 1500)
b4, b4s = fit('refs/B4.png', (120, 0, 530, 1024), 851.0, 970)
b4b, b4bs = fit('refs/B4.png', (610, 0, 930, 1024), 851.0, 970)
parts = [('Painting A1', a1, a1s), ('Model', m.crop((150, 0, 550, 900)), None), ('Painting B4', b4, b4s), ('Model, side', ms.crop((190, 0, 510, 900)), None), ('Painting B4, side', b4b, b4bs)]
W = sum(p[1].width for p in parts) + 12 * (len(parts) + 1); H = 940
sh = Image.new('RGB', (W, H), (56, 48, 67)); d = ImageDraw.Draw(sh); x = 12; base = int(row(0))
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception: f = ImageFont.load_default()
for name, im, sole in parts:
    sh.paste(im, (x, 0 if sole is None else int(base - sole))); d.text((x + 6, H - 34), name, font=f, fill=(214, 168, 78)); x += im.width + 12
for h, lab in [(0.2585, 'boot top'), (0.505, 'knee'), (0.832, 'crotch'), (1.12, 'waist'), (1.394, 'shoulder'), (1.463, 'chin')]:
    d.line([(0, row(h)), (W, row(h))], fill=(0, 200, 120)); d.text((4, row(h) - 16), lab, fill=(150, 255, 200))
sh.save('deliver/Fox_pass1_compare.png'); print(sh.size)
