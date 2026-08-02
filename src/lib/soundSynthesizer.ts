export type TypingSound = 'mute' | 'click' | 'typewriter' | 'mechanical' | 'soft_pop' | 'beep' | 'clack';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a synthesized key-press sound using Web Audio API based on the selected sound profile.
 */
export function playTypingSound(sound: TypingSound, isSpace = false, isError = false) {
  if (sound === 'mute') return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pitch variation per keystroke for natural acoustic realism
    const pitchFactor = 0.92 + Math.random() * 0.16;

    if (sound === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime((isSpace ? 500 : 800) * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.015);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } else if (sound === 'typewriter') {
      // Noise burst + low metallic pop
      const bufferSize = ctx.sampleRate * 0.02;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 800 : 1400) * pitchFactor, now);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);

      // Add metallic thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250 * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.025);
      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.026);
    } else if (sound === 'mechanical') {
      // Tactile double pop (150Hz + 1800Hz snap)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime((isSpace ? 1200 : 1800) * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.025);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.026);
    } else if (sound === 'soft_pop') {
      // Smooth sine pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime((isSpace ? 320 : 480) * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.036);
    } else if (sound === 'beep') {
      // Retro blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime((isSpace ? 660 : 880) * pitchFactor, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.021);
    } else if (sound === 'clack') {
      // Deep hollow keycap clack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime((isSpace ? 140 : 220) * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.03);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.031);
    }

    // Play secondary warning click if typing error
    if (isError) {
      const errOsc = ctx.createOscillator();
      const errGain = ctx.createGain();
      errOsc.type = 'sawtooth';
      errOsc.frequency.setValueAtTime(120, now);
      errGain.gain.setValueAtTime(0.15, now);
      errGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      errOsc.connect(errGain);
      errGain.connect(ctx.destination);
      errOsc.start(now);
      errOsc.stop(now + 0.041);
    }
  } catch (err) {
    // AudioContext permission issue or non-interactive context
  }
}
