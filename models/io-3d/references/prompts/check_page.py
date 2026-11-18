# Opens the page at phone width, checks images, copy buttons, the big view and the kept boxes, and takes pictures.
import sys, json
from playwright.sync_api import sync_playwright
page_path, shots = sys.argv[1], sys.argv[2]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    pg = ctx.new_page()
    pg.on('console', lambda m: errs.append('console ' + m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.goto('file://' + page_path); pg.wait_for_load_state('load')
    info = pg.evaluate("""() => {
      const imgs=[...document.querySelectorAll('figure img')];
      return {imgs: imgs.length, broken: imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.id),
        cards: document.querySelectorAll('article.card').length, copies: document.querySelectorAll('button.copy').length,
        saves: [...document.querySelectorAll('a.save')].filter(a=>a.href.startsWith('data:image/jpeg')&&a.download).length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tally: document.getElementById('tally').textContent,
        dupIds: (()=>{const s={},d=[];document.querySelectorAll('[id]').forEach(e=>{if(s[e.id])d.push(e.id);s[e.id]=1});return d})(),
        wide: [...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1 && !e.closest('nav') && !e.closest('#box')).slice(0,5).map(e=>e.tagName+'.'+e.className)}
    }""")
    print(json.dumps(info))
    pg.screenshot(path=shots + '/01_top.png')
    # copy a prompt and read it back
    pg.locator('#c-A1 button.copy').click(); pg.wait_for_timeout(200)
    clip = pg.evaluate('navigator.clipboard.readText()')
    print('A1 copied ok:', clip == pg.locator('#p-A1').text_content(), '| button says:', pg.locator('#c-A1 button.copy').text_content())
    pg.locator('#rules button.copy').first.click(); pg.wait_for_timeout(200)
    clip = pg.evaluate('navigator.clipboard.readText()')
    print('rules copied ok:', clip.startswith("I'm attaching five images.") and clip.rstrip().endswith('wait for my first request.'), len(clip))
    # fallback path: no clipboard API
    pg.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
    pg.locator('#c-C1 button.copy').click(); pg.wait_for_timeout(200)
    print('fallback copy button says:', pg.locator('#c-C1 button.copy').text_content())
    # kept box
    pg.locator('#c-A1 input').check(); pg.wait_for_timeout(100)
    print('tally after one kept:', pg.locator('#tally').text_content(), '| round 1:', pg.locator('#tally-1').text_content(), '| stored:', pg.evaluate("localStorage.getItem('io-reference-kept-v1')"))
    pg.locator('#c-A1').scroll_into_view_if_needed(); pg.screenshot(path=shots + '/02_card.png')
    # attach chip opens the big view
    pg.locator('#c-C17 button.att').first.click(); pg.wait_for_timeout(300)
    print('big view open:', pg.locator('#box').evaluate("e=>e.classList.contains('on')"), '|', pg.locator('#box .bar b').text_content(), '| save name:', pg.locator('#box .bar a').get_attribute('download'))
    pg.screenshot(path=shots + '/03_box.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    print('big view closed:', not pg.locator('#box').evaluate("e=>e.classList.contains('on')"))
    for sel, name in (('#images', '04_images'), ('#rules', '05_rules'), ('#set-C', '06_setC'), ('#magic', '07_magic'), ('#c-H9', '08_H9'), ('#plan', '09_plan')):
        pg.locator(sel).scroll_into_view_if_needed(); pg.evaluate("s=>document.querySelector(s).scrollIntoView()", sel); pg.wait_for_timeout(150); pg.screenshot(path=shots + '/' + name + '.png')
    # desktop width too
    pg2 = b.new_context(viewport={'width': 1280, 'height': 900}).new_page(); pg2.goto('file://' + page_path); pg2.wait_for_load_state('load')
    pg2.screenshot(path=shots + '/10_desktop.png'); pg2.evaluate("document.querySelector('#images').scrollIntoView()"); pg2.screenshot(path=shots + '/11_desktop_images.png')
    b.close()
print('errors:', errs)
