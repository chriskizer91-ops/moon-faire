# check_pcam.py: the fair square drawn from its painting's own camera, beside the painting, to judge the skinned tents' brightness and
# warmth against how the painting shows them. Writes look/pcam_W1.png (the drawing) and prints, per tent, the mean colour of its walls and
# roof in the drawing and in the painting (linear), and the gain that would bring the drawing to the painting.
import asyncio, os, base64, io, json, sys
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
from check import ARGS, HERE
W, H = 887, 444
# boxes (in a 1774 x 887 painting) inside each tent's walls and roof, away from its edges, door and lamps
BOX = {'red': {'wall': [(300, 175, 360, 280), (400, 175, 470, 280)], 'roof': [(330, 60, 520, 120)]},
       'gold': {'wall': [(45, 300, 140, 380)], 'roof': [(70, 175, 270, 240)]},
       'star': {'wall': [(1260, 160, 1350, 270), (1440, 160, 1500, 260)], 'roof': [(1290, 50, 1470, 100)]},
       'green': {'wall': [(1580, 610, 1640, 700), (1700, 610, 1760, 700)], 'roof': [(1610, 470, 1760, 560)]}}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
        await pg.evaluate('() => { OWP.placeAt(-228, 99, 3.14); OWP.step(1/30, 10); }')
        url = await pg.evaluate('''([w, h]) => { const r = OWP.renderer, P = OWP.places.list.find((q) => q.id === 'W1'), cam = P.pcam, U = OW.U;
            const keep = U.uCamPos.value.clone(); U.uCamPos.value.copy(cam.position); r.setPixelRatio(1); r.setSize(w, h, false);
            r.setRenderTarget(null); r.setClearColor(0x15121c, 1); r.clear(); r.render(OW._scene, cam); const d = r.domElement.toDataURL('image/png'); U.uCamPos.value.copy(keep); return d; }''', [W, H])
        im = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGB'); im.save(os.path.join(HERE, 'look', 'pcam_W1.png'))
        await b.close()
    paint = Image.open(os.path.join(HERE, 'data', 'paint_W1.webp')).convert('RGB').resize((W, H), Image.LANCZOS)
    A = (np.asarray(im).astype(float) / 255) ** 2.2; Pn = (np.asarray(paint).astype(float) / 255) ** 2.2
    both = Image.new('RGB', (W, 2 * H)); both.paste(paint, (0, 0)); both.paste(im, (0, H)); both.save(os.path.join(HERE, 'look', 'pcam_W1_pair.png'))
    out = {}
    for t, parts in BOX.items():
        for part, boxes in parts.items():
            a = np.concatenate([A[y0 // 2:y1 // 2, x0 // 2:x1 // 2].reshape(-1, 3) for (x0, y0, x1, y1) in boxes]).mean(0)
            q = np.concatenate([Pn[y0 // 2:y1 // 2, x0 // 2:x1 // 2].reshape(-1, 3) for (x0, y0, x1, y1) in boxes]).mean(0)
            out[t + ' ' + part] = (a, q); print(t.ljust(6), part.ljust(5), 'drawn', a.round(3), 'painted', q.round(3), 'gain', (q / np.maximum(a, 1e-4)).round(2))
asyncio.run(main())
