// ow-dressing.js: more to each explorable area, from the pieces and pictures that already exist.
//   The fair: one continuous fairground round its three painted places (about 140 m by 75 m): lanes of worn earth joining them and
//   running round behind and in front of them, rows of stalls and tents facing the lanes with their backs to the outside, booths, lantern
//   posts along the lanes, small yards with a brazier, crates, barrels, bales, carts and tables in groups, the fair folk's own wagons drawn
//   up along the quiet north edge, and lines of small bunting flags over the lanes. Its ground is levelled and trampled by land.js
//   (R.fairground, set below from these tables, so the page and the land worker agree).
//   The moor places: each grows outward with more of what its own painting shows (wall runs, rocks, standing stones, thorn trees, gorse,
//   bracken, reeds), drawn with ow-props.js's own shapes (OW.dressing.rocks and .walls, and the places' bushes).
// No names, signs, writing, people, creatures or story objects: only dressing.
// Every piece is a row in the tables below: cut a row to take it away, change its numbers to move it. World metres: x east, z south;
// turn in degrees about the up axis, 0 = the piece's front faces south (+z), 90 = east, 180 = north, -90 = west.
(function (OW) {
  'use strict';

  // ===================================================================== THE FAIRGROUND =====================================================================
  // its outline (the trampled, level ground; no encounter starts inside it), the height it is levelled to, and how far it blends into the land round it
  const FAIRGROUND = { level: 3.0, blend: 18,
    outline: [[-267, 72], [-258, 55], [-246, 51], [-160, 51], [-145, 60], [-134, 72], [-132, 96], [-134, 114], [-142, 130], [-160, 133], [-250, 133], [-262, 124], [-268, 108]] };
  // the lanes: worn earth, 4 m wide (the lane from the west road through the three places to the gate and the moor road is the map's own roads)
  const LANES = [
    { name: 'the back lane, behind the places', w: 4, pts: [[-256, 88.6], [-253.6, 79.5], [-247.5, 72.6], [-237, 70.2], [-222, 69.8], [-210, 70.6], [-200, 73.6], [-189, 75.8], [-177, 76.6], [-170, 78.2], [-167.6, 83], [-167.5, 96.9]] },
    { name: 'the front lane, before the places', w: 4, pts: [[-252.6, 91.8], [-252.2, 103.5], [-247.6, 113], [-237, 118.4], [-222, 119.6], [-206, 118.8], [-190, 117.4], [-176, 117.8], [-167.5, 116.8], [-157, 118], [-149, 119.6]] },
    { name: 'the cross lane between the square and the stall row', w: 4, pts: [[-205.2, 71.6], [-205.6, 84], [-205.8, 97.2], [-206.2, 108], [-206, 118.8]] },
    { name: 'the cross lane between the stall row and the mooring field', w: 4, pts: [[-167.5, 96.9], [-167.6, 106], [-167.5, 116.8]] },
  ];
  // the pieces: [kind, x, z, turn, options]. Kinds and options are ow-kit.js's: stall { front: lamp|brass|herb|moon, w, d, h },
  // tentRound { r, wall, top, canvas: red|blue|damask, trim: scallop|bigtop, door/roof: bigtop }, tentSquare { w, d, wall, top, canvas, trim },
  // booth { w, d, h }, wagon { w, d, roof: shingle }, lanternPost { h }, crate/crateTall/bale/table { w, d, h }, barrel/keg { r, h }, rope { r, h },
  // brazier { w }, pieCart. lift: metres above the ground (a crate stacked on another). Lantern posts hang their lamp toward the lane.
  const FAIR = [
    // ---- the north row: stalls and tents facing the back lane, behind the square ----
    ['tentRound', -242.5, 66.0, 10, { r: 2.4, wall: 2.0, top: 4.4, canvas: 'red', trim: 'scallop' }],
    ['stall', -236.4, 66.5, 2, { front: 'lamp' }],
    ['stall', -232.8, 66.35, -2, { front: 'brass' }],
    ['lanternPost', -230.4, 67.4, -90, {}],
    ['tentSquare', -227.2, 65.5, 0, { w: 3.6, d: 3.2, wall: 2.1, top: 3.8, canvas: 'damask', trim: 'scallop' }],
    ['stall', -222.0, 66.1, 2, { front: 'herb' }],
    ['stall', -218.4, 66.15, -1, { front: 'moon' }],
    // a small yard off the back lane: a brazier, a table and kegs, a bale to sit on
    ['lanternPost', -215.4, 67.5, -90, {}],
    ['brazier', -212.6, 64.4, 0, { w: 0.8 }],
    ['table', -214.6, 62.6, 10, { w: 1.0, d: 0.7 }],
    ['keg', -213.5, 61.5, 0, {}],
    ['keg', -215.7, 61.7, 30, {}],
    ['bale', -209.9, 64.6, 75, { w: 1.1, d: 0.55, h: 0.5 }],
    ['booth', -207.2, 67.0, -12, { w: 3.6, d: 2.2, h: 2.8 }],
    // ---- the north row behind the stall row: the second big top, then stalls ----
    ['tentRound', -197.0, 67.9, -11, { r: 3.2, wall: 2.4, top: 5.4, canvas: 'damask', door: 'bigtop', roof: 'bigtop', trim: 'bigtop' }],
    ['stall', -190.8, 71.7, -10, { front: 'lamp' }],
    ['stall', -187.2, 72.2, -4, { front: 'moon' }],
    ['lanternPost', -184.9, 73.4, -90, {}],
    ['stall', -182.4, 72.5, -4, { front: 'brass' }],
    ['stall', -178.8, 72.8, -6, { front: 'herb' }],
    ['tentRound', -173.0, 72.4, 0, { r: 2.2, wall: 2.0, top: 4.0, canvas: 'blue', trim: 'scallop' }],
    ['tentSquare', -166.4, 72.6, -20, { w: 3.4, d: 3.0, wall: 2.0, top: 3.6, canvas: 'red', trim: 'scallop' }],
    ['lanternPost', -164.9, 81.0, 180, {}],
    // ---- between the back lane and the places' backs: small stacks ----
    ['crate', -239.5, 75.8, 5, { w: 1.1, d: 0.9, h: 0.75 }],
    ['crateTall', -238.0, 75.9, -8, { w: 0.75, d: 0.75, h: 1.4 }],
    ['barrel', -240.9, 75.9, 0, {}],
    ['bale', -225.0, 75.9, 3, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -223.7, 75.85, -4, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -224.3, 75.9, 1, { w: 1.1, d: 0.55, h: 0.5, lift: 0.5 }],
    ['keg', -222.3, 76.0, 0, {}],
    ['barrel', -213.8, 76.2, 0, {}],
    ['keg', -212.9, 75.5, 0, {}],
    ['crate', -193.0, 79.8, -10, { w: 1.2, d: 0.9, h: 0.75 }],
    ['crate', -193.1, 79.8, -2, { w: 0.8, d: 0.7, h: 0.5, lift: 0.75 }],
    ['bale', -183.2, 80.0, 6, { w: 1.1, d: 0.55, h: 0.5 }],
    ['rope', -181.4, 80.1, 0, { r: 0.5, h: 0.32 }],
    // ---- the quiet edge: the fair folk's own wagons drawn up along the north, and their camp's brazier ----
    ['wagon', -247.0, 59.5, 20, {}],
    ['wagon', -238.0, 57.6, 6, {}],
    ['wagon', -229.0, 58.2, -6, { roof: 'shingle' }],
    ['brazier', -221.5, 59.4, 0, { w: 0.8 }],
    ['bale', -223.5, 58.2, 60, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -219.5, 58.4, -50, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -221.6, 61.4, 5, { w: 1.1, d: 0.55, h: 0.5 }],
    ['rope', -224.8, 61.0, 0, { r: 0.45, h: 0.3 }],
    ['table', -218.0, 61.6, -15, { w: 1.0, d: 0.7 }],
    ['keg', -217.0, 60.6, 0, {}],
    ['wagon', -213.0, 58.0, 12, {}],
    ['wagon', -203.5, 57.2, -3, { roof: 'shingle' }],
    ['barrel', -198.8, 58.0, 0, {}],
    ['barrel', -198.2, 58.9, 0, { r: 0.36 }],
    ['wagon', -194.0, 58.0, 8, {}],
    ['wagon', -184.5, 59.2, -12, {}],
    ['crate', -180.2, 60.2, 20, { w: 1.1, d: 0.9, h: 0.75 }],
    ['wagon', -176.0, 61.6, -28, { roof: 'shingle' }],
    // ---- the north-west corner, where the west road comes in: lanterns either side of the road, a tent and a stall at the back lane's bend ----
    ['lanternPost', -260.5, 82.8, -90, { h: 3.0 }],
    ['lanternPost', -263.3, 87.6, 90, { h: 3.0 }],
    ['tentSquare', -259.2, 71.4, 35, { w: 3.6, d: 3.2, wall: 2.0, top: 3.7, canvas: 'red', trim: 'scallop' }],
    ['stall', -253.4, 73.4, 49, { front: 'moon' }],
    ['wagon', -257.6, 61.4, 40, {}],
    ['bale', -252.6, 60.0, 15, { w: 1.1, d: 0.55, h: 0.5 }],
    ['barrel', -253.2, 62.6, 0, {}],
    ['crate', -250.0, 81.0, 15, { w: 1.1, d: 0.9, h: 0.75 }],
    ['barrel', -249.3, 82.5, 0, {}],
    // ---- west of the square, by the front lane ----
    ['barrel', -261.0, 93.6, 0, {}],
    ['keg', -260.1, 94.4, 0, {}],
    ['crate', -258.2, 93.4, -10, { w: 1.1, d: 0.9, h: 0.75 }],
    ['lanternPost', -255.2, 99.6, 0, {}],
    ['tentRound', -259.5, 103.6, 0, { r: 2.4, wall: 2.0, top: 4.3, canvas: 'red', trim: 'scallop' }],
    ['stall', -253.4, 110.0, 116, { front: 'herb' }],
    ['booth', -246.4, 106.6, -64, { w: 3.4, d: 2.0, h: 2.7 }],
    // ---- the south row: stalls and tents facing the front lane, before the square ----
    ['tentRound', -241.5, 122.6, 0, { r: 2.4, wall: 2.0, top: 4.3, canvas: 'damask', trim: 'scallop' }],
    ['stall', -235.2, 122.2, 176, { front: 'lamp' }],
    ['stall', -231.6, 122.5, 176, { front: 'moon' }],
    ['lanternPost', -229.2, 121.6, 90, {}],
    ['tentRound', -224.5, 124.8, 0, { r: 2.6, wall: 2.1, top: 4.6, canvas: 'red', trim: 'scallop' }],
    ['booth', -217.5, 123.4, 182, { w: 3.6, d: 2.2, h: 2.8 }],
    // a yard where the cross lane meets the front lane: the pie cart, a table, bales to sit on, a brazier
    ['pieCart', -211.8, 125.8, 170, {}],
    ['table', -213.9, 123.4, 5, { w: 1.0, d: 0.7 }],
    ['bale', -210.0, 123.0, 80, { w: 1.1, d: 0.55, h: 0.5 }],
    ['brazier', -207.6, 124.6, 0, { w: 0.8 }],
    ['bale', -205.6, 125.8, -30, { w: 1.1, d: 0.55, h: 0.5 }],
    ['stall', -202.0, 122.15, 185, { front: 'brass' }],
    ['stall', -198.4, 121.85, 185, { front: 'herb' }],
    ['lanternPost', -196.0, 120.6, 90, {}],
    ['tentSquare', -191.5, 121.9, 182, { w: 3.6, d: 3.2, wall: 2.1, top: 3.8, canvas: 'blue', trim: 'scallop' }],
    ['stall', -185.8, 121.2, 178, { front: 'lamp' }],
    ['stall', -182.2, 121.3, 178, { front: 'moon' }],
    ['crate', -179.2, 121.6, 10, { w: 1.1, d: 0.9, h: 0.75 }],
    ['crateTall', -178.4, 122.9, -6, { w: 0.75, d: 0.75, h: 1.4 }],
    ['tentRound', -174.5, 122.8, 0, { r: 2.4, wall: 2.0, top: 4.2, canvas: 'blue', trim: 'scallop' }],
    // a second rank of tents behind the south row, toward the fairground's edge
    ['tentSquare', -233.6, 128.4, 6, { w: 3.4, d: 3.0, wall: 2.0, top: 3.6, canvas: 'red', trim: 'scallop' }],
    ['tentRound', -215.0, 129.4, 0, { r: 2.0, wall: 1.9, top: 3.8, canvas: 'blue', trim: 'scallop' }],
    ['crate', -211.6, 130.0, 25, { w: 1.1, d: 0.9, h: 0.75 }],
    ['tentRound', -197.0, 128.0, 0, { r: 2.2, wall: 2.0, top: 4.0, canvas: 'red', trim: 'scallop' }],
    ['tentSquare', -184.0, 127.8, -8, { w: 3.4, d: 3.0, wall: 2.0, top: 3.6, canvas: 'damask', trim: 'scallop' }],
    ['barrel', -188.6, 127.4, 0, {}],
    ['keg', -189.2, 128.4, 0, {}],
    // ---- the yard south of the mooring field, where the front lane ends ----
    ['tentRound', -160.5, 123.4, 0, { r: 2.3, wall: 2.0, top: 4.1, canvas: 'red', trim: 'scallop' }],
    ['brazier', -153.0, 124.2, 0, { w: 0.8 }],
    ['bale', -155.0, 125.7, 30, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -151.0, 125.9, -40, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -153.3, 127.0, 0, { w: 1.1, d: 0.55, h: 0.5 }],
    ['table', -149.6, 123.6, 15, { w: 1.0, d: 0.7 }],
    ['keg', -148.6, 124.6, 0, {}],
    ['tentSquare', -145.0, 125.6, 200, { w: 3.4, d: 3.0, wall: 2.0, top: 3.6, canvas: 'damask', trim: 'scallop' }],
    ['lanternPost', -146.0, 120.3, 180, {}],
    // ---- between the front lane and the places' fronts: low things only (they stand below the paintings' own view) ----
    ['crate', -236.0, 114.6, 8, { w: 1.1, d: 0.9, h: 0.75 }],
    ['barrel', -234.6, 114.9, 0, {}],
    ['lanternPost', -226.0, 116.7, -90, {}],
    ['bale', -220.5, 115.0, -6, { w: 1.1, d: 0.55, h: 0.5 }],
    ['bale', -219.4, 115.4, 70, { w: 1.1, d: 0.55, h: 0.5 }],
    ['crate', -193.5, 112.5, -12, { w: 1.2, d: 0.9, h: 0.75 }],
    ['crate', -193.4, 112.5, 4, { w: 0.8, d: 0.7, h: 0.5, lift: 0.75 }],
    ['lanternPost', -188.0, 114.8, -90, {}],
    ['barrel', -183.6, 112.8, 0, {}],
    ['keg', -182.8, 113.6, 0, {}],
    ['lanternPost', -158.4, 115.0, -90, {}],
    ['bale', -150.8, 112.5, 10, { w: 1.1, d: 0.55, h: 0.5 }],
    ['crate', -146.8, 112.0, -15, { w: 1.1, d: 0.9, h: 0.75 }],
    // ---- in the gaps between the places, either side of the cross lanes ----
    ['barrel', -210.8, 106.2, 0, {}],
    ['keg', -211.6, 107.3, 0, {}],
    ['crate', -201.2, 109.0, 12, { w: 1.1, d: 0.9, h: 0.75 }],
    ['crateTall', -200.4, 110.6, -5, { w: 0.75, d: 0.75, h: 1.4 }],
    ['table', -172.6, 88.0, 90, { w: 1.0, d: 0.7 }],
    ['keg', -172.6, 86.6, 0, {}],
    ['keg', -172.2, 89.4, 0, {}],
    ['crate', -163.4, 88.6, 20, { w: 0.9, d: 0.8, h: 0.7 }],
    ['bale', -172.6, 108.0, 20, { w: 1.1, d: 0.55, h: 0.5 }],
    ['barrel', -162.4, 108.4, 0, {}],
    ['barrel', -161.7, 109.2, 0, { r: 0.35 }],
    ['lanternPost', -203.2, 69.0, -90, {}],
  ];
  // bunting: a line of small flags in the canvases' colours between two poles: [[x, z] of one pole, [x, z] of the other, the poles' height, the sag]
  const BUNTING = [
    [[-209.0, 94.0], [-202.5, 100.6], 4.2, 0.7], [[-202.5, 94.0], [-209.0, 100.6], 4.2, 0.7],          // a cross over where the cross lane meets the fair lane
    [[-171.2, 93.8], [-164.0, 100.2], 4.2, 0.7], [[-164.0, 93.8], [-171.2, 100.2], 4.2, 0.7],          // and over the other crossing
    [[-239.3, 68.1], [-231.8, 72.7], 4.2, 0.6], [[-231.8, 72.7], [-224.5, 67.2], 4.2, 0.6], [[-224.5, 67.2], [-217.0, 72.8], 4.2, 0.6], [[-217.0, 72.8], [-210.5, 67.9], 4.2, 0.6],   // along the back lane
    [[-238.0, 120.8], [-229.3, 116.4], 3.9, 0.6], [[-229.3, 116.4], [-220.5, 122.1], 3.9, 0.6], [[-220.5, 122.1], [-212.5, 116.5], 3.9, 0.6], [[-212.5, 116.5], [-205.0, 121.3], 3.9, 0.6],   // along the front lane
    [[-197.0, 115.5], [-188.6, 120.0], 3.9, 0.6], [[-188.6, 120.0], [-180.5, 115.1], 3.9, 0.6], [[-180.5, 115.1], [-171.6, 119.9], 3.9, 0.6],
    [[-208.0, 76.5], [-202.7, 86.5], 4.2, 0.6],                                                        // over the north cross lane
  ];

  // ===================================================================== THE MOOR PLACES =====================================================================
  // walls: drystone, as ow-props.js draws the map's walls (a run of pieces 1 m long, a little uneven): { pts: [[x, z], ...], h }. A gap is
  // a new run. rocks: ow-props.js's moor rock, [x, z, half-width, height above its middle, half-depth, turn, lean (degrees, sideways)]
  // (tall and narrow: a standing stone; long and low: a fallen one). bushes: [kind (gorse | thorn | reed | bracken), x, z, radius, height].
  const MOOR = {
    walls: [
      // the Last Lantern (W4): the broken walls go on along both sides of the road, west toward the fair and east along the stones track
      { pts: [[19.2, 95.8], [12.6, 95.4]], h: 1.0 }, { pts: [[10.8, 95.3], [3.0, 94.8]], h: 0.9 }, { pts: [[0.8, 94.6], [-6.5, 94.3]], h: 0.75 },
      { pts: [[43.2, 95.2], [49.5, 94.0]], h: 1.0 }, { pts: [[51.4, 93.4], [57.5, 90.8]], h: 0.9 }, { pts: [[59.6, 89.8], [64.0, 87.6]], h: 0.7 },
      { pts: [[21.6, 107.3], [16.6, 107.5]], h: 0.75 }, { pts: [[14.6, 107.4], [8.2, 107.0]], h: 0.65 }, { pts: [[5.6, 106.9], [0.6, 106.6]], h: 0.55 },
      { pts: [[41.6, 107.4], [47.5, 107.0]], h: 0.75 }, { pts: [[49.6, 106.4], [55.5, 104.6]], h: 0.65 }, { pts: [[57.6, 103.8], [62.5, 101.0]], h: 0.55 },
      // a tumbled sheepfold north of the track: a ring of low wall with its gaps
      { pts: [[51.6, 82.4], [50.6, 84.7], [48.4, 85.9], [46.0, 85.8], [43.9, 84.5]], h: 0.8 },
      { pts: [[42.4, 81.2], [42.6, 78.7], [44.0, 76.9]], h: 0.6 },
      { pts: [[47.6, 76.2], [49.8, 77.0], [51.4, 78.8], [51.9, 80.4]], h: 0.7 },
    ],
    rocks: [
      // W4: boulders out on the moor round it, and tumbled stones in the walls' gaps and round the fold
      [12.5, 91.6, 1.4, 1.0, 1.1, 20, 4], [2.5, 111.0, 1.2, 0.8, 1.0, 70, 0], [46.5, 112.0, 1.5, 1.0, 1.2, 10, 5], [37.5, 117.5, 1.1, 0.7, 0.9, 40, 0],
      [55.5, 85.8, 1.0, 0.7, 0.9, 0, 0], [24.0, 84.4, 1.3, 0.9, 1.0, 60, 3], [-3.5, 89.0, 1.2, 0.8, 1.1, 30, 0],
      [11.7, 95.7, 0.45, 0.35, 0.4, 10, 0], [1.9, 94.9, 0.5, 0.3, 0.4, 40, 0], [50.5, 94.1, 0.45, 0.35, 0.45, 0, 0], [58.5, 90.6, 0.4, 0.3, 0.35, 60, 0],
      [15.6, 107.7, 0.45, 0.3, 0.4, 0, 0], [6.9, 107.2, 0.5, 0.35, 0.4, 25, 0], [48.6, 106.9, 0.45, 0.3, 0.4, 70, 0], [56.6, 104.5, 0.4, 0.3, 0.35, 0, 0],
      [42.8, 80.0, 0.45, 0.3, 0.4, 0, 0], [45.6, 76.0, 0.5, 0.35, 0.45, 30, 0], [52.6, 81.4, 0.4, 0.3, 0.35, 50, 0], [41.6, 83.0, 0.5, 0.3, 0.4, 10, 0],
      // the standing stones (W5): outlying stones on the approach from the west, low and leaning, some fallen, either side of the track
      [146.5, 43.4, 0.48, 1.2, 0.36, 15, 8], [142.0, 31.2, 0.58, 2.0, 0.42, 20, 14], [138.5, 41.8, 0.52, 1.45, 0.38, -10, -18], [133.0, 30.8, 1.7, 0.4, 0.5, 70, 0],
      [129.6, 42.5, 0.62, 2.2, 0.44, 5, 10], [124.8, 33.6, 0.52, 0.95, 0.44, 30, 4], [121.5, 46.8, 1.5, 0.38, 0.55, -30, 0], [118.0, 37.2, 0.58, 1.7, 0.42, 50, -22],
      // the hollow (W7): its rock walls go on round the rim as outcrops, the climb out to the north left open
      [144.5, 88.0, 2.6, 2.2, 2.2, 20, 0], [143.2, 94.5, 2.4, 2.6, 2.0, 70, 0], [145.0, 101.0, 2.2, 2.0, 2.4, 10, 0], [147.5, 107.5, 1.8, 1.5, 1.8, 40, 0],
      [177.5, 88.5, 2.4, 2.4, 2.2, 0, 0], [178.8, 95.0, 2.6, 2.2, 2.0, 60, 0], [177.0, 101.5, 2.2, 2.0, 2.2, 20, 0], [174.5, 107.8, 1.8, 1.6, 1.8, 80, 0],
      [150.5, 79.0, 2.4, 2.0, 2.0, 30, 0], [155.0, 77.2, 1.8, 1.6, 1.8, 0, 0], [168.5, 78.0, 2.0, 1.8, 2.0, 50, 0], [173.0, 80.4, 2.6, 2.2, 2.2, 10, 0],
      [147.6, 84.6, 0.8, 0.6, 0.7, 0, 0], [141.0, 98.0, 0.9, 0.7, 0.8, 0, 0], [174.6, 84.8, 0.8, 0.6, 0.7, 0, 0], [181.6, 92.0, 0.9, 0.7, 0.9, 0, 0], [152.6, 81.6, 0.7, 0.5, 0.6, 0, 0],
      // the still pool and the broken arch (W6): tumbled stone round the arch, and rock outcrops on the far bank
      [285.0, 85.2, 0.55, 0.35, 0.45, 20, 0], [287.6, 84.6, 0.4, 0.3, 0.35, 0, 0], [291.2, 85.4, 0.5, 0.35, 0.4, 60, 0], [283.4, 82.6, 0.7, 0.45, 0.55, 10, 0],
      [289.5, 82.0, 0.45, 0.3, 0.4, 0, 0], [293.8, 83.0, 1.1, 0.4, 0.5, 15, 0], [286.5, 80.6, 0.5, 0.35, 0.45, 40, 0],
      [281.0, 76.5, 2.4, 2.0, 2.2, 10, 0], [287.5, 74.0, 2.0, 1.6, 2.2, 60, 0], [295.5, 75.5, 2.6, 2.2, 2.0, 30, 0], [302.5, 79.0, 2.0, 1.8, 1.8, 0, 0], [274.5, 80.5, 1.8, 1.6, 2.0, 20, 0],
    ],
    bushes: [
      // W4: more thorn trees out on the moor, gorse along the walls, reeds round the small pools north of the wall
      ['thorn', 14.5, 88.0, 1.4, 3.0], ['thorn', 54.5, 113.5, 1.2, 2.6], ['thorn', 8.0, 117.0, 1.4, 3.2], ['thorn', 60.0, 83.0, 1.3, 2.8],
      ['gorse', 16.0, 93.0, 1.0, 1.0], ['gorse', 45.5, 92.4, 1.1, 1.0], ['gorse', 8.5, 109.6, 0.9, 0.9], ['gorse', 52.5, 108.9, 1.0, 1.0],
      ['reed', 23.6, 90.2, 0.8, 1.1], ['reed', 24.8, 89.0, 0.7, 1.0], ['reed', 27.5, 89.2, 0.8, 1.2], ['reed', 28.5, 90.8, 0.7, 1.0],
      ['reed', -5.0, 69.0, 0.9, 1.2], ['reed', -3.5, 73.6, 0.8, 1.1], ['reed', 3.0, 75.8, 0.9, 1.2], ['reed', 9.5, 75.4, 0.8, 1.1],
      ['reed', 14.5, 71.5, 0.9, 1.2], ['reed', 13.0, 65.4, 0.8, 1.0], ['reed', 5.0, 63.8, 0.9, 1.1], ['reed', -2.5, 65.0, 0.8, 1.0],
      // W5: gorse ringing the rise (its south side has the map's own gorse)
      ['gorse', 137.8, 28.8, 1.1, 1.1], ['gorse', 141.3, 21.2, 1.1, 1.1], ['gorse', 143.0, 19.6, 0.9, 0.9], ['gorse', 147.2, 15.3, 1.1, 1.0], ['gorse', 154.8, 11.8, 1.1, 1.1],
      ['gorse', 156.6, 11.0, 0.9, 0.9], ['gorse', 163.1, 11.1, 1.1, 1.0], ['gorse', 171.1, 13.2, 1.1, 1.1], ['gorse', 172.6, 14.6, 0.9, 0.9], ['gorse', 178.0, 18.0, 1.1, 1.0],
      ['gorse', 182.8, 24.9, 1.1, 1.1], ['gorse', 182.8, 45.1, 1.1, 1.0], ['gorse', 184.4, 43.6, 0.9, 0.9], ['gorse', 178.0, 52.0, 1.1, 1.1], ['gorse', 142.6, 50.4, 1.1, 1.0],
      // W7: bracken and gorse on the hollow's rim
      ['bracken', 146.8, 84.0, 1.0, 0.55], ['bracken', 140.6, 99.5, 1.1, 0.6], ['bracken', 150.0, 110.4, 1.0, 0.55], ['bracken', 176.2, 84.0, 1.0, 0.55],
      ['bracken', 181.2, 98.8, 1.1, 0.6], ['bracken', 172.0, 111.0, 1.0, 0.55], ['bracken', 153.8, 82.2, 0.9, 0.5], ['bracken', 170.2, 81.6, 0.9, 0.5],
      ['gorse', 141.6, 90.8, 1.05, 1.1], ['gorse', 147.0, 97.6, 1.0, 1.0], ['gorse', 176.4, 92.0, 1.05, 1.1], ['gorse', 180.8, 104.2, 1.0, 1.0], ['gorse', 157.4, 79.4, 0.9, 0.9], ['gorse', 165.4, 79.6, 0.9, 0.9],
      // W6: more reeds beyond the fallen span and along the far bank
      ['reed', 296.5, 81.6, 0.8, 1.2], ['reed', 299.2, 79.8, 0.9, 1.3], ['reed', 292.0, 79.6, 0.7, 1.1], ['reed', 283.6, 79.0, 0.8, 1.1], ['reed', 277.8, 83.0, 0.8, 1.1],
      ['reed', 301.0, 83.2, 0.7, 1.0], ['reed', 294.4, 80.4, 0.6, 1.0],
    ],
  };

  // the land reads the fairground from R (land.js is self-contained: it is also sent to the land's worker as text, with R)
  const D = window.OW_DATA; if (D && D.R) D.R.fairground = { outline: FAIRGROUND.outline, level: FAIRGROUND.level, blend: FAIRGROUND.blend, lanes: LANES.map((l) => ({ pts: l.pts, w: l.w })) };
  OW.dressingData = { FAIRGROUND, LANES, FAIR, BUNTING, MOOR };

  // the pieces' brightness, to sit with the nearest painted place's own (ow-places.js KIT_GAIN, by eye), a little under it away from the lamps
  const GAIN = [[-228, [1.32, 1.36, 1.3]], [-188, [1.16, 1.26, 1.18]], [-148, [0.88, 0.82, 0.85]]], GAIN_K = 0.9;
  function gainAt(x) {
    if (x <= GAIN[0][0]) return GAIN[0][1].map((v) => v * GAIN_K); if (x >= GAIN[GAIN.length - 1][0]) return GAIN[GAIN.length - 1][1].map((v) => v * GAIN_K);
    for (let i = 0; i < GAIN.length - 1; i++) { const a = GAIN[i], b = GAIN[i + 1]; if (x <= b[0]) { const t = (x - a[0]) / (b[0] - a[0]); return a[1].map((v, k) => (v + (b[1][k] - v) * t) * GAIN_K); } }
    return [1, 1, 1];
  }

  // ---- bunting: thin poles, a sagging cord and little triangles of the three canvases, as geometry for the kit's own material ----
  function bunting(land) {
    const pos = [], nrm = [], uv = [], kk = [], blockers = [], poles = new Map(); let seed = 1114; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const put = (p, n, t, id, k) => { pos.push(p[0], p[1], p[2]); nrm.push(n[0], n[1], n[2]); uv.push(t[0], t[1]); kk.push(k[0], k[1], k[2], id); };
    const tri = (a, b, c, ta, tb, tc, n, id, k) => { put(a, n, ta, id, k); put(b, n, tb, id, k); put(c, n, tc, id, k); };
    const WOOD = 2, DARK = 3, CANV = [7, 8, 9];                    // ow-kit.js's picture numbers: planks, dark planks, the red, blue and damask canvases
    for (const [p0, p1, h, sag] of BUNTING) {
      for (const p of [p0, p1]) { const key = p[0] + ',' + p[1]; if (poles.has(key)) { poles.set(key, Math.max(poles.get(key), h)); continue; } poles.set(key, h); }
      const y0 = land.height(p0[0], p0[1]) + h - 0.12, y1 = land.height(p1[0], p1[1]) + h - 0.12, dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L;
      const at = (t) => [p0[0] + dx * t, y0 + (y1 - y0) * t - sag * 4 * t * (1 - t), p0[1] + dz * t];
      const n = Math.max(4, Math.round(L / 0.5)), gk = gainAt((p0[0] + p1[0]) / 2), ck = [0.45 * gk[0], 0.4 * gk[1], 0.36 * gk[2]];
      for (let i = 0; i < n; i++) {                                // the cord: a thin ribbon
        const a = at(i / n), b = at((i + 1) / n), c = [b[0], b[1] + 0.03, b[2]], d = [a[0], a[1] + 0.03, a[2]], N = [nx, 0, nz];
        tri(a, b, c, [0, 0], [0.3, 0], [0.3, 0.02], N, DARK, ck); tri(a, c, d, [0, 0], [0.3, 0.02], [0, 0.02], N, DARK, ck);
      }
      for (let i = 1; i < n; i++) {                                // a flag hung at each step, its tip swung a little by the wind
        const t = i / n, w = 0.13 / L, a = at(t - w), b = at(t + w), m = at(t), sw = (rnd() - 0.5) * 0.12, tip = [m[0] + nx * sw, m[1] - 0.3 - rnd() * 0.05, m[2] + nz * sw];
        const id = CANV[Math.floor(rnd() * 3)], u = rnd() * 4, v = rnd() * 4, s = 0.08, fk = gk.map((g) => g * 0.95);
        tri(a, b, tip, [u, v + s], [u + s, v + s], [u + s / 2, v], [nx, 0.2, nz], id, fk);
      }
    }
    for (const [key, h] of poles) {                                // the poles: six-sided, of the planks' picture
      const [x, z] = key.split(',').map(Number), y = land.height(x, z) - 0.05, r = 0.055, k = gainAt(x).map((g) => g * 0.7), S = 6;
      for (let i = 0; i < S; i++) { const q0 = i / S * 6.2832, q1 = (i + 1) / S * 6.2832, P = (q, yy) => [x + Math.sin(q) * r, yy, z + Math.cos(q) * r], N = (q) => [Math.sin(q), 0, Math.cos(q)];
        put(P(q0, y), N(q0), [0, 0], WOOD, k); put(P(q1, y), N(q1), [0.05, 0], WOOD, k); put(P(q1, y + h + 0.05), N(q1), [0.05, h / 1.6], WOOD, k);
        put(P(q0, y), N(q0), [0, 0], WOOD, k); put(P(q1, y + h + 0.05), N(q1), [0.05, h / 1.6], WOOD, k); put(P(q0, y + h + 0.05), N(q0), [0, h / 1.6], WOOD, k); }
      blockers.push({ x, z, r: 0.12 });
    }
    const g = new THREE.BufferGeometry(), F = (a, n) => new THREE.Float32BufferAttribute(a, n);
    g.setAttribute('position', F(pos, 3)); g.setAttribute('normal', F(nrm, 3)); g.setAttribute('uv', F(uv, 2)); g.setAttribute('aK', F(kk, 4)); g.computeBoundingSphere();
    return { geometry: g, gain: [1, 1, 1], blockers, poles: poles.size, flags: BUNTING.length };
  }

  // ---- the whole of it: the fairground's pieces join the fair places' own kit mesh (no new draw), their blockers, lamps and fires join
  // the places' (so ow-main.js keeps encounters away from the lamps and makes the braziers' flames), and the moor places' bushes, rocks and
  // walls are handed to ow-props.js, which draws them with its own (OW.dressing.rocks, .walls) ----
  OW.makeDressing = function (scene, land, places) {
    const KIT = OW.kit, out = { blockers: [], lamps: [], fires: [], rocks: [], walls: [], counts: {}, triangles: 0 };
    OW.dressing = out;
    const A = window.OW_DATA.kit && window.OW_DATA.kit.atlas;
    if (KIT && A) {
      if (!KIT.heightAt) KIT.heightAt = (x, z) => land.height(x, z);
      const B = KIT.batch({ gain: [1, 1, 1] });
      for (const [kind, x, z, turn, o] of FAIR) {
        if (!B[kind]) { console.warn('ow-dressing: no kit piece called', kind); continue; }
        const opt = Object.assign({ x, z, turn, tint: gainAt(x) }, o); if (o.lift) opt.y = land.height(x, z) + o.lift;
        B[kind](opt); out.counts[kind] = (out.counts[kind] || 0) + 1;
        if (kind === 'brazier') {                                    // its flames (the kit's brazier makes its lamp, not its fire)
          const b = A.brazier.bb, w = opt.w || 0.8, h = (b[3] - b[1]) / ((b[2] - b[0]) / w); out.fires.push({ x, y: land.height(x, z) + h * 0.78, z, r: w * 0.35 });
        }
      }
      const kit = B.finish(null), bt = bunting(land); out.counts.bunting = bt.flags; out.counts.buntingPoles = bt.poles;
      for (const l of kit.lamps) { if (l.k > 1.2) l.fire = true; out.lamps.push(l); }
      out.blockers.push(...kit.blockers, ...bt.blockers); out.triangles = kit.triangles + bt.geometry.attributes.position.count / 3;
      // one mesh with the fair places' own pieces (and one glow): the old pair is taken away
      const old = places.kit || {}, parts = [kit, bt];
      if (old.mesh) parts.unshift({ geometry: old.mesh.geometry, gain: [1, 1, 1], glow: old.glow });
      const merged = KIT.merge(parts, scene, { sat: 0.84 });
      for (const m of [old.mesh, old.glow]) if (m) { scene.remove(m); m.geometry.dispose(); }
      kit.geometry.dispose(); if (kit.glow) kit.glow.geometry.dispose(); bt.geometry.dispose();
      places.kit = merged; out.mesh = merged.mesh;
    }
    // ---- the moor places: rocks and walls for ow-props.js, bushes with the places' own ----
    for (const [x, z, sx, sy, sz, turn, lean] of MOOR.rocks) {
      const h = land.height(x, z), sink = 0.25 * Math.min(sx, sz) + (sy > 1.2 ? 0.25 : 0.1);
      out.rocks.push({ x, z, y: h - sink, sx, sy, sz, ry: turn * Math.PI / 180, tilt: 0, tz: (lean || 0) * Math.PI / 180 }); out.blockers.push({ x, z, r: Math.max(sx, sz) * 0.85 });
    }
    out.walls = MOOR.walls.map((w) => ({ pts: w.pts, h: w.h }));
    for (const [kind, x, z, r, h] of MOOR.bushes) {
      places.bushes.push({ kind, x, z, y: land.height(x, z), r, h });
      if (kind === 'thorn') out.blockers.push({ x, z, r: 0.35 }); else if (kind === 'gorse' && h > 0.75) out.blockers.push({ x, z, r: r * 0.7 });
    }
    out.counts.rocks = MOOR.rocks.length; out.counts.wallRuns = MOOR.walls.length; out.counts.bushes = MOOR.bushes.length;
    for (const b of out.blockers) places.blockers.push(b); for (const l of out.lamps) places.lamps.push(l); for (const f of out.fires) places.fires.push(f);
    return out;
  };
})(window.OW);
