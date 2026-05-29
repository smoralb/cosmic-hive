window.Menu = {
  _trafficTimer: null,
  _trafficContainer: null,

  init() {
    const scene = document.getElementById('scene-menu');
    scene.innerHTML = `
      <div class="starfield" id="starfield"></div>
      <div class="bg-traffic" id="bg-traffic"></div>

      <pre class="menu-title glow">${ASCII_ART.TITLE}</pre>

      <div class="menu-center">
        <div class="menu-subtitle blink">▒ INICIAR PROTOCOLO ▒</div>
        <div class="menu-options">
          <div class="menu-option" data-action="play">▶ JUGAR</div>
          <div class="menu-option" data-action="how">CÓMO JUGAR</div>
          <div class="menu-option" data-action="quit">SALIR</div>
        </div>
      </div>

      <div class="menu-footer">v1.0 · ENJAMBRE ESTELAR · [ENTER] PARA INICIAR</div>

      <div class="how-to-modal" id="how-to-modal">
        <div class="how-to-box">${this._howToText()}</div>
      </div>
    `;

    scene.querySelector('[data-action="play"]').addEventListener('click', () => this._cleanup() || Game.start());
    scene.querySelector('[data-action="how"]').addEventListener('click', () => {
      document.getElementById('how-to-modal').classList.add('active');
    });
    scene.querySelector('[data-action="quit"]').addEventListener('click', () => {
      this._cleanup();
      scene.innerHTML = '<div style="text-align:center;margin-top:40vh;font-size:24px;letter-spacing:4px;color:#33ff33;">HASTA PRONTO, CADETE o7</div>';
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && document.getElementById('scene-menu').classList.contains('active')) {
        this._cleanup();
        Game.start();
      }
      if (e.key === 'Escape') {
        const modal = document.getElementById('how-to-modal');
        if (modal) modal.classList.remove('active');
      }
    });

    this._buildStarfield();
    this._startTraffic();
  },

  _howToText() {
    return `╔══════════ CÓMO JUGAR ═══════════════════╗
║                                          ║
║  OBJETIVO: Rodea la NAVE NODRIZA         ║
║  enemiga por los 6 lados para ganar.     ║
║                                          ║
║  DESPLIEGUE: Las unidades nuevas solo    ║
║  pueden tocar tus propias unidades       ║
║  (excepto las 2 primeras jugadas).       ║
║                                          ║
║  PLAZO DE LA NAVE NODRIZA: Debes         ║
║  desplegarla antes del turno 4 o         ║
║  perderás la capacidad de mover unidades.║
║                                          ║
║  MOVIMIENTO: Sólo cuando tu NAVE         ║
║  NODRIZA esté en juego. Cada unidad      ║
║  se mueve de forma única:                ║
║                                          ║
║   N  NODRIZA    → desliza 1 casilla      ║
║   R  REPTADOR   → 1 casilla o trepa      ║
║   P  PULSAR     → salta sobre línea      ║
║   T  TEJEDORA   → desliza exacto 3       ║
║   D  DRON       → deslizamiento libre    ║
║                                          ║
║  El ENJAMBRE debe permanecer conectado.  ║
║  Las jugadas que lo dividen son ilegales.║
║                                          ║
║  [ESC] o clic fuera para CERRAR          ║
╚══════════════════════════════════════════╝`;
  },

  _buildStarfield() {
    const sf = document.getElementById('starfield');
    if (!sf) return;
    const STAR_COUNT = 160;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < STAR_COUNT; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sizeRoll = Math.random();
      if (sizeRoll < 0.55) s.classList.add('tiny');
      else if (sizeRoll > 0.92) s.classList.add('big');
      if (Math.random() < 0.35) s.classList.add('dim');
      s.style.left = (Math.random() * 100) + '%';
      s.style.top  = (Math.random() * 100) + '%';
      s.style.setProperty('--dur', (1.5 + Math.random() * 4).toFixed(2) + 's');
      s.style.setProperty('--delay', (-Math.random() * 5).toFixed(2) + 's');
      s.style.setProperty('--peak', (0.4 + Math.random() * 0.6).toFixed(2));
      frag.appendChild(s);
    }
    sf.appendChild(frag);
  },

  _startTraffic() {
    this._trafficContainer = document.getElementById('bg-traffic');
    const scheduleNext = () => {
      const delay = 1500 + Math.random() * 5000;
      this._trafficTimer = setTimeout(() => {
        this._spawnTraffic();
        scheduleNext();
      }, delay);
    };
    this._spawnTraffic();
    scheduleNext();
  },

  _spawnTraffic() {
    if (!this._trafficContainer) return;
    const isAsteroid = Math.random() < 0.25;
    const pool = isAsteroid ? ASCII_ART.BG_ASTEROIDS : ASCII_ART.BG_SHIPS;
    const art = pool[Math.floor(Math.random() * pool.length)];

    const el = document.createElement('div');
    el.className = 'bg-ship' + (isAsteroid ? ' asteroid' : '');
    const variantRoll = Math.random();
    if (variantRoll < 0.3) el.classList.add('dim');
    else if (variantRoll > 0.85 && !isAsteroid) el.classList.add('big');

    el.textContent = art;

    const goRight = Math.random() < 0.5;
    const topPct = 8 + Math.random() * 78;
    const duration = isAsteroid
      ? (16 + Math.random() * 12)
      : (6  + Math.random() * 10);

    el.style.top = topPct + '%';
    el.style.animation = `${goRight ? 'ship-cross-right' : 'ship-cross-left'} ${duration.toFixed(1)}s linear forwards`;

    el.addEventListener('animationend', () => el.remove());
    this._trafficContainer.appendChild(el);
  },

  _cleanup() {
    if (this._trafficTimer) { clearTimeout(this._trafficTimer); this._trafficTimer = null; }
    return false;
  },
};
