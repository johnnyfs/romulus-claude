// Grid state management - the 16x14 tile grid
const Grid = {
  tiles: [],

  init() {
    this.tiles = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.tiles[r][c] = TILE_NEUTRAL;
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

  // Get fill percentage for a state (excludes hazard tiles from total)
  fillPercent(state) {
    const hazardCount = this.count(TILE_SPIKE) + this.count(TILE_WATER);
    const total = GRID_COLS * GRID_ROWS - hazardCount;
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

  // Draw the entire grid using pad-shaped tiles
  draw() {
    const shape = Renderer.padTileShape;
    const pw = 15, ph = 14;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const state = this.tiles[r][c];
        const color = TILE_COLORS[state] || PALETTE.NEUTRAL;
        Renderer.drawTile(c, r, color);

        const baseX = c * TILE_SIZE;
        const baseY = (r + 1) * TILE_SIZE;
        const ox = baseX + Math.floor((TILE_SIZE - pw) / 2);
        const oy = baseY + Math.floor((TILE_SIZE - ph) / 2);

        // Draw accent highlight on claimed tiles (top edge + left edge following pad curve)
        if (state !== TILE_NEUTRAL && TILE_ACCENT_COLORS[state]) {
          const accent = TILE_ACCENT_COLORS[state];
          // Top row highlight (following pad shape)
          for (let pc = 0; pc < pw; pc++) {
            if (shape[0][pc]) Renderer.fillRect(ox + pc, oy, 1, 1, accent);
          }
          // Left edge highlight rows 1-4 (first filled pixel per row)
          for (let pr = 1; pr < Math.min(5, ph); pr++) {
            for (let pc = 0; pc < pw; pc++) {
              if (shape[pr][pc]) {
                Renderer.fillRect(ox + pc, oy + pr, 1, 1, accent);
                break;
              }
            }
          }
        } else if (state === TILE_NEUTRAL) {
          // Subtle highlight on neutral tiles for dimension
          for (let pc = 0; pc < pw; pc++) {
            if (shape[0][pc]) Renderer.fillRect(ox + pc, oy, 1, 1, PALETTE.NEUTRAL_HI);
          }
          for (let pr = 1; pr < 3; pr++) {
            for (let pc = 0; pc < pw; pc++) {
              if (shape[pr] && shape[pr][pc]) {
                Renderer.fillRect(ox + pc, oy + pr, 1, 1, PALETTE.NEUTRAL_HI);
                break;
              }
            }
          }
        }
      }
    }
  },
};
