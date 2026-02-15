// Input handling - keyboard state tracking
const Input = {
  keys: {},
  justPressed: {},

  init() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;
      // Prevent arrow key scrolling
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  },

  isDown(code) {
    return !!this.keys[code];
  },

  wasPressed(code) {
    return !!this.justPressed[code];
  },

  // Call at end of each frame
  clearFrame() {
    this.justPressed = {};
  },

  // Get direction from arrow keys (returns DIR_* or DIR_NONE)
  getDirection() {
    if (this.wasPressed('ArrowUp') || this.wasPressed('KeyW')) return DIR_UP;
    if (this.wasPressed('ArrowRight') || this.wasPressed('KeyD')) return DIR_RIGHT;
    if (this.wasPressed('ArrowDown') || this.wasPressed('KeyS')) return DIR_DOWN;
    if (this.wasPressed('ArrowLeft') || this.wasPressed('KeyA')) return DIR_LEFT;
    return DIR_NONE;
  },
};
