# Draws every finished run again with the kit as it is now (no API calls): people/runs/*/final.jpg
import asyncio, glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
async def main():
    s = await Shooter().start()
    for d in sorted(glob.glob(os.path.join(HERE, '..', 'runs', '*__*'))):
        L = json.load(open(d + '/log.json')); facts, sheet = await s.shoot(open('%s/v%d.js' % (d, L['final'])).read(), 0.6)
        sheet.save(d + '/final.jpg', quality=82); L['final_facts'] = facts; json.dump(L, open(d + '/log.json', 'w'), indent=1); print(os.path.basename(d), facts['triangles'], facts['draws'], facts.get('errors'))
    facts, sheet = await s.shoot(open(os.path.join(HERE, '..', 'lampseller.js')).read(), 0.6); sheet.save(os.path.join(HERE, '..', 'runs', 'lampseller.jpg'), quality=82)
    await s.stop()
asyncio.run(main())
