// Enemy frog system - with snake, ladybug, smart frog, and smart deployment scheduling
const Enemies = {
  list: [],

  // Smart deployment queue system
  // "Frogs" = red, purple, blue, zombie, smart (hop-type enemies)
  // "Non-frogs" = snake, ladybug (interleaved between frog deploys)
  frogQueue: [],           // Queued frogs to deploy
  nonFrogQueue: [],        // Queued non-frogs (snakes, ladybugs)
  frogDeployTimer: 0,
  nonFrogDeployTimer: 0,
  FROG_DEPLOY_INTERVAL: 5000,    // 5s between frog deploy intervals
  NON_FROG_DEPLOY_INTERVAL: 5000, // Same interval but offset by half
  frogBatchSize: 1,        // How many frogs per interval (base)
  frogBatchExtra: 0,       // Remainder frogs distributed to early intervals
  frogBatchCount: 0,       // How many frog intervals have fired
  deploying: false,        // Whether deployment is active

  RESPAWN_DELAY: 18000,    // ms before killed enemy can respawn
  respawnQueue: [],         // {type, timer}

  // Ladybug respawn system
  ladybugEnabled: false,
  ladybugAlive: false,
  ladybugRespawnTimer: 0,
  LADYBUG_RESPAWN_INTERVAL: 7500, // respawn 7.5s after death (generous window)
  LADYBUG_INITIAL_DELAY: 7000,    // first ladybug spawns 7s into wave (after 2nd frog would deploy)

  init() {
    this.list = [];
    this.frogQueue = [];
    this.nonFrogQueue = [];
    this.frogDeployTimer = 0;
    this.nonFrogDeployTimer = 0;
    this.frogBatchSize = 1;
    this.frogBatchExtra = 0;
    this.frogBatchCount = 0;
    this.deploying = false;
    this.respawnQueue = [];
    this.ladybugEnabled = false;
    this.ladybugAlive = false;
    this.ladybugRespawnTimer = 0;
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
                        type === 'smart' ? 300 : 700;
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
      // Smart frog: burst hop tracking
      smartBurstDir: -1,     // Current burst direction
      smartBurstRemaining: 0, // Hops left in current burst
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
      // If zombieLevel >= 2, freshly claimed tiles are temporarily fatal
      if (Waves.zombieLevel >= 2) {
        Grid.setFatal(col, row, Grid.fatalDuration);
      }
    }

    if (Audio.sfxEnemyDeploy) Audio.sfxEnemyDeploy();
  },

  // Queue an enemy for later deployment — sorts into frog vs non-frog queue
  queueEnemy(type, col, row) {
    const NON_FROG_TYPES = ['snake', 'ladybug'];
    if (NON_FROG_TYPES.includes(type)) {
      this.nonFrogQueue.push({ type, col, row });
    } else {
      this.frogQueue.push({ type, col, row });
    }
  },

  // Calculate deployment batch sizes after all enemies are queued
  // Called by startDeployment() after wave setup finishes queuing
  _calculateDeploySchedule() {
    const SNAIL_TIMER = 35000; // First snail spawns at 35s
    const N = Math.floor(SNAIL_TIMER / this.FROG_DEPLOY_INTERVAL); // = 7 max frogs before snails
    const numFrogs = this.frogQueue.length;

    if (numFrogs <= N) {
      // Simple case: 1 frog per interval
      this.frogBatchSize = 1;
      this.frogBatchExtra = 0;
    } else {
      // More frogs than intervals before snails — batch them
      const extras = numFrogs - N;
      this.frogBatchSize = 1 + Math.floor(extras / N);
      this.frogBatchExtra = extras % N;
    }
    this.frogBatchCount = 0;
  },

  // Start the deployment process — called after all enemies are queued for a wave
  startDeployment() {
    this._calculateDeploySchedule();
    this.deploying = true;
    // First frog deploys after 2 seconds
    this.frogDeployTimer = 2000;
    // Non-frogs start offset by half the frog interval (deploy between frogs)
    this.nonFrogDeployTimer = 2000 + Math.floor(this.FROG_DEPLOY_INTERVAL / 2);
  },

  // Enable ladybug respawn system for this wave
  enableLadybug() {
    this.ladybugEnabled = true;
    this.ladybugAlive = false;
    this.ladybugRespawnTimer = this.LADYBUG_INITIAL_DELAY; // First spawn uses longer delay
  },

  // Deploy a batch of frogs from the frog queue
  _deployFrogBatch() {
    if (this.frogQueue.length === 0) return;
    // How many to deploy this interval
    let count = this.frogBatchSize;
    // Early intervals get +1 extra to distribute remainder
    if (this.frogBatchCount < this.frogBatchExtra) {
      count++;
    }
    this.frogBatchCount++;
    // Deploy up to 'count' frogs
    for (let i = 0; i < count && this.frogQueue.length > 0; i++) {
      const entry = this.frogQueue.shift();
      this.spawn(entry.type, entry.col, entry.row);
    }
  },

  // Deploy next non-frog from the non-frog queue
  _deployNonFrog() {
    if (this.nonFrogQueue.length === 0) return;
    const entry = this.nonFrogQueue.shift();
    this.spawn(entry.type, entry.col, entry.row);
  },

  update(dt) {
    // Ladybug respawn system
    if (this.ladybugEnabled && !this.ladybugAlive) {
      this.ladybugRespawnTimer -= dt;
      if (this.ladybugRespawnTimer <= 0) {
        // Spawn ladybug at player start position (center)
        const spawnCol = Math.floor(GRID_COLS / 2);
        const spawnRow = Math.floor(GRID_ROWS / 2);
        this.spawn('ladybug', spawnCol, spawnRow);
        this.ladybugAlive = true;
        this.ladybugRespawnTimer = this.LADYBUG_RESPAWN_INTERVAL;
      }
    }

    // Check if ladybug is still alive (could have been killed by invincibility)
    if (this.ladybugEnabled && this.ladybugAlive) {
      const hasLiveLadybug = this.list.some(e => e.type === 'ladybug' && e.alive);
      if (!hasLiveLadybug) {
        this.ladybugAlive = false;
      }
    }

    // Smart deployment: tick frog and non-frog timers separately
    if (this.deploying) {
      const hasWork = this.frogQueue.length > 0 || this.nonFrogQueue.length > 0;
      if (!hasWork) {
        this.deploying = false;
      } else {
        // Frog deployment timer
        if (this.frogQueue.length > 0) {
          this.frogDeployTimer -= dt;
          if (this.frogDeployTimer <= 0) {
            this._deployFrogBatch();
            this.frogDeployTimer = this.FROG_DEPLOY_INTERVAL;
          }
        }
        // Non-frog deployment timer (offset between frog intervals)
        if (this.nonFrogQueue.length > 0) {
          this.nonFrogDeployTimer -= dt;
          if (this.nonFrogDeployTimer <= 0) {
            this._deployNonFrog();
            this.nonFrogDeployTimer = this.NON_FROG_DEPLOY_INTERVAL;
          }
        }
      }
    }

    // Tick respawn timers
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
        // Recalculate and restart deployment if not already deploying
        if (!this.deploying) {
          this.startDeployment();
        } else {
          this._calculateDeploySchedule();
        }
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
            // Blue frog teleport: check if landed in fully green-enclosed area
            // Only triggers if the frog landed on a NON-green tile inside an enclosure
            if (enemy.justTeleported) {
              enemy.justTeleported = false;
              if (Grid.get(enemy.col, enemy.row) !== TILE_GREEN &&
                  this._isEnclosedByGreen(enemy.col, enemy.row)) {
                enemy.alive = false;
                Player.addScore(this.getKillScore(enemy.type));
                Audio.sfxCapture();
                continue;
              }
            }
            // -1 point when enemy reclaims a green tile
            if (Grid.get(enemy.col, enemy.row) === TILE_GREEN) {
              Player.addScore(-1);
            }
            Grid.set(enemy.col, enemy.row, enemy.tileState);
            // If zombieLevel >= 2, freshly claimed tiles are temporarily fatal
            if (Waves.zombieLevel >= 2 && enemy.tileState !== null) {
              Grid.setFatal(enemy.col, enemy.row, Grid.fatalDuration);
            }
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
            enemy.justTeleported = true; // Flag for enclosed check on landing
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
      } else if (enemy.type === 'ladybug') {
        dir = this._ladybugDirection(enemy);
      } else {
        // Random movement (red, snail, snake first move, zombie)
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

  // Smart frog AI: aggressive burst movement.
  // Moves in bursts of 4-6 rapid hops in one direction, then picks a new
  // direction based on player position. Scary, fast, and deliberate.
  // The burst pattern naturally creates walls of TILE_SMART tiles.
  _smartDirection(enemy) {
    // If we have burst hops remaining, continue in the same direction
    if (enemy.smartBurstRemaining > 0) {
      enemy.smartBurstRemaining--;
      // Reduce cooldown for burst hops (very fast consecutive hops)
      enemy.moveCooldown = 80; // 80ms between burst hops — aggressive
      const dir = enemy.smartBurstDir;
      // Check if next tile in burst direction is valid
      const nextCol = enemy.col + DIR_DX[dir];
      const nextRow = enemy.row + DIR_DY[dir];
      if (Grid.inBounds(nextCol, nextRow)) {
        const tile = Grid.get(nextCol, nextRow);
        if (tile !== TILE_SPIKE && tile !== TILE_WATER) {
          return dir; // Continue burst
        }
      }
      // Blocked — end burst early, pick new direction immediately
      enemy.smartBurstRemaining = 0;
    }

    // Pick a new burst direction based on player position
    const dx = enemy.col - Player.col;
    const dy = enemy.row - Player.row;
    const dist = Math.abs(dx) + Math.abs(dy);

    // Choose direction strategically:
    // - If far from player (>6), rush toward them
    // - If near player (<=6), move perpendicular to create encircling walls
    let dir;
    if (dist > 6) {
      // Rush toward player
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? DIR_LEFT : DIR_RIGHT;
      } else {
        dir = dy > 0 ? DIR_UP : DIR_DOWN;
      }
    } else {
      // Near player: choose direction to build encircling walls
      // Move perpendicular to the player (clockwise tangent)
      // This creates L-shaped and box-shaped tile patterns
      if (dy < 0 && Math.abs(dy) >= Math.abs(dx)) {
        dir = DIR_RIGHT;  // Above player → sweep right
      } else if (dx > 0 && Math.abs(dx) >= Math.abs(dy)) {
        dir = DIR_DOWN;   // Right of player → sweep down
      } else if (dy > 0 && Math.abs(dy) >= Math.abs(dx)) {
        dir = DIR_LEFT;   // Below player → sweep left
      } else {
        dir = DIR_UP;     // Left of player → sweep up
      }
      // Sometimes charge directly at player for pressure (20% chance)
      if (Math.random() < 0.20) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          dir = dx > 0 ? DIR_LEFT : DIR_RIGHT;
        } else {
          dir = dy > 0 ? DIR_UP : DIR_DOWN;
        }
      }
    }

    // Start new burst: 4-6 hops
    enemy.smartBurstDir = dir;
    enemy.smartBurstRemaining = 3 + Math.floor(Math.random() * 3); // 3-5 more after this one
    return dir;
  },

  // Ladybug AI: move toward nearest green tile (random among ties)
  _ladybugDirection(enemy) {
    // Find nearest green tile
    let bestDist = Infinity;
    let candidates = [];

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (Grid.get(c, r) === TILE_GREEN) {
          const dist = Math.abs(c - enemy.col) + Math.abs(r - enemy.row);
          if (dist < bestDist) {
            bestDist = dist;
            candidates = [{col: c, row: r}];
          } else if (dist === bestDist) {
            candidates.push({col: c, row: r});
          }
        }
      }
    }

    if (candidates.length === 0) {
      return Math.floor(Math.random() * 4); // No green tiles, move randomly
    }

    // Pick random among tied candidates
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const dx = target.col - enemy.col;
    const dy = target.row - enemy.row;

    // Move toward target
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? DIR_RIGHT : DIR_LEFT;
    } else if (Math.abs(dy) > 0) {
      return dy > 0 ? DIR_DOWN : DIR_UP;
    } else {
      return Math.floor(Math.random() * 4); // On the target, move randomly
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
      if (enemy.type !== 'ladybug') continue;
      // Check destination position
      if (enemy.col === col && enemy.row === row) {
        return enemy;
      }
      // Also check origin position if mid-hop (handles approaching from opposite direction)
      if (enemy.isHopping && enemy.hopFromCol === col && enemy.hopFromRow === row) {
        return enemy;
      }
    }
    return null;
  },

  // Kill a stompable enemy (ladybug)
  stompEnemy(enemy) {
    enemy.alive = false;
    if (enemy.type === 'ladybug') {
      this.ladybugAlive = false;
    }
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

  // Mark an enemy as killed and start respawn timer
  markKilledForRespawn(type) {
    // Only respawn frog types and snake (not snails or ladybugs)
    const respawnTypes = ['red', 'purple', 'blue', 'smart', 'snake'];
    if (respawnTypes.includes(type)) {
      this.respawnQueue.push({ type, timer: this.RESPAWN_DELAY });
    }
  },

  // Check if a position is fully enclosed by green tiles (can't reach edge without crossing green)
  _isEnclosedByGreen(col, row) {
    const visited = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      visited[r] = [];
      for (let c = 0; c < GRID_COLS; c++) visited[r][c] = false;
    }
    const stack = [{ c: col, r: row }];
    while (stack.length > 0) {
      const { c, r } = stack.pop();
      if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return false; // Reached edge
      if (visited[r][c]) continue;
      if (Grid.get(c, r) === TILE_GREEN) continue; // Green blocks path
      visited[r][c] = true;
      stack.push({ c: c+1, r }, { c: c-1, r }, { c, r: r+1 }, { c, r: r-1 });
    }
    return true; // Never reached edge — enclosed
  },

  // Remove dead enemies from list
  cleanup() {
    this.list = this.list.filter(e => e.alive);
  },
};
