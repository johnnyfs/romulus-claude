// Player (Maripoga) - movement, hopping, tile claiming
const Player = {
  col: 0,
  row: 0,
  isHopping: false,
  hopTimer: 0,
  hopFromCol: 0,
  hopFromRow: 0,
  lives: 3,
  score: 0,
  alive: true,

  init() {
    // Start at center of grid
    this.col = Math.floor(GRID_COLS / 2);
    this.row = Math.floor(GRID_ROWS / 2);
    this.isHopping = false;
    this.hopTimer = 0;
    this.alive = true;
    // Claim starting tile
    Grid.set(this.col, this.row, TILE_GREEN);
  },

  reset() {
    this.col = Math.floor(GRID_COLS / 2);
    this.row = Math.floor(GRID_ROWS / 2);
    this.isHopping = false;
    this.hopTimer = 0;
    this.alive = true;
  },

  update(dt) {
    if (!this.alive) return;

    if (this.isHopping) {
      this.hopTimer -= dt;
      if (this.hopTimer <= 0) {
        this.isHopping = false;
        // Claim tile on landing
        Grid.set(this.col, this.row, TILE_GREEN);
        Audio.sfxClaim();
        // Check for encirclement after claiming
        Encircle.checkAll();
      }
      return;
    }

    // Read input
    const dir = Input.getDirection();
    if (dir !== DIR_NONE) {
      const newCol = this.col + DIR_DX[dir];
      const newRow = this.row + DIR_DY[dir];
      if (Grid.inBounds(newCol, newRow)) {
        const tile = Grid.get(newCol, newRow);
        // Can't hop onto spike/water
        if (tile !== TILE_SPIKE && tile !== TILE_WATER) {
          this.hopFromCol = this.col;
          this.hopFromRow = this.row;
          this.col = newCol;
          this.row = newRow;
          this.isHopping = true;
          this.hopTimer = HOP_DURATION;
          Audio.sfxHop();
        }
      }
    }
  },

  // Get pixel position (interpolated during hop)
  getPixelPos() {
    const targetX = this.col * TILE_SIZE;
    const targetY = (this.row + 1) * TILE_SIZE; // +1 for HUD offset
    if (this.isHopping) {
      const t = 1 - (this.hopTimer / HOP_DURATION);
      const fromX = this.hopFromCol * TILE_SIZE;
      const fromY = (this.hopFromRow + 1) * TILE_SIZE;
      // Arc: lerp position with a vertical bounce
      const x = fromX + (targetX - fromX) * t;
      const baseY = fromY + (targetY - fromY) * t;
      const arc = -Math.sin(t * Math.PI) * 8; // 8px arc height
      return { x, y: baseY + arc };
    }
    return { x: targetX, y: targetY };
  },

  draw() {
    const pos = this.getPixelPos();
    const sprite = Sprites.getSprite('player', this.isHopping);
    Renderer.drawSprite(sprite, pos.x, pos.y);
  },

  die() {
    this.alive = false;
    this.lives--;
    Audio.sfxDeath();
  },

  addScore(points) {
    const oldScore = this.score;
    this.score += points;
    // Extra life every 10000 points
    if (Math.floor(this.score / 10000) > Math.floor(oldScore / 10000)) {
      this.lives++;
    }
  },
};
