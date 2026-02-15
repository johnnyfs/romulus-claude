// Sprite definitions - pixel art as 2D arrays of palette colors
// Each sprite is 16x16, null = transparent
// These are programmer-art placeholders; the Art agent will refine them.

const Sprites = {
  // Maripoga - idle frame
  maripoga_idle: null,
  // Maripoga - hop frame
  maripoga_hop: null,
  // Maripoga - death frame
  maripoga_death: null,
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

    // Maripoga idle - 16x16 frog-boy with big eyes on top, heroic stance
    this.maripoga_idle = [
      [_,_,_,W,W,W,_,_,_,_,W,W,W,_,_,_],
      [_,_,W,W,B,W,W,_,_,W,W,B,W,W,_,_],
      [_,_,W,W,W,W,G,G,G,G,W,W,W,W,_,_],
      [_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_],
      [_,_,_,G,Gd,G,Sk,Sk,Sk,G,Gd,G,_,_,_,_],
      [_,_,_,G,G,Sk,Sk,Sk,Sk,Sk,G,G,_,_,_,_],
      [_,_,_,_,G,G,Sk,Sk,Sk,G,G,_,_,_,_,_],
      [_,_,_,S,S,S,S,S,S,S,S,S,_,_,_,_],
      [_,_,_,_,S,G,G,G,G,G,G,S,S,_,_,_],
      [_,_,_,G,G,G,G,G,G,G,G,G,G,G,_,_],
      [_,_,G,G,Gd,G,G,G,G,G,G,Gd,G,G,_,_],
      [_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_],
      [_,_,G,G,_,_,G,G,G,G,_,_,G,G,_,_],
      [_,G,G,_,_,_,G,G,G,G,_,_,_,G,G,_],
      [_,G,Gd,_,_,_,_,_,_,_,_,_,_,Gd,G,_],
      [G,G,Gd,_,_,_,_,_,_,_,_,_,_,Gd,G,G],
    ];

    // Maripoga hop - legs tucked, body compressed, scarf trailing
    this.maripoga_hop = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,S,S,_],
      [_,_,_,W,W,W,_,_,_,_,W,W,W,S,_,_],
      [_,_,W,W,B,W,W,_,_,W,W,B,W,W,_,_],
      [_,_,W,W,W,W,G,G,G,G,W,W,W,W,_,_],
      [_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_],
      [_,_,_,G,Gd,G,Sk,Sk,Sk,G,Gd,G,_,_,_,_],
      [_,_,_,G,G,Sk,Sk,Sk,Sk,Sk,G,G,_,_,_,_],
      [_,_,_,S,S,S,S,S,S,S,S,S,_,_,_,_],
      [_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_],
      [_,G,G,Gd,G,G,G,G,G,G,G,G,Gd,G,G,_],
      [_,G,G,G,G,G,G,G,G,G,G,G,G,G,G,_],
      [G,G,_,G,G,G,G,G,G,G,G,G,G,_,G,G],
      [G,_,_,_,G,G,_,_,_,_,G,G,_,_,_,G],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Maripoga death - flattened, X eyes
    this.maripoga_death = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,W,_,_,_,_,_,_,_,_,_,_,W,_,_],
      [_,W,B,W,_,W,_,_,_,_,W,_,W,B,W,_],
      [W,B,Sk,B,W,B,W,G,G,W,B,W,B,Sk,B,W],
      [_,W,B,W,Sk,B,W,G,G,W,B,Sk,W,B,W,_],
      [_,_,W,Sk,Sk,Sk,G,G,G,G,Sk,Sk,Sk,W,_,_],
      [_,_,S,S,S,S,S,G,G,S,S,S,S,S,_,_],
      [_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_],
    ];

    // RED FROG - Wide mouth, menacing, hunched forward
    const R = PALETTE.RED;
    const Rd = PALETTE.RED_DARK;
    const E = PALETTE.ENEMY_EYE;

    this.red_frog_idle = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,E,E,E,_,_,_,_,E,E,E,_,_,_],
      [_,_,E,E,B,E,_,_,_,_,E,B,E,E,_,_],
      [_,_,E,E,E,R,R,_,_,R,R,E,E,E,_,_],
      [_,_,_,R,R,R,R,R,R,R,R,R,R,_,_,_],
      [_,_,_,R,Rd,R,R,R,R,R,R,Rd,R,_,_,_],
      [_,_,R,R,R,B,B,B,B,B,B,R,R,R,_,_],
      [_,_,R,R,R,W,W,W,W,W,W,R,R,R,_,_],
      [_,_,R,R,R,R,R,R,R,R,R,R,R,R,_,_],
      [_,R,R,R,R,R,R,R,R,R,R,R,R,R,R,_],
      [_,R,R,Rd,R,R,R,R,R,R,R,R,Rd,R,R,_],
      [_,R,R,R,R,R,R,R,R,R,R,R,R,R,R,_],
      [_,_,R,R,R,_,R,R,R,R,_,R,R,R,_,_],
      [_,R,R,R,_,_,R,R,R,R,_,_,R,R,R,_],
      [_,R,R,_,_,_,_,_,_,_,_,_,_,R,R,_],
      [R,R,Rd,_,_,_,_,_,_,_,_,_,_,Rd,R,R],
    ];

    this.red_frog_hop = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,E,E,E,_,_,_,_,E,E,E,_,_,_],
      [_,_,E,E,B,E,_,_,_,_,E,B,E,E,_,_],
      [_,_,E,E,E,R,R,_,_,R,R,E,E,E,_,_],
      [_,_,_,R,R,R,R,R,R,R,R,R,R,_,_,_],
      [_,_,R,R,Rd,R,R,R,R,R,R,Rd,R,R,_,_],
      [_,_,R,R,B,B,B,B,B,B,B,B,R,R,_,_],
      [_,_,R,R,W,W,W,W,W,W,W,W,R,R,_,_],
      [_,R,R,R,R,R,R,R,R,R,R,R,R,R,R,_],
      [_,R,R,Rd,R,R,R,R,R,R,R,R,Rd,R,R,_],
      [R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R],
      [R,R,R,_,R,R,R,R,R,R,R,R,_,R,R,R],
      [R,_,_,_,_,R,R,_,_,R,R,_,_,_,_,R],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // PURPLE FROG - Sleeker, chaser build, angular eyes
    const P = PALETTE.PURPLE;
    const Pd = PALETTE.PURPLE_DARK;

    this.purple_frog_idle = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,E,E,_,_,_,_,E,E,_,_,_,_],
      [_,_,_,E,E,B,E,_,_,E,B,E,E,_,_,_],
      [_,_,_,E,E,E,P,P,P,P,E,E,E,_,_,_],
      [_,_,_,_,P,P,P,P,P,P,P,P,_,_,_,_],
      [_,_,_,P,P,Pd,P,P,P,P,Pd,P,P,_,_,_],
      [_,_,P,P,P,P,P,P,P,P,P,P,P,P,_,_],
      [_,_,P,P,P,B,B,B,B,B,B,P,P,P,_,_],
      [_,_,P,P,P,P,P,P,P,P,P,P,P,P,_,_],
      [_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_],
      [_,P,P,Pd,P,P,P,P,P,P,P,P,Pd,P,P,_],
      [_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_],
      [_,_,P,P,_,P,P,P,P,P,P,_,P,P,_,_],
      [_,_,P,P,_,_,P,P,P,P,_,_,P,P,_,_],
      [_,P,P,_,_,_,_,_,_,_,_,_,_,P,P,_],
      [P,P,Pd,_,_,_,_,_,_,_,_,_,_,Pd,P,P],
    ];

    this.purple_frog_hop = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,E,E,_,_,_,_,E,E,_,_,_,_],
      [_,_,_,E,E,B,E,_,_,E,B,E,E,_,_,_],
      [_,_,_,E,E,E,P,P,P,P,E,E,E,_,_,_],
      [_,_,_,P,P,P,P,P,P,P,P,P,P,_,_,_],
      [_,_,P,P,Pd,P,P,P,P,P,P,Pd,P,P,_,_],
      [_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_],
      [_,P,P,B,B,B,B,B,B,B,B,B,B,P,P,_],
      [_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_],
      [P,P,P,Pd,P,P,P,P,P,P,P,P,Pd,P,P,P],
      [P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P],
      [P,P,_,P,P,P,P,P,P,P,P,P,P,_,P,P],
      [P,_,_,_,P,P,_,_,_,_,P,P,_,_,_,P],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // BLUE FROG - Rounder, teleporter look, mysterious eyes
    const Bl = PALETTE.BLUE;
    const Bd = PALETTE.BLUE_DARK;

    this.blue_frog_idle = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,E,E,E,_,_,E,E,E,_,_,_,_],
      [_,_,_,E,E,E,B,_,_,B,E,E,E,_,_,_],
      [_,_,_,E,E,E,Bl,Bl,Bl,Bl,E,E,E,_,_,_],
      [_,_,_,_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_,_,_,_],
      [_,_,_,Bl,Bl,Bd,Bl,Bl,Bl,Bl,Bd,Bl,Bl,_,_,_],
      [_,_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_,_],
      [_,_,Bl,Bl,B,B,B,B,B,B,B,B,Bl,Bl,_,_],
      [_,_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_,_],
      [_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_],
      [_,Bl,Bl,Bd,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bd,Bl,Bl,_],
      [_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_],
      [_,_,Bl,Bl,Bl,_,Bl,Bl,Bl,Bl,_,Bl,Bl,Bl,_,_],
      [_,_,Bl,Bl,_,_,_,Bl,Bl,_,_,_,Bl,Bl,_,_],
      [_,Bl,Bl,_,_,_,_,_,_,_,_,_,_,Bl,Bl,_],
      [Bl,Bl,Bd,_,_,_,_,_,_,_,_,_,_,Bd,Bl,Bl],
    ];

    this.blue_frog_hop = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,E,E,E,_,_,E,E,E,_,_,_,_],
      [_,_,_,E,E,E,B,_,_,B,E,E,E,_,_,_],
      [_,_,_,E,E,E,Bl,Bl,Bl,Bl,E,E,E,_,_,_],
      [_,_,_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_,_,_],
      [_,_,Bl,Bl,Bd,Bl,Bl,Bl,Bl,Bl,Bl,Bd,Bl,Bl,_,_],
      [_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_],
      [_,Bl,Bl,B,B,B,B,B,B,B,B,B,B,Bl,Bl,_],
      [_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_],
      [Bl,Bl,Bl,Bd,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bd,Bl,Bl,Bl],
      [Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl],
      [Bl,Bl,Bl,_,Bl,Bl,Bl,Bl,Bl,Bl,Bl,Bl,_,Bl,Bl,Bl],
      [Bl,_,_,_,_,Bl,Bl,_,_,Bl,Bl,_,_,_,_,Bl],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
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
