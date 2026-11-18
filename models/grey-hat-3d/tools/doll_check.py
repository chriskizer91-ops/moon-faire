# Checks the blank doll (src/N45_doll.js) by measuring, in the pose he rests in:
#   1. its outline against B5 and B3/D3 (the numbers tools/doll_measure.py wrote to out/doll_measure.json)
#   2. that it lies inside his clothes as the old skin has them (trunk, trouser legs, boots, sleeves), and by how much
#   3. that every list on its mesh is as long as its list of points, and how many triangles it has
# usage: python3 tools/doll_check.py        (run tools/doll_measure.py and ./build.sh first)
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = json.load(open(os.path.join(ROOT, 'out', 'doll_measure.json')))
JS = r'''(M) => {
  const D = T.j.debug.doll, F = D.F, dbg = T.j.debug, out = {};
  // how far the body reaches along a line from a point inside it, a millimetre at a time, then halved in
  const reach = (x, y, z, dx, dz) => { let t = 0; while (t < 0.4 && F(x + dx * (t + 0.001), y, z + dz * (t + 0.001)) < 0) t += 0.001; let lo = t, hi = t + 0.001; for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (F(x + dx * m, y, z + dz * m) < 0) lo = m; else hi = m; } return lo; };
  const zs = []; for (let z = -0.16; z <= 0.16; z += 0.004) zs.push(z);
  const halfW = (y) => Math.max(...zs.map((z) => (F(0.02, y, z) < 0 ? 0.02 + reach(0.02, y, z, 1, 0) : 0)));
  const xs = []; for (let x = 0; x <= 0.2; x += 0.004) xs.push(x);
  const front = (y, c) => Math.max(...xs.map((x) => (F(x, y, c) < 0 ? c + reach(x, y, c, 0, 1) : -9)));
  const back = (y, c) => Math.min(...xs.map((x) => (F(x, y, c) < 0 ? c - reach(x, y, c, 0, -1) : 9)));
  out.hips = M.hips.map((r) => { const y = r[0]; return [y, halfW(y), front(y, 0), back(y, 0)]; });
  out.legs = M.legs.map((r) => { const y = r[0]; let cx = 0.11, best = 0; for (const x of xs) { if (x < 0.03) continue; if (F(x, y, -0.02) < 0) { const o = reach(x, y, -0.02, 1, 0), i = reach(x, y, -0.02, -1, 0); if (o + i > best) { best = o + i; cx = x + (o - i) / 2; } } }
    let w = 0, xo = 0, xi = 0; for (const z of zs) if (F(cx, y, z) < 0) { const o = cx + reach(cx, y, z, 1, 0), i = cx - reach(cx, y, z, -1, 0); if (o > xo) xo = o; if (xi === 0 || i < xi) xi = i; }
    return [y, xo - xi, (xo + xi) / 2, front(y, -0.02), back(y, -0.02)]; });
  out.trunk = M.trunk_clothed.map((r) => { const y = r[0]; return [y, halfW(y), front(y, 0), back(y, 0)]; });
  // the arm, square across it: in the plane of the front view (as B3 shows it) and through the wrist the way D3 shows the back of his hand
  const sh = T.j.debug.SK.uarmL.userData.rest, wr = T.j.debug.SK.handL.userData.rest, d = wr.clone().sub(sh), L = d.length(); d.normalize(); const n = new THREE.Vector3(d.y, -d.x, 0);
  const across = (sl, ex, ey, ez) => { const c = sh.clone().addScaledVector(d, sl); let a = 0, b = 0; while (a < 0.1 && F(c.x + ex * a, c.y + ey * a, c.z + ez * a) < 0) a += 0.0005; while (b < 0.1 && F(c.x - ex * b, c.y - ey * b, c.z - ez * b) < 0) b += 0.0005; return a + b; };
  out.armFront = M.arm.map((r) => [r[0], across(r[0], n.x, n.y, 0)]);
  out.armLen = L; out.arm = [0.02, 0.08, 0.14, 0.20, 0.26, 0.285, 0.32, 0.36, 0.40, 0.43, 0.465, 0.498, 0.52].map((sl) => [sl, across(sl, n.x, n.y, 0), across(sl, 0, 0, 1)]);
  // inside the old skin? For every point of the doll: how far inside the nearest old part it lies (negative: it pokes out)
  const DM = ['dollTrunk', 'dollHips', 'dollLegs', 'dollArms'].map((k) => T.j.meshes[k]), g = DM[0].geometry, P = g.attributes.position,      // the four doll meshes share one list of points
   poly = {}, NP = 96;
  const ring = (key, y, mk) => { const k = key + Math.round(y * 500); if (!poly[k]) { const yy = Math.round(y * 500) / 500, r = []; for (let j = 0; j < NP; j++) r.push(mk(yy, j / NP)); poly[k] = r; } return poly[k]; };
  const inside = (r, x, z) => { let dmin = 1e9, c = false; for (let i = 0, j = NP - 1; i < NP; j = i++) { const ax = r[i][0], az = r[i][2], bx = r[j][0], bz = r[j][2]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) c = !c; const ex = bx - ax, ez = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez))), q = Math.hypot(x - ax - ex * t, z - az - ez * t); if (q < dmin) dmin = q; } return c ? dmin : -dmin; };
  const reg = {}; const note = (name, m, x, y, z) => { const R = reg[name] || (reg[name] = { n: 0, out: 0, min: 9, at: null }); R.n++; if (m < 0) R.out++; if (m < R.min) { R.min = m; R.at = [x, y, z].map((v) => +v.toFixed(3)); } };
  const A = Math.PI * 26.94 / 180;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ax = Math.abs(x), s = x < 0 ? -1 : 1; let m = -9;
    if (y >= 0.62 && y <= 1.50) m = Math.max(m, inside(ring('t', y, (yy, u) => dbg.trunkPt(u, yy)), x, z));
    if (y >= 0.39 && y <= 0.73) m = Math.max(m, inside(ring('l' + s, y, (yy, u) => dbg.legPt(s, yy, u * 6.2831853)), x, z));
    if (y <= 0.40) m = Math.max(m, inside(ring('b' + s, y, (yy, u) => dbg.bootPt(s, yy, u * 6.2831853)), x, z));
    { const shx = s * sh.x, qx = x - shx, qy = y - sh.y, sl = qx * s * d.x + qy * d.y; if (sl > -0.045 && sl < 0.544) { const ar = dbg.armAt(Math.max(0, sl)), qn = qx * s * Math.cos(A) + qy * Math.sin(A) - ar[1] * Math.min(1, Math.max(0, (sl + 0.02) / 0.08)), qz = z - sh.z, dome = sl < 0 ? Math.sqrt(Math.max(0.02, 1 - Math.pow(sl / -0.047, 2))) : 1; m = Math.max(m, ar[0] * dome - Math.hypot(qn, qz)); } }
    if (y > 1.44 && ax < 0.09) { const NK = [[1.455, 0.0640, 0.0260, -0.0960], [1.480, 0.0600, 0.0330, -0.0900], [1.505, 0.0575, 0.0400, -0.0850], [1.530, 0.0560, 0.0450, -0.0800]]; let k = 0; while (k < 2 && NK[k + 1][0] < y) k++;      // his own neck (N40_head.js)
      const u = Math.max(0, Math.min(1, (y - NK[k][0]) / 0.025)), rx = NK[k][1] + (NK[k + 1][1] - NK[k][1]) * u, zf = NK[k][2] + (NK[k + 1][2] - NK[k][2]) * u, zb = NK[k][3] + (NK[k + 1][3] - NK[k][3]) * u, q = Math.hypot(x / rx, (z - (zf + zb) / 2) / ((zf - zb) / 2)); if (y >= 1.455) m = Math.max(m, (1 - q) * rx); }
    const sla = (ax - sh.x) * d.x + (y - sh.y) * d.y; if (sla > 0.528 && ax > 0.3) continue;      // past the wrist joint the arm runs on inside the hand
    const name = y > 1.44 && ax < 0.12 ? 'foot of the neck' : y < 0.40 ? 'in the boot' : y < 0.80 ? 'leg above the boot' : ax > 0.20 || (sla > 0.10 && ax > 0.17) ? (sla > 0.31 ? 'forearm and wrist' : 'upper arm') : y < 1.0 ? 'hips and seat' : y < 1.25 ? 'waist' : y < 1.40 ? 'chest and back' : 'shoulders';
    note(name, m, x, y, z);
  }
  out.reg = reg;
  let bad = 0; for (const a in g.attributes) if (g.attributes[a].count !== P.count) bad++;
  out.mesh = { points: P.count, triangles: DM.reduce((a, m) => a + m.geometry.index.count / 3, 0), byRegion: DM.map((m) => m.name + ' ' + m.geometry.index.count / 3).join(', '), lists: Object.keys(g.attributes).join(' '), wrongLength: bad, all: Math.round(T.j.triangles) };
  return out; }'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    r = pg.evaluate(JS, M); ms = pg.evaluate('Math.round(T.buildMs)'); b.close()
for e in errs: print('ERR', e)
CL = 0.003          # the cloth of the shorts in B5 is taken as 3 mm
print('1. Outline against the paintings (metres; the doll is measured on its own solid, at rest)')
print('\nhips and seat against B5 (painting less %d mm of cloth)   height | half width: painted  doll  diff | front: painted  doll  diff | back: painted  doll  diff' % (CL * 1000))
for a, d in zip(M['hips'], r['hips']):
    if a[0] > 1.04: continue
    pw = (a[1] + a[2]) / 2 - CL; print('   %.3f |  %.3f  %.3f  %+.3f |  %+.3f  %+.3f  %+.3f |  %+.3f  %+.3f  %+.3f' % (a[0], pw, d[1], d[1] - pw, a[3] - CL, d[2], d[2] - a[3] + CL, a[4] + CL, d[3], d[3] - a[4] - CL))
print('\nlegs against B5   height | width: painted  doll  diff | middle out: painted  doll | front: painted  doll  diff | back: painted  doll  diff')
for a, d in zip(M['legs'], r['legs']):
    if a[0] > 0.80: continue
    pw = min(a[1], a[2]) if a[0] > 0.8 else (a[1] + a[2]) / 2; print('   %.3f |  %.3f  %.3f  %+.3f |  %.3f  %.3f |  %+.3f  %+.3f  %+.3f |  %+.3f  %+.3f  %+.3f' % (a[0], pw, d[1], d[1] - pw, a[3], d[2], a[4], d[3], d[3] - a[4], a[5], d[4], d[4] - a[5]))
print('\ntrunk against B3 in shirt and trousers (the doll must be inside)   height | half width: clothed  doll  room | front: clothed  doll  room | back: clothed  doll  room')
for a, d in zip(M['trunk_clothed'], r['trunk']):
    if a[0] > 1.47: continue
    arms = 1.22 < a[0] < 1.47; print('   %.2f |  %s  %.3f  %s |  %+.3f  %+.3f  %+.3f |  %+.3f  %+.3f  %+.3f' % (a[0], ' arms ' if arms else '%.3f ' % a[1], d[1], '      ' if arms else '%+.3f' % (a[1] - d[1]), a[2], d[2], a[2] - d[2], a[3], d[3], d[3] - a[3]))
print('\narm, square across it, seen from the front, against B3   from the shoulder | painted  doll  diff')
for a, d in zip(M['arm'], r['armFront']):
    if a[0] > 0.47: continue
    print('   %.2f |  %.3f  %.3f  %+.3f%s' % (a[0], a[1], d[1], d[1] - a[1], '   (ruffle in the way)' if a[0] < 0.45 else ''))
print('arm of the doll   from the shoulder | across, seen from the front | across, seen from the side      (shoulder to wrist joint %.3f)' % r['armLen'])
for sl, a, c in r['arm']: print('   %.3f |  %.3f  |  %.3f' % (sl, a, c))
print('wrist in D3: %.4f across' % M['wrist'])
print('\n2. Inside his clothes (the old skin)?   region | points | poking out | least room (m) | where')
for k, v in sorted(r['reg'].items()): print('   %-20s | %6d | %5d | %+.4f | %s' % (k, v['n'], v['out'], v['min'], v['at']))
print('\n3. Mesh: %d points, %d triangles (%s), lists: %s; lists of the wrong length: %d. Whole model %d triangles, built in %d ms.' % (r['mesh']['points'], r['mesh']['triangles'], r['mesh']['byRegion'], r['mesh']['lists'], r['mesh']['wrongLength'], r['mesh']['all'], ms))
