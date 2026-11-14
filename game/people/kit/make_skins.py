# For one person model, makes the painting guide and asks Claude Opus 5.5 (through the key) to write two or three "skins":
# different people who can be painted onto the same shapes. Saves people/skins/<id>/guide.png and skins.json.
#   python3 people/kit/make_skins.py <id> <person.js> <how many> "<the person as first described>"
import asyncio, base64, io, json, os, re, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
from guides import guide, FRAME
import make_person as MP
MODEL, EFFORT = 'claude-opus-5-5', 'high'
RULES = '''You write painting briefs for a painted fantasy game about a travelling night fair. A simple 3D model of one person exists. A painter will paint over a grey guide of it (front and back), and the painting is laid back onto the model as its skin. The same model gets several skins, so that one set of shapes becomes several different people.

You are shown the guide and the file that built the shapes. The shapes cannot change: the same hat or headcloth, the same hair shape, the same outline of every garment, the same body. Only what is painted changes: who the person is, their age, skin and face, hair colour, what each garment is made of, its colours, patterns, trim, wear, patches, embroidery, buttons, jewellery painted flat on the cloth. Do not ask for anything that sticks out past the shapes or is held in the hands.

Write the number of skins asked for. The first skin is the person as first described. The others are clearly different people: different colours at a glance, a different age or trade, a different mood. A skin may be a man only where the shapes allow it (a coat, robe, tunic or hat, no skirt and apron). Ordinary fair folk: sellers, performers, hands, travellers. No names of people or places, no magic effects, no weapons, no text on clothes.

Reply with JSON only, a list, each item:
{"key": "one lowercase word", "name": "two or three words, a trade or role", "who": "one plain sentence",
 "body": "three to five sentences for the painter, going from head to foot: head covering and hair, each garment the guide shows with its cloth, colour and pattern, trim and signs of wear, boots, hands and skin",
 "face": "two or three sentences for a close-up of the face: age, sex, skin, eyes, brows, lips, marks or lines; the expression is calm with the mouth closed"}
Plain words. Name colours simply (rust, moss green, cream), never hex codes.'''
async def main():
    pid, path, n, desc = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
    code = open(path, encoding='utf-8').read(); d = os.path.join(HERE, '..', 'skins', pid); os.makedirs(d, exist_ok=True)
    s = await Shooter().start(); im = await guide(s, code); await s.stop(); im.save(os.path.join(d, 'guide.png'))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=85)
    MP.KIT = RULES
    t0 = time.time(); res = MP.ask(MODEL, [{'role': 'user', 'content': [{'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}},
        {'type': 'text', 'text': 'The person as first described: %s\n\nSkins wanted: %d\n\nThe file that built the shapes:\n%s' % (desc, n, code)}]}], 16000, EFFORT)
    text = ''.join(x.get('text', '') for x in res['content'] if x['type'] == 'text'); skins, _ = json.JSONDecoder().raw_decode(text[text.index('['):])
    out = {'id': pid, 'desc': desc, 'file': os.path.relpath(path, os.path.join(HERE, '..')), 'frame': FRAME, 'skins': skins, 'written_by': MODEL + '@' + EFFORT, 'cost': MP.cost(MODEL, res['usage']), 'seconds': round(time.time() - t0, 1)}
    json.dump(out, open(os.path.join(d, 'skins.json'), 'w'), indent=1); print(pid, [k['name'] for k in skins], '$%.3f' % out['cost'], '%ss' % out['seconds'])
asyncio.run(main())
