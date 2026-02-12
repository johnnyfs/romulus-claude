# MITOSIS PANIC - NES Audio Specifications

## Audio Direction
**Theme**: Upbeat arcade energy with subtle biological/organic character
**Reference**: Dr. Mario (medical/biological theme), Pac-Man (arcade energy), Bubble Bobble (playful charm)
**Mood**: Engaging and fun, not scary despite biological theme

## NES Audio Technical Constraints
- **Pulse 1 & 2**: Square waves with 4 duty cycles (12.5%, 25%, 50%, 75%)
- **Triangle**: Triangle wave (bass/melody)
- **Noise**: White/periodic noise (percussion/effects)
- **DMC**: Sample channel (optional percussion/bass)

## Sound Effects

### 1. CELL MITOSIS (Cell Division)
**Description**: Satisfying organic "split" sound
- **Pulse 1**: Quick rising pitch sweep (C4 → C5, 0.1s)
- **Pulse 2**: Same sweep delayed by 0.05s (creates splitting effect)
- **Triangle**: Low pop (C2, quick decay)
- **Feel**: Like a bubble popping but more substantial, rewarding

### 2. NUTRIENT COLLECTION
**Description**: Positive pickup sound, 3 variants for variety
- **Variant A (Green)**: Pulse 1 ascending arpeggio (E4-G4-C5, 0.15s)
- **Variant B (Yellow)**: Pulse 1 single bright tone (A4, 0.1s)
- **Variant C (Pink)**: Pulse 1 descending chirp (C5-A4, 0.12s)
- **All**: Triangle provides subtle bass note (C3, 0.08s)
- **Feel**: Cheerful, encouraging continuous collection

### 3. ANTIBODY HIT (Damage)
**Description**: Warning sound without being too harsh
- **Pulse 1**: Dissonant falling sweep (A4 → F3, 0.2s)
- **Noise**: Short burst (0.15s)
- **Triangle**: Low rumble (C2, 0.2s)
- **Feel**: Dangerous but arcade-appropriate, not gratuitous

### 4. GAME OVER
**Description**: Sad but gentle defeat theme
- **Duration**: ~2 seconds
- **Melody**: Descending minor progression (Pulse 1 lead)
- **Bass**: Triangle follows melody
- **Feel**: "The cells didn't make it" - somber but not punishing

## Background Music

### MAIN THEME - "Cellular Division"
**Structure**: Looping 32-bar phrase with A-B-A-B' structure
**Tempo**: 140 BPM (upbeat arcade pace)
**Key**: C Major (bright, accessible)
**Dynamics**: Builds intensity through harmonies, not volume

#### Section A (8 bars) - Primary Melody
- **Pulse 1**: Main melody - bouncy 8th note patterns with biological "burbling" feel
  - Motif uses steps and small jumps (C-D-E-G pattern)
  - Slight swing timing for organic feel
- **Pulse 2**: Harmony/countermelody in 3rds/6ths above
- **Triangle**: Bass line - walking pattern following chord changes (C-F-G-C)
- **Noise**: Light hi-hat pattern on off-beats

#### Section B (8 bars) - Development
- **Pulse 1**: Melody moves to higher register (more urgent)
- **Pulse 2**: Rhythmic staccato accompaniment
- **Triangle**: More active bass (arpeggiated patterns)
- **Feel**: Tension building, cells multiplying

#### Return A (8 bars) - Callback
- Same as first A section

#### Section B' (8 bars) - Variation & Loop Prep
- **Pulse 1**: Melody variation with trill ornaments
- **Triangle**: Walking bass leads back to C for clean loop
- **Last 2 bars**: Brief breakdown (just triangle + noise) before loop restarts

**Overall Feel**:
- Cheerful but with subtle intensity
- Organic "bubbling" rhythm evokes cellular activity
- Memorable hook that won't grate after multiple plays
- Smooth loop point for endless gameplay

### DIFFICULTY RAMP MUSIC (Optional)
When game speeds up significantly:
- Same melody, tempo increases to 160 BPM
- Add more aggressive noise channel percussion
- Pulse 2 switches to more urgent rhythmic patterns

## Audio Mix Balance
- **Priority 1**: SFX (mitosis, damage) - must cut through music clearly
- **Priority 2**: Background music - constant but not overwhelming
- **Channel allocation during gameplay**:
  - Pulse 1: Usually music melody, briefly interrupts for SFX
  - Pulse 2: Music harmony, can share with longer SFX
  - Triangle: Bass line, shares with low SFX
  - Noise: Percussion + damage effects

## Implementation Notes
- All SFX should be short (<0.3s) to avoid interrupting gameplay flow
- Music should duck slightly when important SFX play
- Use NES envelope controls for organic "attack-decay" on cell sounds
- Avoid harsh square wave timbres - prefer 25% or 50% duty cycles for softer tone
