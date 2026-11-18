
  // ---------- materials ----------
  const SHEENS = [];
  function sheen(mat, col, pw, k) {                  // a soft rim, the way velvet and fine fuzz catch light
    mat.userData.sheen = { c: new THREE.Color(col), p: pw, k: k };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uSheenC = { value: mat.userData.sheen.c }; sh.uniforms.uSheenP = { value: mat.userData.sheen.p }; sh.uniforms.uSheenK = { value: mat.userData.sheen.k };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSheenC; uniform float uSheenP; uniform float uSheenK;')
        .replace('#include <tonemapping_fragment>', 'float sFr = pow(1.0 - saturate(abs(dot(normalize(vViewPosition), normal))), uSheenP);\n gl_FragColor.rgb += uSheenC * (sFr * uSheenK * (0.4 + 0.6 * saturate(normal.y * 0.5 + 0.5)));\n#include <tonemapping_fragment>');
    };
    SHEENS.push(mat); return mat;
  }
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ skinning: true }, o));
  const phys = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ skinning: true }, o));
  const tLeg = leggingsTex(); tLeg.wrapS = THREE.RepeatWrapping;
  const MATS = {
    torso: sheen(std({ map: torsoTex(), roughness: 0.72 }), '#7d5aa8', 3, 0.10),
    wine: sheen(std({ map: fabricTex(256, PAL.wine, '#a8345e', PAL.wineDk, 3), roughness: 0.9 }), '#e0668f', 2.6, 0.42),
    cloth: sheen(std({ map: fabricTex(256, '#19141c', '#352b3a', '#08060a', 3), roughness: 0.92 }), '#5a4a66', 3, 0.25),
    leggings: sheen(std({ map: tLeg, roughness: 0.62 }), '#c79af0', 3, 0.22),
    boot: phys({ color: 0x0c0a0e, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }),
    sole: std({ color: 0x0a090b, roughness: 0.75 }),
    gold: std({ color: 0xd9a744, roughness: 0.28, metalness: 1 }),
    cord: std({ color: 0x2a2530, roughness: 0.8 }),
    skin: sheen(std({ color: new THREE.Color(PAL.skin).convertSRGBToLinear(), roughness: 0.52 }), '#ffb9a0', 3.2, 0.16),
    nail: phys({ color: 0x2a0f2e, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }),
    face: sheen(std({ map: faceT, roughness: 0.55 }), '#ffb9a0', 3.2, 0.12),
    hair: sheen(std({ map: fabricTex(256, '#0e0b10', '#2a2230', '#000000', 2, true), roughness: 0.5 }), '#4a3a58', 3, 0.3),
    cap: sheen(std({ map: capTex(), roughness: 0.9 }), '#6d6078', 2.6, 0.38),
    velvet: sheen(std({ map: fabricTex(256, '#19151b', '#3a313f', '#060507', 1), roughness: 0.92 }), '#6d6078', 2.4, 0.42),
    fur: sheen(std({ color: 0x0b090c, roughness: 1 }), '#4c4056', 1.6, 0.5)
  };

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'jester';
  root.add(SK.hips); root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  const meshes = {};
  let triCount = 0;
  for (const key in buckets) {
    const B = buckets[key], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(B.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(B.sw, 4));
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  function animate(phase, wb, t, dt) {}
  return { root, skeleton, bones, SK, animate, get triangles() { return triCount; } };
}
