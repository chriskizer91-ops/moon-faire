# usage: shoot_site.py out.png width height "chip label" wait_seconds [more "label:wait" ...]
import sys
from playwright.sync_api import sync_playwright
out, w, h = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); steps = sys.argv[4:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
    logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type in ('error','warning') and 'GPU stall' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    pg.goto('file:///home/claude/work/out/site/test_local.html?shot=1#lite')
    pg.wait_for_function('window.JESTER', timeout=120000)
    pg.wait_for_timeout(2500)
    k = 0
    for st in steps:
        label, wait = st.rsplit(':', 1)
        if label.startswith('js='): pg.evaluate(label[3:])
        elif label.startswith('key+'): pg.keyboard.down(label[4:])
        elif label.startswith('key-'): pg.keyboard.up(label[4:])
        elif label: pg.get_by_role('button', name=label, exact=True).click()
        pg.wait_for_timeout(int(float(wait) * 1000))
        pg.screenshot(path=out.replace('.png', f'_{k}.png'), full_page=(k == 0)); k += 1
    print('root:', pg.evaluate("(()=>{const r=JESTER.J.root; return [r.position.x.toFixed(2), r.position.z.toFixed(2), r.rotation.y.toFixed(2), JESTER.J.action, JESTER.J.stanceNow]})()"))
    print('animate ms:', pg.evaluate("(()=>{const J=JESTER.J; let t=1000; const t0=performance.now(); for(let i=0;i<120;i++){t+=1/60; J.animate(0,0,t,1/60);} return (performance.now()-t0)/120;})()"))
    print('fps probe:', pg.evaluate("(async()=>{let n=0;const t0=performance.now();await new Promise(r=>{function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r();} requestAnimationFrame(f);}); return n/2;})()"))
    for l in logs[:12]: print(l)
    b.close()
