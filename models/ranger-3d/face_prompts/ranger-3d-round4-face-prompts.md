# Ranger – round 4: three pictures of her face

Written by Claude, November 12, 2026, after Chris said: "just use the jester witch 3d face model And then we will make specific new images of just her face so you can paint that onto the jester witch 3D face model".

## Why

- Her head is now the Jester's face model at 94% of its size, wearing her own face from C1 (see `claude/ranger-3d-stage2b-jester-face.md`).
- C1 was painted with the headband, the gem and loose hair in it. They are painted out, which leaves soft patches on her brow and temples.
- These three give her a clean face made for the head: straight on, evenly lit, nothing in the way, with the states she needs to blink and talk.
- Order: J1 first, until it is her. Then J2 and J3, each with J1 attached.
- No teeth show in any of them. That is Claude's choice, to match the Jester's states; Chris can overrule it.

## Rules in every prompt

Keep her exactly the woman in the attached paintings: the same face, the same age, the same grey-blue eyes, the same fine lines at the corners of her eyes, the same small mole on her right cheek, the same dark hair going silver. Do not make her younger, thinner or sterner. Painted as realistically as those paintings: real skin with pores and fine lines. Flat dark plum background (#3B2F43) and nothing else. Soft even light from the front, with no shadow across her face. She is NOT wearing her glasses, her headband, the gem on her forehead or her earrings. No teeth are visible.

## J1: Her face, straight on (Square)

Attach: C1 (her face from the front) and C3 (three views of her head). Stay on this one until it is her. The other two are made from it.

```
Square image. One very large close-up painting of her face from directly in front, filling the frame from her hairline to just under her chin, with both ears inside the frame. Her hair is drawn straight back off her face and tied behind her head, out of sight: no hair crosses her forehead, temples, ears or cheeks, and her whole hairline shows. Lips closed and relaxed, with only the faintest smile. Eyes open, looking straight at the viewer. Head perfectly level, not tilted and not turned. Keep her exactly the woman in the attached paintings: the same face, the same age, the same grey-blue eyes, the same fine lines at the corners of her eyes, the same small mole on her right cheek, the same dark hair going silver. Do not make her younger, thinner or sterner. Painted as realistically as those paintings: real skin with pores and fine lines. Flat dark plum background (#3B2F43) and nothing else. Soft even light from the front, with no shadow across her face. She is NOT wearing her glasses, her headband, the gem on her forehead or her earrings. No teeth are visible.
```

## J2: Six states of her face (Wide, 3:2)

Attach: your finished J1. This gives her blink, her talking mouths and her smile. Each face must sit in the same place in its box.

```
Wide image, landscape 3:2. A grid of six close-up paintings of the same face, three across and two down, each exactly the same size, each from directly in front with the head perfectly level, each in exactly the same position inside its box, each showing from the top of her eyebrows to just under her chin. Every one matches the attached face exactly except for the one change named. Top row, left to right: (1) the attached face unchanged; (2) both eyes gently closed, as in the middle of a blink, mouth unchanged; (3) both eyes half closed, upper lids lowered halfway over the eyes, mouth unchanged. Bottom row, left to right: (4) lips just parted as if starting to speak, eyes unchanged; (5) lips rounded in a small 'oo', eyes unchanged; (6) a warm closed-lip smile with her cheeks lifted and the lines at the corners of her eyes a little deeper, eyes unchanged. Keep her exactly the woman in the attached paintings: the same face, the same age, the same grey-blue eyes, the same fine lines at the corners of her eyes, the same small mole on her right cheek, the same dark hair going silver. Do not make her younger, thinner or sterner. Painted as realistically as those paintings: real skin with pores and fine lines. Flat dark plum background (#3B2F43) and nothing else. Soft even light from the front, with no shadow across her face. She is NOT wearing her glasses, her headband, the gem on her forehead or her earrings. No teeth are visible.
```

## J3: Front, turned and side (Wide, 3:2)

Attach: your finished J1, and C3. The side view paints her cheeks, jaw and ears, and shows her hairline without the band.

```
Wide image, landscape 3:2. Three large paintings of her head and neck side by side at exactly the same size, each showing from the top of her hair down to her collarbones. Left: from directly in front. Middle: her head turned 45 degrees toward the right edge of the image. Right: an exact side view, a true profile, facing the right edge. Her hair is drawn up into the loose bun high on the back of her head, as in the attached paintings, but smoothed back so that no loose strands cross her face, her ears or her neck: her forehead and hairline, the bridge and tip of her nose, her lips, her chin, her jawline, her whole ear and the line of her neck are clear against the background. Lips closed with only the faintest smile, eyes open, head level. Keep her exactly the woman in the attached paintings: the same face, the same age, the same grey-blue eyes, the same fine lines at the corners of her eyes, the same small mole on her right cheek, the same dark hair going silver. Do not make her younger, thinner or sterner. Painted as realistically as those paintings: real skin with pores and fine lines. Flat dark plum background (#3B2F43) and nothing else. Soft even light from the front, with no shadow across her face. She is NOT wearing her glasses, her headband, the gem on her forehead or her earrings. No teeth are visible.
```

## What Claude does with them

- J1 becomes her face picture, laid on the head by pupils and lip line (the head's own frame: eyes at 1.5246, lip line 0.066 below). Pupils are read off a gridded copy by eye, never found automatically.
- J2 gives the states: eyes shut, eyes half shut, two talking mouths, a closed smile. Each is cut as a soft-edged patch and set into J1.
- J3's side view paints cheek, jaw and ear at the sides, shows her hairline without the band, and is the check of the head at 45 degrees and in profile.
