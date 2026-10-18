// The film: "The Jester on the Boardwalk". Two minutes, all ten of her clips.
// Every time, place and cue lives here, so the film can be re-cut by editing
// numbers. Places are in the painting's own pixels (1448 x 1086); x, y is
// where boot soles (or a shade's hem) touch the deck.
//
//  0:00  Night on the boardwalk. The Faire's airship drifts past the moon.
//  0:08  Bells first, then the Jester, walking in from the left.
//  0:20  The lanterns gutter out; two shades rise from the water.
//  0:29  Gilded Rebuke knocks the first one back.
//  0:33  They keen. Hush seals their mouths and the night goes quiet.
//  0:38  She steps forward. A great shade rises; the last lantern dies.
//  0:45  Gravity: a new-moon disc presses it down to one knee.
//  0:49  Sealed Fate: a Doom sigil with a 3 over each of them.
//  0:55  They surge. She falls back, then Against All Odds holds the line.
//  1:10  Curtain Call: the moon goes new, sheer curtains sweep the deck,
//        and on frame 32 every Doom mark tolls at once.
//  1:20  The moon returns and the lanterns relight, one chime each.
//  1:34  She walks away down the boardwalk; the airship crosses the moon.

const DUR = 120;
const CLIPS = DATA.clips;
const clipLen = c => CLIPS[c].n / CLIPS[c].fps;
const releaseAt = (c, t0) => t0 + (CLIPS[c].release - 1) / CLIPS[c].fps;
const frameAt = (c, t0, k) => t0 + (k - 1) / CLIPS[c].fps;   // when frame k (1-based) shows

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
const P0 = [-170, 770], P1 = [430, 770], P2 = [520, 828], P3 = [330, 828], P4 = [690, 612];

const enter   = act("walk_right", 8, { cycles: 3, from: P0, to: P1 });
act("idle", enter.t1, { until: 29, from: P1 });
const rebuke  = act("gilded_rebuke", 29, { from: P1 });                 // release 30.00
act("idle", rebuke.t1, { until: 33.5, from: P1 });
const hush    = act("hush", 33.5, { from: P1 });                        // release 36.17
const toward  = act("walk_toward", hush.t1, { cycles: 2, from: P1, to: P2 });
act("idle", toward.t1, { until: 45.5, from: P2 });
const gravity = act("gravity", 45.5, { from: P2 });                     // release 46.61
act("idle", gravity.t1, { until: 49, from: P2 });
const seal    = act("sealed_fate", 49, { from: P2 });                   // release 52.00
act("idle", seal.t1, { until: 55, from: P2 });
const retreat = act("walk_left", 55, { from: P2, to: P3 });
act("idle", retreat.t1, { until: 58, from: P3 });
const odds    = act("against_all_odds", 58, { from: P3 });              // release 59.50
act("idle", odds.t1, { until: 70, from: P3 });
const curtain = act("curtain_call", 70, { from: P3 });                  // release 75.17
act("idle", curtain.t1, { until: 94, from: P3 });
const away    = act("walk_away", 94, { cycles: 6, from: P3, to: P4 });
act("walk_away", away.t1, { until: DUR + 1, from: P4, hold: 0 });

// Footfalls: [clip, frames that plant a foot]
const STEP_FRAMES = { walk_right: [1, 9], walk_left: [1, 9], walk_toward: [1, 3], walk_away: [1, 4] };
const STEPS = [];
for (const a of J) {
  const fr = STEP_FRAMES[a.clip];
  if (!fr || a.hold != null) continue;
  const c = CLIPS[a.clip], cyc = c.n / c.fps;
  for (let k = 0; a.t0 + k * cyc < a.t1; k++)
    for (const f of fr) { const t = a.t0 + k * cyc + (f - 1) / c.fps; if (t < a.t1) STEPS.push({ t, clip: a.clip }); }
}

// Spell points, relative to her soles at scale 1 (measured on the frames).
const HAND = {
  flail: [250, -275], hush: [140, -285], orb: [90, -270], sigil: [-55, -330],
  pendant: [0, -255], chest: [0, -215], sky: [-70, -390], waist: [0, -165],
};

// ---------- the shades ----------
// rise: when it starts out of the water. path: [t, x, y] keys for its hem.
// h: height in painting pixels at depth scale 1.
const HIT_A = frameAt("gilded_rebuke", rebuke.t0, 5) + 0.06;
const HUSH_LAND = [hush.release + 0.42, hush.release + 0.58];
const GRAV_HIT = gravity.release + 0.42;            // the disc lands
const SEAL_LAND = [seal.release + 0.42, seal.release + 0.56, seal.release + 0.7];
const CC = curtain.release;                         // every Doom mark tolls

const SHADES = [
  { id: "a", seed: 11, h: 330, rise: 23.6, hit: HIT_A, hushed: HUSH_LAND[0], seal: SEAL_LAND[1],
    keen: [32.0, HUSH_LAND[0]], keenF: 392,
    path: [[23.6, 1080, 505], [26.6, 1000, 615], [28.6, 930, 690], [29.85, 675, 748], [HIT_A, 675, 748],
           [HIT_A + 0.7, 860, 712], [33, 850, 712], [54.2, 845, 712], [55.6, 700, 760], [57.6, 640, 780],
           [59.7, 620, 784], [61.3, 830, 725], [69, 840, 722]] },
  { id: "b", seed: 23, h: 300, rise: 24.8, hushed: HUSH_LAND[1], seal: SEAL_LAND[2],
    keen: [32.3, HUSH_LAND[1]], keenF: 415,
    path: [[24.8, 1215, 498], [28.4, 1150, 640], [33, 1180, 676], [54.4, 1175, 676], [55.9, 920, 705],
           [57.8, 770, 742], [59.7, 745, 750], [61.5, 1150, 670], [69, 1165, 668]] },
  { id: "c", seed: 37, h: 660, rise: 42.6, big: true, gravity: GRAV_HIT, seal: SEAL_LAND[0],
    path: [[42.6, 1040, 525], [44.4, 1050, 590], [45.5, 1060, 640], [69, 1060, 640]] },
];
// Gravity holds the great shade on one knee: squash keys for it.
const SQUASH = [[GRAV_HIT - 0.01, 1], [GRAV_HIT + 0.12, 0.58], [53.6, 0.6], [56.4, 0.86], [60, 0.8], [69, 0.82]];
// The dark wave the shades throw at her, broken by Against All Odds.
const WAVE = { t0: 56.4, hit: odds.release + 0.1, t1: odds.release + 1.2, from: 980 };

// Doom: shows 3 when the seal lands, then counts down to 0 at Curtain Call.
const DOOM_TICKS = [[58.6, 2], [68.0, 1], [CC, 0]];

// ---------- the stage ----------
const MOON = { x: 968, y: 108, r: 73 };
const LANTERNS = [
  { x: 230, y: 365, r: 1, big: true, refl: [225, 585], out: 42.8, on: 80.6 },
  { x: 1255, y: 374, r: 1, big: true, refl: [1246, 640], out: 23.4, on: 85.4 },
  { x: 1048, y: 280, r: 0.45, water: [1050, 423], out: 22.9, on: 81.4 },
  { x: 1138, y: 288, r: 0.45, water: [1136, 438], out: 22.3, on: 82.2 },
  { x: 1222, y: 262, r: 0.4, water: [1170, 464], out: 21.7, on: 83.0 },
  { x: 1338, y: 236, r: 0.4, out: 21.1, on: 83.8 },
  { x: 1412, y: 241, r: 0.4, out: 20.5, on: 84.6 },
];
const FLICKER = [[31.8, 36.4]];   // the keening shakes the flames

// Envelopes over the whole film.
const ENV = {
  dark:   [[0, 0], [20, 0], [26, 0.22], [43, 0.34], [56, 0.44], [59.6, 0.26], [70, 0.3], [79, 0.2], [84, 0]],
  fog:    [[0, 0.18], [20, 0.18], [27, 0.62], [61, 0.6], [77, 0.3], [88, 0.1], [DUR, 0.1]],
  moon:   [[0, 1], [20, 1], [26, 0.62], [43, 0.45], [70, 0.45], [79, 0.5], [81, 1.18], [92, 1.1]],
  newMoon:[[0, 0], [73.1, 0], [73.7, 1], [78.6, 1], [80.4, 0]],
  flies:  [[0, 0.8], [20, 0.8], [24, 0], [83, 0], [89, 1], [DUR, 1]],
  theatre:[[0, 0], [70.3, 0], [72.2, 0.82], [75.1, 0.9], [75.35, 0.12], [77.6, 0.12], [79.5, 0]],
  bars:   [[0, 0]],   // letterbox bars, off: the painted moon sits too near the top
  fade:   [[0, 1], [3.2, 0], [117.2, 0], [119.8, 1]],
  ward:   [[0, 0], [CC, 0], [CC + 0.3, 1], [80, 0.6], [84, 0]],
  // The airship: [t, x, y] of its centre, and how much of it shows.
  shipA:  [[0, 0.85], [19, 0.85], [24, 0], [86, 0], [90, 0.9], [DUR, 0.9]],
};
const SHIP_PATH = [[0, 1290, 182], [26, 690, 168], [26.1, 210, 150], [86, 210, 150], [120, 1125, 162]];

// Camera: [t, centre x, centre y, zoom]. Zoom 1 shows the painting's full
// width; 16:9 crops it top and bottom.
const CAM = [
  [0, 724, 430, 1], [8, 724, 440, 1], [15, 600, 520, 1.25], [19.5, 600, 520, 1.25], [22, 724, 455, 1],
  [27.6, 724, 470, 1], [29, 700, 520, 1.2], [31.4, 724, 470, 1], [33.6, 724, 470, 1], [34.6, 520, 520, 1.45],
  [35.9, 520, 520, 1.45], [36.6, 760, 490, 1.08], [38.4, 724, 470, 1], [42.4, 724, 470, 1], [43.8, 760, 420, 1],
  [45.2, 760, 470, 1], [48.6, 724, 470, 1], [49.6, 530, 540, 1.5], [51.6, 530, 540, 1.5], [52.3, 724, 470, 1],
  [55, 690, 480, 1], [57.6, 690, 480, 1], [58.6, 470, 545, 1.32], [60.6, 640, 480, 1.05], [66, 640, 480, 1.05],
  [69.6, 600, 500, 1.12], [70.6, 390, 570, 1.55], [72.6, 430, 560, 1.4], [73.3, 724, 407, 1], [74.3, 724, 407, 1],
  [75.0, 724, 455, 1], [78.5, 724, 470, 1], [81, 600, 500, 1.15], [86, 600, 500, 1.15], [88, 360, 575, 1.9],
  [91.6, 360, 575, 1.9], [94.5, 640, 470, 1], [103, 760, 420, 1], [109, 880, 345, 1.2], [DUR, 880, 345, 1.2],
];
// Screen shakes: [t, strength in painting pixels, how long it rings]
const SHAKES = [[HIT_A, 7, 0.35], [GRAV_HIT, 20, 0.9], [WAVE.hit, 9, 0.5], [CC, 26, 1.3], [44.0, 4, 1.5]];
// White-violet flashes: [t, strength, fade time]
const FLASHES = [[HIT_A, 0.18, 0.18], [GRAV_HIT, 0.25, 0.3], [CC, 0.55, 0.9]];

// Spell names, shown JRPG-style along the top.
const BANNERS = [
  [rebuke.t0, "Gilded Rebuke"], [hush.t0, "Hush"], [gravity.t0, "Gravity"],
  [seal.t0, "Sealed Fate"], [odds.t0, "Against All Odds"], [curtain.t0, "Curtain Call"],
];
const TITLES = [
  { t0: 2.6, t1: 8.6, title: "Moon Faire", sub: "The Jester  ·  New Moon" },
  { t0: 111.5, t1: 118.6, title: "Moon Faire", sub: "The Jester  ·  New Moon" },
];

// Shown on the scrub bar.
const CHAPTERS = [
  [0, "Night"], [8, "The Jester"], [20, "Shades"], [29, "Gilded Rebuke"], [33.5, "Hush"], [45.5, "Gravity"],
  [49, "Sealed Fate"], [58, "Against All Odds"], [70, "Curtain Call"], [80, "Lanterns"], [94, "Exit"],
];
