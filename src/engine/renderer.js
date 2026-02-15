// Canvas renderer - handles drawing at NES resolution
const Renderer = {
  canvas: null,
  ctx: null,
  crtOverlay: null,

  init() {
    this.canvas = document.getElementById('game');
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    this.canvas.style.width = (SCREEN_WIDTH * SCALE) + 'px';
    this.canvas.style.height = (SCREEN_HEIGHT * SCALE) + 'px';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    // Ensure canvas can receive keyboard events
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';
    this.canvas.focus();

    // Create CRT scanline overlay
    this.createCRTOverlay();
  },

  createCRTOverlay() {
    // CRT scanline overlay with vignette
    this.crtOverlay = document.createElement('div');
    this.crtOverlay.style.position = 'absolute';
    this.crtOverlay.style.top = '0';
    this.crtOverlay.style.left = '0';
    this.crtOverlay.style.width = (SCREEN_WIDTH * SCALE) + 'px';
    this.crtOverlay.style.height = (SCREEN_HEIGHT * SCALE) + 'px';
    this.crtOverlay.style.pointerEvents = 'none';
    this.crtOverlay.style.userSelect = 'none';
    this.crtOverlay.style.zIndex = '10';
    this.crtOverlay.style.background = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)';
    this.crtOverlay.style.boxShadow = 'inset 0 0 100px rgba(0,0,0,0.5)';
    this.crtOverlay.style.borderRadius = '4px';

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-block';

    this.canvas.parentElement.appendChild(container);
    container.appendChild(this.canvas);
    container.appendChild(this.crtOverlay);
  },

  clear() {
    // Water/swamp background — dark water between pad-shaped tiles
    this.ctx.fillStyle = PALETTE.WATER_BG;
    this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  },

  // Draw a filled rectangle
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  },

  // Pad-shaped tile: 15x14, rounded top with 4px notch, steep 2-4 taper at bottom
  // Square-lily-pad hybrid — like a square and a lily pad had a baby
  padTileShape: [
    // row 0: rounded corners 2px + 4px notch centered (cols 6-9 = 0)
    [0,0,1,1,1,1,0,0,0,0,1,1,1,0,0],
    // row 1: 1px corners
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    // rows 2-11: full width
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // row 12: 2px taper
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
    // row 13: 4px taper
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0],
  ],

  // Draw a single tile at grid position using pad shape
  drawTile(col, row, color) {
    const baseX = col * TILE_SIZE;
    const baseY = (row + 1) * TILE_SIZE; // +1 to skip HUD row
    const shape = this.padTileShape;
    const pw = 15, ph = 14;
    const ox = baseX + Math.floor((TILE_SIZE - pw) / 2); // center 15 in 16 = offset 0
    const oy = baseY + Math.floor((TILE_SIZE - ph) / 2); // center 14 in 16 = offset 1
    this.ctx.fillStyle = color;
    for (let r = 0; r < ph; r++) {
      // Draw contiguous runs for efficiency
      let startC = -1;
      for (let c = 0; c <= pw; c++) {
        if (c < pw && shape[r][c]) {
          if (startC < 0) startC = c;
        } else if (startC >= 0) {
          this.ctx.fillRect(ox + startC, oy + r, c - startC, 1);
          startC = -1;
        }
      }
    }
  },

  // Blocky 8x8 NES-style arcade font (7 rows used, chars on 8px grid)
  bitmapFont: {
    'A': [0x7C,0xC6,0xC6,0xFE,0xC6,0xC6,0xC6],
    'B': [0xFC,0xC6,0xFC,0xC6,0xC6,0xC6,0xFC],
    'C': [0x7C,0xC6,0xC0,0xC0,0xC0,0xC6,0x7C],
    'D': [0xF8,0xCC,0xC6,0xC6,0xC6,0xCC,0xF8],
    'E': [0xFE,0xC0,0xC0,0xFC,0xC0,0xC0,0xFE],
    'F': [0xFE,0xC0,0xC0,0xFC,0xC0,0xC0,0xC0],
    'G': [0x7C,0xC6,0xC0,0xCE,0xC6,0xC6,0x7C],
    'H': [0xC6,0xC6,0xC6,0xFE,0xC6,0xC6,0xC6],
    'I': [0x7E,0x18,0x18,0x18,0x18,0x18,0x7E],
    'J': [0x3E,0x0C,0x0C,0x0C,0x0C,0xCC,0x78],
    'K': [0xC6,0xCC,0xD8,0xF0,0xD8,0xCC,0xC6],
    'L': [0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xFE],
    'M': [0xC6,0xEE,0xFE,0xD6,0xC6,0xC6,0xC6],
    'N': [0xC6,0xE6,0xF6,0xDE,0xCE,0xC6,0xC6],
    'O': [0x7C,0xC6,0xC6,0xC6,0xC6,0xC6,0x7C],
    'P': [0xFC,0xC6,0xC6,0xFC,0xC0,0xC0,0xC0],
    'Q': [0x7C,0xC6,0xC6,0xC6,0xD6,0xCC,0x76],
    'R': [0xFC,0xC6,0xC6,0xFC,0xD8,0xCC,0xC6],
    'S': [0x7C,0xC6,0xC0,0x7C,0x06,0xC6,0x7C],
    'T': [0xFE,0x18,0x18,0x18,0x18,0x18,0x18],
    'U': [0xC6,0xC6,0xC6,0xC6,0xC6,0xC6,0x7C],
    'V': [0xC6,0xC6,0xC6,0xC6,0x6C,0x38,0x10],
    'W': [0xC6,0xC6,0xC6,0xD6,0xFE,0xEE,0xC6],
    'X': [0xC6,0xC6,0x6C,0x38,0x6C,0xC6,0xC6],
    'Y': [0xC6,0xC6,0x6C,0x38,0x18,0x18,0x18],
    'Z': [0xFE,0x06,0x0C,0x18,0x30,0x60,0xFE],
    '0': [0x7C,0xC6,0xCE,0xD6,0xE6,0xC6,0x7C],
    '1': [0x18,0x38,0x18,0x18,0x18,0x18,0x7E],
    '2': [0x7C,0xC6,0x06,0x0C,0x30,0x60,0xFE],
    '3': [0x7C,0xC6,0x06,0x3C,0x06,0xC6,0x7C],
    '4': [0x0C,0x1C,0x3C,0x6C,0xFE,0x0C,0x0C],
    '5': [0xFE,0xC0,0xFC,0x06,0x06,0xC6,0x7C],
    '6': [0x38,0x60,0xC0,0xFC,0xC6,0xC6,0x7C],
    '7': [0xFE,0x06,0x0C,0x18,0x30,0x30,0x30],
    '8': [0x7C,0xC6,0xC6,0x7C,0xC6,0xC6,0x7C],
    '9': [0x7C,0xC6,0xC6,0x7E,0x06,0x0C,0x78],
    ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    '.': [0x00,0x00,0x00,0x00,0x00,0x18,0x18],
    '!': [0x18,0x18,0x18,0x18,0x18,0x00,0x18],
    '?': [0x7C,0xC6,0x06,0x0C,0x18,0x00,0x18],
    ':': [0x00,0x18,0x18,0x00,0x18,0x18,0x00],
    '/': [0x06,0x0C,0x18,0x30,0x60,0xC0,0x80],
    '%': [0xC6,0xCC,0x18,0x30,0x66,0xC6,0x00],
    '+': [0x00,0x18,0x18,0x7E,0x18,0x18,0x00],
    '-': [0x00,0x00,0x00,0x7E,0x00,0x00,0x00],
    '=': [0x00,0x00,0x7E,0x00,0x7E,0x00,0x00],
    'x': [0x00,0xC6,0x6C,0x38,0x6C,0xC6,0x00],
    '\'': [0x18,0x18,0x30,0x00,0x00,0x00,0x00],
  },

  // Draw text using blocky 8x8 NES arcade font
  drawText(text, x, y, color, size) {
    color = color || PALETTE.WHITE;
    const px = Math.floor(x);
    const py = Math.floor(y);
    let cursorX = px;

    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      const glyph = this.bitmapFont[char];

      if (!glyph) {
        cursorX += 8;
        continue;
      }

      this.ctx.fillStyle = color;
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let col = 0; col < 8; col++) {
          if (bits & (1 << (7 - col))) {
            this.ctx.fillRect(cursorX + col, py + row, 1, 1);
          }
        }
      }

      cursorX += 8; // 8px grid
    }
  },

  // Draw a sprite from pixel data (array of rows, each row is array of palette colors or null for transparent)
  drawSprite(spriteData, x, y) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    for (let row = 0; row < spriteData.length; row++) {
      for (let col = 0; col < spriteData[row].length; col++) {
        const color = spriteData[row][col];
        if (color) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(px + col, py + row, 1, 1);
        }
      }
    }
  },
};
