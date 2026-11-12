# One self-contained HTML file: three.js, her baked paintings and the model all inlined.
import os
S='/home/claude/fox3d/out/site/'; h=open(S+'index.html').read()
three=open('/home/claude/fox3d/node_modules/three/build/three.min.js').read()
def inline(h, tag, js):
    assert tag in h, tag
    return h.replace(tag, '<script>'+js.replace('</script','<\\/script')+'</script>')
h=inline(h,'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', three)
h=inline(h,'<script src="fox_tex.js"></script>', open(S+'fox_tex.js').read())
h=inline(h,'<script src="fox.js"></script>', open(S+'fox.js').read())
os.makedirs('/home/claude/fox3d/deliver',exist_ok=True); p='/home/claude/fox3d/deliver/Fox_Witch_3D.html'; open(p,'w').write(h); print(p, round(len(h)/1e6,2),'MB')
