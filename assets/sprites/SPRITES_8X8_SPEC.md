# 8x8 Sprite Specifications for MITOSIS PANIC

## CRITICAL SPECIFICATION CHANGE

Per DESIGN_SUMMARY.md, **ALL SPRITES MUST BE 8x8 SINGLE SPRITES**.

Previous 16x16 sprites are obsolete. This document defines the corrected 8x8 specifications.

## Player Cell (8x8, Cyan Blob)

**Size**: 8x8 pixels
**Animation**: 4 frames (breathing cycle)
**Colors**:
- Cyan (#00C8FF) - outline
- Light Cyan (#80E4FF) - main body
- Dark Cyan (#0088AA) - nucleus

**ASCII Patterns** (. = transparent, C = cyan, L = light cyan, D = dark cyan):

### Frame 1 (Expanded):
```
..CCCC..
.CLLLCC.
CLLLLLCC
CLLDDLCC
CLLDDLLC
CLLLLLCC
.CCLLCC.
..CCCC..
```

### Frame 2 (Mid-breath):
```
..CCCC..
.CLLLC..
CLLLLLC.
CLLDDLC.
CLLDDLC.
CLLLLLC.
.CCLLC..
..CCC...
```

### Frame 3 (Contracted):
```
........
..CCCC..
.CLLLC..
.CLDDC..
.CLDDC..
.CLLLC..
..CCC...
........
```

### Frame 4 (Expanding - same as Frame 2):
```
..CCCC..
.CLLLC..
CLLLLLC.
CLLDDLC.
CLLDDLC.
CLLLLLC.
.CCLLC..
..CCC...
```

## Antibody Sprites (8x8, Red Y-shaped)

**Size**: 8x8 pixels
**Animation**: Static (one frame per type)
**Colors**:
- Red (#FF0000) - main body
- Dark Red (#C00000) - shading
- Black (#000000) - details/outline

**ASCII Patterns** (. = transparent, R = red, D = dark red, B = black):

### Type 1 (Horizontal Patrol):
```
..R..R..
..R..R..
..RRRR..
..RDDRR.
...RDDR.
...RDR..
...RR...
...R....
```

### Type 2 (Vertical Patrol):
```
...R....
...RR...
...RDR..
...RDDR.
..RDDRR.
..RRRR..
..R..R..
..R..R..
```

### Type 3 (Diagonal Sweep - spikier):
```
..R..R..
.RR.RR..
..RRRR..
..RDDRR.
...RDDR.
...RDR..
...RR...
...R....
```

### Type 4 (Circular Orbit - rounder):
```
.R....R.
..R..R..
..RRRR..
..RDDRR.
...RDDR.
...RDR..
...RR...
...R....
```

## Nutrient Particles (8x8, Green)

**Size**: 8x8 pixels (ALREADY CORRECT - no changes needed)
**Animation**: 2 frames (pulse)
**Colors**:
- Green (#00FF00)
- Lime (#80FF80)

These sprites already exist at the correct 8x8 size.

## Implementation Status

- [ ] Player cell 8x8 sprites (4 frames)
- [ ] Antibody 8x8 sprites (4 types)
- [x] Nutrient 8x8 sprites (2 frames) - already exist

## Notes

- All sprites are single 8x8 tiles (not 2x2 metatiles)
- Maximum 4 colors per sprite including transparency
- NES hardware compatible
- Optimized for simultaneous display of up to 4 player cells
