# MITOSIS PANIC - Game Design Specification
Version 1.0 - Game Designer

## Overview
MITOSIS PANIC is an arcade-style NES game featuring a unique multi-unit control mechanic wrapped in an original biological theme. Players must balance risk/reward as they grow more powerful (more cells = more collection ability) but also more vulnerable (more cells = more hitboxes to protect).

## Core Innovation
The game's central innovation is **emergent difficulty through success**. Unlike traditional games where power-ups make you stronger, this game makes you simultaneously more powerful AND more vulnerable with each mitosis event. This creates a unique tension.

## Detailed Game Mechanics

### Movement System
- **8-directional movement**: D-pad input moves all cells in the selected direction
- **Simultaneous control**: All player cells receive identical input
- **Speed**: 1.5 pixels per frame (smooth but not too fast)
- **No inertia**: Cells stop immediately when input released
- **Collision**: Cells cannot overlap each other or arena boundaries
- **Formation**: When multiple cells exist, they maintain relative positions from their birth location

### Mitosis Mechanic
**Trigger**: Occurs at 10 and 20 nutrients collected per level
**Process**:
1. Freeze game for 60 frames (1 second)
2. Play mitosis jingle
3. Each cell splits into 2 cells at same position
4. New cells offset by 8 pixels in opposite directions (North/South)
5. Resume gameplay

**Cell count progression per level**:
- Level start: 1 cell
- After 10 nutrients: 2 cells
- After 20 nutrients: 4 cells
- Level complete (30 nutrients): 4 cells carry to next level as 1 cell

### Nutrient Collection
- **Spawn rate**: 1 new nutrient every 120 frames (2 seconds)
- **Max on screen**: 10 nutrients
- **Placement**: Random position in playable area, not within 32 pixels of any antibody
- **Collection**: Automatic when any player cell overlaps (8x8 hitbox)
- **Feedback**: Bloop sound + score increment + particle effect

### Enemy AI System

**Antibody Type 1: Horizontal Patrol**
- Moves left-right along a fixed Y coordinate
- Speed: 0.5 pixels/frame (Level 1), +0.1 per level (cap 1.5)
- Reverses direction at screen edges

**Antibody Type 2: Vertical Patrol**
- Moves up-down along a fixed X coordinate
- Speed: Same as Type 1
- Reverses direction at screen edges

**Antibody Type 3: Diagonal Sweep**
- Moves at 45-degree angles
- Speed: 0.7 pixels/frame (Level 1), +0.15 per level (cap 2.0)
- Bounces off walls like a DVD screensaver

**Antibody Type 4: Circular Orbit**
- Orbits around a fixed point
- Radius: 64 pixels
- Angular speed: 2 degrees per frame
- Introduced in Level 4+

**Enemy Spawn Patterns by Level**:
- Level 1: 3 enemies (2x Type 1, 1x Type 2)
- Level 2: 4 enemies (2x Type 1, 2x Type 2)
- Level 3: 6 enemies (2x Type 1, 2x Type 2, 2x Type 3)
- Level 4: 8 enemies (2x Type 1, 2x Type 2, 2x Type 3, 2x Type 4)
- Level 5+: +2 enemies per level, mix of all types, cap at 12

### Collision Detection
- **Player vs Nutrient**: 6x6 pixel overlap detection (center of 8x8 sprite)
- **Player vs Antibody**: 6x6 pixel hitbox (2-pixel tolerance for fairness with 8x8 sprites)
- **Player vs Boundary**: Hard stop at arena edges
- **Antibody vs Boundary**: Reflection/reversal

### Sprite Budget (Worst Case)
- Player cells: 4 cells × 1 sprite = 4 sprites
- Antibodies: 12 enemies × 1 sprite = 12 sprites
- Nutrients: 10 particles × 1 sprite = 10 sprites
- UI elements: ~4 sprites (score digits, cell counter)
- **Total**: 30 sprites (well under 64 limit, no flicker)

### Level Progression
1. **Level Start**: Reset to 1 cell, spawn antibodies in predetermined positions
2. **During Level**: Collect nutrients, avoid antibodies, undergo mitosis
3. **Level Clear**: When 30th nutrient collected
4. **Transition**: 3-second victory screen, show score, press START to continue
5. **Next Level**: Increment level number, increase enemy speed/count

### Score System
- Base score: 10 points per nutrient
- Level completion bonus: 100 × level number
- No time bonus (encourages cautious play)
- High score saved to SRAM (battery backup)

### Game Over
**Trigger**: Any player cell collides with antibody
**Process**:
1. Freeze game
2. Play death sound (harsh noise channel burst)
3. Flash screen red 3 times
4. Show "GAME OVER" screen with final score
5. Options: Retry (B) or Title Screen (SELECT)

## Visual Design Specifications

### Sprite Specifications

**REVISED FOR NES HARDWARE CONSTRAINTS**
All sprites are 8x8 pixels (NES hardware limitation). This constraint actually enhances the "microscopic" theme.

**Player Cell**:
- Size: 8x8 pixels (1 hardware sprite)
- Colors: Cyan (#00C8FF), light cyan (#80E4FF), dark blue nucleus
- Animation: 2-frame breathing cycle (subtle size pulsing)
- Details: Circular blob with visible center nucleus, organic edges

**Nutrient Particle**:
- Size: 8x8 pixels (1 hardware sprite)
- Colors: 3 variants - Green, Yellow, Pink (each with light/dark shading)
- Animation: 2-frame gentle pulse
- Details: Simple circular design, high contrast for visibility

**Antibody (4 variations)**:
- Size: 8x8 pixels (1 hardware sprite each)
- Colors: Red (#FF0000), dark red (#C00000), white highlights
- Animation: 2-frame subtle movement
- Details: Abstract menacing shape (spiky/angular), distinct silhouette per type

**Arena Background**:
- Tileset: 8x8 pixel tiles
- Base color: Dark blue (#001040)
- Grid: Lighter blue (#002080) every 16 pixels
- Border: Petri dish circular outline (drawn with sprites)

### Screen Layout
```
┌────────────────────────────────┐
│ SCORE: 000000    LEVEL: 01     │ (Top HUD, 16 pixels tall)
├────────────────────────────────┤
│                                │
│        [Playable Arena]        │
│         224x208 pixels         │
│                                │
│    (Petri dish with grid)      │
│                                │
├────────────────────────────────┤
│ CELLS: 2    NUTRIENTS: 15/30   │ (Bottom HUD, 16 pixels tall)
└────────────────────────────────┘
```

### Animation Frame Timings
- Player breathing: 4 frames @ 8 game frames each = 32 frame loop
- Nutrient pulse: 2 frames @ 16 game frames each = 32 frame loop
- Antibody idle: 2 frames @ 32 game frames each = 64 frame loop
- Mitosis event: 60 frame animation sequence

## Audio Design Specifications

### Music Tracks

**Track 1: Main Theme "Cellular Division"**
- Tempo: 140 BPM (upbeat arcade pace)
- Channels: Pulse 1 (melody), Pulse 2 (harmony), Triangle (bass), Noise (percussion)
- Mood: Upbeat arcade energy with biological character - cheerful and engaging
- Style: References Dr. Mario (medical theme), Pac-Man (arcade energy), Bubble Bobble (playful charm)
- Length: 32-bar loop (A-B-A-B' structure)
- Key: C Major (bright, accessible)

**Track 2: Gameplay Music (same as Main Theme)**
- Uses same "Cellular Division" theme during gameplay
- Bouncy 8th note patterns with organic "burbling" feel
- Memorable hook that won't grate after multiple plays
- Note: SFX have priority and will briefly interrupt melody channels

**Track 3: Level Clear**
- Tempo: 140 BPM
- Channels: Pulse 1 + Pulse 2 (triumphant fanfare)
- Mood: Victory, success
- Length: 5 seconds (non-looping)

### Sound Effects
- **Nutrient Collect (Bloop)**: Triangle wave, C5 to C4 sweep, 10 frames
- **Proximity Warning (Beep)**: Pulse 1, E6, 5 frames, triggers when antibody within 32 pixels
- **Mitosis Jingle**: Pulse 1+2, ascending arpeggio C4-E4-G4-C5, 30 frames
- **Death**: Noise channel, descending pitch sweep, 45 frames
- **Level Clear**: Pulse 1+2, major chord progression, 90 frames

### Audio Priorities (when multiple SFX trigger):
1. Death (interrupts everything)
2. Mitosis jingle (interrupts music, not death)
3. Level clear (interrupts everything except death)
4. Proximity warning (background, doesn't interrupt)
5. Nutrient collect (quick, doesn't interrupt music)

## Technical Implementation Notes

### Memory Map
- **PRG-ROM**: 32KB (2 × 16KB banks)
  - Bank 0: Main game code, player logic, collision
  - Bank 1: Enemy AI, audio engine, menu code
- **CHR-ROM**: 8KB (sprite and tile graphics)
- **RAM**: 2KB
  - $0000-$00FF: Zero page (fast variables)
  - $0100-$01FF: Stack
  - $0200-$02FF: Sprite OAM buffer
  - $0300-$07FF: Game variables and buffers
- **SRAM**: 8KB battery-backed (high scores, settings)

### Game State Variables (Zero Page)
```
$00: gameState (0=title, 1=playing, 2=mitosis, 3=levelClear, 4=gameOver)
$01: levelNumber (1-255)
$02-$03: score (16-bit)
$04: nutrientsThisLevel (0-30)
$05: playerCellCount (1, 2, 4)
$06-$0D: playerCellX (8 bytes, one per potential cell)
$0E-$15: playerCellY (8 bytes)
$16: enemyCount (0-12)
$17: frameCounter (for animation timing)
```

### Performance Targets
- **Frame rate**: Locked 60 FPS (NTSC)
- **Input lag**: Maximum 1 frame
- **Sprite flicker**: None (under 64 sprite limit)
- **Audio lag**: Maximum 2 frames for SFX trigger

## Testing Checklist (for QA Engineer)
- [ ] Player movement in all 8 directions
- [ ] Collision with nutrients registers correctly
- [ ] Collision with antibodies triggers game over
- [ ] Mitosis event at 10 and 20 nutrients
- [ ] All cells move together simultaneously
- [ ] Level clear at 30 nutrients
- [ ] Enemy patterns work correctly (all 4 types)
- [ ] Enemy speed increases per level
- [ ] Score increments correctly
- [ ] High score saves and loads
- [ ] Audio plays without crackling
- [ ] No sprite flicker or glitches
- [ ] Pause/resume works correctly
- [ ] Game over screen displays correctly

## Future Enhancement Ideas (Post-V1)
- Power-ups (temporary invincibility, slow antibodies, etc.)
- Boss levels every 5 levels
- Two-player cooperative mode
- Difficulty selection (different starting speeds)
- Special "golden nutrient" worth 5 points
- Achievement system

---
**Document Version**: 1.0  
**Last Updated**: 2026-02-11  
**Author**: Game Designer
