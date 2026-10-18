// The film: "A Fool's Mercy". Two minutes in the night square, all ten of
// the Jester's clips, against Envoi's foes. Every time, place and cue lives
// here. Places are in the square painting's pixels (1448 x 1086); x, y is
// where boot soles (or a foe's hem) meet the cobbles.
//
//  0:00  The town under the moon. The Faire's last tune drifts from its stall.
//  0:09  Bells first, then the Jester, crossing the empty square to the well.
//  0:20  The chapel bell tolls once. Wisps come out of the graveyard and the
//        woods, cling to the lamps, and the flames gutter.
//  0:29  One lunges at her. Gilded Rebuke, and it is released: a pale moth.
//  0:33  The other two wail. Hush.
//  0:41  A Shadow Wraith climbs out of the graveyard. Gravity: one knee.
//  0:48  The great wraith comes over the bridge and swallows every lamp.
//  0:55  Sealed Fate: Doom over three of them. The chapel bell counts down.
//  1:01  It breathes the stolen fire at her. Against All Odds holds.
//  1:15  Curtain Call. On frame 32 the bell, her bells and every mark toll
//        together; the souls go home as moths and the flames go home to the lamps.
//  1:36  She walks up toward the chapel; the last moths cross the moon.

const DUR = 120;
const W = 1448, H = 1086;   // the painting
const POSTER = 17.5;        // the frame shown before Play: her walking toward the well
const CLIPS = DATA.clips;
const clipLen = c => CLIPS[c].n / CLIPS[c].fps;
const releaseAt = (c, t0) => t0 + (CLIPS[c].release - 1) / CLIPS[c].fps;
const frameAt = (c, t0, k) => t0 + (k - 1) / CLIPS[c].fps;

// Size on the square, from Envoi's matched camera for this painting
// (src/stage/night-square.js: 24 degree pitch, 12 degree lens, 54 px per metre).
// Characters are drawn 1.5x true size, as painted-background RPGs usually do.
const PPM = 54, HERO = 1.5;
const tilt = y => Math.sin(((24 + ((y - 543) / 543) * 6) * Math.PI) / 180) / Math.sin((24 * Math.PI) / 180);
const metre = y => PPM * HERO * tilt(y);              // painting pixels per metre at ground y
const depthScale = y => (1.95 * metre(y)) / 370;      // the Jester: 1.95 m to her hat tips, 370 px in her frames

// ---------- the Jester ----------
const J = [];
function act(clip, t0, o = {}) {
  const cycles = o.cycles || 1;
  const a = {
    clip, t0, t1: o.until != null ? o.until : t0 + clipLen(clip) * cycles,
    from: o.from, to: o.to || o.from, loop: CLIPS[clip].loop || cycles > 1 || o.until != null,
    hold: o.hold, release: CLIPS[clip].release ? releaseAt(clip, t0) : null,
  };
  J.push(a);
  return a;
}
const P0 = [250, 655], P1 = [560, 655], P2 = [560, 850], P3 = [475, 838], P4 = [705, 548];

const enter   = act("walk_right", 9.5, { cycles: 2, from: P0, to: P1 });
const toward  = act("walk_toward", enter.t1, { cycles: 2, from: P1, to: P2 });
act("idle", toward.t1, { until: 29.4, from: P2 });
const rebuke  = act("gilded_rebuke", 29.4, { from: P2 });               // release 30.40
act("idle", rebuke.t1, { until: 35, from: P2 });
const hush    = act("hush", 35, { from: P2 });                          // release 37.67
act("idle", hush.t1, { until: 45.2, from: P2 });
const gravity = act("gravity", 45.2, { from: P2 });                     // release 46.31
act("idle", gravity.t1, { until: 54.8, from: P2 });
const seal    = act("sealed_fate", 54.8, { from: P2 });                 // release 57.80
act("idle", seal.t1, { until: 61, from: P2 });
const retreat = act("walk_left", 61, { from: P2, to: P3 });
const odds    = act("against_all_odds", retreat.t1, { from: P3 });      // release 65.17
act("idle", odds.t1, { until: 75, from: P3 });
const curtain = act("curtain_call", 75, { from: P3 });                  // release 80.17
act("idle", curtain.t1, { until: 96, from: P3 });
const away    = act("walk_away", 96, { cycles: 6, from: P3, to: P4 });
act("walk_away", away.t1, { until: DUR + 1, from: P4, hold: 0 });

const STEP_FRAMES = { walk_right: [1, 9], walk_left: [1, 9], walk_toward: [1, 3], walk_away: [1, 4] };
const STEPS = [];
for (const a of J) {
  const fr = STEP_FRAMES[a.clip];
  if (!fr || a.hold != null) continue;
  const c = CLIPS[a.clip], cyc = c.n / c.fps;
  for (let k = 0; a.t0 + k * cyc < a.t1; k++)
    for (const f of fr) { const t = a.t0 + k * cyc + (f - 1) / c.fps; if (t < a.t1) STEPS.push({ t, clip: a.clip }); }
}
const HAND = {
  flail: [250, -275], hush: [140, -285], orb: [90, -270], sigil: [-55, -330],
  pendant: [0, -255], chest: [0, -215], sky: [-70, -390], waist: [0, -165],
};

// ---------- the foes (Envoi's) ----------
// kind: wisp | wraith | great. path: [t, x, y] keys: the ground point under a
// wraith, and the middle of a wisp (wisps float; they are sized as if about a
// metre and a half above the cobbles). poses: [t, pose] from the cut sprites.
const HIT = frameAt("gilded_rebuke", rebuke.t0, 5) + 0.06;               // the flail lands
const HUSH_LAND = [hush.release + 0.42, hush.release + 0.58];
const GRAV_HIT = gravity.release + 0.42;
const SEAL_LAND = [seal.release + 0.42, seal.release + 0.56, seal.release + 0.7];
const CC = curtain.release;
const BREATH = [61.15, 65.3];                                            // stolen fire, until her ward breaks it

const FOES = [
  { id: "w3", kind: "wisp", scale: 1.7, seed: 3, rise: 22.6, hit: HIT, release: HIT + 0.75,
    path: [[22.6, 1250, 250], [24.6, 1170, 330], [27.4, 985, 785], [28.6, 985, 790], [30.3, 700, 738], [HIT, 700, 738], [HIT + 0.5, 775, 715]],
    poses: [[22.6, "idle"], [27.4, "cling"], [28.6, "flicker"], [HIT, "hurt"], [HIT + 0.75, "released"]] },
  { id: "w1", kind: "wisp", scale: 1.7, seed: 7, rise: 21.4, hushed: HUSH_LAND[0], wail: [33.6, HUSH_LAND[0]],
    path: [[21.4, 640, 280], [23.6, 820, 380], [25.6, 1040, 512], [31.6, 1040, 512], [33.4, 905, 610], [69, 900, 612]],
    poses: [[21.4, "idle"], [25.6, "cling"], [31.6, "idle"], [33.6, "wail"], [HUSH_LAND[0], "idle"]] },
  { id: "w2", kind: "wisp", scale: 1.7, seed: 11, rise: 23.2, hushed: HUSH_LAND[1], wail: [33.9, HUSH_LAND[1]], seal: SEAL_LAND[2],
    path: [[23.2, 1300, 230], [25.2, 1152, 360], [31.8, 1152, 360], [33.6, 1085, 560], [69, 1080, 562]],
    poses: [[23.2, "idle"], [25.2, "cling"], [31.8, "idle"], [33.9, "wail"], [HUSH_LAND[1], "idle"]] },
  { id: "wr", kind: "wraith", seed: 17, rise: 41.0, gravity: GRAV_HIT, seal: SEAL_LAND[1],
    path: [[41.0, 760, 470], [42.6, 790, 560], [44.4, 880, 700], [69, 880, 700]],
    poses: [[41.0, "idle"], [44.4, "idle_turn"], [44.9, "raise"], [GRAV_HIT, "kneel"]] },
  { id: "gw", kind: "great", seed: 29, rise: 48.3, seal: SEAL_LAND[0], scale: 0.86,
    path: [[48.3, 1300, 330], [50.2, 1185, 455], [52.4, 1075, 600], [69, 1075, 600]],
    poses: [[48.3, "front"], [52.6, "swallow"], [54.7, "front"], [61.0, "breath"], [BREATH[1] + 0.2, "front"]] },
];
const RELEASE_ALL = CC + 0.1;        // Curtain Call releases every foe still standing

// Doom: 3 when the seal lands, then the chapel bell counts it down.
const DOOM_TICKS = [[64.0, 2], [72.0, 1], [CC, 0]];

// ---------- the square ----------
const MOON = { x: 252, y: 58, r: 77 };
const CHAPEL_BELL = { x: 805, y: 125 };   // the bell in the chapel tower
// Lamps, from Envoi's night-square.js lights: flame point, pool on the cobbles.
const LAMPS = [
  { id: "left", at: [322, 630], base: [345, 748], gone: 52.75, back: RELEASE_ALL + 0.45 },
  { id: "well", at: [738, 628], base: [712, 725], gone: 53.05, back: RELEASE_ALL + 0.6 },
  { id: "front", at: [979, 810], base: [1003, 938], gone: 53.35, back: RELEASE_ALL + 0.75, gutter: [27.4, 29.0] },
  { id: "right", at: [1040, 525], base: [1064, 640], gone: 53.65, back: RELEASE_ALL + 0.9, gutter: [25.6, 31.6] },
  { id: "road", at: [1151, 375], base: [1170, 440], gone: 53.95, back: RELEASE_ALL + 1.05, gutter: [25.2, 31.8] },
  { id: "forge", at: [522, 512], base: [540, 578], gone: 54.25, back: RELEASE_ALL + 1.2, forge: true },
];
// Foreground cut-outs from Envoi's night-square.js: drawn again over anyone standing behind them.
const OCC = [
  { name: "well", base: [[600, 725], [820, 725]], polys: [[[630, 738], [650, 705], [655, 668], [675, 655], [712, 650], [748, 655], [768, 668], [770, 705], [792, 738], [790, 752], [760, 762], [713, 765], [665, 762], [635, 752]], [[661, 700], [661, 615], [671, 612], [673, 700]], [[756, 700], [757, 615], [768, 612], [770, 700]], [[662, 625], [672, 600], [692, 585], [715, 578], [738, 585], [758, 600], [769, 625], [760, 627], [750, 605], [733, 593], [715, 588], [697, 593], [680, 605], [671, 627]], [[711, 579], [710, 556], [720, 556], [719, 579]], [[727, 606], [749, 606], [749, 652], [727, 652]], [[589, 736], [589, 676], [603, 674], [604, 736]], [[634, 698], [634, 650], [648, 648], [649, 698]], [[811, 719], [811, 657], [826, 655], [827, 719]]] },
  { name: "lamp_left", base: [[330, 752], [360, 752]], polys: [[[330, 752], [331, 722], [337, 715], [337, 652], [309, 652], [307, 612], [322, 598], [340, 585], [346, 570], [352, 585], [372, 598], [374, 612], [352, 618], [351, 715], [358, 722], [360, 752]]] },
  { name: "lamp_right", base: [[1050, 646], [1078, 646]], polys: [[[1050, 646], [1051, 605], [1058, 598], [1058, 546], [1029, 546], [1028, 508], [1040, 492], [1058, 478], [1063, 462], [1069, 478], [1086, 492], [1088, 505], [1070, 510], [1069, 598], [1077, 605], [1078, 646]]] },
  { name: "lamp_front", base: [[984, 944], [1022, 944]], polys: [[[984, 944], [986, 888], [996, 880], [996, 834], [965, 834], [964, 790], [978, 772], [998, 762], [1003, 748], [1009, 762], [1030, 775], [1032, 790], [1011, 800], [1010, 880], [1020, 888], [1022, 944]]] },
  { name: "lamp_road", base: [[1160, 445], [1183, 445]], polys: [[[1160, 445], [1161, 405], [1164, 398], [1140, 396], [1139, 358], [1152, 343], [1165, 330], [1170, 318], [1176, 332], [1180, 345], [1176, 400], [1182, 410], [1183, 445]]] },
  { name: "stall", base: [[70, 792], [300, 785]], polys: [[[68, 795], [66, 655], [110, 640], [200, 618], [275, 602], [300, 612], [304, 700], [300, 790], [280, 798], [150, 800]]] },
  { name: "right_wall", base: [[1050, 848], [1198, 908]], polys: [[[1050, 848], [1050, 726], [1066, 718], [1084, 726], [1084, 742], [1175, 698], [1182, 702], [1188, 760], [1200, 895], [1198, 910], [1080, 862]]] },
  { name: "right_pillar", base: [[1086, 628], [1116, 628]], polys: [[[1086, 628], [1086, 560], [1100, 552], [1116, 560], [1116, 628]]] },
  { name: "low_wall", base: [[388, 872], [525, 902]], polys: [[[363, 897], [363, 832], [388, 822], [413, 832], [413, 850], [500, 888], [498, 898], [524, 888], [551, 898], [551, 1008], [498, 1008], [498, 916], [413, 882], [413, 897]]] },
];

const ENV = {
  dark:    [[0, 0.05], [20, 0.05], [24, 0.14], [29, 0.2], [33.6, 0.24], [52.6, 0.24], [54.4, 0.5], [70, 0.52], [80.2, 0.5], [81.8, 0.06], [DUR, 0.04]],
  fog:     [[0, 0.05], [20, 0.05], [26, 0.16], [55, 0.22], [81, 0.14], [90, 0.05], [DUR, 0.05]],
  moon:    [[0, 1], [20, 1], [28, 0.7], [54, 0.55], [80, 0.55], [83, 1.15], [92, 1.08]],
  newMoon: [[0, 0], [78.1, 0], [78.7, 1], [83.2, 1], [85, 0]],
  flies:   [[0, 0.6], [20, 0.6], [23, 0], [86, 0], [92, 0.7], [DUR, 0.7]],
  theatre: [[0, 0], [75.3, 0], [77.2, 0.82], [80.1, 0.9], [80.35, 0.12], [82.6, 0.1], [84.5, 0]],
  bars:    [[0, 0]],
  fade:    [[0, 1], [2.4, 0], [8.0, 0], [8.6, 1], [9.2, 0], [117.2, 0], [119.8, 1]],
  ward:    [[0, 0], [CC, 0], [CC + 0.3, 1], [85, 0.6], [89, 0]],
  still:   [[0, 1], [8.6, 1], [8.61, 0]],   // the opening shot of the town, before the square
};

const CAM = [
  [0, 620, 700, 1.44], [8.6, 700, 700, 1.44], [9.5, 470, 630, 1.84], [14.8, 560, 690, 1.84], [18.8, 620, 730, 1.61],
  [21.5, 780, 590, 1.29], [27.4, 780, 650, 1.36], [29.0, 660, 770, 1.84], [31.6, 760, 700, 1.49], [35.0, 760, 700, 1.49],
  [35.8, 590, 770, 2.07], [37.3, 590, 770, 2.07], [37.9, 780, 720, 1.55], [40.2, 780, 660, 1.44], [41.2, 790, 600, 1.38],
  [44.6, 740, 720, 1.55], [47.6, 760, 700, 1.44], [48.6, 940, 560, 1.32], [52.4, 900, 620, 1.29], [54.6, 880, 640, 1.29],
  [55.4, 590, 790, 1.95], [57.3, 590, 790, 1.95], [58.0, 800, 660, 1.29], [60.8, 800, 680, 1.32], [63.7, 560, 770, 1.67],
  [66.6, 760, 690, 1.36], [71.7, 700, 720, 1.44], [75.0, 500, 790, 1.95], [77.6, 520, 760, 1.72], [78.4, 520, 407, 1.0],
  [79.4, 520, 407, 1.0], [80.0, 740, 600, 1.21], [83.2, 720, 680, 1.38], [86.6, 500, 790, 2.4], [91.4, 500, 790, 2.4],
  [95, 700, 680, 1.44], [104, 760, 560, 1.32], [109.5, 600, 370, 1.26], [DUR, 600, 370, 1.26],
];
const SHAKES = [[HIT, 6, 0.35], [GRAV_HIT, 18, 0.9], [BREATH[1], 8, 0.5], [CC, 24, 1.3], [52.6, 4, 2]];
const FLASHES = [[HIT, 0.16, 0.18], [GRAV_HIT, 0.22, 0.3], [CC, 0.55, 0.9]];
const BANNERS = [
  [rebuke.t0, "Gilded Rebuke"], [hush.t0, "Hush"], [gravity.t0, "Gravity"],
  [seal.t0, "Sealed Fate"], [odds.t0, "Against All Odds"], [curtain.t0, "Curtain Call"],
];
const TITLES = [
  { t0: 1.6, t1: 8.0, title: "Moon Faire", sub: "A Fool's Mercy" },
  { t0: 111.5, t1: 118.6, title: "Moon Faire", sub: "A Fool's Mercy" },
];
const CHAPTERS = [
  [0, "The town"], [9, "The Jester"], [20, "Wisps"], [29.4, "Gilded Rebuke"], [33.5, "Hush"], [41, "The wraith"],
  [48.3, "The great wraith"], [54.8, "Sealed Fate"], [61, "Against All Odds"], [75, "Curtain Call"], [81, "Home"], [96, "Exit"],
];
