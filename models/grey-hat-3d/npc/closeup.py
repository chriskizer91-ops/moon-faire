# Pictures of the light version from chosen cameras on the kit's stage: python3 npc/closeup.py out.jpg '<weight json or "">' 'az,y,dist,el;az,y,dist,el;...' [js to run first]
# az, el in degrees; y the height looked at (his own metres); dist in metres
import asyncio, io, json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look
from shoot import Shooter
async def main():
    s = await Shooter().start(); pg = s.head
    await pg.evaluate('([c, k]) => { const S = k; S.SKIN = new Function(S.SKIN_TEXT + "\\n;return SKIN;")(); return PV.show(c, S); }', [look.code(sys.argv[2] or None), look.skin()])
    await pg.wait_for_timeout(600)
    await pg.add_script_tag(path=os.environ.get('EMOTES', '/home/claude/sw/game/people/npc/emotes.js'))
    await pg.evaluate('() => { window.EMO = (n, t) => { const J = PV.J, E = MF_EMOTES(J.FP)[n]; J.defAction("e_" + n, E.dur, E.keys, { outro: 0.4 }); J.play("e_" + n, true); PV.step(1 / 30, Math.round(t * 30)); }; }')
    if len(sys.argv) > 4: await pg.evaluate('async () => { ' + sys.argv[4] + ' }')
    shots = []
    for v in sys.argv[3].split(';'):
        az, y, d, el = [float(x) for x in v.split(',')]
        await pg.evaluate('([az, y, d, el]) => { PV.draw("face"); const c = PV.stage.camera, a = az * Math.PI / 180, e = el * Math.PI / 180; c.position.set(Math.sin(a) * Math.cos(e) * d, y + Math.sin(e) * d, Math.cos(a) * Math.cos(e) * d); c.lookAt(0, y, 0); c.updateMatrixWorld(); PV.stage.render(); }', [az, y, d, el])
        shots.append(Image.open(io.BytesIO(await pg.screenshot())))
    await s.stop()
    w, h = shots[0].size; m = Image.new('RGB', (w * len(shots), h)); [m.paste(im, (w * i, 0)) for i, im in enumerate(shots)]; m.save(sys.argv[1], quality=88); print(sys.argv[1], m.size)
asyncio.run(main())
