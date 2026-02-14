# MITOSIS PANIC - Master Test Plan

**Version**: 1.0
**Date**: 2026-02-14
**Target Branch**: feature/phase5-audio
**ROM**: build/mitosis_panic.nes (40KB)

---

## Test Objectives

1. **Verify bug fixes** - Confirm all PR#8 bugs are resolved
2. **Validate core gameplay** - Ensure game is playable and fun
3. **Performance check** - Confirm 60 FPS with no artifacts
4. **Audio validation** - Verify music and SFX work correctly
5. **Identify remaining issues** - Document any new bugs found

---

## Test Environment

### Hardware/Emulator:
- **Primary**: FCEUX 2.6.6 (macOS)
- **Secondary**: Real NES hardware (if available)
- **Required**: Audio output enabled

### Test Scripts:
- `fceux_validate_graphics.lua` - Graphics/OAM validation
- `fceux_test_gameplay.lua` - Game state monitoring
- `test_rom_headless.lua` - Automated initial checks

### Build Commands:
```bash
git checkout feature/phase5-audio
make clean && make
fceux build/mitosis_panic.nes
```

---

## Test Suite

### TEST 1: Initial Spawn Validation ⭐ CRITICAL
**Objective**: Verify entities spawn correctly at game start

**Procedure**:
1. Build and launch ROM
2. Load `fceux_test_gameplay.lua`
3. Wait 60 frames (1 second)
4. Observe console output

**Expected Results**:
- ✅ "[INFO] Nutrients spawned correctly: 3"
- ✅ Cell count: 1 (actual: 1)
- ✅ Nutrient count: 3 (actual: 3)
- ✅ Antibody count: 2 (actual: 2)
- ✅ 3 green sprites visible on screen
- ✅ 2 red sprites visible on screen
- ✅ 1 cyan sprite visible on screen

**Pass Criteria**: All counters match, all sprites visible

**If Failed**: BUG-002 (no nutrients spawning) is NOT fixed

---

### TEST 2: Enemy Movement Validation ⭐ CRITICAL
**Objective**: Verify antibody AI is active and functional

**Procedure**:
1. Continue from TEST 1
2. Observe antibodies for 120 frames (2 seconds)
3. Check console for movement reports

**Expected Results**:
- ✅ "Antibody Movement: 2 moving, 0 static"
- ✅ Red sprites moving on screen (visible motion)
- ✅ Antibodies patrol in patterns (horizontal or vertical)
- ✅ No "[CRITICAL] BUG-003: All antibodies static!"

**Pass Criteria**: Both antibodies visibly moving with AI patterns

**If Failed**: BUG-003 (frozen enemies) is NOT fixed

---

### TEST 3: Player Movement Validation
**Objective**: Verify player control and physics

**Procedure**:
1. Press UP arrow key - hold for 1 second
2. Press DOWN arrow key - hold for 1 second
3. Press LEFT arrow key - hold for 1 second
4. Press RIGHT arrow key - hold for 1 second
5. Release all keys, observe deceleration

**Expected Results**:
- ✅ Cell moves up when UP pressed
- ✅ Cell moves down when DOWN pressed
- ✅ Cell moves left when LEFT pressed
- ✅ Cell moves right when RIGHT pressed
- ✅ Cell slows down after releasing keys (friction)
- ✅ Cell cannot move off screen edges

**Pass Criteria**: Responsive controls, smooth movement, boundary clamping

**If Failed**: Input system or boundary code has issues

---

### TEST 4: Nutrient Collection & Respawn
**Objective**: Verify collection mechanic and respawn system

**Procedure**:
1. Navigate player cell to a green nutrient
2. Observe collision
3. Monitor nutrient count
4. Wait 1 second

**Expected Results**:
- ✅ "Blip" sound plays on collision
- ✅ Nutrient disappears
- ✅ "[INFO] Nutrient collected!" in console
- ✅ nutrients_collected increments (visible in Lua output)
- ✅ New nutrient spawns elsewhere
- ✅ Nutrient count returns to 3

**Pass Criteria**: Collection works, respawn maintains count at 3

**If Failed**: Collection or spawning logic broken

---

### TEST 5: Mitosis Trigger Validation ⭐ CRITICAL
**Objective**: Verify mitosis triggers at exactly 10 nutrients (BUG-001 fix)

**Procedure**:
1. Collect 1-9 nutrients
2. Observe cell count after each collection
3. Collect 10th nutrient
4. Observe mitosis event

**Expected Results**:
- ✅ Cell count stays at 1 for nutrients 1-9
- ✅ NO "[WARNING] Nutrients collected >= 10" before 10th
- ✅ At 10th nutrient: "[INFO] Mitosis detected! Cells: 1 -> 2"
- ✅ "Sweep" sound plays
- ✅ Cell count increases to 2
- ✅ Two cyan sprites now visible
- ✅ nutrients_collected resets to 0

**Pass Criteria**: Mitosis ONLY at 10, 20, 30... nutrients

**If Failed**: BUG-001 (mitosis every nutrient) is NOT fixed

---

### TEST 6: Multi-Cell Control
**Objective**: Verify simultaneous cell control mechanic

**Procedure**:
1. After mitosis (2 cells active)
2. Press UP arrow key
3. Observe both cells

**Expected Results**:
- ✅ BOTH cells move up together
- ✅ Both cells respond to same input
- ✅ Cells maintain relative spacing
- ✅ Both cells have independent collision detection

**Pass Criteria**: All cells move in unison, per game design

**If Failed**: Entity system not applying input correctly

---

### TEST 7: Collision & Game Over ⭐ CRITICAL
**Objective**: Verify collision detection and game over state (BUG-005 fix)

**Procedure**:
1. Intentionally move player cell into a red antibody
2. Observe game state
3. Check console output

**Expected Results**:
- ✅ "Death jingle" sound plays
- ✅ "[INFO] Game over flag set! Flag=1"
- ✅ Game freezes (no more movement)
- ✅ Frame counter CONTINUES incrementing (not hung)
- ✅ Graphics still render
- ✅ No "[CRITICAL] BUG-005: Game hang"

**Pass Criteria**: Clean game over, no hang, audio plays

**If Failed**: BUG-005 (collision hang) is NOT fixed

---

### TEST 8: Audio System Validation
**Objective**: Verify all audio features work

**Procedure**:
1. Launch ROM (fresh start)
2. Listen for background music
3. Collect a nutrient (listen for SFX)
4. Trigger mitosis (listen for SFX)
5. Collide with antibody (listen for SFX)
6. Let music loop for 30 seconds

**Expected Results**:
- ✅ Background music starts immediately
- ✅ Music loops seamlessly (no gap or skip)
- ✅ "Blip" sound on nutrient collection
- ✅ "Sweep" sound on mitosis event
- ✅ "Death jingle" on game over
- ✅ No audio crackling or distortion
- ✅ SFX don't stop music

**Pass Criteria**: All audio works, no glitches

**If Failed**: Audio integration has issues

---

### TEST 9: Graphics Validation
**Objective**: Verify sprite rendering is correct

**Procedure**:
1. Launch ROM with `fceux_validate_graphics.lua`
2. Play for 60 seconds
3. Monitor console for errors

**Expected Results**:
- ✅ "Graphics validation active" message
- ✅ Active sprites count > 0
- ✅ Player sprites: 1-16 (depending on cell count)
- ✅ Nutrient sprites: 3
- ✅ Antibody sprites: 2+
- ✅ No "[ERROR] Invalid tile" messages
- ✅ No "[CRITICAL] NO SPRITES ACTIVE"
- ✅ No "[CRITICAL] CORRUPTION!"

**Pass Criteria**: No graphics errors, all sprites valid

**If Failed**: Rendering system has bugs

---

### TEST 10: Performance & Stability
**Objective**: Verify game runs at 60 FPS with no slowdown

**Procedure**:
1. Play game for 5 minutes
2. Collect 30+ nutrients (create 4+ cells)
3. Observe performance with multiple entities
4. Monitor frame counter

**Expected Results**:
- ✅ Frame counter increments smoothly (no skips)
- ✅ Sprite rendering stable (no flickering)
- ✅ Input feels responsive
- ✅ Audio stays in sync
- ✅ No visible slowdown

**Pass Criteria**: Consistent 60 FPS throughout

**If Failed**: VBlank budget overflow causing performance issues

---

## Critical Bug Checklist

Verify these specific bugs from PR#8 are fixed:

- [ ] **BUG-001**: Mitosis triggers every nutrient → Should trigger at 10, 20, 30...
- [ ] **BUG-002**: No nutrients spawning → Should see 3 green sprites
- [ ] **BUG-003**: Antibodies frozen/flickering → Should see smooth enemy movement
- [ ] **BUG-004**: Invisible boundary walls → Boundaries should feel smooth
- [ ] **BUG-005**: Game hangs on collision → Game over should be clean, no freeze
- [ ] **BUG-007**: No player animation → EXPECTED (not implemented, not a bug)

---

## Known Limitations (Not Bugs)

These are expected for Phase 5 MVP:

- ✅ No animation (static sprites)
- ✅ No score display on screen (counter works internally)
- ✅ No restart after game over (must close ROM)
- ✅ No level progression (difficulty doesn't increase)
- ✅ No title screen
- ✅ No high score save

---

## Regression Testing

If bugs are found and fixed, retest ALL previous tests to ensure no regressions.

---

## Performance Profiling

### VBlank Budget Analysis
If performance issues occur:

1. Use FCEUX debugger to measure NMI cycles
2. Profile FamiToneUpdate execution time
3. Check if exceeding 2273 cycle VBlank budget
4. Implement split-frame audio if needed

### Expected Cycle Usage:
```
OAM DMA:         ~513 cycles
FamiToneUpdate: ~1000 cycles
Game logic:      ~600 cycles
Total:          ~2113 cycles (93% of budget)
```

---

## Test Results Template

```
Test ID: [TEST #]
Tester: [Name]
Date: [YYYY-MM-DD]
ROM: build/mitosis_panic.nes
Branch: feature/phase5-audio
Commit: [hash]

Result: PASS / FAIL / BLOCKED

Observations:
- [What happened]
- [Console output]
- [Screenshots if applicable]

Bugs Found:
- BUG-XXX: [Description]
  Steps: [Reproduction steps]
  Frame: [Frame number when occurred]
  Priority: CRITICAL / HIGH / MEDIUM / LOW
```

---

## Success Criteria

**Phase 5 MVP is READY when**:
- ✅ All 10 tests PASS
- ✅ All critical bugs (BUG-001 through BUG-005) confirmed FIXED
- ✅ Performance stable (60 FPS)
- ✅ Audio fully functional
- ✅ No new critical bugs found

**Current Status**: ⏳ AWAITING RUNTIME VALIDATION

---

**Document Owner**: Game Designer Agent
**Validation Assignments**:
- Static Code Analysis: ✅ COMPLETE (Game Designer)
- Runtime Testing: ⏳ IN PROGRESS (ROM Validator)
- Performance Profiling: ⏳ PENDING
