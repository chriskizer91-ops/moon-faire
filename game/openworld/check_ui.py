# check_ui.py: the interface over the picture, at a laptop's size and a phone's: the picture with nothing open, the menu, the invitation and the
# speech bubble by the lamp-seller, someone talking at the edge of the picture, a place's title, the encounter card, the map, the loading screen.
# usage: python3 check_ui.py [lap|phone]      writes look/ui_<size>_<shot>.png (the picture) and look/ui_<size>_<shot>_page.png (the whole page)
import asyncio, os, sys
from playwright.async_api import async_playwright
from check import ARGS, HERE
SIZES = {'lap': (1280, 720), 'phone': (390, 760)}
LAMP = 'OWP.places.people.find((p) => p.id === "old-lamp-seller")'
async def main(which):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        for tag in which:
            w, h = SIZES[tag]
            pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=(tag == 'phone'), is_mobile=(tag == 'phone')); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
            async def shot(name, page=False):
                await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'ui_%s_%s.png' % (tag, name)))
                if page: await pg.screenshot(path=os.path.join(HERE, 'look', 'ui_%s_%s_page.png' % (tag, name)))
            await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
            await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
            await pg.evaluate('() => { document.getElementById("loading").hidden = false; document.getElementById("loadtext").textContent = "Making the land round her… 64%"; }'); await shot('loading', True)
            await pg.evaluate('() => { document.getElementById("loading").hidden = true; }')
            print(tag, 'err:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
            for k in range(30):
                await pg.evaluate('OWP.step(1/30, 4)')
                if await pg.evaluate('OWP.places.people.filter((p) => p.npc).length') >= 11: break
            # the place title, as she arrives in the square
            await pg.evaluate('() => { OWP.placeAt(0, 102, 1.57); OWP.step(1/30, 24); OWP.placeAt(-230.2, 99.5, 3.14); OWP.step(1/30, 24); }'); await pg.evaluate('() => { for (const a of document.getAnimations()) if (a.animationName === "title-in") { a.pause(); a.currentTime = 1100; } }'); await shot('title', True)
            await pg.evaluate('() => { for (const a of document.getAnimations()) if (a.animationName === "title-in") a.finish(); }')
            await pg.wait_for_timeout(3200); await pg.evaluate('OWP.step(1/30, 2)'); await shot('plain', True)
            await pg.click('#menubtn'); await pg.wait_for_timeout(200); await shot('menu', True)
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
            # the invitation, the first line half typed, the first line whole, the last line
            await pg.evaluate('() => { const P = %s; OWP.placeAt(P.x + 1.2, P.z, -1.57); OWP.step(1/30, 20); }' % LAMP); await shot('invite', True)
            print(tag, 'prompt:', await pg.evaluate('[document.getElementById("prompt").hidden, document.getElementById("prompt").textContent]'))
            await pg.evaluate('() => { OWP.act(); OWP.step(1/30, 12); }'); await shot('typing')
            await pg.evaluate('() => { OWP.act(); OWP.step(1/30, 2); }'); await shot('line1', True)
            await pg.evaluate('() => { OWP.act(); OWP.act(); OWP.act(); OWP.step(1/30, 3); OWP.act(); OWP.step(1/30, 3); }')
            print(tag, 'last line:', await pg.evaluate('[document.getElementById("sayname").textContent, document.getElementById("sayline").textContent, document.getElementById("say").className]'))
            await shot('lastline', True)
            # the same talk with the lamp-seller turned to the edge of the picture, and off it
            for nm, dy in (('edge', 0.42 if tag == 'lap' else 0.3), ('off', 1.2), ('gone', 2.0)):
                await pg.evaluate('(dy) => { const P = %s; OWP.placeAt(P.x + 1.2, P.z, -1.57); OWP.step(1/30, 5); OWP.act(); OWP.act(); OWP.cam.yaw = -1.57 + Math.PI + dy; OWP.cam.lastDrag = 1e9; OWP.step(1/30, 8); }' % LAMP, dy)
                await shot(nm)
            await pg.evaluate('() => { OWP.placeAt(-230.2, 99.5, 3.14); OWP.step(1/30, 4); }')
            # the map, and an encounter on the moor (with the foes sign)
            await pg.click('#mapbtn'); await pg.wait_for_timeout(200); await shot('map', True); await pg.click('#mapclose')
            await pg.evaluate('() => { OWP.placeAt(0, 102, 1.57); OWP.cam.yaw = -1.57; for (let i = 0; i < 40 && OWP.terrain.ready(OWP.me, 120) < 1; i++) OWP.step(1/30, 3); OWP.step(1/30, 30); }')
            await pg.wait_for_timeout(3300); await pg.evaluate('OWP.step(1/30, 2)'); await shot('moor', True)
            await pg.evaluate('() => { OWP.encounter(); }'); await pg.wait_for_timeout(800); await shot('card', True); await pg.evaluate('OWP.encDone()')
            await pg.evaluate('() => { OWP.toggleFlip(); OWP.placeAt(-230.2, 99.5, 3.14); OWP.toast("That is water. Pick somewhere on the land."); OWP.step(1/30, 10); }'); await pg.wait_for_timeout(3300); await pg.evaluate('() => { OWP.toast("That is water. Pick somewhere on the land."); const P = %s; OWP.placeAt(P.x + 1.2, P.z, -1.57); OWP.step(1/30, 5); OWP.act(); OWP.act(); OWP.step(1/30, 3); }' % LAMP); await shot('flip')
            print(tag, 'meter:', await pg.evaluate('document.getElementById("meter").textContent'))
            print(tag, 'errors:', errs[:6]); await pg.close()
        await b.close()
asyncio.run(main(sys.argv[1:] or ['lap', 'phone']))
