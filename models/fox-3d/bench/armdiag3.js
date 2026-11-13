// How her arms and hands move, in numbers, since the test machine cannot show motion. Plays each move at 60 frames a second and reports, for each arm:
//   reach  the furthest the hand got from the shoulder, as a share of the arm's full length (1.00 = locked straight)
//   elbow  the fastest the elbow opened or shut (deg/s) and the hardest it changed speed (deg/s2, thousands), with the second it happened
//   wrist  the fastest the hand turned on the forearm (deg/s);  tip  the fastest the fingertip travelled (m/s) and its hardest jolt (m/s2)
//   still  the share of the move in which the hand barely turns on the forearm while the fingertip is travelling (a hand carried like a board)
// usage: python3 bench.py bench/armdiag.js
const J = T.j, SK = J.debug.SK, K = 1.045, v = () => new THREE.Vector3(), q = () => new THREE.Quaternion(), D = 180 / Math.PI;
const wp = (b) => SK[b].getWorldPosition(v()), wq = (b) => SK[b].getWorldQuaternion(q());
J.stop(); T.st('', 0.3); T.step(30, 1 / 60);
const len = {}; for (const S of ['R', 'L']) len[S] = wp('uarm' + S).distanceTo(wp('farm' + S)) + wp('farm' + S).distanceTo(wp('hand' + S));
const run = (name, dur, setup) => {
  J.stop(); T.wb = 0; T.rb = 0; T.st('', 0.2); T.step(40, 1 / 60); if (setup) setup(); else J.play(name, true);
  const out = {}, st = {}; for (const S of ['R', 'L']) { out[S] = { reach: 0, elbV: 0, elbA: 0, elbAt: 0, wrV: 0, tipV: 0, tipA: 0, tipAt: 0, board: 0, n: 0 }; st[S] = null; }
  const n = Math.round(dur * 60);
  for (let i = 0; i < n; i++) {
    T.time += 1 / 60; if (T.wb > 0) T.phase += (4.9 + 4.1 * T.rb) / 60; J.animate(T.phase, T.wb, T.time, 1 / 60, T.rb); J.root.rotation.y = J.spin; J.root.updateMatrixWorld(true);
    for (const S of ['R', 'L']) {
      const a = wp('uarm' + S), e = wp('farm' + S), h = wp('hand' + S), tip = T.L(J.anchor('tip' + S)), o = out[S];
      const elb = e.clone().sub(a).angleTo(h.clone().sub(e)), rel = wq('farm' + S).invert().multiply(wq('hand' + S)), p = st[S];
      o.reach = Math.max(o.reach, a.distanceTo(h) / len[S]);
      if (p) {
        const ev = (elb - p.elb) * 60, wv = 2 * Math.acos(Math.min(1, Math.abs(rel.dot(p.rel)))) * 60, tv = tip.distanceTo(p.tip) * 60;
        if (Math.abs(ev) > o.elbV) o.elbV = Math.abs(ev); o.wrV = Math.max(o.wrV, wv); o.tipV = Math.max(o.tipV, tv);
        if (p.ev !== undefined) { const ea = Math.abs(ev - p.ev) * 60, ta = Math.abs(tv - p.tv) * 60; if (ea > o.elbA) { o.elbA = ea; o.elbAt = i / 60; } if (ta > o.tipA) { o.tipA = ta; o.tipAt = i / 60; } }
        if (tv > 0.25) { o.n++; if (wv < 0.35) o.board++; }
        p.ev = ev; p.tv = tv;
      }
      st[S] = Object.assign(p || {}, { elb, rel, tip });
    }
  }
  const f = (o) => `reach ${o.reach.toFixed(3)}  elbow ${(o.elbV * D).toFixed(0)} deg/s, ${(o.elbA * D / 1000).toFixed(1)}k at ${o.elbAt.toFixed(2)}s  wrist ${(o.wrV * D).toFixed(0)}  tip ${o.tipV.toFixed(2)} m/s, ${o.tipA.toFixed(0)} at ${o.tipAt.toFixed(2)}s  still ${(o.n ? 100 * o.board / o.n : 0).toFixed(0)}% of ${o.n}`;
  return name.padEnd(9) + ' R ' + f(out.R) + '\n' + ''.padEnd(9) + ' L ' + f(out.L);
};
const A = J.ACTIONS, rows = [];
for (const m of ['hemline_fangs', 'blue_mischief', 'same_cloth', 'slip_stitch', 'crazy_quilt']) rows.push(run(m, A[m].dur));

T.wb = 0; T.rb = 0; J.stop();
return rows.join('\n');
