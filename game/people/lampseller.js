// The worked example for the person kit, made by hand (no API): an old lamp-seller.
// One line was the brief: "An old woman who sells lamps: grey hair in a bun under an ochre kerchief, a moss-green bodice,
// a long rust skirt and a cream apron."
const PERSON = {
  name: 'Lamp-seller',
  height: 0.94, build: [1.08, 1.06], head: [1.04, 0.97, 1],
  skin: '#c9967c',
  colors: { torso: '#3f4a2e', sleeve: '#3f4a2e', forearm: '#d9cfb9', legs: '#4a3b32', boots: '#2b1f1a' },
  parts: { skirt: { color: '#8a4226', rough: 0.95 }, apron: '#e3d9c2', hair: '#9a9590', kerchief: { color: '#c58f2e', pattern: { kind: 'dots', color: '#f0deb0', n: 6 } }, belt: '#2b1f1a' },
  face(F) {
    F.lips('#b08078', 0.75); F.brows('#a8a29c', 0.75, 13); F.eyes('#6b5a3c', 0.6);
    F.lines(0.85); F.underEye(0.3); F.blush('#c06a5c', 0.14); F.mole(640, 590, 6);
  },
  make(K) {
    // a long skirt from the waist to the ankles, swinging with the legs
    K.shell('skirt', [[1.05, 0.116, 0.092, 0.092], [0.98, 0.150, 0.125, 0.130], [0.86, 0.185, 0.160, 0.170], [0.60, 0.230, 0.200, 0.215], [0.34, 0.265, 0.230, 0.245], [0.16, 0.285, 0.245, 0.262]], K.w.skirt, { n: 28 });
    // an apron over the front of it, and a belt
    K.panel('apron', [[1.035, 0.132, 0.112], [0.86, 0.198, 0.174], [0.60, 0.244, 0.214], [0.38, 0.272, 0.238]], -52, 52, K.w.skirt);
    K.shell('belt', [[1.075, 0.126, 0.104, 0.102], [1.035, 0.140, 0.120, 0.116]], K.w.torso);
    // grey hair close to the head, with a bun at the back
    K.panel('hair', [[1.640, 0.030, 0.040, 0.040, 0, -0.010], [1.615, 0.066, 0.078, 0.082], [1.560, 0.079, 0.092, 0.096], [1.500, 0.078, 0.086, 0.094], [1.450, 0.066, 0.070, 0.086]], 62, 298, K.w.head, { n: 22 });
    K.ball('hair', [0, 1.505, -0.105], [0.046, 0.044, 0.040], K.w.head);
    // a kerchief over the top of the head, tied under the bun
    K.panel('kerchief', [[1.662, 0.012, 0.014, 0.014, 0, 0.004], [1.648, 0.050, 0.060, 0.062], [1.615, 0.074, 0.092, 0.090], [1.575, 0.084, 0.103, 0.100], [1.545, 0.086, 0.100, 0.102]], -62, 242, K.w.head, { n: 26 });
    K.panel('kerchief', [[1.662, 0.012, 0.014, 0.014, 0, 0.004], [1.648, 0.050, 0.060, 0.062], [1.615, 0.074, 0.092, 0.090], [1.575, 0.084, 0.103, 0.100], [1.545, 0.086, 0.100, 0.102]], 238, 300, K.w.head, { n: 8 });
  },
};
