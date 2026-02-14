# MITOSIS PANIC - Operator Validation Guide
## Step-by-Step Testing Instructions

**Purpose:** Validate feature/phase5-audio branch is ready for release
**Time Required:** 10-15 minutes
**Difficulty:** Easy - just follow the steps!

---

## 🎯 Quick Start (3 Steps)

### Step 1: Build ROM
```bash
cd romulus-claude
git checkout feature/phase5-audio
make clean && make
```

**Expected:** ROM built successfully at `build/mitosis_panic.nes` (40KB)

---

### Step 2: Load ROM in FCEUX
```bash
fceux build/mitosis_panic.nes
```

**Expected:** FCEUX opens with game running

---

### Step 3: Load Test Scripts

**Open 3 Lua Script Windows:**

1. **Window 1 - Gameplay Validator:**
   - In FCEUX: `Tools > Lua > New Lua Script Window`
   - Click "Browse"
   - Select: `fceux_test_gameplay.lua`
   - Click "Run"

2. **Window 2 - Audio Validator:**
   - In FCEUX: `Tools > Lua > New Lua Script Window`
   - Click "Browse"
   - Select: `audio/testing/fceux_audio_validation.lua`
   - Click "Run"

3. **Window 3 - Graphics Validator:**
   - In FCEUX: `Tools > Lua > New Lua Script Window`
   - Click "Browse"
   - Select: `fceux_validate_graphics.lua`
   - Click "Run"

**Expected:** All 3 windows show "Running" status

---

## ✅ What You Should See (Passing Tests)

### On Screen (HUD Display)

**Left Side (Gameplay State):**
```
Frame: 180
Game Over: 0
Cells: 1 (actual: 1)
Antibodies: 2 (actual: 2)
Nutrients: 3 (actual: 3)
Collected: 5
Mitosis Events: 0
Antibody Movement: 2 moving, 0 static
```

**Right Side (Graphics State):**
```
=== GRAPHICS STATE ===
Active Sprites: 6/64
  Players: 1
  Antibodies: 2
  Nutrients: 3
  Unknown: 0
```

**Center (Audio State - from audio script):**
```
APU Activity: [====] Pulse1
              [====] Pulse2
              [===]  Triangle
              [==]   Noise

FamiTone2: ACTIVE
Music: PLAYING
```

---

### In Console (FCEUX Message Log)

**To see console:** `Help > Message Log`

**Good Output (Passing):**
```
=== MITOSIS PANIC - Gameplay State Validator ===
Monitoring game state...

[INFO] Nutrients spawned correctly: 3
[INFO] Antibody Movement: 2 moving, 0 static

=== MITOSIS PANIC - Audio Validation ===
[INFO] FamiTone2 initialized
[INFO] Music started: MUSIC_MAIN_THEME
[INFO] APU active on 4 channels

=== MITOSIS PANIC - Graphics Validation ===
[INFO] Active Sprites: 6 (3 nutrients + 2 antibodies + 1 player)
```

**Key Phrases to Look For:**
- ✅ "Nutrients spawned correctly"
- ✅ "X moving, 0 static" (X > 0)
- ✅ "Music started"
- ✅ "APU active"
- ✅ No [ERROR] or [CRITICAL] messages

---

### What You Should Hear

- ✅ Background music playing immediately
- ✅ Beep sound when collecting green nutrients
- ✅ Jingle when cell divides (after 10 nutrients)
- ✅ Sound when touching red enemy

---

### What You Should See Visually

- ✅ **Player:** Blue/cyan circle that moves with arrow keys
- ✅ **Nutrients:** 3 green particles on screen
- ✅ **Enemies:** 2 red Y-shaped sprites moving around
- ✅ **Movement:** Enemies actively moving (not frozen)
- ✅ **No flickering:** Sprites stable and visible

---

## ❌ What Bad Output Looks Like (Bugs Present)

### Console Errors (Bad)

```
[CRITICAL] BUG-002: No nutrients spawned! Expected 3, found 0
[CRITICAL] BUG-003: All antibodies static! Moving=0, Static=2
[ERROR] Nutrient count mismatch! Counter=3, Actual=0
[WARNING] Cell out of bounds! X=250, Y=100
```

**If you see [CRITICAL] or [ERROR]:** Copy the entire console log to validation report

---

### HUD Problems (Bad)

```
Nutrients: 0 (actual: 0)  ← Should be 3!
Antibody Movement: 0 moving, 2 static  ← Should be moving!
Unknown: 2  ← Should be 0!
```

**If counters are wrong:** Screenshot the HUD and report

---

### Visual Problems (Bad)

- ❌ No green nutrients visible (screen is empty)
- ❌ Red enemies frozen in place (not moving)
- ❌ Sprites flickering rapidly
- ❌ Game hangs when touching enemy (can't restart)

**If you see visual bugs:** Describe what you see

---

### Audio Problems (Bad)

- ❌ No music playing (silent)
- ❌ Music has gaps or clicks
- ❌ Sound effects don't trigger
- ❌ Crackling/distortion

**If audio has issues:** Describe what you hear (or don't hear)

---

## 📝 Testing Checklist (Do These Things)

### Test 1: Initial Spawn (30 seconds)
1. ✅ Load ROM + scripts
2. ✅ Wait 5 seconds
3. ✅ Check HUD shows: Nutrients=3, Antibodies=2
4. ✅ Check console has no [CRITICAL] messages
5. ✅ Verify you see 3 green sprites on screen
6. ✅ Verify 2 red sprites are moving

**Pass Criteria:** All 6 checks pass

---

### Test 2: Movement (1 minute)
1. ✅ Press arrow keys (UP, DOWN, LEFT, RIGHT)
2. ✅ Verify player moves in all 4 directions
3. ✅ Move to all 4 screen edges
4. ✅ Verify no invisible walls blocking movement
5. ✅ Verify player stops smoothly (friction)
6. ✅ Check console for boundary warnings

**Pass Criteria:** Movement feels good, no console errors

---

### Test 3: Nutrient Collection (2 minutes)
1. ✅ Move player into green nutrient
2. ✅ Verify nutrient disappears
3. ✅ Verify beep sound plays
4. ✅ Check HUD: "Collected" counter increments
5. ✅ Verify new nutrient spawns (keeps 3 on screen)
6. ✅ Collect 10 nutrients total

**Pass Criteria:** Collection works, counter increments

---

### Test 4: Mitosis (3 minutes)
1. ✅ Continue from Test 3 (10 nutrients collected)
2. ✅ Verify HUD shows: Cells=2 (was 1)
3. ✅ Verify jingle sound plays
4. ✅ Verify "Collected" counter resets to 0
5. ✅ Verify 2 blue sprites now visible
6. ✅ Verify both sprites move together with arrows

**Pass Criteria:** Cell divides at 10 nutrients, counter resets

---

### Test 5: Enemy Collision (1 minute)
1. ✅ Move player into red enemy sprite
2. ✅ Verify sound plays on contact
3. ✅ Verify HUD shows: Game Over=1
4. ✅ Verify game stops accepting input
5. ✅ Verify console shows: "Game over flag set"
6. ✅ Verify FCEUX still responsive (not hung)

**Pass Criteria:** Game over triggers cleanly, no hang

---

### Test 6: Audio Quality (3 minutes)
1. ✅ Listen to background music for 30 seconds
2. ✅ Verify music loops seamlessly (no gaps)
3. ✅ Verify no crackling or distortion
4. ✅ Collect several nutrients (hear SFX)
5. ✅ Verify SFX and music don't interfere
6. ✅ Trigger mitosis (hear jingle)

**Pass Criteria:** All audio clean and functional

---

## 📊 Quick Results Summary

After running all 6 tests, fill out:

```
Test 1 (Initial Spawn):     PASS / FAIL
Test 2 (Movement):           PASS / FAIL
Test 3 (Nutrient Collection): PASS / FAIL
Test 4 (Mitosis):            PASS / FAIL
Test 5 (Enemy Collision):    PASS / FAIL
Test 6 (Audio Quality):      PASS / FAIL

Overall:  ALL PASS  /  SOME FAIL  /  MAJOR ISSUES
```

**If ALL PASS:** MVP is ready! 🎉

**If SOME FAIL:** Document which tests failed and what you saw

**If MAJOR ISSUES:** Copy console log and describe problems

---

## 🐛 Reporting Issues

### If You Find Bugs

1. **Note the test that failed** (Test 1-6)
2. **Copy console output** (Help > Message Log > Select All > Copy)
3. **Describe what you saw** (visually)
4. **Describe what you heard** (audio)
5. **Take screenshot if possible**

### Example Bug Report

```
Test Failed: Test 3 (Nutrient Collection)

Console Output:
[CRITICAL] BUG-002: No nutrients spawned! Expected 3, found 0
[ERROR] Nutrient count mismatch! Counter=3, Actual=0

Visual Description:
No green sprites visible on screen. Only see player (blue)
and 2 red enemies. Screen looks empty.

Audio:
Music playing fine, but no beep sound when moving around
(nothing to collect).

Screenshot: [attach if available]
```

---

## 🎮 Controls Reference

| Button | Action |
|--------|--------|
| ↑ | Move all cells up |
| ↓ | Move all cells down |
| ← | Move all cells left |
| → | Move all cells right |

**Note:** All cells move together (unique mechanic)

---

## 💡 Tips

### If Scripts Don't Load
- Make sure you're in the `romulus-claude` directory
- Check file paths are correct
- Restart FCEUX if needed

### If Console is Empty
- Check: `Help > Message Log`
- Scripts might be loaded but quiet
- Play the game - scripts log events during gameplay

### If Game Looks Wrong
- Verify you built `feature/phase5-audio` branch (not PR #8)
- Try: `make clean && make` again
- Check ROM size is 40KB

### If Audio Doesn't Play
- Check FCEUX audio settings
- Verify computer volume is up
- This would be a critical bug - report it!

---

## ⏱️ Time Estimate

- Setup (build + load): 2 minutes
- Test 1: 30 seconds
- Test 2: 1 minute
- Test 3: 2 minutes
- Test 4: 3 minutes
- Test 5: 1 minute
- Test 6: 3 minutes
- **Total: ~13 minutes**

---

## ✅ Success Criteria

**MVP Ready When:**

1. ✅ All 6 tests PASS
2. ✅ Console shows only [INFO] messages (no errors)
3. ✅ HUD counters match actual entities
4. ✅ Visual: Player, enemies, nutrients all visible
5. ✅ Audio: Music + 4 SFX all working
6. ✅ Gameplay feels responsive and fun

**If any criteria fails:** Document and report

---

## 📄 Next Step

After testing, fill out: **VALIDATION_REPORT_TEMPLATE.md**

Copy the template, answer all questions, attach console log.

---

## 🆘 Need Help?

### Common Issues

**"ROM won't build"**
- Solution: `git status` to check branch
- Solution: `git checkout feature/phase5-audio`
- Solution: `make clean && make`

**"Scripts won't run"**
- Solution: Close and restart FCEUX
- Solution: Load scripts one at a time
- Solution: Check file paths

**"Console is empty"**
- Solution: `Help > Message Log`
- Solution: Scripts need gameplay to generate output
- Solution: Play for 30 seconds

**"Not sure if it passed"**
- Solution: Look for [CRITICAL] or [ERROR] in console
- Solution: If HUD shows "0 moving" enemies = FAIL
- Solution: If you see green nutrients on screen = likely PASS

---

## 📞 Who to Report To

**All Results:** Game Designer + QA Engineer (Claude)

**For Bugs:** Include console log + description

**For Questions:** Ask before testing if unclear

---

**Document Version:** 1.0
**Created:** 2024-02-14
**Status:** Ready for Use
**Difficulty:** ⭐ Easy - Just Follow Steps!

**Good luck testing! You've got this! 🎮**
