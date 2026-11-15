// Fights that start with the HP and MP the party has, and Io's herbs (task board F9; Chris, November 15, 2026).
// The approved engine is not changed: a fight is set up by the engine, the party's HP and MP are then set to what it
// carries, and the fight runs through the engine's own step and move functions. A herb is the one thing added: on a
// witch's turn she may eat a herb in place of a move, and the turn passes as it does after any move.
const { E, choose } = require('../testers/testers.js');
const { rulesWith } = require('../finds/lib.js');
const PLAN = require('../levelling/plan-chosen.js');
const IDS = ['jester', 'ranger', 'fox', 'io'];
const rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// The numbers Chris is to choose. On the scale where the Jester has 1,000 HP; like everything, they grow 20% a level.
const HERBS = {
  hp: 60,            // one HP herb: half the Jester's own heal of 120, the weakest heal (Chris's rule)
  mp: 10,            // one MP herb
  inFight: 1,        // a herb eaten in a fight is worth this share of one eaten after it
  standUp: 0.10,     // a witch who fainted in a won fight gets up after it with this share of her HP (made up here)
};
// How each tester uses herbs. "after": she tops everyone up to these shares of HP and MP after a fight, while herbs last.
// "inFight": whether she will eat a herb on a turn when a friend is in trouble and Io cannot mend.
const HABIT = {
  'very careless': { after: null, inFight: 'never' },
  'careless': { after: { hpUnder: 0.4, hp: 0.6, mpUnder: 0.2, mp: 0.5 }, inFight: 'sometimes' },
  'attentive, careful': { after: { hpUnder: 0.9, hp: 0.9, mpUnder: 0.8, mp: 0.8 }, inFight: 'need' },
  'attentive, bold': { after: { hpUnder: 0.6, hp: 0.6, mpUnder: 0.4, mp: 0.4 }, inFight: 'need' },
  'focused, careful': { after: { hpUnder: 0.9, hp: 0.9, mpUnder: 0.8, mp: 0.8 }, inFight: 'need' },
  'focused, bold': { after: { hpUnder: 0.6, hp: 0.6, mpUnder: 0.4, mp: 0.4 }, inFight: 'need' },
  'expert, careful': { after: { hpUnder: 0.9, hp: 0.9, mpUnder: 0.8, mp: 0.8 }, inFight: 'need' },
  'expert, bold': { after: { hpUnder: 0.6, hp: 0.6, mpUnder: 0.4, mp: 0.4 }, inFight: 'need' },
};
const full = () => ({ hp: { jester: 1, ranger: 1, fox: 1, io: 1 }, mp: { jester: 1, ranger: 1, fox: 1, io: 1 } });

// One fight. "state" is each witch's share of her HP and MP coming in; "bag" is { hp, mp } herbs and is used up in place.
function fight(code, gap, tester, seed, rules, state, bag, herbs = HERBS) {
  const B = E.newBattle(code, { rules, level: gap, seed });
  B.quiet = true;
  const hs = B.fighters.filter(u => u.side === 'hero');
  for (const u of hs) { u.hp = Math.max(1, state.hp[u.id] * u.max); u.mp = state.mp[u.id] * rules.heroes[u.id].mp; }
  const habit = HABIT[tester].inFight, pct = u => u.hp / u.max, used = { hp: 0, mp: 0 };
  for (let i = 0; i < 4000 && !B.over; i++) {
    const r = E.step(B);
    if (r.hero) {
      const u = r.hero;
      E.heroTurnStart(B, u);
      if (B.over) break;
      let herb = null;
      if (habit !== 'never' && (bag.hp >= 1 || bag.mp >= 1)) {
        const io = hs.find(x => x.id === 'io'), ioCan = io.hp > 0 && io.mp >= rules.i.mendMp;
        const up = hs.filter(x => x.hp > 0), low = up.reduce((a, b) => (pct(b) < pct(a) ? b : a));
        if (habit === 'need') {
          if (u.id === 'io' && !ioCan) { if (pct(low) < 0.35 && bag.hp >= 1) herb = ['hp', low]; else if (pct(low) < 0.6 && bag.mp >= 1) herb = ['mp', u]; }
          else if (u.id !== 'io' && !ioCan && pct(u) < 0.25 && bag.hp >= 1) herb = ['hp', u];
        } else if (pct(u) < 0.3 && bag.hp >= 1 && B.rng() < 0.3) herb = ['hp', u];
      }
      if (herb) {
        const [kind, t] = herb; bag[kind] -= 1; used[kind]++;
        if (kind === 'hp') t.hp = Math.min(t.max, t.hp + herbs.hp * herbs.inFight);
        else t.mp = Math.min(rules.heroes[t.id].mp, t.mp + herbs.mp * herbs.inFight);
        B.heroTurns++; u.next = B.now + u.delay;
      } else { const c = choose(B, u, tester); E.doHero(B, u, c.move, c.target); }
    }
    B.log.length = 0; B.events.length = 0;
  }
  const out = full();
  for (const u of hs) { out.hp[u.id] = Math.max(0, u.hp) / u.max; out.mp[u.id] = rules.heroes[u.id].mp ? u.mp / rules.heroes[u.id].mp : 1; }
  return { won: B.over === 'won', state: out, turns: B.heroTurns, foeTurns: B.foeTurns, kos: B.kos, used };
}
// After a fight: anyone who fainted gets up, then she eats herbs by her habit. Returns how many of each she ate.
function after(state, tester, rules, bag, herbs = HERBS) {
  const h = HABIT[tester].after, used = { hp: 0, mp: 0 };
  const maxHp = id => rules.heroes[id].hp, maxMp = id => rules.heroes[id].mp;
  for (const id of IDS) if (state.hp[id] <= 0) state.hp[id] = herbs.standUp;
  if (!h) return used;
  for (let guard = 0; guard < 500 && bag.hp >= 1; guard++) {
    const id = IDS.filter(x => state.hp[x] < h.hpUnder).sort((a, b) => state.hp[a] - state.hp[b])[0];
    if (!id || state.hp[id] >= h.hp) break;
    state.hp[id] = Math.min(1, state.hp[id] + herbs.hp / maxHp(id)); bag.hp -= 1; used.hp++;
  }
  for (let guard = 0; guard < 500 && bag.mp >= 1; guard++) {
    const id = IDS.filter(x => maxMp(x) > 0 && state.mp[x] < h.mpUnder).sort((a, b) => state.mp[a] - state.mp[b])[0];
    if (!id || state.mp[id] >= h.mp) break;
    state.mp[id] = Math.min(1, state.mp[id] + herbs.mp / maxMp(id)); bag.mp -= 1; used.mp++;
  }
  return used;
}

// A stretch: fights one after another from a rest spot (everything full), in one ring of the chosen plan, until one is
// lost or "most" have been won. "plants" is how many herbs of each kind she picks between one fight and the next.
function stretch(ringN, tester, seed, o = {}) {
  const ring = PLAN.rings[ringN - 1], rules = o.rules || rulesWith(o.changes || []), herbs = o.herbs || HERBS, r = rng(seed);
  const level = ring.partyEnters + 1, most = o.most || 40, plants = o.plants || { hp: 0, mp: 0 };
  const bag = { hp: (o.start && o.start.hp) || 0, mp: (o.start && o.start.mp) || 0 };
  let state = full(), won = 0, turns = 0;
  const used = { hp: 0, mp: 0 }, left = { hp: 0, mp: 0 };
  const table = ring.meets, tw = table.reduce((s, m) => s + m.weight, 0);
  while (won < most) {
    let w = r() * tw, code = table[0].foes; for (const m of table) { if ((w -= m.weight) < 0) { code = m.foes; break; } }
    const foeLevel = ring.foeLevels[0] + Math.floor(r() * (ring.foeLevels[1] - ring.foeLevels[0] + 1));
    const R = Object.assign({}, rules, { encounters: [{ id: code, label: code, foes: parse(code) }] });
    const f = fight(code, foeLevel - level, tester, Math.floor(r() * 1e9), R, state, bag, herbs);
    used.hp += f.used.hp; used.mp += f.used.mp; turns += f.turns;
    if (!f.won) break;
    won++; state = f.state;
    const hs = IDS.reduce((s, id) => s + state.hp[id] * rules.heroes[id].hp, 0) / IDS.reduce((s, id) => s + rules.heroes[id].hp, 0);
    const ms = IDS.reduce((s, id) => s + state.mp[id] * rules.heroes[id].mp, 0) / IDS.reduce((s, id) => s + rules.heroes[id].mp, 0);
    left.hp += hs; left.mp += ms;
    bag.hp += plants.hp; bag.mp += plants.mp;
    const u = after(state, tester, rules, bag, herbs); used.hp += u.hp; used.mp += u.mp;
  }
  return { won, turns, used, leftHp: won ? left.hp / won : 0, leftMp: won ? left.mp / won : 0 };
}
const T = { w: 'normal', K: 'difficult', B: 'boss' };
function parse(code) { const foes = []; code.replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) foes.push(T[k]); }); return foes; }
module.exports = { HERBS, HABIT, fight, after, stretch, full, PLAN, parse };
