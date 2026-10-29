import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

/* What makes the baked room feel like a photograph at night: the brightest things (the lamp, the
   projected slide, lit windows) glow a little, the corners fall off, and there is a fine grain.
   Plus the projector's beam: a faint cone of light with dust turning in it. */

// ------------------------------------------------------------------ post
const finish = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAspect: { value: 1 }, uGrain: { value: 1 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uAspect; uniform float uGrain; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = (vUv - .5) * vec2(uAspect, 1.);
      c.rgb *= mix(1., smoothstep(1.15, .35, length(q)), .55);        // vignette
      float g = h(vUv * 1000. + fract(uTime * 7.3) * 100.) - .5;
      c.rgb += g * .035 * uGrain * (1. - c.rgb * .6);                   // grain, gentler in highlights
      gl_FragColor = c;
    }`,
};

export function buildPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.42, 0.55, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fin = new ShaderPass(finish);
  composer.addPass(fin);
  return {
    composer, bloom,
    setSize(w: number, h: number, dpr: number) {
      composer.setPixelRatio(dpr); composer.setSize(w, h);
      fin.uniforms.uAspect.value = w / h;
    },
    render(t: number) { fin.uniforms.uTime.value = t; composer.render(); },
    setGrain(on: boolean) { fin.uniforms.uGrain.value = on ? 1 : 0; },
    dispose() { composer.dispose(); rt.dispose(); },
  };
}

// ------------------------------------------------------------------ the beam
export function buildBeam(lens: THREE.Vector3, center: THREE.Vector3, normal: THREE.Vector3, w: number, h: number) {
  const group = new THREE.Group();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normal).normalize();
  const up = new THREE.Vector3().crossVectors(normal, right).normalize();
  const corner = (a: number, b: number) => center.clone().addScaledVector(right, a * w / 2).addScaledVector(up, b * h / 2);
  const cs = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];

  // four sides of a pyramid from the lens to the screen; uv.y runs along the beam
  const pos: number[] = [], uv: number[] = [];
  for (let i = 0; i < 4; i++) {
    const a = cs[i], b = cs[(i + 1) % 4];
    pos.push(...lens.toArray(), ...a.toArray(), ...b.toArray());
    uv.push(0.5, 0, 0, 1, 1, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const uniforms = { uTime: { value: 0 }, uLens: { value: lens.clone() } };
  const cone = new THREE.Mesh(g, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      float n3(vec3 p){ return fract(sin(dot(floor(p), vec3(17.1, 31.7, 47.3))) * 43758.5); }
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float side = pow(1. - abs(dot(V, vN)), 2.2);                    // brighter seen edge-on, like a volume
        float round = sin(3.14159 * clamp(vUv.x, 0., 1.));              // no hard pyramid edges
        float along = smoothstep(0., .3, vUv.y) * (1. - .4 * vUv.y);
        float near = smoothstep(.25, 1.1, distance(cameraPosition, vW)); // fades when the camera is in it
        float drift = .85 + .15 * sin(vW.x * 9. + vW.y * 7. + uTime * .6);
        float a = side * round * along * near * drift * .045;
        gl_FragColor = vec4(vec3(.95, .97, 1.) * a, 1.);
      }`,
  }));
  cone.renderOrder = 3;
  group.add(cone);

  // dust: points scattered through the beam, turning slowly
  const N = 420;
  const seeds = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { seeds.set([Math.random(), Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()], i * 4); }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
  pg.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 4));
  const dust = new THREE.Points(pg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: uniforms.uTime, uLens: { value: lens.clone() }, uC: { value: center.clone() },
      uR: { value: right.clone().multiplyScalar(w / 2) }, uU: { value: up.clone().multiplyScalar(h / 2) },
      uPx: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec3 uLens, uC, uR, uU; uniform float uPx;
      attribute vec4 seed; varying float vA;
      void main(){
        float t = uTime * (.02 + seed.w * .03);
        float s = .12 + .85 * fract(seed.x + t * .3);
        vec2 ab = vec2(seed.y + .25 * sin(t * 3. + seed.w * 20.), seed.z + .25 * cos(t * 2.3 + seed.x * 17.)) * .9;
        vec3 p = mix(uLens, uC + uR * ab.x + uU * ab.y, s);
        vA = smoothstep(0., .15, s) * smoothstep(1., .85, s) * (1. - .5 * length(ab)) * (.4 + .6 * seed.w);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = uPx * (1.2 + 2.2 * seed.w) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d) * vA; gl_FragColor = vec4(vec3(1.) * a * .55, 1.); }`,
  }));
  dust.frustumCulled = false;
  dust.renderOrder = 3;
  group.add(dust);

  return {
    group,
    tick(t: number, px: number) {
      uniforms.uTime.value = t;
      (dust.material as THREE.ShaderMaterial).uniforms.uPx.value = px;
    },
  };
}
