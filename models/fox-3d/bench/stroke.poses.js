// Slip Stitch's downward cut: for each height of the point of her shears on one straight line, the grip lean, wrist bend and hand place that keep her arm easy.
// usage: python3 poses.py stroke "$(cat bench/stroke.poses.js)" -1.25 8.5 1.1     (prints the hand keys; paste into ST in src/89c_foxspells3.js)
const feet = { ftL: [0.03, 0, 0.42, 0.1, 0], knL: [0.2, 0, 1], ftR: [-0.03, 0.03, -0.02, -0.3, 0.35], knR: [-0.3, 0, 1] }, armL = { hL: [0.26, 1.02, 0.0], eL: [0.6, -0.2, -1], fL: F.soft, twL: 0.2 };
const LX = -0.16, LZ = 0.80, out = {};
const ST = [['top', 1.96, [0, 0.03, 0.22], [0, 0.02, 0], [-0.5, -0.5, 0.4], [-0.16, 1.62, 0.60]], ['s1', 1.62, [0, 0, 0.22], [0, 0.06, 0], [-0.5, -0.8, 0.1], [-0.18, 1.36, 0.58]], ['s2', 1.28, [0, -0.07, 0.22], [0, 0.12, 0], [-0.5, -1, -0.2], [-0.2, 1.12, 0.56]],
  ['s3', 0.92, [0, -0.15, 0.22], [0, 0.20, 0], [-0.6, -0.8, -0.4], [-0.22, 0.98, 0.54]], ['s4', 0.56, [0, -0.24, 0.22], [0, 0.30, 0], [-0.7, -0.3, -0.6], [-0.24, 0.84, 0.52]]];
for (const [n, y, hip, sp, e, h0] of ST) { let best = null;
  for (let ln = -1.6; ln <= 0.41; ln += 0.2) for (const w0 of [-0.3, 0, 0.3]) { const o = solve(Object.assign({ shr: 1, shs: 0, fR: F.grip, shl: +ln.toFixed(1), twR: 0, wrR: [w0, 0.2], eyes: 0 }, feet, armL, { hip, sp, eR: e, hR: h0 }), 'bladeA', [LX, y, LZ]); const r = reach(o, 'R');
    const sc = o._err * 20 + Math.abs(r - 0.74) * 2 + Math.abs(o.hR[2] - h0[2]) * 1.5 + Math.abs(o.hR[1] - h0[1]) * 1.0 + Math.abs(w0) * 0.2; if (!best || sc < best.sc) best = { sc, o }; }
  best.o._note = 'shl ' + best.o.shl + ' wr ' + best.o.wrR; out[n] = best.o; }
return out;
