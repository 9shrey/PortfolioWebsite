import { STRIDE, type Figure } from "./figures";
import { pixelLabel } from "./pixelfont";

/* ==========================================================================
   The light field: one WebGL2 draw call of N point sprites.

   Every particle has a "from" (A) and a "to" (B) figure position; the vertex
   shader flies it between them with its own delay and a swirl that peaks
   mid-flight, breathes a little at rest, shies away from the pointer, and
   tilts in depth with it. Nothing is simulated on the CPU per frame.

   The curtain is the same particles: on a page change they leave their
   figure, tile the screen as a wall of pixels that spells where you're
   going, then dissolve into the next page's figure.
   ========================================================================== */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type RectSource = () => Rect | null;

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec4 aA0;
layout(location=1) in vec4 aA1;
layout(location=2) in vec4 aB0;
layout(location=3) in vec4 aB1;
layout(location=4) in vec2 aSeed;
uniform vec4 uRectA;
uniform vec4 uRectB;
uniform vec2 uView;
uniform float uDpr;
uniform float uMorph;
uniform float uTime;
uniform vec3 uPointer;
uniform vec2 uTilt;
uniform float uCover;
uniform float uCoverMode;
uniform vec2 uOrigin;
uniform vec3 uGrid;
uniform sampler2D uLabel;
uniform float uMotion;
uniform vec2 uOpaque;
uniform float uFade;
out vec4 vColor;
out float vSquare;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 place(vec4 p, vec4 r) {
  vec3 q = vec3((p.x - 0.5) * r.z, (p.y - 0.5) * r.w, p.z * r.z);
  float cy = cos(uTilt.x), sy = sin(uTilt.x);
  float cx = cos(uTilt.y), sx = sin(uTilt.y);
  q = vec3(q.x * cy + q.z * sy, q.y, -q.x * sy + q.z * cy);
  q = vec3(q.x, q.y * cx - q.z * sx, q.y * sx + q.z * cx);
  float persp = 1.0 / (1.0 + q.z / 2200.0);
  return vec3(r.xy + r.zw * 0.5 + q.xy * persp, persp);
}

void main() {
  float id = float(gl_VertexID);
  float s1 = aSeed.x;
  float s2 = aSeed.y;

  float d = s1 * 0.42;
  float e = smoothstep(d, d + 0.58, uMorph);
  vec3 pa = place(aA0, uRectA);
  vec3 pb = place(aB0, uRectB);
  vec2 pos = mix(pa.xy, pb.xy, e);

  float opaque = mix(uOpaque.x, uOpaque.y, e);
  float flight = sin(3.14159 * e) * uMotion;
  float ang = s2 * 6.2831 + uTime * 0.35 + pos.y * 0.004;
  pos += vec2(cos(ang), sin(ang)) * flight * (50.0 + 170.0 * s1);
  // Glowing dots breathe; opaque pixels (the portrait) hold still.
  pos += vec2(sin(uTime * 0.7 + s1 * 40.0), cos(uTime * 0.6 + s2 * 40.0)) * 1.1 * uMotion * (1.0 - 0.9 * opaque);

  vec2 dp = pos - uPointer.xy;
  float near = exp(-dot(dp, dp) / (120.0 * 120.0));
  pos += normalize(dp + vec2(1e-4)) * near * 46.0 * uPointer.z * uMotion;

  float size = mix(aA0.w * uRectA.z * pa.z, aB0.w * uRectB.z * pb.z, e);
  vec4 col = mix(aA1, aB1, e);
  col.a *= mix(1.0, 0.7 + 0.3 * sin(uTime * 2.2 + s1 * 60.0), (1.0 - opaque) * uMotion);
  col.a *= uFade;
  col.rgb += near * uPointer.z * uMotion * 0.25 * (1.0 - opaque);

  float k = 0.0;
  if (uCover > 0.0) {
    float cells = uGrid.x * uGrid.y;
    if (id < cells) {
      vec2 cell = vec2(mod(id, uGrid.x), floor(id / uGrid.x));
      vec2 c = (cell + 0.5) * uGrid.z;
      float order = uCoverMode < 0.5 ? clamp(distance(c, uOrigin) / length(uView), 0.0, 1.0) : s2;
      k = smoothstep(order * 0.6, order * 0.6 + 0.4, uCover);
      float lab = texture(uLabel, (cell + 0.5) / uGrid.xy).r;
      float flick = hash(id + floor(uTime * 14.0));
      vec3 tile = vec3(0.06, 0.055, 0.05) + flick * 0.025;
      tile = mix(tile, vec3(1.0, 0.33, 0.12), step(0.992, flick) * (1.0 - lab));
      tile = mix(tile, vec3(0.95, 0.92, 0.87) * (0.82 + 0.18 * flick), lab);
      pos = mix(pos, c, k);
      size = mix(size, uGrid.z * 0.92, k);
      col = mix(col, vec4(tile, 1.0), k);
      opaque = mix(opaque, 1.0, k);
    } else {
      col.a *= 1.0 - smoothstep(0.0, 0.4, uCover);
    }
  }

  vColor = col;
  vSquare = max(opaque, k);
  gl_Position = vec4((pos / uView * 2.0 - 1.0) * vec2(1.0, -1.0), 0.0, 1.0);
  gl_PointSize = max(mix(size * uDpr, ceil(size * uDpr + 0.35), vSquare), 1.0);
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec4 vColor;
in float vSquare;
out vec4 o;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float glow = smoothstep(0.5, 0.0, r);
  float a = mix(glow * glow, 1.0, vSquare) * vColor.a;
  if (a < 0.004) discard;
  // Premultiplied: alpha 0 adds light (glow), alpha 1 covers (pixels, tiles).
  o = vec4(vColor.rgb * a, vSquare * a);
}`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Tween = { from: number; to: number; start: number; dur: number; resolve: () => void };

export class Field {
  readonly n: number;
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private bufA: WebGLBuffer;
  private bufB: WebGLBuffer;
  private tex: WebGLTexture;
  private u: Record<string, WebGLUniformLocation | null> = {};

  private A: Float32Array;
  private B: Float32Array;
  private seeds: Float32Array;
  private rectA: RectSource = () => null;
  private rectB: RectSource = () => null;
  private lastA: Rect = { x: 0, y: 0, w: 1, h: 1 };
  private lastB: Rect = { x: 0, y: 0, w: 1, h: 1 };
  private opaque = [0, 0];

  private morph = 1;
  private morphStart = 0;
  private morphDur = 1500;
  private amount = 0;
  private coverMode = 0;
  private coverTween: Tween | null = null;
  private origin = { x: 0, y: 0 };
  private grid = { cols: 1, rows: 1, cell: 16 };
  private pointer = { x: -9999, y: -9999, z: 0, target: 0 };
  private tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  private fade = 0;
  private raf = 0;
  private t0 = performance.now();
  private dead = false;
  private dpr = 1;
  private view = { w: 1, h: 1 };

  constructor(
    private canvas: HTMLCanvasElement,
    n: number,
    private opts: { reduced: () => boolean; onLost: () => void; cell: number }
  ) {
    this.n = n;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("webgl2");
    this.gl = gl;
    this.prog = this.program();
    this.A = new Float32Array(n * STRIDE);
    this.B = new Float32Array(n * STRIDE);
    this.seeds = new Float32Array(n * 2);
    for (let i = 0; i < n * 2; i++) this.seeds[i] = Math.random();

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.bufA = this.buffer(this.A, 0);
    this.bufB = this.buffer(this.B, 2);
    const sb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, this.seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 2, gl.FLOAT, false, 0, 0);

    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0]));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    canvas.addEventListener("webglcontextlost", this.lost);
    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /* ------------------------------------------------------------ setup */

  private program() {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
    gl.useProgram(p);
    for (const name of [
      "uRectA", "uRectB", "uView", "uDpr", "uMorph", "uTime", "uPointer", "uTilt", "uCover",
      "uCoverMode", "uOrigin", "uGrid", "uLabel", "uMotion", "uOpaque", "uFade",
    ]) {
      this.u[name] = gl.getUniformLocation(p, name);
    }
    return p;
  }

  private buffer(data: Float32Array, loc: number) {
    const gl = this.gl;
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, STRIDE * 4, 0);
    gl.enableVertexAttribArray(loc + 1);
    gl.vertexAttribPointer(loc + 1, 4, gl.FLOAT, false, STRIDE * 4, 16);
    return b;
  }

  private upload(buf: WebGLBuffer, data: Float32Array) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
  }

  private lost = (e: Event) => {
    e.preventDefault();
    this.destroy();
    this.opts.onLost();
  };

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, this.n > 8000 ? 1.75 : 1.25);
    this.view = { w: window.innerWidth, h: window.innerHeight };
    this.canvas.width = Math.round(this.view.w * this.dpr);
    this.canvas.height = Math.round(this.view.h * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    let cell = this.opts.cell;
    while (Math.ceil(this.view.w / cell) * Math.ceil(this.view.h / cell) > this.n) cell += 1;
    this.grid = { cols: Math.ceil(this.view.w / cell), rows: Math.ceil(this.view.h / cell), cell };
  }

  /* ------------------------------------------------------------ figures */

  /** Fly to a new figure. Mid-flight interruptions start from where every
   *  particle actually is, not from where it was headed. */
  setFigure(fig: Figure, rect: RectSource, instant = false) {
    const now = performance.now();
    if (instant) {
      this.A.set(fig.data);
      this.B.set(fig.data);
      this.rectA = rect;
      this.rectB = rect;
      this.opaque = [fig.opaque, fig.opaque];
      this.morph = 1;
    } else {
      if (this.morph < 1) this.snapshot();
      else {
        this.A.set(this.B);
        this.rectA = this.rectB;
        this.lastA = this.lastB;
        this.opaque[0] = this.opaque[1];
      }
      this.B.set(fig.data);
      this.rectB = rect;
      this.opaque[1] = fig.opaque;
      this.morph = 0;
      this.morphStart = now;
      this.morphDur = this.opts.reduced() ? 1 : 1500;
    }
    this.upload(this.bufA, this.A);
    this.upload(this.bufB, this.B);
  }

  private snapshot() {
    const ra = this.rectA() ?? this.lastA;
    const rb = this.rectB() ?? this.lastB;
    const vw = this.view.w;
    const vh = this.view.h;
    for (let i = 0; i < this.n; i++) {
      const o = i * STRIDE;
      const d = this.seeds[i * 2] * 0.42;
      const e = smooth(d, d + 0.58, this.morph);
      const ax = ra.x + this.A[o] * ra.w;
      const ay = ra.y + this.A[o + 1] * ra.h;
      const bx = rb.x + this.B[o] * rb.w;
      const by = rb.y + this.B[o + 1] * rb.h;
      this.A[o] = (ax + (bx - ax) * e) / vw;
      this.A[o + 1] = (ay + (by - ay) * e) / vh;
      this.A[o + 2] = (this.A[o + 2] * ra.w + (this.B[o + 2] * rb.w - this.A[o + 2] * ra.w) * e) / vw;
      this.A[o + 3] = (this.A[o + 3] * ra.w + (this.B[o + 3] * rb.w - this.A[o + 3] * ra.w) * e) / vw;
      for (let c = 4; c < 8; c++) this.A[o + c] += (this.B[o + c] - this.A[o + c]) * e;
    }
    const frozen = { x: 0, y: 0, w: vw, h: vh };
    this.rectA = () => frozen;
    this.lastA = frozen;
    this.opaque[0] = this.opaque[0] + (this.opaque[1] - this.opaque[0]) * this.morph;
  }

  /* ------------------------------------------------------------ curtain */

  /** Spell the destination into the wall: a bitmap pixel font, one glyph
   *  pixel per tile; the display face only for text the font can't set. */
  setLabel(text: string, family: string) {
    const gl = this.gl;
    // Narrow screens: shrink the tiles (within the particle budget) until the
    // label sets legibly; split long words only if that still isn't enough.
    const fits = (cell: number) => Math.ceil(this.view.w / cell) * Math.ceil(this.view.h / cell) <= this.n;
    for (const split of [false, true]) {
      for (let cell = this.grid.cell; cell >= 6 && fits(cell); cell--) {
        const cols = Math.ceil(this.view.w / cell);
        const rows = Math.ceil(this.view.h / cell);
        const crisp = pixelLabel(text, cols, rows, split);
        if (!crisp) continue;
        this.grid = { cols, rows, cell };
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, crisp);
        return;
      }
    }
    const { cols, rows } = this.grid;
    const c = document.createElement("canvas");
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cols, rows);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = Math.floor(rows * 0.5);
    const font = (s: number) => `800 ${s}px ${family}`;
    (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "condensed";
    ctx.font = font(size);
    while (size > 6 && ctx.measureText(text).width > cols * 0.82) ctx.font = font(--size);
    ctx.fillText(text, cols / 2, rows / 2 + size * 0.04);
    const px = ctx.getImageData(0, 0, cols, rows).data;
    const mask = new Uint8Array(cols * rows);
    for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4] > 110 ? 255 : 0;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, mask);
  }

  private tweenCover(to: number, dur: number, mode: number) {
    this.coverTween?.resolve();
    this.coverMode = mode;
    return new Promise<void>((resolve) => {
      this.coverTween = { from: this.amount, to, start: performance.now(), dur, resolve };
    });
  }

  cover(origin: { x: number; y: number }) {
    this.origin = origin;
    return this.tweenCover(1, 720, 0);
  }

  reveal() {
    return this.tweenCover(0, 1100, 1);
  }

  get covered() {
    return this.amount > 0;
  }

  /* ------------------------------------------------------------ input */

  setPointer(x: number, y: number, active: boolean) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.target = active ? 1 : 0;
    this.tilt.tx = ((x / this.view.w) * 2 - 1) * 0.16;
    this.tilt.ty = -((y / this.view.h) * 2 - 1) * 0.1;
  }

  /* ------------------------------------------------------------ frame */

  private loop(now: number) {
    if (this.dead) return;
    this.raf = requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const gl = this.gl;
    const reduced = this.opts.reduced();
    const motion = reduced ? 0 : 1;

    if (this.morph < 1) this.morph = Math.min(1, (now - this.morphStart) / this.morphDur);
    if (this.coverTween) {
      const t = Math.min(1, (now - this.coverTween.start) / this.coverTween.dur);
      this.amount = this.coverTween.from + (this.coverTween.to - this.coverTween.from) * ease(t);
      if (t >= 1) {
        const r = this.coverTween.resolve;
        this.coverTween = null;
        r();
      }
    }
    this.fade = Math.min(1, (now - this.t0) / 1400);
    this.pointer.z += (this.pointer.target - this.pointer.z) * 0.08;
    this.tilt.x += (this.tilt.tx * motion - this.tilt.x) * 0.05;
    this.tilt.y += (this.tilt.ty * motion - this.tilt.y) * 0.05;

    const ra = this.rectA() ?? this.lastA;
    const rb = this.rectB() ?? this.lastB;
    this.lastA = ra;
    this.lastB = rb;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.prog);
    gl.bindVertexArray(this.vao);
    const u = this.u;
    gl.uniform4f(u.uRectA, ra.x, ra.y, ra.w, ra.h);
    gl.uniform4f(u.uRectB, rb.x, rb.y, rb.w, rb.h);
    gl.uniform2f(u.uView, this.view.w, this.view.h);
    gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform1f(u.uMorph, this.morph);
    gl.uniform1f(u.uTime, (now - this.t0) / 1000);
    gl.uniform3f(u.uPointer, this.pointer.x, this.pointer.y, this.pointer.z);
    gl.uniform2f(u.uTilt, this.tilt.x, this.tilt.y);
    gl.uniform1f(u.uCover, this.amount);
    gl.uniform1f(u.uCoverMode, this.coverMode);
    gl.uniform2f(u.uOrigin, this.origin.x, this.origin.y);
    gl.uniform3f(u.uGrid, this.grid.cols, this.grid.rows, this.grid.cell);
    gl.uniform1i(u.uLabel, 0);
    gl.uniform1f(u.uMotion, motion);
    gl.uniform2f(u.uOpaque, this.opaque[0], this.opaque[1]);
    gl.uniform1f(u.uFade, ease(this.fade));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.drawArrays(gl.POINTS, 0, this.n);
  }

  get settled() {
    return this.morph >= 1;
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    this.coverTween?.resolve();
    this.canvas.removeEventListener("webglcontextlost", this.lost);
  }
}
