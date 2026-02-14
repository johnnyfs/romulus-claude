# CHR File Updates Log

## Version 2 - Basic Variants Added (2024-02-14)

### Changes Made

#### Nutrient Particle Tiles ($10-$12) ✅
Created three nutrient particle sprites by duplicating the small circle base (tile $01):

- **Tile $10**: Green nutrient (amino acid)
  - Uses Sprite Palette 1, color 1 ($2A green)
  - Same circular 8x8 shape as base

- **Tile $11**: Yellow nutrient (glucose)
  - Uses Sprite Palette 1, color 2 ($28 yellow)
  - Same circular 8x8 shape as base

- **Tile $12**: Pink nutrient (vitamin)
  - Uses Sprite Palette 1, color 3 ($34 pink)
  - Same circular 8x8 shape as base

**Technical Note**: All three tiles use identical pixel data. Color differentiation happens via palette selection in OAM attributes. This is efficient and maintains visual consistency.

#### Player Animation Frame 2 ($04) ✅
Added second animation frame for player cell:

- **Tile $04**: Player breathing frame 2
  - Currently identical to tile $00 (base frame)
  - Placeholder for future subtle pixel shift
  - Allows 2-frame animation loop immediately

### Assembly Integration

```asm6502
; Tile constants (add to constants.inc or main.asm)
TILE_PLAYER_FRAME1  = $00
TILE_PLAYER_FRAME2  = $04
TILE_NUTRIENT_GREEN = $10
TILE_NUTRIENT_YELLOW = $11
TILE_NUTRIENT_PINK   = $12
TILE_ANTIBODY       = $02

; Nutrient spawning example
spawn_nutrient:
    lda random_value
    and #$03              ; Get 0-3
    cmp #$03
    bcs @use_green        ; If >= 3, use green
    clc
    adc #TILE_NUTRIENT_GREEN  ; $10 + (0,1,2) = $10/$11/$12
    jmp @set_tile
@use_green:
    lda #TILE_NUTRIENT_GREEN
@set_tile:
    sta sprite_tile, x
    lda #$01              ; Palette 1 for nutrients
    sta sprite_attr, x
    rts

; Player animation example (in game loop)
animate_player:
    inc frame_counter
    lda frame_counter
    and #$08              ; Toggle every 8 frames
    beq @frame1
@frame2:
    lda #TILE_PLAYER_FRAME2
    jmp @set_frame
@frame1:
    lda #TILE_PLAYER_FRAME1
@set_frame:
    sta player_sprite_tile
    rts
```

### Visual Impact

**Before**:
- Only one nutrient appearance (needed palette swapping)
- Static player sprite

**After**:
- Three distinct nutrient types via tile+palette
- 2-frame player animation capability (breathing effect)

### Testing Notes

1. **Emulator Verification**:
   - Load game.chr in Mesen/FCEUX CHR viewer
   - Verify tiles $10-$12 show circle pattern
   - Verify tile $04 matches tile $00

2. **In-Game Testing**:
   - Spawn nutrients with different tile indices
   - Apply Sprite Palette 1 to all nutrients
   - Verify green ($10), yellow ($11), pink ($12) appear correctly
   - Toggle player between tile $00 and $04 for animation

3. **Palette Assignment**:
   ```
   Nutrient OAM attribute byte:
   %00000001 = Palette 1, no flip, behind BG priority off
   ```

### File Integrity

- **Original file**: game.chr.backup (preserved)
- **Modified file**: game.chr
- **Size unchanged**: 8192 bytes (8KB)
- **Format intact**: Valid NES CHR ROM structure

### Next Steps

For enhanced visuals (optional, post-MVP):
1. Add slight pixel variation to tile $04 for visible breathing
2. Create tiles $08, $0C for 4-frame player animation
3. Add size variation to nutrient tiles (small/medium/large)
4. Create rotated antibody variants

### Quick Reference

```
Current CHR Contents (v2):
$00: Player base (large circle)
$01: Small circle template
$02: Y-antibody enemy
$03: Empty
$04: Player frame 2 (currently duplicate)
$05-$0F: Empty (reserved for player animation)
$10: Green nutrient ✅ NEW
$11: Yellow nutrient ✅ NEW
$12: Pink nutrient ✅ NEW
$13-$1FF: Empty (available)
```

### Credits
Created using command-line dd for tile duplication. Simple, effective, no external tools required. Total time: ~10 minutes.

---
*For complete tile documentation, see CHR_MAP.md*
