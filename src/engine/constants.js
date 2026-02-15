// Maripoga's Errand - Core Constants
// NES resolution: 256x240
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const TILE_SIZE = 16;
const GRID_COLS = 16;  // 256 / 16
const GRID_ROWS = 14;  // 14 playable rows (row 0 = HUD)
const HUD_HEIGHT = TILE_SIZE; // Top 16px for HUD
const SCALE = 3; // CSS scale factor for the canvas

// Tile states
const TILE_NEUTRAL = 0;
const TILE_GREEN = 1;   // Maripoga's color
const TILE_RED = 2;     // Red frog
const TILE_PURPLE = 3;  // Purple frog
const TILE_BLUE = 4;    // Blue frog
const TILE_SPIKE = 5;   // Hazard
const TILE_WATER = 6;   // Hazard
const TILE_SNAIL = 7;   // Snail entity
const TILE_ZOMBIE = 8;  // Zombie frog (though they use TILE_NEUTRAL for their tiles)

// Directions
const DIR_NONE = -1;
const DIR_UP = 0;
const DIR_RIGHT = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 3;

const DIR_DX = [0, 1, 0, -1];
const DIR_DY = [-1, 0, 1, 0];

// Game states
const STATE_TITLE = 0;
const STATE_PLAYING = 1;
const STATE_WAVE_CLEAR = 2;
const STATE_DYING = 3;
const STATE_GAME_OVER = 4;
const STATE_PAUSED = 5;

// Wave clear sub-states
const CLEAR_SHOW_MESSAGE = 0;
const CLEAR_BONUS_FILL = 1;
const CLEAR_SHOW_WAVE = 2;

// Timing
const HOP_DURATION = 200; // ms for hop animation
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
