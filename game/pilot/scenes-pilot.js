// The two pilot scenes as data: the camera each painting is made for, and its grey-box layout.
// Meters, y up. The camera looks from +z toward -z; screen right is +x. Every name is a placeholder kept here, not in code.
// Cameras come from Envoi on the Longest Night (chriskizer91-ops/envoi-on-the-longest-night, branch claude/send-note-gigdew):
//   walking: src/stage/night-square.js (12 degree lens, pitched 24 degrees down)
//   fights:  src/fx/arena.js, makeArenaField.view (38 degree lens, 2 m up, 18 m back, pitched 4.2 degrees up)
window.MF_PILOT = {
  // the witches' rig, copied from models/jester-3d/viewer/stage.js (branch claude/jester-3d-model); the guides are lit with it
  rig: {
    hemi: { sky: 0xc8bcc4, ground: 0x4a3438, k: 0.40 },
    key: { color: 0xffeedd, k: 0.72, from: [1.7, 2.7, 3.2] },        // from the viewer's side, to the right, about 37 degrees up
    rim: { color: 0xd8b8ff, k: 0.30, from: [-1.8, 2.6, -3.2] },      // the moon: behind, upper left
    back: { color: 0xffeedd, k: 0.42, from: [-1.2, 3.0, -3.4] },
    fill: { color: 0xc8ccff, k: 0.26, from: [-2.6, 1.2, 2.4] },
  },
  scenes: {
    W1: {
      id: 'W1', kind: 'walk', name: 'The fair square', file: 'W1_fair_square',
      frame: [2048, 1024],
      // a fixed camera for the whole painting; the screen shows a 16:9 crop of it that follows the witch
      camera: { fov: 12, pitch: 24, target: [0, 0, -2.5], span: 15 },   // span: meters of view across the frame's height, at the target
      skyBand: 0.15,                                                     // the top of the painting is backdrop: skyline and sky
      moon: { u: 0.105, v: 0.072, d: 0.085 },                             // Auros: centre across, centre down, width, as shares of the frame's height for d
      figure: [-2.2, 2.4],
      square: { r: 7 },
      lanes: [ { name: 'to the mooring field (W3)', a: [-6, 0.3], b: [-17, 0.8], w: 4.2 }, { name: 'to the stall row (W2)', a: [6, 0.3], b: [17, 0.8], w: 4.2 } ],
      cloth: { name: "the Jester's floor cloth", x: 0, z: -3.6, w: 4.4, d: 3.0 },
      well: { name: 'the well (rest and save)', x: 3.9, z: 2.6, r: 0.95 },
      posts: { r: 7.9, h: 3.3, at: [28, 62, 118, 152, 208, 242, 298, 332] },          // lantern posts, degrees round the square
      tents: [
        { name: 'round striped tent', kind: 'round', x: -8.6, z: -12.0, r: 2.7, wall: 2.2, top: 5.0 },
        { name: 'stall', kind: 'stall', x: -2.2, z: -11.2, w: 3.4, d: 1.7, h: 2.3 },
        { name: 'stall', kind: 'stall', x: 2.6, z: -11.4, w: 3.0, d: 1.7, h: 2.3 },
        { name: 'square tent', kind: 'square', x: 9.2, z: -12.0, w: 4.6, d: 4.2, wall: 2.3, top: 4.6 },
        { name: 'square tent', kind: 'square', x: -12.6, z: -5.6, w: 4.2, d: 4.0, wall: 2.2, top: 4.3 },
        { name: 'stall', kind: 'stall', x: -11.4, z: 5.4, w: 3.2, d: 1.7, h: 2.3, turn: 55 },
        { name: 'stall', kind: 'stall', x: 11.6, z: -5.2, w: 3.2, d: 1.7, h: 2.3, turn: -60 },
        { name: 'round tent', kind: 'round', x: 12.8, z: 5.8, r: 2.4, wall: 2.1, top: 4.4 },
      ],
      props: [
        { name: 'wagon', kind: 'box', x: -5.2, z: 10.4, w: 3.2, d: 1.6, h: 1.5, turn: 12 },
        { name: 'crates and barrels', kind: 'box', x: 5.6, z: 10.2, w: 2.2, d: 1.4, h: 1.0, turn: -8 },
        { name: 'crates', kind: 'box', x: 7.4, z: 9.6, w: 0.9, d: 0.9, h: 1.5 },
      ],
      skyline: 'the big top and the tops of more tents, small against the dusk sky',
    },
    F1: {
      id: 'F1', kind: 'fight', name: 'The moor clearing', file: 'F1_moor_clearing',
      frame: [2048, 1536],
      camera: { fov: 38, h: 2, z: 18, pitch: -4.2 },                     // pitch is degrees down; this one looks 4.2 degrees up
      horizon: 0.61,
      moon: { u: 0.31, v: 0.17, d: 0.13 },
      figure: [-2.2, 0.6],
      clear: { x: 0, z: 0, rx: 7.5, rz: 4.2 },
      // where everyone stands in a fight (from the demo world plan): the party on the left, the foes on the right
      party: [ ['Jester', -2.2, 0.6], ['Ranger', -3.6, -1.4], ['Fox', -3.8, 2.0], ['Io', -5.2, 0.2] ],
      foes: [ ['foe', 2.6, 0.8], ['foe', 3.8, -1.2], ['boss', 4.5, 0], ['foe', 5.4, 1.8] ],
    },
  },
};
