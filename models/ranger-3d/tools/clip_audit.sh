#!/bin/bash
# clip_audit.sh [off] : plays every move from "Ready" and prints, for each, the deepest her hands or forearms went into a bag or a
# leg before the fix (mm), which hand and what, and what was left after the fix (mm). "off" turns the fix off, to see what it does.
cd /home/claude/ranger
python3 shoot.py shots/audit "const R = T.j, D = R.debug.D, out = {}; D.clearOff = ${1:+true}${1:-false} === true; const LEN = { idle: 5, walk: 3, jog: 3, talk: 4, fall: 3.5, kneel: 3, squat: 3, sit: 3, hover: 3.5 }, S = { draw: 6.9, sword: 5.8, knives: 4.3, gem: 4.6, glass: 5.2, cheer: 1.6, limber: 6, hit: 1.7, hard: 3, dodge: 1.7, win: 4.4, bow: 4, wave: 3.4 };
for (const m of R.moves) { if (m === 'pose') continue; R.play('idle'); for (let i = 0; i < 45; i++) R.animate(1 / 30); R.play(m); let a = 0, at = '', left = 0, when = 0, leg = 0, lw = 0; const n = Math.round((LEN[m] || S[m] || 3) * 30);
  for (let i = 0; i < n; i++) { R.animate(1 / 30); if (D.clip > a) { a = D.clip; at = D.clipAt; when = i / 30; } if (D.clipLeft > left) { left = D.clipLeft; lw = i / 30; } if (D.clipLeg > leg) leg = D.clipLeg; }
  out[m] = Math.round(a * 1000) + ' mm ' + at + ' @' + when.toFixed(1) + 's, into a leg ' + Math.round(leg * 1000) + ', left ' + Math.round(left * 1000) + ' @' + lw.toFixed(1) + 's'; }
JSON.stringify(out).replace(/\",\"/g, '\"\\n\"')" v:0,0.05,5,0.9,30,200,200 2>&1 | grep -v "^shots" | sed 's/\\n/\n/g'
