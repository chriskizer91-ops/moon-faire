const PERSON = {
  name: 'Cheerful baker',
  height: 0.96,
  build: [1.22, 1.18],
  skin: '#d9a58a',
  colors: { torso: '#c9a87a', sleeve: '#c9a87a', forearm: 'skin', legs: '#5a3d2a', boots: '#2b1f1a', soles: '#1a120e' },
  parts: { shirt: '#c9a87a', apron: '#efe6cf', belt: '#3a2818', hair: '#6b4a2e', beard: '#6b4a2e', cap: '#f2efe6' },
  face(F) {
    F.blush('#c0504a', 0.4); F.lines(0.35); F.lips('#a86a5e', 0.5);
    F.brows('#5a4030', 0.6, 14); F.eyes('#4a3a2a', 0.6);
    F.beard('#6b4a2e', 0.7, 'beard');
  },
  make(K) {
    K.shell('shirt', [[1.31, 0.146, 0.088, 0.100], [1.215, 0.146, 0.116, 0.104], [1.14, 0.134, 0.106, 0.100], [1.04, 0.120, 0.094, 0.094], [0.95, 0.160, 0.107, 0.118], [0.87, 0.178, 0.112, 0.130], [0.79, 0.162, 0.107, 0.122]], K.w.torso, { n: 24 });
    K.shell('belt', [[1.045, 0.128, 0.102, 0.100], [1.025, 0.130, 0.104, 0.102]], K.w.torso, { n: 24 });
    K.panel('apron', [[1.035, 0.132, 0.112], [0.86, 0.198, 0.174], [0.60, 0.244, 0.214], [0.38, 0.272, 0.238]], -52, 52, K.w.skirt, { n: 20 });
    K.hair('hair', 'short', { underHat: true });
    K.beard('beard', 'full');
    K.shell('cap', [[1.565, 0.092, 0.110, 0.108], [1.61, 0.092, 0.110, 0.108], [1.645, 0.070, 0.082, 0.082], [1.668, 0.040, 0.050, 0.050]], K.w.head, { n: 24, capLast: true });
  },
};
