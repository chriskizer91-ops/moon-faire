#!/usr/bin/env python3
"""check_lines.py: does a file of fair folk lines keep to TALK-KIT.md?

  python3 -I game/people/talk/check_lines.py game/people/talk/lines-A.json [more files]

Prints every fault it finds and ends with ALL GOOD or the number of faults.
Given both writers' files at once it also checks nothing is said twice across them.
"""
import json, re, sys

PEOPLE_A = ['old-lamp-seller', 'ribbon-dyer', 'fortune-teller', 'ballad-singer', 'old-lamplighter', 'farm-lad']
PEOPLE_B = ['fair-baker', 'old-night-watchman', 'pie-seller', 'gate-keeper', 'chestnut-roaster', 'captain']
PEOPLE = PEOPLE_A + PEOPLE_B
MOOR = {'old-lamplighter', 'farm-lad'}
SLOTS = {'hello': 3, 'stage': 12, 'count': 4, 'just': 4, 'gossip': 4, 'level': 3, 'lamps': 2, 'thing': 2, 'doing': 2, 'bark': 4}
NEWS = ['lamps-gone', 'first-lamp', 'wisp-warmed', 'wraith-down', 'card', 'wick', 'pie', 'flat', 'stitched', 'beacon']
JUST = ['won', 'lost', 'hurt', 'away', 'lamp']
DOING = ['work', 'rest', 'warm', 'walk', 'watch', 'chat']
HAS = ['glass', 'thread', 'stone', 'amulet', 'charm']
EMOTES = ['nod', 'shake_head', 'wave', 'greet_bow', 'shrug', 'laugh', 'point', 'think', 'surprised', 'sad', 'cross', 'beckon', 'refuse', 'thanks']
ERRAND_OF = {'old-lamp-seller': 'wick', 'old-lamplighter': 'wick', 'pie-seller': 'pie', 'captain': 'pie'}
BANNED = r"\b(level|levels|hp|mp|xp|experience points|quest|player|game|demo|zone|aethermoor|auros|thareia|envoi|snuff|mandrake)\b"
RANGES = {'stage': (0, 5), 'talks': (0, 99), 'lamps': (0, 12), 'level': (1, 20)}

faults = []
def bad(where, msg): faults.append(f'{where}: {msg}')

def rng(where, key, v):
    lo, hi = RANGES[key]
    if not (isinstance(v, list) and len(v) == 2 and all(isinstance(x, int) for x in v) and lo <= v[0] <= v[1] <= hi):
        bad(where, f'{key} must be [min, max] inside {lo} to {hi}, got {v!r}'); return None
    return v

def check_when(where, w, who, pair=False):
    if not isinstance(w, dict): bad(where, 'when must be an object'); return {}
    for k, v in w.items():
        if pair and k != 'stage': bad(where, f'a pair may only have stage, not {k}')
        if k in RANGES: rng(where, k, v)
        elif k == 'met':
            if v not in PEOPLE or v == who: bad(where, f'met must be another person\'s id, got {v!r}')
        elif k == 'heard':
            if v not in NEWS: bad(where, f'heard must be a news id, got {v!r}')
        elif k == 'just':
            if v not in JUST: bad(where, f'just must be one of {JUST}, got {v!r}')
        elif k == 'doing':
            if v not in DOING: bad(where, f'doing must be one of {DOING}, got {v!r}')
        elif k == 'has':
            if v not in HAS: bad(where, f'has must be one of {HAS}, got {v!r}')
        elif k == 'errand':
            if not (isinstance(v, dict) and len(v) == 1 and list(v)[0] in ('wick', 'pie') and list(v.values())[0] in ('open', 'done')):
                bad(where, f'errand must be {{"wick" or "pie": "open" or "done"}}, got {v!r}')
        elif k == 'where':
            if who != 'captain' or v not in ('W3', 'W8'): bad(where, 'where is only for the captain, W3 or W8')
        else: bad(where, f'unknown key in when: {k}')
    return w

def check_text(where, t, limit):
    if not isinstance(t, str) or not t.strip(): bad(where, 'no text'); return
    if len(t) > limit: bad(where, f'{len(t)} characters, the limit is {limit}: {t!r}')
    if re.search(BANNED, t, re.I): bad(where, f'a word that must not be used: {re.search(BANNED, t, re.I).group(0)!r} in {t!r}')
    if re.search(r'[—–;]|\.\.\.|…| - ', t): bad(where, f'a dash, semicolon or ellipsis in {t!r}')
    if t != t.strip(): bad(where, 'space at the start or end')

def slot_rules(where, who, slot, kind, w, seen):
    keys = set(w)
    def need(cond, msg):
        if not cond: bad(where, f'slot {slot}: {msg}')
    if slot == 'bark': need(kind == 'bark', 'kind must be bark')
    else: need(kind == 'talk', 'kind must be talk')
    if slot == 'hello':
        need(w.get('talks') == [0, 0], 'needs talks [0, 0]'); seen.setdefault('hello', []).append(tuple(w.get('stage') or ()))
    elif slot == 'stage':
        s = w.get('stage'); extra = keys - {'stage'} - ({'where'} if who == 'captain' else set())
        need(isinstance(s, list) and len(s) == 2 and s[0] == s[1], 'needs stage [n, n]'); need(not extra, f'only stage allowed, found {sorted(extra)}')
        if who == 'captain' and s == [4, 4]: need(w.get('where') == 'W8', 'the captain at stage 4 needs where W8')
        if isinstance(s, list) and s: seen.setdefault('stage', []).append(s[0])
    elif slot == 'count':
        need('talks' in w, 'needs talks'); seen.setdefault('count', []).append(tuple(w.get('talks') or ()))
    elif slot == 'just':
        need('just' in w, 'needs just'); seen.setdefault('just', []).append(w.get('just'))
    elif slot == 'gossip':
        need(('met' in w) != ('heard' in w) or ('met' in w and 'heard' in w), 'needs met or heard'); need('met' in w or 'heard' in w, 'needs met or heard')
        seen.setdefault('gossip', []).append('met' if 'met' in w and 'heard' not in w else 'heard')
    elif slot == 'level':
        need('level' in w, 'needs level'); seen.setdefault('level', []).append(tuple(w.get('level') or ()))
    elif slot == 'lamps': need('lamps' in w, 'needs lamps')
    elif slot == 'thing':
        need('has' in w or 'errand' in w, 'needs has or errand')
        if 'errand' in w and isinstance(w['errand'], dict): seen.setdefault('errand', []).append(list(w['errand'].items())[0])
    elif slot == 'doing':
        need('doing' in w, 'needs doing'); seen.setdefault('doing', []).append(w.get('doing'))
    elif slot == 'bark': seen.setdefault('bark', []).append(w)

def check_file(path, all_text):
    try: D = json.load(open(path, encoding='utf-8'))
    except Exception as e: bad(path, f'not readable as JSON: {e}'); return
    writer = D.get('writer'); mine = PEOPLE_A if writer == 'A' else PEOPLE_B if writer == 'B' else None
    if mine is None: bad(path, 'writer must be "A" or "B"'); mine = []
    P = D.get('people') or {}
    for who in mine:
        if who not in P: bad(path, f'{who} is missing')
    for who, R in P.items():
        if who not in mine: bad(path, f'{who} is not one of writer {writer}\'s people'); continue
        if not isinstance(R.get('guess'), str) or len(R.get('guess', '')) < 10: bad(who, 'needs a guess (one sentence on what they think wisps are)')
        if not isinstance(R.get('invented', []), list): bad(who, 'invented must be a list')
        L = R.get('lines') or []; count = {}; seen = {}; ids = set()
        if len(L) != 40: bad(who, f'{len(L)} lines, must be 40')
        for i, ln in enumerate(L):
            lid = ln.get('id', f'{who}#{i + 1}'); slot = ln.get('slot'); kind = ln.get('kind')
            if not re.fullmatch(re.escape(who) + r'-\d\d', str(lid)): bad(lid, 'id must be the person\'s id and a two-digit number')
            if lid in ids: bad(lid, 'id used twice')
            ids.add(lid)
            if slot not in SLOTS: bad(lid, f'unknown slot {slot!r}'); continue
            count[slot] = count.get(slot, 0) + 1
            w = check_when(lid, ln.get('when', {}), who)
            slot_rules(lid, who, slot, kind, w, seen)
            check_text(lid, ln.get('text'), 48 if kind == 'bark' else 120)
            if 'emote' in ln and ln['emote'] not in EMOTES: bad(lid, f'unknown emote {ln["emote"]!r}')
            for k in ln:
                if k not in ('id', 'slot', 'kind', 'when', 'text', 'emote'): bad(lid, f'unknown key {k}')
            if who in MOOR and w.get('doing') == 'chat': bad(lid, 'the moor people are alone: no doing chat')
            all_text.append((lid, ln.get('text') or ''))
        for s, n in SLOTS.items():
            if count.get(s, 0) != n: bad(who, f'slot {s}: {count.get(s, 0)} lines, must be {n}')
        if sorted(seen.get('hello', [])) != [(0, 1), (2, 3), (4, 5)]: bad(who, f'hello needs stage [0,1], [2,3], [4,5], got {sorted(seen.get("hello", []))}')
        if sorted(seen.get('stage', [])) != [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]: bad(who, f'stage needs two lines for each of 0 to 5, got {sorted(seen.get("stage", []))}')
        if sorted(seen.get('count', [])) != [(1, 1), (2, 4), (5, 9), (10, 99)]: bad(who, f'count needs talks [1,1], [2,4], [5,9], [10,99], got {sorted(seen.get("count", []))}')
        if len(set(seen.get('just', []))) != 4: bad(who, f'just needs four different values, got {seen.get("just")}')
        g = seen.get('gossip', [])
        if g.count('met') != 2 or g.count('heard') != 2: bad(who, f'gossip needs two met and two heard, got {g}')
        lv = sorted(seen.get('level', []))
        if len(lv) == 3 and not (lv[0][1] <= 4 and 5 <= lv[1][0] and lv[1][1] <= 14 and lv[2][0] >= 15): bad(who, f'level needs one inside [1,4], one inside [5,14], one inside [15,20], got {lv}')
        if len(set(seen.get('doing', []))) != 2: bad(who, f'doing needs two different values, got {seen.get("doing")}')
        if who in ERRAND_OF:
            e = sorted(seen.get('errand', []))
            if e != [(ERRAND_OF[who], 'done'), (ERRAND_OF[who], 'open')]: bad(who, f'thing must be the {ERRAND_OF[who]} errand, open and done, got {e}')
        b = seen.get('bark', [])
        if not any(x.get('talks') == [0, 0] for x in b): bad(who, 'bark: one needs talks [0, 0]')
        if not any(isinstance(x.get('talks'), list) and x['talks'][0] >= 3 for x in b): bad(who, 'bark: one needs talks [3, 99]')
        if not any(isinstance(x.get('stage'), list) and x['stage'][0] >= 2 and x['stage'][1] <= 4 for x in b): bad(who, 'bark: one needs stage inside [2, 4]')
    # pairs
    pairs = D.get('pairs') or []; own = other = 0; per = {}
    if len(pairs) != 14: bad(path, f'{len(pairs)} pairs, must be 14')
    pid = set()
    for i, pr in enumerate(pairs):
        w = pr.get('id', f'pair#{i + 1}')
        if w in pid: bad(w, 'pair id used twice')
        pid.add(w)
        who = pr.get('who') or []
        if len(who) != 2 or any(x not in PEOPLE for x in who) or who[0] == who[1]: bad(w, f'who must be two different people, got {who}'); continue
        if any(x in MOOR for x in who): bad(w, 'the lamplighter and the farm lad have no pairs')
        n_mine = sum(1 for x in who if x in mine)
        if n_mine == 2: own += 1
        elif n_mine == 1: other += 1
        else: bad(w, 'neither person is yours')
        for x in who:
            if x in mine: per[x] = per.get(x, 0) + 1
        check_when(w, pr.get('when', {}), None, pair=True)
        if 'news' in pr and pr['news'] not in NEWS: bad(w, f'unknown news {pr["news"]!r}')
        L = pr.get('lines') or []
        if not 2 <= len(L) <= 4: bad(w, f'{len(L)} lines, must be 2 to 4')
        for j, ln in enumerate(L):
            if ln.get('by') not in who: bad(w, f'line {j + 1} is by {ln.get("by")!r}, not one of the two')
            if j and ln.get('by') == L[j - 1].get('by'): bad(w, f'line {j + 1}: the same person speaks twice running')
            check_text(f'{w} line {j + 1}', ln.get('text'), 90)
            all_text.append((f'{w}.{j + 1}', ln.get('text') or ''))
    if pairs and (own != 10 or other != 4): bad(path, f'pairs: {own} among your own and {other} with the other writer\'s people, must be 10 and 4')
    for x in mine:
        if x not in MOOR and pairs and per.get(x, 0) < 3: bad(path, f'{x} is in {per.get(x, 0)} pairs, must be at least 3')

def main():
    paths = sys.argv[1:]
    if not paths: print(__doc__); sys.exit(2)
    all_text = []
    for p in paths: check_file(p, all_text)
    # nothing said twice
    norm = {}
    for lid, t in all_text:
        k = re.sub(r'[^a-z ]', '', t.lower()).strip()
        if k and k in norm: bad(lid, f'the same words as {norm[k]}')
        norm.setdefault(k, lid)
    for f in faults: print('FAULT', f)
    print(f'{len(all_text)} lines read.')
    print('ALL GOOD' if not faults else f'{len(faults)} faults')
    sys.exit(0 if not faults else 1)

main()
