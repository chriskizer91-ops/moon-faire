#!/bin/sh
# usage: tools/s9.sh tag [move ...] -> shots/s9/<tag>_<move>.jpg : the moves where cloth and limbs meet, each from two sides
cd /home/claude/io; TAG=$1; shift
for M in ${@:-read squat kneel hover walk jog herb hat glasses talk wave twirl curtsey sickle}; do
case $M in
 read)    python3 tools/strip.py shots/s9/${TAG}_read.jpg read "0.5,0.25,1.7,1.10,22" 1.5 3.0 4.2 --w 480 --h 480 --view2 "-1.3,0.1,1.9,1.08,22";;
 squat)   python3 tools/strip.py shots/s9/${TAG}_squat.jpg squat "0.6,0.12,4.6,0.62,22" 0.4 0.9 2.5 --w 400 --h 480 --view2 "-1.5708,0.05,4.6,0.62,22";;
 kneel)   python3 tools/strip.py shots/s9/${TAG}_kneel.jpg kneel "0.7,0.12,4.6,0.62,22" 0.5 1.0 2.5 --w 400 --h 480 --view2 "-1.5708,0.05,4.6,0.62,22";;
 hover)   python3 tools/strip.py shots/s9/${TAG}_hover.jpg hover "0.5,0.10,4.8,0.92,22" 0.6 1.2 3.0 --w 400 --h 520 --view2 "-1.5708,0.05,4.8,0.92,22";;
 walk)    python3 tools/strip.py shots/s9/${TAG}_walk.jpg walk "0.6,0.08,5.0,0.80,22" 0.9 1.2 1.5 1.8 --w 330 --h 520 --view2 "-1.5708,0.05,5.0,0.80,22";;
 jog)     python3 tools/strip.py shots/s9/${TAG}_jog.jpg jog "0.6,0.08,5.0,0.80,22" 0.8 1.0 1.2 1.4 --w 330 --h 520 --view2 "-1.5708,0.05,5.0,0.80,22";;
 herb)    python3 tools/strip.py shots/s9/${TAG}_herb.jpg herb "0.7,0.12,4.8,0.70,22" 0.9 1.5 2.7 3.4 --w 360 --h 500 --view2 "-1.5708,0.05,4.8,0.70,22";;
 hat)     python3 tools/strip.py shots/s9/${TAG}_hat.jpg hat "0.6,0.05,2.8,1.25,22" 0.6 1.0 1.4 --w 420 --h 500 --view2 "1.7,0.05,2.8,1.25,22";;
 glasses) python3 tools/strip.py shots/s9/${TAG}_glasses.jpg glasses "0.5,0.05,2.8,1.25,22" 0.6 0.9 1.3 --w 420 --h 500 --view2 "-1.5,0.05,2.8,1.25,22";;
 talk)    python3 tools/strip.py shots/s9/${TAG}_talk.jpg talk "0.5,0.05,3.2,1.10,22" 0.8 1.8 3.0 --w 420 --h 500 --view2 "1.5,0.05,3.2,1.10,22";;
 wave)    python3 tools/strip.py shots/s9/${TAG}_wave.jpg wave "0.3,0.05,3.0,1.15,22" 0.6 1.0 1.6 --w 420 --h 500 --view2 "-1.4,0.05,3.0,1.15,22";;
 twirl)   python3 tools/strip.py shots/s9/${TAG}_twirl.jpg twirl "0.5,0.08,5.2,0.95,22" 0.7 1.0 1.3 1.6 1.9 --w 330 --h 560;;
 curtsey) python3 tools/strip.py shots/s9/${TAG}_curtsey.jpg curtsey "0.45,0.08,5.0,0.9,22" 0.8 1.4 2.0 --w 380 --h 560 --view2 "-1.5708,0.05,5.0,0.9,22";;
 sickle)  python3 tools/strip.py shots/s9/${TAG}_sickle.jpg sickle "0.2,0.05,3.2,1.12,22" 0.8 1.6 2.4 --w 420 --h 500 --view2 "-1.4,0.05,3.2,1.12,22";;
 idle)    python3 tools/strip.py shots/s9/${TAG}_idle.jpg idle "0.4,0.05,5.4,0.86,22" 1.0 --w 400 --h 640 --view2 "3.6,0.05,5.4,0.86,22";;
esac
done 2>&1 | grep -v "proxy\|google\|Allowed\|details\|^$"
