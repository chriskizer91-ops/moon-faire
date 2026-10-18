import json, os, shutil, io
from PIL import Image
SP="/home/claude/sprites"; OUT="moonfaire_game_assets"
d=json.load(open(f"{SP}/jester_witch_spritesheet.json")); F=d["frames"]
R=lambda t,a,b: [f"{t}{i:02d}" for i in range(a,b)]
META=json.load(open(f"{SP}/frames/meta.json"))
ALL=lambda t: [m["name"] for m in META[t]]
def AT(t,key):   # release frame = first frame of the smoothed clip that is the original release key (1-based)
    return 1+[m.get("src") for m in META[t]].index(key)
CLIPS={
 "jester":{
  "idle":(R("I",1,9),4,True,None,"done"),
  "walk_right":(R("W",1,17),6,True,None,"done"),
  "walk_left":(R("W",1,17),6,True,None,"done, mirror of walk_right"),
  "walk_toward":(["C08","C09","C10","C11"],2,True,None,"done"),
  "walk_away":(R("A",13,19),3,True,None,"done"),
  "curtain_call":(R("K",1,49),6,False,32,"done"),
  "sealed_fate":(R("O",1,25),5,False,16,"done"),
  "against_all_odds":(R("S",1,17),2,False,4,"done"),
  "gilded_rebuke":(R("E",1,9),4,False,5,"done"),
  "hush":(R("U",1,30),6,False,17,"done"),
  "gravity":(R("V",1,16),9,False,11,"done")},
 "ranger":{
  "moonsteel_draw":(ALL("J"),6,False,AT("J","R04"),"done: 8 keys + 2 finishing frames"),
  "silver_arrow":(ALL("L"),6,False,AT("L","R12"),"done: 8 keys + 2 finishing frames"),
  "silverglass_ward":(ALL("T"),4,False,AT("T","R20"),"done: 8 keys + 2 shield in-betweens, full shield (R20) held twice")},
 "herbal_witch":{
  "harvest_crescent":(ALL("M"),6,False,AT("M","M05"),"done: smoothed 8 -> 12"),
  "silverleaf_salve":(ALL("N"),6,False,AT("N","N06"),"done: smoothed 8 -> 22"),
  "elderwood_guardian":(ALL("P"),6,False,AT("P","P05"),"done: smoothed 8 -> 22")},
 "fox":{
  "hemline_fangs":(ALL("Q"),6,False,AT("Q","Q05"),"done: smoothed 8 -> 12"),
  "blue_mischief":(ALL("X"),6,False,AT("X","F13"),"done: smoothed 8 -> 22"),
  "borrowed_face":(ALL("Y"),6,False,AT("Y","F19"),"done: smoothed 8 -> 22")},
}
man={"version":"2026-10-18","note":"Generated from the Flip Book Art pipeline. Do not hand-edit; regenerate.",
 "hd":{"format":"webp q90 with alpha","scale":"all characters share one scale; the Jester is about 370 px boot-to-hat",
       "anchor":"anchorX = torso centre, anchorY = boot soles, in that frame's own pixels. Draw each frame at (stageX - anchorX*s, stageY - anchorY*s)."},
 "pixel":{"sheet":"pixel/moonfaire_pixel_128.png","cell":d["cell"],"palette_colours":len(d["palette"]),
          "anchor":"every cell shares anchorX/anchorY; frames are 128 px tall at 1x. Scale by whole numbers with smoothing off."},
 "characters":{}}
os.makedirs(f"{OUT}/pixel",exist_ok=True); shutil.copy(f"{SP}/jester_witch_spritesheet.png",f"{OUT}/pixel/moonfaire_pixel_128.png")
nfiles=0; total=0
for ch,clips in CLIPS.items():
    man["characters"][ch]={"clips":{}}
    for clip,(names,fps,loop,rel,status) in clips.items():
        flip = clip=="walk_left"
        src_clip = "walk_right" if flip else clip
        frames=[]
        for i,n in enumerate(names):
            f=F[n]; path=f"hd/{ch}/{src_clip}/{i+1:02d}.webp"
            if not flip:
                os.makedirs(os.path.dirname(f"{OUT}/{path}"),exist_ok=True)
                Image.open(f"{SP}/hd/{n}.webp").convert("RGBA").save(f"{OUT}/{path}","WEBP",quality=90,method=6,alpha_quality=100); nfiles+=1
            frames.append({"hd":path,"w":f["hdW"],"h":f["hdH"],"anchorX":round(f["hdFootX"],1),"anchorY":round(f["hdFootY"],1),
                           "pixel":{"x":f["x"],"y":f["y"],"w":f["w"],"h":f["h"]},"source":n})
        total+=len(frames)
        man["characters"][ch]["clips"][clip]={"fps":fps,"loop":loop,"flipX":flip,"frames":frames,"seconds":round(len(frames)/fps,2),
                                              "release_frame":rel,"status":status}
json.dump(man,open(f"{OUT}/manifest.json","w"),indent=1)
# offline viewer ships in its own zip
os.makedirs(f"{OUT}/design",exist_ok=True)
for fn in ["moves_v03.json","Claude_Review_v03.md","Animation_Timing_v03.csv","Effect_Assets.md"]: shutil.copy(f"/home/claude/review/out/{fn}",f"{OUT}/design/{fn}")
os.makedirs(f"{OUT}/design/sim",exist_ok=True)
for fn in ["moonfaire_sim.py","variants.py","variants.json"]: shutil.copy(f"/home/claude/review/out/sim/{fn}",f"{OUT}/design/sim/{fn}")
shutil.copy("/home/claude/review/v02/moves.json",f"{OUT}/design/moves_v02_chatgpt.json")
shutil.copy("/home/claude/review/v02/Move_Bible.md",f"{OUT}/design/Move_Bible_v02_chatgpt.md")
print(nfiles,"hd files,",total,"frames referenced")
