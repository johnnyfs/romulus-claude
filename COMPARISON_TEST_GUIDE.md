# MITOSIS PANIC - Side-by-Side Comparison Testing Guide

**Purpose:** Test BOTH branches with identical checklist to determine which bugs exist where
**Time Required:** ~15 minutes per branch (30 minutes total)
**Why:** Empirical data tells us if bugs are game logic issues vs performance issues

---

## 🎯 Testing Goal

**Answer these questions:**
1. Do PR #8 bugs still exist in feature/phase5-audio?
2. Are there NEW bugs in feature/phase5-audio (audio-related)?
3. Which bugs are fixed and which remain?

**Method:** Test identical checklist on both branches, compare results

---

## 🔄 Quick Setup (Both Branches)

### Test PR #8 First
```bash
cd romulus-claude
git checkout pr-8
make clean && make
fceux build/mitosis_panic.nes
```

### Then Test feature/phase5-audio
```bash
git checkout feature/phase5-audio
make clean && make
fceux build/mitosis_panic.nes
```

**Important:** Load validation scripts for both tests (same 3 Lua scripts)

---

## ✅ Comparison Checklist

**Instructions:** Fill out BOTH columns, then compare

| Test | PR #8 Result | feature/phase5-audio Result |
|------|--------------|------------------------------|
| **1. Nutrients Spawn** | | |
| 3 green sprites visible? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| HUD shows "Nutrients=3"? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Console: No [CRITICAL] about nutrients? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **2. Enemies Move** | | |
| 2 red sprites visible? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Enemies actively moving (not frozen)? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Console: "X moving, 0 static" (X > 0)? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **3. Collision Works** | | |
| Touch red enemy → Game over? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| HUD shows "Game Over=1"? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| FCEUX still responsive (not hung)? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **4. Sprites Stable** | | |
| No flickering? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| All sprites visible throughout? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Console: No sprite errors? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **5. Input Responsive** | | |
| Arrow keys respond immediately? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| No lag/delay? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Movement feels smooth? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **6. Audio Works** | | |
| Music plays immediately? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Sound effects trigger? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| No crackling/distortion? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **7. Mitosis Triggers** | | |
| Cell divides at 10 nutrients? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| HUD shows "Cells=2"? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Counter resets to 0? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| | | |
| **8. Performance** | | |
| Smooth 60 FPS? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| No slowdown with many entities? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| Consistent frame timing? | ☐ YES ☐ NO | ☐ YES ☐ NO |
| **Verdict** | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |

---

## 📊 Results Analysis

### Step 1: Count Failures

**PR #8 Failures:**
(Count FAIL verdicts) = ___ / 8 tests

**feature/phase5-audio Failures:**
(Count FAIL verdicts) = ___ / 8 tests

---

### Step 2: Categorize Bugs

Fill this table based on your results:

| Bug Type | PR #8 | feature/phase5-audio | Interpretation |
|----------|-------|----------------------|----------------|
| No nutrients spawn | ☐ YES ☐ NO | ☐ YES ☐ NO | Same bug = game logic issue |
| Enemies frozen | ☐ YES ☐ NO | ☐ YES ☐ NO | Same bug = game logic issue |
| Collision hang | ☐ YES ☐ NO | ☐ YES ☐ NO | Same bug = game logic issue |
| Sprite flickering | ☐ YES ☐ NO | ☐ YES ☐ NO | Only in phase5 = VBlank issue |
| Input lag | ☐ YES ☐ NO | ☐ YES ☐ NO | Only in phase5 = VBlank issue |
| Audio issues | ☐ YES ☐ NO | ☐ YES ☐ NO | Expected (no audio in PR #8) |

---

### Step 3: Draw Conclusions

**If bugs appear in BOTH branches:**
→ Game logic bugs, not performance-related
→ Chief Engineer needs to fix game code

**If bugs only in PR #8:**
→ Fixed by code changes in feature/phase5-audio
→ Good news! Fixes worked

**If bugs only in feature/phase5-audio:**
→ Audio-related performance issues (VBlank overflow)
→ Split-frame audio architecture needed

**If DIFFERENT bugs in each:**
→ Multiple separate issues
→ Need targeted fixes for each

---

## 📝 Quick Results Template

**Copy and fill this out:**

```
=== PR #8 RESULTS ===
Nutrients spawn: YES / NO
Enemies move: YES / NO
Collision works: YES / NO
Sprites stable: YES / NO
Input responsive: YES / NO
Audio works: YES / NO
Mitosis works: YES / NO
Performance good: YES / NO

Total: X / 8 tests passed

=== feature/phase5-audio RESULTS ===
Nutrients spawn: YES / NO
Enemies move: YES / NO
Collision works: YES / NO
Sprites stable: YES / NO
Input responsive: YES / NO
Audio works: YES / NO
Mitosis works: YES / NO
Performance good: YES / NO

Total: X / 8 tests passed

=== COMPARISON ===
Bugs in both: [List bugs present in both]
Bugs only in PR #8: [List bugs only in PR #8]
Bugs only in phase5-audio: [List bugs only in phase5-audio]

CONCLUSION: [Your assessment]
```

---

## 🎯 What We Already Know

### PR #8 (Operator Tested)
- ❌ No nutrients spawning
- ❌ Enemies frozen/flickering
- ❌ Collision causes hang
- ❌ Invisible boundary walls
- ❌ No animation (expected)
- ❌ No audio (expected)

### feature/phase5-audio (Partially Tested)
- ✅ Audio works (confirmed!)
- ❓ Nutrients? (not yet tested)
- ❓ Enemies? (not yet tested)
- ❓ Collision? (not yet tested)
- ❓ Sprites? (not yet tested)
- ❓ Performance? (not yet tested)

**THIS TEST FILLS IN THE QUESTION MARKS!**

---

## 🔬 Scientific Method

**Hypothesis A (Audio Engineer):**
VBlank overflow from audio causes ALL bugs (flickering, frozen AI, collision hang)

**Hypothesis B (Game Designer):**
PR #8 has game logic bugs separate from audio performance

**How to Test:**
1. If feature/phase5-audio has SAME bugs as PR #8 → Hypothesis B correct (logic bugs)
2. If feature/phase5-audio has DIFFERENT bugs → Hypothesis A correct (performance bugs)
3. If feature/phase5-audio has NO bugs → Code fixes + audio worked perfectly!

**This test provides the empirical data to prove which hypothesis is correct.**

---

## ⏱️ Time Breakdown

**Per Branch:**
- Build ROM: 1 min
- Load + scripts: 1 min
- Test nutrients: 2 min
- Test enemies: 2 min
- Test collision: 1 min
- Test sprites: 2 min
- Test input: 1 min
- Test audio: 2 min
- Test mitosis: 3 min
- **Subtotal: ~15 min**

**Total for both branches: ~30 minutes**

---

## 💡 Testing Tips

### For Accurate Comparison

1. **Use same FCEUX version for both**
2. **Load same 3 Lua scripts for both**
3. **Test in same order (follow checklist)**
4. **Play for same duration (3-5 minutes each)**
5. **Take notes as you go**
6. **Copy console log for both**

### If Results Are Unclear

- Take screenshots of HUD for both branches
- Record video if possible
- Copy FULL console logs
- Test multiple times if inconsistent
- Ask specific questions about what you see

---

## 📞 Reporting Results

After testing both branches, provide:

1. **Completed comparison checklist** (table above)
2. **Console logs** (both branches)
3. **Your conclusion** (which hypothesis matches data?)
4. **Any surprises** (unexpected results?)

**Use VALIDATION_REPORT_TEMPLATE.md for detailed documentation**

---

## 🎯 Success Criteria

**Testing is successful when:**
- ✅ Both branches tested with identical procedure
- ✅ All 8 tests completed for each branch
- ✅ Console logs captured for both
- ✅ Clear comparison of results documented
- ✅ Conclusion drawn about bug categories

**Then the team can:**
- Fix confirmed game logic bugs
- Implement performance optimizations
- Merge working code to main
- Release MVP!

---

**Status:** Ready for operator testing
**Purpose:** Replace speculation with empirical data
**Expected Duration:** 30 minutes
**Value:** Guides all remaining bug fixes with scientific clarity

---

**Document Version:** 1.0
**Created:** 2024-02-14
**Team:** QA Engineer + Audio Engineer + Graphics Engineer + Game Designer
**Goal:** Systematic comparison to identify root causes
