# shoot_hand.py out.jpg [L|R] [hand|arm] : close-ups of one hand (or forearm) from four sides, turned fingers-up, beside her painting
import sys, os
from playwright.sync_api import sync_playwright
from PIL import Image
out, S, what = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'L'), (sys.argv[3] if len(sys.argv) > 3 else 'hand')
s = 1 if S == 'L' else -1; HP = 1.5708
views = [('back', s * HP), ('thumb', 0.0), ('palm', -s * HP), ('little', 3.1416)]
off, fov, size = (0.088, 12, (440, 620)) if what == 'hand' else (-0.10, 22, (440, 760))
tmp = '/tmp/shoot_hand'; os.makedirs(tmp, exist_ok=True); ims = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:400])); pg.on('console', lambda m: logs.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('file:///home/claude/ranger/' + os.environ.get('PAGE', 'test_r.html')); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500)
    hide = os.environ.get('ALL', '') == ''
    t = pg.evaluate('''([S, off, hide]) => { T.j.pose({ arm: 0, leg: 0 }); const v = new THREE.Vector3(); T.j.SK['hand' + S].getWorldPosition(v);
        if (hide) for (const k in T.j.meshes) T.j.meshes[k].visible = /^(hand|handR|arm[LR]|nail|skin)$/.test(k);
        const O = S === 'L' ? 'R' : 'L'; T.j.SK['uarm' + O].rotation.z += (O === 'L' ? 1 : -1) * 2.4; T.j.root.updateMatrixWorld(true);
        T.stage.orbit.target.set(v.x, v.y - off, v.z + 0.004); return [v.x, v.y - off, v.z]; }''', [S, off, hide])
    for name, az in views:
        pg.evaluate(f'T.view({az}, 0, 1.0, {t[1]}, {fov}, {size[0]}, {size[1]})'); f = f'{tmp}/{name}.png'; pg.locator('#c').screenshot(path=f)
        ims.append(Image.open(f).convert('RGB').rotate(180))
    for l in logs[:8]: print(l)
    b.close()
src = Image.open('/home/claude/ranger/refs/' + ('D1' if S == 'L' else 'D2') + '.png').convert('RGB'); W = src.width
box = (0, 30, W // 2, 30 + int(W / 2 * size[1] / size[0])) if what == 'hand' else (0, 520, W // 2, 520 + 734)
halves = [src.crop(box), src.crop((W // 2, box[1], W, box[3]))]
if S == 'R': halves = halves   # D2: back view on the left, palm view on the right, as painted
halves = [h.resize((int(h.width * size[1] / h.height), size[1]), Image.LANCZOS) for h in halves]
row = [halves[0], ims[0], ims[1], ims[2], halves[1], ims[3]]
m = Image.new('RGB', (sum(i.width for i in row) + 5 * 6, size[1]), (20, 16, 24)); x = 0
for i in row: m.paste(i, (x, 0)); x += i.width + 6
m.save(out, quality=90); print(out, m.size)
