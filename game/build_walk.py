# Builds out/moon-faire-walk.html: the walk-through as one offline file (three.js r128, the Jester, the fair folk, the nine paintings,
# the walking shapes and the words). Run from game/: python3 build_walk.py
# The walking shapes are world/maps/start.json (tools/mf_maps.py), with anything Chris has traced in the map editor laid over them
# (world/maps/edits/<id>.json, put there by tools/take_map_edits.py).
import base64, io, json, os, re, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'people', 'kit'))
from build_viewer import scripts, rd
def webp(path, w=None, q=88):
    im = Image.open(os.path.join(HERE, path)).convert('RGB')
    if w and im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
W = json.load(open(os.path.join(HERE, 'world', 'world.json'), encoding='utf-8')); maps = json.load(open(os.path.join(HERE, 'world', 'maps', 'start.json'), encoding='utf-8')); traced = []
ED = os.path.join(HERE, 'world', 'maps', 'edits')
for mid in sorted(maps):      # Chris's tracings win. Shapes are replaced whole; the things he can only move (ways out, people, rest spots) are moved
    f = os.path.join(ED, mid + '.json')
    if not os.path.exists(f): continue
    E = json.load(open(f, encoding='utf-8')); Mp = maps[mid]
    for k in ('walk', 'block', 'front', 'start'):
        if k in E: Mp[k] = E[k]
    for k in ('exits', 'spots'):
        if k in E: Mp[k] = [dict(a, **b) for a, b in zip(Mp[k], E[k])] if len(E[k]) == len(Mp[k]) else E[k]
    if 'people' in E:
        by = {p.get('id'): p for p in E['people']}; Mp['people'] = [dict(p, **by.get(p['id'], {})) for p in Mp['people']]
    for src, at in (E.get('arrivals') or {}).items() if isinstance(E.get('arrivals'), dict) else []:      # where she arrives HERE from another place: that is the other place's way out to here
        for e in maps.get(src, {}).get('exits', []):
            if e['to'] == mid and isinstance(at, list) and len(at) == 2: e['at'] = at
    Mp['traced'] = True; traced.append(mid)
order = [a['id'] for a in W['areas'] if a['id'] in maps]; lines = {}; used = set()
for a in W['areas']:
    if a['id'] not in maps: continue
    ppl = {p['who'].replace('the ', ''): {'says': p['says']} for p in a.get('people', [])}
    if any(p['id'] == 'captain' for p in maps[a['id']].get('people', [])): ppl['captain'] = {'says': W['captain'].get(a['id'], [])}
    lines[a['id']] = {'light': a['light'], 'people': ppl, 'happens': [{k: h[k] for k in ('code', 'title', 'kind', 'witch') if k in h} for h in a['happens']]}
    used |= {p['id'] for p in maps[a['id']].get('people', [])}
M = json.load(open(os.path.join(HERE, 'world', 'map', 'map.json'), encoding='utf-8')); pins = {k: [((ord(c[0]) - 65) + 0.5) / 12, (int(c[1:]) - 0.5) / 8] for k, c in M['cells'].items() if k in maps}
data = {'maps': maps, 'lines': lines, 'order': order, 'pins': pins,
        # how the cast is lit in each zone: dusk at the fair, night on the moor, deep night on the crag (the key light's colour and strength, the rim from the moon, and how far the whole rig is dimmed)
        'zones': {'1': {'key': 0xffeedd, 'keyK': 1.0, 'rimK': 1.0, 'dim': 0.0}, '2': {'key': 0xc9d2ff, 'keyK': 0.9, 'rimK': 1.5, 'dim': 0.22}, '3': {'key': 0xbcc8ff, 'keyK': 0.85, 'rimK': 1.7, 'dim': 0.32}},
        'flights': {'W3>W8': {'art': 'S3', 'line': 'The flight to the crag'}, 'W8>W3': {'art': 'S3', 'line': 'Back to the fair'}},
        'art': {i: webp('art/pilot/W1.png' if i == 'W1' else 'art/world/%s.png' % i) for i in order}, 'cards': {'S3': webp('art/story/S3.png', 1500, 84)}, 'mapArt': webp('world/map/map.png', 1300, 82)}
# only the skins of the people who stand in the demo
tex = rd('people/npc/npc_tex.js'); T = json.loads(tex[tex.index('{'):tex.rindex('}') + 1]); npcs = rd('people/npc/npcs.js')
skins = set(re.findall(r'"?skin"?:\s*"([^"]+)"', npcs)); keep = set()
for pid in used:
    m = re.search(r'"%s":\s*\{[^\n]*?skin:\s*"([^"]+)"' % re.escape(pid), npcs) or re.search(r"'%s':\s*\{[^\n]*?skin:\s*'([^']+)'" % re.escape(pid), npcs)
    if m: keep.add(m.group(1))
if not keep or any(k not in T for k in keep): keep = set(T)      # if the people's file is not laid out as expected, carry every skin
tex = '// Each skin\'s body sheet and face picture, for the people who stand in the demo (from people/npc/npc_tex.js).\nwindow.MF_NPC_TEX = ' + json.dumps({k: v for k, v in T.items() if k in keep}) + ';\n'
emotes = rd('people/npc/emotes.js')
parts = scripts() + [rd('models/jester/palette.js'), emotes, npcs, tex, rd('people/npc/npc.js'), 'window.MF_WORLD = ' + json.dumps(data, separators=(',', ':')) + ';', rd('src/world.js'), rd('src/walk-main.js')]
for p in parts: assert '</script' not in p.lower(), 'a script holds a closing tag'
page = rd('src/walk.tpl.html').replace('/*TRACED*/', ('Traced so far: %s.' % ', '.join(traced)) if traced else 'None has arrived yet.').replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); open(os.path.join(HERE, 'out', 'moon-faire-walk.html'), 'w', encoding='utf-8').write(page)
print('walk page', len(page) // 1024, 'KB', 'people', sorted(used), 'skins kept', len(keep), 'of', len(T), 'traced', traced)
