from PIL import Image, ImageDraw, ImageFont
import json, os
SRC="/home/claude/sprites/frames"; meta={m['name']:m for t in json.load(open(SRC+"/meta.json")).values() for m in t}
BG=(56,48,67,255); font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",24)
def strip(cells, out, wide=1.0):
    """cells: list of (frame_name or None, label)"""
    ks=[c for c,_ in cells if c]
    L=max(meta[k]['footX'] for k in ks); R=max(Image.open(f"{SRC}/{k}.png").width-meta[k]['footX'] for k in ks)
    U=max(meta[k]['footY'] for k in ks); D=max(Image.open(f"{SRC}/{k}.png").height-meta[k]['footY'] for k in ks)
    half=int(max(L,R)*wide)+14; W=2*half; AY=int(U*1.08)+14; H=AY+int(D)+12; S=2 if W<300 else 1.5
    img=Image.new("RGBA",(len(cells)*W+(len(cells)-1)*14,H+40),BG); d=ImageDraw.Draw(img)
    for i,(k,lab) in enumerate(cells):
        x=i*(W+14)
        if k: im=Image.open(f"{SRC}/{k}.png"); img.alpha_composite(im,(x+int(half-meta[k]['footX']),int(AY-meta[k]['footY'])))
        else: d.rectangle([x+5,5,x+W-5,H-5],outline=(90,80,108),width=2)
        d.text((x+W//2,H+20),lab,fill=(200,190,215),font=font,anchor="mm")
    img=img.convert("RGB"); img=img.resize((int(img.width*S),int(img.height*S)),Image.NEAREST); img.save(out)
os.makedirs("pack/hush",exist_ok=True); os.makedirs("pack/gravity",exist_ok=True); os.makedirs("pack/idle",exist_ok=True); os.makedirs("pack/gilded_rebuke_redo",exist_ok=True); os.makedirs("pack/reference",exist_ok=True)
# Hush: 8 keys G08..G15 -> 3 between each -> 29 frames
H=[f"G{i:02d}" for i in range(8,16)]
for g in range(7):
    a,b=H[g],H[g+1]; fa=4*g+1
    strip([(a,f"{fa:02d} key")]+[(None,f"{fa+j:02d}") for j in (1,2,3)]+[(b,f"{fa+4:02d} key")], f"pack/hush/gap_{g+1:02d}_{a}-to-{b}.png")
# Gravity: G16..G23 -> 1 between each -> 15 frames
G=[f"G{i:02d}" for i in range(16,24)]
for g in range(7):
    a,b=G[g],G[g+1]; fa=2*g+1
    strip([(a,f"{fa:02d} key"),(None,f"{fa+1:02d}"),(b,f"{fa+2:02d} key")], f"pack/gravity/gap_{g+1:02d}_{a}-to-{b}.png", wide=1.0)
# Idle: one full breath between two copies of her standing pose
strip([("A00","01 key")]+[(None,f"{j:02d}") for j in range(2,9)]+[("A00","09 = 01")], "pack/idle/idle_breath.png")
# Gilded Rebuke redo: keep both ends, redraw the six swing poses with room for the chain
strip([("G00","01 key")]+[(None,f"{j:02d}") for j in range(2,8)]+[("G07","08 key")], "pack/gilded_rebuke_redo/rebuke_redo.png", wide=1.9)
import shutil; shutil.copy("/mnt/user-data/uploads/1000041193.png","pack/reference/jester_sheet_style_and_scale.png")
shutil.copy("/home/claude/gen3/jester.png","pack/reference/jester_moves_sheet.png")
print(sorted(os.listdir("pack/hush"))[:2], os.listdir("pack/idle"))
