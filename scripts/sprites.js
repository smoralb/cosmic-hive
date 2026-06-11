/*
 * PIECE_SPRITES — Chess-inspired pixel-art silhouettes for Stellar Swarm.
 * Shape = piece TYPE (queen/rook/bishop/knight/pawn).
 * Color = piece OWNER (inherited via fill="currentColor").
 *
 * Mothership → Queen  (4-point crown, wide base)
 * Weaver     → Rook   (battlements, tower)
 * Pulsar     → Bishop (tall mitre, thin body)
 * Crawler    → Knight (horse-head profile)
 * Drone      → Pawn   (round head, stem, base)
 */

window.PIECE_SPRITES = {

  // Mothership (Queen) — crown with 4 tips, majestic wide base — viewBox 9×8
  Mothership: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 8" fill="currentColor" shape-rendering="crispEdges" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
    + '<rect x="0" y="0" width="1" height="1"/>'   // crown tip 1
    + '<rect x="2" y="0" width="1" height="1"/>'   // crown tip 2
    + '<rect x="4" y="0" width="1" height="1"/>'   // crown tip 3
    + '<rect x="6" y="0" width="1" height="1"/>'   // crown tip 4
    + '<rect x="0" y="1" width="7" height="1"/>'   // crown band
    + '<rect x="0" y="2" width="9" height="1"/>'   // shoulders (widest)
    + '<rect x="1" y="3" width="7" height="2"/>'   // body
    + '<rect x="0" y="5" width="9" height="1"/>'   // hip
    + '<rect x="0" y="6" width="9" height="2"/>'   // base
    + '</svg>',

  // Weaver (Rook) — castle battlements, tower, solid base — viewBox 8×7
  Weaver: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" fill="currentColor" shape-rendering="crispEdges" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
    + '<rect x="0" y="0" width="1" height="1"/>'   // battlement 1
    + '<rect x="2" y="0" width="1" height="1"/>'   // battlement 2
    + '<rect x="4" y="0" width="1" height="1"/>'   // battlement 3
    + '<rect x="6" y="0" width="1" height="1"/>'   // battlement 4
    + '<rect x="0" y="1" width="8" height="1"/>'   // parapet
    + '<rect x="1" y="2" width="6" height="3"/>'   // tower wall
    + '<rect x="0" y="5" width="8" height="2"/>'   // base
    + '</svg>',

  // Pulsar (Bishop) — tall mitre tip, thin body, flared skirt — viewBox 7×9
  Pulsar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 9" fill="currentColor" shape-rendering="crispEdges" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
    + '<rect x="3" y="0" width="1" height="1"/>'   // tip
    + '<rect x="2" y="1" width="3" height="2"/>'   // mitre cap
    + '<rect x="3" y="3" width="1" height="1"/>'   // neck
    + '<rect x="2" y="4" width="3" height="2"/>'   // body
    + '<rect x="1" y="6" width="5" height="1"/>'   // skirt
    + '<rect x="0" y="7" width="7" height="2"/>'   // base
    + '</svg>',

  // Crawler (Knight) — horse-head profile facing left — viewBox 9×9
  Crawler: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" fill="currentColor" shape-rendering="crispEdges" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
    + '<rect x="3" y="0" width="3" height="1"/>'   // ear bump
    + '<rect x="2" y="1" width="5" height="2"/>'   // head
    + '<rect x="1" y="3" width="7" height="1"/>'   // wide face
    + '<rect x="1" y="4" width="2" height="1"/>'   // snout/muzzle sticking out
    + '<rect x="1" y="5" width="6" height="1"/>'   // jaw/chin
    + '<rect x="2" y="6" width="7" height="1"/>'   // neck
    + '<rect x="0" y="7" width="9" height="2"/>'   // body & base
    + '</svg>',

  // Drone (Pawn) — round head, stem, sturdy base — viewBox 5×7
  Drone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 7" fill="currentColor" shape-rendering="crispEdges" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
    + '<rect x="1" y="0" width="3" height="2"/>'   // head
    + '<rect x="2" y="2" width="1" height="1"/>'   // neck stem
    + '<rect x="1" y="3" width="3" height="2"/>'   // body
    + '<rect x="0" y="5" width="5" height="2"/>'   // base
    + '</svg>',
};

window.pieceSprite = function(type) {
  return (window.PIECE_SPRITES && window.PIECE_SPRITES[type])
    || (window.PIECE_TYPES && window.PIECE_TYPES[type] ? window.PIECE_TYPES[type].glyph : '?');
};
