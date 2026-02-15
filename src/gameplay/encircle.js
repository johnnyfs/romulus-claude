// Encirclement detection - the core capture mechanic
// A frog is captured when all 4 orthogonal neighbors are TILE_GREEN
const Encircle = {

  // Check all enemies for encirclement
  checkAll() {
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      if (this.isEncircled(enemy.col, enemy.row)) {
        Enemies.capture(enemy);
      }
    }
    Enemies.cleanup();
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
