# Fights: the camera, and which way the party faces (Chris's three answers, November 14)

By the "Fights" session. This replaces the camera part of `claude/fights-the-fight-as-one-piece.md`; the rest of that note stands.

- **Page:** https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi (republished 7:45 pm).
- **Repo:** branch `claude/moon-faire-fights` in `chriskizer91-ops/moon-faire`, on top of `claude/moon-faire-starter-world`. Chris said "yes push everything" at 6:32 pm, and each change since has been pushed. **Where the other note says the code is not in the repo, that is no longer true.**

## Where it stands now: the directed camera (his third answer, 7:26 pm)

"I feel like maybe behind the party with a wider angle would be a good idea. I'm open to even more direction, decisions. I guess director decisions is what we have to decide here and this is very important."

He asked for direction, so these five decisions are Claude's, built as the default camera ("Directed: wide, behind the party"), and his to overrule:

1. **Every fight opens on the painting, sharp and side on,** for two seconds while the foes arrive. Then it cuts behind the party. This is the one moment his painting is seen as he painted it.
2. **The resting view is wide:** behind the party and well round to the audience's side (55 degrees off the line from party to foes). The party is on the left with their backs to us, all four whole, and every foe is beyond them on the right.
3. **A plain move stays in the wide view,** with a slow push in. Nothing cuts. With 120 to 240 fights planned, a cut on every move would wear thin.
4. **A big move earns its own shot, the swing** (from over the mover's shoulder, round to her side, then to whoever it landed on): Sealed Fate, Curtain Call, the Heal taunt, the gem's two shots, Pins and Needles, Crazy Quilt, Same Cloth, Borrowed Face, the Guardian, Revive, Bloom; and a foe's Heavy, Crush or Eclipse. A plain Blow stays wide.
5. **A won fight ends on the party's bow,** seen from the foes' side.

- The witches rest facing the foes in every camera.
- The code: `behindShot`, `BIG` and `wide` in `game/fight/fight.js`. Which moves count as big is the list `BIG`.
- **Its cost:** the painting is out of focus in every shot but the opening. A painting is made from one spot, so a camera standing somewhere else can only show it soft (`claude/pilot-fight-cameras.md`). Sharp backdrops from behind the party would need a second painting of each fight place made from there.
- In the wide view one witch can stand partly in front of another (the Fox in front of the Jester), because the party stands in a diamond.

## His second answer (6:38 pm): side on

"I think it's better just seeing the whole party and foe party from the side in front of the painted background, with the witches facing the foes. Also some of the witches' animations need to be looked at, maybe adjusted."

- Built as "Side on, everyone": the whole party and every foe from the side, in front of the sharp painting, with no cutting in. Still in the Camera menu.
- **Which animations he means is not known yet.** He was asked at 6:45 pm and has not said.

## His first answer (6:21 pm): behind their heads, a swing on every move

"We need the hero party looking at the foes and maybe the camera is from behind their heads. And then we do some camera movement to swing around and look at each move but cuts back to the whole group in between."

- Built, and still in the menu as "Behind their heads, a swing on every move".

## A fault that was live for a short time

From 6:29 to 6:42 pm on the page, and in commit `3f78a98`: a comment had swallowed the line that turns a witch toward her target. The Jester, the Fox and the Ranger cast while still facing the foes, so their spells and arrows went toward the back of the place. Chris played that version. Fixed in commit `fc61a2a`, and he was told.

## Checked, and not

- Stills of the directed camera: the opening, the wide view at rest (the last fight among the standing stones, and a Shadow Wraith and two wisps at the fair), a plain move staying wide, a big move's swing, the great wraith's strike, the bow, and the phone layout. Whole fights ran to the end with no errors.
- **Not checked: anything moving.** The test browser has no graphics chip. The speed of the push in and of the swing, and how the cuts feel, are Chris's to judge.

## For Chris to say

- Whether the wide view is the right distance and angle.
- Whether the list of big moves is right.
- Which animations looked wrong, and on which witch.
- Whether second paintings of the fight places, made from behind the party, are worth asking for.
