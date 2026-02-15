// Chiptune audio engine using Web Audio API
// NES-like: pulse (square) waves, triangle, noise
const Audio = {
  ctx: null,
  enabled: false,
  masterGain: null,
  musicNodes: null, // For background music loop

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

  // Helper: play a note with envelope
  playNote(freq, startTime, duration, type, volume = 0.15, attack = 0.01, release = 0.05) {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;

    // ADSR envelope
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + startTime + attack);
    gain.gain.linearRampToValueAtTime(volume * 0.7, this.ctx.currentTime + startTime + duration - release);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  },

  // Helper: create noise buffer for percussion
  createNoiseBuffer(duration) {
    if (!this.enabled) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  },

  // Helper: play noise burst
  playNoise(startTime, duration, volume = 0.1) {
    if (!this.enabled) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(duration);
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(this.ctx.currentTime + startTime);
  },

  // Quick bouncy hop - two rapid ascending notes
  sfxHop() {
    this.playNote(220, 0, 0.05, 'square', 0.12, 0.005, 0.02);
    this.playNote(330, 0.04, 0.04, 'square', 0.1, 0.005, 0.02);
  },

  // Satisfying tile claim ping
  sfxClaim(isEnemy = false) {
    const freq = isEnemy ? 523 : 440; // Higher pitch for enemy tiles
    this.playNote(freq, 0, 0.08, 'square', 0.15, 0.005, 0.03);
    // Add subtle triangle for richness
    this.playNote(freq * 2, 0.02, 0.06, 'triangle', 0.08, 0.005, 0.03);
  },

  // Victory jingle for capturing an enemy - 5 ascending notes
  sfxCapture() {
    const melody = [523, 587, 659, 784, 880]; // C5, D5, E5, G5, A5
    const duration = 0.08;
    melody.forEach((freq, i) => {
      this.playNote(freq, i * duration, duration, 'square', 0.15, 0.005, 0.03);
    });
    // Add harmony on last note
    this.playNote(1047, 4 * duration, duration * 1.5, 'triangle', 0.1, 0.01, 0.05);
  },

  // Sad descending chromatic death sound
  sfxDeath() {
    const notes = [440, 415, 392, 370, 349, 330, 311, 294]; // A4 down chromatically
    const duration = 0.075;
    notes.forEach((freq, i) => {
      this.playNote(freq, i * duration, duration, 'square', 0.18, 0.005, 0.04);
    });
    // Low rumble at the end
    this.playNote(110, 0.5, 0.2, 'triangle', 0.2, 0.01, 0.1);
  },

  // Celebratory wave clear fanfare
  sfxWaveClear() {
    const melody = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale ascending
    const duration = 0.1;
    melody.forEach((freq, i) => {
      this.playNote(freq, i * duration, duration, 'triangle', 0.18, 0.005, 0.04);
      // Add square harmony
      if (i >= 4) {
        this.playNote(freq * 1.5, i * duration, duration, 'square', 0.1, 0.005, 0.04);
      }
    });
  },

  // Subtle enemy hop - lower pitch, quieter
  sfxEnemyHop() {
    this.playNote(165, 0, 0.04, 'square', 0.08, 0.005, 0.02);
    this.playNote(220, 0.03, 0.035, 'square', 0.06, 0.005, 0.02);
  },

  // Background music loop - upbeat arcade chiptune
  startMusic() {
    if (!this.enabled || this.musicNodes) return;

    this.musicNodes = { playing: true };

    // 16-bar loop at 140 BPM
    const bpm = 140;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;
    const loopDuration = barDuration * 8; // 8 bars

    const playLoop = () => {
      if (!this.musicNodes || !this.musicNodes.playing) return;

      const now = 0;

      // Melody (square wave) - catchy arcade theme
      const melody = [
        // Bar 1-2
        { note: 659, time: 0, dur: 0.15 }, // E5
        { note: 659, time: 0.25, dur: 0.15 },
        { note: 784, time: 0.5, dur: 0.15 }, // G5
        { note: 659, time: 0.75, dur: 0.15 },
        { note: 523, time: 1.0, dur: 0.3 }, // C5
        { note: 587, time: 1.5, dur: 0.15 }, // D5
        { note: 659, time: 1.75, dur: 0.15 },
        // Bar 3-4
        { note: 784, time: 2.0, dur: 0.15 },
        { note: 784, time: 2.25, dur: 0.15 },
        { note: 880, time: 2.5, dur: 0.15 }, // A5
        { note: 784, time: 2.75, dur: 0.15 },
        { note: 659, time: 3.0, dur: 0.3 },
        { note: 523, time: 3.5, dur: 0.15 },
        { note: 587, time: 3.75, dur: 0.15 },
        // Bar 5-6 (variation)
        { note: 659, time: 4.0, dur: 0.15 },
        { note: 659, time: 4.25, dur: 0.15 },
        { note: 784, time: 4.5, dur: 0.15 },
        { note: 880, time: 4.75, dur: 0.15 },
        { note: 988, time: 5.0, dur: 0.3 }, // B5
        { note: 880, time: 5.5, dur: 0.15 },
        { note: 784, time: 5.75, dur: 0.15 },
        // Bar 7-8 (resolution)
        { note: 659, time: 6.0, dur: 0.15 },
        { note: 784, time: 6.25, dur: 0.15 },
        { note: 659, time: 6.5, dur: 0.15 },
        { note: 587, time: 6.75, dur: 0.15 },
        { note: 523, time: 7.0, dur: 0.5 }, // Long C5 ending
      ];

      melody.forEach(m => {
        this.playNote(m.note, now + m.time, m.dur, 'square', 0.08, 0.01, 0.05);
      });

      // Bassline (triangle wave) - simple root progression
      const bass = [
        { note: 131, time: 0, dur: 0.4 }, // C3
        { note: 131, time: 1.0, dur: 0.4 },
        { note: 147, time: 2.0, dur: 0.4 }, // D3
        { note: 147, time: 3.0, dur: 0.4 },
        { note: 131, time: 4.0, dur: 0.4 },
        { note: 175, time: 5.0, dur: 0.4 }, // F3
        { note: 196, time: 6.0, dur: 0.4 }, // G3
        { note: 131, time: 7.0, dur: 0.4 },
      ];

      bass.forEach(b => {
        this.playNote(b.note, now + b.time, b.dur, 'triangle', 0.12, 0.005, 0.05);
      });

      // Hi-hat rhythm (noise) - eighth notes
      for (let i = 0; i < 32; i++) {
        const accent = i % 4 === 0 ? 0.06 : 0.03;
        this.playNoise(now + i * 0.25, 0.03, accent);
      }

      // Schedule next loop
      setTimeout(() => playLoop(), loopDuration * 1000);
    };

    playLoop();
  },

  stopMusic() {
    if (this.musicNodes) {
      this.musicNodes.playing = false;
      this.musicNodes = null;
    }
  },

  // Placeholder for hurry up sound (to be implemented by Audio V5)
  sfxHurryUp() {
    // Basic hurry up warning sound
    this.playNote(880, 0, 0.2, 'square', 0.2, 0.01, 0.05);
    this.playNote(880, 0.25, 0.2, 'square', 0.2, 0.01, 0.05);
    this.playNote(880, 0.5, 0.3, 'square', 0.25, 0.01, 0.1);
  },

  // Placeholder for perfect fill sound (to be implemented by Audio V5)
  sfxPerfect() {
    // Triumphant perfect sound
    const melody = [523, 659, 784, 1047]; // C, E, G, high C
    melody.forEach((freq, i) => {
      this.playNote(freq, i * 0.1, 0.2, 'square', 0.2, 0.01, 0.08);
      this.playNote(freq * 1.5, i * 0.1 + 0.05, 0.15, 'triangle', 0.15, 0.01, 0.06);
    });
  },
};
