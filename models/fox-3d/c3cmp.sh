#!/bin/bash
# usage: c3cmp.sh prefix [yawsign]
# Her bare head (no hair, ears or glasses) from the front, at 45 degrees and in profile, beside sheet C3's three panels at one scale (C3's pixels x2).
# Top row: C3. Middle: the model with her face painted on. Bottom: the model in plain skin, to judge the shape alone. Lines: eyes, nose tip, lip line, under the chin.
cd /home/claude/fox3d && S=${2:--1} && V="0.19851,680,760" && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.stage.camera.far = 300; T.step(40, 1/60); T.clean("color"); T.only(["face", "skin"]); r(1); }, 1500))' \
 "pf:T.view(0,0,60,1.5374,$V)" "pq:T.view($S*Math.PI/4,0,60,1.5374,$V)" "ps:(T.j.root.position.z = -0.05, T.view($S*Math.PI/2,0,60,1.5374,$V))" \
 "cf:(T.j.debug.meshes.face.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xd79680).convertSRGBToLinear(), roughness: 0.62, skinning: true }), T.view(0,0,60,1.5374,$V))" "cq:(T.j.root.position.z = 0, T.view($S*Math.PI/4,0,60,1.5374,$V))" "cs:(T.j.root.position.z = -0.05, T.view($S*Math.PI/2,0,60,1.5374,$V))" 2>&1 | tail -1
python3 -I - $1 <<'PY'
import sys, json
from PIL import Image, ImageDraw
W = '/home/claude/fox3d/'; HM = json.load(open(W + 'meas/fox_head.json')); c3 = Image.open(W + 'refs/C3.png').convert('RGB'); n = sys.argv[1]
cen = [HM['cx'], 742, HM['cRef'] - 82]; sh = Image.new('RGB', (2040, 2280), (20, 18, 26))
for i, c in enumerate(cen): sh.paste(c3.crop((int(c - 170), 230, int(c + 170), 610)).resize((680, 760), Image.LANCZOS), (i * 680, 0))
for j, row in enumerate(('p', 'c')):
    for i, v in enumerate('fqs'): sh.paste(Image.open(W + f'shots/{n}_{row}{v}.png').convert('RGB').resize((680, 760)), (i * 680, 760 * (j + 1)))
d = ImageDraw.Draw(sh); R = HM['rows']
for k in range(3):
    for r, colr in ((HM['eyeRow'], (0, 255, 255)), (R['tip'], (255, 255, 0)), (HM['mouthRow'], (0, 255, 255)), (R['men'], (255, 160, 60))):
        y = k * 760 + (r - 230) * 2; d.line([(0, y), (2040, y)], fill=colr)
    for i in range(3): d.line([(i * 680 + 340, k * 760), (i * 680 + 340, k * 760 + 760)], fill=(255, 110, 110))
sh.resize((1500, 1676), Image.LANCZOS).save(W + f'shots/{n}_c3cmp.jpg', quality=86)
PY
