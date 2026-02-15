// HUD - score, lives, wave, fill percentage
const HUD = {
  draw() {
    // Background bar
    Renderer.fillRect(0, 0, SCREEN_WIDTH, HUD_HEIGHT, PALETTE.HUD_BG);

    // Score
    Renderer.drawText('SCORE:' + String(Player.score).padStart(6, '0'), 2, 11, PALETTE.SCORE_COLOR, 8);

    // Wave
    Renderer.drawText('WAVE ' + Waves.current, 108, 11, PALETTE.WHITE, 8);

    // Fill percentage
    const pct = Math.floor(Grid.fillPercent(TILE_GREEN) * 100);
    const target = Math.floor(Waves.targetPercent * 100);
    Renderer.drawText(pct + '%/' + target + '%', 170, 11, pct >= target ? PALETTE.GREEN : PALETTE.HUD_TEXT, 8);

    // Lives
    for (let i = 0; i < Player.lives; i++) {
      // Small green frog icon
      Renderer.fillRect(232 + i * 8, 4, 6, 8, PALETTE.GREEN);
      Renderer.fillRect(234 + i * 8, 2, 2, 2, PALETTE.GREEN);
    }

    // Fill bar background
    Renderer.fillRect(170, 13, 50, 2, PALETTE.NEUTRAL);
    // Fill bar
    const barWidth = Math.floor(50 * Math.min(1, pct / target));
    Renderer.fillRect(170, 13, barWidth, 2, PALETTE.GREEN);
    // Target marker
    Renderer.fillRect(170 + 50, 13, 1, 2, PALETTE.WHITE);
  },
};
