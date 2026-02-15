// HUD - score, lives, wave, fill percentage
// All text on 8x8 grid, in the top HUD row (16px tall), not overlaying game board
const HUD = {
  draw() {
    // Background bar
    Renderer.fillRect(0, 0, SCREEN_WIDTH, HUD_HEIGHT, PALETTE.HUD_BG);

    // Score (left side) — 8px chars, y=4 to center in 16px bar
    Renderer.drawText(String(Player.score).padStart(7, '0'), 2, 5, PALETTE.SCORE_COLOR);

    // Wave (center)
    const waveText = 'W' + Waves.current;
    Renderer.drawText(waveText, 72, 5, PALETTE.WHITE);

    // Fill percentage (right-center)
    const pct = Math.floor(Grid.fillPercent(TILE_GREEN) * 100);
    const target = Math.floor(Waves.targetPercent * 100);
    const pctColor = pct >= target ? PALETTE.GREEN : PALETTE.HUD_TEXT;
    Renderer.drawText(pct + '%', 108, 5, pctColor);

    // Fill bar
    Renderer.fillRect(140, 6, 52, 4, PALETTE.NEUTRAL);
    const barWidth = Math.floor(50 * Math.min(1, pct / 100));
    Renderer.fillRect(141, 7, barWidth, 2, PALETTE.GREEN);
    // Target marker
    const targetX = 141 + Math.floor(50 * Waves.targetPercent);
    Renderer.fillRect(targetX, 5, 1, 6, PALETTE.WHITE);

    // Lives (right side) — small frog icons
    for (let i = 0; i < Player.lives; i++) {
      const lx = 200 + i * 10;
      Renderer.fillRect(lx + 2, 3, 6, 8, PALETTE.GREEN);
      Renderer.fillRect(lx + 3, 2, 2, 2, PALETTE.GREEN);
      Renderer.fillRect(lx + 7, 2, 2, 2, PALETTE.GREEN);
      // Eyes
      Renderer.fillRect(lx + 3, 4, 1, 1, PALETTE.BLACK);
      Renderer.fillRect(lx + 6, 4, 1, 1, PALETTE.BLACK);
    }
  },
};
