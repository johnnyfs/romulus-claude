// Wave system - escalating difficulty
const Waves = {
  current: 1,
  targetPercent: 0.70,
  timer: 0,

  init() {
    this.current = 1;
    this.setupWave();
  },

  setupWave() {
    Enemies.init();
    Grid.init();
    Player.reset();

    const wave = this.current;
    this.targetPercent = wave <= 2 ? 0.70 : wave <= 6 ? 0.75 : wave <= 10 ? 0.80 : 0.85;

    // Spawn enemies based on wave
    if (wave <= 2) {
      // 1 red frog
      Enemies.spawn('red', 2, 2);
    } else if (wave <= 4) {
      // 2 red frogs
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('red', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 6) {
      // 1 red + 1 purple
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 8) {
      // 2 red + 1 purple
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('red', GRID_COLS - 3, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 10) {
      // 1 red + 1 purple + 1 blue
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
      Enemies.spawn('blue', 2, GRID_ROWS - 3);
    } else {
      // 11+: scale up
      const numRed = Math.min(3, 1 + Math.floor((wave - 10) / 2));
      const numPurple = Math.min(2, 1 + Math.floor((wave - 10) / 3));
      const numBlue = 1;
      for (let i = 0; i < numRed; i++) {
        Enemies.spawn('red', 1 + i * 4, 1 + i * 2);
      }
      for (let i = 0; i < numPurple; i++) {
        Enemies.spawn('purple', GRID_COLS - 2 - i * 4, GRID_ROWS - 2 - i * 2);
      }
      for (let i = 0; i < numBlue; i++) {
        Enemies.spawn('blue', Math.floor(GRID_COLS / 2), 1);
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
