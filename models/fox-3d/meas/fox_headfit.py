# Turns her measured profile (meas/fox_profile.json, from sheet C3) into the head's tables and writes them into src/40_head.js.
# The head's own frame: eyes at 1.5246, mouth line at 1.4586 (0.066 below), z forward of the ear line, forehead 0.0985 at 1.555.
# run: python3 -I meas/fox_headfit.py        prints the landmarks; saves meas/fox_head.json for the face bake
import json, re, numpy as np
from scipy import ndimage as ndi
W = '/home/claude/fox3d/'; M = json.load(open(W + 'meas/fox_profile.json')); PPM = M['PPM']; EYE = 1.5246
pr = np.array(M['profile']); rows = pr[:, 0]; cols = pr[:, 1]
def at(r): return float(np.interp(r, rows, cols))
def amin(a, b): k = (rows >= a) & (rows <= b); return int(rows[k][np.argmin(cols[k])])
def amax(a, b): k = (rows >= a) & (rows <= b); return int(rows[k][np.argmax(cols[k])])
tip = M['tipRow']; nas = M['nasRow']; sn = amin(tip + 4, tip + 26); ul = amax(sn, sn + 30); st = amin(ul + 2, ul + 16); ll = amax(st + 1, st + 22); lm = amin(ll + 2, ll + 28); pg = amax(lm + 2, lm + 45)
k = rows > pg; men = int(rows[k][np.argmax(cols[k] < at(pg) - 30)])        # under the chin: where the line has fallen back 30 px from the point of the chin
print('profile rows  nasion', nas, 'tip', tip, 'under nose', sn, 'upper lip', ul, 'lip line', st, 'lower lip', ll, 'fold', lm, 'chin point', pg, 'under chin', men)
# the profile panel's lip line sits a little higher than the front panel's; stretch the rows between nose and chin so the two agree
fr = lambda r: np.interp(r, [0, sn, st, men, 2000], [0, sn, M['mouthRow'], men, 2000])
Yof = lambda r: EYE - (fr(r) - M['eyeRow']) / PPM
rowTop = M['eyeRow'] - (1.555 - EYE) * PPM; cRef = at(rowTop)
Zof = lambda r: 0.0985 + (at(r) - cRef) / PPM
L = {n: (round(float(Yof(r)), 4), round(float(Zof(r)), 4)) for n, r in (('nasion', nas), ('tip', tip), ('subnasale', sn), ('upperLip', ul), ('lipLine', st), ('lowerLip', ll), ('fold', lm), ('chinPoint', pg), ('underChin', men))}
print(L)
G = lambda d, w: np.exp(-(d / w) ** 2)
Ys = np.arange(L['underChin'][0] + 0.004, 1.5551, 0.0005); rr = np.interp(-Ys, -np.array([Yof(r) for r in rows]), rows); P = np.array([Zof(r) for r in rr])
P = ndi.gaussian_filter1d(P, 1.0)
eyeX = M['PD'] / 2 / PPM; browY = EYE + 0.0157; mouthY = EYE - 0.066
# lips and chin as bumps on a line drawn through the hollows either side of them
base = np.interp(Ys, [L['fold'][0], L['subnasale'][0]], [L['fold'][1], L['subnasale'][1]])
ua = L['upperLip'][1] - float(np.interp(L['upperLip'][0], Ys, base)); la = L['lowerLip'][1] - float(np.interp(L['lowerLip'][0], Ys, base))
LIPS = dict(uy=L['upperLip'][0], ua=round(max(0.002, ua * 0.92), 4), ly=L['lowerLip'][0], la=round(max(0.002, la * 0.92), 4), chinY=L['chinPoint'][0], cheekY=EYE - 0.0271, hollowY=EYE - 0.0576)
dmid = (0.0030 * G(0.027, 0.026) * G(Ys - (browY + 0.002), 0.008) - 0.0064 * G(eyeX, 0.017) * G(Ys - EYE, 0.0105) - 0.0026 * G(0.014, 0.007) * G(Ys - (EYE - 0.002), 0.010) + 0.0030 * G(eyeX, 0.0105) * G(Ys - EYE, 0.0066)
        - 0.0010 * G(Ys - (mouthY + 0.0135), 0.0055) + LIPS['ua'] * G(Ys - LIPS['uy'], 0.0054) + LIPS['la'] * G(Ys - LIPS['ly'], 0.0054) + 0.0026 * G(Ys - LIPS['chinY'], 0.0095))
band = (Ys > L['subnasale'][0]) & (Ys < L['nasion'][0]); B = P.copy(); B[band] = np.interp(Ys[band], [L['subnasale'][0], L['nasion'][0]], [L['subnasale'][1], L['nasion'][1]])
nose = np.clip(P - B, 0, None); mid = ndi.gaussian_filter1d(B - dmid, 2.0)
def table(y0, y1, n, f, dec=4):
    ys = np.linspace(y0, y1, n); return '[' + ', '.join('[%.4f, %.*f]' % (y, dec, float(np.interp(y, Ys, f))) for y in ys) + ']'
ymid = np.unique(np.round(np.concatenate([np.linspace(Ys[0], 1.555, 26), [L[k][0] for k in ('chinPoint', 'fold', 'lowerLip', 'lipLine', 'upperLip', 'subnasale', 'nasion')]]), 4))
FACE_MID = '[' + ', '.join('[%.4f, %.4f]' % (y, float(np.interp(y, Ys, mid))) for y in ymid) + ']'
yn = np.unique(np.round(np.concatenate([np.linspace(L['subnasale'][0], L['nasion'][0], 17), [L['tip'][0]]]), 4)); nv = np.interp(yn, Ys, nose); nv[0] = 0; nv[-1] = 0
NOSE = '[' + ', '.join('[%.4f, %.4f]' % (y, v) for y, v in zip(yn, nv)) + ']'
sh = L['tip'][0] - 0.0880                     # the Jester's nose-width table, moved to the height of her nose and stretched to its length
kk = (L['nasion'][0] - L['subnasale'][0]) / (1.5260 - 1.4680)
NOSE_W = '[' + ', '.join('[%.4f, %.4f]' % (L['subnasale'][0] + (y - 1.4680) * kk, w) for y, w in ((1.4680, 0.0052), (1.4760, 0.0054), (1.4800, 0.0070), (1.4880, 0.0100), (1.4960, 0.0082), (1.5080, 0.0062), (1.5260, 0.0058))) + ']'
yB = round(1.555 - (L['underChin'][0] - 0.0035), 4)
p = W + 'variants/ownface/40_head.js'; s = open(p).read()      # the Fox's own face is no longer the main build (see make_jface.py)
s = re.sub(r"const FACE_MID = \[\[.*?\]\];", 'const FACE_MID = ' + FACE_MID + ';', s, count=1, flags=re.S)
s = re.sub(r"const NOSE = \[\[.*?\]\];", 'const NOSE = ' + NOSE + ';', s, count=1, flags=re.S)
s = re.sub(r"const NOSE_W = \[\[.*?\]\];", 'const NOSE_W = ' + NOSE_W + ';\n  const LIPS = ' + json.dumps(LIPS).replace('"', '') + ';', s, count=1, flags=re.S) if 'const LIPS' not in s else re.sub(r"const NOSE_W = \[\[.*?\]\];\n  const LIPS = \{.*?\};", 'const NOSE_W = ' + NOSE_W + ';\n  const LIPS = ' + json.dumps(LIPS).replace('"', '') + ';', s, count=1, flags=re.S)
s = re.sub(r"yB: [0-9.]+,", 'yB: %.4f,' % yB, s, count=1)
for a, b in (("if (Y > 1.468 && Y < 1.526) d +=", "if (Y > NOSE[0][0] && Y < NOSE[NOSE.length - 1][0]) d +="),
             ("0.0056 * G(x, Y - (FC.mouthY + 0.0058), 0.020, 0.0054) + 0.0044 * G(x, Y - (FC.mouthY - 0.0074), 0.016, 0.0054)", "LIPS.ua * G(x, Y - LIPS.uy, 0.020, 0.0054) + LIPS.la * G(x, Y - LIPS.ly, 0.016, 0.0054)"),
             ("0.0026 * G(x, Y - 1.4300, 0.017, 0.0095)", "0.0026 * G(x, Y - LIPS.chinY, 0.017, 0.0095)"),
             ("G(ax - 0.043, Y - 1.4975, 0.020, 0.016) - 0.0022 * G(ax - 0.047, Y - 1.4670, 0.016, 0.014)", "G(ax - 0.046, Y - LIPS.cheekY, 0.020, 0.016) - 0.0022 * G(ax - 0.050, Y - LIPS.hollowY, 0.016, 0.014)")):
    if a in s: s = s.replace(a, b)
    elif b not in s: print('NOT FOUND:', a[:60])
open(p, 'w').write(s)
json.dump(dict(L=L, LIPS=LIPS, eyeX=eyeX, PPM=PPM, yB=yB, eyeRow=M['eyeRow'], cx=M['cx'], mouthRow=M['mouthRow'], rows=dict(nas=nas, tip=tip, sn=sn, ul=ul, st=st, ll=ll, lm=lm, pg=pg, men=men), cRef=cRef), open(W + 'meas/fox_head.json', 'w'))
print('LIPS', LIPS, 'eyeX', round(eyeX, 4), 'yB', yB); print('nose max mm', round(float(nose.max()) * 1000, 1))
