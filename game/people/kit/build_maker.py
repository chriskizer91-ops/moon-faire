# Builds people/out/moon-faire-people.html: the results of the template test and a person maker, as one offline file.
# Run from game/: python3 people/kit/build_maker.py
import base64, glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '..', '..'); sys.path.insert(0, HERE)
from build_viewer import scripts, rd
RUNS = os.path.join(GAME, 'people', 'runs')
ORDER = ['fortune', 'watchman', 'baker', 'farmhand']; MODELS = ['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-haiku-5-5']
NAMES = {'fortune': 'Fortune-teller', 'watchman': 'Night-watchman', 'baker': 'Baker', 'farmhand': 'Farm lad'}; MN = {'claude-haiku-5-5': 'Haiku 5.5', 'claude-sonnet-5-5': 'Sonnet 5.5', 'claude-opus-5-5': 'Opus 5.5'}
NOTES = {'claude-haiku-5-5': 'You can tell who each one is, but the details are rough: a beard that is a white ball, a sash that hangs like a strap. Once it called its first try finished without fixing anything.',
         'claude-sonnet-5-5': 'Clean and easy to read. The best sashes, scarves and hats of the three, and it fixed its own mistakes after one look.',
         'claude-opus-5-5': 'About the same as Sonnet here, a little more careful to cover the body with a coat or tunic, for half as much again.'}
uri = lambda p: 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
money = lambda v: '$%.2f' % v if v >= 1 else '%.*f cents' % (2 if v < 0.01 else 1 if v < 0.1 else 0, v * 100)
people, shots, models, total = [], [], [], 0.0
for pid in ORDER:
    for m in MODELS:
        d = os.path.join(RUNS, '%s__%s' % (pid, m)); L = json.load(open(d + '/log.json')); fixes = sum(1 for r in L['rounds'] if r.get('said') == 'file') - 1
        people.append({'name': NAMES[pid], 'model': m, 'desc': L['desc'], 'code': open('%s/v%d.js' % (d, L['final'])).read(), 'cost': L['cost']})
        shots.append({'src': uri(d + '/final.jpg'), 'caption': '%s, by %s: %s, %s. "%s"' % (NAMES[pid], MN[m], money(L['cost']), ['no fixes', 'fixed once', 'fixed twice'][min(2, fixes)] + ('' if L['final'] == len([r for r in L['rounds'] if r.get('said') == 'file']) else ''), L['desc'])})
for m in ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5']:
    Ls = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(RUNS, '*__%s' % m, 'log.json')))]; n = len(Ls); total += sum(L['cost'] for L in Ls)
    models.append({'model': m, 'each': sum(L['cost'] for L in Ls) / n, 'first': sum(L['rounds'][0]['cost'] for L in Ls) / n, 'secs': sum(L['seconds'] for L in Ls) / n, 'note': NOTES[m]})
people.append({'name': 'Lamp-seller', 'model': 'hand', 'desc': 'An old woman who sells lamps: grey hair in a bun under an ochre kerchief, a moss-green bodice, a long rust skirt and a cream apron.', 'code': rd('people/lampseller.js'), 'cost': 0})
shots.append({'src': uri(os.path.join(RUNS, 'lampseller.jpg')), 'caption': 'Lamp-seller, made by hand as the worked example the models are given.'})
data = 'window.MF_PEOPLE_DATA = ' + json.dumps({'people': people, 'shots': shots, 'models': models, 'kit': rd('people/kit/PERSON-KIT.md')}).replace('</', '<\\/') + ';'
parts = scripts() + [data]
page = rd('people/kit/maker.tpl.html').replace('/*TOTAL*/', '$%.2f' % (total + float(os.environ.get('MF_EXTRA_COST', '0')))).replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
out = os.path.join(GAME, 'people', 'out', 'moon-faire-people.html'); open(out, 'w', encoding='utf-8').write(page)
print('people page', len(page) // 1024, 'KB', 'total $%.3f' % total)
