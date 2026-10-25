import type { Sfx } from "./types";

/* Tiny square-wave blips from WebAudio: no files to load. Muted state is
   remembered; the context only starts after a press (autoplay rules). */

const KEY = "os-sound";
let ctx: AudioContext | null = null;

const TONES: Record<Sfx, [number, number, number, OscillatorType?]> = {
  // [start Hz, end Hz, seconds, wave]
  eat: [520, 880, 0.08],
  bonus: [660, 1320, 0.18],
  jump: [300, 620, 0.12],
  hit: [220, 110, 0.12, "sawtooth"],
  die: [440, 55, 0.5, "sawtooth"],
  start: [330, 990, 0.25],
  brick: [740, 740, 0.05],
  level: [440, 1760, 0.4],
};

export const sound = {
  get on() {
    try {
      return localStorage.getItem(KEY) !== "off";
    } catch {
      return true;
    }
  },
  set(on: boolean) {
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {}
  },
  play(name: Sfx) {
    if (!sound.on) return;
    try {
      ctx ??= new AudioContext();
      if (ctx.state === "suspended") void ctx.resume();
      const [f0, f1, dur, type = "square"] = TONES[name];
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch {}
  },
};
