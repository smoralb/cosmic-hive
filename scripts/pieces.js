window.PIECE_TYPES = {
  Mothership: { glyph: 'N', displayName: 'NODRIZA',  count: 1, desc: 'Desliza 1 casilla. ¡Protégela a toda costa!' },
  Crawler:    { glyph: 'R', displayName: 'REPTADOR', count: 2, desc: 'Desliza 1 casilla o trepa sobre otra pieza' },
  Pulsar:     { glyph: 'P', displayName: 'PULSAR',   count: 3, desc: 'Salta en línea recta hasta el borde del enjambre' },
  Weaver:     { glyph: 'T', displayName: 'TEJEDORA', count: 2, desc: 'Desliza exactamente 3 casillas' },
  Drone:      { glyph: 'D', displayName: 'DRON',     count: 3, desc: 'Deslizamiento libre por el enjambre' },
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
