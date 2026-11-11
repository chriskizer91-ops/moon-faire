# One self-contained HTML file: three.js, the flipbook frames, the baked textures and the model all inlined.
import base64, glob, json, os
S='/home/claude/work/out/site/'; h=open(S+'index.html').read()
three=open('/home/claude/work/node_modules/three/build/three.min.js').read()
fb={os.path.basename(f)[:-5]:'data:image/webp;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob(S+'fb/*.webp'))}
def inline(h, tag, js):
    assert tag in h, tag
    return h.replace(tag, '<script>'+js.replace('</script','<\\/script')+'</script>')
h=inline(h,'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', three+'\n;window.FBDATA='+json.dumps(fb,separators=(',',':'))+';')
h=inline(h,'<script src="jester_tex.js"></script>', open(S+'jester_tex.js').read())
h=inline(h,'<script src="jester.js"></script>', open(S+'jester.js').read())
os.makedirs('/home/claude/work/deliver',exist_ok=True); p='/home/claude/work/deliver/Jester_Witch_3D.html'; open(p,'w').write(h); print(p, round(len(h)/1e6,2),'MB', len(fb),'frames')
