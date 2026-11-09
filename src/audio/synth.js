/**
 * Procedural Web Audio Sound Synthesizer
 * Zero-asset latency, crisp military audio design
 */
import { stateManager } from '../state.js';

export class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;

    this.initAudioContext();
  }

  initAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.updateVolumes();

    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    stateManager.on('settingsChanged', () => this.updateVolumes());
  }

  ensureRunning() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  updateVolumes() {
    if (!this.masterGain || !this.sfxGain) return;
    const s = stateManager.settings;
    this.masterGain.gain.setValueAtTime(s.masterVolume, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(s.sfxVolume, this.ctx.currentTime);
  }

  playGunshot(weaponId = 'M416') {
    if (!this.ctx) return;
    this.ensureRunning();
    const now = this.ctx.currentTime;

    // Noise burst for mechanical gun blast
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(weaponId === 'AWM' ? 900 : 2200, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(weaponId === 'AWM' ? 1.0 : 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (weaponId === 'AWM' ? 0.25 : 0.12));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.3);

    // Deep sub-bass punch oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = weaponId === 'AWM' ? 140 : 180;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playHitmarker() {
    if (!this.ctx) return;
    this.ensureRunning();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playReload() {
    if (!this.ctx) return;
    this.ensureRunning();
    const now = this.ctx.currentTime;

    // Dual click sound
    const playClick = (time, freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.05);
    };

    playClick(now + 0.1, 400); // Mag detach
    playClick(now + 0.8, 600); // Mag insert
    playClick(now + 1.4, 900); // Bolt rack
  }

  playFootstep() {
    if (!this.ctx) return;
    this.ensureRunning();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }
}

export const soundManager = new SoundSynthesizer();
