window.Rules = {
  isSwarmConnected(state, excludeKey = null) {
    const board = new Map(state.board);
    if (excludeKey) board.delete(excludeKey);
    return Moves._swarmConnected(board);
  },

  isMothershipSurrounded(state, owner) {
    for (const [key, stack] of state.board) {
      if (stack.some(p => p.type === 'Mothership' && p.owner === owner)) {
        const {q,r} = Hex.parse(key);
        return Hex.neighbors(q,r).every(nb => state.board.has(Hex.key(nb.q,nb.r)));
      }
    }
    return false;
  },

  checkGameEnd(state) {
    const ps = this.isMothershipSurrounded(state, 'player');
    const as = this.isMothershipSurrounded(state, 'ai');
    if (ps && as) return 'draw';
    if (as)  return 'player_wins';
    if (ps)  return 'ai_wins';
    return null;
  },

  mustPlaceMothership(state, owner) {
    if (GameState.hasOwnerPlacedMothership(state, owner)) return false;
    // Si el turno propio ya llegó a 4 (es decir, van a hacer su 4ª acción)
    return state.turnCount[owner] >= 3;
  },
};
