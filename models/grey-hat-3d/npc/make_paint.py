# His light version's two paint pictures, made the way the fair folk kit's prep_skin.py makes them from a painter's pictures:
#   npc/body.webp  his finished model drawn flat-on (npc/sheet.py), with the colours at the figure's edge spread out over the grey,
#                  so a point of the light model that falls a little outside his outline still gets cloth, not grey. The face on the
#                  front figure is painted out (the head wears its own face picture; hair round the face would pick it up)
#   npc/face.webp  his face painting C1, moved so his eyes and mouth sit where the template's face expects them
#                  (eyes at 356 and 668 across, 309 down; mouth 652 down)
#   python3 -I npc/make_paint.py <folder with sheet.png>
import sys, os, json
import numpy as np, cv2
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); NPC = os.path.join(ROOT, 'npc')
rgb = np.array(Image.open(os.path.join(sys.argv[1], 'sheet.png')).convert('RGB')); h, w = rgb.shape[:2]
fig = np.abs(rgb.astype(int) - 0x6e).sum(2) > 12
fig = ndimage.binary_fill_holes(ndimage.binary_opening(fig, iterations=1))
# the face on the front figure, x 0, y 1.445 to 1.615 m, 0.15 m wide (prep_skin.py's ellipse)
hw = w // 2; cx, cy = 0.5 * hw, (1 - (1.53 + 0.1) / 2.0) * h; rx, ry = 0.075 / 1.5 * hw, 0.085 / 2.0 * h
hole = np.zeros((h, w), np.uint8); cv2.ellipse(hole, (int(round(cx)), int(round(cy))), (int(round(rx)), int(round(ry))), 0, 0, 360, 255, -1)
rgb = cv2.inpaint(rgb, hole, 7, cv2.INPAINT_TELEA); out = rgb.copy()
for x0, x1 in ((0, hw), (hw, w)):
    mm = fig[:, x0:x1]; inner = ndimage.binary_erosion(mm, iterations=2); idx = ndimage.distance_transform_edt(~inner, return_distances=False, return_indices=True)
    out[:, x0:x1] = rgb[:, x0:x1][idx[0], idx[1]]
Image.fromarray(out).save(os.path.join(NPC, 'body.webp'), quality=86, method=6)
# the face: C1 has his pupils at (455, 512) and (815, 512) and his lips at 870 down (bake_face.py)
c1 = Image.open(os.path.join(ROOT, 'refs', 'C1.png')).convert('RGB')
kx = 312.0 / 360.0; ky = (652.0 - 309.0) / (870.0 - 512.0)
A = (1 / kx, 0, 635 - 512 / kx, 0, 1 / ky, 512 - 309 / ky)            # for each face pixel (X, Y): C1 pixel = ((X - 512)/kx + 635, (Y - 309)/ky + 512)
face = c1.transform((1024, 1024), Image.AFFINE, A, resample=Image.BICUBIC, fillcolor=(80, 60, 70))
face.save(os.path.join(NPC, 'face.webp'), quality=90, method=6)
fa = np.array(face).astype(float); skin = np.median(np.concatenate([fa[455:505, 245:305].reshape(-1, 3), fa[455:505, 720:780].reshape(-1, 3)]), 0)
hexs = '#%02x%02x%02x' % tuple(int(v) for v in skin)
json.dump({'fit': {'front': [1, 1, 0, 0], 'back': [1, 1, 0, 0]}, 'faceFit': [1, 0, 0], 'skin': hexs, 'note': 'drawn from his finished model in the guide frame, so no fit'}, open(os.path.join(NPC, 'fit.json'), 'w'))
print('body.webp, face.webp, fit.json; skin', hexs, 'face scale', round(kx, 4), round(ky, 4))
