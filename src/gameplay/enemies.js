// Enemy frog system
const Enemies = {
  list: [],

  init() {
    this.list = [];
  },

  // Spawn an enemy frog of given type at given position
  spawn(type, col, row) {
    const tileState = type === 'red' ? TILE_RED :
                     type === 'purple' ? TILE_PURPLE :
                     type === 'blue' ? TILE_BLUE :
                     type === 'zombie' ? TILE_ZOMBIE :
                     TILE_SNAIL;
    const moveInterval = type === 'red' ? 800 :
                        type === 'purple' ? 500 :
                        type === 'zombie' ? 700 :
                        type === 'snail' ? 1500 : 700;
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
      doubleHopChance: type === 'purple' ? 0.3 : 0, // 30% chance purple hops twice
      doubleHopQueued: false,
    });
    // Claim starting tile (snails convert tiles to spike, zombies use gray)
    if (type === 'snail') {
      Grid.set(col, row, TILE_SPIKE);
    } else {
      Grid.set(col, row, tileState);
    }
  },

  update(dt) {
    for (const enemy of this.list) {
      if (!enemy.alive) continue;

      // Handle hopping animation
      if (enemy.isHopping) {
        enemy.hopTimer -= dt;
        if (enemy.hopTimer <= 0) {
          enemy.isHopping = false;
          // Snails convert tiles to spike permanently on landing
          if (enemy.type === 'snail') {
            Grid.set(enemy.col, enemy.row, TILE_SPIKE);
            if (Audio.sfxSnailMove) Audio.sfxSnailMove();
          } else {
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
          // Teleport to random empty-ish tile
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

      // Check for queued double hop
      if (enemy.doubleHopQueued) {
        enemy.doubleHopQueued = false;
        // Immediately trigger another move
        enemy.moveCooldown = 0;
      }

      // Choose direction
      let dir;
      if (enemy.type === 'purple') {
        // Chase player
        dir = this._chaseDirection(enemy);
      } else if (enemy.type === 'snail') {
        // Snails move randomly
        dir = Math.floor(Math.random() * 4);
      } else {
        // Random movement
        dir = Math.floor(Math.random() * 4);
      }

      const newCol = enemy.col + DIR_DX[dir];
      const newRow = enemy.row + DIR_DY[dir];

      if (Grid.inBounds(newCol, newRow)) {
        const tile = Grid.get(newCol, newRow);
        // Snails can move anywhere, others can't move onto spike/water
        const canMove = enemy.type === 'snail' || (tile !== TILE_SPIKE && tile !== TILE_WATER);
        if (canMove) {
          enemy.hopFromCol = enemy.col;
          enemy.hopFromRow = enemy.row;
          enemy.col = newCol;
          enemy.row = newRow;
          enemy.isHopping = true;
          enemy.hopTimer = HOP_DURATION;

          // Snails convert tiles to spike permanently
          if (enemy.type === 'snail') {
            Grid.set(newCol, newRow, TILE_SPIKE);
          }

          Audio.sfxEnemyHop();

          // Purple frogs have a chance to hop twice
          if (enemy.type === 'purple' && Math.random() < enemy.doubleHopChance && !enemy.doubleHopQueued) {
            enemy.doubleHopQueued = true;
          }
        }
      }
    }
  },

  _chaseDirection(enemy) {
    const dx = Player.col - enemy.col;
    const dy = Player.row - enemy.row;
    // Prefer the axis with greater distance, with some randomness
    if (Math.random() < 0.08) return Math.floor(Math.random() * 4); // 8% random (down from 20%)
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? DIR_RIGHT : DIR_LEFT;
    } else {
      return dy > 0 ? DIR_DOWN : DIR_UP;
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
      const arc = -Math.sin(t * Math.PI) * 6;
      return { x, y: baseY + arc };
    }
    return { x: targetX, y: targetY };
  },

  // Check if any enemy is at the same grid position as the player
  checkCollisionWithPlayer() {
    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      if (enemy.col === Player.col && enemy.row === Player.row) {
        return true;
      }
    }
    return false;
  },

  // Remove a captured enemy
  capture(enemy) {
    enemy.alive = false;
    // Convert all tiles of this enemy's color to green
    Grid.convertAll(enemy.tileState, TILE_GREEN);
    // Score: 100 base + 50 per tile they had
    const bonus = Grid.count(TILE_GREEN); // approximate
    Player.addScore(100);
    Audio.sfxCapture();
  },

  // Remove dead enemies from list
  cleanup() {
    this.list = this.list.filter(e => e.alive);
  },
};
