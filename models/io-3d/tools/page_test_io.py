# the single-file page at phone size: loads, no errors, nothing off the side, buttons and a drag work; three stills
# (software rendering is slow: each still takes about half a minute)
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1); logs = []
    pg.set_default_timeout(150000)
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
    pg.goto('file:///home/claude/io/deliver/' + (sys.argv[1] if len(sys.argv) > 1 else 'Io_3D_stage3.html')); pg.wait_for_function('window.IO || !document.getElementById("err").hidden')
    pg.wait_for_timeout(3000)
    print('hud:', pg.inner_text('#hud'), '| err hidden:', pg.evaluate('document.getElementById("err").hidden'), '| scrollW', pg.evaluate('document.documentElement.scrollWidth'), 'clientW', pg.evaluate('document.documentElement.clientWidth'))
    print('buttons:', pg.evaluate('[...document.querySelectorAll(".chip")].map(b => b.textContent)'))
    def still(name):
        pg.wait_for_timeout(2500); pg.evaluate('IO.step()'); pg.screenshot(path='shots/page_%s.png' % name, clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
    still('0')
    pg.evaluate('document.querySelector("#views").children[4].click()'); still('face')
    pg.evaluate('document.querySelector("#views").children[6].click()'); still('profile')
    pg.evaluate('document.querySelector("#views").children[8].click()'); still('hairback')
    az0 = pg.evaluate('IO.stage.orbit.az')
    pg.evaluate('for (const id of ["hairB", "glassB", "hatB", "skirtB", "refB"]) document.querySelector("#" + id).click(); document.querySelector("#poses").children[2].click()')
    print('hair hidden:', pg.evaluate('!IO.R.meshes.tress.visible'), '| glasses hidden:', pg.evaluate('!IO.R.meshes.wire.visible'), '| hat hidden:', pg.evaluate('!IO.R.meshes.felt.visible'), '| skirt hidden:', pg.evaluate('!IO.R.meshes.skirt.visible'), '| painting hidden:', pg.evaluate('document.getElementById("ref").hidden'))
    pg.evaluate('document.querySelector("#views").children[5].click()'); still('bare')
    pg.evaluate('for (const id of ["hairB", "glassB", "hatB", "skirtB", "refB"]) document.querySelector("#" + id).click()')
    pg.evaluate('document.querySelector("#views").children[4].click(); document.querySelector("#faces").children[1].click()'); pg.wait_for_timeout(4000); still('talking')
    pg.evaluate('document.querySelector("#faces").children[2].click()'); still('shut')
    print('faces painted:', pg.evaluate('Object.keys(IO.R.debug.JH ? {a:1} : {}).length'), '| talk on then held:', pg.evaluate('typeof IO.R.talk'))
    pg.evaluate('document.querySelector("#faces").children[0].click()')
    pg.evaluate('document.querySelector("#flipB").click()'); on = pg.evaluate('IO.stage.look'); still('flipbook')
    pg.evaluate('document.querySelector("#views").children[0].click()'); pg.wait_for_timeout(3000); still('flipbook_full')
    pg.evaluate('document.querySelector("#flipB").click()'); print('Flipbook look: on ->', on, '| off ->', pg.evaluate('IO.stage.look'))
    az0 = pg.evaluate('IO.stage.orbit.az'); pg.evaluate('window.scrollTo(0, 0)')
    bx = pg.locator('#stage').bounding_box()
    pg.mouse.move(bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2); pg.mouse.down(); pg.mouse.move(bx['x'] + bx['width'] / 2 + 80, bx['y'] + bx['height'] / 2, steps=4); pg.mouse.up()
    pg.wait_for_timeout(1500); print('a drag turned her by', round(pg.evaluate('IO.stage.orbit.az') - az0, 3), 'rad')
    # her moves: every button starts its move; a short one ends by itself and she goes back to standing; what one frame of motion costs
    names = pg.evaluate('[...document.querySelector("#moves").children].map(b => b.textContent)'); got = []
    for i in range(1, len(names)):
        pg.evaluate('document.querySelector("#moves").children[%d].click()' % i); pg.evaluate('for (let k = 0; k < 40; k++) IO.R.animate(1 / 60)'); got.append(pg.evaluate('IO.R.move'))
        if names[i] in ('Twirl', 'Pick a herb', 'Curtsey'): pg.evaluate('document.querySelector("#views").children[1].click()'); pg.evaluate('for (let k = 0; k < 30; k++) IO.R.animate(1 / 60)'); still('move_' + got[-1])
    print('moves:', list(zip(names[1:], got)))
    pg.evaluate('document.querySelector("#moves").children[9].click()'); pg.evaluate('for (let k = 0; k < 220; k++) IO.R.animate(1 / 60)'); pg.wait_for_timeout(600)
    print('after a wave she is:', pg.evaluate('IO.R.move'), '| button lit:', pg.evaluate('[...document.querySelector("#moves").children].filter(b => b.getAttribute("aria-pressed") === "true").map(b => b.textContent)'))
    print('one frame of walking costs', pg.evaluate('(() => { IO.R.play("walk"); const t = performance.now(); for (let k = 0; k < 300; k++) IO.R.animate(1 / 60); return ((performance.now() - t) / 300).toFixed(3); })()'), 'ms here; bones:', pg.evaluate('IO.R.bones.length'))
    pg.evaluate('document.querySelector("#moves").children[0].click()'); pg.evaluate('document.querySelector("#views").children[0].click()'); still('still_again')
    print('stand still ->', pg.evaluate('IO.R.move'), '| pose button lit:', pg.evaluate('[...document.querySelector("#poses").children].filter(b => b.getAttribute("aria-pressed") === "true").map(b => b.textContent)'))
    for l in logs[:8]: print('  ', l)
    print('errors:', len(logs))
    b.close()
