// CTBF-AI-12: Web Audio API Synthesized Oscillating Siren
// Native browser audio synthesis (oscillating 650Hz-950Hz wail)
// Guaranteed reliable on mobile browsers without external mp3 files

class EmergencySoundSystem {
  private audioCtx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenPlaying: boolean = false;
  private htmlAudio: HTMLAudioElement | null = null;

  private initHtmlAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.htmlAudio) {
      try {
        const audio = new Audio('/audio/siren.wav');
        audio.loop = true;
        audio.volume = 0.5;
        audio.preload = 'auto';
        this.htmlAudio = audio;
      } catch (e) {
        console.warn('HTML Audio fallback init failed:', e);
      }
    }
    return this.htmlAudio;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  /**
   * Explicit audio unlock to satisfy browser autoplay policy on mobile/desktop
   */
  public unlockAudio(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const audio = this.initHtmlAudio();
      const ctx = this.initContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        // If siren was requested while browser was locked, blast immediately upon gesture
        if (this.isSirenPlaying) {
          if (audio && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          }
          if (!this.sirenOsc) {
            this.startWebAudioSiren(0.45);
          }
        } else {
          // Quick 30ms subtle chime to initialize the audio graph
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.01, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        }
        return true;
      }
    } catch (e) {
      console.warn('AudioContext unlock failed:', e);
    }
    return false;
  }

  public isUnlocked(): boolean {
    return !!this.audioCtx && this.audioCtx.state === 'running';
  }

  private startWebAudioSiren(volume: number): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // Clean up previous oscillators if lingering
      if (this.sirenOsc) {
        try {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
        } catch {}
        this.sirenOsc = null;
      }
      if (this.lfoOsc) {
        try {
          this.lfoOsc.stop();
          this.lfoOsc.disconnect();
        } catch {}
        this.lfoOsc = null;
      }

      // Base Carrier Oscillator (Sawtooth waveform provides the piercing emergency horn quality)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);

      // Low-Frequency Oscillator (LFO) oscillating at ~0.8 Hz (1.25s wail cycle)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.8, now);

      // LFO Gain modulates carrier by +/- 150Hz -> bounds: 650Hz to 950Hz
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(150, now);

      lfo.connect(osc.frequency);

      // Main Gain Node with smooth fade-in
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);

      this.sirenOsc = osc;
      this.lfoOsc = lfo;
      this.sirenGain = gain;
    } catch (e) {
      console.warn('Failed to start Web Audio siren:', e);
    }
  }

  /**
   * Starts wailing siren oscillating between 650Hz and 950Hz (Dual Engine: Web Audio + HTML5 Audio Fallback)
   */
  public startSiren(volume = 0.45, force = false): void {
    if (this.isSirenPlaying && !force) {
      // Re-verify that engines are actively playing (in case unmuted or resumed)
      if (this.htmlAudio && this.htmlAudio.paused) {
        this.htmlAudio.play().catch(() => {});
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      if (!this.sirenOsc) {
        this.startWebAudioSiren(volume);
      }
      return;
    }
    this.isSirenPlaying = true;

    // 1. Dual-Engine Fallback: HTML5 Audio
    try {
      const audio = this.initHtmlAudio();
      if (audio) {
        audio.currentTime = 0;
        audio.volume = Math.min(1.0, volume * 1.5);
        audio.play().catch((err) => {
          console.warn('HTML5 siren play prevented by autoplay policy (will unlock on touch):', err);
        });
      }
    } catch (e) {
      console.warn('HTML Audio play error:', e);
    }

    // 2. Real-Time Web Audio API Synthesis
    this.startWebAudioSiren(volume);
  }

  /**
   * Instantly and unconditionally terminates the siren across both audio engines
   */
  public stopSiren(): void {
    this.isSirenPlaying = false;

    // 1. Immediately cut HTML5 Audio
    try {
      if (this.htmlAudio) {
        this.htmlAudio.pause();
        this.htmlAudio.currentTime = 0;
      }
    } catch (e) {
      console.warn('HTML Audio pause error:', e);
    }

    // 2. Immediately cut Web Audio Graph (instant stop, no delayed timeout)
    try {
      if (this.sirenGain && this.audioCtx) {
        try {
          const now = this.audioCtx.currentTime;
          this.sirenGain.gain.cancelScheduledValues(now);
          this.sirenGain.gain.setValueAtTime(0, now);
        } catch {}
      }
      if (this.sirenOsc) {
        try {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
        } catch {}
        this.sirenOsc = null;
      }
      if (this.lfoOsc) {
        try {
          this.lfoOsc.stop();
          this.lfoOsc.disconnect();
        } catch {}
        this.lfoOsc = null;
      }
      if (this.sirenGain) {
        try {
          this.sirenGain.disconnect();
        } catch {}
        this.sirenGain = null;
      }
    } catch (e) {
      console.warn('Failed to stop Web Audio siren:', e);
    }
  }

  public duckSiren(targetVolume = 0.05): void {
    try {
      if (this.htmlAudio) {
        this.htmlAudio.volume = Math.max(0.02, targetVolume);
      }
    } catch {}

    if (!this.sirenGain || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      this.sirenGain.gain.cancelScheduledValues(now);
      this.sirenGain.gain.linearRampToValueAtTime(targetVolume, now + 0.1);
    } catch {}
  }

  public restoreSiren(targetVolume = 0.4): void {
    try {
      if (this.htmlAudio) {
        this.htmlAudio.volume = Math.min(1.0, targetVolume * 1.5);
      }
    } catch {}

    if (!this.sirenGain || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      this.sirenGain.gain.cancelScheduledValues(now);
      this.sirenGain.gain.linearRampToValueAtTime(targetVolume, now + 0.2);
    } catch {}
  }

  public getIsPlaying(): boolean {
    return this.isSirenPlaying;
  }
}

export const emergencySound = new EmergencySoundSystem();
