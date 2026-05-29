window.ASCII_ART = {
  TITLE: [
    ' ███████╗████████╗███████╗██╗     ██╗      █████╗ ██████╗ ',
    ' ██╔════╝╚══██╔══╝██╔════╝██║     ██║     ██╔══██╗██╔══██╗',
    ' ███████╗   ██║   █████╗  ██║     ██║     ███████║██████╔╝',
    ' ╚════██║   ██║   ██╔══╝  ██║     ██║     ██╔══██║██╔══██╗',
    ' ███████║   ██║   ███████╗███████╗███████╗██║  ██║██║  ██║',
    ' ╚══════╝   ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝',
    '            ███████╗██╗    ██╗ █████╗ ██████╗ ███╗   ███╗ ',
    '            ██╔════╝██║    ██║██╔══██╗██╔══██╗████╗ ████║ ',
    '            ███████╗██║ █╗ ██║███████║██████╔╝██╔████╔██║ ',
    '            ╚════██║██║███╗██║██╔══██║██╔══██╗██║╚██╔╝██║ ',
    '            ███████║╚███╔███╔╝██║  ██║██║  ██║██║ ╚═╝ ██║ ',
    '            ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ',
  ].join('\n'),

  // BLIP — Pequeño alien en un platillo volante.
  // Anatomía clara: cúpula de cristal arriba con un alien dentro,
  // cuerpo del disco en medio, luces parpadeantes abajo, estela ondulada.
  BUDDY_FRAMES: [
    [
      '     .-""-.     ',
      '    /  o o \\    ',
      '   |   ▽    |   ',
      '  /‾‾‾‾‾‾‾‾‾‾\\  ',
      ' [__o_O_o_O__] ',
      '   \\ . . . /   ',
      '    `~~~~~`    ',
    ].join('\n'),
    [
      '     .-""-.     ',
      '    /  o o \\    ',
      '   |   ▽    |   ',
      '  /‾‾‾‾‾‾‾‾‾‾\\  ',
      ' [__O_o_O_o__] ',
      '   \\ * * * /   ',
      '   `~ ~ ~ ~`   ',
    ].join('\n'),
  ],

  INVADERS: [
    [
      ' ▄██▄ ',
      '▀████▀',
      '  ▀▀  ',
    ].join('\n'),
    [
      '  ▄▄  ',
      '▐████▌',
      ' ▐██▌ ',
    ].join('\n'),
    [
      ' ░██░ ',
      '████ ',
      '░  ░ ',
    ].join('\n'),
  ],

  // 8 aliens rediseñados — cada uno con identidad clara y simetría
  OPPONENT_ALIENS: [
    // 0 — Cabeza grey clásica
    [
      '      .---.      ',
      '     /     \\     ',
      '    |  o o  |    ',
      '    | \\___/ |    ',
      '     \\  -  /     ',
      '      |   |      ',
      '     /|   |\\     ',
      '    /_|___|_\\    ',
    ].join('\n'),
    // 1 — Cíclope
    [
      '     ___       ',
      '    /   \\      ',
      '   |  O  |     ',
      '   |\\_-_/|     ',
      '  /|     |\\    ',
      ' / |     | \\   ',
      '|  |_____|  |  ',
      ' \\___| |___/   ',
    ].join('\n'),
    // 2 — Robot militar
    [
      '   ╔═══════╗   ',
      '   ║ [▣ ▣] ║   ',
      '   ║  ───  ║   ',
      ' ╔═╩═══════╩═╗ ',
      ' ║ ▌▌▌▌▌▌▌▌▌ ║ ',
      ' ╚═╗═══════╔═╝ ',
      '   ║║     ║║   ',
      '   ╨╨     ╨╨   ',
    ].join('\n'),
    // 3 — Pulpo / tentáculos
    [
      '      ___       ',
      '    .-   -.     ',
      '   /  ◉ ◉  \\    ',
      '  |    >    |   ',
      '   \\_______/    ',
      '   /|/|\\|\\|\\    ',
      '  / / \\ / \\ \\   ',
      ' (_) (_) (_)    ',
    ].join('\n'),
    // 4 — Cristal vivo
    [
      '       /\\       ',
      '      /  \\      ',
      '     /◆◆◆◆\\     ',
      '    /  ◆◆  \\    ',
      '   |   ◇◇   |   ',
      '    \\ ◆◆◆◆ /    ',
      '     \\ ▽▽ /     ',
      '      \\__/      ',
    ].join('\n'),
    // 5 — Insectoide
    [
      '   /\\     /\\    ',
      '   \\ \\___/ /    ',
      '    \\ o o /     ',
      '     | = |      ',
      '    /\\___/\\     ',
      '   //|. .|\\\\    ',
      '  // |   | \\\\   ',
      '   ¯  ¯ ¯  ¯    ',
    ].join('\n'),
    // 6 — Hongo viviente
    [
      '    ╭─────╮     ',
      '   ╭┘ • • └╮    ',
      '   │   ◡   │    ',
      '   ╰─┐ ┌─╯     ',
      '     │ │       ',
      '    ╱│ │╲      ',
      '   ╱ │ │ ╲     ',
      '  ╱  └─┘  ╲    ',
    ].join('\n'),
    // 7 — Reptiliano
    [
      '   .-^^^^^^-.   ',
      '  / >.    .< \\  ',
      ' |  ▼      ▼  | ',
      ' |    \\__/    | ',
      '  \\          /  ',
      '   |||||||||    ',
      '   |||   |||    ',
      '   ¯¯¯   ¯¯¯    ',
    ].join('\n'),
  ],

  OPPONENT_NAMES: [
    "ZRAX-9", "VOID-MIND", "K-THARRA", "OMEGA-7", "NYXIS PRIME",
    "ARCTURUS", "GLORP", "SEKHMET", "QUARK-LORD", "NEBULON",
    "VEX-12", "OBLIVON", "SH'KAAR", "PRAXIS"
  ],

  // Colores posibles para el rival (RGB hex). El color se elige aleatoriamente
  // al inicio de cada partida.
  OPPONENT_COLORS: [
    "#ff3344", // rojo
    "#ff00ff", // magenta
    "#ff8800", // naranja
    "#ffdd00", // amarillo
    "#00ddff", // cyan
    "#aa00ff", // púrpura
    "#ff0066", // rosa fucsia
    "#ff5500", // rojo-naranja
  ],

  // Devuelve un alien y un color aleatorios. La complejidad varía según el alien elegido.
  randomOpponent() {
    const alienIdx = Math.floor(Math.random() * this.OPPONENT_ALIENS.length);
    const nameIdx  = Math.floor(Math.random() * this.OPPONENT_NAMES.length);
    const colorIdx = Math.floor(Math.random() * this.OPPONENT_COLORS.length);
    return {
      art:   this.OPPONENT_ALIENS[alienIdx],
      name:  this.OPPONENT_NAMES[nameIdx],
      color: this.OPPONENT_COLORS[colorIdx],
    };
  },

  BG_SHIPS: [
    '>=o=>',
    '<=o=<',
    '~<O>~',
    '-=[#]=-',
    '<__/\\__>',
    '<o]≡≡≡[o>',
    '>~~█~~>',
    '<\\.--./>',
    '[=■=]',
    '>{◇}>',
  ],

  BG_ASTEROIDS: [
    '(°°°)',
    '*•*•',
    '{:.:}',
    '(███)',
    '~o.O~',
  ],

  boxify(text, title = '') {
    const lines = text.split('\n');
    const w = Math.max(...lines.map(l => l.length), title.length + 4);
    const pad = s => s + ' '.repeat(w - s.length);
    const top = title
      ? '╔══ ' + title + ' ' + '═'.repeat(Math.max(0, w - title.length - 3)) + '╗'
      : '╔' + '═'.repeat(w + 2) + '╗';
    const bottom = '╚' + '═'.repeat(w + 2) + '╝';
    const mid = lines.map(l => '║ ' + pad(l) + ' ║');
    return [top, ...mid, bottom].join('\n');
  },
};
