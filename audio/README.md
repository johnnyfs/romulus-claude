# MITOSIS PANIC - Audio Assets

## Directory Structure

```
audio/
├── README.md                   # This file
├── INTEGRATION_GUIDE.md        # FamiTone2 assembly integration docs
├── music/                      # Background music assets
│   ├── MUSIC_DESIGN.md        # Detailed music composition specs
│   └── cellular_division.ftm  # FamiTracker project (main theme)
├── sfx/                        # Sound effects
│   ├── SFX_DESIGN.md          # Detailed SFX specifications
│   └── game_sfx.ftm           # FamiTracker project (all SFX)
├── engine/                     # FamiTone2 engine files
│   └── famitone2.s            # FamiTone2 engine for CA65 (to be added)
└── exports/                    # Converted audio data for assembly
    ├── music_data.s           # Exported music data (FamiTone2 format)
    └── sfx_data.s             # Exported SFX data (FamiTone2 format)
```

## Quick Start for Chief Engineer

### 1. Include FamiTone2 Engine

Add to your main assembly file:

```assembly
.include "audio/engine/famitone2.s"
```

### 2. Reserve Memory

```assembly
.segment "ZEROPAGE"
FT_TEMP: .res 3

.segment "BSS"
FT_BASE_ADR: .res 186
```

### 3. Initialize in Game Startup

```assembly
    ; Initialize FamiTone2
    lda #0                      ; NTSC mode
    ldx #<music_data
    ldy #>music_data
    jsr FamiToneInit

    ; Initialize SFX
    ldx #<sfx_data
    ldy #>sfx_data
    jsr FamiToneSfxInit

    ; Start music
    lda #0                      ; Track 0 = main theme
    jsr FamiToneMusicPlay
```

### 4. Update in NMI Handler

```assembly
NMI:
    ; ... your existing NMI code ...
    jsr FamiToneUpdate          ; Call every frame
    ; ... rest of NMI code ...
    rti
```

### 5. Play Sound Effects

```assembly
; Example: Play mitosis SFX when cell divides
    lda #SFX_MITOSIS           ; Effect ID (see constants below)
    ldx #FT_SFX_CH0            ; Channel: Pulse 1
    jsr FamiToneSfxPlay
```

## Sound Effect Constants

```assembly
; Define these in your constants file
SFX_MITOSIS       = 0   ; Cell division
SFX_NUTRIENT_A    = 1   ; Green nutrient
SFX_NUTRIENT_B    = 2   ; Yellow nutrient
SFX_NUTRIENT_C    = 3   ; Pink nutrient
SFX_ANTIBODY_WARN = 4   ; Antibody spawn
SFX_DAMAGE        = 5   ; Damage pulse
SFX_DAMAGE_NOISE  = 6   ; Damage noise
SFX_GAME_OVER     = 7   ; Game over jingle

; Channel constants
FT_SFX_CH0 = 0  ; Pulse 1
FT_SFX_CH1 = 1  ; Pulse 2
FT_SFX_CH2 = 2  ; Triangle
FT_SFX_CH3 = 3  ; Noise
```

## Music Track Constants

```assembly
MUSIC_MAIN_THEME  = 0   ; "Cellular Division" - main gameplay
MUSIC_FAST_THEME  = 1   ; Fast variant (optional, future)
```

## Files to Download

### Required External Files
The following files need to be obtained from FamiTone2 distribution:

1. **famitone2.s** - CA65 version of FamiTone2 engine
   - Download from: http://shiru.untergrund.net/code.shtml
   - Place in: `audio/engine/`
   - Or use the NESASM version and convert using nesasmc

2. **FamiTracker** - Music composition tool
   - Download from: http://famitracker.com/
   - Used to create .ftm files

3. **text2data** or **nsf2data** - FamiTone2 converter
   - Download from: http://shiru.untergrund.net/software.shtml
   - Converts .ftm → .s assembly data files

## Asset Creation Workflow

### For Sound Effects
1. Open FamiTracker
2. Create new project (NTSC, 2A03 only)
3. Define instruments (see sfx/SFX_DESIGN.md)
4. Compose each SFX in separate patterns (following specs)
5. Export as .nsf
6. Convert to FamiTone2 format:
   ```
   text2data game_sfx.nsf
   ```
7. Place resulting .s file in `exports/sfx_data.s`

### For Music
1. Open FamiTracker
2. Create new project (NTSC, 2A03 only, speed 6, tempo 140)
3. Define instruments (see music/MUSIC_DESIGN.md)
4. Compose main theme following specs (32 bars, ABAB' structure)
5. Set loop point at frame 0
6. Export as .nsf
7. Convert to FamiTone2 format:
   ```
   text2data cellular_division.nsf
   ```
8. Place resulting .s file in `exports/music_data.s`

## Documentation Files

- **INTEGRATION_GUIDE.md** - Complete FamiTone2 assembly integration reference
- **music/MUSIC_DESIGN.md** - Bar-by-bar music composition specifications
- **sfx/SFX_DESIGN.md** - Frame-by-frame SFX design specifications

## Testing

### In FamiTracker
- Play each SFX individually to verify timing and feel
- Loop music multiple times to check for seamless loop point
- Test all channels together for balance

### In Emulator
- Build ROM with audio code integrated
- Verify all SFX play correctly when triggered
- Check music loops without glitches
- Test SFX channel interruption and resumption
- Monitor CPU usage (should be <20% total including game logic)

### Recommended Emulators
- **FCEUX** - Good all-around, debugging tools
- **Mesen** - Excellent accuracy, audio visualization
- **Nestopia** - High accuracy

## Current Status

### Completed ✓
- [x] FamiTone2 research and documentation
- [x] Audio directory structure created
- [x] Integration guide written
- [x] SFX design specifications completed
- [x] Music design specifications completed
- [x] Assembly API documented

### Pending ⏳
- [ ] Download FamiTone2 engine files
- [ ] Create actual .ftm files in FamiTracker
- [ ] Export and convert to FamiTone2 format
- [ ] Test in-game with Chief Engineer's ROM
- [ ] Fine-tune SFX timing based on gameplay feel
- [ ] Create fast music variant (optional)

## Integration Timeline

1. **Phase 5 Pre-requisite**: Chief Engineer needs Phase 2 (rendering system) complete
2. **Audio Asset Creation**: Create .ftm files (parallel work, can start now)
3. **Engine Integration**: Add FamiTone2 to build system
4. **Initial Testing**: Basic music playback
5. **SFX Integration**: Hook up all game events to appropriate SFX
6. **Tuning**: Adjust volumes, timing, channel priority
7. **Polish**: Final balance and seamless experience

## Questions or Issues?

Contact **Audio Engineer** (this agent) or **Chief Engineer** for integration support.

See INTEGRATION_GUIDE.md for detailed technical information.
