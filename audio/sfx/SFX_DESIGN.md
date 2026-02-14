# MITOSIS PANIC - Sound Effects Design Specifications

## Overview
This document provides detailed FamiTracker implementation specs for all game sound effects. Each SFX is designed to be short (<0.3s), use minimal channels, and work with FamiTone2 export.

## SFX 0: CELL MITOSIS (Cell Division)

**Purpose**: Rewarding "split" sound when cell divides
**Duration**: ~0.15 seconds (9 frames @ 60 Hz)
**Channels Used**: Pulse 1, Pulse 2, Triangle

### Pulse 1 (Main Sweep)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | C-4  | F      | 50%  | Portamento up
1     | D-4  | F      | 50%  |
2     | E-4  | E      | 50%  |
3     | G-4  | D      | 50%  |
4     | C-5  | C      | 50%  |
5     | ---  | 8      | 50%  |
6     | ---  | 4      | 50%  |
7     | ---  | 2      | 50%  |
8     | ---  | 0      | 50%  | Note cut
```

### Pulse 2 (Delayed Echo)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | --- | 0      | 50%  |
1     | --- | 0      | 50%  |
2     | --- | 0      | 50%  |
3     | C-4  | E      | 50%  | Portamento up (same as P1)
4     | D-4  | E      | 50%  |
5     | E-4  | D      | 50%  |
6     | G-4  | C      | 50%  |
7     | C-5  | 8      | 50%  |
8     | ---  | 4      | 50%  |
9     | ---  | 0      | 50%  | Note cut
```

### Triangle (Low Pop)
```
Frame | Note | Volume | Effect
------|------|--------|--------
0     | C-2  | F      |
1     | C-2  | E      |
2     | C-2  | 8      |
3     | C-2  | 4      |
4     | ---  | 0      | Note cut
```

**Feel**: Organic bubble splitting, satisfying and rewarding

---

## SFX 1-3: NUTRIENT COLLECTION (3 Variants)

### SFX 1: Nutrient Collection A (Green)
**Duration**: 0.15 seconds (9 frames)
**Channels**: Pulse 1, Triangle

#### Pulse 1 (Ascending Arpeggio)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | E-4  | F      | 25%  |
1     | E-4  | F      | 25%  |
2     | E-4  | E      | 25%  |
3     | G-4  | E      | 25%  |
4     | G-4  | D      | 25%  |
5     | G-4  | D      | 25%  |
6     | C-5  | C      | 25%  |
7     | C-5  | 8      | 25%  |
8     | C-5  | 4      | 25%  |
9     | ---  | 0      | 25%  | Note cut
```

#### Triangle (Bass Note)
```
Frame | Note | Volume | Effect
------|------|--------|--------
0     | C-3  | F      |
1     | C-3  | E      |
2     | C-3  | C      |
3     | C-3  | 8      |
4     | C-3  | 4      |
5     | ---  | 0      | Note cut
```

### SFX 2: Nutrient Collection B (Yellow)
**Duration**: 0.10 seconds (6 frames)
**Channels**: Pulse 1, Triangle

#### Pulse 1 (Single Bright Tone)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | A-4  | F      | 25%  |
1     | A-4  | F      | 25%  |
2     | A-4  | E      | 25%  |
3     | A-4  | C      | 25%  |
4     | A-4  | 8      | 25%  |
5     | A-4  | 4      | 25%  |
6     | ---  | 0      | 25%  | Note cut
```

#### Triangle (Bass Note)
```
Frame | Note | Volume | Effect
------|------|--------|--------
0     | C-3  | F      |
1     | C-3  | E      |
2     | C-3  | 8      |
3     | ---  | 0      | Note cut
```

### SFX 3: Nutrient Collection C (Pink)
**Duration**: 0.12 seconds (7 frames)
**Channels**: Pulse 1, Triangle

#### Pulse 1 (Descending Chirp)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | C-5  | F      | 25%  |
1     | C-5  | F      | 25%  |
2     | B-4  | E      | 25%  |
3     | A-4  | E      | 25%  |
4     | A-4  | D      | 25%  |
5     | A-4  | 8      | 25%  |
6     | A-4  | 4      | 25%  |
7     | ---  | 0      | 25%  | Note cut
```

#### Triangle (Bass Note)
```
Frame | Note | Volume | Effect
------|------|--------|--------
0     | C-3  | F      |
1     | C-3  | E      |
2     | C-3  | 8      |
3     | ---  | 0      | Note cut
```

**Feel**: Cheerful, encouraging collection, variety prevents monotony

---

## SFX 4: ANTIBODY SPAWN WARNING

**Purpose**: Ominous warning when antibody appears
**Duration**: 0.25 seconds (15 frames)
**Channels**: Pulse 2 (to not interrupt melody)

### Pulse 2 (Ominous Pulse)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | F-3  | C      | 50%  |
1     | F-3  | C      | 50%  |
2     | F-3  | C      | 50%  |
3     | ---  | 0      | 50%  |
4     | F-3  | D      | 50%  |
5     | F-3  | D      | 50%  |
6     | F-3  | D      | 50%  |
7     | ---  | 0      | 50%  |
8     | F#3  | E      | 50%  | Slight pitch up (tension)
9     | F#3  | E      | 50%  |
10    | F#3  | E      | 50%  |
11    | F#3  | D      | 50%  |
12    | F#3  | C      | 50%  |
13    | F#3  | 8      | 50%  |
14    | F#3  | 4      | 50%  |
15    | ---  | 0      | 50%  | Note cut
```

**Feel**: Warning, tension, but not overwhelming

---

## SFX 5-6: ANTIBODY HIT (Damage) - Two-Part

### SFX 5: Damage Pulse Sweep
**Duration**: 0.20 seconds (12 frames)
**Channels**: Pulse 1

#### Pulse 1 (Dissonant Falling Sweep)
```
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | A-4  | F      | 75%  | Portamento down (harsh duty)
1     | G-4  | F      | 75%  |
2     | F-4  | E      | 75%  |
3     | E-4  | E      | 75%  |
4     | D-4  | D      | 75%  |
5     | C-4  | D      | 75%  |
6     | B-3  | C      | 75%  |
7     | A-3  | C      | 75%  |
8     | G-3  | 8      | 75%  |
9     | F-3  | 8      | 75%  |
10    | F-3  | 4      | 75%  |
11    | F-3  | 2      | 75%  |
12    | ---  | 0      | 75%  | Note cut
```

### SFX 6: Damage Noise Burst
**Duration**: 0.15 seconds (9 frames)
**Channels**: Noise

#### Noise Channel
```
Frame | Period | Volume | Effect
------|--------|--------|--------
0     | 2      | F      | Short mode (harsh)
1     | 3      | F      |
2     | 4      | E      |
3     | 5      | D      |
4     | 6      | C      |
5     | 7      | A      |
6     | 8      | 8      |
7     | 9      | 4      |
8     | 10     | 2      |
9     | ---    | 0      | Note cut
```

**Implementation Note**: Play both SFX 5 and 6 simultaneously when damage occurs.

**Feel**: Impactful but not gratuitous, arcade-appropriate danger

---

## SFX 7: GAME OVER

**Purpose**: Sad but gentle defeat theme
**Duration**: 2.0 seconds (120 frames)
**Channels**: Pulse 1 (melody), Triangle (bass)

### Pulse 1 (Descending Minor Melody)
```
Measure 1 (Frames 0-29)
Frame | Note | Volume | Duty | Effect
------|------|--------|------|--------
0     | E-4  | E      | 50%  | Half note
15    | D-4  | D      | 50%  | Quarter note
22    | C-4  | D      | 50%  | Quarter note

Measure 2 (Frames 30-59)
30    | B-3  | D      | 50%  | Half note
45    | A-3  | C      | 50%  | Half note

Measure 3 (Frames 60-89)
60    | G-3  | C      | 50%  | Half note
75    | F-3  | B      | 50%  | Quarter note
82    | E-3  | B      | 50%  | Quarter note

Measure 4 (Frames 90-120)
90    | D-3  | B      | 50%  | Half note
105   | C-3  | A      | 50%  | Half note (final)
120   | ---  | 0      | 50%  | Note cut
```

### Triangle (Following Bass)
```
Measure 1
Frame | Note | Effect
------|------|--------
0     | A-2  | Whole note
30    | G-2  | Whole note

Measure 2
60    | F-2  | Whole note

Measure 3
90    | E-2  | Half note
105   | A-2  | Half note (resolve to Am)
120   | ---  | Note cut
```

**Feel**: "The cells didn't make it" - somber but not punishing

---

## FamiTracker Implementation Notes

### General Settings
- **Speed**: 6 (default NTSC, 60 Hz)
- **Tempo**: 150 BPM (for timing calculations)
- **Export**: Use FamiTone2 text export for all effects

### Volume Envelope Guide
```
F = 15 (loudest)
E = 14
D = 13
C = 12
B = 11
A = 10
8 = 8
4 = 4
2 = 2
0 = 0 (silence/cut)
```

### Duty Cycle Selection
- **25%**: Softer, mellow tone (nutrient pickup)
- **50%**: Balanced, standard tone (most effects)
- **75%**: Harsher, more aggressive (damage)

### Testing in FamiTracker
1. Create separate .ftm file for each SFX
2. Test playback to verify timing and feel
3. Export all to single SFX data file for FamiTone2
4. Verify in-game with FamiTone2 test ROM

### Channel Priority
When multiple SFX could play simultaneously:
1. **Highest Priority**: Damage (user needs immediate feedback)
2. **Medium Priority**: Mitosis (key gameplay moment)
3. **Low Priority**: Nutrient collection (frequent, less critical)

## Export Checklist

For FamiTone2 export:
- [ ] All SFX use correct channel assignments
- [ ] No SFX exceeds 0.3 seconds (gameplay flow)
- [ ] Volume envelopes decay properly (no abrupt cuts)
- [ ] Duty cycles chosen for appropriate timbre
- [ ] Game Over SFX includes proper ending
- [ ] All effects tested individually in FamiTracker
- [ ] Combined SFX file exports without errors
- [ ] Assembly data file generated and includes all 8 effects

## Assembly Integration

```assembly
; SFX ID constants (from INTEGRATION_GUIDE.md)
SFX_MITOSIS       = 0   ; Cell division
SFX_NUTRIENT_A    = 1   ; Green nutrient
SFX_NUTRIENT_B    = 2   ; Yellow nutrient
SFX_NUTRIENT_C    = 3   ; Pink nutrient
SFX_ANTIBODY_WARN = 4   ; Antibody spawn
SFX_DAMAGE        = 5   ; Damage pulse sweep
SFX_DAMAGE_NOISE  = 6   ; Damage noise burst
SFX_GAME_OVER     = 7   ; Game over jingle
```

## References
- FamiTracker manual: http://famitracker.com/wiki/
- NES APU reference: https://www.nesdev.org/wiki/APU
- FamiTone2 documentation: http://shiru.untergrund.net/code.shtml
