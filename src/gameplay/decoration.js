// Scenic decoration for the game board - reed wall (top) and lily pad edge (bottom)
// Row 0 = reed wall under HUD, Row 13 = lily pad border at bottom
// Architect waves (every 10th) get cityscape + highway fence instead
const Decoration = {
  reeds: [],
  lilyPads: [],
  buildings: [],

  init() {
    this._generateReeds();
    this._generateLilyPads();
    this._generateCityscape();
  },

  // Generate reed data — slightly less dense, brown+green, varied heights, some angled
  // Approved: v4 Option C — spacing ~3-4px, 2px water strip at bottom
  _generateReeds() {
    this.reeds = [];
    let seed = 42;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };

    let x = 1;
    while (x < 255) {
      const h = 6 + Math.floor(rand() * 9); // 6-14px tall
      const isBrown = rand() < 0.4; // 40% brown, 60% green
      let angle = 0;
      const aRoll = rand();
      if (aRoll < 0.15) angle = -1;
      else if (aRoll < 0.30) angle = 1;

      this.reeds.push({ x, h, isBrown, angle });

      // Spacing: 3 + 0-1 jitter
      x += 3 + Math.floor(rand() * 2);
    }
  },

  // Generate lily pad layout — repeating 32px pattern: 1 sheared heart + 2 small ovals
  // Approved: v5 Option A — sheared hearts + normal ovals, diagonal layout
  _generateLilyPads() {
    this.lilyPads = [];
    for (let u = 0; u < 8; u++) {
      const bx = u * 32;
      const isEven = u % 2 === 0;

      // Sheared heart in left tile
      this.lilyPads.push({
        type: 'heart',
        x: bx + 2,
        y: 224 + 4 + (isEven ? -1 : 1),
      });

      // Upper-left oval in right tile
      this.lilyPads.push({
        type: 'oval',
        x: bx + 16 + 2,
        y: 224 + 1 + (isEven ? 0 : 1),
      });

      // Lower-right oval — nudged up 1px on even patterns
      this.lilyPads.push({
        type: 'oval',
        x: bx + 16 + 8,
        y: 224 + 9 + (isEven ? -1 : 0),
      });
    }
  },

  // Draw reeds (behind game tiles, in row 0 area)
  // Architect waves draw cityscape silhouette instead
  drawReeds() {
    if (Waves.isArchitectWave) {
      this._drawCityscape();
      return;
    }

    // Dynamic sky background for reed row (blue daytime, dark nighttime)
    const reedBg = Waves.skyDarkColor || '#080b12';
    Renderer.fillRect(0, 16, SCREEN_WIDTH, 14, reedBg);

    // 2px water strip at bottom of reed row (y=30-31) — lighter blue in daytime
    const waterBg = Waves.waterColor || PALETTE.WATER_BG;
    Renderer.fillRect(0, 30, SCREEN_WIDTH, 2, waterBg);

    // Draw twinkling stars in reed area during nighttime (behind reeds)
    if (Waves.isNighttime && Waves.stars.length > 0) {
      const now = performance.now();
      for (const star of Waves.stars) {
        // Stars in reed area only (y 16-29)
        if (star.y >= 16 && star.y < 30) {
          if (!star.twinkle || Math.floor(now / 500) % 2 === 0) {
            Renderer.fillRect(star.x, star.y, 1, 1, PALETTE.WHITE);
          }
        }
      }
    }

    // Draw each reed — base at y=29 (above water strip), grows upward
    for (const reed of this.reeds) {
      this._drawReed(reed.x, 29, reed.h, reed.isBrown, reed.angle);
    }
  },

  // Draw lily pad edge (row 13, below game tiles)
  // Architect waves draw highway fence instead
  drawLilyPads() {
    if (Waves.isArchitectWave) {
      this._drawHighwayFence();
      return;
    }

    // Water background behind lily pads — changes with day/night
    const lilyWaterBg = Waves.waterColor || PALETTE.WATER_BG;
    Renderer.fillRect(0, 224, SCREEN_WIDTH, 16, lilyWaterBg);

    for (const pad of this.lilyPads) {
      if (pad.type === 'heart') {
        this._drawShearedHeart(pad.x, pad.y);
      } else {
        this._drawSmallOval(pad.x, pad.y);
      }
    }
  },

  // Full draw call (both layers)
  draw() {
    this.drawReeds();
    this.drawLilyPads();
  },

  // Generate cityscape building data for architect waves
  _generateCityscape() {
    this.buildings = [];
    let seed = 137;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };

    let x = 0;
    while (x < 256) {
      const w = 3 + Math.floor(rand() * 6); // 3-8px wide
      const h = 6 + Math.floor(rand() * 9); // 6-14px tall
      const hasAntenna = rand() < 0.25;
      const windows = [];
      // Generate random window positions
      for (let wy = 2; wy < h - 1; wy += 3) {
        for (let wx = 1; wx < w - 1; wx += 2) {
          if (rand() < 0.4) { // 40% chance of lit window
            windows.push({ x: wx, y: wy });
          }
        }
      }
      this.buildings.push({ x, w, h, hasAntenna, windows });
      x += w + 1; // 1px gap between buildings
    }
  },

  // Draw cityscape silhouette (replaces reeds for architect waves)
  _drawCityscape() {
    // Dark purple dusk background
    Renderer.fillRect(0, 16, SCREEN_WIDTH, 14, '#2a1a3a');
    // Dark road/canal at bottom
    Renderer.fillRect(0, 30, SCREEN_WIDTH, 2, '#1a1a2a');

    for (const b of this.buildings) {
      const baseY = 29; // Same as reed base
      const topY = baseY - b.h + 1;
      // Building body
      Renderer.fillRect(b.x, topY, b.w, b.h, '#2a2a3a');
      // Building edge highlight (left side)
      Renderer.fillRect(b.x, topY, 1, b.h, '#353545');
      // Antenna
      if (b.hasAntenna) {
        const ax = b.x + Math.floor(b.w / 2);
        Renderer.fillRect(ax, topY - 2, 1, 2, '#505060');
      }
      // Lit windows
      for (const win of b.windows) {
        Renderer.fillRect(b.x + win.x, topY + win.y, 1, 1, '#ffd700');
      }
    }
  },

  // Draw highway fence (replaces lily pads for architect waves)
  _drawHighwayFence() {
    // Asphalt background
    Renderer.fillRect(0, 224, SCREEN_WIDTH, 16, '#1a1a2a');
    // Road markings (dashed center line)
    for (let x = 2; x < 256; x += 12) {
      Renderer.fillRect(x, 231, 6, 1, '#555555');
    }
    // Fence posts every 16px
    for (let x = 0; x < 256; x += 16) {
      // Vertical post
      Renderer.fillRect(x + 2, 225, 1, 10, '#808080');
      // Post cap
      Renderer.fillRect(x + 1, 224, 3, 1, '#909090');
    }
    // Horizontal rails
    Renderer.fillRect(0, 227, SCREEN_WIDTH, 1, '#606060');
    Renderer.fillRect(0, 232, SCREEN_WIDTH, 1, '#606060');
    // Chain-link pattern (diagonal lines between posts)
    for (let x = 0; x < 256; x += 16) {
      for (let i = 0; i < 12; i += 2) {
        // Diagonal down-right
        const px = x + 3 + i;
        const py1 = 228 + Math.floor(i / 3);
        if (px < 256) Renderer.fillRect(px, py1, 1, 1, '#505050');
        // Diagonal up-right
        const py2 = 231 - Math.floor(i / 3);
        if (px < 256) Renderer.fillRect(px, py2, 1, 1, '#505050');
      }
    }
  },

  // Draw a single reed stem, growing upward from baseY
  _drawReed(baseX, baseY, height, isBrown, angle) {
    const color = isBrown ? PALETTE.REED_BROWN : PALETTE.REED_GREEN;
    const topY = baseY - height + 1;

    for (let i = 0; i < height; i++) {
      let xOff = 0;
      if (angle !== 0) {
        xOff = Math.floor(i / 4) * angle;
      }
      Renderer.fillRect(baseX + xOff, topY + i, 1, 1, color);
    }
  },

  // Sheared heart lily pad (12x7) — top shifts left 1, bottom rows shift right 1-2
  // Per-row x offsets for shear effect (false perspective)
  _heartShearOffsets: [-1, 0, 0, 0, 0, 1, 2],
  _heartShape: [
    [0,0,0,1,1,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0],
  ],

  _drawShearedHeart(ox, oy) {
    const shape = this._heartShape;
    const offsets = this._heartShearOffsets;
    const color = PALETTE.GREEN_DARK;
    const hi = PALETTE.GREEN_MID;

    for (let r = 0; r < shape.length; r++) {
      const xo = offsets[r];
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          Renderer.fillRect(ox + c + xo, oy + r, 1, 1, color);
        }
      }
    }
    // Highlight on left edge
    Renderer.fillRect(ox + 2 + offsets[1], oy + 1, 1, 1, hi);
    Renderer.fillRect(ox + 1 + offsets[2], oy + 2, 1, 1, hi);
    Renderer.fillRect(ox + 1 + offsets[3], oy + 3, 1, 1, hi);
  },

  // Small oval lily pad (6x4)
  _ovalShape: [
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [1,1,1,1,1,1],
    [0,1,1,1,1,0],
  ],

  _drawSmallOval(ox, oy) {
    const shape = this._ovalShape;
    const color = PALETTE.GREEN_DARK;
    const hi = PALETTE.GREEN_MID;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          Renderer.fillRect(ox + c, oy + r, 1, 1, color);
        }
      }
    }
    // Highlight
    Renderer.fillRect(ox + 1, oy + 1, 1, 1, hi);
  },
};
