"""Moon Faire battle simulator, draft 1 (November 13, 2026).

Envoi's battle shape: each fighter has a turn gauge (seconds per turn), time waits while choosing,
no dice, every amount swings up to 25% either way. All numbers here are level 1; every level
multiplies every number by 1.2, foes too, so a fight at the party's level plays the same at any level.
A foe N levels above the party has its numbers multiplied by 1.2**N.

The Jester follows Chris's lore (lore/discussion-notes.md):
- highest HP; takes half of every blow (her resilience); weak normal attack
- taunts: attack taunt and heal taunt (heals only her); while taunting, single-target blows go to her
- big spell: charged by the damage aimed at her (the full blow, before halving); ready at 75% of her
  max HP; takes 75% of the target's MAX HP; no countdown
"""
import random, math, statistics as st, copy, json, sys

SWING = 0.25
GROW = 1.2

def sw(x, R):
    return x * R.uniform(1 - SWING, 1 + SWING)

# ---------------- the party, level 1 ----------------
PARTY = {
    'Ranger': dict(hp=1500, mp=50, turn=2.0, atk=300),
    'Fox':    dict(hp=1150, mp=90, turn=2.2, atk=150),
    'Io':     dict(hp=1300, mp=150, turn=2.4, atk=90),
    'Jester': dict(hp=5400, mp=60, turn=2.6, atk=90),
}
SPELL = {
    # Ranger: the gem; her magic makes her own next 3 attacks stronger
    'gem': dict(mp=8, boost=0.6, n=3),
    # Fox
    'mischief': dict(mp=10, amt=380),           # one foe, upper-middle
    'needles':  dict(mp=16, amt=200),           # every foe
    'same_cloth': dict(mp=18, mult=2.0),        # a ghost copy of the foe hits it with its own blow, doubled
    'quilt':    dict(mp=22, turns=1),           # every foe confused for its next turn: its blow lands on a foe
    'decoy':    dict(mp=12, n=2),               # Borrowed Face: the next 2 single-target blows hit a ghost
    # Io
    'salve':    dict(mp=10, amt=650),           # heal one, middle tier
    'bloom':    dict(mp=20, amt=330),           # heal everyone
    'smite':    dict(mp=12, amt=450),           # her one damage spell, low end of the upper tier
    'summon':   dict(mp=36, amt=520),           # the deity, every foe, once a fight
    'revive':   dict(mp=24, part=0.3),
    # Jester
    'taunt_atk':  dict(mp=0, amt=220),          # attack taunt (Gravity danced)
    'taunt_heal': dict(mp=8, part=0.12),        # heal taunt (Against All Odds danced): heals only her
    'big':        dict(charge=0.75, share=0.75),
}

RULES = dict(
    jester_half=True,      # she takes half of every blow
    aoe_charges=True,      # a blow that hits everyone also charges her
    reach='one',           # 'one' foe or 'all' foes
    rise=0.0,              # the price rises by this share of her HP after each cast in a fight
    keep_over=False,       # damage past full is kept for the next charge
    decoy_beats_taunt=True,
)

def foe(name, hp, atk, turn, aoe=0, aoe_every=0, boss=False):
    return dict(name=name, hp=hp, atk=atk, turn=turn, aoe=aoe, aoe_every=aoe_every, boss=boss)

def boss_fight():
    """Chris's picture: four or five creatures counting the boss, assistants that are also quite
    powerful, several stages. Two stages; the party carries HP and MP from one to the next."""
    s1 = [foe('Boss', 13000, 430, 3.0, aoe=300, aoe_every=2, boss=True)] + \
         [foe(f'Aide {i}', 3600, 270, 3.2) for i in (1, 2, 3)]
    s2 = [foe('Boss risen', 15000, 480, 2.9, aoe=340, aoe_every=2, boss=True)] + \
         [foe(f'Aide {i}', 3600, 270, 3.2) for i in (4, 5)]
    return [s1, s2]

def normal_fight():
    return [[foe(f'Wraith {i}', 2400, 230, 3.2) for i in (1, 2, 3)]]

def big_foe():
    return [[foe('Great wraith', 13000, 430, 3.0, aoe=240, aoe_every=3, boss=True)]]

class F:
    def __init__(s, name, d, side, lvl=0):
        k = GROW ** lvl
        s.name, s.side = name, side
        s.mx = d['hp'] * k; s.hp = s.mx
        s.atk = d['atk'] * k; s.turn = d['turn']
        s.mpmx = d.get('mp', 0); s.mp = s.mpmx
        s.aoe = d.get('aoe', 0) * k; s.aoe_every = d.get('aoe_every', 0)
        s.boss = d.get('boss', False)
        s.n = 0; s.next = 0.0
        s.boost = 0; s.boostk = 0; s.taunt = False; s.confused = 0
        s.summoned = False; s.charge = 0.0; s.casts = 0
    @property
    def up(s): return s.hp > 0

def run(team, stages, policy='smart', lvl_foe=0, lvl_party=0, rules=None, seed=0, log=False):
    R = random.Random(seed)
    ru = dict(RULES, **(rules or {}))
    P = [F(n, PARTY[n], 'p', lvl_party) for n in team]
    k = GROW ** lvl_party
    S = {kname: {kk: (vv * k if kk in ('amt',) else vv) for kk, vv in v.items()} for kname, v in SPELL.items()}
    J = next((p for p in P if p.name == 'Jester'), None)
    stats = dict(first_cast=None, casts=0, ends=0, jester_dmg=0.0, dmg=0.0, t=0.0, stage_reached=0, decoyed=0)
    t = 0.0
    for si, stage in enumerate(stages):
        stats['stage_reached'] = si + 1
        E = [F(f['name'], f, 'e', lvl_foe) for f in stage]
        for x in P + E:
            x.next = t + x.turn * (0.3 + 0.7 * R.random())
        decoy = 0
        if J: J.taunt = False
        while True:
            alive_p = [p for p in P if p.up]; alive_e = [e for e in E if e.up]
            if not alive_e: break
            if not alive_p:
                stats['t'] = t; return False, stats
            if t > 900:
                stats['t'] = t; return False, stats
            actor = min((x for x in P + E if x.up), key=lambda x: x.next)
            t = actor.next
            actor.n += 1
            actor.next = t + actor.turn

            def hurt(target, amount, aimed=True, src=None):
                if target.side == 'e':
                    target.hp -= amount
                    stats['dmg'] += amount
                    if J is not None and src is J: stats['jester_dmg'] += amount
                    return
                a = amount
                if target is J:
                    if aimed and (ru['aoe_charges'] or aimed != 'aoe'):
                        price = J.mx * (SPELL['big']['charge'] + ru['rise'] * J.casts)
                        J.charge = J.charge + amount if ru['keep_over'] else min(price, J.charge + amount)
                    if ru['jester_half']: a = amount / 2
                target.hp -= a

            if actor.side == 'e':
                if actor.confused > 0:
                    actor.confused -= 1
                    tgt = R.choice(alive_e)
                    hurt(tgt, sw(actor.atk, R))
                    continue
                if actor.aoe_every and actor.n % actor.aoe_every == 0:
                    for p in alive_p: hurt(p, sw(actor.aoe, R), aimed='aoe')
                    continue
                if decoy > 0:
                    decoy -= 1; stats['decoyed'] += 1; continue
                if J and J.up and J.taunt:
                    tgt = J
                else:
                    tgt = R.choice(alive_p)
                hurt(tgt, sw(actor.atk, R), aimed=True)
                continue

            # ---------------- the party ----------------
            low = min(alive_e, key=lambda e: e.hp)
            big = max(alive_e, key=lambda e: e.mx)
            focus = low if policy != 'boss_first' else big
            if actor.name == 'Jester':
                actor.taunt = False
                price = actor.mx * (SPELL['big']['charge'] + ru['rise'] * actor.casts)
                ready = actor.charge >= price and policy not in ('no_big',)
                if ready and policy == 'hold':
                    share0 = SPELL['big']['share']
                    killable = [e for e in alive_e if e.hp <= share0 * e.mx]
                    biggest = max(alive_e, key=lambda e: e.mx)
                    if biggest not in killable and actor.hp > 0.35 * actor.mx and actor.charge < 1.6 * price:
                        ready = False
                if ready:
                    share = SPELL['big']['share']
                    targets = alive_e if ru['reach'] == 'all' else None
                    if targets is None:
                        killable = [e for e in alive_e if e.hp <= share * e.mx]
                        tgt = max(killable, key=lambda e: e.mx) if killable else max(alive_e, key=lambda e: e.mx * (e.hp / e.mx))
                        targets = [tgt]
                    if stats['first_cast'] is None:
                        others = [p for p in P if p is not actor]
                        bossx = next((e for e in alive_e if e.boss), None)
                        stats['first_cast'] = dict(
                            t=round(t, 1), stage=si + 1,
                            party_hp=round(sum(max(0, p.hp) / p.mx for p in others) / max(1, len(others)), 2) if others else None,
                            boss_hp=round(bossx.hp / bossx.mx, 2) if bossx else None)
                    for e in targets: hurt(e, share * e.mx, src=J)
                    actor.charge = (actor.charge - price) if ru['keep_over'] else 0.0
                    actor.casts += 1; stats['casts'] += 1
                    if not any(e.up for e in E): stats['ends'] += 1
                    stats.setdefault('end_stage', 0)
                    continue
                if actor.hp < 0.4 * actor.mx and actor.mp >= S['taunt_heal']['mp'] and policy != 'no_heal_taunt':
                    actor.mp -= S['taunt_heal']['mp']
                    actor.hp = min(actor.mx, actor.hp + S['taunt_heal']['part'] * actor.mx)
                    actor.taunt = True; continue
                hurt(focus, sw(S['taunt_atk']['amt'], R), src=J)
                actor.taunt = True
                continue

            if actor.name == 'Ranger':
                if actor.boost == 0 and actor.mp >= S['gem']['mp'] and big.hp > 3 * actor.atk:
                    actor.mp -= S['gem']['mp']; actor.boost = S['gem']['n']; continue
                m = 1 + (S['gem']['boost'] if actor.boost > 0 else 0)
                if actor.boost > 0: actor.boost -= 1
                hurt(focus, sw(actor.atk * m, R)); continue

            if actor.name == 'Fox':
                # her control: used when the party is hurting, or on the boss when Same Cloth is cheap
                hurting = sum(1 for p in alive_p if p.hp < 0.45 * p.mx) >= 2
                if policy in ('fox_control', 'smart', 'hold') and len(alive_e) >= 3 and actor.mp >= S['quilt']['mp'] and not any(e.confused for e in alive_e):
                    actor.mp -= S['quilt']['mp']
                    for e in alive_e: e.confused = S['quilt']['turns']
                    continue
                if policy == 'fox_control' or hurting:
                    if len(alive_e) >= 3 and actor.mp >= S['quilt']['mp']:
                        actor.mp -= S['quilt']['mp']
                        for e in alive_e: e.confused = S['quilt']['turns']
                        continue
                    if actor.mp >= S['decoy']['mp'] and decoy == 0:
                        actor.mp -= S['decoy']['mp']; decoy = S['decoy']['n']; continue
                if actor.mp >= S['same_cloth']['mp'] and big.boss and big.hp > 2 * big.atk and R.random() < 0.35:
                    actor.mp -= S['same_cloth']['mp']
                    hurt(big, sw(big.atk * S['same_cloth']['mult'], R)); continue
                if len(alive_e) >= 3 and actor.mp >= S['needles']['mp']:
                    actor.mp -= S['needles']['mp']
                    for e in alive_e: hurt(e, sw(S['needles']['amt'], R))
                    continue
                if actor.mp >= S['mischief']['mp']:
                    actor.mp -= S['mischief']['mp']; hurt(focus, sw(S['mischief']['amt'], R)); continue
                hurt(focus, sw(actor.atk, R)); continue

            if actor.name == 'Io':
                down = [p for p in P if not p.up]
                if down and actor.mp >= S['revive']['mp']:
                    d = down[0]; actor.mp -= S['revive']['mp']; d.hp = S['revive']['part'] * d.mx
                    d.next = t + d.turn; continue
                hurtn = [p for p in alive_p if p.hp < 0.6 * p.mx]
                if len(hurtn) >= 2 and actor.mp >= S['bloom']['mp']:
                    actor.mp -= S['bloom']['mp']
                    for p in alive_p: p.hp = min(p.mx, p.hp + sw(S['bloom']['amt'], R))
                    continue
                lowp = min(alive_p, key=lambda p: p.hp / p.mx)
                if lowp.hp < 0.5 * lowp.mx and actor.mp >= S['salve']['mp']:
                    actor.mp -= S['salve']['mp']; lowp.hp = min(lowp.mx, lowp.hp + sw(S['salve']['amt'], R)); continue
                if not actor.summoned and actor.mp >= S['summon']['mp'] and len(alive_e) >= 2:
                    actor.mp -= S['summon']['mp']; actor.summoned = True
                    for e in alive_e: hurt(e, sw(S['summon']['amt'], R))
                    continue
                if actor.mp >= S['smite']['mp'] + 30:
                    actor.mp -= S['smite']['mp']; hurt(focus, sw(S['smite']['amt'], R)); continue
                hurt(focus, sw(actor.atk, R)); continue
        # between stages: the summon comes back, the fight goes on
        for p in P: p.summoned = False
    stats['t'] = t
    return True, stats

def many(team, stages_fn, n=3000, **kw):
    wins = 0; fc = []; casts = []; ends = 0; share = []; T = []; dec = []
    for i in range(n):
        ok, s = run(team, stages_fn(), seed=i, **kw)
        wins += ok
        if s['first_cast']: fc.append(s['first_cast'])
        casts.append(s['casts']); ends += s['ends']
        if s['dmg']: share.append(s['jester_dmg'] / s['dmg'])
        if ok: T.append(s['t'])
        dec.append(s['decoyed'])
    out = dict(win=round(wins / n, 3), casts=round(st.mean(casts), 2),
               fight_s=round(st.median(T), 0) if T else None,
               jester_share=round(st.mean(share), 2) if share else None)
    if fc:
        out['first_cast_s'] = round(st.median([f['t'] for f in fc]), 1)
        ph = [f['party_hp'] for f in fc if f['party_hp'] is not None]
        bh = [f['boss_hp'] for f in fc if f['boss_hp'] is not None]
        if ph: out['party_hp_at_first_cast'] = round(st.median(ph), 2)
        if bh: out['boss_hp_at_first_cast'] = round(st.median(bh), 2)
    return out

if __name__ == '__main__':
    ALL4 = ['Ranger', 'Fox', 'Io', 'Jester']
    TRIO = ['Ranger', 'Fox', 'Io']
    def ends_share(n=3000, **kw):
        e = []
        for i in range(n):
            ok, s = run(ALL4, boss_fight(), seed=i, **kw)
            if ok: e.append(s['ends'] / 2)
        return round(st.mean(e), 2) if e else None
    rows = [
        ('A. Boss fight, all four, played well', lambda: many(ALL4, boss_fight)),
        ('B. Same, but she holds her charge for a killing blow', lambda: many(ALL4, boss_fight, policy='hold')),
        ('C. Same, but she never casts the big spell', lambda: many(ALL4, boss_fight, policy='no_big')),
        ('D. Boss fight, the three without her', lambda: many(TRIO, boss_fight)),
        ('E. Boss fight, foes 1 level below the party', lambda: many(ALL4, boss_fight, lvl_foe=-1)),
        ('F. Boss fight, foes 1 level above the party', lambda: many(ALL4, boss_fight, lvl_foe=1)),
        ('G. Boss fight, her spell reaches every foe', lambda: many(ALL4, boss_fight, rules=dict(reach='all'))),
        ('H. Boss fight, price rises 25% of her HP after each cast', lambda: many(ALL4, boss_fight, rules=dict(rise=0.25))),
        ('I. Boss fight, blows that hit everyone do not charge her', lambda: many(ALL4, boss_fight, rules=dict(aoe_charges=False))),
        ('J. Boss fight, she takes full damage instead of half', lambda: many(ALL4, boss_fight, rules=dict(jester_half=False))),
        ('K. Small fight (three wraiths), all four', lambda: many(ALL4, normal_fight)),
        ('L. Small fight, the three before she joins', lambda: many(TRIO, normal_fight)),
        ('M. Jester alone vs one great foe at her level', lambda: many(['Jester'], big_foe)),
        ('N. Jester alone vs one great foe 8 levels up', lambda: many(['Jester'], big_foe, lvl_foe=8)),
        ('O. Jester alone vs one great foe 12 levels up', lambda: many(['Jester'], big_foe, lvl_foe=12)),
        ('P. Jester alone vs the whole boss fight', lambda: many(['Jester'], boss_fight)),
    ]
    for k, f in rows: print(f'{k:58s} {f()}')
    print('Share of stages her cast ends (Curtain Call): even level', ends_share(),
          '| 1 level below', ends_share(lvl_foe=-1), '| reach every foe', ends_share(rules=dict(reach='all')))
