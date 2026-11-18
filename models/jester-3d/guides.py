# Renders layout guides from the 3D model in an A-pose (orthographic-like), with and without the veils.
import sys
from PIL import Image
from playwright.sync_api import sync_playwright
W, H = 760, 1000
APOSE = "const R=T.j.debug.REST, F=T.j.debug.FP; R.hR=[-0.46,1.02,0.03]; R.hL=[0.46,1.02,0.03]; R.fR=F.soft.slice(); R.fL=F.soft.slice(); R.twR=0.2; R.twL=0.2; T.step(240,1/60); T.stage.noFloor=true; T.stage.floor.visible=false; T.stage.shadowCatcher.visible=false; T.stage.bg=new THREE.Color(0xc4c4c4); T.stage.camera.far=300; 1"
HIDE = "T.j.debug.cloths.forEach((c,i)=>c.meshes.forEach(m=>m.visible=!(i>=2&&i<=20))); 1"
SHOW = "T.j.debug.cloths.forEach((c,i)=>c.meshes.forEach(m=>m.visible=true)); 1"
VIEWS = [('front', 0), ('back', 3.14159), ('left', 1.5708), ('right', -1.5708)]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 800, 'height': 1040}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('file:///home/claude/work/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    pg.evaluate(APOSE)
    for tag, js in [('full', SHOW), ('base', HIDE)]:
        pg.evaluate(js)
        for name, az in VIEWS:
            pg.evaluate(f"T.view({az},0,18,0.93,6.6,{W},{H})"); pg.locator('#c').screenshot(path=f'/tmp/g_{tag}_{name}.png')
    pg.evaluate(HIDE)
    for name, az in [('front', 0), ('q', -0.7), ('side', 1.5708)]:
        pg.evaluate(f"T.view({az},0,18,1.5,1.7,640,640)"); pg.locator('#c').screenshot(path=f'/tmp/g_head_{name}.png')
    print('errors', errs[:3]); b.close()
def pair(a, b, out):
    A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); im = Image.new('RGB', (A.width + B.width, A.height), (196, 196, 196)); im.paste(A, (0, 0)); im.paste(B, (A.width, 0)); im.save(out); print(out, im.size)
D = '/home/claude/work/deliver/sheets/'
pair('/tmp/g_full_front.png', '/tmp/g_full_back.png', D + 'D_guide_full_front_back.png'); pair('/tmp/g_full_left.png', '/tmp/g_full_right.png', D + 'E_guide_full_sides.png')
pair('/tmp/g_base_front.png', '/tmp/g_base_back.png', D + 'F_guide_base_front_back.png'); pair('/tmp/g_base_left.png', '/tmp/g_base_right.png', D + 'G_guide_base_sides.png')
hs = [Image.open(f'/tmp/g_head_{n}.png').convert('RGB') for n in ['front', 'q', 'side']]; im = Image.new('RGB', (640 * 3, 640), (196, 196, 196)); [im.paste(h, (i * 640, 0)) for i, h in enumerate(hs)]; im.save(D + 'H_guide_head.png'); print('H', im.size)
