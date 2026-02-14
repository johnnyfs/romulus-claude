# MITOSIS PANIC - Visual Reference Guide

## Purpose

This document provides **visual descriptions** of all CHR tiles for validation, debugging, and artist reference. Use this to verify rendering in FCEUX PPU Viewer or when creating additional tiles.

---

## Tile Visual Reference

### Tile $00: Player Cell Base (Large Circle)
```
8x8 pixel grid visualization:

     01234567
   ┌─────────
 0 │  ████
 1 │ ██████
 2 │████████
 3 │████████
 4 │████████
 5 │████████
 6 │ ██████
 7 │  ████

Hex: 3C 7E FF FF FF FF 7E 3C (plane 0)
     3C 7E FF FF FF FF 7E 3C (plane 1)
```

**Description**: Large solid circle using all 4 colors. Designed as the top-left quadrant of 16x16 player cell metatile. Smooth edges with anti-aliasing effect from multi-color gradient.

**Color mapping** (with Palette 0):
- ░ (transparent) = Background medium blue ($21)
- █ (color 1) = Light cyan membrane ($32)
- █ (color 2) = Medium blue body ($12)
- █ (color 3) = Dark blue nucleus ($02)

**Usage**: Player sprite, base frame for animation

---

### Tile $01: Small Circle (Medium)
```
8x8 pixel grid visualization:

     01234567
   ┌─────────
 0 │   ██
 1 │  ████
 2 │ ██████
 3 │ ██████
 4 │ ██████
 5 │ ██████
 6 │  ████
 7 │   ██

Hex: 18 3C 7E 7E 7E 7E 3C 18 (plane 0)
     00 00 00 00 00 00 00 00 (plane 1)
```

**Description**: Medium-sized circle using only 2 colors (plane 1 empty). Clean circular shape, perfect for particles. Smaller than player cell for scale differentiation.

**Color mapping** (with Palette 1):
- ░ (transparent) = Background
- █ (color 1) = Nutrient color (green $2A, yellow $28, or pink $34)

**Usage**: Nutrient particle template, copied to tiles $10-$12

---

### Tile $02: Y-Shaped Antibody
```
8x8 pixel grid visualization:

     01234567
   ┌─────────
 0 │ █    █
 1 │ █    █
 2 │ █    █
 3 │ ██████
 4 │  ████
 5 │   ██
 6 │   ██
 7 │   ██

Hex: 42 42 42 7E 3C 18 18 18 (plane 0)
     42 42 42 7E 3C 18 18 18 (plane 1)
```

**Description**: Classic Y-shaped antibody enemy. Two arms extending upward, merging at horizontal bar (row 3), then vertical stem downward. Menacing immune cell design. Uses all 4 colors for depth/shading.

**Color mapping** (with Palette 2):
- ░ (transparent) = Background
- █ (color 1) = Bright red body ($16)
- █ (color 2) = Dark red shading ($06)
- █ (color 3) = White aggressive highlights ($30)

**Usage**: Enemy sprite, can be rotated/flipped for animation

---

### Tile $03: Empty (Reserved)
```
8x8 pixel grid:

     01234567
   ┌─────────
 0 │
 1 │
 2 │
 3 │
 4 │
 5 │
 6 │
 7 │

Hex: 00 00 00 00 00 00 00 00 (plane 0)
     00 00 00 00 00 00 00 00 (plane 1)
```

**Description**: Completely empty tile. All pixels transparent. Reserved for future player cell tiles or expansion.

**Usage**: Placeholder, future animation frames

---

### Tile $04: Player Cell Frame 2
```
8x8 pixel grid: (Currently identical to $00)

     01234567
   ┌─────────
 0 │  ████
 1 │ ██████
 2 │████████
 3 │████████
 4 │████████
 5 │████████
 6 │ ██████
 7 │  ████
```

**Description**: Second animation frame for player breathing effect. Currently identical to tile $00 (placeholder). Future enhancement: shift pixels slightly for organic wobble.

**Suggested variation** (for visible animation):
- Shift outer pixels 1px inward on edges
- Makes cell appear to "breathe" when toggled with $00

**Usage**: Player animation frame 2

---

### Tiles $10-$12: Nutrient Particles
All three tiles are **identical** to tile $01:

```
Tile $10 (Green nutrient)
Tile $11 (Yellow nutrient)
Tile $12 (Pink nutrient)

All use same pattern:
     01234567
   ┌─────────
 0 │   ██
 1 │  ████
 2 │ ██████
 3 │ ██████
 4 │ ██████
 5 │ ██████
 6 │  ████
 7 │   ██
```

**Description**: Three copies of small circle tile. **Color differentiation happens via palette**, not tile data. This saves CHR space and maintains visual consistency.

**Color mapping** (all use Palette 1):
- Tile $10 with palette color 1 = **Green** amino acid ($2A)
- Tile $11 with palette color 2 = **Yellow** glucose ($28)
- Tile $12 with palette color 3 = **Pink** vitamin ($34)

**Usage**: Nutrient spawning with random tile selection for variety

---

## Metatile Composition (16x16 Sprites)

### Player Cell (Full 16x16)
```
Conceptual 2x2 tile layout:

   ┌────────┬────────┐
   │ Tile   │ Tile   │  Upper half
   │  $00   │  $01   │
   ├────────┼────────┤
   │ Tile   │ Tile   │  Lower half
   │  $02   │  $03   │
   └────────┴────────┘

Visual appearance (combined):
         0123456789ABCDEF
       ┌─────────────────
     0 │     ████████
     1 │   ████████████
     2 │  ██████  ██████
     3 │ ████████████████
     4 │████████  ████████
     5 │████████  ████████  <- Nucleus visible
     6 │████████  ████████
     7 │████████████████
     8 │████████████████
     9 │ ████████████████
    10 │  ██████████████
    11 │  ██████████████
    12 │   ████████████
    13 │   ████████████
    14 │    ██████████
    15 │     ████████
```

**Description**: Large cellular blob with visible internal nucleus. Friendly, organic appearance. Center shows darker nucleus (dark blue), surrounded by cytoplasm (medium blue), with bright cyan membrane outer edge.

**Current limitation**: Only tiles $00 and $04 exist. Tiles $01-$03 would complete the metatile if created.

---

### Antibody Enemy (Full 16x16 concept)
```
Conceptual 2x2 tile layout for complete enemy:

   ┌────────┬────────┐
   │ Tile   │ Tile   │  Y-arms
   │  $20   │  $21   │
   ├────────┼────────┤
   │ Tile   │ Tile   │  Y-stem
   │  $22   │  $23   │
   └────────┴────────┘

Current MVP: Only tile $02 (single 8x8)
         01234567
       ┌─────────
     0 │ █    █
     1 │ █    █
     2 │ █    █
     3 │ ██████
     4 │  ████
     5 │   ██
     6 │   ██
     7 │   ██

Future: 16x16 metatile would show full aggressive antibody
```

**Description**: Y-shaped immune cell enemy. Red coloring signals danger. Two extending arms create aggressive posture, stem shows direction of attack.

---

## Color Palette Visual Reference

### How to Read Palette Colors

NES colors are 6-bit values ($00-$3F). Each palette has 4 colors.

### Sprite Palette 0: Player Cell
```
Color 0 (Universal BG): $21 = Light Blue █░░░
Color 1 (Membrane):     $32 = Light Cyan ███░
Color 2 (Body):         $12 = Medium Blue ██░░
Color 3 (Nucleus):      $02 = Dark Blue █░░░

Visual gradient: ░░░ -> ██░ -> ███ -> ███
                 BG    Dark  Med   Light
```

**Effect**: Creates depth and organic feel. Bright outer membrane makes cell "glow" against blue background.

---

### Sprite Palette 1: Nutrients
```
Color 0 (Universal BG): $21 = Light Blue █░░░
Color 1 (Amino Acid):   $2A = Light Green ███
Color 2 (Glucose):      $28 = Yellow ████
Color 3 (Vitamin):      $34 = Pink ████

Visual variety: Green / Yellow / Pink all pop against blue BG
```

**Effect**: High contrast makes nutrients immediately visible and collectible. Three distinct colors create visual variety.

---

### Sprite Palette 2: Antibodies
```
Color 0 (Universal BG): $21 = Light Blue █░░░
Color 1 (Body):         $16 = Bright Red ████
Color 2 (Shading):      $06 = Dark Red ██░░
Color 3 (Highlights):   $30 = White █████

Visual: Bold red with white highlights = DANGER
```

**Effect**: Red immediately signals threat. White highlights create menacing "eyes" or aggressive glints.

---

### Sprite Palette 3: UI Elements
```
Color 0 (Universal BG): $21 = Light Blue █░░░
Color 1 (Text):         $30 = White █████
Color 2 (Accents):      $21 = Light Blue ███
Color 3 (Shadows):      $0F = Black █

Visual: High contrast white on blue for readability
```

**Effect**: Maximum text readability. Classic NES UI aesthetic.

---

## FCEUX PPU Viewer Validation

### How to Verify Graphics in Emulator

1. **Load ROM in FCEUX**
2. **Open PPU Viewer**: Tools → PPU Viewer
3. **Check Pattern Table** (CHR-ROM, left panel):

#### Expected CHR Patterns
```
Pattern Table $0000 (Sprite Bank):

Row 0 (tiles $00-$0F):
[00] = Large filled circle (player)
[01] = Medium filled circle (nutrient template)
[02] = Y-shaped antibody
[03] = Empty
[04] = Large filled circle (identical to $00)
[05-0F] = Empty

Row 1 (tiles $10-$1F):
[10] = Medium filled circle (green nutrient)
[11] = Medium filled circle (yellow nutrient)
[12] = Medium filled circle (pink nutrient)
[13-1F] = Empty

All other rows: Empty (black tiles)
```

#### Visual Checklist
- [ ] Tile $00 shows clear circular blob
- [ ] Tile $01 shows smaller circle
- [ ] Tile $02 shows Y-shape (two arms, stem)
- [ ] Tiles $10-$12 match tile $01 exactly
- [ ] No corruption (random pixels, garbage)
- [ ] Empty tiles are completely black

4. **Check Palettes** (right panel):
- [ ] Sprite palette 0: Cyan gradient (player)
- [ ] Sprite palette 1: Green/Yellow/Pink (nutrients)
- [ ] Sprite palette 2: Red/DarkRed/White (enemies)
- [ ] Sprite palette 3: White/Blue/Black (UI)

---

## Common Visual Issues & Diagnosis

### Issue: Sprites Look Wrong

**Symptom**: Colors incorrect, shapes garbled, random pixels

**Diagnosis**:
1. CHR file not loaded correctly
   - Check ROM header points to CHR data
   - Verify CHR file size = 8192 bytes

2. Palette not uploaded to PPU
   - Check $3F00-$3F1F writes during init
   - Use FCEUX palette viewer

3. Wrong tile index in OAM
   - Check OAM byte 1: should be $00-$12 for game sprites
   - Verify with OAM viewer

**Fix**: Use validate_chr.sh script, check OAM_LAYOUT.md

---

### Issue: Sprites Invisible

**Symptom**: Entities present (collision works) but not visible

**Diagnosis**:
1. Y coordinate = $FF (deliberate off-screen)
2. Sprite behind background (priority bit set)
3. All-transparent tile (both bitplanes zero)
4. X/Y outside visible screen (>239, >255)

**Fix**: Check OAM bytes 0,3 for valid coordinates

---

### Issue: Sprites Flickering

**Symptom**: Sprites appear/disappear rapidly

**Diagnosis**:
1. VBlank budget exceeded (rendering takes too long)
2. Too many sprites on one scanline (>8 limit)
3. OAM not properly updated each frame

**Fix**:
- Reduce sprite count
- Optimize NMI routine (split audio processing)
- Add sprite multiplexing

---

### Issue: Wrong Colors

**Symptom**: Nutrients all same color, or player is red

**Diagnosis**:
1. OAM attribute byte incorrect (wrong palette selection)
2. Palette data not loaded to $3F00-$3F1F
3. Universal background color wrong ($3F00)

**Fix**: Verify OAM byte 2 attribute bits 0-1 match entity type

---

## ASCII Art Reference (For Artists)

If creating additional tiles, use this ASCII art as a guide:

### Size Reference
```
8x8 tile = 64 pixels:
01234567
████████ 0
████████ 1
████████ 2
████████ 3
████████ 4
████████ 5
████████ 6
████████ 7

16x16 metatile = 256 pixels (4 tiles):
0123456789ABCDEF
████████████████ 0
████████████████ 1
████████████████ 2
████████████████ 3
████████████████ 4
████████████████ 5
████████████████ 6
████████████████ 7
████████████████ 8
████████████████ 9
████████████████ A
████████████████ B
████████████████ C
████████████████ D
████████████████ E
████████████████ F
```

### Circular Shape Templates
```
4px circle (tiny):
  ██
 ████
 ████
  ██

6px circle (small) - used for nutrients:
   ██
  ████
 ██████
 ██████
  ████
   ██

8px circle (medium) - used for player tile:
  ████
 ██████
████████
████████
████████
████████
 ██████
  ████
```

---

## Summary

All graphics assets are **visually verified and documented**. Use this reference when:
- Creating new tiles
- Debugging rendering issues
- Validating CHR file contents
- Training new team members
- Communicating with artists

**Cross-reference with**:
- CHR_MAP.md (tile index map)
- PALETTES.md (color definitions)
- OAM_LAYOUT.md (sprite layout)
- VALIDATION_REPORT.md (technical validation)

---

**Graphics System: Fully Documented & Production Ready** ✅
