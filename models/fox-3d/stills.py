# usage: stills.py move out_prefix 'az,el,dist,targetY,targetX,w,h' t1 t2 ...   one still of a move at each chosen second, at any size -> <out_prefix>_<i>.png
# env PRE: a file of js to run before the move starts (bench/dummy.js stands a practice dummy to her left and has her aim at it)
import sys, subprocess, os
mv, out = sys.argv[1], sys.argv[2]; az, el, dist, ty, ox, w, h = [float(x) for x in sys.argv[3].split(',')]; ts = [float(x) for x in sys.argv[4:]]
PRE = open(os.environ['PRE']).read() if os.environ.get('PRE') else ''
js = [f"T.clean('color'); T.stage.orbit.target.set({ox}, 0, 0); T.j.stop(); T.st('', 0.5); T.step(30, 1/60); " + PRE + f" T.j.play('{mv}', true); S.t = 0; S.to = (t) => {{ const n = Math.round((t - S.t) * 60); for (let i = 0; i < n; i++) {{ T.time += 1/60; T.j.animate(T.phase, T.wb, T.time, 1/60, T.rb); T.j.root.rotation.y = (T.yaw || 0) + T.j.spin; }} S.t += n / 60; }}; T.view({az}, {el}, {dist}, {ty}, 22, {int(w)}, {int(h)});"]
for i, t in enumerate(ts): js.append(f"S.to({t}); T.view({az}, {el}, {dist}, {ty}, 22, {int(w)}, {int(h)});\n//SHOT {i}")
open('/home/claude/fox3d/bench/_stills.js', 'w').write('\n'.join(js) + '\n')
r = subprocess.run(['python3', '/home/claude/fox3d/bench.py', '/home/claude/fox3d/bench/_stills.js', out], capture_output=True, text=True, timeout=1500)
print(r.stdout[-300:], r.stderr[-600:] if r.returncode else '', 'ok' if not r.returncode else 'FAILED')
