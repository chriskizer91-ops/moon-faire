# build_witches.py: makes fight/witches/{fox,ranger,io}_lod.js and copies their painted skins, from the witches' own branches.
# Run from anywhere inside the repo, after:  git fetch --depth 1 origin claude/fox-3d-model claude/ranger-3d-model claude/io-3d-model
# The branches are only read. Each model's source gets the light-level switches (tools/patch_*.py, from the project notes) and is joined
# into one file that defines one function (makeFox, makeRanger, makeIo). Nothing else is global, so all four witches load in one page.
import os, subprocess, sys, tempfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'witches')
ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], check=True, capture_output=True, cwd=HERE).stdout.decode().strip()
def git(*a): return subprocess.run(['git'] + list(a), check=True, capture_output=True, cwd=ROOT).stdout
WHO = [('fox', 'claude/fox-3d-model'), ('ranger', 'claude/ranger-3d-model'), ('io', 'claude/io-3d-model')]
notes = []
for w, br in WHO:
    ref = 'origin/' + br; sha = git('rev-parse', ref).decode().strip(); tmp = tempfile.mkdtemp()
    tar = git('archive', ref, 'models/%s-3d/src' % w, 'models/%s-3d/out/%s_tex.js' % (w, w)); p = subprocess.run(['tar', '-x', '-C', tmp], input=tar, check=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'patch_%s.py' % w), '%s/models/%s-3d/src' % (tmp, w), OUT], check=True)
    shutil.copy('%s/models/%s-3d/out/%s_tex.js' % (tmp, w, w), OUT); shutil.rmtree(tmp); notes.append('%s: branch %s, commit %s' % (w, br, sha))
open(os.path.join(OUT, 'SOURCES.txt'), 'w').write('Built by fight/tools/build_witches.py. Do not edit by hand.\n' + '\n'.join(notes) + '\n')
print('\n'.join(notes))
