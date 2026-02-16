// Grid state management - the 16x14 tile grid
const Grid = {
  tiles: [],
  fatalTimers: [],
  fatalDuration: 0, // Set by waves.js each wave

  init() {
    this.tiles = [];
    this.fatalTimers = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.tiles[r] = [];
      this.fatalTimers[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.tiles[r][c] = TILE_NEUTRAL;
        this.fatalTimers[r][c] = 0;
      }
    }
  },

  // Reset only enemy/hazard tiles to neutral, keeping green tiles intact
  resetEnemyTiles() {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const tile = this.tiles[r][c];
        if (tile !== TILE_GREEN && tile !== TILE_NEUTRAL && tile !== TILE_WATER) {
          this.tiles[r][c] = TILE_NEUTRAL;
        }
        this.fatalTimers[r][c] = 0;
      }
    }
  },

  // Get tile state at grid position
  get(col, row) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return -1;
    return this.tiles[row][col];
  },

  // Set tile state
  set(col, row, state) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
    this.tiles[row][col] = state;
  },

  // Check if position is valid
  inBounds(col, row) {
    return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
  },

  // Set a tile as fatal with a countdown
  setFatal(col, row, duration) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
    this.fatalTimers[row][col] = duration;
  },

  // Check if a tile is currently fatal
  isFatal(col, row) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
    return this.fatalTimers[row][col] > 0;
  },

  // Tick all fatal timers
  updateFatalTimers(dt) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.fatalTimers[r][c] > 0) {
          this.fatalTimers[r][c] = Math.max(0, this.fatalTimers[r][c] - dt);
        }
      }
    }
  },

  // Count tiles of a specific state
  count(state) {
    let n = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.tiles[r][c] === state) n++;
      }
    }
    return n;
  },

  // Get fill percentage for a state (only excludes water from total)
  // Spike tiles, enemy tiles, etc. all count as "unfilled" in the denominator
  // so they prevent a perfect score
  fillPercent(state) {
    const waterCount = this.count(TILE_WATER);
    const total = GRID_COLS * GRID_ROWS - waterCount;
    return this.count(state) / total;
  },

  // Convert all tiles of one state to another
  convertAll(fromState, toState) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.tiles[r][c] === fromState) {
          this.tiles[r][c] = toState;
        }
      }
    }
  },

  // Draw the entire grid
  draw() {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const state = this.tiles[r][c];
        let color = TILE_COLORS[state] || PALETTE.NEUTRAL;

        // Fatal tile rendering
        const fatalTime = this.fatalTimers[r][c];
        if (fatalTime > 0 && TILE_FATAL_COLORS[state]) {
          if (fatalTime > TILE_FATAL_FLICKER_DURATION) {
            // Solid bright color
            color = TILE_FATAL_COLORS[state];
          } else {
            // Flickering phase: alternate every 50ms
            const flickerOn = Math.floor(fatalTime / 50) % 2 === 0;
            color = flickerOn ? TILE_FATAL_COLORS[state] : (TILE_COLORS[state] || PALETTE.NEUTRAL);
          }
        }

        Renderer.drawTile(c, r, color);

        // Draw accent border on claimed tiles (only if not fatal — fatal tiles use full bright color)
        if (state !== TILE_NEUTRAL && TILE_ACCENT_COLORS[state] && fatalTime <= 0) {
          const x = c * TILE_SIZE;
          const y = (r + GRID_OFFSET_Y) * TILE_SIZE;
          Renderer.fillRect(x + 1, y + 1, TILE_SIZE - 2, 1, TILE_ACCENT_COLORS[state]);
          Renderer.fillRect(x + 1, y + 1, 1, TILE_SIZE - 2, TILE_ACCENT_COLORS[state]);
        }
      }
    }
  },
};
