# MITOSIS PANIC - Graphics Performance Optimization Guide

## VBlank Budget Analysis

**Total VBlank Time**: ~2273 cycles (NTSC timing)

### Current Cycle Breakdown (Estimated)
```
OAM DMA ($4014 write):        ~513 cycles (fixed, 256 bytes * 2 cycles)
FamiToneUpdate (audio):     ~1000+ cycles (variable)
Sprite position updates:     ~200-400 cycles (depends on entity count)
Palette updates (rare):       ~32 cycles (when needed)
PPU register writes:          ~50-100 cycles
Game state updates:          Unknown
                            ─────────
TOTAL:                      ~1800-2100+ cycles

REMAINING BUFFER:           ~173-473 cycles (TIGHT!)
```

**Risk**: VBlank overflow causes flickering, frame drops, delayed rendering.

---

## Graphics Optimization Status

### ✅ Already Optimized

1. **Minimal CHR Tiles**: Only 7 tiles used (1.4% of CHR space)
   - Player: 2 tiles ($00, $04)
   - Enemies: 1 tile ($02)
   - Nutrients: 3 tiles ($10-$12, but identical data)
   - **Impact**: Fast CHR-ROM access, minimal PPU overhead

2. **Palette Reuse**: Nutrients use same tile, different palettes
   - Saves 3 tile slots (would be 6 tiles if all unique)
   - No runtime palette swapping needed
   - **Impact**: Zero cycle overhead for color variety

3. **Simple Sprite Shapes**: 8x8 single tiles for most entities
   - Player cell could be 8x8 (currently spec'd as 16x16)
   - Enemies: 8x8 single sprite (MVP)
   - Nutrients: 8x8 single sprite
   - **Impact**: Minimal OAM writes, fast updates

4. **No Background Tiles**: Arena is solid color
   - No nametable updates during gameplay
   - No attribute table changes
   - **Impact**: Zero PPU writes during game loop

---

## OAM Update Optimization

### Current Sprite Allocation (from OAM_LAYOUT.md)

```
Entity          | Sprites | OAM Range    | Update Frequency
───────────────┼─────────┼──────────────┼─────────────────
Player cell    |    4    | $0200-$020F  | Every frame (movement)
Nutrients      |   28    | $0210-$027F  | Dynamic (spawn/collect)
Antibodies     |    7    | $0280-$02EF  | Every frame (AI movement)
UI elements    |    4    | $02F0-$02FF  | Static (rarely changes)
───────────────┼─────────┼──────────────┼─────────────────
TOTAL          |   43    |              |
```

### Optimization Strategies

#### 1. Selective OAM Updates (HIGH IMPACT)

**Problem**: Updating all 64 OAM sprites every frame wastes cycles.

**Solution**: Only update sprites for active entities.

```asm
; BEFORE (wasteful):
update_oam:
    ldx #$00
@loop:
    ; Update sprite X regardless of if entity active
    ; ... update code ...
    inx
    cpx #$FC              ; All 64 sprites
    bne @loop
    rts
; Cost: ~1000 cycles

; AFTER (optimized):
update_oam:
    ; Update player (always active) - 4 sprites
    jsr update_player_sprites    ; ~50 cycles

    ; Update only active nutrients
    ldx num_nutrients            ; e.g., 5 active
@nutrient_loop:
    jsr update_nutrient_sprite   ; ~12 cycles each
    dex
    bne @nutrient_loop

    ; Update only active antibodies
    ldx num_antibodies           ; e.g., 3 active
@antibody_loop:
    jsr update_antibody_sprite   ; ~12 cycles each
    dex
    bne @antibody_loop

    ; UI sprites - update only when changed
    lda ui_dirty_flag
    beq @skip_ui
    jsr update_ui_sprites        ; ~20 cycles
    lda #$00
    sta ui_dirty_flag
@skip_ui:
    rts
; Cost: ~50 + (5*12) + (3*12) + 20 = ~166 cycles
; SAVINGS: ~834 cycles!
```

**Implementation**:
- Track active entity count per type
- Only loop through active entities
- Skip OAM updates for inactive sprites (leave at Y=$FF)

---

#### 2. Static Sprite Flagging (MEDIUM IMPACT)

**Problem**: UI sprites rarely change but get updated every frame.

**Solution**: Flag static sprites, only update when dirty.

```asm
; Entity flags
ENTITY_FLAG_ACTIVE   = $01
ENTITY_FLAG_DIRTY    = $02
ENTITY_FLAG_STATIC   = $04

; Mark UI sprites as static
init_ui:
    lda #(ENTITY_FLAG_ACTIVE | ENTITY_FLAG_STATIC)
    sta ui_sprite_flags
    ; ... position UI sprites once ...
    rts

; Update loop checks dirty flag
update_sprites:
    ; Player (always dirty - moves every frame)
    jsr update_player

    ; Nutrients (check individual dirty flags)
    ldx #$00
@nutrient_loop:
    lda nutrient_flags, x
    and #ENTITY_FLAG_DIRTY
    beq @skip_nutrient         ; Not dirty - skip update
    jsr update_nutrient_sprite
    ; Clear dirty flag after update
    lda nutrient_flags, x
    and #~ENTITY_FLAG_DIRTY
    sta nutrient_flags, x
@skip_nutrient:
    inx
    cpx num_nutrients
    bne @nutrient_loop
    rts
```

**Savings**: ~50-100 cycles if 10-20 sprites are static/clean

---

#### 3. Metatile Compression (HIGH IMPACT - IF USED)

**Problem**: Player cell as 16x16 metatile = 4 sprites = 4x OAM writes.

**Current MVP**: Using single 8x8 sprite for player?

**If using 16x16 metatiles**:
```asm
; BEFORE: 4 separate OAM writes
update_player_16x16:
    ; Write top-left
    lda player_y
    sta $0200
    lda #$00              ; Tile
    sta $0201
    ; ... (repeat for 4 sprites)
    ; Cost: ~50 cycles

; OPTIMIZATION: Precompute relative offsets
update_player_16x16_fast:
    lda player_y
    sta $0200             ; Top-left Y
    clc
    adc #$08
    sta $0208             ; Bottom-left Y (Y+8)
    lda player_y
    sta $0204             ; Top-right Y
    clc
    adc #$08
    sta $020C             ; Bottom-right Y

    ; X coordinates
    lda player_x
    sta $0203             ; Left X
    sta $020B
    clc
    adc #$08
    sta $0207             ; Right X (X+8)
    sta $020F

    ; Tiles (constant)
    lda #$00
    sta $0201
    lda #$01
    sta $0205
    lda #$02
    sta $0209
    lda #$03
    sta $020D

    ; Attributes (all same)
    lda #$00
    sta $0202
    sta $0206
    sta $020A
    sta $020E
    rts
; Cost: ~40 cycles (10 cycle savings, but minimal)
```

**Better optimization**: Use 8x8 sprites for MVP, upgrade to 16x16 later if needed.

---

#### 4. OAM Clear Optimization (MEDIUM IMPACT)

**Problem**: Clearing entire OAM buffer every frame is slow.

```asm
; BEFORE: Clear all 256 bytes
clear_oam:
    ldx #$00
    lda #$FF              ; Off-screen Y
@loop:
    sta $0200, x
    sta $0201, x
    sta $0202, x
    sta $0203, x
    inx
    inx
    inx
    inx
    bne @loop
    rts
; Cost: ~320 cycles (64 sprites * 5 cycles)

; AFTER: Only clear sprites that were active last frame
clear_oam_selective:
    ldx last_max_sprite    ; e.g., 43 * 4 = 172 bytes
    lda #$FF
@loop:
    sta $0200, x
    dex
    bpl @loop
    rts
; Cost: ~172 cycles (if 43 sprites active)
; SAVINGS: ~148 cycles
```

---

## Sprite Count Reduction

### Current Allocation Optimization

Based on OAM_LAYOUT.md sprite budget:

| Entity Type | Current Max | Optimized | Savings |
|-------------|-------------|-----------|---------|
| Player      | 4 sprites   | 1 sprite  | 3 sprites |
| Nutrients   | 28 sprites  | 16 sprites| 12 sprites |
| Antibodies  | 7 sprites   | 6 sprites | 1 sprite |
| UI          | 4 sprites   | 2 sprites | 2 sprites |
| **TOTAL**   | **43**      | **25**    | **18** |

### Rationale

1. **Player: 4→1 sprite**
   - MVP: Use single 8x8 tile ($00) for player
   - Cell is already small and readable
   - Upgrade to 16x16 metatile post-MVP if needed
   - **Savings**: 3 sprites, ~36 cycles per frame

2. **Nutrients: 28→16 sprites**
   - 28 simultaneous nutrients is excessive for 256x240 screen
   - 16 nutrients = 1 per 16x15px area (still dense)
   - Despawn collected nutrients immediately
   - **Savings**: 12 sprites, ~144 cycles per frame

3. **Antibodies: 7→6 sprites**
   - 6 enemies on screen at once is challenging gameplay
   - Use single 8x8 sprite ($02) per enemy (MVP)
   - Upgrade to 16x16 metatiles post-MVP
   - **Savings**: Minimal, but reduces complexity

4. **UI: 4→2 sprites**
   - MVP: Display score with 2 sprites (tens, ones digits)
   - Remove cell count / lives icons for now
   - Display using background tiles (nametable) if needed
   - **Savings**: 2 sprites, ~24 cycles per frame

### Total Performance Gain
- **Sprite count**: 43 → 25 (42% reduction)
- **Cycle savings**: ~200+ cycles per frame
- **Impact**: Reduces VBlank pressure significantly

---

## Implementation Priority

### Phase 1: Immediate (Zero Code Changes)
✅ **Already Done**: Minimal CHR tiles, palette reuse, simple sprites

### Phase 2: Chief Engineer - Easy Wins (~2-4 hours)
1. Selective OAM updates (only active entities)
2. Static sprite flagging (UI dirty flags)
3. Reduce nutrient max count (28→16)
4. Use 8x8 sprites for all entities (simplify metatiles)

**Expected gain**: ~300-400 cycles

### Phase 3: Chief Engineer - If Still Needed (~4-8 hours)
1. Split-frame audio (Audio Engineer documented approach)
2. OAM clear optimization
3. Precomputed sprite update tables

**Expected gain**: ~800-1000 cycles (mostly from split-frame audio)

---

## Graphics-Specific Recommendations

### DO:
- ✅ Keep using 8x8 sprites (fast, simple)
- ✅ Limit active sprite count (use despawn/culling)
- ✅ Mark UI sprites as static with dirty flags
- ✅ Only update moving entities each frame

### DON'T:
- ❌ Don't clear entire OAM buffer if not needed
- ❌ Don't update off-screen sprites
- ❌ Don't use 16x16 metatiles unless visually necessary
- ❌ Don't animate all entities simultaneously (stagger updates)

### CONSIDER (Post-MVP):
- Sprite pooling (reuse OAM slots for despawned entities)
- Sprite prioritization (player > enemies > nutrients)
- LOD system (simpler sprites when many entities)
- Sprite multiplexing (cycle through overflow sprites)

---

## Validation

### Measure Performance

Use FCEUX Lua to measure NMI cycle count:

```lua
function profile_nmi()
    -- Read cycle counter at NMI start/end
    -- (Requires custom build or emulator features)
    local start_cycles = emu.cyclecount()

    -- Wait for NMI completion
    -- (Track via RAM flag or register writes)

    local end_cycles = emu.cyclecount()
    local nmi_cost = end_cycles - start_cycles

    if nmi_cost > 2273 then
        print(string.format("WARNING: NMI exceeded VBlank! %d cycles", nmi_cost))
    else
        print(string.format("NMI OK: %d / 2273 cycles (%.1f%%)",
            nmi_cost, (nmi_cost / 2273) * 100))
    end
end
```

### Target Metrics

- **Acceptable**: < 2000 cycles (buffer for worst case)
- **Warning**: 2000-2273 cycles (risky, may glitch)
- **Critical**: > 2273 cycles (definitely breaks)

---

## Summary

Graphics system is **already highly optimized** for performance:
- ✅ Minimal CHR data (7 tiles)
- ✅ Simple sprite shapes (mostly 8x8)
- ✅ Palette reuse for color variety
- ✅ No background updates during gameplay

**Further optimization requires Chief Engineer code changes**:
- Selective OAM updates (only active entities)
- Static sprite flagging (UI)
- Sprite count reduction (43→25)
- Split-frame audio (if needed)

**Graphics Engineer responsibility**: Documentation complete. Assets are optimal.

**Chief Engineer responsibility**: Profile NMI, implement selective updates, test.

---

**Cross-reference**:
- OAM_LAYOUT.md (sprite allocation details)
- VALIDATION_REPORT.md (asset integrity)
- Audio Engineer's AUDIO_PERFORMANCE_METRICS.md (split-frame approach)
