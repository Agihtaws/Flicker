class SoundManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = false;
    this.volume = 0.3;
    this.init();
  }

  init() {
    try {
      // Create audio context (works in all modern browsers)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      
      console.log('🔊 Sound Manager initialized');
    } catch (error) {
      console.warn('🔇 Web Audio not supported:', error);
    }
  }

  // Enable sounds (call this on first user interaction)
  enable() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.enabled = true;
    console.log('🔊 Sounds enabled');
  }

  // Disable sounds
  disable() {
    this.enabled = false;
    console.log('🔇 Sounds disabled');
  }

  // Set master volume (0 to 1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  // Generate a tone with specific frequency and duration
  playTone(frequency, duration, type = 'sine', volume = 1) {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Create oscillator for the tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configure oscillator
      oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
      oscillator.frequency.value = frequency;

      // Configure volume envelope (attack, sustain, release)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      // Connect audio nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Play the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

    } catch (error) {
      console.warn('Sound generation error:', error);
    }
  }

  // Play multiple tones in sequence (chord or melody)
  playSequence(notes, interval = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.frequency, note.duration, note.type, note.volume);
      }, index * interval * 1000);
    });
  }

  // GAME SOUNDS

  // Target hit sound - satisfying pop
  playTargetHit() {
    // Quick high-pitched pop
    this.playTone(800, 0.1, 'square', 0.8);
    
    // Add a lower harmonic for richness
    setTimeout(() => {
      this.playTone(400, 0.05, 'sine', 0.4);
    }, 20);
  }

  // Power-up collection sound - magical chime
  playPowerUpCollect() {
    const notes = [
      { frequency: 523, duration: 0.1, type: 'sine', volume: 0.6 }, // C5
      { frequency: 659, duration: 0.1, type: 'sine', volume: 0.7 }, // E5
      { frequency: 784, duration: 0.15, type: 'sine', volume: 0.8 } // G5
    ];
    this.playSequence(notes, 0.05);
  }

  // Level up sound - triumphant fanfare
  playLevelUp() {
    const notes = [
      { frequency: 440, duration: 0.2, type: 'square', volume: 0.7 }, // A4
      { frequency: 554, duration: 0.2, type: 'square', volume: 0.8 }, // C#5
      { frequency: 659, duration: 0.3, type: 'square', volume: 0.9 }, // E5
      { frequency: 880, duration: 0.4, type: 'sine', volume: 1.0 }    // A5
    ];
    this.playSequence(notes, 0.1);
  }

  // Explosion sound - noise burst
  playExplosion() {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Create noise using buffer
      const bufferSize = this.audioContext.sampleRate * 0.1; // 0.1 seconds
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Create and configure buffer source
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      // Volume envelope for explosion
      gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

      // Connect nodes
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Play
      source.start();
      source.stop(this.audioContext.currentTime + 0.1);

    } catch (error) {
      console.warn('Explosion sound error:', error);
    }
  }

  // Timer warning sound - urgent beep
  playTimerWarning() {
    // Alternating high-low beeps
    this.playTone(1000, 0.1, 'square', 0.8);
    setTimeout(() => {
      this.playTone(800, 0.1, 'square', 0.8);
    }, 150);
  }

  // Game over sound - descending tones
  playGameOver() {
    const notes = [
      { frequency: 440, duration: 0.3, type: 'sawtooth', volume: 0.8 }, // A4
      { frequency: 392, duration: 0.3, type: 'sawtooth', volume: 0.7 }, // G4
      { frequency: 349, duration: 0.3, type: 'sawtooth', volume: 0.6 }, // F4
      { frequency: 294, duration: 0.5, type: 'sawtooth', volume: 0.5 }  // D4
    ];
    this.playSequence(notes, 0.2);
  }

  // High score sound - celebration
  playHighScore() {
    // Play a happy melody
    const melody = [
      { frequency: 523, duration: 0.15, type: 'sine', volume: 0.8 }, // C5
      { frequency: 659, duration: 0.15, type: 'sine', volume: 0.8 }, // E5
      { frequency: 784, duration: 0.15, type: 'sine', volume: 0.8 }, // G5
      { frequency: 1047, duration: 0.3, type: 'sine', volume: 1.0 }  // C6
    ];
    
    // Play melody twice
    this.playSequence(melody, 0.1);
    setTimeout(() => {
      this.playSequence(melody, 0.1);
    }, 800);
  }

  // Menu click sound - subtle click
  playMenuClick() {
    this.playTone(600, 0.05, 'square', 0.4);
  }

  // Button hover sound - soft beep
  playButtonHover() {
    this.playTone(800, 0.03, 'sine', 0.2);
  }

  // Miss click sound (for precision mode) - negative buzz
  playMissClick() {
    this.playTone(150, 0.2, 'sawtooth', 0.6);
  }

  // Multiplier activate sound - rising pitch
  playMultiplierActivate() {
    // Sweep from low to high frequency
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);

    } catch (error) {
      console.warn('Multiplier sound error:', error);
    }
  }
}

// Create and export singleton instance
const soundManager = new SoundManager();
export default soundManager;
