// Canvas renderer - handles drawing at NES resolution
const Renderer = {
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.getElementById('game');
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    this.canvas.style.width = (SCREEN_WIDTH * SCALE) + 'px';
    this.canvas.style.height = (SCREEN_HEIGHT * SCALE) + 'px';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
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

  // Draw a single tile at grid position
  drawTile(col, row, color) {
    const x = col * TILE_SIZE;
    const y = (row + 1) * TILE_SIZE; // +1 to skip HUD row
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  },

  // Draw text (NES-style pixel font approximation)
  drawText(text, x, y, color, size) {
    this.ctx.fillStyle = color || PALETTE.WHITE;
    this.ctx.font = (size || 8) + 'px monospace';
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));
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
