// Encirclement detection - the core capture mechanic
// A frog is captured when all 4 orthogonal neighbors are TILE_GREEN
const Encircle = {
  flashTiles: [], // Array of {col, row, timer}

  // Check all enemies for encirclement
  checkAll() {
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      if (this.isEncircled(enemy.col, enemy.row)) {
        // Add flash effect for converted tiles
        this.addFlashEffect(enemy.tileState);
        Enemies.capture(enemy);
      }
    }
    Enemies.cleanup();
  },

  // Add flash effect for all tiles of a given state that will be converted
  addFlashEffect(tileState) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (Grid.get(c, r) === tileState) {
          this.flashTiles.push({ col: c, row: r, timer: 300 }); // 300ms flash
        }
      }
    }
  },

  // Update flash timers
  update(dt) {
    for (let i = this.flashTiles.length - 1; i >= 0; i--) {
      this.flashTiles[i].timer -= dt;
      if (this.flashTiles[i].timer <= 0) {
        this.flashTiles.splice(i, 1);
      }
    }
  },

  // Draw flash overlays
  draw() {
    for (const flash of this.flashTiles) {
      const x = flash.col * TILE_SIZE;
      const y = (flash.row + 1) * TILE_SIZE;
      // Alternate white and transparent based on timer
      if (Math.floor(flash.timer / 50) % 2) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.5)');
      }
    }
  },

  // Check if a position is fully encircled by green tiles
  isEncircled(col, row) {
    // All 4 orthogonal neighbors must be green (or out of bounds counts as green)
    for (let d = 0; d < 4; d++) {
      const nc = col + DIR_DX[d];
      const nr = row + DIR_DY[d];
      if (!Grid.inBounds(nc, nr)) continue; // edges count as encircled
      if (Grid.get(nc, nr) !== TILE_GREEN) return false;
    }
    return true;
  },
};
