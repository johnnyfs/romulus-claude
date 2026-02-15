// Wave system - escalating difficulty
const Waves = {
  current: 1,
  targetPercent: 0.70,
  timer: 0,

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

    const wave = this.current;
    this.targetPercent = wave <= 2 ? 0.70 : wave <= 6 ? 0.75 : wave <= 10 ? 0.80 : 0.85;

    // Spawn enemies based on wave (ensuring safe spawn positions)
    if (wave <= 2) {
      // 1 red frog
      if (this.isSafeSpawnPosition(2, 2)) {
        Enemies.spawn('red', 2, 2);
      } else {
        Enemies.spawn('red', 1, 1);
      }
    } else if (wave <= 4) {
      // 2 red frogs
      if (this.isSafeSpawnPosition(2, 2)) {
        Enemies.spawn('red', 2, 2);
      } else {
        Enemies.spawn('red', 1, 1);
      }
      Enemies.spawn('red', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 6) {
      // 1 red + 1 purple
      if (this.isSafeSpawnPosition(2, 2)) {
        Enemies.spawn('red', 2, 2);
      } else {
        Enemies.spawn('red', 1, 1);
      }
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 8) {
      // 2 red + 1 purple
      if (this.isSafeSpawnPosition(2, 2)) {
        Enemies.spawn('red', 2, 2);
      } else {
        Enemies.spawn('red', 1, 1);
      }
      Enemies.spawn('red', GRID_COLS - 3, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 10) {
      // 1 red + 1 purple + 1 blue
      if (this.isSafeSpawnPosition(2, 2)) {
        Enemies.spawn('red', 2, 2);
      } else {
        Enemies.spawn('red', 1, 1);
      }
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
      Enemies.spawn('blue', 2, GRID_ROWS - 3);
    } else {
      // 11+: scale up
      const numRed = Math.min(3, 1 + Math.floor((wave - 10) / 2));
      const numPurple = Math.min(2, 1 + Math.floor((wave - 10) / 3));
      const numBlue = 1;
      for (let i = 0; i < numRed; i++) {
        const col = 1 + i * 4;
        const row = 1 + i * 2;
        if (this.isSafeSpawnPosition(col, row)) {
          Enemies.spawn('red', col, row);
        } else {
          Enemies.spawn('red', 0, i);
        }
      }
      for (let i = 0; i < numPurple; i++) {
        Enemies.spawn('purple', GRID_COLS - 2 - i * 4, GRID_ROWS - 2 - i * 2);
      }
      for (let i = 0; i < numBlue; i++) {
        const col = Math.floor(GRID_COLS / 2);
        if (this.isSafeSpawnPosition(col, 1)) {
          Enemies.spawn('blue', col, 1);
        } else {
          Enemies.spawn('blue', col, 0);
        }
      }
    }

    // Speed up enemies in later waves
    if (wave > 4) {
      for (const enemy of Enemies.list) {
        enemy.moveInterval = Math.max(300, enemy.moveInterval - (wave - 4) * 30);
      }
    }
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
