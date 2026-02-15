// HUD - score, lives, wave, fill percentage
// All text on 8x8 grid, in the top HUD row (16px tall)
const HUD = {
  draw() {
    // Background bar
    Renderer.fillRect(0, 0, SCREEN_WIDTH, HUD_HEIGHT, PALETTE.HUD_BG);

    // Score (left) — snap to 8px grid: x=0, y=4
    Renderer.drawText(String(Player.score).padStart(7, '0'), 0, 4, PALETTE.SCORE_COLOR);

    // Wave (center-left) — x=64, y=4
    Renderer.drawText('W' + Waves.current, 64, 4, PALETTE.WHITE);

    // Fill percentage — x=104, y=4
    const pct = Math.floor(Grid.fillPercent(TILE_GREEN) * 100);
    const target = Math.floor(Waves.targetPercent * 100);
    const pctColor = pct >= target ? PALETTE.GREEN : PALETTE.HUD_TEXT;
    Renderer.drawText(pct + '%', 104, 4, pctColor);

    // Fill bar — x=144, y=6
    Renderer.fillRect(144, 6, 52, 4, PALETTE.NEUTRAL);
    const barWidth = Math.floor(50 * Math.min(1, pct / 100));
    Renderer.fillRect(145, 7, barWidth, 2, PALETTE.GREEN);
    const targetX = 145 + Math.floor(50 * Waves.targetPercent);
    Renderer.fillRect(targetX, 5, 1, 6, PALETTE.WHITE);

    // Lives (right) — x=208
    for (let i = 0; i < Player.lives; i++) {
      const lx = 208 + i * 10;
      Renderer.fillRect(lx + 2, 3, 6, 8, PALETTE.GREEN);
      Renderer.fillRect(lx + 3, 2, 2, 2, PALETTE.GREEN);
      Renderer.fillRect(lx + 7, 2, 2, 2, PALETTE.GREEN);
      Renderer.fillRect(lx + 3, 4, 1, 1, PALETTE.BLACK);
      Renderer.fillRect(lx + 6, 4, 1, 1, PALETTE.BLACK);
    }
  },
};
