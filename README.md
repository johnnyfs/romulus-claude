# MITOSIS PANIC - NES Game

An arcade-style NES game where you control microscopic cells undergoing mitosis.

## Game Concept
Play as a microscopic organism in a petri dish. Collect nutrients while avoiding hostile antibodies. Every time you absorb enough nutrients, you undergo mitosis - splitting into multiple cells that all move together with a single input. The challenge increases as you control more cells simultaneously.

## Team Structure
- **Game Designer**: Overall creative direction
- **Art Director**: Visual and audio coherence
  - Image Collector: NES-compatible art assets
  - Sound Designer: NES-compatible audio
- **Chief Engineer**: Technical implementation
  - Sound Engineer: Sound player & SFX system
  - Game Engineer: Main game loop
  - QA Engineer: Testing & bug detection

## Repository Structure
```
/graphics     - Sprite sheets, tile maps, CHR data
/audio        - Music and SFX files
/src          - Source code (assembly/C)
/build        - Build scripts and output ROM
/docs         - Technical documentation
```

## Build Requirements
- cc65 (6502 cross-compiler)
- NES emulator for testing (FCEUX recommended)

## Game Design
- **Objective**: Collect 30 nutrients per level without dying
- **Controls**: D-pad moves all cells simultaneously
- **Mitosis**: Occurs every 10 nutrients collected
- **Difficulty**: More/faster antibodies each level, more cells to control
- **Game Over**: Any cell touching an antibody

## Technical Specs
- Single-screen arena (256x240)
- Max 8 player cells on screen
- Multiple antibody types with patrol AI
- Random nutrient spawning
- Score tracking and level progression
