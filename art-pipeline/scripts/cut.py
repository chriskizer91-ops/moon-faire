# Cut every sheet into transparent frames aligned on the boot soles.
from PIL import Image
import numpy as np, json, os, sys
from scipy import ndimage as nd
SHEETS=[("A","/mnt/user-data/uploads/1000041193.png",[6,7,7]),
        ("B","/mnt/user-data/uploads/1000041191.png",[6,5]),
        ("C","sheetC.png",[8,4,8]),
        ("D","sheetD.png",[8,4,8])]
import sys as _sys
if len(_sys.argv)>1:   # cut only the named extra sheets: TAG=path ...
    SHEETS=[(a.split('=')[0],a.split('=')[1],[8,8,8]) for a in _sys.argv[1:]]
def bands(p,th,minlen):
    on=p>th; out=[];s=None
    for i,v in enumerate(on):
        if v and s is None:s=i
        if not v and s is not None:
            if i-s>minlen: out.append((s,i))
            s=None
    if s is not None: out.append((s,len(on)))
    return out
os.makedirs("frames",exist_ok=True); meta=json.load(open('frames/meta.json')) if len(_sys.argv)>1 else {}
STAGE=np.array([56.,48.,67.])
for tag,path,nper in SHEETS:
    img=np.array(Image.open(path).convert("RGB")).astype(float); H,W,_=img.shape
    b=np.concatenate([img[:4].reshape(-1,3),img[-4:].reshape(-1,3),img[:,:4].reshape(-1,3),img[:,-4:].reshape(-1,3)])
    bg=np.median(b,0); d=np.sqrt(((img-bg)**2).sum(-1)); m=nd.binary_opening(d>22)
    lum=img.mean(-1)
    # ground shadow = darker than the backdrop, same hue, and flat. Glossy black boots are dark but not flat.
    lstd=np.sqrt(np.maximum(nd.uniform_filter(lum**2,5)-nd.uniform_filter(lum,5)**2,0))
    shadow=(lum<bg.mean()-4)&(lum>12)&(np.abs(img[...,2]-img[...,0]-(bg[2]-bg[0]))<14)&(lstd<5)
    # printed frame numbers: neutral light-grey marks sitting on plain backdrop
    neutral=(img.min(-1)>120)&(img.max(-1)-img.min(-1)<30)
    tl,tn=nd.label(nd.binary_dilation(neutral,iterations=2))
    labels=np.zeros_like(neutral)
    for k,sl_ in enumerate(nd.find_objects(tl)):
        comp=tl[sl_]==k+1
        if comp.sum()>1500: continue
        ring=nd.binary_dilation(comp,iterations=4)&~comp
        if d[sl_][ring].mean()<30: labels[sl_]|=comp
    if len(_sys.argv)>1: labels[:]=False   # new sheets carry no printed numbers; silver bows and shields must survive
    img[labels]=bg; d[labels]=0
    body=nd.binary_opening(m&~shadow)
    rb=[r for r in bands(m.mean(1),0.002,60)]
    rp=nd.uniform_filter1d(body.mean(1),15)
    while len(rb)<len(nper):     # rows touching (e.g. sparkles): split the tallest band at its emptiest line
        i=max(range(len(rb)),key=lambda i:rb[i][1]-rb[i][0]); r0,r1=rb[i]; q=(r1-r0)//4
        c=r0+q+int(np.argmin(rp[r0+q:r1-q])); rb[i:i+1]=[(r0,c),(c,r1)]
    assert len(rb)==len(nper),(tag,rb)
    boxes=[]
    for ri,(r0,r1) in enumerate(rb):
        sub=body[r0:r1-30]; prof=nd.uniform_filter1d(sub.sum(0).astype(float),9)
        nz=np.nonzero(prof>2)[0]; L,R=int(nz[0]),int(nz[-1]); n=nper[ri]
        exp=(R-L)/n; cuts=[]
        for k in range(1,n):   # search the valley near each expected boundary
            c0=int(L+k*exp); lo,hi=int(c0-exp*0.35),int(c0+exp*0.35)
            cuts.append(lo+int(np.argmin(prof[lo:hi])))
        edges=[max(0,L-8)]+cuts+[min(W,R+8)]
        for i in range(n): boxes.append(dict(row=ri,x0=edges[i],x1=edges[i+1],y0=max(0,r0-6),y1=min(H,r1+6)))
    lab,n=nd.label(body); sizes=nd.sum(body,lab,range(1,n+1))
    owner=np.zeros(lab.shape,int); Y,X=np.mgrid[0:H,0:W]
    for j,bx in enumerate(boxes): owner[(Y>=bx['y0'])&(Y<bx['y1'])&(X>=bx['x0'])&(X<bx['x1'])]=j+1
    # main body per box = biggest body component whose centroid is inside the box;
    # if two figures touch (boot to boot), split that component at the cut line
    cents=nd.center_of_mass(body,lab,range(1,n+1))
    claims={}
    for k in np.argsort(-sizes):
        if sizes[k]<4000: break
        cy,cx=cents[k]
        for j,bx in enumerate(boxes):
            if bx['y0']<=cy<bx['y1'] and bx['x0']<=cx<bx['x1']: claims.setdefault(j,k+1)
    shared={}
    for j,k in claims.items(): shared[k]=shared.get(k,0)+1
    lab=lab.copy(); nxt=lab.max()+1
    if len(_sys.argv)>1:
        # touching figures (an outstretched arm or effect reaching the next pose): split the shared
        # component by GEODESIC distance from each figure's torso, so a limb stays with the body it grows from
        from skimage.graph import MCP_Geometric
        groups={}
        for j,bx in enumerate(boxes):
            k=claims.get(j)
            if k is not None and shared[k]>1: groups.setdefault(k,[]).append(j)
        for k,js in groups.items():
            comp=lab==k; ys,xs=np.nonzero(comp); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
            sub=comp[y0:y1,x0:x1]; cost=np.where(sub,1.0,np.inf)
            costs=[]
            for j in js:
                bx=boxes[j]; cx=(bx['x0']+bx['x1'])//2-x0
                rows=np.nonzero(sub.any(1))[0]; top,bot=rows.min(),rows.max(); h=bot-top
                seed=[(r,c) for r in range(int(top+.35*h),int(top+.55*h),3) for c in range(max(0,cx-12),min(sub.shape[1],cx+12),3) if sub[r,c]]
                if not seed: seed=[(r,c) for r in range(sub.shape[0]) for c in [min(max(cx,0),sub.shape[1]-1)] if sub[r,c]][:20]
                m=MCP_Geometric(cost); cc,_=m.find_costs(seed); costs.append(cc)
            pick=np.argmin(np.stack(costs),0)
            for i,j in enumerate(js):
                part=np.zeros_like(comp); part[y0:y1,x0:x1]=sub&(pick==i)&np.isfinite(costs[i])
                ll,ln=nd.label(part)
                if ln==0: continue
                ss=nd.sum(part,ll,range(1,ln+1)); lab[ll==(np.argmax(ss)+1)]=nxt; claims[j]=nxt; nxt+=1
    for j,bx in enumerate(boxes):
        k=claims.get(j)
        if k is None or (shared[k]>1 and len(_sys.argv)<=1):
            reg=(owner==j+1)&body
            ll,ln=nd.label(reg)
            if ln==0: continue
            ss=nd.sum(reg,ll,range(1,ln+1)); big=np.argmax(ss)+1
            lab[ll==big]=nxt; claims[j]=nxt; nxt+=1
    assert len(claims)==len(boxes),(tag,len(claims),len(boxes))
    mains=claims
    for j,k in mains.items(): owner[(lab==k)]=j+1
    alpha_key=np.clip((d-9)/24,0,1); out=[]
    if len(_sys.argv)>1:
        # Effects that reach into a neighbour's space stay whole: every soft component goes to the
        # nearest figure; a component touching two figures is split pixel-by-pixel by distance.
        dists=np.stack([nd.distance_transform_edt(lab!=mains[j]) for j in range(len(boxes))])
        soft_l,sn=nd.label(alpha_key>0.05,structure=np.ones((3,3)))
        owner=np.zeros(lab.shape,int)
        for k,sl_ in enumerate(nd.find_objects(soft_l)):
            comp=soft_l[sl_]==k+1
            dd=dists[(slice(None),)+sl_][:,comp]          # (frames, pixels)
            inside=[j for j in range(len(boxes)) if (dd[j]==0).any()]
            if len(inside)==1: owner[sl_][comp]=inside[0]+1
            elif len(inside)>1:
                cand=np.array(inside); pick=cand[np.argmin(dd[cand],axis=0)]
                sub=owner[sl_]; sub[comp]=pick+1; owner[sl_]=sub
            else:
                near=dd.min(1); j=int(np.argmin(near))
                if near[j]<260: owner[sl_][comp]=j+1
    for j,bx in enumerate(boxes):
        own=owner==j+1; bm=(lab==mains[j])|(body&own)
        bm=bm&nd.binary_dilation(lab==mains[j],iterations=60)
        bys,bxs=np.nonzero(lab==mains[j]); fb=bys.max()
        hgt=fb-bys.min(); band=(bys>bys.min()+0.30*hgt)&(bys<bys.min()+0.55*hgt)
        fx=float(np.median(bxs[band]))      # anchor x on the torso so walk cycles play in place
        closed=nd.binary_closing(bm,iterations=3); filled=nd.binary_fill_holes(closed)
        if len(_sys.argv)>1:   # big holes that are just backdrop (inside a bow, between arm and body) stay open
            hl,hn=nd.label(filled&~closed)
            for k,sl_ in enumerate(nd.find_objects(hl)):
                hc=hl[sl_]==k+1
                if hc.sum()>600 and d[sl_][hc].mean()<20: filled[sl_][hc]=False
        a=np.where(own,alpha_key,0); a=np.maximum(a,filled*1.0)
        a[fb+22:]=0                         # drop number labels under the shadow
        btop=bys.min()
        a[:btop][shadow[:btop]]=0           # neighbour row's ground shadow poking in from above
        mx=img.max(-1); mn=img.min(-1); sat=(mx-mn)/np.maximum(mx,1)
        # dark flat specks above the head belong to the row above
        cl,cn=nd.label(a>0.05)
        for k,sl_ in enumerate(nd.find_objects(cl)):
            if sl_[0].stop<btop-4:
                cm=cl[sl_]==k+1
                if lum[sl_][cm].mean()<bg.mean()+12: a[sl_][cm]=0
        ys,xs=np.nonzero(a>0.05); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        # 1) nudge this sheet's backdrop (seen through the sheer veils) to one shared stage colour
        # 2) un-mix the backdrop from soft edge pixels so no purple halo shows on other backgrounds
        cimg=img+(STAGE-bg)*np.clip(1-d/50,0,1)[...,None]
        soft=(a>0.02)&(a<0.98)
        aa=np.maximum(a,1e-3)[...,None]
        fg=(cimg-STAGE*(1-aa))/aa
        cimg=np.where(soft[...,None],np.clip(fg,0,255),cimg)
        rgba=np.dstack([cimg,a*255]).clip(0,255).astype(np.uint8)[y0:y1,x0:x1]
        name=f"{tag}{j:02d}"; Image.fromarray(rgba,"RGBA").save(f"frames/{name}.png")
        out.append(dict(name=name,footX=fx-x0,footY=float(fb-y0),bodyTop=int(bys.min()-y0)))
    meta[tag]=out; print(tag,len(out),[ (b['x0'],b['x1']) for b in boxes][:8])
json.dump(meta,open("frames/meta.json","w"),indent=1)
for tag in [t for t,_,_ in SHEETS]:
    fr=meta[tag]; ims=[Image.open(f"frames/{m['name']}.png") for m in fr]
    Wc=sum(i.width for i in ims)+10*len(ims); Hc=max(i.height for i in ims)
    cs=Image.new("RGBA",(Wc,Hc+16),(235,235,235,255)); x=0
    from PIL import ImageDraw; dr=ImageDraw.Draw(cs)
    for m,im in zip(fr,ims): cs.alpha_composite(im,(x,Hc-im.height)); dr.text((x+3,Hc+3),m['name'],fill=(0,0,0,255)); x+=im.width+10
    cs.save(f"contact_{tag}.png")
