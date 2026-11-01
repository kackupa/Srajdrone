import * as T from "three";
import { createModels } from "./models";
import { surfaceTexture, pineCrown, leafCrown } from "./surfaces";
import { FLIGHT, steer, contact, movingContact, boxContact } from "./flight";
import "./style.css";
import { buildUnderstory } from "./understory";
import { ConvoyMission, CONVOY } from "./mission";
import { BattleEffects } from "./effects";
import { BATTERY, drainBattery, batteryLevel, clockText } from "./battery";
import {
  BATTLE,
  reconOrbit,
  awareness,
  inEnvelope,
  trafficStep,
  patrolAt,
  vehicleSees,
  evadeOffset,
} from "./battle";
import {
  LAUNCH,
  TRENCHES,
  PILLBOXES,
  CACHES,
  groundHeight,
  reserved,
} from "./layout";
import { buildBattlefield } from "./world";
const $ = (id: string) => document.getElementById(id)!;
$("app").innerHTML = `
<canvas id="view"></canvas><div class="hud">
<div class="top"><div><div class="brand">SRAJ<span>DRONE</span></div><div class="small">CONVOY INTERCEPT / PROTOTYPE 10</div></div><div class="top-right small"><span class="live"></span>UPLINK ACTIVE<br><span id="sensor">EO · NORMAL VISION</span><br><span id="sorties">SORTIE 00</span></div></div>
<div class="compass">W · · N · · E<strong id="heading">000°</strong></div>
<div class="mission"><div class="small" id="mode">01 / RECONNAISSANCE</div><h2 id="objective">Find. Mark. Launch.</h2><div class="small" id="score">STOP ALL 3 CONVOY VEHICLES</div><div id="mission-clock"></div><div id="convoy-progress"></div><div id="cache-progress" class="small">HIDDEN CACHES · 0 / 3</div></div>
<div id="mission-report" class="mission-report" hidden><strong id="mission-result"></strong><p id="mission-detail"></p><button id="next-mission">NEXT INTERCEPT · N</button></div><div class="launch-card"><div class="eyebrow" id="launch-title">FPV DRONE READY</div><p id="launch-copy">Recon circles automatically. Press F to switch to your ground drone.</p><button id="launch" class="primary"><kbd>F</kbd> LAUNCH FPV DRONE →</button><div class="launch-hint" id="launch-hint">Press Esc for clickable controls.</div></div><div class="telemetry">ALTITUDE<strong><span id="alt">160</span><small> m</small></strong>SPEED<strong><span id="speed">0</span><small> m/s</small></strong><span id="zoom">OPTICAL 1.0×</span></div>
<div class="battle-status"><div id="autopilot">RECON AUTOPILOT · HIGH ORBIT</div><div id="health">RECON 100% · FPV READY</div><div id="threat">HIGH ORBIT · SCANNING</div></div><div class="damage-vignette" id="damage"></div><div id="cross" class="cross" aria-label="Heart aiming reticle"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 33 C16 29 4 21 4 13 C4 4 15 3 20 11 C25 3 36 4 36 13 C36 21 24 29 20 33 Z"/><circle cx="20" cy="20" r="1.3"/></svg></div><div id="aim" class="aim-label"></div><div id="markers"></div><div id="friendly-markers"></div><div class="home-reference" id="home-reference"><span id="home-arrow" aria-hidden="true">↑</span><div><strong>OUR TEAM / BASE</strong><div id="home-distance">FRIENDLY POSITION</div></div></div>
<div id="battery" class="battery" hidden><div class="battery-heading"><span>FPV BATTERY</span><span id="battery-percent">100%</span></div><strong id="battery-time">01:00</strong><div class="battery-track"><div id="battery-fill"></div></div><div id="battery-status">FLIGHT TIME REMAINING</div><div class="feed-timer">● REC <span id="flight-time">00:00</span></div></div><div id="feed-loss" class="feed-loss" hidden><span>FPV POWER LOST<br>RESTORING RECON FEED</span></div><div class="toast" id="toast"></div><div id="pointer">CLICK THE VIEW TO CAPTURE MOUSE · ESC TO RELEASE / PAUSE</div>
<div class="bottom"><div><div class="actions"><button id="tag">LEFT CLICK · MARK</button><button id="thermal"><kbd>T</kbd>THERMAL</button><button id="pause">PAUSE</button></div><div class="help" id="help"></div></div><div class="map-wrap"><div class="map-head"><span>SECTOR / BIRCH</span><span>N ↑</span></div><canvas id="map" width="356" height="356"></canvas><div class="small" style="font-size:8px">△ YOU &nbsp; ◇ ENEMY &nbsp; <span style="color:#8ce8ff">⊕ OUR BASE</span></div></div></div></div>
<div class="flash" id="flash"></div>
<div class="modal" id="intro"><div class="panel"><div class="eyebrow">SINGLE PLAYER / FOREST OPERATION</div><h1>Convoy inbound.<br>Stop the column.</h1><p>Three convoy vehicles are approaching the forest road. Stop all three before any escapes. You have 12 seconds to prepare and 2:35 to complete the operation. Recon stays in its high orbit: search with the camera, zoom and thermal. Convoy vehicles stay unmarked until you spot and left-click them. F launches an FPV. Three concealed ammo caches offer 750 bonus points each. Each FPV has 60 seconds of battery. Boosting uses it faster.</p><div class="steps"><div><b>01 / OBSERVE</b>Zoom + thermal</div><div><b>02 / MARK</b>Left-click a target</div><div><b>03 / LAUNCH</b>Press F, then fly</div></div><button class="primary" id="start">BEGIN OPERATION →</button><footer>KEYBOARD + MOUSE · ARCADE FLIGHT · ORIGINAL FICTIONAL MAP</footer></div></div>
<div class="modal" id="pauseModal" hidden><div class="panel"><div class="eyebrow">OPERATION PAUSED</div><h1>Take a breath.</h1><p>Recon flight is locked to its high orbit. Mouse or arrows aim the camera; scroll zooms and T toggles thermal. Left-click marks the target under the heart. WASD flies the FPV; Space climbs and C/Ctrl descends. Shift boosts and drains battery faster. Each FPV starts with 60 seconds; pause stops the countdown. Release movement to brake. Arrow keys also aim. Scroll to zoom.</p><button class="primary" id="pauseLaunch">LAUNCH FPV DRONE →</button><button id="resume">RESUME OPERATION</button><button id="motion">FLIGHT MOTION: ON · V</button><button id="retry">RESTART INTERCEPT</button></div></div>
<div class="modal" id="result" hidden><div class="panel"><div class="eyebrow" id="resultLabel">OPERATION LOST</div><h1 id="resultTitle">Recon UAV lost.</h1><p id="resultText"></p><button class="primary" id="continue">RESTART OPERATION →</button></div></div>`;
const canvas = $("view") as HTMLCanvasElement;
const renderer = new T.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
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
scene.add(new T.HemisphereLight(0xdbe9ff, 0x5b6041, 1.7));
const sun = new T.DirectionalLight(0xffe4b4, 2.6);
sun.position.set(-120, 220, 100);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -310,
  right: 310,
  top: 310,
  bottom: -310,
  near: 0.5,
  far: 700,
});
sun.shadow.normalBias = 0.15;
sun.shadow.bias = -0.00015;
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
const models = createModels(mat);
const road = mat(0xffffff),
  dirt = mat(0x8b8870),
  trunk = mat(0x514a38),
  leafs = [mat(0x344f3e), mat(0x455d40), mat(0x576e47)],
  armor = mat(0x665f43, true),
  dark = mat(0x262d28, true);
road.map = surfaceTexture("road");
road.polygonOffset = true;
road.polygonOffsetFactor = -2;
road.polygonOffsetUnits = -2;
const shoulder = mat(0x655b45);
shoulder.polygonOffset = true;
shoulder.polygonOffsetFactor = -1;
shoulder.polygonOffsetUnits = -1;
const birch = mat(0xa2aa96);
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
  o.castShadow = true;
  o.receiveShadow = true;
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
  const o = mesh(new T.BoxGeometry(w, h, d), m, x, y, z, p);
  // Thin ground layers receive shadows without self-shadow striping.
  o.castShadow = h > 0.3;
  return o;
}
const battlefield = buildBattlefield(scene, mat);
const understory = buildUnderstory(scene, mat);
const coverBoxes = [...battlefield.solids, ...understory.solids].map((o) =>
  new T.Box3().setFromObject(o).expandByScalar(FLIGHT.radius),
);

// Soft dirt shoulders blend the road into the forest floor.
box(19, 0.03, 600, shoulder, 0, 0.015, 0);
box(600, 0.03, 15, shoulder, 0, 0.015, -55);
box(14, 0.1, 600, road, 0, 0.05, 0);
box(600, 0.11, 10, road, 0, 0.06, -55);

for (let z = -220; z < 230; z += 15) box(0.3, 0.13, 5, dirt, 0, 0.08, z);
let seed = 7351;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};
type Collider = { p: T.Vector3; r: number };
const treeColliders: Collider[] = [];
const sightBlockers: T.Object3D[] = [
  ...battlefield.blockers,
  ...understory.solids,
];
const trunks: T.Matrix4[] = [],
  crowns: T.Matrix4[][] = [[], [], []],
  birchTrunks: T.Matrix4[] = [],
  broadCrowns: T.Matrix4[][] = [[], [], []];
const dummy = new T.Object3D();
for (let i = 0; i < 1150; i++) {
  const x = (random() - 0.5) * 470,
    z = (random() - 0.5) * 470;
  if (Math.abs(x) < 17 || Math.abs(z + 55) < 13 || reserved(x, z)) continue;
  const h = 9 + random() * 14,
    r = 2.5 + random() * 3;
  dummy.position.set(x, h * 0.28, z);
  dummy.scale.set(0.55, h * 0.56, 0.55);
  dummy.updateMatrix();
  (i % 4 === 0 ? birchTrunks : trunks).push(dummy.matrix.clone());
  for (let j = 0; j < 2; j++) {
    dummy.position.set(x, h * (0.52 + j * 0.2), z);
    dummy.scale.set(r * (1 - j * 0.2), h * 0.56, r * (1 - j * 0.2));
    dummy.updateMatrix();
    (i % 4 === 0 ? broadCrowns : crowns)[i % 3].push(dummy.matrix.clone());
  }
  treeColliders.push({ p: new T.Vector3(x, h * 0.52, z), r: r * 0.85 });
  treeColliders.push({ p: new T.Vector3(x, h * 0.23, z), r: 1.1 });
}
function instances(g: T.BufferGeometry, m: T.Material, list: T.Matrix4[]) {
  const o = new T.InstancedMesh(g, m, list.length);
  o.castShadow = true;
  o.receiveShadow = true;
  list.forEach((v, i) => o.setMatrixAt(i, v));
  scene.add(o);
  sightBlockers.push(o);
}
instances(new T.CylinderGeometry(1, 1, 1, 5), trunk, trunks);
instances(new T.CylinderGeometry(0.7, 1, 1, 6), birch, birchTrunks);
const pineGeometry = pineCrown(),
  broadGeometry = leafCrown();
crowns.forEach((c, i) => instances(pineGeometry, leafs[i], c));
broadCrowns.forEach((c, i) => instances(broadGeometry, leafs[(i + 1) % 3], c));
for (let i = 0; i < 55; i++) {
  const x = (random() - 0.5) * 450,
    z = (random() - 0.5) * 450;
  if (Math.abs(x) < 18 || Math.abs(z + 55) < 14 || reserved(x, z)) continue;
  mesh(new T.DodecahedronGeometry(1 + random() * 2), dirt, x, 0.5, z);
}
type Target = {
  id: number;
  name: string;
  kind: "tank" | "truck" | "soldier" | "pillbox" | "cache";
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
  dodge: number;
  evadeUntil: number;
  evadeSide: number;
  coverUntil: number;
  coverAt: number;
  reaction: string;
};
let trafficPassed = 0,
  trafficEntered = 0,
  shotsFired = 0,
  shotsBlocked = 0;
const targets: Target[] = [];
const variant =
  Math.abs(Number(new URLSearchParams(location.search).get("v")) || 0) % 3;
const mission = new ConvoyMission(Math.floor(variant));
let missionReported = false;
let reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cameraBank = 0,
  flightFov = 65;
const effects = new BattleEffects(scene);
function target(
  name: string,
  x: number,
  z: number,
  kind: "tank" | "truck" | "soldier" | "pillbox" | "cache",
) {
  const g = new T.Group();
  scene.add(g);
  g.position.set(x, 0, z);
  const id = targets.length + 1;
  g.userData.target = id;
  if (kind === "cache") {
    const crates = mat(0x4c5038),
      bands = mat(0x323a2b),
      tarp = mat(0x3c4a32),
      warm = mat(0x777052, true);
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 3; col++) {
        const cx = (col - 1) * 1.45,
          cz = (row - 0.5) * 1.6;
        box(1.35, 0.85, 1.4, crates, cx, 0.43, cz, g);
        box(0.12, 0.9, 1.44, bands, cx - 0.4, 0.45, cz, g);
        box(0.12, 0.9, 1.44, bands, cx + 0.4, 0.45, cz, g);
      }
    box(2.8, 0.8, 1.5, crates, -0.6, 1.2, 0, g);
    const cover = box(4.8, 0.13, 3.5, tarp, 0, 1.7, 0, g);
    cover.rotation.z = 0.08;
    box(0.55, 0.45, 0.6, warm, 2.05, 0.3, 1.35, g);
    box(0.1, 0.7, 0.1, bands, 2.2, 0.65, 1.35, g);
  } else if (kind === "pillbox") {
    const concrete = mat(0x6a705e);
    box(7, 2.4, 7, concrete, 0, 1.2, 0, g);
    box(8.4, 0.65, 8.4, battlefield.soil, 0, 2.7, 0, g);
    box(5, 0.5, 0.05, dark, 0, 1.7, -3.52, g);
    for (let i = 0; i < 12; i++)
      box(
        0.9,
        0.09,
        1.4,
        battlefield.camo,
        ((i % 4) - 1.5) * 1.7,
        3.08,
        (Math.floor(i / 4) - 1) * 2,
        g,
      );
    sightBlockers.push(...g.children.filter((o) => o instanceof T.Mesh));
  } else if (kind === "tank") {
    models.tank(g);
  } else if (kind === "truck") {
    models.truck(g);
  } else {
    models.soldier(g);
  }

  const gun = new T.Group();
  g.add(gun);
  gun.position.y = kind === "pillbox" ? 3.5 : kind === "tank" ? 2.78 : 1.4;
  if (kind !== "truck" && kind !== "cache") {
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
  const p = new T.Vector3(
      x,
      kind === "soldier"
        ? groundHeight(x, z) + 1
        : kind === "pillbox"
          ? 2
          : 1.5,
      z,
    ),
    axis = (kind === "soldier" ? Math.abs(x) > 17 : Math.abs(z + 55) < 1)
      ? "x"
      : "z",
    direction = id % 2 === 0 ? 1 : -1;
  if (kind === "tank" || kind === "truck") {
    if (axis === "z") p.x = direction > 0 ? -3.3 : 3.3;
    else p.z = -55 + (direction > 0 ? 3.2 : -3.2);
  }
  g.position.set(p.x, kind === "soldier" ? groundHeight(p.x, p.z) : 0, p.z);
  targets.push({
    id,
    name,
    kind,
    group: g,
    p,
    previous: p.clone(),
    r:
      kind === "soldier"
        ? 1
        : kind === "cache"
          ? 2.7
          : kind === "pillbox"
            ? 5.3
            : 3.7,
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
    dodge: 0,
    evadeUntil: 0,
    evadeSide: 1,
    coverUntil: 0,
    coverAt: p[axis],
    reaction:
      kind === "cache"
        ? "AMMO CACHE"
        : kind === "pillbox"
          ? "WATCHING"
          : kind === "soldier"
            ? "PATROLLING"
            : "IN CONVOY",
  });
}
target("CONVOY 1 · TRANSPORT", 0, 0, "truck");
target("CONVOY 2 · ESCORT", 0, 0, "tank");
target("CONVOY 3 · TRANSPORT", 0, 0, "truck");
for (const [i, t] of targets.entries()) {
  t.axis = "z";
  t.direction = mission.direction;
  t.speed = mission.speed;
  t.p.set(t.direction > 0 ? -3.3 : 3.3, 1.5, -t.direction * 248);
  t.home.copy(t.p);
  t.previous.copy(t.p);
  t.alive = false;
  t.group.visible = false;
  t.respawn = mission.arrival(i);
}
target("PATROL 06", -52, 10, "soldier");
targets[3].axis = "z";
target("PATROL 07", -9, -12, "soldier");
target("PATROL 08", 65, -105, "soldier");
target("PATROL 09", -40, -64, "soldier");
PILLBOXES.forEach((p, i) => target("PILLBOX " + (i + 1), p.x, p.z, "pillbox"));
CACHES.forEach((p, i) => target("AMMO CACHE " + (i + 1), p.x, p.z, "cache"));

const wreckMaterial = new T.MeshStandardMaterial({
  color: 0x242624,
  roughness: 1,
});
let audio: AudioContext | undefined,
  rotor: OscillatorNode | undefined,
  volume: GainNode | undefined,
  muted = false;
let windVolume: GainNode | undefined;
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
  const noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const wind = audio.createBufferSource();
  wind.buffer = noise;
  wind.loop = true;
  const windFilter = audio.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 1000;
  windVolume = audio.createGain();
  windVolume.gain.value = 0;
  wind.connect(windFilter);
  windFilter.connect(windVolume);
  windVolume.connect(audio.destination);
  wind.start();
}
function batteryBeep(critical: boolean) {
  if (!audio || muted) return;
  const tone = audio.createOscillator(),
    gain = audio.createGain();
  tone.frequency.value = critical ? 880 : 660;
  gain.gain.setValueAtTime(0.035, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
  tone.connect(gain);
  gain.connect(audio.destination);
  tone.onended = () => {
    tone.disconnect();
    gain.disconnect();
  };
  tone.start();
  tone.stop(audio.currentTime + 0.2);
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
  const bass = audio.createOscillator(),
    bassGain = audio.createGain();
  bass.frequency.setValueAtTime(100, audio.currentTime);
  bass.frequency.exponentialRampToValueAtTime(35, audio.currentTime + 0.4);
  bassGain.gain.setValueAtTime(0.17, audio.currentTime);
  bassGain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.5);
  bass.connect(bassGain);
  bassGain.connect(audio.destination);
  bass.start();
  bass.stop(audio.currentTime + 0.5);
  bass.onended = () => {
    bass.disconnect();
    bassGain.disconnect();
  };
}
function explode(p: T.Vector3, kind = "drone") {
  boom();
  effects.burst(p, kind);
}
const spawn = new T.Vector3(LAUNCH.x, LAUNCH.y, LAUNCH.z),
  recon = new T.Vector3(0, 155, 175);
let batterySeconds = BATTERY.capacity,
  flightSeconds = 0,
  boosting = false;
let reconHealth = 100,
  fpvHealth = 100,
  gameOver = false,
  lastOutcome = "",
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
let aimedFriendly = "";
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
    if (m.userData.sensorMap) {
      m.map = thermal ? null : m.userData.sensorMap;
      m.needsUpdate = true;
    }
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
  $("battery").hidden = isRecon;
  $("launch-title").textContent = isRecon
    ? "FPV DRONE READY"
    : "YOU ARE CONTROLLING THE FPV DRONE";
  $("launch-copy").textContent = isRecon
    ? "Recon flight is locked high. Search with mouse, zoom and thermal; left-click a visible target to mark it."
    : "Space to take off. Battery runs from launch. Boost drains it 1.8× faster. Heart centre dot is your aim point.";
  $("launch-hint").textContent = isRecon
    ? "No target mark required. Esc opens clickable controls."
    : "Release movement to brake. Press F to return to recon.";
  $("pauseLaunch").hidden = !isRecon;
  $("mode").textContent =
    mode === "recon" ? "01 / RECONNAISSANCE" : "02 / FPV STRIKE";
  $("objective").textContent =
    mode === "recon"
      ? "Left-click to mark · F to launch"
      : "Fly into a target. Make it count.";
  $("launch").innerHTML =
    "<kbd>F</kbd>" +
    (mode === "recon" ? " LAUNCH FPV DRONE →" : " RETURN TO RECON");
  $("help").innerHTML =
    (isRecon
      ? "<kbd>RECON</kbd> HIGH ORBIT · CAMERA CONTROL ONLY"
      : "<kbd>W A S D</kbd> FLY &nbsp; <kbd>SPACE / C</kbd> UP / DOWN &nbsp; <kbd>SHIFT</kbd> BOOST") +
    "<br><kbd>LEFT CLICK</kbd> MARK &nbsp; <kbd>MOUSE / ARROWS</kbd> LOOK &nbsp; <kbd>SCROLL</kbd> ZOOM &nbsp; <kbd>T</kbd> THERMAL &nbsp; <kbd>M</kbd> MUTE &nbsp; <kbd>V</kbd> MOTION";
}
function switchMode() {
  if (!started || paused || ended || (mission.over && mode === "recon")) return;
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
    batterySeconds = BATTERY.capacity;
    flightSeconds = 0;
    boosting = false;
    sorties++;
    targets.forEach((t) => (t.seenFpv = 0));
    toast("FPV LIVE · FOREST TEAM · SPACE TO TAKE OFF");
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
    toast(
      aimed.name +
        (mode === "recon"
          ? " MARKED · PRESS F TO LAUNCH FPV"
          : " MARKED ON MAP"),
    );
    if (mode === "recon")
      $("launch-copy").textContent =
        aimed.name + " marked. Press F now to launch your FPV drone.";
  } else
    toast(
      aimedFriendly
        ? "FRIENDLY TEAM · THIS IS OUR POSITION"
        : "Aim directly at a visible target to mark",
    );
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
  if (reason !== "battery" && reason !== "mission")
    explode(gameOver ? recon : hit ? hit.p : position, hit?.kind);
  $("feed-loss").hidden = reason !== "battery";
  if (hit) {
    hit.alive = false;
    hit.respawn = Infinity;
    if (hit.id <= CONVOY.count) mission.destroy(hit.id - 1);
    if (hit.kind === "cache") mission.destroyCache(hit.id);
    hit.seenRecon = 0;
    hit.seenFpv = 0;
    kills++;
    hit.group.traverse((o) => {
      if (o instanceof T.Mesh) o.material = wreckMaterial;
    });
    hit.group.scale.y =
      hit.kind === "pillbox"
        ? 0.22
        : hit.kind === "soldier" || hit.kind === "cache"
          ? 0.25
          : 0.65;
    if (hit.kind === "truck" || hit.kind === "tank")
      hit.group.rotation.z = 0.1 * (hit.id % 2 ? 1 : -1);
    hit.group.updateMatrixWorld(true);
    hit.muzzle.visible = false;
  }
  if (reason !== "battery" && reason !== "mission")
    $("flash").classList.add("on");
  setTimeout(() => $("flash").classList.remove("on"), 120);
  if (gameOver) {
    mission.fail("Recon UAV lost");
    document.exitPointerLock();
    $("resultLabel").textContent = "OPERATION LOST";
    $("resultTitle").textContent = "Recon UAV lost.";
    $("resultText").textContent =
      "The recon UAV was destroyed. Operation ended with " +
      kills +
      " targets destroyed.";
    $("continue").textContent = "RESTART OPERATION →";
    $("result").hidden = false;
    return;
  }
  // Automatic feed handoff keeps pointer lock and never opens the sortie menu.
  const message = hit
    ? hit.name + " DESTROYED"
    : reason === "mission"
      ? "INTERCEPT ENDED"
      : reason === "battery"
        ? "FPV BATTERY DEPLETED"
        : reason === "gunfire"
          ? "FPV SHOT DOWN"
          : "FPV LOST";
  lastOutcome = message;
  setTimeout(() => {
    $("feed-loss").hidden = true;
    ended = false;
    mode = "fpv";
    switchMode();
    if (hit) {
      const gaze = hit.p.clone().sub(recon);
      yaw = Math.atan2(-gaze.x, -gaze.z);
      pitch = Math.atan2(gaze.y, Math.hypot(gaze.x, gaze.z));
    }
    toast(message + " · RECON FEED RESTORED");
    if (document.hidden || !document.hasFocus() || !document.pointerLockElement)
      pause(true);
  }, 500);
}
function nextMission() {
  const url = new URL(location.href);
  url.searchParams.set("v", String((mission.variant + 1) % 3));
  location.href = url.href;
}
function toggleMotion() {
  reducedMotion = !reducedMotion;
  $("motion").textContent =
    "FLIGHT MOTION: " + (reducedMotion ? "REDUCED" : "ON") + " · V";
}
$("motion").textContent =
  "FLIGHT MOTION: " + (reducedMotion ? "REDUCED" : "ON") + " · V";
$("motion").onclick = toggleMotion;
$("retry").onclick = () => location.reload();
$("next-mission").onclick = nextMission;
$("start").onclick = () => {
  audioStart();
  started = true;
  $("intro").hidden = true;
  canvas.requestPointerLock();
  toast("SEARCH WITH CAMERA · LEFT CLICK TO MARK · F TO LAUNCH");
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
  if (gameOver) location.reload();
};
canvas.onclick = () => {
  if (started && !paused && !ended && !mission.over) {
    mark();
    if (!document.pointerLockElement) canvas.requestPointerLock();
  }
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
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyC",
      "KeyE",
      "KeyF",
      "KeyT",
      "KeyM",
      "KeyV",
      "KeyN",
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
    if (e.code === "KeyV") toggleMotion();
    if (e.code === "KeyN" && mission.over) nextMission();
    if (e.code === "KeyM") {
      muted = !muted;
      toast(muted ? "AUDIO MUTED" : "AUDIO ON");
    }
    if (e.code === "KeyT") sensor();

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
  map.strokeStyle = "#ffd18a";
  map.lineWidth = 2;
  map.setLineDash([7, 5]);
  map.beginPath();
  map.moveTo(to(0), to(-245));
  map.lineTo(to(0), to(245));
  map.stroke();
  map.setLineDash([]);
  map.fillStyle = "#ffd18a";
  map.font = "12px monospace";
  map.fillText("ENTRY", to(8), to(-mission.direction * 230));
  map.fillText("EXIT", to(8), to(mission.direction * 230));
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
  map.strokeStyle = "#78dfff";
  map.lineWidth = 2;
  map.beginPath();
  map.arc(to(spawn.x), to(spawn.z), 11, 0, Math.PI * 2);
  map.stroke();
  map.fillStyle = "#78dfff";
  map.font = "bold 13px monospace";
  map.fillText("BASE", to(spawn.x) + 14, to(spawn.z) + 5);
  for (const f of battlefield.friendlies)
    map.fillRect(to(f.position.x) - 2, to(f.position.z) - 2, 4, 4);
  map.font = "18px monospace";
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
function obscured(a: T.Vector3, b: T.Vector3) {
  if (a.distanceToSquared(b) < 0.0001) return false;
  if (blocked(a, b)) return true;
  return sightRay.intersectObjects(understory.vision, false).length > 0;
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
  from.y = t.kind === "pillbox" ? 4 : t.kind === "tank" ? 3.3 : t.p.y + 0.5;
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
  if (mission.over) return;
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
        // Arrival is mission bookkeeping, not a player sighting.
        t.marked = false;
        t.serial++;
        if (t.id <= CONVOY.count) {
          mission.enter(t.id - 1);
          toast("CONVOY REPORTED · SEARCH THE ROAD · LEFT CLICK TO MARK");
        }
        t.p[t.axis] = -t.direction * 248;
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
    if (t.kind === "cache") {
      t.group.updateMatrixWorld(true);
      continue;
    }
    if (t.kind === "soldier") {
      const alert = Math.max(t.seenFpv, t.seenRecon) > 0.25;
      if (alert) {
        if (simTime >= t.coverUntil) {
          const threat = t.seenFpv > t.seenRecon ? position : recon;
          t.coverAt =
            t.home[t.axis] + (Math.sign(t.p[t.axis] - threat[t.axis]) || 1) * 9;
        }
        t.coverUntil = simTime + 3;
      }
      const takingCover = simTime < t.coverUntil;
      const goal = takingCover
        ? t.coverAt
        : t.home[t.axis] + patrolAt(simTime, t.id);
      const delta = goal - t.p[t.axis],
        pace = takingCover ? 3.2 : 1.5;
      t.p[t.axis] += T.MathUtils.clamp(delta, -pace * dt, pace * dt);
      const crouched = takingCover && Math.abs(delta) < 0.5;
      t.group.scale.y = crouched ? 0.68 : 1;
      t.reaction = takingCover
        ? crouched
          ? "IN COVER"
          : "MOVING TO COVER"
        : "PATROLLING";
      const forward = delta > 0;
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
          (leg.rotation.x =
            Math.sin(simTime * (takingCover ? 12 : 7) + i * Math.PI) *
            (crouched ? 0 : 0.4)),
      );
    } else if (t.kind !== "pillbox") {
      const cross = t.axis === "z" ? "x" : "z",
        center = t.axis === "z" ? 0 : -55;
      const alert = Math.max(t.seenFpv, t.seenRecon) > 0.25;
      if (alert && simTime >= t.evadeUntil) {
        const threat =
          t.seenFpv >= t.seenRecon && mode === "fpv" ? position : recon;
        const away = Math.sign(t.p[cross] - threat[cross]) || t.direction;
        t.evadeSide = away;
        t.evadeUntil = simTime + (t.kind === "truck" ? 2.1 : 3.1);
      }
      const evading = simTime < t.evadeUntil;
      t.reaction = evading ? "EVADING" : alert ? "ALERTED" : "IN CONVOY";
      const offset = evadeOffset(
        t.p[cross] - center,
        t.home[cross] - center,
        t.evadeSide,
        evading,
        t.kind === "truck",
        dt,
        t.axis === "z" ? 5 : 3.7,
      );
      t.dodge = offset - (t.home[cross] - center);
      t.p[cross] = center + offset;
      const moved = trafficStep(
        t.p[t.axis],
        t.direction,
        t.speed * (evading ? (t.kind === "truck" ? 1.5 : 1.12) : 1),
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
      const dx = t.p.x - t.previous.x,
        dz = t.p.z - t.previous.z;
      if (Math.hypot(dx, dz) > 0.001) t.group.rotation.y = Math.atan2(-dx, -dz);
      models.roll(t.group, Math.hypot(dx, dz));
      if (moved.exited) {
        t.alive = false;
        t.group.visible = false;
        t.marked = false;
        t.respawn = Infinity;
        if (t.id <= CONVOY.count) mission.escape(t.id - 1);
        trafficPassed++;
        continue;
      }
    }
    if (t.kind === "soldier") t.p.y = groundHeight(t.p.x, t.p.z) + 1;
    t.group.position.set(t.p.x, t.kind === "soldier" ? t.p.y - 1 : 0, t.p.z);
    t.group.updateMatrixWorld(true);

    const from = t.p.clone();
    from.y = t.kind === "pillbox" ? 4 : t.kind === "tank" ? 3.3 : t.p.y + 0.5;
    if (scan) {
      const vehicle = t.kind === "tank" || t.kind === "truck";
      const sees = (p: T.Vector3) =>
        !vehicle || vehicleSees(from, p, t.axis, t.direction);
      const seeRecon =
        sees(recon) && inEnvelope(from, recon) && !obscured(from, recon);
      const seeFpv =
        mode === "fpv" &&
        sees(position) &&
        inEnvelope(from, position) &&
        !obscured(from, position);
      t.seenRecon = awareness(t.seenRecon, seeRecon, 0.1);
      t.seenFpv = awareness(t.seenFpv, seeFpv, 0.1);
    }
    t.cooldown -= dt;
    t.flash = Math.max(0, t.flash - dt);
    t.muzzle.visible = t.flash > 0;
    const victim = t.seenFpv >= t.seenRecon && mode === "fpv" ? "fpv" : "recon",
      level = victim === "fpv" ? t.seenFpv : t.seenRecon,
      aim = victim === "fpv" ? position : recon;
    if (t.kind === "pillbox") t.reaction = level > 0 ? "TRACKING" : "WATCHING";
    if (level > 0) {
      threatCount++;
      t.gun.lookAt(aim);
    }
    if (
      t.kind !== "truck" &&
      level >= 1 &&
      t.cooldown <= 0 &&
      inEnvelope(from, aim) &&
      !obscured(from, aim)
    ) {
      t.reaction = "FIRING";
      shoot(t, victim, aim);
      t.cooldown = t.kind === "tank" || t.kind === "pillbox" ? 0.38 : 0.6;
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
  if (started && !paused && !ended) {
    simTime += dt;
    mission.tick(dt);
  }
  effects.update(started && !paused ? dt : 0);
  if (windVolume && audio)
    windVolume.gain.setTargetAtTime(
      !muted && started && !paused && !ended && mode === "fpv"
        ? Math.min(0.045, velocity.length() * 0.0007)
        : 0,
      audio.currentTime,
      0.15,
    );
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
        : keys.has("ShiftLeft") || keys.has("ShiftRight")
          ? FLIGHT.boost
          : FLIGHT.speed,
    );
    const oldRecon = recon.clone();
    recon.copy(reconOrbit(simTime));
    reconVelocity
      .copy(recon)
      .sub(oldRecon)
      .divideScalar(dt || 1);
    if (mode === "recon") {
      if (pitch < -0.15) {
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
      velocity.copy(steer(velocity, desired, dt));
    }
    battleStep(dt);
    if (!ended && mode === "fpv") {
      boosting =
        (keys.has("ShiftLeft") || keys.has("ShiftRight")) &&
        desired.lengthSq() > 0;
      const previousBattery = batterySeconds;
      batterySeconds = drainBattery(batterySeconds, dt, boosting);
      flightSeconds += dt;
      if (previousBattery > BATTERY.low && batterySeconds <= BATTERY.low) {
        toast("LOW BATTERY · 15s AT NORMAL POWER");
        batteryBeep(false);
      }
      if (
        previousBattery > BATTERY.critical &&
        batterySeconds <= BATTERY.critical
      ) {
        toast("BATTERY CRITICAL · 7s AT NORMAL POWER");
        batteryBeep(true);
      }
      if (batterySeconds === 0) finish(undefined, "battery");
    }
    if (!ended && !mission.over && mode === "fpv") {
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
      for (const box of coverBoxes) {
        const n = boxContact(position, next, box.min, box.max);
        if (n !== null && n < earliest) {
          earliest = n;
          victim = undefined;
        }
      }
      for (const c of treeColliders) {
        const n = contact(position, next, c.p, c.r + FLIGHT.radius);
        if (n !== null && n < earliest) {
          earliest = n;
          victim = undefined;
        }
      }
      if (next.y < groundHeight(next.x, next.z) + 0.45 && velocity.y < 0) {
        const n =
          (position.y - (groundHeight(next.x, next.z) + 0.45)) /
          (position.y - next.y);
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
      position.y = T.MathUtils.clamp(
        position.y,
        groundHeight(position.x, position.z) + 0.45,
        130,
      );
    }
  }
  camera.position.copy(position);
  const lateral = velocity.x * Math.cos(yaw) - velocity.z * Math.sin(yaw);
  const targetBank =
    mode === "fpv" && !reducedMotion ? (-lateral / FLIGHT.boost) * 0.075 : 0;
  cameraBank = T.MathUtils.lerp(cameraBank, targetBank, 1 - Math.exp(-8 * dt));
  const targetFov =
    mode === "fpv"
      ? 72 +
        (!reducedMotion
          ? Math.max(0, velocity.length() - FLIGHT.speed) * 0.3
          : 0)
      : 65;
  flightFov = T.MathUtils.lerp(flightFov, targetFov, 1 - Math.exp(-6 * dt));
  camera.rotation.set(pitch, yaw, cameraBank, "YXZ");
  camera.fov = flightFov / zoom;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  aimed = undefined;
  aimedFriendly = "";
  ray.setFromCamera(new T.Vector2(0, 0), camera);
  const hits = ray.intersectObjects(scene.children, true).filter((hit) => {
    let object: T.Object3D | null = hit.object;
    while (object) {
      if (!object.visible) return false;
      object = object.parent;
    }
    return true;
  });
  if (hits.length) {
    let o: T.Object3D | null = hits[0].object;
    while (o && !o.userData.target && !o.userData.friendly) o = o.parent;
    if (o?.userData.friendly) aimedFriendly = String(o.userData.friendly);
    else if (o)
      aimed = targets.find((t) => t.id === o!.userData.target && t.alive);
  }
  $("cross").classList.toggle("ready", !!aimed);
  $("cross").classList.toggle("friendly", !!aimedFriendly);
  $("aim").textContent = aimed
    ? aimed.name + " · " + aimed.reaction + " · LEFT CLICK TO MARK"
    : aimedFriendly
      ? "OUR TEAM · FRIENDLY"
      : "";
  $("alt").textContent = Math.round(
    position.y - groundHeight(position.x, position.z),
  ).toString();
  $("speed").textContent = Math.round(velocity.length()).toString();
  $("heading").textContent =
    String(Math.round(((((-yaw * 180) / Math.PI) % 360) + 360) % 360)).padStart(
      3,
      "0",
    ) + "°";
  $("zoom").textContent = "OPTICAL " + zoom.toFixed(1) + "×";
  $("battery").dataset.level = batteryLevel(batterySeconds);
  $("battery-percent").textContent =
    Math.ceil((batterySeconds / BATTERY.capacity) * 100) + "%";
  $("battery-time").textContent = clockText(batterySeconds);
  $("battery-fill").style.width =
    (batterySeconds / BATTERY.capacity) * 100 + "%";
  $("battery-status").textContent =
    batterySeconds <= BATTERY.critical
      ? "CRITICAL · POWER RUNNING OUT"
      : batterySeconds <= BATTERY.low
        ? "LOW BATTERY" + (boosting ? " · BOOST 1.8× DRAIN" : "")
        : boosting
          ? "BOOST · 1.8× DRAIN"
          : "FLIGHT TIME REMAINING";
  $("flight-time").textContent = clockText(Math.floor(flightSeconds));
  $("sorties").textContent = "SORTIE " + String(sorties).padStart(2, "0");
  $("score").textContent =
    mission.destroyed +
    " / 3 CONVOY STOPPED · " +
    mission.score(sorties) +
    " POINTS";
  $("mission-clock").textContent =
    mission.phase === "approach"
      ? "CONVOY ARRIVES IN " + clockText(CONVOY.warning - mission.time)
      : mission.over
        ? mission.phase === "success"
          ? "INTERCEPT COMPLETE"
          : "INTERCEPT FAILED"
        : "OPERATION " + clockText(mission.remaining);
  $("cache-progress").textContent =
    "HIDDEN CACHES · " +
    mission.cachesDestroyed +
    " / " +
    CACHES.length +
    " · +750 EACH";
  $("convoy-progress").textContent = mission.vehicles
    .map((state, i) => i + 1 + " " + state.toUpperCase())
    .join("  ·  ");
  if (mission.over && !gameOver && !ended && !missionReported) {
    if (mode === "fpv") finish(undefined, "mission");
    else {
      missionReported = true;
      clearFpvShots();
      $("mission-report").hidden = false;
      $("mission-result").textContent =
        mission.phase === "success" ? "CONVOY STOPPED" : "INTERCEPT FAILED";
      $("mission-detail").textContent =
        mission.reason +
        ". " +
        mission.score(sorties) +
        " points · " +
        sorties +
        " drones used.";
      $("objective").textContent =
        mission.phase === "success" ? "Sector secured." : mission.reason + ".";
      $("launch-hint").textContent = "Press N for another intercept.";
      $("launch-title").textContent = "OPERATION COMPLETE";
      $("launch-copy").textContent =
        "Review the sector from recon. Press N for the next intercept.";
      ($("launch") as HTMLButtonElement).disabled = true;
      $("pauseLaunch").hidden = true;
    }
  }
  $("autopilot").textContent = "RECON · LOCKED HIGH ORBIT";
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
  const basePoint = spawn.clone().setY(3),
    baseScreen = basePoint.clone().project(camera);
  const homeDelta = spawn.clone().sub(position);
  const right = homeDelta.x * Math.cos(yaw) - homeDelta.z * Math.sin(yaw);
  const ahead = -homeDelta.x * Math.sin(yaw) - homeDelta.z * Math.cos(yaw);
  const atBase = Math.hypot(homeDelta.x, homeDelta.z) < 15 && position.y < 15;
  $("home-arrow").textContent = atBase ? "⊕" : "↑";
  $("home-arrow").style.transform =
    "rotate(" +
    ((atBase ? 0 : Math.atan2(right, ahead)) * 180) / Math.PI +
    "deg)";
  $("home-distance").textContent =
    Math.hypot(homeDelta.x, homeDelta.z) < 15 && position.y < 15
      ? "AT FRIENDLY LAUNCH SITE"
      : Math.round(homeDelta.length()) + "m · DIRECTION TO HOME";
  let friendlyHtml = "";
  const inView = (p: T.Vector3) => {
    const x = ((p.x + 1) * innerWidth) / 2,
      y = ((-p.y + 1) * innerHeight) / 2;
    return (
      p.z > -1 &&
      p.z < 1 &&
      Math.abs(p.x) < 0.9 &&
      Math.abs(p.y) < 0.78 &&
      !(x < 400 && y < 260) &&
      !(x > innerWidth - 330) &&
      !(x < 780 && y > innerHeight - 220) &&
      !(Math.abs(x - innerWidth / 2) < 170 && y < 190)
    );
  };
  if (inView(baseScreen))
    friendlyHtml +=
      '<div class="friendly-base" style="left:' +
      (baseScreen.x + 1) * 50 +
      "%;top:" +
      (-baseScreen.y + 1) * 50 +
      '%"><b>⊕</b> OUR TEAM / BASE</div>';
  for (const f of battlefield.friendlies) {
    const p = f.position.clone().project(camera);
    if (inView(p))
      friendlyHtml +=
        '<div class="friendly-unit" title="' +
        f.name +
        '" style="left:' +
        (p.x + 1) * 50 +
        "%;top:" +
        (-p.y + 1) * 50 +
        '%">⌄</div>';
  }
  $("friendly-markers").innerHTML = friendlyHtml;
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
    lastOutcome,
    thermal,
    zoom,
    kills,
    sorties,
    simTime,
    reconHealth,
    fpvHealth,
    mission: {
      phase: mission.phase,
      time: mission.time,
      remaining: mission.remaining,
      vehicles: [...mission.vehicles],
      score: mission.score(sorties),
      variant: mission.variant,
      reason: mission.reason,
      cachesDestroyed: mission.cachesDestroyed,
    },
    cameraBank,
    cameraFov: camera.fov,
    reducedMotion,
    effectCount: effects.count,
    batterySeconds,
    flightSeconds,
    boosting,
    manual: false,
    burningCaches: effects.burningCaches,
    aimedFriendly,
    friendlies: battlefield.friendlies.map((f) => ({
      name: f.name,
      x: f.position.x,
      y: f.position.y,
      z: f.position.z,
    })),
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
      dodge: t.dodge,
      reaction: t.reaction,
      evading: simTime < t.evadeUntil,
      awareness: Math.max(t.seenRecon, t.seenFpv),
    })),
  }),
});
