# Bakes Chris's painted references into the texture pack the model loads: out/jester_tex.js
# Run with: python3 -I bake.py   (the paintings in in/ are data only)
import base64, io, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
IN='/home/claude/work/in/'; OUT='/home/claude/work/out/'
def uri(im, q=86):
    b=io.BytesIO(); im.save(b,'WEBP',quality=q,method=6); return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
def arr(im): return np.asarray(im.convert('RGB')).astype(np.float32)
def img(a): return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
T={}
# ---------------- the face ----------------
# Landmarks read off the paintings (pixels). The neutral face 08 sets the scale: eye line to lip line = 0.066 m.
EYE_Y, D_EM, S = 1.5246, 0.066, 1024
WIN=(-0.1,0.1,1.385,1.585)
N_EYE=((392,408),(856,408)); N_MOUTH=(624,912); N_LID=452; N_LIPTOP=850
PPM=(N_MOUTH[1]-N_EYE[0][1])/D_EM; CX=(N_EYE[0][0]+N_EYE[1][0])/2; K=S/0.2/PPM         # K: canvas pixels per painting pixel
def n2c(x,y): return ((x-CX)/PPM-WIN[0])/0.2*S, (WIN[3]-(EYE_Y-(y-N_EYE[0][1])/PPM))/0.2*S   # painting pixel -> canvas pixel
def warp(src, sx, tx, ty):       # canvas <- source, source = canvas*sx + t
    return src.convert('RGB').transform((S,S), Image.AFFINE, (sx,0,tx,0,sx,ty), Image.BICUBIC)
f8=Image.open(IN+'08_face_front.png')
x0,y0=n2c(0,0); base=arr(warp(f8, 1/K, -x0/K, -y0/K))
inside=arr(warp(Image.new('RGB',f8.size,(255,255,255)), 1/K, -x0/K, -y0/K))[...,0]>250
lum=base.mean(-1); grey=(base.max(-1)-base.min(-1)<34)&(lum<150); dark=(lum<78)|grey|~inside
k=int(0.0095*S/0.2)|1; big=ndi.binary_dilation(ndi.binary_opening(np.pad(dark,k,constant_values=True), np.ones((k,k),bool))[k:-k,k:-k]|~inside, iterations=4)   # the cap and backdrop, not the brows or liner
valid=(~big).astype(np.float32)
def fill(a, valid, sig):
    w=ndi.gaussian_filter(valid,sig)+1e-4; return np.stack([ndi.gaussian_filter(a[...,c]*valid,sig)/w for c in range(3)],-1), w
fx,fy=n2c(520,190); gx,gy=n2c(730,290); skin=np.median(base[int(fy):int(gy),int(fx):int(gx)].reshape(-1,3),0)
f1,w1=fill(base,valid,18); f2,w2=fill(base,valid,60); t1=np.clip(w1*3,0,1)[...,None]; t2=np.clip(w2*4,0,1)[...,None]
ext=f1*t1+(f2*t2+skin*(1-t2))*(1-t1)                       # skin carried outward from the face, fading to her plain skin tone
keep=ndi.gaussian_filter(ndi.binary_erosion(valid>0.5,iterations=9).astype(np.float32),7)[...,None]; base=base*keep+ext*(1-keep)
T['face']=uri(img(base),90); T['skin']='#%02x%02x%02x'%tuple(int(v) for v in skin)
T['skinJaw']='#%02x%02x%02x'%tuple(int(v) for v in np.median(base[742:819,358:666].reshape(-1,3),0))      # the tone along her jaw, for the plain skin under it and on the neck
ex=(N_EYE[1][0]-N_EYE[0][0])/2/PPM
T['layout']={'eyeY':EYE_Y,'eyeX':round(ex,4),'mouthY':round(EYE_Y-D_EM,4),'noseY':round(EYE_Y-(690-408)/PPM,4),'browY':round(EYE_Y+(408-315)/PPM,4),'chinY':round(EYE_Y-(1215-408)/PPM,4),'bandY':round(EYE_Y+(408-130)/PPM,4)}
T['faceEyes']=[[round(n2c(*N_EYE[i])[0]/S,4),round(n2c(*N_EYE[i])[1]/S,4)] for i in (0,1)]
print('ppm',round(PPM),'skin',T['skin'],T['layout'])
# expressions: only the eyes or the mouth are lifted from sheet 09 and set into the neutral face, so nothing else shifts when she blinks
f9=Image.open(IN+'09_face_expressions.png')
def rrect(x0,y0,x1,y1,fe):      # feathered box, in painting-08 pixels -> canvas mask
    (a,b),(c,d)=n2c(x0,y0),n2c(x1,y1); m=np.zeros((S,S),np.float32); f=fe*K; m[int(b+f):int(d-f),int(a+f):int(c-f)]=1; return np.clip(ndi.gaussian_filter(m,f/1.6)*1.0,0,1)
def patch(cell, pairs, boxes):
    # pairs: [(source point in sheet 09, target point in painting 08, scale 08-pixels per 09-pixel)], one per box
    lay=np.zeros((S,S,3),np.float32); al=np.zeros((S,S),np.float32)
    for (sp,tp,sc),bx in zip(pairs,boxes):
        cx,cy=n2c(*tp); s=1/(sc*K); w=arr(warp(f9, s, sp[0]-cx*s, sp[1]-cy*s)); m=rrect(*bx,24)
        ring=(m>0.05)&(m<0.5); w=w+(base[ring].mean(0)-w[ring].mean(0))                 # match the tone where the two paintings meet
        sel=(m>0.002)[...,None]; lay=np.where(sel,w,lay); al=np.maximum(al,m)
    ys,xs=np.where(al>0.01); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    rgba=np.dstack([np.clip(lay,0,255),al*255])[y0:y1,x0:x1].astype(np.uint8)
    b=io.BytesIO(); Image.fromarray(rgba,'RGBA').save(b,'WEBP',quality=90,method=6)
    return {'src':'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode(),'x':round(x0/S,4),'y':round(y0/S,4),'w':round((x1-x0)/S,4),'h':round((y1-y0)/S,4)}, lay, al
EB=[(150,350,548,628),(700,350,1098,628)]; MB=[(392,812,856,1082)]
P={}
P['shut'],l1,a1=patch('shut',[((202,240),(390,N_LID),470/226),((428,240),(860,N_LID),470/226)],EB)
P['half'],l2,a2=patch('half',[((627+208,627+243),(392,N_LID),464/225),((627+433,627+244),(856,N_LID),464/225)],EB)
P['oh'],l3,a3=patch('oh',[((627+317,415),(624,N_LIPTOP),464/230)],MB)
P['smile'],l4,a4=patch('smile',[((318,627+440),(624,N_MOUTH[1]),464/224)],MB)
T['faceParts']=P
# ---------------- fabric swatches ----------------
def quads(name, keys):
    im=Image.open(IN+name).convert('RGB'); W,H=im.size; i=int(W*0.035)
    for k,(qx,qy) in zip(keys,[(0,0),(1,0),(0,1),(1,1)]): T[k]=uri(im.crop((qx*W//2+i,qy*H//2+i,(qx+1)*W//2-i,(qy+1)*H//2-i)).resize((512,512),Image.LANCZOS),84)
quads('11_swatches_colour.png',['wine','olive','leggings','lace']); quads('12_swatches_black.png',['gauze','ruffle','satin','patent'])
# ---------------- the great veil, laid flat: straightened into a rectangle, its pointed hem kept as cut-out ----------------
v=arr(Image.open(IN+'10_veil_flat.png')); H,W=v.shape[:2]
cloth=((v[...,0]-v[...,1])>16)|(((v[...,0]+v[...,1])/2-v[...,2])>20); cloth=ndi.binary_opening(cloth,np.ones((3,3),bool)); cloth=ndi.binary_fill_holes(cloth)
rows=np.where(cloth.sum(1)>W*0.3)[0]; top,bot=rows.min()+3,np.where(cloth.sum(1)>4)[0].max()
L=np.array([np.argmax(cloth[y]) for y in range(H)]); R=np.array([W-1-np.argmax(cloth[y,::-1]) for y in range(H)])
wide=np.argmax((R-L)*(cloth.sum(1)>W*0.3)); ys=np.arange(top+10,wide-25); pl=np.polyfit(ys,L[ys],1); pr=np.polyfit(ys,R[ys],1)
print('veil rows',top,bot,'widest',wide,'edges at top',round(np.polyval(pl,top)),round(np.polyval(pr,top)),'at widest',round(np.polyval(pl,wide)),round(np.polyval(pr,wide)))
def rectify(y0,y1,OW,OH):
    jj,ii=np.mgrid[0:OH,0:OW]; t=jj/(OH-1.0); pts=y1>wide+5      # the pointed hem is pressed into the last seventh of the cloth, so the veil stays whole nearly to its end
    y=np.where(pts&(t>=0.86), wide+(y1-wide)*(t-0.86)/0.14, y0+(min(y1,wide)-y0)*np.minimum(t/(0.86 if pts else 1.0),1.0)); yc=np.minimum(y,wide)
    xl=np.polyval(pl,yc)+2; xr=np.polyval(pr,yc)-2; x=xl+ii/(OW-1)*(xr-xl)
    col=np.stack([ndi.map_coordinates(v[...,c],[y,x],order=1,mode='nearest') for c in range(3)],-1); m=ndi.map_coordinates(cloth.astype(np.float32),[y,x],order=1,mode='constant')
    return col,m
def veil(key,y0,y1,OW,OH):
    col,m=rectify(y0,y1,OW,OH); ok=(m>0.6).astype(np.float32); f,w=fill(col,ok,6); col=col*ok[...,None]+f*(1-ok[...,None])
    gold=np.clip(((col[...,0]+col[...,1])/2-col[...,2]-28)/80,0,1); a=np.clip(ndi.gaussian_filter(m,0.8)*1.6-0.3,0,1)*(0.66+0.34*gold)
    T[key]=uri(img(col),88); T[key+'A']=uri(img(np.repeat((a*255)[...,None],3,-1)),82); return col,a
vc,va=veil('veil',top,bot,768,1152); tc,ta=veil('veilTop',top,top+(wide-top)*0.5,512,256)
js='window.JESTER_TEX='+json.dumps(T,separators=(',',':'))+';'; open(OUT+'jester_tex.js','w').write(js); print('jester_tex.js',len(js)//1024,'KB')
# ---------------- check sheet ----------------
def comp(lay,al): return img(base*(1-al[...,None])+lay*al[...,None]).resize((384,384),Image.LANCZOS)
sh=Image.new('RGB',(384*5,384+384),(30,30,30)); tiles=[img(base).resize((384,384),Image.LANCZOS),comp(l1,a1),comp(l2,a2),comp(l3,a3),comp(l4,a4)]
ly=lambda ym:(WIN[3]-ym)/0.2*384
for i,t in enumerate(tiles):
    if i==0:
        d=ImageDraw.Draw(t)
        for ym,c in ((EYE_Y,(0,255,0)),(EYE_Y-D_EM,(0,255,255)),(T['layout']['chinY'],(255,255,0)),(T['layout']['bandY'],(255,0,255))): d.line([(0,ly(ym)),(60,ly(ym))],fill=c)
    sh.paste(t,(i*384,0))
x=0
for k in ['wine','olive','leggings','lace','gauze','ruffle','satin','patent']:
    t=Image.open(io.BytesIO(base64.b64decode(T[k].split(',')[1]))).convert('RGB').resize((150,150)); sh.paste(t,(x,384)); x+=150
sh.paste(img(vc*va[...,None]+np.array([56,48,67])*(1-va[...,None])).resize((256,384)),(1210,384)); sh.paste(img(np.repeat((va*255)[...,None],3,-1)).resize((256,384)),(1470,384))
sh.paste(img(tc).resize((384,192)),(0,540))
sh.save('/home/claude/work/shots/bake_check.png')

# ================= pass 2: the bodice, from painting 05 (front and back), as one atlas [front | back] =================
# Each row of the painted torso is stretched to the full width, so it fits the model's torso whatever their widths.
T=json.loads(open(OUT+'jester_tex.js').read()[len('window.JESTER_TEX='):-1])
b5=arr(Image.open(IN+'05_base_front_back.png')); H5,W5=b5.shape[:2]; bg=np.median(b5[:12,:12].reshape(-1,3),0)
r_,g_,b_=b5[...,0],b5[...,1],b5[...,2]
lum5=b5.mean(-1); flat=np.sqrt(np.maximum(ndi.uniform_filter(lum5**2,5)-ndi.uniform_filter(lum5,5)**2,0))<4.5
cand=(np.abs(r_-bg[0])<14)&(np.abs(g_-bg[1])<12)&(np.abs(b_-bg[2])<14)&flat
lab,nl=ndi.label(cand); edge=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])); backdrop=np.isin(lab,edge[edge>0])
backdrop=ndi.binary_dilation(backdrop,iterations=2)          # the flat backdrop, found from the picture's border inward
wine=(r_>b_*1.32)&(g_<r_*0.46)&(r_>62)
torso=ndi.binary_opening(~(backdrop|wine),np.ones((3,3),bool))
TY0,TY1=0.79,1.352
ANCH=[(1.04,392.0),(1.215,283.0),(1.33,225.0)]            # model height (m) <-> row in painting 05
def prow(y):
    if y<=ANCH[1][0]: (y0,p0),(y1,p1)=ANCH[0],ANCH[1]
    else: (y0,p0),(y1,p1)=ANCH[1],ANCH[2]
    return p0+(y-y0)/(y1-y0)*(p1-p0)
def centre(x_guess):
    rows=torso[330:380]; cols=np.where(rows[:,x_guess-70:x_guess+70].mean(0)>0.5)[0]; return x_guess-70+(cols.min()+cols.max())/2
def half(cx, OW=512, OH=768):
    cx=int(round(cx)); ext=[]
    for py in range(H5):
        row=torso[py]
        if not row[cx]: ext.append((cx-40,cx+40)); continue
        l=cx
        while l>0 and row[l-1]: l-=1
        r=cx
        while r<W5-1 and row[r+1]: r+=1
        ext.append((l,r))
    ext=np.array(ext,float); hw=ndi.median_filter(np.minimum(cx-ext[:,0],ext[:,1]-cx),size=9)       # the narrower side: pouches and props don't widen it
    belt=int(ANCH[0][1]); hw[belt+6:]=hw[belt-12:belt+2].mean(); hw[:318]*=0.87; hw=np.clip(hw,20,90); hw=ndi.gaussian_filter1d(hw,3.0)      # above the corset the run takes in the sleeve seams: trim them
    jj,ii=np.mgrid[0:OH,0:OW]; y=TY1-jj/(OH-1)*(TY1-TY0); py=np.vectorize(prow)(y[:,0])[:,None]*np.ones((1,OW)); py=np.clip(py,0,H5-1)
    h=np.interp(py[:,0],np.arange(H5),hw)[:,None]; px=cx+(ii/(OW-1)*2-1)*h
    col=np.stack([ndi.map_coordinates(b5[...,c],[py,px],order=1,mode='nearest') for c in range(3)],-1)
    ok=ndi.map_coordinates((~(backdrop|wine)).astype(np.float32),[py,px],order=1,mode='nearest'); okb=(ok>0.5).astype(np.float32)
    f,w=fill(col,okb,5); col=col*okb[...,None]+f*(1-okb[...,None]); return col, hw
cf=centre(410); cb=centre(1127); print('torso centres',cf,cb)
fr,hwf=half(cf); bk,hwb=half(cb); print('painted half-widths at belt/bust/shoulder: front',[round(float(hwf[int(p)]),1) for _,p in ANCH],'back',[round(float(hwb[int(p)]),1) for _,p in ANCH])
atlas=np.concatenate([fr,bk],1); T['body']=uri(img(atlas),90)
js='window.JESTER_TEX='+json.dumps(T,separators=(',',':'))+';'; open(OUT+'jester_tex.js','w').write(js); print('jester_tex.js',len(js)//1024,'KB')
img(atlas).save('/home/claude/work/shots/bake_body.png')

# ================= pass 3: hands (painting 16) and the sides of the face (profile in painting 07) =================
def flood_backdrop(a, tol=(14,12,14)):
    bgc=np.median(a[:12,:12].reshape(-1,3),0); l=a.mean(-1); fl=np.sqrt(np.maximum(ndi.uniform_filter(l**2,5)-ndi.uniform_filter(l,5)**2,0))<4.5
    cand=(np.abs(a[...,0]-bgc[0])<tol[0])&(np.abs(a[...,1]-bgc[1])<tol[1])&(np.abs(a[...,2]-bgc[2])<tol[2])&fl
    lab,_=ndi.label(cand); e=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])); return ndi.binary_dilation(np.isin(lab,e[e>0]),iterations=2)
# the hands picture is made by bake_hands.py (one continuous hand skin: five finger strips and two flat panels)
import importlib.util as _ilu; _sp=_ilu.spec_from_file_location('bake_hands','/home/claude/work/bake_hands.py'); bake_hands=_ilu.module_from_spec(_sp); _sp.loader.exec_module(bake_hands)
T['hands']=bake_hands.make('/home/claude/work/in3/hands_young_left.png', T.get('skin'), '/home/claude/work/shots/bake_hands.png')
hands=arr(Image.open('/home/claude/work/shots/bake_hands.png').resize((512,512)))
def samp(a,x,y): return np.stack([ndi.map_coordinates(a[...,c],[y,x],order=1,mode='nearest') for c in range(3)],-1)
# ---- profile ----
h7=arr(Image.open(IN+'07_head_views.png')); X0,X1,Y0p,Y1p=1130,1400,262,560; c7=h7[Y0p:Y1p,X0:X1]
skinm=(c7[...,0]>118)&(c7[...,0]-c7[...,2]>22)&(c7[...,0]>c7[...,1]); skinm=ndi.binary_fill_holes(ndi.binary_closing(skinm,np.ones((9,9),bool)))
lab,nl=ndi.label(skinm); skinm=lab==(1+np.argmax(ndi.sum(skinm,lab,range(1,nl+1))))
edge=np.array([np.argmax(r) if r.any() else 9999 for r in skinm],float)
tip=int(np.argmin(edge[100:175])+100); nas=int(np.argmax(np.where(edge[60:tip-20]<9000,edge[60:tip-20],-1))+60)
print('profile: nose tip row',tip+Y0p,'col',edge[tip]+X0,' nasion row',nas+Y0p,'col',edge[nas]+X0,' nose proud of nasion (mm)',round((edge[nas]-edge[tip])/1.5,1))
SPM=1500.0; ZTIP,YTIP=0.1157,T['layout']['noseY']+0.001; WINS=(-0.01,0.13,1.40,1.58); OW,OH=420,540
jj,ii=np.mgrid[0:OH,0:OW]; zz=WINS[0]+(ii+0.5)/OW*(WINS[1]-WINS[0]); yy=WINS[3]-(jj+0.5)/OH*(WINS[3]-WINS[2])
px=edge[tip]+(ZTIP-zz)*SPM; py=tip+(YTIP-yy)*SPM
col=samp(c7,px,py); m=ndi.map_coordinates(ndi.binary_erosion(skinm,iterations=9).astype(np.float32),[py,px],order=1,mode='constant')      # well inside the skin: the cap's edge and its stitches stay out
ed=np.interp(py[:,0],np.arange(len(edge)),np.where(edge<9000,edge,edge[tip]+200))[:,None]; behind=px-ed
def sms(a,b,x): t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
ex,ey=edge[nas]+34,nas+5; eye=sms(0.75,1.15,np.sqrt(((px-ex)/52)**2+((py-ey)/28)**2))
alpha=ndi.gaussian_filter(m,2.0)*sms(6,22,behind)*eye      # where the profile painting may be used at all; how much of it is used is set on the model, by which way the skin faces
okm=(m>0.9).astype(np.float32); fcol,_=fill(col,okm,8); col=col*okm[...,None]+fcol*(1-okm[...,None])
# tone: match the cheek of the front painting
cx0,cy0=n2c(CX+0.048*PPM,N_EYE[0][1]+(EYE_Y-1.485)*PPM); front_cheek=base[int(cy0)-25:int(cy0)+25,int(cx0)-20:int(cx0)+20].reshape(-1,3).mean(0)
sel=(alpha>0.9)&(np.abs(yy-1.485)<0.012); side_cheek=col[sel].mean(0) if sel.sum()>50 else front_cheek; g2=np.clip(front_cheek/side_cheek,0.70,1.20); print('side tone gain',np.round(g2,3),'opaque share',round(float((alpha>0.9).mean()),3))
T['faceSide']=uri(img(col*g2),90); T['faceSideA']=uri(img(np.repeat((alpha*255)[...,None],3,-1)),88); T['faceSideWin']=list(WINS)
js='window.JESTER_TEX='+json.dumps(T,separators=(',',':'))+';'; open(OUT+'jester_tex.js','w').write(js); print('jester_tex.js',len(js)//1024,'KB')
chk=Image.new('RGB',(512+420+420,540),(40,40,40)); chk.paste(img(hands),(0,0)); chk.paste(img(col*g2),(512,0)); chk.paste(img(col*g2*alpha[...,None]+np.array([0,255,0])*(1-alpha[...,None])),(932,0)); chk.save('/home/claude/work/shots/bake3.png')
