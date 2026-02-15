// Encirclement detection - Qix/Amidar style flood-fill
// When green tiles form a closed boundary, the enclosed region fills green.
// Any enemies inside the filled region are captured.
const Encircle = {
  flashTiles: [], // Array of {col, row, timer}
  bonusPopups: [], // Array of {text, x, y, timer, alpha}
  lastFillTime: 0, // Timestamp of last fill for combo tracking
  fillComboMultiplier: 1, // Current combo multiplier

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

    // Progressive scoring based on region size
    let pointsPerTile = 2;
    if (region.length >= 6 && region.length <= 15) {
      pointsPerTile = 5;
    } else if (region.length >= 16 && region.length <= 30) {
      pointsPerTile = 10;
    } else if (region.length >= 31) {
      pointsPerTile = 20;
    }

    // Check for combo (fill within 2 seconds of last fill)
    const now = performance.now();
    if (now - this.lastFillTime <= 2000 && this.lastFillTime > 0) {
      this.fillComboMultiplier++;
    } else {
      this.fillComboMultiplier = 1;
    }
    this.lastFillTime = now;

    // Calculate base fill score
    let fillScore = region.length * pointsPerTile * this.fillComboMultiplier;

    // Check if any enemies were inside this region
    let enemiesCaptured = 0;
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      for (const tile of region) {
        if (enemy.col === tile.col && enemy.row === tile.row) {
          enemy.alive = false;
          enemiesCaptured++;
          break;
        }
      }
    }
    Enemies.cleanup();

    // Enemy capture bonus scales with region size
    if (enemiesCaptured > 0) {
      const captureBonus = enemiesCaptured * (100 + region.length * 10);
      fillScore += captureBonus;
      Audio.sfxCapture();
    }

    // Award points
    Player.addScore(fillScore);

    // Calculate center of filled region for popup placement
    let centerCol = 0;
    let centerRow = 0;
    for (const tile of region) {
      centerCol += tile.col;
      centerRow += tile.row;
    }
    centerCol = Math.floor(centerCol / region.length);
    centerRow = Math.floor(centerRow / region.length);
    const centerX = centerCol * TILE_SIZE + TILE_SIZE / 2;
    const centerY = (centerRow + 1) * TILE_SIZE + TILE_SIZE / 2;

    // Create bonus popup
    let popupText = '+' + fillScore;
    if (this.fillComboMultiplier > 1) {
      popupText += ' x' + this.fillComboMultiplier;
    }
    this.bonusPopups.push({
      text: popupText,
      x: centerX,
      y: centerY,
      timer: 1000,
      alpha: 1.0
    });

    // Check for 100% fill
    const fillPercent = Grid.fillPercent(TILE_GREEN);
    if (fillPercent >= 1.0) {
      Player.addScore(5000);
      // Play special sound (will need to be implemented by Audio V5)
      if (Audio.sfxPerfect) {
        Audio.sfxPerfect();
      }
      // Add PERFECT popup slightly above the fill popup
      this.bonusPopups.push({
        text: 'PERFECT!',
        x: centerX,
        y: centerY - 20,
        timer: 1500,
        alpha: 1.0
      });
    }
  },

  // Update flash timers and bonus popups
  update(dt) {
    for (let i = this.flashTiles.length - 1; i >= 0; i--) {
      this.flashTiles[i].timer -= dt;
      if (this.flashTiles[i].timer <= 0) {
        this.flashTiles.splice(i, 1);
      }
    }

    // Update bonus popups
    for (let i = this.bonusPopups.length - 1; i >= 0; i--) {
      const popup = this.bonusPopups[i];
      popup.timer -= dt;
      popup.y -= dt * 0.03; // Float upward at 30 pixels per second
      popup.alpha = popup.timer / 1000; // Fade out over time
      if (popup.timer <= 0) {
        this.bonusPopups.splice(i, 1);
      }
    }
  },

  // Draw flash overlays and bonus popups
  draw() {
    for (const flash of this.flashTiles) {
      const x = flash.col * TILE_SIZE;
      const y = (flash.row + 1) * TILE_SIZE;
      if (Math.floor(flash.timer / 60) % 2) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.5)');
      }
    }

    // Draw bonus popups with alpha
    for (const popup of this.bonusPopups) {
      const ctx = Renderer.ctx;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, popup.alpha));
      const color = popup.text.includes('PERFECT') ? PALETTE.GREEN_LIGHT : PALETTE.SCORE_COLOR;
      Renderer.drawText(popup.text, popup.x - popup.text.length * 3, popup.y, color, 8);
      ctx.restore();
    }
  },
};
