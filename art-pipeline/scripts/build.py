from PIL import Image
import numpy as np, json, os, io, base64
from scipy import ndimage as nd
meta=json.load(open("frames/meta.json"))
CAST={"A04","A05","B01","B10"}|{f"{t}{i:02d}" for t in "CD" for i in range(13,19)}|{f"K{i:02d}" for i in range(1,49)}|{f"O{i:02d}" for i in range(1,25)}|{f"S{i:02d}" for i in range(1,17)}|{f"{t}{i:02d}" for t in "GRHF" for i in range(24)}|{f"{t}{i:02d}" for t in "UVEMNPQXYJLT" for i in range(1,30)}
os.makedirs("hd",exist_ok=True); os.makedirs("px",exist_ok=True)
frames={}
# 1) clean strays
for tag,fr in meta.items():
    for m in fr:
        im=np.array(Image.open(f"frames/{m['name']}.png")).astype(float)
        a=im[...,3]>12
        lab,n=nd.label(a,structure=np.ones((3,3)))
        sizes=nd.sum(a,lab,range(1,n+1)); main=np.argmax(sizes)+1
        dist=nd.distance_transform_edt(lab!=main)
        keep=np.zeros_like(a)
        for k in range(1,n+1):
            comp=lab==k
            if k==main or (m['name'] in CAST and sizes[k-1]>20 and im[comp][:,:3].max(-1).mean()>110) or (sizes[k-1]>250 and dist[comp].min()<20): keep|=comp
        im[...,3]*=keep
        frames[m['name']]=dict(img=im.astype(np.uint8),fx=m['footX'],fy=m['footY'],set=tag)
# per-set scale so both sets have the same body height
def grp(n):
    t,i=n[0],int(n[1:])
    if t in "CD": return t+("side" if i<8 else "front")
    if t=="A": return "Aside" if 6<=i<=12 else "A"
    if t in "KOSW": return t
    return t
hts={}
for t,fr in meta.items():
    for m in fr: hts.setdefault(grp(m['name']),[]).append(m['footY']-m['bodyTop'])
G={g:np.percentile(v,25) for g,v in hts.items()}
# same character, same scale: match each group to the original sheet's matching view
REF={"X":G["A"],"Y":G["A"],"J":G["A"],"L":G["A"],"T":G["A"],"M":G["A"],"N":G["A"],"P":G["A"],"Q":G["A"],"U":G["A"],"V":G["A"],"E":G["A"],"I":G["A"],"G":G["A"],"R":G["A"],"H":G["A"],"F":G["A"],"K":G["A"],"O":G["A"],"S":G["A"],"W":G["A"],"A":G["A"],"Aside":G["Aside"],"B":G["B"],"Cside":G["Aside"],"Cfront":G["A"],"Dside":G["Aside"],"Dfront":G["A"]}
H={g:G[g]*G["A"]/REF[g] for g in G}     # effective height after normalising to set A
H["K"]=2*H["Cfront"]                      # in-between sets are stored at 2x of their key sheet
H["M"]=H["G"]; H["N"]=H["G"]; H["P"]=H["G"]; H["Q"]=H["G"]
H["U"]=H["G"]; H["V"]=H["G"]; H["E"]=H["G"]; H["I"]=H["A"]   # cut + scaled onto their own keys
H["R"]=H["G"]; H["H"]=H["G"]; H["F"]=H["G"]
for t in "XYJLT": H[t]=H["G"]   # smoothed sequences: cut + scaled onto their own keys   # all four drawn on one shared scale; keep their true relative heights
H["O"]=2*H["A"]; H["S"]=2*H["A"]; H["W"]=2*H["Cside"]
print("groups",{k:round(v) for k,v in G.items()})
TARGET_PX=128   # pixel-art body height (hat top to sole)
out={"frames":{}}
for name,f in frames.items():
    im=f['img']; s=TARGET_PX/H[grp(name)]
    # ---- HD: keep native res, normalize scale to set A
    sh=H['A']/H[grp(name)]
    hd=Image.fromarray(im,"RGBA")
    if abs(sh-1)>0.01: hd=hd.resize((round(hd.width*sh),round(hd.height*sh)),Image.LANCZOS)
    hd.save(f"hd/{name}.webp",lossless=True,quality=100,method=6)
    # ---- pixel: premultiplied area downscale
    a=im[...,3:4]/255.0; pm=np.concatenate([im[...,:3]*a,a*255],-1).astype(np.float32)
    w2,h2=max(1,round(im.shape[1]*s)),max(1,round(im.shape[0]*s))
    ch=[np.array(Image.fromarray(pm[...,c]).resize((w2,h2),Image.BOX)) for c in range(4)]
    A=ch[3]/255.0; rgb=np.stack(ch[:3],-1)/np.maximum(A[...,None],1e-4)
    alpha=(A>0.45)
    frames[name].update(px_rgb=np.clip(rgb,0,255),px_a=alpha,pfx=f['fx']*s,pfy=f['fy']*s,hfx=f['fx']*sh,hfy=f['fy']*sh,hw=hd.width,hh=hd.height)
# 2) shared palette over all pixel frames
from skimage.color import rgb2lab, lab2rgb
from scipy.cluster.vq import kmeans2
def boost(rgb):
    # downscaling averages colors toward mud; restore saturation + a touch of contrast
    hsv=np.array(Image.fromarray(np.clip(rgb,0,255).astype(np.uint8)).convert('HSV')).astype(float)
    hsv[...,1]=np.clip(hsv[...,1]*1.18,0,255); hsv[...,2]=np.clip((hsv[...,2]-128)*1.06+132,0,255)
    return np.array(Image.fromarray(hsv.astype(np.uint8),'HSV').convert('RGB')).astype(float)
for f in frames.values(): f['px_rgb']=boost(f['px_rgb'])
allpix=np.concatenate([f['px_rgb'][f['px_a']] for f in frames.values()])/255.0
lab=rgb2lab(allpix.reshape(-1,1,3)).reshape(-1,3)
chroma=np.hypot(lab[:,1],lab[:,2])
rng=np.random.default_rng(1)
w=1+chroma/12          # oversample saturated colors so purple/teal/gold survive
idx=rng.choice(len(lab),size=60000,p=w/w.sum())
cent,_=kmeans2(lab[idx],56,minit='++',seed=2,iter=30)
pal=np.clip(lab2rgb(cent.reshape(-1,1,3)).reshape(-1,3)*255,0,255).round()
pal_lab=cent
def q(rgb):
    L=rgb2lab(np.clip(rgb,0,255)/255.0)
    d=((L[...,None,:]-pal_lab[None,None])**2).sum(-1); return pal[d.argmin(-1)].astype(np.uint8)
# 3) cells
left=max(f['pfx'] for f in frames.values()); right=max(f['px_rgb'].shape[1]-f['pfx'] for f in frames.values())
up=max(f['pfy'] for f in frames.values()); down=max(f['px_rgb'].shape[0]-f['pfy'] for f in frames.values())
CW=int(np.ceil(max(left,right)))*2+2; CH=int(np.ceil(up+down))+2; AY=int(np.ceil(up))+1
print("pixel cell",CW,CH,"anchor y",AY)
names=sorted(frames); cols=10; rows=int(np.ceil(len(names)/cols))
sheet=np.zeros((rows*CH,cols*CW,4),np.uint8)
for i,nm in enumerate(names):
    f=frames[nm]; rgb=q(f['px_rgb']); a=f['px_a']
    cell=np.zeros((CH,CW,4),np.uint8)
    ox=int(round(CW/2-f['pfx'])); oy=int(round(AY-f['pfy']))
    h,w=a.shape
    sub=cell[oy:oy+h,ox:ox+w]; sub[...,:3][a]=rgb[a]; sub[...,3][a]=255
    Image.fromarray(cell,"RGBA").save(f"px/{nm}.png")
    r,c=divmod(i,cols); sheet[r*CH:(r+1)*CH,c*CW:(c+1)*CW]=cell
    out["frames"][nm]=dict(x=c*CW,y=r*CH,w=CW,h=CH,hdFootX=f['hfx'],hdFootY=f['hfy'],hdW=f['hw'],hdH=f['hh'])
Image.fromarray(sheet,"RGBA").save("jester_witch_spritesheet.png")
Image.fromarray(sheet,"RGBA").resize((sheet.shape[1]*4,sheet.shape[0]*4),Image.NEAREST).save("jester_witch_spritesheet_4x.png")
out.update(cell=dict(w=CW,h=CH,anchorX=CW//2,anchorY=AY),palette=pal.tolist())
def ALL(t): return [m["name"] for m in meta[t]]
def KEYS(t):   # the original 8 key poses inside a smoothed sequence (the 8-frame draft)
    out_, seen = [], set()
    for m in meta[t]:
        if m.get("src", "new") != "new" and m["src"] not in seen: seen.add(m["src"]); out_.append(m["name"])
    return out_
out["animations"]={
 "walk_right":dict(frames=[f"C{i:02d}" for i in range(8)],fps=10,loop=True),
 "walk_left":dict(frames=[f"C{i:02d}" for i in range(8)],fps=10,loop=True,flip=True),
 "walk_toward":dict(frames=["C08","C09","C10","C11"],fps=2,loop=True),
 "ranger_draw":dict(frames=[f"R{i:02d}" for i in range(0,8)],fps=6,loop=True),
 "ranger_arrow":dict(frames=[f"R{i:02d}" for i in range(8,16)],fps=6,loop=True),
 "ranger_ward":dict(frames=[f"R{i:02d}" for i in range(16,24)],fps=6,loop=True),
 "witch_crescent":dict(frames=[f"H{i:02d}" for i in range(0,8)],fps=6,loop=True),
 "witch_salve":dict(frames=[f"H{i:02d}" for i in range(8,16)],fps=6,loop=True),
 "witch_guardian":dict(frames=[f"H{i:02d}" for i in range(16,24)],fps=6,loop=True),
 "fox_fangs":dict(frames=[f"F{i:02d}" for i in range(0,8)],fps=6,loop=True),
 "fox_mischief":dict(frames=[f"F{i:02d}" for i in range(8,16)],fps=6,loop=True),
 "fox_face":dict(frames=[f"F{i:02d}" for i in range(16,24)],fps=6,loop=True),
 "jester_rebuke":dict(frames=[f"G{i:02d}" for i in range(0,8)],fps=4,loop=True),
 "jester_hush":dict(frames=[f"G{i:02d}" for i in range(8,16)],fps=2,loop=True),
 "jester_gravity":dict(frames=[f"G{i:02d}" for i in range(16,24)],fps=5,loop=True),
 "witch_crescent_v2":dict(frames=KEYS("M"),fps=6,loop=True),
 "witch_salve_v2":dict(frames=KEYS("N"),fps=6,loop=True),
 "witch_guardian_v2":dict(frames=KEYS("P"),fps=6,loop=True),
 "fox_fangs_v2":dict(frames=KEYS("Q"),fps=6,loop=True),
 "witch_crescent12":dict(frames=ALL("M"),fps=6,loop=True),
 "witch_salve22":dict(frames=ALL("N"),fps=6,loop=True),
 "witch_guardian22":dict(frames=ALL("P"),fps=6,loop=True),
 "fox_fangs12":dict(frames=ALL("Q"),fps=6,loop=True),
 "fox_mischief22":dict(frames=ALL("X"),fps=6,loop=True),
 "fox_face22":dict(frames=ALL("Y"),fps=6,loop=True),
 "ranger_draw10":dict(frames=ALL("J"),fps=6,loop=True),
 "ranger_arrow10":dict(frames=ALL("L"),fps=6,loop=True),
 "ranger_ward11":dict(frames=ALL("T"),fps=4,loop=True),
 "jester_hush29":dict(frames=[f"U{i:02d}" for i in range(1,30)],fps=6,loop=True),
 "jester_gravity15":dict(frames=[f"V{i:02d}" for i in range(1,16)],fps=9,loop=True),
 "jester_rebuke_v2":dict(frames=[f"E{i:02d}" for i in range(1,9)],fps=4,loop=True),
 "idle_breath":dict(frames=[f"I{i:02d}" for i in range(1,9)],fps=4,loop=True),
 "walk_right16":dict(frames=[f"W{i:02d}" for i in range(1,17)],fps=6,loop=True),
 "walk_left16":dict(frames=[f"W{i:02d}" for i in range(1,17)],fps=6,loop=True,flip=True),
 "cast_orb24":dict(frames=[f"O{i:02d}" for i in range(1,25)],fps=5,loop=True),
 "skyward16":dict(frames=[f"S{i:02d}" for i in range(1,17)],fps=2,loop=True),
 "cast48":dict(frames=[f"K{i:02d}" for i in range(1,49)],fps=6,loop=True),
 "cast":dict(frames=["C12","C13","C14","C15","C15","C16","C17","C17","C18","C19","C12","C12"],fps=8,loop=True),
 "walk_right_b":dict(frames=[f"D{i:02d}" for i in range(8)],fps=10,loop=True),
 "walk_toward_b":dict(frames=["D08","D09","D10","D11"],fps=6,loop=True),
 "cast_b":dict(frames=["D12","D13","D14","D15","D15","D16","D17","D17","D18","D19","D12","D12"],fps=8,loop=True),
 "idle_front":dict(frames=["A00","A01","A00","A03","A02","A03"],fps=5,loop=True),
 "walk_away":dict(frames=["A13","A14","A15","A16","A17","A18"],fps=3,loop=True),
 "turnaround":dict(frames=["A00","A19","A12","A16","A06","A00"],fps=3,loop=True),
 "cast_orb":dict(frames=["A00","A19","A04","A04","A04","A19"],fps=4,loop=True),
 "cast_skyward":dict(frames=["A00","A05","A05","A05"],fps=3,loop=True),
 "alt_cast":dict(frames=["B00","B01","B01","B00","B10","B10"],fps=3,loop=True),
 "alt_turn":dict(frames=["B00","B08","B04","B06","B07","B05","B09"],fps=3,loop=True),
}
json.dump(out,open("jester_witch_spritesheet.json","w"),indent=1)
print(sheet.shape)
