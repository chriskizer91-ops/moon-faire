import os, json, shutil
exec(open('/home/claude/jesterpack/make.py').read().split('os.makedirs("pack/hush"')[0])   # strip() helper
os.makedirs("pack", exist_ok=True)
# move: (folder, keys, inserts per gap index (0-based gap -> count), wide, fps_after, note)
MOVES = {
 "fox_blue_mischief":   ([f"F{i:02d}" for i in range(8,16)],  {g:2 for g in range(7)}, 1.3, 6, "8 → 22 frames"),
 "fox_borrowed_face":   ([f"F{i:02d}" for i in range(16,24)], {g:2 for g in range(7)}, 1.25, 6, "8 → 22 frames"),
 "fox_hemline_fangs":   ([f"Q{i:02d}" for i in range(1,9)],   {2:1,3:1,4:1,5:1},       1.6, 6, "8 → 12 frames"),
 "witch_silverleaf_salve":([f"N{i:02d}" for i in range(1,9)], {g:2 for g in range(7)}, 1.3, 6, "8 → 22 frames"),
 "witch_elderwood_guardian":([f"P{i:02d}" for i in range(1,9)],{g:2 for g in range(7)}, 1.0, 6, "8 → 22 frames"),
 "witch_harvest_crescent":([f"M{i:02d}" for i in range(1,9)], {1:1,2:1,3:1,4:1},       1.7, 6, "8 → 12 frames"),
 "ranger_moonsteel_draw":([f"R{i:02d}" for i in range(0,8)],  {5:1,6:1},               1.5, 6, "8 → 10 frames"),
 "ranger_silver_arrow": ([f"R{i:02d}" for i in range(8,16)],  {4:1,5:1},               1.5, 6, "8 → 10 frames"),
 "ranger_silverglass_ward":([f"R{i:02d}" for i in range(16,24)],{3:1,5:1},             1.7, 4, "8 → 10 frames, plus the full shield held twice = 11"),
}
summary = {}
for mv,(keys,ins,wide,fps,note) in MOVES.items():
    os.makedirs(f"pack/{mv}", exist_ok=True)
    # final timeline numbering
    seq=[]; 
    for g,k in enumerate(keys):
        seq.append(("key",k))
        if g < len(keys)-1:
            for j in range(ins.get(g,0)): seq.append(("new",g,j))
    num = {i: i+1 for i in range(len(seq))}
    # group consecutive gaps that have inserts into strips of at most two gaps
    gaps=[g for g in range(len(keys)-1) if ins.get(g,0)>0]
    runs=[]; cur=[]
    for g in gaps:
        if cur and (g!=cur[-1]+1 and not (g==cur[-1]+2 and mv=="ranger_silverglass_ward")) or len(cur)==2: runs.append(cur); cur=[]
        cur.append(g)
    if cur: runs.append(cur)
    strips=[]
    for si,run in enumerate(runs):
        g0,g1=run[0],run[-1]
        cells=[]
        for g in range(g0,g1+2):
            k=keys[g]; idx=[i for i,s in enumerate(seq) if s==("key",k)][0]
            cells.append((k,f"{num[idx]:02d} key"))
            if g<=g1:
                for j in range(ins.get(g,0)):
                    idx=seq.index(("new",g,j)); cells.append((None,f"{num[idx]:02d}"))
        fn=f"pack/{mv}/strip_{si+1:02d}_{keys[g0]}-to-{keys[g1+1]}.png"
        strip(cells, fn, wide=wide); strips.append((os.path.basename(fn),[keys[g] for g in range(g0,g1+2)],sum(1 for c in cells if c[0] is None)))
    summary[mv]=dict(keys=keys,frames=len(seq)+(1 if mv=="ranger_silverglass_ward" else 0),fps=fps,note=note,strips=strips,
                     timeline=[(f"{i+1:02d}", s[1] if s[0]=="key" else f"new {keys[s[1]]}->{keys[s[1]+1]} #{s[2]+1}") for i,s in enumerate(seq)])
json.dump(summary,open("pack/plan.json","w"),indent=1)
for k,v in summary.items(): print(k, v['frames'], [s[0] for s in v['strips']])
print(sum(len(v['strips']) for v in summary.values()),"strips,", sum(sum(s[2] for s in v['strips']) for v in summary.values()),"new poses")
