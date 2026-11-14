# Has Claude Fable 5.2 (high effort, through the key) draw the reference for the demo's world map and write the words for its painting.
# Writes world/map/map.svg, map_guide.png (no words, for the painter), map_key.jpg (grid, pins and labels), map.json and a log.
#   python3 world/make_map_picture.py [--rounds 2]        (run from game/)
import argparse, asyncio, base64, io, json, os, re, sys, time
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(G, 'people', 'kit'))
import make_person as MP
OUT = os.path.join(HERE, 'map'); MODEL, EFFORT = 'claude-fable-5-2', 'high'; W_, H_, CELL = 1536, 1024, 128
CELLS = {'W1': 'C6', 'W2': 'D6', 'W3': 'E6', 'W4': 'G6', 'W5': 'I5', 'W7': 'I6', 'W6': 'K6', 'W8': 'J3', 'W9': 'K3', 'F5': 'K2'}
JOINS = [('W1', 'W2', 'walk'), ('W2', 'W3', 'walk'), ('W3', 'W4', 'walk'), ('W4', 'W5', 'walk'), ('W5', 'W6', 'walk'), ('W5', 'W7', 'walk'), ('W3', 'W8', 'fly'), ('W8', 'W9', 'walk'), ('W9', 'F5', 'walk')]
centre = lambda c: ((ord(c[0]) - 65) * CELL + CELL // 2, (int(c[1:]) - 1) * CELL + CELL // 2)
def font(n, bold=True):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''), '/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf' % ('Bold' if bold else 'Regular')):
        if os.path.exists(f): return ImageFont.truetype(f, n)
    return ImageFont.load_default()
def pic(im, w, q=84):
    im = im.convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=q)
    return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}
def key(guide, J, names, scale=1):
    im = guide.convert('RGB').resize((W_ * scale, H_ * scale), Image.LANCZOS); d = ImageDraw.Draw(im, 'RGBA'); s = scale; f1, f2, f3 = font(15 * s), font(13 * s), font(12 * s, False)
    def tag(x, y, t, f, fill, ink=(20, 16, 28, 255), anchor='mm'):
        b = d.textbbox((x, y), t, font=f, anchor=anchor); d.rounded_rectangle((b[0] - 4 * s, b[1] - 3 * s, b[2] + 4 * s, b[3] + 3 * s), 4 * s, fill=fill); d.text((x, y), t, font=f, fill=ink, anchor=anchor)
    for i in range(1, 12): d.line((i * CELL * s, 0, i * CELL * s, H_ * s), fill=(255, 255, 255, 70), width=s)
    for j in range(1, 8): d.line((0, j * CELL * s, W_ * s, j * CELL * s), fill=(255, 255, 255, 70), width=s)
    for i in range(12): d.text(((i * CELL + 8) * s, 6 * s), chr(65 + i), font=f2, fill=(255, 255, 255, 200))
    for j in range(8): d.text((6 * s, (j * CELL + 24) * s), str(j + 1), font=f2, fill=(255, 255, 255, 200))
    for a, b, how in JOINS:
        (x1, y1), (x2, y2) = centre(CELLS[a]), centre(CELLS[b])
        if how == 'fly':
            n = 26
            for k in range(n):
                if k % 2: continue
                t0, t1 = k / n, (k + 1) / n; P = lambda t: ((x1 + (x2 - x1) * t) * s, (y1 + (y2 - y1) * t - 150 * 4 * t * (1 - t) * 0.5) * s); d.line((*P(t0), *P(t1)), fill=(255, 220, 140, 230), width=3 * s)
    for L in J.get('land', []):
        if isinstance(L.get('label'), list) and len(L['label']) == 2: tag(L['label'][0] * s, L['label'][1] * s, L['name'], f3, (20, 16, 28, 150), (240, 232, 246, 255))
    for sid, c in CELLS.items():
        x, y = centre(c); d.ellipse(((x - 7) * s, (y - 7) * s, (x + 7) * s, (y + 7) * s), fill=(255, 90, 200, 255), outline=(255, 255, 255, 255), width=2 * s)
        tag(x * s, (y - 22) * s, '%s  %s' % (sid, c), f1, (255, 235, 170, 235)); tag(x * s, (y + (40 if sid in ('W2', 'W9') else 22)) * s, names.get(sid, ''), f3, (20, 16, 28, 170), (255, 255, 255, 255))   # W2 and W9 sit between close neighbours, so their names drop a line
    return im
def blocks(text):
    sv = re.search(r'```svg\s*(<svg.*?</svg>)\s*```', text, re.S); js = re.search(r'```json\s*(\{.*\})\s*```', text, re.S)
    return (sv.group(1) if sv else None), (json.loads(js.group(1)) if js else None)
def check(svg, J):
    notes = []
    if re.search(r'<text|<tspan|font-family', svg): notes.append('The drawing has text in it. Take all text out.')
    if re.search(r'Gradient|<filter|<pattern|<image', svg): notes.append('The drawing uses a gradient, filter, pattern or image. Flat shapes only.')
    if 'viewBox="0 0 1536 1024"' not in svg: notes.append('The viewBox must be exactly 0 0 1536 1024.')
    miss = [k for k in CELLS if k not in (J or {}).get('places', {})]
    if miss: notes.append('Missing place descriptions: ' + ', '.join(miss))
    if not 6 <= len((J or {}).get('land', [])) <= 10: notes.append('Give six to ten pieces of land.')
    return notes
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--rounds', type=int, default=2)   # the first answer may run out of room (it did, at 48,000 tokens); the next round then writes it out in full; a = ap.parse_args(); os.makedirs(OUT, exist_ok=True)
    MP.KIT = open(os.path.join(HERE, 'MAP-PICTURE-KIT.md'), encoding='utf-8').read(); Wd = json.load(open(os.path.join(HERE, 'world.json'))); names = {x['id']: x['name'] for x in Wd['areas']}
    brief = open(os.path.join(HERE, 'LORE-BRIEF.md'), encoding='utf-8').read(); brief = brief[:brief.index('## The fair folk')]
    content = [{'type': 'text', 'text': brief}, {'type': 'text', 'text': 'The ten places as mapped:\n' + '\n'.join('- %s %s (%s): %s Ways out: %s' % (x['id'], x['name'], x['light'], x['look'], '; '.join('%s to %s (%s)' % (e['side'], e['to'], e['how']) for e in x['exits'])) for x in Wd['areas'])}]
    for x in Wd['areas']:
        f = os.path.join(G, 'art', 'pilot' if x['id'] == 'W1' else 'world', x['id'] + '.png')
        if os.path.exists(f): content += [{'type': 'text', 'text': '%s %s, as Chris painted it:' % (x['id'], x['name'])}, pic(Image.open(f), 900)]
    content.append({'type': 'text', 'text': 'Draw the map reference and write the words.'}); messages = [{'role': 'user', 'content': content}]; log = {'model': MODEL, 'effort': EFFORT, 'rounds': [], 'cost': 0}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': W_, 'height': H_})
        for r in range(a.rounds + 1):
            t0 = time.time(); res = await asyncio.to_thread(MP.ask, MODEL, messages, 48000, EFFORT); c = MP.cost(MODEL, res['usage']); log['cost'] += c
            text = ''.join(x.get('text', '') for x in res['content'] if x['type'] == 'text'); open(os.path.join(OUT, 'round%d.txt' % r), 'w', encoding='utf-8').write(text)
            log['rounds'].append({'cost': c, 'seconds': round(time.time() - t0, 1), 'stop': res.get('stop_reason'), 'done': text.strip().startswith('DONE')}); print('round', r, '$%.2f' % c, '%ss' % log['rounds'][-1]['seconds'], res.get('stop_reason'), text.strip()[:40].replace('\n', ' '), flush=True)
            if text.strip().startswith('DONE') and r > 0: break
            svg, J = blocks(text)
            if not svg or not J: messages += [{'role': 'assistant', 'content': res['content']}, {'role': 'user', 'content': 'I could not read both blocks. Answer again with the svg block and the json block in full.'}]; continue
            notes = check(svg, J); open(os.path.join(OUT, 'map.svg'), 'w', encoding='utf-8').write(svg); json.dump(dict(J, cells=CELLS, joins=JOINS, grid={'cols': 12, 'rows': 8, 'cell': CELL, 'width': W_, 'height': H_}), open(os.path.join(OUT, 'map.json'), 'w'), indent=1, ensure_ascii=False)
            await pg.set_content('<body style="margin:0;background:#000">' + svg + '</body>'); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, 'map_guide.png'), clip={'x': 0, 'y': 0, 'width': W_, 'height': H_})
            guide = Image.open(os.path.join(OUT, 'map_guide.png')); key(guide, J, names).save(os.path.join(OUT, 'map_key.jpg'), quality=88); log['rounds'][-1]['notes'] = notes
            if r == a.rounds: break
            messages += [{'role': 'assistant', 'content': res['content']}, {'role': 'user', 'content': [{'type': 'text', 'text': 'Your drawing with the grid, the pins and your land labels laid over it:'}, pic(key(guide, J, names), 1536, 86),
                         {'type': 'text', 'text': ('Automatic checks: ' + ' '.join(notes) + '\n' if notes else '') + 'Check it as the kit says, then answer with both blocks in full, fixed, or with the single word DONE.'}]}]
        await b.close()
    json.dump(log, open(os.path.join(OUT, 'log.json'), 'w'), indent=1); print('total $%.2f' % log['cost'])
if __name__ == '__main__': asyncio.run(main())
