# One Claude session (through the key) reviews every painted person: scale beside the Jester, look, fit. It writes fixes
# (size numbers and skin-file changes), sees the result, and may fix again.
#   python3 people/kit/review_npcs.py [--model claude-fable-5-2] [--effort high] [--rounds 3]
# Writes people/npc/review.md (its words), people/npc/review/ (line-ups before and after), and for each changed person
# people/painted/<...>/skin.js (the old one kept as skin.before-review.js), person-scale.json and final.jpg. Then run build_npcs.py.
import argparse, asyncio, io, json, os, re, shutil, sys, time
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
import make_person as MP
from paint_person import load_skin, b64jpg
P = os.path.join(HERE, '..'); NPC = os.path.join(P, 'npc'); OUTD = os.path.join(NPC, 'review')
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
MAKER = {'hand': 'shapes made by hand', 'fable': 'shapes by Fable 5.2', 'opus': 'shapes by Opus 5.5'}
def people():
    out = []
    for tag in ['hand', 'fable', 'opus']:
        for pid in ['lampseller', 'fortune', 'watchman', 'baker', 'farmhand']:
            for i, k in enumerate(json.load(open(os.path.join(P, 'skins', pid, 'skins.json')))['skins']):
                L = 'ABC'[i]; d = os.path.join(P, 'painted', '%s-%s__%s' % (pid, L, tag))
                if not os.path.exists(d + '/log.json'): continue
                lg = json.load(open(d + '/log.json'))
                out.append({'id': slug(k['name']) + ('-opus' if tag == 'opus' else ''), 'name': k['name'], 'who': k['who'], 'tag': tag, 'dir': d, 'pid': pid, 'L': L,
                            'code': open(os.path.join(P, lg['person']), encoding='utf-8').read(), 'skin_text': open(d + '/skin.js', encoding='utf-8').read(),
                            'scale': json.load(open(d + '/person-scale.json')) if os.path.exists(d + '/person-scale.json') else {}})
    return out
def merge(skin, fix):
    for k, v in fix.items():
        if v is None: skin.pop(k, None)
        elif isinstance(v, dict) and k in ('flat', 'rough', 'move', 'size'):
            cur = dict(skin.get(k) or {})
            for kk, vv in v.items():
                if vv is None: cur.pop(kk, None)
                else: cur[kk] = vv
            skin[k] = cur
        else: skin[k] = v
    return skin
async def render(s, p):
    skin = dict(load_skin(p['pid'], p['L']), SKIN_TEXT='const SKIN = %s;' % json.dumps(p['SKIN']), person=p['scale'] or None)
    facts, sheet = await s.shoot(p['code'], 0.6, skin)
    if not sheet: raise RuntimeError('%s did not build: %s' % (p['id'], facts.get('errors')))
    await s.body.evaluate('() => { PV.draw("line"); }'); tile = Image.open(io.BytesIO(await s.body.screenshot())).convert('RGB').crop((50, 0, 250, 560))
    p['sheet'], p['tile'], p['facts'] = sheet, tile, facts
def lineup(witch, group, title):
    tiles = [('The Jester (a hero)', 1.0, witch)] + [(p['id'], p['facts']['scale']['height'], p['tile']) for p in group]
    im = Image.new('RGB', (200 * len(tiles), 600), (40, 34, 50)); g = ImageDraw.Draw(im)
    for i, (name, h, t) in enumerate(tiles): im.paste(t, (200 * i, 0))
    for m in (1.0, 1.5, 1.65, 1.8): y = round(513 - m * 238); g.line([(0, y), (im.width, y)], fill=(150, 140, 170) if m != 1.65 else (231, 184, 103), width=1); g.text((4, y - 12), '%.2f m' % m, fill=(200, 190, 215))
    for i, (name, h, t) in enumerate(tiles): g.text((200 * i + 6, 566), name[:30], fill=(255, 255, 255)); g.text((200 * i + 6, 582), '%.2f m' % (1.65 * h) if i else '1.65 m', fill=(200, 190, 215))
    g.text((6, 4), title, fill=(255, 255, 255)); return im
def card(p):
    sc = p['facts']['scale']
    return '%s — %s. %s (%s)\nsize: height %s (%.2f m), build %s, head %s\nparts: %s\nskin file: %s' % (p['id'], p['name'], p['who'], MAKER[p['tag']], sc['height'], 1.65 * sc['height'], json.dumps(sc['build']), json.dumps(sc['head']), ', '.join(p['facts'].get('partNames', [])), json.dumps(p['SKIN']))
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--model', default='claude-fable-5-2'); ap.add_argument('--effort', default='high'); ap.add_argument('--rounds', type=int, default=3); a = ap.parse_args()
    os.makedirs(OUTD, exist_ok=True); s = await Shooter().start(); ppl = people(); by = {p['id']: p for p in ppl}
    for p in ppl: p['SKIN'] = json.loads(await s.body.evaluate('(c) => PV.data(c, "SKIN")', p['skin_text']))
    await s.body.evaluate('() => { PV.showWitch(); PV.draw("line"); }'); await s.body.wait_for_timeout(900); await s.body.evaluate('() => { PV.step(1/30, 10); PV.draw("line"); }')
    witch = Image.open(io.BytesIO(await s.body.screenshot())).convert('RGB').crop((50, 0, 250, 560))
    for p in ppl: await render(s, p)
    def lineups(tag):
        a1 = lineup(witch, [p for p in ppl if p['tag'] != 'opus'], 'The lamp-seller model and the shapes by Fable 5.2'); b1 = lineup(witch, [p for p in ppl if p['tag'] == 'opus'], 'The shapes by Opus 5.5')
        a1.save(os.path.join(OUTD, 'lineup-%s-a.jpg' % tag), quality=86); b1.save(os.path.join(OUTD, 'lineup-%s-b.jpg' % tag), quality=86); return [a1, b1]
    L = lineups('before'); content = [b64jpg(L[0], 84), b64jpg(L[1], 84), {'type': 'text', 'text': 'The two line-ups. Then each person: their card, then their sheet.'}]
    for p in ppl: content += [{'type': 'text', 'text': card(p)}, b64jpg(p['sheet'], 82)]
    content.append({'type': 'text', 'text': 'Review all %d, then give your fixes.' % len(ppl)})
    MP.KIT = open(os.path.join(HERE, 'REVIEW-KIT.md'), encoding='utf-8').read(); messages = [{'role': 'user', 'content': content}]; log = {'model': a.model, 'effort': a.effort, 'rounds': [], 'changed': {}}; words = []
    for n in range(1, a.rounds + 1):
        t0 = time.time(); res = await asyncio.to_thread(MP.ask, a.model, messages, 60000, a.effort); u = res['usage']
        text = ''.join(b.get('text', '') for b in res['content'] if b['type'] == 'text'); words.append('# Look %d\n\n%s\n' % (n, text.strip()))
        rd = {'n': n, 'seconds': round(time.time() - t0, 1), 'usage': {k: u.get(k) for k in ('input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens')}, 'cost': MP.cost(a.model, u)}
        log['rounds'].append(rd); messages.append({'role': 'assistant', 'content': res['content']}); open(os.path.join(NPC, 'review.md'), 'w', encoding='utf-8').write('\n'.join(words))
        m = re.search(r'```(?:js|javascript)?\s*\n(.*?)```', text, re.S); fixes, err = {}, ''
        if m and 'const FIXES' in m.group(1) and not [b for b in MP.BANNED if b in m.group(1)]:
            try: fixes = json.loads(await s.body.evaluate('(c) => PV.data(c, "FIXES")', m.group(1)))
            except Exception as e: err = 'The fixes file did not run: ' + str(e).split('\n')[0][:300]
        rd['fixed'] = sorted(fixes); print('look', n, 'fixes for', len(fixes), '$%.2f' % rd['cost'], '%ss' % rd['seconds'], flush=True)
        if not fixes and not err: break
        changed, notes = [], [err] if err else []
        for pid, f in fixes.items():
            p = by.get(pid)
            if not p: notes.append('No person is called %s.' % pid); continue
            keep = (json.loads(json.dumps(p['SKIN'])), dict(p['scale']))
            try:
                if f.get('person'): p['scale'] = dict(p['scale'], **{k: v for k, v in f['person'].items() if k in ('height', 'build', 'head')})
                if f.get('SKIN'): p['SKIN'] = merge(p['SKIN'], f['SKIN'])
                await render(s, p); changed.append(p); log['changed'][pid] = {'scale': p['scale'], 'SKIN': p['SKIN']}
            except Exception as e: p['SKIN'], p['scale'] = keep; notes.append('%s: the change did not build (%s); it was left as it was.' % (pid, str(e)[:160])); await render(s, p)
        if n == a.rounds: break
        L = lineups('after-%d' % n); content = [b64jpg(L[0], 84), b64jpg(L[1], 84), {'type': 'text', 'text': 'The line-ups with your fixes. ' + ' '.join(notes) + ' Then the people you changed.'}]
        for p in changed: content += [{'type': 'text', 'text': card(p)}, b64jpg(p['sheet'], 82)]
        content.append({'type': 'text', 'text': 'Reply DONE with any last notes, or more fixes in the same form.'}); messages.append({'role': 'user', 'content': content})
    lineups('final')
    for pid in log['changed']:
        p = by[pid]; d = p['dir']
        if not os.path.exists(d + '/skin.before-review.js'): shutil.copy(d + '/skin.js', d + '/skin.before-review.js'); shutil.copy(d + '/final.jpg', d + '/before-review.jpg')
        open(d + '/skin.js', 'w', encoding='utf-8').write('const SKIN = %s;\n' % json.dumps(p['SKIN'], indent=1)); json.dump(p['scale'], open(d + '/person-scale.json', 'w')); p['sheet'].save(d + '/final.jpg', quality=84)
    log['cost'] = sum(r['cost'] for r in log['rounds']); log['seconds'] = round(sum(r['seconds'] for r in log['rounds']), 1); json.dump(log, open(os.path.join(NPC, 'review.log.json'), 'w'), indent=1)
    print('review: %d looks, %d people changed, $%.2f, %ss' % (len(log['rounds']), len(log['changed']), log['cost'], log['seconds'])); await s.stop()
if __name__ == '__main__': asyncio.run(main())
