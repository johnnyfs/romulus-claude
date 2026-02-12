# MITOSIS PANIC - Quick Reference Guide

## Game Overview
**Title**: MITOSIS PANIC  
**Genre**: Biological Arcade / Single-Screen Challenge  
**Platform**: Nintendo Entertainment System (NES)  
**Unique Mechanic**: Multi-unit control through cell division (mitosis)

## Core Gameplay Loop
1. Player controls 1 cell initially
2. Collect green nutrient particles (+10 points each)
3. Every 10 nutrients = mitosis event (cell splits into 2)
4. All cells move together with same input
5. Avoid red antibody enemies (touch = instant game over)
6. Collect 30 nutrients to clear level
7. Next level: faster/more antibodies, reset to 1 cell

## Visual Style
- **Theme**: Abstract biological / microscopic world
- **Palette**: Cyan cells, green nutrients, red antibodies, dark blue background
- **Animation**: Organic, breathing, pulsing sprites
- **Arena**: Petri dish with subtle grid pattern (256x240 single screen)

## Audio Style
- **Theme**: Minimal ambient laboratory atmosphere
- **Music**: Upbeat arcade energy with biological character (140 BPM)
- **SFX**: Organic bloops, pops, and sweeps

## Technical Constraints (NES)
- **Resolution**: 256x240 pixels
- **Sprites**: 8x8 or 16x16 (metatiles), 4 colors per sprite
- **Sprite Limit**: 64 total, 8 per scanline
- **ROM**: 32KB PRG + 8KB CHR (NROM mapper)
- **Audio**: 2 pulse + 1 triangle + 1 noise + 1 DMC channels

## Entity Specifications

### Player Cell
- **Size**: 16x16 pixels (2x2 metatile)
- **Colors**: Light cyan, medium cyan, dark cyan nucleus
- **Animation**: 4-frame breathing cycle (32 frames total)
- **Speed**: 1.5 pixels per frame
- **Collision Box**: 12x12 pixels (tolerance for fairness)
- **Max Count**: 8 cells on screen

### Nutrient Particle
- **Size**: 8x8 pixels
- **Colors**: Green variants (amino acids, glucose, vitamins)
- **Animation**: 2-frame gentle pulse
- **Spawn Rate**: 1 every 2 seconds
- **Max On Screen**: 10

### Antibody Enemy
- **Size**: 16x16 pixels (2x2 metatile)
- **Colors**: Bright red, dark red, white highlights
- **Types**: 4 (horizontal, vertical, diagonal, circular orbit)
- **Speed**: 0.5-2.0 pixels/frame (level-dependent)
- **Animation**: 2-frame seeking motion
- **Max Count**: 12 (at higher levels)

## AI Patterns
1. **Type 1 - Horizontal Patrol**: Left-right along fixed Y, reverses at edges
2. **Type 2 - Vertical Patrol**: Up-down along fixed X, reverses at edges
3. **Type 3 - Diagonal Sweep**: 45° angles, bounces off walls (DVD screensaver style)
4. **Type 4 - Circular Orbit**: Orbits around fixed point, 64px radius (Level 4+)

## Level Progression
- **Level 1**: 3 antibodies (Type 1×2, Type 2×1), slow speed
- **Level 2**: 4 antibodies, medium speed
- **Level 3**: 6 antibodies (adds Type 3), medium-fast
- **Level 4+**: +2 antibodies per level, adds Type 4, speed increases

## Sound Effects List
1. **Mitosis**: Pulse sweep C4→C5 + delayed echo, 60 frames
2. **Nutrient Collect**: Bloop (3 variants), 10 frames
3. **Proximity Warning**: Beep E6, 5 frames (when antibody within 32px)
4. **Death**: Noise descending sweep, 45 frames
5. **Level Clear**: Major chord progression, 90 frames

## Color Palette (NES Hex)
- **Player**: $0C (light cyan), $1C (medium cyan), $0F (black)
- **Nutrients**: $0A (green), $1A (light green), $2A (yellow-green)
- **Antibodies**: $16 (bright red), $06 (dark red), $30 (white)
- **Background**: $21 (blue), $11 (dark blue), $01 (very dark blue)

## Memory Layout (Key Addresses)
- **$0000-$00FF**: Zero page (fast variables)
- **$0200-$02FF**: OAM buffer (sprite data)
- **$0300-$03FF**: Game entities (cells, antibodies, nutrients)
- **$0400-$07FF**: Game state, audio engine, misc

## Build Commands
```bash
# Compile
cc65 -O -t nes game.c -o game.s
ca65 game.s -o game.o

# Link
ld65 -C nes.cfg game.o -o mitosis_panic.nes

# Test
fceux mitosis_panic.nes
```

## File Structure
```
/graphics/        - CHR data, sprite sheets
/audio/           - FamiTone2 music/SFX data
/src/             - C and assembly source code
/build/           - Compiled ROM output
/docs/            - Design documentation
/assets/specs/    - Asset specifications
```

## Key Design Principles
1. **Simplicity**: Single-screen, clear objectives, minimal UI
2. **Emergent Complexity**: Success (mitosis) increases difficulty
3. **Fair Challenge**: Generous hitboxes, clear visual feedback
4. **Unique Hook**: Multi-unit control is novel for NES era
5. **Biological Theme**: Educational undertones, original aesthetic

## Testing Priorities
1. All cells move together correctly
2. Collision detection is accurate and fair
3. Sprite limit never exceeded (< 64 sprites)
4. No slowdown or lag at 60 FPS
5. Mitosis triggers at correct nutrient counts (10, 20)
6. Level clear at exactly 30 nutrients
7. Enemy patterns work correctly
8. Audio plays without crackling

## Common Pitfalls to Avoid
- ❌ Don't exceed 64 sprite limit
- ❌ Don't use more than 4 colors per sprite
- ❌ Don't update PPU outside VBlank
- ❌ Don't make collision boxes too harsh (unfair)
- ❌ Don't make sprites too visually busy
- ❌ Don't overlap audio channels unnecessarily

---
**For Questions**: Refer to docs/GAME_SPEC.md (design) or docs/TECHNICAL_ARCHITECTURE.md (implementation)
