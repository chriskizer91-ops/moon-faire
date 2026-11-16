# Makes Io's "how light can she go" page from the Fox's: the same page script and template with her moves, her wording and her numbers,
# then joins everything into one file that needs nothing else. Io casts at whoever stands in front of her (the Fox and the Ranger cast
# to their left), so three lines of the page script that aim a witch and turn the camera are changed too.
import sys, os
FW = '/home/claude/foxw/'; W = '/home/claude/iow/'
def swap(s, pairs, what):
    for a, b in pairs:
        assert s.count(a) == 1, (what, a[:70], s.count(a)); s = s.replace(a, b)
    return s
js = open(FW + 'lodpage_fox.js', encoding='utf-8').read()
a = js.index("  // [id, label, half-width in meters"); b = js.index("  let stage, SQ = null;")
js = js[:a] + """  // [id, label, half-width in meters the camera must show, half-height, camera by time: t -> [half-width, shift toward the target, half-height, height of the middle]]
  const STATES = [['idle', 'Standing', 0.55], ['walk', 'Walk', 0.55], ['run', 'Jog', 0.62]];
  // her spells and reactions, then her other moves, as on her own page. A spell is seen from her side, so she casts toward the right.
  const GAME = [['crescent', 'Harvest Crescent', 1.5, 1.2, () => [1.5, 0.6, 1.2, 0.92]], ['salve', 'Silverleaf Salve', 1.5, 1.2, () => [1.5, 0.6, 1.2, 0.92]], ['guardian', 'Elderwood Guardian', 2.0, 1.7, (t) => (t < 8.3 ? [1.5, -0.39, 1.25, 0.92] : t < 12.05 ? [2.0, -1.03, 1.7, 1.15] : [1.8, 0.74, 1.5, 0.97])],
    ['garden', 'Moonflower Garden', 2.0, 1.6, () => [2.0, 0, 1.6, 0.76]], ['thorn', 'Thornwake', 1.5, 1.2, () => [1.5, 0.6, 1.2, 0.92]], ['revive', 'Rootbound Return', 1.5, 1.2, () => [1.5, -0.42, 1.2, 0.62]], ['cradle', 'Bramble Cradle', 1.7, 1.45, () => [1.7, 0.3, 1.45, 1.12]],
    ['hit', 'Hit', 0.7], ['down', 'Down', 1.1, 1.1, () => [1.1, 0, 1.1, 0.72]], ['win', 'Win', 0.75, 1.2, () => [0.75, 0, 1.2, 0.98]]];
  const ACTS = [['talk', 'Talk', 0.58], ['read', 'Read her book', 0.6], ['glasses', 'Push up glasses', 0.6], ['hat', 'Tip her hat', 0.62], ['curtsey', 'Curtsey', 0.75], ['twirl', 'Twirl', 0.9], ['herb', 'Pick a herb', 0.8], ['wave', 'Wave', 0.65, 1.2, () => [0.65, 0, 1.2, 1.02]],
    ['look', 'Look round', 0.6], ['sickle', 'Hold her sickle', 0.7], ['squat', 'Squat', 0.8, 0.95, () => [0.8, 0, 0.95, 0.5]], ['kneel', 'Kneel', 0.8, 1.0, () => [0.8, 0, 1.0, 0.62]], ['hover', 'Hover', 0.8, 1.1, () => [0.8, 0, 1.1, 0.95]]];
  const ALL = STATES.concat(GAME, ACTS), find = (id) => ALL.find((x) => x[0] === id) || ALL[0];
  const SPELLS = { crescent: 1, salve: 1, guardian: 1, garden: 1, thorn: 1, revive: 1, cradle: 1 }, AIMED = { crescent: 1, guardian: 1, thorn: 1, cradle: 1 };

""" + js[b:]
js = swap(js, [
  ("// lodpage_fox.js: the page that shows the Fox at four weights side by side, and tries four of her at once with a crowd of foes.\n// The same stage, square and model as her other pages. Levels are in lod.js; nothing here changes how she looks at Full.",
   "// lodpage_io.js: the page that shows Io at four weights side by side, and tries four of her at once with a crowd of foes.\n// Made from the Fox's page script by tools/build_io_page.py. Levels are in lod_io.js; nothing here changes how she looks at Full."),
  ("palette: (window.JESTER_PALETTE || []).concat(FOX_COLOURS) });", "});      // the 56 colours every witch shares: her own page's note says she needs no more"),
  ("chip($('foes'), 'All cast at once', () => { if (mode.kind === 'fight') units.forEach((u, i) => castAt(u, 'borrowed_face', i)); });", "chip($('foes'), 'All cast at once', () => { if (mode.kind === 'fight') units.forEach((u, i) => castAt(u, 'crescent', i)); });"),
  ("const TURN_MOVES = ['hemline_fangs', 'blue_mischief', 'same_cloth', 'hemline_fangs', 'crazy_quilt', 'slip_stitch', 'moons_little_lie'];", "const TURN_MOVES = ['crescent', 'thorn', 'salve', 'crescent', 'cradle', 'thorn', 'garden'];"),
  ("u.hitSeen = u.J.state.hitN || 0; u.J.play(id, true);", "u.hitSeen = u.J.state.hitN || 0; u.J.standIns = false; u.J.play(id, true, true);      // in a fight a move plays once, and her training dummy and friends stay away"),
  ("u.aim = Math.atan2(-dz, dx);", "u.aim = Math.atan2(dx, dz); /* Io casts straight ahead */"),
  ("nextTurn = time + 2.6; } }", "nextTurn = time + 5.2; } }"),
  ("    state = 'idle'; wbTo = rbTo = 0; move = id; for (const u of units) u.J.play(id, true); press();", "    state = 'idle'; wbTo = rbTo = 0; move = id; for (const u of units) { u.J.standIns = true; u.J.play(id, true); } press();\n    if (SPELLS[id]) { viewAz = id === 'garden' ? 0.10 : id === 'cradle' ? -0.6 : -1.02; viewEl = id === 'garden' ? 0.20 : 0.08; sideOn = true; } else if (sideOn) { viewAz = 0; viewEl = 0.10; sideOn = false; }"),
  ("  let viewAz = null, viewEl = null;", "  let viewAz = null, viewEl = null, sideOn = false;"),
  ("      orbit.target.x += (camX - orbit.target.x) * Math.min(1, dt * 5); orbit.target.z += (0 - orbit.target.z) * Math.min(1, dt * 5); }", "      orbit.target.x += (0 - orbit.target.x) * Math.min(1, dt * 5); orbit.target.z += (camX - orbit.target.z) * Math.min(1, dt * 5); }      // her spells reach forward, not sideways"),
  ("orbit.target.y += ((tyWant * (1 - faceMode) + 1.57 * faceMode) - orbit.target.y)      // her face and all of her hair * Math.min(1, dt * 4);", "orbit.target.y += ((tyWant * (1 - faceMode) + 1.53 * faceMode) - orbit.target.y) * Math.min(1, dt * 4);      // her face under her hat"),
  ("['Points of cloth to work out', (s) => big(s.pts)], ", ""),
  ("if (o.parent && o.parent.visible === false) return; calls++;", "for (let p = o.parent; p; p = p.parent) if (p.visible === false) return; calls++;"),
  ("const count = (o) => { if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.index) return; const n = o.geometry.index.count / 3;", "const count = (o) => { if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.index || (o.material && o.material.visible === false)) return; const n = Math.min(o.geometry.index.count, o.geometry.drawRange.count) / 3; if (!(n > 0)) return;"),      # what her spells bring lies several groups deep, hidden until a spell shows it
  ("['Time to work out her pose and cloth, each picture, on this device',", "['Time to work out her pose, each picture, on this device',"),
], 'page script')
open(W + 'lodpage_io.js', 'w', encoding='utf-8').write(js)
t = open(FW + 'lod_fox.tpl.html', encoding='utf-8').read()
a = t.index('  <p class="notes"><b>The fight test</b>'); b = t.index('</div>\n<!--SCRIPTS-->')
t = t[:a] + """  <p class="notes"><b>The fight test</b> is the real question: four witches at once (four Ios stand in for the four), in the night square, with a crowd of foes. They take turns; a spell chip makes the next one cast it. <b>All cast at once</b> plays Harvest Crescent on all four. Her spells land a step in front of her, where her own page stands a training dummy; here the dummy is left out, so a spell falls short of the foe it is aimed at. The foes are plain hooded stand-ins of about 2,000 triangles each, so real foes will cost more than these. Try <b>Four at Full</b> last: it is the heavy one, and a phone may refuse it.</p>
  <div class="notes"><b>What each level gives up.</b>
    <ul>
      <li><b>Full</b> is the model as it is on her own page.</li>
      <li><b>Trim</b> has half the rings in every part and a face thinned again. Her hair's 160 ribbons are four-sided, not six, with fewer steps along each. Her hands are built on a coarser grid. No boot stitches or eyelets.</li>
      <li><b>Light</b> makes each hair ribbon flat and a little wider, lying outward with most of its turning taken out. Every other part is thinned again, her jewellery and laces most of all. Her boots and glasses are thinned only a little.</li>
      <li><b>Lightest</b> keeps seven in ten of her hair ribbons, wider still. Her own painted face, hands, arms, bodice, skirt, robe, boots, hat, book, sickle and glasses stay. Her belt gear, beads, laces, soles and socks give up their own finish and share one of three plain materials: matte, glossy or metal. No nails.</li>
    </ul>
  </div>
  <p class="notes">Nothing about how she moves changes between levels: the same skeleton, the same moves and the same spells. She wears no cloth that has to be worked out point by point (her robe, sleeves, hair and hat hang on bones), so her pose costs the same little at every level. Her cost is triangles: her hair first, then her face and hands. <b>What her spells bring is not thinned:</b> the Guardian, the garden, the thorns and the rest are about 94,000 triangles in over two hundred pieces, the same at every level, drawn only while a spell shows them. Switches: <b>Flipbook look</b> redraws her in the flipbook's colours with an inked outline; with it on, two sliders appear: <b>Pixel size</b> opens at 1.2 mm of her to a pixel and goes from the flipbook's own size down to as fine as this screen, and <b>Colours</b> goes from smooth to the flipbook's own; <b>Glow</b> lets bright things shine; <b>Shadows</b> turns her real shadow on and off.</p>
""" + t[b:]
t = swap(t, [
  ("<title>Fox Witch 3D: how light can she go</title>", "<title>Io 3D: how light can she go</title>"),
  ("<h1>Fox Witch 3D</h1>", "<h1>Io 3D</h1>"),
  ('aria-label="The Fox Witch drawn at four levels of detail.', 'aria-label="Io drawn at four levels of detail.'),
  ('<section aria-label="Her spells"><p class="label">Spells</p>', '<section aria-label="Her spells and reactions"><p class="label">Spells and reactions</p>'),
      # (the pixel slider opens at 1.2 mm in the Fox's template already)
], 'template')
open(W + 'lod_io.tpl.html', 'w', encoding='utf-8').write(t)
order = ['three.js', 'meshopt.js', 'palette.js', 'stage_lod.js', 'square.js', 'io_tex.js', 'io_lod.js', 'lod_io.js', 'lodpage_io.js']
parts = ['<script>' + open(W + f, encoding='utf-8').read().replace('</script', '<\\/script') + '</script>' for f in order]
h = t.replace('<!--SCRIPTS-->', '\n'.join(parts))
out = sys.argv[1] if len(sys.argv) > 1 else W + 'out/index.html'
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(h); print(out, len(h))
