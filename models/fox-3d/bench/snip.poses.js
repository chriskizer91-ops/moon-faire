// Same Cloth's snip: her left hand holds the threads up; where her right hand must be for the open blades to close across them just beyond her left fingertips.
// usage: N=3 python3 poses.py snip "$(cat bench/snip.poses.js)" -0.95 3.6 1.33     (paste the first row's hR into snipArm in src/89c_foxspells3.js)
const PUP = [0.20, 0.22, 0.20, 0.26, 0.32, 1.0], stride = { hip: [0, -0.03, 0.06], ftL: [0.02, 0, 0.22, 0.1, 0], knL: [0.2, 0, 1], ftR: [-0.04, 0, -0.10, -0.5, 0], knR: [-0.4, 0, 1] };
const base = Object.assign({ sp: [0.05, 0.10, 0], hd: [0.05, 0.03, 0.05], mouth: 2, hL: [0.13, 1.44, 0.34], eL: [0.9, 0.15, -0.3], fL: PUP, twL: 0.8, wrL: [0.25, 0] }, stride), out = {};
T.pose(base); const tl = T.L(X.tipOf('L', 2, V()));
for (const [ln, tw] of [[-0.5, -1], [-0.2, -1], [-0.8, -0.6]]) out['lean ' + ln + ' tw ' + tw] = solve(Object.assign({}, base, { shr: 1, shs: 0, sho: 0.5, fR: F.grip, shl: ln, twR: tw, wrR: [0, 0], eR: [-0.8, -0.8, -0.2], hR: [-0.2, 1.44, 0.3] }), 'bladeAm', [tl.x - 0.03, tl.y - 0.05, tl.z + 0.10]);
return out;
