# unpack returned art safely: image files only, flat names, into ref/new/
import zipfile, os, sys, io
from PIL import Image
out='/home/claude/work/in/'; rows=[]
for z in sys.argv[1:]:
    with zipfile.ZipFile(z) as f:
        for i in f.infolist():
            n=os.path.basename(i.filename)
            if i.is_dir() or not n.lower().endswith(('.png','.jpg','.jpeg','.webp')) or n.startswith('.'): continue
            data=f.read(i); open(out+n,'wb').write(data); im=Image.open(io.BytesIO(data)); rows.append((n,im.size,len(data)//1024))
for r in sorted(rows): print(r)
