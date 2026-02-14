# MITOSIS PANIC - FamiTone2 Audio Integration Guide

## Overview
This document describes how to integrate the FamiTone2 sound engine into the MITOSIS PANIC NES game using cc65/CA65 assembly.

## FamiTone2 Sound Engine
**Version**: FamiTone2 (by Shiru)
**License**: Free for non-commercial and commercial use
**Documentation**: https://shiru.untergrund.net/code.shtml

### Features
- Music playback from FamiTracker .ftm files
- Sound effects with channel priority system
- Support for all 2A03 channels (2x Pulse, Triangle, Noise, DPCM)
- Low memory footprint (186 bytes RAM, 3 bytes ZP)
- Minimal CPU usage (~11% peak)

## Memory Requirements

### RAM Usage
```
FT_TEMP:        .res 3   ; Zero page temporary variables
FT_BASE_ADR:    .res 186 ; Main RAM for music/SFX state
```

### ROM Usage
- Engine code: ~1,636 bytes
- Music data: varies (typically 2-4 KB per song)
- SFX data: varies (typically 512 bytes - 2 KB total)

### DPCM Samples
- Must be located at $C000 or higher
- Must be 64-byte aligned
- Max total size: ~12 KB (if used)

## Integration Steps

### 1. Include FamiTone2 Engine

Add to your main assembly file (game.s or similar):

```assembly
; Include FamiTone2 engine for CA65
.include "famitone2.s"

; Or link as separate object file
.import FamiToneInit
.import FamiToneUpdate
.import FamiToneMusicPlay
.import FamiToneMusicStop
.import FamiToneSfxInit
.import FamiToneSfxPlay
```

### 2. Configuration

Before including, define these symbols:

```assembly
; Configure FamiTone2
FT_PAL_SUPPORT    = 0      ; 0 = NTSC only, 1 = PAL support
FT_SFX_STREAMS    = 4      ; Number of simultaneous SFX (1-4)
FT_THREAD         = 1      ; Thread-safe mode if needed
FT_DPCM_ENABLE    = 0      ; 0 = no samples (saves ROM)
FT_DPCM_OFF       = $c000  ; DPCM data location (if enabled)

; Reserve RAM
.segment "ZEROPAGE"
FT_TEMP: .res 3

.segment "BSS"
FT_BASE_ADR: .res 186
```

### 3. Initialize Audio System

Call during game initialization (after PPU setup, before main loop):

```assembly
; Initialize FamiTone2
    lda #0              ; 0 = NTSC, 1 = PAL
    ldx #<music_data    ; Low byte of music data address
    ldy #>music_data    ; High byte of music data address
    jsr FamiToneInit

; Initialize sound effects
    ldx #<sfx_data      ; Low byte of SFX data address
    ldy #>sfx_data      ; High byte of SFX data address
    jsr FamiToneSfxInit

; Start background music
    lda #0              ; Song number (0 = first song)
    jsr FamiToneMusicPlay
```

### 4. Update Audio Every Frame

Call in your NMI handler (VBlank routine):

```assembly
NMI:
    ; ... save registers, acknowledge NMI ...

    jsr FamiToneUpdate  ; Update music and SFX

    ; ... other NMI tasks ...
    rti
```

### 5. Play Sound Effects

Call when events occur (mitosis, collection, damage, etc.):

```assembly
; Play mitosis SFX on pulse channel 1
    lda #SFX_MITOSIS    ; Sound effect ID (0-63)
    ldx #FT_SFX_CH0     ; Channel: 0=Pulse1, 1=Pulse2, 2=Triangle, 3=Noise
    jsr FamiToneSfxPlay

; Play nutrient collection SFX (3 variants)
    lda collected_color ; Get nutrient type (0-2)
    clc
    adc #SFX_NUTRIENT_A ; Add to base SFX ID
    ldx #FT_SFX_CH0     ; Pulse 1
    jsr FamiToneSfxPlay

; Play damage SFX on multiple channels
    lda #SFX_DAMAGE
    ldx #FT_SFX_CH0     ; Pulse 1 (dissonant sweep)
    jsr FamiToneSfxPlay
    lda #SFX_DAMAGE_NOISE
    ldx #FT_SFX_CH3     ; Noise channel
    jsr FamiToneSfxPlay
```

## API Reference

### Core Functions

#### FamiToneInit
**Purpose**: Initialize the sound engine
**Parameters**:
- A = System (0 = NTSC, non-zero = PAL)
- X = Low byte of music data pointer
- Y = High byte of music data pointer

**Call Once**: During game initialization

#### FamiToneUpdate
**Purpose**: Update music and SFX state
**Parameters**: None
**Call Every**: VBlank/NMI (60 Hz for NTSC)
**CPU Cost**: ~11% worst case

#### FamiToneMusicPlay
**Purpose**: Start playing a music track
**Parameters**:
- A = Song number (0-255, from FamiTracker export)

#### FamiToneMusicStop
**Purpose**: Stop music playback
**Parameters**: None

#### FamiToneMusicPause
**Purpose**: Pause/unpause music
**Parameters**:
- A = 0 (unpause) or non-zero (pause)

#### FamiToneSfxInit
**Purpose**: Initialize sound effects system
**Parameters**:
- X = Low byte of SFX data pointer
- Y = High byte of SFX data pointer

**Call Once**: During game initialization (after FamiToneInit)

#### FamiToneSfxPlay
**Purpose**: Play a sound effect
**Parameters**:
- A = Effect number (0-63)
- X = Channel (0=Pulse1, 1=Pulse2, 2=Triangle, 3=Noise)

**Notes**: SFX will interrupt music on the specified channel temporarily

## Channel Assignment for MITOSIS PANIC

### During Gameplay

| Channel | Primary Use | SFX Priority |
|---------|-------------|--------------|
| Pulse 1 | Music melody | HIGH - Mitosis, Nutrient collection |
| Pulse 2 | Music harmony | MEDIUM - Antibody spawn warning |
| Triangle | Bass line | LOW - Occasional low rumbles |
| Noise | Percussion | HIGH - Damage effects |

### SFX Channel Strategy
- **Short SFX** (<0.2s): Play on Pulse 1 (interrupts music briefly)
- **Medium SFX** (0.2-0.5s): Play on Pulse 2 (less noticeable interruption)
- **Continuous tones**: Avoid - use very short looping SFX instead
- **Damage/Impact**: Noise channel (doesn't interrupt melody)

## Sound Effect ID Map

Define these constants in your assembly code:

```assembly
; SFX IDs (0-63 available)
SFX_MITOSIS       = 0   ; Cell division (Pulse 1 + Triangle)
SFX_NUTRIENT_A    = 1   ; Green nutrient pickup (Pulse 1)
SFX_NUTRIENT_B    = 2   ; Yellow nutrient pickup (Pulse 1)
SFX_NUTRIENT_C    = 3   ; Pink nutrient pickup (Pulse 1)
SFX_ANTIBODY_WARN = 4   ; Antibody spawn warning (Pulse 2)
SFX_DAMAGE        = 5   ; Damage pulse sweep (Pulse 1)
SFX_DAMAGE_NOISE  = 6   ; Damage noise burst (Noise)
SFX_GAME_OVER     = 7   ; Game over jingle (Multi-channel)
```

## Music Track Map

```assembly
; Music track IDs
MUSIC_MAIN_THEME  = 0   ; "Cellular Division" - main gameplay
MUSIC_FAST_THEME  = 1   ; Fast variant (optional, for later levels)
```

## Asset Export Workflow

### From FamiTracker to FamiTone2

1. **Create music/SFX in FamiTracker** (audio/music/*.ftm, audio/sfx/*.ftm)
2. **Export using FamiTone2 text export**:
   - File → Create NSF...
   - Use text2data.exe or online converter
3. **Include in assembly**:
   ```assembly
   .segment "RODATA"
   music_data:
       .include "audio/exports/music_data.s"

   sfx_data:
       .include "audio/exports/sfx_data.s"
   ```
4. **Reference in build**: Add to Makefile/build script

### Tools Needed
- **FamiTracker** (or 0CC-FamiTracker): Music composition
- **text2data** (or nsf2data): FamiTone2 data conversion
- Available at: http://shiru.untergrund.net/software.shtml

## Testing Checklist

- [ ] Music plays correctly after initialization
- [ ] Music loops smoothly at end of track
- [ ] SFX play on correct channels
- [ ] SFX don't crash when played simultaneously
- [ ] Music resumes properly after SFX interruption
- [ ] No audio glitches during gameplay
- [ ] CPU usage stays under 20% total (audio + game logic)
- [ ] Audio works in FCEUX, Mesen, and real hardware (if testing)

## Performance Notes

- FamiToneUpdate takes ~6000 CPU cycles worst case (~11% frame time)
- Keep music patterns simple to reduce update time
- Limit simultaneous SFX to 2-3 for best performance
- DPCM samples significantly increase ROM size - use sparingly
- Consider music ducking: pause music during important multi-channel SFX

## Troubleshooting

### No Audio Output
- Check FamiToneUpdate is called every frame in NMI
- Verify music/SFX data pointers are correct
- Ensure APU registers are not being overwritten elsewhere

### Audio Glitches
- Reduce FT_SFX_STREAMS if CPU load is too high
- Check for conflicts with other code writing to APU registers
- Verify SFX channel assignments don't conflict

### Music Doesn't Loop
- Check FamiTracker loop point is set correctly
- Verify export includes loop information

### SFX Cut Off Prematurely
- Check channel priority settings
- Ensure new SFX aren't overriding important ones
- Consider longer decay envelopes

## References

- FamiTone2 official page: http://shiru.untergrund.net/code.shtml
- NESdev Wiki Audio: https://www.nesdev.org/wiki/APU
- FamiTracker: http://famitracker.com/
- cc65 documentation: https://cc65.github.io/

## Contact

For integration questions, coordinate with **Chief Engineer** who is implementing the main assembly code.
