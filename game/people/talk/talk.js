// talk.js: what the fair folk say, chosen from the written bank by what has happened so far.
// No drawing and no three.js: it holds what the evening has come to (the stage, lamps home, the party's level, who she has talked to and how
// often, who has heard what) and answers three questions: what does this person say when she talks to them, what do they call out as she
// passes, and what do two of them say to each other. The lines are data (lines.js, window.MF_LINES), written to TALK-KIT.md.
//
//   MF_TALK.use(window.MF_LINES);                    // once
//   MF_TALK.set({ stage: 2, lamps: 4, level: 6 });   // whenever the game's own state changes
//   MF_TALK.event('won' | 'lost' | 'lamp');          // a fight won, the four knocked flat, a lamp brought home
//   MF_TALK.news('wisp-warmed', ['old-lamplighter']);// something has happened, and who saw it (she always knows)
//   MF_TALK.find('glass'); MF_TALK.errand('wick', 'open');
//   MF_TALK.tick(dt);                                // every frame: its clock
//   const lines = MF_TALK.talk('fair-baker', { doing: 'work' });   // one to three lines: { id, text, emote, slot }
//   const line = MF_TALK.bark('fair-baker', { doing: 'walk' });    // or null
//   const pair = MF_TALK.pair('fair-baker', 'pie-seller');         // { id, lines: [{ by, text }] } or null; passes news between them
//   MF_TALK.save() / MF_TALK.load(saved)             // for the game's saving
(function (root) {
  'use strict';
  const STAGES = ['dusk', 'gone', 'hunt', 'twelve', 'crag', 'after'];
  const NEWS = ['lamps-gone', 'first-lamp', 'wisp-warmed', 'wraith-down', 'card', 'wick', 'pie', 'flat', 'stitched', 'beacon'];
  const MOOR = { 'old-lamplighter': 1, 'farm-lad': 1 };            // out on the moor: news only reaches them through her
  // how particular each key is: the line with the highest total that fits is said first
  const WEIGH = { just: 5, errand: 5, heard: 4, met: 3, has: 3, doing: 3, lamps: 2, level: 2, talks: 2, stage: 1, where: 1 };
  const AWAY = 600, WON = 180, BARK_EACH = 50, BARK_ANY = 9;       // seconds
  let L = { people: {}, pairs: [] }, S = fresh(), rnd = Math.random;

  function fresh() { return { stage: 0, lamps: 0, level: 1, hurt: false, now: 0, lastWon: -1e9, lastBark: -1e9, has: {}, errand: { wick: 'none', pie: 'none' }, her: {}, who: {}, pairs: {} }; }
  function W(id) { return S.who[id] || (S.who[id] = { talks: 0, said: {}, last: -1e9, lastBark: -1e9, knows: {}, lost: false, lamp: false, n: 0 }); }
  const inside = (v, r) => v >= r[0] && v <= r[1];

  // does this line fit now? ctx: { doing, where }
  function fits(id, w, ctx) {
    const p = W(id);
    if (w.stage && !inside(S.stage, w.stage)) return false;
    if (w.talks && !inside(p.talks, w.talks)) return false;
    if (w.lamps && !inside(S.lamps, w.lamps)) return false;
    if (w.level && !inside(S.level, w.level)) return false;
    if (w.met && !(S.who[w.met] && S.who[w.met].talks > 0)) return false;
    if (w.heard && !p.knows[w.heard]) return false;
    if (w.has && !S.has[w.has]) return false;
    if (w.errand) for (const k in w.errand) if (S.errand[k] !== w.errand[k]) return false;
    if (w.doing && (!ctx || ctx.doing !== w.doing)) return false;
    if (w.where && (!ctx || ctx.where !== w.where)) return false;
    if (w.just) {
      if (w.just === 'won' && !(S.now - S.lastWon < WON)) return false;
      if (w.just === 'lost' && !p.lost) return false;
      if (w.just === 'hurt' && !S.hurt) return false;
      if (w.just === 'away' && !(p.talks > 0 && S.now - p.last > AWAY)) return false;
      if (w.just === 'lamp' && !p.lamp) return false;
    }
    return true;
  }
  function weigh(w) {
    let s = 0;
    for (const k in w) { s += WEIGH[k] || 0; if (k === 'stage' && w.stage[0] === w.stage[1]) s += 0.5; if (k === 'lamps' && w.lamps[1] - w.lamps[0] <= 2) s += 1; }
    return s;
  }
  // the best of some lines: unsaid before said, then the most particular, then the one said longest ago; ties fall by chance
  function best(id, lines, ctx, opt) {
    const p = W(id); let pick = null, top = -1e9;
    for (const ln of lines) {
      if (opt && opt.not && opt.not[ln.id]) continue;
      if (!fits(id, ln.when || {}, ctx)) continue;
      const said = p.said[ln.id]; if (said != null && opt && opt.fresh) continue;
      const sc = (said == null ? 1000 : -(said + 1) / (p.n + 1) * 10) + weigh(ln.when || {}) + rnd() * 0.4;      // p.said holds when it was last said, counted in lines
      if (sc > top) { top = sc; pick = ln; }
    }
    return pick;
  }
  function mark(id, ln) { const p = W(id); p.said[ln.id] = ++p.n; return { id: ln.id, text: ln.text, emote: ln.emote || null, slot: ln.slot }; }
  const of = (id) => (L.people[id] && L.people[id].lines) || [];

  // she talks to someone: one to three lines. An opening (a hello the first time; after that, how well they know her by now),
  // then the most particular thing they have not yet said (what has just happened, news, a find...), then what they make of the night at this stage.
  function talk(id, ctx) {
    const all = of(id).filter((l) => l.kind !== 'bark'), p = W(id), out = [], not = {};
    const take = (ln) => { if (ln) { out.push(mark(id, ln)); not[ln.id] = 1; } return ln; };
    if (p.talks === 0) take(best(id, all.filter((l) => l.slot === 'hello'), ctx));
    else take(best(id, all.filter((l) => l.slot === 'count'), ctx, { fresh: true }));           // how well they know her by now, the first time that fits
    take(best(id, all.filter((l) => l.slot !== 'hello' && l.slot !== 'count' && l.slot !== 'stage'), ctx, { fresh: true, not }));      // what has just happened comes first here, being the most particular
    take(best(id, all.filter((l) => l.slot === 'stage'), ctx, { fresh: out.length > 0, not }));
    if (!out.length) take(best(id, all.filter((l) => l.slot !== 'hello'), ctx));                // everything fitting has been said: the one said longest ago
    // the news passes both ways, and what was waiting on her is settled
    for (const n in p.knows) S.her[n] = 1; for (const n in S.her) p.knows[n] = 1;
    p.talks++; p.last = S.now; p.lost = false; p.lamp = false;
    return out;
  }
  // called out as she passes. Not too often from one person, nor from anyone
  function bark(id, ctx) {
    const p = W(id); if (S.now - p.lastBark < BARK_EACH || S.now - S.lastBark < BARK_ANY) return null;
    const ln = best(id, of(id).filter((l) => l.kind === 'bark'), ctx, { fresh: true }) || (rnd() < 0.35 ? best(id, of(id).filter((l) => l.kind === 'bark'), ctx) : null);
    if (!ln) return null; p.lastBark = S.lastBark = S.now; return mark(id, ln);
  }
  // two of the fair folk meet. Whatever they say, each tells the other what they have heard
  function gossip(a, b) { if (MOOR[a] || MOOR[b]) return; const A = W(a), B = W(b); for (const n in A.knows) B.knows[n] = 1; for (const n in B.knows) A.knows[n] = 1; }
  function pair(a, b) {
    let pick = null, top = -1e9;
    for (const pr of L.pairs) {
      if (!(pr.who[0] === a && pr.who[1] === b) && !(pr.who[0] === b && pr.who[1] === a)) continue;
      if (pr.when && pr.when.stage && !inside(S.stage, pr.when.stage)) continue;
      if (pr.news && !W(a).knows[pr.news] && !W(b).knows[pr.news]) continue;                     // neither of them has that news to tell yet
      const said = S.pairs[pr.id], sc = (said == null ? 1000 : -said) + (pr.news ? 2 : 0) + (pr.when && pr.when.stage ? 1 : 0) + rnd() * 0.4;
      if (sc > top) { top = sc; pick = pr; }
    }
    gossip(a, b);
    if (!pick || S.pairs[pick.id] != null && S.now - S.pairs[pick.id] < 240) return null;      // nothing new between these two for now
    S.pairs[pick.id] = S.now; return { id: pick.id, who: pick.who, lines: pick.lines.map((l) => ({ by: l.by, text: l.text })) };
  }

  const api = {
    STAGES, NEWS,
    use(lines) { L = lines || { people: {}, pairs: [] }; L.pairs = L.pairs || []; return api; },
    get state() { return S; },
    reset() { S = fresh(); return api; },
    seed(fn) { rnd = fn || Math.random; return api; },
    tick(dt) { S.now += dt; },
    set(o) {
      for (const k of ['stage', 'lamps', 'level', 'hurt']) if (o[k] != null) S[k] = o[k];
      if (S.stage >= 1) api.news('lamps-gone', ['gate-keeper', 'chestnut-roaster', 'captain']);      // what each stage has shown, and to whom
      if (S.stage >= 3) api.news('stitched', ['gate-keeper', 'chestnut-roaster', 'captain']);
      if (S.stage >= 5) api.news('beacon', Object.keys(L.people).filter((id) => !MOOR[id]));
      return api;
    },
    event(name) {
      if (name === 'won') S.lastWon = S.now;
      if (name === 'lost') { for (const id in L.people) W(id).lost = true; api.news('flat', ['old-night-watchman']); }
      if (name === 'lamp') { S.lamps = Math.min(12, S.lamps + 1); for (const id in L.people) W(id).lamp = true; api.news('first-lamp', ['captain', 'gate-keeper', 'chestnut-roaster']); }
      return api;
    },
    news(id, saw) { S.her[id] = 1; for (const w of saw || []) W(w).knows[id] = 1; return api; },
    find(code) { S.has[code] = 1; return api; },
    errand(name, status) { S.errand[name] = status; return api; },
    talks(id) { return W(id).talks; },
    knows(id) { return Object.keys(W(id).knows); },
    guess(id) { return L.people[id] ? L.people[id].guess : ''; },
    talk, bark, pair, gossip, fits,
    left(id, ctx) { return of(id).filter((l) => W(id).said[l.id] == null && fits(id, l.when || {}, ctx)).length; },      // how many fitting lines they have not yet said
    save() { return JSON.parse(JSON.stringify(S)); },
    load(o) { S = Object.assign(fresh(), JSON.parse(JSON.stringify(o || {}))); return api; },
  };
  root.MF_TALK = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
