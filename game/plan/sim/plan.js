// Chris, November 13: all four witches are in the party from the start.
// The starter world as data: scenes, fights, levels, XP. Every number here is a suggestion for Chris.
module.exports = {
  xp: { w: 10, K: 40, B: 400, slope: 1.2 },          // XP for a level-1 foe, growing 20% a foe level
  toReach: { 2: 80, 3: 400, 4: 1150, 5: 2000 },      // total XP to reach each level
  stepEvery: 14,                                       // metres walked between walking fights (plus or minus 3)
  scenes: {
    W4: { name: 'The Last Lantern', path: 24, lamps: 2, table: [['3w', 2], ['3w', 3], ['4w', 2]] },
    W5: { name: 'The standing stones', path: 30, lamps: 3, table: [['3w', 3], ['K2w', 3], ['4w', 4]] },
    W6: { name: 'The still pool', path: 30, lamps: 4, table: [['K2w', 4], ['K4w', 4], ['5w', 5], ['K2w', 5]] },
    W9: { name: 'The beacon stair', path: 36, lamps: 0, table: [['K2w', 5], ['K4w', 5], ['5w', 6], ['2K2w', 6]] },
  },
  sets: {
    T1: { where: 'W1', code: '2w', level: 1 }, T2: { where: 'W2', code: '3w', level: 1 }, T3: { where: 'W3', code: '3w', level: 2 },
    S1: { where: 'W4', code: '4w', level: 3, lamp: 1 },
    S2: { where: 'W5', code: 'K2w', level: 4, lamp: 1 },
    S3: { where: 'W6', code: '2K2w', level: 5, lamp: 1 },
    BOSS: { where: 'F5', code: 'B2K2w', level: 5 },
  },
  lampsNeeded: 12, bossLevel: 5,
};
