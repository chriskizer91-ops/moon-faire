# Makes Io's 14 reference images (models/io-3d/references/starters/) from files already in the repo.
# Run from the repo root:  python3 models/io-3d/references/prompts/make_starters.py <folder holding the four Jester style guides and IO4>
# The style guides are on branch claude/jester-3d-model: models/jester-3d/references/chatgpt/05_base_front_back.webp,
# chatgpt/08_face_front.webp, hands/hands_young_left.webp, boots/boot_side_a.webp. IO4 is the pixel painting of Io that
# Chris sent on November 13, 2026 (kept here as starters/IO4_io_envoi_picture.jpg; there is no other copy in the repo).
import json, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
SRC = sys.argv[1]
R = 'art-pipeline/smoothing-pack/reference/'
A = 'assets/'
OUT = 'models/io-3d/references/starters/'
os.makedirs(OUT, exist_ok=True)

def save(im, name, q=90):
    im.convert('RGB').save(OUT + name, quality=q, optimize=True, subsampling=0 if q >= 92 else 2)

def up(im, box, scale):  # an enlarged, lightly sharpened piece of a picture
    c = im.crop(box)
    c = c.resize((int(c.width * scale), int(c.height * scale)), Image.LANCZOS)
    return c.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))

p = Image.open(R + 'herbal_witch_portrait_ref.png')
s = Image.open(R + 'herbal_witch_sheet_ref.png')
m = Image.open(R + 'herbal_witch_moves_sheet.png')
save(p, 'IO1_io_painting.jpg', 93)
save(s, 'IO2_io_character_sheet.jpg', 93)
save(m, 'IO3_io_sprite_sheet.jpg', 92)
if os.path.exists(os.path.join(SRC, 'io_envoi_picture.png')):
    save(Image.open(os.path.join(SRC, 'io_envoi_picture.png')), 'IO4_io_envoi_picture.jpg', 93)
save(up(p, (60, 130, 640, 570), 2.4), 'IO5_closeup_hat_and_face.jpg')
save(up(p, (150, 500, 740, 1150), 2.2), 'IO6_closeup_necklaces_pouch_crystal_book.jpg')
a, b = up(s, (20, 400, 470, 790), 2.6), up(m, (0, 20, 370, 350), 3.3)
h = max(a.height, b.height)
a = a.resize((int(a.width * h / a.height), h), Image.LANCZOS)
b = b.resize((int(b.width * h / b.height), h), Image.LANCZOS)
col = Image.new('RGB', (a.width + b.width + 24, h), (0x3B, 0x2F, 0x43))
col.paste(a, (0, 0)); col.paste(b, (a.width + 24, 0))
save(col, 'IO7_closeup_skirt_and_boots.jpg')
for src, name in (('05_base_front_back', 'S1_style_jester_standing.jpg'), ('08_face_front', 'S2_style_jester_face.jpg'),
                  ('hands_young_left', 'S3_style_jester_hands.jpg'), ('boot_side_a', 'S4_style_jester_boot.jpg')):
    f = os.path.join(SRC, src + '.webp')
    if os.path.exists(f):
        save(Image.open(f), name, 92)

# the flipbook strips: every frame of a move on its anchor, numbered, on the flipbook's stage colour
clips = json.load(open(A + 'manifest.json'))['characters']['herbal_witch']['clips']
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except OSError:
    font = ImageFont.load_default()

def strip(clip, name, cols, scale):
    fr = clips[clip]['frames']
    ims = [Image.open(A + f['hd']).convert('RGBA') for f in fr]
    L = max(f['anchorX'] for f in fr); Rr = max(im.width - f['anchorX'] for im, f in zip(ims, fr))
    T = max(f['anchorY'] for f in fr); B = max(im.height - f['anchorY'] for im, f in zip(ims, fr))
    pad = 10; cw = int(L + Rr) + 2 * pad; ch = int(T + B) + 2 * pad + 18
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cw * cols, ch * rows), (0x38, 0x30, 0x43))
    for i, (im, f) in enumerate(zip(ims, fr)):
        sheet.paste(im, ((i % cols) * cw + int(L - f['anchorX']) + pad, (i // cols) * ch + int(T - f['anchorY']) + pad), im)
    sheet = sheet.resize((int(sheet.width * scale), int(sheet.height * scale)), Image.LANCZOS)
    d = ImageDraw.Draw(sheet)
    for i in range(len(ims)):
        d.text((int(((i % cols) * cw + 8) * scale), int(((i // cols) * ch + 6) * scale)), str(i + 1), fill=(150, 135, 170), font=font)
    save(sheet, name, 88)

strip('harvest_crescent', 'IO8_flipbook_harvest_crescent.jpg', 6, 1.35)
strip('silverleaf_salve', 'IO9_flipbook_silverleaf_salve.jpg', 6, 1.35)
strip('elderwood_guardian', 'IO10_flipbook_elderwood_guardian.jpg', 6, 1.2)
print('wrote', sorted(os.listdir(OUT)))
