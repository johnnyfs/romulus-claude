# MITOSIS PANIC - Audio Integration Test Checklist

## Purpose
Comprehensive validation checklist for Phase 5 audio integration. Use this alongside FCEUX Lua validation scripts to ensure all audio systems work correctly.

**Status**: Audio confirmed working (operator heard sounds). Now validate completeness and correctness.

---

## Pre-Test Setup

### Build Verification
- [ ] ROM builds without errors from feature/phase5-audio branch
- [ ] ROM size is reasonable (~40KB reported, verify)
- [ ] No linker errors related to audio symbols (music_data, sfx_data)
- [ ] FamiTone2 engine (famitone2.s) included in build
- [ ] Audio data files (music_data.s, sfx_data.s) included in build

### Memory Verification
- [ ] FT_TEMP allocated in Zero Page (3 bytes)
- [ ] FT_BASE_ADR allocated in BSS (186 bytes)
- [ ] No memory conflicts with game code
- [ ] Check .map file for correct symbol locations

### FCEUX Setup
- [ ] Load feature/phase5-audio ROM in FCEUX
- [ ] Load fceux_audio_validation.lua script
- [ ] Audio output enabled in FCEUX settings
- [ ] Volume set to audible level

---

## Phase 1: Basic Audio Functionality

### Audio Engine Initialization
- [ ] **CRITICAL**: FamiToneInit called during game startup
  - *Lua Check*: APU writes detected within first 2 seconds
  - *Manual*: Hear background music start immediately

- [ ] FamiToneSfxInit called after music init
  - *Lua Check*: sfx_data symbols present in memory

- [ ] Background music starts playing automatically
  - *Manual*: Music audible on title screen or gameplay start
  - *Expected*: Simple looping 8-beat pattern (stub music)

### Audio Engine Updates
- [ ] **CRITICAL**: FamiToneUpdate called EVERY frame
  - *Lua Check*: APU write count increases at ~60 Hz
  - *Lua Check*: No "APU not being updated" warnings
  - *Failure Mode*: If updates stop, audio will freeze/glitch

### Channel Activity
- [ ] At least one APU channel active during music
  - *Lua Check*: Pulse1, Pulse2, Triangle, or Noise showing activity
  - *Visual*: Volume bars animate in Lua script display

- [ ] APU Status register ($4015) shows channels enabled
  - *Lua Check*: Status display shows "Enabled: P1 P2 TRI NOI"

---

## Phase 2: Sound Effects Validation

### SFX 0: Mitosis (Cell Division)
**Trigger**: Cell divides (every 10 nutrients collected)

- [ ] SFX plays when mitosis occurs
  - *Manual*: Collect 10 nutrients → hear rising beep/sweep
  - *Lua Check*: PULSE1_START event logged at frame of mitosis
  - *Expected Sound*: Short rising pitch (stub = simple beep)

- [ ] SFX doesn't play randomly or at wrong times
  - *Manual*: No mitosis sound when collecting 1-9 nutrients

- [ ] SFX completes without cutting off
  - *Manual*: Full sound plays, not truncated

### SFX 1-3: Nutrient Collection (3 Variants)
**Trigger**: Cell touches nutrient particle

- [ ] SFX plays on nutrient collection
  - *Manual*: Touch nutrient → immediate beep/bloop
  - *Lua Check*: PULSE1_START event logged on collection frame
  - *Expected Sound*: Short beep (stub = simple tone)

- [ ] SFX plays for ALL nutrient colors (green/yellow/pink)
  - *Manual*: Test each color variant → all produce sound
  - *Note*: Stubs may sound identical, real assets will differ

- [ ] Rapid collection doesn't break audio
  - *Manual*: Collect nutrients rapidly → each produces sound
  - *Lua Check*: Multiple PULSE1_START events in quick succession
  - *Acceptance*: Some sounds may overlap/cut off (channel priority)

### SFX 4: Antibody Spawn Warning
**Trigger**: Antibody enemy spawns (if implemented)

- [ ] SFX plays when antibody appears
  - *Manual*: New enemy spawns → hear warning tone
  - *Lua Check*: PULSE2_START event logged
  - *Expected Sound*: Ominous low tone (stub = simple beep)

- [ ] Uses Pulse 2 channel (doesn't interrupt melody)
  - *Lua Check*: Pulse2 volume bar shows activity, not Pulse1

### SFX 5-6: Damage (Dual-Channel)
**Trigger**: Cell collides with antibody

- [ ] Damage SFX plays on collision
  - *Manual*: Touch enemy → hear damage sound
  - *Lua Check*: PULSE1_START + NOISE_START events simultaneously
  - *Expected Sound*: Harsh/falling sweep + noise burst

- [ ] Both channels active simultaneously
  - *Lua Check*: Pulse1 AND Noise both show activity same frame
  - *Visual*: Both volume bars animate together

- [ ] Damage doesn't cause game to hang
  - *Manual*: Collision → damage sound → game over screen appears
  - *Critical*: Verify game over screen actually displays

### SFX 7: Game Over
**Trigger**: Cell dies (collision with antibody)

- [ ] Game over SFX plays after death
  - *Manual*: Die → hear game over jingle
  - *Lua Check*: PULSE1_START event logged (longer sequence)
  - *Expected Sound*: Descending melody (stub = simple sequence)

- [ ] Background music STOPS before game over SFX
  - *Lua Check*: Music channels go silent, then game over plays
  - *Manual*: No music+SFX overlap during game over

- [ ] Game over SFX plays completely
  - *Manual*: Full jingle plays before restart/menu

---

## Phase 3: Background Music Validation

### Music Playback
- [ ] Music starts automatically on game start
  - *Manual*: Hear music within 1 second of ROM load
  - *Lua Check*: Multiple channels active continuously

- [ ] Music uses multiple channels
  - *Lua Check*: Pulse1, Pulse2, Triangle showing activity
  - *Expected*: Stub uses simplified pattern, may be sparse

- [ ] Music volume is appropriate (not too loud/quiet)
  - *Manual*: Music audible but doesn't overpower SFX
  - *Subjective*: Stubs may be simple, real assets will be balanced

### Music Looping
- [ ] **CRITICAL**: Music loops seamlessly
  - *Manual*: Play for 30+ seconds → listen for loop point
  - *Expected*: Stub = 8-beat pattern, loops ~every 2 seconds
  - *Failure Mode*: Click, gap, or silence at loop point = bug

- [ ] No audio glitches at loop boundary
  - *Manual*: No pops, clicks, or distortion when looping
  - *Lua Check*: APU writes remain consistent across loop

- [ ] Loop continues indefinitely
  - *Manual*: Music plays for 2+ minutes without stopping
  - *Lua Check*: No "APU not being updated" warnings over time

### Music + SFX Interaction
- [ ] SFX don't permanently stop music
  - *Manual*: Play SFX → music resumes after
  - *Lua Check*: Music channels return to active after SFX

- [ ] Music briefly interrupts for important SFX acceptable
  - *Manual*: Mitosis/damage may briefly pause music channel
  - *Expected Behavior*: Short interruption OK, music resumes

- [ ] Rapid SFX don't break music playback
  - *Manual*: Spam nutrient collection → music keeps playing
  - *Lua Check*: Music channels mostly active despite SFX

---

## Phase 4: Performance Validation

### Frame Rate Stability
- [ ] **CRITICAL**: Game maintains 60 FPS with audio
  - *Manual*: Gameplay feels smooth, no slowdown
  - *Lua Check*: Frame count increases at steady 60 Hz
  - *Acceptance*: Occasional drops OK, sustained drops = bug

- [ ] No frame drops during heavy SFX use
  - *Manual*: Rapid nutrient collection + enemies → no lag
  - *Test Scenario*: Max entities (16 cells + 8 antibodies)

- [ ] Audio doesn't cause visible stuttering
  - *Manual*: Sprite movement remains smooth with audio on

### CPU Budget
- [ ] FamiToneUpdate overhead acceptable
  - *Expected*: ~6000 cycles (~11% frame) worst case
  - *Current Game*: ~5600 cycles reported (pre-audio)
  - *Combined*: ~11,600 cycles (~39% frame) acceptable
  - *Monitoring*: If drops occur, consider split-frame optimization

### VBlank Timing
- [ ] NMI completes within VBlank window
  - *Technical*: ~2273 cycles available in VBlank
  - *Current Approach*: Full FamiToneUpdate in NMI (~6000 cycles)
  - *Concern*: May exceed VBlank if game logic also in NMI
  - *Solution*: Split-frame if frame drops detected (see INTEGRATION_GUIDE.md)

---

## Phase 5: Edge Cases & Stress Testing

### Rapid SFX Triggering
- [ ] Collect nutrients in rapid succession
  - *Expected*: SFX queue/overlap, some may cut off
  - *Acceptable*: Channel priority may silence earlier sounds
  - *Failure*: Audio engine crash or permanent silence

- [ ] Spam mitosis trigger (cheat/debug mode)
  - *Test*: Force multiple mitosis events quickly
  - *Expected*: SFX play or queue, no crash

### Simultaneous Multi-Channel SFX
- [ ] Multiple cells hit antibodies same frame
  - *Test Scenario*: Position cells to collide simultaneously
  - *Expected*: One damage SFX plays (can't play multiple)
  - *Acceptable*: First collision gets audio, others silent

- [ ] SFX + music all 4 channels active
  - *Test*: Trigger SFX while music playing
  - *Expected*: All channels busy, sound is dense
  - *Lua Check*: All 4 volume bars show activity

### Maximum Load Scenario
- [ ] 16 cells + 8 antibodies + 8 nutrients + continuous SFX
  - *Setup*: Use debug mode or play until max entities
  - *Test*: Collect nutrients rapidly with max entity count
  - *Expected*: Game + audio remain functional
  - *Acceptable*: Some frame drops, but recovers
  - *Failure*: Crash, permanent slowdown, audio silence

### Music Loop Boundary Stress
- [ ] SFX triggered exactly at music loop point
  - *Setup*: Wait for loop, trigger SFX at boundary
  - *Expected*: Both play correctly, no glitch
  - *Lua Check*: No APU register corruption at loop

- [ ] Game state change at loop boundary
  - *Test*: Die/restart exactly when music loops
  - *Expected*: Clean transition, no audio artifacts

---

## Phase 6: Bug Hunting

### Silent Audio Bugs
- [ ] Audio never starts (engine not initialized)
  - *Symptom*: No sound at all, ever
  - *Lua Check*: "No audio activity detected" warning
  - *Cause*: FamiToneInit not called or failed

- [ ] Audio starts then stops (engine stalls)
  - *Symptom*: Music plays briefly then silence
  - *Lua Check*: "APU not being updated" warning
  - *Cause*: FamiToneUpdate not in NMI or NMI disabled

- [ ] Some channels silent (data corruption)
  - *Symptom*: Only 1-2 channels play, others never active
  - *Lua Check*: Some channels always zero volume
  - *Cause*: Bad music/SFX data or channel disabled

### Audio Glitches
- [ ] Clicking/popping sounds
  - *Symptom*: Random clicks during playback
  - *Cause*: APU registers written mid-frame, not during VBlank
  - *Solution*: Ensure FamiToneUpdate in NMI

- [ ] Distorted/harsh sounds
  - *Symptom*: Audio sounds wrong, harsh, or noisy
  - *Cause*: Incorrect duty cycles, bad envelope data
  - *Expected*: Stubs are simple, may sound basic but not harsh

- [ ] Music skips/stutters
  - *Symptom*: Music plays but has gaps or repeats
  - *Cause*: Missed FamiToneUpdate calls (frame drops)
  - *Lua Check*: APU write gaps in frame sequence

### Trigger Bugs
- [ ] SFX don't play when expected
  - *Symptom*: Collect nutrient but no sound
  - *Debug*: Add breakpoint on FamiToneSfxPlay call
  - *Cause*: Trigger code not calling audio function

- [ ] Wrong SFX plays for event
  - *Symptom*: Nutrient sounds like damage, etc.
  - *Cause*: Wrong SFX ID constant in trigger code
  - *Fix*: Verify constants match audio_constants.s

- [ ] SFX play at wrong time
  - *Symptom*: Random sounds during gameplay
  - *Cause*: Spurious trigger calls, uninitialized variables

### Memory Corruption
- [ ] FamiTone2 RAM overwritten by game code
  - *Symptom*: Audio glitches, random behavior
  - *Lua Check*: FT_BASE_ADR values change unexpectedly
  - *Debug*: Check for RAM conflicts in .map file

- [ ] Stack overflow corrupting audio memory
  - *Symptom*: Audio works then fails randomly
  - *Cause*: Stack grows into FT_BASE_ADR
  - *Solution*: Relocate audio RAM or reduce stack usage

---

## Phase 7: Integration Validation

### Code Review Verification
- [ ] FamiToneInit called in game startup (before main loop)
  - *Location*: Check main.s or game.s initialization
  - *Parameters*: A=0 (NTSC), XY=music_data pointer

- [ ] FamiToneSfxInit called after FamiToneInit
  - *Location*: Same initialization section
  - *Parameters*: XY=sfx_data pointer

- [ ] FamiToneMusicPlay called to start music
  - *Location*: After init, before main loop
  - *Parameters*: A=0 (track 0 = main theme)

- [ ] FamiToneUpdate in NMI handler
  - *Location*: NMI routine (nmi.s or main.s)
  - *Position*: Early in NMI, before long operations
  - *Critical*: Must be called EVERY frame

- [ ] SFX trigger calls use correct syntax
  - *Pattern*: `lda #SFX_ID` → `ldx #FT_SFX_CHx` → `jsr FamiToneSfxPlay`
  - *Verify*: All game event locations (collision, collection, mitosis)

### Data Validation
- [ ] music_data.s included in build
  - *Check*: .include "audio/exports/music_data.s" present
  - *Symbol*: music_data exported and linked

- [ ] sfx_data.s included in build
  - *Check*: .include "audio/exports/sfx_data.s" present
  - *Symbol*: sfx_data exported and linked

- [ ] Audio data in correct segment (RODATA)
  - *Check*: .segment "RODATA" before data
  - *Verify*: Data not in RAM (would be huge waste)

- [ ] Audio constants match documentation
  - *Check*: SFX_* constants = 0-7 in order
  - *Check*: FT_SFX_CH* constants = 0-3
  - *Check*: MUSIC_MAIN_THEME = 0

---

## Phase 8: Regression Testing

### After Any Audio Changes
- [ ] Re-run full checklist
- [ ] Verify no new issues introduced
- [ ] Check ROM size hasn't exploded
- [ ] Test on clean ROM build (make clean && make)

### Before Merging to Main
- [ ] All critical tests passing
- [ ] No game-breaking audio bugs
- [ ] Performance acceptable (60 FPS most of time)
- [ ] Operator approval of sound quality
- [ ] Documentation updated for any changes

---

## Known Issues / Limitations (Stub Audio)

### Expected Behavior with Placeholder Stubs
- **Simple sounds**: Stubs are basic beeps, not full sound design
- **Limited variety**: Nutrient variants may sound identical
- **Basic music**: 8-beat simple pattern, not full composition
- **No polish**: No envelopes, no fancy effects, just functional

### Not Bugs (Expected with Stubs)
- ✓ Music sounds repetitive/boring (stub is minimal)
- ✓ SFX sound plain/unexciting (stub are simple tones)
- ✓ Some sounds are similar (stubs not fully differentiated)
- ✓ Music loop is short (~2 seconds for stub)

### Real Bugs (Report These)
- ✗ No audio at all
- ✗ Audio crashes game
- ✗ Audio causes severe frame drops
- ✗ SFX don't trigger when expected
- ✗ Music doesn't loop
- ✗ Audio glitches/pops/distortion
- ✗ Channels permanently silent

---

## Success Criteria

### Minimum Viable Audio (MVP)
- [x] Audio system doesn't crash game
- [x] Background music plays and loops
- [ ] At least 2 SFX working (nutrient + one other)
- [ ] Audio doesn't cause unacceptable frame drops
- [ ] No severe audio glitches (clicks/pops OK if rare)

### Full Phase 5 Complete
- [ ] All 4 SFX types working (nutrient, mitosis, damage, game over)
- [ ] Music loops seamlessly without gaps
- [ ] SFX trigger accurately on game events
- [ ] Performance stable under max load
- [ ] No critical bugs remaining
- [ ] Operator approval for MVP release

### Post-MVP Enhancement (Future)
- [ ] Replace stubs with real FamiTracker compositions
- [ ] Add music variations (fast theme for later levels)
- [ ] Polish SFX timing and envelopes
- [ ] Balance audio mix (music vs SFX volumes)
- [ ] Add DPCM samples if desired

---

## Testing Tools

### Manual Testing
- **FCEUX**: Load ROM, play game, listen carefully
- **Headphones**: Recommended for hearing subtle issues
- **Multiple sessions**: Test for 5+ minutes to catch intermittent bugs

### Automated Testing
- **fceux_audio_validation.lua**: Real-time APU/FamiTone2 monitoring
- **fceux_test_complete.lua**: Combined gameplay + audio validation (from QA)
- **Logs**: Check FCEUX console output for warnings

### Debug Tools
- **FCEUX Debugger**: Breakpoints on audio functions
- **Memory Viewer**: Watch FT_BASE_ADR and APU registers
- **Sound Visualizer**: FCEUX has built-in APU channel display

---

## Reporting Issues

### Bug Report Format
1. **Symptom**: What you heard/saw
2. **Expected**: What should happen
3. **Reproduction**: Steps to trigger bug
4. **Frequency**: Always, sometimes, rare?
5. **Lua Output**: Any warnings/errors from validation script
6. **Build**: Branch/commit tested

### Example Good Bug Report
```
SYMPTOM: No audio plays at all
EXPECTED: Background music on startup
REPRO: Load ROM in FCEUX, wait 10 seconds, silence
FREQUENCY: Always (100% repro)
LUA OUTPUT: "WARNING: No audio activity detected!"
BUILD: feature/phase5-audio, commit 694b13f
```

---

## Checklist Completion

**Tester**: _______________________
**Date**: _______________________
**Build**: feature/phase5-audio
**Commit**: _______________________

**Overall Result**:
- [ ] PASS - Ready for merge
- [ ] PASS (with minor issues) - Document and proceed
- [ ] FAIL - Critical bugs, needs fixes

**Notes**:
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________
