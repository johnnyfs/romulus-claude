# MITOSIS PANIC - NES Palette Definitions

## NES Palette Reference
The NES PPU has 64 possible colors ($00-$3F). Colors are stored as 6-bit values.

## Game Palettes (Hex Values for PPU Registers)

### SPRITE PALETTES (PPU $3F11-$3F1F)

#### Sprite Palette 0: Player Cell (PPU $3F11-$3F13)
```
$3F10: Universal background (transparent) - typically $21 or $0F
$3F11: $32 - Light cyan (cell membrane outer edge)
$3F12: $12 - Medium blue (cell body/cytoplasm)
$3F13: $02 - Dark blue (nucleus and inner details)
```

#### Sprite Palette 1: Nutrients (PPU $3F15-$3F17)
```
$3F14: (shares $3F10 transparent)
$3F15: $2A - Light green (amino acid particles)
$3F16: $28 - Yellow/amber (glucose particles)
$3F17: $34 - Pink/magenta (vitamin particles)
```

#### Sprite Palette 2: Antibodies (PPU $3F19-$3F1B)
```
$3F18: (shares $3F10 transparent)
$3F19: $16 - Bright red (antibody main body)
$3F1A: $06 - Dark red (antibody details/shading)
$3F1B: $30 - White (aggressive highlights/eyes)
```

#### Sprite Palette 3: UI/Effects (PPU $3F1D-$3F1F)
```
$3F1C: (shares $3F10 transparent)
$3F1D: $30 - White (UI text, score digits)
$3F1E: $21 - Light blue (effect highlights)
$3F1F: $0F - Black (UI shadows/outlines)
```

### BACKGROUND PALETTES (PPU $3F01-$3F0F)

#### Background Palette 0: Petri Dish Arena (PPU $3F01-$3F03)
```
$3F00: $21 - Medium blue (universal BG color, culture medium base)
$3F01: $11 - Dark blue/purple (gradient, deeper medium)
$3F02: $01 - Very dark blue (depth, shadows)
$3F03: $31 - Light blue/cyan (highlights, reflections)
```

#### Background Palette 1: Arena Rim (PPU $3F05-$3F07)
```
$3F04: (shares $3F00)
$3F05: $30 - White/light gray (lab equipment surface)
$3F06: $20 - Medium gray (equipment shading)
$3F07: $10 - Dark gray (equipment shadows)
```

#### Background Palette 2: UI Backgrounds (PPU $3F09-$3F0B)
```
$3F08: (shares $3F00)
$3F09: $30 - White (UI panel text)
$3F0A: $12 - Medium blue (UI accents)
$3F0B: $02 - Dark blue (UI borders)
```

#### Background Palette 3: Grid/Measurement (PPU $3F0D-$3F0F)
```
$3F0C: (shares $3F00)
$3F0D: $31 - Light cyan (grid lines)
$3F0E: $11 - Dark blue (subtle grid)
$3F0F: $00 - Black (measurement marks)
```

## Assembly Data Format

```asm6502
; Palette data for initialization
palette_data:
    ; Background palettes ($3F00-$3F0F)
    .db $21, $11, $01, $31  ; BG Palette 0: Petri dish
    .db $21, $30, $20, $10  ; BG Palette 1: Arena rim
    .db $21, $30, $12, $02  ; BG Palette 2: UI backgrounds
    .db $21, $31, $11, $00  ; BG Palette 3: Grid lines

    ; Sprite palettes ($3F10-$3F1F)
    .db $21, $32, $12, $02  ; SP Palette 0: Player cell
    .db $21, $2A, $28, $34  ; SP Palette 1: Nutrients
    .db $21, $16, $06, $30  ; SP Palette 2: Antibodies
    .db $21, $30, $21, $0F  ; SP Palette 3: UI/Effects

palette_data_end:
```

## Color Descriptions (for reference)

### Blues (cell theme)
- `$01` - Very dark blue/indigo
- `$02` - Dark blue
- `$11` - Dark blue-purple
- `$12` - Medium blue
- `$21` - Light blue (main background)
- `$31` - Light cyan
- `$32` - Very light cyan

### Greens (nutrients)
- `$2A` - Light green (amino acids)

### Yellows (nutrients)
- `$28` - Yellow/amber (glucose)

### Reds (enemies)
- `$06` - Dark red
- `$16` - Bright red

### Purples/Pinks (nutrients)
- `$34` - Pink/magenta (vitamins)

### Grayscale (UI, equipment)
- `$00` - Black/very dark gray
- `$0F` - True black
- `$10` - Dark gray
- `$20` - Medium gray
- `$30` - White/light gray

## Visual Appearance

### Player Cell (Palette 0)
Vibrant cyan blob with visible internal structure:
- Outer membrane: bright cyan glow ($32)
- Body: solid medium blue ($12)
- Nucleus: dark blue core ($02)
Creates a friendly, organic look

### Nutrients (Palette 1)
Three distinct particle types that pop visually:
- Green orbs: clearly "healthy" amino acids
- Yellow orbs: energetic glucose
- Pink orbs: special vitamins
High contrast against blue background

### Antibodies (Palette 2)
Menacing red enemies with white highlights:
- Bright red ($16) makes them immediately dangerous
- Dark red ($06) adds depth/shading
- White highlights ($30) create aggressive "eyes" or glints

### Arena
Scientific petri dish aesthetic:
- Blue-purple gradient creates depth
- White rim evokes lab equipment
- Grid lines add scientific credibility
- Overall: immersive microscopic environment

## Technical Notes

### Palette Limitations
- Only 4 colors per sprite (including transparent)
- Only 4 colors per background tile
- Sprites share color $00 (universal transparent)
- Backgrounds share color $00 (universal BG)

### Color Choice Rationale
1. **High contrast**: All elements clearly visible
2. **Thematic consistency**: Blues = organic/friendly, Reds = danger
3. **Readability**: White UI text on dark backgrounds
4. **NES authenticity**: Classic NES color choices that feel arcade-appropriate

### Palette Swapping
Future enhancements could include:
- Difficulty-based palette shifts (redder = harder)
- Player color customization (swap palette 0)
- Boss battle palette changes for atmosphere

## Integration Constants

```asm6502
; Palette constants for code
PALETTE_BG_DISH     = $00
PALETTE_BG_RIM      = $01
PALETTE_BG_UI       = $02
PALETTE_BG_GRID     = $03

PALETTE_SP_PLAYER   = $00
PALETTE_SP_NUTRIENT = $01
PALETTE_SP_ANTIBODY = $02
PALETTE_SP_UI       = $03
```

## References
- NES PPU palette: https://www.nesdev.org/wiki/PPU_palettes
- Sprite specifications: `assets/specs/sprite_specs.md`
- CHR tile map: `graphics/CHR_MAP.md`
