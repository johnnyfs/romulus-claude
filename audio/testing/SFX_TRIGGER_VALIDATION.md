# MITOSIS PANIC - Sound Effects Trigger Validation

## Purpose
**PROVE** that all 4 sound effect types trigger correctly on their intended game events.

**Status**: Music confirmed working by operator. SFX validation INCOMPLETE - need to verify each effect individually.

---

## Critical Mission
**VALIDATE EVERY SFX. PROVE EVERY TRIGGER. MISS NOTHING.**

---

## SFX Inventory

### Required Sound Effects (4 Types)
1. **Nutrient Collection** - Bloop sound when cell touches nutrient
2. **Mitosis** - Jingle when cell divides (every 10 nutrients)
3. **Damage/Death** - Sound when cell hits antibody
4. **Antibody Spawn** - Warning when enemy appears (if implemented)

**Current Status**: Unknown which SFX are actually working

---

## Validation Test Plan

### Test 1: Nutrient Collection SFX
**Event**: Cell collides with nutrient particle

**Setup**:
1. Load feature/phase5-audio ROM in FCEUX
2. Load fceux_audio_validation.lua script
3. Position player cell near nutrient
4. Prepare to observe Lua console + listen

**Test Procedure**:
```
STEP 1: Move cell to touch green nutrient
Expected: Hear short beep/bloop sound
Lua Check: PULSE1_START event logged with "NUTRIENT" frame
Result: [PASS / FAIL / NO SOUND]

STEP 2: Touch yellow nutrient
Expected: Hear short beep (may sound identical to green in stubs)
Lua Check: PULSE1_START event logged
Result: [PASS / FAIL / NO SOUND]

STEP 3: Touch pink nutrient
Expected: Hear short beep (may sound identical in stubs)
Lua Check: PULSE1_START event logged
Result: [PASS / FAIL / NO SOUND]

STEP 4: Rapid collection (spam nutrient pickup)
Expected: Multiple beeps in quick succession, some may overlap/cut off
Lua Check: Multiple PULSE1_START events rapidly
Result: [PASS / FAIL / AUDIO BREAKS]
```

**Acceptance Criteria**:
- [x] At least ONE nutrient type produces sound
- [ ] Sound plays IMMEDIATELY on collision (0-2 frame latency)
- [ ] Rapid collection doesn't permanently break audio
- [ ] Lua script logs PULSE1_START events

**Failure Modes**:
- No sound at all → Trigger code not calling FamiToneSfxPlay
- Wrong sound → Incorrect SFX ID constant
- Delayed sound → Trigger location wrong (not in collision handler)
- Audio breaks after rapid use → Channel priority or queue issue

**Debug Steps if Failed**:
1. Check collision detection code for FamiToneSfxPlay call
2. Verify SFX ID: should be SFX_NUTRIENT_A/B/C (1-3)
3. Verify channel: should be FT_SFX_CH0 (Pulse 1)
4. Check Lua console for any error messages
5. Verify sfx_data properly linked in build

---

### Test 2: Mitosis SFX
**Event**: Cell divides after collecting 10 nutrients

**Setup**:
1. Start fresh game in FCEUX
2. Audio Lua script loaded
3. Track nutrient collection count (Lua or manual)

**Test Procedure**:
```
STEP 1: Collect exactly 10 nutrients
Expected: Hear mitosis jingle (stub = short rising sweep)
Visual: Cell should divide into 2 cells
Lua Check: PULSE1_START event logged at mitosis frame
Result: [PASS / FAIL / NO SOUND]

STEP 2: Verify sound plays WITH division, not before/after
Expected: Sound coincides with visual cell split
Timing: Sound starts same frame as or 1 frame after division
Result: [PASS / FAIL / TIMING OFF]

STEP 3: Collect another 10 nutrients (20 total)
Expected: Another mitosis jingle, now 4 cells
Lua Check: Another PULSE1_START event at 2nd mitosis
Result: [PASS / FAIL / NO SOUND]

STEP 4: Rapid mitosis (collect 10 quickly, repeat)
Expected: Each mitosis gets sound, even if rapid
Lua Check: PULSE1_START events match mitosis count
Result: [PASS / FAIL / SOME MISSING]
```

**Acceptance Criteria**:
- [ ] Mitosis sound plays on cell division
- [ ] Sound synchronized with visual division (not early/late)
- [ ] Every mitosis event gets audio (no silent divisions)
- [ ] Lua logs match mitosis count

**Failure Modes**:
- No sound → Mitosis trigger missing FamiToneSfxPlay call
- Sound but no division → Audio trigger in wrong place
- Division but no sound → Trigger code commented out or skipped
- Inconsistent triggering → Conditional logic bug

**Debug Steps if Failed**:
1. Check mitosis trigger code (nutrient counter == 10 * n)
2. Verify SFX ID: should be SFX_MITOSIS (0)
3. Verify channel: should be FT_SFX_CH0 (Pulse 1)
4. Add breakpoint at mitosis logic
5. Check if nutrients_collected counter is working

---

### Test 3: Damage/Death SFX
**Event**: Cell collides with antibody enemy

**Setup**:
1. Fresh game in FCEUX
2. Audio Lua script loaded
3. Locate antibody enemy

**Test Procedure**:
```
STEP 1: Position cell to collide with antibody
Expected: Hear damage sound (stub = sweep + noise burst)
Expected: Game over screen appears (or game hangs if bug)
Lua Check: PULSE1_START + NOISE_START same frame
Result: [PASS / FAIL / NO SOUND / GAME HANGS]

STEP 2: Verify dual-channel SFX
Expected: Both Pulse1 AND Noise channels active
Lua Check: Both channels show volume bars animate
Timing: Both start same frame (simultaneous)
Result: [PASS / FAIL / ONLY ONE CHANNEL]

STEP 3: Verify game over sequence
Expected: Music stops, damage SFX plays, game over screen
Sequence: collision → damage sound → music silence → game over jingle
Result: [PASS / FAIL / WRONG SEQUENCE]
```

**Acceptance Criteria**:
- [ ] Damage sound plays on antibody collision
- [ ] Both Pulse1 and Noise channels used (dual-channel effect)
- [ ] Game progresses to game over (doesn't hang)
- [ ] Music stops before/during game over

**Failure Modes**:
- No sound → Collision handler missing audio call
- Only one channel → Only one FamiToneSfxPlay call
- Game hangs → Collision bug (not audio issue, but blocks test)
- Sound but game continues → Collision doesn't trigger game over

**Debug Steps if Failed**:
1. Check antibody collision code
2. Verify TWO SFX calls: SFX_DAMAGE (5) + SFX_DAMAGE_NOISE (6)
3. Verify channels: CH0 for pulse, CH3 for noise
4. Test if collision detection works at all
5. Check game over state transition

---

### Test 4: Antibody Spawn Warning SFX (Optional)
**Event**: New antibody enemy spawns

**Setup**:
1. Fresh game in FCEUX
2. Audio Lua script loaded
3. Wait for antibody spawn (if dynamic spawning implemented)

**Test Procedure**:
```
STEP 1: Observe antibody spawn event
Expected: Hear warning sound (stub = ominous low tone)
Visual: New antibody appears on screen
Lua Check: PULSE2_START event logged
Result: [PASS / FAIL / NO SOUND / NO SPAWNING]

STEP 2: Verify uses Pulse 2 channel
Expected: Pulse2 channel active, NOT Pulse1
Reason: Pulse1 busy with melody, Pulse2 for warnings
Lua Check: Pulse2 volume bar animates, Pulse1 continues music
Result: [PASS / FAIL / WRONG CHANNEL]
```

**Acceptance Criteria**:
- [ ] Warning sound plays on antibody spawn (if spawning exists)
- [ ] Uses Pulse2 channel (doesn't interrupt melody)
- [ ] OR spawning not implemented yet (acceptable for MVP)

**Failure Modes**:
- No sound → Spawn code missing audio call
- Wrong channel → Using Pulse1 instead of Pulse2
- Spawning doesn't exist → Feature not implemented (OK)

**Debug Steps if Failed**:
1. Verify antibody spawning is implemented
2. Check spawn code for FamiToneSfxPlay call
3. Verify SFX ID: SFX_ANTIBODY_WARN (4)
4. Verify channel: FT_SFX_CH1 (Pulse 2)

---

## Comprehensive SFX Test Sequence

### Full Playthrough Test
**Goal**: Trigger all SFX in one continuous session

**Procedure**:
1. Start game, listen for music (should start immediately)
2. Collect 1 nutrient → hear collection sound
3. Collect 9 more nutrients → hear 9 more collection sounds
4. 10th nutrient → hear BOTH collection + mitosis sounds
5. Continue playing with multiple cells
6. Eventually collide with antibody → hear damage sound
7. Game over screen → hear game over jingle (music stopped)

**Success**: All 4+ SFX types heard during playthrough
**Failure**: Any SFX missing = investigate that specific trigger

---

## Automated Validation (Lua Script Enhancement)

### SFX Trigger Logger
Add to fceux_audio_validation.lua:

```lua
-- Track SFX triggers
local sfx_triggered = {
    nutrient = false,
    mitosis = false,
    damage = false,
    antibody = false
}

-- Enhanced event detection
function detect_sfx_events()
    -- Check Pulse1 start (most SFX use this)
    if pulse1_vol > 0 and last_pulse1_vol == 0 then
        log_audio_event("PULSE1_START", "Vol=" .. pulse1_vol)

        -- Heuristic: assume nutrient if frequent, mitosis if less frequent
        -- (Real detection needs game state inspection)
        sfx_triggered.nutrient = true
    end

    -- Check simultaneous Pulse1 + Noise (damage)
    if pulse1_vol > 0 and noise_vol > 0 and
       last_pulse1_vol == 0 and last_noise_vol == 0 then
        log_audio_event("DAMAGE_SFX", "Dual-channel detected")
        sfx_triggered.damage = true
    end

    -- Check Pulse2 start (antibody warning)
    if pulse2_vol > 0 and last_pulse2_vol == 0 then
        log_audio_event("PULSE2_START", "Vol=" .. pulse2_vol)
        sfx_triggered.antibody = true
    end
end

-- Report SFX coverage
function report_sfx_coverage()
    print("=== SFX COVERAGE REPORT ===")
    print("Nutrient:  " .. (sfx_triggered.nutrient and "YES" or "NO"))
    print("Mitosis:   " .. (sfx_triggered.mitosis and "YES" or "NO"))
    print("Damage:    " .. (sfx_triggered.damage and "YES" or "NO"))
    print("Antibody:  " .. (sfx_triggered.antibody and "YES" or "NO"))
end
```

Call `report_sfx_coverage()` periodically to see which SFX have triggered.

---

## Code Review Validation

### Where SFX Should Be Triggered

**Nutrient Collection**:
```assembly
; In collision detection routine
check_nutrient_collision:
    ; ... collision math ...
    bne @no_collision

    ; Collision detected!
    lda nutrient_color          ; 0=green, 1=yellow, 2=pink
    clc
    adc #SFX_NUTRIENT_A         ; Calculate SFX ID
    ldx #FT_SFX_CH0             ; Pulse 1 channel
    jsr FamiToneSfxPlay         ; ← MUST BE HERE

    ; ... remove nutrient, increment counter ...
@no_collision:
```

**Mitosis Trigger**:
```assembly
; After incrementing nutrient counter
check_mitosis:
    lda nutrients_collected
    and #%00001111              ; Modulo 16 (or 10 if decimal)
    bne @no_mitosis

    ; Mitosis triggered!
    lda #SFX_MITOSIS            ; SFX ID = 0
    ldx #FT_SFX_CH0             ; Pulse 1 channel
    jsr FamiToneSfxPlay         ; ← MUST BE HERE

    ; ... perform cell division ...
@no_mitosis:
```

**Damage/Death**:
```assembly
; In antibody collision handler
check_antibody_collision:
    ; ... collision math ...
    bne @no_collision

    ; Collision detected! Play damage SFX
    lda #SFX_DAMAGE             ; Pulse sweep
    ldx #FT_SFX_CH0
    jsr FamiToneSfxPlay         ; ← MUST BE HERE

    lda #SFX_DAMAGE_NOISE       ; Noise burst
    ldx #FT_SFX_CH3
    jsr FamiToneSfxPlay         ; ← MUST BE HERE

    ; ... trigger game over ...
@no_collision:
```

**Antibody Spawn** (if implemented):
```assembly
; In antibody spawn routine
spawn_antibody:
    ; ... spawn logic ...

    ; Play warning SFX
    lda #SFX_ANTIBODY_WARN      ; SFX ID = 4
    ldx #FT_SFX_CH1             ; Pulse 2 (not Pulse 1!)
    jsr FamiToneSfxPlay         ; ← MUST BE HERE

    ; ... finish spawn ...
```

### Verification Checklist
- [ ] Each game event has corresponding FamiToneSfxPlay call
- [ ] SFX IDs match constants (SFX_MITOSIS = 0, SFX_NUTRIENT_A = 1, etc.)
- [ ] Channel IDs correct (CH0 for most, CH1 for warnings, CH3 for noise)
- [ ] Calls happen AFTER event confirmed, BEFORE visual/state changes
- [ ] No conditional logic that could skip audio calls

---

## Integration Test (Chief Engineer)

### Test Procedure for Code Validation

**Step 1: Search for SFX Calls**
```bash
grep -r "FamiToneSfxPlay" src/*.s
```
Expected: 4-6 calls (nutrient, mitosis, damage x2, maybe antibody)

**Step 2: Verify Each Call**
For each FamiToneSfxPlay call found:
- Check SFX ID is valid constant (0-7)
- Check channel ID is valid constant (0-3)
- Verify call is in correct game event handler
- Confirm no bugs that could skip the call

**Step 3: Test in Emulator**
- Build ROM from feature/phase5-audio
- Load in FCEUX with Lua script
- Play game and trigger each event
- Confirm Lua logs show audio events
- Confirm human ear hears sounds

**Step 4: Document Results**
```
SFX TRIGGER VALIDATION REPORT
Date: YYYY-MM-DD
Build: feature/phase5-audio
Tester: __________

NUTRIENT COLLECTION:
- Code Location: [file:line]
- SFX ID: [value]
- Channel: [value]
- Emulator Test: [PASS / FAIL]
- Notes: ___________

MITOSIS:
- Code Location: [file:line]
- SFX ID: [value]
- Channel: [value]
- Emulator Test: [PASS / FAIL]
- Notes: ___________

DAMAGE:
- Code Location: [file:line]
- SFX IDs: [value, value]
- Channels: [value, value]
- Emulator Test: [PASS / FAIL]
- Notes: ___________

ANTIBODY SPAWN:
- Implemented: [YES / NO]
- Code Location: [file:line or N/A]
- SFX ID: [value or N/A]
- Channel: [value or N/A]
- Emulator Test: [PASS / FAIL / N/A]
- Notes: ___________

OVERALL: [ALL PASS / X FAILURES]
```

---

## Success Criteria

### Minimum Viable (MVP)
- [x] Background music working (confirmed by operator)
- [ ] At least 2 SFX types working (nutrient + one other)
- [ ] SFX trigger on correct events
- [ ] No crashes when SFX play

### Full Phase 5 Complete
- [ ] All 4 SFX types validated individually
- [ ] Triggers confirmed in code review
- [ ] Emulator testing confirms audio on all events
- [ ] Lua script logs match game events
- [ ] Human operator confirms sounds make sense

### Post-MVP Polish
- [ ] Replace stub SFX with real FamiTracker compositions
- [ ] Tune SFX timing and volume
- [ ] Add SFX variations for more variety
- [ ] Balance mix (SFX vs music levels)

---

## Failure Recovery

### If No SFX Play At All
**Symptoms**: Music works, but zero SFX ever
**Likely Causes**:
1. FamiToneSfxInit not called
2. sfx_data not linked properly
3. All trigger code commented out or skipped

**Debug**:
- Check init code for FamiToneSfxInit call
- Verify sfx_data in .map file
- Search entire codebase for "FamiToneSfxPlay" calls

### If Some SFX Work, Others Don't
**Symptoms**: Nutrient works, but mitosis doesn't (or vice versa)
**Likely Causes**:
1. Missing FamiToneSfxPlay call for that event
2. Wrong SFX ID or channel
3. Event itself not triggering (game logic bug)

**Debug**:
- Isolate working vs non-working SFX
- Compare trigger code between them
- Test if game event actually occurs (Lua logging)

### If SFX Crash Game
**Symptoms**: Triggering SFX causes hang or corruption
**Likely Causes**:
1. Bad SFX data (corrupted exports)
2. Invalid SFX ID (out of range)
3. Memory corruption (stack overflow)

**Debug**:
- Use audio_assertions.s in debug build
- Check for invalid parameters
- Verify sfx_data format correct

---

## Documentation Updates

After validation complete:
- [ ] Update AUDIO_TEST_CHECKLIST.md with results
- [ ] Document which SFX are working
- [ ] Note any bugs or issues found
- [ ] Update success criteria status

---

## Operator Instructions

**When you return**, please test systematically:

1. **Listen for music** - Should start immediately (✓ CONFIRMED)
2. **Collect 1 nutrient** - Should hear bloop/beep
3. **Collect 10 nutrients** - Should hear mitosis jingle + cell divides
4. **Hit antibody** - Should hear damage sound + game over
5. **Check Lua console** - Should see audio events logged

**Report back**:
- Which SFX you heard
- Which SFX were silent
- Any audio glitches or bugs
- Overall audio quality impression

---

## Current Status

**Known**:
- ✓ Music confirmed working by operator
- ? Nutrient SFX (unknown)
- ? Mitosis SFX (unknown)
- ? Damage SFX (unknown)
- ? Antibody SFX (unknown or unimplemented)

**Next Actions**:
1. Operator comprehensive SFX test when returns
2. Chief Engineer code review for trigger calls
3. QA Lua script enhancement for SFX tracking
4. Document and fix any missing/broken SFX

**Mission**: **PROVE ALL 4 SFX WORK. MISS NOTHING.**
