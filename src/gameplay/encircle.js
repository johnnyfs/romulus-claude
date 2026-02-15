// Encirclement detection - Qix/Amidar style flood-fill
// When green tiles form a closed boundary, the enclosed region fills green.
// Any enemies inside the filled region are captured.
const Encircle = {
  flashTiles: [], // Array of {col, row, timer}

  // Check for enclosed regions and fill them
  checkAll() {
    // Strategy: flood-fill from every non-green tile.
    // If a flood-fill region can reach the grid edge without crossing green,
    // it's NOT enclosed. If it CAN'T reach the edge, it IS enclosed — fill it.
    const visited = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      visited[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        visited[r][c] = false;
      }
    }

    // For each unvisited non-green tile, flood fill to find its region
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (visited[r][c]) continue;
        if (Grid.get(c, r) === TILE_GREEN) {
          visited[r][c] = true;
          continue;
        }

        // Flood fill from this tile — collect the region
        const region = [];
        let touchesEdge = false;
        const stack = [{ col: c, row: r }];

        while (stack.length > 0) {
          const { col: cx, row: ry } = stack.pop();
          if (cx < 0 || cx >= GRID_COLS || ry < 0 || ry >= GRID_ROWS) {
            touchesEdge = true;
            continue;
          }
          if (visited[ry][cx]) continue;
          if (Grid.get(cx, ry) === TILE_GREEN) continue; // green is boundary

          visited[ry][cx] = true;
          region.push({ col: cx, row: ry });

          // Check if on edge
          if (cx === 0 || cx === GRID_COLS - 1 || ry === 0 || ry === GRID_ROWS - 1) {
            touchesEdge = true;
          }

          // Expand to 4 neighbors
          stack.push({ col: cx + 1, row: ry });
          stack.push({ col: cx - 1, row: ry });
          stack.push({ col: cx, row: ry + 1 });
          stack.push({ col: cx, row: ry - 1 });
        }

        // If this region doesn't touch the edge, it's enclosed!
        if (!touchesEdge && region.length > 0) {
          this._fillRegion(region);
        }
      }
    }
  },

  // Fill an enclosed region with green and capture any enemies inside
  _fillRegion(region) {
    // Add flash effect for tiles being converted
    for (const tile of region) {
      if (Grid.get(tile.col, tile.row) !== TILE_GREEN) {
        this.flashTiles.push({ col: tile.col, row: tile.row, timer: 400 });
      }
    }

    // Fill all tiles in region to green
    for (const tile of region) {
      Grid.set(tile.col, tile.row, TILE_GREEN);
    }

    // Check if any enemies were inside this region
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      for (const tile of region) {
        if (enemy.col === tile.col && enemy.row === tile.row) {
          enemy.alive = false;
          Player.addScore(100 + region.length * 5);
          Audio.sfxCapture();
          break;
        }
      }
    }
    Enemies.cleanup();

    // Score for filling the region
    Player.addScore(region.length * 2);
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
      if (Math.floor(flash.timer / 60) % 2) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.5)');
      }
    }
  },
};
