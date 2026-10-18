# Generic in-between pack: keys lined up on torso + soles, one strip template per gap.
from PIL import Image, ImageDraw, ImageFont
import json, os, sys, shutil
SRC="/home/claude/sprites/frames"; meta={m['name']:m for t in json.load(open(SRC+"/meta.json")).values() for m in t}
BG=(56,48,67,255)
def build(name, slots, nb, out):
    shutil.rmtree(out,ignore_errors=True); os.makedirs(out+"/keys"); os.makedirs(out+"/gap_templates")
    keys=sorted(set(slots)); step=nb+1; N=len(slots)*step
    L=max(meta[k]['footX'] for k in keys); R=max(Image.open(f"{SRC}/{k}.png").width-meta[k]['footX'] for k in keys)
    U=max(meta[k]['footY'] for k in keys); D=max(Image.open(f"{SRC}/{k}.png").height-meta[k]['footY'] for k in keys)
    half=int(max(L,R))+12; CW=half*2; AY=int(U)+16; CH=AY+int(D)+12; S=2
    def cell(k):
        c=Image.new("RGBA",(CW,CH),BG)
        if k: im=Image.open(f"{SRC}/{k}.png"); c.alpha_composite(im,(int(round(half-meta[k]['footX'])),int(round(AY-meta[k]['footY']))))
        return c.resize((CW*S,CH*S),Image.NEAREST).convert("RGB")
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",28)
    for i,k in enumerate(slots): cell(k).save(f"{out}/keys/f{step*i+1:02d}_key_{k}.png")
    for g in range(len(slots)):
        a,b=slots[g],slots[(g+1)%len(slots)]; fa=step*g+1; fb=(step*g+step)%N+1
        cells=[(a,f"{fa:02d} key")]+[(None,f"{fa+j:02d}") for j in range(1,nb+1)]+[(b,f"{fb:02d} key")]
        strip=Image.new("RGB",(CW*S*len(cells)+16*(len(cells)-1),CH*S+44),BG[:3]); d=ImageDraw.Draw(strip)
        for j,(k,lab) in enumerate(cells):
            x=j*(CW*S+16); strip.paste(cell(k),(x,0))
            if k is None: d.rectangle([x+6,6,x+CW*S-6,CH*S-6],outline=(90,80,108),width=2)
            d.text((x+CW*S//2,CH*S+20),lab,fill=(200,190,215),font=font,anchor="mm")
        strip.save(f"{out}/gap_templates/gap_{g+1:02d}_f{fa:02d}-f{fb:02d}_{a}-to-{b}.png")
    return N
