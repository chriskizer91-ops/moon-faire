// Shared by the viewer and the stage: loading the Jester, and telling her spell effects where she is.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HER } from './pipeline.js';

function modelBytes() {            // the model travels as text in jester_glb_a.js, _b.js and _c.js
  const parts = window.JESTER_GLB_PARTS.map(p => atob(p)), n = parts.reduce((a, p) => a + p.length, 0), u = new Uint8Array(n);
  let k = 0;
  for (const s of parts) for (let i = 0; i < s.length; i++) u[k++] = s.charCodeAt(i);
  window.JESTER_GLB_PARTS = null;
  return u.buffer;
}

export function loadJester(scene) {
  return new Promise((resolve, reject) => {
    const done = gltf => {
      const root = gltf.scene, bones = {}; let lids = null, veil = null, tris = 0;
      scene.add(root);
      root.traverse(o => {
        o.layers.set(HER);
        if (o.isSkinnedMesh) o.frustumCulled = false;
        if (o.isBone) bones[o.name] = o;
        if (o.isMesh) tris += o.geometry.index.count / 3;
        if (o.isMesh && o.material.transparent) o.renderOrder = 5;       // the sheer veil is drawn after everything solid
        if (o.name === 'mesh_lids') { lids = o; o.visible = false; }
        if (o.name === 'mesh_veil') veil = o;
      });
      const j = root.getObjectByName('Jester') || root, ud = j.userData || {};
      const clips = {}; for (const c of gltf.animations) clips[c.name] = c;
      resolve({ root, bones, lids, veil, tris, clips, info: ud.clips || {}, palette: ud.palette || [], mixer: new THREE.AnimationMixer(root) });
    };
    const P = window.JESTER_GLB_PARTS;
    if (P && P.length === 3 && P.every(Boolean)) new GLTFLoader().parse(modelBytes(), '', done, reject);
    else new GLTFLoader().load('jester.glb', done, undefined, reject);
  });
}

// Blinking: her closed eyelids show for a moment every few seconds.
export function makeBlink(lids) {
  let t = 2.5;
  return dt => { if (!lids) return; t -= dt; lids.visible = t < 0.13; if (t < 0) t = 2.2 + Math.random() * 3.5; };
}

// What a spell's effects need to know about her this frame.
export function makeContext(J) {
  const v3 = () => new THREE.Vector3(), releaseAt = {};
  // Measure where her hands are at each spell's release moment, with nothing else playing. Call once after loading.
  function prime() {
    const { root, bones, info, mixer, clips } = J;
    const keepP = root.position.clone(), keepR = root.rotation.y;
    root.position.set(0, 0, 0); root.rotation.y = 0;
    for (const name of Object.keys(clips)) {
      if (!(info[name] && info[name].spell)) continue;
      mixer.stopAllAction();
      const a = mixer.clipAction(clips[name]); a.reset(); a.setEffectiveWeight(1); a.play(); a.time = info[name].release;
      mixer.update(0); root.updateMatrixWorld(true);
      const w = n => root.worldToLocal(bones[n].getWorldPosition(v3()));
      releaseAt[name] = { L: w('LeftHandMiddle1'), R: w('RightHandMiddle1'), tip: w('RightHandIndex3') };
      a.stop();
    }
    mixer.stopAllAction(); root.position.copy(keepP); root.rotation.y = keepR; root.updateMatrixWorld(true);
  }
  context.prime = prime;
  return context;
  function context(name, action, target) {
    const { root, bones, info, mixer } = J;
    const rq = root.getWorldQuaternion(new THREE.Quaternion());
    const c = {
      q: rq, release: info[name].release, out: { dim: 0, shake: 0 },
      bone: n => bones[n].getWorldPosition(v3()),
      hand: side => bones[side + 'HandMiddle1'].getWorldPosition(v3()),
      at: (x, y, z) => root.localToWorld(v3().set(x, y, z)),
      dir: (x, y, z) => v3().set(x, y, z).applyQuaternion(rq),
    };
    const ra = releaseAt[name];
    c.releaseL = root.localToWorld(ra.L.clone()); c.releaseR = root.localToWorld(ra.R.clone()); c.releaseTip = root.localToWorld(ra.tip.clone());
    c.target = target ? target.clone() : c.at(0, 1.15, 2.6);          // what she casts at: its middle,
    c.ground = c.target.clone(); c.ground.y = root.position.y + 0.03;  // and the ground under it
    return c;
  }
}
