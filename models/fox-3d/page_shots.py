# usage: page_shots.py out_prefix move look walk 'az,el,dist' t1 t2 ...   stills of the REAL page (phone size, light build) at chosen seconds of one move.
#   look: smooth or flipbook.  walk: 1 turns Walk around on (the practice dummy appears and she aims at it), 0 leaves her on the spot.
#   The page runs slowly here, so each still is taken at the first frame at or after the second asked for; the time it really shows is printed.
import sys
from playwright.sync_api import sync_playwright
out, mv, look, walk = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] == '1'; view = sys.argv[5]; ts = [float(x) for x in sys.argv[6:]]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 520, 'height': 900}, device_scale_factor=1); logs = []
    pg.on('pageerror', lambda e: logs.append(str(e)[:300])); pg.on('console', lambda m: logs.append(m.text[:200]) if m.type == 'error' and 'font' not in m.text.lower() and 'ERR_' not in m.text else None)
    pg.goto('file:///home/claude/fox3d/out/site/test_local.html#lite'); pg.wait_for_function('window.FOX', timeout=180000); pg.wait_for_timeout(2000)
    if walk: pg.click("button:has-text('Walk around')"); pg.wait_for_timeout(1200)
    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(300)      # the click can scroll the page; the still must be of the whole picture
    pg.evaluate(f"FOX.stage.look = '{look}'")
    if view: az, el, dist = [float(x) for x in view.split(',')]; pg.evaluate(f"(() => {{ const o = FOX.stage.orbit; o.az = {az}; o.el = {el}; if ({dist} > 0) o.dist = {dist}; }})()")
    bb = pg.locator('canvas').first.bounding_box()      # a plain clip of the page: waiting for the canvas to hold still can time out while she walks
    pg.evaluate(f"(() => {{ FOX.J.stop(); FOX.setMove('{mv}'); }})()"); got = []
    for i, t in enumerate(ts):
        try: pg.wait_for_function(f"FOX.J.action !== '{mv}' || FOX.J.time >= {t}", timeout=240000)
        except Exception as e: logs.append('timeout at ' + str(t)); break
        got.append(round(pg.evaluate('FOX.J.time'), 2)); pg.screenshot(path=f'{out}_{i:02d}.png', clip=bb)
    print('asked', ts, 'got', got, 'errors', logs[:4]); b.close()
