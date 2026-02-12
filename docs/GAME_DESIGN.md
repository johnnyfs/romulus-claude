# MITOSIS PANIC - Detailed Game Design Document

## Core Mechanics

### Player Control
- D-Pad: Move all active cells simultaneously in 8 directions
- All cells share the same velocity and direction
- Cells have inertia (slight delay in stopping)
- Cells bounce slightly off screen edges

### Mitosis System
- Nutrient counter starts at 0
- Each nutrient collected increments counter
- At 10 nutrients: First mitosis (1 → 2 cells)
- At 20 nutrients: Second mitosis (2 → 4 cells)
- At 30 nutrients: Level complete!
- Mitosis animation: cell pauses, bulges, splits into two
- New cell appears at same position, then both drift apart slightly

### Enemies: Antibodies
Three types with distinct behaviors:

1. **Wanderer** (Red)
   - Random walk pattern with direction changes
   - Slow speed, increases each level
   - Most common type

2. **Patroller** (Dark Red)
   - Follows predefined paths (square, circle, figure-8)
   - Medium speed, increases each level
   - Predictable but faster

3. **Seeker** (Crimson)
   - Moves toward nearest player cell
   - Appears from level 3+
   - Dangerous but can be baited

### Nutrients
- Spawn randomly in safe zones (away from antibodies)
- Pulse/glow animation to attract attention
- Despawn after 10 seconds if not collected
- New one spawns immediately after collection or despawn

### Collision
- Player cell + Antibody = Game Over
- Player cell + Nutrient = Collect (+1 to counter, +10 score)
- Cells cannot overlap (push each other slightly)
- Antibodies pass through each other

### Level Progression
**Level 1**: 3 Wanderers, slow speed
**Level 2**: 4 Wanderers, 1 Patroller, medium speed
**Level 3**: 4 Wanderers, 2 Patrollers, 1 Seeker, faster
**Level 4**: 5 Wanderers, 2 Patrollers, 2 Seekers, very fast
**Level 5+**: Add 1 enemy per level, max speed reached at level 7

### Scoring
- Nutrient collected: 10 points
- Level complete: 100 points × level number
- Survival bonus: 1 point per frame survived
- Perfect level (no close calls): 500 bonus

### Visual Feedback
- Screen flash on mitosis
- Cell "breathing" animation (pulsing size)
- Danger indicator when antibody is near
- Particle effects on nutrient collection

### Audio Feedback
- Ambient lab background music (looping)
- Bloop sound on nutrient collect (pitch rises with combo)
- Warning beep when antibody within danger radius
- Triumphant jingle on mitosis
- Victory fanfare on level complete
- Game over sound

## Controls
- D-Pad: Move
- Start: Pause/Resume
- Select: (unused, reserved for future modes)

## Difficulty Curve
The game becomes harder through:
1. More antibodies on screen
2. Faster antibody movement
3. More cells to control simultaneously (harder to avoid obstacles)
4. Introduction of Seeker enemies that actively hunt you

The unique challenge is that YOU make the game harder by succeeding (more cells = larger hitbox area).
