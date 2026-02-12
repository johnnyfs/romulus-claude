# MITOSIS PANIC - Development Roadmap

## Project Status: Phase 1 - Foundation

### Completed Milestones ✓
- [x] Game concept designed (MITOSIS PANIC - biological arcade game)
- [x] Core game design specification (docs/GAME_SPEC.md)
- [x] Technical architecture planned (docs/TECHNICAL_ARCHITECTURE.md)
- [x] Visual asset specifications (assets/specs/sprite_specs.md)
- [x] Audio asset specifications (assets/specs/audio_specs.md)
- [x] Team structure established (all agents spawned)

---

## Phase 1: Foundation (Current)
**Goal**: Establish build toolchain and verify basic NES ROM functionality

### Tasks
1. **Build Toolchain Setup** [IN PROGRESS]
   - Owner: Game Engineer
   - Install cc65 compiler and tools
   - Create Makefile with build targets
   - Set up iNES ROM structure
   - Target: Working build pipeline

2. **Hello World ROM** [PENDING]
   - Owner: Game Engineer
   - Create minimal NES ROM that boots
   - Display simple sprite or background
   - Verify in FCEUX/Mesen emulators
   - Target: Proof of toolchain functionality

3. **QA Environment Setup** [PENDING]
   - Owner: QA Engineer
   - Install and configure emulators
   - Create testing checklist
   - Establish bug reporting workflow
   - Target: Ready to test ROM builds

4. **Initial Sprite Assets** [PENDING]
   - Owner: Image Collector
   - Create player cell sprite (1 frame minimum)
   - Create nutrient sprite (1 type)
   - Convert to CHR format
   - Target: Test sprites for hello world

5. **Initial Audio Assets** [PENDING]
   - Owner: Sound Designer
   - Create mitosis SFX
   - Create nutrient collection SFX
   - Target: FamiTone2 compatible format

**Exit Criteria**: Hello world ROM boots, displays sprite, build system works

---

## Phase 2: Core Engine
**Goal**: Implement basic NES engine (rendering, input, timing)

### Tasks
1. **NES Initialization** [PENDING]
   - PPU initialization
   - APU initialization
   - RAM clear
   - Interrupt handlers (NMI, Reset)

2. **Input System** [PENDING]
   - Controller reading
   - D-pad input capture
   - Button debouncing
   - Pause functionality

3. **Sprite Rendering** [PENDING]
   - OAM buffer management
   - VBlank transfer
   - Basic sprite display
   - Animation frame cycling

4. **Background Rendering** [PENDING]
   - Nametable setup
   - Petri dish arena display
   - Palette loading

5. **Audio Engine Integration** [PENDING]
   - Owner: Sound Engineer
   - FamiTone2 integration
   - Basic SFX playback test
   - Music playback test

**Exit Criteria**: ROM displays arena background, renders animated sprites, accepts D-pad input, plays test sound

---

## Phase 3: Game Mechanics
**Goal**: Implement core gameplay (movement, collision, collection)

### Tasks
1. **Player Movement** [PENDING]
   - Owner: Game Engineer
   - 8-directional D-pad control
   - Single cell movement
   - Arena boundary collision
   - Speed: 1.5 pixels/frame

2. **Nutrient System** [PENDING]
   - Random spawn system (LCG RNG)
   - Nutrient rendering
   - Collection collision detection
   - Score increment
   - Respawn logic

3. **Collision Detection** [PENDING]
   - AABB algorithm implementation
   - Player vs nutrient collision
   - Player vs boundary collision
   - Optimized checking (early exit)

4. **Complete Sprite Set** [PENDING]
   - Owner: Image Collector
   - All player cell animation frames
   - All nutrient variants
   - Antibody sprites (all 4 types)
   - UI elements

**Exit Criteria**: Player moves, collects nutrients, score increments, basic collision works

---

## Phase 4: Enemy AI
**Goal**: Implement all antibody enemy types and patterns

### Tasks
1. **Antibody Type 1: Horizontal Patrol** [PENDING]
   - Left-right movement
   - Screen edge reversal
   - Configurable speed

2. **Antibody Type 2: Vertical Patrol** [PENDING]
   - Up-down movement
   - Screen edge reversal

3. **Antibody Type 3: Diagonal Sweep** [PENDING]
   - 45-degree angle movement
   - Wall bounce reflection

4. **Antibody Type 4: Circular Orbit** [PENDING]
   - Sin/cos lookup tables
   - Fixed-point math
   - Orbit around center point

5. **Player vs Enemy Collision** [PENDING]
   - Collision detection
   - Game over trigger
   - Death animation/sound

**Exit Criteria**: All 4 enemy types work, collision with player triggers game over

---

## Phase 5: Mitosis Mechanic
**Goal**: Implement the core unique mechanic - cell division

### Tasks
1. **Mitosis Trigger** [PENDING]
   - Trigger at 10 and 20 nutrients
   - Freeze game state
   - Play mitosis SFX/animation

2. **Cell Division Logic** [PENDING]
   - Duplicate each cell
   - Offset new cells (8px N/S)
   - Update cell count

3. **Multi-Cell Movement** [PENDING]
   - Simultaneous input to all cells
   - Individual collision per cell
   - Collision blocks all cells

4. **Multi-Cell Rendering** [PENDING]
   - Render all active cells
   - Animation sync
   - Sprite limit handling

**Exit Criteria**: Mitosis occurs correctly, multiple cells move together, game handles up to 4 cells

---

## Phase 6: Level System
**Goal**: Implement level progression and difficulty scaling

### Tasks
1. **Level Structure** [PENDING]
   - Level number tracking
   - Level clear at 30 nutrients
   - Reset to 1 cell on new level

2. **Difficulty Scaling** [PENDING]
   - Enemy speed increases per level
   - Enemy count increases per level
   - Pattern mix varies by level

3. **Level Transitions** [PENDING]
   - Level clear screen
   - Score bonus calculation
   - Press START to continue

**Exit Criteria**: Levels progress correctly, difficulty scales, transitions smooth

---

## Phase 7: Audio Integration
**Goal**: Integrate all music and sound effects

### Tasks
1. **Complete Music Tracks** [PENDING]
   - Owner: Sound Designer
   - Main theme (looping)
   - Level clear fanfare
   - Game over theme

2. **Complete SFX Set** [PENDING]
   - Owner: Sound Designer
   - All nutrient collection variants
   - Proximity warning beep
   - Death sound

3. **Event Integration** [PENDING]
   - Owner: Sound Engineer
   - Wire SFX to game events
   - Music state management
   - Channel priority system

**Exit Criteria**: All audio plays correctly, no crackling, proper mixing

---

## Phase 8: UI & Polish
**Goal**: Add user interface and visual polish

### Tasks
1. **HUD System** [PENDING]
   - Score display (top)
   - Level number display
   - Cell count indicator
   - Nutrients collected (X/30)

2. **Title Screen** [PENDING]
   - Game logo
   - "Press START" prompt
   - High score display

3. **Game Over Screen** [PENDING]
   - Final score display
   - High score comparison
   - Retry / Title options

4. **Visual Polish** [PENDING]
   - Particle effects (nutrient collection)
   - Mitosis animation refinement
   - Death flash effect
   - Screen transitions

**Exit Criteria**: Complete UI, polished visuals, professional presentation

---

## Phase 9: Testing & Bug Fixes
**Goal**: Comprehensive testing and quality assurance

### Tasks
1. **Functional Testing** [ONGOING]
   - Owner: QA Engineer
   - Test all game mechanics
   - Test all levels (1-10 minimum)
   - Test edge cases (max cells, max enemies)

2. **Performance Testing** [PENDING]
   - Verify 60 FPS maintained
   - Check sprite limit handling
   - Ensure no slowdown

3. **Compatibility Testing** [PENDING]
   - Test on multiple emulators
   - Test on real NES hardware (if available)

4. **Bug Fixing** [ONGOING]
   - All engineers
   - Address all critical bugs
   - Resolve graphical glitches
   - Fix audio issues

**Exit Criteria**: Zero critical bugs, smooth 60 FPS, passes all acceptance tests

---

## Phase 10: Final Delivery
**Goal**: Deliver complete, playable NES ROM

### Tasks
1. **Final Build** [PENDING]
   - Clean ROM build
   - Verify iNES header
   - Test final ROM thoroughly

2. **Documentation** [PENDING]
   - Update README with play instructions
   - Document controls clearly
   - Include credits

3. **Release Package** [PENDING]
   - ROM file (mitosis-panic.nes)
   - README
   - Credits
   - Screenshot/gameplay GIF

**Exit Criteria**: Playable ROM delivered, fully documented, ready for distribution

---

## Current Priority Actions

### Immediate (Next 24 hours)
1. Game Engineer: Set up cc65, create hello-world ROM
2. QA Engineer: Set up emulator testing environment
3. Image Collector: Create initial player cell and nutrient sprites
4. Sound Engineer: Evaluate FamiTone2, plan integration
5. Sound Designer: Create mitosis and nutrient collection SFX

### Short Term (Week 1)
- Complete Phase 1 (Foundation)
- Complete Phase 2 (Core Engine)
- Begin Phase 3 (Game Mechanics)

### Medium Term (Week 2-3)
- Complete Phase 3-6 (Mechanics, AI, Mitosis, Levels)
- Complete Phase 7 (Audio Integration)

### Long Term (Week 4)
- Complete Phase 8-10 (Polish, Testing, Delivery)

---

## Risk Factors

### Technical Risks
- **Sprite limit (64)**: Mitigation - Priority-based hiding system
- **Simultaneous multi-cell collision**: Mitigation - Early testing of worst case (4 cells)
- **Circular orbit math**: Mitigation - Lookup tables, fixed-point arithmetic
- **Audio channel contention**: Mitigation - FamiTone2 + priority system

### Timeline Risks
- **Asset creation bottleneck**: Mitigation - Start with minimal assets, add detail later
- **Build toolchain issues**: Mitigation - Verify toolchain ASAP (Phase 1 priority)
- **Scope creep**: Mitigation - Stick to core design, defer enhancements

---

## Success Metrics

### Minimum Viable Product (MVP)
- ✓ ROM boots on emulator
- ✓ Player movement works
- ✓ Nutrient collection works
- ✓ At least 2 enemy types implemented
- ✓ Mitosis mechanic works (up to 2 cells)
- ✓ At least 3 levels playable
- ✓ Basic audio (1 SFX, background music)

### Full Release Criteria
- ✓ All 4 enemy types with correct AI
- ✓ Mitosis works up to 4 cells
- ✓ 10+ levels with proper difficulty scaling
- ✓ Complete audio (all SFX, all music tracks)
- ✓ Full UI (HUD, title screen, game over)
- ✓ 60 FPS performance maintained
- ✓ Zero critical bugs
- ✓ Passes all acceptance tests from GAME_SPEC.md

---

**Last Updated**: 2026-02-11  
**Project Manager**: Game Designer  
**Status**: Phase 1 - Foundation (IN PROGRESS)
