# Builds Io's reference page (one HTML file with the images inside it), the project note (markdown) and the starter zip.
# Usage: python3 build_io_page.py <refs_dir> <out_dir>
import base64, html, os, re, sys, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import io_data as D

REFS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
E = html.escape
IM = {c: (f, t, d, k) for c, f, t, d, k in D.IMAGES}
ROUND_NOTE = {1: "enough to start building", 2: "details, cloth and tools", 3: "moves and magic", 4: "the Guardian and extras"}
total = sum(len(s["prompts"]) for s in D.SETS)
per_round = {r: sum(len(s["prompts"]) for s in D.SETS if s["round"] == r) for r in (1, 2, 3, 4)}
assert total == 104 and per_round == {1: 43, 2: 21, 3: 26, 4: 14}, (total, per_round)
codes = [p[0] for s in D.SETS for p in s["prompts"]]
assert len(set(codes)) == len(codes)
for s in D.SETS:
    for p in s["prompts"]:
        for a in p[4]:
            if a.startswith("your kept "):
                assert a[10:] in codes, a
                assert codes.index(a[10:]) < codes.index(p[0]), (p[0], a)  # only ever asks for something made earlier
            else:
                assert a in IM, a
        assert p[6].startswith(("Tall image, portrait 2:3.", "Wide image, landscape 3:2.", "Square image.")), p[0]
        assert p[2] == {"T": D.T, "W": D.W, "S": D.Q}[p[6][0]], p[0]

def b64(fn):
    with open(os.path.join(REFS, fn), "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()

def chip(a):
    if a in IM:
        return '<button class="att" type="button" data-im="%s">%s</button>' % (a, a)
    return '<span class="att kept">%s</span>' % E(a)

def copy_block(pid, text, label):
    return ('<div class="pb"><pre class="p" id="%s">%s</pre><button class="copy" type="button" data-p="%s">%s</button></div>'
            % (pid, E(text), pid, label))

CSS = """
*{box-sizing:border-box}
:root{--bg:#211a29;--panel:#2b2236;--well:#19131f;--line:#4b3d5d;--ink:#f4edf7;--muted:#bcadc9;--gold:#f0c56b;--wine:#c2486a;--sage:#a9c79b;color-scheme:dark}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:780px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-right)) 80px max(16px,env(safe-area-inset-left))}
h1,h2,h3{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-weight:600;text-wrap:balance}
h1{font-size:clamp(30px,8vw,44px);line-height:1.05;margin:26px 0 6px;color:var(--gold)}
.sub{color:var(--muted);margin:0 0 4px}
h2{font-size:24px;margin:44px 0 6px;color:var(--gold);scroll-margin-top:60px}
h2 small{font:600 12px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--bg);background:var(--sage);border-radius:99px;padding:3px 10px;margin-left:8px;vertical-align:middle;white-space:nowrap}
h3{font-size:19px;margin:0}
p,li{max-width:68ch}
ul,ol{padding-left:22px;margin:8px 0}
li{margin:6px 0}
b{color:#fff}
nav{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
nav div{display:flex;gap:6px;overflow-x:auto;padding:8px max(16px,env(safe-area-inset-right)) 8px max(16px,env(safe-area-inset-left));scrollbar-width:none;max-width:780px;margin:0 auto}
nav a{flex:0 0 auto;color:var(--ink);text-decoration:none;font-weight:600;font-size:14px;padding:6px 11px;border:1px solid var(--line);border-radius:99px;background:var(--panel)}
nav a.r{border-color:var(--sage);color:var(--sage)}
.note{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--wine);border-radius:10px;padding:12px 14px;margin:14px 0}
.note h3{margin-bottom:4px}
dl{margin:8px 0 0}
dt{font-weight:700;color:var(--gold);margin-top:10px}
dd{margin:2px 0 0;color:var(--ink)}
.count{font-variant-numeric:tabular-nums;color:var(--muted);font-size:14px;margin:6px 0 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:12px 0}
figure{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
figure button.im{all:unset;cursor:zoom-in;display:block;background:#3B2F43;aspect-ratio:1/1}
figure img{display:block;width:100%;height:100%;object-fit:contain}
figcaption{padding:8px 10px 10px;font-size:13.5px;color:var(--muted);display:flex;flex-direction:column;gap:4px;flex:1}
figcaption b{font-size:15px}
figcaption .code{display:inline-block;background:var(--gold);color:#221a10;font-weight:800;border-radius:6px;padding:0 7px;margin-right:6px}
a.save{margin-top:auto;align-self:flex-start;color:var(--gold);font-weight:700;font-size:14px;padding:6px 0;text-decoration:underline;text-underline-offset:3px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;margin:14px 0;scroll-margin-top:60px}
.card.done{opacity:.55}
.card header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}
.code{font-weight:800}
.card .code{background:var(--gold);color:#221a10;border-radius:7px;padding:1px 9px;font-size:16px}
.shape{font-size:12.5px;font-weight:700;letter-spacing:.04em;color:var(--sage);border:1px solid var(--sage);border-radius:99px;padding:1px 9px;white-space:nowrap}
.why{color:var(--muted);margin:6px 0 0;font-size:15px}
.src{color:var(--sage);font-size:14px;margin:4px 0 0}
.attach{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:10px 0 0;font-size:14px;font-weight:700;color:var(--wine)}
.att{font:700 13.5px system-ui,sans-serif;color:var(--ink);background:#4a2334;border:1px solid var(--wine);border-radius:7px;padding:5px 9px}
button.att{cursor:pointer}
.att.kept{background:transparent;border-style:dashed;color:var(--muted);font-weight:600}
.pb{margin-top:10px}
pre.p{margin:0;background:var(--well);border:1px solid var(--line);border-radius:10px;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere;font:14.5px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#e9e0ee;-webkit-user-select:all;user-select:all}
pre.p.long{max-height:260px;overflow:auto}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-top:10px}
button.copy{font:700 15px system-ui,sans-serif;background:var(--gold);color:#221a10;border:0;border-radius:9px;padding:11px 18px;cursor:pointer;margin-top:10px;min-height:44px}
button.copy.ok{background:var(--sage)}
label.kept{display:inline-flex;align-items:center;gap:8px;font-weight:600;color:var(--muted);min-height:44px;cursor:pointer}
label.kept input{width:22px;height:22px;accent-color:var(--sage)}
.plan{display:grid;gap:10px;margin:12px 0}
.plan div{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.plan b{display:block;font-size:16.5px}
.plan i{font-style:normal;color:var(--sage);font-size:14px}
.plan span{display:block;margin-top:3px}
.small{font-size:14px;color:var(--muted)}
#box{position:fixed;inset:0;z-index:20;background:rgba(12,8,16,.96);display:none;flex-direction:column}
#box.on{display:flex}
#box .bar{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--line)}
#box .bar b{flex:1;font-size:15px}
#box .bar a,#box .bar button{font:700 15px system-ui,sans-serif;color:#221a10;background:var(--gold);border:0;border-radius:8px;padding:9px 14px;text-decoration:none;cursor:pointer}
#box .bar button{background:var(--panel);color:var(--ink);border:1px solid var(--line)}
#box .view{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}
#box img{display:block;width:100%;height:auto;margin:auto}
#box img.big{width:auto;max-width:none}
:focus-visible{outline:3px solid var(--sage);outline-offset:2px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
"""

JS = """
(function(){
  var IM=%s;
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function flash(btn){var o=btn.getAttribute('data-l')||btn.textContent;btn.setAttribute('data-l',o);btn.textContent='Copied';btn.classList.add('ok');setTimeout(function(){btn.textContent=o;btn.classList.remove('ok')},1500)}
  function oldCopy(t,btn){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.focus();ta.select();try{ta.setSelectionRange(0,t.length)}catch(e){}var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);if(ok)flash(btn);else{btn.textContent='Press and hold the text to copy'}}
  $$('button.copy').forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-p')).textContent;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){flash(b)},function(){oldCopy(t,b)})}else oldCopy(t,b)})});
  // the reference images: one copy in the page; the save links and the big view borrow it
  $$('a.save').forEach(function(a){var c=a.getAttribute('data-im');a.href=document.getElementById('im-'+c).src;a.setAttribute('download',IM[c][0])});
  var box=$('#box'),bimg=$('#box img'),bt=$('#box .bar b'),bs=$('#box .bar a'),last=null;
  function open(c,from){last=from||null;bimg.src=document.getElementById('im-'+c).src;bimg.alt=IM[c][1];bimg.classList.remove('big');bt.textContent=c+' \\u00b7 '+IM[c][1];bs.href=bimg.src;bs.setAttribute('download',IM[c][0]);box.classList.add('on');$('#box .bar button').focus()}
  function close(){box.classList.remove('on');bimg.removeAttribute('src');if(last)last.focus()}
  $$('[data-im]').forEach(function(b){if(b.tagName==='BUTTON')b.addEventListener('click',function(){open(b.getAttribute('data-im'),b)})});
  $('#box .bar button').addEventListener('click',close);
  bimg.addEventListener('click',function(){bimg.classList.toggle('big')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('on'))close()});
  // which paintings are kept: remembered on this device when the browser allows it
  var KEY='io-reference-kept-v1',kept={};
  try{kept=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){kept={}}
  function tally(){var all=$$('input[data-k]'),n=all.filter(function(i){return i.checked}).length;$('#tally').textContent=n+' of '+all.length+' kept';[1,2,3,4].forEach(function(r){var rs=all.filter(function(i){return i.getAttribute('data-r')==r});var el=document.getElementById('tally-'+r);if(el)el.textContent=rs.filter(function(i){return i.checked}).length+' of '+rs.length})}
  $$('input[data-k]').forEach(function(i){var k=i.getAttribute('data-k');i.checked=!!kept[k];i.closest('.card').classList.toggle('done',i.checked);i.addEventListener('change',function(){kept[k]=i.checked;i.closest('.card').classList.toggle('done',i.checked);try{localStorage.setItem(KEY,JSON.stringify(kept))}catch(e){}tally()})});
  tally();
})();
"""

def page():
    h = []
    A = h.append
    A("<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'>")
    A("<title>Io · Reference prompts</title><style>%s</style></head><body>" % CSS)
    A("<nav aria-label='Sections'><div><a href='#start'>Start</a><a href='#images'>Images</a><a href='#rules'>Rules</a>")
    for s in D.SETS:
        A("<a class='r' href='#set-%s'>%s</a>" % (s["key"], s["key"]))
        if s["key"] == "G": A("<a href='#magic'>Magic rules</a>")
    A("<a href='#check'>Checklist</a><a href='#plan'>Plan</a></div></nav><main>")
    A("<h1>Io, the Herbal Witch</h1><p class='sub'>Reference paintings for her 3D model. %d prompts in four rounds, with the pictures to attach inside this page.</p>" % total)
    A("<p class='count' id='tally' aria-live='polite'></p>")
    A("<section id='start'><h2>What this is</h2><ul>%s</ul>" % "".join("<li>%s</li>" % w for w in D.WHAT))
    A("<div class='note'><h3>Seven choices I made. Check them before round 1.</h3><p class='small'>Your pictures of her do not all agree, so I had to pick. Each one is a line in the standing rules, so it is quick to change: tell me and I will send the page again.</p><dl>%s</dl></div>"
      % "".join("<dt>%s</dt><dd>%s</dd>" % (E(a), E(b)) for a, b in D.CHOICES_TOP))
    A("<h2>How to run it</h2><ol>%s</ol></section>" % "".join("<li>%s</li>" % E(x) for x in D.HOW))
    # images
    A("<section id='images'><h2>Images to attach</h2><p>Tap a picture to see it large. \"Save\" puts it on your device under its own name; if that does nothing in your browser, press and hold the picture instead. The same files are in <b>Io_Reference_Starters.zip</b>.</p>")
    for kind, head, blurb in (("starter", "The five starters", "These go into every new chat, in this order."), ("extra", "Attach only where a prompt asks", "Each prompt lists what to add.")):
        A("<h3 style='margin-top:18px'>%s</h3><p class='small'>%s</p><div class='grid'>" % (head, blurb))
        for c, f, t, d, k in D.IMAGES:
            if k != kind: continue
            A("<figure><button class='im' type='button' data-im='%s' aria-label='Open %s large'><img id='im-%s' alt='%s' src='%s'></button><figcaption><b><span class='code'>%s</span>%s</b><span>%s</span><a class='save' data-im='%s' href='#'>Save %s</a></figcaption></figure>"
              % (c, E(t), c, E(t), b64(f), c, E(t), E(d), c, c))
        A("</div>")
    A("</section>")
    # rules
    A("<section id='rules'><h2>Standing rules</h2><p>Paste this first in every new chat, with the five starters attached.</p>")
    A("<div class='pb'><pre class='p long' id='p-rules'>%s</pre><button class='copy' type='button' data-p='p-rules'>Copy the standing rules</button></div>" % E(D.RULES))
    A("<h3 style='margin-top:22px'>The master line</h3><p class='small'>Send this once A1 looks right.</p>" + copy_block("p-master", D.MASTER_LINE, "Copy the master line"))
    A("<h3 style='margin-top:22px'>The new-chat line</h3><p class='small'>For a fresh chat: attach the five starters plus your kept A1 and C4, paste the standing rules, then send this.</p>" + copy_block("p-newchat", D.NEWCHAT_LINE, "Copy the new-chat line"))
    A("</section>")
    seen_round = set()
    for s in D.SETS:
        if s["key"] == "H":
            A("<section id='magic'><h2>Magic rules</h2><p>Paste this before H1, and again in any new chat that makes H, I, J or K images.</p><div class='pb'><pre class='p long' id='p-magic'>%s</pre><button class='copy' type='button' data-p='p-magic'>Copy the magic rules</button></div></section>" % E(D.MAGIC))
        A("<section id='set-%s'>" % s["key"])
        if s["round"] not in seen_round:
            seen_round.add(s["round"])
            A("<p class='count' style='margin-top:40px'>Round %d: %s. Kept <span id='tally-%d'></span>.</p>" % (s["round"], ROUND_NOTE[s["round"]], s["round"]))
        A("<h2 style='margin-top:10px'>Set %s: %s <small>Round %d</small></h2><p>%s</p>" % (s["key"], E(s["title"]), s["round"], E(s["intro"])))
        for code, title, shape, why, att, src, text in s["prompts"]:
            A("<article class='card' id='c-%s'><header><span class='code'>%s</span><h3>%s</h3><span class='shape'>%s</span></header>" % (code, code, E(title), shape))
            A("<p class='why'>%s</p>" % E(why))
            if src: A("<p class='src'>%s</p>" % E(src))
            if att: A("<div class='attach'>Attach: %s</div>" % "".join(chip(a) for a in att))
            A("<div class='pb'><pre class='p' id='p-%s'>%s</pre><div class='row'><button class='copy' type='button' data-p='p-%s' style='margin-top:0'>Copy %s</button><label class='kept'><input type='checkbox' data-k='%s' data-r='%d'>Kept</label></div></div></article>"
              % (code, E(text), code, code, code, s["round"]))
        A("</section>")
    A("<section id='check'><h2>Checklist before keeping an image</h2><ul>%s</ul></section>" % "".join("<li>%s</li>" % E(x) for x in D.CHECK))
    A("<section id='plan'><h2>What I plan to animate</h2><p>%s</p><div class='plan'>%s</div>"
      % (E(D.LORE_LINE), "".join("<div><b>%s</b><i>%s</i><span>%s</span></div>" % (E(a), E(b), E(c)) for a, b, c in D.PLAN)))
    A("<h2>My additions, not yet confirmed by you</h2><ul>%s</ul>" % "".join("<li><b>%s</b> %s</li>" % (E(a), E(b)) for a, b in D.ADDITIONS))
    A("<h2>Where the pictures of her disagree, and what the prompts chose</h2><ul>%s</ul>" % "".join("<li><b>%s</b> %s</li>" % (E(a), E(b)) for a, b in D.DISAGREE))
    A("<p class='small'>Written %s. The same text is in the project as claude/io-3d-reference-prompts.md.</p></section>" % D.DATE)
    A("</main><div id='box' role='dialog' aria-modal='true' aria-label='Reference picture'><div class='bar'><b></b><a href='#'>Save</a><button type='button'>Close</button></div><div class='view'><img alt=''></div></div>")
    import json
    A("<script>%s</script></body></html>" % (JS % json.dumps({c: [f, t] for c, f, t, d, k in D.IMAGES})))
    return "".join(h)

def strip_tags(s):
    return re.sub(r"</?b>", "**", s)

def md():
    m = ["# Io, the Herbal Witch: reference paintings for her 3D model\n",
         "Written %s, for Chris to run in ChatGPT. This is the text of the page `Io_Reference_Prompts.html`, which also holds the images to attach.\n" % D.DATE,
         "## What this is for\n",
         "Chris asked for Io's 3D model to be started from scratch: an HTML file holding her reference pictures (the picture of all four, the pixel painting of her from Envoi, and her flipbook frames) and the list of prompts, to take to the image generator. He gave more artistic freedom over her spells than the flipbook shows. Her lore is in `lore/discussion-notes.md` and `lore/combat-balance.md`; the method is `claude/HOW-TO-3d-witch-models.md` and `claude/HOW-TO-3d-witch-faces.md`.\n"]
    m += ["- " + strip_tags(w) for w in D.WHAT]
    m.append("\n## Seven choices Claude made, for Chris to check before round 1\n")
    m += ["- **%s:** %s" % (a, b) for a, b in D.CHOICES_TOP]
    m.append("\n## Images to attach\n\nThe five starters go into every new chat, in this order. They are in the HTML page and in `Io_Reference_Starters.zip`.\n")
    m += ["- **%s** `%s`: %s. %s" % (c, f, t, d) for c, f, t, d, k in D.IMAGES]
    m.append("\nWhere they come from:\n")
    m += ["- " + x for x in D.SOURCES]
    m.append("\n## How to run it\n")
    m += ["%d. %s" % (i + 1, x) for i, x in enumerate(D.HOW)]
    m.append("\nThe master line:\n\n```\n%s\n```\n\nThe new-chat line:\n\n```\n%s\n```\n" % (D.MASTER_LINE, D.NEWCHAT_LINE))
    m.append("## Standing rules\n\n```\n%s\n```\n" % D.RULES)
    for s in D.SETS:
        if s["key"] == "H":
            m.append("## Magic rules (paste before H1)\n\n```\n%s\n```\n" % D.MAGIC)
        m.append("## Set %s: %s (round %d)\n\n%s\n" % (s["key"], s["title"], s["round"], s["intro"]))
        for code, title, shape, why, att, src, text in s["prompts"]:
            extra = (" " + src if src else "") + (" Attach: " + ", ".join(att) + "." if att else "")
            m.append("**%s: %s** (%s). %s%s\n```\n%s\n```\n" % (code, title, shape.lower(), why, extra, text))
    m.append("## Checklist before keeping an image\n")
    m += ["- " + x for x in D.CHECK]
    m.append("\n## What Claude plans to animate (proposal)\n\n%s\n" % D.LORE_LINE)
    m.append("| Move | Where it comes from | What it looks like |\n|---|---|---|")
    m += ["| %s | %s | %s |" % p for p in D.PLAN]
    m.append("\n### Claude's additions, not yet confirmed by Chris\n")
    m += ["- **%s** %s" % p for p in D.ADDITIONS]
    m.append("\n### Where the pictures of her disagree, and what the prompts chose\n")
    m += ["- **%s** %s" % p for p in D.DISAGREE]
    m.append("\n### What the earlier witches taught, used here\n")
    m += ["- The face paintings are without hat and glasses, with the hair drawn back, so nothing shades or covers the skin that gets baked (Ranger, Fox).",
          "- C9 is the six-state grid from the Fox's round 5, framed so eyes and mouths can be cut as patches.",
          "- No teeth (Chris's rule for the Fox).",
          "- A resting stance (A6) and a bare arm (D3) and a neck close-up (C18) are in round 1, because the Fox needed all three later.",
          "- Hair gets its own views without the hat (C11 to C13): it is to her hips and will move.",
          "- The hat, glasses, book and blades are painted as separate objects, because they are built as separate objects."]
    return "\n".join(m) + "\n"

open(os.path.join(OUT, "Io_Reference_Prompts.html"), "w", encoding="utf-8").write(page())
open(os.path.join(OUT, "io-3d-reference-prompts.md"), "w", encoding="utf-8").write(md())
readme = ["Io, the Herbal Witch: images to attach in ChatGPT", "Made %s. The prompts are in Io_Reference_Prompts.html." % D.DATE, "",
          "Every new chat, in this order: IO1, IO2, IO3, S1, S2.", "Everything else: only where a prompt says \"Attach\".", ""]
readme += ["%-5s %-48s %s. %s" % (c, f, t, d) for c, f, t, d, k in D.IMAGES]
with zipfile.ZipFile(os.path.join(OUT, "Io_Reference_Starters.zip"), "w", zipfile.ZIP_STORED) as z:
    for c, f, t, d, k in D.IMAGES:
        z.write(os.path.join(REFS, f), f)
    z.writestr("README.txt", "\n".join(readme) + "\n")
for f in ("Io_Reference_Prompts.html", "io-3d-reference-prompts.md", "Io_Reference_Starters.zip"):
    print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")
print("prompts:", total, per_round)
