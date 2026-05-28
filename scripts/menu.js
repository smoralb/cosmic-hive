window.Menu = {
  _invaderPos: 0,
  _invaderTimer: null,

  init() {
    const scene = document.getElementById('scene-menu');
    scene.innerHTML = `
      <pre class="menu-title glow">${ASCII_ART.TITLE}</pre>
      <div class="menu-subtitle blink">▒ INICIAR PROTOCOLO ▒</div>
      <div class="menu-options">
        <div class="menu-option" data-action="play">▶ JUGAR</div>
        <div class="menu-option" data-action="how">▶ CÓMO JUGAR</div>
        <div class="menu-option" data-action="quit">▶ SALIR</div>
      </div>
      <div class="invaders-band"><pre class="invaders-row"></pre></div>
      <div class="how-to-modal" id="how-to-modal">
        <div class="how-to-box">${this._howToText()}</div>
      </div>
    `;

    scene.querySelector('[data-action="play"]').addEventListener('click', () => Game.start());
    scene.querySelector('[data-action="how"]').addEventListener('click', () => {
      document.getElementById('how-to-modal').classList.add('active');
    });
    scene.querySelector('[data-action="quit"]').addEventListener('click', () => {
      scene.innerHTML = '<div style="text-align:center;margin-top:40vh;font-size:24px;letter-spacing:4px;">HASTA PRONTO, CADETE o7</div>';
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && document.getElementById('scene-menu').classList.contains('active')) Game.start();
      if (e.key === 'Escape') {
        const modal = document.getElementById('how-to-modal');
        if (modal) modal.classList.remove('active');
      }
    });

    this._startInvaders();
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

  _startInvaders() {
    const row = document.querySelector('.invaders-row');
    if (!row) return;
    let offset = 0;
    const line = '  ' + ASCII_ART.INVADERS.join('   ').repeat(8);
    this._invaderTimer = setInterval(() => {
      offset = (offset + 1) % (line.length / 3);
      const shifted = line.slice(offset) + line.slice(0, offset);
      row.textContent = shifted.slice(0, 120);
    }, 150);
  },
};
