// Scenic decoration for the game board - lily pads and reeds
const Decoration = {
  lilyPads: [],
  reeds: [],

  init() {
    // Define lily pad positions along the bottom edge
    // Bottom row of grid is row 13, starts at y = 14 * 16 = 224
    // Lily pads are ~12x8 pixels, placed behind tiles
    this.lilyPads = [
      { x: 20, y: 228 },   // Bottom left area
      { x: 72, y: 230 },   // Left-center
      { x: 140, y: 229 },  // Right-center
      { x: 210, y: 227 },  // Bottom right area
    ];

    // Define reed positions along the top edge, below HUD
    // HUD is 16px tall, so reeds start around y = 16-18
    // Reeds are thin vertical lines, 1-2px wide, 8-12px tall
    this.reeds = [
      { x: 24, y: 17, height: 10 },
      { x: 56, y: 19, height: 8 },
      { x: 88, y: 16, height: 12 },
      { x: 128, y: 18, height: 9 },
      { x: 168, y: 17, height: 11 },
      { x: 200, y: 19, height: 8 },
      { x: 232, y: 16, height: 10 },
    ];
  },

  draw() {
    // Draw water hint in the background (bottom 2 rows)
    // Bottom 2 rows: y = 208 to 240 (rows 12-13, but drawn as pixel bg)
    Renderer.fillRect(0, 208, SCREEN_WIDTH, 32, PALETTE.WATER_DARK);

    // Draw lily pads
    for (const pad of this.lilyPads) {
      this._drawLilyPad(pad.x, pad.y);
    }

    // Draw reeds
    for (const reed of this.reeds) {
      this._drawReed(reed.x, reed.y, reed.height);
    }
  },

  _drawLilyPad(x, y) {
    // Draw a simple lily pad: dark green oval with notch
    // 12x8 pixel oval with a small triangular notch
    const color = PALETTE.GREEN_DARK;
    const highlight = PALETTE.GREEN_MID;

    // Oval shape (simplified pixel art)
    // Row by row drawing for oval effect
    Renderer.fillRect(x + 3, y, 6, 1, color);     // top (narrow)
    Renderer.fillRect(x + 2, y + 1, 8, 1, color); // wider
    Renderer.fillRect(x + 1, y + 2, 10, 1, color); // widest
    Renderer.fillRect(x + 1, y + 3, 10, 1, color); // widest
    Renderer.fillRect(x + 1, y + 4, 10, 1, color); // widest
    Renderer.fillRect(x + 2, y + 5, 8, 1, color); // narrower
    Renderer.fillRect(x + 3, y + 6, 6, 1, color); // bottom (narrow)

    // Add notch (small triangular cut on right side)
    Renderer.fillRect(x + 10, y + 3, 1, 1, PALETTE.WATER_DARK);
    Renderer.fillRect(x + 10, y + 4, 1, 1, PALETTE.WATER_DARK);

    // Add subtle highlight on left edge for dimension
    Renderer.fillRect(x + 2, y + 2, 1, 1, highlight);
    Renderer.fillRect(x + 1, y + 3, 1, 1, highlight);
  },

  _drawReed(x, y, height) {
    // Draw a thin reed: 1-2px wide vertical line with oval tip
    const stemColor = '#1a3d2e';  // dark green-brown
    const tipColor = '#4a2810';   // dark brown

    // Stem (thin vertical line, 1px wide)
    Renderer.fillRect(x, y, 1, height - 3, stemColor);

    // Cattail tip (small oval, 2-3px tall)
    Renderer.fillRect(x - 1, y, 3, 1, tipColor);
    Renderer.fillRect(x - 1, y + 1, 3, 1, tipColor);
    Renderer.fillRect(x, y + 2, 1, 1, tipColor);
  },
};
