// Encirclement detection - Qix/Amidar style flood-fill
// Sequential animation pipeline: fill → kills (one at a time) → bonus → clear
const Encircle = {
  flashTiles: [],
  bonusPopups: [],
  lastFillTime: 0,
  fillComboMultiplier: 1,

  // Animation pipeline state machine
  pipeline: null, // null = idle, or {stage, ...data}
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

    // Find enemies in region (excluding zombies)
    const enemies = [];
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      if (enemy.type === 'zombie') continue;
      for (const tile of region) {
        if (enemy.col === tile.col && enemy.row === tile.row) {
          enemies.push(enemy);
          break;
        }
      }
    }

    // Play fill sound
    if (region.length <= 5) Audio.sfxFillSmall();
    else if (region.length <= 15) Audio.sfxFillMedium();
    else if (region.length <= 30) Audio.sfxFillLarge();
    else Audio.sfxFillHuge();

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
            // Fill done — move to kills or bonus
            if (p.enemies.length > 0) {
              p.stage = 'killing';
              p.killIndex = 0;
              p.killTimer = 600; // Time per kill animation
              // Start first kill
              const enemy = p.enemies[0];
              enemy.alive = false;
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
            // Show score for this kill — each subsequent kill worth more
            const enemy = p.enemies[p.killIndex];
            const baseScore = enemy.type === 'red' ? 200 : enemy.type === 'purple' ? 500 : enemy.type === 'blue' ? 800 : 100;
            const multiplier = p.killIndex + 1; // 1st=1x, 2nd=2x, 3rd=3x
            const killScore = baseScore * multiplier;
            Player.addScore(killScore);

            const x = enemy.col * TILE_SIZE + TILE_SIZE / 2;
            const y = (enemy.row + 1) * TILE_SIZE;
            let text = '+' + killScore;
            if (multiplier > 1) text += ' x' + multiplier;
            this.bonusPopups.push({ text, x, y, timer: 900, alpha: 1.0 });

            p.killIndex++;
            if (p.killIndex < p.enemies.length) {
              // Next kill
              p.killTimer = 700;
              p.stage = 'kill_wait';
            } else {
              // All kills done — show fill bonus
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
              cy = (Math.floor(cy / p.queue.length) + 1) * TILE_SIZE;
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

  _showFillBonus(p) {
    const fillBonus = p.tileCount * 2 * this.fillComboMultiplier;
    Player.addScore(fillBonus);

    let cx = 0, cy = 0;
    for (const t of p.queue) { cx += t.col; cy += t.row; }
    cx = Math.floor(cx / p.queue.length) * TILE_SIZE + 8;
    cy = (Math.floor(cy / p.queue.length) + 1) * TILE_SIZE;

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
      const y = (enemy.row + 1) * TILE_SIZE;

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
      const y = (flash.row + 1) * TILE_SIZE;
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
