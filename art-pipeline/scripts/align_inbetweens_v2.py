# Align generated in-betweens to their keys, cut them out, and register them as frames <TAG>01..
import cv2, numpy as np, json, sys
from PIL import Image
from scipy import ndimage as nd
SRC="/home/claude/sprites/frames"; BG=np.array([56,48,67.])
def mask(a):
    d=np.sqrt(((a-BG)**2).sum(-1)); m=d>28; m[:16]=m[-16:]=False; m[:,:16]=m[:,-16:]=False
    m=nd.binary_opening(m); lab,n=nd.label(m); sz=nd.sum(m,lab,range(1,n+1)); return lab==(np.argmax(sz)+1)
def region_box(a,r):
    ys,xs=np.nonzero(mask(a)); sole=ys.max(); hk=sole-ys.min()
    y0,y1=int(sole-r[0]*hk),int(sole-r[1]*hk)
    band=(ys>y0)&(ys<y1); cx=int(np.median(xs[band])); w=int(r[2]*hk)
    return y0,y1,cx-w,cx+w
def match(key,frm,r):
    y0,y1,x0,x1=region_box(key,r); tpl=cv2.cvtColor(key[y0:y1,x0:x1].astype(np.uint8),cv2.COLOR_RGB2GRAY)
    g=cv2.cvtColor(frm.astype(np.uint8),cv2.COLOR_RGB2GRAY); best=(-2,); cyc,cxc=(y0+y1)/2,(x0+x1)/2
    for s in np.arange(0.90,1.101,0.01):
        t=cv2.resize(tpl,None,fx=s,fy=s,interpolation=cv2.INTER_AREA)
        if t.shape[0]>=g.shape[0] or t.shape[1]>=g.shape[1]: continue
        r_=cv2.matchTemplate(g,t,cv2.TM_CCOEFF_NORMED); H,W=r_.shape; yy,xx=np.mgrid[0:H,0:W]
        r_=np.where((abs(yy-(cyc-t.shape[0]/2))<70)&(abs(xx-(cxc-t.shape[1]/2))<70),r_,-2)
        v=float(r_.max())
        if v>best[0]: py,px=np.unravel_index(r_.argmax(),r_.shape); best=(v,float(s),px+t.shape[1]/2-cxc,py+t.shape[0]/2-cyc)
    return best
def run(tag,fdir,slots,nb,side=False):
    flat={m['name']:m for t in json.load(open(SRC+"/meta.json")).values() for m in t}
    keys=sorted(set(slots))
    L=max(flat[k]['footX'] for k in keys); R=max(Image.open(f"{SRC}/{k}.png").width-flat[k]['footX'] for k in keys)
    U=max(flat[k]['footY'] for k in keys)
    half=int(max(L,R))+12; AY=int(U)+16; AX2,AY2=2*half,2*AY
    # face+collar, belt+bodice, boots (boots skipped for walks: the feet are what moves)
    REG=[(0.86,0.70,0.10),(0.60,0.40,0.13)]+([] if side else [(0.11,-0.01,0.19)])
    step=nb+1; N=len(slots)*step; names=[f"f{i:02d}.png" for i in range(1,N+1)]
    load=lambda f: np.array(Image.open(f"{fdir}/{f}").convert("RGB")).astype(np.float32)
    out=[]; rep=[]
    for i,f in enumerate(names):
        g,o=divmod(i,step); a=load(f); H,W,_=a.shape
        if o:
            t=o/step; ka,kb=names[step*g],names[(step*g+step)%N]; A=load(ka); B=load(kb)
            ests=[]
            for K,wk in ([(A,1-t),(B,t)] if slots[g]!=slots[(g+1)%len(slots)] else [(A,1.0)]):
                for r in REG: e=match(K,a,r); ests.append((*e,wk))
            Wt=np.array([max(e[0],0.05)**4*e[4] for e in ests]); Wt/=Wt.sum()
            s=sum(w*e[1] for w,e in zip(Wt,ests)); dx=sum(w*e[2] for w,e in zip(Wt,ests)); dy=sum(w*e[3] for w,e in zip(Wt,ests))
            rep.append((f,round(max(e[0] for e in ests),2),round(s,3),round(dx,1),round(dy,1)))
            k=1/s; M=np.array([[k,0,AX2-k*(AX2+dx)],[0,k,AY2-k*(AY2+dy)]],np.float32)
            a=cv2.warpAffine(a,M,(W,H),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_CONSTANT,borderValue=tuple(map(float,BG)))
        a[:16]=BG; a[-16:]=BG; a[:,:16]=BG; a[:,-16:]=BG
        d=np.sqrt(((a-BG)**2).sum(-1)); m=nd.binary_opening(d>22); lab,n=nd.label(m); sz=nd.sum(m,lab,range(1,n+1)); main=lab==(np.argmax(sz)+1)
        filled=nd.binary_fill_holes(nd.binary_closing(main,iterations=3))
        alpha=np.maximum(np.clip((d-9)/24,0,1),filled*1.0)
        cl,cn=nd.label(alpha>0.05,structure=np.ones((3,3))); dist=nd.distance_transform_edt(~main); keep=np.zeros_like(main)
        for k_,sl in enumerate(nd.find_objects(cl)):
            comp=cl[sl]==k_+1; px=a[sl][comp]
            if dist[sl][comp].min()<6 or (px.max(-1).mean()>110 and (px.max(-1)-px.min(-1)).mean()>40 and comp.sum()>6): keep[sl]|=comp
        alpha*=keep
        soft=(alpha>0.02)&(alpha<0.98); aa=np.maximum(alpha,1e-3)[...,None]
        a=np.where(soft[...,None],np.clip((a-BG*(1-aa))/aa,0,255),a)
        ys,xs=np.nonzero(alpha>0.05); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        name=f"{tag}{i+1:02d}"; Image.fromarray(np.dstack([a,alpha*255]).clip(0,255).astype(np.uint8)[y0:y1,x0:x1],"RGBA").save(f"{SRC}/{name}.png")
        out.append(dict(name=name,footX=float(AX2-x0),footY=float(AY2-y0),bodyTop=int(np.nonzero(main)[0].min()-y0),srcScale=2))
    meta=json.load(open(SRC+"/meta.json")); meta[tag]=out; json.dump(meta,open(SRC+"/meta.json","w"),indent=1)
    for r in rep: print(tag,*r)
if __name__=="__main__":
    run("O","Orb/cast_orb/frames",["A00","A19","A04","A04","A04","A19"],3)
    run("S","Skyward/skyward/frames",["A00","A05","A05","A05"],3)
    run("W","Walk/walk/frames",[f"C{i:02d}" for i in range(8)],1,side=True)
