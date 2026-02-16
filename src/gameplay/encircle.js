// Encirclement detection - Qix/Amidar style flood-fill
// Sequential animation pipeline: fill -> kills (one at a time) -> bonus -> clear
// Also handles enemy (bad frog) encirclement detection (4A)
const Encircle = {
  flashTiles: [],
  bonusPopups: [],
  lastFillTime: 0,
  fillComboMultiplier: 1,

  // Animation pipeline state machine
  pipeline: null, // null = idle, or {stage, ...data}
  movementFrozen: false, // true = freeze player+enemies during pipeline
  // Stages: 'filling', 'killing', 'kill_wait', 'bonus', 'bonus_wait', 'done'

  checkAll() {
    if (this.pipeline) return; // Don't check during animation

    const visited = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      visited[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        visited[r][c] = false;
      }
    }

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (visited[r][c]) continue;
        if (Grid.get(c, r) === TILE_GREEN) { visited[r][c] = true; continue; }

        const region = [];
        let touchesEdge = false;
        const stack = [{ col: c, row: r }];

        while (stack.length > 0) {
          const { col: cx, row: ry } = stack.pop();
          if (cx < 0 || cx >= GRID_COLS || ry < 0 || ry >= GRID_ROWS) { touchesEdge = true; continue; }
          if (visited[ry][cx]) continue;
          if (Grid.get(cx, ry) === TILE_GREEN) continue;
          visited[ry][cx] = true;
          region.push({ col: cx, row: ry });
          if (cx === 0 || cx === GRID_COLS - 1 || ry === 0 || ry === GRID_ROWS - 1) touchesEdge = true;
          stack.push({ col: cx + 1, row: ry }, { col: cx - 1, row: ry }, { col: cx, row: ry + 1 }, { col: cx, row: ry - 1 });
        }

        if (!touchesEdge && region.length > 0) {
          this._startPipeline(region);
          return; // Only one fill at a time
        }
      }
    }
  },

  _startPipeline(region) {
    // Combo tracking
    const now = performance.now();
    if (now - this.lastFillTime <= 2000 && this.lastFillTime > 0) {
      this.fillComboMultiplier++;
    } else {
      this.fillComboMultiplier = 1;
    }
    this.lastFillTime = now;

    // Find enemies in the enclosed region (excluding zombies, snails).
    // Build a fast lookup set of region tiles, PLUS any green tiles that are
    // fully enclosed (an enemy on a green tile inside the ring should still die).
    const regionSet = new Set();
    for (const tile of region) {
      regionSet.add(tile.row * GRID_COLS + tile.col);
    }
    // Also add enclosed green tiles: any green tile where all 4 neighbors are
    // either in the region or also green-and-enclosed. Simpler: for each enemy,
    // check if their position can reach the grid edge without crossing green.
    const enemies = [];
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      if (enemy.type === 'snail') continue;     // Snails excluded

      // Check both destination and origin positions
      const positions = [{ c: enemy.col, r: enemy.row }];
      if (enemy.isHopping) {
        positions.push({ c: enemy.hopFromCol, r: enemy.hopFromRow });
      }

      let inRegion = false;
      for (const pos of positions) {
        // Fast path: position is directly in the non-green region
        if (regionSet.has(pos.r * GRID_COLS + pos.c)) {
          inRegion = true;
          break;
        }
        // Slow path: position might be on a green tile inside the enclosure.
        // Check if this position is enclosed by green (can't reach edge).
        if (Grid.get(pos.c, pos.r) === TILE_GREEN && regionSet.size > 0) {
          if (this._isEnclosedByGreen(pos.c, pos.r)) {
            inRegion = true;
            break;
          }
        }
      }
      if (inRegion) {
        enemies.push(enemy);
      }
    }

    // Play fill sound
    if (region.length <= 5) Audio.sfxFillSmall();
    else if (region.length <= 15) Audio.sfxFillMedium();
    else if (region.length <= 30) Audio.sfxFillLarge();
    else Audio.sfxFillHuge();

    this.movementFrozen = true; // Freeze movement when pipeline starts
    this.pipeline = {
      stage: 'filling',
      queue: [...region],
      index: 0,
      tileCount: 0,
      enemies: enemies,
      killIndex: 0,
      killTimer: 0,
      bonusTimer: 0,
    };
  },

  // Returns true if animating (caller should freeze movement)
  isAnimating() {
    return this.pipeline !== null;
  },

  update(dt) {
    if (this.pipeline) {
      const p = this.pipeline;

      switch (p.stage) {
        case 'filling':
          // Fill 3 tiles per frame
          for (let i = 0; i < 3 && p.index < p.queue.length; i++) {
            const tile = p.queue[p.index];
            if (Grid.get(tile.col, tile.row) !== TILE_GREEN) {
              Grid.set(tile.col, tile.row, TILE_GREEN);
              this.flashTiles.push({ col: tile.col, row: tile.row, timer: 200 });
              p.tileCount++;
            }
            p.index++;
          }
          if (p.index >= p.queue.length) {
            // Fill done — check if wave is cleared to decide freeze behavior
            // If wave NOT cleared, unfreeze movement so player can keep playing
            // while kill/bonus animations play out visually
            if (!Waves.checkWinCondition()) {
              this.movementFrozen = false;
            }
            // Move to kills or bonus
            if (p.enemies.length > 0) {
              p.stage = 'killing';
              p.killIndex = 0;
              p.killTimer = 600; // Time per kill animation
              // Start first kill
              const enemy = p.enemies[0];
              enemy.alive = false;
              // Mark for respawn (3C)
              Enemies.markKilledForRespawn(enemy.type);
              Audio.sfxCapture();
            } else {
              p.stage = 'bonus';
              p.bonusTimer = 800;
              this._showFillBonus(p);
            }
          }
          break;

        case 'killing':
          p.killTimer -= dt;
          if (p.killTimer <= 0) {
            // Show score for this kill - each subsequent kill worth more
            const enemy = p.enemies[p.killIndex];
            const baseScore = Enemies.getKillScore(enemy.type);
            const multiplier = p.killIndex + 1; // 1st=1x, 2nd=2x, 3rd=3x
            const killScore = baseScore * multiplier;
            Player.addScore(killScore);

            const x = enemy.col * TILE_SIZE + TILE_SIZE / 2;
            const y = (enemy.row + GRID_OFFSET_Y) * TILE_SIZE;
            let text = '+' + killScore;
            if (multiplier > 1) text += ' x' + multiplier;
            this.bonusPopups.push({ text, x, y, timer: 900, alpha: 1.0 });

            p.killIndex++;
            if (p.killIndex < p.enemies.length) {
              // Next kill
              p.killTimer = 700;
              p.stage = 'kill_wait';
            } else {
              // All kills done - show fill bonus
              p.stage = 'bonus_wait';
              p.bonusTimer = 500; // Brief pause before fill bonus
            }
          }
          break;

        case 'kill_wait':
          p.bonusTimer -= dt;
          // Wait for popup to mostly fade, then start next kill
          if (this.bonusPopups.length === 0 || p.bonusTimer <= -200) {
            const enemy = p.enemies[p.killIndex];
            enemy.alive = false;
            // Mark for respawn (3C)
            Enemies.markKilledForRespawn(enemy.type);
            Audio.sfxCapture();
            p.killTimer = 600;
            p.stage = 'killing';
            p.bonusTimer = 0;
          }
          break;

        case 'bonus_wait':
          p.bonusTimer -= dt;
          if (p.bonusTimer <= 0 && this.bonusPopups.length === 0) {
            p.stage = 'bonus';
            p.bonusTimer = 1000;
            this._showFillBonus(p);
          }
          break;

        case 'bonus':
          p.bonusTimer -= dt;
          if (p.bonusTimer <= 0 && this.bonusPopups.length === 0) {
            // Check for perfect
            if (Grid.fillPercent(TILE_GREEN) >= 1.0) {
              Player.addScore(5000);
              if (Audio.sfxPerfect) Audio.sfxPerfect();
              let cx = 0, cy = 0;
              for (const t of p.queue) { cx += t.col; cy += t.row; }
              cx = Math.floor(cx / p.queue.length) * TILE_SIZE + 8;
              cy = (Math.floor(cy / p.queue.length) + GRID_OFFSET_Y) * TILE_SIZE;
              this.bonusPopups.push({ text: 'PERFECT!', x: cx, y: cy, timer: 1500, alpha: 1.0 });
              p.stage = 'perfect_wait';
              p.bonusTimer = 1500;
            } else {
              // Done!
              Enemies.cleanup();
              this.pipeline = null;
            }
          }
          break;

        case 'perfect_wait':
          p.bonusTimer -= dt;
          if (p.bonusTimer <= 0 && this.bonusPopups.length === 0) {
            Enemies.cleanup();
            this.pipeline = null;
          }
          break;
      }
    }

    // Update flash timers
    for (let i = this.flashTiles.length - 1; i >= 0; i--) {
      this.flashTiles[i].timer -= dt;
      if (this.flashTiles[i].timer <= 0) this.flashTiles.splice(i, 1);
    }

    // Update bonus popups
    for (let i = this.bonusPopups.length - 1; i >= 0; i--) {
      const popup = this.bonusPopups[i];
      popup.timer -= dt;
      popup.y -= dt * 0.02;
      popup.alpha = Math.min(1, popup.timer / 800);
      if (popup.timer <= 0) this.bonusPopups.splice(i, 1);
    }
  },

  // Tiered fill score based on number of tiles cleared
  // Max possible is 135 (walk down from center, encircle entire field)
  calculateFillScore(tileCount) {
    // Perfect encirclement — extremely rare
    if (tileCount >= 135) return 5000;
    // Near-max: 124-134 = 3500 + 100 per tile over 124
    if (tileCount >= 124) return 3500 + 100 * (tileCount - 124);
    // Tiered formula
    if (tileCount >= 64) return 1500 + 50 * (tileCount - 64);
    if (tileCount >= 32) return 500 + 25 * (tileCount - 32);
    if (tileCount >= 16) return 100 + 10 * (tileCount - 16);
    if (tileCount >= 8) return 10 + 5 * (tileCount - 8);
    return tileCount; // <8 tiles: 1 point per tile
  },

  // Check for enemy encirclements (4A - bad frog fill)
  // Called from main.js after Enemies.update()
  // If enemy tiles form an enclosure, fill it and kill the player if inside
  checkEnemyEncirclement() {
    if (this.pipeline) return false; // Don't check during animation

    // Enemy tile colors that can encircle
    const enemyTileTypes = [TILE_RED, TILE_PURPLE, TILE_BLUE, TILE_SMART];

    for (const enemyTile of enemyTileTypes) {
      // Check if there are enough tiles of this color to form an enclosure
      if (Grid.count(enemyTile) < 4) continue;

      const visited = [];
      for (let r = 0; r < GRID_ROWS; r++) {
        visited[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
          visited[r][c] = false;
        }
      }

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (visited[r][c]) continue;
          if (Grid.get(c, r) === enemyTile) { visited[r][c] = true; continue; }

          // Flood fill from this non-enemy tile
          const region = [];
          let touchesEdge = false;
          let playerInRegion = false;
          const stack = [{ col: c, row: r }];

          while (stack.length > 0) {
            const { col: cx, row: ry } = stack.pop();
            if (cx < 0 || cx >= GRID_COLS || ry < 0 || ry >= GRID_ROWS) { touchesEdge = true; continue; }
            if (visited[ry][cx]) continue;
            if (Grid.get(cx, ry) === enemyTile) continue; // Boundary
            visited[ry][cx] = true;
            region.push({ col: cx, row: ry });
            if (cx === 0 || cx === GRID_COLS - 1 || ry === 0 || ry === GRID_ROWS - 1) touchesEdge = true;
            if (cx === Player.col && ry === Player.row) playerInRegion = true;
            stack.push(
              { col: cx + 1, row: ry },
              { col: cx - 1, row: ry },
              { col: cx, row: ry + 1 },
              { col: cx, row: ry - 1 }
            );
          }

          if (!touchesEdge && region.length > 0) {
            // Enemy encirclement detected! Fill region with enemy color
            for (const tile of region) {
              Grid.set(tile.col, tile.row, enemyTile);
            }

            if (Audio.sfxEnemyEncircle) Audio.sfxEnemyEncircle();

            // If player is inside the enclosed region, kill them
            if (playerInRegion && !Player.invincible) {
              Player.die();
              return true;
            }
            return true; // Signal that something happened (one at a time)
          }
        }
      }
    }
    return false;
  },

  // Check if a position is fully enclosed by green tiles (can't reach edge).
  // Works even if the starting position itself is green — checks neighbors.
  _isEnclosedByGreen(col, row) {
    // If on the edge of the grid, not enclosed
    if (col === 0 || col === GRID_COLS - 1 || row === 0 || row === GRID_ROWS - 1) return false;
    // Check all 4 neighbors — if any non-green neighbor can reach the edge, not enclosed
    const visited = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      visited[r] = [];
      for (let c = 0; c < GRID_COLS; c++) visited[r][c] = false;
    }
    // Mark starting position as visited so flood doesn't revisit it
    visited[row][col] = true;
    // Flood from each non-green neighbor
    for (let d = 0; d < 4; d++) {
      const nc = col + DIR_DX[d];
      const nr = row + DIR_DY[d];
      if (nc < 0 || nc >= GRID_COLS || nr < 0 || nr >= GRID_ROWS) return false;
      if (Grid.get(nc, nr) === TILE_GREEN) continue; // Green neighbor = boundary
      if (visited[nr][nc]) continue;
      // Flood fill from this non-green neighbor
      const stack = [{ c: nc, r: nr }];
      while (stack.length > 0) {
        const { c, r } = stack.pop();
        if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return false; // Reached edge
        if (visited[r][c]) continue;
        if (Grid.get(c, r) === TILE_GREEN) continue;
        visited[r][c] = true;
        stack.push({ c: c+1, r }, { c: c-1, r }, { c, r: r+1 }, { c, r: r-1 });
      }
    }
    return true; // All non-green neighbors are enclosed
  },

  _showFillBonus(p) {
    const baseScore = this.calculateFillScore(p.tileCount);
    const fillBonus = baseScore * this.fillComboMultiplier;
    Player.addScore(fillBonus);

    let cx = 0, cy = 0;
    for (const t of p.queue) { cx += t.col; cy += t.row; }
    cx = Math.floor(cx / p.queue.length) * TILE_SIZE + 8;
    cy = (Math.floor(cy / p.queue.length) + GRID_OFFSET_Y) * TILE_SIZE;

    let text = '+' + fillBonus;
    if (this.fillComboMultiplier > 1) text += ' x' + this.fillComboMultiplier;
    this.bonusPopups.push({ text, x: cx, y: cy, timer: 1000, alpha: 1.0 });
  },

  draw() {
    // Draw killing enemy (spinning) during kill stage
    if (this.pipeline && (this.pipeline.stage === 'killing' || this.pipeline.stage === 'kill_wait')) {
      const p = this.pipeline;
      const idx = Math.min(p.killIndex, p.enemies.length - 1);
      const enemy = p.enemies[idx];
      const x = enemy.col * TILE_SIZE;
      const y = (enemy.row + GRID_OFFSET_Y) * TILE_SIZE;

      if (p.stage === 'killing') {
        // Spinning sprite
        const isHop = Math.floor(p.killTimer / 60) % 2 === 0;
        const sprite = Sprites.getSprite(enemy.type, isHop);
        // White flash at start
        if (p.killTimer > 500) {
          Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.8)');
        }
        Renderer.drawSprite(sprite, x, y);
      }
    }

    // Flash tiles
    for (const flash of this.flashTiles) {
      const x = flash.col * TILE_SIZE;
      const y = (flash.row + GRID_OFFSET_Y) * TILE_SIZE;
      if (Math.floor(flash.timer / 50) % 2) {
        Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.4)');
      }
    }

    // Bonus popups
    for (const popup of this.bonusPopups) {
      const ctx = Renderer.ctx;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, popup.alpha));
      const color = popup.text.includes('PERFECT') ? PALETTE.GREEN_LIGHT : PALETTE.SCORE_COLOR;
      Renderer.drawText(popup.text, popup.x - popup.text.length * 4, popup.y, color);
      ctx.restore();
    }
  },
};
