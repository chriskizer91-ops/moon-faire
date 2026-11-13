// The painted scenes as data, for the game. Layouts in meters come from pilot/scenes-pilot.js (the same numbers the grey-box
// guides were drawn from); this file adds what the game needs on top: the painting, where a witch can walk, exits, spots.
// Meters, y up; the camera looks from +z toward -z; screen right is +x. Every name and every line of words is a placeholder.
(function () {
  'use strict';
  const P = window.MF_PILOT.scenes;
  window.MF_SCENES = {
    W1: {
      id: 'W1', kind: 'walk', name: 'The fair square', art: 'W1', frame: [1774, 887],
      camera: P.W1.camera, layout: P.W1,
      show: 0.62, close: 1.4,                             // and Chris asked for her 30 to 50% larger than that (November 13), so the window is drawn in by this much
                                              // the screen shows this share of the painting's width
      start: { x: -1.6, z: 3.4, face: 0.5 },
      // open ground: the round square and the mouths of the two lanes. Further along, each lane runs behind a stall roof or a
      // tent top (my layout's fault, not the painting's), so the scene changes at the mouth, where she can still be seen.
      walk: { discs: [{ x: 0, z: 0, r: 8.7 }], boxes: [{ x0: -10.9, x1: 10.9, z0: -1.55, z1: 2.7 }] },
      blockers: [{ x: 3.9, z: 2.6, r: 1.35 }],            // the well; the lantern posts are added from the layout
      exits: [
        { side: 'left', x: -10.5, to: 'W3', say: 'The lane to the mooring field. That scene is not painted yet.' },
        { side: 'right', x: 10.5, to: 'W2', say: 'The lane to the stall row. That scene is not painted yet.' },
      ],
      spots: [
        { id: 'well', x: 3.9, z: 2.6, r: 2.3, prompt: 'Rest at the well', say: 'Rested. Saving comes with the rest of the game.' },
        { id: 'cloth', x: 0, z: -3.6, r: 1.6, prompt: 'Take a bow on the floor cloth', act: 'bow' },
      ],
      rig: { key: 1, rim: 1 },                            // a scene may nudge the rig: key x0.85 to 1.1, rim x0.8 to 1.4
      lampLight: { color: 0xffb768, k: 0.55, reach: 7, h: 2.85 },
    },
    F1: {
      id: 'F1', kind: 'fight', name: 'The moor clearing', art: 'F1', frame: [1448, 1086],
      camera: P.F1.camera, layout: P.F1,
      centre: [0, -2],                                    // the middle of the fight, a little behind where the guide drew it, so feet clear the bottom of a 16:9 screen
      party: { jester: [-2.2, 0.6], ranger: [-3.6, -1.4], fox: [-3.8, 2.0], io: [-5.2, 0.2] },
      foes: [[2.6, 0.8], [3.9, -1.3], [5.3, 1.9], [4.6, 0.1]],
      wideTop: 80,                                        // the wide shot's top edge in painting pixels: it keeps Auros whole
      rig: { key: 1, rim: 1 },
    },
  };
})();
