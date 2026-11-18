# Chris's decisions

Written November 18, 2026, from the Flip Book Art project's memory (three files: the 3D models, the lore, and the starter-world game).

How to read this:

- Newest first. Times are as the memory recorded them.
- Only things Chris said himself are here. Where Claude suggested something and Chris did not answer, it is not a decision and it is not listed.
- A decision that a later one changed is marked **Replaced**, with the date of what replaced it. Follow the newer one.
- The memory gives no dates for November 10 to 12, so that section is in the order the memory holds it, newest first.
- Left out on purpose: anything personal about Chris's family, and details of his API key (the notes say the key itself is never written down anywhere).
- For the full story behind a decision, see the notes in `claude/` and `lore/`. `INDEX.md` lists them.

## November 18

- Moon Faire is being merged with the new Envoi into one game in a new repo.
- Before the merge, each conversation pushes its unpushed work to the branch it already used (not main, and not anyone else's branch) and writes a short session note to `docs/project-notes/sessions/` on that branch.
- The repo is public, so no keys, passwords or private details go in it.

## November 17

- He is making a new Envoi in another project at the same time, and wants the two projects to work together and fuse. The project notes can be pushed to the repo.

## November 16

- **The four witches' names in the game are Io, Kore, Europa and Callisto**, a coven quartet. Thareia has no moons by those names; they point to real-life myth. The four follow the moon Auros round Thareia. Which name goes to which witch is not set.
- Grey Hat (the captain): make a light model of him matching only the size of the other NPCs (he thought about 6,000 triangles).
- Base doll (Io's body) with her outfits (November 15 to 16): a light model of each outfit at about 50,000 triangles, switchable with the full one; then a light-only version, "Moon Faire: the base doll light", as one HTML file in its own folder in the repo. Next: face variations for what he assumes will be an all-female cast, keeping the same 3D face model and only painting it differently.

## November 15

### The final boss

- 4:24 pm. Bramble foes: three models (Envoi's two different brambles, plus a great bramble made by changing the larger one), each with a small, light version too. Their attacks use the wraiths' strategy and numbers at the same level, under different names and animations, so the combat balance stays the same.
- 4:18 pm. The full refill is in: when the boss falls the first time, the whole party gets back up with full HP and MP. If the party falls in the final form, they start again from before the first form. Maybe a rest spot just outside the place of the final fight. The story reason for the refill should come from the magic the Jester is doing and from what the boss is (a black orb in light). The 3D model of the boss in its two forms looks great.
- 3:23 pm. The final fight: helpers first, then the boss alone. The helpers are wraiths and brambles. When the first form ends, the fallen get up from the Jester casting Curtain Call. The second round is harder but works out to the same balancing.
  - **Replaced** the 1:58 pm question (one entity alone, or the Great Wraith's numbers under new names with the same helpers).
  - The refill was "maybe" here; it became a yes at 4:18 pm.
- 1:58 pm. The boss loses HP without showing damage, then at zero HP turns into its final form, which looks broken, larger and more vibrant.
- 1:06 pm. A gate at about level 10 is the final great wraith fight. A gate at level 20 is the great bramble fight. The final boss comes after that.
- 12:56 pm. Before the final fight a choice pops up: easy, medium, hard or crazy. It sets the fight's level to 20, 21, 22 or 22.8 (crazy is 22.8, not 23).
  - **Replaced** the morning's "a big bad at level 21 or 22".
- Morning. The party stops at level 20 and the big bad is above that, so every kind of player can see the whole game but winning takes trying very hard. Only an expert who has found everything should just barely win with the foes two levels above. At 7:54 am he called the final fight at level 22 "a good balance".

### Fights, herbs and foes

- 1:06 pm. Out in the open land, the foes met are from one level below the party to two levels above.
- 1:03 pm. The fight camera is perfect except for a tiny zoom away when attacks land, which is to be found and fixed. The damage number comes a beat after the blow lands, not during it. Several hits show each hit's damage adding up to the total, as in Envoi on the Longest Night. The fight controls are good on the phone; on the laptop the witches' boxes and the spell buttons are to be gathered into the bottom right corner. Wide spells, such as the deer summon, need a shot wide enough to show all of the animation.
- 12:56 pm. Outside a fight, HP and MP herbs are given to the whole party at once ("top everybody up"). The herb bag can hold a very high number. An MP herb is 20 MP. Plants between fights: "steady", and players can gather more in a safer zone before a harder area. The game should teach early that not topping up between fights means not winning.
- 7:54 am. She gets more herbs by picking the wild plants already growing on the moor. A rest spot refills everything for free, so rest spots must be placed with care: not too close together and not too far apart.
- 7:38 am. **Fights start with whatever HP and MP the party has**, not full. Io makes herbs that refill HP and MP after a fight. Each is worth less than any combat spell; used in a fight, a herb is worth half the weakest healing spell. They are used several at a time between fights.
  - **Replaced**: every fight starts with full HP and MP.
- Found items: half strength. The names and cards of the 18 finds work. The two MP finds stay, because MP will need refilling after fights. He still dislikes that finding all of them gets close to a sure win.
- Foes: the wraiths are levels 1 to 10. The two levels of bramble foes from Envoi, with wraiths mixed in, are levels 11 to 20.
  - **Replaced**: the planned three wraith foes only (November 13).
- Pretend players for testing: eight in all. Five levels of attentiveness (very careless, careless, attentive, focused, expert), and the three most attentive each in two play styles. He is less sure about the two styles.

### The captain

- The Grey Hat captain is done and is in the repo.
  - **Replaced**: his hat, gear and NPC animations still to build (November 14).

## November 14

### The open world

- 9:10 pm. The player is the Jester, and the rest of the party walks with her, so the fair folk only talk to the Jester. 40 lines for each of the fair folk is enough.
- 9:07 pm. The camera zooms by itself: as close as it goes while she stands still, further out as she walks, further again as she runs, and back in when she slows. The three distances are the ones in the three phone screenshots he sent.
  - **Replaced**: two steps of 20% (8:56 pm), and before that about 10% and another 10 to 15%.
- 8:58 pm. Start the fair folk's minds and their lines. Each one's lines depend on how many times you have talked to them, whether you have talked to the others, how much of the game is done and what level you are. The possibilities are to be thought through before the build starts.
- 7:56 pm. A better-looking set of controls for the open world: the menu buttons, the talk and information text, and pop-up bubbles for talking with the fair folk. A lot of dialogue and a mind for each of the fair folk are part of the plan.
- 3:44 to 4:01 pm. Trees, shrubs and grasses in the wild if they are cheap, and a few kinds of flowers through the purple and yellow moor. Wild fights more often. A wider span of levels so kinds of fight can repeat, with about 5 to 10 times as many fights as first planned.
- 3:16 to 3:20 pm. Foes in the open world are unseen chance meetings, not foes you can see roaming, and only in certain places: outside the lit zones and away from where people are. Running is a quick double press of a direction. She should cover more ground: walk at about her old run speed, run about twice as fast.
- 3:10 pm. The view turns with the mouse while movement is on the keys. The Flipbook look can be switched on and off in the game.
- 3:04 pm. In the fair square test, Light works perfectly, and Lightest is for phones. He wants a different Flipbook filter for the whole scene, careful with tone and shading so things stay easy to see. Each area to explore should be bigger with more in it, not more areas.
- 2:33 to 2:45 pm. The airship captain is a friend of the Moon Faire. The pause menu gets a place where each of the four witches can be seen alone at her highest detail, turned round and made to do her moves. The game should be many separate pieces that plug together easily.
- Afternoon. **Everywhere is a 3D open world you can walk and explore.** Meeting a foe while walking cuts to a fight on a painted background. "This is absolutely the way I want the map to be in the game." The moor is built with the method of his racing game, and the fair centre is built in 3D and skinned with his paintings, with a camera behind her that turns. The world can be much bigger, because the same texture packs can be used again for new zones.
  - **Replaced**: painted walking areas (November 13), and the plan to trace walking paths in the map editor (earlier the same day).
- The open world uses the Light and Lightest models of the four witches and the light models of the fair folk.
- 4:39 pm. One note in the project lists everything left to make this a full game, where any session marks what it is working on and what it has finished, so no two sessions do the same thing (`claude/TASK-BOARD-moon-faire-game.md`).

### Fights

- 9:16 pm. Keep the camera angles exactly as they are, zoomed out 25%. Slow the pace of the moves by about 10%.
- 9:00 pm. It is hard to see the attacks land. The fight information should be easier to see, and the HP bar clearer through better colours, not a bigger bar.
- 7:48 pm. The fight camera is a mix: the wide view from behind the party, the view from behind their heads with a swing on every move, and maybe other good angles, switching between them cleverly as the fight goes. The screen for picking moves could be better.
  - **Replaced** 7:26 pm: behind the party with a wider angle.
  - Which **replaced** 6:38 pm: the whole party and the foes seen from the side in front of the painted background.
  - Which **replaced** 6:21 pm: the camera maybe behind their heads, swinging round to each move.
- Still standing from 6:21 pm: the party faces the foes.
- 7:30 pm. Levelling for the bigger game: option B. 20 levels, level 20 the top, 180 fights to finish, about 3 to 6 hours of fights.
  - **Replaced**: undecided between 120, 180 and 240 fights, and the starter world's levels 1 to 5 (November 13).
- 7:59 pm. For the levelling session: more finds first, then which foes are met where, then the story's effects in fights. Everything finished is pushed before the next step, with a note of what was finished and what was started.
- 6:32 pm. Yes to pushing the fight work and the open-world work to the repo ("push everything").
- Yes to closer fight cameras on the pilot, to flip between them.

### The models

- After looking at the pilot on his phone, the rule for **which weight of model is used where**: Lightest for walking the fair's centre and at full fight distance; Light for close-ups and for most talks and closer moments; Full only in a "view my character" place in the menu.
  - **Replaced** November 13, night: Light for almost everything.
  - Which **replaced** November 13: Light for fights, Trim for most walking, Full for close-ups and the menu.
- Io is done. Make her set of lighter versions.
  - **Replaced**: her reactions first, then a second, more detailed pass over all her spells (earlier the same day).
- The Ranger is done. Make her set of lighter versions.
- All four witches get the newer Flipbook look, the finer one with the sliders for pixel size and colour.
- Io's remaining spells, in the order he likes: Elderwood Guardian, Moonflower Garden, Thornwake, Rootbound Return, Bramble Cradle, then being hit, falling and winning.
- Grey Hat: his trousers have real holes, with the doll's skin painted before the clothes go over it. His lower arms and upper chest are painted on the doll and the shirt goes over them as real cloth that moves. His ankles should move properly in his boots. Then his hat, belt, pouch, scroll and jewellery, and all the moves the fair folk have. He looks good as he is.
- Grey Hat's builder: Fable 5.2 at high effort through the API key is good to carry on; once the key runs out, Opus 5.5 helpers do the work and this session checks and fixes it.

### Working rules

- Claude may use his API key to work with other models or to make helpers for this game.
- Claude may make several Opus 5.5 helpers at high or extra-high effort to build parts, only where it helps.
- He is building on the story Claude chose ("now that we know the story") and wants picture prompts for the story's moments.

## November 13

### The game

- Night. Light could be used for almost everything in the game. **Replaced** on November 14.
- Night. The Flipbook look he likes: on the pilot, the finest pixels with full flipbook colours. On the characters and their faces, 1.2 mm of her to a pixel is a good level, 1.7 is interesting, about 2.2 is also good, and around 2.4 takes away too much.
- Night. The fight is seen from too far away and needs interesting camera angles.
- Night. Asked Claude to think about the witches and choose the story.
- Later. Not "a demo": **"a game in mini form", the starter world.** The party levels up, there are at least three zones, and something gates the third zone so they must run round the wilds and level up. Fights happen on a painted backdrop with the characters and all their spells on top.
  - **Replaced** earlier that day: a demo with the four witches, the captain, Envoi's foes, one tent town and one wild area, the town built in 3D.
  - Its painted walking areas were themselves **replaced** on November 14 by the 3D open world. Painted fights still stand.
  - Its levels 1 to 5 were **replaced** on November 14 by 20 levels.
- The layout: three areas in the Moon Faire, four in the wilds, three in the dark beacon.
- All four witches are in the party from the start. Their story goes back to before the game.
- The only people in the game are people the party talks to. No background crowd.
- Pictures from Envoi are for fight backdrops only.
- Foes: the planned three. **Replaced** on November 15.
- Things found in the world: the witch picks up a shimmering thing and the player sees a card with its lore and what it does, not a 3D model of it.
- The fair folk need lots of varied lines for every circumstance, and simple minds of their own.
- Each area needs "things that can happen". Yes to more rest spots. Yes to wisps drawn to the sparring ring.
- If one of the people's 3D models looks different from its notes, change the notes to fit the model.
- One person walks around, not one with three following. When they talk, a picture card pops up next to the text box, as in Envoi. (On November 14 he put it this way: the player is the Jester and the rest of the party walks with her.)
- He thinks Moon Faire is a laptop-only game, so speed is measured on his laptop. (On November 14 the fair square test "ran great" on his devices, and he thought Lightest for phones.)
- The foes get a more detailed 3D model for close-ups, which is then baked onto the lighter model used in fights.

### The lore

- Everything he has made so far is from the continent of Aethermoor on the world Thareia, whose moon is Auros. **Moon Faire's story takes place on a different continent of Thareia** (not yet named), in a different time from his other games, because the moon has to be above where they are.
- Moon phases are not part of the witches' magic.
  - **Replaced**: the earlier idea that it is new moon there, the Jester's phase.
- Auros goes once round Thareia every 500 years.
- The Moon Faire is a normal fair the four travel with, named because it follows the moon round the planet. It is the most mixed gathering of cultures and knowledge there is. The world is a Dark Ages fantasy with solar crystal power that looks like steam, and travel to the moon and nearby planets by space airship. There will be an airship in this game.
- The four's kinds of power: the Ranger is the moment, Io is healing, the Fox is chaos magic, and the Jester is the duality of life and death, and infinity.
- Combat was reworked from the beginning, keeping only the animations. After playing the blob battle he likes the balance; it is saved in `lore/combat-balance.md`.
- Combat is turn-based, "like chess", with no penalty for not clicking fast.
- Fights at the party's level stay as balanced. Difficulty changes through simple things found in the game (for example about 5% more healing), never by changing the rules.
- Foes up to four levels above the party are only weak foes. A single boss needs the party within a level. An area's end boss needs the same level.
- Numbers keep growing 20% a level (the Jester up to about 100,000). He likes big climbing numbers.
- All sessions work from the project's `lore/` folder and the moon-faire repo. The extra spells the 3D models can do are a store to draw on beyond the spells the game uses.

### The models

- All the 3D models get the Flipbook look as a feature. Get a model looking good without it first; using the look to hide a weak model does not work.
- The witches need lighter versions so all four can be drawn together. After seeing the Jester at four levels (Full, Trim, Light, Lightest), each of the other witches gets the same four once she is finished.
- He likes that all the witches can hover and talk while hovering, and wants all four to hover together one day.
- The moves and spells each character does in the game are settled. The Jester gets a new page with only her game spells plus all her moves. The page "Jester Witch 3D: the night square" is kept exactly as it is.
- A new character to model: someone the four meet, an airship captain, "the Grey Hat", maybe named Noiz. The gold flecks on his boots are a coded animation of gold dust round his feet.
- Grey Hat, night: rebuild him on one of the witches' blank dolls shaped into a man, with the clothes put over the doll, in stages.
  - **Replaced** earlier that day: he looks pretty good, do not remake him from scratch.
- The fair folk: one simple 3D person can carry two or three different painted skins. All the painted ones can be in the game, with the hats pulled down on those who wear hats. They use a quarter of the triangles. The farm lad and the gate keeper built on the Opus 5.5 shapes are dropped (their waist vanishes at the lighter weights); the rest stay. All of them get walk, sit down and maybe run, and are wired for talking and emotes.
- Who builds the fair folk: Fable 5.2 at high effort through the API key.
  - **Replaced** earlier that day: Opus 5.5 only.
- The Fox:
  - Her head is 10% larger, with the depth reshaping on (he first said 15%).
  - She has her own face. He tried giving her the Jester's face and chose it, then changed his mind the same day: it still reads as the Jester, and the four are separate characters.
    - **Replaced**: the Fox uses the Jester's face.
  - No teeth on her face at all.
  - Her hair is a smaller messy bun with loose messy hair over her whole head and heavy parted bangs; her ears are hidden behind the hair; the hair moves. Approved.
    - **Replaced**: one messy ponytail bun.
  - Her trousers: the first build was "far too baggy".
    - **Replaced**: very wide patchwork trousers.
  - Her forehead is half an inch shorter.
  - Her everyday moves are her own (her own talk, laugh, dance, curtsey and pounce). She also keeps the Jester's bow and twirl, and her wave and jump can stay the Jester's.
    - **Replaced**: different moves in place of the bow and twirl.
  - Evening: the Fox is finished with two favourite moves from round 4. The other eight are not being built.
    - **Replaced**: rounds 3 and 4 next.
- The Ranger:
  - Her head uses the Jester's 3D face model, with her own face painted on it.
  - She keeps the younger face, and her hair stays grey.
  - She gets her own moves as the character she is: quick, acrobatic, the sporty one, with a bow and a sword. She gets her own talking animation; the witches should not all share one.
  - Her arms must not pass through the lace of her sleeves, and her hands must not pass through her bag or her legs.
  - The gem's two strong shots are arrows of light. Her hover should look like meditation. "I think that's her for now."
- Io:
  - Start her 3D model from scratch, in a better, more lifelike style than her Envoi model.
  - Her painted face has no hair in it; the hair in front of her face is real 3D hair. Her bangs frame her face and do not hide it.
  - Her hat comes down by 15%, then by another 30%.
  - The moss is on her overcloak only.
  - Her wave is coy. Her boots need no more detail. More detail on her belt, pouch and necklace is not needed.

## November 10 to 12

The memory gives no dates for these.

### The lore

- **The Jester's big spell charges by damage, not by a count of hits.** All damage aimed at her counts, whether or not she taunted the foe, and the spell is ready when that adds up to 75% of her total HP. She is the tank and should be the reason they win most fights.
  - **Replaced**: still choosing between four ways the spell could work.
- The Fox is a playful chaos-magic witch and a fabric artist of "the fabric of reality". Her fox ears are costume ears. She has no tail apart from ghost tails in spells. Her magic is cold blue foxfire. Making a foe attack itself should be something special. The party fleeing should be shown in a creative way, without copies of them left behind.
- The order of magic power, strongest first: Jester, Fox, Io, Ranger. The Jester has the highest HP, not the lowest.
- He is open to additions to the lore as long as they do not take away from it.
- The lore lives in the project's `lore/` folder and is not final until he says so.
- Moon Faire is its own game, in the same universe as his other games (Envoi, Witch Way, the Aethermoor games) or one beside it. It will reuse their assets and may borrow their lore. His aim is to keep building all these games in one universe.
- The four are four levels: "the moment, then nature, then chaos, then infinity". The Jester's spells should be dark and frightening, like the black of space and the endlessness of the universe.
  - On November 13 he gave Io's kind of power as healing.
- The Jester's spells are ideas for a direction. They can be lifted, changed or made grander as long as each still looks like what it is.

### The Jester's two models

- **The HD Jester is the one used from here on**, not the not-HD model.
  - **Replaced**: the second session's plan for a posable game model of the more cartoon Jester (the "not HD 3D model of Jester Witch").
  - Which **replaced**: a second session to make a better flipbook.
- HD Jester in the night square: every button and animation she has must stay. Only add to her, never remove.
- HD Jester, the charge: it shows as a dust of very simple single-pixel specks round her that gets thicker until she casts, when it becomes the rings of the two-part cast (Sealed Fate into Curtain Call). Her lore spells get more drama by adding effects on top, not by changing them.
  - **Replaced**: undecided on rings building round her with each hit.
- HD Jester: the see-through red and gold veil is one cloth in two tones. No strips of cloth hanging down her front. The hat comes to more of a point before the pompoms and flops down more.
- HD Jester's face: keep the earlier face shape.
  - **Replaced**: a later change to the face, which he asked to have undone.
- No cross on the forehead of her cap.
- The not-HD model: kept in its own place under that name. The strips of red cloth beside her head come off. Its demo, "Night of No Moon: the square", is turn-based. A training area has free control of the camera and just a dummy in the corner.
- For now the Jester is the only character, and balance comes later.
  - **Replaced** on November 13, when all four joined the party and the combat balance was worked out.
- Because the witch can look this good in 3D, he wants to reuse the whole Envoi game.
- The Fox model is started next. She is not locked to what the lore says, and she animates at least her flipbook moves plus the moves in the lore.
- The moon-faire repo holds the source, so separate sessions in the project can share it.
