MOON FAIRE ART PIPELINE (split into parts, each under 20 MB)

Unzip every part into the SAME folder. Together they rebuild:
  frames/        every cut frame (transparent PNG) + frames/meta.json (anchors: footX = torso, footY = soles)
  scripts/       build.py (frames -> HD webp + pixel sheet + clips), cut.py (cut a sheet),
                 extract_inbetweens.py / extract_label_cells.py / integrate_redraws.py (cut returned strips,
                 scale to keys, register), make_*_templates.py (build strip templates for ChatGPT),
                 flipbook_template.html + assemble.py (the flipbook), jester_witch_spritesheet.json (all clips)
  sources/       the original sheets the frames were cut from

Paths inside the scripts point at the art session's old workspace (/home/claude/...). Adjust them first.
The method is described in the Flip Book Art project doc START-HERE-sprite-animation-method.md.

Frame name prefixes (frames/meta.json):
  A,B = Jester original sheets   C,D = Jester walk/cast sheets   K = Curtain Call 48   O = Sealed Fate 24
  S = Against All Odds 16   W = Jester walk 16   G = Jester move sheet   U = Hush 29   V = Gravity 15
  I = Jester idle 8   E = Gilded Rebuke 8   R = Ranger   H = Herbal Witch (first sheet)   F = Fox (first sheet)
  M = Harvest Crescent redraw   N = Silverleaf Salve redraw   P = Elderwood Guardian redraw   Q = Hemline Fangs redraw
