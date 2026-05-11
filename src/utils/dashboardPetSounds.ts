/** Short synthesized sounds — no external assets; respects browser AudioContext policies. */

let sharedCtx: AudioContext | null = null;

export function getDashboardAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

export async function resumeDashboardAudio(): Promise<AudioContext> {
  const ctx = getDashboardAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

export function playMeow(ctx: AudioContext) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc2.type = 'triangle';
  osc.frequency.setValueAtTime(520, t0);
  osc.frequency.exponentialRampToValueAtTime(920, t0 + 0.11);
  osc2.frequency.setValueAtTime(380, t0);
  osc2.frequency.exponentialRampToValueAtTime(640, t0 + 0.09);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
  osc.connect(g);
  osc2.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc2.start(t0);
  osc.stop(t0 + 0.24);
  osc2.stop(t0 + 0.24);
}

export function playBark(ctx: AudioContext) {
  const t0 = ctx.currentTime;
  const noiseDur = 0.06;
  const bufferSize = ctx.sampleRate * noiseDur;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(900, t0);
  bp.Q.setValueAtTime(0.6, t0);
  const gN = ctx.createGain();
  gN.gain.setValueAtTime(0.35, t0);
  gN.gain.exponentialRampToValueAtTime(0.001, t0 + noiseDur);
  noise.connect(bp).connect(gN).connect(ctx.destination);
  noise.start(t0);
  noise.stop(t0 + noiseDur);

  const osc = ctx.createOscillator();
  const gO = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(95, t0);
  osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.12);
  gO.gain.setValueAtTime(0, t0);
  gO.gain.linearRampToValueAtTime(0.18, t0 + 0.015);
  gO.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
  osc.connect(gO).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.17);
}
