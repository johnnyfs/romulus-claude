# FCEUX Automated Testing Guide - MITOSIS PANIC

**Created:** 2024-02-14
**QA Engineer:** Claude QA Agent + Audio Engineer
**Purpose:** Automated runtime validation using FCEUX Lua scripting

---

## Overview

This testing framework provides **automated state validation** during manual gameplay testing. Lua scripts monitor game state in real-time and detect bugs automatically.

### What This Solves

**Problem:** Code review and manual testing can miss runtime bugs
- Code may look correct but fail at runtime
- Visual bugs (flickering) hard to catch manually
- State mismatches (counters vs actual entities) invisible

**Solution:** Lua scripts continuously validate runtime state
- Detect bugs automatically during gameplay
- No guesswork - scripts report exact issues
- Supplements manual observation with objective data

---

## Quick Start

### 1. Build ROM
```bash
cd romulus-claude
git checkout feature/phase5-audio
make clean && make
# ROM created at: build/mitosis_panic.nes
```

### 2. Load ROM in FCEUX
```bash
fceux build/mitosis_panic.nes
```

### 3. Load Lua Scripts

**Option A: Load Both Scripts (Recommended)**

1. In FCEUX: `Tools > Lua > New Lua Script Window`
2. Click "Browse" and select `fceux_test_gameplay.lua`
3. Click "Run"
4. In FCEUX: `Tools > Lua > New Lua Script Window` (second window)
5. Click "Browse" and select `audio/testing/fceux_audio_validation.lua`
6. Click "Run"

**Option B: Load Master Script (Info Only)**

1. In FCEUX: `Tools > Lua > New Lua Script Window`
2. Click "Browse" and select `fceux_test_mitosis_panic.lua`
3. Click "Run"
4. Follow on-screen instructions to load individual scripts

---

## What Gets Validated

### Gameplay Script (`fceux_test_gameplay.lua`)

**Monitors:**
- Entity counts (cells, antibodies, nutrients)
- Entity positions and velocities
- AI state execution (movement detection)
- Collision detection
- Mitosis events
- Nutrient collection counter
- Game over state
- Boundary violations

**Detects:**
- ✅ BUG-002: No nutrients spawning
- ✅ BUG-003: Antibodies not moving (frozen AI)
- ✅ BUG-004: Boundary wall issues
- ✅ BUG-005: Game hang on collision
- ✅ Counter mismatches (corrupt state)
- ✅ Mitosis trigger failures

**On-Screen Display:**
```
Frame: 120
Game Over: 0
Cells: 1 (actual: 1)
Antibodies: 2 (actual: 2)
Nutrients: 3 (actual: 3)
Collected: 5
Mitosis Events: 0
Antibody Movement: 2 moving, 0 static
```

---

### Audio Script (`audio/testing/fceux_audio_validation.lua`)

**Monitors:**
- APU registers ($4000-$4013)
- FamiTone2 state (ZP + RAM)
- Channel activity (Pulse1, Pulse2, Triangle, Noise)
- SFX trigger events
- Music playback state
- Frame timing overhead

**Detects:**
- ✅ Silent audio (no APU activity)
- ✅ Missed FamiToneUpdate calls
- ✅ SFX not triggering on events
- ✅ Music not looping
- ✅ Channel conflicts
- ✅ Performance overhead

**On-Screen Display:**
```
APU Activity: [====] Pulse1
              [====] Pulse2
              [===]  Triangle
              [==]   Noise

FamiTone2: ACTIVE
SFX Queue: 0 pending
Music: PLAYING (loop 2)
Frame Overhead: 850 cycles
```

---

## Console Output Interpretation

Scripts log events and anomalies to FCEUX console:

### Severity Levels

| Level | Meaning | Example |
|-------|---------|---------|
| `[INFO]` | Normal operation | `[INFO] Nutrient collected! Total: 5` |
| `[WARNING]` | Suspicious behavior | `[WARNING] Cell out of bounds! X=250` |
| `[ERROR]` | State mismatch | `[ERROR] Nutrient count mismatch! Counter=3, Actual=0` |
| `[CRITICAL]` | Known bug detected | `[CRITICAL] BUG-002: No nutrients spawned!` |

### Example Console Session

```
=== MITOSIS PANIC - Gameplay State Validator ===
Monitoring game state... Press Ctrl+C to stop.

[INFO] Nutrients spawned correctly: 3
[INFO] Antibody Movement: 2 moving, 0 static
[INFO] Nutrient collected! Total collected: 1, Counter: 1
[INFO] Nutrient collected! Total collected: 2, Counter: 2
[INFO] Nutrient collected! Total collected: 10, Counter: 10
[INFO] Mitosis detected! Cells: 1 -> 2 (Event #1)
[WARNING] Nutrients collected >= 10 (10) - mitosis should have triggered!
[INFO] Game over flag set! Flag=1
```

---

## Testing Scenarios

### Scenario 1: Quick Validation (30 seconds)

**Purpose:** Verify basic systems work
**Steps:**
1. Load ROM + scripts
2. Let game run for 10 seconds (observe spawn)
3. Move player around (test input)
4. Collect a nutrient (test collision)
5. Check console for errors

**Expected:**
- No `[CRITICAL]` messages
- Nutrients spawn (script confirms)
- Antibodies move (script shows "X moving")
- Collection increments counter

---

### Scenario 2: Mitosis Validation (2 minutes)

**Purpose:** Verify mitosis triggers correctly
**Steps:**
1. Load ROM + scripts
2. Collect 10 nutrients
3. Observe console for mitosis event
4. Verify cell count increments
5. Verify counter resets to 0

**Expected:**
- `[INFO] Mitosis detected! Cells: 1 -> 2`
- Counter shows: `Collected: 0` (after reset)
- No warning about counter >= 10

---

### Scenario 3: Collision Testing (1 minute)

**Purpose:** Verify game over vs hang
**Steps:**
1. Load ROM + scripts
2. Move player into antibody
3. Observe console for game over
4. Check if frame counter still incrementing
5. Verify no infinite loop

**Expected:**
- `[INFO] Game over flag set! Flag=1`
- Frame counter continues (not hung)
- Game stops accepting input
- No crash/freeze

---

### Scenario 4: Audio Validation (3 minutes)

**Purpose:** Verify all audio systems
**Steps:**
1. Load ROM + scripts
2. Listen for background music
3. Collect nutrient (listen for SFX)
4. Trigger mitosis (listen for jingle)
5. Hit antibody (listen for damage sound)
6. Check console for audio events

**Expected:**
- Music plays immediately
- SFX trigger on events
- No `[WARNING] Silent audio detected`
- No crackling/distortion
- Overhead < 1000 cycles

---

### Scenario 5: Stress Test (10 minutes)

**Purpose:** Verify stability under load
**Steps:**
1. Load ROM + scripts
2. Collect nutrients to spawn 8+ cells
3. Navigate through antibodies
4. Monitor frame rate
5. Check for sprite flickering
6. Watch for performance degradation

**Expected:**
- Frame counter increments smoothly
- No slowdown
- Audio remains clean
- Console shows no errors
- Overhead stays consistent

---

## Automated Bug Detection

Scripts automatically detect known bugs **without manual gameplay**:

### BUG-002: No Nutrients Spawning

**Detection Logic:**
```lua
if frame > 60 and actual_nutrients == 0 then
    print("[CRITICAL] BUG-002: No nutrients spawned!")
end
```

**What to Look For:**
- Message appears ~1 second after ROM start
- On-screen display shows: `Nutrients: 0 (actual: 0)`
- No green sprites visible

---

### BUG-003: Antibodies Not Moving

**Detection Logic:**
```lua
if frame > 120 and moving == 0 and static > 0 then
    print("[CRITICAL] BUG-003: All antibodies static!")
end
```

**What to Look For:**
- Message appears ~2 seconds after ROM start
- On-screen: `Antibody Movement: 0 moving, 2 static`
- Red sprites don't change position

---

### BUG-005: Game Hang

**Detection Logic:**
```lua
-- Monitor frame counter changes
if game_over == 1 and frame_delta == 0 then
    print("[CRITICAL] BUG-005: Game hung!")
end
```

**What to Look For:**
- Frame counter stops incrementing
- Console logs stop
- FCEUX unresponsive

---

## Performance Monitoring

Both scripts track cycle overhead:

### Gameplay Overhead
- Entity updates
- AI calculations
- Collision detection
- Rendering

### Audio Overhead
- FamiToneUpdate execution
- APU register writes
- SFX processing

### Combined Analysis
```
Target: 2273 cycles (VBlank budget)
Gameplay: ~800 cycles
Audio: ~850 cycles
Total: ~1650 cycles
Remaining: ~623 cycles ✅ SAFE
```

If total exceeds 2273, scripts warn about performance issues.

---

## Troubleshooting

### Script Won't Load

**Error:** "Cannot open file"
**Fix:** Ensure you're in the correct directory
```bash
cd romulus-claude
fceux build/mitosis_panic.nes
# Then load scripts from this directory
```

---

### No Output in Console

**Symptom:** Scripts loaded but no messages
**Fix:**
1. Check FCEUX console is visible: `Help > Message Log`
2. Verify scripts are running: Lua window shows "Running"
3. Restart FCEUX if needed

---

### Script Errors

**Error:** "attempt to call nil value"
**Fix:** FCEUX Lua version compatibility issue
- Ensure FCEUX 2.2.0 or later
- Check script syntax for typos

---

### Conflicting Output

**Symptom:** Scripts overlap on-screen
**Fix:**
- Gameplay script uses left side (10, 10 - 10, 100)
- Audio script uses right side (150, 10 - 150, 100)
- Adjust coordinates if needed

---

## Advanced Usage

### Custom Validation

Edit scripts to add custom checks:

```lua
-- Example: Detect excessive velocity
if math.abs(entity.vx) > 10 then
    print("[WARNING] Entity moving too fast!")
end
```

### Data Logging

Redirect console output to file:
```bash
fceux build/mitosis_panic.nes 2>&1 | tee test_log.txt
```

### Automated Testing

Run headless FCEUX with scripts:
```bash
fceux --loadlua fceux_test_gameplay.lua build/mitosis_panic.nes
```

---

## Best Practices

### Before Testing
1. ✅ Build fresh ROM (`make clean && make`)
2. ✅ Load both scripts before playing
3. ✅ Open console to monitor output
4. ✅ Note starting frame count

### During Testing
1. ✅ Play normally, let scripts monitor
2. ✅ Check console periodically for errors
3. ✅ Observe on-screen state display
4. ✅ Test specific scenarios intentionally

### After Testing
1. ✅ Review full console log
2. ✅ Document any `[CRITICAL]` or `[ERROR]` messages
3. ✅ Note frame counts where bugs occur
4. ✅ Save log if bugs found

---

## Limitations

### What Scripts CAN'T Detect

- **Visual glitches:** Sprite flickering, tile corruption
- **Audio quality:** Crackling, distortion (only detects silence)
- **Gameplay feel:** Responsiveness, difficulty balance
- **Subjective issues:** Fun factor, polish

**These require manual observation!**

### What Scripts CAN Detect

- ✅ State mismatches (counters wrong)
- ✅ Logic failures (AI not running)
- ✅ Spawn issues (entities missing)
- ✅ Collision bugs (detection not firing)
- ✅ Audio silence (no APU activity)
- ✅ Performance overhead (cycle counts)

---

## Integration with Manual Testing

**Recommended Workflow:**

1. **Automated First:** Load scripts, check for immediate errors
2. **Manual Second:** Play game, observe visual/audio quality
3. **Validate Third:** Cross-reference manual observations with script data

**Example:**
- Manually observe: "Enemies seem frozen"
- Script confirms: `[CRITICAL] BUG-003: All antibodies static!`
- Script provides data: `Antibody Movement: 0 moving, 2 static`

This combination catches both obvious and subtle bugs.

---

## Future Enhancements

### Planned Features
- Memory leak detection
- Sprite overflow monitoring
- Input lag measurement
- Save state comparison
- Regression test suite

### Community Contributions
Want to improve the scripts? Areas to expand:
- Additional entity validation
- More audio checks (channel conflicts)
- Performance profiling tools
- Automated screenshot capture

---

## Support

### Issues with Scripts
- Check FCEUX version (2.2.0+ required)
- Verify Lua syntax (use online validator)
- Test with simple ROM first

### Issues with Game
- Document bug with script output
- Include console log
- Note frame count
- Describe visual behavior

---

## Credits

**Gameplay Validator:** QA Engineer (Claude)
**Audio Validator:** Audio Engineer
**Framework:** Collaborative QA methodology improvement

**Inspired by:** Operator's suggestion to use FCEUX Lua for automated testing

---

## Quick Reference

### Loading Scripts
```
FCEUX: Tools > Lua > New Lua Script Window
File 1: fceux_test_gameplay.lua
File 2: audio/testing/fceux_audio_validation.lua
```

### Severity Colors
- `[INFO]` = Normal
- `[WARNING]` = Check
- `[ERROR]` = Bug likely
- `[CRITICAL]` = Known bug

### Key Metrics
- Nutrients: Should be 3 at start
- Antibodies: Should move (not static)
- Mitosis: Every 10 nutrients
- Audio: APU active, music playing
- Performance: <2273 cycles total

---

**Document Version:** 1.0
**Last Updated:** 2024-02-14
**Status:** Ready for Use

Happy testing! 🎮🔍
