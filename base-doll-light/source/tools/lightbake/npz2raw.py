# npz2raw.py CODE : the exported meshes as raw little-endian files for node (out/CODE_raw/<mesh>.<attr>)
import sys, os, numpy as np, json
code = sys.argv[1]; d = np.load('out/%s_full.npz' % code); D = 'out/%s_raw/' % code; os.makedirs(D, exist_ok=True)
for k in d.files: d[k].tofile(D + k.replace('/', '.'))
print(len(d.files), 'arrays')
