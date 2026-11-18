# Makes the Ranger's "how light can she go" page from the Fox's: the same page script and template with her moves, her wording and her
# numbers, then joins everything into one file that needs nothing else.
import sys, os
FW = '/home/claude/foxw/'; W = '/home/claude/rangerw/'
def swap(s, pairs, what):
    for a, b in pairs:
        assert s.count(a) == 1, (what, a[:70], s.count(a)); s = s.replace(a, b)
    return s
js = open(FW + 'lodpage_fox.js', encoding='utf-8').read()
a = js.index("  // [id, label, half-width in meters"); b = js.index("  let stage, SQ = null;")
js = js[:a] + """  // [id, label, half-width in meters the camera must show, half-height, camera by time: t -> [half-width, shift toward the target, half-height, height of the middle]]
  const STATES = [['idle', 'Ready', 0.52], ['walk', 'Walk', 0.52], ['run', 'Jog', 0.6]];
  // her fight moves and her emotes, as on her own page
  const GAME = [['draw', 'Moonsteel Draw', 1.15, 1.12, () => [1.15, 0.25, 1.12, 0.98]], ['sword', 'Sword', 1.5, 1.15, () => [1.5, 0.5, 1.15, 0.95]], ['knives', 'Knives', 1.2, 1.12, () => [1.2, 0.25, 1.12, 0.95]],
    ['gem', 'The gem', 0.6, 1.05, () => [0.6, 0, 1.05, 1.0]], ['shots', 'The gem\\'s two shots', 1.15, 1.12, () => [1.15, 0.25, 1.12, 0.98]], ['glass', 'Silverglass', 1.3, 1.15, () => [1.3, 0.3, 1.15, 0.98]],
    ['hit', 'Hit', 0.65], ['hard', 'Hard hit', 0.85], ['dodge', 'Dodge', 0.85], ['win', 'Win', 0.9, 1.3, () => [0.9, 0, 1.3, 1.1]], ['fall', 'Fall', 1.0, 1.0, () => [1.0, 0, 1.0, 0.62]]];
  const ACTS = [['talk', 'Talk', 0.58], ['cheer', 'Cheer', 0.65, 1.35, () => [0.65, 0, 1.35, 1.1]], ['limber', 'Limber up', 0.62], ['bow', 'Court bow', 0.8], ['wave', 'Wave', 0.65, 1.2, () => [0.65, 0, 1.2, 1.02]],
    ['kneel', 'Kneel', 0.9, 1.0, () => [0.9, 0, 1.0, 0.62]], ['squat', 'Squat', 0.9, 0.95, () => [0.9, 0, 0.95, 0.5]], ['sit', 'Sit', 0.95, 0.95, () => [0.95, 0, 0.95, 0.45]], ['hover', 'Hover', 0.9, 1.05, () => [0.9, 0, 1.05, 0.72]]];
  const ALL = STATES.concat(GAME, ACTS), find = (id) => ALL.find((x) => x[0] === id) || ALL[0];
  const AIMED = { draw: 1, sword: 1, knives: 1, shots: 1, glass: 1 };

""" + js[b:]
js = swap(js, [
  ("// lodpage_fox.js: the page that shows the Fox at four weights side by side, and tries four of her at once with a crowd of foes.\n// The same stage, square and model as her other pages. Levels are in lod.js; nothing here changes how she looks at Full.",
   "// lodpage_ranger.js: the page that shows the Ranger at four weights side by side, and tries four of her at once with a crowd of foes.\n// Made from the Fox's page script by tools/build_ranger_page.py. Levels are in lod_ranger.js; nothing here changes how she looks at Full."),
  ("palette: (window.JESTER_PALETTE || []).concat(FOX_COLOURS) });", "});      // the 56 colours every witch shares; her own page adds none yet"),
  ("chip($('foes'), 'All cast at once', () => { if (mode.kind === 'fight') units.forEach((u, i) => castAt(u, 'borrowed_face', i)); });", "chip($('foes'), 'All shoot at once', () => { if (mode.kind === 'fight') units.forEach((u, i) => castAt(u, 'shots', i)); });"),
  ("const TURN_MOVES = ['hemline_fangs', 'blue_mischief', 'same_cloth', 'hemline_fangs', 'crazy_quilt', 'slip_stitch', 'moons_little_lie'];", "const TURN_MOVES = ['draw', 'sword', 'knives', 'glass', 'draw', 'gem', 'shots'];"),
  ("u.hitSeen = u.J.state.hitN || 0; u.J.play(id, true);", "u.hitSeen = u.J.state.hitN || 0; u.J.play(id, true, true);      // in a fight a move plays once"),
  ("nextTurn = time + 2.6; } }", "nextTurn = time + 3.4; } }"),
  ("orbit.target.y += ((tyWant * (1 - faceMode) + 1.57 * faceMode) - orbit.target.y)      // her face and all of her hair * Math.min(1, dt * 4);", "orbit.target.y += ((tyWant * (1 - faceMode) + 1.52 * faceMode) - orbit.target.y) * Math.min(1, dt * 4);      // her face and all of her hair"),
  ("['Points of cloth to work out', (s) => big(s.pts)], ", ""),
  ("['Time to work out her pose and cloth, each picture, on this device',", "['Time to work out her pose, each picture, on this device',"),
], 'page script')
open(W + 'lodpage_ranger.js', 'w', encoding='utf-8').write(js)
t = open(FW + 'lod_fox.tpl.html', encoding='utf-8').read()
a = t.index('  <p class="notes"><b>The fight test</b>'); b = t.index('</div>\n<!--SCRIPTS-->')
t = t[:a] + """  <p class="notes"><b>The fight test</b> is the real question: four witches at once (four Rangers stand in for the four), in the night square, with a crowd of foes. They take turns; a fight chip makes the next one do that move. <b>All shoot at once</b> plays the gem's two shots on all four. The foes are plain hooded stand-ins of about 2,000 triangles each, so real foes will cost more than these. Try <b>Four at Full</b> last: it is the heavy one, and a phone may refuse it.</p>
  <div class="notes"><b>What each level gives up.</b>
    <ul>
      <li><b>Full</b> is the model as it is on her own page.</li>
      <li><b>Trim</b> has half the rings in every part and a face thinned again. Her hands are built on a coarser grid. No boot stitches or eyelets.</li>
      <li><b>Light</b> thins every part again: her charms, buckles, hooks and weapons most of all. Her bow, her glasses and her boots are thinned only a little, because thin rods and smooth leather show it first.</li>
      <li><b>Lightest</b> keeps her own painted face, hair, hands, arms, corset, lace, leggings, boots and bags, her glasses, her bow and her gems. Her charms, buckles, hooks, belts, soles, socks, sword, knives and their sheaths give up their own finish and share one of three plain materials: matte, glossy or metal. No nails.</li>
    </ul>
  </div>
  <p class="notes">Nothing about how she moves changes between levels: the same skeleton, the same moves and the same light effects. Unlike the Jester she wears no cloth that has to be worked out point by point (her sleeves, band tails, bags and charms hang on bones), so her pose costs the same little at every level. Her cost is triangles, most of them in her face and hands, and the number of separate draws: she is made of about sixty materials, and Lightest brings that under thirty. Switches: <b>Flipbook look</b> redraws her in the flipbook's colours with an inked outline; with it on, two sliders appear: <b>Pixel size</b> opens at 1.2 mm of her to a pixel and goes from the flipbook's own size down to as fine as this screen, and <b>Colours</b> goes from smooth to the flipbook's own; <b>Glow</b> lets bright things shine; <b>Shadows</b> turns her real shadow on and off.</p>
""" + t[b:]
t = swap(t, [
  ("<title>Fox Witch 3D: how light can she go</title>", "<title>Ranger 3D: how light can she go</title>"),
  ("<h1>Fox Witch 3D</h1>", "<h1>Ranger 3D</h1>"),
  ('aria-label="The Fox Witch drawn at four levels of detail.', 'aria-label="The Ranger drawn at four levels of detail.'),
  ('<section aria-label="Her spells"><p class="label">Spells</p>', '<section aria-label="Her fight moves"><p class="label">In a fight</p>'),
  ('<section aria-label="Moves"><p class="label">Moves</p>', '<section aria-label="Emotes"><p class="label">Emotes</p>'),
      # (the pixel slider opens at 1.2 mm in the Fox's template already)
], 'template')
open(W + 'lod_ranger.tpl.html', 'w', encoding='utf-8').write(t)
order = ['three.js', 'meshopt.js', 'palette.js', 'stage_lod.js', 'square.js', 'ranger_tex.js', 'ranger_lod.js', 'lod_ranger.js', 'lodpage_ranger.js']
parts = ['<script>' + open(W + f, encoding='utf-8').read().replace('</script', '<\\/script') + '</script>' for f in order]
h = t.replace('<!--SCRIPTS-->', '\n'.join(parts))
out = sys.argv[1] if len(sys.argv) > 1 else W + 'out/index.html'
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(h); print(out, len(h))
