// Main game loop - ties everything together
const Game = {
  state: STATE_TITLE,
  lastTime: 0,
  waveClearTimer: 0,
  waveClearPhase: 0,
  deathTimer: 0,
  highScore: 0,
  lastClearBonus: 0, // Stored for display during clear phase

  init() {
    Renderer.init();
    Input.init();
    Audio.init();
    Sprites.init();
    Decoration.init();
    this.state = STATE_TITLE;
  },

  start() {
    Player.lives = 3;
    Player.score = 0;
    Waves.init();
    this.state = STATE_PLAYING;
    Audio.startMusic();
  },

  update(dt) {
    switch (this.state) {
      case STATE_TITLE:
        if (Input.wasPressed('Enter') || Input.wasPressed('Space')) {
          this.start();
        }
        break;

      case STATE_PLAYING:
        // Pause
        if (Input.wasPressed('Enter') || Input.wasPressed('Escape')) {
          this.state = STATE_PAUSED;
          break;
        }

        // When pipeline is animating, conditionally freeze movement
        if (Encircle.isAnimating()) {
          if (Encircle.movementFrozen) {
            // Full freeze: only update encircle pipeline
            Encircle.update(dt);
            // After pipeline completes, check for wave clear
            if (!Encircle.isAnimating() && Waves.checkWinCondition()) {
              const clearBonus = this._calculateClearBonus();
              Player.addScore(clearBonus);
              this.lastClearBonus = clearBonus;
              this.state = STATE_WAVE_CLEAR;
              this.waveClearPhase = CLEAR_SHOW_MESSAGE;
              this.waveClearTimer = 1000;
              Audio.sfxWaveClear();
            }
            break;
          }
          // Not frozen: pipeline animates alongside normal gameplay
          // (kill/bonus animations play while player keeps moving)
          Encircle.update(dt);
          // After pipeline completes during unfrozen play, just continue —
          // win condition is already met or will be checked below
        }

        Player.update(dt);
        Enemies.update(dt);
        if (!Encircle.isAnimating()) {
          Encircle.update(dt);
        }
        Waves.update(dt);
        // Continuously check encirclement (not just on player hop)
        Encircle.checkAll();

        // Check if player died (spike, enemy, etc)
        if (Player.justDied) {
          Player.justDied = false;
          this.state = STATE_DYING;
          this.deathTimer = 1500;
          break;
        }

        // Collision check with enemies (skip if invincible)
        if (Enemies.checkCollisionWithPlayer() && !Player.isHopping && !Player.invincible) {
          Player.die();
          Player.justDied = false;
          this.state = STATE_DYING;
          this.deathTimer = 1500;
          break;
        }

        // Win condition check (non-animating path)
        if (!Player.isHopping && Waves.checkWinCondition()) {
          const clearBonus = this._calculateClearBonus();
          Player.addScore(clearBonus);
          this.lastClearBonus = clearBonus;
          this.state = STATE_WAVE_CLEAR;
          this.waveClearPhase = CLEAR_SHOW_MESSAGE;
          this.waveClearTimer = 1000;
          Audio.sfxWaveClear();
        }
        break;

      case STATE_WAVE_CLEAR:
        this.waveClearTimer -= dt;
        if (this.waveClearTimer <= 0) {
          if (this.waveClearPhase === CLEAR_SHOW_MESSAGE) {
            // Phase 1 done, start bonus clear phase
            this.waveClearPhase = CLEAR_BONUS_FILL;
            this.waveClearTimer = 800; // Brief bonus fill flash
            // Clear remaining enemies (they escaped)
            for (const enemy of Enemies.list) {
              enemy.alive = false;
            }
            Enemies.cleanup();
          } else if (this.waveClearPhase === CLEAR_BONUS_FILL) {
            // Phase 2 done, show wave number
            this.waveClearPhase = CLEAR_SHOW_WAVE;
            this.waveClearTimer = 1200;
          } else {
            // Phase 3 done, next wave
            Waves.nextWave();
            this.state = STATE_PLAYING;
          }
        }
        break;

      case STATE_DYING:
        this.deathTimer -= dt;
        if (this.deathTimer <= 0) {
          if (Player.lives <= 0) {
            this.state = STATE_GAME_OVER;
            Audio.stopMusic();
            // Update high score
            if (Player.score > this.highScore) {
              this.highScore = Player.score;
            }
          } else {
            // Respawn
            Player.reset();
            Grid.init();
            Waves.setupWave();
            this.state = STATE_PLAYING;
          }
        }
        break;

      case STATE_GAME_OVER:
        if (Input.wasPressed('Enter') || Input.wasPressed('Space')) {
          this.state = STATE_TITLE;
        }
        break;

      case STATE_PAUSED:
        if (Input.wasPressed('Enter') || Input.wasPressed('Escape')) {
          this.state = STATE_PLAYING;
        }
        break;
    }
  },

  draw() {
    Renderer.clear();

    switch (this.state) {
      case STATE_TITLE:
        this._drawTitle();
        break;

      case STATE_PLAYING:
      case STATE_PAUSED:
        Grid.draw();
        Decoration.draw();
        Enemies.draw();
        Player.draw();
        Encircle.draw();
        HUD.draw();
        if (this.state === STATE_PAUSED) {
          // "PAUSED" = 6 chars * 8 = 48px, center = (256-48)/2 = 104
          Renderer.drawText('PAUSED', 104, 120, PALETTE.WHITE);
        }
        break;

      case STATE_WAVE_CLEAR:
        Grid.draw();
        Decoration.draw();
        Enemies.draw(); // Show enemies during phase 1
        Player.draw();
        Encircle.draw();
        HUD.draw();

        if (this.waveClearPhase === CLEAR_SHOW_MESSAGE) {
          // Phase 1: Show CLEAR! with board visible
          Renderer.drawText('CLEAR!', 104, 120, PALETTE.GREEN_LIGHT);
          // Show clear bonus below
          if (this.lastClearBonus > 0) {
            const bonusText = '+' + this.lastClearBonus;
            const bx = 128 - bonusText.length * 4; // Center text
            Renderer.drawText(bonusText, bx, 134, PALETTE.SCORE_COLOR);
          }
        } else if (this.waveClearPhase === CLEAR_BONUS_FILL) {
          // Phase 2: Flash remaining tiles (bonus clear effect)
          if (Math.floor(this.waveClearTimer / 100) % 2) {
            // Draw white flash over non-green tiles
            for (let r = 0; r < GRID_ROWS; r++) {
              for (let c = 0; c < GRID_COLS; c++) {
                if (Grid.get(c, r) !== TILE_GREEN) {
                  const x = c * TILE_SIZE;
                  const y = (r + GRID_OFFSET_Y) * TILE_SIZE;
                  Renderer.fillRect(x, y, TILE_SIZE, TILE_SIZE, 'rgba(255, 255, 255, 0.6)');
                }
              }
            }
          }
        } else {
          // Phase 3: Show wave number
          Renderer.drawText('WAVE ' + Waves.current, 88, 108, PALETTE.GREEN);
          Renderer.drawText('COMPLETE', 96, 120, PALETTE.GREEN_LIGHT);
        }
        break;

      case STATE_DYING:
        Grid.draw();
        Decoration.draw();
        Enemies.draw();
        HUD.draw();
        const deathPos = Player.getPixelPos();
        Renderer.drawSprite(Sprites.maripoga_death, deathPos.x, deathPos.y);
        break;

      case STATE_GAME_OVER:
        // "GAME OVER" = 9*8 = 72px, center = 92
        Renderer.drawText('GAME OVER', 92, 80, PALETTE.RED);
        Renderer.drawText('SCORE', 104, 100, PALETTE.WHITE);
        Renderer.drawText(String(Player.score), 128 - String(Player.score).length * 4, 112, PALETTE.SCORE_COLOR);
        if (this.highScore > 0) {
          Renderer.drawText('BEST', 112, 130, PALETTE.GREEN);
          Renderer.drawText(String(this.highScore), 128 - String(this.highScore).length * 4, 142, PALETTE.GREEN_LIGHT);
        }
        Renderer.drawText('PRESS ENTER', 84, 172, PALETTE.HUD_TEXT);
        break;
    }
  },

  // Calculate clear bonus: 10 pts per % over target, doubled if 100%
  _calculateClearBonus() {
    const actualPercent = Math.round(Grid.fillPercent(TILE_GREEN) * 100);
    const targetPercent = Math.round(Waves.targetPercent * 100);
    const overPercent = Math.max(0, actualPercent - targetPercent);
    let bonus = overPercent * 10;
    if (actualPercent >= 100) bonus *= 2;
    return bonus;
  },

  _drawTitle() {
    // Title screen — "MARIPOGA'S" = 10*8 = 80px, center = 88
    Renderer.drawText("MARIPOGA'S", 88, 56, PALETTE.GREEN);
    // "ERRAND" = 6*8 = 48px, center = 104
    Renderer.drawText('ERRAND', 104, 72, PALETTE.GREEN_LIGHT);

    // Draw Maripoga in the center
    const sprite = Sprites.getSprite('player', false);
    Renderer.drawSprite(sprite, 120, 100);

    // "PRESS ENTER" = 11*8 = 88px, center = 84
    Renderer.drawText('PRESS ENTER', 84, 160, PALETTE.HUD_TEXT);
    // "ARROWS TO HOP" = 13*8 = 104, center = 76
    Renderer.drawText('ARROWS TO HOP', 76, 180, PALETTE.NEUTRAL);
  },

  // Main loop
  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastTime, 50); // cap dt at 50ms
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();
    Input.clearFrame();

    requestAnimationFrame((t) => this.loop(t));
  },

  run() {
    this.init();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },
};

// Boot!
Game.run();
