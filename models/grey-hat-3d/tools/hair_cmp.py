# His hair beside the painting it was measured from (C4), at one scale: 2000 px to the metre, seen from far off so nothing is foreshortened.
# usage: python3 -I tools/hair_cmp.py out_prefix ['JS to run first']
# Writes out_prefix_front.png and out_prefix_side.png (painting left, model right, same heights on the same rows, lines every 5 cm)
# and prints the outline of each: half-widths from the front, how far back the hair reaches from the side.
import os, sys, subprocess, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(ROOT, 'tools'))
from PIL import Image, ImageDraw
from sil import load, mask_of
out = sys.argv[1]; setup = sys.argv[2] if len(sys.argv) > 2 else ''
PPM, TY, W, H = 2000.0, 1.60, 700, 900
FOV = 2 * np.degrees(np.arctan((H / PPM / 2) / 8.0))
def shoot(tag, mode, az):
    subprocess.run(['python3', os.path.join(ROOT, 'shoot.py'), out + '_' + tag, "T.clean('%s'); %s" % (mode, setup), 'v:%f,0,8,%f,%f,%d,%d' % (az, TY, FOV, W, H)], check=True, stdout=subprocess.DEVNULL)
    return np.asarray(Image.open(out + '_' + tag + '_v.png').convert('RGB')).astype(int)
def green(a): return ~((a[..., 1] > 200) & (a[..., 0] < 60) & (a[..., 2] < 60))
row = lambda y: int(round(H / 2 - (y - TY) * PPM))
c4 = load(os.path.join(ROOT, 'refs', 'C4.png')); m4, _ = mask_of(c4)
R_EYE, R_TIP = 1.660, 0.096
# ---- front ----
mf = green(shoot('fm', 'mask', 0)); pf = shoot('fp', 'nodust', 0)
print('front: half-width of the outline, his right / his left (m)')
print('  height   C4            model')
for y in np.arange(1.78, 1.45, -0.02):
    r4 = int(round(351 - (y - R_EYE) * PPM)); x4 = np.where(m4[r4, :520])[0]; xm = np.where(mf[row(y)])[0]
    a = '%.3f %.3f' % ((274.5 - x4.min()) / PPM, (x4.max() - 274.5) / PPM) if len(x4) else '  -     -  '
    b = '%.3f %.3f' % ((xm.max() - W / 2) / PPM, (W / 2 - xm.min()) / PPM) if len(xm) else '  -     -  '      # the camera faces him: his right is on its left... the picture is not flipped, so his right is at small x
    if len(xm): b = '%.3f %.3f' % ((W / 2 - xm.min()) / PPM, (xm.max() - W / 2) / PPM)
    print('  %.2f     %s   %s' % (y, a, b))
cm = np.where(mf[:, W // 2 - 3:W // 2 + 3].any(1))[0]; print('  top of his hair: C4 1.778, model %.3f' % (TY + (H / 2 - cm.min()) / PPM))
def pair(paint, model, name, y4, x4c):
    im = Image.new('RGB', (W * 2, H), (56, 48, 67)); src = Image.open(os.path.join(ROOT, 'refs', 'C4.png')).convert('RGB')
    top4 = int(round(y4 - (TY + H / 2 / PPM - R_EYE) * PPM)); im.paste(src.crop((x4c - W // 2, top4, x4c + W // 2, top4 + H)), (0, 0)); im.paste(Image.fromarray(model.astype('uint8')), (W, 0))
    d = ImageDraw.Draw(im)
    for yy in np.arange(1.40, 1.81, 0.05): d.line([(0, row(yy)), (W * 2, row(yy))], fill=(90, 200, 90)); d.text((4, row(yy) + 2), '%.2f' % yy, fill=(255, 255, 0))
    im.save(out + '_' + name + '.png')
pair(c4, pf, 'front', 351, 274)
# ---- his right side (he faces right, as in C4) ----
ms = green(shoot('sm', 'mask', -np.pi / 2)); ps = shoot('sp', 'nodust', -np.pi / 2)
print('side: how far back the outline reaches (z, forward positive; m)')
print('  height   C4       model')
for y in np.arange(1.78, 1.39, -0.02):
    r4 = int(round(352 - (y - R_EYE) * PPM)); x4 = np.where(m4[r4, 1013:])[0]; xm = np.where(ms[row(y)])[0]
    print('  %.2f     %s   %s' % (y, '%.3f' % (R_TIP + (x4.min() + 1013 - 1500) / PPM) if len(x4) else '  -  ', '%.3f' % ((xm.min() - W / 2) / PPM) if len(xm) else '  -  '))
rr = np.where(ms.any(1))[0]; print('  top of his hair: C4 1.779, model %.3f' % (TY + (H / 2 - rr.min()) / PPM))
pair(c4, ps, 'side', 352, 1500 - int(R_TIP * PPM) + 0)
