export type AmbientSoundType = "none" | "brown_noise" | "pink_noise" | "white_noise" | "rain";

class SoundService {
  private audioCtx: AudioContext | null = null;
  private ambientNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play pleasant subtle UI completion chime
  public playCompletionChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // Play soft focus start tone
  public playFocusStartTone() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  // Play ambient sound generator (Brownian noise, Pink noise, Rain simulator)
  public startAmbientSound(type: AmbientSoundType, volume: number = 0.15) {
    this.stopAmbientSound();
    if (type === "none" || this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (type === "brown_noise" || type === "rain") {
          // Brown noise (integrated white noise)
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else if (type === "pink_noise") {
          // Pink noise filter (Paul Kellet's method)
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          // White noise
          data[i] = white * 0.1;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.min(volume, 0.4), ctx.currentTime);

      if (type === "rain") {
        // Apply a gentle bandpass filter to sound like gentle rain on leaves
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(gain);
      } else if (type === "brown_noise") {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(gain);
      } else {
        noiseSource.connect(gain);
      }

      gain.connect(ctx.destination);
      noiseSource.start();

      this.ambientNode = noiseSource;
      this.gainNode = gain;
    } catch (e) {
      console.warn("Could not start ambient audio:", e);
    }
  }

  public startAmbient(type: AmbientSoundType, volume: number = 0.15) {
    this.startAmbientSound(type, volume);
  }

  public stopAmbient() {
    this.stopAmbientSound();
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(vol, 0.5)), this.audioCtx.currentTime);
    }
  }

  public stopAmbientSound() {
    if (this.ambientNode) {
      try {
        (this.ambientNode as AudioBufferSourceNode).stop();
        this.ambientNode.disconnect();
      } catch {}
      this.ambientNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientSound();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const soundService = new SoundService();
