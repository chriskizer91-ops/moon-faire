#!/bin/sh
# usage: tools/allmoves.sh [move ...]  -> shots/m/mv_<move>.jpg : stills through each of her moves
cd /home/claude/io
F='grep -v proxy\|google\|Allowed\|details\|^$'
for M in ${@:-walk talk glasses hat curtsey twirl herb wave look}; do
case $M in
 walk)    python3 tools/strip.py shots/m/mv_walk.jpg walk "0.6,0.08,5.2,0.95,22" 0.9 1.2 1.5 1.8 2.1 --w 330 --h 600 --view2 "-1.5708,0.05,5.2,0.95,22";;
 talk)    python3 tools/strip.py shots/m/mv_talk.jpg talk "0.4,0.05,3.4,1.18,22" 0.6 1.2 1.8 2.6 3.4 --w 400 --h 560;;
 glasses) python3 tools/strip.py shots/m/mv_glasses.jpg glasses "0.45,0.05,2.6,1.33,22" 0.3 0.6 0.9 1.2 1.7 2.1 --w 380 --h 520 --view2 "-1.2,0.05,2.6,1.33,22";;
 hat)     python3 tools/strip.py shots/m/mv_hat.jpg hat "0.5,0.05,2.6,1.36,22" 0.3 0.6 0.9 1.15 1.5 2.1 --w 380 --h 520 --view2 "1.5,0.05,2.6,1.36,22";;
 curtsey) python3 tools/strip.py shots/m/mv_curtsey.jpg curtsey "0.45,0.08,5.2,0.9,22" 0.4 0.8 1.2 1.5 1.9 2.4 --w 360 --h 600 --view2 "-1.5708,0.05,5.2,0.9,22";;
 twirl)   python3 tools/strip.py shots/m/mv_twirl.jpg twirl "0.5,0.08,5.2,0.95,22" 0.3 0.7 1.0 1.3 1.6 1.9 2.3 --w 330 --h 600;;
 herb)    python3 tools/strip.py shots/m/mv_herb.jpg herb "0.7,0.12,5.2,0.75,22" 0.5 0.9 1.4 2.0 2.7 3.2 4.0 4.6 --w 330 --h 560 --view2 "-1.5708,0.05,5.2,0.75,22";;
 wave)    python3 tools/strip.py shots/m/mv_wave.jpg wave "0.3,0.05,3.2,1.25,22" 0.3 0.6 0.9 1.2 1.5 2.2 --w 380 --h 560;;
 look)    python3 tools/strip.py shots/m/mv_look.jpg look "0.3,0.05,3.4,1.25,22" 0.5 1.0 1.5 2.1 2.6 3.2 --w 360 --h 560 --view2 "3.14159,0.05,3.4,1.25,22";;
esac
done 2>&1 | grep -v "proxy\|google\|Allowed\|details\|^$"
