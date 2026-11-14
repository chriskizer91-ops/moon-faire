# The world map's painting prompt and its "scenes on the grid" picture, from world/map/map.json (made by make_map_picture.py).
# Writes world/map/map-prompt.md and world/map/map_scenes.jpg, and is imported by build_world_page.py. Run from game/: python3 world/build_map.py
import json, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..'); MAP = os.path.join(HERE, 'map')
def load(): return json.load(open(os.path.join(MAP, 'map.json'), encoding='utf-8'))
def centre(c, cell=128): return ((ord(c[0]) - 65) * cell + cell // 2, (int(c[1:]) - 1) * cell + cell // 2)
ORDER = ['W1', 'W2', 'W3', 'W4', 'W5', 'W7', 'W6', 'W8', 'W9', 'F5']
def where(c, J):
    x, y = centre(c); return 'about %d%% of the way in from the left edge and %d%% of the way down from the top' % (round(100 * x / J['grid']['width']), round(100 * y / J['grid']['height']))
def prompt(J, names):
    land = '\n'.join('- %s (%s). %s' % (L['name'][0].upper() + L['name'][1:], L['where'].rstrip('.'), L['paint']) for L in J['land'])
    places = '\n'.join('- %s. %s' % (names[k], J['places'][k]) for k in ORDER)
    routes = '\n'.join('- %s. %s' % (R['name'][0].upper() + R['name'][1:], R['paint']) for R in J.get('routes', []))
    return '''One painted world map for my fantasy role-playing game, Moon Faire.

Output exactly ONE landscape image, 3:2 (three wide to two tall), 1536 x 1024 pixels or larger. Not a collage or a contact sheet.

I am attaching two images.
- Image 1 (map_guide.png) is the LAYOUT GUIDE: the whole map blocked out in flat colours. Keep its layout exactly. Every coast, river, road, wood, field and landmark stays where the guide puts it and the size the guide makes it. Take only the layout from it. Do not copy its flat colours or its simple shapes: paint real land and real things in their places. In the guide, the green patchwork is farmed fields, dark green is woods, dull purple is heather moor, grey-green is rough grass, olive is gorse, grey is rock and standing stones, dark grey is cliff face, dark blue is sea, mid blue is rivers and pools, grey-teal is marsh, pale tan is roads and tracks, warm tan is trodden fairground, red and cream are tents, brown is wood, and the yellow dots are warm lights.
- Image 2 (style-fair-square.jpg) is a finished painting from this same game. Match its craft, its finish, its realism and the way its lanterns glow. Take nothing else from it: not its view, its layout or its hour.

VIEW. A pictorial map. The land is seen from straight above, with north at the top. Landmarks (the tents, the airship, the standing stones, the broken arch, the tower) are painted as small pictures standing upright on the land, a little larger than life, as on old painted maps, so that each one can be recognised at a glance. Everything else lies flat: fields, moor, water, roads.

NO WORDS AND NO MAP FURNITURE. No lettering, names, numbers or labels anywhere. No legend, compass rose, scale bar, grid, border, scroll, frame or paper edge. No people and no creatures. The painting runs to all four edges. The game draws the names and the pins on top.

THE LIGHT. One evening seen all at once, under one large, nearly full moon that stands off the map to the upper left. The last warmth of dusk lingers on the fields at the far left. Night lies on the moor. The deepest night lies on the sea. Cool silver and violet moonlight falls over everything, and the shadows of upright things fall toward the lower right. Shadows are deep but never black, and every road stays readable. The only warm lights are the lanterns of the fair, one lantern on the moor road, and one small camp fire by the pool. The crag and its tower are the coldest, darkest things on the map and carry no light at all.

THE MAP AS A WHOLE. %s

THE LAND.
%s

THE TEN PLACES. These are the clearest things on the map. Each one is easy to find and sits exactly where the guide puts it.
%s

ROADS AND TRACKS.
%s
- No road, bridge or path reaches the crag. Paint no airship in flight and no route line through the air.''' % (J['whole'], land, places, routes)
def font(n, bold=True):
    f = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''); return ImageFont.truetype(f, n) if os.path.exists(f) else ImageFont.load_default()
def scenes_picture(J, names, picture=None):
    # every scene's painting set down on its square, over the map (the guide, or the finished painting once there is one)
    base = Image.open(picture or os.path.join(MAP, 'map_guide.png')).convert('RGB').resize((1536, 1024), Image.LANCZOS); im = Image.blend(base, Image.new('RGB', base.size, (20, 16, 28)), 0.45); d = ImageDraw.Draw(im, 'RGBA'); f1, f2 = font(14), font(13)
    for i in range(1, 12): d.line((i * 128, 0, i * 128, 1024), fill=(255, 255, 255, 60))
    for j in range(1, 8): d.line((0, j * 128, 1536, j * 128), fill=(255, 255, 255, 60))
    for i in range(12): d.text((i * 128 + 8, 6), chr(65 + i), font=f2, fill=(255, 255, 255, 210))
    for j in range(8): d.text((6, j * 128 + 24), str(j + 1), font=f2, fill=(255, 255, 255, 210))
    for a, b, how in J['joins']:
        (x1, y1), (x2, y2) = centre(J['cells'][a]), centre(J['cells'][b])
        if how == 'fly':
            n = 30; P = lambda t: (x1 + (x2 - x1) * t, y1 + (y2 - y1) * t - 300 * t * (1 - t))
            for k in range(0, n, 2): d.line((*P(k / n), *P((k + 1) / n)), fill=(255, 220, 140, 255), width=4)
        else: d.line((x1, y1, x2, y2), fill=(255, 235, 170, 255), width=4)
    for sid in ORDER:
        x, y = centre(J['cells'][sid]); f = os.path.join(G, 'art', 'pilot' if sid == 'W1' else 'world', sid + '.png')
        if os.path.exists(f): t = Image.open(f).convert('RGB').resize((120, 60), Image.LANCZOS); im.paste(t, (x - 60, y - 30)); d.rectangle((x - 61, y - 31, x + 60, y + 30), outline=(255, 235, 170, 255), width=2)
        else: d.rounded_rectangle((x - 60, y - 30, x + 60, y + 30), 6, fill=(60, 50, 80, 255), outline=(255, 235, 170, 255), width=2); d.text((x, y), 'fight only', font=f2, fill=(255, 255, 255, 255), anchor='mm')
        t = '%s  %s' % (sid, J['cells'][sid]); b = d.textbbox((x, y - 44), t, font=f1, anchor='mm'); d.rounded_rectangle((b[0] - 4, b[1] - 3, b[2] + 4, b[3] + 3), 4, fill=(255, 235, 170, 240)); d.text((x, y - 44), t, font=f1, fill=(20, 16, 28, 255), anchor='mm')
    return im
if __name__ == '__main__':
    J = load(); names = {a['id']: a['name'] for a in json.load(open(os.path.join(HERE, 'world.json')))['areas']}
    open(os.path.join(MAP, 'map-prompt.md'), 'w', encoding='utf-8').write('# Moon Faire: the world map prompt\n\nAttach `map_guide.png` and `style-fair-square.jpg`. Save the result as `map.png`.\n\n```\n%s\n```\n' % prompt(J, names))
    scenes_picture(J, names).save(os.path.join(MAP, 'map_scenes.jpg'), quality=86); print('prompt', len(prompt(J, names)), 'chars')
