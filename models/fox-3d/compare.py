# renders the model with a long lens and sets it beside sprite frames at the same scale, soles on one line
# usage: compare.py out.png 'setup js' frame:az[:label] ...
import sys, json
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
M=json.load(open('/home/claude/fox3d/ref/meta.json'))['frames']
out, setup, items = sys.argv[1], sys.argv[2], sys.argv[3:]
PXM = 357.6            # render pixels per meter with fov 8, dist 18, 900 px tall
SPR = 4.75e-3          # meters per sprite pixel
W,H = 620, 900
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920})
    logs=[]; pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600])); pg.on('console', lambda m: logs.append(m.text[:300]) if m.type=='error' else None)
    pg.goto('file:///home/claude/fox3d/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    cells=[]
    for it in items:
        parts = it.split(':'); frame = parts[0]; az = float(parts[1]) if len(parts)>1 else 0; js = parts[2] if len(parts)>2 else ''
        if setup.strip(): pg.evaluate(setup)
        if js: pg.evaluate(js)
        pg.evaluate(f'T.view({az},0.0,18,0.93,8,{W},{H})')
        pg.locator('#c').screenshot(path='/tmp/_cmp.png')
        r = Image.open('/tmp/_cmp.png').convert('RGB')
        cell = Image.new('RGB',(W*2,H),(56,48,67)); cell.paste(r,(W,0))
        if frame != '-':
            f = Image.open(f'/home/claude/fox3d/ref/hd/{frame}.webp').convert('RGBA'); m = M[frame]; k = SPR*PXM
            f = f.resize((round(f.width*k), round(f.height*k)), Image.LANCZOS)
            gy = H/2 + 0.93*PXM
            cell.paste(f,(round(W/2 - m['hdFootX']*k), round(gy - m['hdFootY']*k)), f)
        d = ImageDraw.Draw(cell)
        for yy in [0,0.5,1.0,1.5]:
            y = H/2 + (0.93-yy)*PXM; d.line([(0,y),(W*2,y)], fill=(90,80,105), width=1); d.text((4,y-12), f'{yy:.1f}', fill=(200,190,220))
        d.text((6,6), frame, fill=(255,230,150))
        cells.append(cell)
    for l in logs[:10]: print(l)
    b.close()
sheet = Image.new('RGB',(W*2*len(cells),H)); 
for i,c in enumerate(cells): sheet.paste(c,(i*W*2,0))
sc = float(__import__('os').environ.get('SCALE','0.6'))
sheet = sheet.resize((int(sheet.width*sc), int(sheet.height*sc)), Image.LANCZOS); sheet.save(out); print(out, sheet.size)
