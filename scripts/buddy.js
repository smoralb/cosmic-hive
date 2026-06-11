window.Buddy = {
  _frame: 0,
  _timer: null,
  _hideTimer: null,

  mount() {
    if (document.getElementById('buddy')) return;
    const el = document.createElement('div');
    el.id = 'buddy';
    el.innerHTML = `<pre class="buddy-art"></pre><div class="buddy-bubble hidden"></div>`;
    document.body.appendChild(el);
    this._updateFrame();
  },

  tick() {
    if (this._timer) return;
    this._timer = setInterval(() => { this._frame = (this._frame+1)%2; this._updateFrame(); }, 800);
  },

  _updateFrame() {
    const art = document.querySelector('.buddy-art');
    if (art) art.textContent = ASCII_ART.BUDDY_FRAMES[this._frame];
  },

  say(text, duration = 6000) {
    const bubble = document.querySelector('.buddy-bubble');
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.remove('hidden');
    if (this._hideTimer) clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => bubble.classList.add('hidden'), duration);
  },

  contextualTip(state, event) {
    const tips = {
      game_start:       '¡CADETE! Despliega tus unidades\ndesde el panel izquierdo.\n¡Rodea la NAVE NODRIZA enemiga para ganar!',
      game_over:        'Misión concluida, cadete.\n¡Pulsa JUGAR DE NUEVO para reintentar!',
      queen_warning:    'AVISO: Debes desplegar tu NAVE NODRIZA\nen este turno o perderás\nla capacidad de mover unidades.',
      first_placement:  'Primer movimiento: cualquier unidad sirve.\nEl ENJAMBRE crece desde el centro.',
      illegal_move:     '¡Movimiento ilegal!\nEl ENJAMBRE debe permanecer\nconectado en todo momento.',
      ai_thinking:      'El xeno está calculando...\nMantente alerta, cadete.',
      player_win:       '¡VICTORIA ESTELAR!\nHas capturado el ENJAMBRE enemigo.',
      ai_win:           'Hemos sido superados, cadete.\nReinicia y adapta tu estrategia.',
      draw:             'Aniquilación mutua.\nAmbas NAVES NODRIZA han caído a la vez.',
      good_move:        '¡Buena jugada!\nMantén la presión sobre su NAVE NODRIZA.',
      pass_turn:        'No hay movimientos disponibles.\nSaltando tu turno...',
    };
    this.say(tips[event] || '...', 7000);
  },

  // Animación de introducción: buddy vuela exactamente hasta el rules-toggle
  introSequence() {
    const buddyEl = document.getElementById('buddy');
    if (!buddyEl) return;
    const toggle = document.querySelector('.rules-toggle');
    if (!toggle) return;

    const toggleRect = toggle.getBoundingClientRect();
    const buddyRect  = buddyEl.getBoundingClientRect();

    // Desplazamiento necesario para centrar buddy junto al rules-toggle
    const deltaX = toggleRect.left - buddyRect.left + 8;
    const deltaY = (toggleRect.top + toggleRect.height / 2) - (buddyRect.top + buddyRect.height / 2);

    buddyEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    this.say('¡Psst, cadete! ¿Ves este\n[ PROTOCOL MANUAL ]?\n¡Ábrelo para ver todas las reglas!', 4500);
    this.tick();

    setTimeout(() => {
      buddyEl.style.transform = '';
    }, 5200);
  },
};
