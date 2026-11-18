# The light page as ONE html file (deliver/moon_faire_base_doll_light.html): the light site's index.html with every file it would fetch
# (wardrobe_light/<code>_light.js, wardrobe/<code>.js, the bun, the kept pieces' paintings) inside it as unrun text blocks; the page's
# script() runs a block the first time it is asked for, the same way it would have loaded the file.
import os, json
SITE = '/home/claude/io/deliver/doll_light_site/'; OUT = '/home/claude/io/deliver/moon_faire_base_doll_light.html'
t = open(SITE + 'index.html').read()
old = """  const script = (f) => scriptP[f] || (scriptP[f] = new Promise((ok, bad) => { const s = document.createElement('script'); s.src = f + '.js'; s.onload = ok;"""
new = """  // one-file version: each file is a <script type="text/plain" data-f="..."> block below; it is run once, the first time it is asked for
  const inlineRun = (f) => { const el = document.querySelector('script[data-f="' + f + '"]'); if (!el) return false;
    const s = document.createElement('script'); s.textContent = el.textContent; el.remove(); document.head.appendChild(s); return true; };
  const domIn = new Promise((ok) => { if (document.readyState !== 'loading') ok(); else document.addEventListener('DOMContentLoaded', ok); });
  const script = (f) => scriptP[f] || (scriptP[f] = domIn.then(() => new Promise((ok, bad) => { if (inlineRun(f)) return setTimeout(ok, 0); const s = document.createElement('script'); s.src = f + '.js'; s.onload = ok;"""
assert t.count(old) == 1; t = t.replace(old, new)
old2 = """    s.onerror = () => { delete scriptP[f]; bad(new Error('could not load ' + f)); }; document.head.appendChild(s); }));"""
assert t.count(old2) == 1; t = t.replace(old2, old2[:-4] + '})));')
blocks = []
for d in ('wardrobe', 'wardrobe_light'):
    for f in sorted(os.listdir(SITE + d)):
        js = open(SITE + d + '/' + f).read()
        assert '</script' not in js.lower(), f
        blocks.append('<script type="text/plain" data-f="%s/%s">%s</script>' % (d, f[:-3], js))
i = t.rindex('</body>')
t = t[:i] + '\n'.join(blocks) + '\n' + t[i:]
open(OUT, 'w').write(t)
print(OUT, round(len(t.encode()) / 1048576, 1), 'MiB,', len(blocks), 'files inside')
