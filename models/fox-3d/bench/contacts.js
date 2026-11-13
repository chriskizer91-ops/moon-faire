// The Fox's own moves: every pose where a hand must land on her. Prints the hand key for each, to paste into src/88_foxmoves.js.
// Each entry: the pose she is in at that moment, which hand, which point of the hand, and the point of her it must reach.
// usage: python3 bench.py bench/contacts.js shots/ct     (also saves a still of each, front and from the side, to look over: python3 sheet.py ct 7)
T.clean('color'); T.stage.orbit.target.set(0, 0, 0);
const lips = (dx, dz) => () => T.hp(dx || 0, 1.4586, 0.113 + (dz === undefined ? 0.006 : dz)), bridge = () => T.hp(0, 1.5246, 0.122), bell = () => T.np(-0.004, 1.3460, 0.0700), chin = (dx, dz) => () => T.hp(dx, 1.410, 0.10 + dz);
const armL = { hL: [-0.06, 1.03, 0.17], eL: [1, -0.4, 0.3], fL: F.soft, twL: 0.2 }, cupR = { hR: [-0.05, 1.40, 0.2], eR: [-0.6, -1, -0.1], fR: F.cup, twR: 0.6, wrR: [0.5, 0.3] };
S.P = {
  GLASSES: [{ hd: [0, 0.08, 0.04], hL: [0.05, 1.40, 0.2], eL: [0.8, -1, -0.2], fL: F.point, twL: 0.5, wrL: [0.15, 0] }, 'L', 'tipL', bridge],
  BELL: [{ hd: [0, 0.05, -0.08], hR: [-0.05, 1.25, 0.2], eR: [-1, -0.3, 0.3], fR: F.point, twR: 0.6, wrR: [0.6, 0.4] }, 'R', 'tipR', bell],
  SHH: [{ sp: [0, 0.10, 0], hd: [0.04, -0.02, 0.08], hL: [0.05, 1.33, 0.2], eL: [0.8, -1, -0.2], fL: F.point, twL: 0.4, wrL: [0.1, 0], eyes: 0.5 }, 'L', 'tipL', lips()],
  HIDE0: [Object.assign({ hd: [0.22, 0.14, -0.08], sp: [0.06, 0.06, 0], eyes: 1, mouth: 2 }, armL, cupR), 'R', 'tipR', lips(0.012, 0.022)],
  HIDE1: [Object.assign({ hd: [0.22, 0.24, -0.08], sp: [0.06, 0.22, 0.03], eyes: 1, mouth: 2 }, armL, cupR), 'R', 'tipR', lips(0.012, 0.022)],
  PEEK: [Object.assign({ hd: [-0.05, 0.02, 0.14], sp: [0, 0.06, 0], mouth: 2 }, armL, { hR: [-0.05, 1.36, 0.2], eR: [-0.6, -1, -0.1], fR: F.soft, twR: 0.9, wrR: [0.3, 0.2] }), 'R', 'tipR', chin(-0.012, 0.03)],
  COVER: [{ hd: [0.08, 0.02, -0.10], sp: [0, 0, 0.02], hR: [-0.08, 1.40, 0.2], eR: [-0.7, -1, -0.2], fR: F.soft, twR: 0.9, wrR: [0.3, 0.2], mouth: 2 }, 'R', 'handR', () => T.hp(-0.031, 1.5246, 0.128)],      // her palm over her right eye (Borrowed Face)
  DIP_SHH: [{ hip: [0.01, -0.17, -0.02], knL: [0.40, 0, 1], knR: [-0.5, 0, 1], ftR: [0.05, 0.04, -0.24, -0.45, 0.50], sp: [0, 0.12, 0], hd: [0.05, -0.08, 0.14], hR: [-0.30, 0.68, 0.05], eR: [-1, -0.2, -0.6], fR: F.pinch, twR: 0.2, wrR: [0.2, 0],
    hL: [0.05, 1.16, 0.2], eL: [0.8, -1, -0.2], fL: F.point, twL: 0.4, wrL: [0.1, 0], mouth: 2 }, 'L', 'tipL', () => T.hp(0, 1.4586, 0.119)],
};
S.out = {}; S.go = (n) => { const p = S.P[n]; S.out[n] = T.reach(p[0], p[1], p[2], p[3], 14).h; T.view(0, 0, 1.5, 1.36, 22, 330, 420); };
S.side = (a) => T.view(a, 0.05, 1.5, 1.36, 22, 330, 420);
S.go('GLASSES');
//SHOT a0
S.side(0.9);
//SHOT a1
S.go('BELL');
//SHOT b0
S.side(-1.2);
//SHOT b1
S.go('SHH');
//SHOT c0
S.side(0.9);
//SHOT c1
S.go('HIDE0');
//SHOT d0
S.side(-0.9);
//SHOT d1
S.go('HIDE1');
//SHOT e0
S.side(-0.9);
//SHOT e1
S.go('PEEK');
//SHOT f0
S.side(-0.9);
//SHOT f1
S.go('COVER');
//SHOT h0
S.side(-0.9);
//SHOT h1
S.go('DIP_SHH'); T.view(0, 0, 1.5, 1.20, 22, 330, 420);
//SHOT g0
T.view(0.9, 0.05, 1.5, 1.20, 22, 330, 420);
//SHOT g1
return S.out;
