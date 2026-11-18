# compares her painted profile (07, side view) with the model's midline; prints z (mm, forward) by height
import numpy as np, json, sys, os
from PIL import Image
from scipy import ndimage as ndi
from playwright.sync_api import sync_playwright
T=json.loads(open('/home/claude/work/out/jester_tex.js').read()[len('window.JESTER_TEX='):-1]); LAY=T['layout']
h7=np.asarray(Image.open('/home/claude/work/in/07_head_views.png').convert('RGB')).astype(np.float32); X0,X1,Y0p,Y1p=1130,1400,262,620; c7=h7[Y0p:Y1p,X0:X1]
skinm=(c7[...,0]>118)&(c7[...,0]-c7[...,2]>22)&(c7[...,0]>c7[...,1]); skinm=ndi.binary_fill_holes(ndi.binary_closing(skinm,np.ones((9,9),bool)))
lab,nl=ndi.label(skinm); skinm=lab==(1+np.argmax(ndi.sum(skinm,lab,range(1,nl+1))))
edge=np.array([np.argmax(r) if r.any() else 9999 for r in skinm],float)
tip=int(np.argmin(edge[100:175])+100)
SPM=1500.0; ZTIP,YTIP=0.1157,LAY['noseY']+0.001
rows=np.where(edge<9000)[0]
paint={}
for r in rows:
    Y=YTIP-(r-tip)/SPM; z=ZTIP-(edge[r]-edge[tip])/SPM; paint[round(Y,4)]=z
# lower edge of the jaw in the painting: for each column behind the chin, the lowest skin row
cols=np.where(skinm.any(0))[0]; under=[]
for c in cols:
    rr=np.where(skinm[:,c])[0]; under.append((ZTIP-(c-edge[tip])/SPM, YTIP-(rr[-1]-tip)/SPM))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg=b.new_page(); pg.goto('file:///home/claude/work/test.html'+os.environ.get('Q','')); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    pts=pg.evaluate('''(()=>{const g=T.j.debug.meshes.face.geometry.attributes.position, o=[]; for(let i=0;i<g.count;i++){ if(Math.abs(g.getX(i))<0.0006 && g.getZ(i)>0.0) o.push([g.getY(i),g.getZ(i)]); } return o;})()''')
    silh=pg.evaluate('''(()=>{const g=T.j.debug.meshes.face.geometry.attributes.position, m={}; for(let i=0;i<g.count;i++){ const k=Math.round(g.getZ(i)*250); const y=g.getY(i); if(m[k]===undefined||y<m[k]) m[k]=y; } return m;})()''')
    b.close()
pts.sort(key=lambda q:-q[0])
print('  Y      painted  model   diff(mm)   [z forward, mm]')
ys=sorted(paint.keys(),reverse=True); my=np.array([q[0] for q in pts]); mz=np.array([q[1] for q in pts])
for Y in ys[::6]:
    j=int(np.argmin(np.abs(my-Y))); print('%.4f  %6.1f  %6.1f  %+5.1f'%(Y,paint[Y]*1000,mz[j]*1000,(mz[j]-paint[Y])*1000))
print('lowest point of the head by depth: z(mm)  painted-Y  model-Y')
for z,Y in under[::12]:
    k=str(int(round(z*250))); print('%6.1f  %.4f  %s'%(z*1000,Y,('%.4f'%silh[k]) if k in silh else '-'))
print('layout',LAY)
