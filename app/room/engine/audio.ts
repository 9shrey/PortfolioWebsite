/* Sound for the room, all synthesised: rain on the window, a music-box waltz, and small clicks.
   The waltz is an original tune in 3/4. Nothing makes a sound until the visitor turns sound on. */

/** A recording to play instead of the waltz: put a track you hold the rights to in public/room/
 *  and set its path here, e.g. "/room/music.mp3". */
const MUSIC_URL: string | null = null;

const N = (s: string) => {          // "A4" -> Hz
  const m = /^([A-G])(#|b)?(\d)$/.exec(s)!;
  const base = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1] as "C"]!;
  const semi = base + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, semi / 12);
};

// Melody: [note, beats]. 3 beats a bar, 16 bars, then the B section, then home.
const A = "D5 2|F5 1|A5 2|G5 1|F5 2|E5 1|D5 3|C#5 2|E5 1|A4 2|C#5 1|E5 3|D5 3|D5 2|F5 1|A5 2|D6 1|C6 2|Bb5 1|A5 3|G5 2|Bb5 1|E5 2|G5 1|F5 2|E5 1|D5 3";
const B = "F5 2|G5 1|A5 2|Bb5 1|C6 3|A5 3|Bb5 2|A5 1|G5 2|F5 1|E5 3|C5 3|F5 2|A5 1|C6 2|F6 1|E6 2|D6 1|C6 3|Bb5 2|A5 1|G5 2|E5 1|F5 3|A4 3";
const CHORDS = ["Dm", "Dm", "A", "A", "Dm", "Dm", "Gm", "A", "F", "F", "C", "F", "Bb", "C", "F", "A"];
const TRIADS: Record<string, string[]> = {
  Dm: ["D3", "F4", "A4"], A: ["A2", "C#4", "E4"], Gm: ["G2", "Bb3", "D4"], F: ["F2", "A3", "C4"], C: ["C3", "E4", "G4"], Bb: ["Bb2", "D4", "F4"],
};

export class RoomAudio {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private rainBus!: GainNode;
  private timer = 0;
  private nextBeat = 0;
  private beat = 0;
  private track: HTMLAudioElement | null = null;
  on = false;

  async start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
      const verb = this.reverb();
      this.musicBus = c.createGain(); this.musicBus.gain.value = 0.22;
      this.musicBus.connect(this.master); this.musicBus.connect(verb.input); verb.output.connect(this.master);
      this.rainBus = c.createGain(); this.rainBus.gain.value = 0.5; this.rainBus.connect(this.master);
      this.rain();
      if (MUSIC_URL) {
        this.track = new Audio(MUSIC_URL); this.track.loop = true; this.track.volume = 0.35;
      }
    }
    await this.ctx.resume();
    this.on = true;
    this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.6);
    if (this.track) this.track.play().catch(() => {});
    else if (!this.timer) { this.nextBeat = this.ctx.currentTime + 0.3; this.timer = window.setInterval(this.schedule, 60); }
  }

  stop() {
    if (!this.ctx) return;
    this.on = false;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    this.track?.pause();
    window.clearInterval(this.timer); this.timer = 0;
  }

  // ---------------------------------------------------------------- rain
  private rain() {
    const c = this.ctx!;
    const len = c.sampleRate * 4, buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch); let b = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = b * 3.5 + w * 0.08; }
    }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 180;
    src.connect(hp).connect(lp).connect(this.rainBus); src.start();
    // drops on the glass
    const drop = () => {
      if (!this.ctx) return;
      const t = c.currentTime;
      if (this.on) {
        const n = c.createBufferSource(); n.buffer = buf;
        const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2500 + Math.random() * 3500; bp.Q.value = 6;
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25 + Math.random() * 0.3, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        const pan = c.createStereoPanner(); pan.pan.value = Math.random() * 1.6 - 0.8;
        n.connect(bp).connect(g).connect(pan).connect(this.rainBus); n.start(t, Math.random() * 3, 0.08);
      }
      setTimeout(drop, 40 + Math.random() * 260);
    };
    drop();
  }

  private reverb() {
    const c = this.ctx!, len = c.sampleRate * 2.6, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    const input = c.createConvolver(); input.buffer = ir;
    const output = c.createGain(); output.gain.value = 0.35; input.connect(output);
    return { input, output };
  }

  // ---------------------------------------------------------------- the waltz
  private melody = [...A.split("|"), ...B.split("|"), ...A.split("|")].map((s) => { const [n, b] = s.split(" "); return [n, Number(b)] as const; });
  private mi = 0; private mBeat = 0;
  private schedule = () => {
    const c = this.ctx!; const spb = 60 / 132;
    while (this.nextBeat < c.currentTime + 0.25) {
      const t = this.nextBeat;
      // melody
      if (this.mBeat <= 0) {
        const [n, b] = this.melody[this.mi % this.melody.length];
        this.bell(N(n), t, b * spb * 1.6, 0.42);
        this.mi++; this.mBeat = b;
      }
      this.mBeat--;
      // left hand: bass on one, the chord on two and three
      const bar = Math.floor(this.beat / 3), inBar = this.beat % 3;
      const ch = TRIADS[CHORDS[bar % CHORDS.length]];
      if (inBar === 0) this.bell(N(ch[0]), t, spb * 2.6, 0.32, true);
      else for (const n of ch.slice(1)) this.bell(N(n), t, spb * 0.9, 0.11, true);
      this.beat++; this.nextBeat += spb;
    }
  };

  private bell(f: number, t: number, dur: number, vol: number, soft = false) {
    const c = this.ctx!;
    const g = c.createGain(); g.connect(this.musicBus);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const partials = soft ? [[1, 1], [2, 0.18]] : [[1, 1], [2.0, 0.35], [3.01, 0.12], [4.2, 0.06]];
    for (const [k, a] of partials) {
      const o = c.createOscillator(); o.type = soft ? "triangle" : "sine"; o.frequency.value = f * k;
      const pg = c.createGain(); pg.gain.value = a * (soft ? 0.7 : 1);
      o.connect(pg).connect(g); o.start(t); o.stop(t + dur + 0.05);
    }
  }

  // ---------------------------------------------------------------- effects
  click(kind: "card" | "tick" | "sip" | "whirr" | "key" | "switch" | "swish") {
    if (!this.ctx || !this.on) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain(); o.connect(g).connect(this.master);
    if (kind === "card") {        // the card seats in its slot: a dull clunk
      o.type = "square"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.08);
      g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.start(t); o.stop(t + 0.15);
      this.click("whirr");
    } else if (kind === "whirr") { // fans spin up
      o.type = "sawtooth"; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(220, t + 1.4);
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 500; o.disconnect(); o.connect(lp).connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      o.start(t); o.stop(t + 2.5);
    } else if (kind === "key") {   // a mechanical switch: a short noisy click with a little thock under it
      o.type = "triangle"; o.frequency.setValueAtTime(320 + Math.random() * 60, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.03);
      g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.start(t); o.stop(t + 0.06);
      const n = c.createOscillator(), ng = c.createGain(); n.type = "square"; n.frequency.value = 2400 + Math.random() * 800;
      ng.gain.setValueAtTime(0.025, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
      n.connect(ng).connect(this.master); n.start(t); n.stop(t + 0.02);
    } else if (kind === "switch") {   // a lamp's push switch: two short clicks
      o.type = "square"; o.frequency.setValueAtTime(900, t);
      g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
      g.gain.setValueAtTime(0.04, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.start(t); o.stop(t + 0.08);
    } else if (kind === "swish") {    // curtain rings along the rod
      o.type = "sawtooth"; o.frequency.setValueAtTime(2200, t); o.frequency.linearRampToValueAtTime(1500, t + 0.6);
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 2; o.disconnect(); o.connect(bp).connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.start(t); o.stop(t + 0.75);
    } else if (kind === "sip") {
      o.type = "sine"; o.frequency.setValueAtTime(400, t); o.frequency.linearRampToValueAtTime(260, t + 0.3);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.04, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.start(t); o.stop(t + 0.4);
    } else {
      o.type = "triangle"; o.frequency.value = 1800;
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      o.start(t); o.stop(t + 0.05);
    }
  }

  dispose() { this.stop(); this.ctx?.close(); this.ctx = null; }
}
