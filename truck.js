import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('truck3d');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 700px)').matches || matchMedia('(pointer: coarse)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.getElementById('fallback').hidden = false; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = !MOBILE; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x141a25, 22, 46);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

// lights
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a1d14, 0.55));
const sun = new THREE.DirectionalLight(0xfff1de, 2.4);
sun.position.set(-6, 11, 7); sun.castShadow = !MOBILE;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 10, bottom: -8, near: 1, far: 40 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun);
const rim = new THREE.DirectionalLight(0xff7a45, 1.6); rim.position.set(8, 4, -8); scene.add(rim);

// materials
const M = {
  paint: new THREE.MeshPhysicalMaterial({ color: 0xf4efe6, roughness: .35, metalness: .1, clearcoat: 1, clearcoatRoughness: .15 }),
  orange: new THREE.MeshPhysicalMaterial({ color: 0xff5a1f, roughness: .3, metalness: .15, clearcoat: 1, clearcoatRoughness: .1 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x12161d, roughness: .6, metalness: .4 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: .12, metalness: 1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0b1522, roughness: .05, metalness: .2, clearcoat: 1, envMapIntensity: 2 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: .9 }),
  inside: new THREE.MeshStandardMaterial({ color: 0xb7ad9c, roughness: .8 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x9b6b43, roughness: .7 }),
  light: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d6, emissiveIntensity: 2.2 }),
  tail: new THREE.MeshStandardMaterial({ color: 0x440000, emissive: 0xff2200, emissiveIntensity: 1.6 }),
  card: new THREE.MeshStandardMaterial({ color: 0xc8935c, roughness: .85 }),
  tape: new THREE.MeshStandardMaterial({ color: 0xe8d6b0, roughness: .5 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0x4f6378, roughness: .95 }),
  fabric2: new THREE.MeshStandardMaterial({ color: 0x8a3b2a, roughness: .95 }),
  bag: new THREE.MeshPhysicalMaterial({ color: 0x1c1f24, roughness: .35, clearcoat: .6 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe9e7e0, roughness: .4, metalness: .1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x5f7f3e, roughness: .9, flatShading: true }),
};
const shadowy = o => { o.traverse(c => { if (c.isMesh) { c.castShadow = !MOBILE; c.receiveShadow = !MOBILE; } }); return o; };
const box = (w, h, d, mat, r = .04, seg = 2) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat);

// ---------- truck ----------
const truck = new THREE.Group();
const L = 4.6, H = 2.4, W = 2.3, T = .08, FY = .95; // cargo dims, floor height
const cargo = new THREE.Group(); cargo.position.set(-0.6, 0, 0); truck.add(cargo);
const panel = (w, h, d, x, y, z, m = M.paint) => { const p = box(w, h, d, m, .03); p.position.set(x, y, z); cargo.add(p); return p; };
panel(L, T, W, 0, FY, 0, M.inside);                    // floor
panel(L, T, W, 0, FY + H, 0);                          // roof
panel(L, H, T, 0, FY + H / 2, W / 2);                  // side +z
panel(L, H, T, 0, FY + H / 2, -W / 2);                 // side -z
panel(T, H, W, L / 2, FY + H / 2, 0);                  // front wall
// inside liners
const liner = new THREE.Mesh(new THREE.PlaneGeometry(L, H), M.inside);
[[W / 2 - .05, Math.PI], [-W / 2 + .05, 0]].forEach(([z, r]) => { const l = liner.clone(); l.position.set(0, FY + H / 2, z); l.rotation.y = r; cargo.add(l); });
// orange stripes and rear frame
[W / 2 + .045, -W / 2 - .045].forEach(z => { const s = box(L + .02, .22, .02, M.orange, .01); s.position.set(0, FY + .35, z); cargo.add(s); });
const frameM = M.dark;
[[-L / 2, FY + H / 2, W / 2, .12, H + .1, .12], [-L / 2, FY + H / 2, -W / 2, .12, H + .1, .12], [-L / 2, FY + H + .02, 0, .12, .14, W + .1]].forEach(([x, y, z, a, b, c]) => { const f = box(a, b, c, frameM, .02); f.position.set(x, y, z); cargo.add(f); });
// logo decal
function logoTex(flip) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#ff5a1f'; g.beginPath(); g.roundRect(60, 90, 150, 150, 34); g.fill();
  g.fillStyle = '#0d1117'; g.fillRect(88, 140, 64, 54); g.beginPath(); g.moveTo(152, 158); g.lineTo(176, 158); g.lineTo(190, 176); g.lineTo(190, 194); g.lineTo(152, 194); g.fill();
  g.font = '800 118px "Bricolage Grotesque", Arial, sans-serif'; g.fillStyle = '#0d1117'; g.textBaseline = 'alphabetic';
  g.fillText('ONE CALL', 240, 200);
  g.font = '800 70px "Bricolage Grotesque", Arial, sans-serif'; g.fillStyle = '#ff5a1f'; g.fillText('REMOVAL LLC', 244, 280);
  g.font = '600 44px "Bricolage Grotesque", Arial, sans-serif'; g.fillStyle = '#0d1117'; g.fillText("We Haul. You're Done.", 64, 380);
  g.font = '600 52px "JetBrains Mono", monospace'; g.fillText('(978) 631-5404', 64, 450);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
let decals = [];
function makeDecals() {
  decals.forEach(d => cargo.remove(d)); decals = [];
  const tex = logoTex();
  [[W / 2 + .05, 0], [-W / 2 - .05, Math.PI]].forEach(([z, r]) => {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .4 }));
    d.position.set(r ? -.05 : .05, FY + 1.5, z); d.rotation.y = r; cargo.add(d); decals.push(d);
  });
}
makeDecals(); document.fonts && document.fonts.ready.then(makeDecals);
// roll-up rear door
const door = new THREE.Group(); door.position.set(-L / 2 - .02, FY + H, 0); cargo.add(door);
const doorMesh = new THREE.Group();
for (let i = 0; i < 10; i++) { const s = box(.05, H / 10 - .015, W - .1, M.white, .015); s.position.y = -(i + .5) * (H / 10); doorMesh.add(s); }
door.add(doorMesh);
// ramp
const ramp = new THREE.Group(); ramp.position.set(-L / 2, FY, 0); cargo.add(ramp);
const rampMesh = box(2.2, .06, 1.3, M.chrome, .02); rampMesh.position.x = -1.1; ramp.add(rampMesh);
// chassis
const chassis = box(6.6, .32, 1.6, M.dark, .05); chassis.position.set(.25, .72, 0); truck.add(chassis);
// cab
const cab = new THREE.Group(); cab.position.set(L / 2 - .6 + .05, 0, 0); truck.add(cab);
const cabBody = box(1.9, 1.55, 2.25, M.orange, .22, 4); cabBody.position.set(.95, 1.55, 0); cab.add(cabBody);
const hood = box(.7, .8, 2.2, M.orange, .18, 4); hood.position.set(1.95, 1.2, 0); cab.add(hood);
const roofCap = box(1.5, .55, 2.15, M.orange, .2, 4); roofCap.position.set(.75, 2.55, 0); cab.add(roofCap);
const wind = box(.08, .78, 2.0, M.glass, .03); wind.position.set(1.83, 1.95, 0); wind.rotation.z = -.18; cab.add(wind);
[1.13, -1.13].forEach(z => { const w = box(.95, .68, .04, M.glass, .02); w.position.set(1.15, 1.98, z); cab.add(w);
  const m = box(.06, .28, .16, M.dark, .02); m.position.set(1.75, 2.0, z + Math.sign(z) * .2); cab.add(m);
  const h = box(.25, .05, .05, M.chrome, .02); h.position.set(.7, 1.6, z + Math.sign(z) * .02); cab.add(h); });
const grille = box(.06, .5, 1.5, M.dark, .02); grille.position.set(2.31, 1.15, 0); cab.add(grille);
for (let i = 0; i < 5; i++) { const b = box(.07, .03, 1.4, M.chrome, .01); b.position.set(2.33, .95 + i * .1, 0); cab.add(b); }
const bumper = box(.3, .26, 2.35, M.dark, .06); bumper.position.set(2.32, .72, 0); cab.add(bumper);
[.82, -.82].forEach(z => { const hl = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .06, 24), M.light); hl.rotation.z = Math.PI / 2; hl.position.set(2.33, 1.42, z); cab.add(hl); });
const head = new THREE.SpotLight(0xfff2d0, 30, 14, .5, .6, 1.4); head.position.set(2.5, 1.4, 0); head.target.position.set(8, 0, 0); cab.add(head, head.target);
// tail lights
[[W / 2 - .15], [-W / 2 + .15]].forEach(([z]) => { const t = box(.05, .3, .14, M.tail, .02); t.position.set(-L / 2 - .08, FY + .35, z); cargo.add(t); });
// wheels
const wheels = [];
function wheel(x, z) {
  const g = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(.38, .2, 16, 36), M.tire); g.add(tire);
  const rimM = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .34, 28), M.tire); rimM.rotation.x = Math.PI / 2; g.add(rimM);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.26, .22, .38, 10), M.chrome); hub.rotation.x = Math.PI / 2; g.add(hub);
  for (let i = 0; i < 6; i++) { const n = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), M.dark); const a = i / 6 * Math.PI * 2; n.position.set(Math.cos(a) * .14, Math.sin(a) * .14, Math.sign(z) * .2); g.add(n); }
  g.position.set(x, .58, z); truck.add(g); wheels.push(g);
}
[[-1.9, 1.05], [-1.9, -1.05], [-1.2, 1.05], [-1.2, -1.05], [2.6, 1.05], [2.6, -1.05]].forEach(([x, z]) => wheel(x, z));
[[-1.55], [2.6]].forEach(([x]) => [1.18, -1.18].forEach(z => { const f = box(1.4, .12, .2, M.dark, .04); f.position.set(x, 1.05, z); truck.add(f); }));
shadowy(truck); scene.add(truck);

// ---------- ground ----------
const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x1a212d, roughness: .95 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const padMat = new THREE.MeshPhysicalMaterial({ color: 0x3a4250, roughness: .8, clearcoat: 0, clearcoatRoughness: .1 });
const pad = new THREE.Mesh(new RoundedBoxGeometry(9, .06, 7, 2, .03), padMat); pad.position.set(-6.2, .03, .2); pad.receiveShadow = true; scene.add(pad);
const glowRing = new THREE.Group(); const gM = new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0 });
glowRing.material = gM;
[[9.4, .06, .08, 0, 3.7], [9.4, .06, .08, 0, -3.7], [.08, .06, 7.4, 4.7, 0], [.08, .06, 7.4, -4.7, 0]].forEach(([a, b, c, x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), gM); m.position.set(x, 0, z); glowRing.add(m); });
glowRing.position.set(-6.2, .08, .2); scene.add(glowRing);
// sparkles for "clean"
const sparkles = new THREE.Group(); scene.add(sparkles);
const spG = new THREE.OctahedronGeometry(.12, 0), spM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(spG, spM); s.position.set(-6.2 + (Math.random() - .5) * 8, .3 + Math.random() * 1.6, .2 + (Math.random() - .5) * 6); s.userData.o = Math.random() * 6; sparkles.add(s); }

// ---------- junk items ----------
function cardboard(w, h, d) { const g = new THREE.Group(); g.add(box(w, h, d, M.card, .03)); const t = box(w * 1.01, .02, .12, M.tape, .005); t.position.y = h / 2; g.add(t); return g; }
function armchair() { const g = new THREE.Group(); const s = box(1, .35, .95, M.fabric, .1, 3); s.position.y = .35; g.add(s);
  const b = box(.25, .8, .95, M.fabric, .1, 3); b.position.set(-.38, .7, 0); g.add(b);
  [.42, -.42].forEach(z => { const a = box(.95, .45, .16, M.fabric, .07, 3); a.position.set(0, .5, z); g.add(a); });
  [[.4, .4], [.4, -.4], [-.4, .4], [-.4, -.4]].forEach(([x, z]) => { const l = box(.08, .2, .08, M.wood, .02); l.position.set(x, .1, z); g.add(l); }); return g; }
function cabinet() { const g = new THREE.Group(); const b = box(.9, 1.2, .6, M.wood, .03); b.position.y = .6; g.add(b);
  [.22, -.22].forEach(z => { const d = box(.02, 1.05, .26, new THREE.MeshStandardMaterial({ color: 0xb98559, roughness: .6 }), .01); d.position.set(.46, .6, z * 1); d.rotation.y = 0; g.add(d); });
  const h = box(.04, .2, .03, M.chrome, .01); h.position.set(.48, .7, .05); g.add(h); g.rotation.y = 0; return g; }
function tub() { const g = new THREE.Group(); const p = new THREE.LatheGeometry([[0, 0], [.55, 0], [.68, .3], [.7, .55], [.62, .55], [.5, .12], [0, .12]].map(([x, y]) => new THREE.Vector2(x, y)), 32);
  const m = new THREE.Mesh(p, M.white); m.scale.set(1.3, 1, .7); m.position.y = .12; g.add(m);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 10), M.chrome); f.position.set(i < 2 ? .6 : -.6, .06, i % 2 ? .3 : -.3); g.add(f); } return g; }
function trashbag() { const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.SphereGeometry(.4, 20, 16), M.bag); s.scale.set(1, .85, 1); s.position.y = .34; g.add(s);
  const k = new THREE.Mesh(new THREE.ConeGeometry(.1, .25, 10), M.bag); k.position.y = .72; g.add(k); return g; }
function lamp() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .05, 20), M.dark); g.add(b);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.3, 8), M.chrome); p.position.y = .65; g.add(p);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(.18, .32, .36, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xf1d9a8, roughness: .8, side: THREE.DoubleSide })); sh.position.y = 1.35; g.add(sh); return g; }
function mattress() { const g = new THREE.Group(); const m = box(1.6, .28, 1.0, new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: .9 }), .1, 3); m.position.y = .14; g.add(m);
  const s = box(1.62, .04, 1.02, new THREE.MeshStandardMaterial({ color: 0x7a8ca3 }), .02); s.position.y = .14; g.add(s); return g; }
function tire() { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(.32, .14, 12, 28), M.tire); t.rotation.x = Math.PI / 2; t.position.y = .14; g.add(t); return g; }
function shrub() { const g = new THREE.Group(); [[0, .3, 0, .38], [.25, .25, .15, .28], [-.2, .22, -.1, .26]].forEach(([x, y, z, r]) => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), M.leaf); s.position.set(x, y, z); g.add(s); }); return g; }

// [factory, start(x,z,rotY), target in cargo-local (x,y,z), target rotY]
const cf = FY + T / 2;
let defs = [
  [() => cabinet(), [-5.2, -1.6, .6], [1.6, cf, -.75, 0]],
  [() => armchair(), [-7.3, 1.2, -.9], [1.5, cf, .55, Math.PI]],
  [() => cardboard(.7, .55, .6), [-4.6, 1.7, .4], [.55, cf + .28, -.7, 0]],
  [() => tub(), [-8.4, -1.2, .3], [.4, cf, .5, 0]],
  [() => cardboard(.6, .5, .5), [-5.7, .4, -.5], [.5, cf + .8, -.7, .2]],
  [() => trashbag(), [-3.9, -.4, 0], [-.55, cf, -.6, 0]],
  [() => mattress(), [-7.0, -2.6, .25], [-.6, cf, .45, 0]],
  [() => lamp(), [-9.0, .8, 0], [-1.4, cf, -.75, 0]],
  [() => trashbag(), [-4.6, 3.0, 1], [-1.4, cf, .2, 1]],
  [() => tire(), [-6.2, 2.9, 0], [-1.5, cf, .75, 0]],
  [() => shrub(), [-8.8, 2.6, 0], [-.55, cf + .3, .45, .3]],
];
if (MOBILE) defs = defs.filter((_, i) => [0, 1, 2, 3, 5, 6, 8].includes(i));
const items = defs.map(([f, s, t], i) => {
  const o = shadowy(f()); scene.add(o);
  o.userData = { s: new THREE.Vector3(s[0], 0, s[1]), sr: s[2], tl: new THREE.Vector3(t[0], t[1], t[2]), tr: t[3], i };
  return o;
});
// small debris scraps on pad
const debris = new THREE.Group(); scene.add(debris);
for (let i = 0; i < (MOBILE ? 10 : 22); i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(.08 + Math.random() * .25, .04, .05 + Math.random() * .15), [M.wood, M.card, M.dark][i % 3]); d.position.set(-6.2 + (Math.random() - .5) * 8, .08, .2 + (Math.random() - .5) * 6); d.rotation.y = Math.random() * 6; d.castShadow = false; debris.add(d); }

// ---------- animation ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (p, a, b) => clamp((p - a) / (b - a));
let P = 0; // smoothed progress
let yawUser = 0, yawVel = 0, pitchUser = 0, px = 0, py = 0, tpx = 0, tpy = 0;
let dragging = false, lx = 0, ly = 0, introT = RM ? 1 : 0;
const tmp = new THREE.Vector3(), q = new THREE.Quaternion();
truck.updateMatrixWorld(true);

function update(dt) {
  const target = window.stageProgress || 0;
  P = RM ? target : P + (target - P) * Math.min(1, dt * 5);
  const nItems = items.length, loadA = .1, loadB = .62;
  // truck drive-off
  const drive = ease(seg(P, .72, .95));
  truck.position.x = drive * 18;
  wheels.forEach(w => w.rotation.z = -truck.position.x / .58);
  head.intensity = 30;
  // door + ramp
  const close = ease(seg(P, .63, .71));
  doorMesh.scale.y = Math.max(.001, close); doorMesh.visible = close > .01;
  ramp.rotation.z = (1 - close) * 0.45 - close * 1.5;
  ramp.visible = close < .95;
  rampMesh.position.x = -1.1 * (1 - close * .9);
  truck.updateMatrixWorld(true);
  items.forEach(o => {
    const u = o.userData; const a = loadA + (u.i / nItems) * (loadB - loadA - .06); const t = ease(seg(P, a, a + .1));
    tmp.copy(u.tl); cargo.localToWorld(tmp);
    if (t <= 0) { o.position.copy(u.s); o.rotation.set(0, u.sr, 0); }
    else if (t >= 1) { o.position.copy(tmp); o.rotation.set(0, u.tr, 0); }
    else {
      o.position.lerpVectors(u.s, tmp, t); o.position.y += Math.sin(t * Math.PI) * 2.6;
      o.rotation.set(Math.sin(t * Math.PI) * .5, u.sr + (u.tr - u.sr) * t, Math.sin(t * Math.PI) * -.35);
    }
  });
  // clean space
  const clean = ease(seg(P, .5, .7));
  debris.children.forEach((d, i) => { const k = clamp(1 - clean * 1.4 + (i % 5) * .05); d.scale.setScalar(Math.max(.001, k)); });
  padMat.color.setHex(0x3a4250).lerp(new THREE.Color(0xcfc6b6), clean * .55); padMat.clearcoat = clean;
  const fin = ease(seg(P, .82, 1));
  glowRing.material.opacity = fin * .9; glowRing.scale.setScalar(1 + (1 - fin) * .25);
  spM.opacity = fin;
  const time = performance.now() / 1000;
  sparkles.children.forEach(s => { s.rotation.y = time * 2 + s.userData.o; s.scale.setScalar(.6 + Math.sin(time * 3 + s.userData.o) * .4); });
  // camera
  if (!dragging) { yawUser += yawVel; yawVel *= .92; if (!RM) yawUser *= .995; }
  px += (tpx - px) * .06; py += (tpy - py) * .06;
  if (introT < 1) introT = Math.min(1, introT + dt / 2.6);
  const intro = ease(introT);
  const yaw = -0.42 + P * 0.45 + yawUser + px * .15 + (1 - intro) * -.9;
  const pitch = clamp(.24 + pitchUser + py * .06 - P * .05 + (1 - intro) * .25, .08, .9);
  const R = (MOBILE ? 27 : 15.5) + (1 - intro) * 10;
  const fx = -1.8 + seg(P, .7, .95) * -3.5 + (1 - seg(P, .72, .78)) * 0;
  const focus = new THREE.Vector3(fx, 1.3, 0);
  camera.position.set(focus.x + Math.sin(yaw) * Math.cos(pitch) * R * -1, focus.y + Math.sin(pitch) * R, focus.z + Math.cos(yaw) * Math.cos(pitch) * R);
  camera.lookAt(focus);
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  if (w > 900) camera.setViewOffset(w, h, -w * .2, 0, w, h);
  else camera.setViewOffset(w, h, 0, h * .2, w, h);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// pointer: drag to rotate, hover parallax
canvas.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.classList.add('drag'); canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect(); tpx = (e.clientX - r.left) / r.width * 2 - 1; tpy = (e.clientY - r.top) / r.height * 2 - 1;
  if (!dragging) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
  yawUser += dx * .008; yawVel = dx * .0012; if (e.pointerType === 'mouse') pitchUser = clamp(pitchUser + dy * .004, -.2, .5);
});
const end = () => { dragging = false; canvas.classList.remove('drag'); };
canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

let visible = true, frames = 0;
new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(document.getElementById('stage'));
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, clock.getDelta());
  if (!visible) return;
  update(dt); renderer.render(scene, camera); frames++;
  window.__truck = { frames, yaw: yawUser, P };
}
loop();
