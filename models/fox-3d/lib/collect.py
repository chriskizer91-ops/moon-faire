# Copy artifact blobs saved by the tool into ref/hd/<name>.webp using the sha256 list from list_files.
import json,glob,hashlib,os,shutil,sys
R='/tmp/claude-tool-results/1d103936-d1e7-56d9-8446-1be585cde7da/'
d=json.load(open(R+'toolu_01A2wJj6ryVzxNjSvrETNBDd-2609cc07.json'))
files=json.loads(d[0]['text'])['files']
by={}
for f in files: by.setdefault(f['sha256'],[]).append(f['path'])
n=0
for p in glob.glob(R+'*.webp')+glob.glob(R+'*.png'):
    h=hashlib.sha256(open(p,'rb').read()).hexdigest()
    for name in by.get(h,[]):
        dst='/home/claude/fox3d/ref/'+name
        if not os.path.exists(dst): shutil.copy(p,dst); n+=1
have=set(os.listdir('/home/claude/fox3d/ref/hd'))
print('copied',n,'have',len(have))
if len(sys.argv)>1:
    tot=0
    for f in files:
        nm=os.path.basename(f['path'])
        if f['path'].startswith('hd/') and nm[0] in sys.argv[1] and nm not in have:
            print(f['path'],f['size']); tot+=f['size']
    print('missing total',tot)
