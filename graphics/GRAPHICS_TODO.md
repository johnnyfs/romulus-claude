# MITOSIS PANIC - Graphics Assets TODO

## Current Status: MVP Foundation ✅

### What We Have (Sufficient for Gameplay Testing)
- ✅ Basic player cell sprite (tile $00-$01): Circular blob
- ✅ Y-shaped antibody enemy (tile $02): Enemy base sprite
- ✅ CHR file structure: Correct 8KB NES format
- ✅ Documentation: Complete tile map and palette specifications

**These foundation sprites are ENOUGH for Chief Engineer to implement:**
- Player movement and collision detection
- Enemy AI and collision
- Mitosis mechanics (can duplicate existing tile)
- Basic gameplay loop testing

## Priority Levels

### 🔴 CRITICAL (Blocks Core Gameplay)
*None - foundation sprites cover critical gameplay needs*

### 🟡 HIGH (Enhances MVP, Simple to Add)

#### 1. Nutrient Particle Variants (3 tiles)
**Location**: Tiles $10, $11, $12
**Source**: Copy tile $01 (small circle) three times
**Effort**: Trivial - just duplication, palette does the coloring
**Impact**: Makes nutrient types visually distinct using palette swapping

#### 2. Basic Player Animation (Frames 2-4)
**Location**: Tiles $04-$0F
**Source**: Slightly modify tile $00-$01 for "breathing" effect
**Effort**: Low - minor pixel shifts for organic wobble
**Impact**: Adds life to player sprite, feels more cellular

### 🟢 MEDIUM (Polish, Can Wait for Post-MVP)

#### 3. UI Score Digits (0-9)
**Location**: Tiles $40-$49
**Effort**: Medium - need to design 10 readable 8x8 digits
**Impact**: Required for score display (can use background tiles temporarily)
**Workaround**: Text mode or background font as placeholder

#### 4. Additional Antibody Rotations
**Location**: Tiles $24-$2F
**Effort**: Medium - rotate/flip Y-shape for animation frames
**Impact**: Smoother enemy animation, more menacing appearance

#### 5. Mitosis Visual Effects
**Location**: Tiles $60-$6F
**Effort**: Medium - membrane stretching animation
**Impact**: Makes cell division feel dramatic and satisfying

### 🔵 LOW (Nice-to-Have, Post-Launch Polish)

#### 6. Petri Dish Background Tiles
**Location**: Tiles $100-$13F
**Effort**: High - full background tileset with curved edges
**Impact**: Enhanced atmosphere, scientific aesthetic
**Workaround**: Solid color background works fine for gameplay

#### 7. Grid Line Decorations
**Location**: Tiles $120-$12F
**Effort**: Low - simple line patterns
**Impact**: Visual polish, scientific feel

#### 8. Additional UI Elements
**Location**: Tiles $4A-$5F
**Effort**: Medium - icons for lives, cell count, difficulty
**Impact**: Better player feedback
**Workaround**: Text-based display sufficient

## Simple Additions I Can Do (No External Tools Needed)

### Using Hex Editor / Command-Line Tools

1. **Nutrient Duplicates** (5 minutes)
   - Copy bytes $10-$1F from tile $01
   - Repeat for tiles $10, $11, $12
   - Palettes handle color differences

2. **Player Animation Frames** (15 minutes)
   - Copy tile $00 to $04, $08, $0C (frames 2-4)
   - Make tiny pixel shifts for breathing effect
   - Can be done with hex edits

3. **Flipped Antibody** (10 minutes)
   - Horizontally flip tile $02 bitwise
   - Creates rotation illusion

## What Requires Visual Editor (Lower Priority)

- Complex multi-tile metatile layouts
- Detailed background tilesets
- Intricate UI graphics
- Fine-tuned animations

## Recommendation: Iterative Approach

### Phase 1 (NOW - MVP Gameplay): ✅ COMPLETE
- Foundation sprites present
- Chief Engineer can implement core mechanics
- Gameplay testing possible

### Phase 2 (Next - Simple Enhancements): 🎯 TARGET
- Add nutrient duplicates (trivial)
- Add basic player animation frames (easy hex edits)
- Create flipped antibody variant (simple)
- **Estimated time: 30-45 minutes**

### Phase 3 (Later - Full Polish):
- Complete UI digit set
- Full background tileset
- Advanced animations
- Requires proper tile editor or artist
- **Do after gameplay is proven fun**

## Tools Available

### Command-Line Options
- `hexdump`, `xxd`: View/edit CHR data
- `dd`: Copy tile blocks
- Python/Ruby scripts: Bitwise operations for flips/rotations

### GUI Options (If Needed Later)
- YY-CHR: Popular CHR editor (Windows, runs in Wine)
- NES Screen Tool: Full tileset/nametable editor
- NEXXT: Modern cross-platform alternative

## Current Action Plan

1. ✅ Documentation complete (PR #3)
2. 🎯 Add simple tile variants using hex/scripts (30 min)
3. ⏸️ Wait for Chief Engineer gameplay integration
4. 🔄 Test in emulator with real game code
5. 📊 Gather feedback on what's actually needed
6. 🎨 Polish based on gameplay requirements

## Integration Notes for Chief Engineer

### Ready to Use NOW:
```asm6502
TILE_PLAYER     = $00  ; Basic circular blob (works for MVP)
TILE_ANTIBODY   = $02  ; Y-shaped enemy (works for MVP)
TILE_NUTRIENT   = $01  ; Will become $10-$12 soon
```

### Palette Strategy:
- Player uses Palette 0 (cyan/blue) ✅
- Enemies use Palette 2 (red) ✅
- Nutrients use Palette 1 (green/yellow/pink) ✅
- All palettes defined in PALETTES.md

### Animation Approach:
For now: Static sprites are fine
When ready: Cycle through tile indices (e.g., $00→$04→$08→$0C)

## Success Criteria

**MVP Graphics Complete When:**
- ✅ Player sprite visible and colored correctly
- ✅ Enemy sprite distinguishable from player
- ⏳ Nutrient sprites present (even if identical, palette differs)
- ⏳ Basic animation exists (even 2-frame is enough)
- ⏸️ Game is playable and fun (content can wait)

**Full Graphics Complete When:**
- All tile indices documented in CHR_MAP.md are filled
- Smooth 4-frame animations
- Complete UI tileset
- Full background graphics
- Tested in emulator with final game

---

**Philosophy**: Graphics serve gameplay. Get mechanics working with simple sprites first, polish based on what the game actually needs. Don't over-invest in art before proving the game is fun.

*Last updated: Phase 1 complete, moving to Phase 2 simple enhancements*
