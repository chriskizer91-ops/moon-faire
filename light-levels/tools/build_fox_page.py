# Joins the Fox's template and scripts into one file that needs nothing else.
import sys, os
W='/home/claude/foxw/'
order=['three.js','meshopt.js','palette.js','stage_lod.js','square.js','fox_tex.js','fox_lod.js','lod_fox.js','lodpage_fox.js']
parts=[]
for f in order:
    s=open(W+f,encoding='utf-8').read().replace('</script','<\\/script')
    parts.append('<script>'+s+'</script>')
h=open(W+'lod_fox.tpl.html',encoding='utf-8').read().replace('<!--SCRIPTS-->','\n'.join(parts))
out=sys.argv[1] if len(sys.argv)>1 else W+'out/index.html'
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w',encoding='utf-8').write(h); print(out, len(h))
