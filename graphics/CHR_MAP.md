# MITOSIS PANIC - CHR Tile Map Documentation

## CHR File Structure
**File**: `graphics/game.chr`
**Size**: 8192 bytes (8KB = 512 tiles)
**Format**: NES CHR ROM (2 bitplanes per tile, 16 bytes per 8x8 tile)

## Tile Organization

### Bank 0: Sprites ($0000-$0FFF, tiles $00-$FF)

#### Player Cell Sprites ($00-$0F)
- **$00-$03**: Player cell frame 1 (16x16 metatile)
  - $00: Top-left (circular blob, light edge)
  - $01: Top-right
  - $02: Bottom-left
  - $03: Bottom-right (with nucleus visible)

- **$04-$07**: Player cell frame 2 (breathing animation)
- **$08-$0B**: Player cell frame 3 (breathing animation)
- **$0C-$0F**: Player cell frame 4 (breathing animation)

#### Nutrient Particle Sprites ($10-$1F)
- **$10**: Green nutrient (amino acid) - small circular
- **$11**: Yellow nutrient (glucose) - small circular
- **$12**: Pink nutrient (vitamin) - small circular
- **$13-$1F**: Reserved for nutrient animation frames

#### Antibody Enemy Sprites ($20-$3F)
- **$20-$23**: Antibody type 1 (Y-shaped, aggressive)
  - 16x16 metatile layout
- **$24-$27**: Antibody type 2 (variant pose)
- **$28-$2B**: Antibody type 3 (rotation frame)
- **$2C-$2F**: Antibody type 4 (rotation frame)
- **$30-$3F**: Additional animation/rotation frames

#### UI Elements ($40-$5F)
- **$40-$49**: Score digits (0-9) in white
- **$4A**: Cell count icon (small cell symbol)
- **$4B**: Life indicator icon
- **$4C-$4F**: Difficulty meter segments
- **$50-$5F**: Reserved for additional UI

#### Mitosis Effect Sprites ($60-$7F)
- **$60-$6F**: Cell division visual effects (membrane stretching)
- **$70-$7F**: Particle effects, explosions

#### Reserved/Empty ($80-$FF)
- Available for future sprite additions

### Bank 1: Background Tiles ($1000-$1FFF, tiles $100-$1FF)

#### Petri Dish Arena ($100-$13F)
- **$100-$10F**: Outer rim tiles (lab equipment aesthetic, gray/white)
- **$110-$11F**: Inner field tiles (culture medium, blue-purple)
- **$120-$12F**: Grid line tiles (measurement marks)
- **$130-$13F**: Corner and curved edge pieces

#### Text/Font ($140-$17F)
- **$140-$159**: Uppercase alphabet (A-Z)
- **$15A-$163**: Digits (0-9) for backgrounds
- **$164-$17F**: Punctuation and symbols

#### UI Backgrounds ($180-$1BF)
- **$180-$18F**: Score panel backgrounds
- **$190-$19F**: HUD backgrounds
- **$1A0-$1AF**: Border tiles

#### Reserved/Empty ($1C0-$1FF)
- Available for additional background graphics

## Color Palettes

### Sprite Palettes (4 palettes, 4 colors each including transparent)

**Palette 0: Player Cell**
- Color 0: Transparent
- Color 1: $32 (Light cyan - cell membrane)
- Color 2: $12 (Medium blue - cell body)
- Color 3: $02 (Dark blue - nucleus)

**Palette 1: Nutrients**
- Color 0: Transparent
- Color 1: $2A (Green - amino acids)
- Color 2: $28 (Yellow - glucose)
- Color 3: $34 (Pink - vitamins)

**Palette 2: Antibodies**
- Color 0: Transparent
- Color 1: $16 (Bright red - antibody body)
- Color 2: $06 (Dark red - antibody details)
- Color 3: $30 (White - aggressive highlights)

**Palette 3: UI/Effects**
- Color 0: Transparent
- Color 1: $30 (White - text)
- Color 2: $21 (Medium blue - highlights)
- Color 3: $0F (Black - shadows)

### Background Palettes (4 palettes, 4 colors each)

**Palette 0: Petri Dish Main**
- Color 0: $21 (Medium blue - background base)
- Color 1: $11 (Dark blue/purple - gradient)
- Color 2: $01 (Darker blue - depth)
- Color 3: $31 (Light blue - highlights)

**Palette 1: Arena Rim**
- Color 0: $30 (White/gray - lab equipment)
- Color 1: $20 (Light gray)
- Color 2: $10 (Dark gray)
- Color 3: $00 (Black - shadows)

**Palette 2: UI Backgrounds**
- Color 0: $0F (Black - panel background)
- Color 1: $30 (White - text)
- Color 2: $12 (Blue - accents)
- Color 3: $02 (Dark blue - borders)

**Palette 3: Reserved**
- Available for special effects or alternate screens

## Current Status

### ✅ Completed
- CHR file structure created (8KB)
- Initial tile data present (basic circular shapes visible in hex dump)

### 🔨 In Progress
- Detailed sprite artwork for all game elements
- Complete animation frames
- Background tileset for petri dish

### ⏳ Todo
- Create final sprite artwork using NES tile editor
- Verify all tiles match specifications
- Test tiles in emulator
- Create visual reference sheet (PNG preview of CHR contents)

## Technical Notes

### NES CHR Format
- Each 8x8 tile = 16 bytes
- First 8 bytes = low bitplane (bits 0-1 of pixel color)
- Next 8 bytes = high bitplane (bits 2-3 of pixel color)
- 2 bits per pixel = 4 colors (including transparent)

### Metatile System
- 16x16 sprites use 4 tiles (2x2 grid)
- Tile indices stored in metatile definitions in code
- OAM attributes control which palette is used

### Animation System
- Animation frames stored sequentially in CHR
- Code cycles through tile indices for animation
- Breathing effect: 4 frames @ 8-12 fps

## Integration with Assembly Code

The Chief Engineer will reference these tile indices in the assembly code:
- `TILE_PLAYER_BASE = $00` - Starting tile for player sprites
- `TILE_NUTRIENT_GREEN = $10`
- `TILE_ANTIBODY_BASE = $20`
- `TILE_DIGIT_ZERO = $40`
- `TILE_BG_DISH_BASE = $100`

## References
- Sprite specifications: `assets/specs/sprite_specs.md`
- Color palette guide: NES PPU palette $00-$3F
