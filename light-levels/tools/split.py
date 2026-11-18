import re,sys
s=open(sys.argv[1],encoding='utf-8').read()
out=sys.argv[2]
i=0;n=0
for m in re.finditer(r'<script([^>]*)>(.*?)</script>',s,re.S):
    body=m.group(2)
    name=f'{out}/s{n:02d}.js'
    open(name,'w',encoding='utf-8').write(body)
    print(n,m.start(),len(body),repr(m.group(1)),repr(body[:150]))
    n+=1
# html without scripts
h=re.sub(r'<script([^>]*)>(.*?)</script>',lambda m:'<script>/*SCRIPT*/</script>',s,flags=re.S)
open(out+'/page.html','w').write(h)
