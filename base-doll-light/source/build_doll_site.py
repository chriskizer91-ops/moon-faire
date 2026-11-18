# The doll's page with her wardrobe, as a small site: deliver/doll_site/index.html (three.js, the stage, the textures, the model and the
# page inline, as before) and deliver/doll_site/wardrobe/ (each outfit and hairstyle in its own files, loaded when first picked).
import os, re, shutil, json
R = '/home/claude/io/'; OUT = R + 'deliver/doll_site/'
rd = lambda p: open(R + p).read()
os.makedirs(OUT + 'wardrobe', exist_ok=True); os.makedirs(OUT + 'wardrobe_light', exist_ok=True)
for d in ('wardrobe', 'wardrobe_light'):
    for f in os.listdir(OUT + d): os.remove(OUT + d + '/' + f)
CHIP = {'M1': 'Night out', 'M2': 'At home', 'D1': 'Moonlit gown', 'D2': 'Peasant dress', 'D2V': 'Peasant dress, red corset', 'D3': 'Elven gown', 'D4': 'Court gown',
        'D5': 'Summer dress', 'D6': 'Winter cloak', 'D7': 'Nightgown', 'D8': 'Dancer', 'X1': 'Sorceress', 'X2': 'Devil gown', 'C1': 'Airship deckhand', 'C2': 'Sky-pirate captain',
        'C3': 'Woodland fae', 'C4': 'Shieldmaiden', 'C5': 'Fortune teller', 'C6': 'Bard', 'C7': 'Masquerade', 'C8': 'Paladin', 'hair_bun': 'Bun'}
ORDER = ['M1', 'M2', 'D1', 'D2', 'D2V', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'X1', 'X2', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
outfits, hairs = [], [['Long waves', 'long', False]]
mods = sorted(f[:-3] for f in os.listdir(R + 'wardrobe') if f.endswith('.js') and not f.endswith('_tex.js'))
only = os.environ.get('ONLY')            # e.g. ONLY=M1,M2,hair_bun: publish just these
for code in sorted(mods, key=lambda c: (ORDER.index(c) if c in ORDER else 99, c)):
    if only and code not in only.split(','): continue
    src = rd('wardrobe/%s.js' % code); m = re.search(r"name:\s*'((?:[^'\\]|\\.)*)'", src); kind = re.search(r"kind:\s*'([^']+)'", src)
    tex = os.path.exists(R + 'wardrobe/%s_tex.js' % code)
    entry = [CHIP.get(code) or (m.group(1).replace("\\'", "'") if m else code), code, tex]
    (hairs if kind and kind.group(1) == 'hair' else outfits).append(entry)
    shutil.copy(R + 'wardrobe/%s.js' % code, OUT + 'wardrobe/')
    if tex: shutil.copy(R + 'wardrobe/%s_tex.js' % code, OUT + 'wardrobe/')
# the light models (wardrobe_light/<code>_light.js, made by work/lightbake) of the outfits being published
lights = [o[1] for o in outfits if os.path.exists(R + 'wardrobe_light/%s_light.js' % o[1])]
for c in lights: shutil.copy(R + 'wardrobe_light/%s_light.js' % c, OUT + 'wardrobe_light/')
t = rd('viewer_doll/index.tpl.html')
t = t.replace('/*LIGHTS*/[]', json.dumps(lights)).replace('/*LIGHT*/', rd('wardrobe_light/light_loader.js'))
t = t.replace('/*OUTFITS*/[]', json.dumps(outfits)).replace('/*HAIRS*/[]', json.dumps(hairs))
t = t.replace('/*THREE*/', rd('node_modules/three/build/three.min.js').replace('</script>', '<\\/script>')).replace('/*PAL*/', rd('out/palette.js')).replace('/*STAGE*/', rd('viewer/stage_doll.js'))
t = t.replace('/*TEX*/', rd('out/io_tex.js')).replace('/*MODEL*/', rd('out/doll.js'))
open(OUT + 'index.html', 'w').write(t)
size = sum(os.path.getsize(OUT + 'wardrobe/' + f) for f in os.listdir(OUT + 'wardrobe'))
lsize = sum(os.path.getsize(OUT + 'wardrobe_light/' + f) for f in os.listdir(OUT + 'wardrobe_light'))
print('deliver/doll_site: index.html %.2f MB; %d outfits, %d hairstyles, wardrobe files %.2f MB; %d light models %.1f MB' % (len(t) / 1e6, len(outfits), len(hairs) - 1, size / 1e6, len(lights), lsize / 1e6), [o[1] for o in outfits])
