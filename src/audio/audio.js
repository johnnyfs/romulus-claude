// Chiptune audio engine using Web Audio API
// NES-like: pulse (square) waves, triangle, noise
const Audio = {
  ctx: null,
  enabled: false,
  masterGain: null,

  init() {
    // Create audio context on first user interaction
    const startAudio = () => {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.enabled = true;
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('click', startAudio);
    };
    window.addEventListener('keydown', startAudio);
    window.addEventListener('click', startAudio);
  },

  // Play a simple square wave beep
  playTone(freq, duration, type) {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // Sound effects - stubs to be expanded by Audio agent
  sfxHop() {
    this.playTone(220, 0.08, 'square');
    this.playTone(330, 0.06, 'square');
  },

  sfxClaim() {
    this.playTone(440, 0.05, 'square');
  },

  sfxCapture() {
    this.playTone(523, 0.1, 'square');
    setTimeout(() => this.playTone(659, 0.1, 'square'), 100);
    setTimeout(() => this.playTone(784, 0.15, 'square'), 200);
  },

  sfxDeath() {
    this.playTone(440, 0.15, 'square');
    setTimeout(() => this.playTone(330, 0.15, 'square'), 150);
    setTimeout(() => this.playTone(220, 0.2, 'square'), 300);
    setTimeout(() => this.playTone(110, 0.3, 'square'), 450);
  },

  sfxWaveClear() {
    this.playTone(523, 0.1, 'triangle');
    setTimeout(() => this.playTone(659, 0.1, 'triangle'), 100);
    setTimeout(() => this.playTone(784, 0.1, 'triangle'), 200);
    setTimeout(() => this.playTone(1047, 0.2, 'triangle'), 300);
  },
};
