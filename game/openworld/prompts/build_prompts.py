# build_prompts.py: one page holding every reference picture and every prompt for the open world's texture packs and skin sheets,
# plus a zip of the reference pictures. usage: python3 -I build_prompts.py
import os, io, sys, json, base64, zipfile, html
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
G = '/home/claude/chriskizer91-ops/moon-faire/game/'
OUT = os.path.join(HERE, '..', 'out')
PAINT = {'W1': ('art/pilot/W1.png', 'The fair square'), 'W2': ('art/world/W2.png', 'The stall row and the sparring ring'), 'W3': ('art/world/W3.png', 'The mooring field'), 'W4': ('art/world/W4.png', 'The Last Lantern'),
         'W5': ('art/world/W5.png', 'The standing stones'), 'W6': ('art/world/W6.png', 'The still pool and the broken arch'), 'W7': ('art/world/W7.png', 'The hollow'), 'MAP': ('world/map/map.png', 'The world map')}
CROP = {'red_tent': 'the red and cream round tent', 'gold_tent': 'the gold square tent', 'star_tent': 'the blue star tent', 'green_tent': 'the green round tent', 'potion_stall': 'the brassware stall',
        'moon_stall': 'the moon-cloth stall', 'lamp_stall': 'the lamp stall', 'herb_stall': 'the herb stall', 'wagon': 'the painted wagon', 'well': 'the well', 'crates': 'the crates and barrels', 'post': 'a lantern post',
        'big_top': 'the blue and cream big top', 'purple_tent': 'the red damask tent', 'booth': 'the wooden booth', 'oven_cart': 'the oven cart', 'pie_cart': 'the pie cart', 'bales': 'the straw bales', 'brazier': 'the fair gate, fence, table and brazier'}

END = "- No text, no letters, no border and no signature."
GROUND = """Paint a square ground texture for a hand-painted fantasy game, in the same painterly style, brushwork and colours as the attached painting.
- Seen from straight above (top-down). No horizon, no sky and no perspective.
- Seamless: the left edge must continue into the right edge, and the top edge into the bottom edge, so the square can repeat without a visible join.
- Even, flat light. No lamp glow, no bright patch, no vignette and no cast shadows. The game adds its own light.
- No objects: no stones big enough to stand out, no bushes, no paths, no people and no animals.
- Even spread: nothing noticeably bigger, brighter or darker than the rest, because the square repeats hundreds of times.
""" + END
MATERIAL = """Paint a square, seamless material texture for a hand-painted fantasy game, in the same painterly style, brushwork and colours as the attached pictures.
- Seen straight on and flat, filling the whole picture edge to edge. No perspective.
- Seamless: the left edge must continue into the right edge, and the top edge into the bottom edge, so the square can repeat without a visible join.
- Even, flat light. No lamp glow, no bright patch, no vignette and no cast shadows. Only soft folds or grain.
- Only the material itself: no objects, no poles, no ropes, no ground and no sky.
- Even spread: nothing noticeably bigger, brighter or darker than the rest, because the square repeats many times.
""" + END
SKIN = """Paint one flat view of a single object for a hand-painted fantasy game, in the same painterly style, brushwork and colours as the attached pictures. Match the object in the attached close-up: the same design, colours, patterns and details.
- A flat, straight-on view with no perspective, like an architect's elevation drawing but fully painted.
- The whole object inside the picture, centred, with a small margin all round.
- Background: one plain flat mid-grey (#808080) with nothing in it. No ground, no grass, no sky, no cast shadow and no other objects.
- Even, soft dusk light from the front. Lantern glass may glow, but no light may spill onto the background.
""" + END
ROOF = SKIN.replace("- A flat, straight-on view with no perspective, like an architect's elevation drawing but fully painted.", "- Seen from exactly straight above, with no perspective (a plan view), fully painted.").replace("- The whole object inside the picture, centred, with a small margin all round.\n", "")
RULES = {'ground': GROUND, 'material': MATERIAL, 'skin': SKIN, 'roof': ROOF}

def door(what): return "Subject: %s, its entrance side only. Show the tent's whole wall from the ground up to the top of the wall, including the scalloped border along the top, with the door flaps tied open in the centre and a dark inside behind them. Do not show the roof. The wall should fill most of the picture's width." % what
def roof_round(what): return "Subject: the roof of %s. A circle that touches all four sides of the square picture, with the pole tip at the exact centre and every seam or stripe running straight out from the centre to the rim. The scalloped border may just show round the rim. The four corners outside the circle are plain flat mid-grey." % what
def roof_square(what): return "Subject: the roof of %s. It fills the whole square picture edge to edge, with the pole tip at the exact centre and four ridge seams running from the centre exactly to the four corners. No grey background shows." % what
def stall(what, goods): return "Subject: %s, seen flat from the front. Show the wooden counter with its hanging cloth, %s, the corner posts, and the awning's front edge with its scalloped trim. The whole stall is in the picture." % (what, goods)

# id, round, file, shape, rules, refs, title, subject, used for
C = []
def add(*a): C.append(dict(zip(('id', 'round', 'file', 'shape', 'rules', 'refs', 'title', 'body', 'use'), a)))
# ---- A: ground ----
add('A1', 1, 'ground_heather.png', 'Square', 'ground', ['W5'], 'Heather moor', "Subject: dense purple moorland heather at night under moonlight, about 3 m across. Low woody heather clumps with tiny muted purple and mauve flowers, dark olive-green and brown stems showing between the clumps, a few gaps of dark peaty soil. Cool night colours: deep purples, dull greens and browns, nothing bright.", 'Most of the moor.')
add('A2', 1, 'ground_turf.png', 'Square', 'ground', ['W7'], 'Short moor turf', "Subject: short, tough moorland grass and moss at night, about 4 m across. Fine blades of grey-green and olive grass, patches of soft moss, a few small dry brown tufts. No flowers. Muted night colours.", 'Grassy rises, the moor\'s edge, the hollow floor.')
add('A3', 1, 'ground_track.png', 'Square', 'ground', ['W4'], 'Worn earth track', "Subject: bare, hard-packed earth track, about 3 m across. Grey-brown dirt with small pebbles and grit, faint worn grooves running in no single direction, a few tiny tufts of grass. Neutral night colours, a little warm.", 'The moor road and every track.')
add('A4', 1, 'ground_fair.png', 'Square', 'ground', ['W3'], 'Trampled fair ground', "Subject: the trampled earth of a travelling fair, about 4 m across. Packed brown earth with scattered bits of straw, flattened grass at the edges of bare patches, a little sawdust. Warm dusk colours, with no lantern glow.", 'The worn ground round the tents.')
add('A5', 1, 'ground_rock.png', 'Square', 'material', ['W7'], 'Rock face', "Subject: a weathered granite rock face, about 3 m across. Grey stone with cracks and small ledges, pale lichen patches in grey-green and ochre, small tufts of moss in the cracks. No plants hanging off it. Cool moonlit greys.", 'Cliffs, the crag, the tor, any steep slope.')
add('A6', 1, 'wall_drystone.png', 'Wide (3:2)', 'material', ['W4'], 'Drystone wall face', "Subject: the face of a dry-stone field wall. Rough grey stones of mixed sizes stacked without mortar, lichen and moss on them, small dark gaps between. The picture's top edge is the wall's top row of stones and its bottom edge is the wall's foot: about 1.8 m of wall, 1.2 m high. This one is wide, not square, and needs to repeat left to right only. Moonlit greys.", 'Every drystone wall and the sheepfold.')
add('A7', 3, 'ground_marsh.png', 'Square', 'ground', ['W6'], 'River marsh', "Subject: wet marshy ground at night, about 4 m across. Dark peat and mud, tussocks of coarse grass and rushes, small dark puddles reflecting a little moonlight. Dark, cool colours.", 'The marsh and the river banks.')
add('A8', 3, 'ground_field.png', 'Square', 'ground', ['W1'], 'Farm field grass', "Subject: even meadow grass of a farm field at dusk, about 4 m across. Soft green and yellow-green grass, a few clover leaves and small pale wildflowers. Warm dusk colours.", 'The hedged fields in the west.')
add('A9', 3, 'ground_cobbles.png', 'Square', 'ground', ['W1'], 'Worn cobbles', "Subject: old rounded cobblestones set in packed earth, about 3 m across, as in the ring round the fair square. Grey and warm-brown stones of mixed sizes, earth and a little grass in the gaps. Dusk colours.", 'The square\'s ring, and paved ground in any new place.')
# ---- B: cloth and materials ----
add('B1', 1, 'cloth_red_cream_stripe.png', 'Square', 'material', ['W1', 'red_tent'], 'Red and cream striped canvas', "Subject: heavy tent canvas in broad vertical stripes of deep red and warm cream. Exactly four red and four cream stripes of equal width across the picture, so it repeats cleanly. A little weathered, with faint soft vertical folds.", 'The red tent\'s walls, and any striped tent.')
add('B2', 1, 'cloth_gold_brocade.png', 'Square', 'material', ['W1', 'gold_tent'], 'Gold brocade canvas', "Subject: gold-yellow tent canvas with a faint woven pattern of small diamonds in a slightly darker gold. Heavy cloth, a little weathered. Leave out the red border.", 'The gold tent\'s walls.')
add('B3', 1, 'cloth_blue_stars.png', 'Square', 'material', ['W1', 'star_tent'], 'Blue canvas with gold stars', "Subject: midnight-blue tent canvas scattered evenly with small gold eight-pointed stars and tiny gold dots, as on the star tent. The stars are all about the same size.", 'The star tent\'s walls.')
add('B4', 1, 'cloth_green_gold_leaf.png', 'Square', 'material', ['W1', 'green_tent'], 'Green canvas with gold leaves', "Subject: deep green tent canvas embroidered in gold with upright leafy sprigs, evenly repeated in rows, as on the green tent.", 'The green tent\'s walls.')
add('B5', 3, 'cloth_blue_cream_stripe.png', 'Square', 'material', ['W2', 'big_top'], 'Blue and cream striped canvas', "Subject: heavy tent canvas in broad vertical stripes of dusky blue and warm cream. Exactly four blue and four cream stripes of equal width across the picture, so it repeats cleanly. A little weathered.", 'The big top\'s walls.')
add('B6', 3, 'cloth_red_damask.png', 'Square', 'material', ['W2', 'purple_tent'], 'Red damask striped canvas', "Subject: tent canvas in broad vertical stripes of cream and deep red, the red stripes carrying a darker red floral damask pattern. Exactly four red and four cream stripes of equal width across the picture.", 'The damask tent by the sparring ring.')
add('B7', 1, 'cloth_cream_awning.png', 'Square', 'material', ['W1', 'lamp_stall'], 'Cream awning canvas', "Subject: plain cream awning canvas, weathered and a little stained, with a very faint woven floral pattern in pale gold, as on the stall awnings.", 'Every stall awning, top and underside.')
add('B8', 2, 'trim_scallop.png', 'Wide (3:2)', 'skin', ['W1', 'potion_stall'], 'Scalloped border', "Subject: a scalloped cloth border, the hanging edge of a tent roof or awning. A deep red band with gold embroidery along its top, ending below in a row of exactly six rounded scallops edged in gold, with a small gold tassel at each point. It runs straight across the middle of the picture from the left edge to the right edge and must repeat left to right. Plain flat mid-grey above and below it.", 'The edge of every tent roof and awning.')
add('B9', 1, 'wood_planks.png', 'Square', 'material', ['W2', 'booth'], 'Weathered planks', "Subject: weathered wooden planks running up and down, warm brown, with grain, knots, a few nail heads and thin dark gaps between them. Exactly eight planks across the picture.", 'Stall counters and backs, crates, booths, carts.')
add('B10', 3, 'wood_dark.png', 'Square', 'material', ['W3'], 'Dark tarred planks', "Subject: dark tarred planking running left to right, as on the airship's hull: long near-black brown planks with worn edges and a few iron nail heads. Exactly eight planks down the picture.", 'The airship\'s hull later, and dark timber anywhere.')
add('B11', 2, 'roof_shingles.png', 'Square', 'material', ['W1', 'well'], 'Wooden roof shingles', "Subject: rows of weathered wooden roof shingles, grey-brown, overlapping, as on the well's little roof.", 'The well\'s roof, booth roofs, the wagon\'s roof.')
add('B12', 2, 'stone_rubble.png', 'Square', 'material', ['W1', 'well'], 'Rubble stonework', "Subject: rough stonework of grey fieldstones of mixed sizes set in pale mortar, with a little moss, as on the well's wall.", 'The well, the broken arch, the dead tower.')
add('B13', 3, 'straw.png', 'Square', 'material', ['W2', 'bales'], 'Packed straw', "Subject: tightly packed golden straw, the stalks running mostly left to right, as on the straw bales.", 'Straw bales, and thatch on the farms.')
# ---- C: tent doors and roofs ----
for i, (key, name, kind, rnd) in enumerate([('red_tent', 'the red and cream striped round tent', 'round', 1), ('gold_tent', 'the gold square tent with the red diamond emblem and red brocade border', 'square', 1), ('star_tent', 'the midnight-blue square tent with gold stars', 'square', 1), ('green_tent', 'the green round tent with gold leaf embroidery', 'round', 1), ('big_top', 'the blue and cream striped big top', 'round', 3)]):
    pid = 'W2' if key == 'big_top' else 'W1'; short = key
    add('C%d' % (2 * i + 1), rnd, 'skin_%s_door.png' % short, 'Wide (3:2)', 'skin', [pid, key], CROP[key].replace('the ', '').capitalize() + ': door side', door(name), 'Laid on the tent\'s front. The rest of the wall uses its canvas.')
    add('C%d' % (2 * i + 2), rnd, 'skin_%s_roof.png' % short, 'Square', 'roof', [pid, key], CROP[key].replace('the ', '').capitalize() + ': roof from above', (roof_round if kind == 'round' else roof_square)(name), 'Laid on the tent\'s roof from above.')
# ---- D: one-off pieces ----
add('D1', 2, 'skin_stall_lamp_front.png', 'Wide (3:2)', 'skin', ['W1', 'lamp_stall'], 'Lamp stall: front', stall('the lamp-seller\'s stall with the cream awning', 'the lanterns, oil lamps and small chests on it'), 'The lamp-seller\'s stall.')
add('D2', 2, 'skin_stall_brass_front.png', 'Wide (3:2)', 'skin', ['W1', 'potion_stall'], 'Brassware stall: front', stall('the brassware stall with the cream patterned awning', 'the brass jugs, pots and bottles on it'), 'The far left stall of the square.')
add('D3', 2, 'skin_stall_moon_front.png', 'Wide (3:2)', 'skin', ['W1', 'moon_stall'], 'Moon-cloth stall: front', stall('the stall with the blue awning showing the gold phases of the moon', 'the bottles, jars and round lamp on it'), 'The far right stall of the square.')
add('D4', 2, 'skin_stall_herb_front.png', 'Wide (3:2)', 'skin', ['W1', 'herb_stall'], 'Herb stall: front', stall('the herb stall with the cream awning', 'the baskets, the bunch of lavender and the coil of rope on it'), 'The stall on the square\'s right.')
add('D5', 2, 'skin_stall_back.png', 'Wide (3:2)', 'skin', ['W1', 'lamp_stall'], 'Any stall: back', "Subject: a market stall like the one in the close-up, seen flat from behind. A plain wall of upright wooden planks between two corner posts, with the back edge of the cream awning and its scalloped trim along the top. No goods and no people.", 'The back of every stall.')
add('D6', 2, 'skin_wagon_side.png', 'Wide (3:2)', 'skin', ['W1', 'wagon'], 'Painted wagon: side', "Subject: the painted wagon, seen flat from the side. Blue panelled body with gold scrollwork and a gold crescent moon, arched wooden roof, two spoked wheels, and the short shaft at its front.", 'Both sides of the wagon.')
add('D7', 2, 'skin_wagon_end.png', 'Square', 'skin', ['W1', 'wagon'], 'Painted wagon: back end', "Subject: the same painted wagon, seen flat from the back end. A small panelled door with gold scrollwork, the arched end of the roof above it, a step below, and the two wheels seen edge-on at the sides.", 'Both ends of the wagon.')
add('D8', 2, 'skin_well.png', 'Tall (2:3)', 'skin', ['W1', 'well'], 'The well', "Subject: the stone well, seen flat from the side. Round wall of rough stones, two wooden posts, the small shingled roof, and the bucket and lit lantern hanging under it.", 'The well in the square.')
add('D9', 2, 'skin_lantern_post.png', 'Tall (2:3)', 'skin', ['W1', 'post'], 'Lantern post', "Subject: one tall lantern post, seen flat from the side. A dark iron post with a curled bracket at the top holding a single lit lantern with warm glass. The post runs from the bottom of the picture to near the top.", 'Every lantern post in the fair.')
add('D10', 2, 'skin_crates_barrels.png', 'Wide (3:2)', 'skin', ['W1', 'crates'], 'Crates and barrels', "Subject: four separate things in a row, not touching each other, each seen flat from the front: a large low crate with crossed braces, a tall narrow crate, a barrel with iron hoops, and a small keg.", 'Crates and barrels everywhere.')
add('D11', 3, 'skin_oven_cart.png', 'Wide (3:2)', 'skin', ['W2', 'oven_cart'], 'Oven cart: side', "Subject: the baker's oven cart, seen flat from the side. A domed clay and brick oven with a small chimney and a glowing mouth, on a low wooden cart with one spoked wheel showing, a basket of loaves and a sack beside it.", 'The baker\'s cart.')
add('D12', 3, 'skin_pie_cart.png', 'Wide (3:2)', 'skin', ['W2', 'pie_cart'], 'Pie cart: side', "Subject: the pie cart, seen flat from the side. A small handcart covered with a cream fringed cloth, one large spoked wheel, and two long handles.", 'The pie-seller\'s cart.')
add('D13', 3, 'skin_booth_front.png', 'Wide (3:2)', 'skin', ['W2', 'booth'], 'Wooden booth: front', "Subject: the shuttered wooden booth, seen flat from the front. Plank walls with a wide closed shutter braced with crossed boards, and a low shingled roof.", 'The two booths by the sparring ring.')
add('D14', 3, 'skin_fair_gate.png', 'Square', 'skin', ['W3', 'brazier'], 'The fair gate', "Subject: the fair gate, seen flat from the front. Two tall rough wooden poles with a bar lashed across their tops with rope. Nothing between the poles but the grey background.", 'The gate at the east end of the fair.')
add('D15', 3, 'skin_small_things.png', 'Wide (3:2)', 'skin', ['W3', 'bales'], 'Small things', "Subject: four separate things in a row, not touching each other, each seen flat from the front: a straw bale, a thick coil of rope lying flat, an iron brazier on three legs with glowing coals, and a small wooden table.", 'Dressing for the fair and for camps.')
# ---- E: plants ----
add('E1', 2, 'plant_gorse.png', 'Square', 'material', ['W5'], 'Gorse in flower', "Subject: dense gorse bush foliage filling the whole picture. Dark green spiny sprigs covered with many small bright yellow flowers, as on the gorse in the painting.", 'Every gorse bush.')
add('E2', 2, 'plant_bracken.png', 'Square', 'material', ['W7'], 'Bracken', "Subject: overlapping bracken fern fronds filling the whole picture, russet brown with some dull green, as in the painting.", 'Bracken in the hollow and on the moor.')
add('E3', 2, 'plant_reeds.png', 'Wide (3:2)', 'skin', ['W6'], 'Reeds', "Subject: a row of tall reeds and rushes seen from the side, growing up from the picture's bottom edge to ragged tips about three quarters of the way up, pale gold and dull green. The row runs from the left edge to the right edge and must repeat left to right. This replaces the rule about a margin all round.", 'Reeds by the pool and along the river.')
add('E4', 3, 'plant_leaves.png', 'Square', 'material', ['MAP'], 'Tree leaves', "Subject: dark green tree foliage at night filling the whole picture: overlapping clusters of small leaves, a little lighter where moonlight catches them.", 'The woods and the copses.')
add('E5', 2, 'plant_thorn_tree.png', 'Square', 'skin', ['W4'], 'Thorn tree', "Subject: one bare, wind-bent thorn tree seen from the side, as in the painting: a twisted dark trunk leaning to the right, with gnarled leafless branches all swept the same way. The trunk's foot touches the bottom of the picture.", 'The thorn trees on the moor.')

# ---- pictures ----
def jpg(im, q=88): b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return b.getvalue()
def uri(b): return 'data:image/jpeg;base64,' + base64.b64encode(b).decode()
REF = {}
for k, (f, name) in PAINT.items():
    im = Image.open(G + f).convert('RGB'); t = im.copy(); t.thumbnail((300, 200)); REF[k] = {'file': 'ref_%s.jpg' % k, 'name': ('%s  %s' % (k, name)) if k != 'MAP' else name, 'full': jpg(im, 86), 'thumb': jpg(t, 80)}
for k, name in CROP.items():
    im = Image.open(os.path.join(HERE, 'refs', 'crop_%s.jpg' % k)).convert('RGB'); t = im.copy(); t.thumbnail((300, 200)); REF[k] = {'file': 'ref_close_%s.jpg' % k, 'name': 'Close-up: ' + name, 'full': jpg(im, 90), 'thumb': jpg(t, 80)}
used = [k for k in REF if any(k in c['refs'] for c in C)]
with zipfile.ZipFile(os.path.join(OUT, 'Moon_Faire_Open_World_References.zip'), 'w', zipfile.ZIP_STORED) as z:
    for k in used: z.writestr(REF[k]['file'], REF[k]['full'])

E = html.escape
SETS = [('A', 'Ground', 'Seamless squares seen from above. The painted map decides where each one goes.'), ('B', 'Cloth and materials', 'Seamless squares seen straight on. These are the reusable pack: any tent, stall or building in any zone can be covered with them.'),
        ('C', 'Tent doors and roofs', 'Two flat views of each tent in the square. The canvas from set B covers the rest of the tent.'), ('D', 'One-off pieces', 'Flat views of the things that are not just cloth or planks: stall fronts, the wagon, the well, the carts.'), ('E', 'Plants', 'For the bushes, reeds and trees, which are plain shapes now.')]
ROUND = {1: 'Round 1', 2: 'Round 2', 3: 'Round 3'}
def card(c):
    prompt = RULES[c['rules']] + '\n\n' + c['body'] + '\n\nPicture shape: ' + c['shape'].lower() + '.'
    refs = ''.join('<figure><img src="%s" alt=""><figcaption>%s<br><span class="muted">%s</span></figcaption></figure>' % (uri(REF[k]['thumb']), E(REF[k]['name']), REF[k]['file']) for k in c['refs'])
    return ('<article class="card" id="%s"><header><span class="code">%s</span><h3>%s</h3><span class="tag r%d">%s</span></header>'
            '<dl><dt>Save as</dt><dd><code>%s</code></dd><dt>Shape</dt><dd>%s</dd><dt>Used for</dt><dd>%s</dd></dl>'
            '<p class="lbl">Attach</p><div class="refs">%s</div><p class="lbl">Prompt</p><pre>%s</pre><button type="button" class="copy">Copy prompt</button></article>') % (
            c['id'], c['id'], E(c['title']), c['round'], ROUND[c['round']], c['file'], c['shape'], E(c['use']), refs, E(prompt))
rounds = {r: [c for c in C if c['round'] == r] for r in (1, 2, 3)}
check = ''.join('<div><h3>%s: %d pictures</h3><p>%s</p><p class="muted">%s</p></div>' % (ROUND[r], len(rounds[r]), w, ', '.join('<a href="#%s">%s</a>' % (c['id'], c['id']) for c in rounds[r]))
                for r, w in ((1, 'The ground, the four tents of the square and their canvas. This changes the look the most. Send these back before making the rest, so you can see the difference first.'),
                             (2, 'The stalls, the wagon, the well, the lantern posts, and the plants.'), (3, 'The stall row\'s pieces and the last ground squares.')))
sets = ''.join('<section><h2>%s. %s</h2><p class="muted">%s</p>%s</section>' % (s, E(t), E(d), ''.join(card(c) for c in C if c['id'][0] == s)) for s, t, d in SETS)
gallery = ''.join('<figure id="ref-%s"><img src="%s" alt="%s"><figcaption><b>%s</b><br><code>%s</code> <a class="save" download="%s">Save picture</a></figcaption></figure>' % (k, uri(REF[k]['full']), E(REF[k]['name']), E(REF[k]['name']), REF[k]['file'], REF[k]['file']) for k in used)
page = open(os.path.join(HERE, 'prompts.tpl.html'), encoding='utf-8').read().replace('/*N*/', str(len(C))).replace('/*CHECK*/', check).replace('/*SETS*/', sets).replace('/*GALLERY*/', gallery).replace('/*NREF*/', str(len(used)))
open(os.path.join(OUT, 'moon-faire-open-world-picture-prompts.html'), 'w', encoding='utf-8').write(page)
print('prompts', len(C), {r: len(v) for r, v in rounds.items()}, 'refs', len(used), 'page', len(page) // 1024, 'KB', 'zip', os.path.getsize(os.path.join(OUT, 'Moon_Faire_Open_World_References.zip')) // 1024, 'KB')
json.dump([{k: c[k] for k in ('id', 'round', 'file', 'shape', 'title', 'use')} for c in C], open(os.path.join(HERE, 'list.json'), 'w'))
