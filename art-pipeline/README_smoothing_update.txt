MOON FAIRE ART PIPELINE - SMOOTHING UPDATE (October 18, 2026)

Unzip both parts (part1-of-2, part2-of-2) into the same folder as moonfaire_art_pipeline_part1..6, overwriting files.
It adds the smoothed Ranger / Herbal Witch / Fox moves made from the 23 returned in-between strips (70 new poses).

frames/   M, N, P, Q now hold the smoothed sequences (12 / 22 / 22 / 12 frames).
          New prefixes: X = Blue Mischief 22, Y = Borrowed Face 22, J = Moonsteel Draw 10,
          L = Silver Arrow 10, T = Silverglass Ward 11 (R20 held twice).
          frames/meta.json: each frame's "src" is the original key it copies, or "new" for an in-between.
          frames/meta_backup_gen6.json: the state before this round (original 8-frame M/N/P/Q).
scripts/  extract_label_cells.py   label-based strip cutter (now keeps legs split by dark leggings)
          fit_strip_scale.py       one uniform scale per strip, fitted on its key copies by silhouette overlap
          refit_strip_scales.py    writes keyfit.json for all strips
          integrate_smoothing.py   builds the 9 sequences (originals for keys, per-strip scale for new poses)
          check_sequences.py       contact sheets + per-frame heights for a visual check
          build.py, flipbook_template.html, export_game_assets.py, jester_witch_spritesheet.json (all clips)

The raw strips are in Chris's Three_Witches_Smoothing_01..04 zips (strips + plan.json); integrate_smoothing.py
expects them unzipped as <dir>/<move>/strip_NN_*.png next to plan.json.
frames_pre_smoothing/  the original 8-frame M/N/P/Q PNGs (the keys), since this update overwrites them in frames/.
fit_strip_scale.py reads original keys from a folder named in its SRC line: point it at frames_pre_smoothing/
for M/N/P/Q (and at frames/ for F and R keys, which were not touched).
