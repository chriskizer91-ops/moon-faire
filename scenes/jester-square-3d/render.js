// Puts one frame together: the 3D square through the camera, with bloom, then
// the 2D finishing pass from scenes/lib/stage.js (flashes, spell names, titles,
// fades) on top. render(g, t, width, height) draws into the page's canvas.

let R3 = null, scene3 = null, camera3 = null, composer = null, NO_GL = false;
const VIEW_MAX = 1280;      // the 3D picture's widest; the page scales it up beyond this

function init3d() {
  try {
    R3 = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  } catch (e) { NO_GL = true; return; }
  R3.setPixelRatio(1);
  R3.shadowMap.enabled = true; R3.shadowMap.type = THREE.PCFShadowMap;
  R3.toneMapping = THREE.NeutralToneMapping; R3.toneMappingExposure = 1.1;
  scene3 = new THREE.Scene();
  camera3 = new THREE.PerspectiveCamera(45, 16 / 9, 0.05, 900);
  scene3.add(camera3);
  buildWorld(scene3); buildActors(scene3); buildFx(scene3);
  composer = new EffectComposer(R3, new THREE.WebGLRenderTarget(640, 360, { type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene3, camera3));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(640, 360), 0.75, 0.5, 0.82));
  composer.addPass(new OutputPass());
  composer.addPass(new SMAAPass());       // smooth edges, cheaper than multisampling (the video is drawn without a GPU)
}

// The camera from SHOTS, eased between keys; two keys at one time make a cut.
function shotAt(t) {
  let i = 1;
  while (i < SHOTS.length - 1 && SHOTS[i][0] <= t) i++;
  const a = SHOTS[i - 1], b = SHOTS[i];
  const k = b[0] > a[0] ? easeInOut(clamp((t - a[0]) / (b[0] - a[0]))) : 1;
  const P = s => new THREE.Vector3(...s[1]);
  const aim = s => (s[2] === "moon" ? P(s).add(new THREE.Vector3(MOON3.x, MOON3.y, MOON3.z).sub(P(s)).normalize().multiplyScalar(12)) : new THREE.Vector3(...s[2]));
  const pos = P(a).lerp(P(b), k), look = aim(a).lerp(aim(b), k);
  for (let j = 0; j < SHAKES.length; j++) {
    const [ts, amp, dur] = SHAKES[j], d = decay(t, ts, dur / 3);
    if (d <= 0.001) continue;
    const s = amp * d;
    pos.x += s * noise1(t * 28, 300 + j); pos.y += s * noise1(t * 31, 400 + j);
    look.x += s * 1.5 * noise1(t * 26, 500 + j); look.y += s * 1.5 * noise1(t * 29, 600 + j);
  }
  return { pos, look, fov: lerp(a[3], b[3], k) };
}

function noGL(g, ow, oh) {
  g.fillStyle = "#17121e"; g.fillRect(0, 0, ow, oh);
  g.fillStyle = "#e9dff2"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `${Math.round(oh * 0.05)}px system-ui, sans-serif`;
  g.fillText("This film needs WebGL, which this browser has turned off.", ow / 2, oh / 2);
}

function render(g, t, ow, oh) {
  if (!R3 && !NO_GL) init3d();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  if (NO_GL) { noGL(g, ow, oh); return; }
  const w = Math.min(ow, VIEW_MAX), h = Math.round((w * oh) / ow);
  if (R3.domElement.width !== w || R3.domElement.height !== h) { R3.setSize(w, h, false); composer.setSize(w, h); }
  const s = shotAt(t);
  camera3.aspect = w / h; camera3.fov = s.fov;
  camera3.position.copy(s.pos); camera3.lookAt(s.look);
  camera3.updateProjectionMatrix(); camera3.updateMatrixWorld();
  fxBegin();
  updateWorld(t, camera3);
  updateActors(t, camera3);
  updateFx(t, camera3);
  fxEnd(h);
  composer.render();
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
  g.drawImage(R3.domElement, 0, 0, ow, oh);
  post(g, t, ow, oh);
}
