# Builds people/out/moon-faire-people.html: the results of the template test and a person maker, as one offline file.
# Run from game/: python3 people/kit/build_maker.py
import base64, glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '..', '..'); sys.path.insert(0, HERE)
from build_viewer import scripts, rd
RUNS = os.path.join(GAME, 'people', 'runs')
ORDER = ['fortune', 'watchman', 'baker', 'farmhand']
VARIANTS = [('claude-fable-5-2@high', 'Fable 5.2, high effort'), ('claude-opus-5-5@high', 'Opus 5.5, high effort'), ('claude-opus-5-5@xhigh', 'Opus 5.5, extra-high effort'), ('claude-opus-5-5', 'Opus 5.5, default effort'), ('claude-sonnet-5-5', 'Sonnet 5.5'), ('claude-haiku-5-5', 'Haiku 5.5')]
NEW = 3          # the first two variants are the second test (written for a person seen up close, up to three fixes)
PNAMES = {'fortune': 'Fortune-teller', 'watchman': 'Night-watchman', 'baker': 'Baker', 'farmhand': 'Farm lad'}; MN = dict(VARIANTS)
NOTES = {'claude-fable-5-2@high': 'Third test, made by Fable 5.2 through the key. About level with Opus at high effort, a little neater in places (bell sleeves, a hat band, a towel at the belt), for nearly three times the price.',
         'claude-opus-5-5@high': 'A clear step up: pockets, apron ties, a neckerchief, trim on the sleeves, belts with buckles. The fortune-teller stands beside the lamp-seller. The men are still held back by the template body and face.',
         'claude-opus-5-5@xhigh': 'A few more touches (a lantern in the hand, a feather in the hat, a dotted scarf) for three to five times the price and the wait. Not worth it over high.',
         'claude-opus-5-5': 'First test. Readable from a distance, plain up close.', 'claude-sonnet-5-5': 'First test. Much like Opus at its default.', 'claude-haiku-5-5': 'First test. Recognisable but rough.'}
uri = lambda p: 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
money = lambda v: '$%.2f' % v if v >= 1 else '%.*f cents' % (2 if v < 0.01 else 1 if v < 0.1 else 0, v * 100)
people, shots, models, total = [], [], [], 0.0
# ---------- the painted people: Chris's skins laid on the models, fitted by Fable 5.2 through the key ----------
SKINS = os.path.join(GAME, 'people', 'skins'); PAINTED = os.path.join(GAME, 'people', 'painted'); skins = {}; paint_cost = 0.0; paint_secs = 0.0; paint_n = 0
webp = lambda p: 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
MAKER = {'hand': 'the lamp-seller model', 'fable': 'the Fable 5.2 model', 'opus': 'the Opus 5.5 model'}
for tag in ['hand', 'fable', 'opus']:
    for pid in ['lampseller'] + ORDER:
        sj = json.load(open(os.path.join(SKINS, pid, 'skins.json')))
        for i, k in enumerate(sj['skins']):
            L = 'ABC'[i]; d = os.path.join(PAINTED, '%s-%s__%s' % (pid, L, tag))
            if not os.path.exists(d + '/log.json'): continue
            lg = json.load(open(d + '/log.json')); j = json.load(open(os.path.join(SKINS, pid, L + '.json'))); key = '%s-%s' % (pid, L)
            skins[key] = {'body': webp(os.path.join(SKINS, pid, L + '-body.webp')), 'face': webp(os.path.join(SKINS, pid, L + '-face.webp')), 'fit': j['fit'], 'faceFit': j.get('faceFit', [1, 0, 0]), 'skin': j['skin']}
            paint_cost += lg['cost']; paint_secs += lg['seconds']; paint_n += 1
            people.append({'name': k['name'][0].upper() + k['name'][1:], 'model': 'painted-' + tag, 'desc': k['who'], 'code': open(os.path.join(GAME, 'people', lg['person'])).read(), 'cost': lg['cost'], 'skin': key, 'skinText': open(d + '/skin.js').read(), 'scale': json.load(open(d + '/person-scale.json')) if os.path.exists(d + '/person-scale.json') else {}})
            shots.append({'src': uri(d + '/final.jpg'), 'caption': '%s, painted on %s. Fitting by Fable 5.2: %s, %d s. %s' % (people[-1]['name'], MAKER[tag], money(lg['cost']), lg['seconds'], k['who'])})
people.append({'name': 'Lamp-seller', 'model': 'hand', 'desc': 'An old woman who sells lamps: grey hair in a bun under an ochre kerchief, a moss-green bodice, a long rust skirt and a cream apron.', 'code': rd('people/lampseller.js'), 'cost': 0})
people[-1]['name'] = 'Lamp-seller, flat colours'
for k, (v, vn) in enumerate(VARIANTS):
    for pid in ORDER:
        d = os.path.join(RUNS, '%s__%s' % (pid, v)); L = json.load(open(d + '/log.json')); fixes = sum(1 for r in L['rounds'] if r.get('said') == 'file') - 1
        people.append({'name': PNAMES[pid], 'model': v, 'desc': L['desc'], 'code': open('%s/v%d.js' % (d, L['final'])).read(), 'cost': L['cost']})
        if False: shots.append({'src': uri(d + '/final.jpg'), 'caption': '%s, by %s: %s, %d s, %s. "%s"' % (PNAMES[pid], vn, money(L['cost']), L['seconds'], ['no fixes', 'fixed once', 'fixed twice', 'fixed three times'][min(3, fixes)], L['desc'])})
    Ls = [json.load(open(os.path.join(RUNS, '%s__%s' % (pid, v), 'log.json'))) for pid in ORDER]; n = len(Ls); total += sum(L['cost'] for L in Ls)
    models.append({'model': v, 'each': sum(L['cost'] for L in Ls) / n, 'first': sum(L['rounds'][0]['cost'] for L in Ls) / n, 'secs': sum(L['seconds'] for L in Ls) / n, 'note': NOTES[v]})
data = 'window.MF_PEOPLE_DATA = ' + json.dumps({'people': people, 'shots': shots, 'models': models, 'skins': skins, 'paint': {'each': paint_cost / max(1, paint_n), 'secs': paint_secs / max(1, paint_n), 'n': paint_n}, 'names': dict(VARIANTS), 'kit': rd('people/kit/PERSON-KIT.md')}).replace('</', '<\\/') + ';'
parts = scripts() + [data]
page = rd('people/kit/maker.tpl.html').replace('/*TOTAL*/', '$%.2f' % (total + paint_cost + float(os.environ.get('MF_EXTRA_COST', '0')))).replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in parts))
out = os.path.join(GAME, 'people', 'out', 'moon-faire-people.html'); open(out, 'w', encoding='utf-8').write(page)
print('people page', len(page) // 1024, 'KB', 'runs $%.3f' % total, 'painting $%.3f' % paint_cost, 'each $%.3f %.0fs' % (paint_cost / paint_n, paint_secs / paint_n))
