import sys
from PIL import Image
out=sys.argv[1]; scale=float(sys.argv[2]); names=sys.argv[3:]
ims=[Image.open(n).convert('RGB') for n in names]
W=sum(i.width for i in ims);H=max(i.height for i in ims);c=Image.new('RGB',(W,H),(56,48,67));x=0
for i in ims: c.paste(i,(x,0)); x+=i.width
c=c.resize((int(W*scale),int(H*scale)),Image.LANCZOS);c.save(out);print(out,c.size)
