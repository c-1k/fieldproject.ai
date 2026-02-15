// AudioEngine.ts — Web Audio API synthesis for particle interaction sounds.
// Procedurally generated with oscillators, noise, and filters. No audio files.
// AudioContext is lazily created on first initAudio() call (user gesture required).

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let condensationOsc: OscillatorNode | null = null;
let condensationOvertone: OscillatorNode | null = null;
let condensationGain: GainNode | null = null;

/** Create AudioContext and master gain. Call from a user gesture handler. */
export function initAudio(): void {
  if (ctx) return;
  ctx = new AudioContext();
  // Safari and some Chrome versions start AudioContext suspended even
  // with user gesture — explicitly resume to ensure "running" state.
  if (ctx.state === "suspended") ctx.resume();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(ctx.destination);
}

export function isAudioReady(): boolean {
  if (!ctx) return false;
  // Accept "suspended" too — resume() was called, sounds will queue
  // and play once the context transitions to "running".
  return ctx.state === "running" || ctx.state === "suspended";
}

/** Set master volume (0-1). Default is 0.15. */
export function setVolume(v: number): void {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

/** Close AudioContext and release all nodes. */
export function disposeAudio(): void {
  condensationOsc?.stop(); condensationOsc = null;
  condensationOvertone?.stop(); condensationOvertone = null;
  condensationGain = null;
  if (ctx) { ctx.close(); ctx = null; }
  masterGain = null;
}

// --- Utility ---

/** Ensure context is running before scheduling sounds. */
function ensureRunning(): void {
  if (ctx && ctx.state === "suspended") ctx.resume();
}

function createNoiseBuffer(duration: number): AudioBuffer {
  const length = Math.floor(ctx!.sampleRate * duration);
  const buffer = ctx!.createBuffer(1, length, ctx!.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Annihilation: percussive pop. White noise burst (50ms) through bandpass
// at 2kHz Q=5, fast exponential decay.
export function playAnnihilation(): void {
  if (!ctx || !masterGain) return;
  ensureRunning();
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(0.05);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2000;
  bp.Q.value = 5;
  const env = ctx.createGain();
  env.gain.setValueAtTime(1, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  noise.connect(bp).connect(env).connect(masterGain);
  noise.start(now);
  noise.stop(now + 0.05);
}

// Decay: descending frequency sweep. Sine 800Hz -> 100Hz over 0.4s with
// gain envelope fade-out.
export function playDecay(): void {
  if (!ctx || !masterGain) return;
  ensureRunning();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.4, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(env).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.4);
}

// Condensation: persistent low resonant hum (60Hz + 120Hz overtone).
// Uses persistent oscillators — repeated calls crossfade gain smoothly
// instead of restarting. Gain scales with strength (0-1).
export function playCondensation(strength: number): void {
  if (!ctx || !masterGain) return;
  ensureRunning();
  const clamped = Math.max(0, Math.min(1, strength));
  const now = ctx.currentTime;
  if (!condensationOsc) {
    condensationGain = ctx.createGain();
    condensationGain.gain.setValueAtTime(0, now);
    condensationGain.connect(masterGain);
    condensationOsc = ctx.createOscillator();
    condensationOsc.type = "sine";
    condensationOsc.frequency.value = 60;
    condensationOsc.connect(condensationGain);
    condensationOsc.start(now);
    condensationOvertone = ctx.createOscillator();
    condensationOvertone.type = "sine";
    condensationOvertone.frequency.value = 120;
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.5;
    condensationOvertone.connect(overtoneGain).connect(condensationGain);
    condensationOvertone.start(now);
  }
  // Smooth crossfade to target gain over 80ms
  condensationGain!.gain.cancelScheduledValues(now);
  condensationGain!.gain.setValueAtTime(condensationGain!.gain.value, now);
  condensationGain!.gain.linearRampToValueAtTime(clamped * 0.5, now + 0.08);
}

// Entanglement: harmonic overtone ping. Two sines at 440Hz and 660Hz
// (perfect fifth), short 200ms envelope, very quiet.
export function playEntanglement(): void {
  if (!ctx || !masterGain) return;
  ensureRunning();
  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 440;
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 660;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.08, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc1.connect(env);
  osc2.connect(env);
  env.connect(masterGain);
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.2);
  osc2.stop(now + 0.2);
}

// Shockwave: deep thud. Sine at 40Hz, 10ms attack, 300ms decay.
// Brief white noise burst layered on top for impact texture.
export function playShockwave(): void {
  if (!ctx || !masterGain) return;
  ensureRunning();
  const now = ctx.currentTime;
  // Sub-bass thud
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 40;
  const thudEnv = ctx.createGain();
  thudEnv.gain.setValueAtTime(0.001, now);
  thudEnv.gain.linearRampToValueAtTime(0.6, now + 0.01);
  thudEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(thudEnv).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.3);
  // Noise layer
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(0.08);
  const noiseEnv = ctx.createGain();
  noiseEnv.gain.setValueAtTime(0.25, now);
  noiseEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  noise.connect(noiseEnv).connect(masterGain);
  noise.start(now);
  noise.stop(now + 0.08);
}

// Supernova: dramatic composite. Rising sine sweep (200->2000Hz, 0.3s),
// then white noise burst with long 1s decay, all through a lowpass filter
// that sweeps from 6kHz down to 200Hz for a "closing" effect.
export function playSupernova(): void {
  if (!ctx || !masterGain) return;
  ensureRunning();
  const now = ctx.currentTime;
  // Sweeping lowpass envelope
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(6000, now);
  lp.frequency.exponentialRampToValueAtTime(200, now + 1.3);
  lp.Q.value = 2;
  lp.connect(masterGain);
  // Rising sine sweep
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
  const oscEnv = ctx.createGain();
  oscEnv.gain.setValueAtTime(0.5, now);
  oscEnv.gain.setValueAtTime(0.5, now + 0.3);
  oscEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(oscEnv).connect(lp);
  osc.start(now);
  osc.stop(now + 0.6);
  // White noise burst with long decay
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(1.3);
  const noiseEnv = ctx.createGain();
  noiseEnv.gain.setValueAtTime(0.001, now);
  noiseEnv.gain.linearRampToValueAtTime(0.6, now + 0.3);
  noiseEnv.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
  noise.connect(noiseEnv).connect(lp);
  noise.start(now);
  noise.stop(now + 1.3);
}
