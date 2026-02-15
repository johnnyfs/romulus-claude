// Main game loop - ties everything together
const Game = {
  state: STATE_TITLE,
  lastTime: 0,
  waveClearTimer: 0,
  deathTimer: 0,
  highScore: 0,

  init() {
    Renderer.init();
    Input.init();
    Audio.init();
    Sprites.init();
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

        Player.update(dt);
        Enemies.update(dt);
        Encircle.update(dt);
        // Continuously check encirclement (not just on player hop)
        Encircle.checkAll();

        // Collision check (skip if invincible)
        if (Enemies.checkCollisionWithPlayer() && !Player.isHopping && !Player.invincible) {
          Player.die();
          this.state = STATE_DYING;
          this.deathTimer = 1500;
          break;
        }

        // Score for claiming tiles
        // (handled in player landing)

        // Win condition (only check when not mid-hop)
        if (!Player.isHopping && Waves.checkWinCondition()) {
          this.state = STATE_WAVE_CLEAR;
          this.waveClearTimer = 2000;
          Audio.sfxWaveClear();
          // Time bonus
          Player.addScore(500);
        }
        break;

      case STATE_WAVE_CLEAR:
        this.waveClearTimer -= dt;
        if (this.waveClearTimer <= 0) {
          Waves.nextWave();
          this.state = STATE_PLAYING;
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
        Enemies.draw();
        Player.draw();
        Encircle.draw(); // Draw flash effects on top
        HUD.draw();
        if (this.state === STATE_PAUSED) {
          Renderer.drawText('PAUSED', 100, 128, PALETTE.WHITE, 8);
        }
        break;

      case STATE_WAVE_CLEAR:
        Grid.draw();
        Player.draw();
        HUD.draw();
        Renderer.drawText('WAVE ' + Waves.current + ' CLEAR!', 76, 120, PALETTE.GREEN, 8);
        break;

      case STATE_DYING:
        Grid.draw();
        Enemies.draw();
        HUD.draw();
        // Show death sprite instead of flashing
        const deathPos = Player.getPixelPos();
        Renderer.drawSprite(Sprites.maripoga_death, deathPos.x, deathPos.y);
        break;

      case STATE_GAME_OVER:
        Renderer.drawText('GAME OVER', 88, 110, PALETTE.RED, 8);
        Renderer.drawText('SCORE: ' + Player.score, 88, 130, PALETTE.WHITE, 8);
        if (this.highScore > 0) {
          Renderer.drawText('HIGH: ' + this.highScore, 88, 145, PALETTE.GREEN, 8);
        }
        Renderer.drawText('PRESS ENTER', 80, 170, PALETTE.HUD_TEXT, 8);
        break;
    }
  },

  _drawTitle() {
    // Title screen
    Renderer.drawText("MARIPOGA'S", 72, 60, PALETTE.GREEN, 8);
    Renderer.drawText('ERRAND', 96, 80, PALETTE.GREEN_LIGHT, 8);

    // Draw Maripoga in the center
    const sprite = Sprites.getSprite('player', false);
    Renderer.drawSprite(sprite, 120, 110);

    Renderer.drawText('PRESS ENTER TO START', 48, 170, PALETTE.HUD_TEXT, 8);
    Renderer.drawText('ARROWS: HOP  Z: POWER HOP', 28, 200, PALETTE.NEUTRAL, 8);
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
