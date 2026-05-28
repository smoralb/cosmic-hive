window.Moves = {

  // Hexes donde 'owner' puede COLOCAR una nueva pieza
  placementCells(state, owner) {
    const cells = [];
    const boardSize = state.board.size;
    if (boardSize === 0) {
      // Primera jugada del juego: cualquier celda dentro del área visible inicial
      for (let r = -2; r <= 2; r++) {
        for (let q = -2; q <= 2; q++) {
          cells.push({q, r});
        }
      }
      return cells;
    }
    if (boardSize === 1) {
      for (const [key] of state.board) {
        const {q,r} = Hex.parse(key);
        for (const nb of Hex.neighbors(q,r)) {
          if (!state.board.has(Hex.key(nb.q,nb.r))) cells.push(nb);
        }
      }
      return cells;
    }
    const opponent = owner === 'player' ? 'ai' : 'player';
    const seen = new Set();
    for (const [key, stack] of state.board) {
      if (stack[stack.length-1].owner !== owner) continue;
      const {q,r} = Hex.parse(key);
      for (const nb of Hex.neighbors(q,r)) {
        const nk = Hex.key(nb.q,nb.r);
        if (state.board.has(nk) || seen.has(nk)) continue;
        seen.add(nk);
        let touchesEnemy = false;
        for (const nb2 of Hex.neighbors(nb.q,nb.r)) {
          const stack2 = state.board.get(Hex.key(nb2.q,nb2.r));
          if (stack2 && stack2[stack2.length-1].owner === opponent) { touchesEnemy = true; break; }
        }
        if (!touchesEnemy) cells.push(nb);
      }
    }
    return cells;
  },

  // Mothership: slide 1 hex
  mothershipMoves(state, fromQ, fromR) {
    const tempBoard = new Map(state.board);
    const key = Hex.key(fromQ, fromR);
    const stack = [...tempBoard.get(key)];
    stack.pop();
    if (stack.length === 0) tempBoard.delete(key); else tempBoard.set(key, stack);
    if (!this._swarmConnected(tempBoard)) return [];
    return Hex.slideNeighbors(fromQ, fromR, tempBoard).map(({q,r}) => ({q,r}));
  },

  // Crawler: 1 hex slide o climb encima de otra pieza
  crawlerMoves(state, piece, fromQ, fromR) {
    const tempBoard = new Map(state.board);
    const key = Hex.key(fromQ, fromR);
    const origStack = [...tempBoard.get(key)];
    const isOnTop = origStack[origStack.length-1].id === piece.id;
    if (!isOnTop) return [];
    origStack.pop();
    if (origStack.length === 0) tempBoard.delete(key); else tempBoard.set(key, origStack);
    if (!this._swarmConnected(tempBoard)) return [];
    const result = [];
    // Si está en nivel 0 (suelo): puede slide a vacío o climb a ocupado
    // Si está en nivel > 0 (apilado): puede moverse a cualquier vecino
    for (const nb of Hex.neighbors(fromQ, fromR)) {
      const nk = Hex.key(nb.q, nb.r);
      result.push({q: nb.q, r: nb.r});
    }
    // Para slides en suelo: filtrar por freedom-to-slide si destino está vacío
    if (piece.level === 0) {
      return result.filter(({q,r}) => {
        const nk = Hex.key(q,r);
        if (tempBoard.has(nk)) return true; // climb: ok
        // slide: freedom-to-slide
        const dirIdx = Hex.DIRS.findIndex(([dq,dr]) => fromQ+dq===q && fromR+dr===r);
        return dirIdx>=0 && Hex.canSlide(fromQ,fromR,dirIdx,tempBoard);
      });
    }
    return result; // apilado: cualquier adyacente
  },

  // Pulsar: salta en línea recta sobre piezas hasta primer vacío
  pulsarJumps(state, fromQ, fromR) {
    const tempBoard = new Map(state.board);
    const key = Hex.key(fromQ, fromR);
    const stack = [...tempBoard.get(key)];
    stack.pop();
    if (stack.length === 0) tempBoard.delete(key); else tempBoard.set(key, stack);
    if (!this._swarmConnected(tempBoard)) return [];
    const result = [];
    for (let i = 0; i < 6; i++) {
      const [dq,dr] = Hex.DIRS[i];
      let q = fromQ+dq, r = fromR+dr;
      if (!tempBoard.has(Hex.key(q,r))) continue; // primer vecino vacío → no salta
      while (tempBoard.has(Hex.key(q,r))) { q += dq; r += dr; }
      result.push({q,r});
    }
    return result;
  },

  // Weaver: exactamente 3 pasos de slide, sin retroceder
  weaverPaths(state, fromQ, fromR) {
    const tempBoard = new Map(state.board);
    const key = Hex.key(fromQ, fromR);
    const stack = [...tempBoard.get(key)];
    stack.pop();
    if (stack.length === 0) tempBoard.delete(key); else tempBoard.set(key, stack);
    if (!this._swarmConnected(tempBoard)) return [];
    // BFS de profundidad 3, sin revisitar posición del path actual
    const results = new Set();
    function dfs(q, r, steps, visited) {
      if (steps === 3) { results.add(Hex.key(q,r)); return; }
      for (let i = 0; i < 6; i++) {
        if (!Hex.canSlide(q,r,i,tempBoard)) continue;
        const [dq,dr] = Hex.DIRS[i];
        const nq = q+dq, nr = r+dr;
        const nk = Hex.key(nq,nr);
        if (visited.has(nk)) continue;
        visited.add(nk);
        dfs(nq, nr, steps+1, visited);
        visited.delete(nk);
      }
    }
    const visited = new Set([Hex.key(fromQ, fromR)]);
    dfs(fromQ, fromR, 0, visited);
    // Excluir origen
    results.delete(Hex.key(fromQ, fromR));
    return Array.from(results).map(k => Hex.parse(k));
  },

  // Drone: slide ilimitado por el perímetro
  droneSlide(state, fromQ, fromR) {
    const tempBoard = new Map(state.board);
    const key = Hex.key(fromQ, fromR);
    const stack = [...tempBoard.get(key)];
    stack.pop();
    if (stack.length === 0) tempBoard.delete(key); else tempBoard.set(key, stack);
    if (!this._swarmConnected(tempBoard)) return [];
    const reachable = new Set();
    const queue = [{q: fromQ, r: fromR}];
    const seen = new Set([Hex.key(fromQ, fromR)]);
    while (queue.length) {
      const {q,r} = queue.shift();
      for (let i = 0; i < 6; i++) {
        if (!Hex.canSlide(q,r,i,tempBoard)) continue;
        const [dq,dr] = Hex.DIRS[i];
        const nq=q+dq, nr=r+dr, nk=Hex.key(nq,nr);
        if (seen.has(nk)) continue;
        seen.add(nk); reachable.add(nk);
        queue.push({q:nq,r:nr});
      }
    }
    reachable.delete(Hex.key(fromQ, fromR));
    return Array.from(reachable).map(k => Hex.parse(k));
  },

  legalMovesFor(state, piece) {
    if (piece.q === null) return []; // en mano
    const {q,r} = piece;
    switch(piece.type) {
      case 'Mothership': return this.mothershipMoves(state, q, r);
      case 'Crawler':    return this.crawlerMoves(state, piece, q, r);
      case 'Pulsar':     return this.pulsarJumps(state, q, r);
      case 'Weaver':     return this.weaverPaths(state, q, r);
      case 'Drone':      return this.droneSlide(state, q, r);
      default: return [];
    }
  },

  allLegalActions(state, owner) {
    const mustPlayMothership = Rules.mustPlaceMothership(state, owner);
    const mothershipPlaced = GameState.hasOwnerPlacedMothership(state, owner);
    const placements = [];
    const moves = [];

    // Placements
    const cells = this.placementCells(state, owner);
    const hand = state.hands[owner];
    const typesSeen = new Set();
    for (const piece of hand) {
      if (typesSeen.has(piece.type)) continue;
      typesSeen.add(piece.type);
      if (mustPlayMothership && piece.type !== 'Mothership') continue;
      for (const cell of cells) {
        placements.push({piece, q: cell.q, r: cell.r});
      }
    }

    // Moves (solo si mothership está colocada)
    if (mothershipPlaced) {
      for (const [key, stack] of state.board) {
        const piece = stack[stack.length-1];
        if (piece.owner !== owner) continue;
        const dests = this.legalMovesFor(state, piece);
        for (const dest of dests) {
          moves.push({piece, q: dest.q, r: dest.r});
        }
      }
    }

    return {placements, moves};
  },

  _swarmConnected(board) {
    if (board.size <= 1) return true;
    const keys = Array.from(board.keys());
    const start = Hex.parse(keys[0]);
    const visited = new Set([keys[0]]);
    const queue = [start];
    while (queue.length) {
      const {q,r} = queue.shift();
      for (const nb of Hex.neighbors(q,r)) {
        const nk = Hex.key(nb.q,nb.r);
        if (board.has(nk) && !visited.has(nk)) {
          visited.add(nk); queue.push(nb);
        }
      }
    }
    return visited.size === board.size;
  },
};
