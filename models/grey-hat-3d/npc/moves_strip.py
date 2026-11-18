# Stills of his light version moving, from its test page, pressing the page's own buttons.   python3 npc/moves_strip.py <out.jpg> [weight]
import io, os, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
STEPS = [('Walk about', 'bWalk', [1.4, 0.9, 0.9]), ('Run about', 'bRun', [1.2, 0.8]), ('Talk', 'bTalk', [2.0, 1.2]), ('Talk', 'bTalk', [0.6]),
         ('Say hello', 'bGreet', [1.0, 0.8]), ('wave', 'e:wave', [1.2]), ('point', 'e:point', [1.3]), ('shrug', 'e:shrug', [1.2]), ('laugh', 'e:laugh', [1.0]), ('think', 'e:think', [1.6]),
         ('Sit down', 'bSit', [2.5, 1.5])]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.goto('file://' + os.path.join(HERE, 'out', 'grey-hat-npc.html')); pg.wait_for_function('window.MF_NPC && document.getElementById("pick").options.length > 0', timeout=180000)
    if len(sys.argv) > 2: pg.select_option('#weight', sys.argv[2])
    pg.wait_for_timeout(5000); shots = []
    for label, bid, waits in STEPS:
        if bid.startswith('e:'):
            name = bid[2:]; pg.evaluate('(n) => { for (const x of document.querySelectorAll("#emotes button")) if (x.textContent.toLowerCase().replace(/ /g, "_") === n || x.dataset.e === n) { x.click(); return; } }', name)
        else: pg.click('#' + bid)
        for w in waits:
            pg.wait_for_timeout(int(w * 1000)); im = Image.open(io.BytesIO(pg.locator('#stagebox').screenshot())).convert('RGB'); im.thumbnail((300, 520))
            ImageDraw.Draw(im).text((6, 50), label, fill=(255, 230, 120)); shots.append(im)
    b.close()
w, h = max(i.size[0] for i in shots), max(i.size[1] for i in shots); cols = 8; rows = (len(shots) + cols - 1) // cols
m = Image.new('RGB', (w * cols, h * rows), (30, 24, 38)); [m.paste(im, ((k % cols) * w, (k // cols) * h)) for k, im in enumerate(shots)]; m.save(sys.argv[1], quality=86); print(sys.argv[1], m.size, len(shots))
