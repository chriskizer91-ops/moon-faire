# sheets.py: contact sheets for looking through pictures quickly: four to a sheet, each with its name under it.   python3 sheets.py <folder of pictures> <folder for sheets>
import sys, os, glob, json
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
names = sorted(glob.glob(os.path.join(src, '*.png'))); font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
W, H, CAP = 960, 540, 34
for i in range(0, len(names), 4):
    S = Image.new('RGB', (W * 2, (H + CAP) * 2), (20, 16, 26)); d = ImageDraw.Draw(S)
    for j, n in enumerate(names[i:i + 4]):
        x, y = (j % 2) * W, (j // 2) * (H + CAP); S.paste(Image.open(n).convert('RGB').resize((W, H), Image.LANCZOS), (x, y)); d.text((x + 10, y + H + 4), os.path.basename(n)[:-4], fill=(255, 236, 200), font=font)
        d.rectangle([x, y, x + W - 1, y + H - 1], outline=(90, 80, 110))
    S.save(os.path.join(dst, 'sheet_%02d.jpg' % (i // 4 + 1)), quality=88)
print(len(names), 'pictures on', (len(names) + 3) // 4, 'sheets')
