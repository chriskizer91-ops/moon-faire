// the blade poses of the last three round-3 spells: which forearm turn, wrist bend and grip lean point her shears where each pose wants them
const J = T.j, SK = J.debug.SK, v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]).normalize(), V = () => new THREE.Vector3();
const dirOf = () => { const a = T.L(J.anchor('bladeA')), m = T.L(J.anchor('bladeAm')); return a.sub(m).normalize(); };
const best = (name, base, want) => { let b = null; const w = v3(want);
  for (const ln of [-1.55, -1.25, -0.95, -0.7, -0.35, 0, 0.44, 0.9]) for (let tw = -1.6; tw <= 1.61; tw += 0.2) for (const w0 of [-0.4, 0, 0.4]) for (const w1 of [-0.3, 0, 0.3]) { const o = Object.assign({ shr: 1, shs: 0, fR: F.grip, shl: ln }, base); o.twR = tw; o.wrR = [w0, w1]; T.pose(o); const d = dirOf(), sc = d.dot(w) - 0.04 * (Math.abs(w0) + Math.abs(w1)) - 0.02 * Math.abs(tw);
    if (!b || sc > b.sc) b = { sc, ln, tw: +tw.toFixed(1), wr: [w0, w1], dir: T.r3(d), dot: +d.dot(w).toFixed(2), o }; }
  T.pose(b.o); const tip = T.r3(T.L(J.anchor('bladeA'))), sh = T.L(SK.uarmR.getWorldPosition(V())), hd = T.L(SK.handR.getWorldPosition(V()));
  return name + ': lean ' + b.ln + ' tw ' + b.tw + ' wr ' + b.wr + ' -> blade ' + b.dir + ' (match ' + b.dot + ') tip ' + tip + ' reach ' + (sh.distanceTo(hd) / S.len).toFixed(2); };
J.stop(); T.st('', 0.3); T.step(20, 1 / 60); T.pose({});
S.len = SK.uarmR.getWorldPosition(V()).distanceTo(SK.farmR.getWorldPosition(V())) + SK.farmR.getWorldPosition(V()).distanceTo(SK.handR.getWorldPosition(V()));
const out = ['arm ' + S.len.toFixed(3) + ' shoulderR ' + T.r3(T.L(SK.uarmR.getWorldPosition(V()))) + ' blade length ' + (() => { T.pose({ shr: 1, fR: F.grip, hR: [-0.14, 1.3, 0.4] }); return J.anchor('bladeA').distanceTo(J.anchor('handR')).toFixed(3); })()];
const tip = { hip: [0, 0.045, 0.02], ftR: [0, 0.055, 0, 0, 0.55], ftL: [0, 0.055, 0, 0, 0.55] }, crouch = { hip: [0, -0.24, 0.04], sp: [0, 0.32, 0], knR: [-0.35, 0, 1], knL: [0.35, 0, 1] };
out.push(best('SC point', { hR: [-0.15, 1.30, 0.44], eR: [-0.6, -1, -0.2], sp: [0, 0.08, 0] }, [0, 0.05, 1]));
out.push(best('SC snip', { hR: [-0.04, 1.36, 0.40], eR: [-0.8, -0.8, -0.2] }, [1, 0.15, 0.15]));
out.push(best('SS top', Object.assign({ hR: [-0.12, 1.84, 0.20], eR: [-0.8, -0.3, 0.6], sp: [0, -0.05, 0] }, tip), [0, 0.8, 0.6]));
out.push(best('SS high', Object.assign({ hR: [-0.12, 1.62, 0.30], eR: [-0.8, -0.6, 0.2] }, tip), [0, 0.6, 0.8]));
out.push(best('SS mid', { hR: [-0.12, 1.30, 0.38], eR: [-0.7, -1, -0.2], sp: [0, 0.12, 0], hip: [0, -0.08, 0.02] }, [0, 0.1, 1]));
out.push(best('SS low', Object.assign({ hR: [-0.12, 0.92, 0.42], eR: [-0.8, -0.6, -0.4] }, crouch), [0, -0.75, 0.66]));
return out.join('\n');
