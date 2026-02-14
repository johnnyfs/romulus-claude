# MITOSIS PANIC - Audio Performance Metrics & Validation

## Purpose
Quantitative performance measurements for FamiTone2 audio integration. Use this to detect performance regressions and validate optimization decisions.

**Critical Mission**: PROVE every assumption. VALIDATE every metric. FIND every bug.

---

## Baseline Measurements (Pre-Audio)

### PR #8 Performance (Phase 4, No Audio)
- **Estimated Cycles**: ~5,600 cycles per frame
- **Frame Budget (NTSC)**: 29,780 cycles (100%)
- **Usage**: ~18.8% of frame
- **Headroom**: ~24,180 cycles (81.2%)
- **Status**: Good headroom for audio

### Target Performance (With Audio)
- **Audio Overhead**: ~6,000 cycles (FamiToneUpdate worst case)
- **Combined Estimate**: ~11,600 cycles
- **Projected Usage**: ~39% of frame
- **Remaining Budget**: ~18,180 cycles (61%)
- **Assessment**: Acceptable for MVP

---

## FamiTone2 Performance Characteristics

### Best Case (Music Only, Simple Pattern)
- **Cycles**: ~3,000-4,000 per frame
- **When**: Background music playing, no SFX
- **Impact**: Minimal, ~10-13% frame time

### Typical Case (Music + Occasional SFX)
- **Cycles**: ~4,500-5,500 per frame
- **When**: Normal gameplay, SFX triggered periodically
- **Impact**: Moderate, ~15-18% frame time

### Worst Case (Music + Multi-Channel SFX + Complex Patterns)
- **Cycles**: ~6,000-7,000 per frame
- **When**: Multiple SFX playing, complex music patterns
- **Impact**: High, ~20-23% frame time
- **Note**: Stubs are simple, real assets may be higher

### Critical Threshold
- **Frame Drop Point**: When combined cycles exceed ~27,000
- **Current Headroom**: ~15,000 cycles before drops
- **Safety Margin**: Comfortable for MVP

---

## Validation Tests

### Test 1: Idle Frame Rate (Music Only)
**Setup**: Game running, no player input, music playing

**Measurement Points**:
- [ ] Frame rate steady at 60 FPS
- [ ] No visible slowdown or stuttering
- [ ] FCEUX frame counter increases smoothly
- [ ] Lua script shows consistent APU updates

**Acceptance Criteria**:
- 60 FPS maintained for 60 seconds minimum
- No frame drops exceeding 1 frame per 10 seconds
- Audio plays smoothly without glitches

**If Failed**:
- Profile with FCEUX debugger cycle counter
- Check if FamiToneUpdate is unexpectedly expensive
- Consider split-frame optimization

### Test 2: Light Load (Single Cell + Few Entities)
**Setup**: 1 player cell, 2 antibodies, 4 nutrients, normal gameplay

**Measurement Points**:
- [ ] Frame rate steady during movement
- [ ] No drops when collecting nutrients
- [ ] SFX trigger doesn't cause stutter
- [ ] Music continues smoothly during SFX

**Acceptance Criteria**:
- 60 FPS sustained
- SFX play without causing visible lag
- Frame time stays under 20ms (60 FPS = 16.67ms ideal)

**If Failed**:
- Check SFX triggering code for inefficiency
- Verify SFX data isn't corrupted
- Profile entity update routines

### Test 3: Medium Load (4 Cells + Moderate Entities)
**Setup**: 4 cells from mitosis, 4 antibodies, 6 nutrients

**Measurement Points**:
- [ ] Frame rate acceptable during gameplay
- [ ] Rapid nutrient collection doesn't lag
- [ ] Multiple cells moving simultaneously OK
- [ ] Audio + entity updates coexist

**Acceptance Criteria**:
- Average 55+ FPS (occasional drops acceptable)
- Audio remains functional (no silence/corruption)
- Game remains playable (responsive controls)

**If Failed**:
- This is expected limit for current code
- Document frame drops but may be acceptable for MVP
- Plan optimization for post-MVP

### Test 4: Heavy Load (8+ Cells + Maximum Entities)
**Setup**: 8+ cells, 8 antibodies, 8 nutrients (max spawn)

**Measurement Points**:
- [ ] Frame rate measured under stress
- [ ] Audio continues to function
- [ ] No crashes or hangs
- [ ] Game remains playable (even if slow)

**Acceptance Criteria**:
- Minimum 45 FPS (playable threshold)
- Audio doesn't corrupt or crash
- Frame drops recover when entities removed

**If Failed**:
- Entity limit may need reduction
- Audio overhead may be too high
- Split-frame optimization required

### Test 5: Maximum Stress (Pathological Case)
**Setup**: 16 cells, 8 antibodies, 8 nutrients, rapid SFX triggering

**Measurement Points**:
- [ ] Game doesn't crash
- [ ] Audio doesn't cause hang
- [ ] Frame rate measured at worst case
- [ ] Recovery when load reduces

**Acceptance Criteria**:
- Game survives (even if slow)
- No permanent damage (audio/game state)
- Frame rate recovers to normal after stress

**If Failed**:
- Hard entity limit enforcement needed
- Audio may need optimization
- Consider reducing audio complexity

---

## VBlank Budget Analysis

### VBlank Window (NTSC)
- **Total Time**: ~2,273 cycles
- **Purpose**: PPU updates, OAM DMA, critical timing-sensitive operations

### Current VBlank Usage (Estimated)
**Without Audio**:
- PPU operations: ~500 cycles
- OAM DMA: ~513 cycles (fixed)
- Other NMI work: ~300 cycles
- **Total**: ~1,313 cycles (57.8% of VBlank)
- **Headroom**: ~960 cycles

**With Audio (Full FamiToneUpdate in NMI)**:
- Previous operations: ~1,313 cycles
- FamiToneUpdate: ~6,000 cycles
- **Total**: ~7,313 cycles
- **⚠️ EXCEEDS VBLANK BUDGET BY ~5,040 CYCLES**

### Critical Issue: VBlank Overflow
**Problem**: Full FamiToneUpdate in NMI exceeds VBlank window

**Impact**:
- PPU corruption possible
- Tearing/visual glitches
- Audio may glitch if interrupted mid-update

**Solution**: Split-Frame Architecture

---

## Split-Frame Optimization

### Architecture
Separate FamiTone2 into two parts:
1. **Music Processing** (main loop): Calculate next frame's audio
2. **APU Register Writes** (VBlank/NMI): Write calculated values to APU

### Split-Frame Cycle Budget
**Main Loop (Outside NMI)**:
- FamiToneMusicProcess(): ~5,000 cycles
- Runs during game logic time
- Doesn't impact VBlank

**VBlank/NMI (Timing Critical)**:
- FamiToneOutputRoutine(): ~500-1,000 cycles
- Just writes pre-calculated values to APU registers
- Fits comfortably in VBlank

### Implementation
```assembly
; Main game loop
main_loop:
    ; ... game logic ...

    jsr FamiToneMusicProcess    ; Calculate audio (5000 cycles)

    ; ... more game logic ...
    jmp main_loop

; NMI handler (VBlank)
NMI:
    ; Save registers
    pha
    txa
    pha
    tya
    pha

    ; Critical VBlank operations
    jsr update_ppu              ; ~500 cycles
    jsr oam_dma                 ; ~513 cycles (fixed)

    jsr FamiToneOutputRoutine   ; ~500-1000 cycles (APU writes only)

    ; Other NMI work
    inc frame_counter

    ; Restore registers
    pla
    tay
    pla
    tax
    pla
    rti
```

### Split-Frame Benefits
- **VBlank Budget**: Reduced from 7,313 to ~2,513 cycles (within budget!)
- **Main Loop**: Has plenty of time for 5,000 cycle audio processing
- **PPU Safety**: No risk of VBlank overflow
- **Audio Quality**: Same quality, just better timing

### When to Use Split-Frame
- **Immediate**: If seeing visual glitches (tearing, corruption)
- **Preventive**: If VBlank budget analysis shows overflow
- **Optimization**: For best performance and safety

**Current Status**: Test with full update first, optimize if needed

---

## Audio-Specific Performance Metrics

### APU Write Frequency
**Metric**: How often APU registers updated per second

**Measurement**:
- Use Lua script to count APU writes
- Expected: ~60 writes/second (once per frame)
- Acceptable: 55-60 writes/second (occasional skips OK)
- **Critical**: <50 writes/second indicates problem

**Validation**:
- [ ] Lua script shows APU write count
- [ ] Count increases steadily at ~60 Hz
- [ ] No long gaps (>2 frames) without writes

**If Failed**:
- FamiToneUpdate not being called every frame
- NMI not firing correctly
- Frame rate dropping severely

### Channel Utilization
**Metric**: How many APU channels actively used

**Measurement**:
- Monitor Pulse 1, Pulse 2, Triangle, Noise
- Count frames where each channel has volume > 0

**Expected Usage** (Stub Music + SFX):
- Pulse 1: 80-90% (melody + most SFX)
- Pulse 2: 50-70% (harmony + some SFX)
- Triangle: 70-90% (bass line)
- Noise: 10-30% (percussion + damage SFX)

**Validation**:
- [ ] All 4 channels show activity over 60 seconds
- [ ] No channel permanently silent (0% usage)
- [ ] Usage percentages reasonable for content

**If Failed**:
- Silent channel may indicate bad data
- Over-usage may indicate channel conflict
- Check music/SFX data for errors

### Audio Latency
**Metric**: Time from game event to SFX playback

**Measurement**:
- Trigger event (collect nutrient)
- Count frames until audio plays
- Use Lua to log exact frame of trigger and sound

**Expected Latency**:
- 0-1 frames: Excellent (immediate)
- 2-3 frames: Good (acceptable)
- 4-5 frames: Noticeable but OK
- **6+ frames**: Poor (feels delayed)

**Validation**:
- [ ] SFX plays within 2 frames of event
- [ ] Mitosis sound feels immediate with division
- [ ] Damage sound coincides with collision

**If Failed**:
- SFX trigger code may be in wrong location
- FamiToneSfxPlay call delayed by other code
- Audio engine may be buffering excessively

### Loop Boundary Timing
**Metric**: Precision of music loop point

**Measurement**:
- Play music for 10 loops minimum
- Listen for any delay/gap at loop boundary
- Use Lua to log APU state at suspected loop frame

**Expected**:
- Seamless loop (no audible gap)
- APU writes continuous across boundary
- No silence frames at loop point

**Validation**:
- [ ] No audible click or pop at loop
- [ ] No silence gap at loop boundary
- [ ] Music flows continuously

**If Failed**:
- Loop offset calculation wrong in music_data.s
- Pattern length mismatch
- FamiTone2 loop marker incorrect

---

## Memory Usage Validation

### RAM Allocation
**FamiTone2 Requirements**:
- FT_TEMP (ZP): 3 bytes
- FT_BASE_ADR (BSS): 186 bytes
- **Total RAM**: 189 bytes

**Validation**:
- [ ] Check .map file for FT_TEMP location
- [ ] Check .map file for FT_BASE_ADR location
- [ ] Verify no overlap with game variables
- [ ] Confirm addresses match Lua script config

**Memory Map Check**:
```
Expected in .map file:
FT_TEMP     = $00E0  (example ZP address)
FT_BASE_ADR = $0300  (example BSS address)
```

**If Failed**:
- Memory conflict with game code
- May cause audio corruption or game bugs
- Relocate one or both to safe RAM area

### ROM Usage
**FamiTone2 Components**:
- Engine code (famitone2.s): ~1,636 bytes
- Music data (stub): ~200-500 bytes (estimated)
- SFX data (stub): ~200-400 bytes (estimated)
- **Total ROM**: ~2,000-2,500 bytes (~6% of 40KB ROM)

**Validation**:
- [ ] ROM size reasonable (~40KB reported)
- [ ] No sudden ROM bloat after audio added
- [ ] Linker doesn't report ROM full/overflow

**If Failed**:
- Actual usage higher than estimated
- May need to optimize audio data
- Consider compression or simpler patterns

---

## Regression Detection

### Before/After Audio Integration
Compare these metrics before and after audio:

| Metric | Pre-Audio (PR #8) | With Audio (Phase 5) | Delta | Status |
|--------|-------------------|----------------------|-------|--------|
| ROM Size | ? | ~40KB | ? | ✓ Expected |
| RAM Free | ? | -189 bytes | -189 | ✓ Expected |
| Base FPS | ~60 | ? | ? | ⚠️ Measure |
| Light Load FPS | ~60 | ? | ? | ⚠️ Measure |
| Heavy Load FPS | ? | ? | ? | ⚠️ Measure |
| VBlank Time | ~1,313 cycles | ? | ? | ⚠️ Critical |

**Action Items**:
- [ ] Measure all "?" values with and without audio
- [ ] Document any regressions
- [ ] Determine if regressions acceptable for MVP
- [ ] Plan optimizations if needed

### Continuous Monitoring
After audio integration:
- [ ] Test daily builds for performance drift
- [ ] Log frame rate metrics automatically (Lua script)
- [ ] Alert if frame rate drops below 50 FPS average
- [ ] Re-profile after any code changes

---

## Optimization Priorities

### If Performance Unacceptable
Priority order for optimization:

1. **Split-Frame Architecture** (Highest Impact)
   - Moves processing out of VBlank
   - Reduces NMI time by ~5,000 cycles
   - Relatively easy to implement

2. **Entity Limit Reduction** (High Impact)
   - Reduce max cells from 16 to 12
   - Reduce max antibodies from 8 to 6
   - Immediate frame rate improvement

3. **Audio Simplification** (Medium Impact)
   - Reduce music complexity (fewer channels)
   - Simplify SFX (shorter durations)
   - Disable noise channel if not critical

4. **Game Logic Optimization** (Variable Impact)
   - Profile entity update code
   - Optimize collision detection
   - Reduce unnecessary calculations

5. **Audio Reduction** (Last Resort)
   - Lower music update rate (every 2nd frame)
   - Reduce SFX priority (skip if busy)
   - Disable audio entirely (not recommended)

### Performance Targets
**Minimum Viable**:
- 45 FPS minimum (playable but choppy)
- Audio functional (even if skips occasionally)
- No crashes or hangs

**Target**:
- 55+ FPS average (smooth gameplay)
- Audio smooth (no noticeable skips)
- Occasional drops acceptable

**Ideal**:
- 60 FPS locked (perfect smoothness)
- Audio perfect (no glitches)
- Headroom for future features

---

## Documentation Updates

### After Performance Testing
Document these findings:
- [ ] Actual cycle counts measured
- [ ] Frame rate under various loads
- [ ] Audio latency measurements
- [ ] Memory usage verified
- [ ] Regression analysis complete

### Report Format
```
AUDIO PERFORMANCE REPORT
Date: YYYY-MM-DD
Build: feature/phase5-audio, commit XXXXXX
Tester: __________

FRAME RATE:
- Idle: XX FPS
- Light Load: XX FPS
- Medium Load: XX FPS
- Heavy Load: XX FPS
- Maximum Stress: XX FPS

AUDIO METRICS:
- APU Write Rate: XX/second
- Channel Utilization: P1:XX% P2:XX% TRI:XX% NOI:XX%
- Audio Latency: X frames
- Loop Boundary: [SEAMLESS/CLICK/GAP]

MEMORY:
- ROM Size: XX KB
- RAM Used: XX bytes ZP, XX bytes BSS
- Memory Map: [OK/CONFLICT]

VBLANK:
- Estimated Cycles: ~XXXX
- Budget Status: [UNDER/OVER] by XXX cycles
- Optimization Needed: [YES/NO]

ISSUES:
- [List any bugs or performance problems]

RECOMMENDATION:
- [PASS / NEEDS OPTIMIZATION / CRITICAL ISSUES]
```

---

## Conclusion

**Mission**: PROVE every performance assumption with measurements.

**Process**:
1. Run all validation tests
2. Measure actual performance
3. Compare to estimates
4. Identify regressions
5. Document findings
6. Optimize if needed

**Success Criteria**:
- All metrics measured and documented
- Performance acceptable for MVP
- No critical performance bugs
- Optimization plan ready if needed

**Current Status**: Awaiting comprehensive emulator testing results.
