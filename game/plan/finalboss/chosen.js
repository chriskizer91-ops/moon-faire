// Writes final-fight.json: the final fight as Chris chose it, for the fight piece to read.   node chosen.js
// Chris, November 15, 2026: 1:58 pm (two forms; form one shows no damage), 3:23 pm (helpers first and then alone; the
// fallen get up at the Jester's Curtain Call; the helpers are wraiths and brambles; and maybe the whole party comes
// back to full HP and MP with a harder second round, if the balance works out the same, which forms_run.js shows it does),
// 4:18 pm (the full refill is in; a party that falls in the final form starts again from before the first form; a rest
// spot just outside the place of the fight; the refill comes from the Jester's magic, life and death).
const fs = require('fs');
const { RULES } = require('../sim/blob-battle-engine.js');
const D = JSON.parse(fs.readFileSync(__dirname + '/forms.json', 'utf8'));
const b = RULES.foes.boss, k = RULES.foes.difficult, w = RULES.foes.normal;
const settings = { easy: 20, medium: 21, hard: 22, crazy: 22.8 };
const at = (x, mul) => Object.fromEntries(Object.entries(settings).map(([n, lv]) => [n, Math.round(x * (mul || 1) * Math.pow(RULES.lifeSlope, lv - 20))]));
const body = (life, dmg) => ({ life: at(b.life, life), plainBlow: at(b.blow, dmg), markedBlowAtOne: at(b.crush, dmg), blowOnEveryone: at(b.eclipse, dmg), blowOnEveryoneGrowsBy: at(b.eclipseStep, dmg) });
const pct = c => ({ noFinds: +(c.none * 100).toFixed(1), allFinds: +(c.all * 100).toFixed(1) });
const rows = key => Object.fromEntries(Object.entries(D.fights[key].rows).map(([t, r]) => [t, Object.fromEntries(Object.keys(settings).map((n, i) => [n, pct(r[i])]))]));
const out = {
  what: 'Moon Faire: the final fight, in two forms, as Chris chose it. For the fight piece and the open world to read.',
  chosen: 'Chris, November 15, 2026 (1:58 pm, 3:23 pm and 4:18 pm). See the project note claude/final-boss-the-fire-that-would-not-end.md. Every name is a stand-in.',
  party: 'Level 20, the top. It meets the fight fresh from a rest spot.',
  restSpot: 'One just outside the place where the fight happens (Chris, 4:18 pm).',
  ifThePartyFalls: 'In either form, the whole fight starts again from before form one (Chris, 4:18 pm). The rest spot is just outside.',
  settings: { note: 'Before the fight the game offers four settings. Each sets the level of everything in both forms.', ...settings },
  scale: 'Numbers are on the fight rules\' scale (the Jester has 1,000 HP), already worked out for each setting: 20% more Life and 20% bigger blows for every level above 20.',
  formOne: {
    name: 'The fire, whole',
    lineUp: 'B2K2w',
    body: { rulesAs: 'the great wraith, under new names', ...body(1, 1), actsEvery: b.delay, actsEveryOnceAlone: b.loneDelay },
    helpers: {
      who: 'Wraiths and brambles it has called (Chris). Until the bramble foes have numbers of their own, all four use the wraiths\' numbers.',
      twoBig: { rulesAs: 'the Shadow Wraith', life: at(k.life), blow: at(k.blow), heavy: at(k.heavy), actsEvery: k.delay },
      twoSmall: { rulesAs: 'the wisp', life: at(w.life), blow: at(w.blow), actsEvery: w.delay },
    },
    showsDamage: false,
    ends: 'When its Life is gone or the Jester casts Sealed Fate on it. The Curtain Call falls and the fallen get up (Chris).',
  },
  theChange: {
    partyGetsBack: 'Everything: every witch up, full HP and MP, and every once-a-fight move ready again.',
    status: 'Chosen by Chris (4:18 pm): "Yes, the full refill is in."',
    storyReason: 'Chris\'s direction (4:18 pm), the wording not written yet: it comes from the magic the Jester is doing and from what the boss is, a black orb inside light. The duality of life and death is the Jester\'s thing, so beating the first form tops everybody off.',
  },
  finalForm: {
    name: 'The fire, broken open',
    lineUp: 'B',
    against: 'Form one\'s body: 20% more Life and blows 10% bigger. It is alone, so it acts twice as often, which is already the rule.',
    body: { rulesAs: 'the great wraith, alone', ...body(1.2, 1.1), actsEvery: b.loneDelay },
    startsWithFate: 0,
    ends: 'For good, in the Curtain Call.',
  },
  measured: { fightsEachCell: D.n, percentOfFightsWon: rows('chosen'), partyTurnsInAWin: D.fights.chosen.turns.map(x => Math.round(x)) },
  ifThereIsNoRefill: {
    note: 'Not chosen; kept for the record. The version first proposed: the fallen get up at a quarter HP, nothing else comes back, and the final form has a quarter of form one\'s Life with the same blows.',
    finalFormBody: body(0.25, 1), percentOfFightsWon: rows('both'), partyTurnsInAWin: D.fights.both.turns.map(x => Math.round(x)),
  },
  notDone: ['The words and the picture for the refill (Chris gave the direction).', 'Names for both forms and their three blows.',
    'The bramble foes\' own numbers.', 'The final form\'s model, the fight\'s backdrop, and its place on the map.', 'The finds tuned again for fights that carry HP and MP over.'],
};
fs.writeFileSync(__dirname + '/final-fight.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.finalForm.body), JSON.stringify(out.measured.percentOfFightsWon['expert, careful']));
