// The final boss in two forms (task board F11; Chris, November 15, 2026, 1:58 pm).
// "It should lose hp but not take visible damage and then at zero hp transform into its final form."
// And his question: one body alone, harder than the gate fights? Or the great wraith's own numbers under new names,
// with the same helpers, at the last fight's level (20, 21, 22 or 22.8)?
//
// The approved engine is not changed. A form is one engine fight. The next form starts with the HP and MP the party
// has left; a witch who is down stays down until Io revives her; Io's Deity stays "once a fight" across both forms;
// the Ranger's gem and the Fox's rests carry over. The foe starts its new form with no Fate on it.
// By the approved rules a fight that ends on Sealed Fate ends in the Curtain Call, and the fallen get up for the bow at
// a quarter of their HP. A form marked { bow: false } stands nobody up; without the mark the rule is left as it is.
//
// A form marked { fresh: true } starts with the whole party up and full, HP and MP, and with every once-a-fight thing
// back (Chris, November 15, 3:23 pm: "the whole party gets back up full HP MP for some story reason").
// A form is { code, up, life, dmg, bow, fresh }: a line-up; how many levels above the fight's own level its numbers are (a foe one
// level up has 20% more Life and hits 20% harder, by the approved rules, and "up" may be a fraction); and two more
// multipliers on the big body alone, its Life and the size of its blows.
const { E, choose, think, K } = require('../testers/testers.js');
const { rulesWith } = require('../finds/lib.js');
const { HERBS, HABIT } = require('../herbs/journey.js');
const IDS = ['jester', 'ranger', 'fox', 'io'];
const KEEP = ['deityUsed', 'gem', 'clothCd', 'quiltCd', 'bloom'];
const full = () => ({ hp: { jester: 1, ranger: 1, fox: 1, io: 1 }, mp: { jester: 1, ranger: 1, fox: 1, io: 1 } });

// "saving": a player who knows a second form is coming. In the form before it Io keeps 40 more MP back for healing,
// and the Fox stops spending on Stitch once she is under 60 MP, so she can still turn blows back later.
function form(code, gap, tester, seed, rules, state, carry, bag, saving) {
  const kSave = saving && K[tester] ? Object.assign({}, K[tester], { reserve: K[tester].reserve + 40 }) : null;
  const B = E.newBattle(code, { rules, level: gap, seed });
  const hs = B.fighters.filter(u => u.side === 'hero');
  for (const u of hs) { u.hp = state.hp[u.id] <= 0 ? 0 : Math.max(1, state.hp[u.id] * u.max); u.mp = state.mp[u.id] * rules.heroes[u.id].mp; }
  if (carry) for (const k of KEEP) B[k] = carry[k];
  const habit = HABIT[tester].inFight, pct = u => u.hp / u.max;
  for (let i = 0; i < 6000 && !B.over; i++) {
    const r = E.step(B);
    if (r.hero) {
      const u = r.hero;
      E.heroTurnStart(B, u);
      if (B.over) break;
      let herb = null;                       // the same herb habit as in the walking fights (herbs/journey.js)
      if (habit !== 'never' && (bag.hp >= 1 || bag.mp >= 1)) {
        const io = hs.find(x => x.id === 'io'), ioCan = io.hp > 0 && io.mp >= rules.i.mendMp;
        const up = hs.filter(x => x.hp > 0), low = up.reduce((a, b) => (pct(b) < pct(a) ? b : a));
        if (habit === 'need') {
          if (u.id === 'io' && !ioCan) { if (pct(low) < 0.35 && bag.hp >= 1) herb = ['hp', low]; else if (pct(low) < 0.6 && bag.mp >= 1) herb = ['mp', u]; }
          else if (u.id !== 'io' && !ioCan && pct(u) < 0.25 && bag.hp >= 1) herb = ['hp', u];
        } else if (pct(u) < 0.3 && bag.hp >= 1 && B.rng() < 0.3) herb = ['hp', u];
      }
      if (herb) {
        const [kind, t] = herb; bag[kind] -= 1;
        if (kind === 'hp') t.hp = Math.min(t.max, t.hp + HERBS.hp); else t.mp = Math.min(rules.heroes[t.id].mp, t.mp + HERBS.mp);
        B.heroTurns++; u.next = B.now + u.delay;
      } else {
        let c = kSave ? think(B, u, kSave) : choose(B, u, tester);
        if (kSave && u.id === 'fox' && c.move === 'f_stitch' && u.mp < 60) c = { move: 'f_plain', target: c.target };
        E.doHero(B, u, c.move, c.target);
      }
    }
    B.log.length = 0; B.events.length = 0;
  }
  const out = full(), keep = {};
  for (const u of hs) { out.hp[u.id] = Math.max(0, u.hp) / u.max; out.mp[u.id] = rules.heroes[u.id].mp ? u.mp / rules.heroes[u.id].mp : 1; }
  for (const k of KEEP) keep[k] = B[k];
  return { won: B.over === 'won', state: out, turns: B.heroTurns, foeTurns: B.foeTurns, carry: keep };
}

// The rules for each form of a fight, with a set of finds (their changes) applied.
function rulesFor(forms, changes) {
  return forms.map((f, i) => rulesWith((changes || []).concat(
    f.bow === false ? [{ path: 'fate.ccStand', mul: 0 }] : [],
    f.life ? [{ path: 'foes.boss.life', mul: f.life }] : [],
    f.dmg ? ['blow', 'eclipse', 'eclipseStep', 'crush'].map(k => ({ path: 'foes.boss.' + k, mul: f.dmg })) : []), f.code));
}
// One whole fight: every form in turn. gap is the fight's level less the party's (0, 1, 2 or 2.8).
function whole(forms, rules, gap, tester, seed, herbs, saver) {
  let state = full(), carry = null, turns = 0, foeTurns = 0;
  const bag = { hp: (herbs && herbs.hp) || 0, mp: (herbs && herbs.mp) || 0 };
  for (let i = 0; i < forms.length; i++) {
    if (forms[i].fresh) { state = full(); carry = null; }
    const f = form(forms[i].code, gap + (forms[i].up || 0), tester, i ? (seed * 31 + 17 * i) >>> 0 : seed, rules[i], state, carry, bag, saver && i < forms.length - 1);
    turns += f.turns; foeTurns += f.foeTurns;
    if (!f.won) return { won: false, lostIn: i + 1, turns, foeTurns };
    state = f.state; carry = f.carry;
  }
  return { won: true, turns, foeTurns, state };
}
function measure(forms, gap, tester, changes, n, herbs, saver) {
  const rules = rulesFor(forms, changes);
  let won = 0, turns = 0, foeTurns = 0, lost1 = 0;
  for (let i = 0; i < n; i++) {
    const r = whole(forms, rules, gap, tester, 977 + i * 7919, herbs, saver);
    if (r.won) { won++; turns += r.turns; foeTurns += r.foeTurns; } else if (r.lostIn === 1) lost1++;
  }
  return { win: won / n, turns: won ? turns / won : 0, foeTurns: won ? foeTurns / won : 0, lostInFormOne: lost1 / n };
}
module.exports = { form, rulesFor, whole, measure, full };
