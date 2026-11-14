# His walk and stance by numbers (the headless browser is too slow to watch him move): steps the model's clock through one stride.
# usage: python3 tools/walk_check.py [frames per stride, default 48]
# He walks on the spot: the ground passes back under him at walkSpeed. A planted point of a boot must go back with the ground exactly,
# so "slide" is how far it moved over the ground between two frames (mm), and "high" how far it is off the ground (mm).
# The planted point is the heel's back edge while the foot stands on its heel or flat, and the toe's tip while it is flat or the heel is up.
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); N = int(sys.argv[1]) if len(sys.argv) > 1 else 48
JS = r"""
((N) => { const j = T.j, SK = j.SK, G = j.debug.gait, V = (x, y, z) => new THREE.Vector3(x, y, z), rows = [];
  const at = (bone, x, y, z) => V(x, y, z).sub(SK[bone].userData.rest).applyMatrix4(SK[bone].matrixWorld);
  const ang = (a, b, c) => { const u = a.clone().sub(b).normalize(), v = c.clone().sub(b).normalize(); return Math.acos(Math.max(-1, Math.min(1, u.dot(v)))) * 180 / Math.PI; };
  const wp = (b) => V().setFromMatrixPosition(SK[b].matrixWorld);
  j.play('walk', true); const dt = j.strideTime / N, SUB = Math.ceil(dt / 0.04), tick = () => { for (let k = 0; k < SUB; k++) j.animate(dt / SUB); }; for (let i = 0; i < 3 * N; i++) tick();
  const bm = j.debug.meshes.projBoots, bp = bm.geometry.attributes.position, pick = { R: { heel: [], tip: [] }, L: { heel: [], tip: [] } }, tv = V();
  for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i); if (y > 0.003) continue; const S = x < 0 ? 'R' : 'L'; if (z < -0.095) pick[S].heel.push(i); else if (z > 0.150) pick[S].tip.push(i); }
  const soleIx = [...new Set(bm.geometry.index.array)].filter((i) => bp.getY(i) < 0.04), skinLow = () => { let lo = 9; for (const i of soleIx) { bm.boneTransform(i, tv.fromBufferAttribute(bp, i)); if (tv.y < lo) lo = tv.y; } return lo; };
  const skinAt = (list) => { const c = V(); for (const i of list) { bm.boneTransform(i, tv.fromBufferAttribute(bp, i)); c.add(tv); } return c.multiplyScalar(1 / list.length).toArray(); };
  for (let i = 0; i <= N; i++) { if (i) tick(); const yawOf = (a, b) => { const d = wp(b).sub(wp(a)); return Math.atan2(-d.z, d.x) * 180 / Math.PI; }, hm = SK.head.matrixWorld.elements; const r = { skinLow: skinLow(), yawH: yawOf('thighR', 'thighL'), yawS: yawOf('uarmR', 'uarmL'), yawHead: Math.atan2(hm[8], hm[10]) * 180 / Math.PI, tiltHead: Math.asin(Math.max(-1, Math.min(1, hm[1]))) * 180 / Math.PI, q: G.q, hipY: SK.hips.position.y, hipX: SK.hips.position.x, head: at('head', 0, 1.66, 0.09).toArray() };
    for (const [S, s] of [['R', -1], ['L', 1]]) { const heel = at('foot' + S, s * 0.184, 0, -0.1126), tip = at('toe' + S, s * 0.184, 0, 0.169), ball = at('foot' + S, s * 0.184, 0, 0.075), lows = [];
      for (const z of [-0.1126, -0.05, 0.02, 0.075]) for (const x of [0.12, 0.184, 0.25]) lows.push(at('foot' + S, s * x, 0, z).y); for (const z of [0.075, 0.12, 0.169]) for (const x of [0.12, 0.184, 0.25]) lows.push(at('toe' + S, s * x, 0, z).y);
      r[S] = { mheel: skinAt(pick[S].heel), mtip: skinAt(pick[S].tip), nh: pick[S].heel.length, nt: pick[S].tip.length, down: G.down[S], pitch: G.pitch[S], knee: 180 - ang(wp('thigh' + S), wp('shin' + S), wp('foot' + S)), heel: heel.toArray(), tip: tip.toArray(), low: Math.min.apply(null, lows), ank: wp('foot' + S).toArray(),
        shin: Math.atan2(wp('foot' + S).z - wp('shin' + S).z, wp('shin' + S).y - wp('foot' + S).y) * 180 / Math.PI, bend: -SK['toe' + S].rotation.x * 180 / Math.PI, handZ: wp('hand' + S).z, handX: wp('hand' + S).x }; }
    rows.push(r); }
  // standing: the same skin points of both boots over 24 seconds of idle and of talk, and through the change from idle to walk and back
  const still = {}; for (const name of ['idle', 'talk']) { j.play(name, true); const P = []; for (let i = 0; i < 480; i++) { j.animate(0.05); const o = []; for (const S of ['R', 'L']) o.push(skinAt(pick[S].heel), skinAt(pick[S].tip)); P.push(o); }
    let worst = 0, up = 0; for (let k = 0; k < 4; k++) for (const q of P) { worst = Math.max(worst, Math.hypot(q[k][0] - P[0][k][0], q[k][2] - P[0][k][2])); up = Math.max(up, Math.abs(q[k][1])); } still[name] = [worst * 1000, up * 1000]; }
  const kn = []; j.play('idle', true); for (let i = 0; i < 480; i++) { j.animate(0.05); kn.push(G.knee.R, G.knee.L); }
  return { rows, speed: j.walkSpeed, T: j.strideTime, L: j.stride, still, kneeMin: Math.min.apply(null, kn) * 57.2958, kneeMax: Math.max.apply(null, kn) * 57.2958, del: j.debug.LEG.R.del * 57.2958 }; })
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    R = pg.evaluate(JS + '(%d)' % N); b.close()
rows, v, T, L = R['rows'], R['speed'], R['T'], R['L']; dt = T / N
print('stride %.2f m in %.2f s: %.3f m/s; %d frames a stride (%.1f ms apart); the ground passes %.1f mm a frame' % (L, T, v, N, dt * 1000, v * dt * 1000))
print('\n q     hips: up  side | R: on  heel-up knee  shin  ankle bend  low | L: on  heel-up knee  shin  ankle bend  low   (degrees; up, side, low in mm; ankle: + toes down from the shin)')
step = max(1, N // 24)
for i in range(0, N + 1, step):
    r = rows[i]; s = ' %.3f     %5.1f %5.1f |' % (r['q'], (r['hipY'] - 0.95) * 1000, r['hipX'] * 1000)
    for S in 'RL':
        f = r[S]; pd = f['pitch'] * 57.2958; s += '    %s  %6.1f %5.1f %5.1f %5.1f %5.1f %5.1f |' % ('#' if f['down'] else '.', pd, f['knee'], f['shin'], pd + f['shin'], f['bend'], f['low'] * 1000)
    print(s)
worst_all = 0
# slide of the planted points, measured twice: on the bones (a point fixed to the foot or toe bone) and on the boot's own skin
# (the middle of the sole's points at the heel's back edge and at the toe's tip, moved as the graphics card moves them)
for title, kh, kt in (('on the bones', 'heel', 'tip'), ("on the boot's skin", 'mheel', 'mtip')):
    print('\nfoot slide over the ground between frames, while planted, %s (mm)' % title)
    print(' foot  point   frames   worst slide   mean slide   total drift   highest off ground   deepest in ground')
    for S in 'RL':
        for name, cond in (('heel', lambda f: f['down'] and f['pitch'] <= 1e-6), ('toe tip', lambda f: f['down'] and f['pitch'] >= -1e-6)):
            key = kh if name == 'heel' else kt; sl = []; hi = []; drift = [0.0, 0.0]
            for i in range(1, N + 1):
                a, c = rows[i - 1][S], rows[i][S]
                if cond(a) and cond(c):
                    dx = c[key][0] - a[key][0]; dz = c[key][2] - a[key][2] + v * dt; sl.append((dx * dx + dz * dz) ** 0.5 * 1000); hi.append(c[key][1] * 1000); hi.append(a[key][1] * 1000); drift[0] += dx; drift[1] += dz
            if sl: worst_all = max(worst_all, max(sl)); print('  %s    %-7s  %3d      %6.3f        %6.3f       %6.3f         %6.2f               %6.2f' % (S, name, len(sl), max(sl), sum(sl) / len(sl), (drift[0] ** 2 + drift[1] ** 2) ** 0.5 * 1000, max(hi), min(hi)))
print("(skin points used: heel %d, toe tip %d on his right boot)" % (rows[0]['R']['nh'], rows[0]['R']['nt']))
lows = [r[S]['low'] * 1000 for r in rows for S in 'RL']; sw = [r[S]['low'] * 1000 for r in rows for S in 'RL' if not r[S]['down']]
print('\nlowest point of either sole over the stride: %.2f mm (below 0 it is in the ground); highest a swinging sole\'s lowest point gets: %.1f mm' % (min(lows), max(sw) if sw else 0))
hy = [r['head'][1] for r in rows]; hx = [r['head'][0] for r in rows]; hz = [r['head'][2] for r in rows]; hp = [r['hipY'] for r in rows]; hpx = [r['hipX'] for r in rows]
print('hips rise and fall %.1f mm, go side to side %.1f mm; his face rises and falls %.1f mm, side to side %.1f mm, back and forth %.1f mm' % ((max(hp) - min(hp)) * 1000, (max(hpx) - min(hpx)) * 1000, (max(hy) - min(hy)) * 1000, (max(hx) - min(hx)) * 1000, (max(hz) - min(hz)) * 1000))
print("deepest any point of the boots' own skin goes into the ground over the stride: %.2f mm (the sole is soft where it bends at the ball)" % (min(r['skinLow'] for r in rows) * 1000))
rng = lambda k: (min(r[k] for r in rows), max(r[k] for r in rows))
print('turn about his upright (degrees, + is his right side forward): hips %.1f to %.1f, shoulders %.1f to %.1f, head %.1f to %.1f; head tips sideways %.1f to %.1f' % (rng('yawH') + rng('yawS') + rng('yawHead') + rng('tiltHead')))
i0 = max(range(N), key=lambda i: rows[i]['yawH']); print('when his hips are turned most (%.1f at q %.2f) his shoulders are at %.1f' % (rows[i0]['yawH'], rows[i0]['q'], rows[i0]['yawS']))
hz = lambda S: (min(r[S]['handZ'] for r in rows) * 1000, max(r[S]['handZ'] for r in rows) * 1000)
print('his hands swing from %.0f to %.0f mm (right) and %.0f to %.0f mm (left) ahead of his middle' % (hz('R') + hz('L')))
on = sum(1 for r in rows[:-1] if r['R']['down']) / N; both = sum(1 for r in rows[:-1] if r['R']['down'] and r['L']['down']) / N
print('each foot is on the ground %.0f%% of the stride; both feet are down %.0f%% of it; worst slide of any planted point %.3f mm a frame' % (on * 100, both * 100, worst_all))
print('\nstanding (24 s each, 480 frames): how far any heel or toe point of either boot moves over the ground, and how far off it gets (mm)')
print(' move   worst move   worst height')
for k in ('idle', 'talk'): print('  %s     %6.3f       %6.3f' % (k, R['still'][k][0], R['still'][k][1]))
print('knees in idle: %.1f to %.1f degrees from his rest pose (rest is %.1f from straight)' % (R['kneeMin'], R['kneeMax'], -R['del']))
