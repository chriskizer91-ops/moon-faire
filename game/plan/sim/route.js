const { measure, E } = require('./lib.js');
const P = require('./plan.js');
const rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const xpOf = (code, lvl) => { let x = 0; code.replace(/^t/, '').replace(/(\d*)([wKB])/g, (_, n, k) => { x += (+n || 1) * P.xp[k]; }); return Math.round(x * Math.pow(P.xp.slope, lvl - 1)); };
const levelOf = xp => { let L = 1; for (const k of [2, 3, 4, 5]) if (xp >= P.toReach[k]) L = k; return L; };
function play(seed, style) {
  const r = rng(seed); const S = { xp: 0, lamps: 0, jester: false, fights: 0, hero: 0, foe: 0, losses: 0, log: [], lampsLeft: {}, walked: 0, next: 0 };
  for (const k in P.scenes) S.lampsLeft[k] = P.scenes[k].lamps;
  const mark = name => S.log.push({ name, level: levelOf(S.xp), xp: S.xp, fights: S.fights, lamps: S.lamps });
  function fight(code, lvl, lamp) {
    const L = levelOf(S.xp); let c = code;
    if (!S.jester && c[0] !== 't') c = 't' + c; if (S.jester && c[0] === 't') c = c.slice(1);
    const m = measure(c, lvl - L, style, 300);
    for (let tries = 0; tries < 30; tries++) {
      S.fights++;
      if (r() < m.win) { S.hero += m.ht; S.foe += m.ft; S.xp += xpOf(c, lvl); if (lamp) S.lamps++; return true; }
      S.losses++; S.hero += m.htAll; S.foe += m.ftAll;
    }
    return false;
  }
  function cross(id) {
    const sc = P.scenes[id]; let d = 0;
    while (true) {
      const gap = P.stepEvery + (r() * 6 - 3);
      if (S.next <= 0) S.next = gap;
      if (d + S.next > sc.path) { S.next -= sc.path - d; break; }
      d += S.next; S.next = 0;
      const [code, lvl] = sc.table[Math.floor(r() * sc.table.length)];
      const lamp = S.lampsLeft[id] > 0; if (lamp) S.lampsLeft[id]--;
      fight(code, lvl, lamp);
    }
    S.walked += sc.path;
  }
  const set = id => { const f = P.sets[id]; if (f.jesterJoins) S.jester = true; fight(f.code, f.level, f.lamp); };
  set('T1'); set('T2'); set('T3'); mark('Leaving the fair');
  cross('W4'); set('S1'); mark('The Last Lantern done');
  cross('W5'); set('S2'); mark('The Jester has joined');
  cross('W6'); set('S3'); mark('The pool reached');
  let guard = 0;
  while (S.lampsLeft.W6 > 0 && guard++ < 20) cross('W6');
  cross('W5'); while (S.lampsLeft.W5 > 0 && guard++ < 40) cross('W5');
  cross('W4'); while (S.lampsLeft.W4 > 0 && guard++ < 60) cross('W4');
  mark('All 12 lamps, back at the ship');
  cross('W9'); mark('Top of the stair, first time');
  while (levelOf(S.xp) < P.bossLevel && guard++ < 100) cross('W9');
  mark('The last door opens (level 5)');
  const bossTries = S.fights; set('BOSS'); S.bossTries = S.fights - bossTries;
  mark('The end');
  return S;
}
const styles = ['careless', 'attentive', 'expert']; const N = 2000;
for (const style of styles) {
  const agg = {}; let hero = 0, foe = 0, fights = 0, losses = 0, walked = 0, bossTries = 0; const tot = [];
  for (let i = 0; i < N; i++) {
    const S = play(1234 + i * 7919, style);
    for (const m of S.log) { const a = agg[m.name] = agg[m.name] || { lv: {}, fights: [], xp: 0 }; a.lv[m.level] = (a.lv[m.level] || 0) + 1; a.fights.push(m.fights); a.xp += m.xp; }
    hero += S.hero; foe += S.foe; fights += S.fights; losses += S.losses; walked += S.walked; bossTries += S.bossTries; tot.push(S.fights);
  }
  console.log('\n== ' + style);
  for (const [name, a] of Object.entries(agg)) {
    const f = a.fights.sort((x, y) => x - y);
    console.log(' ', name.padEnd(34), 'level', Object.entries(a.lv).map(([l, n]) => `L${l} ${Math.round(n / N * 100)}%`).join(', ').padEnd(26), 'fights so far', f[Math.floor(N * .1)] + '-' + f[Math.floor(N * .9)], ' xp', Math.round(a.xp / N));
  }
  tot.sort((x, y) => x - y);
  console.log('  fights in all', (fights / N).toFixed(1), '(10th-90th:', tot[Math.floor(N*.1)], '-', tot[Math.floor(N*.9)] + ')', ' lost', (losses / N).toFixed(1), ' boss tries', (bossTries / N).toFixed(2), ' witch turns', Math.round(hero / N), ' foe turns', Math.round(foe / N), ' metres walked in fight scenes', Math.round(walked / N));
  const mins = (h, f, k) => ((hero / N) * h + (foe / N) * f + (fights / N) * k) / 60;
  console.log('  fight minutes: quick', mins(4, 2.5, 8).toFixed(0), ' middle', mins(6, 3, 10).toFixed(0), ' slow', mins(9, 4, 12).toFixed(0));
}
if (process.argv[2] === 'xp') { for (const [k, f] of Object.entries(P.sets)) console.log(k, f.code, 'L' + f.level, xpOf(f.code, f.level)); for (const [k, s] of Object.entries(P.scenes)) console.log(k, s.table.map(([c, l]) => `${c} L${l} ${xpOf(c, l)}`).join(', ')); }
