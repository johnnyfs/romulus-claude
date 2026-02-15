// Enemy frog system - with snake, ladybug, smart frog, and deployment queue
const Enemies = {
  list: [],

  // Deployment queue system (3C)
  deploymentQueue: [],  // {type, col, row, deployed: bool}
  deployTimer: 0,
  DEPLOY_INTERVAL: 8000,   // ms between deployments
  RESPAWN_DELAY: 18000,    // ms before killed enemy can respawn
  respawnQueue: [],         // {type, timer}

  init() {
    this.list = [];
    this.deploymentQueue = [];
    this.deployTimer = 0;
    this.respawnQueue = [];
  },

  // Spawn an enemy frog of given type at given position (immediately on field)
  spawn(type, col, row) {
    const tileState = type === 'red' ? TILE_RED :
                     type === 'purple' ? TILE_PURPLE :
                     type === 'blue' ? TILE_BLUE :
                     type === 'zombie' ? TILE_ZOMBIE :
                     type === 'smart' ? TILE_SMART :
                     type === 'snake' ? null :    // Snake doesn't affect tiles
                     type === 'ladybug' ? null :  // Ladybug resets tiles, doesn't claim
                     TILE_SNAIL;
    const moveInterval = type === 'red' ? 800 :
                        type === 'purple' ? 500 :
                        type === 'zombie' ? 700 :
                        type === 'snail' ? 1500 :
                        type === 'snake' ? 600 :
                        type === 'ladybug' ? 1200 :
                        type === 'smart' ? 700 : 700;
    this.list.push({
      type,
      col,
      row,
      tileState,
      isHopping: false,
      hopTimer: 0,
      hopFromCol: col,
      hopFromRow: row,
      moveInterval: moveInterval,
      moveCooldown: Math.random() * 500 + 300, // stagger initial moves
      teleportTimer: type === 'blue' ? 5000 : 0,
      alive: true,
      doubleHopChance: type === 'purple' ? 0.3 : 0,
      doubleHopQueued: false,
      // Snake: queue second move in same direction
      snakeDir: -1,
      snakeSecondMove: false,
    });
    // Claim starting tile (snails convert tiles to spike, zombies use gray)
    if (type === 'snail') {
      Grid.set(col, row, TILE_SPIKE);
    } else if (type === 'snake' || type === 'ladybug') {
      // Snake doesn't claim tiles, ladybug resets tile on landing
      if (type === 'ladybug') {
        Grid.set(col, row, TILE_NEUTRAL);
      }
    } else if (tileState !== null) {
      Grid.set(col, row, tileState);
    }

    if (Audio.sfxEnemyDeploy) Audio.sfxEnemyDeploy();
  },

  // Queue an enemy for later deployment (3C deployment system)
  queueEnemy(type, col, row) {
    this.deploymentQueue.push({ type, col, row });
  },

  // Deploy the next enemy from the queue
  _deployNext() {
    if (this.deploymentQueue.length === 0) return;
    const entry = this.deploymentQueue.shift();
    this.spawn(entry.type, entry.col, entry.row);
  },

  update(dt) {
    // Tick deployment timer (3C)
    if (this.deploymentQueue.length > 0) {
      this.deployTimer -= dt;
      if (this.deployTimer <= 0) {
        this._deployNext();
        this.deployTimer = this.DEPLOY_INTERVAL;
      }
    }

    // Tick respawn timers (3C)
    for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
      this.respawnQueue[i].timer -= dt;
      if (this.respawnQueue[i].timer <= 0) {
        const entry = this.respawnQueue.splice(i, 1)[0];
        // Re-queue for deployment at a random edge position
        const edge = Math.floor(Math.random() * 4);
        let col, row;
        if (edge === 0) { col = Math.floor(Math.random() * GRID_COLS); row = 0; }
        else if (edge === 1) { col = GRID_COLS - 1; row = Math.floor(Math.random() * GRID_ROWS); }
        else if (edge === 2) { col = Math.floor(Math.random() * GRID_COLS); row = GRID_ROWS - 1; }
        else { col = 0; row = Math.floor(Math.random() * GRID_ROWS); }
        this.queueEnemy(entry.type, col, row);
      }
    }

    for (const enemy of this.list) {
      if (!enemy.alive) continue;

      // Handle hopping/moving animation
      if (enemy.isHopping) {
        enemy.hopTimer -= dt;
        if (enemy.hopTimer <= 0) {
          enemy.isHopping = false;

          // On landing behavior per type
          if (enemy.type === 'snail') {
            Grid.set(enemy.col, enemy.row, TILE_SPIKE);
            if (Audio.sfxSnailMove) Audio.sfxSnailMove();
          } else if (enemy.type === 'snake') {
            // Snake does NOT set tile state on landing
            if (Audio.sfxSnakeMove) Audio.sfxSnakeMove();
            // Snake moves 2 tiles: if first move done, queue second
            if (enemy.snakeSecondMove) {
              enemy.snakeSecondMove = false;
            } else {
              // Queue immediate second move in same direction
              enemy.snakeSecondMove = true;
              enemy.moveCooldown = 0; // Immediately move again
            }
          } else if (enemy.type === 'ladybug') {
            // Ladybug resets tile to TILE_NEUTRAL
            Grid.set(enemy.col, enemy.row, TILE_NEUTRAL);
          } else if (enemy.tileState !== null) {
            Grid.set(enemy.col, enemy.row, enemy.tileState);
          }
        }
        continue;
      }

      // Movement cooldown
      enemy.moveCooldown -= dt;
      if (enemy.moveCooldown > 0) continue;
      enemy.moveCooldown = enemy.moveInterval + (Math.random() * 200 - 100);

      // Blue frog teleport
      if (enemy.type === 'blue') {
        enemy.teleportTimer -= enemy.moveInterval;
        if (enemy.teleportTimer <= 0) {
          enemy.teleportTimer = 5000;
          const newCol = Math.floor(Math.random() * GRID_COLS);
          const newRow = Math.floor(Math.random() * GRID_ROWS);
          if (Grid.inBounds(newCol, newRow)) {
            enemy.hopFromCol = enemy.col;
            enemy.hopFromRow = enemy.row;
            enemy.col = newCol;
            enemy.row = newRow;
            enemy.isHopping = true;
            enemy.hopTimer = HOP_DURATION;
            Audio.sfxEnemyHop();
            continue;
          }
        }
      }

      // Check for queued double hop (purple)
      if (enemy.doubleHopQueued) {
        enemy.doubleHopQueued = false;
        enemy.moveCooldown = 0;
      }

      // Choose direction based on enemy type
      let dir;
      if (enemy.type === 'purple') {
        dir = this._chaseDirection(enemy);
      } else if (enemy.type === 'smart') {
        dir = this._smartDirection(enemy);
      } else if (enemy.type === 'snake' && enemy.snakeSecondMove) {
        // Snake second move: same direction as first
        dir = enemy.snakeDir;
      } else {
        // Random movement (red, snail, ladybug, snake first move, zombie)
        dir = Math.floor(Math.random() * 4);
      }

      // Snake: remember direction for second move
      if (enemy.type === 'snake' && !enemy.snakeSecondMove) {
        enemy.snakeDir = dir;
      }

      const newCol = enemy.col + DIR_DX[dir];
      const newRow = enemy.row + DIR_DY[dir];

      if (Grid.inBounds(newCol, newRow)) {
        const tile = Grid.get(newCol, newRow);
        // Determine if enemy can move to this tile
        const canMoveAnywhere = enemy.type === 'snail' || enemy.type === 'ladybug';
        const canMove = canMoveAnywhere || (tile !== TILE_SPIKE && tile !== TILE_WATER);
        if (canMove) {
          enemy.hopFromCol = enemy.col;
          enemy.hopFromRow = enemy.row;
          enemy.col = newCol;
          enemy.row = newRow;
          enemy.isHopping = true;
          enemy.hopTimer = HOP_DURATION;

          // Snails convert tiles to spike immediately on hop start
          if (enemy.type === 'snail') {
            Grid.set(newCol, newRow, TILE_SPIKE);
          }

          Audio.sfxEnemyHop();

          // Purple frogs: chance to hop twice
          if (enemy.type === 'purple' && Math.random() < enemy.doubleHopChance && !enemy.doubleHopQueued) {
            enemy.doubleHopQueued = true;
          }
        } else if (enemy.type === 'snake' && enemy.snakeSecondMove) {
          // Snake blocked on second move: just skip it
          enemy.snakeSecondMove = false;
        }
      } else if (enemy.type === 'snake' && enemy.snakeSecondMove) {
        // Snake out of bounds on second move: skip
        enemy.snakeSecondMove = false;
      }
    }
  },

  // Chase player direction (purple frog)
  _chaseDirection(enemy) {
    const dx = Player.col - enemy.col;
    const dy = Player.row - enemy.row;
    if (Math.random() < 0.08) return Math.floor(Math.random() * 4);
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? DIR_RIGHT : DIR_LEFT;
    } else {
      return dy > 0 ? DIR_DOWN : DIR_UP;
    }
  },

  // Smart frog AI: tries to move to cut off and surround the player (4B)
  _smartDirection(enemy) {
    // 15% random for unpredictability
    if (Math.random() < 0.15) return Math.floor(Math.random() * 4);

    const dx = Player.col - enemy.col;
    const dy = Player.row - enemy.row;
    const dist = Math.abs(dx) + Math.abs(dy);

    // If far from player, chase like purple
    if (dist > 6) {
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? DIR_RIGHT : DIR_LEFT;
      } else {
        return dy > 0 ? DIR_DOWN : DIR_UP;
      }
    }

    // When close, try to get ahead of the player
    // Anticipate player movement: target a position offset from the player
    // Pick a target 3 tiles ahead of where the player might go
    let targetCol = Player.col;
    let targetRow = Player.row;

    // Simple prediction: move to flank the player
    // Try to get to the opposite side of where the smart frog currently is
    if (Math.abs(dx) < Math.abs(dy)) {
      // Frog is more vertical — try to close horizontal gap
      targetCol = Player.col + (dx > 0 ? -3 : 3);
      targetRow = Player.row;
    } else {
      // Frog is more horizontal — try to close vertical gap
      targetCol = Player.col;
      targetRow = Player.row + (dy > 0 ? -3 : 3);
    }

    // Move toward the target
    const tdx = targetCol - enemy.col;
    const tdy = targetRow - enemy.row;

    if (Math.abs(tdx) > Math.abs(tdy)) {
      return tdx > 0 ? DIR_RIGHT : DIR_LEFT;
    } else if (tdy !== 0) {
      return tdy > 0 ? DIR_DOWN : DIR_UP;
    } else {
      // Already at target, chase directly
      if (dx !== 0) return dx > 0 ? DIR_RIGHT : DIR_LEFT;
      if (dy !== 0) return dy > 0 ? DIR_DOWN : DIR_UP;
      return Math.floor(Math.random() * 4);
    }
  },

  draw() {
    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      const pos = this._getPixelPos(enemy);
      const sprite = Sprites.getSprite(enemy.type, enemy.isHopping);
      Renderer.drawSprite(sprite, pos.x, pos.y);
    }
  },

  _getPixelPos(enemy) {
    const targetX = enemy.col * TILE_SIZE;
    const targetY = (enemy.row + GRID_OFFSET_Y) * TILE_SIZE;
    if (enemy.isHopping) {
      const t = 1 - (enemy.hopTimer / HOP_DURATION);
      const fromX = enemy.hopFromCol * TILE_SIZE;
      const fromY = (enemy.hopFromRow + GRID_OFFSET_Y) * TILE_SIZE;
      const x = fromX + (targetX - fromX) * t;
      const baseY = fromY + (targetY - fromY) * t;
      // Snake slithers flat (no arc), all others hop with arc
      const arc = enemy.type === 'snake' ? 0 : -Math.sin(t * Math.PI) * 6;
      return { x, y: baseY + arc };
    }
    return { x: targetX, y: targetY };
  },

  // Check if any HARMFUL enemy is at the same grid position as the player
  // Ladybugs are harmless and excluded
  checkCollisionWithPlayer() {
    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      if (enemy.type === 'ladybug') continue; // Ladybug doesn't hurt player
      if (enemy.col === Player.col && enemy.row === Player.row) {
        return true;
      }
    }
    return false;
  },

  // Check if player can stomp a ladybug at the given position
  // Returns the stomped enemy or null
  checkPlayerStompAt(col, row) {
    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      if (enemy.type === 'ladybug' && enemy.col === col && enemy.row === row && !enemy.isHopping) {
        return enemy;
      }
    }
    return null;
  },

  // Kill a stompable enemy (ladybug)
  stompEnemy(enemy) {
    enemy.alive = false;
    Player.addScore(150); // Ladybug stomp: 150 points
    if (Audio.sfxLadybugSquish) Audio.sfxLadybugSquish();
  },

  // Get the kill score for an enemy type
  getKillScore(type) {
    if (type === 'red') return 200;
    if (type === 'purple') return 500;
    if (type === 'blue') return 800;
    if (type === 'zombie') return 100;
    if (type === 'snake') return 300;
    if (type === 'smart') return 600;
    return 100;
  },

  // Remove a captured enemy
  capture(enemy) {
    enemy.alive = false;
    // Convert all tiles of this enemy's color to green
    if (enemy.tileState !== null) {
      Grid.convertAll(enemy.tileState, TILE_GREEN);
    }
    Player.addScore(100);
    Audio.sfxCapture();
  },

  // Mark an enemy as killed and start respawn timer (3C)
  markKilledForRespawn(type) {
    // Only respawn frog types and snake (not snails or ladybugs)
    const respawnTypes = ['red', 'purple', 'blue', 'smart', 'snake'];
    if (respawnTypes.includes(type)) {
      this.respawnQueue.push({ type, timer: this.RESPAWN_DELAY });
    }
  },

  // Remove dead enemies from list
  cleanup() {
    this.list = this.list.filter(e => e.alive);
  },
};
