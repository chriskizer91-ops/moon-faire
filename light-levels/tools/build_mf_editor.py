# build_mf_editor.py: Chris's Envoi map editor, set up for Moon Faire's walking places, as one file that needs nothing else.
# It takes the editor's own files from the Envoi repo (branch claude/send-note-gigdew) unchanged but for the few replacements below, puts
# Moon Faire's maps (mf-maps.js, from tools/mf_maps.py) where Envoi's were, and leaves out what belongs to Envoi alone (the keepsakes,
# the painted paper dolls). Every replacement must be found the stated number of times, or the script stops.
# usage: python3 -I build_mf_editor.py <envoi repo> <folder holding mf-maps.js> <out.html>
import sys, os, re
E, M, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
rd = lambda p: open(os.path.join(E, p), encoding='utf-8').read()
def swap(s, pairs, what):
    for a, b, n in pairs:
        assert s.count(a) == n, (what, a[:70], s.count(a), n); s = s.replace(a, b)
    return s
W, H = 1774, 887
core = swap(rd('envoi-game-pass-3/map-paths/edits-core.js'), [
    ("const MW = 1536, MH = 1024, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL), REACH = 58;", "const MW = %d, MH = %d, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL), REACH = 120;      // Moon Faire: its paintings' size; a person is about twice as tall in them as in Envoi's" % (W, H), 1),
    ("const MAGPIE_IN = { wickhollow:", "const MAGPIE_IN = {}, ENVOI_MAGPIE_IN = { wickhollow:", 1),      # nobody lands from an airship onto a Moon Faire map here
    ("is outside the painting (1536 x 1024)", "is outside the painting (%d x %d)" % (W, H), 1),
    ("start: clone(m.start || [768, 512]),", "start: clone(m.start || [%d, %d])," % (W // 2, H // 2), 1),
], 'edits-core.js')
field = swap(rd('src/game/field.js'), [
    ("const MW = 1536, MH = 1024, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL);", "const MW = %d, MH = %d, CELL = 12, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL);" % (W, H), 1),
    ("const REACH = 58;", "const REACH = 120;", 1),
], 'field.js')
editor = swap(rd('envoi-final-draft/map-editor/map-editor.js'), [
    ("const STORE = 'envoi.map-paths.v1', UI_STORE = 'envoi.map-paths.ui.v1', KEEP_STORE = 'envoi.map-editor.keepsakes.v1';", "const STORE = 'moonfaire.map-paths.v1', UI_STORE = 'moonfaire.map-paths.ui.v1', KEEP_STORE = 'moonfaire.map-editor.keepsakes.v1';", 1),
    ("speed: 110, zoom: 0.7, ioH: 52, paintedIo, paintedFolk, pace: 1.7, ioScreen: 0.15,", "speed: 220, zoom: 0.7, ioH: (MAPS[id].camera && MAPS[id].camera.span > 12 ? 100 : 140), paintedIo, paintedFolk, pace: 1.7, ioScreen: 0.15,", 1),      # a person 1.7 m tall, in the painting's pixels, by that place's camera
    ("return { game: 'Envoi on the Longest Night', what: 'the map editor: walking-path edits, and where the keepsakes are',", "return { game: 'Moon Faire', what: 'the map editor: walking-path edits, in each painting\\'s own 1774 x 887 pixels',", 1),
], 'map-editor.js')
html = swap(rd('envoi-final-draft/map-editor/map-editor.html'), [
    ("<title>Envoi Map Editor</title>", "<title>Moon Faire map editor</title>", 1),
    ("<span>Envoi on the Longest Night · walking paths and keepsakes</span>", "<span>Moon Faire · walking paths for the nine painted places</span>", 1),
    ('<div class="me-modes" role="group" aria-label="What you are working on">', '<div class="me-modes" role="group" aria-label="What you are working on" hidden>', 1),
    ('          <label><input type="checkbox" id="mp-l-items"><i class="mp-sw items"></i>Keepsakes</label>\n', '          <label hidden><input type="checkbox" id="mp-l-items"><i class="mp-sw items"></i>Keepsakes</label>\n', 1),
    ('          <label><input type="checkbox" id="mp-l-names"><i class="mp-sw items"></i>Every keepsake’s name</label>\n', '          <label hidden><input type="checkbox" id="mp-l-names"><i class="mp-sw items"></i>Every keepsake’s name</label>\n', 1),
    ('aria-label="The painting, with Io\'s walking paths and the keepsakes drawn over it"', 'aria-label="The painting, with the walking paths drawn over it"', 1),
], 'map-editor.html')
css = '\n'.join(rd(p) for p in ('src/game/game.css', 'envoi-game-pass-3/map-paths/map-paths.css', 'envoi-final-draft/map-editor/map-editor.css'))
css += '\n/* Moon Faire: the keepsakes are Envoi\'s own and are left out */\n.me-modes[hidden], .mp-layers label[hidden] { display: none !important; }\n'
assert 'url(' not in css.replace('url(data:', ''), 'a stylesheet reaches outside the page'
html = re.sub(r'<link rel="stylesheet" href="[^"]+">\n', '', html)
html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>', 1)
scripts = [('src/walk/pixel-io.js', rd('src/walk/pixel-io.js')), ('src/walk/walkers.js', rd('src/walk/walkers.js')), ('src/game/sprites.js', rd('src/game/sprites.js')),
           ('mf-maps.js', open(os.path.join(M, 'mf-maps.js'), encoding='utf-8').read()), ('src/game/field.js', field), ('envoi-game-pass-3/map-paths/edits-core.js', core), ('envoi-final-draft/map-editor/map-editor.js', editor)]
a = html.index('<script src="../../src/walk/pixel-io.js"></script>'); b = html.index('</body>')
body = ''
for name, s in scripts:
    assert '</script' not in s.lower(), name
    body += '<!-- ' + name + (' (Envoi on the Longest Night, branch claude/send-note-gigdew)' if name != 'mf-maps.js' else ' (Moon Faire)') + ' -->\n<script>\n' + s + '\n</script>\n'
html = html[:a] + body + html[b:]
assert not re.search(r'(src|href)="\.\.?/', html), 'something still loads from beside the page'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(html); print(OUT, len(html) // 1024, 'KB')
