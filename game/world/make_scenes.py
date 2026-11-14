# Has Claude Fable 5.2 (high effort, through the key) lay out each walking scene still to be painted as a grey-box guide, look at the guide
# and fix it, and write what the painting shows. Writes world/scenes/<id>.json, <id>_guide.png, <id>_key.jpg and a log.
#   python3 world/make_scenes.py [--only W2,W3] [--rounds 3]
import argparse, asyncio, base64, io, json, math, os, sys, time
from PIL import Image
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(G, 'people', 'kit'))
import make_person as MP
OUT = os.path.join(HERE, 'scenes'); MODEL, EFFORT = 'claude-fable-5-2', 'high'
CAM = {'fov': 12, 'pitch': 24, 'target': [0, 0, -2.5], 'span': 10.7}      # the closer walking camera: the witch is about 40% larger than in the fair square pilot
ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
def walkable(S, x, z):
    for g in S.get('ground', []):
        if g['kind'] == 'disc':
            if math.hypot(x - g['x'], z - g['z']) <= g['r']: return True
        elif g['kind'] == 'path':
            ax, az = g['a']; bx, bz = g['b']; dx, dz = bx - ax, bz - az; L = dx * dx + dz * dz or 1e-9; t = max(0, min(1, ((x - ax) * dx + (z - az) * dz) / L))
            if math.hypot(x - ax - t * dx, z - az - t * dz) <= g['w'] / 2: return True
        else:
            a = math.radians(g.get('turn', 0)); c, s = math.cos(a), math.sin(a); lx = (x - g['x']) * c - (z - g['z']) * s; lz = (x - g['x']) * s + (z - g['z']) * c
            if abs(lx) <= g['w'] / 2 and abs(lz) <= g['d'] / 2: return True
    return False
def half(s): return max(s.get('w', 0), s.get('d', 0)) / 2 if s['kind'] in ('box', 'stall', 'tent-square') else s.get('r', 0.15)
def height(s): return s.get('top') or (s.get('y', 0) + s.get('h', 3.3 if s['kind'] == 'post' else 0.8))
def check(S, info):
    notes = []; pts = [(x * 0.5, z * 0.5) for x in range(-26, 27) for z in range(-28, 18)]; walk = [(x, z) for x, z in pts if walkable(S, x, z)]; area = len(walk) * 0.25
    notes.append('Walkable ground: about %d square metres.' % area)
    seen = set(); stack = [walk[0]] if walk else []; ws = set(walk)
    while stack:
        p = stack.pop()
        if p in seen: continue
        seen.add(p)
        for d in ((0.5, 0), (-0.5, 0), (0, 0.5), (0, -0.5)):
            q = (p[0] + d[0], p[1] + d[1])
            if q in ws and q not in seen: stack.append(q)
    if walk and len(seen) < len(walk): notes.append('The walkable ground is in more than one piece: join it up.')
    for s in S.get('solids', []):
        if s['kind'] == 'post': continue
        h = height(s); r = half(s); deep = info['hide'] * h; hid = sum(1 for x, z in walk if abs(x - s['x']) <= r and s['z'] - deep <= z < s['z'] - r * 0.5) * 0.25; on = sum(1 for x, z in walk if abs(x - s['x']) <= r * 0.8 and abs(z - s['z']) <= r * 0.8) * 0.25
        if h > 1.0 and hid >= 1.5: notes.append('"%s" (%.1f m tall) hides about %d square metres of walkable ground behind it.' % (s.get('name', s['kind']), h, hid))
        if on >= 1 and s['kind'] != 'fire': notes.append('"%s" stands on walkable ground.' % s.get('name', s['kind']))
    for e in S.get('exits', []):
        if not walkable(S, e['x'], e['z']): notes.append('The exit to %s is not on walkable ground.' % e['to'])
    for p in S.get('people', []):
        if not walkable(S, p['x'], p['z']): notes.append('%s is not on walkable ground.' % p['who'])
        for s in S.get('solids', []):
            if s['kind'] != 'post' and height(s) > 1.0 and abs(p['x'] - s['x']) <= half(s) + 0.3 and s['z'] - info['hide'] * height(s) <= p['z'] < s['z']: notes.append('%s is hidden behind "%s".' % (p['who'], s.get('name', s['kind'])))
    if not walkable(S, *S.get('figure', [0, 0])): notes.append('The measuring figure is not on walkable ground.')
    return notes, area
async def shoot(pg, S, mode):
    r = await pg.evaluate('([S, m]) => MF_SHOOT(S, m)', [S, mode]); return Image.open(io.BytesIO(base64.b64decode(r['png'].split(',')[1]))).convert('RGB'), r['info']
def img(im, w=1536):
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=84); return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
async def one(pg, W, area, rounds):
    by = {a['id']: a for a in W['areas']}; near = {e['to']: by[e['to']]['name'] for e in area.get('exits', []) if e['to'] in by}
    brief = {'id': area['id'], 'name': area['name'], 'zone': area['zone'], 'light': area['light'], 'look': area['look'], 'exits': area['exits'], 'leads_to': near, 'people': [{k: p[k] for k in ('who', 'where', 'doing')} for p in area.get('people', [])],
             'things_that_can_happen': [h['title'] + ': ' + h['what'] for h in area.get('happens', [])], 'fights': area.get('fights'), 'lamps_won_here': area.get('lamps', 0)}
    MP.KIT = open(os.path.join(HERE, 'SCENE-KIT.md'), encoding='utf-8').read()
    messages = [{'role': 'user', 'content': 'The demo\'s story: %s\n\nThe scene to lay out:\n%s\n\n%s' % (' '.join(W['story']), json.dumps(brief, indent=1), 'The captain (not built yet) stands here too: give him a spot as a person called "captain".' if area['id'] in ('W3', 'W8') else '')}]
    log = []; S = None; best = None
    for n in range(1, rounds + 1):
        t0 = time.time(); res = await asyncio.to_thread(MP.ask, MODEL, messages, 32000, EFFORT); text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text')
        log.append({'n': n, 'seconds': round(time.time() - t0, 1), 'cost': MP.cost(MODEL, res['usage']), 'said': 'DONE' if text.strip().upper().startswith('DONE') else 'file'}); messages.append({'role': 'assistant', 'content': res['content']})
        if log[-1]['said'] == 'DONE' and best: break
        try:
            S, _ = json.JSONDecoder().raw_decode(text[text.index('{'):]); S.update({'kind': 'walk', 'frame': [2048, 1024], 'camera': CAM, 'skyBand': 0.15, 'moon': {'u': 0.105, 'v': 0.072, 'd': 0.085}})
            key, info = await shoot(pg, S, 'key'); notes, area_m2 = check(S, info); best = (S, key, notes, area_m2)
        except Exception as e:
            notes = ['The file could not be used: ' + str(e).split('\n')[0][:240]]; key = None
        if n == rounds: break
        messages.append({'role': 'user', 'content': ([img(key)] if key else []) + [{'type': 'text', 'text': ('Your guide, with labels (green: exits; blue: people; magenta: the 1.70 m figure). ' if key else '') + 'Checks: ' + ' '.join(notes) + ' Reply DONE if it is right, or the whole corrected file.'}]})
    if not best: raise RuntimeError('no usable scene')
    S, key, notes, area_m2 = best; guide, info = await shoot(pg, S, 'guide'); S['_made'] = {'by': MODEL + '@' + EFFORT, 'rounds': log, 'cost': sum(r['cost'] for r in log), 'checks': notes, 'area': area_m2, 'frame_info': info}
    json.dump(S, open(os.path.join(OUT, S['id'] + '.json'), 'w'), indent=1); guide.save(os.path.join(OUT, S['id'] + '_guide.png')); key.save(os.path.join(OUT, S['id'] + '_key.jpg'), quality=86); return S
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--only'); ap.add_argument('--rounds', type=int, default=3); a = ap.parse_args(); os.makedirs(OUT, exist_ok=True)
    W = json.load(open(os.path.join(HERE, 'world.json'))); todo = [x for x in W['areas'] if x['id'].startswith('W') and x['id'] != 'W1' and (not a.only or x['id'] in a.only.split(','))]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 800, 'height': 600}); await pg.goto('file://' + os.path.join(HERE, 'guide2.html')); await pg.wait_for_function('window.MF_READY', timeout=60000)
        for area in todo:
            try: S = await one(pg, W, area, a.rounds); print(S['id'], 'solids', len(S.get('solids', [])), 'area %d' % S['_made']['area'], '$%.2f' % S['_made']['cost'], [r['said'] for r in S['_made']['rounds']], S['_made']['checks'][1:], flush=True)
            except Exception as e: print(area['id'], 'FAILED', str(e)[:300], flush=True)
        await b.close()
if __name__ == '__main__': asyncio.run(main())
