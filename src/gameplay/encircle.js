// Encirclement detection - Qix/Amidar style flood-fill
// When green tiles form a closed boundary, the enclosed region fills green.
// Any enemies inside the filled region are captured.
const Encircle = {
  flashTiles: [], // Array of {col, row, timer}
  bonusPopups: [], // Array of {text, x, y, timer, alpha}
  lastFillTime: 0, // Timestamp of last fill for combo tracking
  fillComboMultiplier: 1, // Current combo multiplier
  pendingFill: null, // {queue: [], index: 0, enemies: [], score: 0, tileCount: 0} for gradual fill
  dyingEnemies: [], // Array of {enemy, spinTimer, scorePopupTimer}

  // Check for enclosed regions and fill them
  checkAll() {
    // Don't check while a fill is in progress
    if (this.pendingFill) return;
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
    // Check for combo (fill within 2 seconds of last fill)
    const now = performance.now();
    if (now - this.lastFillTime <= 2000 && this.lastFillTime > 0) {
      this.fillComboMultiplier++;
    } else {
      this.fillComboMultiplier = 1;
    }
    this.lastFillTime = now;

    // Find enemies in region
    const enemiesInRegion = [];
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      for (const tile of region) {
        if (enemy.col === tile.col && enemy.row === tile.row) {
          // Zombies survive encirclement!
          if (enemy.type !== 'zombie') {
            enemiesInRegion.push(enemy);
          }
          break;
        }
      }
    }

    // Start gradual fill
    this.pendingFill = {
      queue: [...region],
      index: 0,
      enemies: enemiesInRegion,
      tileCount: 0
    };

    // Play appropriate fill sound based on size
    if (region.length <= 5) {
      Audio.sfxFillSmall();
    } else if (region.length <= 15) {
      Audio.sfxFillMedium();
    } else if (region.length <= 30) {
      Audio.sfxFillLarge();
    } else {
      Audio.sfxFillHuge();
    }
  },

  // Update flash timers and bonus popups
  update(dt) {
    // Update gradual fill
    if (this.pendingFill) {
      const fill = this.pendingFill;
      // Fill 2-3 tiles per frame at 60fps (about 120-180 tiles/sec)
      const tilesToFill = 3;

      for (let i = 0; i < tilesToFill && fill.index < fill.queue.length; i++) {
        const tile = fill.queue[fill.index];

        // Only fill if not already green
        if (Grid.get(tile.col, tile.row) !== TILE_GREEN) {
          Grid.set(tile.col, tile.row, TILE_GREEN);

          // Flash effect
          this.flashTiles.push({ col: tile.col, row: tile.row, timer: 300 });

          // Count tiles (scoring happens at end)
          fill.tileCount++;
        }

        fill.index++;
      }

      // If fill is complete, handle scoring in order
      if (fill.index >= fill.queue.length) {
        // Calculate center of filled region
        let centerCol = 0, centerRow = 0;
        for (const tile of fill.queue) {
          centerCol += tile.col;
          centerRow += tile.row;
        }
        centerCol = Math.floor(centerCol / fill.queue.length);
        centerRow = Math.floor(centerRow / fill.queue.length);
        const centerX = centerCol * TILE_SIZE + TILE_SIZE / 2;
        const centerY = (centerRow + 1) * TILE_SIZE + TILE_SIZE / 2;

        // 1. Kill enemies with death animations + score per enemy
        for (const enemy of fill.enemies) {
          enemy.alive = false;
          this.dyingEnemies.push({
            enemy: enemy,
            spinTimer: 500,
            scorePopupTimer: 500,
            col: enemy.col,
            row: enemy.row
          });
        }

        // 2. ONE total fill bonus based on tile count
        const fillBonus = fill.tileCount * 2 * this.fillComboMultiplier;
        Player.addScore(fillBonus);
        let popupText = '+' + fillBonus;
        if (this.fillComboMultiplier > 1) {
          popupText += ' x' + this.fillComboMultiplier;
        }
        this.bonusPopups.push({
          text: popupText,
          x: centerX,
          y: centerY,
          timer: 1200,
          alpha: 1.0
        });

        // 3. Check for 100% fill → PERFECT
        const fillPercent = Grid.fillPercent(TILE_GREEN);
        if (fillPercent >= 1.0) {
          Player.addScore(5000);
          if (Audio.sfxPerfect) Audio.sfxPerfect();
          this.bonusPopups.push({
            text: 'PERFECT!',
            x: centerX,
            y: centerY - 16,
            timer: 1500,
            alpha: 1.0
          });
        }

        this.pendingFill = null;
      }
    }

    // Update dying enemies
    for (let i = this.dyingEnemies.length - 1; i >= 0; i--) {
      const dying = this.dyingEnemies[i];
      dying.spinTimer -= dt;
      dying.scorePopupTimer -= dt;

      // Show score popup when timer runs out
      if (dying.scorePopupTimer <= 0 && dying.scorePopupTimer > -10) {
        const scoreValue = dying.enemy.type === 'red' ? 200 :
                          dying.enemy.type === 'purple' ? 500 :
                          dying.enemy.type === 'blue' ? 800 : 100;
        Player.addScore(scoreValue);

        const x = dying.col * TILE_SIZE + TILE_SIZE / 2;
        const y = (dying.row + 1) * TILE_SIZE + TILE_SIZE / 2;
        this.bonusPopups.push({
          text: '+' + scoreValue,
          x: x,
          y: y,
          timer: 1000,
          alpha: 1.0
        });
        dying.scorePopupTimer = -100; // Mark as done
      }

      if (dying.spinTimer <= 0) {
        this.dyingEnemies.splice(i, 1);
      }
    }

    // Update flash timers
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
    // Draw dying enemies with spin animation
    for (const dying of this.dyingEnemies) {
      const x = dying.col * TILE_SIZE;
      const y = (dying.row + 1) * TILE_SIZE;

      // Rapid sprite swap to simulate spinning
      const isHopping = Math.floor(dying.spinTimer / 50) % 2 === 0;
      const sprite = Sprites.getSprite(dying.enemy.type, isHopping);

      // White flash overlay
      if (dying.spinTimer > 450) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.8)');
      } else if (dying.spinTimer > 400) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.4)');
      }

      Renderer.drawSprite(sprite, x, y);
    }

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
