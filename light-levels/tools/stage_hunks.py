# stage_hunks.py: the finer Flipbook look as a list of (old text, new text) pairs, read from two copies of stage.js (before and after).
# usage: python3 stage_hunks.py <old stage.js> <new stage.js>  -> prints how many pairs; import hunks() to use them
import difflib, sys
def hunks(old, new):
    a = old.split('\n'); b = new.split('\n'); out = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == 'equal': continue
        if i1 == i2: i1 -= 1; j1 -= 1                     # a pure insertion: carry the line before it, so there is something to find
        out.append(('\n'.join(a[i1:i2]), '\n'.join(b[j1:j2])))
    return out
if __name__ == '__main__':
    o = open(sys.argv[1], encoding='utf-8').read(); n = open(sys.argv[2], encoding='utf-8').read(); H = hunks(o, n)
    s = o
    for x, y in H: assert s.count(x) == 1, x[:80]; s = s.replace(x, y)
    assert s == n; print(len(H), 'pairs;', sum(len(x) for x, _ in H), 'characters to find')
    for x, y in H: print('---', len(x), '->', len(y)); print(x[:160].replace('\n', ' / '))
