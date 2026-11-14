#!/bin/bash
# pop_audit.sh : plays every move at 60 frames a second with the keep-out fix off and then on, and prints the furthest either
# wrist moved in one frame each way (mm). A fix that makes a hand jump shows as a much bigger number in the second column.
cd /home/claude/ranger
python3 shoot.py shots/audit "const R = T.j, D = R.debug.D, SK = R.SK, out = {}, v = new THREE.Vector3(), last = { R: new THREE.Vector3(), L: new THREE.Vector3() };
const run = (m, off) => { D.clearOff = off; R.play('idle'); for (let i = 0; i < 90; i++) R.animate(1 / 60); R.play(m); let mx = 0, when = 0; const n = m === 'shots' ? 640 : m === 'draw' ? 420 : m === 'sword' ? 350 : 280;
  for (let i = 0; i < n; i++) { R.animate(1 / 60); R.root.updateMatrixWorld(true); for (const S of ['R', 'L']) { v.setFromMatrixPosition(SK['hand' + S].matrixWorld); if (i > 0) { const d = v.distanceTo(last[S]); if (d > mx) { mx = d; when = i / 60; } } last[S].copy(v); } } return (mx * 1000).toFixed(1) + '@' + when.toFixed(2); };
for (const m of R.moves) { if (m === 'pose') continue; out[m] = run(m, true) + '  ' + run(m, false); } D.clearOff = false;
JSON.stringify(out).replace(/\",\"/g, '\"\\n\"')" v:0,0.05,5,0.9,30,200,200 2>&1 | grep -v "^shots\|^build" | sed 's/\\n/\n/g'
