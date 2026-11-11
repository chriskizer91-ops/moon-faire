# contact sheets of flipbook frames, aligned on the sole anchor
import json,sys
from PIL import Image,ImageDraw
M=json.load(open('/home/claude/work/ref/meta.json'))
def load(n):
    return Image.open(f'/home/claude/work/ref/hd/{n}.webp').convert('RGBA')
def sheet(names,out,cols=8,cw=300,ch=430,scale=1.0,bg=(56,48,67)):
    rows=(len(names)+cols-1)//cols
    W=int(cols*cw*scale);H=int(rows*(ch+14)*scale)
    im=Image.new('RGB',(cols*cw,rows*(ch+14)),bg);d=ImageDraw.Draw(im)
    for i,n in enumerate(names):
        f=load(n);m=M['frames'][n]
        cx=(i%cols)*cw+cw//2;cy=(i//cols)*(ch+14)+ch-8
        im.paste(f,(int(cx-m['hdFootX']),int(cy-m['hdFootY'])),f)
        d.text(((i%cols)*cw+4,(i//cols)*(ch+14)+ch),n,fill=(255,230,150))
    if scale!=1: im=im.resize((W,H),Image.LANCZOS)
    im.save(out);print(out,im.size)
if __name__=='__main__':
    R=lambda p,a,b:[f'{p}{i:02d}' for i in range(a,b+1)]
    sheet(R('K',15,21)+R('K',36,48),'shots/ref_K_b.png',cols=10,cw=330,ch=440,scale=0.5)
    sheet(R('U',14,29),'shots/ref_U_b.png',cols=8,cw=300,ch=420,scale=0.55)
    sheet(R('O',1,24),'shots/ref_O.png',cols=8,cw=300,ch=420,scale=0.55)
    sheet(R('E',1,8),'shots/ref_E.png',cols=8,cw=520,ch=420,scale=0.42)
    sheet(R('S',11,16)+['C08','C09','C10','C11']+R('I',1,8),'shots/ref_SCI.png',cols=9,cw=300,ch=420,scale=0.5)
    sheet(R('W',1,16),'shots/ref_W.png',cols=8,cw=300,ch=400,scale=0.5)
