# the sprite face beside the model face at the same scale (model rendered 4x finer, then both shown large)
import sys, json
from PIL import Image
from playwright.sync_api import sync_playwright
M = json.load(open('/home/claude/work/ref/meta.json'))['frames']; frames = sys.argv[2:] or ['A00']
PXM = 1430.0; W, H = 560, 620; CY = 1.50
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.goto('file:///home/claude/work/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print(pg.evaluate('T.err')); sys.exit(1)
    pg.evaluate(f"T.stage.camera.far=300; T.step(90,1/60); T.clean('color'); T.view(0,0,36,{CY},0.69,{W},{H})"); pg.locator('#c').screenshot(path='/tmp/_f.png'); b.close()
cells = []
for fr in frames:
    f = Image.open(f'/home/claude/work/ref/hd/{fr}.webp').convert('RGBA'); m = M[fr]; k = 4.75e-3 * PXM
    f = f.resize((round(f.width * k), round(f.height * k)), Image.NEAREST)
    im = Image.new('RGB', (W, H), (56, 48, 67)); im.paste(f, (round(W / 2 - m['hdFootX'] * k), round(H / 2 + CY * PXM - m['hdFootY'] * k)), f); cells.append(im)
cells.append(Image.open('/tmp/_f.png').convert('RGB'))
# and the model at sprite resolution, blown back up, to judge the read at flipbook size
lo = cells[-1].resize((round(W / (4.75e-3 * PXM)), round(H / (4.75e-3 * PXM))), Image.LANCZOS).resize((W, H), Image.NEAREST); cells.append(lo)
sh = Image.new('RGB', (W * len(cells), H)); [sh.paste(c, (i * W, 0)) for i, c in enumerate(cells)]
sh = sh.resize((int(sh.width * 0.62), int(sh.height * 0.62)), Image.LANCZOS); sh.save(sys.argv[1]); print(sys.argv[1], sh.size)
