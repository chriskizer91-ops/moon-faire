# Io, the Herbal Witch, in 3D

Started November 13, 2026. Nothing is built yet: this folder holds what Chris needs to get her reference paintings made.

- `references/starters/`: the 14 images to attach in ChatGPT (her painting, sheet and sprite sheet, the pixel painting of her from Envoi, three enlarged pieces, the three flipbook strips, and the four Jester style guides). `README.txt` there says which to attach when.
- `references/prompts/io-3d-reference-prompts.md`: the 104 prompts in four rounds, the standing rules, the magic rules, the planned moves, and where her pictures disagree. The same text is in the project as `claude/io-3d-reference-prompts.md`.
- `references/prompts/io_data.py` holds every word of the list. `build_io_page.py <starters folder> <out folder>` turns it into `Io_Reference_Prompts.html` (one file with the images inside), the markdown note and `Io_Reference_Starters.zip`. `check_page.py` opens the page at phone width and tests it. `make_starters.py` remakes the images from the repo's own files.

When the paintings come back, put each round in `references/round1/` and so on, as the Fox's are (`claude/fox-3d-model`, `models/fox-3d/references/`), and build her by `claude/HOW-TO-3d-witch-models.md` and `claude/HOW-TO-3d-witch-faces.md` in the project. Her lore is in the project's `lore/` folder, and it outranks the old move sheet.
