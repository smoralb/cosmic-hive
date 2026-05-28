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
};
