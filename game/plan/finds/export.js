// Writes finds.json, the finds as the game reads them: the five existing cards come from game/world/world.json unchanged.
const fs = require('fs');
const F = require('./finds.js');
const W = JSON.parse(fs.readFileSync(__dirname + '/../../world/world.json', 'utf8'));
const each = JSON.parse(fs.readFileSync(__dirname + '/each.json', 'utf8'));
const out = {
  what: 'Moon Faire: the finds for the bigger game (task board S5). Made by game/plan/finds/export.js; do not edit by hand.',
  status: 'A proposal for Chris. Every new name and card is a stand-in; the five with a "code" are the cards already in game/world/world.json.',
  rule: 'A find changes the numbers listed in "changes" in the combat engine\'s RULES ({path, mul} multiplies, {path, add} adds) and nothing else.',
  finds: F.map(f => {
    const old = f.code ? W.finds.find(x => x.code === f.code) : null;
    if (f.code && (!old || old.name !== f.name || old.does !== f.does)) throw new Error('does not match world.json: ' + f.id);
    const e = each.each[f.kind].r.B2K2w, b = each.base.B2K2w;
    return { id: f.id, ring: f.ring, how: f.how, new: !!f.isNew, code: f.code || null, witch: f.witch || null, name: f.name, does: f.does, card: old ? old.card : f.card,
      picture: old ? old.picture : 'art/items/' + f.id + '.png', pictureExists: !!old, changes: f.changes, measuredAs: f.measuredAs || null,
      aloneAtTheLastGate: { careless: +(e.careless.win - b.careless.win).toFixed(3), attentive: +(e.attentive.win - b.attentive.win).toFixed(3) } };
  }),
};
fs.writeFileSync(__dirname + '/finds.json', JSON.stringify(out, null, 1));
console.log('wrote finds.json:', out.finds.length, 'finds,', out.finds.filter(f => f.new).length, 'new');
