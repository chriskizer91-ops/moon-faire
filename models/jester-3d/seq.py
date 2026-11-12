# stills of one move at chosen moments, joined into a sheet. usage: seq.py name move "t1 t2 ..." [size] [pre-js] [cols]
import sys, subprocess
from PIL import Image
name, move, times = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3].split()]
size = sys.argv[4] if len(sys.argv) > 4 else '390x800'; pre = sys.argv[5] if len(sys.argv) > 5 else ''; cols = int(sys.argv[6]) if len(sys.argv) > 6 else 5
steps = []
if pre: steps.append('=' + pre)
steps.append('=P.setMove("%s")' % move if move else '=0')
t = 0
for i, x in enumerate(times):
    n = max(1, round((x - t) * 30)); t += n / 30
    steps.append('s%02d=P.step(%d,1/30)' % (i, n))
r = subprocess.run(['python3', 'shoot_page.py', 'shots/' + name, size] + steps, capture_output=True, text=True)
print(r.stdout[-1500:], r.stderr[-800:])
ims = [Image.open('shots/%s_s%02d.png' % (name, i)).convert('RGB') for i in range(len(times))]
w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows), (20, 16, 26))
for i, im in enumerate(ims): S.paste(im, ((i % cols) * w, (i // cols) * h))
if S.width > 1900: S = S.resize((1900, int(S.height * 1900 / S.width)), Image.LANCZOS)
S.save('shots/%s_sheet.png' % name); print('shots/%s_sheet.png' % name, S.size)
