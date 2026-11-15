# build.py: the open world as one offline page (out/moon-faire-open-world.html): three.js r128, the Jester at her Lightest, the fair folk,
# the land's rules, the seven paintings, the painted map and the ground patches, all inside it.
# usage: python3 -I build.py <game folder>
import sys, os, json, base64, re, io
from PIL import Image
G = os.path.abspath(sys.argv[1]); HERE = os.path.dirname(os.path.abspath(__file__)); DATA = os.path.join(HERE, 'data')
sys.path.insert(0, os.path.join(G, 'people', 'kit'))
from build_viewer import scripts, rd
def url(name, mime='image/webp'): return 'data:%s;base64,%s' % (mime, base64.b64encode(open(os.path.join(DATA, name), 'rb').read()).decode())
F = json.load(open(os.path.join(DATA, 'features.json'))); R = json.load(open(os.path.join(DATA, 'places.json')))
mp = Image.open(os.path.join(G, 'world/map/map.png')).convert('RGB').resize((1300, 867), Image.LANCZOS); b = io.BytesIO(); mp.save(b, 'WEBP', quality=82, method=6)
img = {k: url('tex_%s.webp' % k) for k in ['heather', 'grass', 'earth', 'fair', 'rock', 'wall']}
for k in ['marsh', 'field']:                                                                       # Chris's Round 3 grounds, when made
    if os.path.exists(os.path.join(DATA, 'tex_%s.webp' % k)): img[k] = url('tex_%s.webp' % k)
# Round 2 and 3: the kit's atlas, trims and plants, and the tiles (prep_round23.py)
for k in ['kit_atlas', 'kit_trim', 'kit_plants'] + ['tile_' + t for t in ['shingles', 'rubble', 'gorse', 'bracken', 'leaves', 'bluestripe', 'damask', 'straw', 'wooddark']]:
    if os.path.exists(os.path.join(DATA, k + '.webp')): img[k] = url(k + '.webp')
for k in ['mat_awning', 'mat_wood', 'mat_stripe', 'tent_skin', 'tent_wrap']:                     # Chris's Round 1 materials and tent skins, when made
    if os.path.exists(os.path.join(DATA, k + '.webp')): img[k] = url(k + '.webp')
img.update({'macro': url('macro.webp'), 'moon': url('moon.png', 'image/png'), 'mapPainted': 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()})
for p in R['places']: img['paint_' + p] = url('paint_%s.webp' % p)
for k, f in (('F1', 'art/pilot/F1.png'), ('F3', 'art/fights/F3.png')):      # the painted fight places an encounter cuts to
    im = Image.open(os.path.join(G, f)).convert('RGB'); im.thumbnail((1100, 1100)); b2 = io.BytesIO(); im.save(b2, 'WEBP', quality=82, method=6); img[k] = 'data:image/webp;base64,' + base64.b64encode(b2.getvalue()).decode()
land_src = open(os.path.join(HERE, 'src', 'land.js'), encoding='utf-8').read()
TENTS = json.load(open(os.path.join(DATA, 'tents.json'))) if 'tent_skin' in img and os.path.exists(os.path.join(DATA, 'tents.json')) else {}
KITJ = json.load(open(os.path.join(DATA, 'kit.json'))) if 'kit_atlas' in img else None
data = {'F': F, 'R': R, 'img': img, 'tents': TENTS, 'kit': KITJ, 'palette': json.load(open(os.path.join(DATA, 'palette.json'))), 'landSrc': land_src}
# only the skins of the people who stand in these places
used = {p['id'] for P in R['places'].values() for p in P['people']}
tex = rd('people/npc/npc_tex.js'); T = json.loads(tex[tex.index('{'):tex.rindex('}') + 1]); npcs = rd('people/npc/npcs.js'); keep = set()
for pid in used:
    m = re.search(r'"%s":\s*\{[^\n]*?skin:\s*"([^"]+)"' % re.escape(pid), npcs) or re.search(r"'%s':\s*\{[^\n]*?skin:\s*'([^']+)'" % re.escape(pid), npcs)
    if m: keep.add(m.group(1))
if not keep or any(k not in T for k in keep): keep = set(T)
tex = 'window.MF_NPC_TEX = ' + json.dumps({k: v for k, v in T.items() if k in keep}) + ';\n'
# the fair folk's lines and minds (people/talk): the written bank if it has been built (build_talk.py), the picker, the minds
TALK = [rd('people/talk/' + f) for f in ['lines.js', 'talk.js', 'minds.js'] if os.path.exists(os.path.join(G, 'people/talk', f))]
parts = [s for s in scripts() if 'function makeMFStage' not in s] + [rd('models/jester/palette.js'), rd('people/npc/emotes.js'), npcs, tex, rd('people/npc/npc.js')] + TALK + [
         'window.OW_DATA = ' + json.dumps(data, separators=(',', ':')) + ';', land_src] + [open(os.path.join(HERE, 'src', f), encoding='utf-8').read() for f in ['ow-core.js', 'ow-terrain.js', 'ow-kit.js', 'ow-places.js', 'ow-dressing.js', 'ow-props.js', 'ow-flora.js', 'ow-folk.js', 'ow-main.js']]
for p in parts: assert '</script' not in p.lower(), 'a script holds a closing tag'
tpl = open(os.path.join(HERE, 'src', 'ow.tpl.html'), encoding='utf-8').read(); os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
# Jacquard 24 (the titles' and names' lettering) goes inside the page, so it looks the same offline; reading text falls back to the system's own
FONT = os.path.join(G, '..', 'art', 'fonts', 'jacquard24-latin.woff2')
tpl = tpl.replace('/*FONTS*/', '@font-face { font-family: "Jacquard 24"; font-style: normal; font-weight: 400; font-display: swap; src: url(data:font/woff2;base64,%s) format("woff2"); }' % base64.b64encode(open(FONT, 'rb').read()).decode() if os.path.exists(FONT) else '')
for name, title, h1, notes, flag in (('moon-faire-open-world.html', 'Moon Faire: the open world', 'The open world', 'notes_world.html', ''), ('moon-faire-square-test.html', 'Moon Faire: the fair square test', 'The fair square test', 'notes_test.html', '<script>window.OW_TEST = true;</script>\n')):
    page = tpl.replace('/*TITLE*/', title).replace('/*H1*/', h1).replace('/*NOTES*/', open(os.path.join(HERE, 'src', notes), encoding='utf-8').read()).replace('/*SCRIPTS*/', flag + '\n'.join('<script>\n%s\n</script>' % p for p in parts))
    open(os.path.join(HERE, 'out', name), 'w', encoding='utf-8').write(page)
print('open world page', len(page) // 1024, 'KB', 'people', sorted(used), 'skins kept', len(keep), 'of', len(T))
