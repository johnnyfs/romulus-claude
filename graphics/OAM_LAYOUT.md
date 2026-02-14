# MITOSIS PANIC - OAM Sprite Layout Specification

## Overview

This document defines the **exact OAM (Object Attribute Memory) layout** for all game entities. Use this as the reference for sprite rendering code and automated validation.

## NES OAM Structure

Each sprite occupies 4 bytes in OAM ($0200-$02FF, 64 sprites max):

```
Byte 0: Y position (0-239 visible, $FF = off-screen)
Byte 1: Tile index ($00-$FF)
Byte 2: Attributes (PPPppphh)
  - PPP: Palette (000-011 = palettes 0-3)
  - pp: Priority (00 = in front of BG, 01 = behind BG)
  - h: Horizontal flip
  - h: Vertical flip
Byte 3: X position (0-255)
```

---

## Entity Type: PLAYER CELL

### Sprite Count: 4 (16x16 metatile using 4x 8x8 sprites)

### OAM Layout
```
Sprite 0 (Top-Left):
  Offset: $0200
  Y: player_y
  Tile: $00 or $04 (animation frame)
  Attr: %00000000 (Palette 0, front, no flip)
  X: player_x

Sprite 1 (Top-Right):
  Offset: $0204
  Y: player_y
  Tile: $01 or $05 (right half, animation frame)
  Attr: %00000000 (Palette 0, front, no flip)
  X: player_x + 8

Sprite 2 (Bottom-Left):
  Offset: $0208
  Y: player_y + 8
  Tile: $02 or $06 (bottom half, animation frame)
  Attr: %00000000 (Palette 0, front, no flip)
  X: player_x

Sprite 3 (Bottom-Right):
  Offset: $020C
  Y: player_y + 8
  Tile: $03 or $07 (bottom-right, animation frame)
  Attr: %00000000 (Palette 0, front, no flip)
  X: player_x + 8
```

### Animation
- **Frame 1**: Tiles $00, $01, $02, $03
- **Frame 2**: Tiles $04, $05, $06, $07 (currently $04 exists, others reserved)
- **Frame rate**: Toggle every 8-16 frames for breathing effect

### Valid Ranges
- Y: 0-232 (allow 8px bottom sprite at 240)
- X: 0-248 (allow 8px right sprite at 256)

### Validation Assertions
```lua
-- FCEUX Lua
player_y = memory.readbyte(0x0200)
player_tile = memory.readbyte(0x0201)
player_attr = memory.readbyte(0x0202)
player_x = memory.readbyte(0x0203)

assert(player_y >= 0 and player_y <= 232, "Player Y out of bounds")
assert(player_x >= 0 and player_x <= 248, "Player X out of bounds")
assert(player_tile == 0x00 or player_tile == 0x04, "Player tile invalid")
assert(player_attr == 0x00, "Player palette should be 0")
```

---

## Entity Type: NUTRIENT PARTICLE

### Sprite Count: 1 (8x8 single sprite)

### OAM Layout
```
Sprite N:
  Offset: Variable (assigned by spawn system)
  Y: nutrient_y (0-232)
  Tile: $10 (green), $11 (yellow), or $12 (pink)
  Attr: %00000001 (Palette 1, front, no flip)
  X: nutrient_x (0-248)
```

### Tile Selection
Random selection for variety:
```asm
; Example spawn code
lda random_seed
and #$03          ; 0-3
cmp #$03
bcs @use_green
clc
adc #$10          ; $10 + (0,1,2) = $10/$11/$12
jmp @set_tile
@use_green:
  lda #$10
@set_tile:
  sta oam_tile, x
  lda #$01        ; Palette 1
  sta oam_attr, x
```

### Valid Ranges
- Y: 0-232 (8px sprite height)
- X: 0-248 (8px sprite width)

### Validation Assertions
```lua
-- Check nutrient sprite N (e.g., sprite 10)
nutrient_offset = 0x0200 + (10 * 4)
nutrient_tile = memory.readbyte(nutrient_offset + 1)
nutrient_attr = memory.readbyte(nutrient_offset + 2)

assert(nutrient_tile >= 0x10 and nutrient_tile <= 0x12, "Nutrient tile out of range")
assert(nutrient_attr == 0x01, "Nutrient should use palette 1")
```

---

## Entity Type: ANTIBODY ENEMY

### Sprite Count: 4 (16x16 metatile using 4x 8x8 sprites)

### OAM Layout
```
Sprite M+0 (Top-Left):
  Offset: Variable
  Y: antibody_y
  Tile: $20 (top-left of Y-shape)
  Attr: %00000010 (Palette 2, front, no flip)
  X: antibody_x

Sprite M+1 (Top-Right):
  Offset: Variable + 4
  Y: antibody_y
  Tile: $21 (top-right of Y-shape)
  Attr: %00000010 (Palette 2, front, no flip)
  X: antibody_x + 8

Sprite M+2 (Bottom-Left):
  Offset: Variable + 8
  Y: antibody_y + 8
  Tile: $22 (bottom-left)
  Attr: %00000010 (Palette 2, front, no flip)
  X: antibody_x

Sprite M+3 (Bottom-Right):
  Offset: Variable + 12
  Y: antibody_y + 8
  Tile: $23 (bottom-right)
  Attr: %00000010 (Palette 2, front, no flip)
  X: antibody_x + 8
```

### NOTE: Current MVP Implementation
Currently only tile $02 exists (single 8x8 Y-shape). For MVP, may use single sprite:
```
Sprite M:
  Y: antibody_y
  Tile: $02 (Y-shape)
  Attr: %00000010 (Palette 2)
  X: antibody_x
```

### Rotation/Animation (Future)
- **Frame 1**: Tiles $20-$23 (default Y-shape)
- **Frame 2**: Tiles $24-$27 (rotated 90°)
- **Frame 3**: Tiles $28-$2B (rotated 180°)
- **Frame 4**: Tiles $2C-$2F (rotated 270°)

### Valid Ranges
- Y: 0-232 (16px sprite height)
- X: 0-248 (16px sprite width)

### Validation Assertions
```lua
-- Check antibody sprite (assuming single-tile MVP)
antibody_offset = 0x0200 + (antibody_slot * 4)
antibody_tile = memory.readbyte(antibody_offset + 1)
antibody_attr = memory.readbyte(antibody_offset + 2)

assert(antibody_tile == 0x02, "Antibody tile should be $02 in MVP")
assert(antibody_attr == 0x02, "Antibody should use palette 2")
```

---

## Entity Type: UI SCORE DIGITS

### Sprite Count: Variable (1 per digit, typically 6 for score)

### OAM Layout
```
Sprite UI+N:
  Y: 8 (fixed top position)
  Tile: $40-$49 (digit 0-9)
  Attr: %00000011 (Palette 3, front, no flip)
  X: 16 + (N * 8) (spaced 8px apart)
```

### Example: Score "012345"
```
Sprite UI+0: Y=8, Tile=$40 (0), Attr=$03, X=16
Sprite UI+1: Y=8, Tile=$41 (1), Attr=$03, X=24
Sprite UI+2: Y=8, Tile=$42 (2), Attr=$03, X=32
Sprite UI+3: Y=8, Tile=$43 (3), Attr=$03, X=40
Sprite UI+4: Y=8, Tile=$44 (4), Attr=$03, X=48
Sprite UI+5: Y=8, Tile=$45 (5), Attr=$03, X=56
```

### NOTE: Not yet implemented
UI digit tiles ($40-$49) do not exist in CHR yet. Placeholder for future implementation.

---

## Sprite Allocation Strategy

### OAM Memory Map ($0200-$02FF)
```
$0200-$020F: Player cell (4 sprites, 16 bytes)
$0210-$027F: Nutrients (max 28 nutrients, 4 bytes each)
$0280-$02EF: Antibodies (max 7 antibodies @ 16 bytes each for 16x16)
$02F0-$02FF: UI elements (4 sprites, score/lives/etc)
```

### Sprite Priorities
1. **Player**: Always visible, slots 0-3
2. **UI**: Always visible, slots 60-63
3. **Antibodies**: Game entities, slots 32-59
4. **Nutrients**: Fill remaining slots, slots 4-31

### Overflow Handling
If sprite count exceeds 64:
1. Prioritize player sprites (slots 0-3)
2. Prioritize UI sprites (slots 60-63)
3. Drop oldest/farthest nutrients first
4. Keep all antibodies (critical gameplay)

---

## Coordinate Bounds Checking

### Screen Visible Area
- **Width**: 256 pixels (X: 0-255)
- **Height**: 240 pixels (Y: 0-239)

### Sprite Culling (Off-Screen Detection)
```asm
; Check if 8x8 sprite is visible
cull_8x8:
    lda sprite_y
    cmp #240
    bcs @offscreen    ; Y >= 240: off bottom
    cmp #$FF
    beq @offscreen    ; Y = $FF: deliberate off-screen

    lda sprite_x
    cmp #$FF
    beq @offscreen    ; X = $FF: off right edge

    ; Sprite is visible
    rts

@offscreen:
    ; Set Y = $FF to hide
    lda #$FF
    sta sprite_y
    rts
```

### Arena Boundary (Gameplay)
Assuming arena is slightly inset from screen edges:
```
Arena bounds:
  Top: Y >= 16
  Bottom: Y <= 216 (240 - 16 - 8 sprite height)
  Left: X >= 16
  Right: X <= 232 (256 - 16 - 8 sprite width)
```

### Collision Bounds (Entity Centers)
For collision detection, use sprite centers:
```
Player center: (player_x + 4, player_y + 4) for 8x8 tile
              (player_x + 8, player_y + 8) for 16x16 metatile

Nutrient center: (nutrient_x + 4, nutrient_y + 4)

Antibody center: (antibody_x + 8, antibody_y + 8) for 16x16
```

---

## Attribute Byte Reference

### Palette Selection (Bits 0-1)
```
%00000000 = Palette 0 (Player cell - cyan/blue)
%00000001 = Palette 1 (Nutrients - green/yellow/pink)
%00000010 = Palette 2 (Antibodies - red)
%00000011 = Palette 3 (UI - white)
```

### Priority (Bit 5)
```
%00000000 = Front of background (default)
%00100000 = Behind background (rarely used)
```

### Flip Flags (Bits 6-7)
```
%00000000 = No flip
%01000000 = Horizontal flip
%10000000 = Vertical flip
%11000000 = Both flips
```

---

## Common Rendering Bugs & Fixes

### Bug: Sprites Flickering
**Cause**: OAM not fully cleared between frames
**Fix**: Zero entire OAM buffer ($0200-$02FF) at start of update:
```asm
    ldx #$00
    lda #$FF
@clear_loop:
    sta $0200, x
    inx
    bne @clear_loop
```

### Bug: Sprites Disappear
**Cause**: Y coordinate = $FF (off-screen marker)
**Fix**: Ensure active sprites have Y in range 0-239

### Bug: Wrong Colors
**Cause**: Attribute byte palette bits incorrect
**Fix**: Verify sprite attribute byte: (entity_type & $03) gives palette 0-3

### Bug: Sprite Overload (>64 sprites)
**Cause**: Too many entities, OAM overflow
**Fix**: Implement sprite culling/priority system (see allocation strategy above)

### Bug: Sprite-0 Hit Not Working
**Cause**: Sprite 0 Y or tile data incorrect
**Fix**: Reserve sprite 0 for timing, ensure opaque pixel at specific screen location

---

## FCEUX Lua OAM Monitor

Use this script to watch OAM in real-time:

```lua
function draw_oam_info()
    local y_offset = 10
    gui.text(5, y_offset, "OAM Sprite Monitor")
    y_offset = y_offset + 10

    -- Player sprites
    for i = 0, 3 do
        local offset = 0x0200 + (i * 4)
        local y = memory.readbyte(offset)
        local tile = memory.readbyte(offset + 1)
        local attr = memory.readbyte(offset + 2)
        local x = memory.readbyte(offset + 3)

        if y ~= 0xFF then
            gui.text(5, y_offset, string.format("Player[%d]: Y=%d X=%d Tile=$%02X Pal=%d",
                i, y, x, tile, attr & 0x03))
            y_offset = y_offset + 8
        end
    end

    -- Count active sprites
    local active = 0
    for i = 0, 63 do
        local y = memory.readbyte(0x0200 + (i * 4))
        if y ~= 0xFF then active = active + 1 end
    end
    gui.text(5, 200, string.format("Active sprites: %d / 64", active))
end

emu.registerbefore(draw_oam_info)
```

---

## Validation Checklist

Use this checklist for manual or automated OAM validation:

- [ ] Player sprites (0-3) have valid Y (0-232), X (0-248)
- [ ] Player tiles are $00 or $04 (animation frames)
- [ ] Player palette is 0 (attribute = $00)
- [ ] All nutrient sprites use tiles $10-$12
- [ ] All nutrient sprites use palette 1 (attribute = $01)
- [ ] All antibody sprites use tile $02 (MVP) or $20-$2F (full)
- [ ] All antibody sprites use palette 2 (attribute = $02)
- [ ] No sprites with Y in range 240-254 (should be $FF if off-screen)
- [ ] Total active sprite count <= 64
- [ ] No more than 8 sprites per scanline (check for flickering)
- [ ] OAM DMA executed every frame ($4014 = $02 write in NMI)

---

**Integration**: Use with VALIDATION_REPORT.md and validate_chr.sh for complete graphics system validation.
