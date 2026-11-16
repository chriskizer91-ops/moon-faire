# Draws the light version on the fair folk kit's test stage (front, three-quarter, side, back, walking, face twice), with his paint.
#   python3 npc/look.py <out.jpg> [weight json: '{"keep":{...},"rest":0.5,"scale":1}']      Needs the kit's stage: KIT below
import asyncio, base64, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); NPC = os.path.join(ROOT, 'npc')
KIT = os.environ.get('KIT', '/home/claude/sw/game/people/kit'); sys.path.insert(0, KIT)
from shoot import Shooter
uri = lambda p, t: 'data:image/%s;base64,' % t + base64.b64encode(open(p, 'rb').read()).decode()
def skin():
    f = json.load(open(os.path.join(NPC, 'fit.json'))); sk = os.path.join(NPC, 'skin.js')
    d = {'body': uri(os.path.join(NPC, 'body.webp'), 'webp'), 'face': uri(os.path.join(NPC, 'face.webp'), 'webp'), 'fit': f['fit'], 'faceFit': f['faceFit'], 'skin': f['skin']}
    if os.path.exists(sk): d['SKIN_TEXT'] = open(sk).read()
    return d
def code(weight=None):
    c = open(os.path.join(NPC, 'person.js')).read()
    if weight: c += '\nPERSON.weight = %s;\n' % weight
    return c
async def main():
    s = await Shooter().start()
    facts, sheet = await s.shoot(code(sys.argv[2] if len(sys.argv) > 2 else None), 1.0, skin())
    tri = facts.get('partTris') or facts.get('tris') or {}
    print(json.dumps({k: v for k, v in facts.items() if k not in ('partNames',)})[:1500])
    if sheet: sheet.save(sys.argv[1], quality=88)
    await s.stop()
if __name__ == '__main__': asyncio.run(main())
