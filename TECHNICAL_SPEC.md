# MITOSIS PANIC - Technical Specification

## Game Concept
Biological arcade game where player controls microscopic cells that divide via mitosis, creating multiple units controlled simultaneously. Single-screen petri dish arena, collect nutrients, avoid antibodies.

## Technical Architecture

### Memory Map (NES)
```
$0000-$00FF: Zero Page (fast access variables)
$0100-$01FF: Stack
$0200-$02FF: OAM Shadow (sprite data)
$0300-$07FF: Game RAM
  $0300-$03FF: Cell data array (16 cells max, 16 bytes each)
  $0400-$047F: Antibody data array (8 antibodies max, 16 bytes each)
  $0480-$04FF: Nutrient data array (8 nutrients max, 16 bytes each)
  $0500-$05FF: Game state variables
  $0600-$07FF: Sound engine workspace
$8000-$FFFF: PRG ROM
```

### Entity Limits
- **Player Cells**: Max 16 (starts at 1, divides on nutrient collection)
- **Antibodies**: Max 8 (spawn rate increases with difficulty)
- **Nutrients**: Max 8 (constant spawn to encourage division)
- **Sprites**: 64 total available, 8 per scanline limit

### Entity Data Structures

#### Cell (16 bytes)
```
Offset  Size  Description
+$00    1     Active flag (0=inactive, 1=active)
+$01    1     X position (pixels)
+$02    1     Y position (pixels)
+$03    1     X velocity (signed)
+$04    1     Y velocity (signed)
+$05    1     Size (radius in pixels)
+$06    1     Animation frame
+$07    1     State flags (dividing, invincible, etc)
+$08-$0F      Reserved
```

#### Antibody (16 bytes)
```
Offset  Size  Description
+$00    1     Active flag
+$01    1     X position
+$02    1     Y position
+$03    1     X velocity
+$04    1     Y velocity
+$05    1     AI type (0=chase, 1=patrol, 2=random)
+$06    1     Animation frame
+$07    1     Target cell index
+$08-$0F      Reserved
```

#### Nutrient (16 bytes)
```
Offset  Size  Description
+$00    1     Active flag
+$01    1     X position
+$02    1     Y position
+$03    1     Animation frame
+$04    1     Nutrient value
+$05-$0F      Reserved
```

### Game Loop (60 FPS)
```
1. Read controller input
2. Update all active cells (apply input to ALL cells)
3. Update antibody AI and movement
4. Check collisions:
   - Cells vs Nutrients (trigger division, play SFX)
   - Cells vs Antibodies (destroy cell, play SFX)
   - Cells vs Arena bounds (wrap or bounce)
5. Spawn new entities based on difficulty
6. Update animations
7. Render sprites (cells, antibodies, nutrients)
8. Render background (petri dish)
9. Update sound engine
10. Wait for VBlank
```

### Input Handling
- **D-Pad**: Applies velocity to ALL active cells simultaneously
- **A Button**: Reserved (future: split specific cell?)
- **B Button**: Reserved (future: merge cells?)
- All cells respond to same input = unique challenge

### Collision Detection
- Circle-to-circle using distance formula
- Approximation for speed: Manhattan distance check first, then precise
- Cells and antibodies: radius ~8 pixels
- Nutrients: radius ~4 pixels

### Difficulty Scaling
- **Wave 1-3**: 1-2 antibodies, slow speed
- **Wave 4-6**: 2-4 antibodies, medium speed
- **Wave 7+**: 4-8 antibodies, fast speed
- More cells = harder to control but more survivability

### Graphics Plan
- **Background**: Static petri dish pattern with grid
- **Sprites**:
  - Cell: 2x2 metatile (4 sprites), pulsing animation
  - Antibody: 2x2 metatile, Y-shaped design
  - Nutrient: 1x1 sprite, rotating animation
- **Palette**: Blues/greens for cells, reds for antibodies, yellows for nutrients

### Sound Events
- Cell division/mitosis (pulse channel, upward sweep)
- Nutrient collection (triangle, short blip)
- Cell death (noise, harsh crash)
- Antibody spawn (pulse, ominous tone)
- Background music (looping, tense biological theme)

## Development Phases

### Phase 1: Core Engine
- [ ] Build system setup (ca65/ld65)
- [ ] NES header and initialization code
- [ ] VBlank handler and main loop skeleton
- [ ] Controller input reading

### Phase 2: Graphics
- [ ] CHR data (sprite tiles)
- [ ] Palette data
- [ ] Background rendering (petri dish)
- [ ] Sprite rendering (OAM DMA)

### Phase 3: Game Logic
- [ ] Cell entity system
- [ ] Input → velocity application
- [ ] Collision detection routine
- [ ] Antibody AI
- [ ] Nutrient spawning

### Phase 4: Sound Integration
- [ ] Sound engine (coordinated with Sound Engineer)
- [ ] Event triggers
- [ ] Music playback

### Phase 5: Polish
- [ ] Difficulty progression
- [ ] Score system
- [ ] Game over / restart
- [ ] Visual effects

## Build Instructions
```bash
# Assembler: ca65 (cc65 toolchain)
ca65 main.asm -o main.o
ld65 -C nes.cfg main.o -o mitosis_panic.nes

# Test with emulator
fceux mitosis_panic.nes
```

## Testing Requirements (for QA Engineer)
- Verify all cells respond to input
- Test collision detection accuracy
- Verify sprite limits aren't exceeded
- Check for slowdown/lag
- Verify sound plays correctly
- Test game over conditions
- Verify difficulty scaling
