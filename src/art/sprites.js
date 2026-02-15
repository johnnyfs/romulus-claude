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

  // Add black outlines to a sprite
  addOutline(sprite) {
    const B = PALETTE.BLACK;
    const _ = null;
    const height = sprite.length;
    const width = sprite[0].length;

    // Create a copy of the sprite
    const outlined = sprite.map(row => [...row]);

    // For each pixel, if it's non-transparent, check neighbors
    // If any neighbor is transparent, mark it for outline
    const outlinePixels = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = sprite[y][x];
        if (pixel !== null) {
          // Check 4-directional neighbors
          const neighbors = [
            [x, y-1], // up
            [x+1, y], // right
            [x, y+1], // down
            [x-1, y], // left
          ];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (sprite[ny][nx] === null) {
                // This neighbor is transparent, add black outline there
                outlinePixels.push([nx, ny]);
              }
            }
          }
        }
      }
    }

    // Apply outline pixels
    for (const [x, y] of outlinePixels) {
      if (outlined[y][x] === null) {
        outlined[y][x] = B;
      }
    }

    return outlined;
  },

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

    // Snail sprite - small hazard
    const Sn = PALETTE.SPIKE; // Orange-ish for snail shell
    const Snd = PALETTE.SPIKE_DARK;
    const SnB = PALETTE.NEUTRAL; // Snail body gray

    this.snail = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,Sn,Sn,Sn,Sn,_,_,_,_,_,_,_],
      [_,_,_,_,Sn,Snd,Sn,Snd,Sn,Sn,_,_,_,_,_,_],
      [_,_,_,Sn,Snd,Sn,Snd,Sn,Snd,Sn,Sn,_,_,_,_,_],
      [_,_,_,Sn,Sn,Sn,Sn,Sn,Sn,Snd,Sn,_,_,_,_,_],
      [_,_,_,_,SnB,SnB,SnB,SnB,Sn,Sn,_,_,_,_,_,_],
      [_,_,_,SnB,W,B,SnB,W,B,SnB,SnB,_,_,_,_,_],
      [_,_,_,SnB,SnB,SnB,SnB,SnB,SnB,SnB,SnB,_,_,_,_,_],
      [_,_,_,_,SnB,_,_,_,_,_,SnB,_,_,_,_,_],
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

    // ZOMBIE FROG - Gray, hunched, red eyes
    const Z = PALETTE.NEUTRAL;
    const Zd = PALETTE.HUD_TEXT; // Darker gray
    const ZE = PALETTE.RED; // Red eyes instead of yellow

    this.zombie_frog_idle = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,ZE,ZE,_,_,_,_,ZE,ZE,_,_,_,_],
      [_,_,_,ZE,ZE,B,ZE,_,_,ZE,B,ZE,ZE,_,_,_],
      [_,_,_,ZE,ZE,ZE,Z,Z,Z,Z,ZE,ZE,ZE,_,_,_],
      [_,_,_,_,Z,Z,Z,Z,Z,Z,Z,Z,_,_,_,_],
      [_,_,_,Z,Z,Zd,Z,Z,Z,Z,Zd,Z,Z,_,_,_],
      [_,_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_,_],
      [_,_,Z,Z,Z,B,B,B,B,B,B,Z,Z,Z,_,_],
      [_,_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_,_],
      [_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_],
      [_,Z,Z,Zd,Z,Z,Z,Z,Z,Z,Z,Z,Zd,Z,Z,_],
      [_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_],
      [_,_,Z,Z,_,Z,Z,Z,Z,Z,Z,_,Z,Z,_,_],
      [_,_,Z,Z,_,_,Z,Z,Z,Z,_,_,Z,Z,_,_],
      [_,Z,Z,_,_,_,_,_,_,_,_,_,_,Z,Z,_],
      [Z,Z,Zd,_,_,_,_,_,_,_,_,_,_,Zd,Z,Z],
    ];

    this.zombie_frog_hop = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,ZE,ZE,_,_,_,_,ZE,ZE,_,_,_,_],
      [_,_,_,ZE,ZE,B,ZE,_,_,ZE,B,ZE,ZE,_,_,_],
      [_,_,_,ZE,ZE,ZE,Z,Z,Z,Z,ZE,ZE,ZE,_,_,_],
      [_,_,_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_,_,_],
      [_,_,Z,Z,Zd,Z,Z,Z,Z,Z,Z,Zd,Z,Z,_,_],
      [_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_],
      [_,Z,Z,B,B,B,B,B,B,B,B,B,B,Z,Z,_],
      [_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_],
      [Z,Z,Z,Zd,Z,Z,Z,Z,Z,Z,Z,Z,Zd,Z,Z,Z],
      [Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z],
      [Z,Z,_,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,_,Z,Z],
      [Z,_,_,_,Z,Z,_,_,_,_,Z,Z,_,_,_,Z],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // No outlines — clean solid sprites for authentic NES look

    // === BONUS ITEM SPRITES ===

    // Speed Fly (cyan/blue) - wings spread frame
    const Cy = PALETTE.CYAN;
    const Cyd = PALETTE.CYAN_DARK;

    this.speed_fly_1 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,Cy,Cy,_,_,_,_,_,_,Cy,Cy,_,_,_],
      [_,_,Cy,Cy,Cy,Cy,_,_,_,Cy,Cy,Cy,Cy,_,_,_],
      [_,_,_,Cy,Cy,Cyd,Cyd,Cyd,Cyd,Cyd,Cy,Cy,_,_,_,_],
      [_,_,_,_,_,Cyd,W,Cyd,Cyd,W,Cyd,_,_,_,_,_],
      [_,_,_,_,_,_,Cyd,Cyd,Cyd,Cyd,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,Cyd,Cyd,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Speed Fly - wings folded frame
    this.speed_fly_2 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,Cy,_,_,_,_,Cy,_,_,_,_,_],
      [_,_,_,_,_,Cy,Cy,_,_,Cy,Cy,_,_,_,_,_],
      [_,_,_,_,_,Cyd,Cyd,Cyd,Cyd,Cyd,_,_,_,_,_,_],
      [_,_,_,_,_,Cyd,W,Cyd,Cyd,W,Cyd,_,_,_,_,_],
      [_,_,_,_,_,_,Cyd,Cyd,Cyd,Cyd,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,Cyd,Cyd,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Invincibility Fly (gold/yellow) - wings spread frame
    const Go = PALETTE.GOLD;
    const God = PALETTE.GOLD_DARK;

    this.invincible_fly_1 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,Go,Go,_,_,_,_,_,_,Go,Go,_,_,_],
      [_,_,Go,Go,Go,Go,_,_,_,Go,Go,Go,Go,_,_,_],
      [_,_,_,Go,Go,God,God,God,God,God,Go,Go,_,_,_,_],
      [_,_,_,_,_,God,W,God,God,W,God,_,_,_,_,_],
      [_,_,_,_,_,_,God,God,God,God,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,God,God,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Invincibility Fly - wings folded frame
    this.invincible_fly_2 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,Go,_,_,_,_,Go,_,_,_,_,_],
      [_,_,_,_,_,Go,Go,_,_,Go,Go,_,_,_,_,_],
      [_,_,_,_,_,God,God,God,God,God,_,_,_,_,_,_],
      [_,_,_,_,_,God,W,God,God,W,God,_,_,_,_,_],
      [_,_,_,_,_,_,God,God,God,God,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,God,God,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Extra Life Fly (pink/magenta) - wings spread frame
    const Pk = PALETTE.PINK;
    const Pkd = PALETTE.PINK_DARK;

    this.life_fly_1 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,Pk,Pk,_,_,_,_,_,_,Pk,Pk,_,_,_],
      [_,_,Pk,Pk,Pk,Pk,_,_,_,Pk,Pk,Pk,Pk,_,_,_],
      [_,_,_,Pk,Pk,Pkd,Pkd,Pkd,Pkd,Pkd,Pk,Pk,_,_,_,_],
      [_,_,_,_,_,Pkd,W,Pkd,Pkd,W,Pkd,_,_,_,_,_],
      [_,_,_,_,_,_,Pkd,Pkd,Pkd,Pkd,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,Pkd,Pkd,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Extra Life Fly - wings folded frame
    this.life_fly_2 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,Pk,_,_,_,_,Pk,_,_,_,_,_],
      [_,_,_,_,_,Pk,Pk,_,_,Pk,Pk,_,_,_,_,_],
      [_,_,_,_,_,Pkd,Pkd,Pkd,Pkd,Pkd,_,_,_,_,_,_],
      [_,_,_,_,_,Pkd,W,Pkd,Pkd,W,Pkd,_,_,_,_,_],
      [_,_,_,_,_,_,Pkd,Pkd,Pkd,Pkd,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,Pkd,Pkd,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Green Bug - recolored snail in green tones (helpful!)
    const Gb = PALETTE.GREEN;
    const Gbd = PALETTE.GREEN_DARK;
    const GbB = PALETTE.GREEN_MID; // Bug body

    this.green_bug = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,Gb,Gb,Gb,Gb,_,_,_,_,_,_,_],
      [_,_,_,_,Gb,Gbd,Gb,Gbd,Gb,Gb,_,_,_,_,_,_],
      [_,_,_,Gb,Gbd,Gb,Gbd,Gb,Gbd,Gb,Gb,_,_,_,_,_],
      [_,_,_,Gb,Gb,Gb,Gb,Gb,Gb,Gbd,Gb,_,_,_,_,_],
      [_,_,_,_,GbB,GbB,GbB,GbB,Gb,Gb,_,_,_,_,_,_],
      [_,_,_,GbB,W,B,GbB,W,B,GbB,GbB,_,_,_,_,_],
      [_,_,_,GbB,GbB,GbB,GbB,GbB,GbB,GbB,GbB,_,_,_,_,_],
      [_,_,_,_,GbB,_,_,_,_,_,GbB,_,_,_,_,_],
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
    if (type === 'zombie') return isHopping ? this.zombie_frog_hop : this.zombie_frog_idle;
    if (type === 'snail') return this.snail;
    if (type === 'green_bug') return this.green_bug;
    return this.maripoga_idle;
  },

  // Get fly sprite with wing animation frame
  getFlySprite(type, wingFrame) {
    if (type === 'speed_fly') return wingFrame ? this.speed_fly_1 : this.speed_fly_2;
    if (type === 'invincible_fly') return wingFrame ? this.invincible_fly_1 : this.invincible_fly_2;
    if (type === 'life_fly') return wingFrame ? this.life_fly_1 : this.life_fly_2;
    return this.speed_fly_1;
  },
};
