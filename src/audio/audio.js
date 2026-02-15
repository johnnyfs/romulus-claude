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

  // Progressive fill sounds - reward increases with fill size
  sfxFillSmall() {
    // 1-5 tiles: Quick 2-note chirp, slightly higher than claim
    this.playNote(494, 0, 0.06, 'square', 0.14, 0.005, 0.025);
    this.playNote(587, 0.04, 0.06, 'square', 0.13, 0.005, 0.025);
  },

  sfxFillMedium() {
    // 6-15 tiles: 3-note ascending arpeggio, bright and satisfying
    this.playNote(523, 0, 0.08, 'square', 0.16, 0.005, 0.03);
    this.playNote(659, 0.06, 0.08, 'square', 0.15, 0.005, 0.03);
    this.playNote(784, 0.12, 0.1, 'square', 0.14, 0.005, 0.04);
    // Add triangle harmony on last note
    this.playNote(1568, 0.12, 0.1, 'triangle', 0.08, 0.01, 0.04);
  },

  sfxFillLarge() {
    // 16-30 tiles: 4-note fanfare with harmony, mini victory
    const notes = [523, 659, 784, 880]; // C5, E5, G5, A5
    const duration = 0.1;
    notes.forEach((freq, i) => {
      this.playNote(freq, i * duration * 0.7, duration, 'square', 0.17, 0.005, 0.04);
      // Add harmony on last two notes
      if (i >= 2) {
        this.playNote(freq * 1.5, i * duration * 0.7, duration, 'triangle', 0.1, 0.01, 0.04);
      }
    });
    // Bass note for impact
    this.playNote(131, 0.21, 0.15, 'triangle', 0.15, 0.01, 0.06);
  },

  sfxFillHuge() {
    // 31+ tiles: 6-note triumphant cascade with bass, very rewarding
    const notes = [523, 659, 784, 880, 988, 1047]; // C5 to C6
    const duration = 0.1;
    notes.forEach((freq, i) => {
      this.playNote(freq, i * duration * 0.65, duration, 'square', 0.18, 0.005, 0.04);
      // Add rich harmony
      if (i >= 3) {
        this.playNote(freq * 1.5, i * duration * 0.65, duration, 'triangle', 0.11, 0.01, 0.04);
      }
    });
    // Deep bass note for power
    this.playNote(65.4, 0, 0.4, 'triangle', 0.2, 0.02, 0.15);
    this.playNote(131, 0.2, 0.3, 'triangle', 0.18, 0.01, 0.12);
  },

  // Hurry up warning - urgent countdown feel
  sfxHurryUp() {
    // Rapid descending notes, repeated 3 times with increasing urgency
    const pattern = [880, 784, 698]; // A5, G5, F5
    for (let rep = 0; rep < 3; rep++) {
      const offset = rep * 0.4;
      const volume = 0.15 + rep * 0.03; // Get louder each time
      pattern.forEach((freq, i) => {
        this.playNote(freq, offset + i * 0.08, 0.08, 'square', volume, 0.005, 0.03);
      });
    }
    // Final urgent accent
    this.playNote(659, 1.2, 0.15, 'square', 0.22, 0.005, 0.06);
    this.playNote(330, 1.2, 0.15, 'triangle', 0.18, 0.01, 0.06);
  },

  // Snail creeping sound - ominous and unsettling
  sfxSnailMove() {
    // Deep triangle wave with slow pitch bend downward
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    // Start at 110 Hz, bend down to 80 Hz
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);

    // Ominous envelope
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);
  },

  // Perfect 100% bonus - grand celebration
  sfxPerfect() {
    // 8+ notes with major chord arpeggios, most rewarding sound
    const melody = [
      523, 659, 784, 880, 1047, 880, 784, 1047, 1319 // C major arpeggio cascade
    ];
    const duration = 0.12;

    melody.forEach((freq, i) => {
      this.playNote(freq, i * duration * 0.7, duration, 'square', 0.18, 0.005, 0.05);
      // Rich harmonic accompaniment
      if (i >= 2) {
        this.playNote(freq * 1.5, i * duration * 0.7 + 0.02, duration, 'triangle', 0.12, 0.01, 0.05);
      }
    });

    // Bass chord progression
    this.playNote(65.4, 0, 0.8, 'triangle', 0.18, 0.02, 0.2);
    this.playNote(131, 0.4, 0.6, 'triangle', 0.16, 0.01, 0.15);
    this.playNote(196, 0.8, 0.5, 'triangle', 0.14, 0.01, 0.15);

    // Final triumphant high note
    this.playNote(1047, 0.9, 0.3, 'square', 0.2, 0.01, 0.1);
    this.playNote(1568, 0.9, 0.3, 'triangle', 0.15, 0.01, 0.1);
  },

  // Combo stacking sound - pitch increases with multiplier
  sfxCombo(multiplier) {
    const baseFreq = 440; // A4
    // x2 = 1.2x pitch, x3 = 1.4x, x4+ = 1.6x
    const pitchMult = 1.0 + Math.min(multiplier - 1, 3) * 0.2;
    const freq = baseFreq * pitchMult;

    if (multiplier === 2) {
      // Medium pitch, quick 2-note
      this.playNote(freq, 0, 0.07, 'square', 0.15, 0.005, 0.03);
      this.playNote(freq * 1.5, 0.05, 0.07, 'square', 0.14, 0.005, 0.03);
    } else if (multiplier === 3) {
      // High pitch, 3-note sparkle
      this.playNote(freq, 0, 0.06, 'square', 0.16, 0.005, 0.025);
      this.playNote(freq * 1.25, 0.04, 0.06, 'square', 0.15, 0.005, 0.025);
      this.playNote(freq * 1.5, 0.08, 0.08, 'square', 0.14, 0.005, 0.03);
      this.playNote(freq * 3, 0.08, 0.08, 'triangle', 0.09, 0.01, 0.03);
    } else {
      // x4+: Very high with extra sparkle notes
      this.playNote(freq, 0, 0.06, 'square', 0.17, 0.005, 0.025);
      this.playNote(freq * 1.33, 0.04, 0.06, 'square', 0.16, 0.005, 0.025);
      this.playNote(freq * 1.67, 0.08, 0.06, 'square', 0.15, 0.005, 0.025);
      this.playNote(freq * 2, 0.12, 0.1, 'square', 0.14, 0.005, 0.04);
      // Extra sparkle harmonics
      this.playNote(freq * 3, 0.08, 0.1, 'triangle', 0.1, 0.01, 0.04);
      this.playNote(freq * 4, 0.12, 0.1, 'triangle', 0.08, 0.01, 0.04);
    }
  },

  // Background music loop - upbeat arcade chiptune
  startMusic() {
    if (!this.enabled || this.musicNodes) return;

    this.musicNodes = { playing: true, loopCount: 0 };

    // 16-bar loop at 140 BPM
    const bpm = 140;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;
    const loopDuration = barDuration * 8; // 8 bars

    const playLoop = () => {
      if (!this.musicNodes || !this.musicNodes.playing) return;

      const now = 0;
      const variation = this.musicNodes.loopCount % 2; // Alternate between two variations

      // Melody (square wave) - catchy arcade theme with variation
      let melody;
      if (variation === 0) {
        // Original melody
        melody = [
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
      } else {
        // Variation with slightly different melody
        melody = [
          // Bar 1-2
          { note: 523, time: 0, dur: 0.15 }, // C5
          { note: 659, time: 0.25, dur: 0.15 }, // E5
          { note: 784, time: 0.5, dur: 0.15 }, // G5
          { note: 880, time: 0.75, dur: 0.15 }, // A5
          { note: 784, time: 1.0, dur: 0.3 }, // G5
          { note: 659, time: 1.5, dur: 0.15 }, // E5
          { note: 587, time: 1.75, dur: 0.15 }, // D5
          // Bar 3-4
          { note: 523, time: 2.0, dur: 0.15 },
          { note: 587, time: 2.25, dur: 0.15 },
          { note: 659, time: 2.5, dur: 0.15 },
          { note: 784, time: 2.75, dur: 0.15 },
          { note: 880, time: 3.0, dur: 0.3 },
          { note: 784, time: 3.5, dur: 0.15 },
          { note: 659, time: 3.75, dur: 0.15 },
          // Bar 5-6
          { note: 784, time: 4.0, dur: 0.15 },
          { note: 880, time: 4.25, dur: 0.15 },
          { note: 988, time: 4.5, dur: 0.15 }, // B5
          { note: 1047, time: 4.75, dur: 0.15 }, // C6
          { note: 988, time: 5.0, dur: 0.3 },
          { note: 880, time: 5.5, dur: 0.15 },
          { note: 784, time: 5.75, dur: 0.15 },
          // Bar 7-8 (resolution)
          { note: 659, time: 6.0, dur: 0.15 },
          { note: 587, time: 6.25, dur: 0.15 },
          { note: 523, time: 6.5, dur: 0.15 },
          { note: 587, time: 6.75, dur: 0.15 },
          { note: 523, time: 7.0, dur: 0.5 }, // Long C5 ending
        ];
      }

      melody.forEach(m => {
        this.playNote(m.note, now + m.time, m.dur, 'square', 0.08, 0.01, 0.05);
      });

      // Bassline (triangle wave) - enhanced with more frequent notes
      const bass = [
        // Every beat now, not just every bar
        { note: 131, time: 0, dur: 0.18 }, // C3
        { note: 131, time: 0.5, dur: 0.18 },
        { note: 131, time: 1.0, dur: 0.18 },
        { note: 131, time: 1.5, dur: 0.18 },
        { note: 147, time: 2.0, dur: 0.18 }, // D3
        { note: 147, time: 2.5, dur: 0.18 },
        { note: 147, time: 3.0, dur: 0.18 },
        { note: 147, time: 3.5, dur: 0.18 },
        { note: 131, time: 4.0, dur: 0.18 }, // C3
        { note: 131, time: 4.5, dur: 0.18 },
        { note: 175, time: 5.0, dur: 0.18 }, // F3
        { note: 175, time: 5.5, dur: 0.18 },
        { note: 196, time: 6.0, dur: 0.18 }, // G3
        { note: 196, time: 6.5, dur: 0.18 },
        { note: 131, time: 7.0, dur: 0.18 }, // C3
        { note: 131, time: 7.5, dur: 0.18 },
      ];

      bass.forEach(b => {
        this.playNote(b.note, now + b.time, b.dur, 'triangle', 0.12, 0.005, 0.05);
      });

      // Hi-hat rhythm (noise) - eighth notes
      for (let i = 0; i < 32; i++) {
        const accent = i % 4 === 0 ? 0.06 : 0.03;
        this.playNoise(now + i * 0.25, 0.03, accent);
      }

      // Increment loop counter and schedule next loop
      this.musicNodes.loopCount++;
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

  // Snake slither sound - low hissing slide
  sfxSnakeMove() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    // Sliding pitch from 200 down to 120
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.15);
    // Add hiss noise
    this.playNoise(0, 0.1, 0.04);
  },

  // Ladybug squish - satisfying pop
  sfxLadybugSquish() {
    this.playNote(392, 0, 0.06, 'square', 0.15, 0.005, 0.02);
    this.playNote(523, 0.04, 0.08, 'triangle', 0.12, 0.005, 0.03);
    this.playNoise(0, 0.05, 0.08);
  },

  // Enemy deploy sound - ominous spawn
  sfxEnemyDeploy() {
    this.playNote(110, 0, 0.12, 'triangle', 0.15, 0.01, 0.05);
    this.playNote(165, 0.08, 0.1, 'square', 0.1, 0.005, 0.04);
  },

  // Enemy encirclement danger sound - alarm
  sfxEnemyEncircle() {
    this.playNote(440, 0, 0.1, 'square', 0.2, 0.005, 0.04);
    this.playNote(330, 0.08, 0.1, 'square', 0.2, 0.005, 0.04);
    this.playNote(440, 0.16, 0.1, 'square', 0.2, 0.005, 0.04);
  },

  // === BONUS ITEM SOUNDS ===

  // General bonus pickup - short happy chirp
  sfxBonusPickup() {
    this.playNote(659, 0, 0.06, 'square', 0.14, 0.005, 0.025);
    this.playNote(880, 0.05, 0.08, 'square', 0.13, 0.005, 0.03);
    this.playNote(1047, 0.1, 0.1, 'triangle', 0.1, 0.01, 0.04);
  },

  // Speed boost whoosh - quick ascending sweep
  sfxSpeedBoost() {
    // Rapid ascending arpeggio with triangle whoosh
    this.playNote(523, 0, 0.05, 'square', 0.14, 0.005, 0.02);
    this.playNote(659, 0.04, 0.05, 'square', 0.13, 0.005, 0.02);
    this.playNote(784, 0.08, 0.05, 'square', 0.12, 0.005, 0.02);
    this.playNote(1047, 0.12, 0.1, 'square', 0.15, 0.005, 0.04);
    // Whoosh overlay
    this.playNote(262, 0, 0.2, 'triangle', 0.12, 0.01, 0.08);
  },

  // Invincibility power-up chime - majestic ascending chord
  sfxInvincibleStart() {
    const melody = [523, 659, 784, 880, 1047]; // C5 major ascending
    melody.forEach((freq, i) => {
      this.playNote(freq, i * 0.08, 0.12, 'square', 0.16, 0.005, 0.04);
    });
    // Power chord at the end
    this.playNote(523, 0.35, 0.25, 'triangle', 0.14, 0.01, 0.08);
    this.playNote(1047, 0.35, 0.25, 'square', 0.12, 0.01, 0.08);
    this.playNote(1568, 0.35, 0.25, 'triangle', 0.08, 0.01, 0.08);
  },

  // Extra life - triumphant fanfare
  sfxExtraLife() {
    // Triumphant 1UP jingle
    const melody = [523, 659, 784, 1047, 784, 1047, 1319]; // C major arpeggio up
    const dur = 0.1;
    melody.forEach((freq, i) => {
      this.playNote(freq, i * dur * 0.7, dur, 'square', 0.18, 0.005, 0.04);
      if (i >= 3) {
        this.playNote(freq * 1.5, i * dur * 0.7 + 0.02, dur, 'triangle', 0.12, 0.01, 0.04);
      }
    });
    // Big bass note for impact
    this.playNote(131, 0, 0.6, 'triangle', 0.16, 0.02, 0.15);
    // Sparkle finish
    this.playNote(1568, 0.5, 0.2, 'square', 0.1, 0.01, 0.08);
    this.playNote(2093, 0.55, 0.2, 'triangle', 0.08, 0.01, 0.08);
  },
};
