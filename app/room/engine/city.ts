import * as THREE from "three";

/* New York at night, outside the window: a real photograph (Midtown from Top of the Rock, by
   Anthony Delanoix on Unsplash, public/room/nyc.webp) set far behind the glass, so it moves against
   the window frame the way a real view does. A few lit windows flicker, rain falls in front of the
   city, and drops sit and slide on the glass. */

const NOISE = /* glsl */ `
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
`;

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
`;

const photoFrag = /* glsl */ `
uniform sampler2D uMap; uniform float uTime; uniform vec2 uPx; uniform vec2 uScale; uniform vec2 uShift;
varying vec2 vUv;
${NOISE}
void main(){
  // the plane is bigger than the photo: the photo sits in the middle, mirrored out to the sides
  vec2 uv = (vUv - .5) * uScale + .5 + uShift;
  vec3 c = texture2D(uMap, uv).rgb;                        // linear (the texture is sRGB-decoded)
  float l = dot(c, vec3(.2126, .7152, .0722));
  // lit windows: now and then one dims or brightens
  vec2 cell = floor(uv * uPx / 3.);
  float k = h21(cell + floor(uTime * .35 + h21(cell) * 9.));
  c *= 1. + smoothstep(.03, .12, l) * (k > .985 ? -.6 : (k - .5) * .12);
  // rain falling between us and the city: thin streaks
  float col = floor(vUv.x * 420.);
  float sp = .55 + .45 * h11(col);
  float y = fract(vUv.y * 1.6 + uTime * sp * .9 + h11(col * 1.7));
  float streak = step(.93, h11(col * 3.1)) * smoothstep(.0, .02, y) * smoothstep(.12, .02, y);
  c += vec3(.55, .62, .75) * streak * .045;
  c *= .9;                                                   // seen through wet glass
  gl_FragColor = vec4(c, 1.);
}
`;

// Rain on the glass: drops that sit, drops that slide and leave a trail, and a little fog low down.
const glassFrag = /* glsl */ `
uniform float uTime; uniform vec2 uSize;
varying vec2 vUv;
${NOISE}
float drops(vec2 m, float scale, float t){
  vec2 g = m * scale; vec2 id = floor(g); vec2 f = fract(g) - .5;
  float r = h21(id);
  float slide = step(.86, r);
  float y = slide > .5 ? fract(-t * (.15 + r * .2) + r * 7.) - .5 : (h21(id + 3.) - .5) * .7;
  vec2 p = vec2((h21(id + 1.) - .5) * .6, y);
  float d = length((f - p) * vec2(1., 1.25));
  float drop = smoothstep(.06 + .04 * r, .015, d) * step(.78, r);
  float trail = slide * smoothstep(.03, .0, abs(f.x - p.x)) * smoothstep(p.y, p.y + .5, f.y) * .35;
  return drop + trail;
}
void main(){
  vec2 m = vUv * uSize;
  float a = drops(m, 18., uTime) + drops(m + 3.7, 34., uTime * 1.3) * .5;
  float fog = smoothstep(.35, 0., vUv.y) * .12;
  vec3 c = vec3(.5, .58, .7);
  gl_FragColor = vec4(c, clamp(a * .22 + fog, 0., .5));
}
`;

// Where things are in the photo: its aspect, the horizon (fraction from the top), the Empire State's x.
const PHOTO = { aspect: 2650 / 1500, horizon: 0.587, esb: 0.557, url: "/room/nyc.webp" };

export function buildCity(
  win: { x0: number; x1: number; z0: number; z1: number; back: number },
  eye: { x: number; y: number; z: number },
) {
  const group = new THREE.Group();
  const uniforms: { uTime: { value: number } }[] = [];
  const wx = (win.x0 + win.x1) / 2;
  const wz = -win.back;

  // The photo sits far behind the glass, big enough that the window stays full whatever the camera
  // does. Aimed so the Empire State is a little left of the window's middle and the horizon a
  // little below eye level, seen from the home view.
  const D = 10;                                    // metres behind the window
  const k = (eye.z - (wz - D)) / (eye.z - wz);     // how far a point seen in the window spreads at the photo
  const PW = (win.x1 - win.x0) * k * 1.2;          // the photo's own width: the window shows ~5/6 of it
  const PH = PW / PHOTO.aspect;
  const esbX = eye.x + (wx - 0.2 - eye.x) * k;     // the Empire State, a little left of the middle
  const horizonY = eye.y + (1.5 - eye.y) * k;      // the horizon, seen just above eye level
  const cx = esbX - (PHOTO.esb - 0.5) * PW, cy = horizonY + (PHOTO.horizon - 0.5) * PH;
  const W = 40, H = 24;                            // the plane: big enough for any view through the window
  const tex = new THREE.TextureLoader().load(PHOTO.url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.wrapS = THREE.MirroredRepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  const photoU = {
    uTime: { value: 0 }, uMap: { value: tex }, uPx: { value: new THREE.Vector2(2650, 1500) },
    uScale: { value: new THREE.Vector2(W / PW, H / PH) }, uShift: { value: new THREE.Vector2(0, 0) },
  };
  uniforms.push(photoU);
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: photoFrag, uniforms: photoU }),
  );
  photo.position.set(cx, cy, wz - D);
  group.add(photo);

  const gw = win.x1 - win.x0, gh = win.z1 - win.z0;
  const glassMat = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: glassFrag, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uSize: { value: new THREE.Vector2(gw, gh) } },
  });
  uniforms.push(glassMat.uniforms as unknown as { uTime: { value: number } });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), glassMat);
  glass.position.set(wx, (win.z0 + win.z1) / 2, wz - 0.06);
  glass.renderOrder = 2;
  group.add(glass);

  return {
    group,
    tick(t: number) { for (const u of uniforms) u.uTime.value = t; },
  };
}
