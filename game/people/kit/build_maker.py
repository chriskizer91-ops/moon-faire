# Builds people/out/moon-faire-people.html: the results of the template test and a person maker, as one offline file.
# Run from game/: python3 people/kit/build_maker.py
import base64, glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '..', '..'); sys.path.insert(0, HERE)
from build_viewer import scripts, rd
RUNS = os.path.join(GAME, 'people', 'runs')
ORDER = ['fortune', 'watchman', 'baker', 'farmhand']
VARIANTS = [('claude-opus-5-5@high', 'Opus 5.5, high effort'), ('claude-opus-5-5@xhigh', 'Opus 5.5, extra-high effort'), ('claude-opus-5-5', 'Opus 5.5, default effort'), ('claude-sonnet-5-5', 'Sonnet 5.5'), ('claude-haiku-5-5', 'Haiku 5.5')]
NEW = 2          # the first two variants are the second test (written for a person seen up close, up to three fixes)
NAMES = {'fortune': 'Fortune-teller', 'watchman': 'Night-watchman', 'baker': 'Baker', 'farmhand': 'Farm lad'}; MN = dict(VARIANTS)
NOTES = {'claude-opus-5-5@high': 'A clear step up: pockets, apron ties, a neckerchief, trim on the sleeves, belts with buckles. The fortune-teller stands beside the lamp-seller. The men are still held back by the template body and face.',
         'claude-opus-5-5@xhigh': 'A few more touches (a lantern in the hand, a feather in the hat, a dotted scarf) for three to five times the price and the wait. Not worth it over high.',
         'claude-opus-5-5': 'First test. Readable from a distance, plain up close.', 'claude-sonnet-5-5': 'First test. Much like Opus at its default.', 'claude-haiku-5-5': 'First test. Recognisable but rough.'}
uri = lambda p: 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
money = lambda v: '$%.2f' % v if v >= 1 else '%.*f cents' % (2 if v < 0.01 else 1 if v < 0.1 else 0, v * 100)
people, shots, models, total = [], [], [], 0.0
people.append({'name': 'Lamp-seller', 'model': 'hand', 'desc': 'An old woman who sells lamps: grey hair in a bun under an ochre kerchief, a moss-green bodice, a long rust skirt and a cream apron.', 'code': rd('people/lampseller.js'), 'cost': 0})
shots.append({'src': uri(os.path.join(RUNS, 'lampseller.jpg')), 'caption': 'Lamp-seller, made by hand by Claude Fable 5.2 in the session that built the kit. She is the worked example every model is given.'})
for k, (v, vn) in enumerate(VARIANTS):
    for pid in ORDER:
        d = os.path.join(RUNS, '%s__%s' % (pid, v)); L = json.load(open(d + '/log.json')); fixes = sum(1 for r in L['rounds'] if r.get('said') == 'file') - 1
        people.append({'name': NAMES[pid], 'model': v, 'desc': L['desc'], 'code': open('%s/v%d.js' % (d, L['final'])).read(), 'cost': L['cost']})
        if k < NEW: shots.append({'src': uri(d + '/final.jpg'), 'caption': '%s, by %s: %s, %d s, %s. "%s"' % (NAMES[pid], vn, money(L['cost']), L['seconds'], ['no fixes', 'fixed once', 'fixed twice', 'fixed three times'][min(3, fixes)], L['desc'])})
    Ls = [json.load(open(os.path.join(RUNS, '%s__%s' % (pid, v), 'log.json'))) for pid in ORDER]; n = len(Ls); total += sum(L['cost'] for L in Ls)
    models.append({'model': v, 'each': sum(L['cost'] for L in Ls) / n, 'first': sum(L['rounds'][0]['cost'] for L in Ls) / n, 'secs': sum(L['seconds'] for L in Ls) / n, 'note': NOTES[v]})
data = 'window.MF_PEOPLE_DATA = ' + json.dumps({'people': people, 'shots': shots, 'models': models, 'names': dict(VARIANTS), 'kit': rd('people/kit/PERSON-KIT.md')}).replace('</', '<\\/') + ';'
parts = scripts() + [data]
page = rd('people/kit/maker.tpl.html').replace('/*TOTAL*/', '$%.2f' % (total + float(os.environ.get('MF_EXTRA_COST', '0')))).replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
out = os.path.join(GAME, 'people', 'out', 'moon-faire-people.html'); open(out, 'w', encoding='utf-8').write(page)
print('people page', len(page) // 1024, 'KB', 'total $%.3f' % total)
