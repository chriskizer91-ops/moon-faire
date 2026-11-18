#!/bin/bash
# builds out/purple: a copy of the night square page (every move, spell and switch; viewer/app.js unchanged) with the purple glow
# of her October animation laid over her moves (viewer/purple.js). The night square page itself (build_site.sh) is not changed.
cd /home/claude/work && ./build.sh >/dev/null && rm -rf out/purple && mkdir -p out/purple && cp -r out/fb out/purple/fb && cp out/jester.js out/purple/jester.js && cp out/jester_tex.js out/purple/jester_tex.js && python3 - <<'PY'
t=open('viewer/index.tpl.html').read()
def swap(t, a, b):
    assert a in t, a
    return t.replace(a, b)
t=swap(t,'<title>Jester Witch 3D: the night square</title>','<title>Jester Witch Purple Glow</title>')
t=swap(t,'<p class="sub">The New Moon performer of the Moon Faire in 3D, in the night square, with every move she had before and her moves from the lore.</p>',
  '<p class="sub">The New Moon performer of the Moon Faire in 3D, in the night square, with every move and spell, and the purple glow of her first animation laid over them.</p>')
t=swap(t,'<script>/*APP*/</script>','<script>/*APP*/</script>\n<script>/*PURPLE*/</script>')
note=('<p class="notes"><b>Purple glow</b> is the light of her first animation (October), put on the 3D model: it gathers in her hands as a spell '
      'builds, flares when the blow lands, lights her body and her heart, and pools violet on the ground. She glows a little standing and a little more in a dance. '
      'The switch turns it off to compare, and <b>Strength</b> sets how much. Every move, spell and switch from the night square page is here unchanged.</p>\n</div>')
i=t.rindex('</div>'); t=t[:i]+note+t[i+6:]
t=t.replace('/*PAL*/',open('out/palette.js').read()).replace('/*FB*/','const FB='+open('out/fb.json').read()+';').replace('/*STAGE*/',open('viewer/stage.js').read()).replace('/*SQUARE*/',open('viewer/square.js').read()).replace('/*APP*/',open('viewer/app.js').read()).replace('/*PURPLE*/',open('viewer/purple.js').read())
open('out/purple/index.html','w').write(t)
# a local copy for testing, with three.js from disk
open('out/purple/test_local.html','w').write(t.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../../node_modules/three/build/three.min.js'))
print('purple page built', len(t))
PY
node --check out/purple/jester.js && ls out/purple | head -6
