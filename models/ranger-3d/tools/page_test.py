# page_test.py : opens the one-file page at phone size, presses the hand and arm buttons, drags, and saves what the stage shows
import sys
from playwright.sync_api import sync_playwright
from PIL import Image
PAGE = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ranger/deliver/Ranger_3D_stage5b.html'
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(240000); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:300])); pg.on('console', lambda m: logs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
    pg.goto('file://' + PAGE); pg.wait_for_function('window.RANGER', timeout=240000); pg.wait_for_timeout(7000)
    print('hud:', pg.inner_text('#hud'), '| chips:', {k: pg.evaluate('(k) => document.querySelectorAll("#" + k + " .chip").length', k) for k in ('gear', 'hviews', 'faces', 'boots', 'hands', 'views', 'poses', 'shows')})
    bx = pg.locator('#stage').bounding_box(); clip = {'x': bx['x'], 'y': bx['y'], 'width': bx['width'], 'height': bx['height']}; shots = []
    def shot(name): pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(300); f = '/tmp/pt_%s.png' % name; pg.screenshot(path=f, clip=clip); shots.append(f)
    shot('open')
    for host, label in (('gear', 'Charms'), ('gear', 'Under the satchel'), ('gear', 'Satchel'), ('gear', 'Strap hook'), ('poses', 'Legs apart'), ('boots', 'Outer side'), ('hands', 'Left hand'), ('views', 'Front'), ('hviews', 'Face')):
        pg.evaluate('window.scrollTo(0,0)'); pg.click('#%s >> text="%s"' % (host, label)); pg.wait_for_timeout(6500); shot(host + '_' + label.replace(' ', '_'))
    pg.evaluate('window.scrollTo(0,0)'); pg.click('#gear >> text="Charms"'); pg.wait_for_timeout(5000); pg.click('#swingB'); pg.wait_for_timeout(260); shot('swing'); pg.wait_for_timeout(5000); print('after the swing, bag and charm turns:', pg.evaluate('Object.keys(RANGER.R.SK).filter((k) => /bag|charm/.test(k)).map((k) => +(1 - RANGER.R.SK[k].quaternion.w).toFixed(4))'))
    print('after Face: target', pg.evaluate('RANGER.stage.orbit.target.toArray().map((v) => +v.toFixed(3))'), 'pressed pose:', pg.evaluate('[...document.querySelectorAll("#poses .chip")].filter((c) => c.getAttribute("aria-pressed") === "true").map((c) => c.textContent)'))
    az0 = pg.evaluate('RANGER.stage.orbit.az'); cx, cy = bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2
    pg.mouse.move(cx, cy); pg.mouse.down(); pg.wait_for_timeout(300)
    for i in range(1, 9): pg.mouse.move(cx + 10 * i, cy); pg.wait_for_timeout(120)
    pg.mouse.up(); pg.wait_for_timeout(800)
    print('drag turned her by', round(pg.evaluate('RANGER.stage.orbit.az') - az0, 3), 'rad; errors:', logs[:4])
    b.close()
ims = [Image.open(f).convert('RGB') for f in shots]; w = sum(i.width for i in ims) + 6 * (len(ims) - 1); m = Image.new('RGB', (w, ims[0].height), (20, 16, 24)); x = 0
for i in ims: m.paste(i, (x, 0)); x += i.width + 6
m.save('/home/claude/ranger/shots/page_test.jpg', quality=88); print('shots/page_test.jpg', m.size)
