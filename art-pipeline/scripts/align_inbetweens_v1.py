# Register each generated in-between to its two keys using the rigid belt/bodice area,
# so holds don't jitter and motions don't drift.
import cv2, numpy as np, json, os
from PIL import Image
from scipy import ndimage as nd
BG=np.array([56,48,67.])
def load(f): return np.array(Image.open(f'all/{f}').convert('RGB')).astype(np.float32)
def mask(a):
    d=np.sqrt(((a-BG)**2).sum(-1)); m=d>28; m[:16]=m[-16:]=False; m[:,:16]=m[:,-16:]=False
    m=nd.binary_opening(m); lab,n=nd.label(m); sz=nd.sum(m,lab,range(1,n+1)); return lab==(np.argmax(sz)+1)
# three rigid-ish regions: face+collar, belt+bodice, boots
REGIONS=[(0.86,0.70,60),(0.60,0.40,75),(0.11,-0.01,110)]
def region_box(a,r):
    ys,xs=np.nonzero(mask(a)); sole=ys.max()
    y0,y1=int(sole-r[0]*591),int(sole-r[1]*591)
    band=(ys>y0)&(ys<y1); cx=int(np.median(xs[band]))
    return y0,y1,cx-r[2],cx+r[2]
def match(key,frm,r):
    y0,y1,x0,x1=region_box(key,r); tpl=cv2.cvtColor(key[y0:y1,x0:x1].astype(np.uint8),cv2.COLOR_RGB2GRAY)
    g=cv2.cvtColor(frm.astype(np.uint8),cv2.COLOR_RGB2GRAY); best=(-2,)
    cyc,cxc=(y0+y1)/2,(x0+x1)/2
    for s in np.arange(0.90,1.101,0.01):
        t=cv2.resize(tpl,None,fx=s,fy=s,interpolation=cv2.INTER_AREA)
        r=cv2.matchTemplate(g,t,cv2.TM_CCOEFF_NORMED)
        # restrict search to +-70px around the key's position
        H,W=r.shape; yy,xx=np.mgrid[0:H,0:W]
        exp_y=cyc-t.shape[0]/2; exp_x=cxc-t.shape[1]/2
        r=np.where((abs(yy-exp_y)<70)&(abs(xx-exp_x)<70),r,-2)
        v=r.max()
        if v>best[0]:
            py,px=np.unravel_index(r.argmax(),r.shape); best=(v,s,px+t.shape[1]/2-cxc,py+t.shape[0]/2-cyc)
    return best  # score, scale, dx, dy (centre shift)
names=[f'f{i:02d}.png' for i in range(1,49)]
out={}
for i,f in enumerate(names):
    g,o=divmod(i,4)
    if o==0: out[f]=dict(s=1.0,dx=0.0,dy=0.0,score=1.0); continue
    ka,kb=names[4*g],names[(4*g+4)%48]; t=o/4
    A=load(ka); B=load(kb); F=load(f)
    ests=[]
    for K,wk in ([(A,1-t),(B,t)] if kb!=ka else [(A,1.0)]):
        for r in REGIONS:
            e=match(K,F,r); ests.append((float(e[0]),float(e[1]),float(e[2]),float(e[3]),wk))
    W=np.array([max(e[0],0.05)**4*e[4] for e in ests]); W/=W.sum()
    s=float(sum(w*e[1] for w,e in zip(W,ests))); dx=float(sum(w*e[2] for w,e in zip(W,ests))); dy=float(sum(w*e[3] for w,e in zip(W,ests)))
    out[f]=dict(s=s,dx=dx,dy=dy,score=max(e[0] for e in ests),best=[round(v,3) for v in max(ests)[:4]])
    print(f,{k:(round(v,3) if isinstance(v,float) else v) for k,v in out[f].items()})
json.dump(out,open('align.json','w'),indent=1)
