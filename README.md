# Maripoga's Errand

A single-screen NES-style arcade game built with vanilla HTML5 Canvas and Web Audio API. No dependencies.

## Play

Open `index.html` in any modern browser. That's it.

- **Arrow Keys**: Hop (4 directions)
- **Enter/Space**: Start game, pause/unpause
- **Click**: Focus the game area (needed if embedded)

## The Game

You are **Maripoga**, a half-frog, half-boy on a mysterious errand. Hop around a grid, claiming tiles green. When your green tiles form a **closed boundary**, everything inside floods green — Qix/Amidar style. Capture enemy frogs caught inside the fill. Reach the target fill percentage to clear each wave.

### Enemy Types

| Enemy | Color | Behavior | Points |
|-------|-------|----------|--------|
| **Red Frog** | Red | Hops randomly | 200 |
| **Purple Frog** | Purple | Chases you aggressively, can double-hop | 500 |
| **Blue Frog** | Blue | Hops normally but teleports every ~5 seconds | 800 |
| **Zombie Frog** | Gray | Tiles turn gray (resist hopping), survives encirclement | 100 |
| **Snail** | Brown | Slow, but every tile it touches becomes a permanent deadly spike | - |

### Wave Progression

- **Waves 1-2**: 1 Red Frog (tutorial)
- **Waves 3-4**: 2 Red Frogs
- **Waves 5-6**: Red + Purple (chaser introduced)
- **Waves 7-8**: 2 Red + Purple
- **Waves 9-10**: Red + Purple + Blue (teleporter introduced)
- **Wave 11**: ZOMBIE WAVE! 2 zombies only (Q*bert-style special level)
- **Waves 12-13**: Full mix with zombie
- **Wave 14**: ZOMBIE WAVE! 4 zombies
- **Wave 15+**: Escalating mix, zombie waves every 5th level
- **Snails** appear after 35 seconds on any wave (hurry up!)

### Scoring

- **+10** per new tile claimed by hopping
- **Fill bonus**: +2 per tile × combo multiplier when a region floods
- **Enemy kills**: Base score × position multiplier (1st kill = 1×, 2nd = 2×, etc.)
- **Wave clear**: +500 bonus
- **PERFECT**: +5000 for 100% board fill
- **Extra life** every 10,000 points

### Animation Pipeline

Fill events trigger a sequential animation pipeline where all movement freezes:
1. Tiles cascade green one by one
2. Each trapped enemy spins and dies (one at a time, escalating points)
3. Total fill bonus displays
4. PERFECT bonus if applicable
5. Wave clear check and transition

## Technical Details

### NES Constraints

- **Resolution**: 256×240 pixels, scaled 3× via CSS
- **Grid**: 16 columns × 12 playable rows (+ HUD row + 2 decoration rows)
- **Sprites**: 16×16 pixel arrays, drawn pixel-by-pixel
- **Palette**: NES-inspired ~25 colors on screen
- **Audio**: Chiptune via Web Audio API (square, triangle, noise oscillators)
- **Font**: Custom 8×8 bitmap arcade font

### Architecture

```
index.html          — Entry point, loads all scripts
src/
  engine/
    constants.js    — Game constants, tile states, directions
    palette.js      — NES color palette and tile color mappings
    input.js        — Keyboard state tracking
    renderer.js     — Canvas rendering, bitmap font, CRT overlay
    grid.js         — 16×12 tile grid state management
  art/
    sprites.js      — All pixel art sprites (player, enemies, snail)
  audio/
    audio.js        — Chiptune SFX and music (Web Audio API)
  gameplay/
    player.js       — Maripoga: movement, hopping, tile claiming, death
    enemies.js      — Enemy frog system: spawning, AI, movement
    encircle.js     — Flood-fill detection + sequential animation pipeline
    waves.js        — Wave progression, snail spawning, difficulty scaling
    hud.js          — Score, wave number, fill %, lives display
    decoration.js   — Swamp scene: reeds (top), lily pads (bottom)
  main.js           — Game loop, state machine, draw orchestration
```

### Game States

- `STATE_TITLE` → `STATE_PLAYING` → `STATE_WAVE_CLEAR` → loop
- `STATE_PLAYING` → `STATE_DYING` → respawn or `STATE_GAME_OVER`
- `STATE_PAUSED` toggle during play

### Key Constants

- `GRID_OFFSET_Y = 2` — Grid starts 2 tile-rows down (HUD + reed decoration)
- `GRID_ROWS = 12` — Playable rows
- `GRID_COLS = 16` — Columns
- `HOP_DURATION = 200` — ms per hop animation

## Development History

Built collaboratively with Claude agents in a single session:
- v1-v4: Core engine, sprites, audio, flood-fill mechanic
- v5: Progressive scoring, snail hazard, sprite art pass
- v6: Visual overhaul (solid tiles, 8×8 font), gradual fill, zombie frog
- v7: Sequential animation pipeline, spike kills, wave reorder
- v8: 12-row grid with reed/lily pad decoration borders

## Future Ideas

- Title screen with pixel art
- More enemy types
- Power-ups (speed boost, shield, bomb)
- Local high score persistence
- Mobile touch controls
- Screen shake / juice effects
- Boss encounters every 10 waves
