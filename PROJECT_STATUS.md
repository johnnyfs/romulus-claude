# MITOSIS PANIC - Project Status

**Last Updated**: 2026-02-11  
**Game Designer**: Coordinating overall development

## Project Overview
Creating a playable NES ROM of MITOSIS PANIC - an arcade-style biological survival game with unique multi-unit control mechanic.

## Current Phase: Pre-Alpha Development
**Target**: First playable ROM with core mechanics

---

## Team Status

### Art Director
- **Status**: Active
- **Current Work**: Coordinating visual/audio asset creation
- **Blockers**: Resolving audio direction conflict (minimal vs upbeat)

#### Image Collector (reports to Art Director)
- **Status**: Active  
- **Current Work**: Creating core sprite assets
- **Deliverables Needed**:
  - [ ] Player cell sprite (16x16, 4-frame breathing animation)
  - [ ] Nutrient particles (8x8, 3 color variants)
  - [ ] Antibody enemies (16x16, 4 types)
  - [ ] Petri dish background tiles
  - [ ] UI elements (score, cell count)

#### Sound Designer (reports to Art Director)
- **Status**: Active
- **Current Work**: Audio research and asset creation
- **Deliverables Needed**:
  - [ ] Nutrient collection bloop SFX
  - [ ] Mitosis jingle SFX
  - [ ] Death sound SFX
  - [ ] Background music (minimal ambient, 90-100 BPM)
- **Note**: Audio direction being clarified - should be minimal/atmospheric, not upbeat arcade

### Chief Engineer
- **Status**: Active
- **Current Work**: Hello-world ROM and build toolchain setup
- **Direct Reports**: Sound Engineer only (Game Engineer and QA Engineer spawns rejected)
- **Handling**: Game logic implementation directly

#### Sound Engineer (reports to Chief Engineer)
- **Status**: Active
- **Current Work**: Planning FamiTone2 integration
- **Deliverables**:
  - [ ] Audio engine architecture
  - [ ] SFX player system
  - [ ] Music player integration

#### Game Engineer
- **Status**: NOT SPAWNED (Chief Engineer handling directly)

#### QA Engineer  
- **Status**: NOT SPAWNED (testing coordination TBD)

---

## Documentation Status

### Completed Documents
- [x] README.md - Project overview and team structure
- [x] DESIGN.md - Core game design concepts
- [x] TECHNICAL_SPEC.md - Technical architecture and memory map
- [x] docs/GAME_SPEC.md - Comprehensive game mechanics specification
- [x] docs/GAME_DESIGN.md - Game design rationale
- [x] docs/TECHNICAL_ARCHITECTURE.md - Detailed technical planning
- [x] assets/specs/sprite_specs.md - Visual asset specifications
- [x] assets/specs/audio_specs.md - Audio asset specifications (needs revision)

### Pending Documentation
- [ ] Build instructions (waiting for toolchain completion)
- [ ] Asset integration guide
- [ ] Testing procedures
- [ ] ROM distribution guide

---

## Technical Milestones

### Phase 1: Build System & Hello World ⏳ IN PROGRESS
- [ ] cc65 toolchain configured
- [ ] NES ROM header and init code
- [ ] Hello world displays on screen
- [ ] Build scripts documented
- [ ] Emulator testing verified (FCEUX)

**Owner**: Chief Engineer  
**Status**: In Progress  
**ETA**: TBD

### Phase 2: Core Engine 🔜 NEXT
- [ ] Sprite rendering system
- [ ] Background rendering (petri dish)
- [ ] Controller input reading
- [ ] VBlank handler
- [ ] OAM DMA sprite updates

**Owner**: Chief Engineer  
**Dependencies**: Phase 1 complete

### Phase 3: Game Mechanics 📋 PLANNED
- [ ] Player cell entity system
- [ ] Multi-cell simultaneous movement
- [ ] Collision detection (cell vs nutrient, cell vs antibody)
- [ ] Mitosis trigger and animation
- [ ] Nutrient spawning system

**Owner**: Chief Engineer  
**Dependencies**: Phase 2 complete, sprite assets available

### Phase 4: Enemy AI 📋 PLANNED
- [ ] Antibody entity system
- [ ] Horizontal patrol pattern
- [ ] Vertical patrol pattern  
- [ ] Diagonal sweep pattern
- [ ] Circular orbit pattern
- [ ] Level-based speed scaling

**Owner**: Chief Engineer  
**Dependencies**: Phase 3 complete

### Phase 5: Audio Integration 📋 PLANNED
- [ ] FamiTone2 engine integrated
- [ ] SFX playback working
- [ ] Background music playing
- [ ] Audio ducking for important SFX
- [ ] Sound priority system

**Owner**: Sound Engineer + Chief Engineer  
**Dependencies**: Phase 2 complete, audio assets available

### Phase 6: Level Progression 📋 PLANNED
- [ ] Score tracking system
- [ ] Level number tracking
- [ ] Enemy spawn patterns per level
- [ ] Level clear detection
- [ ] Victory screen
- [ ] Game over screen

**Owner**: Chief Engineer  
**Dependencies**: Phase 3, 4 complete

### Phase 7: Polish & Testing 📋 PLANNED
- [ ] Full playthrough testing
- [ ] Bug fixes
- [ ] Animation polish
- [ ] Balance tuning
- [ ] High score save (SRAM)
- [ ] Final ROM optimization

**Owner**: All team  
**Dependencies**: All previous phases

---

## Active Issues

### Issue #1: Audio Direction Conflict
**Priority**: HIGH  
**Description**: Conflicting specifications for background music tone (minimal ambient vs upbeat arcade)  
**Affected**: Sound Designer, audio_specs.md  
**Resolution**: Game Designer directive is minimal ambient (Tetris Type B style, 90-100 BPM)  
**Action**: Sound Designer to revise audio_specs.md background music section

### Issue #2: Limited Agent Spawning
**Priority**: MEDIUM  
**Description**: Game Engineer and QA Engineer spawns were rejected  
**Impact**: Chief Engineer handling game logic directly, QA process needs alternate approach  
**Workaround**: Chief Engineer does implementation, coordinate ad-hoc testing  
**Status**: Accepted workaround

---

## Repository Structure

```
/romulus-claude
├── README.md                      ✓ Complete
├── DESIGN.md                      ✓ Complete
├── TECHNICAL_SPEC.md              ✓ Complete
├── PROJECT_STATUS.md              ✓ This file
├── /docs
│   ├── GAME_SPEC.md               ✓ Complete
│   ├── GAME_DESIGN.md             ✓ Complete
│   └── TECHNICAL_ARCHITECTURE.md  ✓ Complete
├── /assets
│   └── /specs
│       ├── sprite_specs.md        ✓ Complete
│       └── audio_specs.md         ⚠ Needs revision
├── /graphics                      ⏳ Waiting for assets
├── /audio                         ⏳ Waiting for assets
├── /src                           ⏳ Waiting for code
└── /build                         ⏳ Waiting for toolchain
```

---

## Next Actions

### Immediate (Today)
1. **Sound Designer**: Revise audio_specs.md background music to minimal ambient style
2. **Chief Engineer**: Complete hello-world ROM and push to repo
3. **Image Collector**: Begin creating player cell sprite

### Short Term (This Week)
1. Build toolchain fully documented
2. Core sprite assets created (player, nutrients, 2 antibody types minimum)
3. Essential SFX created (bloop, mitosis, death)
4. Core engine rendering sprites and reading input

### Medium Term (Next Week)
1. Player movement and collision working
2. Basic enemy AI (2 patrol patterns)
3. Mitosis mechanic functional
4. Audio engine integrated

---

## Success Criteria

### Minimum Viable ROM (MVP)
- [ ] Runs on FCEUX emulator without crashes
- [ ] Player can control 1 cell with D-pad
- [ ] Nutrients spawn and can be collected
- [ ] Collecting nutrients triggers mitosis (1→2→4 cells)
- [ ] All cells move together simultaneously
- [ ] At least 2 antibody types patrol the arena
- [ ] Collision with antibody triggers game over
- [ ] Basic SFX play (collection, mitosis, death)
- [ ] Score displays and increments

### Full Release ROM (v1.0)
- All MVP features plus:
- [ ] All 4 antibody AI patterns working
- [ ] Level progression system (30 nutrients = clear)
- [ ] Enemy speed increases per level
- [ ] Background music loops properly
- [ ] Level clear and victory screens
- [ ] High score saves to SRAM
- [ ] Full visual polish (all animations)
- [ ] No bugs in 10+ full playthroughs

---

**Status Legend**:  
✓ Complete | ⏳ In Progress | 🔜 Next Up | 📋 Planned | ⚠ Needs Attention | ❌ Blocked
