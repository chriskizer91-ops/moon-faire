from PIL import Image; import numpy as np, json, base64, os
s=np.array(Image.open('jester_witch_spritesheet.png').convert('RGBA')); m=s[...,3]>0
cols,inv=np.unique(s[m][:,:3],axis=0,return_inverse=True)
idx=np.zeros(s.shape[:2],np.uint8); idx[m]=inv.ravel()+1
im=Image.fromarray(idx,'P'); im.putpalette([0,0,0]+cols.ravel().tolist())
im.save('jester_witch_spritesheet.png',optimize=True,transparency=0)
im.resize((im.width*4,im.height*4),Image.NEAREST).save('jester_witch_spritesheet_4x.png',optimize=True,transparency=0)
d=json.load(open("jester_witch_spritesheet.json"))
b64=lambda b,mm:f"data:{mm};base64,"+base64.b64encode(b).decode()
hd={n[:-5]:"hd/"+n for n in sorted(os.listdir("hd"))}   # frames ship as files beside the page
meta={k:d[k] for k in ("frames","cell","animations","palette")}
t=open("flipbook_template.html").read()
t=t.replace("/*HD*/{}",json.dumps(hd)).replace("/*SHEET*/","jester_witch_spritesheet.png").replace("/*META*/{}",json.dumps(meta))
open("jester_witch_flipbook.html","w").write(t)
print(len(d['frames']),"frames; html",os.path.getsize("jester_witch_flipbook.html"))
