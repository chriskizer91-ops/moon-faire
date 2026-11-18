# bodies.py: how tall and how wide everyone really is, in every move (scythes, cloaks, hats, bows and antlers counted). Plays the last
# fight without drawing and measures the box round each body's own meshes, bones and all.   python3 bodies.py
import asyncio, json
from playwright.async_api import async_playwright
from t import open_fight
SETUP = '''() => { const f = MF_FIGHT.debug.fight; f.guard.on = false; const X = window.BX = {}, v = new THREE.Vector3();
  const box = (root, cx, cz) => { let up = 0, r = 0, n = 0; root.updateMatrixWorld(true); root.traverse((o) => { if (!o.isMesh) return; let q = o, vis = true; while (q) { if (!q.visible) { vis = false; break; } q = q.parent; } if (!vis) return;
      const pos = o.geometry.attributes.position; if (!pos) return; const st = Math.max(1, Math.floor(pos.count / 400));
      for (let i = 0; i < pos.count; i += st) { if (o.isSkinnedMesh) o.boneTransform(i, v); else v.fromBufferAttribute(pos, i); v.applyMatrix4(o.matrixWorld); if (!isFinite(v.y)) continue; n++; if (v.y > up) up = v.y; const d = Math.hypot(v.x - cx, v.z - cz); if (d > r) r = d; } }); return [up, r, n]; };
  window.bsample = () => { const a = f.act && f.act.kind && f.act.stage === 'play' ? f.act : null;
    for (const o of f.foes) { if (!o.vis || !o.up || o.dying) continue; const p = o.m.root.position, m = box(o.m.root, p.x, p.z), key = o.kind + ' ' + (a && a.f === o ? a.anim : 'standing'), R = X[key] || (X[key] = [0, 0, 0]); R[0] = Math.max(R[0], m[0]); R[1] = Math.max(R[1], m[1]); R[2]++; }
    for (const id in f.party) { const P = f.party[id]; if (!P.e) continue; const m = box(P.a.root, P.x, P.z), key = id + ' ' + (P.a.isDown ? 'down' : a && a.P === P ? a.anim : 'standing'), R = X[key] || (X[key] = [0, 0, 0]); R[0] = Math.max(R[0], m[0]); R[1] = Math.max(R[1], m[1]); R[2]++; } }; }'''
RUN = '''() => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < 900 && f.phase !== 'over') { MF_FIGHT.debug.step(1/30, 1, true); n++; if (n % 4 === 0) bsample(); } return f.phase === 'over'; }'''
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F3', 'foes': 'B2K2w', 'seed': 4242, 'auto': 'attentive', 'camera': 'auto'})
        await pg.evaluate(SETUP)
        for k in range(40):
            if await pg.evaluate(RUN): break
        X = await pg.evaluate('window.BX')
        for k in sorted(X): print('%-34s up %.2f  out %.2f  (%d looks)' % (k, X[k][0], X[k][1], X[k][2]))
        print(errs[:5]); await b.close()
asyncio.run(main())
