// Sprite definitions - pixel art as 2D arrays of palette colors
// Each sprite is 16x16, null = transparent
// These are programmer-art placeholders; the Art agent will refine them.

const Sprites = {
  // Maripoga - idle frame
  maripoga_idle: null,
  // Maripoga - hop frame
  maripoga_hop: null,
  // Red frog idle
  red_frog_idle: null,
  // Red frog hop
  red_frog_hop: null,
  // Purple frog idle
  purple_frog_idle: null,
  // Purple frog hop
  purple_frog_hop: null,
  // Blue frog idle
  blue_frog_idle: null,
  // Blue frog hop
  blue_frog_hop: null,

  init() {
    const G = PALETTE.GREEN;
    const Gd = PALETTE.GREEN_DARK;
    const W = PALETTE.WHITE;
    const B = PALETTE.BLACK;
    const S = PALETTE.SCARF;
    const Sk = PALETTE.SKIN;
    const _ = null;

    // Maripoga idle - 16x16 frog-boy
    this.maripoga_idle = [
      [_,_,_,_,_,G,G,G,G,G,G,_,_,_,_,_],
      [_,_,_,_,G,G,G,G,G,G,G,G,_,_,_,_],
      [_,_,_,G,G,W,W,G,G,W,W,G,G,_,_,_],
      [_,_,_,G,G,W,B,G,G,W,B,G,G,_,_,_],
      [_,_,_,G,G,G,G,Sk,Sk,G,G,G,G,_,_,_],
      [_,_,_,_,G,G,Sk,Sk,Sk,Sk,G,G,_,_,_,_],
      [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
      [_,_,_,_,S,S,G,G,G,G,S,S,S,_,_,_],
      [_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_],
      [_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_],
      [_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_],
      [_,_,G,G,_,G,G,G,G,G,G,_,G,G,_,_],
      [_,G,G,_,_,_,G,G,G,G,_,_,_,G,G,_],
      [_,G,G,_,_,_,_,G,G,_,_,_,_,G,G,_],
      [G,G,G,G,_,_,_,_,_,_,_,_,G,G,G,G],
      [G,G,G,G,_,_,_,_,_,_,_,_,G,G,G,G],
    ];

    // Maripoga hop - slightly squashed, legs tucked
    this.maripoga_hop = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,G,G,G,G,G,G,_,_,_,_,_],
      [_,_,_,_,G,G,G,G,G,G,G,G,_,_,_,_],
      [_,_,_,G,G,W,W,G,G,W,W,G,G,_,_,_],
      [_,_,_,G,G,W,B,G,G,W,B,G,G,_,_,_],
      [_,_,_,G,G,G,G,Sk,Sk,G,G,G,G,_,_,_],
      [_,_,_,_,G,G,Sk,Sk,Sk,Sk,G,G,_,_,_,_],
      [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
      [_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_],
      [_,G,G,G,G,G,G,G,G,G,G,G,G,G,G,_],
      [_,G,G,G,G,G,G,G,G,G,G,G,G,G,G,_],
      [G,G,_,G,G,G,G,G,G,G,G,G,G,_,G,G],
      [G,G,_,_,G,G,_,_,_,_,G,G,_,_,G,G],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Generic enemy frog template - will be recolored per type
    this._makeFrogSprite = function(bodyColor, eyeColor) {
      const C = bodyColor;
      const E = eyeColor || PALETTE.ENEMY_EYE;
      return [
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,C,C,_,_,_,_,_,_,C,C,_,_,_],
        [_,_,C,C,C,C,_,_,_,_,C,C,C,C,_,_],
        [_,_,C,E,E,C,C,C,C,C,C,E,E,C,_,_],
        [_,_,C,E,B,C,C,C,C,C,C,E,B,C,_,_],
        [_,_,_,C,C,C,C,C,C,C,C,C,C,_,_,_],
        [_,_,_,_,C,C,C,C,C,C,C,C,_,_,_,_],
        [_,_,_,C,C,C,C,C,C,C,C,C,C,_,_,_],
        [_,_,C,C,C,C,C,C,C,C,C,C,C,C,_,_],
        [_,C,C,C,C,C,C,C,C,C,C,C,C,C,C,_],
        [_,C,C,C,C,C,C,C,C,C,C,C,C,C,C,_],
        [_,C,C,_,_,C,C,C,C,C,C,_,_,C,C,_],
        [_,C,_,_,_,_,C,_,_,C,_,_,_,_,C,_],
        [C,C,_,_,_,_,_,_,_,_,_,_,_,_,C,C],
        [C,C,C,_,_,_,_,_,_,_,_,_,_,C,C,C],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      ];
    };

    this.red_frog_idle = this._makeFrogSprite(PALETTE.RED);
    this.purple_frog_idle = this._makeFrogSprite(PALETTE.PURPLE);
    this.blue_frog_idle = this._makeFrogSprite(PALETTE.BLUE);

    // Hop frames: same but shifted up 2px (simplified)
    this.red_frog_hop = this._makeFrogSprite(PALETTE.RED);
    this.purple_frog_hop = this._makeFrogSprite(PALETTE.PURPLE);
    this.blue_frog_hop = this._makeFrogSprite(PALETTE.BLUE);
  },

  // Get the right sprite for an entity
  getSprite(type, isHopping) {
    if (type === 'player') return isHopping ? this.maripoga_hop : this.maripoga_idle;
    if (type === 'red') return isHopping ? this.red_frog_hop : this.red_frog_idle;
    if (type === 'purple') return isHopping ? this.purple_frog_hop : this.purple_frog_idle;
    if (type === 'blue') return isHopping ? this.blue_frog_hop : this.blue_frog_idle;
    return this.maripoga_idle;
  },
};
