# measure.py: how much room each witch's move takes up. Plays every move once in a long test fight and, while each plays, measures the box
# round everything of hers that is showing (her body and what her spell brings), in her own terms: "along" is toward her target (or the
# foes), "across" is toward the audience's side, "up" is height. Writes game/fight/spell_extents.js, which the camera reads so that a
# spell's whole animation is in the picture.   python3 measure.py
import asyncio, json, os
from playwright.async_api import async_playwright
from t import open_fight
SETUP = '''() => { const f = MF_FIGHT.debug.fight, B = f.battle; B.kd = 0.3; for (const x of f.foes) { x.e.max *= 8; x.e.hp = x.e.max; x.shown.max = x.e.max; x.shown.life = x.seenLife = x.e.hp; }
  const X = window.MX = {}, box = new THREE.Box3(), b = new THREE.Box3(), c = new THREE.Vector3();
  window.msample = () => { const a = f.act; if (!a || a.kind !== 'hero' || a.stage !== 'play') return; const P = a.P; f.group.updateMatrixWorld(true);
    if (!a.m0) { const T = a.T && a.th !== P ? a.T : null, G = f.geo, dx = T ? T.x - P.x : G.ux, dz = T ? T.z - P.z : G.uz, L = Math.hypot(dx, dz) || 1; a.m0 = { x: P.x, z: P.z, ux: dx / L, uz: dz / L, L: T ? L : 0 }; a.m0.sx = a.m0.ux >= 0 ? -a.m0.uz : a.m0.uz; a.m0.sz = a.m0.ux >= 0 ? a.m0.ux : -a.m0.ux; }
    const o = a.m0, key = a.id === 'j_curtain' ? 'g_curtain' : a.anim, R = X[key] || (X[key] = { a0: 0, a1: 0, b0: 0, b1: 0, up: 0, L: o.L, n: 0, body: 0 }); R.n++;
    for (const g of [P.a.root, P.a.fx]) { if (!g) continue; g.traverseVisible((m) => { if (!m.isMesh || m.isSkinnedMesh && g !== P.a.root) { if (!m.isMesh) return; } const mats = [].concat(m.material); if (mats.every((q) => q.transparent && q.opacity < 0.04) || mats.every((q) => q.visible === false)) return;
      const gb = m.geometry.boundingBox || (m.geometry.computeBoundingBox(), m.geometry.boundingBox); if (!gb || !isFinite(gb.min.x)) return; b.copy(gb).applyMatrix4(m.matrixWorld); const sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z; if (sx > 26 || sy > 26 || sz > 26 || sx + sy + sz < 0.02) return;
      for (let k = 0; k < 8; k++) { c.set(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z); const rx = c.x - o.x, rz = c.z - o.z, al = rx * o.ux + rz * o.uz, ac = rx * o.sx + rz * o.sz; R.a0 = Math.min(R.a0, al); R.a1 = Math.max(R.a1, al); R.b0 = Math.min(R.b0, ac); R.b1 = Math.max(R.b1, ac); R.up = Math.max(R.up, c.y); } }); } };
  window.mstep = (n) => { for (let i = 0; i < n; i++) { MF_FIGHT.debug.step(1/12, 1, true); window.msample(); } }; }'''
NEXT = '''([want, max]) => { const f = MF_FIGHT.debug.fight, E = MF_ENGINE; let turns = 0, n = 0;
  while (turns < max) { while (n < 200000 && f.phase !== 'menu' && f.phase !== 'over') { window.mstep(1); n++; }
    if (f.phase === 'over') return ['over', null]; const B = f.battle, h = B.fighters.find(x => x.id === f.current), ok = E.heroMoves(B, h).filter(m => m.ok).map(m => m.id), id = want.find(w => ok.indexOf(w) >= 0);
    if (id) { f.choose(id); return ['chose', id]; } const c = E.choose(B, h, 'attentive'); if (!f.choose(c.move, c.target)) f.choose(ok[0]); turns++; }
  return ['none', null]; }'''
async def main():
    want = ['i_revive', 'j_heal', 'f_plain', 'f_stitch', 'f_needles', 'f_quilt', 'f_decoy', 'f_cloth', 'i_mend', 'i_bloom', 'i_deity', 'i_thorn', 'i_plain', 'r_gem', 'r_plain', 'j_plain', 'j_jab', 'j_seal', 'f_flee']
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F2', 'foes': 'K2w', 'seed': 31, 'gap': 0, 'camera': 'side', 'party': {'jester': {'hp': 520}, 'fox': {'hp': 0}, 'io': {'hp': 200}}})
        await pg.evaluate(SETUP)
        for k in range(70):
            if not want: break
            r = await pg.evaluate(NEXT, [want, 16])
            if r[0] != 'chose': print('stopped:', r); break
            want.remove(r[1])
        await pg.evaluate('(() => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < 4000 && f.phase !== "menu" && f.phase !== "over") { window.mstep(1); n++; } })()')
        X = await pg.evaluate('window.MX'); print('left untried:', want, 'errors:', errs[:4])
        out = {k: {q: round(v[q], 2) for q in ('a0', 'a1', 'b0', 'b1', 'up', 'L')} for k, v in sorted(X.items())}
        for k, v in out.items(): print('%-18s along %6.1f..%5.1f  across %6.1f..%5.1f  up %4.1f  target at %4.1f' % (k, v['a0'], v['a1'], v['b0'], v['b1'], v['up'], v['L']))
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'spell_extents.js')
        head = "// spell_extents.js: how much room each witch's move takes up, in meters, measured by checks/measure.py (do not edit by hand).\n// along: toward her target or the foes (a0 behind her, a1 ahead); across: toward the audience's side (b0 away, b1 toward); up: height; L: how far her target stood.\n"
        out['g_curtain'] = {'a0': -2.0, 'a1': 9.0, 'b0': -4.0, 'b1': 4.0, 'up': 4.5, 'L': 5.0, 'by_hand': True}      # Curtain Call needs the last fight to play, so it is not measured: Sealed Fate's room, a little wider
        open(path, 'w').write(head + 'window.MF_EXTENTS = ' + json.dumps(out, indent=1) + ';\n')
        await b.close()
asyncio.run(main())
