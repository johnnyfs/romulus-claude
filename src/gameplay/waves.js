// Wave system - escalating difficulty with structured progression
const Waves = {
  current: 1,
  targetPercent: 0.65,
  timer: 0,
  waveStartTime: 0,
  waveElapsed: 0, // Accumulated elapsed time (pauses don't count)
  hurryUpPlayed: false,
  snailsSpawned: 0,
  zombieLevel: 0, // 0 = normal, 1 = after wave 10 (enemy tiles need 2 hops), 2 = after wave 20 (fatal tiles)

  // Explicit wave table: each entry lists enemy counts by type.
  // Swamp Day (1-5), Swamp Dusk (6-9), Zombie (10), City Day (11-14).
  // Enemy types: red, purple, blue, zombie, ladybug, snake, smart
  // Zombie waves (every 10th) are handled separately.
  _waveTable: {
    1:  { red: 1 },
    2:  { red: 1, ladybug: 1 },
    3:  { red: 2, ladybug: 1 },
    4:  { red: 2, purple: 1, ladybug: 1 },
    5:  { red: 2, purple: 1, ladybug: 1, snake: 1 },
    // Wave 6: Swamp Dusk begins, first speed increase
    6:  { red: 2, purple: 1, blue: 1 },
    7:  { red: 2, purple: 1, blue: 1, ladybug: 1 },
    8:  { red: 2, purple: 2, blue: 1, ladybug: 1, snake: 1 },
    9:  { red: 2, purple: 2, blue: 2, ladybug: 1, snake: 1 },
    // Wave 10: Zombie wave (Swamp Night) — 4 zombies, introduces double-tap (zombieLevel 1)
    // Wave 11: City Daytime begins
    11: { smart: 1 },
    12: { smart: 1, red: 1 },
    13: { smart: 1, red: 1, ladybug: 1 },
    14: { smart: 1, red: 2, ladybug: 1 },
    // Wave 15+: City Dusk, generated procedurally
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

    // Fill percentage progression - matches environment phases
    if (wave <= 5) this.targetPercent = 0.65;       // Swamp Day
    else if (wave <= 9) this.targetPercent = 0.70;   // Swamp Dusk
    else if (wave === 10) this.targetPercent = 0.70; // Zombie wave
    else if (wave <= 14) this.targetPercent = 0.75;  // City Day
    else if (wave <= 19) this.targetPercent = 0.80;  // City Dusk
    else if (wave === 20) this.targetPercent = 0.80; // Zombie wave
    else this.targetPercent = 0.85;                  // Beyond

    // Wave progression logic:
    // Waves 1-5: Swamp Day
    // Waves 6-9: Swamp Dusk (first speed increase)
    // Wave 10: Zombie wave (Swamp Night)
    // Waves 11-14: City Day
    // Waves 15-19: City Dusk (procedural)
    // Wave 20: Zombie wave
    // Pattern: every 10th wave is a zombie wave
    const isArchitectWave = (wave >= 10 && wave % 10 !== 0); // Cityscape from wave 10 onward (non-zombie)
    const isZombieWave = (wave % 10 === 0); // Wave 10, 20, 30...
    this.isArchitectWave = isArchitectWave || (wave >= 10);

    // Zombie evolution level — persists after zombie waves
    if (wave > 20) this.zombieLevel = 2;
    else if (wave > 10) this.zombieLevel = 1;
    else this.zombieLevel = 0;

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

    if (isZombieWave) {
      this._spawnZombieWave(wave);
    } else {
      this._spawnWaveEnemies(wave);
    }

    // Speed scaling: starting wave 6 (Swamp Dusk), reduce moveInterval by 20ms per wave
    // Minimum moveInterval: 250ms
    if (wave > 5) {
      for (const enemy of Enemies.list) {
        enemy.moveInterval = Math.max(250, enemy.moveInterval - (wave - 5) * 20);
      }
    }
  },

  // Spawn zombie-only wave. W10=4 zombies, W20=5, W30+=min(6, 4+floor((wave-10)/10)).
  _spawnZombieWave(wave) {
    let numZombies;
    if (wave <= 10) numZombies = 4;
    else if (wave <= 20) numZombies = 5;
    else numZombies = Math.min(6, 4 + Math.floor((wave - 10) / 10));

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

  // Generate wave config for waves beyond the explicit table (15+).
  // Base from wave 14: 1 smart, 2 red, 1 ladybug. Scale up gradually.
  // Waves 15-19 are City Dusk; beyond that continues scaling.
  _generateWaveConfig(wave) {
    const tier = wave - 14; // 1, 2, 3, 4, 5 for waves 15-19
    const config = {};
    config.smart = Math.min(3, 1 + Math.floor(tier / 2));
    config.red = Math.min(4, 2 + Math.floor(tier / 2));
    config.purple = Math.min(3, Math.floor(tier / 2));
    if (tier >= 2) config.blue = Math.min(2, Math.floor((tier - 1) / 2));
    if (tier >= 1) config.snake = Math.min(2, Math.floor(tier / 3));
    config.ladybug = 1;
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
