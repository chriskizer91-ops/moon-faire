# Makes the painting guide for a person: the model in its standing pose, plain greys, seen flat from the front (left half)
# and from the back (right half), 1536 x 1024. A painting made over this guide can be laid straight back onto the model.
#   python3 people/kit/guides.py <person.js> <guide.png>
# The frame: each half is 1.5 m wide (x -0.75 to 0.75) and 2 m tall (y -0.1 to 1.9), 512 pixels to the metre. The back half is seen
# from behind, so her left is on its left.
import asyncio, base64, io, json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from shoot import Shooter
FRAME = {'size': [1536, 1024], 'half': [768, 1024], 'x': [-0.75, 0.75], 'y': [-0.1, 1.9], 'front': 'left half', 'back': 'right half, seen from behind'}
JS = '''async (code) => {
  await PV.show(code);
  const J = PV.J, st = PV.stage, R = st.renderer, c = R.domElement, out = [];
  J.skeleton.pose(); J.root.scale.set(1, 1, 1); J.root.updateMatrixWorld(true); J.fx.visible = false; st.catcher.visible = false;
  const lights = []; st.cast.traverse((o) => { if (o.isLight) { lights.push([o, o.intensity]); o.intensity = 0; } });
  const amb = new THREE.AmbientLight(0xffffff, 0.74), sun = new THREE.DirectionalLight(0xffffff, 0.42); st.cast.add(amb, sun, sun.target);
  const body = { torso: 0x9c9c9c, wine: 0x929292, cloth: 0xa6a6a6, leggings: 0x858585, boot: 0x666666, sole: 0x5a5a5a, face: 0xd6d6d6, hand: 0xd6d6d6 }, own = [0xbcbcbc, 0x8a8a8a, 0xcacaca, 0x787878, 0xacacac, 0x989898, 0xd0d0d0]; let i = 0;
  J.root.traverse((m) => { if (m.isSkinnedMesh) { m.receiveShadow = false; m.castShadow = false; m.material = new THREE.MeshLambertMaterial({ color: new THREE.Color(body[m.name] || own[i++ % own.length]).convertSRGBToLinear(), skinning: true, side: THREE.DoubleSide }); } });
  const sh = R.shadowMap.enabled; R.shadowMap.enabled = false;
  R.setPixelRatio(1); R.setSize(768, 1024, false); R.setClearColor(0x6e6e6e, 1);
  for (const z of [5, -5]) {
    const cam = new THREE.OrthographicCamera(-0.75, 0.75, 1.9, -0.1, 0.1, 20); cam.position.set(0, 0, z); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
    sun.position.set(z > 0 ? 0.6 : -0.6, 1.2, z); sun.target.position.set(0, 0.9, 0); sun.target.updateMatrixWorld();
    R.clear(); R.render(st.cast, cam); out.push(c.toDataURL('image/png'));
  }
  R.shadowMap.enabled = sh; st.cast.remove(amb, sun, sun.target); for (const [o, v] of lights) o.intensity = v; st.catcher.visible = true;
  return out;
}'''
async def guide(shooter, code):
    a, b = await shooter.body.evaluate(JS, code)
    im = Image.new('RGB', (1536, 1024)); im.paste(Image.open(io.BytesIO(base64.b64decode(a.split(',')[1]))), (0, 0)); im.paste(Image.open(io.BytesIO(base64.b64decode(b.split(',')[1]))), (768, 0)); return im
if __name__ == '__main__':
    async def main():
        s = await Shooter().start(); (await guide(s, open(sys.argv[1], encoding='utf-8').read())).save(sys.argv[2]); await s.stop()
    asyncio.run(main())
