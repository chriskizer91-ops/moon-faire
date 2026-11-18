# weights.py: how many triangles each foe and each witch is at the weights the fight uses.   python3 weights.py
import asyncio, json
from playwright.async_api import async_playwright
from t import ARGS, PAGE
JS = '''async () => { await MeshoptSimplifier.ready; const o = {}; for (const k of ['wisp', 'wraith', 'great']) for (const w of ['light', 'fine']) o[k + ' ' + w] = MF_FOES.make(k, w).tris;
  for (const id of ['jester', 'fox', 'ranger', 'io']) for (const w of ['lightest', 'light']) o[id + ' ' + w] = Math.round(MF_WITCHES[id].raw(w).triangles); return o; }'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(); await pg.goto(PAGE + '?shot=1'); print(json.dumps(await pg.evaluate(JS), indent=1)); await b.close()
asyncio.run(main())
