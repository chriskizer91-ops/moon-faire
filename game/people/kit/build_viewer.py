# Builds people/out/person-stage.html: the person kit's test stage as one offline file. Run from game/: python3 people/kit/build_viewer.py
import base64, os
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '..', '..')
rd = lambda p: open(os.path.join(GAME, p), encoding='utf-8').read()
def scripts():
    plain = 'window.MF_FACE_PLAIN = "data:image/webp;base64,%s";' % base64.b64encode(open(os.path.join(HERE, 'face_plain.webp'), 'rb').read()).decode()
    parts = [rd('lib/three.r128.min.js'), rd('models/jester/meshopt_simplifier.js'), rd('models/jester/jester_tex.js'), rd('models/jester/jester_kit.js'), rd('models/jester/lod.js'), plain,
             rd('people/kit/person-kit.js'), rd('src/stage.js')]
    for p in parts: assert '</script' not in p.lower()
    return parts
if __name__ == '__main__':
    page = rd('people/kit/viewer.tpl.html').replace('/*SCRIPTS*/', '\n'.join('<script>\n%s\n</script>' % p for p in scripts()))
    os.makedirs(os.path.join(GAME, 'people/out'), exist_ok=True)
    open(os.path.join(GAME, 'people/out/person-stage.html'), 'w', encoding='utf-8').write(page)
    print('person stage', len(page) // 1024, 'KB')
