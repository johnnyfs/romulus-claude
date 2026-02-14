# MITOSIS PANIC - Background Music Design

## Main Theme: "Cellular Division"

### Overview
**Style**: Upbeat arcade energy with organic, biological character
**Reference**: Dr. Mario (medical theme) + Pac-Man (arcade energy) + Bubble Bobble (playful)
**Tempo**: 140 BPM (upbeat arcade pace)
**Key**: C Major (bright, accessible)
**Structure**: 32-bar loop (A-B-A-B')
**Feel**: Engaging and fun, not scary despite biological theme

### Technical Parameters
- **FamiTracker Speed**: 6 (NTSC default)
- **FamiTracker Tempo**: 140 BPM
- **Total Duration**: ~13.7 seconds per loop
- **Channels Used**: Pulse 1, Pulse 2, Triangle, Noise
- **Loop Point**: End of bar 32 returns to bar 1

---

## Section A: Primary Melody (Bars 1-8)

### Pulse 1 - Main Melody
**Duty Cycle**: 25% (softer, organic tone)
**Character**: Bouncy 8th note patterns with biological "burbling" feel

```
Bar 1-2 (C Major motif - ascending)
| C-4 D-4 E-4 G-4 | E-4 D-4 C-4 E-4 |

Bar 3-4 (Variation with stepwise motion)
| D-4 E-4 F-4 A-4 | G-4 F-4 E-4 D-4 |

Bar 5-6 (Return to tonic, build energy)
| C-4 E-4 G-4 C-5 | B-4 A-4 G-4 E-4 |

Bar 7-8 (Phrase ending, prepare for repeat/transition)
| F-4 E-4 D-4 C-4 | D-4 D-4 E-4 --- |
```

**Rhythm Pattern**:
- Predominantly 8th notes with occasional quarter note emphasis
- Slight swing timing (delay even 8th notes by 1 tick) for organic feel
- Use short articulation (note length ~80% of duration)

### Pulse 2 - Harmony/Countermelody
**Duty Cycle**: 50% (balanced tone)
**Function**: Harmonic support in 3rds and 6ths above melody

```
Bar 1-2 (Harmonize in 3rds)
| E-4 F-4 G-4 B-4 | G-4 F-4 E-4 G-4 |

Bar 3-4 (Harmonize in 6ths)
| B-4 C-5 D-5 F-5 | E-5 D-5 C-5 B-4 |

Bar 5-6 (Mix of 3rds and 6ths)
| E-4 G-4 B-4 E-5 | D-5 C-5 B-4 G-4 |

Bar 7-8 (Countermelody)
| A-4 G-4 F-4 E-4 | F-4 F-4 G-4 --- |
```

### Triangle - Bass Line
**Function**: Walking bass pattern following chord changes

```
Chord Progression: C - F - G - C (classic I-IV-V-I)

Bar 1-2 (C chord)
| C-2 . E-2 . | G-2 . E-2 . |

Bar 3-4 (F to G)
| F-2 . A-2 . | G-2 . B-2 . |

Bar 5-6 (C to Am)
| C-2 . E-2 . | A-2 . C-3 . |

Bar 7-8 (G to C - dominant resolution)
| G-2 . B-2 . | C-2 . . . |
```

**Notes**:
- "." represents rest/held note
- Mainly quarter notes with occasional 8th note walks
- Root-fifth-third arpeggiation for movement

### Noise - Percussion
**Function**: Light hi-hat pattern on off-beats

```
Pattern (repeats every 2 bars):
Frame:  0   4   8   12  16  20  24  28
        .   X   .   X   .   X   .   X

X = Hi-hat hit (period 1-2, volume 6-8, short decay)
. = Rest
```

**Settings**:
- Period: 1-2 (short, high-pitched)
- Volume: 6-8 (subtle, not overpowering)
- Pattern: Off-beats only (creates swing feel)

---

## Section B: Development (Bars 9-16)

### Pulse 1 - Higher Register (Urgency)
**Duty Cycle**: 25%
**Character**: Move up an octave, more active rhythm

```
Bar 9-10 (Higher energy)
| G-4 A-4 B-4 D-5 | C-5 B-4 A-4 G-4 |

Bar 11-12 (Peak of phrase)
| A-4 B-4 C-5 E-5 | D-5 C-5 B-4 A-4 |

Bar 13-14 (Tension)
| E-5 D-5 C-5 B-4 | A-4 G-4 F-4 E-4 |

Bar 15-16 (Prepare return to A)
| D-4 E-4 F-4 G-4 | A-4 B-4 C-5 --- |
```

### Pulse 2 - Rhythmic Staccato
**Duty Cycle**: 50%
**Character**: Short, punctuated accompaniment

```
Bar 9-10 (Rhythmic pattern)
| G-3 . G-3 . | G-3 . G-3 . |

Bar 11-12 (Variation)
| F-3 . F-3 . | F-3 . F-3 . |

Bar 13-14 (Build)
| E-3 . E-3 . | D-3 . D-3 . |

Bar 15-16 (Transition chord)
| G-3 . G-3 . | G-3 G-3 G-3 --- |
```

**Notes**: Short, detached notes (25% length), creates urgency

### Triangle - Active Bass (Arpeggiated)
**Character**: More movement, arpeggiated patterns

```
Bar 9-10 (G chord arpeggio)
| G-2 B-2 D-3 B-2 | G-2 B-2 D-3 B-2 |

Bar 11-12 (F chord arpeggio)
| F-2 A-2 C-3 A-2 | F-2 A-2 C-3 A-2 |

Bar 13-14 (Am to Em progression)
| A-2 C-3 E-3 C-3 | E-2 G-2 B-2 G-2 |

Bar 15-16 (G dominant - prepare return)
| G-2 B-2 D-3 G-3 | G-2 . . . |
```

### Noise - More Active Hi-Hats
**Function**: Increase rhythmic density

```
Pattern (faster hi-hats):
Frame:  0   2   4   6   8   10  12  14  16  18  20  22  24  26  28  30
        .   X   .   X   .   X   .   X   .   X   .   X   .   X   .   X

Slightly louder (volume 8-A) to match energy increase
```

---

## Section A' (Return): Bars 17-24

**Implementation**: Identical to original Section A (bars 1-8)
- Creates familiar callback
- Provides rest from higher energy of Section B
- Reinforces main melodic hook

---

## Section B': Variation & Loop Preparation (Bars 25-32)

### Pulse 1 - Melody with Trill Ornaments
**Duty Cycle**: 25%
**Character**: Decorated variation of Section A melody

```
Bar 25-26 (Trills added to original melody)
| C-4~D-4 E-4 G-4 | E-4~F-4 D-4 C-4 |

Bar 27-28 (Ornamental variation)
| D-4 E-4~F-4 A-4 | G-4 F-4 E-4~D-4 |

Bar 29-30 (Build to climax before breakdown)
| C-4 E-4 G-4 C-5 | E-5 D-5 C-5 B-4 |

Bar 31-32 (BREAKDOWN - prepare loop)
| --- --- --- --- | --- --- --- --- |
```

**Notes**:
- "~" indicates fast trill/grace note
- Bars 31-32 are silent from Pulse 1 (breakdown)

### Pulse 2 - Fill Pattern During Breakdown
**Duty Cycle**: 50%

```
Bar 25-30 (Support melody as in Section A)
[Same harmony pattern as Section A]

Bar 31-32 (SILENT during breakdown)
| --- --- --- --- | --- --- --- --- |
```

### Triangle - Walking Bass + Breakdown Lead-in
**Character**: Active walking bass, leads cleanly back to C for loop

```
Bar 25-26 (C chord)
| C-2 E-2 G-2 E-2 | C-2 E-2 G-2 E-2 |

Bar 27-28 (F to G)
| F-2 A-2 C-3 A-2 | G-2 B-2 D-3 B-2 |

Bar 29-30 (Build to C)
| C-2 E-2 G-2 C-3 | E-3 D-3 C-3 B-2 |

Bar 31-32 (BREAKDOWN - triangle + noise only)
| C-2 . G-2 . | C-2 . . . |
```

**Notes**: Triangle remains active during breakdown for bass continuity

### Noise - Breakdown Pattern
**Function**: Continue light percussion during breakdown

```
Bar 25-30 (Standard pattern)
[Same as Section A pattern]

Bar 31-32 (Simplified - quarter notes only)
Frame:  0       8       16      24
        X       .       X       .

Creates space and prepares for clean loop restart
```

---

## Loop Point

**Technical Implementation**:
- Set FamiTracker loop point at frame 0 of bar 1
- Last note of bar 32 should lead smoothly to first note of bar 1
- Test loop several times to ensure no glitches or timing issues
- Triangle's final C-2 provides strong tonal resolution

---

## Channel Ducking During Gameplay

### When SFX Play
- **Short SFX (<0.2s)**: Brief interruption acceptable, music resumes
- **Medium SFX (0.2-0.5s)**: Consider pausing affected channel momentarily
- **Multi-channel SFX (damage)**: May interrupt multiple channels briefly

### Priority System
1. Damage SFX (highest priority - user feedback critical)
2. Mitosis SFX (medium-high - key gameplay moment)
3. Background music (medium - can be briefly interrupted)
4. Nutrient SFX (medium-low - frequent, short)

### Implementation Note
FamiTone2 handles channel interruption automatically. Music will resume on affected channels when SFX completes.

---

## Optional Fast Variant (Future Enhancement)

**Purpose**: Increase tension during high-speed gameplay
**Changes from Main Theme**:
- Tempo: 160 BPM (was 140 BPM)
- Noise: More aggressive patterns (16th notes on some bars)
- Pulse 2: Faster rhythmic patterns, more staccato
- Same melody and structure, just faster

**Implementation**: Create as separate music track (index 1) in FamiTracker

---

## FamiTracker Project Setup

### General Settings
- **Machine**: NTSC (default)
- **Speed**: 6
- **Tempo**: 140 BPM
- **Expansion**: None (2A03 only)
- **Vibrato**: New style

### Instrument Definitions

#### Pulse Instruments
**Instrument 00 - Pulse Lead (25% duty)**
- Volume envelope: 15-14-13-12-11-10-9-8-7-6 (sustain)
- Duty: 0 (25%)
- No pitch envelope

**Instrument 01 - Pulse Harmony (50% duty)**
- Volume envelope: 13-12-11-10-9-8-7-6 (sustain)
- Duty: 1 (50%)
- No pitch envelope

**Instrument 02 - Pulse Staccato (50% duty)**
- Volume envelope: 15-12-8-4-2-0 (quick decay)
- Duty: 1 (50%)
- No pitch envelope

#### Triangle Instrument
**Instrument 10 - Triangle Bass**
- Volume: Max (triangle has no volume control, just on/off)
- Linear counter controls note length

#### Noise Instrument
**Instrument 20 - Hi-Hat**
- Volume envelope: 8-6-4-2-0 (quick decay)
- Period: 1-2 (high pitched)
- Short mode

### Export Settings
- Format: FamiTone2 text export
- Include DPCM: No (unless adding samples later)
- Export song: All (Main theme = index 0, Fast variant = index 1)

---

## Testing Checklist

- [ ] Melody is memorable and doesn't grate after 5+ loops
- [ ] Harmony complements without clashing
- [ ] Bass line provides solid foundation
- [ ] Percussion is subtle but adds energy
- [ ] Loop point is seamless (no clicks or gaps)
- [ ] Music doesn't overpower SFX in gameplay
- [ ] All channels work together cohesively
- [ ] Tempo feels appropriate for arcade gameplay
- [ ] Biological/organic character comes through
- [ ] Upbeat energy is maintained throughout

---

## Assembly Integration

```assembly
; Music track constants
MUSIC_MAIN_THEME  = 0   ; "Cellular Division" 140 BPM
MUSIC_FAST_THEME  = 1   ; Fast variant 160 BPM (optional)

; Play main theme at game start
    lda #MUSIC_MAIN_THEME
    jsr FamiToneMusicPlay

; Switch to fast theme at level 5+ (example)
    lda current_level
    cmp #5
    bcc @skip_fast_music
    lda #MUSIC_FAST_THEME
    jsr FamiToneMusicPlay
@skip_fast_music:
```

---

## References
- Audio specs: /assets/specs/audio_specs.md
- Integration guide: /audio/INTEGRATION_GUIDE.md
- FamiTracker: http://famitracker.com/
- FamiTone2: http://shiru.untergrund.net/code.shtml
