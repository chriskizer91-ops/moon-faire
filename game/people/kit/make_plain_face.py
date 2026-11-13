# Makes the template's plain face from the Jester's baked face painting: her jester make-up (the black tear lines under
# each eye, the winged liner, the mark of her cap on the forehead) is painted out, so a new person starts from bare skin.
# Run once from game/people: python3 kit/make_plain_face.py   (needs opencv-python, numpy, Pillow)
import base64, io, json, os
import cv2, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(HERE, '../../models/jester/jester_tex.js'), encoding='utf-8').read()
T = json.loads(s[s.index('{'):s.rindex('}') + 1])
im = np.array(Image.open(io.BytesIO(base64.b64decode(T['face'].split(',')[1]))).convert('RGB'))[:, :, ::-1].copy()
H, W = im.shape[:2]
mask = np.zeros((H, W), np.uint8)
grey = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
soft = cv2.GaussianBlur(grey, (0, 0), 14)
dark = (soft - grey) > 16                                     # ink: much darker than the skin round it
def region(x0, y0, x1, y1, only_dark=True):
    m = np.zeros((H, W), bool); m[y0:y1, x0:x1] = True
    return (m & dark) if only_dark else m
ink = region(196, 352, 420, 462) | region(610, 352, 836, 462)             # the tear lines on both cheeks
ink |= region(212, 286, 296, 346) | region(728, 286, 812, 346)            # the wings of the liner
mask[ink] = 255
mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
mask[20:140, 470:566] = 255                                               # the cap's mark on the forehead
out = cv2.inpaint(im, mask, 9, cv2.INPAINT_TELEA)
# soften what was filled, so no edge of the patch shows
blur = cv2.GaussianBlur(out, (0, 0), 3); a = cv2.GaussianBlur(mask, (0, 0), 4).astype(np.float32)[:, :, None] / 255
out = (out * (1 - a) + blur * a).astype(np.uint8)
Image.fromarray(out[:, :, ::-1]).save(os.path.join(HERE, 'face_plain.webp'), quality=92, method=6)
Image.fromarray(np.hstack([im, out])[:, :, ::-1]).save('/tmp/face_before_after.jpg', quality=85)
print('face_plain.webp', os.path.getsize(os.path.join(HERE, 'face_plain.webp')) // 1024, 'KB')
