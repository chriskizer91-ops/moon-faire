// How a frame is drawn, for the viewer and the stage alike.
// Layers: 0 the solid stage, 1 her, 2 stage glows (never block anything), 3 her spell effects.
// Spell effects are brighter than white, and a bloom pass makes whatever is brighter than white glow.
// The pixel finish redraws her small, snaps her to her palette, inks the outline, and lays the spell light over that.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const STAGE = 0, HER = 1, DECOR = 2, FXL = 3;

export function makePipeline(renderer, scene, opts = {}) {
  const rows = opts.rows || 520;
  let lowA = null, lowB = null, cur = { camera: null, pixel: false };
  const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });
  const pixMat = new THREE.ShaderMaterial({
    uniforms: { a: { value: null }, b: { value: null }, texel: { value: new THREE.Vector2() }, pal: { value: Array.from({ length: 64 }, () => new THREE.Vector3()) }, npal: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      precision highp float; varying vec2 vUv; uniform sampler2D a; uniform sampler2D b; uniform vec2 texel; uniform vec3 pal[64]; uniform int npal;
      vec3 toS(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      vec3 toL(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
      void main(){
        vec4 c = texture2D(a, vUv); vec3 glow = texture2D(b, vUv).rgb;
        if (c.a < 0.5) {
          float n = max(max(texture2D(a, vUv + vec2(texel.x, 0.0)).a, texture2D(a, vUv - vec2(texel.x, 0.0)).a),
                        max(texture2D(a, vUv + vec2(0.0, texel.y)).a, texture2D(a, vUv - vec2(0.0, texel.y)).a));
          if (n >= 0.5) { gl_FragColor = vec4(toL(pal[0]) + glow, 1.0); return; }      // the inked outline, in her darkest colour
          gl_FragColor = vec4(glow, 0.0); return;                                         // spell light only: added to the stage
        }
        vec3 s = toS(c.rgb / c.a), best = pal[0]; float bd = 1e9;
        for (int i = 0; i < 64; i++) { if (i >= npal) break; vec3 d = s - pal[i]; float dd = dot(d * vec3(0.9, 1.2, 0.8), d); if (dd < bd) { bd = dd; best = pal[i]; } }
        gl_FragColor = vec4(toL(best) + glow, 1.0);
      }`,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, depthTest: false, depthWrite: false, transparent: true,
  });
  const quad = new FullScreenQuad(pixMat);
  const black = new THREE.Color(0x000000);

  class StagePass extends Pass {
    constructor() { super(); this.needsSwap = false; }
    render(r, writeBuffer, readBuffer) {
      const cam = cur.camera, bg = scene.background;
      const view = h => { if (opts.onViewport) opts.onViewport(h); };
      r.setRenderTarget(readBuffer); r.setClearColor(black, 1); r.clear();
      if (!cur.pixel || !lowA) {
        cam.layers.enableAll(); view(readBuffer.height);
        r.render(scene, cam);
      } else {
        cam.layers.disableAll(); cam.layers.enable(STAGE); cam.layers.enable(DECOR);
        r.render(scene, cam);                                    // the stage, as usual
        scene.background = null;
        // her, small, under flat white light, hidden where the stage is in front of her
        r.setRenderTarget(lowA); r.setClearColor(black, 0); r.clear();
        cam.layers.set(STAGE); scene.overrideMaterial = depthOnly; r.render(scene, cam); scene.overrideMaterial = null;
        if (opts.flatLight) opts.flatLight(true);
        cam.layers.set(HER); r.render(scene, cam);
        if (opts.flatLight) opts.flatLight(false);
        // her spell light, small, hidden where she or the stage is in front of it
        r.setRenderTarget(lowB); r.clear();
        cam.layers.disableAll(); cam.layers.enable(STAGE); cam.layers.enable(HER);
        scene.overrideMaterial = depthOnly; r.render(scene, cam); scene.overrideMaterial = null;
        cam.layers.set(FXL); view(lowB.height); r.render(scene, cam);
        r.setRenderTarget(readBuffer); quad.render(r);           // palette, outline, hard pixels, light on top
        scene.background = bg; cam.layers.enableAll();
      }
    }
  }

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new StagePass());
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), opts.bloom || 0.6, 0.55, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  return {
    bloom,
    setPalette(pal) {
      pal.forEach((c, i) => { if (i < 64) pixMat.uniforms.pal.value[i].set(c[0] / 255, c[1] / 255, c[2] / 255); });
      pixMat.uniforms.npal.value = Math.min(64, pal.length);
    },
    setSize(w, h, pixelRatio) {
      composer.setPixelRatio(pixelRatio); composer.setSize(w, h);
      const H = h * pixelRatio, Wp = w * pixelRatio, k = Math.max(1, Math.round(H / rows)), lw = Math.ceil(Wp / k), lh = Math.ceil(H / k);
      if (!lowA || lowA.width !== lw || lowA.height !== lh) {
        for (const t of [lowA, lowB]) if (t) t.dispose();
        const o = { type: THREE.HalfFloatType, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter, depthBuffer: true };
        lowA = new THREE.WebGLRenderTarget(lw, lh, o); lowB = new THREE.WebGLRenderTarget(lw, lh, o);
        pixMat.uniforms.a.value = lowA.texture; pixMat.uniforms.b.value = lowB.texture; pixMat.uniforms.texel.value.set(1 / lw, 1 / lh);
      }
    },
    render(camera, pixel) { cur.camera = camera; cur.pixel = pixel; composer.render(); },
  };
}
