// NES-inspired color palette
// Subset of the NES 54-color palette, curated for Maripoga's Errand
const PALETTE = {
  // Backgrounds
  BLACK:       '#0f0f0f',
  DARK_BG:     '#0f0f1a',
  GRID_LINE:   '#1a1a2e',

  // Neutral tiles
  NEUTRAL:     '#2a2a3a',
  NEUTRAL_ALT: '#252535', // Slight variation for grid texture

  // Maripoga Green
  GREEN:       '#4ade80',
  GREEN_DARK:  '#1a5c35',
  GREEN_MID:   '#2d8c50',
  GREEN_LIGHT: '#6bee9e',

  // Red Frog
  RED:         '#ef4444',
  RED_DARK:    '#5c1a1a',
  RED_MID:     '#b83030',

  // Purple Frog
  PURPLE:      '#a855f7',
  PURPLE_DARK: '#3d1a5c',
  PURPLE_MID:  '#7c3aed',

  // Blue Frog
  BLUE:        '#3b82f6',
  BLUE_DARK:   '#1a2d5c',
  BLUE_MID:    '#2563eb',

  // Hazards
  SPIKE:       '#f59e0b',
  SPIKE_DARK:  '#3a2a0a',
  WATER:       '#06b6d4',
  WATER_DARK:  '#0a3d47',

  // HUD / Text
  WHITE:       '#ffffff',
  HUD_BG:      '#111111',
  HUD_TEXT:    '#d0d0d0',
  SCORE_COLOR: '#4ade80',

  // Sky colors (day/night cycle)
  SKY_DAY:       '#4a90d9',  // Medium sky blue - HUD background daytime
  SKY_DAY_DARK:  '#3a7bc8',  // Slightly darker sky - reed area daytime
  SKY_NIGHT:     '#0a0a15',  // Near-black with slight blue - HUD nighttime
  SKY_NIGHT_DARK:'#080b12',  // Dark - reed area nighttime

  // Water / Swamp background
  WATER_BG:    '#0a1520',
  WATER_DAY:   '#1a4060',    // Lighter/bluer water for daytime
  NEUTRAL_HI:  '#353545',

  // Decoration — reeds
  REED_GREEN:  '#1a3d2e',
  REED_BROWN:  '#3a2810',

  // Smart Frog
  SMART:       '#e0e0e0',
  SMART_DARK:  '#4a4a5a',
  SMART_MID:   '#8a8a9a',

  // Snake (orange)
  SNAKE_BODY:       '#e87820',
  SNAKE_BODY_DARK:  '#8a4a10',
  SNAKE_PATTERN:    '#f5a040',

  // Ladybug (red-tinted snail)
  LADYBUG_RED:      '#ef4444',
  LADYBUG_RED_DARK: '#5c1a1a',

  // Character accents
  SKIN:        '#f5c87a',
  SCARF:       '#ef4444',
  EYE_WHITE:   '#ffffff',
  EYE_PUPIL:   '#0f0f0f',
  ENEMY_EYE:   '#ffff00',

  // Bonus item colors
  GOLD:        '#ffd700',
  GOLD_DARK:   '#b8860b',
  PINK:        '#ff69b4',
  PINK_DARK:   '#c71585',
  CYAN:        '#00e5ff',
  CYAN_DARK:   '#007c8a',
};

// Map tile states to colors
const TILE_COLORS = {
  [TILE_NEUTRAL]: PALETTE.NEUTRAL,
  [TILE_GREEN]:   PALETTE.GREEN_DARK,
  [TILE_RED]:     PALETTE.RED_DARK,
  [TILE_PURPLE]:  PALETTE.PURPLE_DARK,
  [TILE_BLUE]:    PALETTE.BLUE_DARK,
  [TILE_SPIKE]:   PALETTE.SPIKE_DARK,
  [TILE_WATER]:   PALETTE.WATER_DARK,
  [TILE_ZOMBIE]:  '#3a3a4a',
  [TILE_SMART]:   PALETTE.SMART_DARK,
  [TILE_HALFCLEAR]: '#454560',
};

// Brighter versions for claimed-tile borders/accents
const TILE_ACCENT_COLORS = {
  [TILE_GREEN]:   PALETTE.GREEN_MID,
  [TILE_RED]:     PALETTE.RED_MID,
  [TILE_PURPLE]:  PALETTE.PURPLE_MID,
  [TILE_BLUE]:    PALETTE.BLUE_MID,
  [TILE_SMART]:   PALETTE.SMART_MID,
};
