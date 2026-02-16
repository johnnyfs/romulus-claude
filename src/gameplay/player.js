// Player (Maripoga) - movement, hopping, tile claiming
const Player = {
  col: 0,
  row: 0,
  isHopping: false,
  hopTimer: 0,
  hopFromCol: 0,
  hopFromRow: 0,
  lives: 3,
  score: 0,
  alive: true,
  invincible: false,
  invincibilityTimer: 0,

  init() {
    // Start at center of grid
    this.col = Math.floor(GRID_COLS / 2);
    this.row = Math.floor(GRID_ROWS / 2);
    this.isHopping = false;
    this.hopTimer = 0;
    this.alive = true;
    // Claim starting tile
    Grid.set(this.col, this.row, TILE_GREEN);
  },

  reset() {
    this.col = Math.floor(GRID_COLS / 2);
    this.row = Math.floor(GRID_ROWS / 2);
    this.isHopping = false;
    this.hopTimer = 0;
    this.alive = true;
    this.invincible = true;
    this.invincibilityTimer = 1500; // 1.5 seconds of invincibility
    // Claim starting tile
    Grid.set(this.col, this.row, TILE_GREEN);
  },

  update(dt) {
    if (!this.alive) return;

    // Update invincibility timer
    if (this.invincible) {
      this.invincibilityTimer -= dt;
      if (this.invincibilityTimer <= 0) {
        this.invincible = false;
        this.invincibilityTimer = 0;
      }
    }

    if (this.isHopping) {
      this.hopTimer -= dt;
      if (this.hopTimer <= 0) {
        this.isHopping = false;
        // Check if landed on fatal enemy tile
        const landedTile = Grid.get(this.col, this.row);
        const isPowered = (typeof Bonuses !== 'undefined') && Bonuses.invincibilityBoost;
        if (Grid.isFatal(this.col, this.row)) {
          const isEnemyTile = [TILE_RED, TILE_PURPLE, TILE_BLUE, TILE_SMART].includes(landedTile);
          if (isEnemyTile) {
            if (isPowered) {
              // Powered player survives fatal tiles and converts to green
              Grid.set(this.col, this.row, TILE_GREEN);
              Grid.fatalTimers[this.row][this.col] = 0; // Clear fatal
              Audio.sfxClaim(true);
              Encircle.checkAll();
            } else {
              this.die();
              return;
            }
          }
        }
        // Check if landed on spike
        if (landedTile === TILE_SPIKE) {
          if (isPowered) {
            // Powered player survives spikes and converts to green
            Grid.set(this.col, this.row, TILE_GREEN);
            Audio.sfxClaim(true);
            // Kill any snail on this tile
            for (const enemy of Enemies.list) {
              if (enemy.alive && enemy.col === this.col && enemy.row === this.row) {
                Bonuses.killEnemyByInvincibility(enemy);
                break;
              }
            }
            Encircle.checkAll();
          } else {
            this.die();
            return;
          }
        }
        // Zombie mechanic evolution: enemy tiles need extra hops to clear
        if (Waves.zombieLevel >= 1) {
          const isEnemyTile = [TILE_RED, TILE_PURPLE, TILE_BLUE, TILE_SMART].includes(landedTile);
          if (isEnemyTile) {
            // Level 1+: enemy → neutral (2 total hops needed)
            Grid.set(this.col, this.row, TILE_NEUTRAL);
            Audio.sfxClaim(true);
            Encircle.checkAll();
            return;
          }
        }
        // Zombie tiles: first hop reverts to neutral, second hop claims green
        if (landedTile === TILE_ZOMBIE) {
          Grid.set(this.col, this.row, TILE_NEUTRAL);
          Audio.sfxClaim(true); // Use enemy claim sound for distinct feedback
          Encircle.checkAll();
          return;
        }
        // Check for ladybug stomp on landing (3B)
        const stompTarget = Enemies.checkPlayerStompAt(this.col, this.row);
        if (stompTarget) {
          Enemies.stompEnemy(stompTarget);
        }
        // Claim tile on landing
        const oldTile = landedTile;
        Grid.set(this.col, this.row, TILE_GREEN);
        // Award points for NEW tiles only (not re-claiming green)
        if (oldTile !== TILE_GREEN) {
          const isEnemy = oldTile === TILE_RED || oldTile === TILE_PURPLE || oldTile === TILE_BLUE || oldTile === TILE_SMART;
          this.addScore(1);
          Audio.sfxClaim(isEnemy);
        }
        // Check for bonus item pickup on landing
        if (typeof Bonuses !== 'undefined') {
          Bonuses.checkPlayerPickup(this.col, this.row);
        }
        // Check for encirclement after claiming
        Encircle.checkAll();
      }
      return;
    }

    // Read input
    const dir = Input.getDirection();
    if (dir !== DIR_NONE) {
      const newCol = this.col + DIR_DX[dir];
      const newRow = this.row + DIR_DY[dir];
      if (Grid.inBounds(newCol, newRow)) {
        const tile = Grid.get(newCol, newRow);
        // Spike tiles are deadly — can hop onto them but die on landing
        // Water tiles block movement; zombie tiles allow entry (cleared on landing)
        if (tile !== TILE_WATER) {
          this.hopFromCol = this.col;
          this.hopFromRow = this.row;
          this.col = newCol;
          this.row = newRow;
          this.isHopping = true;
          // Use speed boost duration if active
          this.hopTimer = (typeof Bonuses !== 'undefined') ? Bonuses.getPlayerHopDuration() : HOP_DURATION;
          Audio.sfxHop();
        }
      }
    }
  },

  // Get pixel position (interpolated during hop)
  getPixelPos() {
    const targetX = this.col * TILE_SIZE;
    const targetY = (this.row + GRID_OFFSET_Y) * TILE_SIZE; // + GRID_OFFSET_Y for grid offset
    if (this.isHopping) {
      const hopDur = (typeof Bonuses !== 'undefined') ? Bonuses.getPlayerHopDuration() : HOP_DURATION;
      const t = 1 - (this.hopTimer / hopDur);
      const fromX = this.hopFromCol * TILE_SIZE;
      const fromY = (this.hopFromRow + GRID_OFFSET_Y) * TILE_SIZE;
      // Arc: lerp position with a vertical bounce
      const x = fromX + (targetX - fromX) * t;
      const baseY = fromY + (targetY - fromY) * t;
      const arc = -Math.sin(t * Math.PI) * 8; // 8px arc height
      return { x, y: baseY + arc };
    }
    return { x: targetX, y: targetY };
  },

  draw() {
    const pos = this.getPixelPos();
    // Blink during invincibility (4 blinks per second)
    if (this.invincible && Math.floor(this.invincibilityTimer / 125) % 2) {
      return; // Skip drawing to create blink effect
    }
    const sprite = Sprites.getSprite('player', this.isHopping);
    Renderer.drawSprite(sprite, pos.x, pos.y);
  },

  die() {
    if (!this.alive) return; // Prevent double-death
    this.alive = false;
    this.lives--;
    this.justDied = true; // Flag for main loop to pick up
    Audio.sfxDeath();
  },

  addScore(points) {
    const oldScore = this.score;
    this.score += points;
    // Extra life every 50000 points
    if (Math.floor(this.score / 50000) > Math.floor(oldScore / 50000)) {
      this.lives++;
    }
  },
};
