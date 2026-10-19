"""Build Night of No Moon from its source page.

    python3 flipbook-art-source/night-of-no-moon-src/build.py

Reads night-of-no-moon.src.html and ../flipbook-frames.json, fills in the
__FRAMES__ and __PAL__ placeholders with the Jester's frame data, and writes:

  ../night-of-no-moon.html                 the game, as a full page (open it from a local server)
  build/night-of-no-moon.artifact.html     the same page without <html>/<head>, for republishing
                                           to https://claude.ai/artifact/JoP7S96fhVk4kD9JW751C4
                                           (the artifact host adds its own skeleton)

The game loads hd/<frame>.webp and jester_witch_spritesheet.png from the folder
it sits in, so it shares the flipbook's frames.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # flipbook-art-source/

# The same skeleton the claude.ai artifact host wraps around a page.
SKELETON = (
    '<!doctype html><html><head><meta charset=utf-8>'
    '<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
    '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);'
    'padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;'
    'font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
    'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style>'
    '</head><body>\n'
)

# Every frame the game draws: her clips plus the three NPCs' first frames.
SEQS = [('I', 1, 8), ('W', 1, 16), ('C', 8, 11), ('A', 13, 18), ('E', 1, 8), ('U', 1, 29),
        ('V', 1, 15), ('O', 1, 24), ('S', 1, 16), ('K', 1, 48)]
EXTRA = ['J01', 'M01', 'X01']


def main():
    meta = json.load(open(os.path.join(ROOT, 'flipbook-frames.json')))
    names = [f'{p}{i:02d}' for p, a, b in SEQS for i in range(a, b + 1)] + EXTRA
    frames = {}
    for n in names:
        f = meta['frames'][n]
        # [hdW, hdH, footX, footY, sheetX, sheetY]
        frames[n] = [f['hdW'], f['hdH'], round(f['hdFootX'], 2), round(f['hdFootY'], 2), f['x'], f['y']]
    pal = [[int(c) for c in p] for p in meta['palette']]

    src = open(os.path.join(HERE, 'night-of-no-moon.src.html')).read()
    page = (src.replace('__FRAMES__', json.dumps(frames, separators=(',', ':')))
               .replace('__PAL__', json.dumps(pal, separators=(',', ':'))))

    os.makedirs(os.path.join(HERE, 'build'), exist_ok=True)
    open(os.path.join(HERE, 'build', 'night-of-no-moon.artifact.html'), 'w').write(page)
    open(os.path.join(ROOT, 'night-of-no-moon.html'), 'w').write(SKELETON + page)
    missing = [n for n in names if not os.path.exists(os.path.join(ROOT, 'hd', n + '.webp'))]
    print(f'{len(names)} frames, {len(page) // 1024} KB' + (f'; missing HD frames: {missing}' if missing else ''))


if __name__ == '__main__':
    main()
