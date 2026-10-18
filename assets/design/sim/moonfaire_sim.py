"""
Moon Faire placeholder battle simulator (v0.2 move packet).

A small real-time (ATB-style) engine that runs the 40 proposed moves with their
MP costs, cast / recovery / cooldown times and effect rules, against fixed
enemy fixtures. It exists to test balance before any art is made.

Simplifications (stated so results are read correctly):
- No formation geometry: Root, Switcheroo's slot swap and movement are not modelled.
  Switcheroo cancels the target enemy's next attack (normals) or grants an evade (boss).
- Enemies use plain attacks only, except the interrupt fixture, whose enemies
  periodically interrupt a casting ally. Hush blocks that enemy's interrupts while silenced.
- Enemies carry no buffs, so Finders Keepers always uses its 1.0M fallback.
- Royal Reversal has no statuses to reflect in these fixtures, so the AI never casts it.
- Party AI is a fixed priority list per character (below). Better play would do better.
"""
import math, random, statistics, json, sys
from dataclasses import dataclass, field

R = lambda x: int(math.floor(x + 0.5))
DT = 0.05
RULES = dict(regen={}, ult_gate=0.0)   # regen: name -> MP per second; ult_gate: seconds of combat before ultimates unlock

# ---------------------------------------------------------------- moves
# id: (mp, cast, recovery, cooldown)
MOVES = {
 'R01':(0,.4,1.6,0),'R02':(8,.6,.8,4),'R03':(12,.8,.8,12),'R04':(16,1.2,.8,8),'R05':(14,1,1,14),
 'R06':(10,.6,.8,16),'R07':(18,1.2,.8,20),'R08':(12,.8,.8,12),'R09':(14,1,1,10),'R10':(44,3,1,60),
 'W01':(0,.6,1.4,0),'W02':(12,1,1,4),'W03':(10,1,1,12),'W04':(12,1.2,.8,10),'W05':(10,1,.8,8),
 'W06':(26,2,1,22),'W07':(30,3,1,24),'W08':(28,3,1,24),'W09':(32,4,1,45),'W10':(52,4,1,60),
 'F01':(0,.5,1.5,0),'F02':(14,.8,.8,6),'F03':(12,.8,.8,14),'F04':(14,.6,.8,14),'F05':(12,.8,.8,10),
 'F06':(14,.8,.8,12),'F07':(22,1.5,1,12),'F08':(16,1,1,20),'F09':(24,2,1,30),'F10':(48,3,1,60),
 'J01':(0,.6,1.4,0),'J02':(4,1,1,4),'J03':(18,4,1,6),'J04':(12,2,1,12),'J05':(20,3,1,18),
 'J06':(24,4,1,16),'J07':(16,2,1,18),'J08':(26,8,1,30),'J09':(28,4,1,20),'J10':(54,8,1,60),
}
STATS = {  # HP, MP, P, M, H
 'Ranger':(1000,140,100,100,80), 'Witch':(900,150,80,130,150),
 'Fox':(950,110,105,180,80), 'Jester':(850,90,90,260,90),
}
PREFIX = {'Ranger':'R','Witch':'W','Fox':'F','Jester':'J'}

@dataclass
class Shield:
    amt:int; exp:float; src:str
@dataclass
class Ally:
    name:str; hp:int; maxhp:int; mp:int; maxmp:int; P:int; M:int; H:int
    alive:bool=True; busy:float=0.0; casting:object=None; cast_end:float=0.0
    cds:dict=field(default_factory=dict); retry:float=0.0
    shields:list=field(default_factory=list); evade:list=field(default_factory=list)  # evade = list of expiry times
    decoy:object=None  # [hp, charges, exp]
    mbuf:dict=field(default_factory=dict)  # src -> (pct, exp)
    wbuf:float=0.0  # Fox weapon bonus expiry
    haste:list=field(default_factory=list)  # (pct, exp)
    hots:dict=field(default_factory=dict)  # src -> [amount, next_t, left, step]
    revived:bool=False; stun:float=0.0
    dmg:int=0; heal:int=0; overheal:int=0; absorbed:int=0; deaths:int=0; casts:dict=field(default_factory=dict)
    def Meff(self,t):
        b=sum(p for p,e in self.mbuf.values() if e>t); return self.M*(1+min(b,.5))
    def haste_pct(self,t):
        return min(max([p for p,e in self.haste if e>t],default=0),.25)

@dataclass
class Enemy:
    name:str; hp:int; maxhp:int; boss:bool; dmg:int; period:float; next_atk:float
    aoe:int=0; aoe_period:float=0; next_aoe:float=0; phase:int=0
    alive:bool=True; stopped:float=0.0; resolve:float=0.0; hard_used:float=0.0
    silenced:float=0.0; debuffs:dict=field(default_factory=dict)  # src->(pct, exp)
    vuln:object=None  # [exp, budget]
    doom:object=None  # (expire, M, phase, owner)
    dot:object=None   # [each, next_t, left]
    interrupts:float=0.0; next_int:float=0.0
    spawn:float=0.0

class Battle:
    def __init__(s, fixture, seed, party=('Ranger','Witch','Fox','Jester'), solo=False):
        s.rng=random.Random(seed); s.t=0.0; s.fx=fixture
        s.allies=[Ally(n,*[STATS[n][0]]*2,*[STATS[n][1]]*2,*STATS[n][2:]) for n in party]
        s.enemies=[]; s.wave=0; s.ult_used=set(); s.summon=None; s.solo=solo
        s.log_end=None; s.enc_start=0.0; s.spawn_wave()
        s.marks=[]  # enemies marked by Jester, oldest first

    # ------------------------------------------------------------ fixtures
    def spawn_wave(s):
        f=s.fx; w=f['waves'][s.wave]; s.enemies=[]
        for i,spec in enumerate(w):
            e=Enemy(name=f"{spec['kind']}{i}", hp=spec['hp'], maxhp=spec['hp'], boss=spec.get('boss',False),
                    dmg=spec['dmg'], period=spec['period'], next_atk=s.t+spec['period']*(0.5+0.5*s.rng.random()),
                    aoe=spec.get('aoe',0), aoe_period=spec.get('aoe_period',0), spawn=s.t,
                    interrupts=spec.get('interrupt',0))
            e.next_aoe=s.t+e.aoe_period if e.aoe else 1e9
            e.next_int=s.t+e.interrupts if e.interrupts else 1e9
            e.phases=spec.get('phases',1)
            s.enemies.append(e)

    def living(s,side): return [x for x in side if x.alive]

    # ------------------------------------------------------------ damage to enemies
    def hit_enemy(s,src,e,amount,kind='std'):
        if not e.alive or amount<=0: return 0
        if kind=='std' and e.vuln and e.vuln[0]>s.t and e.vuln[1]>0:
            bonus=min(R(amount*.2),e.vuln[1]); e.vuln[1]-=bonus; amount+=bonus
        dealt=min(amount,e.hp); e.hp-=amount; src.dmg+=dealt
        if e.hp<=0: s.enemy_down(e)
        return dealt
    def enemy_down(s,e):
        if e.phases>1 and e.boss:
            # phase transition: clear old-phase marks, new phase at full HP
            e.phases-=1; e.phase+=1; e.hp=e.maxhp; e.doom=None; e.debuffs={}; e.vuln=None; e.dot=None
            s.marks=[m for m in s.marks if m is not e]; return
        e.hp=0; e.alive=False; e.doom=None
        s.marks=[m for m in s.marks if m is not e]

    # ------------------------------------------------------------ damage to allies
    def hurt_ally(s,a,raw,src,aoe=False):
        if not a.alive: return
        if not aoe:
            # guardian intercept, then decoy
            g=s.summon
            if g and g['kind']=='guardian' and g['charges']>0 and g['hp']>0:
                amt=s.mitigate(raw,src,aoe); take=min(amt,g['hp']); g['hp']-=take; g['charges']-=1; s.allies_by('Witch').absorbed+=take
                if g['hp']<=0: s.summon=None
                raw_left=amt-take
                if raw_left<=0: return
                return s.apply_to_hp(a,raw_left)
            if a.decoy and a.decoy[2]>s.t and a.decoy[1]>0:
                amt=s.mitigate(raw,src,aoe); take=min(amt,a.decoy[0]); a.decoy[0]-=take; a.decoy[1]-=1
                s.allies_by('Fox').absorbed+=take
                if a.decoy[0]<=0 or a.decoy[1]<=0: a.decoy=None
                if amt-take<=0: return
                return s.apply_to_hp(a,amt-take)
            ev=[x for x in a.evade if x>s.t]
            if ev:
                a.evade.remove(min(ev)); s.allies_by('Ranger').absorbed+=s.mitigate(raw,src,aoe); return
        s.apply_to_hp(a,s.mitigate(raw,src,aoe))
    def mitigate(s,raw,src,aoe):
        red=sum(p for p,e in src.debuffs.values() if e>s.t)
        red=min(red,.15 if src.boss else .30)
        amt=raw*(1-red)
        if aoe and s.summon and s.summon['kind']=='moth' and s.summon['hp']>0: amt*=0.9
        return R(amt)
    def apply_to_hp(s,a,amt):
        a.shields=[x for x in a.shields if x.exp>s.t]
        for sh in sorted(a.shields,key=lambda x:x.exp):
            if amt<=0: break
            take=min(sh.amt,amt); sh.amt-=take; amt-=take
            owner={'R':'Ranger','W':'Witch','J':'Jester'}[sh.src[0]]
            if s.allies_by(owner): s.allies_by(owner).absorbed+=take
        a.shields=[x for x in a.shields if x.amt>0]
        a.hp-=amt
        if a.hp<=0: s.ally_down(a)
    def ally_down(s,a):
        a.hp=0; a.alive=False; a.deaths+=1; a.casting=None; a.shields=[]; a.hots={}; a.decoy=None; a.mbuf={}
        if a.name=='Witch': s.summon=None
        if a.name=='Jester': s.marks=[]; [setattr(e,'doom',None) for e in s.enemies]
    def allies_by(s,n):
        for a in s.allies:
            if a.name==n: return a
        return None

    # ------------------------------------------------------------ healing / shields
    def heal(s,src,a,amt):
        if not a.alive: return
        use=min(amt,a.maxhp-a.hp); a.hp+=use; src.heal+=use; src.overheal+=amt-use
    def shield(s,src,a,amt,dur,mid):
        if not a.alive: return
        a.shields=[x for x in a.shields if x.exp>s.t]
        amt=min(amt,R(a.maxhp*.30))
        same=[x for x in a.shields if x.src==mid]
        if same:
            o=same[0]
            if amt>o.amt: a.shields.remove(o)
            else: o.exp=s.t+dur; return
        room=R(a.maxhp*.40)-sum(x.amt for x in a.shields)
        amt=min(amt,max(room,0))
        if amt>0: a.shields.append(Shield(amt,s.t+dur,mid))

    # ------------------------------------------------------------ casting
    def can(s,a,mid):
        mp,cast,rec,cd=MOVES[mid]
        if a.mp+1e-9<mp or a.cds.get(mid,0)>s.t or a.retry>s.t: return False
        if mid in('R10','W10','F10','J10') and (a.name in s.ult_used or s.t-s.enc_start<RULES['ult_gate']): return False
        return True
    def start(s,a,mid,target):
        mp,cast,rec,cd=MOVES[mid]
        a.mp-=mp; a.casting=(mid,target,mp); a.cast_end=s.t+cast; a.busy=1e9
        a.casts[mid]=a.casts.get(mid,0)+1
    def interrupt(s,a):
        if not a.casting: return False
        mid,tg,mp=a.casting; a.mp+=mp-math.ceil(mp/2); a.casting=None
        a.busy=s.t+1.0; a.retry=s.t+3.0; return True
    def release(s,a):
        mid,tg,mp=a.casting; a.casting=None
        _,cast,rec,cd=MOVES[mid]
        ok=s.effect(a,mid,tg)
        if ok is False:  # invalid target at release
            a.mp+=mp-math.ceil(mp/2); a.busy=s.t+1.0; a.retry=s.t+3.0; return
        a.cds[mid]=s.t+cd
        if mid in('R10','W10','F10','J10'): s.ult_used.add(a.name)
        a.busy=s.t+rec/(1+a.haste_pct(s.t))

    def pick_enemy(s,a,prefer='low'):
        L=s.living(s.enemies)
        if not L: return None
        if prefer=='boss':
            b=[e for e in L if e.boss]; return b[0] if b else min(L,key=lambda e:e.hp)
        if prefer=='high': return max(L,key=lambda e:e.hp)
        return min(L,key=lambda e:e.hp)

    # ------------------------------------------------------------ effects
    def effect(s,a,mid,tg):
        t=s.t; L=s.living(s.enemies); A=s.living(s.allies); M=a.Meff(t)
        def need_enemy():
            return tg if (tg is not None and getattr(tg,'alive',False)) else None
        if mid[1:]=='01':  # weapon attacks
            e=need_enemy() or s.pick_enemy(a)
            if not e: return False
            k={'R':1.0,'W':.8,'F':.5,'J':.9}[mid[0]]
            bonus=1.2 if (a.name=='Fox' and a.wbuf>t) else 1.0
            hits=2 if mid=='F01' else 1
            for _ in range(hits): s.hit_enemy(a,e,R(k*a.P*bonus))
            return True
        if mid=='R02':
            e=need_enemy();  return s.hit_enemy(a,e,R(2*M)) if e else False
        if mid=='R03':
            for e in L[:4]:
                s.hit_enemy(a,e,R(.6*M)); e.debuffs['R03']=(.10 if e.boss else .20, t+6)
            return bool(L)
        if mid=='R04':
            if not L: return False
            for i in range(3):
                e=min(s.living(s.enemies),key=lambda x:x.hp) if s.living(s.enemies) else None
                if e: s.hit_enemy(a,e,R(1*M))
            return True
        if mid=='R05':
            s.shield(a,tg,R(3*M),8,'R05'); return True
        if mid=='R06':
            e=need_enemy()
            if not e: return False
            e.vuln=[t+8,400]; return True
        if mid=='R07':
            for x in A: x.evade=[t+5]
            return True
        if mid=='R08':
            e=need_enemy(); return s.hit_enemy(a,e,R(1.2*M)) if e else False
        if mid=='R09':
            if not tg.alive: return False
            s.heal(a,tg,R(2*a.H)); return True
        if mid=='R10':
            for e in L[:4]: s.hit_enemy(a,e,R(4*M))
            for x in A: s.shield(a,x,R(1.5*M),8,'R10')
            return True
        if mid=='W02':
            if not tg.alive: return False
            s.heal(a,tg,R(2.4*a.H)); return True
        if mid=='W03':
            if not tg.alive: return False
            tg.hots['W03']=[R(.5*a.H),t+2,6,2,a]; return True
        if mid=='W04':
            e=need_enemy(); return s.hit_enemy(a,e,R(1.6*M)) if e else False
        if mid=='W05':
            if not tg.alive: return False
            s.heal(a,tg,R(.8*a.H)); return True
        if mid=='W06':
            for x in A: s.shield(a,x,R(1.5*a.H),10,'W06')
            return True
        if mid=='W07':
            s.summon=dict(kind='guardian',hp=R(5*a.H),charges=3,exp=t+15,next=t+3,dmg=R(.6*M)); return True
        if mid=='W08':
            s.summon=dict(kind='moth',hp=R(3*a.H),charges=0,exp=t+15,next=t+3,heal=R(.6*a.H)); return True
        if mid=='W09':
            if tg.alive or tg.revived: return False
            tg.alive=True; tg.hp=R(.3*tg.maxhp); tg.revived=True; tg.busy=t+2; tg.casting=None; return True
        if mid=='W10':
            for x in A: s.heal(a,x,R(2*a.H)); x.hots['W10']=[R(a.H/3),t+2,6,2,a]
            return True
        if mid=='F02':
            e=need_enemy(); return s.hit_enemy(a,e,R(2*M)) if e else False
        if mid=='F03':
            a.decoy=[R(2*M),2,t+6]; return True
        if mid=='F04':
            e=need_enemy()
            if not e: return False
            if e.boss: tg2=min(A,key=lambda x:x.hp/x.maxhp); tg2.evade=[t+4]
            else: e.next_atk=max(e.next_atk,t+e.period)  # cancel its windup
            return True
        if mid=='F05':
            e=need_enemy(); return s.hit_enemy(a,e,R(1*M)) if e else False
        if mid=='F06':
            e=need_enemy()
            if not e: return False
            e.dot=[R(.65*M),t+3,3,a]; e.debuffs['F06']=(.075 if e.boss else .15,t+6); return True
        if mid=='F07':
            tgts=sorted(L,key=lambda e:e.hp)[:3]
            for _ in range(3):
                for e in tgts: s.hit_enemy(a,e,R(.8*M))
            return bool(tgts)
        if mid=='F08':
            if not tg.alive: return False
            cost=math.ceil(.15*a.maxhp)
            if a.hp-cost<1: return False
            a.hp-=cost; tg.mbuf['F08']=(.25,t+10); return True
        if mid=='F09':
            a.mbuf['F09']=(.30,t+12); a.wbuf=t+12; return True
        if mid=='F10':
            for e in L[:4]: s.hit_enemy(a,e,R(5*M))
            for x in A:
                if not (x.decoy and x.decoy[0]>=R(M)): x.decoy=[R(M),1,t+6]
            return True
        if mid=='J02':
            e=need_enemy(); return s.hit_enemy(a,e,R(.8*M)) if e else False
        if mid=='J03':
            e=need_enemy()
            if not e: return False
            if e in s.marks: s.marks.remove(e)
            elif len(s.marks)>=3:
                old=s.marks.pop(0); old.doom=None
            e.doom=(t+20,M,e.phase); s.marks.append(e); return True
        if mid=='J04':
            e=need_enemy()
            if not e: return False
            if not e.boss: e.silenced=t+6
            return True
        if mid=='J05':
            e=need_enemy()
            if not e: return False
            if e.resolve>t: return True
            d=1.0 if e.boss else 3.0
            e.stopped=t+d; e.next_atk+=d; e.next_aoe+=d; e.resolve=t+d+(8 if e.boss else 4); return True
        if mid=='J06':
            e=need_enemy()
            if not e: return False
            loss=min(R(.25*e.hp),R(4*M),e.hp-1)
            e.hp-=loss; a.dmg+=loss; return True
        if mid=='J08':
            low=statistics.mean(x.hp/x.maxhp for x in A)<=.40
            tick=R((2 if low else 1)*a.H/6)
            for x in A: x.hots['J08']=[tick,t+2,6,2,a]; x.haste.append((.25 if low else .15,t+12))
            return True
        if mid=='J09':
            e=need_enemy(); return s.hit_enemy(a,e,R(4*M),kind='std') if e else False
        if mid=='J10':
            for e in list(s.marks): s.resolve_doom(e)
            for e in s.living(s.enemies)[:4]: s.hit_enemy(a,e,R(2*M))
            for x in A: s.shield(a,x,R(.75*M),6,'J10')
            return True
        return True

    def resolve_doom(s,e):
        if e.doom is None or not e.alive: return
        exp,M,ph=e.doom; e.doom=None
        if e in s.marks: s.marks.remove(e)
        j=s.allies_by('Jester')
        if ph!=e.phase: return
        if not e.boss:
            j.dmg+=e.hp; e.hp=0; s.enemy_down(e)
        else:
            loss=min(R(.10*e.maxhp),R(5*M)); dealt=min(loss,e.hp); e.hp-=loss; j.dmg+=dealt
            if e.hp<=0: s.enemy_down(e)

    # ------------------------------------------------------------ party AI
    def decide(s,a):
        t=s.t; L=s.living(s.enemies); A=s.living(s.allies)
        if not L: return
        boss=any(e.boss for e in L); n=len(L)
        low=min(A,key=lambda x:x.hp/x.maxhp)
        mean=statistics.mean(x.hp/x.maxhp for x in A)
        dead=[x for x in s.allies if not x.alive and not x.revived]
        ult={'Ranger':'R10','Witch':'W10','Fox':'F10','Jester':'J10'}[a.name]
        saving = (a.name not in s.ult_used) and RULES['ult_gate']>0 and (t-s.enc_start)>RULES['ult_gate']-6 \
                 and (boss or n>=3) and a.name!='Witch'
        def go(mid,tg=None):
            # hold MP for the ultimate once it is about to unlock (free attacks still allowed)
            if saving and mid!=ult and MOVES[mid][0]>0 and a.mp-MOVES[mid][0]<MOVES[ult][0]: return False
            if s.can(a,mid): s.start(a,mid,tg); return True
            return False
        if a.name=='Ranger':
            if low.hp/low.maxhp<.40 and go('R09',low): return
            if (boss or n>=3) and go('R10'): return
            if mean<.6 and go('R07'): return
            if low.hp/low.maxhp<.6 and not low.shields and go('R05',low): return
            if (boss or n>=2) and go('R06',s.pick_enemy(a,'boss' if boss else 'high')): return
            if n>=3 and go('R03'): return
            if go('R04'): return
            if go('R02',s.pick_enemy(a,'boss' if boss else 'low')): return
            go('R01',s.pick_enemy(a))
        elif a.name=='Witch':
            if dead and go('W09',dead[0]): return
            if mean<.45 and go('W10'): return
            if mean<.70 and go('W06'): return
            if low.hp/low.maxhp<.55 and go('W02',low): return
            if s.summon is None:
                if (mean<.8) and go('W08'): return
                if go('W07'): return
            if low.hp/low.maxhp<.85 and 'W03' not in low.hots and go('W03',low): return
            if go('W04',s.pick_enemy(a,'boss' if boss else 'low')): return
            go('W01',s.pick_enemy(a))
        elif a.name=='Fox':
            if (boss or n>=3) and go('F10'): return
            if a.hp/a.maxhp<.5 and not a.decoy and go('F03'): return
            if n>=2 and go('F07'): return
            jes=s.allies_by('Jester')
            if jes and jes.alive and jes.casting and jes.casting[0] in('J09','J10') and a.hp/a.maxhp>.5 and go('F08',jes): return
            if boss and go('F06',s.pick_enemy(a,'boss')): return
            if go('F02',s.pick_enemy(a,'boss' if boss else 'low')): return
            if go('F05',s.pick_enemy(a)): return
            go('F01',s.pick_enemy(a))
        elif a.name=='Jester':
            if mean<.40 and go('J08'): return
            inter=[e for e in L if e.interrupts and e.silenced<=t]
            if inter and go('J04',inter[0]): return
            unmarked=[e for e in L if e.doom is None and (e.boss or e.hp>500)]
            if unmarked and len(s.marks)<3 and go('J03',max(unmarked,key=lambda e:(e.boss,e.hp))): return
            if s.marks and (boss or len(s.marks)>=2 or n>=3) and go('J10'): return
            if boss and go('J06',s.pick_enemy(a,'boss')): return
            if go('J09',s.pick_enemy(a,'boss' if boss else 'high')): return
            if go('J02',s.pick_enemy(a)): return
            go('J01',s.pick_enemy(a))

    # ------------------------------------------------------------ main loop
    def step(s):
        t=s.t
        # scheduled expiries first (Doom)
        for e in list(s.enemies):
            if e.alive and e.doom and e.doom[0]<=t: s.resolve_doom(e)
        # releases
        for a in s.allies:
            if a.alive and a.casting and a.cast_end<=t: s.release(a)
        # ticks: dots, hots, summon
        for e in s.enemies:
            if e.alive and e.dot and e.dot[1]<=t:
                each,nt,left,src=e.dot; s.hit_enemy(src,e,each); e.dot=[each,nt+3,left-1,src] if left>1 else None
        for a in s.allies:
            for k,h in list(a.hots.items()):
                if h[1]<=t:
                    if a.alive: s.heal(h[4],a,h[0])
                    h[2]-=1; h[1]+=h[3]
                    if h[2]<=0: del a.hots[k]
        g=s.summon
        if g:
            if g['exp']<t-1e-9 or g['hp']<=0: s.summon=None
            elif g['next']<=t+1e-9:
                w=s.allies_by('Witch')
                if g['kind']=='guardian':
                    e=s.pick_enemy(w,'boss')
                    if e: s.hit_enemy(w,e,g['dmg'])
                else:
                    A=s.living(s.allies)
                    if A: s.heal(w,min(A,key=lambda x:x.hp/x.maxhp),g['heal'])
                g['next']+=3
        # enemies act
        for e in s.living(s.enemies):
            if e.stopped>t: continue
            A=s.living(s.allies)
            if not A: break
            if e.next_atk<=t:
                tgt=s.rng.choice(A); s.hurt_ally(tgt,e.dmg,e); e.next_atk=t+e.period
            if e.aoe and e.next_aoe<=t:
                for x in s.living(s.allies): s.hurt_ally(x,e.aoe,e,aoe=True)
                e.next_aoe=t+e.aoe_period
            if e.interrupts and e.next_int<=t:
                if e.silenced<=t:
                    casters=[x for x in s.living(s.allies) if x.casting and MOVES[x.casting[0]][1]>=1.5]
                    if casters: s.interrupt(max(casters,key=lambda x:x.cast_end-t))
                e.next_int=t+e.interrupts
        # MP regeneration
        for a in s.allies:
            if a.alive and RULES['regen']: a.mp=min(a.maxmp,a.mp+RULES['regen'].get(a.name,0)*DT); a.mp=round(a.mp,4)
        # decisions
        for a in s.allies:
            if a.alive and not a.casting and a.busy<=t: s.decide(a)
        s.t=round(s.t+DT,4)

    def run(s,limit=300):
        while s.t<limit:
            if not s.living(s.allies): return dict(win=False,t=s.t)
            if not s.living(s.enemies):
                s.wave+=1
                if s.wave>=len(s.fx['waves']): return dict(win=True,t=s.t)
                s.spawn_wave()
            s.step()
        return dict(win=False,t=s.t,timeout=True)

# ---------------------------------------------------------------- fixtures
N=lambda: dict(kind='normal',hp=1000,dmg=100,period=2.0)
BOSS=lambda **k: dict(dict(kind='boss',hp=12000,boss=True,dmg=180,period=2.0,aoe=140,aoe_period=10.0),**k)
FIXTURES={
 'A one normal':dict(waves=[[N()]]),
 'B four normals':dict(waves=[[N(),N(),N(),N()]]),
 'C boss 12k':dict(waves=[[BOSS()]]),
 'D boss + 2 adds':dict(waves=[[BOSS(),N(),N()]]),
 'E attrition 3x4 normals':dict(waves=[[N(),N(),N(),N()]]*3),
 'F interrupt-heavy 4':dict(waves=[[dict(N(),interrupt=6.0) for _ in range(4)]]),
 'G two-phase boss':dict(waves=[[BOSS(phases=2)]]),
}

def summarize(name,fx,runs=200,party=('Ranger','Witch','Fox','Jester')):
    res=[];agg={n:dict(dmg=[],heal=[],over=[],absorbed=[],mp=[],deaths=[]) for n in party}; casts={n:{} for n in party}
    for seed in range(runs):
        b=Battle(fx,seed,party); r=b.run(); res.append(r)
        for a in b.allies:
            g=agg[a.name]; g['dmg'].append(a.dmg); g['heal'].append(a.heal); g['over'].append(a.overheal)
            g['absorbed'].append(a.absorbed); g['mp'].append(a.mp); g['deaths'].append(a.deaths)
            for k,v in a.casts.items(): casts[a.name][k]=casts[a.name].get(k,0)+v
    wins=[r for r in res if r['win']]
    out=dict(fixture=name,runs=runs,win_rate=len(wins)/runs,
             t_median=statistics.median([r['t'] for r in wins]) if wins else None,
             per_char={n:{k:round(statistics.mean(v),1) for k,v in g.items()} for n,g in agg.items()},
             casts_per_fight={n:{k:round(v/runs,2) for k,v in sorted(c.items())} for n,c in casts.items()})
    tot=sum(out['per_char'][n]['dmg'] for n in party) or 1
    for n in party: out['per_char'][n]['dmg_share']=round(out['per_char'][n]['dmg']/tot,3)
    return out

def solo_power(window=60):
    """Each woman alone against a passive 12k boss dummy: magic magnitude and MP endurance."""
    out={}
    fx=dict(waves=[[dict(kind='dummy',hp=10**7,boss=True,dmg=0,period=999)]])
    for n in STATS:
        b=Battle(fx,0,party=(n,)); mp_out=None; marks_dmg=0
        while b.t<window:
            b.step()
            a=b.allies[0]
            if mp_out is None and a.mp<min(MOVES[m][0] for m in MOVES if m[0]==PREFIX[n] and MOVES[m][0]>0): mp_out=b.t
        a=b.allies[0]
        out[n]=dict(damage=a.dmg,dps=round(a.dmg/window,1),mp_left=a.mp,mp_dry_at=mp_out)
    return out

if __name__=='__main__':
    results=[summarize(k,v) for k,v in FIXTURES.items()]
    solo={w:solo_power(w) for w in (30,60,120)}
    json.dump(dict(fixtures=results,solo=solo),open(sys.argv[1] if len(sys.argv)>1 else 'results.json','w'),indent=1)
    for r in results:
        print(f"\n== {r['fixture']}: win {r['win_rate']:.0%}, median {r['t_median']}s")
        for n,c in r['per_char'].items(): print(f"  {n:7s} dmg {c['dmg']:7.0f} ({c['dmg_share']:.0%}) heal {c['heal']:6.0f} over {c['over']:5.0f} abs {c['absorbed']:5.0f} mp {c['mp']:5.1f} deaths {c['deaths']}")
    print("\n== solo vs boss dummy");
    for w,v in solo.items(): print(w, v)
