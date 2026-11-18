# flip_hand.py src out : a right-hand painting (back view left, palm view right) as a left hand in the same layout, for hand_measure.py and hand_marks.py
import sys
from PIL import Image
d = Image.open(sys.argv[1]).convert('RGB').transpose(Image.FLIP_LEFT_RIGHT); W, H = d.size; h = W // 2
o = Image.new('RGB', (W, H)); o.paste(d.crop((h, 0, W, H)), (0, 0)); o.paste(d.crop((0, 0, h, H)), (W - h, 0)); o.save(sys.argv[2]); print(sys.argv[2], o.size)
