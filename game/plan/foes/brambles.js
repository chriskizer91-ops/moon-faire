// Writes brambles.json: the three bramble foes for the fight piece and the open world to read.   node brambles.js
// Chris, November 15, 2026 (4:24 pm): two brambles and a great bramble made from the larger one; in a fight each is a
// wraith of the same size by the numbers and the rules, with its own names and moves, "that way the balance of combat
// stays the same". So nothing here changes a number: every number below is read from the approved rules.
const fs = require('fs');
const { RULES } = require('../sim/blob-battle-engine.js');
const F = RULES.foes;
const nums = t => { const d = F[t], o = { life: d.life, actsEvery: d.delay }; for (const k of ['blow', 'heavy', 'crush', 'eclipse', 'eclipseStep', 'loneDelay']) if (d[k] !== undefined) o[k] = d[k]; return o; };
const out = {
  what: 'Moon Faire: the three bramble foes. For the fight piece and the open world to read.',
  chosen: 'Chris, November 15, 2026 (7:38 am, 1:06 pm and 4:24 pm). See the project note claude/bramble-foes.md. Every name is a stand-in.',
  rule: 'In a fight a bramble IS the wraith of its size: the same Life, the same blows, the same turn order, the same Fate, the same XP, growing 20% a level like every foe. Only its name, its model and its moves differ.',
  models: 'game/models/foes/bramble/ (start with its README.md): MF_BRAMBLES.make(kind, weight). m.does("blow") plays the engine\'s move by its own name.',
  kinds: [
    { kind: 'bramble', name: 'Bramble', code: 'w', tier: 'normal', inAFightItIs: 'the wisp', atLevelOfTheFoe: nums('normal'),
      stands: { tall: 0.99, across: 2.9, reach: 1.47, size: 0.6 }, triangles: { light: 11965, fine: 76312 },
      moves: { blow: { plays: 'strike', seconds: 1.3, lands: 0.52, envoiName: 'Strike' } } },
    { kind: 'flowering', name: 'Flowering Bramble', code: 'K', tier: 'difficult', inAFightItIs: 'the Shadow Wraith', atLevelOfTheFoe: nums('difficult'),
      stands: { tall: 2.11, across: 3.08, reach: 2.3, size: 0.28 }, triangles: { light: 14351, fine: 102456 },
      moves: { blow: { plays: 'lance', seconds: 1.8, lands: 0.79, envoiName: 'Thorn Lance' }, heavy: { plays: 'slam', seconds: 3.0, lands: 1.5, envoiName: 'Hammerfall' } } },
    { kind: 'great', name: 'Great Bramble', code: 'B', tier: 'boss', inAFightItIs: 'the great wraith', atLevelOfTheFoe: nums('boss'),
      stands: { tall: 5.62, across: 7.26, reach: 5.41, size: 0.6 }, triangles: { light: 25057, fine: 135784 },
      moves: { blow: { plays: 'lance', seconds: 1.8, lands: 0.79, envoiName: 'Thorn Lance' }, crush: { plays: 'briar', seconds: 3.8, lands: 1.75, envoiName: 'Thornwood' }, eclipse: { plays: 'volley', seconds: 3.2, lands: 1.86, envoiName: 'Thorn Volley' } } },
  ],
  forAllThree: { hurt: 'hurt', fall: 'die', appear: 'appear', guard: 'block' },
  whereTheyAreMet: {
    decided: 'Levels 11 to 20, with wraiths mixed in. The great bramble is the gate at level 20. Two of the final fight\'s four helpers are brambles.',
    suggestedNotDecided: {
      note: 'Because a bramble and a wraith of one size are the same in a fight, which of the two a foe is drawn as changes no number. These shares are a suggestion from the Levelling session for row F5.',
      shareDrawnAsBrambles: { band4_levels10to14: 0.5, band5_levels14to17: 0.67, band6_levels17to20: 0.75 },
      theGreatBrambleGate: 'B2K2w as one great bramble, two flowering brambles, one bramble and one wisp.',
      theFinalFightsHelpers: 'One Shadow Wraith, one flowering bramble, one wisp, one bramble.',
    },
  },
  notDone: ['Names for the three and their moves.', 'They are wide and rooted where wraiths are narrow and walk: where each stands in a fight, and how its blow reaches the party, is for the fight piece (rows F6 and F12).',
    'Their look under the witches\' stage lights and the Flipbook look.', 'Chris has not seen them on his phone.'],
};
fs.writeFileSync(__dirname + '/brambles.json', JSON.stringify(out, null, 1));
console.log(out.kinds.map(k => k.name + ': ' + JSON.stringify(k.atLevelOfTheFoe)).join('\n'));
