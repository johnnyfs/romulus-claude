# MITOSIS PANIC - Technical Architecture Proposal

## Technology Stack

### Development Tools
- **cc65**: 6502 C compiler and assembler
- **NES libraries**: neslib.h for basic NES functions
- **Build system**: Makefile
- **Emulator**: FCEUX or Mesen for testing
- **Graphics tools**: NES Screen Tool or YY-CHR for CHR data

### Mapper Configuration
- **Mapper**: NROM (Mapper 0)
- **PRG-ROM**: 32KB (single bank)
- **CHR-ROM**: 8KB (single bank)
- **Mirroring**: Horizontal
- **SRAM**: None required (but could add for high score persistence)

## Code Architecture

### Main Program Flow
```
main.asm (entry point)
  ├── init.asm (NES initialization)
  ├── game_loop.asm (main loop)
  │   ├── input.asm (controller reading)
  │   ├── logic.asm (game state updates)
  │   ├── physics.asm (movement & collision)
  │   └── render.asm (sprite/bg updates)
  ├── audio.asm (sound engine)
  └── data.asm (constants, tables, sprites)
```

### Module Breakdown

#### 1. Initialization Module (init.asm)
- Clear RAM ($0000-$07FF)
- Initialize PPU registers
- Initialize APU registers
- Set initial game state
- Load title screen graphics
- Set up NMI handler

#### 2. Input Module (input.asm)
- Read controller port
- Debounce buttons
- Store directional input for processing
- Handle pause/start functionality

#### 3. Game Logic Module (logic.asm)
- **State machine**:
  - TITLE_SCREEN
  - GAMEPLAY
  - PAUSED
  - MITOSIS_ANIMATION
  - LEVEL_CLEAR
  - GAME_OVER
- **Event handlers**:
  - collect_nutrient()
  - trigger_mitosis()
  - complete_level()
  - player_death()

#### 4. Physics Module (physics.asm)
- **Player movement**:
  - update_player_cells() - move all cells based on input
  - clamp_to_arena() - prevent out-of-bounds
- **Enemy AI**:
  - update_antibodies() - update positions based on pattern
  - horizontal_patrol()
  - vertical_patrol()
  - diagonal_sweep()
  - circular_orbit()
- **Collision detection**:
  - check_cell_nutrient_collision()
  - check_cell_antibody_collision()
  - AABB (Axis-Aligned Bounding Box) algorithm

#### 5. Rendering Module (render.asm)
- **Sprite management**:
  - update_oam() - copy sprites to OAM buffer
  - sprite_multiplexing() - handle >64 sprite limit
  - animate_cells() - cycle through animation frames
  - animate_antibodies()
- **Background rendering**:
  - draw_arena() - petri dish background
  - draw_hud() - score, level, cells count
- **VBlank handler**:
  - Transfer OAM during VBlank
  - Update nametable if needed

#### 6. Audio Module (audio.asm)
- **Sound engine**:
  - init_audio() - set up APU
  - update_audio() - called each frame
  - play_sfx(effect_id) - trigger sound effect
  - play_music(track_id) - start music track
- **Channel allocation**:
  - Pulse 1: SFX priority
  - Pulse 2: SFX + proximity warning
  - Triangle: Music bass + SFX
  - Noise: SFX only
  - DMC: Unused (save processing)
- **Music player**:
  - Simple tracker format
  - 4-channel sequencer
  - 16 frames per beat

#### 7. Data Module (data.asm)
- **Constants**:
  - Screen dimensions
  - Sprite sizes
  - Speed values
  - Collision boxes
- **Lookup tables**:
  - Sin/cos tables for circular movement
  - Animation frame sequences
  - Level difficulty tables
- **Graphics data**:
  - Sprite definitions (16x16 meta-sprites)
  - Nametable data (background)
  - Palette data

## Memory Map

### Zero Page ($00-$FF) - Fast Access Variables
```
$00-$01: Temporary variables
$02-$09: Player cell X positions (8 bytes)
$0A-$11: Player cell Y positions (8 bytes)
$12:     Player cell count
$13:     Current level
$14-$15: Score (BCD)
$16:     Nutrients collected
$17:     Game state
$18:     Frame counter
$19:     Animation frame
$1A-$1B: Random number seed
$1C-$FF: Reserved/temporary
```

### RAM ($0200-$07FF)
```
$0200-$02FF: OAM buffer (sprite data)
$0300-$030B: Antibody X positions (12 bytes)
$030C-$0317: Antibody Y positions (12 bytes)
$0318-$0323: Antibody types (12 bytes)
$0324-$032F: Antibody AI state (12 bytes)
$0330-$0339: Nutrient X positions (10 bytes)
$033A-$0343: Nutrient Y positions (10 bytes)
$0344-$03FF: Audio engine state
$0400-$07FF: Stack and misc variables
```

## Graphics Design

### CHR-ROM Layout (8KB)
```
$0000-$0FFF: Sprite tiles
  $0000-$00FF: Player cell frames (16 tiles × 4 frames)
  $0100-$01FF: Antibody frames (16 tiles × 4 types × 2 frames)
  $0200-$02FF: Nutrient sprites (4 tiles × 2 frames)
  $0300-$03FF: UI elements (numbers, borders, icons)
  $0400-$0FFF: Reserved for animations

$1000-$1FFF: Background tiles
  $1000-$10FF: Petri dish border tiles
  $1100-$11FF: Grid pattern tiles
  $1200-$12FF: HUD tiles (score, level display)
  $1300-$1FFF: Reserved
```

### Palette Configuration
```
Background Palette:
  $3F00: $0F $01 $11 $21 (Petri dish - blacks, dark blue, light blue)
  $3F04: $0F $00 $10 $30 (Grid - blacks, gray, light gray)
  $3F08: $0F $0F $0F $0F (Unused)
  $3F0C: $0F $0F $0F $0F (Unused)

Sprite Palette:
  $3F10: $0F $0C $1C $2C (Player cells - cyan shades)
  $3F14: $0F $06 $16 $26 (Antibodies - red shades)
  $3F18: $0F $0A $1A $2A (Nutrients - green shades)
  $3F1C: $0F $00 $10 $30 (UI elements - grayscale)
```

## Game Loop Timing

### Frame Structure (16.67ms per frame @ 60 FPS)
```
NMI Interrupt:
  - Transfer OAM ($0200) to PPU OAM
  - Update scroll registers
  - Update palettes if needed
  - Acknowledge NMI
  [~2ms]

Main Loop:
  - Read controller input [0.1ms]
  - Update game logic [1-2ms]
  - Update physics (movement, collision) [2-3ms]
  - Update audio engine [1ms]
  - Update sprite data in OAM buffer [2-3ms]
  - Wait for next VBlank [remaining time]
```

## Collision Detection Algorithm

### AABB (Axis-Aligned Bounding Box)
```c
bool check_collision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (x1 < x2 + w2 &&
          x1 + w1 > x2 &&
          y1 < y2 + h2 &&
          y1 + h1 > y2);
}
```

### Optimization Strategy
- Check player cells vs antibodies first (most critical)
- Only check active nutrients (skip empty slots)
- Use early exit on first collision
- Group collision checks in same memory locality

## Critical Technical Challenges

### Challenge 1: Sprite Multiplexing
**Problem**: Up to 90 sprites needed, NES limit is 64
**Solution**: 
- Prioritize player cells and nearby antibodies
- Use flickering for distant antibodies
- Hide nutrients when sprite limit reached (spawn new ones)

### Challenge 2: Synchronized Multi-Cell Movement
**Problem**: Moving 8 cells simultaneously with collision
**Solution**:
- Store all cell positions in arrays
- Single input applied to all positions
- Check collision for each cell independently
- If any cell hits boundary, block ALL cells in that direction

### Challenge 3: Random Nutrient Spawning
**Problem**: Need truly random positions that don't overlap entities
**Solution**:
- Linear congruential RNG: seed = (seed * 75 + 74) % 65537
- Rejection sampling (try random position, retry if too close to antibody)
- Max 10 retries, then use fallback safe position

### Challenge 4: Circular Orbit AI
**Problem**: Sin/cos calculation expensive on 6502
**Solution**:
- Pre-computed sin/cos lookup tables (256 entries)
- Fixed-point math (8.8 format)
- Orbit center at arena midpoint (112, 104)

## Build Pipeline

### Compilation Steps
```makefile
1. Assemble sprites: nesst sprites.png → sprites.chr
2. Compile C code: cc65 -O -t nes game.c → game.s
3. Assemble: ca65 game.s → game.o
4. Link: ld65 -C nes.cfg game.o → game.nes
5. Add iNES header: prepend 16-byte header to ROM
```

### iNES Header Structure
```
Byte 0-3:   "NES" $1A (magic number)
Byte 4:     PRG-ROM size (2 = 32KB)
Byte 5:     CHR-ROM size (1 = 8KB)
Byte 6:     Flags 6 (mapper low, mirroring)
Byte 7:     Flags 7 (mapper high)
Byte 8-15:  Reserved (zeros)
```

## Testing Strategy

### Unit Testing (where applicable)
- Collision detection functions (test in isolation)
- RNG distribution (ensure good randomness)
- AI pattern correctness (verify patrol boundaries)

### Integration Testing
- Test on FCEUX emulator (most accurate)
- Test on Mesen (debugging features)
- Performance profiling (ensure 60 FPS maintained)
- Sprite limit testing (verify multiplexing works)

### Acceptance Testing
- All 10 levels playable
- Mitosis triggers correctly at 10, 20 nutrients
- Level clears at 30 nutrients
- Collision detection accurate (no phantom hits)
- Audio plays correctly (no stuttering)
- No crashes or graphical glitches

## Questions for Chief Engineer

1. **Language preference**: Pure assembly or C with cc65? Assembly gives more control, C is faster to write.
2. **Sound engine**: Custom implementation or use existing NES music engine (e.g., FamiTone)?
3. **RNG method**: LCG (simple) or LFSR (better quality)?
4. **Sprite multiplexing strategy**: Vertical flickering or priority-based hiding?
5. **Build workflow**: Manual Makefile or automated build script?

## Recommended Next Steps

1. Chief Engineer reviews this architecture
2. Sound Engineer plans audio system details
3. Game Engineer plans game loop implementation
4. Set up repository structure and build toolchain
5. Create "hello world" NES ROM to verify toolchain
6. Begin Phase 1: Core Engine development
