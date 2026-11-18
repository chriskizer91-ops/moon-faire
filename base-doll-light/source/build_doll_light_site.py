# The doll's light page: deliver/doll_light_site/index.html (three.js, the stage, the base doll and the page inline) and only what the light
# models need: wardrobe_light/<code>_light.js, each outfit's module (wardrobe/<code>.js: how it moves, no paintings), the bun's module,
# and the paintings of the three outfits whose see-through pieces the light model keeps (wings, feather, mask).
import os, re, shutil, json
R = '/home/claude/io/'; OUT = R + 'deliver/doll_light_site/'
rd = lambda p: open(R + p).read()
for d in ('wardrobe', 'wardrobe_light'):
    os.makedirs(OUT + d, exist_ok=True)
    for f in os.listdir(OUT + d): os.remove(OUT + d + '/' + f)
CHIP = {'M1': 'Night out', 'M2': 'At home', 'D1': 'Moonlit gown', 'D2': 'Peasant dress', 'D2V': 'Peasant dress, red corset', 'D3': 'Elven gown', 'D4': 'Court gown',
        'D5': 'Summer dress', 'D6': 'Winter cloak', 'D7': 'Nightgown', 'D8': 'Dancer', 'X1': 'Sorceress', 'X2': 'Devil gown', 'C1': 'Airship deckhand', 'C2': 'Sky-pirate captain',
        'C3': 'Woodland fae', 'C4': 'Shieldmaiden', 'C5': 'Fortune teller', 'C6': 'Bard', 'C7': 'Masquerade', 'C8': 'Paladin'}
ORDER = ['M1', 'M2', 'D1', 'D2', 'D2V', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'X1', 'X2', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
outfits, keeptex = [], []
# the outfits whose frame hooks read their boots' geometry (work/lightpage/bonecheck.py: bones differ when those are made coarse)
EXACT = {'M1': 'snets', 'D4': 'snets', 'X1': 'snets', 'X2': 'snets'}
for code in ORDER:
    lf = R + 'wardrobe_light/%s_light.js' % code
    if not os.path.exists(lf): continue
    outfits.append([CHIP[code], code])
    shutil.copy(lf, OUT + 'wardrobe_light/'); shutil.copy(R + 'wardrobe/%s.js' % code, OUT + 'wardrobe/')
    m = re.search(r'"keep":\s*(\[[^\]]*\])', open(lf).read())
    if m and json.loads(m.group(1)):
        keeptex.append(code); shutil.copy(R + 'wardrobe/%s_tex.js' % code, OUT + 'wardrobe/')
shutil.copy(R + 'wardrobe/hair_bun.js', OUT + 'wardrobe/')
t = rd('viewer_doll/light.tpl.html')
t = t.replace('/*LIGHT*/', rd('wardrobe_light/light_loader.js'))
t = t.replace('/*OUTFITS*/[]', json.dumps(outfits)).replace('/*KEEPTEX*/[]', json.dumps(keeptex)).replace('/*EXACT*/{}', json.dumps(EXACT))
t = t.replace('/*THREE*/', rd('node_modules/three/build/three.min.js').replace('</script>', '<\\/script>')).replace('/*PAL*/', rd('out/palette.js')).replace('/*STAGE*/', rd('viewer/stage_doll.js'))
t = t.replace('/*TEX*/', rd('out/io_tex.js')).replace('/*MODEL*/', rd('out/doll.js'))
open(OUT + 'index.html', 'w').write(t)
sz = lambda d: sum(os.path.getsize(OUT + d + '/' + f) for f in os.listdir(OUT + d))
print('deliver/doll_light_site: index.html %.2f MB; %d light models %.1f MB; wardrobe modules %.2f MB (paintings kept for %s)' % (len(t) / 1e6, len(outfits), sz('wardrobe_light') / 1e6, sz('wardrobe') / 1e6, keeptex))
