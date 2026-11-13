# usage: strip.py move 'az,el[;az,el...]' dist targetY t1 t2 ...    stills of one move at chosen seconds, one row per camera angle -> shots/strip_<move>.jpg
# Stills only: the test machine draws about two frames a second, so how a move flows cannot be judged here.
import sys, subprocess, os
from PIL import Image, ImageDraw
mv, views, dist, ty = sys.argv[1], [v.split(',') for v in sys.argv[2].split(';')], float(sys.argv[3]), float(sys.argv[4]); ts = [float(x) for x in sys.argv[5:]]
W, H = 300, 440
js = [f"T.clean('color'); T.stage.orbit.target.set(0, 0, 0); T.j.stop(); T.st('', 0.5); T.step(30, 1/60); T.j.play('{mv}', true); S.t = 0; S.to = (t) => {{ const n = Math.round((t - S.t) * 60); for (let i = 0; i < n; i++) {{ T.time += 1/60; T.j.animate(T.phase, T.wb, T.time, 1/60, T.rb); T.j.root.rotation.y = (T.yaw || 0) + T.j.spin; }} S.t += n / 60; }};"]
for i, t in enumerate(ts):
    js.append(f"S.to({t});")
    for k, (az, el) in enumerate(views):
        js.append(f"T.view({az}, {el}, {dist}, {ty}, 22, {W}, {H});\n//SHOT {k}_{i:02d}")
open('/home/claude/fox3d/bench/_strip.js', 'w').write('\n'.join(js) + '\n')
pre = f'/home/claude/fox3d/shots/st_{mv}'
r = subprocess.run(['python3', '/home/claude/fox3d/bench.py', '/home/claude/fox3d/bench/_strip.js', pre], capture_output=True, text=True, timeout=900)
if r.returncode: print(r.stdout[-800:], r.stderr[-1500:]); sys.exit(1)
S = Image.new('RGB', (W * len(ts), (H + 16) * len(views)), '#111'); d = ImageDraw.Draw(S)
for k in range(len(views)):
    for i, t in enumerate(ts):
        S.paste(Image.open(f'{pre}_{k}_{i:02d}.png').convert('RGB').crop((0, 0, W, H)), (i * W, k * (H + 16) + 16)); d.text((i * W + 4, k * (H + 16) + 2), f'{t:.2f} s', fill='#ddd')
S.save(f'/home/claude/fox3d/shots/strip_{mv}.jpg', quality=86); print(S.size)
