import json, copy, statistics, sys
import moonfaire_sim as S
BASE_MOVES=copy.deepcopy(S.MOVES); BASE_STATS=copy.deepcopy(S.STATS)
FX=dict(S.FIXTURES)
FX['B2 four tough normals 2500']=dict(waves=[[dict(S.N(),hp=2500) for _ in range(4)]])
FX['G2 two-phase boss, 120 hit / 100 AoE']=dict(waves=[[S.BOSS(phases=2,dmg=120,aoe=100)]])
FX['F2 interrupt tough 4x2500']=dict(waves=[[dict(S.N(),hp=2500,interrupt=6.0) for _ in range(4)]])
def setv(name):
    S.MOVES.clear(); S.MOVES.update(copy.deepcopy(BASE_MOVES)); S.STATS.clear(); S.STATS.update(copy.deepcopy(BASE_STATS))
    S.RULES.update(regen={}, ult_gate=0.0)
    if name=='v02 as written': return
    # v03 proposal
    S.RULES['regen']={'Ranger':1.0,'Witch':1.2,'Fox':0.9,'Jester':0.8}
    S.RULES['ult_gate']=15.0
    # Jester casts aligned to her real animations (release frame), same total lock as the animation
    S.MOVES['J03']=(18,2.7,1.3,6)   # Orb: sigil peaks ~frame 16 of 24 at 6 fps
    S.MOVES['J08']=(26,2.0,6.0,30)  # Skyward: arms up by frame 4 of 16 at 2 fps; heal streams while held
    S.MOVES['J10']=(54,5.3,2.7,60)  # Cast: ring sweeps ~frame 32 of 48 at 6 fps
    hp,mp,P,M,H=S.STATS['Jester']; S.STATS['Jester']=(hp,100,P,M,H)
    S.MOVES['J04']=(12,1.0,1.0,12)   # Hush: quick enough to answer an interrupter
VARS=sys.argv[1:] or ['v02 as written','v03 proposal']
out={}
for v in VARS:
    setv(v); out[v]={'fixtures':[S.summarize(k,f,runs=150) for k,f in FX.items()],'solo':{w:S.solo_power(w) for w in (30,60,120)}}
    print(f"\n######## {v}")
    for r in out[v]['fixtures']:
        sh=' '.join(f"{n[0]}{c['dmg_share']:.0%}" for n,c in r['per_char'].items())
        mp=' '.join(f"{n[0]}{c['mp']:.0f}" for n,c in r['per_char'].items())
        de=sum(c['deaths'] for c in r['per_char'].values())
        print(f"{r['fixture']:30s} win {r['win_rate']:4.0%}  t {str(r['t_median']):>6}  share {sh}  mpLeft {mp}  deaths/fight {de:.2f}")
    for w,vv in out[v]['solo'].items(): print(' solo',w,{n:(x['dps'],x['mp_dry_at']) for n,x in vv.items()})
json.dump(out,open('variants.json','w'),indent=1)
