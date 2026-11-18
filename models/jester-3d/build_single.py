# One self-contained HTML file: three.js, the flipbook frames, the baked textures and the model all inlined.
# usage: build_single.py            the night square page -> deliver/Jester_Witch_3D.html
#        build_single.py game       her game moves page   -> deliver/Jester_Witch_3D_game_moves.html
#        build_single.py purple     the night square page with the purple glow -> deliver/Jester_Witch_3D_purple_glow.html
import base64, glob, json, os, sys
KIND=sys.argv[1] if len(sys.argv)>1 else ''; GAME=KIND=='game'
S='/home/claude/work/out/'+{'game':'game/','purple':'purple/'}.get(KIND,'site/'); h=open(S+'index.html').read()
three=open('/home/claude/work/node_modules/three/build/three.min.js').read()
fb={os.path.basename(f)[:-5]:'data:image/webp;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob(S+'fb/*.webp'))}
def inline(h, tag, js):
    assert tag in h, tag
    return h.replace(tag, '<script>'+js.replace('</script','<\\/script')+'</script>')
h=inline(h,'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', three+'\n;window.FBDATA='+json.dumps(fb,separators=(',',':'))+';')
h=inline(h,'<script src="jester_tex.js"></script>', open(S+'jester_tex.js').read())
h=inline(h,'<script src="jester.js"></script>', open(S+'jester.js').read())
os.makedirs('/home/claude/work/deliver',exist_ok=True); p='/home/claude/work/deliver/'+{'game':'Jester_Witch_3D_game_moves.html','purple':'Jester_Witch_3D_purple_glow.html'}.get(KIND,'Jester_Witch_3D.html'); open(p,'w').write(h); print(p, round(len(h)/1e6,2),'MB', len(fb),'frames')
