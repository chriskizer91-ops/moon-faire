// a first look at the new magic, standing still: the cut in the air (shut, open, half sewn), the enemy's copy, the quilt, a thread from each fingertip
T.clean('color'); const J = T.j, X = J.debug.fx3, V = (x, y, z) => new THREE.Vector3(x, y, z); S.X = X; S.V = V;
J.stop(); T.st('', 0.3); T.step(20, 1 / 60);
const a = J.anchor('tipR'), b = X.tipOf('R', 1, V()); S.keep = () => { for (const o of [X.SLIT.group, X.EGHOST.group, X.QUILT.mesh]) o.visible = o.userData.on === true; };
const out = { tipR_vs_tipOf: +a.distanceTo(b).toFixed(4), tips: ['R', 'L'].map((s) => [0, 1, 2, 3, 4].map((i) => T.r3(T.L(X.tipOf(s, i, V()))))) };
X.SLIT.place(V(0.62, 0, 0.10), V(1, 0, 0), V(0, 0, 1)); X.SLIT.show(1, 0, 0, 0, 1, 0.3);
T.stage.orbit.target.set(0.4, 0, 0); T.view(0, 0.05, 7.5, 1.05, 22, 700, 700);
return out;
//SHOT slit_shut
S.X.SLIT.show(1, 1, 0.8, 0, 1, 0.3); T.view(0, 0.05, 7.5, 1.05, 22, 700, 700);
//SHOT slit_open
S.X.SLIT.show(1, 1, 0, 0.5, 1, 0.3); S.X.SLIT.needle(S.X.SLIT.pt(0.5, 0, S.V()).add(S.V(0.05, 0.02, 0.01)), S.V(0.6, -0.8, 0), 1); T.view(0.5, 0.1, 7.5, 1.05, 22, 700, 700);
//SHOT slit_sewn
S.X.SLIT.show(0, 0, 0, 0, 0, 0); S.X.EGHOST.from(null); S.X.EGHOST.show(1, S.V(1.2, 0, 0), 0.4, 0, 0, 99, 0.2); T.view(0, 0.05, 7.5, 1.05, 22, 700, 700);
//SHOT eghost
S.X.EGHOST.show(1, S.V(1.2, 0, 0), 0.4, 0, 0.2, 1.0, 0.2); T.view(0, 0.05, 7.5, 1.05, 22, 700, 700);
//SHOT eghost_cut
S.X.EGHOST.show(0, S.V(), 0); const J = T.j, X = S.X, V = S.V; const hR = J.anchor('handR'), hL = J.anchor('handL');
X.QUILT.shape(V(0, 0, 0), V(1, 0, 0), V(0, 0, 1), hR, hL, 3.0, 2.1, 1, 0, 0, 0, 0.8, 0.5); X.QUILT.show(1, 0, 0.5);
T.stage.orbit.target.set(1.4, 0, 0); T.view(0.2, 0.35, 11, 0.9, 22, 900, 700);
//SHOT quilt_held
const J = T.j, X = S.X, V = S.V; const hR = J.anchor('handR'), hL = J.anchor('handL');
X.QUILT.shape(V(0, 0, 0), V(1, 0, 0), V(0, 0, 1), hR, hL, 3.0, 2.1, 1, 1, 1, 0, 0.2, 0.5); X.QUILT.show(1, 1, 0.5);
X.RIB.begin(); for (const s of ['R', 'L']) for (let i = 0; i < 5; i++) { const p0 = X.tipOf(s, i, V()), p1 = V(1.6, 0.5 + 0.25 * i, s === 'R' ? 0.5 : -0.5); X.RIB.path((u, o) => { o.lerpVectors(p0, p1, u); o.y -= 0.15 * Math.sin(Math.PI * u); }, 0.006, 1, i * 0.13, 0.8, 0); }
T.view(0.2, 0.35, 11, 0.9, 22, 900, 700);
//SHOT quilt_down
