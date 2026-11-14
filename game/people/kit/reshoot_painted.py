# Draws every painted person again as the kit and their files stand now (no API calls): people/painted/*/final.jpg and the
# line-ups in people/npc/review/lineup-now-*.jpg. Run from game/: python3 people/kit/reshoot_painted.py
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
import review_npcs as R
import io
from PIL import Image
async def main():
    s = await Shooter().start(); ppl = R.people()
    for p in ppl: p['SKIN'] = json.loads(await s.body.evaluate('(c) => PV.data(c, "SKIN")', p['skin_text']))
    await s.body.evaluate('() => { PV.showWitch(); PV.draw("line"); }'); await s.body.wait_for_timeout(900); await s.body.evaluate('() => { PV.step(1/30, 10); PV.draw("line"); }')
    witch = Image.open(io.BytesIO(await s.body.screenshot())).convert('RGB').crop((50, 0, 250, 560))
    for p in ppl: await R.render(s, p); p['sheet'].save(p['dir'] + '/final.jpg', quality=84)
    R.lineup(witch, [p for p in ppl if p['tag'] != 'opus'], 'The lamp-seller model and the shapes by Fable 5.2').save(os.path.join(R.OUTD, 'lineup-now-a.jpg'), quality=86)
    R.lineup(witch, [p for p in ppl if p['tag'] == 'opus'], 'The shapes by Opus 5.5').save(os.path.join(R.OUTD, 'lineup-now-b.jpg'), quality=86)
    print('redrawn', len(ppl)); await s.stop()
asyncio.run(main())
