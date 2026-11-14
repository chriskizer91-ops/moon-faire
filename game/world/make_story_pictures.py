# Has Claude Fable 5.2 (high effort, through the key) write what each extra story picture shows and lay out the four fight-place guides,
# then look at the guides and fix them. Writes world/pictures/pictures.json, F*_guide.png, F*_key.jpg, F*.json and a log.
#   python3 world/make_story_pictures.py [--rounds 2]        (run from game/)
import argparse, asyncio, base64, io, json, math, os, sys, time
from PIL import Image
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(G, 'people', 'kit'))
import make_person as MP
OUT = os.path.join(HERE, 'pictures'); MODEL, EFFORT = 'claude-fable-5-2', 'high'
ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FIXED = {'kind': 'fight', 'frame': [2048, 1536], 'camera': {'fov': 38, 'h': 2, 'z': 18, 'pitch': -4.2}, 'figure': [-2.2, 0.6],      # the pilot's fight camera and places (pilot/scenes-pilot.js, F1)
         'party': [['Jester', -2.2, 0.6], ['Ranger', -3.6, -1.4], ['Fox', -3.8, 2.0], ['Io', -5.2, 0.2]], 'foes': [['foe', 2.6, 0.8], ['foe', 3.8, -1.2], ['boss', 4.5, 0], ['foe', 5.4, 1.8]]}
def pic(im, w, q=84):
    im = im.convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=q)
    return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
def half(s): return max(s.get('w', 0), s.get('d', 0)) / 2 if s['kind'] in ('box', 'stall', 'tent-square') else s.get('r', 0.2)
def check(S):
    notes = []
    for s in S.get('solids', []):
        r = half(s); n = s.get('name', s['kind'])
        if s['z'] + r > -5 and abs(s['x']) - r < 10.5: notes.append('"%s" stands on, beside or in front of the open ground (its nearest edge is at z %.1f). Move it back to z -7 or farther.' % (n, s['z'] + r))
        if s['z'] - r > 4: notes.append('"%s" is between the camera and the fighters.' % n)
    if not 6 <= len(S.get('solids', [])) <= 16: notes.append('Use 6 to 16 solids (there are %d).' % len(S.get('solids', [])))
    return notes
async def shoot(pg, S, mode):
    r = await pg.evaluate('([S, m]) => MF_SHOOT(S, m)', [S, mode]); return Image.open(io.BytesIO(base64.b64decode(r['png'].split(',')[1]))).convert('RGB')
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--rounds', type=int, default=2); a = ap.parse_args(); os.makedirs(OUT, exist_ok=True)
    MP.KIT = open(os.path.join(HERE, 'STORY-PICTURES-KIT.md'), encoding='utf-8').read(); W = json.load(open(os.path.join(HERE, 'world.json'))); C = W['chosen']
    story = {'title': C['title'], 'about': C['about'], 'premise': C['premise'], 'acts': C['acts'], 'ending': C['ending'], 'the evening': W['story'], 'things to find': W['finds'],
             'the things that happen where pictures are wanted': [h for x in W['areas'] for h in x['happens'] if h['code'] in ('W4-e', 'W5-e', 'W3-e', 'W5-b', 'F5-a', 'F5-b', 'F5-c', 'F5-d', 'W9-d', 'W1-a', 'W2-a', 'W3-b', 'W9-a')]}
    content = [{'type': 'text', 'text': '# The story\n' + json.dumps(story, indent=1, ensure_ascii=False)}, {'type': 'text', 'text': '# The places\n' + '\n'.join('- %s %s (%s): %s' % (x['id'], x['name'], x['light'], x['look']) for x in W['areas'])}]
    for x in W['areas']:
        f = os.path.join(G, 'art', 'pilot' if x['id'] == 'W1' else 'world', x['id'] + '.png')
        if os.path.exists(f): content += [{'type': 'text', 'text': '%s %s, as Chris painted it:' % (x['id'], x['name'])}, pic(Image.open(f), 900)]
    content += [{'type': 'text', 'text': 'F1, the moor clearing: his finished fight place, painted for the fight camera. The new fight places must sit beside it:'}, pic(Image.open(os.path.join(G, 'art', 'pilot', 'F1.png')), 900),
                {'type': 'text', 'text': 'MAP, his painted world map (north up; the fair lower left, the crag upper right):'}, pic(Image.open(os.path.join(HERE, 'map', 'map.png')), 900), {'type': 'text', 'text': 'Write the pictures and lay out the four fight guides.'}]
    messages = [{'role': 'user', 'content': content}]; log = {'model': MODEL, 'effort': EFFORT, 'rounds': [], 'cost': 0}; P = None
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 800, 'height': 600}); await pg.goto('file://' + os.path.join(HERE, 'guide2.html')); await pg.wait_for_function('window.MF_READY', timeout=60000)
        for r in range(a.rounds + 1):
            t0 = time.time(); res = await asyncio.to_thread(MP.ask, MODEL, messages, 64000, EFFORT); c = MP.cost(MODEL, res['usage']); log['cost'] += c
            text = ''.join(x.get('text', '') for x in res['content'] if x['type'] == 'text'); open(os.path.join(OUT, 'round%d.txt' % r), 'w', encoding='utf-8').write(text)
            log['rounds'].append({'cost': c, 'seconds': round(time.time() - t0, 1), 'stop': res.get('stop_reason')}); print('round', r, '$%.2f' % c, '%ss' % log['rounds'][-1]['seconds'], res.get('stop_reason'), text.strip()[:30].replace('\n', ' '), flush=True)
            if text.strip().startswith('DONE') and P: break
            try: J, _ = json.JSONDecoder().raw_decode(text[text.index('{'):])
            except Exception as e:
                messages += [{'role': 'assistant', 'content': res['content']}, {'role': 'user', 'content': 'I could not read that as JSON (%s). Answer again in full.' % str(e)[:120]}]; continue
            if P is None: P = J
            else: P['fights'] = J.get('fights', P['fights'])
            json.dump(P, open(os.path.join(OUT, 'pictures.json'), 'w'), indent=1, ensure_ascii=False); shown = []; allnotes = {}
            for fid, F in P['fights'].items():
                S = dict(FIXED, id=fid, **{k: F[k] for k in ('name', 'clear', 'flats', 'solids', 'moon') if k in F}); notes = check(S); allnotes[fid] = notes
                key = await shoot(pg, S, 'key'); key.save(os.path.join(OUT, fid + '_key.jpg'), quality=86); (await shoot(pg, S, 'guide')).save(os.path.join(OUT, fid + '_guide.png')); json.dump(S, open(os.path.join(OUT, fid + '.json'), 'w'), indent=1)
                shown += [{'type': 'text', 'text': '%s %s. Checks: %s' % (fid, F.get('name', ''), ' '.join(notes) or 'none failed.')}, pic(key, 1200)]
            log['rounds'][-1]['notes'] = allnotes
            if r == a.rounds: break
            messages += [{'role': 'assistant', 'content': res['content']}, {'role': 'user', 'content': [{'type': 'text', 'text': 'Your four fight guides with labels (pink: where the party and the foes stand; the tall one is the biggest foe):'}] + shown + [{'type': 'text', 'text': 'Check them as the kit says. Answer with only "fights", all four in full, fixed, or with the single word DONE.'}]}]
        await b.close()
    P['_made'] = log; json.dump(P, open(os.path.join(OUT, 'pictures.json'), 'w'), indent=1, ensure_ascii=False)
    for r in range(a.rounds + 1):
        f = os.path.join(OUT, 'round%d.txt' % r)
        if os.path.exists(f): os.remove(f)
    print('total $%.2f' % log['cost'])
if __name__ == '__main__': asyncio.run(main())
