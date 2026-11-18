// test_minds.js: the minds run without a picture. Eleven stand-in people on a stand-in fairground live through an evening, and we check
// nobody gets stuck, walks through a stall, strays too far, or stops doing things.   node game/people/talk/test_minds.mjs
import './minds.js';
const MF_MINDS = globalThis.MF_MINDS;
const boxes = []; let s = 7; const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
for (let i = 0; i < 60; i++) boxes.push({ x: -70 + r() * 140, z: -35 + r() * 70, w: 1 + r() * 2.5, d: 1 + r() * 2 });
const HOMES = { 'ballad-singer': [-40, 0], 'old-lamp-seller': [-45, 9], 'ribbon-dyer': [-37, -8], 'fortune-teller': [-33, -6], 'fair-baker': [-8, -1], 'old-night-watchman': [4, -1], 'pie-seller': [8.5, -1], 'gate-keeper': [48, -2], 'chestnut-roaster': [46, -5], 'old-lamplighter': [300, 0], 'farm-lad': [500, 3] };
const homes = Object.values(HOMES);
for (let i = boxes.length - 1; i >= 0; i--) if (homes.some((h) => Math.abs(h[0] - boxes[i].x) < boxes[i].w + 1.2 && Math.abs(h[1] - boxes[i].z) < boxes[i].d + 1.2)) boxes.splice(i, 1);
const seats = [], inBox = (x, z, pad) => boxes.some((b) => Math.abs(x - b.x) < b.w + pad && Math.abs(z - b.z) < b.d + pad) || seats.some((b) => Math.hypot(x - b.x, z - b.z) < 0.33 + pad);
const her = { x: -40, z: 4 };
const world = { walk: (x, z, pad) => !inBox(x, z, pad == null ? 0.22 : pad), height: () => 3, fires: [{ x: 45.2, z: -5 }, { x: -20, z: 6 }, { x: 499, z: 4 }], lamps: [[-3.6, -8.4], [3.6, -8.4], [-3.6, -2.3], [3.6, -2.3], [-30, 3], [30, 3]].map((q) => ({ x: q[0], z: q[1] })), her: () => her, bodies: () => [], seat: (x, z) => seats.push({ x, z }) };
function fakeNpc(x, z) {
  const st = { go: null, sit: false, talk: false, face: 0 }, root = { position: { x, y: 3, z }, rotation: { y: 0 } };
  return { root, get moving() { return !!st.go; }, get sitting() { return st.sit; }, get busy() { return false; }, get talking() { return st.talk; },
    walkTo(x, z) { if (st.go) st.go.done(false); st.sit = false; return new Promise((done) => { st.go = { x, z, done }; }); }, stop() { if (st.go) { const g = st.go; st.go = null; g.done(false); } },
    sit() { st.sit = true; }, stand() { st.sit = false; }, face() {}, talk(on) { st.talk = on; }, emote() {}, greet() {},
    update(dt) { if (!st.go) return; const p = root.position, dx = st.go.x - p.x, dz = st.go.z - p.z, far = Math.hypot(dx, dz); if (far < 0.04) { const g = st.go; st.go = null; g.done(true); return; } const step = Math.min(far, 0.84 * dt); p.x += dx / far * step; p.z += dz / far * step; } };
}
(async () => {
  const minds = MF_MINDS.make(world), people = [];
  for (const id in HOMES) { const [x, z] = HOMES[id], p = { id, x, z, y: 3, home: 0, npc: fakeNpc(x, z) }; people.push(p); minds.add(p); }
  const log = {}, pairs = {}; let notices = 0, bad = 0;
  for (const p of people) log[p.id] = { acts: {}, far: 0, inside: 0, goFor: 0, goMax: 0, moved: 0, lx: p.x, lz: p.z, doing: {} };
  minds.on.pair = (a, b) => { const k = [a.id, b.id].sort().join(' + '); pairs[k] = (pairs[k] || 0) + 1; };
  minds.on.notice = () => { notices++; };
  const DT = 0.05, MIN = 45; let stage = 0, lamps = 0;
  for (let i = 0; i < MIN * 60 / DT; i++) {
    const t = i * DT;
    if (i % 1200 === 0) { stage = Math.min(5, Math.floor(t / 60 / 7.5)); lamps = stage === 2 ? Math.floor((t / 60 - 15) / 7.5 * 11) + 1 : stage > 2 ? 12 : 0; minds.set({ stage, lamps }); }
    her.x = -40 + 45 * Math.sin(t / 50); her.z = 4 + 6 * Math.sin(t / 23);           // she wanders the fair
    if (i % 4000 === 2000) { const p = people[(i / 4000 | 0) % 9]; minds.hold(p, true); setTimeout(() => {}, 0); p._held = 200; }
    for (const p of people) if (p._held) { p._held--; if (!p._held) minds.hold(p, false); }
    minds.step(DT);
    for (const p of people) p.npc.update(DT);
    if (i % 5 === 0) await null;                                                    // let the walks' promises settle, as a browser frame would
    for (const p of people) { const L = log[p.id], m = minds.mind(p); L.acts[m.act] = (L.acts[m.act] || 0) + DT; const d = minds.doing(p); L.doing[d] = 1;
      if (Number.isNaN(p.x + p.z)) bad++; L.far = Math.max(L.far, Math.hypot(p.x - m.home.x, p.z - m.home.z)); if (boxes.some((b) => Math.abs(p.x - b.x) < b.w + 0.05 && Math.abs(p.z - b.z) < b.d + 0.05)) L.inside += DT;
      if (m.phase === 'go') { L.goFor += DT; L.goMax = Math.max(L.goMax, L.goFor); } else L.goFor = 0; L.moved += Math.hypot(p.x - L.lx, p.z - L.lz); L.lx = p.x; L.lz = p.z; }
  }
  let faults = 0; const say = (ok, msg) => { if (!ok) { faults++; console.log('FAULT', msg); } };
  for (const p of people) { const L = log[p.id], t = MF_MINDS.traits[p.id], share = Object.keys(L.acts).sort((a, b) => L.acts[b] - L.acts[a]).map((k) => k + ' ' + Math.round(L.acts[k] / (MIN * 60) * 100) + '%').join(', ');
    console.log(p.id.padEnd(20), share, '| walked', Math.round(L.moved), 'm, farthest', L.far.toFixed(1), 'm, doing:', Object.keys(L.doing).join(' '));
    say(Object.keys(L.acts).length >= 3, p.id + ' did fewer than three kinds of thing'); say(L.far <= t.roam + 2.5, p.id + ' strayed ' + L.far.toFixed(1) + ' m (roam ' + t.roam + ')');
    say(L.inside < 1, p.id + ' was inside a stall for ' + L.inside.toFixed(1) + ' s'); say(L.goMax < 150, p.id + ' was on the way somewhere for ' + L.goMax.toFixed(0) + ' s'); say(L.acts.work / (MIN * 60) > 0.2, p.id + ' was hardly ever at work'); }
  console.log('pairs who met:', Object.keys(pairs).length, JSON.stringify(pairs)); console.log('times someone noticed her:', notices);
  say(Object.keys(pairs).length >= 6, 'fewer than six different pairs met'); say(!bad, 'a position was not a number'); say(notices > 10, 'nobody noticed her');
  console.log(faults ? faults + ' faults' : 'ALL GOOD');
  process.exit(faults ? 1 : 0);
})();
