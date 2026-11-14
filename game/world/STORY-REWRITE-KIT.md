# Rewriting the demo map for the chosen story

Chris, who makes Moon Faire with Claude, asked for the demo's story to be chosen, and it has been: "The fire that would not end" (given below, with the lore brief, the drafted map and Chris's nine paintings). The map was drafted for an older placeholder (wisps steal the captain's lamps). Rewrite the parts of the map that carry story so they tell the chosen one.

The lore is Chris's. Everything you write is a stand-in he can change. Plain words, short sentences. He reads on his phone. Invent no proper names for people, places or things.

## What Chris wants from the story (his words, gathered)
- Interesting story beats outside the combat.
- Lore built on the four witches and their kinds of power: the Ranger is the moment, Io is healing (nature), the Fox is chaos magic, the Jester is the duality of life and death, and infinity.
- It should be deeper than "performers who fight baddies", and visually epic.
- Epic things found in the world that affect the game: a witch picks up a shimmering thing and the player sees an item card with lore and information. No 3D model of the item. Finds change difficulty in simple, obvious, measurable ways (his example: about 5% more healing) and never change how the fighting works.
- The only people in the world are people the party talks to. Lots of varied talk will be generated later; for now each person needs two or three lines that carry the story from their own corner of it.

## The four, so their lines sound like them
- The Ranger: a princess who is very good with a bow, a sword and knives; the weakest magic, the sharpest eye. She speaks plainly, in the present tense, about what is in front of her. She counts things.
- Io, the Herbal Witch (red hat): the healer. Gentle and practical. She thinks in growing things, seasons and what a thing is for.
- The Fox: a playful fabric artist who cuts and sews the fabric of the world with shears, needle, thread and a bell. Costume fox ears. She comes at things sideways and makes jokes that turn out to be true.
- The Jester: the strongest by far, and the one who takes the blows. She dances, taunts and laughs. Her power is not light: it opens holes with the night sky inside, and lamps gutter when she casts. Dark jokes, kind underneath. Her great spell is the Curtain Call, the end of the show.
- They are a troupe who perform at the fair. All four are together from the start, and their story goes back before the game.

## What must not change
- The ten areas: their ids, names, looks (they are painted), ways out, and lamp counts (W4 3, W5 4, W6 5).
- Who stands where: every person keeps their id and their place. You rewrite what they are doing (if the story needs it) and what they say. Their looks are in the lore brief; lines must fit them.
- Three rest spots: the party's own wagon in the fair square (W1), the camp by the pool (W6), the airship at the landing ledge (W8).
- The sparring ring (W2): the party fights wisps drawn to the ring lamps.
- The gates: a Shadow Wraith shuts the road from the stones to the pool until it is beaten; zone 3 opens when all twelve lamps are home; the lamp room door opens at level 5.
- Foes: wisps, Shadow Wraiths, the great wraith. Nothing else. Every fight starts at full HP and MP, and losing costs nothing.
- The hollow (W7) is hidden and holds a find.
- What the paintings show (listed in the chosen story's notes and visible in the pictures). Write nothing a painting contradicts. In particular: at the mooring field the hull's lamp brackets are empty; at the Last Lantern one lantern is lit and one post is dead; at the landing ledge all twelve lamps are lit on the deck; on the stair the beacon is dark and the lit airship hangs far off in the sky.

## What to write
1. `story`: the evening in eight to ten beats, one sentence each.
2. For every area: each person's `doing` and `says`; and three to five things that can happen. Keep a thing's code where it is still the same thing; give new things new codes in the same style (W4-f). Kinds: fight, talk, scene, find, rest, errand, gate. Every thing that belongs to one witch carries `"witch"`: "Ranger", "Io", "Fox" or "Jester". Every area needs at least one thing that is not a fight and belongs to a witch. The acts in the chosen story say whose zone each is, but all four are present and speak everywhere.
3. `captain`: his lines at W3 and at W8.
4. `finds`: five to seven item cards, at most one per area, each tied to a `find` thing by its code. Each has a plain stand-in name, the lore on its card (two or three sentences that tell a piece of this story or of the world), and what it does in one simple, measurable line. Keep the healing amulet in the hollow.
5. `fights`: for an area whose fight wording must change, the new words. Leave out areas where it stays.
6. `needs`: what the demo still needs made for this story (models, props, effects, sounds, pictures), each with why and for which areas. Small and honest.
7. `questions`: at most four questions for Chris that this rewrite raises. Do not ask what the chosen story already answers.
8. `invented`: every new fact about the world that you made up beyond the chosen story and the brief, one line each, so Chris can cut it.

## Format
One JSON object and nothing else:
{
 "story": ["..."],
 "areas": {"W1": {"people": {"old-lamp-seller": {"doing": "...", "says": ["...", "..."]}}, "happens": [{"code": "W1-a", "title": "...", "what": "...", "kind": "scene", "witch": "Ranger", "needs": "nothing new"}], "fights": "only if it changes"}, "W2": {}, "...": {}, "F5": {}},
 "captain": {"W3": ["..."], "W8": ["..."]},
 "finds": [{"code": "W7-b", "area": "W7", "name": "...", "card": "...", "does": "..."}],
 "needs": [{"what": "...", "why": "...", "for": "W3, W8"}],
 "questions": ["..."],
 "invented": ["..."]
}
