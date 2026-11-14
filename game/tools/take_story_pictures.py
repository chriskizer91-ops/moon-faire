# Takes Chris's story pictures into the game (November 14). Run from game/: python3 tools/take_story_pictures.py <folder with the unzipped pictures>
# - Fight places F2..F5 -> art/fights/, story pictures S1..S4 and the title T1 -> art/story/, the item sheet -> art/items/ and cut into six cards.
# - The two changed paintings come back from the painter redrawn all over (edges a pixel off, small differences everywhere), so the game's
#   versions are made here: the ORIGINAL painting, with the changed one let through only where the new light is. Feet, walls and the traced
#   walking shapes stay exactly as in the original, and the game can fade from one to the other without anything else moving.
import glob, os, shutil, sys
import numpy as np
from PIL import Image, ImageFilter
SRC = sys.argv[1]; G = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A = lambda *p: os.path.join(G, 'art', *p)
find = lambda n: [f for f in glob.glob(os.path.join(SRC, '**', n), recursive=True)][0]
for n in ('F2', 'F3', 'F4', 'F5'): shutil.copy(find(n + '.png'), A('fights', n + '.png'))
for n in ('S1', 'S2', 'S3', 'S4', 'T1'): shutil.copy(find(n + '.png'), A('story', n + '.png'))
sheet = Image.open(find('I1.png')).convert('RGB'); sheet.save(A('items', 'items.png')); w, h = sheet.width // 3, sheet.height // 2
ITEMS = ['cold-lantern-glass', 'cut-thread', 'warm-stone', 'hollow-amulet', 'keepers-charm', 'ship-lamp']      # left to right, top row first, as the prompt asked
for i, n in enumerate(ITEMS): sheet.crop(((i % 3) * w, (i // 3) * h, (i % 3 + 1) * w, (i // 3 + 1) * h)).save(A('items', n + '.png'))
# name, original, how far the redrawn painting sits from the original (dx, dy), and the windows where the new light is (x0, y0, x1, y1 as shares of the picture)
EDITS = [('W9-thirteen-lights', 'W9', (1, 1), [(0.47, 0.0, 0.88, 0.40), (0.02, 0.11, 0.17, 0.23)]), ('W4-both-lit', 'W4', (0, 0), [(0.79, 0.14, 0.94, 0.58)])]
for new, old, (dx, dy), wins in EDITS:
    shutil.copy(find(new + '.png'), A('world', 'as-sent', new + '.png'))
    b = np.asarray(Image.open(A('world', old + '.png')).convert('RGB')).astype(np.float32); a = np.roll(np.roll(np.asarray(Image.open(find(new + '.png')).convert('RGB')).astype(np.float32), dy, 0), dx, 1); H, W_ = b.shape[:2]
    d = np.asarray(Image.fromarray(np.clip(np.abs(a - b).sum(2) / 3, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(10))).astype(np.float32)
    m = np.clip((d - 5) / 9, 0, 1); win = np.zeros((H, W_), np.float32)
    for x0, y0, x1, y1 in wins: win[int(y0 * H):int(y1 * H), int(x0 * W_):int(x1 * W_)] = 1
    win = np.asarray(Image.fromarray((win * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(14))).astype(np.float32) / 255
    m = np.asarray(Image.fromarray((np.clip(m * win, 0, 1) * 255).astype('uint8')).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(8))).astype(np.float32)[..., None] / 255
    out = b + (a - b) * m; Image.fromarray(np.clip(out + 0.5, 0, 255).astype('uint8')).save(A('world', new + '.png'))
    print(new, 'let through %.1f%% of the picture; elsewhere it is the original' % (100 * (m[..., 0] > 0.02).mean()), 'changed pixels outside: %d' % int((np.abs(out - b).sum(2)[m[..., 0] <= 0.0] > 0).sum()))
print('fights', sorted(os.listdir(A('fights'))), 'story', sorted(os.listdir(A('story'))), 'items', sorted(os.listdir(A('items'))))
