window.Game = {
  _state: null,
  _selectedPiece: null,

  start() {
    document.getElementById('scene-menu').classList.remove('active');
    const scene = document.getElementById('scene-game');
    scene.classList.add('active');

    const state = GameState.create();
    this._state = state;
    window._currentState = state;

    // Generar adversario aleatorio (alien + nombre + color)
    const opp = ASCII_ART.randomOpponent();
    this._opponent = opp;

    scene.innerHTML = `
      <div class="panel-left">
        <div class="rules-section">
          <div class="rules-toggle">▼ REGLAS</div>
          <div class="rules-content collapsed">${this._rulesText()}</div>
        </div>
        <div class="hand-section">
          <div class="hand-title">>> TUS UNIDADES <<</div>
          <div class="hand-grid" id="player-hand"></div>
        </div>
      </div>
      <div class="panel-right">
        <div class="turn-banner your-turn" id="turn-banner">>>> TU TURNO <<<</div>
        <div class="opponent-row">
          <pre class="opponent-art">${opp.art}</pre>
          <div class="opponent-info">
            <div class="opponent-name">${opp.name}</div>
            <div id="opponent-status">ESPERANDO...</div>
          </div>
        </div>
        <div id="board-container"><div id="board"></div></div>
        <div class="move-log" id="move-log"></div>
      </div>
      <div class="modal" id="game-over-modal">
        <div class="modal-box">
          <pre class="modal-text" id="game-over-text"></pre>
          <button class="modal-btn" id="play-again-btn">[ JUGAR DE NUEVO ]</button>
        </div>
      </div>
    `;

    // Aplicar color dinámico del rival a la variable CSS
    scene.style.setProperty('--color-ai', opp.color);

    scene.querySelector('.rules-toggle').addEventListener('click', () => {
      scene.querySelector('.rules-content').classList.toggle('collapsed');
    });

    document.getElementById('play-again-btn').addEventListener('click', () => this.restart());

    Buddy.mount();
    Buddy.contextualTip(state, 'game_start');

    this._renderHand();
    BoardView.onCellDrop((pieceId, q, r) => this._handleDrop(pieceId, q, r));
    BoardView.render(state, document.getElementById('board'));
  },

  _rulesText() {
    return `OBJETIVO
 Rodea la NAVE NODRIZA enemiga por los 6 lados.

DESPLIEGUE
 Las unidades nuevas sólo tocan
 unidades TUYAS (excepto las 2 primeras
 jugadas).

PLAZO NAVE NODRIZA
 Debes desplegarla antes del turno 4
 o pierdes la capacidad de mover.

MOVIMIENTO (sólo con NAVE NODRIZA en juego)
 N NODRIZA   → desliza 1 casilla
 R REPTADOR  → desliza 1 o trepa
 P PULSAR    → salta sobre línea recta
 T TEJEDORA  → desliza exactamente 3
 D DRON      → deslizamiento libre

INTEGRIDAD DEL ENJAMBRE
 El ENJAMBRE debe permanecer conectado
 en todo momento.`;
  },

  _renderHand() {
    const container = document.getElementById('player-hand');
    if (!container) return;
    container.innerHTML = '';
    const state = this._state;
    const counts = {};
    for (const p of state.hands.player) {
      counts[p.type] = (counts[p.type]||0) + 1;
    }

    // Definir layout colmena: 3 filas — fila 0: [Mothership, Crawler], fila 1: [Pulsar], fila 2: [Weaver, Drone]
    const layout = [
      ['Mothership', 'Crawler'],
      ['Pulsar'],
      ['Weaver', 'Drone'],
    ];

    // Wrapper de colmena
    const honey = document.createElement('div');
    honey.className = 'hand-honeycomb';

    layout.forEach((row, rowIdx) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'hand-row' + (rowIdx === 1 ? ' offset' : '');
      row.forEach(type => {
        const def = PIECE_TYPES[type];
        const count = counts[type] || 0;
        const wrap = document.createElement('div');
        wrap.className = 'hand-piece-wrap' + (count === 0 ? ' zero' : '');
        wrap.dataset.type = type;

        const piece = document.createElement('div');
        piece.className = 'hand-piece';
        piece.innerHTML = `
          <span class="glyph">${def.glyph}</span>
          <span class="pname">${def.displayName}</span>
          <span class="count">×${count}</span>
        `;
        wrap.appendChild(piece);

        if (count > 0) {
          wrap.draggable = true;
          wrap.addEventListener('dragstart', e => {
            const p = state.hands.player.find(p => p.type === type);
            if (!p) { e.preventDefault(); return; }
            e.dataTransfer.setData('text/plain', p.id);
            const cells = Moves.placementCells(state, 'player');
            BoardView.highlightCells(cells);
          });
          wrap.addEventListener('dragend', () => BoardView.clearHighlights());
        }
        rowEl.appendChild(wrap);
      });
      honey.appendChild(rowEl);
    });

    container.appendChild(honey);
  },

  _handleDrop(pieceId, q, r) {
    const state = this._state;
    if (state.turn !== 'player' || state.status !== 'playing') return;

    // Buscar pieza en mano
    let piece = state.hands.player.find(p => p.id === pieceId);
    let isPlacement = true;

    // Si no está en mano, buscar en tablero
    if (!piece) {
      for (const stack of state.board.values()) {
        const p = stack.find(p => p.id === pieceId);
        if (p) { piece = p; isPlacement = false; break; }
      }
    }

    if (!piece) return;

    // Validar
    if (isPlacement) {
      const cells = Moves.placementCells(state, 'player');
      const valid = cells.some(c => c.q === q && c.r === r);
      if (!valid) { Buddy.contextualTip(state, 'illegal_move'); return; }
      // Regla turno 4: Mothership obligatoria
      if (Rules.mustPlaceMothership(state, 'player') && piece.type !== 'Mothership') {
        Buddy.contextualTip(state, 'queen_warning'); return;
      }
      GameState.placePiece(state, piece, q, r);
    } else {
      const dests = Moves.legalMovesFor(state, piece);
      const valid = dests.some(d => d.q === q && d.r === r);
      if (!valid) { Buddy.contextualTip(state, 'illegal_move'); return; }
      GameState.movePiece(state, piece, q, r);
    }

    state.turnCount.player++;
    this._logMove(state.moveHistory[state.moveHistory.length-1]);
    BoardView.clearHighlights();

    // Chequear fin de juego
    const result = Rules.checkGameEnd(state);
    if (result) { this._endGame(result); return; }

    // Turno de la IA
    state.turn = 'ai';
    this._renderHand();
    BoardView.render(state, document.getElementById('board'));
    document.getElementById('turn-banner').className = 'turn-banner ai-turn';
    document.getElementById('turn-banner').textContent = '>>> TURNO DEL ALIEN <<<';
    document.getElementById('opponent-status').textContent = 'CALCULANDO...';
    Buddy.contextualTip(state, 'ai_thinking');

    setTimeout(() => this._runAITurn(), 700);
  },

  _runAITurn() {
    const state = this._state;
    const action = AI.chooseAction(state);

    if (action.kind === 'pass') {
      Buddy.contextualTip(state, 'pass_turn');
    } else if (action.kind === 'place') {
      const piece = state.hands.ai.find(p => p.id === action.piece.id);
      if (piece) GameState.placePiece(state, piece, action.q, action.r);
    } else {
      let piece = null;
      for (const stack of state.board.values()) {
        const p = stack.find(p => p.id === action.piece.id);
        if (p) { piece = p; break; }
      }
      if (piece) GameState.movePiece(state, piece, action.q, action.r);
    }

    state.turnCount.ai++;
    if (state.moveHistory.length) this._logMove(state.moveHistory[state.moveHistory.length-1]);

    const result = Rules.checkGameEnd(state);
    if (result) {
      BoardView.render(state, document.getElementById('board'));
      this._endGame(result);
      return;
    }

    state.turn = 'player';
    document.getElementById('turn-banner').className = 'turn-banner your-turn';
    document.getElementById('turn-banner').textContent = '>>> TU TURNO <<<';
    document.getElementById('opponent-status').textContent = 'ESPERANDO...';
    this._renderHand();
    BoardView.render(state, document.getElementById('board'));

    // Aviso Mothership si toca
    if (Rules.mustPlaceMothership(state, 'player')) {
      Buddy.contextualTip(state, 'queen_warning');
    }
  },

  _endGame(result) {
    this._state.status = result;
    const texts = {
      player_wins: `╔══════════════════════════════╗\n║   ¡VICTORIA ESTELAR!         ║\n║   Enjambre enemigo capturado.║\n╚══════════════════════════════╝`,
      ai_wins:     `╔══════════════════════════════╗\n║   ENJAMBRE DERROTADO.        ║\n║   Tu NAVE NODRIZA ha caído.  ║\n╚══════════════════════════════╝`,
      draw:        `╔══════════════════════════════╗\n║   ANIQUILACIÓN MUTUA.        ║\n║   Ambos ENJAMBRES han caído. ║\n╚══════════════════════════════╝`,
    };
    const buddyEvents = { player_wins: 'player_win', ai_wins: 'ai_win', draw: 'draw' };
    document.getElementById('game-over-text').textContent = texts[result];
    document.getElementById('game-over-modal').classList.add('active');
    Buddy.contextualTip(this._state, buddyEvents[result]);
  },

  _logMove(move) {
    const log = document.getElementById('move-log');
    if (!log) return;
    const ownerStr = move.owner === 'player' ? 'TÚ' : 'ALIEN';
    const name = PIECE_TYPES[move.type] ? PIECE_TYPES[move.type].displayName : move.type;
    const t = move.action === 'place'
      ? `[${ownerStr}] desplegó ${name} en (${move.q},${move.r})`
      : `[${ownerStr}] movió ${name} → (${move.toQ},${move.toR})`;
    const line = document.createElement('div');
    line.textContent = t;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  },

  restart() {
    document.getElementById('game-over-modal').classList.remove('active');
    document.getElementById('scene-game').classList.remove('active');
    this.start();
  },
};
