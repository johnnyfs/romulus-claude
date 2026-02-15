# Agent Guide — Maripoga's Errand

Guide for future Claude agents picking up development on this project.

## Quick Start

1. Clone the repo and checkout `fresh-start` branch (has all latest work)
2. Open `index.html` in a browser to play
3. All code is vanilla JS — no build step, no dependencies
4. Create feature branches from `fresh-start`, open draft PRs back to `fresh-start`

## Architecture Overview

The game is a single HTML file that loads 14 JS files via `<script>` tags. There's no module system — everything is global objects.

### Load Order Matters

Scripts are loaded in this order (defined in `index.html`):
1. `engine/constants.js` — Must be first (defines all constants)
2. `engine/palette.js` — Color definitions (depends on constants)
3. `engine/input.js` — Keyboard handling
4. `engine/renderer.js` — Canvas rendering (depends on constants, palette)
5. `engine/grid.js` — Tile grid (depends on constants, palette, renderer)
6. `art/sprites.js` — Sprite definitions (depends on palette)
7. `audio/audio.js` — Sound system
8. `gameplay/player.js` — Player (depends on grid, input, audio, sprites)
9. `gameplay/enemies.js` — Enemies (depends on grid, audio)
10. `gameplay/encircle.js` — Fill detection (depends on grid, enemies, player, audio)
11. `gameplay/waves.js` — Wave system (depends on enemies, grid, player, audio)
12. `gameplay/hud.js` — HUD display (depends on player, waves, grid, renderer)
13. `gameplay/decoration.js` — Scene decoration (depends on renderer, palette)
14. `main.js` — Game loop (depends on everything)

### Key Design Patterns

- **Global singletons**: `Player`, `Enemies`, `Grid`, `Audio`, `Renderer`, etc. are all global objects with `init()` methods
- **Pixel rendering**: Sprites are 16×16 2D arrays of palette color strings (or `null` for transparent). Drawn pixel-by-pixel via `ctx.fillRect(x, y, 1, 1, color)`
- **Grid coordinates**: `(col, row)` where col=0-15, row=0-11. Pixel position = `(col * 16, (row + GRID_OFFSET_Y) * 16)`
- **Sequential animation pipeline**: `Encircle.pipeline` is a state machine. When non-null, all movement freezes and only the pipeline updates

### Important Gotchas

1. **GRID_OFFSET_Y**: All grid-to-pixel conversions must use `(row + GRID_OFFSET_Y) * TILE_SIZE`, not `(row + 1)`. The offset accounts for HUD + decoration row.
2. **Zombie tiles**: Use `TILE_ZOMBIE` (value 8), NOT `TILE_NEUTRAL`. Neutral tiles are unclaimed; zombie tiles are enemy-placed gray tiles that resist hopping.
3. **Spike tiles kill**: Player can hop onto spike tiles but dies on landing. Spikes are permanent (placed by snails).
4. **Player.justDied flag**: When player dies from spikes (inside player.update), set `justDied = true`. Main loop checks this flag to transition to STATE_DYING.
5. **Font is 8×8**: Each character in the bitmap font is 8px wide. When centering text, calculate: `x = (256 - text.length * 8) / 2`
6. **Audio init**: Web Audio API requires user interaction before playing. The Audio.init() sets up listeners for first keydown/click.

### Tile States

```
TILE_NEUTRAL = 0  — Unclaimed (dark gray)
TILE_GREEN = 1    — Player's color
TILE_RED = 2      — Red frog tiles
TILE_PURPLE = 3   — Purple frog tiles
TILE_BLUE = 4     — Blue frog tiles
TILE_SPIKE = 5    — Permanent hazard (snail trail) — KILLS player
TILE_WATER = 6    — Blocks movement
TILE_SNAIL = 7    — Snail entity marker
TILE_ZOMBIE = 8   — Zombie frog tiles (resist hopping, only revert via encirclement)
```

### Screen Layout (256×240)

```
Row 0  (y=0-15):   HUD bar (score, wave, fill%, lives)
Row 1  (y=16-31):  Reed decoration zone (non-playable)
Rows 2-13 (y=32-223): Game board (12 playable rows × 16 cols)
Row 14 (y=224-239): Lily pad decoration zone (non-playable)
```

### Adding New Enemy Types

1. Add tile state constant in `constants.js`
2. Add color mapping in `palette.js` TILE_COLORS
3. Add sprite in `sprites.js` (16×16 array) + register in `getSprite()`
4. Add spawn logic in `enemies.js` (tileState, moveInterval, AI direction)
5. Add to wave progression in `waves.js`
6. Handle in `encircle.js` if special behavior needed (like zombie surviving capture)

### Adding New Sound Effects

1. Add method to `Audio` object in `audio.js`
2. Use `this.playNote(freq, startTime, duration, type, volume, attack, release)`
3. NES constraint: only square, triangle, noise oscillator types
4. Call from gameplay code: `Audio.sfxMySound()`

## Operator Preferences (Design Decisions)

- **Solid color tiles** preferred over textured/checkerboard
- **No sprite outlines** — clean NES look
- **CRT scanline overlay** is fine, keep it subtle
- **Sequential animations** — each stage must complete before next
- **Movement freezes during fill** — player and enemies both
- **Zombie waves** are special Q*bert-style intermissions
- **Scoring**: kill bonuses escalate (x1, x2, x3...) per fill event
- **Text on 8×8 grid** — positions should snap to 8px boundaries
- **Use operator_prompt for visual decisions** — show mockups, get approval before committing art changes
- **Use Opus model for art/graphics agents** — they do better creative work
