You write the body language for the ordinary people of a painted fantasy game about a travelling night fair: sellers, hands, an old watchman. The player walks up and talks to them. Each emote is a short move laid over the person's quiet standing pose. Every person shares one skeleton, so one library serves them all.

Reply with one JavaScript code block that defines `const EMOTES = { ... };` and nothing else, or with the single word `DONE` when the pictures you are shown are right.

## The pose language

A move is a list of keys. A key has a time `t` (seconds from the start) and any of the channels below. A channel you do not mention stays as it is in the standing pose. A channel holds its last value, then returns to rest by itself over the last `outro` seconds. Writing `'rest'` as a value sends a channel back to rest at that key. Motion between keys is smooth.

The person is 1.65 m tall, faces +z, and their LEFT is +x. Positions are metres in their own space; angles are radians.

- `hd: [turn, nod, tilt]` the head. turn + is toward their left; nod + is down; tilt + tips toward their right shoulder. A nod is 0.25; looking aside is 0.5.
- `sp: [turn, bend, lean]` the spine, the same way. bend 0.15 is a small bow, 0.78 a deep one.
- `sh: [right, left]` shoulders lifted. 0.16 is a shrug.
- `hip: [x, y, z]` the hips moved (a weight shift is 0.03 to one side).
- `hR`, `hL`: where the right and left wrist go. At rest hR is [-0.300, 0.868, 0.055] and hL is [0.300, 0.868, 0.055]. Chest height is y 1.25, the chin 1.42, the top of the head 1.65.
- `eR`, `eL`: the way the elbow points. At rest [-0.55, -0.1, -1] (right) and [0.55, -0.1, -1] (left). For a raised hand use out and down, like [-1, -0.5, -0.2].
- `twR`, `twL`: the forearm's twist, -1.2 to 1.2. About 1.2 turns the palm up.
- `wrR`, `wrL`: the wrist, [bend, side-to-side], each about -0.5 to 0.5.
- `fR`, `fL`: the fingers. One of `FP.relax`, `FP.open` (flat hand), `FP.soft`, `FP.point`, `FP.fist`, `FP.cup`.
- `eyes`: 0 open, 1 shut. `mouth`: 0 closed, 1 open, 2 smiling. The person blinks by themselves.

Two moves from the template, as examples of the style of writing (they belong to a stage performer, so they are bigger than what you should write):

```js
wave: { dur: 2.7, outro: 0.6, keys: [
  { t: 0.35, hR: [-0.36, 1.50, 0.12], eR: [-1, -0.5, -0.2], fR: FP.open, twR: -0.5, wrR: [-0.15, 0.35], hd: [-0.10, -0.04, -0.08], sp: [-0.05, 0, -0.03], mouth: 2 },
  { t: 0.62, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] }, { t: 0.89, hR: [-0.33, 1.52, 0.12], wrR: [-0.15, 0.4] }, { t: 1.16, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] },
  { t: 1.43, hR: [-0.33, 1.52, 0.12], wrR: [-0.15, 0.4] }, { t: 1.97, hR: [-0.36, 1.50, 0.12], wrR: [-0.15, 0.2], mouth: 2 }, { t: 2.45, mouth: 0 } ] },
laugh_start: { dur: 1.0, keys: [
  { t: 0.25, hd: [0, -0.20, 0.05], sp: [0, -0.07, 0], hL: [0.09, 1.02, 0.17], eL: [1, -0.3, -0.2], fL: FP.soft, wrL: [0.3, 0], eyes: 0.85, mouth: 1 },
  { t: 0.42, sh: [0.16, 0.16], mouth: 2 }, { t: 0.59, sh: [0.02, 0.02], mouth: 1 } ] },
```

## Rules

- These are ordinary people, many of them old. Keep moves small, clear and natural. One idea per emote.
- The people wear long skirts, aprons, coats and hats. A hand in front of the body below the chest must be at least 0.22 forward (z). A hand beside the hips stays at least 0.26 out to the side (x). Keep hands below y 1.50 or outside x 0.20 near the head, because of hat brims. Do not cross the arms or clasp the hands tightly; hands may come within 0.10 of each other in front of the chest at z 0.25 or more.
- Do not move the feet or knees.
- Most people favour the right hand. Use the left hand for some emotes so they do not all look alike.
- Emotes last 1.2 to 3.5 seconds. End every move so that the pose is close to rest before the outro.
- Talking loops last 6 to 8 seconds and are played over and over while the person speaks. The mouth opens and closes in an uneven speech rhythm (0.12 to 0.3 seconds a beat, with a pause or two where the mouth stays shut). Add small nods and tilts of the head and one or two modest hand movements. Start and end at rest so the loop repeats cleanly.

## The library to write

Use exactly these names.

Talking loops: `talk_calm` (an unhurried, friendly speaker), `talk_lively` (quick, warm, hands busy), `talk_gruff` (few words, little movement, a hard nod now and then).

Emotes: `nod` (yes), `shake_head` (no), `wave` (hello, from someone who is not a performer), `greet_bow` (a small polite dip of the head and shoulders), `shrug` (who knows), `laugh`, `point` (pointing the way, off to their right), `think` (hand to the chin, eyes up), `surprised` (a small start, mouth open), `sad` (head down, shoulders sink), `cross` (displeased: a sharp shake of a raised finger or fist), `beckon` (come closer), `refuse` (flat hand held up: no thank you), `thanks` (hand to the chest, a nod, a smile).

Idle fidgets, played now and then when nobody is talking: `fidget_shift` (weight from one side to the other), `fidget_look` (a slow look to one side and back), `fidget_hands` (rubs or warms the hands in front of the body).

## When you are shown pictures

You will be shown each move as six pictures in a row, evenly spaced through it, on one of the people, with any errors. Look for: a hand passing through the skirt, apron, body or hat; an arm bent the wrong way; a move too small to read at this size or too big for an ordinary person; a mouth that never opens in a talking loop. Reply `DONE` if they are right, or the whole corrected file.
