window.Hex = {
  key(q, r) { return q + ',' + r; },
  parse(key) { const [q,r] = key.split(',').map(Number); return {q,r}; },

  // Direcciones: E, NE, NW, W, SW, SE
  DIRS: [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],

  neighbors(q, r) {
    return this.DIRS.map(([dq,dr]) => ({q: q+dq, r: r+dr}));
  },

  distance(a, b) {
    return (Math.abs(a.q-b.q) + Math.abs(a.q+a.r-b.q-b.r) + Math.abs(a.r-b.r)) / 2;
  },

  toPixel(q, r, size) {
    const x = size * Math.sqrt(3) * (q + r/2);
    const y = size * 1.5 * r;
    return {x, y};
  },

  // Slide válido: de (q,r) hacia vecino en dirección idx
  // Los dos vecinos "laterales" son dir (idx+1)%6 y (idx+5)%6 desde origen
  // Para poder slide: exactamente UNO de los dos laterales debe estar ocupado (permanece conectado pero no bloqueado)
  canSlide(fromQ, fromR, dirIdx, board) {
    const [dq,dr] = this.DIRS[dirIdx];
    const toQ = fromQ+dq, toR = fromR+dr;
    // destino debe estar vacío
    if (board.has(this.key(toQ, toR))) return false;
    const leftDir  = this.DIRS[(dirIdx+1)%6];
    const rightDir = this.DIRS[(dirIdx+5)%6];
    const leftOcc  = board.has(this.key(fromQ+leftDir[0], fromR+leftDir[1]));
    const rightOcc = board.has(this.key(fromQ+rightDir[0], fromR+rightDir[1]));
    // Ambos bloqueados = físicamente no cabe; ambos libres = se desconecta durante el movimiento
    return leftOcc !== rightOcc;
  },

  slideNeighbors(q, r, board) {
    const result = [];
    for (let i = 0; i < 6; i++) {
      if (this.canSlide(q, r, i, board)) {
        const [dq,dr] = this.DIRS[i];
        result.push({q: q+dq, r: r+dr, dirIdx: i});
      }
    }
    return result;
  },
};
