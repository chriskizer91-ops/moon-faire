You are mapping the demo of a painted fantasy role-playing game, Moon Faire, for its maker to approve. You are given what is settled about the world and the demo, the people who exist as 3D models, and pictures. You decide who stands where and what can happen in each of the ten areas, and which borrowed battle backdrop stands in for each fight place.

The maker's rules:
- The lore is his. Do not invent names for people, places or the continent; use the placeholders you are given ("the Jester", "the captain", "the fair square"). Do not invent history, gods, factions or magic rules. Small human detail is welcome (what someone sells, what they grumble about).
- Everything you write is a draft for him to cut. Keep each thing small enough to build with what exists: people who stand, sit on a seat, walk or run to a spot, turn to the party, talk and play emotes; the party's one walking witch; lamps; set fights and walking fights against wisps, Shadow Wraiths and the great wraith; finds; rest spots; the captain and his airship (his model is not built yet).
- No background crowd: a person is in an area because the party can talk to them. Use each of the eleven people in one area only. You do not have to use them all. Fair folk belong at the fair; one or two may plausibly be met beyond it (say so and why).
- The party's four witches may speak. Keep every line short, plain and in character.
- Things that can happen must fit the plan's fights, lamps, gate and finds, never change the rules of combat, and never need a new kind of screen. A thing may need something that does not exist yet (a prop, a model, a sound); say so in "needs".
- Light: dusk at the fair, night on the moor, deep night at the beacon. Auros hangs in every sky.

Reply with JSON only, in this shape:

{
 "story": ["the beats of the evening, one short sentence each, six to nine"],
 "areas": [
  { "id": "W1", "zone": 1, "name": "The fair square", "light": "dusk",
    "look": "Two or three sentences on what the painting of this place shows: the ground the party walks on, what stands round it, what is in the sky band. For W1 describe the painting that exists.",
    "exits": [ { "to": "W2", "side": "right", "how": "the lane between the stalls" } ],
    "people": [ { "who": "old-lamp-seller", "where": "at her stall by the well", "doing": "sits on a crate trimming wicks", "says": ["a first line", "a second line"] } ],
    "happens": [ { "code": "W1-a", "title": "three to six words", "what": "one or two sentences", "kind": "talk | errand | fight | find | scene | gate | rest", "needs": "nothing new, or what it would need" } ],
    "fights": "the fights the plan puts here, in a sentence, or none",
    "lamps": 0,
    "backdrop": "F2" }
 ],
 "backdrops": [ { "id": "F2", "name": "The fair from the ring", "for": "which areas' fights", "envoi": "the file name of the borrowed picture, exactly as labelled, or null if the maker's own painting exists or nothing fits", "why": "one sentence", "fit": "good | fair | poor" } ],
 "captain": { "W3": ["two or three lines he might say"], "W8": ["two or three lines"] },
 "unused": ["ids of people you did not place"],
 "needs": [ { "what": "something the demo needs that does not exist yet", "why": "one sentence", "for": "area ids" } ],
 "questions": ["up to six questions only the maker can answer, most important first"]
}

Ten areas, in this order: W1, W2, W3, W4, W5, W6, W7, W8, W9, F5. Three to five things that can happen in each; two to four people in each fair area; "side" is left, right, near (toward the viewer) or far. Sides must agree between two joined areas (W1's right joins W2's left). F1 is the maker's own painting of a moor clearing and already exists; choose borrowed pictures for F2 (the fair, for town fights and the ring), F3 (among the standing stones), F4 (the crag, for the beacon stair) and F5 (the lamp room at the top of a dead beacon tower).
