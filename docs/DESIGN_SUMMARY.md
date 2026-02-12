# MITOSIS PANIC - Design Summary
**Game Designer - Final Specifications v1.0**

## Core Concept
Biological arcade game: Control microscopic cells that divide via mitosis. Collect nutrients, avoid antibodies. Difficulty emerges from controlling multiple cells simultaneously with one input.

## Visual Specifications (FINALIZED)

### Sprite Sizes - **8x8 SINGLE SPRITES**
- **Player Cells**: 8x8 pixels, cyan blob, 4-frame breathing animation
- **Nutrients**: 8x8 pixels, green particles, 2-frame pulse
- **Antibodies**: 8x8 pixels, red Y-shape, 2-frame idle (4 variants)

### Entity Limits
- **Max 4 player cells** (1 → 2 → 4 via two mitosis events)
- **Max 12 antibodies** (increases per level)
- **Max 10 nutrients** (constant spawning)
- **Total worst-case**: 26 sprites (38 sprites free for effects/UI/particles)

### Color Palette
- **Cells**: Cyan (#00C8FF), light cyan (#80E4FF), white highlights
- **Nutrients**: Green (#00FF00), lime (#80FF80)  
- **Antibodies**: Red (#FF0000), dark red (#C00000)
- **Arena**: Dark blue (#001040) with lighter grid (#002080)

## Gameplay Specifications

### Mitosis Mechanic
- **Trigger**: At 10 nutrients (1→2 cells), at 20 nutrients (2→4 cells)
- **Process**: 60-frame freeze, jingle plays, cells split with 8px N/S offset
- **Max cells per level**: 4 cells
- **Reset**: New level starts with 1 cell again

### Level Progression
- **Win condition**: Collect 30 nutrients without dying
- **Difficulty scaling**: 
  - Level 1: 3 antibodies (2 horizontal, 1 vertical)
  - Level 2-3: +2 antibodies per level, introduce diagonal
  - Level 4+: +2 per level, introduce circular orbit, cap at 12 total
  - Enemy speed: 0.5 px/frame base, +0.1 per level, cap 1.5

### Enemy AI Patterns
1. **Horizontal Patrol**: Left-right along fixed Y
2. **Vertical Patrol**: Up-down along fixed X
3. **Diagonal Sweep**: 45° angles, bounces off walls
4. **Circular Orbit**: Orbits center point, 64px radius

### Collision & Movement
- **Player speed**: 1.5 pixels/frame, 8-directional
- **Hitboxes**: 8x8 simple AABB detection
- **No overlap**: Cells can't overlap each other or boundaries
- **Formation**: Cells maintain relative positions after mitosis

## Audio Specifications

### Sound Effects (Essential)
- **Nutrient bloop**: Triangle C5→C4 sweep, 10 frames
- **Mitosis jingle**: Pulse 1+2, C4-E4-G4-C5 arpeggio, 30 frames
- **Death crash**: Noise channel, descending sweep, 45 frames
- **Proximity warning**: Pulse E6, 5 frames (when antibody <32px)

### Music
- **Main theme**: Minimal ambient synth, 100 BPM, laboratory atmosphere
- **Level clear**: Triumphant fanfare, 5 seconds
- **Title screen**: Mysterious scientific theme, 120 BPM

## Technical Constraints

### Memory
- **PRG-ROM**: 32KB (2×16KB banks)
- **CHR-ROM**: 8KB (all sprite/tile graphics)
- **RAM**: 2KB (standard NES)
- **SRAM**: 8KB battery-backed (high scores)

### Performance Targets
- **Frame rate**: Locked 60 FPS
- **Input lag**: Maximum 1 frame
- **Sprite flicker**: None (under sprite budget)
- **Audio lag**: Maximum 2 frames for SFX trigger

### Entity Data Structures
- **Cells**: 16 bytes each (position, velocity, animation state)
- **Antibodies**: 16 bytes each (position, velocity, AI type, target)
- **Nutrients**: 16 bytes each (position, animation frame, value)

## Key Design Decisions

### Why 8x8 Sprites?
1. **Simpler collision detection**: Single 8x8 hitbox per entity
2. **Sprite budget headroom**: 38 sprites free for effects/UI
3. **Reinforces theme**: Tiny cells emphasize microscopic scale
4. **No flickering**: Well under 64-sprite hardware limit

### Why Max 4 Cells?
1. **Focused mechanic**: Keeps multi-unit control manageable
2. **Clear progression**: 1→2→4 is intuitive doubling
3. **Technical safety**: Leaves sprite budget for 12 enemies + 10 nutrients
4. **Difficulty sweet spot**: 4 cells is challenging but not overwhelming

### Why Minimal Audio?
1. **Thematic fit**: Laboratory ambience matches biological setting
2. **Channel budget**: Leaves room for SFX during gameplay
3. **Atmosphere**: Sparse audio creates tension
4. **Technical**: Simpler audio engine, more stable

## Testing Acceptance Criteria

### Core Mechanics
- [ ] All cells respond to input simultaneously
- [ ] Mitosis occurs at 10 and 20 nutrients
- [ ] Collision with antibody = immediate game over
- [ ] 30 nutrients = level clear
- [ ] Level difficulty increases correctly

### Technical
- [ ] 60 FPS maintained at all times
- [ ] No sprite flicker
- [ ] Audio plays without crackling
- [ ] Collision detection is accurate and fair
- [ ] Game recovers from all edge cases

### Polish
- [ ] Animations are smooth
- [ ] Visual feedback for all actions
- [ ] Audio feedback for all events
- [ ] UI is clear and readable
- [ ] Game feels responsive

## Out of Scope (V1)
- Power-ups
- Two-player mode
- Boss battles
- Achievements
- Multiple difficulty settings

These can be added in V2 if desired.

---
**Version**: 1.0 FINAL  
**Date**: 2026-02-11  
**Authority**: Game Designer  
**Status**: LOCKED - Implementation may begin
