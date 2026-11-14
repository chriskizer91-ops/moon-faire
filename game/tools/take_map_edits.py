# take_map_edits.py: puts what Chris traced in the map editor into the game. Run from game/: python3 tools/take_map_edits.py <file.json>
# The file is either the text of the editor's "Copy my work" ({"maps": {"W2": {...}, ...}}), or the documents read from the editor page's
# store, collection "edits" (a list of {"id": "W2", "data": {...}}, or {"W2": {...}}). Each map's document is written, as it came, to
# world/maps/edits/<id>.json; build_walk.py lays it over the starting shapes. Positions are in the painting's own 1774 x 887 pixels.
# Delete a file there to go back to that place's starting shapes.
import json, os, sys
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(G, 'world', 'maps', 'edits'); os.makedirs(OUT, exist_ok=True)
J = json.load(open(sys.argv[1], encoding='utf-8')); known = set(json.load(open(os.path.join(G, 'world', 'maps', 'start.json'))))
if isinstance(J, dict) and isinstance(J.get('maps'), dict): J = J['maps']
if isinstance(J, list): J = {d.get('id'): d.get('data', d) for d in J}
n = 0
for mid, doc in sorted(J.items()):
    if mid not in known or not isinstance(doc, dict): print('skipped', mid); continue
    bad = [k for k in ('walk', 'block') if k in doc and not all(isinstance(p, list) and len(p) >= 3 for p in doc[k])]
    if bad: print(mid, 'has a shape with fewer than three points in', bad, ': not taken'); continue
    json.dump(doc, open(os.path.join(OUT, mid + '.json'), 'w', encoding='utf-8'), indent=1); n += 1
    print(mid, {k: (len(v) if isinstance(v, (list, dict)) else v) for k, v in doc.items()})
print(n, 'maps taken. Now: python3 build_walk.py')
