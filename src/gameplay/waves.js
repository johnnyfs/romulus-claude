// Wave system - escalating difficulty with structured progression
const Waves = {
  current: 1,
  targetPercent: 0.65,
  timer: 0,
  waveStartTime: 0,
  waveElapsed: 0, // Accumulated elapsed time (pauses don't count)
  hurryUpPlayed: false,
  snailsSpawned: 0,
  zombieLevel: 0, // 0 = normal, 1 = after wave 5 (enemy tiles need 2 hops), 2 = after wave 15 (3 hops)

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
    9:  { red: 2, purple: 1, blue: 1, smart: 1 },
    // Wave 10: architect wave (smart frogs only)
    11: { red: 2, purple: 1, blue: 1, snake: 1, smart: 1 },   // +architect (cityscape)
    12: { red: 3, purple: 1, blue: 1, snake: 1, smart: 1 },
    13: { red: 3, purple: 2, blue: 1, ladybug: 1, smart: 1 },
    14: { red: 3, purple: 2, blue: 1, snake: 1, smart: 2 },
    // Wave 15: zombie wave
    16: { red: 3, purple: 2, blue: 2, snake: 1, smart: 2 },
    17: { red: 4, purple: 2, blue: 2, snake: 1, smart: 1, ladybug: 1 },
    18: { red: 4, purple: 2, blue: 2, snake: 2, smart: 2 },
    19: { red: 4, purple: 3, blue: 2, snake: 2, smart: 2, ladybug: 1 },
    // Wave 20: architect-only wave (3 architects)
  },

  // Sky/atmosphere state (day/night cycle)
  isNighttime: false,
  isArchitectWave: false,
  skyColor: null,       // Set in setupWave; fallback via || in draw code
  skyDarkColor: null,
  waterColor: null,

  // Nighttime stars (generated once per night wave)
  stars: [],
  _starSeed: 0,

  init() {
    this.current = 1;
    this.setupWave();
  },

  // Generate random star positions for nighttime sky
  _generateStars() {
    this.stars = [];
    // Deterministic PRNG so stars are stable within a wave
    let seed = this.current * 7919 + 31;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };

    const numStars = 6 + Math.floor(rand() * 4); // 6-9 stars
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: 2 + Math.floor(rand() * 252),   // Across full HUD width
        y: 1 + Math.floor(rand() * 28),     // y 1-28 (HUD + reed area, avoid edges)
        twinkle: rand() < 0.4,              // 40% of stars twinkle
      });
    }
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
    // Reset bonus items and powerups between waves
    if (typeof Bonuses !== 'undefined') {
      Bonuses.init();
    }
    this.waveStartTime = performance.now();
    this.waveElapsed = 0;
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

    // Wave progression logic:
    // Waves 1-4: normal (reeds/lilypads)
    // Wave 5: zombie wave (night)
    // Waves 6-9: normal
    // Wave 10: first architect wave (cityscape, smart frogs only)
    // Waves 11+: ALWAYS cityscape. Mix of enemies including architects.
    // Wave 15: zombie wave (night)
    // Wave 20: architect-only wave
    const isArchitectWave = (wave >= 10); // Cityscape from wave 10 onward
    const isZombieWave = (wave === 5 || wave === 15 || (wave > 15 && wave % 10 === 5));
    const isArchitectOnlyWave = (wave % 10 === 0 && wave >= 10); // Pure architect waves (10, 20, 30...)
    this.isArchitectWave = isArchitectWave;

    // Zombie evolution level — persists after zombie waves
    if (wave > 15) this.zombieLevel = 2;
    else if (wave > 5) this.zombieLevel = 1;
    else this.zombieLevel = 0;

    // Calculate fatal tile duration for zombieLevel 2
    // "last two tiles a standard red frog leaves behind" = 2 * red frog's moveInterval
    if (this.zombieLevel >= 2) {
      const redBaseInterval = 800;
      const speedReduction = wave > 5 ? (wave - 5) * 20 : 0;
      const redInterval = Math.max(250, redBaseInterval - speedReduction);
      Grid.fatalDuration = redInterval * 2;
    } else {
      Grid.fatalDuration = 0;
    }

    // Set sky atmosphere
    this.isNighttime = isZombieWave;
    if (isZombieWave) {
      // Zombie waves: night sky
      this.skyColor = PALETTE.SKY_NIGHT;
      this.skyDarkColor = PALETTE.SKY_NIGHT_DARK;
      this.waterColor = PALETTE.WATER_BG;
    } else if (isArchitectWave) {
      // Architect/cityscape waves (10+): dusk purple
      this.skyColor = '#2a1a3a';
      this.skyDarkColor = '#2a1a3a';
      this.waterColor = '#1a1a2a';
    } else {
      // Normal daytime waves (1-9 except 5)
      this.skyColor = PALETTE.SKY_DAY;
      this.skyDarkColor = PALETTE.SKY_DAY_DARK;
      this.waterColor = PALETTE.WATER_DAY;
    }

    // Generate stars for nighttime zombie waves
    if (isZombieWave) {
      this._generateStars();
    } else {
      this.stars = [];
    }

    if (isArchitectOnlyWave) {
      this._spawnArchitectWave(wave);
    } else if (isZombieWave) {
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

  // Spawn zombie-only wave. W5=2 zombies, W15=4, then +1 per zombie wave after, cap 6.
  _spawnZombieWave(wave) {
    let numZombies;
    if (wave <= 5) numZombies = 2;
    else if (wave <= 15) numZombies = 4;
    else numZombies = Math.min(6, 4 + Math.floor((wave - 15) / 10));

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

  // Spawn architect-only wave: smart frogs. Count = wave/10 + 1, so wave 10 = 2, wave 20 = 3, etc.
  _spawnArchitectWave(wave) {
    const numArchitects = Math.min(6, 1 + Math.ceil(wave / 10));
    for (let i = 0; i < numArchitects; i++) {
      const edge = Math.floor(Math.random() * 4);
      let col, row;
      if (edge === 0) { col = Math.floor(Math.random() * GRID_COLS); row = 0; }
      else if (edge === 1) { col = GRID_COLS - 1; row = Math.floor(Math.random() * GRID_ROWS); }
      else if (edge === 2) { col = Math.floor(Math.random() * GRID_COLS); row = GRID_ROWS - 1; }
      else { col = 0; row = Math.floor(Math.random() * GRID_ROWS); }
      Enemies.queueEnemy('smart', col, row);
    }
    Enemies.startDeployment();
  },

  // Spawn enemies for a normal (non-zombie) wave.
  // Enemies enter from edges after a delay — never present at wave start.
  _spawnWaveEnemies(wave) {
    const config = this._waveTable[wave] || this._generateWaveConfig(wave);
    const enemyList = [];

    // Build flat list of enemy types to spawn
    for (const [type, count] of Object.entries(config)) {
      for (let i = 0; i < count; i++) {
        enemyList.push(type);
      }
    }

    // Queue all enemies for delayed edge deployment
    for (let i = 0; i < enemyList.length; i++) {
      const edge = Math.floor(Math.random() * 4);
      let col, row;
      if (edge === 0) { col = Math.floor(Math.random() * GRID_COLS); row = 0; }
      else if (edge === 1) { col = GRID_COLS - 1; row = Math.floor(Math.random() * GRID_ROWS); }
      else if (edge === 2) { col = Math.floor(Math.random() * GRID_COLS); row = GRID_ROWS - 1; }
      else { col = 0; row = Math.floor(Math.random() * GRID_ROWS); }
      Enemies.queueEnemy(enemyList[i], col, row);
    }
    // Start smart deployment: frogs on 5s interval, non-frogs interleaved between
    Enemies.startDeployment();
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
    this.waveElapsed += dt; // Accumulate only when game is running (not paused)
    const elapsedTime = this.waveElapsed;

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
