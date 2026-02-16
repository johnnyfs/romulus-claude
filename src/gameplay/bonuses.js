// Bonus items system - flies and green bug
// Spawns collectible bonus items on the field periodically
const Bonuses = {
  items: [],         // Active bonus items on the field
  spawnTimer: 0,     // Countdown to next spawn check
  SPAWN_INTERVAL: 15000, // Check every 15 seconds
  INITIAL_DELAY: 8000,   // Wait 8s before first spawn opportunity

  // Player powerup state
  speedBoost: false,
  speedBoostTimer: 0,
  SPEED_BOOST_DURATION: 5000, // 5 seconds

  invincibilityBoost: false, // Different from post-death invincibility
  invincibilityBoostTimer: 0,
  INVINCIBILITY_DURATION: 6000, // 6 seconds

  // Wing animation timer (shared for all flies)
  wingTimer: 0,
  wingFrame: true, // true = spread, false = folded

  init() {
    this.items = [];
    this.spawnTimer = this.INITIAL_DELAY;
    this.speedBoost = false;
    this.speedBoostTimer = 0;
    this.invincibilityBoost = false;
    this.invincibilityBoostTimer = 0;
    this.wingTimer = 0;
    this.wingFrame = true;
  },

  update(dt) {
    // Update wing animation (200ms toggle)
    this.wingTimer += dt;
    if (this.wingTimer >= 200) {
      this.wingTimer -= 200;
      this.wingFrame = !this.wingFrame;
    }

    // Update powerup timers
    if (this.speedBoost) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) {
        this.speedBoost = false;
        this.speedBoostTimer = 0;
      }
    }

    if (this.invincibilityBoost) {
      this.invincibilityBoostTimer -= dt;
      if (this.invincibilityBoostTimer <= 0) {
        this.invincibilityBoost = false;
        this.invincibilityBoostTimer = 0;
      }
    }

    // Update spawn timer
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.items.length === 0) {
      this.spawnTimer = this.SPAWN_INTERVAL;
      this._trySpawn();
    }

    // Update each bonus item
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      // Lifetime countdown
      item.lifetime -= dt;
      if (item.lifetime <= 0) {
        this.items.splice(i, 1);
        continue;
      }

      // Handle hopping animation
      if (item.isHopping) {
        item.hopTimer -= dt;
        if (item.hopTimer <= 0) {
          item.isHopping = false;
          // Green bug converts tiles to green on landing
          if (item.type === 'green_bug') {
            const tile = Grid.get(item.col, item.row);
            if (tile !== TILE_GREEN && tile !== TILE_SPIKE && tile !== TILE_WATER && tile !== TILE_ZOMBIE) {
              Grid.set(item.col, item.row, TILE_GREEN);
            }
          }
        }
        continue;
      }

      // Movement cooldown
      item.moveTimer -= dt;
      if (item.moveTimer <= 0) {
        item.moveTimer = item.moveInterval + (Math.random() * 300 - 150);
        this._moveItem(item);
      }
    }
  },

  _trySpawn() {
    // Roll for bonus type
    const roll = Math.random();
    let type;
    if (roll < 0.05) {
      type = 'life_fly';        // 5% chance
    } else if (roll < 0.30) {
      type = 'green_bug';       // 25% chance
    } else if (roll < 0.60) {
      type = 'invincible_fly';  // 30% chance
    } else {
      type = 'speed_fly';       // 40% chance
    }

    // Find a valid spawn position (not on player, not on hazards, not on enemies)
    const pos = this._findSpawnPosition();
    if (!pos) return; // No valid position found

    // Item-specific settings
    let lifetime, moveInterval, hopDuration;
    switch (type) {
      case 'speed_fly':
        lifetime = 8000;
        moveInterval = 2000;
        hopDuration = 150;
        break;
      case 'invincible_fly':
        lifetime = 8000;
        moveInterval = 2000;
        hopDuration = 150;
        break;
      case 'life_fly':
        lifetime = 5000;   // Shorter window — rare and valuable
        moveInterval = 1200; // Moves faster
        hopDuration = 120;
        break;
      case 'green_bug':
        lifetime = 20000;
        moveInterval = 1500;
        hopDuration = 200;
        break;
    }

    this.items.push({
      type,
      col: pos.col,
      row: pos.row,
      lifetime,
      moveTimer: moveInterval * 0.5 + Math.random() * 500, // stagger first move
      moveInterval,
      isHopping: false,
      hopTimer: 0,
      hopDuration,
      hopFromCol: pos.col,
      hopFromRow: pos.row,
    });
  },

  _findSpawnPosition() {
    // Try up to 20 random positions
    for (let attempt = 0; attempt < 20; attempt++) {
      const col = Math.floor(Math.random() * GRID_COLS);
      const row = Math.floor(Math.random() * GRID_ROWS);
      const tile = Grid.get(col, row);

      // Skip hazards, player position, and water
      if (tile === TILE_SPIKE || tile === TILE_WATER || tile === TILE_ZOMBIE) continue;
      if (col === Player.col && row === Player.row) continue;

      // Skip enemy positions
      let onEnemy = false;
      for (const enemy of Enemies.list) {
        if (enemy.alive && enemy.col === col && enemy.row === row) {
          onEnemy = true;
          break;
        }
      }
      if (onEnemy) continue;

      return { col, row };
    }
    return null;
  },

  _moveItem(item) {
    // Choose a random direction
    const dir = Math.floor(Math.random() * 4);
    const newCol = item.col + DIR_DX[dir];
    const newRow = item.row + DIR_DY[dir];

    if (!Grid.inBounds(newCol, newRow)) return;

    const tile = Grid.get(newCol, newRow);
    // Flies avoid hazards; green bug can go anywhere except water
    if (item.type === 'green_bug') {
      if (tile === TILE_WATER || tile === TILE_ZOMBIE) return;
    } else {
      if (tile === TILE_SPIKE || tile === TILE_WATER || tile === TILE_ZOMBIE) return;
    }

    item.hopFromCol = item.col;
    item.hopFromRow = item.row;
    item.col = newCol;
    item.row = newRow;
    item.isHopping = true;
    item.hopTimer = item.hopDuration;
  },

  // Called when player lands on a tile
  checkPlayerPickup(col, row) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      // Check destination position
      if (item.col === col && item.row === row) {
        this._applyBonus(item);
        this.items.splice(i, 1);
        return true;
      }
      // Also check origin position if mid-hop (handles approaching from opposite direction)
      if (item.isHopping && item.hopFromCol === col && item.hopFromRow === row) {
        this._applyBonus(item);
        this.items.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  _applyBonus(item) {
    switch (item.type) {
      case 'speed_fly':
        this.speedBoost = true;
        this.speedBoostTimer = this.SPEED_BOOST_DURATION;
        Player.addScore(100);
        if (Audio.sfxSpeedBoost) Audio.sfxSpeedBoost();
        // Show pickup popup
        this._showPickupPopup(item, '+100 SPEED!');
        break;

      case 'invincible_fly':
        this.invincibilityBoost = true;
        this.invincibilityBoostTimer = this.INVINCIBILITY_DURATION;
        Player.addScore(100);
        if (Audio.sfxInvincibleStart) Audio.sfxInvincibleStart();
        this._showPickupPopup(item, '+100 POWER!');
        break;

      case 'life_fly':
        Player.lives++;
        Player.addScore(500);
        if (Audio.sfxExtraLife) Audio.sfxExtraLife();
        this._showPickupPopup(item, '1UP!');
        break;

      case 'green_bug':
        Player.addScore(50);
        if (Audio.sfxBonusPickup) Audio.sfxBonusPickup();
        this._showPickupPopup(item, '+50');
        break;
    }
  },

  _showPickupPopup(item, text) {
    const x = item.col * TILE_SIZE + TILE_SIZE / 2;
    const y = (item.row + GRID_OFFSET_Y) * TILE_SIZE;
    Encircle.bonusPopups.push({
      text,
      x,
      y,
      timer: 1200,
      alpha: 1.0,
    });
  },

  // Get the effective hop duration for the player (called from player.js)
  getPlayerHopDuration() {
    return this.speedBoost ? Math.floor(HOP_DURATION / 2) : HOP_DURATION;
  },

  draw() {
    for (const item of this.items) {
      const pos = this._getPixelPos(item);

      // Blink when about to expire (last 2 seconds)
      if (item.lifetime < 2000) {
        if (Math.floor(item.lifetime / 100) % 2 === 0) continue; // skip drawing
      }

      if (item.type === 'green_bug') {
        // Green bug uses standard sprite drawing
        const sprite = Sprites.getSprite('green_bug', false);
        Renderer.drawSprite(sprite, pos.x, pos.y);
      } else {
        // Flies use animated wing sprites
        const sprite = Sprites.getFlySprite(item.type, this.wingFrame);
        Renderer.drawSprite(sprite, pos.x, pos.y);
      }
    }

    // Draw powerup indicators on player
    if (this.speedBoost || this.invincibilityBoost) {
      this._drawPowerupEffects();
    }
  },

  _getPixelPos(item) {
    const targetX = item.col * TILE_SIZE;
    const targetY = (item.row + GRID_OFFSET_Y) * TILE_SIZE;
    if (item.isHopping) {
      const t = 1 - (item.hopTimer / item.hopDuration);
      const fromX = item.hopFromCol * TILE_SIZE;
      const fromY = (item.hopFromRow + GRID_OFFSET_Y) * TILE_SIZE;
      const x = fromX + (targetX - fromX) * t;
      const baseY = fromY + (targetY - fromY) * t;
      // Flies have higher arc (6px), green bug lower (3px)
      const arcHeight = item.type === 'green_bug' ? 3 : 6;
      const arc = -Math.sin(t * Math.PI) * arcHeight;
      return { x, y: baseY + arc };
    }
    return { x: targetX, y: targetY };
  },

  _drawPowerupEffects() {
    if (!Player.alive) return;
    const pos = Player.getPixelPos();
    const ctx = Renderer.ctx;

    if (this.invincibilityBoost) {
      // Gold sparkle overlay on player
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(performance.now() / 100) * 0.15;
      ctx.fillStyle = PALETTE.GOLD;
      // Draw a shimmer rectangle over player area
      ctx.fillRect(Math.floor(pos.x) + 2, Math.floor(pos.y) + 1, 12, 14);
      ctx.restore();

      // Sparkle particles around player
      const sparkleTime = performance.now() / 200;
      for (let i = 0; i < 4; i++) {
        const angle = sparkleTime + i * Math.PI / 2;
        const sx = Math.floor(pos.x) + 8 + Math.cos(angle) * 9;
        const sy = Math.floor(pos.y) + 8 + Math.sin(angle) * 9;
        Renderer.fillRect(sx, sy, 1, 1, PALETTE.GOLD);
      }
    } else if (this.speedBoost) {
      // Blue/cyan tint overlay
      ctx.save();
      ctx.globalAlpha = 0.25 + Math.sin(performance.now() / 80) * 0.1;
      ctx.fillStyle = PALETTE.CYAN;
      ctx.fillRect(Math.floor(pos.x) + 2, Math.floor(pos.y) + 1, 12, 14);
      ctx.restore();
    }
  },

  // Kill an enemy due to invincibility collision
  killEnemyByInvincibility(enemy) {
    if (!enemy.alive) return;
    enemy.alive = false;

    // Award kill points based on enemy type
    const baseScore = enemy.type === 'red' ? 200 :
                     enemy.type === 'purple' ? 500 :
                     enemy.type === 'blue' ? 800 :
                     enemy.type === 'zombie' ? 100 :
                     enemy.type === 'snail' ? 150 : 100;
    Player.addScore(baseScore);
    Audio.sfxCapture();

    // Show kill popup
    const x = enemy.col * TILE_SIZE + TILE_SIZE / 2;
    const y = (enemy.row + GRID_OFFSET_Y) * TILE_SIZE;
    Encircle.bonusPopups.push({
      text: '+' + baseScore,
      x,
      y,
      timer: 900,
      alpha: 1.0,
    });

    // Clean up
    Enemies.cleanup();
  },
};
