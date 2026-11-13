const PERSON = {
  name: 'Farm lad',
  height: 0.95,
  build: [1.0, 1.0],
  head: [1, 1, 1],
  skin: '#dba583',
  colors: {
    torso: '#d6a32e',
    sleeve: '#d6a32e',
    forearm: 'skin',
    legs: '#6b4a2e',
    boots: { color: '#3a2a1e', rough: 1, pattern: { kind: 'dots', color: '#7a5c3a', n: 10 } },
    soles: '#2a1f16',
  },
  parts: {
    waistcoat: { color: '#4c6b2f', rough: 0.9 },
    hair: '#c79a5a',
    straw: { color: '#dcbc6a', rough: 0.95, pattern: { kind: 'hoops', color: '#c29f4c', n: 18 } },
    band: '#7a3a2a',
  },
  face(F) {
    F.lips('#b8766c', 0.45);
    F.brows('#9a6a3a', 0.85, 17);
    F.eyes('#4f7a9a', 0.7);
    F.blush('#c8705a', 0.14);
    F.freckles(80, '#9c5a34', 0.6);
  },
  make(K) {
    K.panel('waistcoat', [
      [1.285, 0.145, 0.090, 0.102],
      [1.215, 0.148, 0.120, 0.108],
      [1.140, 0.134, 0.110, 0.102],
      [1.040, 0.122, 0.098, 0.098],
      [0.950, 0.172, 0.112, 0.124],
      [0.870, 0.192, 0.120, 0.138],
      [0.760, 0.196, 0.122, 0.138],
    ], 22, 338, K.w.torso, { n: 28 });
    K.hair('hair', 'short', { underHat: true });
    K.shell('straw', [
      [1.700, 0.050, 0.060, 0.058],
      [1.690, 0.082, 0.096, 0.094],
      [1.650, 0.094, 0.110, 0.108],
      [1.610, 0.094, 0.110, 0.108],
      [1.600, 0.102, 0.116, 0.114],
      [1.597, 0.170, 0.185, 0.180],
      [1.590, 0.225, 0.238, 0.232],
    ], K.w.head, { n: 28, capFirst: true });
    K.shell('band', [
      [1.648, 0.103, 0.119, 0.117],
      [1.616, 0.103, 0.119, 0.117],
    ], K.w.head, { n: 24 });
  },
};
