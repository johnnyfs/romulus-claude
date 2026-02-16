# Maripoga's Errand

A single-screen NES-style arcade game. No dependencies, no build step — just HTML, CSS, and vanilla JavaScript.

## Quick Start

**Clone and play in 30 seconds:**

```bash
git clone https://github.com/johnnyfs/romulus-claude.git
cd romulus-claude
```

Then open `index.html` in your browser:

| OS | Command |
|----|---------|
| **macOS** | `open index.html` |
| **Linux** | `xdg-open index.html` |
| **Windows** | `start index.html` |

Or just double-click `index.html` in your file manager. Any modern browser works (Chrome, Firefox, Safari, Edge).

## Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** (or WASD) | Hop in 4 directions |
| **Enter** or **Space** | Start game / Pause / Unpause |
| **Escape** | Pause / Unpause |
| **Tab** | Toggle debug wave select (on title screen) |

## How to Play

You are **Maripoga**, a frog-boy on a mysterious errand. Hop around a 16×12 grid, turning tiles green. When your green tiles form a **closed boundary**, everything inside floods green (Qix/Amidar style). Enemy frogs caught inside the fill are captured. Reach the target fill percentage (shown in the HUD) to clear each wave.

**Tips:**
- Your green tiles are preserved when you die — only enemy tiles reset
- Stomp ladybugs by landing on them
- Bonus flies appear periodically — catch them for speed, invincibility, or extra lives
- Snails appear after 35 seconds — they leave deadly spike trails, so hurry!

## Enemy Types

| Enemy | Color | Behavior | Kill Score |
|-------|-------|----------|------------|
| **Red Frog** | Red | Hops randomly, claims red tiles | 200 |
| **Purple Frog** | Purple | Chases you, 30% chance to double-hop | 500 |
| **Blue Frog** | Blue | Teleports every ~5s; dies if teleporting into enclosed area | 800 |
| **Smart Frog** | White/Gray | Burst-hops in lines to build walls around you | 600 |
| **Snake** | Orange | Slithers 2 tiles at a time (no arc), doesn't claim tiles | 300 |
| **Zombie Frog** | Gray | Tiles need 2 hops to reclaim after zombie waves | 100 |
| **Ladybug** | Red (small) | Harmless! Seeks your green tiles to reset them. Stompable (150 pts) | - |
| **Snail** | Brown | Slow, but converts every tile to a deadly spike | - |

## Wave Progression

### Swamp — Daytime (Waves 1-5)
1. 1 Red
2. 1 Red + Ladybug
3. 2 Red + Ladybug
4. 2 Red + Purple + Ladybug
5. 2 Red + Purple + Ladybug + Snake

### Swamp — Dusk (Waves 6-9)
6. 2 Red + Purple + Blue
7. 2 Red + Purple + Blue + Ladybug
8. 2 Red + 2 Purple + Blue + Ladybug + Snake
9. 2 Red + 2 Purple + 2 Blue + Ladybug + Snake

### Swamp — Night (Wave 10)
**Zombie Wave!** 4 Zombies. Introduces the double-tap mechanic (enemy tiles need 2 hops to reclaim).

### City — Daytime (Waves 11-14)
11. 1 Smart Frog (the Architect)
12. 1 Smart + 1 Red
13. 1 Smart + 1 Red + Ladybug
14. 1 Smart + 2 Red + Ladybug

### City — Dusk (Waves 15-19)
Procedurally generated with escalating enemy counts.

### City — Night (Wave 20)
**Zombie Wave!** 5 Zombies. Introduces fatal tiles (freshly-placed enemy tiles glow bright and kill on contact).

### Beyond Wave 20
The 20-wave cycle repeats with increasing difficulty. Speed scales continuously.

## Technical Details

- **Resolution**: 256×240 pixels (NES standard), scaled 3× via CSS
- **Grid**: 16 columns × 12 playable rows
- **Sprites**: 16×16 pixel arrays, drawn pixel-by-pixel
- **Audio**: Chiptune via Web Audio API (square, triangle, noise oscillators)
- **Font**: Custom 8×8 bitmap arcade font
- **No dependencies**: Zero npm packages, no build tools, no frameworks

### File Structure

```
index.html              — Open this to play
src/
  engine/
    constants.js        — Game constants, tile states, directions
    palette.js          — NES color palette (6 environment themes)
    input.js            — Keyboard state tracking
    renderer.js         — Canvas rendering, bitmap font, CRT overlay
    grid.js             — 16×12 tile grid + fatal tile timers
  art/
    sprites.js          — All pixel art sprites
  audio/
    audio.js            — Chiptune SFX, music, pause/resume
  gameplay/
    player.js           — Maripoga: movement, hopping, tile claiming
    enemies.js          — Enemy system: AI, spawning, ladybug respawn
    bonuses.js          — Bonus flies and green bug items
    encircle.js         — Flood-fill detection + animation pipeline
    waves.js            — Wave progression, themes, difficulty scaling
    hud.js              — Score, wave, fill %, lives display
    decoration.js       — Swamp (reeds/lily pads) and City (buildings/fence)
  main.js               — Game loop and state machine
```
