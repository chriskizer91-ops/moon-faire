// for each key pose of her daggers: which forearm turn and wrist bend best points the blade the way it should go
const J = T.j, v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]).normalize();
const dirOf = (S) => { const a = T.L(J.anchor(S === 'R' ? 'bladeA' : 'bladeB')), m = T.L(J.anchor(S === 'R' ? 'bladeAm' : 'bladeBm')); return a.sub(m).normalize(); };
const best = (name, S, base, want) => { let b = null; const w = v3(want);
  for (const ln of base.leans || [0.44]) for (let tw = -1.6; tw <= 1.61; tw += 0.2) for (const w0 of [-0.4, 0, 0.4]) for (const w1 of [-0.3, 0, 0.3]) { const o = Object.assign({ shr: 1, shs: 1, fR: F.grip, fL: F.grip, shl: ln }, base); delete o.leans; o['tw' + S] = tw; o['wr' + S] = [w0, w1]; T.pose(o); const d = dirOf(S), sc = d.dot(w) - 0.04 * (Math.abs(w0) + Math.abs(w1)) - 0.02 * Math.abs(tw);
    if (!b || sc > b.sc) b = { sc, ln, tw: +tw.toFixed(1), wr: [w0, w1], dir: T.r3(d), dot: +d.dot(w).toFixed(2) }; }
  return name + ' ' + S + ': lean ' + b.ln + ' tw ' + b.tw + ' wr ' + b.wr + ' -> blade ' + b.dir + ' (match ' + b.dot + ')'; };
const out = [];
out.push(best('up', 'R', { hR: [-0.12, 1.26, 0.22], eR: [-0.7, -1, -0.2], shs: 0 }, [0.1, 0.95, 0.2]));
out.push(best('split', 'R', { hR: [-0.40, 1.02, 0.08], eR: [-0.2, -0.5, -1] }, [-0.35, 0.9, 0.1]));
out.push(best('split', 'L', { hL: [0.40, 1.02, 0.08], eL: [0.2, -0.5, -1] }, [0.35, 0.9, 0.1]));
out.push(best('wind', 'R', { leans: [-0.7, -0.35, 0, 0.44], hR: [-0.42, 1.30, -0.05], eR: [-1, -0.3, -0.6], sp: [-0.35, 0.10, 0] }, [-0.3, 0.8, -0.5]));
out.push(best('cut1mid', 'R', { leans: [-0.7, -0.35, 0, 0.44], hR: [-0.05, 1.16, 0.46], eR: [-1, -0.6, -0.2], sp: [0, 0.12, 0] }, [0.35, 0.5, 0.8]));
out.push(best('cut1end', 'R', { leans: [-0.7, -0.35, 0, 0.44], hR: [0.22, 0.90, 0.40], eR: [-1, -0.6, -0.2], sp: [0.25, 0.14, 0] }, [0.6, -0.2, 0.75]));
out.push(best('cut2top', 'L', { leans: [-0.7, -0.35, 0, 0.44], hL: [0.36, 1.45, 0.05], eL: [1, -0.2, -0.6], sp: [0.25, 0.14, 0] }, [0.2, 0.9, -0.3]));
out.push(best('cut2mid', 'L', { leans: [-0.7, -0.35, 0, 0.44], hL: [0.05, 1.14, 0.48], eL: [1, -0.6, -0.2], sp: [0, 0.12, 0] }, [-0.35, 0.5, 0.8]));
out.push(best('cut2end', 'L', { leans: [-0.7, -0.35, 0, 0.44], hL: [-0.20, 0.88, 0.40], eL: [1, -0.6, -0.2], sp: [-0.15, 0.12, 0] }, [-0.6, -0.2, 0.75]));
out.push(best('cross', 'R', { hR: [0.07, 0.98, 0.26], eR: [-1, -0.5, -0.3] }, [0.5, -0.8, 0.2]));
out.push(best('cross', 'L', { hL: [-0.07, 0.96, 0.29], eL: [1, -0.5, -0.3] }, [-0.5, -0.8, 0.2]));
out.push(best('join', 'R', { hR: [-0.04, 1.06, 0.27], eR: [-0.7, -1, -0.2], shs: 0 }, [0.2, 0.9, 0.3]));
return out.join('\n');
