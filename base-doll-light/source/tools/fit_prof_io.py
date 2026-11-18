# Moves the head's middle line onto Io's painted profile (C3): rewrites FACE_MID, NOSE and the forehead depth in src/I40_head.js
# by the gap that tools/prof_io.py measures, then rebuilds. Run it two or three times; it prints the worst gap each time.
import re, subprocess, sys, json, numpy as np
sys.path.insert(0, '/home/claude/io/tools')
import prof_io
HS, J_EYE, I_EYE = 0.95, 1.5246, 1.511
toY = lambda J: I_EYE + (J - J_EYE) * HS
K = float(sys.argv[1]) if len(sys.argv) > 1 else 0.85
painted, mdl = prof_io.measure()
Yp = painted[:, 0]; D = np.interp(Yp, mdl[:, 0], mdl[:, 1]) - painted[:, 1]          # model - painted, metres
lash = (Yp > 1.5055) & (Yp < 1.5185); a, b = np.searchsorted(Yp, 1.5055), np.searchsorted(Yp, 1.5185)
D[lash] = np.interp(Yp[lash], [Yp[a - 1], Yp[b]], [D[a - 1], D[b]])                  # her lashes stand out of the painted outline: bridge them
k = np.ones(9) / 9; Ds = np.convolve(np.pad(D, 4, mode='edge'), k, mode='valid')
gap = lambda J: float(np.interp(toY(J), Yp, Ds))
src = open('/home/claude/io/src/I40_head.js').read()
def table(name):
    m = re.search(r'const ' + name + r' = (\[\[.*?\]\]);', src, re.S); return m, json.loads(m.group(1))
mF, FM = table('FACE_MID'); mN, NS = table('NOSE')
for r in FM:
    if r[0] < 1.4685 or r[0] > 1.5255: r[1] = round(r[1] - K * gap(r[0]) / HS, 4)
    elif r[0] > 1.5180: r[1] = round(r[1] - K * 0.5 * gap(r[0]) / HS, 4)
for r in NS:
    if r[1] > 0.0015: r[1] = round(max(0.0005, r[1] - K * gap(r[0]) / HS), 4)
fmt = lambda T: '[' + ', '.join('[%.4f, %.4f]' % (a, b) for a, b in T) + ']'
src = src.replace(mF.group(1), fmt(FM)).replace(mN.group(1), fmt(NS))
src = re.sub(r'zF: [0-9.]+', 'zF: %.4f' % FM[-1][1], src, count=1)
open('/home/claude/io/src/I40_head.js', 'w').write(src)
print(subprocess.run(['/home/claude/io/build_io.sh'], capture_output=True, text=True).stdout.strip())
sel = (Yp > 1.413) & (Yp < 1.575) & ~lash
print('before this pass: worst %.1f mm, mean %.1f mm (chin to forehead, lashes left out)' % (np.abs(D[sel]).max() * 1000, np.abs(D[sel]).mean() * 1000))
