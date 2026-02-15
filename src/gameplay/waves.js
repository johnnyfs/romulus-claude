// Wave system - escalating difficulty with structured progression
const Waves = {
  current: 1,
  targetPercent: 0.65,
  timer: 0,
  waveStartTime: 0,
  hurryUpPlayed: false,
  snailsSpawned: 0,

  // Explicit wave table: each entry lists enemy counts by type.
  // Every wave is harder than the last (more enemies, new types, or higher fill%).
  // Enemy types: red, purple, blue, zombie, ladybug, snake, smart
  // Zombie waves (every 5th) are handled separately.
  _waveTable: {
    1:  { red: 1 },
    2:  { red: 1 },
    3:  { red: 2 },
    4:  { red: 2, ladybug: 1 },
    // Wave 5: zombie wave
    6:  { red: 2, purple: 1 },
    7:  { red: 2, purple: 1, ladybug: 1 },
    8:  { red: 3, purple: 1 },
    9:  { red: 2, purple: 1, blue: 1 },
    // Wave 10: zombie wave
    11: { red: 2, purple: 1, blue: 1, snake: 1 },
    12: { red: 3, purple: 1, blue: 1, snake: 1 },
    13: { red: 3, purple: 2, blue: 1, ladybug: 1 },
    14: { red: 3, purple: 2, blue: 1, snake: 1, smart: 1 },
    // Wave 15: zombie wave
    16: { red: 3, purple: 2, blue: 2, snake: 1, smart: 1 },
    17: { red: 4, purple: 2, blue: 2, snake: 1, ladybug: 1 },
    18: { red: 4, purple: 2, blue: 2, snake: 2, smart: 1 },
    19: { red: 4, purple: 3, blue: 2, snake: 2, smart: 1, ladybug: 1 },
    // Wave 20: zombie wave
  },

  init() {
    this.current = 1;
    this.setupWave();
  },

  // Check if a position is safe for enemy spawn (not on or adjacent to player start)
  isSafeSpawnPosition(col, row) {
    const playerCol = Math.floor(GRID_COLS / 2);
    const playerRow = Math.floor(GRID_ROWS / 2);

    // Check if on player position
    if (col === playerCol && row === playerRow) return false;

    // Check if adjacent to player (orthogonal neighbors)
    for (let d = 0; d < 4; d++) {
      const nc = playerCol + DIR_DX[d];
      const nr = playerRow + DIR_DY[d];
      if (col === nc && row === nr) return false;
    }

    return true;
  },

  setupWave() {
    Enemies.init();
    Grid.init();
    Player.reset();
    this.waveStartTime = performance.now();
    this.hurryUpPlayed = false;
    this.snailsSpawned = 0;

    const wave = this.current;

    // Fill percentage progression - gradual increase
    if (wave <= 3) this.targetPercent = 0.65;
    else if (wave <= 6) this.targetPercent = 0.70;
    else if (wave <= 9) this.targetPercent = 0.75;
    else if (wave <= 12) this.targetPercent = 0.78;
    else if (wave <= 15) this.targetPercent = 0.80;
    else if (wave <= 18) this.targetPercent = 0.82;
    else this.targetPercent = 0.85;

    // Zombie waves every 5th wave
    const isZombieWave = (wave % 5 === 0);

    if (isZombieWave) {
      this._spawnZombieWave(wave);
    } else {
      this._spawnWaveEnemies(wave);
    }

    // Speed scaling: starting wave 5, reduce moveInterval by 20ms per wave
    // Minimum moveInterval: 250ms
    if (wave > 4) {
      for (const enemy of Enemies.list) {
        enemy.moveInterval = Math.max(250, enemy.moveInterval - (wave - 4) * 20);
      }
    }
  },

  // Spawn zombie-only wave. Zombie count = wave / 5, capped at 6.
  _spawnZombieWave(wave) {
    const numZombies = Math.min(6, Math.ceil(wave / 5));
    const positions = [
      [2, 2],
      [GRID_COLS - 3, 2],
      [2, GRID_ROWS - 3],
      [GRID_COLS - 3, GRID_ROWS - 3],
      [4, 6],
      [GRID_COLS - 5, 6],
    ];
    for (let i = 0; i < numZombies && i < positions.length; i++) {
      const [c, r] = positions[i];
      if (this.isSafeSpawnPosition(c, r)) {
        Enemies.spawn('zombie', c, r);
      } else {
        Enemies.spawn('zombie', c + 1, r + 1);
      }
    }
  },

  // Spawn enemies for a normal (non-zombie) wave.
  // Uses explicit wave table for waves 1-19, formula for 20+.
  _spawnWaveEnemies(wave) {
    const config = this._waveTable[wave] || this._generateWaveConfig(wave);
    const enemyList = [];

    // Build flat list of enemy types to spawn
    for (const [type, count] of Object.entries(config)) {
      for (let i = 0; i < count; i++) {
        enemyList.push(type);
      }
    }

    // Get spawn positions and spawn enemies
    const positions = this._getSpawnPositions(enemyList.length);
    for (let i = 0; i < enemyList.length; i++) {
      const [c, r] = positions[i];
      Enemies.spawn(enemyList[i], c, r);
    }
  },

  // Generate wave config for waves beyond the explicit table.
  // Each enemy type scales gradually. Every wave adds at least one
  // unit of difficulty compared to the previous non-zombie wave.
  _generateWaveConfig(wave) {
    // Find the effective wave index (skip zombie waves for scaling)
    // Count of non-zombie waves up to this point determines scaling
    const nonZombieWave = wave - Math.floor(wave / 5);

    // Base counts scale with non-zombie wave number
    const red = Math.min(6, 3 + Math.floor((nonZombieWave - 15) / 3));
    const purple = Math.min(4, 2 + Math.floor((nonZombieWave - 15) / 4));
    const blue = Math.min(3, 2 + Math.floor((nonZombieWave - 17) / 4));
    const snake = Math.min(3, 1 + Math.floor((nonZombieWave - 15) / 5));
    const smart = Math.min(3, 1 + Math.floor((nonZombieWave - 16) / 5));
    const ladybug = Math.min(2, 1 + Math.floor((nonZombieWave - 17) / 6));

    const config = {};
    if (red > 0) config.red = red;
    if (purple > 0) config.purple = purple;
    if (blue > 0) config.blue = blue;
    if (snake > 0) config.snake = snake;
    if (smart > 0) config.smart = smart;
    if (ladybug > 0) config.ladybug = ladybug;

    return config;
  },

  // Get spread-out spawn positions for enemies.
  // Uses corner and edge positions, avoiding player start (center).
  _getSpawnPositions(count) {
    const positions = [
      [2, 2],
      [GRID_COLS - 3, 2],
      [2, GRID_ROWS - 3],
      [GRID_COLS - 3, GRID_ROWS - 3],
      [Math.floor(GRID_COLS / 2), 1],
      [Math.floor(GRID_COLS / 2), GRID_ROWS - 2],
      [1, Math.floor(GRID_ROWS / 2)],
      [GRID_COLS - 2, Math.floor(GRID_ROWS / 2)],
      [4, 3],
      [GRID_COLS - 5, 3],
      [4, GRID_ROWS - 4],
      [GRID_COLS - 5, GRID_ROWS - 4],
      [3, 1],
      [GRID_COLS - 4, 1],
      [3, GRID_ROWS - 2],
      [GRID_COLS - 4, GRID_ROWS - 2],
    ];

    const result = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      if (i < positions.length) {
        const [c, r] = positions[i];
        if (this.isSafeSpawnPosition(c, r) && !used.has(`${c},${r}`)) {
          result.push([c, r]);
          used.add(`${c},${r}`);
        } else {
          // Nudge to avoid conflicts
          const nc = c + 1;
          const nr = r + 1;
          result.push([nc, nr]);
          used.add(`${nc},${nr}`);
        }
      } else {
        // Overflow: generate additional positions along edges
        const c = 1 + (i % (GRID_COLS - 2));
        const r = (i % 2 === 0) ? 1 : GRID_ROWS - 2;
        if (this.isSafeSpawnPosition(c, r) && !used.has(`${c},${r}`)) {
          result.push([c, r]);
          used.add(`${c},${r}`);
        } else {
          result.push([c + 1, r]);
          used.add(`${c + 1},${r}`);
        }
      }
    }

    return result;
  },

  // Update wave timer and spawn snails
  update(dt) {
    const elapsedTime = performance.now() - this.waveStartTime;

    // Hurry up warning at 30 seconds
    if (elapsedTime >= 30000 && !this.hurryUpPlayed) {
      this.hurryUpPlayed = true;
      if (Audio.sfxHurryUp) {
        Audio.sfxHurryUp();
      }
    }

    // Spawn snails at 35s, 45s, 55s
    if (elapsedTime >= 35000 && this.snailsSpawned === 0) {
      this._spawnSnail();
      this.snailsSpawned++;
    } else if (elapsedTime >= 45000 && this.snailsSpawned === 1) {
      this._spawnSnail();
      this.snailsSpawned++;
    } else if (elapsedTime >= 55000 && this.snailsSpawned === 2) {
      this._spawnSnail();
      this.snailsSpawned++;
    }
  },

  // Spawn a snail at a random edge position
  _spawnSnail() {
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let col, row;
    if (edge === 0) {
      col = Math.floor(Math.random() * GRID_COLS);
      row = 0;
    } else if (edge === 1) {
      col = GRID_COLS - 1;
      row = Math.floor(Math.random() * GRID_ROWS);
    } else if (edge === 2) {
      col = Math.floor(Math.random() * GRID_COLS);
      row = GRID_ROWS - 1;
    } else {
      col = 0;
      row = Math.floor(Math.random() * GRID_ROWS);
    }
    Enemies.spawn('snail', col, row);
  },

  // Check if wave is complete
  checkWinCondition() {
    return Grid.fillPercent(TILE_GREEN) >= this.targetPercent;
  },

  // Advance to next wave
  nextWave() {
    this.current++;
    this.setupWave();
  },
};
