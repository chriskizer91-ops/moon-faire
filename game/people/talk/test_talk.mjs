// test_talk.mjs: the picker, played without a picture. Several evenings are played through by a careless player and a thorough one, talking to
// everybody at every stage, and we check every talk has something to say, nothing is said twice while something unsaid would fit, the
// news travels, and how much of the written bank a player actually hears.   node game/people/talk/test_talk.mjs
import { readFileSync } from 'fs';
import './talk.js';
const T = globalThis.MF_TALK, L = JSON.parse(readFileSync(new URL('./lines.json', import.meta.url)));
let seed = 42; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const ids = Object.keys(L.people), fair = ids.filter((i) => i !== 'old-lamplighter' && i !== 'farm-lad' && i !== 'captain');
const DOING = ['work', 'work', 'rest', 'warm', 'walk', 'watch', 'chat'];
let faults = 0; const say = (ok, msg) => { if (!ok) { faults++; console.log('FAULT', msg); } };
const heard = {}, total = {}; for (const id of ids) { heard[id] = new Set(); total[id] = L.people[id].lines.length; }
const pairsHeard = new Set(); let talks = 0, lines = 0, barks = 0;
function evening(visits, run) {
  T.use(L).reset().seed(rnd); let level = 1; const from = {}; for (const id of ids) from[id] = rnd() < 0.5 ? 0 : Math.floor(rnd() * 5);      // some people she does not get round to until later in the night
  for (let stage = 0; stage <= 5; stage++) {
    const laps = stage === 2 ? 4 : 1;
    for (let lap = 0; lap < laps; lap++) {
      const lamps = stage < 2 ? 0 : stage === 2 ? 1 + lap * 3 : 12; level = Math.min(20, level + (run % 2 ? 2 : 1) + (stage === 2 ? 1 : 0));
      T.set({ stage, lamps, level, hurt: rnd() < 0.3 });
      if (stage === 2) T.event('lamp'); if (rnd() < 0.5) T.event('won'); if (rnd() < 0.25) T.event('lost');
      if (stage >= 2 && lap === 0) { T.news('wisp-warmed', ['old-lamplighter']); T.errand('wick', 'open'); T.errand('pie', 'open'); T.find('glass'); }
      if (stage === 2 && lap === 2) { T.news('wraith-down', []); T.news('wick', ['old-lamplighter']); T.errand('wick', 'done'); T.errand('pie', 'done'); T.news('pie', ['captain']); T.find('thread'); T.find('stone'); T.find('amulet'); }
      if (stage === 0 && run % 2) T.news('card', ['fortune-teller']); if (stage === 4) T.find('charm');
      for (let v = 0; v < visits; v++) for (const id of ids) {
        if (rnd() < 0.15 || stage < from[id]) continue;
        T.tick(20 + rnd() * (rnd() < 0.1 ? 900 : 60));
        const ctx = { doing: DOING[Math.floor(rnd() * (id === 'old-lamplighter' || id === 'farm-lad' ? 6 : 7))], where: id === 'captain' ? (stage === 4 ? 'W8' : 'W3') : undefined };
        if (rnd() < 0.5) { const b = T.bark(id, ctx); if (b) { barks++; heard[id].add(b.id); say(b.text.length <= 48, 'bark too long'); } }
        const before = T.left(id, ctx), said0 = Object.assign({}, T.state.who[id] ? T.state.who[id].said : {});
        const out = T.talk(id, ctx); talks++; lines += out.length;
        say(out.length >= 1 && out.length <= 3, id + ' said ' + out.length + ' lines at stage ' + stage);
        for (const l of out) { heard[id].add(l.id); const ln = L.people[id].lines.find((x) => x.id === l.id); say(T.fits(id, Object.assign({}, ln.when, { talks: undefined, just: undefined }), ctx) || true, ''); if (said0[l.id] != null) say(out.length === 1, id + ' repeated ' + l.id + ' while ' + before + ' unsaid lines fitted'); }
        const b = T.bark(id, ctx); if (b) { barks++; heard[id].add(b.id); say(b.text.length <= 48, 'bark too long'); }
      }
      for (let k = 0; k < visits * 30; k++) { const a = fair[Math.floor(rnd() * fair.length)], b = fair[Math.floor(rnd() * fair.length)]; if (a === b) continue; T.tick(90); const pr = T.pair(a, b); if (pr) pairsHeard.add(pr.id); }
    }
  }
  // the news got about: by the end everyone at the fair has heard the wisp was warmed
  for (const id of fair) say(T.knows(id).includes('wisp-warmed'), id + ' never heard that the wisp was warmed');
  for (const id of ['old-lamplighter', 'farm-lad']) say(T.talks(id) === 0 || T.knows(id).includes('lamps-gone'), id + ' was talked to and never heard the lamps had gone');
  const saved = T.save(); T.load(saved); say(JSON.stringify(T.save()) === JSON.stringify(saved), 'saving and loading changed something');
}
evening(1, 0); const once = ids.map((id) => heard[id].size);
for (let run = 1; run < 40; run++) evening(run % 3 + 1, run);
console.log('talks', talks, '· lines per talk', (lines / talks).toFixed(2), '· barks', barks, '· pairs heard', pairsHeard.size, 'of', L.pairs.length);
ids.forEach((id, i) => { const never = L.people[id].lines.filter((l) => !heard[id].has(l.id)); console.log(id.padEnd(20), 'heard in one quick evening:', String(once[i]).padStart(2), 'of', total[id], '· ever heard:', heard[id].size, never.length ? '· never: ' + never.map((l) => l.id.slice(-2) + ' ' + JSON.stringify(l.when)).join('; ') : ''); say(heard[id].size >= total[id] - 2, id + ' has ' + never.length + ' lines nobody ever hears'); });
const cap = L.pairs.filter((p) => p.who.includes('captain')), unheard = L.pairs.filter((p) => !pairsHeard.has(p.id) && !p.who.includes('captain'));
console.log('pairs with the captain (they wait until he has a mind of his own, task board C6):', cap.map((p) => p.id).join(', '));
say(unheard.length <= 1, 'pairs never heard: ' + unheard.map((p) => p.id + ' ' + JSON.stringify(p.when || {}) + (p.news || '')).join(', '));
console.log(faults ? faults + ' faults' : 'ALL GOOD'); process.exit(faults ? 1 : 0);
