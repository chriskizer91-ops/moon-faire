# usage: poses.py name 'js that returns { label: pose, ... }' [az] [dist] [ty]     stills of standing poses, side by side -> shots/poses_<name>.jpg
# The js may use F (finger shapes), V(x,y,z), J, X (the new magic) and solve(pose, anchorName, [x,y,z]) which moves hR until that anchor is on the point (root space).
import sys, subprocess, json, os
from PIL import Image, ImageDraw
name, js = sys.argv[1], sys.argv[2]; az = float(sys.argv[3]) if len(sys.argv) > 3 else -1.2; dist = float(sys.argv[4]) if len(sys.argv) > 4 else 7.5; ty = float(sys.argv[5]) if len(sys.argv) > 5 else 1.05
W, H = 420, 560
pre = "T.clean('color'); const J = T.j, SK = J.debug.SK, X = J.debug.fx3, V = (x, y, z) => new THREE.Vector3(x, y, z); J.stop(); T.st('', 0.3); T.step(20, 1 / 60);\n" \
      "const solve = (o, an, tg, S) => { S = S || 'R'; const t = V(tg[0], tg[1], tg[2]); let e = 0; o['h' + S] = o['h' + S].slice(); for (let i = 0; i < 60; i++) { T.pose(o); const a = T.L(J.anchor(an)); e = a.distanceTo(t); const k = 0.4; o['h' + S][0] += k * (t.x - a.x); o['h' + S][1] += k * (t.y - a.y); o['h' + S][2] += k * (t.z - a.z); } o['h' + S] = o['h' + S].map((x) => +x.toFixed(3)); o._err = +e.toFixed(3); return o; };\n" \
      "const reach = (o, S) => { T.pose(o); const sh = T.L(SK['uarm' + S].getWorldPosition(V())), hd = T.L(SK['hand' + S].getWorldPosition(V())); return +(sh.distanceTo(hd) / 0.491).toFixed(2); };\n" \
      "S.P = (() => { " + js + " })(); S.K = Object.keys(S.P); const rep = {}; for (const k of S.K) { const o = S.P[k]; rep[k] = { hR: o.hR, hL: o.hL, err: o._err, note: o._note, rR: reach(o, 'R'), rL: reach(o, 'L'), tip: o.shr ? T.r3(T.L(J.anchor('bladeA'))) : undefined }; } S.rep = rep;\n"
body = ''
n = int(os.environ.get('N', 8))
for i in range(n):
    body += f"if (S.K[{i}]) {{ const o = Object.assign({{}}, S.P[S.K[{i}]]); delete o._err; delete o._note; T.pose(o); T.stage.orbit.target.set(0, 0, 0.1); T.view({az}, 0.08, {dist}, {ty}, 22, {W}, {H}); }}\n" + ("return S.rep;\n" if i == 0 else "") + f"//SHOT {i}\n"
open('/home/claude/fox3d/bench/_poses.js', 'w').write(pre + body)
r = subprocess.run(['python3', '/home/claude/fox3d/bench.py', '/home/claude/fox3d/bench/_poses.js', f'/home/claude/fox3d/shots/ps_{name}'], capture_output=True, text=True, timeout=900)
if r.returncode: print(r.stdout[-1500:], r.stderr[-1500:]); sys.exit(1)
line = [l for l in r.stdout.splitlines() if l.startswith('{')]; rep = json.loads(line[0]) if line else {}
for k, v in rep.items(): print(k, json.dumps(v))
keys = list(rep.keys())[:n]; S = Image.new('RGB', (W * len(keys), H + 18), (20, 20, 20)); d = ImageDraw.Draw(S)
for i, k in enumerate(keys):
    S.paste(Image.open(f'/home/claude/fox3d/shots/ps_{name}_{i}.png').convert('RGB').resize((W, H)), (i * W, 18)); d.text((i * W + 6, 3), k, fill=(255, 255, 255))
S.save(f'/home/claude/fox3d/shots/poses_{name}.jpg', quality=88); print(f'shots/poses_{name}.jpg', S.size)
