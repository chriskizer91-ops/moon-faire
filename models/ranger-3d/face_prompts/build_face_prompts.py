# Builds the Ranger's face-picture request: Ranger_Face_Prompts.html (one offline page with the pictures to attach and copy buttons)
# and ranger-3d-round4-face-prompts.md (the same words for the project). The paintings are data: run with python3 -I.
import io, base64, html, json
from PIL import Image
R = '/home/claude/ranger/'
RULES = ("Keep her exactly the woman in the attached paintings: the same face, the same age, the same grey-blue eyes, the same fine lines at the corners of her eyes, "
         "the same small mole on her right cheek, the same dark hair going silver. Do not make her younger, thinner or sterner. "
         "Painted as realistically as those paintings: real skin with pores and fine lines. Flat dark plum background (#3B2F43) and nothing else. "
         "Soft even light from the front, with no shadow across her face. She is NOT wearing her glasses, her headband, the gem on her forehead or her earrings. No teeth are visible.")
P = [
 dict(code='J1', title='Her face, straight on', shape='Square', attach='C1 (her face from the front) and C3 (three views of her head)',
      note='Stay on this one until it is her. The other two are made from it.',
      text="Square image. One very large close-up painting of her face from directly in front, filling the frame from her hairline to just under her chin, with both ears inside the frame. "
           "Her hair is drawn straight back off her face and tied behind her head, out of sight: no hair crosses her forehead, temples, ears or cheeks, and her whole hairline shows. "
           "Lips closed and relaxed, with only the faintest smile. Eyes open, looking straight at the viewer. Head perfectly level, not tilted and not turned. " + RULES),
 dict(code='J2', title='Six states of her face', shape='Wide, 3:2', attach='your finished J1',
      note='This gives her blink, her talking mouths and her smile. Each face must sit in the same place in its box.',
      text="Wide image, landscape 3:2. A grid of six close-up paintings of the same face, three across and two down, each exactly the same size, each from directly in front with the head perfectly level, "
           "each in exactly the same position inside its box, each showing from the top of her eyebrows to just under her chin. Every one matches the attached face exactly except for the one change named. "
           "Top row, left to right: (1) the attached face unchanged; (2) both eyes gently closed, as in the middle of a blink, mouth unchanged; (3) both eyes half closed, upper lids lowered halfway over the eyes, mouth unchanged. "
           "Bottom row, left to right: (4) lips just parted as if starting to speak, eyes unchanged; (5) lips rounded in a small 'oo', eyes unchanged; "
           "(6) a warm closed-lip smile with her cheeks lifted and the lines at the corners of her eyes a little deeper, eyes unchanged. " + RULES),
 dict(code='J3', title='Front, turned and side', shape='Wide, 3:2', attach='your finished J1, and C3',
      note='The side view paints her cheeks, jaw and ears, and shows her hairline without the band.',
      text="Wide image, landscape 3:2. Three large paintings of her head and neck side by side at exactly the same size, each showing from the top of her hair down to her collarbones. "
           "Left: from directly in front. Middle: her head turned 45 degrees toward the right edge of the image. Right: an exact side view, a true profile, facing the right edge. "
           "Her hair is drawn up into the loose bun high on the back of her head, as in the attached paintings, but smoothed back so that no loose strands cross her face, her ears or her neck: "
           "her forehead and hairline, the bridge and tip of her nose, her lips, her chin, her jawline, her whole ear and the line of her neck are clear against the background. "
           "Lips closed with only the faintest smile, eyes open, head level. " + RULES),
]
def img(path, w, q=86, box=None):
    im = Image.open(path).convert('RGB')
    if box: im = im.crop(box)
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
now = img(R + 'shots/j4.jpg', 1440, 84, (0, 0, 1440, 560))
c1 = img(R + 'refs/C1.png', 1254, 90); c3 = img(R + 'refs/C3.png', 1536, 90)
e = html.escape
cards = ''
for p in P:
    cards += f'''<section class="card" id="{p['code']}"><div class="row"><h2><span class="code">{p['code']}</span> {e(p['title'])}</h2><label class="kept"><input type="checkbox" data-k="{p['code']}"> Kept</label></div>
<p class="meta"><b>Shape:</b> {e(p['shape'])} &nbsp;·&nbsp; <b>Attach:</b> {e(p['attach'])}</p><p class="note">{e(p['note'])}</p>
<pre id="t{p['code']}">{e(p['text'])}</pre><button class="copy" data-t="t{p['code']}">Copy prompt {p['code']}</button></section>\n'''
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Ranger: face pictures</title>
<style>
:root{{--bg:#1b1822;--panel:#26212f;--line:#3a3347;--ink:#ece6f1;--dim:#a99fb6;--gold:#e0b65a;--blue:#3d5fc4}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}}
main{{max-width:820px;margin:0 auto;padding:18px 15px 60px}}.eyebrow{{font:600 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin:6px 0 8px}}
h1{{font:400 34px/1.1 Georgia,"Times New Roman",serif;margin:0 0 10px}}h1 i{{color:#7f9bf0}}h2{{font:600 18px/1.25 system-ui,sans-serif;margin:0}}h3{{font:600 13px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin:26px 0 10px}}
p{{margin:0 0 10px}}.dim{{color:var(--dim)}}ol{{margin:0 0 10px;padding-left:22px}}li{{margin:0 0 6px}}
.card{{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;margin:0 0 14px}}.row{{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px}}
.code{{display:inline-block;background:var(--blue);border-radius:7px;padding:1px 8px;margin-right:4px;font:700 14px/1.5 ui-monospace,Menlo,monospace}}
.meta{{font-size:14px;color:var(--dim)}}.meta b{{color:var(--ink)}}.note{{font-size:14.5px}}
pre{{white-space:pre-wrap;word-break:break-word;background:#17141d;border:1px solid var(--line);border-radius:10px;padding:12px;font:13.5px/1.5 ui-monospace,Menlo,Consolas,monospace;margin:0 0 10px;max-height:260px;overflow:auto}}
button.copy{{width:100%;min-height:46px;border:0;border-radius:10px;background:var(--blue);color:#fff;font:600 16px system-ui,sans-serif}}button.copy.done{{background:#2f7d57}}
.kept{{font-size:14px;color:var(--dim);white-space:nowrap}}.kept input{{width:18px;height:18px;vertical-align:-3px}}
figure{{margin:0 0 12px}}figure img{{width:100%;border-radius:10px;border:1px solid var(--line);display:block}}figcaption{{font-size:13.5px;color:var(--dim);margin-top:5px}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}@media (max-width:560px){{.two{{grid-template-columns:1fr}}}}
</style></head><body><main>
<p class="eyebrow">Moon Faire · the Ranger · round 4</p><h1>Three pictures of <i>her face</i></h1>
<p>Her head is now the Jester's face model. These three pictures are her own face, painted to go on it: straight on, evenly lit, with nothing in the way.</p>
<figure><img src="{now}" alt="The Ranger on the Jester's face model"><figcaption>Her now: the Jester's face model, at her size, wearing the face from C1. That painting had the band, the gem and loose hair in it, which I painted out. The new ones have none of them.</figcaption></figure>
<h3>How to run it</h3>
<ol><li>Open the chat that made her paintings (or a new one), and attach C1 and C3. They are in Ranger-Round-1 and shown under here; press and hold a picture to save it if that is easier.</li>
<li>Paste J1. Redo it until it is her. Save it as J1.png.</li><li>Attach your J1 and paste J2. Save it as J2.png.</li><li>Attach your J1 and C3 and paste J3. Save it as J3.png.</li><li>Send me the three.</li></ol>
<p class="dim">No teeth show in any of them. That keeps her mouth pictures simple and matches the Jester's. If you want her to show teeth when she smiles or talks, tell me and I will change J2.</p>
<h3>Pictures to attach</h3>
<div class="two"><figure><img src="{c1}" alt="C1"><figcaption>C1: her face from the front</figcaption></figure><figure><img src="{c3}" alt="C3"><figcaption>C3: front, turned, side</figcaption></figure></div>
<h3>The prompts</h3>
{cards}
<h3>What I do with them</h3>
<ol><li><b>J1</b> becomes her face. It is laid on the head by her pupils and the line of her lips, with no band or hair to paint out.</li>
<li><b>J2</b> gives her states: eyes shut, eyes half shut, two talking mouths, a smile. Each is set into J1 as a soft patch, so she can blink and talk once movement is switched on.</li>
<li><b>J3</b> paints her cheeks, jaw and ears from the side, shows where her hairline runs, and is my check of the head at 45 degrees and in profile.</li></ol>
</main><script>
(function(){{
  function copyText(t){{ if(navigator.clipboard&&navigator.clipboard.writeText){{ return navigator.clipboard.writeText(t).catch(function(){{ return fallback(t); }}); }} return fallback(t); }}
  function fallback(t){{ return new Promise(function(res,rej){{ var a=document.createElement('textarea'); a.value=t; a.setAttribute('readonly',''); a.style.cssText='position:fixed;left:0;top:0;opacity:0'; document.body.appendChild(a); a.select(); a.setSelectionRange(0,t.length); var ok=false; try{{ ok=document.execCommand('copy'); }}catch(e){{}} document.body.removeChild(a); ok?res():rej(); }}); }}
  document.querySelectorAll('button.copy').forEach(function(b){{ var label=b.textContent; b.addEventListener('click',function(){{ var t=document.getElementById(b.dataset.t).textContent; copyText(t).then(function(){{ b.textContent='Copied'; b.classList.add('done'); }},function(){{ b.textContent='Press and hold the text to copy'; }}); setTimeout(function(){{ b.textContent=label; b.classList.remove('done'); }},1800); }}); }});
  document.querySelectorAll('.kept input').forEach(function(c){{ var k='rangerFace:'+c.dataset.k; try{{ c.checked=localStorage.getItem(k)==='1'; }}catch(e){{}} c.addEventListener('change',function(){{ try{{ localStorage.setItem(k,c.checked?'1':'0'); }}catch(e){{}} }}); }});
}})();
</script></body></html>'''
open('/mnt/user-data/outputs/Ranger_Face_Prompts.html', 'w').write(page)
md = "# Ranger – round 4: three pictures of her face\n\nWritten by Claude, November 12, 2026, after Chris said: \"just use the jester witch 3d face model And then we will make specific new images of just her face so you can paint that onto the jester witch 3D face model\".\n\n"
md += "## Why\n\n- Her head is now the Jester's face model at 94% of its size, wearing her own face from C1 (see `claude/ranger-3d-stage2b-jester-face.md`).\n- C1 was painted with the headband, the gem and loose hair in it. They are painted out, which leaves soft patches on her brow and temples.\n- These three give her a clean face made for the head: straight on, evenly lit, nothing in the way, with the states she needs to blink and talk.\n- Order: J1 first, until it is her. Then J2 and J3, each with J1 attached.\n- No teeth show in any of them. That is Claude's choice, to match the Jester's states; Chris can overrule it.\n\n"
md += "## Rules in every prompt\n\n" + RULES + "\n\n"
for p in P: md += f"## {p['code']}: {p['title']} ({p['shape']})\n\nAttach: {p['attach']}. {p['note']}\n\n```\n{p['text']}\n```\n\n"
md += "## What Claude does with them\n\n- J1 becomes her face picture, laid on the head by pupils and lip line (the head's own frame: eyes at 1.5246, lip line 0.066 below). Pupils are read off a gridded copy by eye, never found automatically.\n- J2 gives the states: eyes shut, eyes half shut, two talking mouths, a closed smile. Each is cut as a soft-edged patch and set into J1.\n- J3's side view paints cheek, jaw and ear at the sides, shows her hairline without the band, and is the check of the head at 45 degrees and in profile.\n"
open(R + 'face_prompts/ranger-3d-round4-face-prompts.md', 'w').write(md)
print('page', round(len(page) / 1e6, 2), 'MB; md', len(md), 'chars; prompt lengths', [len(p['text']) for p in P])
