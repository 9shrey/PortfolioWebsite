"use client";

import * as THREE from "three";
import { U } from "./uniforms";

/* ==========================================================================
   patchCity — turns a standard/physical material into a night building:
   lit windows on the side faces, a darkening toward the street, and the
   power wave (windows only switch on once the wave front has passed).
   Towers add: uFill (windows light bottom-up on ignition), uSel (Fresnel
   rim when selected), uDim (filtered/unfocused), uGrow handled as scale.
   ========================================================================== */

export interface CityOpts {
  variant: string;
  floor: number;
  tower?: boolean;
}

export interface TowerUniforms {
  uFill: { value: number };
  uSel: { value: number };
  uDim: { value: number };
  uSeed: { value: number };
  uBase: { value: number };
  uVisH: { value: number };
}

export function patchCity(mat: THREE.MeshStandardMaterial, o: CityOpts, tower?: TowerUniforms) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uPower: U.uPower,
      uPowerOrigin: U.uPowerOrigin,
      uC0Gain: U.uC0Gain,
      uDieTop: U.uDieTop,
      uTime: U.uTime,
      ...(tower ?? {
        uFill: { value: 1 },
        uSel: { value: 0 },
        uDim: { value: 0 },
        uSeed: { value: 0 },
        uBase: { value: 0 },
        uVisH: { value: 1 },
      }),
    });
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vCityPos;
        varying vec3 vCityN;
        #ifdef USE_INSTANCING
          attribute float aSeed;
          varying float vSeed;
        #endif`
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 cw = vec4(transformed, 1.);
        vec3 cn = objectNormal;
        #ifdef USE_INSTANCING
          cw = instanceMatrix * cw;
          cn = mat3(instanceMatrix) * cn;
          vSeed = aSeed;
        #endif
        cw = modelMatrix * cw;
        vCityPos = cw.xyz;
        vCityN = normalize(mat3(modelMatrix) * cn);`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vCityPos;
        varying vec3 vCityN;
        #ifdef USE_INSTANCING
          varying float vSeed;
        #endif
        uniform float uPower, uC0Gain, uDieTop, uTime, uFill, uSel, uDim, uSeed, uBase, uVisH;
        uniform vec2 uPowerOrigin;
        float cityHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        diffuseColor.rgb *= mix(.35, 1., smoothstep(uDieTop, uDieTop + .25, vCityPos.y));`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float seed = uSeed;
          #ifdef USE_INSTANCING
            seed += vSeed * 97.0;
          #endif
          float dist = distance(vCityPos.xz, uPowerOrigin);
          float on = smoothstep(uPower, uPower - 1.2, dist);
          float edge = exp(-pow((dist - uPower) / .25, 2.));
          float side = 1.0 - step(.5, abs(vCityN.y));
          vec2 tan2 = abs(vCityN.x) > .5 ? vec2(0., 1.) : vec2(1., 0.);
          float fl = floor((vCityPos.y - uDieTop) / ${o.floor.toFixed(3)});
          float colw = dot(vCityPos.xz, tan2) / .045;
          float col = floor(colw);
          vec2 cellF = vec2(fract(colw), fract((vCityPos.y - uDieTop) / ${o.floor.toFixed(3)}));
          float win = smoothstep(.15, .2, cellF.x) * smoothstep(.85, .8, cellF.x) * smoothstep(.22, .28, cellF.y) * smoothstep(.78, .72, cellF.y);
          float h = cityHash(vec3(fl, col, seed));
          float lit = step(.62, h);
          vec3 wc = mix(vec3(1., .902, .78), vec3(.75, .965, 1.), cityHash(vec3(seed, 3., 7.)));
          ${o.tower ? "lit *= step(vCityPos.y, uBase + uFill * uVisH);" : ""}
          float gain = 1.4 * uC0Gain * (1. - .7 * uDim);
          totalEmissiveRadiance += side * lit * win * on * wc * gain;
          totalEmissiveRadiance += vec3(.36, .95, 1.) * 2.5 * edge * step(.0, vCityPos.y - uDieTop + .01);
          ${
            o.tower
              ? `vec3 V = normalize(cameraPosition - vCityPos);
                 float fr = pow(1. - abs(dot(normalize(vCityN), V)), 3.);
                 totalEmissiveRadiance += vec3(.36, .95, 1.) * 1.3 * fr * uSel;
                 diffuseColor.rgb *= 1. - .6 * uDim;`
              : ""
          }
        }`
      );
  };
  mat.customProgramCacheKey = () => `city-v1-${o.variant}`;
  mat.needsUpdate = true;
  return mat;
}

/* ==========================================================================
   Traffic — light packets on ribbons (streets on C0 + the route polylines).
   aS = distance along the ribbon, aSN = normalised 0..1 along its route,
   aDir = ±1 lane direction, aSeed, aRoute = route id (−1 = street).
   ========================================================================== */

export function trafficMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uTime: U.uTime,
      uTraffic: U.uTraffic,
      uPower: U.uPower,
      uPowerOrigin: U.uPowerOrigin,
      uBurstRoute: U.uBurstRoute,
      uBurstT: U.uBurstT,
      uPreviewRoute: U.uPreviewRoute,
      uPreviewT: U.uPreviewT,
    },
    vertexShader: /* glsl */ `
      attribute float aS;
      attribute float aSN;
      attribute float aDir;
      attribute float aSeed;
      attribute float aRoute;
      varying float vS; varying float vSN; varying float vDir; varying float vSeed; varying float vRoute;
      varying vec3 vPos;
      void main() {
        vS = aS; vSN = aSN; vDir = aDir; vSeed = aSeed; vRoute = aRoute;
        vec4 w = modelMatrix * vec4(position, 1.);
        vPos = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uTraffic, uPower, uBurstRoute, uBurstT, uPreviewRoute, uPreviewT;
      uniform vec2 uPowerOrigin;
      varying float vS; varying float vSN; varying float vDir; varying float vSeed; varying float vRoute;
      varying vec3 vPos;
      void main() {
        float on = smoothstep(uPower, uPower - 1.2, distance(vPos.xz, uPowerOrigin));
        float d = fract(vS * 6. - uTime * .35 * uTraffic * vDir + vSeed * 7.);
        float head = smoothstep(.86, .9, d) * (1. - smoothstep(.9, 1.04, d));
        vec3 col = vDir > 0. ? vec3(.36, .95, 1.) : vec3(1., .71, .28);
        vec3 c = col * (0.06 + head * 3.0) * on;
        float isRoute = step(-.5, vRoute);
        c *= mix(1.0, 0.55, isRoute);
        float burst = (abs(vRoute - uBurstRoute) < .5 ? 1. : 0.) * 4. * exp(-pow((vSN - uBurstT) / .05, 2.));
        float prev = (abs(vRoute - uPreviewRoute) < .5 ? 1. : 0.) * step(vSN, uPreviewT) * 1.2;
        c += vec3(.36, .95, 1.) * (burst + prev);
        gl_FragColor = vec4(c, 1.);
      }
    `,
  });
}
