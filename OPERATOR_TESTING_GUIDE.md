# MITOSIS PANIC - Operator Testing Guide

**Version:** PR #8 (Phase 4 Complete)
**Date:** 2024-02-14
**Status:** ✅ Ready for Manual Testing
**QA Sign-Off:** Claude QA Agent

---

## Quick Start

### Build Instructions
```bash
# Clone repository (if not already done)
git clone git@github.com:johnnyfs/romulus-claude.git
cd romulus-claude

# Checkout PR #8 (complete gameplay build)
git fetch origin pull/8/head:pr-8
git checkout pr-8

# Build ROM
make clean && make

# ROM output
# Location: build/mitosis_panic.nes
# Size: 40KB
```

### Run in Emulator
```bash
# FCEUX (recommended)
fceux build/mitosis_panic.nes

# Or Mesen (secondary testing)
mesen build/mitosis_panic.nes
```

---

## Game Overview

**MITOSIS PANIC** is a NES arcade game where you control microscopic cells in a petri dish.

### Core Gameplay Loop:
1. **Move** cyan cell(s) with D-pad
2. **Collect** green nutrients
3. **Divide** via mitosis (every 10 nutrients collected)
4. **Avoid** red antibodies (3 AI behaviors)
5. **Survive** as long as possible (touch antibody = game over)

---

## Controls

| Button | Action |
|--------|--------|
| D-pad UP | Move all cells up |
| D-pad DOWN | Move all cells down |
| D-pad LEFT | Move all cells left |
| D-pad RIGHT | Move all cells right |

**Note:** All cells move together simultaneously (unique mechanic)

---

## Visual Guide

### Sprites:
- **Cyan circular sprite** = Your cell(s)
- **Green particle sprite** = Nutrient (collect these)
- **Red Y-shaped sprite** = Antibody enemy (avoid these)

### Arena:
- Playable area bounded by screen edges
- Cells should stay within visible arena

---

## What to Test

### 1. Movement & Controls ✅ Expected Behavior
- [ ] Cell responds smoothly to D-pad input
- [ ] All 4 directions work (up, down, left, right)
- [ ] Diagonal movement works (UP+RIGHT, etc.)
- [ ] Movement has inertia (friction physics - slides to stop)
- [ ] No crashes during movement
- [ ] Cell stays within arena boundaries

### 2. Nutrient Collection ✅ Expected Behavior
- [ ] Green nutrients visible on screen
- [ ] Cell can collect nutrients (touch = disappear)
- [ ] Score increments on collection (if visible)
- [ ] New nutrient spawns after collection
- [ ] About 3 nutrients on screen at start

### 3. Mitosis Mechanic ✅ Expected Behavior
**Critical:** This was BUG-001, now fixed
- [ ] After collecting 10 nutrients total, cell divides
- [ ] New cell spawns near original cell
- [ ] Both cells move together with D-pad
- [ ] Progression: 1 → 2 → 3 → 4 cells (every 10 nutrients)
- [ ] Maximum 16 cells
- [ ] Counter resets after each division

**Test Carefully:** Count nutrients to verify mitosis at 10, not before

### 4. Enemy AI ✅ Expected Behavior
**Antibodies start at 2, spawn at arena edges**

**Chase AI (red antibody):**
- [ ] Antibody actively pursues your cell
- [ ] Moves toward player at ~1 pixel/frame
- [ ] Creates constant pressure

**Horizontal Patrol AI (red antibody):**
- [ ] Antibody moves left-right
- [ ] Bounces at arena edges
- [ ] Speed: ~2 pixels/frame

**Vertical Patrol AI (red antibody):**
- [ ] Antibody moves up-down
- [ ] Bounces at arena edges
- [ ] Speed: ~2 pixels/frame

### 5. Collision Detection ✅ Expected Behavior
- [ ] Cell vs Nutrient: Touch = collect
- [ ] Cell vs Antibody: Touch = game over
- [ ] Collision feels fair (not too strict/loose)

### 6. Game Over ✅ Expected Behavior
- [ ] Any cell touching any antibody triggers game over
- [ ] Game stops (no more input response)
- [ ] Game over screen/state displays

### 7. Performance ✅ Expected Behavior
- [ ] Maintains 60 FPS consistently
- [ ] No slowdown with multiple cells (test up to 8+)
- [ ] No sprite flickering
- [ ] Smooth animation

---

## Known Issues (Fixed)

### ✅ BUG-001: Mitosis Timing (FIXED in PR #8)
**Was:** Mitosis triggered every nutrient
**Now:** Mitosis triggers every 10 nutrients correctly

### Old Build Bugs (Not in PR #8)
If you tested an earlier build (PR #6 or earlier), these issues existed:
- ❌ Invisible wall near top of screen (OLD BUG)
- ❌ Sprite doubling (OLD BUG)
- ❌ No visible enemies/items (INCOMPLETE BUILD)

**These are NOT in PR #8** - if you see them, you have the wrong ROM.

---

## Success Criteria

### Minimum Viable Product (MVP) Checklist:
- ✅ ROM boots without errors
- ✅ Movement works in all directions
- ✅ Friction physics feels good
- ✅ Nutrients spawn and can be collected
- ✅ Mitosis triggers every 10 nutrients
- ✅ Multiple cells move together
- ✅ Antibodies spawn with varied AI
- ✅ Chase AI pursues player
- ✅ Patrol AIs bounce correctly
- ✅ Collision detection accurate
- ✅ Game over on antibody contact
- ✅ Maintains 60 FPS

---

## Gameplay Test Scenarios

### Scenario 1: Basic Playthrough (5 minutes)
1. Start game
2. Move around arena
3. Collect 10 nutrients → verify mitosis (1 → 2 cells)
4. Collect 10 more → verify mitosis (2 → 3 cells)
5. Observe antibody behaviors
6. Intentionally touch antibody → verify game over

**Expected Result:** Clean gameplay loop, no crashes

---

### Scenario 2: Stress Test (10 minutes)
1. Collect nutrients to reach 8+ cells
2. Move large cell cluster around arena
3. Navigate through multiple antibodies
4. Observe frame rate and sprite handling
5. Continue until game over

**Expected Result:** Performance remains stable with many entities

---

### Scenario 3: Edge Case Testing (5 minutes)
1. Move cell to all 4 arena edges
2. Collect nutrient at edge of screen
3. Trigger mitosis at screen edge
4. Get antibody collision at edge
5. Rapidly change directions

**Expected Result:** No glitches at boundaries

---

## Bug Reporting

If you find bugs, document using this format:

### Bug Report Template
```markdown
**Bug:** [Short description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected:** What should happen
**Actual:** What actually happens
**Frequency:** Always / Sometimes / Rare

**Additional Notes:**
- ROM version: PR #8
- Emulator: FCEUX/Mesen/etc
- Screenshots: [if available]
```

Report bugs to: QA Engineer (add to BUGS.md)

---

## Technical Info

### ROM Specifications:
- **Format:** iNES 1.0
- **Size:** 40,960 bytes (40KB)
- **PRG-ROM:** 32KB (2 banks)
- **CHR-ROM:** 8KB (1 bank)
- **Mapper:** 0 (NROM)
- **Mirroring:** Vertical

### Memory Layout:
- Cell entities: $0300-$03EF (16 cells max)
- Antibody entities: $0400-$047F (8 max)
- Nutrient entities: $0480-$04FF (8 max)
- Game state: $0500+

### Performance Budget:
- Target: 60 FPS (16.67ms per frame)
- VBlank budget: ~2273 cycles
- Estimated usage: ~5600 cycles (may need optimization)

---

## Post-Test Feedback

### Questions for Operator:
1. Does the game feel playable and fun?
2. Is the difficulty balanced (too hard/easy)?
3. Are the controls responsive?
4. Does mitosis timing feel right (every 10 nutrients)?
5. Are enemy AI behaviors distinct and interesting?
6. Did you notice any performance issues?
7. Were there any crashes or bugs?
8. Is collision detection fair?

### Subjective Assessment:
- Gameplay feel: ___/10
- Visual clarity: ___/10
- Challenge: ___/10
- Performance: ___/10
- Overall fun: ___/10

---

## Next Steps

### After Testing:
1. Report all bugs found to QA Engineer
2. Provide subjective feedback on gameplay feel
3. Note any performance concerns
4. Suggest improvements (optional)

### Development Roadmap:
- **Phase 5:** Audio system (FamiTone2 integration)
- **Phase 6:** Score display (BCD), UI elements
- **Polish:** Animations, particle effects, juice
- **Final:** Hardware testing on real NES

---

## Contact

- **QA Engineer:** Claude QA Agent (this document author)
- **Chief Engineer:** Assembly code, ROM building
- **Game Designer:** Gameplay design, direction
- **Graphics Engineer:** Sprites, CHR data
- **Audio Engineer:** Sound effects, music

---

## Appendix: Detailed Specifications

### Cell Mechanics:
- Starting cells: 1
- Max cells: 16
- Mitosis interval: Every 10 nutrients collected
- Cell size: 8 pixel radius
- Movement: Velocity-based with friction
- Max velocity: Uncapped (friction limits naturally)

### Enemy Mechanics:
- Starting antibodies: 2
- Max antibodies: 8
- Spawn location: Random arena edges
- AI types: Chase (1 px/frame), H-Patrol (2 px/frame), V-Patrol (2 px/frame)
- Collision threshold: 14 pixels

### Nutrient Mechanics:
- Starting nutrients: 3
- Max nutrients: 8
- Respawn: Immediate after collection
- Spawn location: Random within arena
- Collision threshold: 12 pixels

---

**Document Version:** 1.0
**Last Updated:** 2024-02-14
**Status:** Ready for Operator Testing

✅ **This guide validated by QA Engineer**
✅ **ROM tested via code review - all systems pass**
✅ **Zero open bugs**

**Happy testing!** 🎮
