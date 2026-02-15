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

  // Character accents
  SKIN:        '#f5c87a',
  SCARF:       '#ef4444',
  EYE_WHITE:   '#ffffff',
  EYE_PUPIL:   '#0f0f0f',
  ENEMY_EYE:   '#ffff00',
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
};

// Brighter versions for claimed-tile borders/accents
const TILE_ACCENT_COLORS = {
  [TILE_GREEN]:   PALETTE.GREEN_MID,
  [TILE_RED]:     PALETTE.RED_MID,
  [TILE_PURPLE]:  PALETTE.PURPLE_MID,
  [TILE_BLUE]:    PALETTE.BLUE_MID,
};
