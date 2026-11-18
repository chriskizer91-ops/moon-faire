// Envoi's foes in these pages. wraith.js is Envoi's own file, unchanged: it was written for three.js r128 loaded as a
// global, and for a plain renderer. This puts it on three.js 0.160 with the bloom and pixel pipeline:
// its painted textures are marked as colour, its solid parts go on the stage layer and its glows on the glow layer,
// and its lights are scaled to the newer light units.
import * as THREE from 'three';
import { STAGE, DECOR } from '../pipeline.js';

const LIGHT_K = 2.5;           // r128 point lights were brighter for the same number

// Envoi drew straight to the screen, where adding light is gentle. Here light is added before the picture is brightened
// for the screen, so the same glow would come out about three times too strong. This turns each glow down to match,
// then lifts it a little so the brightest parts catch the bloom.
const GAIN = 1.5, RIM = 0.3; let nth = 0;
function relight(m) {
  if (m.userData.relit) return; m.userData.relit = true;
  const add = m.blending === THREE.AdditiveBlending;
  if (m.isShaderMaterial) {
    const end = add ? ` gl_FragColor = vec4(pow(max(gl_FragColor.rgb * gl_FragColor.a, 0.0), vec3(2.2)) * ${GAIN.toFixed(2)}, 1.0); }` : ' gl_FragColor.rgb = pow(max(gl_FragColor.rgb, 0.0), vec3(2.2)); }';
    m.fragmentShader = m.fragmentShader.replace(/\}\s*$/, end); m.needsUpdate = true;
  } else if (add) {
    const prev = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '', id = nth++;
    m.onBeforeCompile = (sh, r) => {
      if (prev) prev.call(m, sh, r);
      sh.fragmentShader = sh.fragmentShader.replace('#include <fog_fragment>', (m.vertexColors ? ' gl_FragColor.rgb = pow(max(gl_FragColor.rgb, 0.0), vec3(2.2));' : '') + ` gl_FragColor.rgb *= pow(gl_FragColor.a, 1.2) * ${GAIN.toFixed(2)};\n#include <fog_fragment>`);
    };
    m.customProgramCacheKey = () => key + ':relit' + id; m.needsUpdate = true;
  } else if (m.onBeforeCompile && /uRimC/.test(m.onBeforeCompile.toString())) {      // the soul-green rim light on cloth and bone
    const prev = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '', id = nth++;
    m.onBeforeCompile = (sh, r) => { prev.call(m, sh, r); sh.fragmentShader = sh.fragmentShader.replace('gl_FragColor.rgb += uRimC * (', `gl_FragColor.rgb += ${RIM.toFixed(2)} * uRimC * (`); };
    m.customProgramCacheKey = () => key + ':rim' + id; m.needsUpdate = true;
  }
}

function adopt(root) {
  root.traverse(o => {
    o.frustumCulled = false;
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    let glow = o.isPoints || o.isSprite;
    for (const m of mats) {
      for (const k of ['map', 'emissiveMap']) if (m[k] && m[k].colorSpace !== THREE.SRGBColorSpace) { m[k].colorSpace = THREE.SRGBColorSpace; m[k].needsUpdate = true; }
      if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u && u.value && u.value.isTexture) { u.value.colorSpace = THREE.SRGBColorSpace; u.value.needsUpdate = true; }
      if (m.blending === THREE.AdditiveBlending || m.blending === THREE.CustomBlending || (m.transparent && !m.depthWrite)) glow = true;
      relight(m);
    }
    if (o.isLight) {
      o.layers.enableAll(); let v = o.intensity * LIGHT_K;
      Object.defineProperty(o, 'intensity', { get: () => v, set: x => { v = x * LIGHT_K; } });
    } else o.layers.set(glow ? DECOR : STAGE);
  });
}

// opts: { level 1 to 20, great: true for the great wraith, detail 0.5 to 1 }
export function makeWraith(scene, opts = {}) {
  if (!globalThis.THREE) globalThis.THREE = THREE;
  const m = window.makeWraith(opts);
  adopt(m.root); adopt(m.fx);
  scene.add(m.root, m.fx);
  m.dispose = () => {
    for (const r of [m.root, m.fx]) {
      scene.remove(r);
      r.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        for (const mat of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) { for (const k of ['map', 'emissiveMap', 'normalMap', 'alphaMap']) if (mat[k]) mat[k].dispose(); mat.dispose(); }
      });
    }
  };
  return m;
}
