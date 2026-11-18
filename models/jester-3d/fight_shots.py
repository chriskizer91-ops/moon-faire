# Stills of a whole fight on the game moves page, as sheets. usage: fight_shots.py [WIDTHxHEIGHT]
import sys, subprocess
from PIL import Image
size = sys.argv[1] if len(sys.argv) > 1 else '390x800'
def run(name, steps, cols):
    r = subprocess.run(['python3', 'shoot_page.py', 'shots/' + name, size] + steps, capture_output=True, text=True, env=dict(__import__('os').environ, PAGE='out/game/test_local.html'))
    print(r.stdout[-900:], r.stderr[-600:])
    names = [s.split('=', 1)[0] for s in steps if s.split('=', 1)[0]]
    ims = [Image.open('shots/%s_%s.png' % (name, n)).convert('RGB') for n in names]
    w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (w * cols, h * rows), (20, 16, 26))
    for i, im in enumerate(ims): S.paste(im, ((i % cols) * w, (i // cols) * h))
    if S.width > 1900: S = S.resize((1900, int(S.height * 1900 / S.width)), Image.LANCZOS)
    S.save('shots/%s_sheet.png' % name); print('shots/%s_sheet.png' % name, S.size)
def seq(move, times, pre='', tag='s'):
    st = ['=' + pre] if pre else []; st.append('=P.setMove("%s")' % move); t = 0
    for i, x in enumerate(times):
        n = max(1, round((x - t) * 30)); t += n / 30; st.append('%s%02d=P.step(%d,1/30)' % (tag, i, n))
    return st
which = sys.argv[2:] or ['a', 'b', 'c']
if 'd' in which: run('fd', ['=P.step(60,1/30)'] + seq('g_curtain', [4.3, 9.6, 10.95, 11.2, 11.45, 11.75, 12.1, 12.6], tag='d'), 8)
STX = 0
ST = 'JSON.stringify(P.foes.map(f=>[f.def.label,f.life,f.fate,f.out,f.gone]).concat([[P.her.hp,P.her.mp,P.J.game.catches,P.J.action]]))'
if 'a' in which: run('fa', ['=P.step(90,1/30)'] + seq('g_rebuke', [0.7, 1.0, 1.1, 1.22, 1.6], tag='r') + ['=P.step(60,1/30)'] + seq('taunt_attack', [1.6, 2.6, 3.2, 3.7, 4.6, 6.4], tag='t') + ['hitc=(P.foeBlow(false),P.step(45,1/30),' + ST + ')', '=P.step(60,1/30)'] + seq('taunt_heal', [1.6, 3.2, 5.6, 7.6], tag='h') + ['end=(P.step(40,1/30),' + ST + ')'], 6)
if 'b' in which: run('fb', ['=P.step(60,1/30)', '=(P.foeBlow(true),P.step(100,1/30))', '=(P.foeBlow(false),P.step(100,1/30))', 'pre=' + ST] + seq('g_seal', [1.4, 2.5, 3.15, 3.4, 3.8, 4.02, 4.12, 4.3, 4.6, 5.3]) + ['after=(P.step(75,1/30),' + ST + ')'], 6)
if 'c' in which: run('fc', ['=P.step(60,1/30)', '=(P.foeBlow(true),P.step(100,1/30))', '=(P.foeBlow(false),P.step(100,1/30))', '=(P.setMove("g_seal"),P.step(200,1/30))', 'pre=(P.foeBlow(false),P.step(100,1/30),' + ST + ')'] + seq('g_seal', [3.4, 4.05, 4.4, 6.5, 9.3, 9.9, 10.2, 10.5, 11.0, 11.5, 12.2]) + ['after=(P.step(40,1/30),' + ST + ')', 'new=(P.step(130,1/30),' + ST + ')'], 7)
