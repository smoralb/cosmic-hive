window.AI = {
  chooseAction(state) {
    const {placements, moves} = Moves.allLegalActions(state, 'ai');
    if (placements.length + moves.length === 0) return {kind:'pass'};

    const allActions = [
      ...placements.map(a => ({...a, kind:'place'})),
      ...moves.map(a => ({...a, kind:'move'})),
    ];

    let best = null, bestScore = -Infinity;
    for (const action of allActions) {
      const sim = GameState.cloneState(state);
      if (action.kind === 'place') {
        // Encontrar la pieza en la mano del clone
        const piece = sim.hands.ai.find(p => p.id === action.piece.id);
        if (!piece) continue;
        GameState.placePiece(sim, piece, action.q, action.r);
      } else {
        // Encontrar la pieza en el tablero del clone
        let piece = null;
        for (const stack of sim.board.values()) {
          const p = stack.find(p => p.id === action.piece.id);
          if (p) { piece = p; break; }
        }
        if (!piece) continue;
        GameState.movePiece(sim, piece, action.q, action.r);
      }
      const score = this._scoreState(sim) + Math.random() * 5;
      if (score > bestScore) { bestScore = score; best = action; }
    }
    return best || {kind:'pass'};
  },

  _scoreState(state) {
    let score = 0;
    const end = Rules.checkGameEnd(state);
    if (end === 'ai_wins')     return 10000;
    if (end === 'player_wins') return -10000;
    if (end === 'draw')        return 0;

    // Presión sobre Mothership del jugador
    let playerMSKey = null;
    for (const [key, stack] of state.board) {
      if (stack.some(p => p.type === 'Mothership' && p.owner === 'player')) playerMSKey = key;
      if (stack.some(p => p.type === 'Mothership' && p.owner === 'ai')) {
        // Penalizar si la propia MS está rodeada
        const {q,r} = Hex.parse(key);
        const surrounded = Hex.neighbors(q,r).filter(nb => state.board.has(Hex.key(nb.q,nb.r))).length;
        score -= surrounded * 30;
      }
    }
    if (playerMSKey) {
      const {q,r} = Hex.parse(playerMSKey);
      const surrounded = Hex.neighbors(q,r).filter(nb => state.board.has(Hex.key(nb.q,nb.r))).length;
      score += surrounded * 50;
    }
    // Bonus por colocar la Mothership propia si aún no está
    if (!GameState.hasOwnerPlacedMothership(state, 'ai')) score += 80;
    return score;
  },
};
