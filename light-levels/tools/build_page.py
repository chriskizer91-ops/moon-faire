# Joins the template and the scripts into one file that needs nothing else.
import sys
W='/home/claude/work/'
order=['three.js','meshopt.js','palette.js','stage_lod.js','square.js','tex.js','jester_lod.js','lod.js','lodpage.js']
parts=[]
for f in order:
    s=open(W+f,encoding='utf-8').read()
    assert '</script' not in s.lower(), f
    parts.append('<script>'+s+'</script>')
h=open(W+'lod.tpl.html',encoding='utf-8').read().replace('<!--SCRIPTS-->','\n'.join(parts))
out=sys.argv[1] if len(sys.argv)>1 else W+'out/index.html'
import os; os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w',encoding='utf-8').write(h); print(out, len(h))
