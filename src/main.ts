import * as T from "three";
import { FLIGHT, steer, contact, movingContact } from "./flight";
import "./style.css";
import {
  BATTLE,
  orbitVelocity,
  awareness,
  inEnvelope,
  trafficStep,
  patrolAt,
} from "./battle";
const $ = (id: string) => document.getElementById(id)!;
$("app").innerHTML = `
<canvas id="view"></canvas><div class="hud">
<div class="top"><div><div class="brand">SRAJ<span>DRONE</span></div><div class="small">FOREST OPERATION / PROTOTYPE 02</div></div><div class="top-right small"><span class="live"></span>UPLINK ACTIVE<br><span id="sensor">EO · NORMAL VISION</span><br><span id="sorties">SORTIE 00</span></div></div>
<div class="compass">W · · N · · E<strong id="heading">000°</strong></div>
<div class="mission"><div class="small" id="mode">01 / RECONNAISSANCE</div><h2 id="objective">Find. Mark. Launch.</h2><div class="small" id="score">0 / 9 TARGETS DESTROYED</div></div>
<div class="launch-card"><div class="eyebrow" id="launch-title">FPV DRONE READY</div><p id="launch-copy">Recon circles automatically. Press F to switch to your ground drone.</p><button id="launch" class="primary"><kbd>F</kbd> LAUNCH FPV DRONE →</button><div class="launch-hint" id="launch-hint">Press Esc for clickable controls.</div></div><div class="telemetry">ALTITUDE<strong><span id="alt">160</span><small> m</small></strong>SPEED<strong><span id="speed">0</span><small> m/s</small></strong><span id="zoom">OPTICAL 1.0×</span></div>
<div class="battle-status"><div id="autopilot">RECON AUTOPILOT · HIGH ORBIT</div><div id="health">RECON 100% · FPV READY</div><div id="threat">HIGH ORBIT · SCANNING</div></div><div class="damage-vignette" id="damage"></div><div id="cross" class="cross"></div><div id="aim" class="aim-label"></div><div id="markers"></div>
<div class="toast" id="toast"></div><div id="pointer">CLICK THE VIEW TO CAPTURE MOUSE · ESC TO RELEASE / PAUSE</div>
<div class="bottom"><div><div class="actions"><button id="tag"><kbd>E</kbd>MARK</button><button id="thermal"><kbd>T</kbd>THERMAL</button><button id="pause">PAUSE</button></div><div class="help" id="help"></div></div><div class="map-wrap"><div class="map-head"><span>SECTOR / BIRCH</span><span>N ↑</span></div><canvas id="map" width="356" height="356"></canvas><div class="small" style="font-size:8px">△ YOU &nbsp; ◇ MARKED &nbsp; + LAUNCH</div></div></div></div>
<div class="flash" id="flash"></div>
<div class="modal" id="intro"><div class="panel"><div class="eyebrow">SINGLE PLAYER / FOREST OPERATION</div><h1>Eyes above.<br>Action below.</h1><p>Your recon UAV circles high on autopilot. WASD and Space/Ctrl override it; release to resume the loop. Enemy crews fire on low, exposed drones. Press E to mark a visible enemy. Then press F to launch a waiting FPV drone and switch to its camera.</p><div class="steps"><div><b>01 / OBSERVE</b>Zoom + thermal</div><div><b>02 / MARK</b>Press E on a target</div><div><b>03 / LAUNCH</b>Press F, then fly</div></div><button class="primary" id="start">BEGIN OPERATION →</button><footer>KEYBOARD + MOUSE · ARCADE FLIGHT · ORIGINAL FICTIONAL MAP</footer></div></div>
<div class="modal" id="pauseModal" hidden><div class="panel"><div class="eyebrow">OPERATION PAUSED</div><h1>Take a breath.</h1><p>WASD overrides recon autopilot or flies the FPV. Mouse aims. Space climbs, Ctrl descends. Shift boosts. Release movement to brake. Arrow keys also aim. Scroll to zoom.</p><button class="primary" id="pauseLaunch">LAUNCH FPV DRONE →</button><button id="resume">RESUME OPERATION</button></div></div>
<div class="modal" id="result" hidden><div class="panel"><div class="eyebrow" id="resultLabel">SORTIE COMPLETE</div><h1 id="resultTitle">Target destroyed.</h1><p id="resultText"></p><button class="primary" id="continue">RETURN TO RECON →</button></div></div>`;
const canvas = $("view") as HTMLCanvasElement;
const renderer = new T.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = T.SRGBColorSpace;
const scene = new T.Scene();
scene.background = new T.Color("#a5b7b1");
scene.fog = new T.FogExp2("#a5b7b1", 0.0018);
const camera = new T.PerspectiveCamera(
  65,
  innerWidth / innerHeight,
  0.12,
  1100,
);
camera.rotation.order = "YXZ";
scene.add(new T.HemisphereLight(0xdbe9ff, 0x5b6041, 2.2));
const sun = new T.DirectionalLight(0xffe4b4, 2.6);
sun.position.set(-120, 220, 100);
scene.add(sun);
const mats: { m: T.MeshStandardMaterial; color: T.Color; hot: boolean }[] = [];
function mat(color: number, hot = false) {
  const m = new T.MeshStandardMaterial({
    color,
    roughness: 0.93,
    flatShading: true,
  });
  mats.push({ m, color: m.color.clone(), hot });
  return m;
}
const ground = mat(0x687251),
  road = mat(0x696962),
  dirt = mat(0x8b8870),
  trunk = mat(0x514a38),
  leafs = [mat(0x344f3e), mat(0x455d40), mat(0x576e47)],
  armor = mat(0x665f43, true),
  dark = mat(0x262d28, true),
  uniform = mat(0x796b4c, true),
  friend = mat(0x496e64),
  stripe = mat(0xdfb774, true);
function mesh(
  g: T.BufferGeometry,
  m: T.Material,
  x: number,
  y: number,
  z: number,
  parent: T.Object3D = scene,
) {
  const o = new T.Mesh(g, m);
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}
function box(
  w: number,
  h: number,
  d: number,
  m: T.Material,
  x: number,
  y: number,
  z: number,
  p: T.Object3D = scene,
) {
  return mesh(new T.BoxGeometry(w, h, d), m, x, y, z, p);
}
box(1800, 1, 1800, ground, 0, -0.5, 0);
box(14, 0.1, 600, road, 0, 0.05, 0);
box(600, 0.11, 10, road, 0, 0.06, -55);
box(32, 0.12, 35, dirt, 0, 0.07, 140);
for (let z = -220; z < 230; z += 15) box(0.3, 0.13, 5, dirt, 0, 0.08, z);
let seed = 7351;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};
type Collider = { p: T.Vector3; r: number };
const treeColliders: Collider[] = [];
const sightBlockers: T.Object3D[] = [];
const trunks: T.Matrix4[] = [],
  crowns: T.Matrix4[][] = [[], [], []];
const dummy = new T.Object3D();
for (let i = 0; i < 1150; i++) {
  const x = (random() - 0.5) * 470,
    z = (random() - 0.5) * 470;
  if (
    Math.abs(x) < 17 ||
    Math.abs(z + 55) < 13 ||
    Math.hypot(x - 13, z - 137) < 24
  )
    continue;
  const h = 9 + random() * 14,
    r = 2.5 + random() * 3;
  dummy.position.set(x, h * 0.28, z);
  dummy.scale.set(0.55, h * 0.56, 0.55);
  dummy.updateMatrix();
  trunks.push(dummy.matrix.clone());
  for (let j = 0; j < 2; j++) {
    dummy.position.set(x, h * (0.52 + j * 0.2), z);
    dummy.scale.set(r * (1 - j * 0.2), h * 0.56, r * (1 - j * 0.2));
    dummy.updateMatrix();
    crowns[i % 3].push(dummy.matrix.clone());
  }
  treeColliders.push({ p: new T.Vector3(x, h * 0.52, z), r: r * 0.85 });
  treeColliders.push({ p: new T.Vector3(x, h * 0.23, z), r: 1.1 });
}
function instances(g: T.BufferGeometry, m: T.Material, list: T.Matrix4[]) {
  const o = new T.InstancedMesh(g, m, list.length);
  list.forEach((v, i) => o.setMatrixAt(i, v));
  scene.add(o);
  sightBlockers.push(o);
}
instances(new T.CylinderGeometry(1, 1, 1, 5), trunk, trunks);
crowns.forEach((c, i) => instances(new T.ConeGeometry(1, 1, 6), leafs[i], c));
for (let i = 0; i < 55; i++) {
  const x = (random() - 0.5) * 450,
    z = (random() - 0.5) * 450;
  if (Math.abs(x) < 18 || Math.abs(z + 55) < 14) continue;
  mesh(new T.DodecahedronGeometry(1 + random() * 2), dirt, x, 0.5, z);
}
type Target = {
  id: number;
  name: string;
  kind: "tank" | "truck" | "soldier";
  group: T.Group;
  p: T.Vector3;
  previous: T.Vector3;
  r: number;
  alive: boolean;
  marked: boolean;
  axis: "x" | "z";
  direction: number;
  speed: number;
  home: T.Vector3;
  respawn: number;
  seenRecon: number;
  seenFpv: number;
  cooldown: number;
  flash: number;
  gun: T.Group;
  muzzle: T.Mesh;
  legs: T.Mesh[];
  serial: number;
};
let trafficPassed = 0,
  trafficEntered = 0,
  shotsFired = 0,
  shotsBlocked = 0;
const targets: Target[] = [];
function target(
  name: string,
  x: number,
  z: number,
  kind: "tank" | "truck" | "soldier",
) {
  const g = new T.Group();
  scene.add(g);
  g.position.set(x, 0, z);
  const id = targets.length + 1;
  g.userData.target = id;
  if (kind === "tank") {
    box(4.1, 1.4, 6.6, armor, 0, 1.15, 0, g);
    box(4.7, 0.85, 6.8, dark, 0, 0.55, 0, g);
    box(2.5, 1, 3, armor, 0, 2.3, -0.3, g);
    box(0.25, 0.25, 4.6, armor, 0, 2.4, -3, g);
    box(0.7, 0.15, 1, stripe, 0, 2.85, 0, g);
  } else if (kind === "truck") {
    box(3, 1, 6, dark, 0, 0.7, 0, g);
    box(3, 2.2, 2.2, armor, 0, 2, -2, g);
    box(3, 2.3, 3.6, armor, 0, 2, 0.9, g);
    box(2.5, 0.7, 0.05, dark, 0, 2.45, -3.13, g);
    for (const a of [-1.6, 1.6])
      for (const b of [-2, 1.8]) {
        const w = mesh(
          new T.CylinderGeometry(0.7, 0.7, 0.35, 10),
          dark,
          a,
          0.7,
          b,
          g,
        );
        w.rotation.z = Math.PI / 2;
      }
  } else {
    box(0.8, 1, 0.55, uniform, 0, 1.25, 0, g);
    mesh(new T.SphereGeometry(0.3, 8, 6), uniform, 0, 2, 0, g);
    for (const x of [-0.24, 0.24]) box(0.25, 0.8, 0.3, dark, x, 0.4, 0, g);
    box(1.3, 0.25, 0.25, uniform, 0, 1.3, -0.3, g);
  }

  const gun = new T.Group();
  g.add(gun);
  gun.position.y = kind === "tank" ? 3.15 : 1.4;
  if (kind !== "truck") {
    box(
      kind === "tank" ? 0.3 : 0.16,
      0.18,
      kind === "tank" ? 1.5 : 0.7,
      dark,
      0,
      0,
      0.45,
      gun,
    );
    box(0.12, 0.35, 0.16, dark, 0, -0.2, 0.25, gun);
    if (kind === "tank") box(0.5, 0.18, 0.5, armor, 0, -0.2, 0, gun);
  }
  const muzzle = mesh(
    new T.OctahedronGeometry(0.3),
    new T.MeshBasicMaterial({ color: 0xffd67c }),
    0,
    0,
    kind === "tank" ? 1.35 : 0.9,
    gun,
  );
  muzzle.visible = false;
  const legs =
    kind === "soldier"
      ? (g.children.filter(
          (o) => o instanceof T.Mesh && o.position.y === 0.4,
        ) as T.Mesh[])
      : [];
  g.traverse((o) => {
    if (o instanceof T.Mesh) o.userData.originalMaterial = o.material;
  });
  const p = new T.Vector3(x, kind === "soldier" ? 1 : 1.5, z),
    axis = (kind === "soldier" ? Math.abs(x) > 17 : Math.abs(z + 55) < 1)
      ? "x"
      : "z",
    direction = id % 2 === 0 ? 1 : -1;
  if (kind !== "soldier") {
    if (axis === "z") p.x = direction > 0 ? -3.3 : 3.3;
    else p.z = -55 + (direction > 0 ? 3.2 : -3.2);
  }
  g.position.set(p.x, 0, p.z);
  targets.push({
    id,
    name,
    kind,
    group: g,
    p,
    previous: p.clone(),
    r: kind === "soldier" ? 1 : 3.7,
    alive: true,
    marked: false,
    axis,
    direction,
    speed: kind === "tank" ? 6 : 9,
    home: p.clone(),
    respawn: 0,
    seenRecon: 0,
    seenFpv: 0,
    cooldown: 0,
    flash: 0,
    gun,
    muzzle,
    legs,
    serial: 0,
  });
}
target("ARMOR 01", 0, 40, "tank");
target("TRANSPORT 02", 0, -20, "truck");
target("ARMOR 03", -60, -55, "tank");
target("TRANSPORT 04", 75, -55, "truck");
target("ARMOR 05", 0, -125, "tank");
target("PATROL 06", 9, 15, "soldier");
target("PATROL 07", -9, -12, "soldier");
target("PATROL 08", 50, -47, "soldier");
target("PATROL 09", -40, -64, "soldier");
box(6, 0.25, 6, friend, 0, 0.2, 140);
for (let i = 0; i < 3; i++) {
  box(1, 1, 0.6, friend, 12 + i * 2, 1, 139);
  mesh(new T.SphereGeometry(0.3, 8, 6), friend, 12 + i * 2, 1.85, 139);
}

const wreckMaterial = new T.MeshStandardMaterial({
  color: 0x242624,
  roughness: 1,
});
const debris: { mesh: T.Mesh; v: T.Vector3; age: number }[] = [];
let audio: AudioContext | undefined,
  rotor: OscillatorNode | undefined,
  volume: GainNode | undefined,
  muted = false;
function audioStart() {
  if (audio) {
    void audio.resume();
    return;
  }
  audio = new AudioContext();
  rotor = audio.createOscillator();
  rotor.type = "sawtooth";
  volume = audio.createGain();
  volume.gain.value = 0;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;
  rotor.connect(filter);
  filter.connect(volume);
  volume.connect(audio.destination);
  rotor.start();
}
function boom() {
  if (!audio || muted) return;
  const n = audio.sampleRate * 0.6,
    buffer = audio.createBuffer(1, n, audio.sampleRate),
    data = buffer.getChannelData(0);
  for (let i = 0; i < n; i++)
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const gain = audio.createGain();
  gain.gain.value = 0.25;
  source.connect(gain);
  gain.connect(audio.destination);
  source.start();
}
function explode(p: T.Vector3) {
  boom();
  for (let i = 0; i < 40; i++) {
    const m = mesh(
      new T.IcosahedronGeometry(0.3 + random() * 0.7, 0),
      new T.MeshBasicMaterial({
        color: i % 3 ? 0xffa33d : 0x535955,
        transparent: true,
      }),
      p.x,
      p.y,
      p.z,
    );
    debris.push({
      mesh: m,
      v: new T.Vector3(
        (random() - 0.5) * 18,
        random() * 16,
        (random() - 0.5) * 18,
      ),
      age: 0,
    });
  }
}
const spawn = new T.Vector3(0, 1.2, 140),
  recon = new T.Vector3(0, 155, 175);
let reconHealth = 100,
  fpvHealth = 100,
  gameOver = false,
  manualUntil = 0,
  manual = false,
  simTime = 0,
  damageUntil = 0,
  threatCount = 0;
const reconVelocity = new T.Vector3();
let savedYaw = 0,
  savedPitch = -0.85;
let mode: "recon" | "fpv" = "recon",
  started = false,
  paused = false,
  ended = false,
  thermal = false,
  yaw = 0,
  pitch = -0.85,
  zoom = 1,
  sorties = 0,
  kills = 0,
  elapsed = 0;
const velocity = new T.Vector3(),
  position = recon.clone(),
  keys = new Set<string>(),
  ray = new T.Raycaster();
let aimed: Target | undefined;
let toastUntil = 0;
function toast(s: string) {
  $("toast").textContent = s;
  $("toast").classList.add("show");
  toastUntil = elapsed + 2.6;
}
function sensor() {
  thermal = !thermal;
  document.body.classList.toggle("thermal", thermal);
  mats.forEach(({ m, color, hot }) => {
    m.color.copy(thermal ? new T.Color(hot ? 0xffe5ac : 0x252c31) : color);
    m.emissive.setHex(thermal && hot ? 0xffb95c : 0);
    m.emissiveIntensity = thermal && hot ? 0.8 : 0;
  });
  scene.background = new T.Color(thermal ? "#151d24" : "#a5b7b1");
  scene.fog = new T.FogExp2(
    thermal ? "#151d24" : "#a5b7b1",
    thermal ? 0.0025 : 0.0018,
  );
  $("sensor").textContent = thermal ? "IR · WHITE HOT" : "EO · NORMAL VISION";
  $("thermal").innerHTML = "<kbd>T</kbd>" + (thermal ? "NORMAL" : "THERMAL");
}
function updateMode() {
  const isRecon = mode === "recon";
  $("launch-title").textContent = isRecon
    ? "FPV DRONE READY"
    : "YOU ARE CONTROLLING THE FPV DRONE";
  $("launch-copy").textContent = isRecon
    ? "Recon circles automatically. Press F to switch to your ground drone."
    : "Climb with Space. Low, exposed flight draws enemy fire. Trees break enemy sight.";
  $("launch-hint").textContent = isRecon
    ? "No target mark required. Esc opens clickable controls."
    : "Release movement to brake. Press F to return to recon.";
  $("pauseLaunch").hidden = !isRecon;
  $("mode").textContent =
    mode === "recon" ? "01 / RECONNAISSANCE" : "02 / FPV STRIKE";
  $("objective").textContent =
    mode === "recon"
      ? "Press E to mark · Press F to launch"
      : "Fly into a target. Make it count.";
  $("launch").innerHTML =
    "<kbd>F</kbd>" +
    (mode === "recon" ? " LAUNCH FPV DRONE →" : " RETURN TO RECON");
  $("help").innerHTML =
    "<kbd>W A S D</kbd> " +
    (mode === "recon" ? "OVERRIDE AUTOPILOT" : "FLY") +
    " &nbsp; <kbd>SPACE / CTRL</kbd> UP / DOWN<br><kbd>MOUSE / ARROWS</kbd> AIM &nbsp; <kbd>SCROLL</kbd> ZOOM &nbsp; <kbd>SHIFT</kbd> BOOST &nbsp; <kbd>M</kbd> MUTE";
}
function switchMode() {
  if (!started || paused || ended) return;
  keys.clear();
  velocity.set(0, 0, 0);
  if (mode === "recon") {
    savedYaw = yaw;
    savedPitch = pitch;
    mode = "fpv";
    position.copy(spawn);
    yaw = 0;
    pitch = 0;
    fpvHealth = 100;
    sorties++;
    manualUntil = 0;
    manual = false;
    targets.forEach((t) => (t.seenFpv = 0));
    toast("FPV LIVE · CLIMB OR USE TREE COVER");
  } else {
    mode = "recon";
    position.copy(recon);
    yaw = savedYaw;
    pitch = savedPitch;
  }
  clearFpvShots();
  zoom = 1;
  updateMode();
}

function mark() {
  if (!started || paused || ended) return;
  if (aimed) {
    aimed.marked = true;
    toast(aimed.name + " MARKED · PRESS F TO LAUNCH FPV");
    if (mode === "recon")
      $("launch-copy").textContent =
        aimed.name + " marked. Press F now to launch your FPV drone.";
  } else toast("Aim directly at a visible target to mark");
}
function pause(value: boolean) {
  if (!started || ended) return;
  paused = value;
  keys.clear();
  velocity.set(0, 0, 0);
  $("pauseModal").hidden = !value;
  if (value) document.exitPointerLock();
}
function finish(hit?: Target, reason = "collision") {
  if (ended) return;
  ended = true;
  keys.clear();
  velocity.set(0, 0, 0);
  document.exitPointerLock();
  explode(hit ? hit.p : position);
  if (hit) {
    hit.alive = false;
    hit.respawn = hit.kind === "soldier" ? Infinity : simTime + 10;
    hit.seenRecon = 0;
    hit.seenFpv = 0;
    kills++;
    hit.group.traverse((o) => {
      if (o instanceof T.Mesh) o.material = wreckMaterial;
    });
    hit.group.scale.y = 0.45;
    hit.muzzle.visible = false;
  }
  $("flash").classList.add("on");
  setTimeout(() => $("flash").classList.remove("on"), 120);
  $("resultLabel").textContent = gameOver
    ? "OPERATION LOST"
    : "SORTIE " + String(sorties).padStart(2, "0") + " COMPLETE";
  $("resultTitle").textContent = gameOver
    ? "Recon UAV lost."
    : hit
      ? "Target destroyed."
      : reason === "gunfire"
        ? "Shot down."
        : "Drone lost.";
  $("resultText").textContent = gameOver
    ? "The recon UAV was destroyed. Operation ended with " +
      kills +
      " targets destroyed. Restart to try again."
    : hit
      ? hit.name +
        " eliminated. Traffic keeps coming. Return to recon for your next target."
      : reason === "gunfire"
        ? "Enemy fire destroyed the FPV drone. Watch the spotting warning and break sight behind trees. A fresh drone is ready."
        : "You hit the terrain or a tree. A fresh drone is ready. Use Space to gain height.";
  $("continue").textContent = gameOver
    ? "RESTART OPERATION →"
    : "RETURN TO RECON →";
  setTimeout(() => ($("result").hidden = false), 850);
}
$("start").onclick = () => {
  audioStart();
  started = true;
  $("intro").hidden = true;
  canvas.requestPointerLock();
  toast("SCAN WITH MOUSE · E TO MARK · F TO LAUNCH");
};
$("pauseLaunch").onclick = () => {
  pause(false);
  switchMode();
  canvas.requestPointerLock();
};
$("resume").onclick = () => {
  pause(false);
  canvas.requestPointerLock();
};
$("pause").onclick = () => pause(true);
$("thermal").onclick = () => {
  if (!paused && !ended) sensor();
};
$("tag").onclick = mark;
$("launch").onclick = switchMode;
$("continue").onclick = () => {
  if (gameOver) {
    location.reload();
    return;
  }
  ended = false;
  $("result").hidden = true;
  mode = "fpv";
  switchMode();
  canvas.requestPointerLock();
};
canvas.onclick = () => {
  if (started && !paused && !ended) canvas.requestPointerLock();
};
document.addEventListener("pointerlockchange", () => {
  $("pointer").style.display = document.pointerLockElement ? "none" : "block";
  if (!document.pointerLockElement && started && !ended && !paused) pause(true);
});
document.addEventListener("mousemove", (e) => {
  if (started && !paused && !ended && document.pointerLockElement) {
    yaw -= (e.movementX * 0.0022) / zoom;
    pitch = T.MathUtils.clamp(
      pitch - (e.movementY * 0.0022) / zoom,
      -1.5,
      1.35,
    );
  }
});
addEventListener("keydown", (e) => {
  if (
    [
      "Space",
      "ControlLeft",
      "ControlRight",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ].includes(e.code)
  )
    e.preventDefault();
  if (e.code === "Escape") {
    pause(!paused);
    return;
  }
  if (!started || paused || ended) return;
  keys.add(e.code);
  if (!e.repeat) {
    if (e.code === "KeyM") {
      muted = !muted;
      toast(muted ? "AUDIO MUTED" : "AUDIO ON");
    }
    if (e.code === "KeyT") sensor();
    if (e.code === "KeyE") mark();
    if (e.code === "KeyF") switchMode();
  }
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => pause(true));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause(true);
});
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (!paused && !ended)
      zoom = T.MathUtils.clamp(
        zoom * (e.deltaY > 0 ? 0.8 : 1.25),
        1,
        mode === "recon" ? 8 : 3,
      );
  },
  { passive: false },
);
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
const map = ($("map") as HTMLCanvasElement).getContext("2d")!;
function mapDraw() {
  const s = 356 / 500,
    to = (v: number) => (v + 250) * s;
  map.fillStyle = "#1b2c29";
  map.fillRect(0, 0, 356, 356);
  map.strokeStyle = "#607267";
  map.lineWidth = 8;
  map.beginPath();
  map.moveTo(to(0), to(-235));
  map.lineTo(to(0), to(235));
  map.moveTo(to(-210), to(-55));
  map.lineTo(to(210), to(-55));
  map.stroke();
  map.strokeStyle = "#c7eaa744";
  map.lineWidth = 1;
  for (let i = 0; i < 356; i += 71) {
    map.beginPath();
    map.moveTo(i, 0);
    map.lineTo(i, 356);
    map.moveTo(0, i);
    map.lineTo(356, i);
    map.stroke();
  }
  map.strokeStyle = "#d5f68b44";
  map.lineWidth = 1;
  map.beginPath();
  map.arc(to(0), to(0), BATTLE.orbitRadius * s, 0, Math.PI * 2);
  map.stroke();
  map.fillStyle = "#a5deff";
  map.fillRect(to(recon.x) - 3, to(recon.z) - 3, 6, 6);
  map.fillStyle = "#cfff95";
  map.font = "18px monospace";
  map.fillText("+", to(spawn.x) - 5, to(spawn.z) + 5);
  for (const t of targets)
    if (t.marked && t.group.visible) {
      map.fillStyle = t.alive ? "#ffb57e" : "#65746c";
      map.fillText(t.alive ? "◇" : "×", to(t.p.x) - 6, to(t.p.z) + 6);
    }
  map.save();
  map.translate(to(position.x), to(position.z));
  map.rotate(-yaw);
  map.fillStyle = "#e0ffc1";
  map.beginPath();
  map.moveTo(0, -8);
  map.lineTo(-5, 6);
  map.lineTo(5, 6);
  map.closePath();
  map.fill();
  map.restore();
}

const sightRay = new T.Raycaster(),
  lineMaterial = new T.LineBasicMaterial({ color: 0xffcc70 });
type Shot = {
  line: T.Line;
  p: T.Vector3;
  v: T.Vector3;
  life: number;
  victim: "recon" | "fpv";
  damage: number;
};
const shots: Shot[] = [];
function blocked(a: T.Vector3, b: T.Vector3) {
  const d = b.clone().sub(a),
    length = d.length();
  if (length < 0.01) return false;
  sightRay.set(a, d.normalize());
  sightRay.far = length;
  return sightRay.intersectObjects(sightBlockers, false).length > 0;
}
function disposeShot(i: number) {
  scene.remove(shots[i].line);
  shots[i].line.geometry.dispose();
  shots.splice(i, 1);
}
function clearFpvShots() {
  for (let i = shots.length - 1; i >= 0; i--)
    if (shots[i].victim === "fpv") disposeShot(i);
}
function gunSound() {
  if (!audio || muted) return;
  const osc = audio.createOscillator(),
    gain = audio.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(120, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(45, audio.currentTime + 0.06);
  gain.gain.setValueAtTime(0.025, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.09);
}
function shoot(t: Target, victim: "recon" | "fpv", aim: T.Vector3) {
  const from = t.p.clone();
  from.y = t.kind === "tank" ? 3.3 : 1.5;
  const end = aim
    .clone()
    .add(
      new T.Vector3(
        (random() - 0.5) * 1.6,
        (random() - 0.5) * 1.2,
        (random() - 0.5) * 1.6,
      ),
    );
  const v = end.sub(from).normalize().multiplyScalar(BATTLE.bulletSpeed);
  const line = new T.Line(
    new T.BufferGeometry().setFromPoints([from, from.clone()]),
    lineMaterial,
  );
  scene.add(line);
  shots.push({
    line,
    p: from,
    v,
    life: 2,
    victim,
    damage: t.kind === "tank" ? 22 : 16,
  });
  shotsFired++;
  t.flash = 0.1;
  gunSound();
}
function damage(victim: "recon" | "fpv", amount: number) {
  if (ended) return;
  if (victim === "recon") reconHealth = Math.max(0, reconHealth - amount);
  else fpvHealth = Math.max(0, fpvHealth - amount);
  damageUntil = simTime + 0.22;
  if (reconHealth === 0) {
    gameOver = true;
    finish(undefined, "gunfire");
  } else if (fpvHealth === 0 && mode === "fpv") finish(undefined, "gunfire");
}
let defenseClock = 0;
function battleStep(dt: number) {
  threatCount = 0;
  defenseClock -= dt;
  const scan = defenseClock <= 0;
  if (scan) defenseClock = 0.1;
  for (const t of targets) {
    t.previous.copy(t.p);
    if (!t.alive) {
      if (simTime >= t.respawn) {
        t.alive = true;
        t.group.visible = true;
        t.group.scale.set(1, 1, 1);
        t.group.traverse((o) => {
          if (o instanceof T.Mesh) o.material = o.userData.originalMaterial;
        });
        t.marked = false;
        t.serial++;
        t.p[t.axis] = -t.direction * 264;
        t.previous.copy(t.p);
        t.cooldown = 0;
        t.seenRecon = 0;
        t.seenFpv = 0;
        trafficEntered++;
      } else {
        if (t.kind !== "soldier" && t.respawn - simTime < 5)
          t.group.visible = false;
        continue;
      }
    }
    if (t.kind === "soldier") {
      const step = patrolAt(simTime, t.id);
      t.p[t.axis] = t.home[t.axis] + step;
      const forward = Math.cos(simTime * 0.22 + t.id) > 0;
      t.group.rotation.y =
        t.axis === "z"
          ? forward
            ? Math.PI
            : 0
          : forward
            ? -Math.PI / 2
            : Math.PI / 2;
      t.legs.forEach(
        (leg, i) =>
          (leg.rotation.x = Math.sin(simTime * 7 + i * Math.PI) * 0.4),
      );
    } else {
      const tracking =
        Math.max(t.seenFpv, t.seenRecon) > 0.25 && t.kind === "tank";
      const moved = trafficStep(
        t.p[t.axis],
        t.direction,
        tracking ? 0 : t.speed,
        dt,
      );
      t.p[t.axis] = moved.next;
      t.group.rotation.y =
        t.axis === "z"
          ? t.direction > 0
            ? Math.PI
            : 0
          : t.direction > 0
            ? -Math.PI / 2
            : Math.PI / 2;
      if (moved.exited) {
        t.alive = false;
        t.group.visible = false;
        t.marked = false;
        t.respawn = simTime + BATTLE.reentryDelay;
        trafficPassed++;
        continue;
      }
    }
    t.group.position.set(t.p.x, 0, t.p.z);
    t.group.updateMatrixWorld(true);
    if (t.kind === "truck") continue;
    const from = t.p.clone();
    from.y = t.kind === "tank" ? 3.3 : 1.5;
    if (scan) {
      const seeRecon = inEnvelope(from, recon) && !blocked(from, recon);
      const seeFpv =
        mode === "fpv" &&
        inEnvelope(from, position) &&
        !blocked(from, position);
      t.seenRecon = awareness(t.seenRecon, seeRecon, 0.1);
      t.seenFpv = awareness(t.seenFpv, seeFpv, 0.1);
    }
    t.cooldown -= dt;
    t.flash = Math.max(0, t.flash - dt);
    t.muzzle.visible = t.flash > 0;
    const victim = t.seenFpv >= t.seenRecon && mode === "fpv" ? "fpv" : "recon",
      level = victim === "fpv" ? t.seenFpv : t.seenRecon,
      aim = victim === "fpv" ? position : recon;
    if (level > 0) {
      threatCount++;
      t.gun.lookAt(aim);
    }
    if (
      level >= 1 &&
      t.cooldown <= 0 &&
      inEnvelope(from, aim) &&
      !blocked(from, aim)
    ) {
      shoot(t, victim, aim);
      t.cooldown = t.kind === "tank" ? 0.38 : 0.6;
    }
  }
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i],
      next = shot.p.clone().addScaledVector(shot.v, dt);
    shot.life -= dt;
    if (blocked(shot.p, next)) {
      shotsBlocked++;
      disposeShot(i);
      continue;
    }
    const victim = shot.victim === "recon" ? recon : position;
    if (
      (shot.victim === "recon" || mode === "fpv") &&
      contact(shot.p, next, victim, shot.victim === "recon" ? 3 : 1.4) !== null
    ) {
      damage(shot.victim, shot.damage);
      disposeShot(i);
      continue;
    }
    shot.p.copy(next);
    const points = shot.line.geometry.getAttribute(
      "position",
    ) as T.BufferAttribute;
    points.setXYZ(0, next.x, next.y, next.z);
    points.setXYZ(
      1,
      next.x - shot.v.x * 0.055,
      next.y - shot.v.y * 0.055,
      next.z - shot.v.z * 0.055,
    );
    points.needsUpdate = true;
    shot.line.frustumCulled = false;
    if (shot.life <= 0 || next.y < 0) disposeShot(i);
  }
}

function frame(dt: number) {
  elapsed += dt;
  if (started && !paused && !ended) simTime += dt;
  if (volume && audio && rotor) {
    volume.gain.setTargetAtTime(
      !muted && started && !paused && !ended && mode === "fpv" ? 0.025 : 0,
      audio.currentTime,
      0.07,
    );
    rotor.frequency.setTargetAtTime(
      95 + velocity.length() * 3,
      audio.currentTime,
      0.05,
    );
  }
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i];
    d.age += dt;
    d.v.y -= 12 * dt;
    d.mesh.position.addScaledVector(d.v, dt);
    d.mesh.rotation.x += dt * 3;
    (d.mesh.material as T.MeshBasicMaterial).opacity = Math.max(
      0,
      1 - d.age / 2,
    );
    if (d.age > 2) {
      scene.remove(d.mesh);
      d.mesh.geometry.dispose();
      (d.mesh.material as T.Material).dispose();
      debris.splice(i, 1);
    }
  }
  if (toastUntil < elapsed) $("toast").classList.remove("show");
  if (started && !paused && !ended) {
    yaw +=
      (((keys.has("ArrowLeft") ? 1 : 0) - (keys.has("ArrowRight") ? 1 : 0)) *
        dt *
        1.35) /
      zoom;
    pitch = T.MathUtils.clamp(
      pitch +
        (((keys.has("ArrowUp") ? 1 : 0) - (keys.has("ArrowDown") ? 1 : 0)) *
          dt) /
          zoom,
      -1.5,
      1.35,
    );
    const f = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0),
      s = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0),
      u =
        (keys.has("Space") ? 1 : 0) -
        (keys.has("ControlLeft") || keys.has("ControlRight") || keys.has("KeyC")
          ? 1
          : 0);
    const forward = new T.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    if (mode === "fpv")
      forward.set(
        -Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch),
      );

    const desired = forward
      .multiplyScalar(f)
      .add(new T.Vector3(Math.cos(yaw) * s, u, -Math.sin(yaw) * s));
    if (desired.length() > 1) desired.normalize();
    desired.multiplyScalar(
      mode === "recon"
        ? 45
        : keys.has("ShiftLeft")
          ? FLIGHT.boost
          : FLIGHT.speed,
    );
    if (mode === "recon" && (f || s || u))
      manualUntil = simTime + BATTLE.manualGrace;
    manual = mode === "recon" && simTime < manualUntil;
    const oldRecon = recon.clone();
    if (mode === "recon") {
      if (manual) reconVelocity.copy(steer(reconVelocity, desired, dt));
      else reconVelocity.copy(steer(reconVelocity, orbitVelocity(recon), dt));
      recon.addScaledVector(reconVelocity, dt);
      recon.x = T.MathUtils.clamp(recon.x, -235, 235);
      recon.z = T.MathUtils.clamp(recon.z, -235, 235);
      recon.y = T.MathUtils.clamp(recon.y, 2, 220);
      if (!manual && pitch < -0.15) {
        const distance = -oldRecon.y / Math.sin(pitch);
        const gaze = oldRecon
          .clone()
          .add(
            new T.Vector3(
              -Math.sin(yaw) * Math.cos(pitch),
              Math.sin(pitch),
              -Math.cos(yaw) * Math.cos(pitch),
            ).multiplyScalar(distance),
          )
          .sub(recon);
        yaw = Math.atan2(-gaze.x, -gaze.z);
        pitch = Math.atan2(gaze.y, Math.hypot(gaze.x, gaze.z));
      }
      position.copy(recon);
      velocity.copy(reconVelocity);
    } else {
      reconVelocity.copy(steer(reconVelocity, orbitVelocity(recon), dt));
      recon.addScaledVector(reconVelocity, dt);
      velocity.copy(steer(velocity, desired, dt));
    }
    battleStep(dt);
    if (!ended && mode === "fpv") {
      const next = position.clone().addScaledVector(velocity, dt);
      let earliest = Infinity,
        victim: Target | undefined;
      for (const t of targets)
        if (t.alive) {
          const c = movingContact(
            position,
            next,
            t.previous,
            t.p,
            t.r + FLIGHT.radius,
          );
          if (c !== null && c < earliest) {
            earliest = c;
            victim = t;
          }
        }
      for (const c of treeColliders) {
        const n = contact(position, next, c.p, c.r + FLIGHT.radius);
        if (n !== null && n < earliest) {
          earliest = n;
          victim = undefined;
        }
      }
      if (next.y < 0.45 && velocity.y < 0) {
        const n = (position.y - 0.45) / (position.y - next.y);
        if (n < earliest) {
          earliest = n;
          victim = undefined;
        }
      }
      if (earliest !== Infinity) {
        position.lerp(next, earliest);
        finish(victim);
      } else position.copy(next);
      position.x = T.MathUtils.clamp(position.x, -235, 235);
      position.z = T.MathUtils.clamp(position.z, -235, 235);
      position.y = T.MathUtils.clamp(position.y, 0.45, 130);
    }
  }
  camera.position.copy(position);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
  camera.fov = 65 / zoom;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  aimed = undefined;
  ray.setFromCamera(new T.Vector2(0, 0), camera);
  const hits = ray.intersectObjects(scene.children, true);
  if (hits.length) {
    let o: T.Object3D | null = hits[0].object;
    while (o && !o.userData.target) o = o.parent;
    if (o) aimed = targets.find((t) => t.id === o!.userData.target && t.alive);
  }
  $("cross").classList.toggle("ready", !!aimed);
  $("aim").textContent = aimed ? aimed.name + " · E TO MARK" : "";
  $("alt").textContent = Math.round(position.y).toString();
  $("speed").textContent = Math.round(velocity.length()).toString();
  $("heading").textContent =
    String(Math.round(((((-yaw * 180) / Math.PI) % 360) + 360) % 360)).padStart(
      3,
      "0",
    ) + "°";
  $("zoom").textContent = "OPTICAL " + zoom.toFixed(1) + "×";
  $("sorties").textContent = "SORTIE " + String(sorties).padStart(2, "0");
  $("score").textContent =
    kills + " DESTROYED · " + trafficPassed + " VEHICLES EXITED";
  $("autopilot").textContent = manual
    ? "RECON · MANUAL OVERRIDE"
    : recon.y < 145
      ? "RECON · RETURNING TO HIGH ORBIT"
      : "RECON · AUTOPILOT ORBIT";
  $("health").textContent =
    "RECON " +
    reconHealth +
    "%" +
    (mode === "fpv" ? " · FPV " + fpvHealth + "%" : " · FPV READY");
  $("threat").textContent = threatCount
    ? "ENEMY TRACKING · BREAK LINE OF SIGHT"
    : position.y < BATTLE.enemyCeiling
      ? "LOW FLIGHT · WATCH FOR ENEMY FIRE"
      : "HIGH ALTITUDE · OUTSIDE ENEMY FIRE";
  $("threat").classList.toggle("danger", threatCount > 0);
  $("damage").classList.toggle("hit", simTime < damageUntil);
  let html = "";
  for (const t of targets)
    if (t.marked && t.alive && t.group.visible) {
      const p = t.p.clone().project(camera);
      if (p.z > -1 && p.z < 1 && Math.abs(p.x) < 0.94 && Math.abs(p.y) < 0.85)
        html +=
          '<div class="tag" style="left:' +
          (p.x + 1) * 50 +
          "%;top:" +
          (-p.y + 1) * 50 +
          '%">' +
          t.name +
          " · " +
          Math.round(position.distanceTo(t.p)) +
          "m</div>";
    }
  $("markers").innerHTML = html;
  mapDraw();
  renderer.render(scene, camera);
}
updateMode();
let last = performance.now();
function animate(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  frame(dt);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// Read-only state for browser QA; no teleporting or test-only gameplay controls.
Object.defineProperty(window, "gameState", {
  get: () => ({
    mode,
    yaw,
    pitch,
    started,
    paused,
    ended,
    gameOver,
    thermal,
    zoom,
    kills,
    sorties,
    simTime,
    reconHealth,
    fpvHealth,
    manual,
    threatCount,
    shotsFired,
    shotsBlocked,
    trafficPassed,
    trafficEntered,
    recon: { x: recon.x, y: recon.y, z: recon.z },
    position: { x: position.x, y: position.y, z: position.z },
    velocity: velocity.length(),
    aimed: aimed?.id,
    marked: targets.filter((t) => t.marked).map((t) => t.id),
    enemies: targets.map((t) => ({
      id: t.id,
      kind: t.kind,
      x: t.p.x,
      y: t.p.y,
      z: t.p.z,
      alive: t.alive,
      visible: t.group.visible,
      serial: t.serial,
      awareness: Math.max(t.seenRecon, t.seenFpv),
    })),
  }),
});
