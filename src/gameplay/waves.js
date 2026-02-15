// Wave system - escalating difficulty
const Waves = {
  current: 1,
  targetPercent: 0.70,
  timer: 0,
  waveStartTime: 0,
  hurryUpPlayed: false,
  snailsSpawned: 0,

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
    this.targetPercent = wave <= 2 ? 0.70 : wave <= 8 ? 0.75 : wave <= 14 ? 0.80 : 0.85;

    // Wave progression:
    // 1-2: 1 red (tutorial)
    // 3-4: 2 reds
    // 5-6: 1 red + 1 purple (chaser intro)
    // 7-8: 2 red + 1 purple
    // 9-10: 1 red + 1 purple + 1 blue (teleporter intro)
    // 11: ZOMBIE WAVE! 2 zombies only (Q*bert style special wave)
    // 12-13: 1 red + 1 purple + 1 blue + 1 zombie (mix)
    // 14: ZOMBIE WAVE! 4 zombies
    // 15+: escalating mix with periodic zombie waves every 5th wave

    const isZombieWave = (wave === 11 || wave === 14 || (wave > 14 && (wave - 14) % 5 === 0));

    if (isZombieWave) {
      // Special zombie-only wave!
      const numZombies = wave === 11 ? 2 : wave === 14 ? 4 : Math.min(6, 2 + Math.floor((wave - 14) / 5));
      const positions = [[2,2],[GRID_COLS-3,2],[2,GRID_ROWS-3],[GRID_COLS-3,GRID_ROWS-3],[4,6],[GRID_COLS-5,6]];
      for (let i = 0; i < numZombies && i < positions.length; i++) {
        const [c,r] = positions[i];
        if (this.isSafeSpawnPosition(c, r)) {
          Enemies.spawn('zombie', c, r);
        } else {
          Enemies.spawn('zombie', c + 1, r + 1);
        }
      }
    } else if (wave <= 2) {
      Enemies.spawn('red', 2, 2);
    } else if (wave <= 4) {
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('red', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 6) {
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 8) {
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('red', GRID_COLS - 3, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
    } else if (wave <= 10) {
      Enemies.spawn('red', 2, 2);
      Enemies.spawn('purple', GRID_COLS - 3, GRID_ROWS - 3);
      Enemies.spawn('blue', 2, GRID_ROWS - 3);
    } else {
      // 12+ (non-zombie): escalating mix
      const numRed = Math.min(3, 1 + Math.floor((wave - 12) / 3));
      const numPurple = Math.min(2, 1 + Math.floor((wave - 12) / 4));
      const numBlue = 1;
      const numZombie = Math.min(2, Math.floor((wave - 12) / 3));
      for (let i = 0; i < numRed; i++) {
        Enemies.spawn('red', 1 + i * 4, 1 + i * 2);
      }
      for (let i = 0; i < numPurple; i++) {
        Enemies.spawn('purple', GRID_COLS - 2 - i * 4, GRID_ROWS - 2 - i * 2);
      }
      Enemies.spawn('blue', Math.floor(GRID_COLS / 2), 1);
      for (let i = 0; i < numZombie; i++) {
        Enemies.spawn('zombie', 2 + i * 6, Math.floor(GRID_ROWS / 2));
      }
    }

    // Speed up enemies in later waves
    if (wave > 4) {
      for (const enemy of Enemies.list) {
        enemy.moveInterval = Math.max(300, enemy.moveInterval - (wave - 4) * 30);
      }
    }
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
