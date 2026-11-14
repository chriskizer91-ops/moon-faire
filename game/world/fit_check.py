# Draws each place's grey-box guide as bright outlines over Chris's painting of it, to show how closely the painting kept the layout
# (the walkable ground, the big shapes and the 1.70 m figure). Writes world/scenes/<id>_fit.jpg. Run from game/: python3 world/fit_check.py
import glob, os
import numpy as np
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..')
for f in sorted(glob.glob(os.path.join(G, 'art', 'world', 'W[0-9].png'))):
    sid = os.path.basename(f)[:-4]; a = Image.open(f).convert('RGB'); g = Image.open(os.path.join(HERE, 'scenes', sid + '_guide.png')).convert('RGB').resize(a.size, Image.LANCZOS)
    e = np.asarray(g.convert('L').filter(ImageFilter.FIND_EDGES)).astype(float); e[:2] = e[-2:] = 0; e[:, :2] = e[:, -2:] = 0
    m = Image.fromarray(np.clip(e * 6, 0, 255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).point(lambda v: int(v * 0.85))
    Image.composite(Image.new('RGB', a.size, (120, 255, 200)), a, m).resize((1400, 700), Image.LANCZOS).save(os.path.join(HERE, 'scenes', sid + '_fit.jpg'), quality=80); print(sid)
for f in sorted(glob.glob(os.path.join(G, 'art', 'fights', 'F*.png'))):      # the fight places, against their guides (world/pictures/). Only strong edges: the guide's sky is a soft gradient
    fid = os.path.basename(f)[:-4]; a = Image.open(f).convert('RGB'); g = Image.open(os.path.join(HERE, 'pictures', fid + '_guide.png')).convert('RGB')
    # edges at the guide's own size and on each colour, so a dark tower against a dark sky still shows; a median first flattens the sky's soft steps
    GA = np.asarray(g.filter(ImageFilter.MedianFilter(5))).astype(float); e = np.zeros(GA.shape[:2])
    for c in range(3): ch = GA[..., c]; e = np.maximum(e, np.abs(np.roll(ch, 1, 0) - np.roll(ch, -1, 0)) + np.abs(np.roll(ch, 1, 1) - np.roll(ch, -1, 1)))
    e[:3] = e[-3:] = 0; e[:, :3] = e[:, -3:] = 0
    m = Image.fromarray(((e > 8) * 215).astype('uint8')).resize(a.size, Image.LANCZOS).filter(ImageFilter.MaxFilter(3))
    Image.composite(Image.new('RGB', a.size, (120, 255, 200)), a, m).save(os.path.join(HERE, 'pictures', fid + '_fit.jpg'), quality=82); print(fid)
