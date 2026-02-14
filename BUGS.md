# MITOSIS PANIC - Bug Tracker

**QA Engineer:** Claude QA Agent
**Last Updated:** 2024-02-14

---

## Open Bugs

### BUG-001: Mitosis Triggers on Every Nutrient Collection (Not Every 10)

**Severity:** Critical
**Test ID:** MITOSIS-001
**Build:** PR #5
**Reporter:** QA Engineer
**Date Found:** 2024-02-14

**Steps to Reproduce:**
1. Start game (1 cell)
2. Collect first nutrient
3. Observe: cell immediately divides into 2 cells
4. Collect second nutrient
5. Observe: 2 cells become 4 cells
6. Expected: Should take 10 nutrients per mitosis

**Expected Behavior:**
Mitosis should occur every 10 nutrients collected, as specified in DESIGN.md:
- 10 nutrients → 1 cell becomes 2 cells
- 20 nutrients → 2 cells become 4 cells
- 40 nutrients → 4 cells become 8 cells
- 80 nutrients → 8 cells become 16 cells (max)

**Actual Behavior:**
Mitosis triggers on EVERY nutrient collection:
- 1 nutrient → 2 cells
- 2 nutrients → 4 cells
- 4 nutrients → 8 cells
- 8 nutrients → 16 cells (max reached)

**Frequency:** Always

**Additional Notes:**
- No nutrient counter implemented in cell entity structure
- `collect_nutrient()` calls `trigger_mitosis()` directly (lines 604-608 in src/main.asm)
- Game progression completely broken
- Player hits MAX_CELLS (16) after only 8 nutrients instead of 80
- Violates core game design specification
- Game balance destroyed

**Code Location:**
- File: `src/main.asm`
- Lines: 593-614 (collect_nutrient function)
- Lines: 604-608 (incorrect mitosis trigger)

**Root Cause:**
Missing nutrient counter tracking. The code checks MAX_CELLS limit but not the "10 nutrients" requirement.

**Recommended Fix:**
Add nutrient counter field to cell entity structure:
1. Modify cell entity at offset +$08: `nutrients_collected_since_mitosis` (1 byte)
2. In `collect_nutrient`: Increment this counter for the collecting cell
3. Check if counter >= 10 before calling `trigger_mitosis`
4. In `trigger_mitosis`: Reset parent cell's counter to 0 after successful division
5. Initialize counter to 0 in `init_game_state`

**Example Fix:**
```asm
collect_nutrient:
    ; Deactivate nutrient
    lda #0
    sta $0480,y

    ; Increment cell's nutrient counter (offset +8)
    inc cell_data+8,x

    ; Check if >= 10 nutrients
    lda cell_data+8,x
    cmp #10
    bcc skip_mitosis

    ; Reset counter and trigger mitosis
    lda #0
    sta cell_data+8,x
    jsr trigger_mitosis

skip_mitosis:
    ; Rest of function...
```

**Impact:** BLOCKING - Game is unplayable in current state

**Screenshots/Logs:**
N/A (code review identified bug)

---

## Closed Bugs

_No bugs closed yet._

---

## Bug Statistics

**Total Bugs Filed:** 1
**Critical:** 1 (BUG-001)
**High:** 0
**Medium:** 0
**Low:** 0
**Closed:** 0

**Critical Bugs BLOCKING Release:** 1

---

## Notes

- PR #5 blocked until BUG-001 is fixed
- All other Phase 3 systems (collision detection, nutrient spawning, RNG) passed code review
- Cell duplication mechanics work correctly when triggered
- Issue is purely in the trigger condition logic

---

**Next Update:** After BUG-001 fix is committed
