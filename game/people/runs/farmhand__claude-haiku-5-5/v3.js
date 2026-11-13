const PERSON = {
  name: 'Farm lad',
  height: 0.98,
  build: [1.02, 1.0],
  skin: '#d9a98a',
  colors: { torso: '#3e6b3a', sleeve: '#d9a52e', forearm: 'skin', legs: '#5b4330', boots: '#4a3a2a', soles: '#2e2318' },
  parts: { belt: '#4a2f1c', hair: '#c9a461', straw: '#d9c27e', band: '#4a2f1c' },
  face(F) {
    F.brows('#c9a461', 0.5, 12); F.eyes('#4f6b7a', 0.5); F.lips('#b08078', 0.4);
    F.blush('#c06a5c', 0.15); F.freckles(40, '#8a5a3a', 0.6);
  },
  make(K) {
    K.shell('belt', [[1.000, 0.122, 0.104, 0.100], [0.975, 0.134, 0.112, 0.112]], K.w.torso, { n: 24 });
    K.hair('hair', 'short', { underHat: true });
    K.shell('straw', [[1.585, 0.095, 0.112, 0.110], [1.620, 0.094, 0.110, 0.108], [1.660, 0.088, 0.100, 0.100], [1.685, 0.070, 0.078, 0.078]], K.w.head, { n: 22, capLast: true });
    K.shell('band', [[1.590, 0.105, 0.122, 0.120], [1.615, 0.104, 0.120, 0.118]], K.w.head, { n: 22 });
    K.shell('straw', [[1.596, 0.27, 0.27, 0.27], [1.602, 0.27, 0.27, 0.27]], K.w.head, { n: 28 });
  },
};
