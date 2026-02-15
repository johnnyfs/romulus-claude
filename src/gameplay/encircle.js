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

  // Draw flash overlays and encirclement indicators
  draw() {
    // Flash effects
    for (const flash of this.flashTiles) {
      const x = flash.col * TILE_SIZE;
      const y = (flash.row + 1) * TILE_SIZE;
      if (Math.floor(flash.timer / 50) % 2) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.5)');
      }
    }

    // Show encirclement progress: small green/gray dots on each side of enemy
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      for (let d = 0; d < 4; d++) {
        const nc = enemy.col + DIR_DX[d];
        const nr = enemy.row + DIR_DY[d];
        const isGreen = !Grid.inBounds(nc, nr) || Grid.get(nc, nr) === TILE_GREEN;
        // Draw small indicator dot on the edge toward that neighbor
        const ex = enemy.col * TILE_SIZE + 7 + DIR_DX[d] * 6;
        const ey = (enemy.row + 1) * TILE_SIZE + 7 + DIR_DY[d] * 6;
        Renderer.fillRect(ex, ey, 2, 2, isGreen ? PALETTE.GREEN : PALETTE.NEUTRAL);
      }
    }
  },

  // Check if a position is fully encircled by green tiles
  // An enemy is encircled when all 4 orthogonal neighbors are green.
  // The tile the enemy is standing on does NOT need to be green (it's their color).
  isEncircled(col, row) {
    let greenCount = 0;
    let checkCount = 0;
    for (let d = 0; d < 4; d++) {
      const nc = col + DIR_DX[d];
      const nr = row + DIR_DY[d];
      if (!Grid.inBounds(nc, nr)) {
        // Wall/edge counts as encircled
        greenCount++;
        checkCount++;
        continue;
      }
      checkCount++;
      if (Grid.get(nc, nr) === TILE_GREEN) {
        greenCount++;
      }
    }
    return greenCount === checkCount && checkCount > 0;
  },
};
