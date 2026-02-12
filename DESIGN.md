# MITOSIS PANIC - NES Game Design Document

## Game Concept
An arcade-style biological survival game where you control microscopic cells that undergo mitosis.

## Core Gameplay
- **Genre:** Single-screen arcade challenge
- **Player Character:** Microscopic organism (cell)
- **Objective:** Collect 30 nutrient particles per level while avoiding antibodies
- **Unique Mechanic:** Every 10 nutrients triggers mitosis - your cell divides and you now control BOTH cells simultaneously with the same input
- **Difficulty Curve:** More cells to control + faster/more numerous enemies each level

## Game Loop
1. Start with 1 cell in center of petri dish
2. Nutrients spawn randomly around the arena
3. Antibodies patrol in patterns
4. Collect nutrients (score +1 each)
5. At 10, 20 nutrients → mitosis event (split into 2, then 4 cells)
6. At 30 nutrients → level clear, advance to next level
7. If ANY cell touches antibody → game over
8. Next level: antibodies faster, more numerous, harder patterns

## Visual Style
- **Theme:** Abstract biological/microscopic
- **Setting:** Petri dish viewed from above with subtle grid pattern
- **Color Palette:**
  - Cyan: Player cells
  - Green: Nutrient particles
  - Red: Antibodies
  - Dark blue/black: Background
- **Animation Style:** Organic, blobby, "breathing" sprites with pseudopod-like movement

## Audio Design
- **Music:** Minimal ambient synth with laboratory atmosphere
- **SFX:**
  - Bloop: Collect nutrient
  - Beep: Proximity warning for antibodies
  - Jingle: Mitosis event
  - Crash: Death sound
  - Victory: Level clear

## Technical Specifications

### NES Constraints
- Resolution: 256x240
- 52-color palette (max 4 colors per sprite)
- 64 sprites max on screen
- 8x8 pixel tiles
- 2 pulse + 1 triangle + 1 noise + 1 DMC audio channels

### Game Objects
1. **Player Cells** (1-8 instances)
   - 16x16 sprite
   - 8-directional movement
   - Animated breathing (2-3 frames)

2. **Nutrients** (5-10 on screen)
   - 8x8 sprite
   - Static or gentle pulse animation
   - Random spawn locations

3. **Antibodies** (3-12 depending on level)
   - 16x16 sprite
   - 4 types with different patrol patterns:
     - Horizontal patrol
     - Vertical patrol
     - Diagonal sweep
     - Circular orbit

4. **Arena**
   - 224x208 playable area (single screen)
   - Petri dish border
   - Subtle background grid

### Game State
- Level number (1-255)
- Score (nutrients collected)
- Nutrients this level (0-30)
- Number of player cells (1, 2, 4, 8)
- Cell positions (x, y for each)
- Enemy count and positions
- Game phase (playing, mitosis animation, level clear, game over)

## Level Progression

### Level 1
- 3 antibodies (slow, simple patterns)
- Horizontal/vertical patrol only

### Level 2
- 4 antibodies (medium speed)
- Mix of patterns

### Level 3
- 6 antibodies (medium-fast)
- Diagonal patterns introduced

### Level 4+
- +2 antibodies per level
- Speed increases
- Circular orbit pattern introduced
- Difficulty caps at level 10

## Controls
- D-Pad: Move all cells in 8 directions
- A Button: (unused, reserved for future power-ups)
- B Button: (unused)
- Start: Pause/Resume
- Select: (unused)

## Why This Is Original
1. **Multi-unit simultaneous control** - unique mechanic for NES era
2. **Biological theme** - breaks from typical space/fantasy/sports genres
3. **Emergent difficulty** - challenge comes from managing multiple units, not just reflexes
4. **Educational undertones** - teaches about cell division while being fun
5. **Minimalist aesthetic** - stands out from busy sprite-heavy NES games

## Development Priorities
1. Core movement and collision detection
2. Enemy AI patterns
3. Mitosis mechanic
4. Level progression system
5. Audio integration
6. Visual polish and animation
