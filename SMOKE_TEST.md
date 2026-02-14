# MITOSIS PANIC - Smoke Test Checklist

**Purpose:** Quick validation of new builds (~3-5 minutes)
**QA Engineer:** Claude QA Agent

---

## Quick Validation Checklist

### Pre-Test Setup
- [ ] ROM file exists and is ~40KB
- [ ] ROM file has valid iNES header
- [ ] FCEUX emulator available

---

## Smoke Test Steps

### 1. ROM Boot (BOOT-001)
- [ ] Load ROM in FCEUX without errors
- [ ] No emulator error messages
- [ ] Screen initializes (not blank/corrupted)

### 2. Visual Check
- [ ] Graphics display correctly
- [ ] No sprite corruption
- [ ] Palette loads correctly
- [ ] No flickering at idle

### 3. Basic Controls (INPUT-001)
- [ ] D-pad UP works
- [ ] D-pad DOWN works
- [ ] D-pad LEFT works
- [ ] D-pad RIGHT works

### 4. Gameplay Basics (if implemented)
- [ ] Cell moves smoothly
- [ ] No crashes during movement
- [ ] Collision detection works (if nutrients present)
- [ ] Score updates (if implemented)

### 5. Audio Check (AUDIO-001)
- [ ] Audio plays without errors
- [ ] No crackling or distortion
- [ ] SFX play when triggered (if implemented)

### 6. Stability
- [ ] No crashes after 30 seconds idle
- [ ] No crashes during active gameplay
- [ ] Can exit emulator cleanly

---

## Pass/Fail Criteria

**PASS:** All critical items (1-3) work correctly
**CONDITIONAL PASS:** Basic functionality works, minor issues noted
**FAIL:** ROM doesn't boot, crashes, or has critical visual/control issues

---

## Test Log Template

```
Build: [build/mitosis_panic.nes]
Date: [YYYY-MM-DD]
Tester: QA Engineer
Result: PASS / CONDITIONAL PASS / FAIL

Notes:
-

Issues Found:
-

Next Steps:
-
```

---

## Notes

- This checklist should take 3-5 minutes maximum
- For full testing, use TEST_PLAN.md
- Document any failures in BUGS.md
- Always test after every PR merge
