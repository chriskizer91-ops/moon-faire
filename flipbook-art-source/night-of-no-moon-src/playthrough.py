"""Plays the whole game once, start to ending: title, intro, walking, a random battle, level up,
saving at a lantern, the boss and the ending. Prints what it reached and any page errors, and
saves screenshots in shots/.

Start a local server in flipbook-art-source/ first:
    cd flipbook-art-source && python3 -m http.server 8000
Needs Playwright for Python (pip install playwright; playwright install chromium).
Set GAME_URL to test another copy.
"""
import os
URL = os.environ.get('GAME_URL', 'http://localhost:8000/night-of-no-moon.html')
from playwright.sync_api import sync_playwright
import time
def adv(pg,n=8):
    for i in range(60):
        time.sleep(.15)
        if pg.evaluate("document.getElementById('dlg').hidden && !document.querySelector('#dlgOpts:not([hidden])')"):
            time.sleep(.6)
            if pg.evaluate("document.getElementById('dlg').hidden"): return
        pg.keyboard.press('Enter')
SHOTS=os.path.join(os.path.dirname(os.path.abspath(__file__)),'shots'); os.makedirs(SHOTS,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':720})
    errs=[]
    pg.on('console', lambda m: errs.append((m.type, m.text)) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror', str(e))))
    pg.goto(URL); pg.wait_for_function('document.getElementById("loading").hidden', timeout=30000)
    pg.keyboard.press('Enter'); time.sleep(.3); pg.keyboard.press('Enter'); time.sleep(1)
    adv(pg,12); time.sleep(.5)
    print('scene', pg.evaluate('__game.SCENE'), 'busy?', pg.evaluate("document.getElementById('dlg').hidden"))
    # talk to witch via tap: click on the witch sprite
    pg.evaluate("__game.TS=3")
    # walk right to gangplank
    pg.keyboard.down('ArrowRight'); time.sleep(2.2); pg.keyboard.up('ArrowRight')
    print('pos', pg.evaluate("[Math.round(__game.F.x),Math.round(__game.F.y),__game.P.map]"))
    pg.keyboard.down('ArrowUp'); time.sleep(.3); pg.keyboard.up('ArrowUp')
    pg.keyboard.down('ArrowRight'); time.sleep(2.5); pg.keyboard.up('ArrowRight')
    print('pos2', pg.evaluate("[Math.round(__game.F.x),Math.round(__game.F.y),__game.P.map,__game.SCENE]"))
    time.sleep(1)
    # keep walking right in marsh until a battle
    pg.evaluate("__game.S.enc='normal'")
    for k in range(20):
        if pg.evaluate("__game.SCENE")=='battle': break
        pg.keyboard.down('ArrowRight'); time.sleep(.5); pg.keyboard.up('ArrowRight')
    print('scene now', pg.evaluate("__game.SCENE"), pg.evaluate("[Math.round(__game.F.x),__game.P.map]"))
    time.sleep(1.5); pg.screenshot(path=SHOTS+'/f_enc.png')
    pg.wait_for_function("['K48','O24','S16','U29','V15','E08'].every(n=>__game.IMG[n])", timeout=60000)
    # win quickly
    pg.evaluate("__game.B.enemies.forEach(e=>e.hp=1)")
    for k in range(40):
        if pg.evaluate("__game.B&&__game.B.inputOpen&&__game.B.mode==='root'"): break
        time.sleep(.2)
    pg.keyboard.press('Enter'); time.sleep(.2); pg.keyboard.press('Enter'); time.sleep(3)
    print('after rebuke', pg.evaluate("__game.B&&__game.B.enemies.map(e=>e.alive)"))
    for k in range(10):
        if pg.evaluate("!document.getElementById('results').hidden"): break
        if pg.evaluate("__game.B&&__game.B.inputOpen&&__game.B.mode==='root'"):
            pg.keyboard.press('Enter'); time.sleep(.2); pg.keyboard.press('Enter')
        time.sleep(1)
    pg.screenshot(path=SHOTS+'/f_results.png')
    pg.keyboard.press('Enter'); time.sleep(1.5)
    print('back', pg.evaluate("__game.SCENE"), pg.evaluate("[__game.P.lv,__game.P.exp]"))
    # field menu
    pg.keyboard.press('KeyM'); time.sleep(.5); pg.screenshot(path=SHOTS+'/f_menu.png'); pg.keyboard.press('Escape'); time.sleep(.3)
    # go to the stage, save, boss
    pg.evaluate("__game.field('stage',112,500,'up')"); time.sleep(.5)
    pg.keyboard.press('Enter'); time.sleep(.4); pg.screenshot(path=SHOTS+'/f_lantern.png'); pg.keyboard.press('Enter'); time.sleep(.4); adv(pg,2)
    print('saved', pg.evaluate("!!localStorage.getItem('nonm-save')"))
    pg.evaluate("__game.F.x=480; __game.F.y=430"); pg.keyboard.down('ArrowUp'); time.sleep(.4); pg.keyboard.up('ArrowUp'); time.sleep(.5)
    pg.screenshot(path=SHOTS+'/f_bossintro.png')
    adv(pg,10); time.sleep(2)
    print('boss scene', pg.evaluate("__game.SCENE"), pg.evaluate("__game.B&&__game.B.boss"))
    pg.evaluate("__game.B.enemies[0].hp=30")
    for k in range(30):
        if pg.evaluate("!document.getElementById('results').hidden"): break
        if pg.evaluate("__game.B&&__game.B.inputOpen&&__game.B.mode==='root'"):
            pg.keyboard.press('Enter'); time.sleep(.2); pg.keyboard.press('Enter')
        time.sleep(.6)
    pg.keyboard.press('Enter'); time.sleep(2)
    adv(pg,3); time.sleep(2.5)
    pg.screenshot(path=SHOTS+'/f_ending.png')
    print('end scene', pg.evaluate("__game.SCENE"))
    print('errors', errs)
    b.close()
