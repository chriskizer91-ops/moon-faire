# check_kit_pcam.py: each fair place drawn from its painting's own camera, under the painting (look/kpcam_<id>.png), to judge the kit
# pieces' brightness and warmth against how the painting shows them; prints the mean colour (linear) in boxes round chosen pieces.
# usage: python3 check_kit_pcam.py [W1 W2 W3]
import asyncio, os, base64, io, sys, json
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
from check import ARGS, HERE
W, H = 887, 444
# boxes (in an 887 x 444 picture) on kit pieces: x0, y0, x1, y1
BOX = {'W1': {'stall brass': (335, 85, 435, 135), 'stall moon': (470, 85, 560, 135), 'stall herb': (735, 150, 830, 215), 'stall lamp': (20, 240, 115, 345), 'wagon': (180, 330, 300, 400), 'well': (535, 255, 600, 300), 'crates': (595, 360, 720, 410)},
       'W2': {'stall L': (150, 100, 275, 225), 'stall R': (610, 100, 735, 225), 'big top': (345, 40, 540, 115), 'booth L': (35, 60, 145, 140), 'booth R': (750, 60, 850, 140), 'oven': (20, 130, 135, 235), 'pie': (765, 175, 865, 235), 'bales': (115, 340, 250, 400), 'crates': (665, 340, 750, 410)},
       'W3': {'tent R': (140, 60, 290, 165), 'tent L': (0, 60, 140, 200), 'crates far': (300, 105, 355, 160), 'crates near': (90, 335, 205, 405), 'barrels': (655, 330, 730, 400), 'rope': (210, 360, 305, 410), 'gate': (760, 85, 880, 240)}}
async def main(ids):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
        for pid in ids:
            P = await pg.evaluate('(id) => { const P = OWP.places.list.find((q) => q.id === id); return P.at; }', pid)
            await pg.evaluate('([x, z]) => { OWP.placeAt(x, z + 30, 3.14); OWP.step(1/30, 10); }', P)      # her well out of the frame
            url = await pg.evaluate('''([id, w, h]) => { const r = OWP.renderer, P = OWP.places.list.find((q) => q.id === id), cam = P.pcam, U = OW.U;
                const keep = U.uCamPos.value.clone(); U.uCamPos.value.copy(cam.position); r.setPixelRatio(1); r.setSize(w, h, false);
                r.setRenderTarget(null); r.setClearColor(0x15121c, 1); r.clear(); r.render(OW._scene, cam); const d = r.domElement.toDataURL('image/png'); U.uCamPos.value.copy(keep); return d; }''', [pid, W, H])
            im = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGB')
            paint = Image.open(os.path.join(HERE, 'data', 'paint_%s.webp' % pid)).convert('RGB').resize((W, H), Image.LANCZOS)
            both = Image.new('RGB', (W, 2 * H)); both.paste(paint, (0, 0)); both.paste(im, (0, H)); both.save(os.path.join(HERE, 'look', 'kpcam_%s.png' % pid))
            A = (np.asarray(im).astype(float) / 255) ** 2.2; Q = (np.asarray(paint).astype(float) / 255) ** 2.2; tot = []
            for nm, (x0, y0, x1, y1) in BOX.get(pid, {}).items():
                a = A[y0:y1, x0:x1].reshape(-1, 3).mean(0); q = Q[y0:y1, x0:x1].reshape(-1, 3).mean(0); g = q / np.maximum(a, 1e-4); tot.append(g)
                print(pid, nm.ljust(12), 'drawn', a.round(3), 'painted', q.round(3), 'gain', g.round(2))
            if tot: print(pid, 'median gain', np.median(np.array(tot), 0).round(2))
        await b.close()
asyncio.run(main(sys.argv[1:] or ['W1', 'W2', 'W3']))
