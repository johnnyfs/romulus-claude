# MITOSIS PANIC - NES Sprite Specifications

## Art Direction
**Theme**: Vibrant microscopic world - scientific but arcade-friendly
**Palette**: Organic blues/greens/purples for friendly elements, red/orange for threats
**Style**: Clear, readable, expressive within NES limitations

## NES Technical Constraints
- Sprites: 8x8 or 8x16 pixels
- 4 colors per sprite (including transparent)
- Maximum 54 colors in NES palette
- 8 sprites per scanline maximum

## Sprite Designs

### 1. PLAYER CELL (16x16, using 4x 8x8 tiles)
**Design**: Round cellular blob with nucleus visible in center
- Color 1 (transparent): Background
- Color 2: Light cyan/blue (cell membrane)
- Color 3: Medium blue (cell body)
- Color 4: Dark blue (nucleus)
**Animation**: Slight pulsing/wobbling effect
**Mitosis visual**: When dividing, sprite splits with visible membrane stretch

### 2. NUTRIENT PARTICLES (8x8)
**Design**: Small organic spheres, 3 variants
- Variant A: Green spheres (amino acids)
- Variant B: Yellow spheres (glucose)
- Variant C: Pink spheres (vitamins)
Each uses 3 colors + transparency, simple circular design

### 3. ANTIBODY ENEMIES (16x16)
**Design**: Y-shaped immune cells with menacing appearance
- Color 1 (transparent): Background
- Color 2: Bright red (antibody body)
- Color 3: Dark red (antibody details)
- Color 4: White (highlights for aggression)
**Animation**: Rotating/seeking motion toward player

### 4. PETRI DISH ARENA
**Background**: Single screen circular arena
- Outer ring: Gray/white lab equipment aesthetic
- Inner field: Subtle blue-purple gradient (culture medium)
- Grid lines: Faint measurement marks (scientific feel)

### 5. UI ELEMENTS
**Score Display**: Top-left, white numbers on dark background
**Cell Count Indicator**: Shows how many cells player is controlling (increases with mitosis)
**Lives**: Cell icons in top-right
**Difficulty Meter**: Visual indicator of game speed

## Color Palette (NES hex codes)
- Cell Blue: $32 (light cyan), $12 (medium blue), $02 (dark blue)
- Nutrient colors: $2A (green), $28 (yellow), $34 (pink)
- Antibody Red: $16 (bright red), $06 (dark red), $30 (white)
- Background: $21 (medium blue), $11 (dark blue/purple)
- UI: $30 (white), $0F (black)
