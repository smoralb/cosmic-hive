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
        <div class="panel-header">[ STELLAR SWARM — TACTICAL v2.3 ]</div>
        <div class="rules-section">
          <div class="rules-toggle">▼ [ PROTOCOL MANUAL ]</div>
          <div class="rules-content collapsed">${this._rulesText()}</div>
        </div>
        <div class="hand-section">
          <div class="hand-title">┌── [ TUS UNIDADES ] ──────────┐</div>
          <div class="hand-grid" id="player-hand"></div>
        </div>
      </div>
      <div class="panel-right">
        <div class="status-bar">
          <div class="turn-banner your-turn" id="turn-banner">[ >>> TU TURNO <<< ]</div>
          <div class="turn-counter">TURNO: <span class="turn-counter-val" id="turn-num">000</span></div>
        </div>
        <div class="opponent-row">
          <div class="opponent-art-wrap">
            <div class="opponent-art-frame-label">[ COMM ENTRANTE ]</div>
            <div class="opponent-art-frame">
              <pre class="opponent-art">${opp.art}</pre>
            </div>
          </div>
          <div class="opponent-info">
            <div class="opponent-name">${opp.name}</div>
            <div id="opponent-status">[ ESPERANDO... ]</div>
          </div>
        </div>
        <div id="board-container">
          <div class="board-sector-label">SECTOR-GRID ─ ZONE-09</div>
          <div id="board"></div>
        </div>
        <div class="move-log-wrap">
          <div class="move-log-header">
            <span class="move-log-title">[ COMM LOG — ENCRYPTED ]</span>
            <span class="move-log-stats" id="move-log-stats">PIEZAS: TÚ 0 | ALIEN 0</span>
          </div>
          <div class="move-log" id="move-log"></div>
        </div>
      </div>
      <div id="game-over-overlay" class="go-screen-curve">
        <div class="go-crt-overlay"></div>
        <div class="go-crt-vignette"></div>
        <div class="go-scanline"></div>
        <div class="go-grain-overlay"></div>
        <div class="go-starfield" id="go-starfield"></div>

        <div class="go-top-bar go-phosphor-text">
          <span id="go-sys-loc">SYS_LOC: SECTOR_ZERO_NINE</span>
          <span id="go-timestamp"></span>
        </div>

        <div class="go-banner-wrap">
          <div>
            <pre class="go-banner" id="go-banner"></pre>
            <div class="go-banner-hr" style="background:var(--go-color,#33ff33)"></div>
          </div>
        </div>

        <div class="go-main">
          <div class="go-alien-panel">
            <div class="go-alien-frame">
              <div class="go-alien-frame-inner">
                <div class="go-alien-scanline"></div>
                <pre class="go-alien-art" id="go-alien-art"></pre>
              </div>
            </div>
            <div class="go-alien-label" id="go-alien-label">
              <span id="go-alien-name"></span>
              <small id="go-alien-status"></small>
            </div>
          </div>

          <div class="go-stats-panel">
            <div class="go-stats-title go-phosphor-text">>> STATS_SUMMARY <<</div>
            <div class="go-stat-row">
              <span class="go-stat-label">TURNOS:</span>
              <span class="go-stat-value" id="go-stat-turns">0</span>
            </div>
            <div class="go-stat-row">
              <span class="go-stat-label">TUS PIEZAS:</span>
              <span class="go-stat-value" id="go-stat-player-pieces">0</span>
            </div>
            <div class="go-stat-row">
              <span class="go-stat-label">PIEZAS ALIEN:</span>
              <span class="go-stat-value" id="go-stat-ai-pieces">0</span>
            </div>
            <div class="go-rank-box">
              <div class="go-corners"><span></span></div>
              <div class="go-rank-label">RANGO ASIGNADO</div>
              <div class="go-rank-value" id="go-rank-value">CADETE</div>
            </div>
          </div>
        </div>

        <div class="go-footer-log">===== SISTEMA DE REPORTE ESTRATÉGICO v.04.1 =====</div>

        <div class="go-footer-btns">
          <button class="go-btn" id="go-play-again">JUGAR DE NUEVO</button>
          <button class="go-btn" id="go-main-menu">MENÚ PRINCIPAL</button>
        </div>
      </div>
    `;

    // Aplicar color dinámico del rival a la variable CSS
    scene.style.setProperty('--color-ai', opp.color);

    scene.querySelector('.rules-toggle').addEventListener('click', () => {
      scene.querySelector('.rules-content').classList.toggle('collapsed');
    });

    document.getElementById('go-play-again').addEventListener('click', () => this.restart());
    document.getElementById('go-main-menu').addEventListener('click', () => this._goMainMenu());

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
    document.getElementById('turn-banner').textContent = '[ >>> TURNO DEL ALIEN <<< ]';
    const statusEl = document.getElementById('opponent-status');
    statusEl.textContent = '[ CALCULANDO... ]';
    statusEl.classList.add('thinking');
    document.querySelector('.opponent-art')?.classList.add('thinking');
    this._updateTurnCounter();
    this._updateLogStats();
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
    document.getElementById('turn-banner').textContent = '[ >>> TU TURNO <<< ]';
    const statusEl2 = document.getElementById('opponent-status');
    statusEl2.textContent = '[ ESPERANDO... ]';
    statusEl2.classList.remove('thinking');
    document.querySelector('.opponent-art')?.classList.remove('thinking');
    this._updateTurnCounter();
    this._updateLogStats();
    this._renderHand();
    BoardView.render(state, document.getElementById('board'));

    // Aviso Mothership si toca
    if (Rules.mustPlaceMothership(state, 'player')) {
      Buddy.contextualTip(state, 'queen_warning');
    }
  },

  _endGame(result) {
    this._state.status = result;
    const overlay = document.getElementById('game-over-overlay');
    const state = this._state;
    const opp = this._opponent;

    const banners = {
      player_wins: `███████████████████████████████████████████████████████████████\n██                                                       ██\n██               ██╗   ██╗██╗ ██████╗████████╗             ██\n██               ██║   ██║██║██╔════╝╚══██╔══╝             ██\n██               ██║   ██║██║██║        ██║                ██\n██               ╚██╗ ██╔╝██║██║        ██║                ██\n██                ╚████╔╝ ██║╚██████╗   ██║                ██\n██                 ╚═══╝  ╚═╝ ╚═════╝   ╚═╝                ██\n██                                                       ██\n██         ███████╗████████╗███████╗██╗      █████╗       ██\n██         ██╔════╝╚══██╔══╝██╔════╝██║     ██╔══██╗      ██\n██         █████╗     ██║   █████╗  ██║     ███████║      ██\n██         ██╔══╝     ██║   ██╔══╝  ██║     ██╔══██║      ██\n██         ███████╗   ██║   ███████╗███████╗██║  ██║      ██\n██         ╚══════╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝      ██\n██                                                       ██\n██            ENJAMBRE ENEMIGO CAPTURADO.                ██\n██                                                       ██\n███████████████████████████████████████████████████████████████`,
      ai_wins:     `███████████████████████████████████████████████████████████████\n██                                                       ██\n██           ███████╗███╗   ██╗     ██╗ █████╗           ██\n██           ██╔════╝████╗  ██║     ██║██╔══██╗          ██\n██           █████╗  ██╔██╗ ██║     ██║███████║          ██\n██           ██╔══╝  ██║╚██╗██║██   ██║██╔══██║          ██\n██           ███████╗██║ ╚████║╚█████╔╝██║  ██║          ██\n██           ╚══════╝╚═╝  ╚═══╝ ╚════╝ ╚═╝  ╚═╝          ██\n██                                                       ██\n██           ██████╗ ███████╗██████╗ ██████╗              ██\n██           ██╔══██╗██╔════╝██╔══██╗██╔══██╗             ██\n██           ██║  ██║█████╗  ██████╔╝██████╔╝             ██\n██           ██║  ██║██╔══╝  ██╔══██╗██╔══██╗             ██\n██           ██████╔╝███████╗██║  ██║██║  ██║             ██\n██           ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝             ██\n██                                                       ██\n██             TU NAVE NODRIZA HA CAÍDO.                 ██\n██                                                       ██\n███████████████████████████████████████████████████████████████`,
      draw:        `███████████████████████████████████████████████████████████████\n██                                                       ██\n██      █████╗ ███╗   ██╗██╗ ██████╗ ██╗   ██╗           ██\n██     ██╔══██╗████╗  ██║██║██╔════╝ ██║   ██║           ██\n██     ███████║██╔██╗ ██║██║██║  ███╗██║   ██║           ██\n██     ██╔══██║██║╚██╗██║██║██║   ██║██║   ██║           ██\n██     ██║  ██║██║ ╚████║██║╚██████╔╝╚██████╔╝           ██\n██     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝  ╚═════╝            ██\n██                                                       ██\n██   ███╗   ███╗██╗   ██╗████████╗██╗   ██╗ █████╗      ██\n██   ████╗ ████║██║   ██║╚══██╔══╝██║   ██║██╔══██╗     ██\n██   ██╔████╔██║██║   ██║   ██║   ██║   ██║███████║     ██\n██   ██║╚██╔╝██║██║   ██║   ██║   ██║   ██║██╔══██║     ██\n██   ██║ ╚═╝ ██║╚██████╔╝   ██║   ╚██████╔╝██║  ██║     ██\n██   ╚═╝     ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝     ██\n██                                                       ██\n██              AMBOS ENJAMBRES HAN CAÍDO.               ██\n██                                                       ██\n███████████████████████████████████████████████████████████████`,
    };

    const colors = {
      player_wins: '#33ff33',
      ai_wins:     opp.color || '#ff3344',
      draw:        '#888888',
    };

    const texts = {
      player_wins: 'VICTORIA ESTELAR — ENJAMBRE ENEMIGO CAPTURADO',
      ai_wins:     'ENJAMBRE DERROTADO — NAVE NODRIZA HA CAÍDO',
      draw:        'ANIQUILACIÓN MUTUA — AMBOS ENJAMBRES DESTRUIDOS',
    };

    const ranks = [
      { min: 0, max: 2, label: 'CADETE' },
      { min: 3, max: 5, label: 'TENIENTE' },
      { min: 6, max: 8, label: 'COMANDANTE' },
      { min: 9, max: 11, label: 'ALMIRANTE' },
    ];
    const totalTurns = state.turnCount.player + state.turnCount.ai;
    const rank = ranks.find(r => totalTurns >= r.min && totalTurns <= r.max) || ranks[ranks.length-1];

    const playerDeployed = 11 - state.hands.player.length;
    const aiDeployed = 11 - state.hands.ai.length;

    const col = colors[result];
    overlay.style.setProperty('--go-color', col);
    // Parse hex to RGB for vignette/glow
    const r = parseInt(col.slice(1,3), 16);
    const g = parseInt(col.slice(3,5), 16);
    const b = parseInt(col.slice(5,7), 16);
    overlay.style.setProperty('--go-rgb', `${r},${g},${b}`);

    document.getElementById('go-banner').className = 'go-banner go-phosphor-text';
    document.getElementById('go-banner').textContent = banners[result];
    document.getElementById('go-alien-art').textContent = opp.art;
    document.getElementById('go-alien-name').textContent = `[ ${opp.name} ]`;
    document.getElementById('go-alien-name').className = 'go-phosphor-text';
    document.getElementById('go-alien-status').className = 'go-phosphor-text';
    document.getElementById('go-alien-status').textContent = texts[result];
    document.getElementById('go-stat-turns').textContent = totalTurns;
    document.getElementById('go-stat-player-pieces').textContent = playerDeployed + ' / 11';
    document.getElementById('go-stat-ai-pieces').textContent = aiDeployed + ' / 11';
    document.getElementById('go-rank-value').textContent = rank.label;
    document.getElementById('go-timestamp').textContent =
      'TIMESTAMP: ' + new Date().toISOString().slice(0, 19).replace('T', ' ');

    this._buildGoStarfield();
    this._startGoShootingStars(overlay);
    this._startGoMouseTracking(overlay);
    this._startGoFlicker(overlay);
    overlay.classList.add('active');

    Buddy.contextualTip(this._state, 'game_over');
  },

  _buildGoStarfield() {
    const sf = document.getElementById('go-starfield');
    if (!sf) return;
    sf.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('div');
      s.className = 'go-star' + (Math.random() < 0.3 ? ' dim' : '');
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      const size = Math.random() < 0.5 ? '1px' : Math.random() < 0.8 ? '2px' : '3px';
      s.style.width = size; s.style.height = size;
      s.style.setProperty('--dur', (2 + Math.random() * 4).toFixed(2) + 's');
      s.style.setProperty('--delay', (-Math.random() * 5).toFixed(2) + 's');
      sf.appendChild(s);
    }
  },

  _startGoShootingStars(overlay) {
    if (this._goStarInterval) clearInterval(this._goStarInterval);
    this._goStarInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const star = document.createElement('div');
        star.className = 'go-shooting-star';
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight * 0.5;
        const dur = 1 + Math.random() * 2;
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        star.style.animation = `go-shooting-star ${dur}s linear forwards`;
        const sf = document.getElementById('go-starfield');
        if (sf) sf.appendChild(star);
        setTimeout(() => star.remove(), dur * 1000);
      }
    }, 4000);
  },

  _startGoMouseTracking(overlay) {
    if (this._goMouseHandler) {
      overlay.removeEventListener('mousemove', this._goMouseHandler);
    }
    this._goMouseHandler = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      overlay.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(var(--go-rgb,51,255,51), 0.06) 0%, #000 80%)`;
    };
    overlay.addEventListener('mousemove', this._goMouseHandler);
  },

  _startGoFlicker(overlay) {
    if (this._goFlickerInterval) clearInterval(this._goFlickerInterval);
    this._goFlickerInterval = setInterval(() => {
      if (Math.random() > 0.985) {
        overlay.classList.add('go-flicker-active');
        setTimeout(() => { overlay.classList.remove('go-flicker-active'); }, 120);
      }
    }, 1000);
  },

  _goMainMenu() {
    if (this._goStarInterval) {
      clearInterval(this._goStarInterval);
      this._goStarInterval = null;
    }
    if (this._goFlickerInterval) {
      clearInterval(this._goFlickerInterval);
      this._goFlickerInterval = null;
    }
    const overlay = document.getElementById('game-over-overlay');
    if (this._goMouseHandler) {
      overlay.removeEventListener('mousemove', this._goMouseHandler);
      this._goMouseHandler = null;
    }
    overlay.classList.remove('go-flicker-active', 'active');
    overlay.style.background = '';
    document.getElementById('scene-game').classList.remove('active');
    const menu = document.getElementById('scene-menu');
    menu.classList.add('active');
    if (window.Menu && typeof window.Menu.init === 'function') {
      window.Menu.init();
    }
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
    line.className = 'log-line log-' + move.owner;
    line.textContent = t;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  },

  _updateTurnCounter() {
    const state = this._state;
    const total = state.turnCount.player + state.turnCount.ai;
    const el = document.getElementById('turn-num');
    if (el) el.textContent = String(total).padStart(3, '0');
  },

  _updateLogStats() {
    const state = this._state;
    const playerDeployed = 11 - state.hands.player.length;
    const aiDeployed = 11 - state.hands.ai.length;
    const el = document.getElementById('move-log-stats');
    if (el) el.textContent = `PIEZAS: TÚ ${playerDeployed} | ALIEN ${aiDeployed}`;
  },

  restart() {
    if (this._goStarInterval) { clearInterval(this._goStarInterval); this._goStarInterval = null; }
    if (this._goFlickerInterval) { clearInterval(this._goFlickerInterval); this._goFlickerInterval = null; }
    const overlay = document.getElementById('game-over-overlay');
    if (this._goMouseHandler) { overlay.removeEventListener('mousemove', this._goMouseHandler); this._goMouseHandler = null; }
    overlay.classList.remove('go-flicker-active', 'active');
    document.getElementById('scene-game').classList.remove('active');
    this.start();
  },
};
