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

    // Create CRT scanline overlay
    this.createCRTOverlay();
  },

  createCRTOverlay() {
    // Create a div overlay for CRT effect
    this.crtOverlay = document.createElement('div');
    this.crtOverlay.style.position = 'absolute';
    this.crtOverlay.style.top = '0';
    this.crtOverlay.style.left = '0';
    this.crtOverlay.style.width = (SCREEN_WIDTH * SCALE) + 'px';
    this.crtOverlay.style.height = (SCREEN_HEIGHT * SCALE) + 'px';
    this.crtOverlay.style.pointerEvents = 'none';
    this.crtOverlay.style.zIndex = '10';

    // Scanlines with repeating gradient
    this.crtOverlay.style.background = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)';

    // Vignette effect using box-shadow
    this.crtOverlay.style.boxShadow = 'inset 0 0 100px rgba(0,0,0,0.5)';

    // Slight curve/bulge effect
    this.crtOverlay.style.borderRadius = '4px';

    // Position relative to canvas
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-block';

    this.canvas.parentElement.appendChild(container);
    container.appendChild(this.canvas);
    container.appendChild(this.crtOverlay);
  },

  clear() {
    this.ctx.fillStyle = PALETTE.DARK_BG;
    this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  },

  // Draw a filled rectangle
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  },

  // Draw a single tile at grid position with texture
  drawTile(col, row, color) {
    const x = col * TILE_SIZE;
    const y = (row + 1) * TILE_SIZE; // +1 to skip HUD row

    // Get dark and mid colors for texture
    let darkColor = color;
    let midColor = color;

    // Apply checkerboard texture for claimed tiles
    if (color === PALETTE.GREEN_DARK) {
      darkColor = PALETTE.GREEN_DARK;
      midColor = PALETTE.GREEN_MID;
    } else if (color === PALETTE.RED_DARK) {
      darkColor = PALETTE.RED_DARK;
      midColor = PALETTE.RED_MID;
    } else if (color === PALETTE.PURPLE_DARK) {
      darkColor = PALETTE.PURPLE_DARK;
      midColor = PALETTE.PURPLE_MID;
    } else if (color === PALETTE.BLUE_DARK) {
      darkColor = PALETTE.BLUE_DARK;
      midColor = PALETTE.BLUE_MID;
    }

    // Draw 2x2 checkerboard pattern within tile
    const tileInnerSize = TILE_SIZE - 2;
    const halfSize = Math.floor(tileInnerSize / 2);

    for (let ty = 0; ty < 2; ty++) {
      for (let tx = 0; tx < 2; tx++) {
        const patternColor = ((tx + ty) % 2 === 0) ? darkColor : midColor;
        this.ctx.fillStyle = patternColor;
        this.ctx.fillRect(
          x + 1 + tx * halfSize,
          y + 1 + ty * halfSize,
          halfSize,
          halfSize
        );
      }
    }
  },

  // Bitmap font definition - 5x7 characters
  bitmapFont: {
    // Each character is defined as 7 rows, each row is a 5-bit number
    // Bit positions: 0b10000 = leftmost pixel, 0b00001 = rightmost pixel
    'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
    'C': [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
    'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
    'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
    'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
    'G': [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
    'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    'I': [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
    'J': [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
    'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
    'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
    'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
    'N': [0b10001, 0b11001, 0b10101, 0b10101, 0b10011, 0b10001, 0b10001],
    'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
    'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
    'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
    'S': [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
    'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
    'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
    'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
    'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
    'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
    'Z': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
    '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
    '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
    '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
    '3': [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
    '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
    '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
    '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
    '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
    '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
    '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
    ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
    '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b00100],
    '!': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
    '?': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b00000, 0b00100],
    ':': [0b00000, 0b00100, 0b00100, 0b00000, 0b00100, 0b00100, 0b00000],
    '/': [0b00001, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b10000],
    '%': [0b11001, 0b11010, 0b00010, 0b00100, 0b01000, 0b01011, 0b10011],
    '+': [0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000],
    '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
    '=': [0b00000, 0b00000, 0b11111, 0b00000, 0b11111, 0b00000, 0b00000],
  },

  // Draw text using bitmap font
  drawText(text, x, y, color, size) {
    color = color || PALETTE.WHITE;
    const px = Math.floor(x);
    const py = Math.floor(y);
    let cursorX = px;

    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      const glyph = this.bitmapFont[char];

      if (!glyph) {
        // Unknown character, skip with space
        cursorX += 6;
        continue;
      }

      // Draw each row of the glyph
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let col = 0; col < 5; col++) {
          if (bits & (1 << (4 - col))) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(cursorX + col, py + row, 1, 1);
          }
        }
      }

      cursorX += 6; // 5 pixels wide + 1 pixel spacing
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
