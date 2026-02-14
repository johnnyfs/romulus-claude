# Operator Testing - Bugs Found in PR #8

**Test Date:** 2024-02-14
**Tester:** Operator (Manual Testing)
**Build:** PR #8 (build/mitosis_panic.nes)
**QA Note:** These bugs were NOT caught by code review - manual emulator testing revealed them

---

## 🚨 CRITICAL QA FAILURE

**QA Methodology Error:** All previous PR approvals (#1, #2, #8) were based on **CODE REVIEW ONLY**, not actual emulator testing. This missed critical runtime bugs that only appear when ROM is executed in FCEUX.

**Lesson Learned:** Code review is insufficient for NES ROM validation. Must include actual emulator testing.

---

## Bugs Reported by Operator

### BUG-002: No Green Nutrients Visible
**Severity:** Critical
**Reporter:** Operator
**Date Found:** 2024-02-14

**Description:**
No green nutrient sprites visible on screen. Only blue player dot and red antibodies present.

**Expected:** 3 green nutrient sprites should spawn at game start and be visible
**Actual:** No nutrients rendered at all

**Impact:** Game is unplayable - cannot collect nutrients, cannot progress

---

### BUG-003: Antibodies Flickering and Not Moving
**Severity:** Critical
**Reporter:** Operator
**Date Found:** 2024-02-14

**Description:**
Red antibody sprites are flickering (sprite instability) and not moving at all. Should have 3 AI behaviors (chase, horizontal patrol, vertical patrol).

**Expected:**
- Antibodies move with AI patterns
- Chase AI pursues player
- Patrol AIs bounce at boundaries

**Actual:**
- Antibodies static (not moving)
- Sprites flickering/unstable

**Code Review Note:** AI code appeared correct in static analysis. Runtime issue suggests:
- AI update function not being called
- Rendering issue causing flicker
- Sprite OAM corruption

---

### BUG-004: Invisible Boundary Walls
**Severity:** High
**Reporter:** Operator
**Date Found:** 2024-02-14

**Description:**
Player cannot move to screen edges - invisible walls prevent movement at left, right, and top margins. Bottom has visible obstruction.

**Expected:** Player can move within defined ARENA bounds (16-240 X, 32-224 Y)
**Actual:** Movement blocked before reaching edges

**Code Review Note:** Arena clamping code (lines 294-315) appeared correct. May be clamping too aggressively or boundary constants wrong.

---

### BUG-005: Game Hangs on Collision Instead of Game Over
**Severity:** Critical
**Reporter:** Operator
**Date Found:** 2024-02-14

**Description:**
When player touches red antibody, game stops responding (hangs) instead of showing game over screen or state.

**Expected:**
- Collision triggers game over
- Game over flag set
- Game over state displays
- Can restart

**Actual:**
- Game hangs completely
- No input response
- Must close emulator

**Code Review Note:** Collision detection code (lines 727-788) appeared correct. Game over flag setting present. Runtime suggests:
- Infinite loop triggered
- Game over state not rendering
- NMI handler stuck

---

### BUG-006: No Audio (Expected)
**Severity:** N/A (Not a Bug)
**Reporter:** Operator
**Date Found:** 2024-02-14

**Description:**
No music or sound effects present.

**Expected:** PR #8 has no audio integration - Phase 5 adds audio
**Actual:** No audio

**Status:** Working as designed for PR #8. Phase 5 (feature/phase5-audio) adds audio.

---

### BUG-007: No Player Animation
**Severity:** Low
**Reporter:** Operator
**Date Found:** 2024-02-14

**Description:**
Player sprite does not animate - just solid blue dot.

**Expected:** Animation frames should cycle
**Actual:** Static sprite

**Note:** Animation frames exist in CHR ($00-$04) but not hooked up yet. Lower priority.

---

## Bug Summary

| Bug | Severity | Status | Blocks Release |
|-----|----------|--------|----------------|
| BUG-002: No nutrients | Critical | Open | ✅ YES |
| BUG-003: Static antibodies | Critical | Open | ✅ YES |
| BUG-004: Boundary walls | High | Open | ⚠️ Gameplay issue |
| BUG-005: Game hang | Critical | Open | ✅ YES |
| BUG-006: No audio | N/A | Expected | ❌ No (Phase 5) |
| BUG-007: No animation | Low | Open | ❌ No |

**BLOCKING BUGS:** 3 critical bugs prevent release
**TOTAL NEW BUGS:** 5 (excluding expected audio)

---

## Root Cause Analysis Needed

**Why did code review miss these?**

1. **Static Analysis Limitations:** Code looked correct on paper but has runtime issues
2. **No Emulator Testing:** Never ran ROM in FCEUX to validate actual behavior
3. **Assumed Code = Behavior:** Wrong assumption for NES development

**What should QA have done?**

1. ✅ Code review (WAS done)
2. ❌ Build ROM and test in FCEUX (NOT done)
3. ❌ Manual gameplay validation (NOT done)
4. ❌ Visual verification of sprites (NOT done)
5. ❌ AI behavior observation (NOT done)

---

## Next Steps

1. **Investigate each bug** with actual ROM testing
2. **Reproduce in FCEUX** with detailed steps
3. **Identify root causes** (code vs data vs integration)
4. **Update BUGS.md** with findings
5. **Test feature/phase5-audio** to see if bugs persist
6. **Update QA methodology** to require emulator testing

---

## QA Process Improvement

**New Requirement:** All future PR approvals MUST include:
1. ✅ Code review (static analysis)
2. ✅ Build ROM successfully
3. ✅ Load ROM in FCEUX
4. ✅ Manual gameplay testing (5-10 minutes minimum)
5. ✅ Visual verification of all sprites
6. ✅ Functional testing of all systems
7. ✅ Screenshots of gameplay

**No more code-review-only approvals.**

---

**QA Engineer:** Claude QA Agent
**Date:** 2024-02-14
**Status:** Investigating - operator bugs documented
**Next Action:** Test ROM in FCEUX to reproduce issues
