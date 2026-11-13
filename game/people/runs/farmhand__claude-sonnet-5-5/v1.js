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
    F.lips('#b8766c', 0.5);
    F.brows('#9a6a3a', 0.8, 15);
    F.eyes('#4f7a9a', 0.7);
    F.blush('#c8705a', 0.18);
    F.freckles(70, '#9c5a34', 0.55);
  },
  make(K) {
    K.panel('waistcoat', [
      [1.285, 0.145, 0.088, 0.100],
      [1.215, 0.146, 0.118, 0.106],
      [1.140, 0.132, 0.107, 0.100],
      [1.040, 0.118, 0.094, 0.094],
      [0.950, 0.165, 0.107, 0.118],
      [0.870, 0.186, 0.114, 0.132],
      [0.780, 0.188, 0.112, 0.130],
    ], 40, 320, K.w.torso, { n: 24 });
    K.hair('hair', 'short', { underHat: true });
    K.shell('straw', [
      [1.700, 0.050, 0.060, 0.058],
      [1.690, 0.082, 0.096, 0.094],
      [1.650, 0.094, 0.110, 0.108],
      [1.610, 0.094, 0.110, 0.108],
      [1.600, 0.102, 0.116, 0.114],
      [1.597, 0.190, 0.205, 0.200],
      [1.590, 0.255, 0.268, 0.262],
    ], K.w.head, { n: 28, capFirst: true });
    K.shell('band', [
      [1.648, 0.103, 0.119, 0.117],
      [1.616, 0.103, 0.119, 0.117],
    ], K.w.head, { n: 24 });
  },
};
