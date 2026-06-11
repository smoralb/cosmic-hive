window.GameState = {
  create() {
    return {
      board: new Map(),
      hands: { player: createHand('player'), ai: createHand('ai') },
      turn: 'player',
      turnCount: { player: 0, ai: 0 },
      moveHistory: [],
      status: 'playing',
    };
  },

  placePiece(state, piece, q, r) {
    const hand = state.hands[piece.owner];
    const idx = hand.findIndex(p => p.id === piece.id);
    if (idx >= 0) hand.splice(idx, 1);
    piece.q = q; piece.r = r;
    const key = Hex.key(q, r);
    if (!state.board.has(key)) state.board.set(key, []);
    const stack = state.board.get(key);
    piece.level = stack.length;
    stack.push(piece);
    state.moveHistory.push({ action: 'place', pieceId: piece.id, type: piece.type, owner: piece.owner, q, r });
  },

  movePiece(state, piece, toQ, toR) {
    const fromKey = Hex.key(piece.q, piece.r);
    const fromStack = state.board.get(fromKey);
    const idx = fromStack.findIndex(p => p.id === piece.id);
    fromStack.splice(idx, 1);
    if (fromStack.length === 0) state.board.delete(fromKey);
    const prev = {q: piece.q, r: piece.r};
    piece.q = toQ; piece.r = toR;
    const toKey = Hex.key(toQ, toR);
    if (!state.board.has(toKey)) state.board.set(toKey, []);
    const toStack = state.board.get(toKey);
    piece.level = toStack.length;
    toStack.push(piece);
    state.moveHistory.push({ action: 'move', pieceId: piece.id, type: piece.type, owner: piece.owner, fromQ: prev.q, fromR: prev.r, toQ, toR });
  },

  topPieceAt(state, q, r) {
    const stack = state.board.get(Hex.key(q, r));
    return stack && stack.length ? stack[stack.length-1] : null;
  },

  hasOwnerPlacedMothership(state, owner) {
    for (const stack of state.board.values()) {
      for (const p of stack) if (p.owner === owner && p.type === 'Mothership') return true;
    }
    return false;
  },

  cloneState(state) {
    const newBoard = new Map();
    for (const [k,stack] of state.board) newBoard.set(k, stack.map(p => ({...p})));
    return {
      board: newBoard,
      hands: { player: state.hands.player.map(p=>({...p})), ai: state.hands.ai.map(p=>({...p})) },
      turn: state.turn,
      turnCount: {...state.turnCount},
      moveHistory: [...state.moveHistory],
      status: state.status,
    };
  },
};

window.BoardView = {
  _size: 32,
  _container: null,
  _onCellClick: null,
  _onCellDrop: null,
  _highlighted: new Set(),
  _dragPieceId: null,

  _initTooltip() {
    if (document.getElementById('piece-tooltip')) return;
    const t = document.createElement('div');
    t.id = 'piece-tooltip';
    t.className = 'piece-tooltip';
    t.style.display = 'none';
    document.body.appendChild(t);
    document.addEventListener('mousemove', e => {
      if (t.style.display === 'none') return;
      t.style.left = (e.clientX + 14) + 'px';
      t.style.top  = (e.clientY - 10) + 'px';
    });
  },

  render(state, container) {
    this._container = container;
    this._initTooltip();
    container.innerHTML = '';

    // Calcular bounds del enjambre
    let minQ = 0, maxQ = 0, minR = 0, maxR = 0;
    for (const key of state.board.keys()) {
      const {q,r} = Hex.parse(key);
      minQ = Math.min(minQ,q); maxQ = Math.max(maxQ,q);
      minR = Math.min(minR,r); maxR = Math.max(maxR,r);
    }
    // Buffer alrededor de piezas + mínimo para llenar el contenedor
    minQ -= 2; maxQ += 2; minR -= 2; maxR += 2;
    if (minQ > -8) minQ = -8;
    if (maxQ <  8) maxQ =  8;
    if (minR > -7) minR = -7;
    if (maxR <  7) maxR =  7;

    const size = this._size;
    const hexW = size * Math.sqrt(3);
    const hexH = size * 2;

    // Para centrar: offset = -centroid en pixels
    const midQ = (minQ+maxQ)/2, midR = (minR+maxR)/2;
    const center = Hex.toPixel(midQ, midR, size);

    for (let r = minR; r <= maxR; r++) {
      for (let q = minQ; q <= maxQ; q++) {
        const key = Hex.key(q,r);
        const pixel = Hex.toPixel(q, r, size);
        const piece = GameState.topPieceAt(state, q, r);
        const fullStack = state.board.get(key);

        const el = document.createElement('div');
        el.className = 'hex';
        el.dataset.q = q;
        el.dataset.r = r;

        // Offset relativo al centro del enjambre
        const left = pixel.x - center.x + 400 - 29; // 400 = half of #board width 800px; 29 = half hex width
        const top  = pixel.y - center.y + 300 - 33; // 300 = half of 600px; 33 = half hex height
        el.style.left = left + 'px';
        el.style.top  = top  + 'px';

        // Badge de pila: si hay 2+ piezas en la celda
        if (fullStack && fullStack.length > 1) {
          const badge = document.createElement('span');
          badge.className = 'hex-stack';
          badge.textContent = '\u00d7' + fullStack.length; // ×N
          el.appendChild(badge);
        }

        const glyph = document.createElement('span');
        glyph.className = 'hex-glyph';

        if (piece) {
          el.classList.add(piece.owner === 'player' ? 'hex-player' : 'hex-ai');
          if (piece.type === 'Mothership') el.classList.add('hex-mothership');
          glyph.innerHTML = (window.PIECE_SPRITES && window.PIECE_SPRITES[piece.type]) || PIECE_TYPES[piece.type].glyph;
          // Tooltip on hover
          const def = PIECE_TYPES[piece.type];
          el.dataset.tooltip = def.displayName + (def.desc ? '\n' + def.desc : '');
          el.addEventListener('mouseenter', () => {
            const t = document.getElementById('piece-tooltip');
            if (!t) return;
            t.innerHTML = '<strong>' + def.displayName + '</strong><br><span>' + (def.desc || '') + '</span>';
            t.style.display = 'block';
          });
          el.addEventListener('mouseleave', () => {
            const t = document.getElementById('piece-tooltip');
            if (t) t.style.display = 'none';
          });
          // Drag de piezas propias
          if (piece.owner === 'player') {
            el.draggable = true;
            el.addEventListener('dragstart', e => {
              this._dragPieceId = piece.id;
              el.classList.add('hex-drag-origin');
              e.dataTransfer.setData('text/plain', piece.id);
              // Calcular movimientos legales
              const dests = Moves.legalMovesFor(window._currentState, piece);
              this.highlightCells(dests);
            });
            el.addEventListener('dragend', () => { this.clearHighlights(); this._dragPieceId = null; });
          }
        } else {
          el.classList.add('hex-empty');
          const isAdjacent = Hex.DIRS.some(([dq, dr]) => state.board.has(Hex.key(q + dq, r + dr)));
          if (isAdjacent) el.classList.add('hex-adjacent');
        }

        if (this._highlighted.has(key)) el.classList.add('hex-highlight');

        // Drop target
        el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
        el.addEventListener('drop', e => {
          e.preventDefault();
          el.classList.remove('drag-over');
          const pieceId = e.dataTransfer.getData('text/plain');
          if (this._onCellDrop) this._onCellDrop(pieceId, q, r);
        });

        el.addEventListener('click', () => { if (this._onCellClick) this._onCellClick(q, r); });

        el.appendChild(glyph);
        container.appendChild(el);
      }
    }
  },

  highlightCells(cells) {
    this._highlighted.clear();
    cells.forEach(({q,r}) => this._highlighted.add(Hex.key(q,r)));
    if (!this._container) return;
    this._container.querySelectorAll('.hex').forEach(el => {
      const k = Hex.key(+el.dataset.q, +el.dataset.r);
      el.classList.toggle('hex-highlight', this._highlighted.has(k));
    });
  },

  clearHighlights() {
    this._highlighted.clear();
    if (!this._container) return;
    this._container.querySelectorAll('.hex').forEach(el => {
      el.classList.remove('hex-highlight');
      el.classList.remove('hex-drag-origin');
    });
  },

  onCellClick(cb) { this._onCellClick = cb; },
  onCellDrop(cb) { this._onCellDrop = cb; },
};
