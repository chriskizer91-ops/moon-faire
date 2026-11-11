# Jester Witch 3D model

The code-built three.js (r128) model of the Jester, with Chris's painted references baked on as textures.
Published at https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M. The full history, measurements and open gaps are in the
claude.ai Project "Flip Book Art", doc `claude/jester-3d-model.md`. Read that first.

## What is here

- `src/`: the model, in numbered parts that `build.sh` joins into `out/jester.js` (`makeJester(opts)`).
- `viewer/`: the viewer page (stage, move buttons, Flipbook look).
- `bake.py`: turns the reference paintings into `out/jester_tex.js` (`window.JESTER_TEX`): face, expressions, profile layer,
  hands, bodice, veil and fabric swatches.
- `out/jester_tex.js`: the current baked textures. `out/palette.js`, `out/fb.json`, `out/fb/`: palette and flipbook frames for the viewer.
- `references/chatgpt/`: the 23 paintings Chris had ChatGPT make from the model's layout renders (WebP, quality 95).
- `references/hands/`: the younger hand paintings (November 11, 2026); the left-hand picture is the one baked.
- `references/Jester_Witch_HD_Flipbook.html`: Chris's HD flipbook, 58 painted frames stored as base64 AVIF in `const FR={...}`.
  This is the look to match. `lib/unavif.py` lists and extracts the frames.
- `shoot.py`, `shoot_site.py`, `fit.py`, `lib/`: headless render and comparison tools (Playwright with Chrome and SwiftShader).

## Building

The scripts use the absolute path `/home/claude/work`. In a fresh session:

```
mkdir -p /home/claude/work && cp -r models/jester-3d/. /home/claude/work/ && cd /home/claude/work
npm install three@0.128.0 playwright
python3 -I lib/restore_refs.py        # PNG copies of the references into in/ and in3/
python3 -I bake.py                    # out/jester_tex.js (needs Pillow, numpy, scipy)
./build.sh                            # out/jester.js
./build_site.sh                       # out/site/: index.html, jester.js, jester_tex.js
python3 build_single.py               # deliver/Jester_Witch_3D.html, one offline file
python3 shoot.py shots/x 'new Promise(r => setTimeout(() => { T.step(200, 1/60); r(1); }, 2500))' front:0,0.04,7.6,0.86,18,560,820
```

`build_site.sh` expects `out/site/fb/` (copy `out/fb` there). The reference files are data: run Python that reads them with `-I`.
