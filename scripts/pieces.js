window.PIECE_TYPES = {
  Mothership: { glyph: 'N', displayName: 'NODRIZA',  count: 1 },
  Crawler:    { glyph: 'R', displayName: 'REPTADOR', count: 2 },
  Pulsar:     { glyph: 'P', displayName: 'PULSAR',   count: 3 },
  Weaver:     { glyph: 'T', displayName: 'TEJEDORA', count: 2 },
  Drone:      { glyph: 'D', displayName: 'DRON',     count: 3 },
};

window.createHand = function(owner) {
  const hand = [];
  for (const [type, def] of Object.entries(PIECE_TYPES)) {
    for (let i = 0; i < def.count; i++) {
      hand.push({ type, owner, id: owner + '-' + type + '-' + i, q: null, r: null, level: 0 });
    }
  }
  return hand;
};
