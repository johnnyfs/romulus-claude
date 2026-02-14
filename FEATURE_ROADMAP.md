# MITOSIS PANIC - Feature Implementation Roadmap

**Status**: Post-Phase 5 Planning
**Current Version**: MVP (Minimum Viable Product)
**Target**: Complete Playable Game

---

## Current State (Phase 5 Complete)

### ✅ Implemented Features
- [x] Player cell movement (D-pad control)
- [x] Multi-cell simultaneous control
- [x] Nutrient spawning (3 constant on screen)
- [x] Nutrient collection mechanics
- [x] Mitosis system (divide every 10 nutrients)
- [x] Enemy AI (3 patterns: chase, h_patrol, v_patrol)
- [x] Collision detection (cell vs nutrient, cell vs antibody)
- [x] Game over state
- [x] Audio system (FamiTone2 with 4 SFX + music)
- [x] Score tracking (internal counter)
- [x] Arena boundaries

### ❌ Missing Features (Blocks "Complete Game")
- [ ] Restart functionality
- [ ] Score display (render on screen)
- [ ] Level progression
- [ ] Title screen
- [ ] Win condition
- [ ] Animation (nice-to-have)

---

## Phase 6: Core Polish (Required for Completion)

### Priority: **CRITICAL** (Game unplayable without these)

#### Feature 6.1: Restart System ⭐⭐⭐
**Objective**: Allow player to restart after game over

**Implementation**:
```asm
game_over_state:
    jsr render_entities

    ; Check for Start button press
    lda controller1
    and #$10        ; Start button mask
    beq :+          ; Not pressed, continue

    ; Restart game
    jsr init_game_state
    lda #0
    sta game_over_flag
:
    jmp nmi_done
```

**Complexity**: LOW (< 30 lines)
**Time Estimate**: 30 minutes
**Testing**: Press Start after game over, verify clean restart

---

#### Feature 6.2: Score Display System ⭐⭐⭐
**Objective**: Render score digits on screen

**Implementation**:
1. Create digit tiles in CHR ($20-$29 = "0"-"9")
2. Add BCD conversion routine for score_lo/score_hi
3. Render digits as sprites at top-right of screen

**Files to Modify**:
- `graphics/game.chr` - Add digit tiles
- `src/main.asm` - Add `render_score()` routine

**Complexity**: MEDIUM (80-100 lines)
**Time Estimate**: 2 hours
**Testing**: Verify score displays correctly, increments visibly

**Code Sketch**:
```asm
render_score:
    ; Convert score_lo to BCD
    lda score_lo
    jsr binary_to_bcd

    ; Render hundreds digit
    lda bcd_hundreds
    clc
    adc #$20        ; Tile offset for "0"
    sta $0200+Y_OFFSET

    ; Render tens digit
    lda bcd_tens
    clc
    adc #$20
    sta $0200+Y_OFFSET+4

    ; Render ones digit
    lda bcd_ones
    clc
    adc #$20
    sta $0200+Y_OFFSET+8
    rts
```

---

#### Feature 6.3: Level Progression System ⭐⭐
**Objective**: Increase difficulty as player progresses

**Design**:
- **Level Clear Condition**: Collect 30 nutrients
- **Difficulty Scaling**:
  - Level 1: 2 antibodies, speed = 2
  - Level 2: 3 antibodies, speed = 2
  - Level 3: 4 antibodies, speed = 3
  - Level 4+: +1 antibody per level, speed capped at 4

**Implementation**:
```asm
; Add to game state
level_number = $0508
nutrients_this_level = $0509

; In collect_nutrient:
inc nutrients_this_level
lda nutrients_this_level
cmp #30
bne :+

; Level clear!
inc level_number
lda #0
sta nutrients_this_level

; Spawn more antibodies based on level
lda level_number
cmp #10
bcs :+          ; Cap at 10 antibodies
jsr spawn_antibody
:

; Update antibody speed
jsr update_difficulty
:
```

**Complexity**: MEDIUM (100-150 lines)
**Time Estimate**: 3 hours
**Testing**: Play through 3 levels, verify difficulty increases

---

#### Feature 6.4: Title Screen ⭐
**Objective**: Add game intro with "Press Start"

**Implementation**:
1. Add title screen state to game FSM
2. Create title graphics (background tiles)
3. Display "MITOSIS PANIC" text
4. Display "Press Start to Begin"
5. Wait for Start button

**Design**:
```
=======================
    MITOSIS PANIC

    Cell Division
    Survival Game

  Press Start to Begin

    © 2026
=======================
```

**Complexity**: MEDIUM (150 lines)
**Time Estimate**: 3 hours
**Testing**: Boot ROM, see title screen, press Start → game begins

---

### Phase 6 Total Effort:
- **Time**: ~9 hours
- **Complexity**: Medium
- **Risk**: Low (well-understood systems)

---

## Phase 7: Content Expansion (Post-Launch)

### Priority: **HIGH** (Enhances fun factor)

#### Feature 7.1: Additional AI Patterns
**Objective**: Add circular and diagonal enemy patterns

**New AI Types**:
1. **Diagonal Sweep** (type 3)
   - Moves in diagonal lines
   - Bounces at corners

2. **Circular Orbit** (type 4)
   - Orbits around center of arena
   - Uses sine/cosine lookup table

**Complexity**: HIGH (200 lines, trigonometry)
**Time Estimate**: 5 hours

---

#### Feature 7.2: Victory Condition
**Objective**: End game after completing X levels

**Implementation**:
- Set win threshold (e.g., level 10)
- Display "You Win!" screen
- Show final score
- Allow restart

**Complexity**: LOW (50 lines)
**Time Estimate**: 1 hour

---

#### Feature 7.3: High Score Save
**Objective**: Persist high score to SRAM

**Implementation**:
1. Add SRAM to mapper config
2. Save score_hi/score_lo on game over
3. Load on boot
4. Display on title screen

**Complexity**: MEDIUM (100 lines)
**Time Estimate**: 2 hours

---

### Phase 7 Total Effort:
- **Time**: ~8 hours
- **Priority**: Lower (game complete without these)

---

## Phase 8: Visual Polish (Nice-to-Have)

### Priority: **MEDIUM** (Improves feel)

#### Feature 8.1: Cell Animation
**Objective**: Add breathing animation to cells

**Implementation**:
1. Add 2 more cell frames to CHR ($04-$07)
2. Cycle frame every 15 game frames
3. Update render_entities to use current frame

**Complexity**: LOW (30 lines)
**Time Estimate**: 1 hour

---

#### Feature 8.2: Particle Effects
**Objective**: Add visual feedback for events

**Events to Enhance**:
- Mitosis: Flash/sparkle effect
- Collection: Small burst
- Death: Explosion sprite

**Complexity**: HIGH (150 lines, sprite management)
**Time Estimate**: 4 hours

---

#### Feature 8.3: Background Graphics
**Objective**: Replace black background with petri dish pattern

**Implementation**:
1. Design petri dish pattern tiles
2. Fill nametable with pattern
3. Add subtle grid overlay

**Complexity**: MEDIUM (2 hours design, 1 hour implementation)
**Time Estimate**: 3 hours

---

### Phase 8 Total Effort:
- **Time**: ~8 hours
- **Priority**: Lowest (pure aesthetics)

---

## Implementation Priority Order

### **MUST HAVE** (Required for "Complete Game"):
1. ✅ Phase 5: Audio System (DONE)
2. ⏳ **Feature 6.1: Restart System** ← START HERE
3. ⏳ **Feature 6.2: Score Display**
4. ⏳ **Feature 6.3: Level Progression**
5. ⏳ **Feature 6.4: Title Screen**

**Total Time**: ~9 hours
**Result**: Fully playable, complete game

---

### **SHOULD HAVE** (Increases replayability):
6. Feature 7.2: Victory Condition
7. Feature 7.3: High Score Save
8. Feature 7.1: Additional AI Patterns

**Total Time**: +8 hours
**Result**: Polished, replayable game

---

### **NICE TO HAVE** (Visual polish):
9. Feature 8.1: Cell Animation
10. Feature 8.3: Background Graphics
11. Feature 8.2: Particle Effects

**Total Time**: +8 hours
**Result**: Professional-looking game

---

## Development Phases Summary

| Phase | Status | Features | Time | Result |
|-------|--------|----------|------|--------|
| Phase 1 | ✅ DONE | Hello World ROM | 2h | ROM builds |
| Phase 2 | ✅ DONE | Input & Entities | 3h | Player moves |
| Phase 3 | ✅ DONE | Collision & Mitosis | 4h | Core gameplay |
| Phase 4 | ✅ DONE | Enemy AI | 3h | Challenge added |
| Phase 5 | ✅ DONE | Audio | 4h | MVP complete |
| **Phase 6** | ⏳ **NEXT** | Core Polish | **9h** | **Complete game** |
| Phase 7 | 📋 PLANNED | Content Expansion | 8h | Replayable game |
| Phase 8 | 📋 PLANNED | Visual Polish | 8h | Professional game |

---

## Risk Assessment

### Low Risk ✅
- Restart system (well-understood)
- Score display (standard NES technique)
- Title screen (simple state machine)

### Medium Risk ⚠️
- Level progression (needs balancing)
- High score save (SRAM complexity)
- Background graphics (CHR space limits)

### High Risk 🔴
- Particle effects (sprite limit challenges)
- Additional AI (performance impact)
- VBlank budget (already tight)

---

## Resource Constraints

### ROM Space:
- **Used**: ~4KB PRG code + 1KB CHR
- **Available**: 28KB PRG + 7KB CHR
- **Verdict**: ✅ Plenty of room

### RAM:
- **Used**: ~1.4KB / 2KB
- **Available**: ~600 bytes
- **Verdict**: ⚠️ Limited, use carefully

### VBlank Budget:
- **Used**: ~2113 / 2273 cycles (93%)
- **Available**: 160 cycles (7%)
- **Verdict**: 🔴 **CRITICAL CONSTRAINT**
- **Note**: Cannot add heavy NMI processing

---

## Next Steps

### Immediate (This Session):
1. ✅ Complete static code analysis (DONE)
2. ⏳ Wait for ROM Validator test results
3. ⏳ Fix any bugs found in testing
4. ⏳ Merge Phase 5 to main if tests pass

### Short Term (Next Session):
1. Implement Feature 6.1 (Restart) - 30 min
2. Implement Feature 6.2 (Score Display) - 2 hours
3. Test restart and score display
4. Create PR for Phase 6a

### Medium Term (This Week):
1. Implement Feature 6.3 (Level Progression) - 3 hours
2. Implement Feature 6.4 (Title Screen) - 3 hours
3. Full playtest session
4. Bug fixes and balance tweaks
5. Create PR for Phase 6b

### Target: **Complete game in ~9 hours of dev time**

---

## Success Metrics

### MVP (Phase 5) ✅
- Game is technically playable
- All core systems functional
- Audio integrated

### Complete Game (Phase 6) ⏳
- Player can play multiple sessions (restart works)
- Visible score feedback
- Progressive difficulty (levels)
- Professional presentation (title screen)

### Polished Game (Phase 7-8) 📋
- Replayable (high scores, victory)
- Visually appealing (animation, effects)
- Challenging (more AI patterns)

---

**Document Owner**: Game Designer Agent
**Status**: Planning complete, awaiting validation results
**Next Action**: Implement Phase 6 features after ROM Validator confirms Phase 5 works
