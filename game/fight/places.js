// places.js: the five painted fight places as data. Meters, y up; the camera looks from +z toward -z; screen right is +x.
// Every place was painted for the same camera (38 degree lens, 2 m up, 18 m back, tilted 4.2 degrees up; world/pictures/F*.json) with
// the party on the left and the foes on the right, so they share one layout. Names are stand-ins until Chris says otherwise.
(function () {
  'use strict';
  const camera = { fov: 38, h: 2, z: 18, pitch: -4.2 }, frame = [1448, 1086];
  const base = (id, name, art, extra) => Object.assign({ id, kind: 'fight', name, art, frame, camera, centre: [0, -2], wideTop: 80, rig: { key: 1, rim: 1 },
    party: { jester: [-2.2, 0.6], ranger: [-3.6, -1.4], fox: [-3.8, 2.0], io: [-5.2, 0.2] },
    // where foes stand: small ones in front, big ones behind them. A line-up takes the first free place of its own size.
    spots: { small: [[2.4, 0.7], [3.4, -1.0], [3.2, 2.4], [1.7, -2.0], [1.6, 2.1], [5.7, 0.5], [6.1, 3.0]], mid: [[4.7, 0.3], [5.6, -2.2], [5.4, 2.7]],
      midBig: [[4.5, 2.4], [5.0, -2.3], [2.9, -2.9]], big: [[7.3, -0.5], [9.0, 2.6]] } }, extra || {});      // midBig: where the middle-sized stand when a big one is behind them
  window.MF_PLACES = {
    F1: base('F1', 'The moor clearing', 'F1'),
    F2: base('F2', 'The fair, from the ring', 'F2'),
    F3: base('F3', 'Among the standing stones', 'F3'),
    F4: base('F4', 'The beacon stair', 'F4'),
    F5: base('F5', 'The lamp room', 'F5'),
  };
})();
