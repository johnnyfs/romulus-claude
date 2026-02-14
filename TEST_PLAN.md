# MITOSIS PANIC - QA Test Plan

**Version:** 1.0
**Created:** 2024-02-14
**QA Engineer:** Claude QA Agent
**Target Platform:** Nintendo Entertainment System (NES)

---

## 1. Test Environment Setup

### 1.1 Required Tools
- **FCEUX Emulator** (primary testing platform)
- **Mesen** (secondary emulator for cross-validation)
- **NES Hardware** + Flashcart (for hardware validation when available)
- **Hex Editor** (for ROM inspection)
- **Audio Analysis Tools** (Audacity or similar)

### 1.2 Test ROMs
- Development builds from Chief Engineer
- Release candidate builds
- Final production ROMs

---

## 2. Core Functionality Tests

### 2.1 ROM Boot & Initialization
**Priority:** CRITICAL
**Test ID:** BOOT-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Load ROM in FCEUX | ROM loads without errors | ⬜ |
| 2 | Check FCEUX console | No error messages displayed | ⬜ |
| 3 | Observe initial screen | Game displays title/start screen | ⬜ |
| 4 | Check PPU initialization | Graphics render correctly | ⬜ |
| 5 | Wait 30 seconds idle | No crashes or freezes | ⬜ |

**Pass Criteria:** ROM boots cleanly with no emulator errors

---

### 2.2 Input Response - D-Pad Control
**Priority:** CRITICAL
**Test ID:** INPUT-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Press UP on D-pad | All cells move UP simultaneously | ⬜ |
| 2 | Press DOWN on D-pad | All cells move DOWN simultaneously | ⬜ |
| 3 | Press LEFT on D-pad | All cells move LEFT simultaneously | ⬜ |
| 4 | Press RIGHT on D-pad | All cells move RIGHT simultaneously | ⬜ |
| 5 | Hold diagonal (UP+RIGHT) | All cells move diagonally | ⬜ |
| 6 | Rapid direction changes | Cells respond without lag | ⬜ |
| 7 | Multiple cells (2-4) | All cells move in sync | ⬜ |
| 8 | Many cells (8+) | All cells still move together | ⬜ |

**Pass Criteria:** All player cells respond simultaneously to D-pad input with no lag or desync

---

### 2.3 Collision Detection - Cell vs Nutrient
**Priority:** CRITICAL
**Test ID:** COLLISION-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Move cell into nutrient | Nutrient disappears | ⬜ |
| 2 | Check nutrient counter | Counter increments by 1 | ⬜ |
| 3 | Check score | Score increases | ⬜ |
| 4 | Verify visual feedback | Pickup animation/sound plays | ⬜ |
| 5 | Test edge collision | Collision at sprite edges works | ⬜ |
| 6 | Test corner collision | Collision at corners works | ⬜ |
| 7 | Multiple cells, one nutrient | Only one cell gets credit | ⬜ |
| 8 | Rapid sequential pickups | All nutrients register correctly | ⬜ |

**Pass Criteria:** Nutrient collision detection works consistently with proper feedback

---

### 2.4 Collision Detection - Cell vs Antibody
**Priority:** CRITICAL
**Test ID:** COLLISION-002

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Move cell into antibody | Cell is destroyed | ⬜ |
| 2 | Check cell count | Cell count decrements | ⬜ |
| 3 | Verify death animation | Death effect plays | ⬜ |
| 4 | Check other cells | Other cells continue functioning | ⬜ |
| 5 | Test edge collision | Collision at edges works | ⬜ |
| 6 | Multiple simultaneous hits | All collisions register | ⬜ |
| 7 | Last cell destroyed | Game over triggers correctly | ⬜ |
| 8 | Antibody movement | Antibodies move/seek properly | ⬜ |

**Pass Criteria:** Antibody collision detection is accurate and triggers appropriate game state changes

---

### 2.5 Mitosis Mechanic
**Priority:** CRITICAL
**Test ID:** MITOSIS-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Collect 10 nutrients with 1 cell | Mitosis triggers | ⬜ |
| 2 | Verify nutrient counter reset | Counter resets to 0 | ⬜ |
| 3 | Check cell count | Cell count increases by 1 | ⬜ |
| 4 | Verify new cell position | New cell spawns near parent | ⬜ |
| 5 | Test new cell control | New cell responds to input | ⬜ |
| 6 | Verify visual effect | Mitosis animation plays | ⬜ |
| 7 | Check audio feedback | Mitosis sound plays | ⬜ |
| 8 | Test at 9 nutrients | Mitosis does NOT trigger | ⬜ |
| 9 | Test at 11 nutrients | Mitosis triggers at exactly 10 | ⬜ |
| 10 | Multiple cells at threshold | Each triggers mitosis independently | ⬜ |

**Pass Criteria:** Mitosis triggers precisely at 10 nutrients with correct visual/audio feedback

---

### 2.6 Sprite Limits
**Priority:** HIGH
**Test ID:** SPRITE-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Count total sprites on screen | Never exceeds 64 total sprites | ⬜ |
| 2 | Check horizontal alignment | Max 8 sprites per scanline | ⬜ |
| 3 | Spawn max cells (via mitosis) | Sprites don't flicker excessively | ⬜ |
| 4 | Add max nutrients | Total sprite count stays ≤64 | ⬜ |
| 5 | Add max antibodies | Total sprite count stays ≤64 | ⬜ |
| 6 | All entities on one scanline | Graceful degradation (cycling/priority) | ⬜ |
| 7 | Check sprite 0 hit | Background collision works if used | ⬜ |
| 8 | Rapid spawn/despawn | No sprite corruption | ⬜ |

**Pass Criteria:** Game respects NES hardware sprite limits without crashes or major visual corruption

---

## 3. Audio Tests

### 3.1 Audio Playback
**Priority:** HIGH
**Test ID:** AUDIO-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Start game | Background music plays | ⬜ |
| 2 | Listen for 60 seconds | No crackling or distortion | ⬜ |
| 3 | Collect nutrient | Pickup sound plays | ⬜ |
| 4 | Trigger mitosis | Mitosis sound plays | ⬜ |
| 5 | Cell hit by antibody | Death sound plays | ⬜ |
| 6 | Multiple simultaneous sounds | No audio cutting out | ⬜ |
| 7 | Music + SFX overlap | Both play without interference | ⬜ |
| 8 | Mute/unmute cycles | Audio resumes correctly | ⬜ |
| 9 | Long play session (10 min) | Music loops correctly | ⬜ |
| 10 | Check all APU channels | Square, triangle, noise used properly | ⬜ |

**Pass Criteria:** All audio plays cleanly without crackling, cutting, or distortion

---

## 4. Game State Tests

### 4.1 Game Over Condition
**Priority:** HIGH
**Test ID:** GAMESTATE-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Lose all cells | Game over screen displays | ⬜ |
| 2 | Check for freeze | Game doesn't hang | ⬜ |
| 3 | Verify final score display | Score shown correctly | ⬜ |
| 4 | Test restart option | Can restart/return to title | ⬜ |
| 5 | Verify state reset | New game starts fresh | ⬜ |
| 6 | Check high score save | High score persists (if implemented) | ⬜ |

**Pass Criteria:** Game over triggers correctly with proper UI and restart functionality

---

### 4.2 Score Display & Increment
**Priority:** MEDIUM
**Test ID:** SCORE-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Start new game | Score displays as 0 | ⬜ |
| 2 | Collect nutrient | Score increments | ⬜ |
| 3 | Verify increment amount | Correct points awarded | ⬜ |
| 4 | Check display format | Numbers render correctly | ⬜ |
| 5 | Test score overflow | Handles max score gracefully | ⬜ |
| 6 | Rapid score increase | Display updates smoothly | ⬜ |
| 7 | Check digit alignment | No visual glitches | ⬜ |

**Pass Criteria:** Score displays correctly and updates accurately with all game actions

---

## 5. Performance & Stability Tests

### 5.1 Long Play Session
**Priority:** MEDIUM
**Test ID:** PERF-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Play for 30 minutes | No crashes | ⬜ |
| 2 | Monitor frame rate | Consistent 60 FPS | ⬜ |
| 3 | Check for slowdown | No noticeable lag | ⬜ |
| 4 | Verify memory stability | No memory leaks (emulator check) | ⬜ |

**Pass Criteria:** Game runs stably for extended periods

---

### 5.2 Edge Cases
**Priority:** MEDIUM
**Test ID:** EDGE-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Cell at screen boundary | Movement clamped properly | ⬜ |
| 2 | Nutrient at boundary | Collision still works | ⬜ |
| 3 | Spawn at boundary | Entities spawn correctly | ⬜ |
| 4 | Maximum cell count | Game handles gracefully | ⬜ |
| 5 | Zero cells remaining | Game over triggers | ⬜ |
| 6 | Pause during critical events | State preserved correctly | ⬜ |

**Pass Criteria:** Edge cases handled without crashes or undefined behavior

---

## 6. Cross-Platform Validation

### 6.1 Emulator Testing
**Priority:** MEDIUM
**Test ID:** COMPAT-001

| Emulator | Boot | Gameplay | Audio | Notes |
|----------|------|----------|-------|-------|
| FCEUX | ⬜ | ⬜ | ⬜ | Primary test platform |
| Mesen | ⬜ | ⬜ | ⬜ | Accuracy validation |
| Nestopia | ⬜ | ⬜ | ⬜ | Additional check |

---

### 6.2 Hardware Testing (When Available)
**Priority:** HIGH
**Test ID:** HARDWARE-001

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Flash ROM to cartridge | ROM flashes successfully | ⬜ |
| 2 | Insert into NES | Cartridge recognized | ⬜ |
| 3 | Power on | Game boots on real hardware | ⬜ |
| 4 | Full gameplay test | All features work on hardware | ⬜ |
| 5 | Audio on TV/monitor | Audio sounds correct | ⬜ |
| 6 | Controller response | Input lag acceptable | ⬜ |
| 7 | Extended play | No hardware crashes | ⬜ |

**Pass Criteria:** Game runs correctly on actual NES hardware

---

## 7. Smoke Test Checklist

**Quick validation checklist for rapid testing of new builds:**

- [ ] ROM boots in FCEUX without errors
- [ ] Title screen displays
- [ ] Game starts from title
- [ ] Cell moves with D-pad (all 4 directions)
- [ ] Nutrient collection works
- [ ] Score increments
- [ ] Mitosis triggers (collect 10 nutrients)
- [ ] Antibody collision kills cell
- [ ] Game over triggers (lose all cells)
- [ ] Audio plays without crackling
- [ ] No visual corruption
- [ ] Can restart after game over

**Time to complete:** ~3-5 minutes per build

---

## 8. Bug Reporting Format

When bugs are found, document in `BUGS.md` using this format:

```markdown
### BUG-XXX: [Short Description]

**Severity:** Critical / High / Medium / Low
**Test ID:** [Associated test case]
**Build:** [ROM version/date]
**Reporter:** QA Engineer
**Date Found:** YYYY-MM-DD

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Frequency:**
Always / Sometimes / Rare

**Additional Notes:**
Any other relevant information

**Screenshots/Logs:**
[Attach if available]
```

---

## 9. Test Execution Schedule

1. **Initial ROM delivery:** Run smoke test + CRITICAL tests
2. **Feature complete build:** Full test plan execution
3. **Release candidate:** Complete regression + hardware testing
4. **Each PR:** Relevant test cases + smoke test

---

## 10. Sign-off Criteria

**For Release Approval:**
- ✅ All CRITICAL priority tests pass
- ✅ All HIGH priority tests pass
- ✅ No known critical or high severity bugs
- ✅ Smoke test passes 10 consecutive times
- ✅ Hardware validation passes (if hardware available)
- ✅ Audio quality verified
- ✅ No crashes in 1-hour stress test

---

## Test Results Log

### Build: [Pending First ROM]
**Test Date:** TBD
**Tester:** QA Engineer
**Status:** Awaiting first ROM from Chief Engineer

---

**Document Status:** READY FOR USE
**Next Update:** After first ROM testing
