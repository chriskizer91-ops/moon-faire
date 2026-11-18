// Moon Faire blob battle: the combat engine. No drawing here; the page reads the state and the log.
// A port of the two consultants' turn-bar simulator (/tmp/mf2/ctb.py), rule for rule, so the demo plays the numbers
// they measured. Every number is in RULES.

const RULES = {
  version: 'the first agreed version, which Chris approved on November 13, 2026',
  swing: 0.25,            // damage and heals swing up to 25% either way; splash, revive, Fate and the curtain stand-up do not
  bar: 8,                 // turns shown ahead
  lifeSlope: 1.2,         // a foe one level up: 20% more Life
  dmgSlope: 1.2,          // and 20% more damage
  heroes: {
    jester: { name: 'Jester', hp: 1000, mp: 60, delay: 11 },
    ranger: { name: 'Ranger', hp: 480, mp: 0, delay: 8 },
    fox:    { name: 'Fox',    hp: 380, mp: 100, delay: 9 },
    io:     { name: 'Io',     hp: 420, mp: 120, delay: 10 },
  },
  j: { plain: 40, jab: 50, healMp: 10, heal: 120, catches: 3 },
  r: { plain: 150, lit: 200, rest: 2 },
  f: { plain: 50, stitchMp: 8, stitch: 160, needlesMp: 12, needles: 80, clothMp: 18, clothMult: 2, clothRest: 2,
       quiltMp: 20, quiltNormal: 2, quiltDifficult: 1, quiltRest: 3, decoyMp: 10, decoy: 2, fleeMp: 0 },
  i: { plain: 40, thornMp: 8, thorn: 180, deityMp: 20, deity: 220, mendMp: 10, mend: 250, bloomMp: 14, bloom: 60, bloomTicks: 3,
       reviveMp: 24, revive: 0.30 },
  fate: { perBlow: 500, markedMult: 2, cloth: 500, eclipseMarked: true, peril: 0.05, splash: 0.20, ccStand: 0.25 },
  foes: {
    normal:    { name: 'Wisp',   tier: 'normal', life: 300, blow: 50, delay: 12 },
    difficult: { name: 'Knight', tier: 'difficult', life: 1000, blow: 100, heavy: 200, delay: 11 },
    boss:      { name: 'Boss',   tier: 'boss', life: 8000, blow: 130, eclipse: 110, eclipseStep: 25, crush: 440, delay: 10, loneDelay: 5 },
  },
  encounters: [
    { id: 'pack',     label: 'Easy pack: three wisps', foes: ['normal', 'normal', 'normal'] },
    { id: 'standard', label: 'Standard: a knight and two wisps', foes: ['difficult', 'normal', 'normal'] },
    { id: 'boss1',    label: 'One boss and three wisps', foes: ['boss', 'normal', 'normal', 'normal'] },
    { id: 'boss2',    label: 'Two bosses, a knight and a wisp', foes: ['boss', 'boss', 'difficult', 'normal'] },
    { id: 'grand',    label: 'Hardest: two bosses, two knights, three wisps', foes: ['boss', 'boss', 'difficult', 'difficult', 'normal', 'normal', 'normal'] },
    { id: 'trioPack', label: 'Before the Jester joins: three wisps', foes: ['normal', 'normal', 'normal'], noJester: true },
    { id: 'trioStd',  label: 'Before the Jester joins: a knight and two wisps', foes: ['difficult', 'normal', 'normal'], noJester: true },
  ],
};

const MOVES = {
  j_plain: { who: 'jester', label: 'Gilded Rebuke', target: 'foe' },
  j_jab:   { who: 'jester', label: 'Attack taunt', target: 'foe' },
  j_heal:  { who: 'jester', label: 'Heal taunt', target: 'none' },
  j_seal:  { who: 'jester', label: 'Sealed Fate', target: 'sealed' },
  r_plain: { who: 'ranger', label: 'Bow', target: 'foe' },
  r_gem:   { who: 'ranger', label: 'The gem', target: 'foe2' },
  f_plain: { who: 'fox', label: 'Hemline Fangs', target: 'foe' },
  f_stitch:{ who: 'fox', label: 'Stitch', target: 'foe' },
  f_needles:{ who: 'fox', label: 'Pins and Needles', target: 'allfoes' },
  f_cloth: { who: 'fox', label: 'Same Cloth', target: 'marked' },
  f_quilt: { who: 'fox', label: 'Crazy Quilt', target: 'allfoes' },
  f_decoy: { who: 'fox', label: 'Borrowed Face', target: 'none' },
  f_flee:  { who: 'fox', label: 'Slip Stitch', target: 'none' },
  i_plain: { who: 'io', label: 'Harvest Crescent', target: 'foe' },
  i_thorn: { who: 'io', label: 'Thorn', target: 'foe' },
  i_mend:  { who: 'io', label: 'Mend', target: 'hero' },
  i_bloom: { who: 'io', label: 'Bloom', target: 'none' },
  i_deity: { who: 'io', label: 'Deity', target: 'none' },
  i_revive:{ who: 'io', label: 'Revive', target: 'fallen' },
};

function moveText(R, id) {
  const j = R.j, r = R.r, f = R.f, i = R.i, F = R.fate;
  return {
    j_plain: [0, `${j.plain} to one foe. No taunt.`],
    j_jab: [0, `${j.jab} to one foe, and she catches the next ${j.catches} single-target blows until her next turn.`],
    j_heal: [j.healMp, `Heals her alone for ${j.heal}, and she catches the next ${j.catches} single-target blows.`],
    j_seal: [0, `Ends a sealed foe. Every other foe loses ${Math.round(F.splash * 100)}% of its max Life. No taunt this turn.`],
    r_plain: [0, `${r.plain} to one foe.`],
    r_gem: [0, `Two shots of ${r.lit}, each aimed where you like. Then ${r.rest} of her turns before the gem is ready again.`],
    f_plain: [0, `${f.plain} to one foe.`],
    f_stitch: [f.stitchMp, `${f.stitch} to one foe.`],
    f_needles: [f.needlesMp, `${f.needles} to every foe.`],
    f_cloth: [f.clothMp, `Pick a foe with a Heavy or Crush on the turn bar. When it comes, it lands on the foe itself at double${F.cloth ? `, and that foe gains ${F.cloth} Fate` : ''}. Then ${f.clothRest} of her turns before she can cut again.`],
    f_quilt: [f.quiltMp, `Wisps lose their next ${f.quiltNormal} actions and knights their next ${f.quiltDifficult}: their blows land on the biggest other foe. Bosses are immune. Then ${f.quiltRest} turns to rest.`],
    f_decoy: [f.decoyMp, `A ghost of her eats the next ${f.decoy} single-target blows, marked ones too, before the Jester can catch them.`],
    f_flee: [f.fleeMp, 'The party leaves at the start of her next turn, if she is still standing. Never while a boss stands.'],
    i_plain: [0, `${i.plain} to one foe.`],
    i_thorn: [i.thornMp, `${i.thorn} to one foe.`],
    i_mend: [i.mendMp, `Heals one friend for ${i.mend}, now.`],
    i_bloom: [i.bloomMp, `Heals every friend ${i.bloom} at the start of each of her next ${i.bloomTicks} turns.`],
    i_deity: [i.deityMp, `On her next turn her deity arrives: ${i.deity} to every foe. Once a fight.`],
    i_revive: [i.reviveMp, `Brings a fainted friend back at ${Math.round(i.revive * 100)}% HP.`],
  }[id];
}

function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

const fmt = n => Math.round(n).toLocaleString('en-US');

function newBattle(encId, opts = {}) {
  const R = opts.rules || RULES;
  const enc = R.encounters.find(e => e.id === encId) || R.encounters[0];
  const gap = opts.level || 0;
  const B = { R, enc, rng: makeRng(opts.seed || Math.floor(Math.random() * 1e9)), now: 0, log: [], events: [],
    over: null, heroTurns: 0, foeTurns: 0, casts: 0, curtain: false, snap: null, soaked: 0, healedJ: 0, kos: 0,
    kd: Math.pow(R.dmgSlope, gap), gap, fighters: [], taunt: 0, decoy: 0, gem: 0, clothCd: 0, quiltCd: 0,
    clothBlocked: false, quiltBlocked: false, bloom: 0, deityUsed: false, deityPending: false, fleeing: false };
  const heroIds = enc.noJester ? ['ranger', 'fox', 'io'] : ['jester', 'ranger', 'fox', 'io'];
  let order = 0;
  for (const id of heroIds) {
    const h = R.heroes[id];
    B.fighters.push({ id, side: 'hero', name: h.name, max: h.hp, hp: h.hp, mpMax: h.mp, mp: h.mp, delay: h.delay,
      next: h.delay * 0.5, order: order++, peril: false });
  }
  const kl = Math.pow(R.lifeSlope, gap);
  const seen = {};
  let bosses = 0;
  for (const key of enc.foes) {
    const d = R.foes[key];
    const same = enc.foes.filter(k => k === key).length;
    seen[key] = (seen[key] || 0) + 1;
    const name = same > 1 ? `${d.name} ${'ABCDEFG'[seen[key] - 1]}` : d.name;
    const f = { id: `${key}${order}`, key, side: 'foe', name, tier: d.tier, d, max: Math.round(d.life * kl), delay: d.delay,
      next: d.delay, order: order++, n: 0, phase: 0, fate: 0, conf: 0, cloth: false, ecl: 0, target: null };
    f.hp = f.max;
    if (d.tier === 'boss') { f.phase = bosses; f.n = bosses; bosses++; }   // the second boss starts one step into its pattern
    B.fighters.push(f);
  }
  for (const f of foesUp(B)) pickTarget(B, f);
  say(B, `${enc.label}. ${gap ? `The foes are ${Math.abs(gap)} level${Math.abs(gap) > 1 ? 's' : ''} ${gap > 0 ? 'above' : 'below'} the party.` : 'The foes are at the party\'s level.'}`, 'sys');
  return B;
}

const heroes = B => B.fighters.filter(f => f.side === 'hero');
const foes = B => B.fighters.filter(f => f.side === 'foe');
const heroesUp = B => heroes(B).filter(h => h.hp > 0);
const foesUp = B => foes(B).filter(f => f.hp > 0);
const byId = (B, id) => B.fighters.find(f => f.id === id);
const jesterOf = B => B.fighters.find(f => f.id === 'jester');
const sealed = f => f.side === 'foe' && f.hp > 0 && f.fate > 0 && f.fate >= f.hp;
const pct = u => u.hp / u.max;
function say(B, text, tone = '') { B.log.push({ text, tone }); }
function sw(B, x) { return x * (1 - B.R.swing + 2 * B.R.swing * B.rng()); }
function bossesUp(B) { return foesUp(B).filter(f => f.tier === 'boss'); }
function foeDelay(B, f) { return f.tier === 'boss' && bossesUp(B).length === 1 ? f.d.loneDelay : f.delay; }

// the move a foe makes k actions from now
function moveOf(f, k = 0) {
  const n = f.n + k;
  if (f.tier === 'normal') return 'blow';
  if (n % 3 !== 2) return 'blow';
  if (f.tier === 'difficult') return 'heavy';
  return (Math.floor(n / 3) + f.phase) % 2 === 0 ? 'eclipse' : 'crush';
}
function moveAmount(B, f, m, k = 0) {
  if (m === 'blow') return f.d.blow * B.kd;
  if (m === 'heavy') return f.d.heavy * B.kd;
  if (m === 'crush') return f.d.crush * B.kd;
  let ecl = f.ecl;
  for (let j = 0; j < k; j++) if (moveOf(f, j) === 'eclipse') ecl++;
  return (f.d.eclipse + f.d.eclipseStep * ecl) * B.kd;
}
const MOVE_NAME = { blow: 'Blow', heavy: 'Heavy', crush: 'Crush', eclipse: 'Eclipse' };
function pickTarget(B, f) {   // who a marked single-target move is aimed at, chosen when it becomes the foe's next move
  const up = heroesUp(B);
  f.target = up.length ? up[Math.floor(B.rng() * up.length)].id : null;
}

// the next turns as the player sees them
function bar(B, k) {
  const live = B.fighters.filter(u => u.hp > 0);
  const t = new Map(live.map(u => [u, u.next])), cnt = new Map(live.map(u => [u, 0]));
  const out = [];
  for (let i = 0; i < (k || B.R.bar) && live.length; i++) {
    let u = live[0];
    for (const x of live) {
      const a = t.get(x), b = t.get(u);
      if (a < b || (a === b && x.side === 'hero' && u.side !== 'hero')) u = x;
    }
    const j = cnt.get(u);
    out.push({ u, at: t.get(u), k: j, move: u.side === 'foe' ? moveOf(u, j) : null, amt: u.side === 'foe' ? moveAmount(B, u, moveOf(u, j), j) : 0 });
    cnt.set(u, j + 1);
    t.set(u, t.get(u) + (u.side === 'foe' ? foeDelay(B, u) : u.delay));
  }
  return out;
}
function markedSingles(B, reach) {
  const out = [];
  for (const e of bar(B).slice(0, reach || B.R.bar)) {
    if (e.u.side === 'foe' && (e.move === 'crush' || e.move === 'heavy') && !e.u.cloth && e.u.conf === 0 && !out.some(x => x.u === e.u)) out.push(e);
  }
  return out;
}

// ---------------- damage, healing, Fate ----------------
function hitFoe(B, e, amt, raw = false, src = null) {
  if (e.hp <= 0) return 0;
  const a = Math.min(e.hp, raw ? amt : sw(B, amt));
  e.hp = Math.max(0, e.hp - a);
  B.events.push({ type: 'dmg', id: e.id, n: a });
  if (src === 'jester') B.jDmg = (B.jDmg || 0) + a;
  if (e.hp <= 0) say(B, `${e.name} takes ${fmt(a)} and falls. A pale moth rises.`, 'good');
  else if (sealed(e) && !e._sealSaid) { e._sealSaid = true; say(B, `${e.name} takes ${fmt(a)}. Its Fate meets its Life: SEALED.`, 'seal'); }
  return a;
}
function addFate(B, e, n, why) {
  if (!e || e.hp <= 0 || !n) return;
  const was = sealed(e);
  e.fate += n;
  say(B, `${e.name}: Fate +${fmt(n)} (${why}). Gap ${sealed(e) ? 'closed' : fmt(e.hp - e.fate)}.`, 'fate');
  if (!was && sealed(e)) { e._sealSaid = true; say(B, `${e.name}'s Fate meets its Life: SEALED.`, 'seal'); }
}
function heal(B, u, amt) {
  if (u.hp <= 0) return 0;
  const a = Math.min(sw(B, amt), u.max - u.hp);
  u.hp += a;
  if (u.id === 'jester') B.healedJ += a;
  B.events.push({ type: 'heal', id: u.id, n: a });
  return a;
}
function hurt(B, u, amt, src, marked) {
  const d = Math.min(u.hp, sw(B, amt) * B.kd);
  const J = jesterOf(B);
  u.hp = Math.max(0, u.hp - d);
  B.events.push({ type: 'hurt', id: u.id, n: d });
  if (u === J) {
    B.soaked += d;
    say(B, `${src.name} hits the Jester for ${fmt(d)}. ${fmt(u.hp)} HP left.`, '');
    addFate(B, src, B.R.fate.perBlow * (marked ? B.R.fate.markedMult : 1), marked ? 'a marked blow on her' : 'a blow on her');
  } else {
    say(B, `${src.name} hits ${u.name} for ${fmt(d)}. ${fmt(u.hp)} HP left.`, 'warn');
    if (B.R.fate.peril && u.hp > 0 && pct(u) < 0.5 && !u.peril) {
      u.peril = true;
      say(B, `${u.name} falls under half. Peril: every foe gains ${Math.round(B.R.fate.peril * 100)}% of its Life as Fate.`, 'fate');
      for (const e of foesUp(B)) addFate(B, e, B.R.fate.peril * e.max, 'peril');
    }
  }
  if (u.hp <= 0) {
    B.kos++;
    say(B, `${u.name} faints.`, 'bad');
    if (u === J) { B.taunt = 0; for (const e of foes(B)) e.fate *= 0.5; say(B, 'With the Jester down, every foe\'s Fate halves.', 'bad'); }
  }
}

// ---------------- a foe's turn ----------------
function foeTurn(B, e) {
  const m = moveOf(e); e.n++;
  B.foeTurns++;
  const J = jesterOf(B);
  if (m === 'eclipse') {
    const amt = e.d.eclipse + e.d.eclipseStep * e.ecl; e.ecl++;
    if (e.conf > 0) { e.conf--; say(B, `${e.name} is lost in the quilt and its Eclipse goes nowhere.`, 'chaos'); }
    else {
      say(B, `${e.name}'s ECLIPSE falls on everyone.`, 'bad');
      for (const h of heroesUp(B)) hurt(B, h, amt, e, B.R.fate.eclipseMarked && h === J);
    }
  } else {
    const amt = { blow: e.d.blow, heavy: e.d.heavy, crush: e.d.crush }[m];
    const marked = m !== 'blow';
    if (marked && e.cloth) {
      e.cloth = false;
      say(B, `The ghost the Fox cut from ${e.name} turns its ${MOVE_NAME[m]} on it.`, 'chaos');
      hitFoe(B, e, amt * B.kd * B.R.f.clothMult);
      addFate(B, e, B.R.fate.cloth, 'it struck itself');
    } else if (e.conf > 0) {
      e.conf--;
      const o = foesUp(B).filter(x => x !== e);
      if (o.length) { const t = o.reduce((a, b) => (b.hp > a.hp ? b : a)); say(B, `${e.name} is lost in the quilt and strikes ${t.name}.`, 'chaos'); hitFoe(B, t, amt * B.kd); }
    } else if (B.decoy > 0) {
      B.decoy--;
      say(B, `${e.name}'s ${MOVE_NAME[m]} tears through the Fox's ghost. Nobody is hurt.`, 'chaos');
    } else {
      const hs = heroesUp(B);
      if (hs.length) {
        let tgt;
        if (B.taunt > 0 && J && J.hp > 0) { B.taunt--; tgt = J; say(B, `${e.name}'s ${MOVE_NAME[m]}: the Jester catches it.`, 'catch'); }
        else if (marked && e.target && byId(B, e.target) && byId(B, e.target).hp > 0) { tgt = byId(B, e.target); say(B, `${e.name}'s ${MOVE_NAME[m]} lands on ${tgt.name}.`, 'bad'); }
        else tgt = hs[Math.floor(B.rng() * hs.length)];
        hurt(B, tgt, amt, e, marked);
      }
    }
  }
  if (e.hp > 0) { e.next = B.now + foeDelay(B, e); pickTarget(B, e); }
}

// ---------------- the start of a hero's turn ----------------
function heroTurnStart(B, h) {
  if (h.id === 'jester') B.taunt = 0;
  if (h.id === 'fox') {
    if (B.fleeing) { B.over = 'fled'; say(B, 'Slip Stitch: the party steps through the cut, and a needle sews it shut behind them.', 'chaos'); return; }
    B.clothBlocked = B.clothCd > 0; B.quiltBlocked = B.quiltCd > 0;
    if (B.clothCd) B.clothCd--;
    if (B.quiltCd) B.quiltCd--;
  }
  if (h.id === 'io') {
    if (B.deityPending) {
      B.deityPending = false;
      say(B, 'Io\'s deity arrives, bright and armoured, and strikes every foe.', 'good');
      for (const e of foesUp(B)) hitFoe(B, e, B.R.i.deity);
    }
    if (B.bloom > 0) {
      B.bloom--;
      const got = heroesUp(B).map(x => [x, heal(B, x, B.R.i.bloom)]).filter(([, a]) => a > 0);
      if (got.length) say(B, `The bloom opens: ${got.map(([x, a]) => `${x.name} +${fmt(a)}`).join(', ')}.`, 'heal');
    }
  }
  checkOver(B);
}

// ---------------- what a hero may do now ----------------
function heroMoves(B, h) {
  const R = B.R, out = [];
  for (const [id, m] of Object.entries(MOVES)) {
    if (m.who !== h.id) continue;
    const [mp, help] = moveText(R, id);
    let ok = h.mp >= mp, why = ok ? '' : `Needs ${mp} MP`;
    const fu = foesUp(B);
    if (ok && id === 'j_seal' && !fu.some(sealed)) { ok = false; why = 'No foe is sealed yet'; }
    if (ok && id === 'r_gem' && B.gem > 0) { ok = false; why = `Ready in ${B.gem} more turn${B.gem > 1 ? 's' : ''}`; }
    if (ok && id === 'f_cloth' && B.clothBlocked) { ok = false; why = 'Resting after her last cut'; }
    if (ok && id === 'f_cloth' && !markedSingles(B).length) { ok = false; why = 'No Heavy or Crush on the turn bar'; }
    if (ok && id === 'f_quilt' && B.quiltBlocked) { ok = false; why = 'Resting after her last quilt'; }
    if (ok && id === 'f_quilt' && !fu.some(e => e.tier !== 'boss' && e.conf === 0)) { ok = false; why = 'No wisp or knight left to confuse'; }
    if (ok && id === 'f_decoy' && B.decoy > 0) { ok = false; why = 'Her ghost is still standing'; }
    if (ok && id === 'f_flee' && bossesUp(B).length) { ok = false; why = 'Never while a boss stands'; }
    if (ok && id === 'f_flee' && B.fleeing) { ok = false; why = 'Already leaving'; }
    if (ok && id === 'i_deity' && (B.deityUsed || B.deityPending)) { ok = false; why = 'Once a fight'; }
    if (ok && id === 'i_bloom' && B.bloom > 0) { ok = false; why = 'Already blooming'; }
    if (ok && id === 'i_revive' && !heroes(B).some(x => x.hp <= 0)) { ok = false; why = 'Nobody has fainted'; }
    out.push({ id, label: m.label, target: m.target, mp, help, ok, why });
  }
  return out;
}
function targetsFor(B, h, id) {
  const t = MOVES[id].target;
  if (t === 'foe' || t === 'foe2') return foesUp(B);
  if (t === 'sealed') return foesUp(B).filter(sealed);
  if (t === 'marked') return markedSingles(B).map(x => x.u);
  if (t === 'hero') return heroesUp(B);
  if (t === 'fallen') return heroes(B).filter(x => x.hp <= 0);
  return [];
}

function castSeal(B, J, e) {
  const oo = heroes(B).filter(h => h !== J);
  const snap = { tier: e.tier, life: e.hp / e.max, friends: oo.length ? oo.reduce((s, h) => s + h.hp, 0) / oo.reduce((s, h) => s + h.max, 0) : 0,
    jester: pct(J), below: oo.filter(h => pct(h) < 0.5).length };
  B.casts++;
  say(B, `SEALED FATE. The seal closes on ${e.name}, with ${fmt(e.hp)} Life still in it. It is ended.`, 'seal');
  e.hp = 0;
  B.events.push({ type: 'banner', text: 'Sealed Fate' });
  for (const o of foesUp(B)) hitFoe(B, o, B.R.fate.splash * e.max, true);
  if (!foesUp(B).length) {
    B.curtain = true; B.snap = snap;
    say(B, 'CURTAIN CALL. Two curtains of night close. The show is over.', 'seal');
    B.events.push({ type: 'banner', text: 'Curtain Call' });
    for (const h of heroes(B)) if (h.hp <= 0) { h.hp = B.R.fate.ccStand * h.max; h.next = B.now + h.delay; say(B, `${h.name} gets up for the bow.`, 'heal'); }
  }
}

function doHero(B, h, id, target) {
  const R = B.R, [mp] = moveText(R, id);
  const t1 = Array.isArray(target) ? byId(B, target[0]) : target ? byId(B, target) : null;
  h.mp -= mp;
  B.heroTurns++;
  const J = jesterOf(B);
  const name = MOVES[id].label;
  switch (id) {
    case 'j_plain': say(B, `Jester: ${name}.`); hitFoe(B, t1, R.j.plain, false, 'jester'); break;
    case 'j_jab': say(B, `Jester: ${name}. She capers and mocks them.`, 'catch'); hitFoe(B, t1, R.j.jab, false, 'jester'); B.taunt = R.j.catches; break;
    case 'j_heal': { const a = heal(B, h, R.j.heal); B.taunt = R.j.catches; say(B, `Jester: ${name}. She dances inside the stars and heals herself +${fmt(a)}. Catching the next ${R.j.catches}.`, 'catch'); break; }
    case 'j_seal': castSeal(B, h, t1 && sealed(t1) ? t1 : foesUp(B).filter(sealed).sort((a, b) => b.max - a.max)[0]); break;
    case 'r_plain':
      say(B, `Ranger: ${name}.`);
      if (B.gem) B.gem--;
      hitFoe(B, t1, R.r.plain); break;
    case 'r_gem': {
      say(B, 'Ranger: the gem. For one breath everything stands still.', 'good');
      const ts = Array.isArray(target) ? target : [target, target];
      for (let k = 0; k < 2; k++) {
        let t = byId(B, ts[k] || ts[0]);
        if (!t || t.hp <= 0) t = foesUp(B).sort((a, b) => a.hp - b.hp)[0];
        if (t) hitFoe(B, t, R.r.lit);
      }
      B.gem = R.r.rest; break;
    }
    case 'f_plain': say(B, `Fox: ${name}.`); hitFoe(B, t1, R.f.plain); break;
    case 'f_stitch': say(B, `Fox: ${name}.`); hitFoe(B, t1, R.f.stitch); break;
    case 'f_needles': say(B, `Fox: ${name}, on bright threads, at every foe.`); for (const e of foesUp(B)) hitFoe(B, e, R.f.needles); break;
    case 'f_cloth': t1.cloth = true; B.clothCd = R.f.clothRest; say(B, `Fox: ${name}. She cuts a ghost from ${t1.name}'s outline. Its next Heavy or Crush will land on itself.`, 'chaos'); break;
    case 'f_quilt': {
      const hit = foesUp(B).filter(e => e.tier !== 'boss' && e.conf === 0);
      for (const e of hit) e.conf = e.tier === 'normal' ? R.f.quiltNormal : R.f.quiltDifficult;
      B.quiltCd = R.f.quiltRest;
      say(B, `Fox: ${name}. ${hit.map(e => e.name).join(', ')} lose track of who they are fighting.`, 'chaos'); break;
    }
    case 'f_decoy': B.decoy = R.f.decoy; say(B, `Fox: ${name}. A ghost of her bows and stands in front.`, 'chaos'); break;
    case 'f_flee': B.fleeing = true; say(B, 'Fox: Slip Stitch. She cuts a door in the air. The party leaves at the start of her next turn.', 'chaos'); break;
    case 'i_plain': say(B, `Io: ${name}.`); hitFoe(B, t1, R.i.plain); break;
    case 'i_thorn': say(B, `Io: ${name}.`); hitFoe(B, t1, R.i.thorn); break;
    case 'i_mend': { const a = heal(B, t1, R.i.mend); say(B, `Io: ${name}. ${t1.name} +${fmt(a)}, now ${fmt(t1.hp)}.`, 'heal'); break; }
    case 'i_bloom': B.bloom = R.i.bloomTicks; say(B, `Io: ${name}. Seeds take root round every friend.`, 'heal'); break;
    case 'i_deity': B.deityUsed = true; B.deityPending = true; say(B, 'Io: Deity. She plants her prayer; it arrives on her next turn.', 'good'); break;
    case 'i_revive': t1.hp = R.i.revive * t1.max; t1.next = B.now + t1.delay; say(B, `Io: ${name}. ${t1.name} is back with ${fmt(t1.hp)} HP.`, 'heal'); break;
  }
  if (h.hp > 0) h.next = B.now + h.delay;
  void J;
  checkOver(B);
}

function checkOver(B) {
  if (B.over) return;
  if (!foesUp(B).length) { B.over = 'won'; say(B, `Victory, after ${B.heroTurns} party turns.`, 'good'); }
  else if (!heroesUp(B).length) { B.over = 'lost'; say(B, 'The whole party has fainted. Defeat.', 'bad'); }
}

function nextActor(B) {
  let u = null;
  for (const x of B.fighters) {
    if (x.hp <= 0) continue;
    if (!u || x.next < u.next || (x.next === u.next && x.side === 'hero' && u.side !== 'hero')) u = x;
  }
  return u;
}
// one step: a foe acts and returns {foe}, or a hero is next and returns {hero}
function step(B) {
  if (B.over) return { over: B.over };
  if (B.now > 600) { B.over = 'lost'; say(B, 'The night runs out. Defeat.', 'bad'); return { over: B.over }; }
  const a = nextActor(B);
  if (!a) return { over: B.over };
  B.now = a.next;
  if (a.side === 'foe') { foeTurn(B, a); checkOver(B); return { foe: a }; }
  return { hero: a };
}

// ---------------- the party's brains (careless, attentive, expert), as in the consultants' simulator ----------------
function wpick(B, w) {
  let r = B.rng() * w.reduce((s, x) => s + x[1], 0);
  for (const [k, n] of w) { r -= n; if (r <= 0) return k; }
  return w[0][0];
}
function focus(B) {
  const o = { normal: 0, difficult: 1, boss: 2 };
  return foesUp(B).reduce((a, e) => {
    const ka = [o[a.tier], a.tier === 'boss' ? a.hp - a.fate : a.hp], ke = [o[e.tier], e.tier === 'boss' ? e.hp - e.fate : e.hp];
    return (ke[0] < ka[0] || (ke[0] === ka[0] && ke[1] < ka[1])) ? e : a;
  });
}
function choose(B, u, style = 'attentive') {
  const R = B.R, a = foesUp(B), rnd = () => B.rng(), rc = arr => arr[Math.floor(rnd() * arr.length)];
  const J = jesterOf(B);
  const mv = (id, t) => ({ move: id, target: t ? (Array.isArray(t) ? t.map(x => x.id) : t.id) : null });
  if (u.id === 'ranger') {
    const tgt = () => style === 'careless' ? rc(foesUp(B)) : focus(B);
    if (B.gem === 0 && (style !== 'careless' || rnd() < 0.5)) { const t = tgt(); return mv('r_gem', [t, t]); }
    return mv('r_plain', tgt());
  }
  if (u.id === 'fox') {
    const ms = markedSingles(B, style === 'attentive' ? 3 : null);
    const small = a.filter(e => e.tier !== 'boss' && e.conf === 0);
    const can = { cloth: ms.length > 0 && !B.clothBlocked && u.mp >= R.f.clothMp, quilt: small.length > 0 && !B.quiltBlocked && u.mp >= R.f.quiltMp,
      decoy: B.decoy === 0 && u.mp >= R.f.decoyMp, needles: u.mp >= R.f.needlesMp, stitch: u.mp >= R.f.stitchMp };
    const big = () => ms.reduce((x, y) => (y.u.max > x.u.max ? y : x)).u;
    if (style === 'careless') {
      const w = [['plain', 3], ['stitch', 2], ['needles', 2], ['quilt', .5], ['decoy', .5], ['cloth', .7]].filter(([k]) => k === 'plain' || can[k]);
      const k = wpick(B, w);
      if (k === 'cloth') return mv('f_cloth', big());
      if (k === 'stitch') return mv('f_stitch', rc(a));
      if (k === 'plain') return mv('f_plain', rc(a));
      return mv({ needles: 'f_needles', quilt: 'f_quilt', decoy: 'f_decoy' }[k]);
    }
    if (can.cloth) {
      const e = big();
      const catchIt = style === 'expert' && J && J.hp > 0 && e.tier === 'boss' && J.hp > e.d.crush * B.kd * 1.25 + 300;
      if (!catchIt) return mv('f_cloth', e);
    }
    if (style === 'expert' && J && J.hp > 0 && can.decoy && (pct(J) < 0.3 || (ms.length && pct(J) < 0.5))) return mv('f_decoy');
    if (can.quilt && small.length >= 3) return mv('f_quilt');
    if (style === 'expert' && can.quilt && small.length >= 2 && a.length >= 4) return mv('f_quilt');
    if (a.length >= 3 && can.needles) return mv('f_needles');
    if (can.stitch) return mv('f_stitch', focus(B));
    return mv('f_plain', focus(B));
  }
  if (u.id === 'io') {
    const down = heroes(B).filter(h => h.hp <= 0), hs = heroesUp(B);
    const low = hs.reduce((x, y) => (pct(y) < pct(x) ? y : x)), nlow = hs.filter(h => pct(h) < 0.7).length;
    const atk = () => {
      const reserve = { careless: 0, attentive: 50, expert: 40 }[style];
      if (!B.deityUsed && !B.deityPending && a.length >= 3 && u.mp >= R.i.deityMp + reserve) return mv('i_deity');
      if (u.mp >= R.i.thornMp + reserve) return mv('i_thorn', focus(B));
      return mv('i_plain', focus(B));
    };
    if (style === 'careless') {
      if (down.length && u.mp >= R.i.reviveMp) return mv('i_revive', down[0]);
      if (pct(low) < 0.33 && u.mp >= R.i.mendMp && rnd() < 0.5) return mv('i_mend', low);
      const k = wpick(B, [['plain', 3], ['thorn', 2], ['deity', 1], ['mend', .6], ['bloom', .6]]);
      if (k === 'mend' && u.mp >= R.i.mendMp) return mv('i_mend', rc(hs));
      if (k === 'bloom' && u.mp >= R.i.bloomMp && B.bloom === 0) return mv('i_bloom');
      if (k === 'deity' && !B.deityUsed && !B.deityPending && u.mp >= R.i.deityMp) return mv('i_deity');
      if (k === 'thorn' && u.mp >= R.i.thornMp) return mv('i_thorn', rc(a));
      return mv('i_plain', rc(a));
    }
    if (down.length && u.mp >= R.i.reviveMp) return mv('i_revive', down.find(h => h === J) || down[0]);
    if (u.mp >= R.i.mendMp) {
      if (style === 'expert' && J && J.hp > 0) {
        const ms = markedSingles(B);
        const need = 300 + (ms.length ? Math.max(...ms.map(x => (x.u.d.crush || x.u.d.heavy || 0))) * B.kd * 1.25 : 0);
        if (J.hp < need && J.max - J.hp >= 200) return mv('i_mend', J);
      }
      if (pct(low) < (style === 'attentive' ? 0.5 : 0.45)) return mv('i_mend', low);
    }
    const eclipseShowing = bar(B).some(x => x.move === 'eclipse');
    if (B.bloom === 0 && u.mp >= R.i.bloomMp && (nlow >= 2 || (style === 'expert' && eclipseShowing && nlow >= 1))) return mv('i_bloom');
    return atk();
  }
  if (u.id === 'jester') {
    const sl0 = a.filter(sealed);
    const ends = sl0.filter(e => a.every(o => o === e || o.hp <= R.fate.splash * e.max));
    const sl = sl0.filter(e => e.tier !== 'normal').length ? sl0.filter(e => e.tier !== 'normal') : ends;
    const biggest = arr => arr.reduce((x, y) => (y.max > x.max ? y : x));
    if (style === 'careless') {
      if (sl.length) return mv('j_seal', biggest(sl));
      const k = wpick(B, [['jab', 5], ['heal', 1.5], ['plain', 3.5]]);
      if (k === 'heal' && u.mp >= R.j.healMp) return mv('j_heal');
      if (k === 'jab') return mv('j_jab', rc(a));
      return mv('j_plain', rc(a));
    }
    if (ends.length) return mv('j_seal', biggest(ends));
    if (sl.length) {
      const e = biggest(sl);
      const hold = style === 'expert' && e.tier !== 'boss' && pct(u) > 0.4 && markedSingles(B).some(x => x.u.tier === 'boss' && x.at < B.now + u.delay);
      if (!hold) return mv('j_seal', e);
    }
    if (pct(u) < (style === 'attentive' ? 0.5 : 0.55) && u.mp >= R.j.healMp) return mv('j_heal');
    return mv('j_jab', focus(B));
  }
}

function playOut(encId, opts = {}) {
  const B = newBattle(encId, opts);
  B.quiet = true;
  for (let i = 0; i < 4000 && !B.over; i++) {
    const r = step(B);
    if (r.hero) {
      heroTurnStart(B, r.hero);
      if (B.over) break;
      const c = choose(B, r.hero, opts.style || 'attentive');
      doHero(B, r.hero, c.move, c.target);
    }
    B.log.length = 0; B.events.length = 0;
  }
  return B;
}
function runMany(encId, n = 300, opts = {}) {
  let won = 0, turns = 0, casts = 0, cc = 0, moment = 0, bossLife = 0, bossN = 0;
  for (let i = 0; i < n; i++) {
    const B = playOut(encId, Object.assign({}, opts, { seed: 977 + i * 7919 }));
    if (B.over === 'won') { won++; turns += B.heroTurns; if (B.curtain) cc++; }
    casts += B.casts;
    if (B.snap && B.snap.tier === 'boss') { bossLife += B.snap.life; bossN++; if (B.snap.life >= 0.5 && B.snap.below >= 2) moment++; }
  }
  return { n, win: won / n, turns: won ? turns / won : 0, casts: casts / n, curtain: won ? cc / won : 0, moment: moment / n, bossLife: bossN ? bossLife / bossN : null };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { RULES, MOVES, newBattle, step, heroTurnStart, heroMoves, targetsFor, doHero, choose, bar, foesUp, heroesUp, sealed, playOut, runMany, moveText };
