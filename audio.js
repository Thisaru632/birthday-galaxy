// Romantic Cosmic Audio Engine (Built-in Web Audio Synth + Custom MP3 Support)

class GalaxyAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.customAudio = new Audio();
    this.customAudio.loop = true;
    this.customAudioUrl = '';
    this.mode = 'romantic_synth'; // 'romantic_synth' | 'birthday_box' | 'custom'
    this.loopTimer = null;
    this.stepIndex = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicConfig(mode, customUrl = '') {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.mode = mode || 'romantic_synth';
    this.customAudioUrl = customUrl || '';
    if (this.customAudioUrl) {
      this.customAudio.src = this.customAudioUrl;
    }
    if (wasPlaying && !this.isMuted) {
      this.start();
    }
  }

  start() {
    this.isPlaying = true;
    if (this.isMuted) return;

    if (this.mode === 'custom' && this.customAudioUrl) {
      this.customAudio.volume = 0.65;
      this.customAudio.play().catch(() => {});
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    if (this.loopTimer) clearInterval(this.loopTimer);
    this.stepIndex = 0;

    if (this.mode === 'birthday_box') {
      this.playBirthdayStep();
      this.loopTimer = setInterval(() => this.playBirthdayStep(), 550);
    } else {
      // Dreamy romantic piano/celesta progression (Fmaj7 - Dm7 - Bbmaj7 - C)
      this.playRomanticStep();
      this.loopTimer = setInterval(() => this.playRomanticStep(), 650);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    try {
      this.customAudio.pause();
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.loopTimer) {
        clearInterval(this.loopTimer);
        this.loopTimer = null;
      }
      try {
        this.customAudio.pause();
      } catch (e) {}
    } else {
      this.start();
    }
    return !this.isMuted;
  }

  playTone(freq, duration = 2.4, volume = 0.08, type = 'sine') {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Subtle warm harmonic overtone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    osc2.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  playRomanticStep() {
    // Inspired by "Sign of the Times" warm emotional piano chords & cosmic arpeggio
    // Progression: F major -> D minor -> C major -> Bb major
    const sequence = [
      // Bar 1: F Major 7
      { bass: 174.61, note: 523.25 }, // F3, C5
      { note: 659.25 },               // E5
      { note: 698.46 },               // F5
      { note: 523.25 },               // C5
      // Bar 2: D Minor 7
      { bass: 146.83, note: 587.33 }, // D3, D5
      { note: 659.25 },               // E5
      { note: 698.46 },               // F5
      { note: 880.00 },               // A5
      // Bar 3: Bb Major 9
      { bass: 233.08, note: 783.99 }, // Bb3, G5
      { note: 698.46 },               // F5
      { note: 587.33 },               // D5
      { note: 523.25 },               // C5
      // Bar 4: C Major
      { bass: 130.81, note: 659.25 }, // C3, E5
      { note: 587.33 },               // D5
      { note: 523.25 },               // C5
      { note: 587.33 }                // D5
    ];

    const step = sequence[this.stepIndex % sequence.length];
    if (step.bass) {
      this.playTone(step.bass, 3.2, 0.065, 'sine');
      this.playTone(step.bass * 1.5, 2.8, 0.035, 'sine');
    }
    if (step.note) {
      this.playTone(step.note, 2.2, 0.055, 'sine');
    }
    this.stepIndex++;
  }

  playBirthdayStep() {
    // Dreamy Celestial Music Box "Happy Birthday"
    const notes = [
      392.00, 392.00, 440.00, 392.00, 523.25, 493.88, 0,
      392.00, 392.00, 440.00, 392.00, 587.33, 523.25, 0,
      392.00, 392.00, 783.99, 659.25, 523.25, 493.88, 440.00, 0,
      698.46, 698.46, 659.25, 523.25, 587.33, 523.25, 0, 0
    ];
    const freq = notes[this.stepIndex % notes.length];
    if (freq > 0) {
      this.playTone(freq, 1.8, 0.065, 'sine');
      if (this.stepIndex % 4 === 0) {
        this.playTone(freq / 2, 2.5, 0.04, 'sine');
      }
    }
    this.stepIndex++;
  }

  playSparkleChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const notes = [587.33, 783.99, 987.77, 1174.66];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 1.1, 0.04, 'sine'), idx * 55);
    });
  }
}

window.galaxyAudio = new GalaxyAudioEngine();

