import * as T from "three";
import { LAUNCH, TRENCHES, reserved } from "./layout";
type MaterialFactory = (color: number, hot?: boolean) => T.MeshStandardMaterial;
export function buildBattlefield(scene: T.Scene, mat: MaterialFactory) {
  const solids: T.Mesh[] = [],
    blockers: T.Mesh[] = [];
  const soil = mat(0x655b45),
    mud = mat(0x383b30),
    wood = mat(0x514739),
    sand = mat(0x81795b),
    camo = mat(0x455341),
    metal = mat(0x3f4e49),
    black = mat(0x242b29),
    pale = mat(0xb4b9a2);
  function box(
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    solid = true,
  ) {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    if (solid) {
      solids.push(mesh);
      blockers.push(mesh);
    }
    return mesh;
  }
  const shape = new T.Shape();
  shape.moveTo(-900, -900);
  shape.lineTo(900, -900);
  shape.lineTo(900, 900);
  shape.lineTo(-900, 900);
  shape.closePath();
  for (const t of TRENCHES) {
    const hole = new T.Path(),
      x = t.x - t.w / 2,
      y = -t.z - t.d / 2;
    hole.moveTo(x, y);
    hole.lineTo(x, y + t.d);
    hole.lineTo(x + t.w, y + t.d);
    hole.lineTo(x + t.w, y);
    hole.closePath();
    shape.holes.push(hole);
  }
  const ground = new T.Mesh(new T.ShapeGeometry(shape), mat(0x626c4d));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  blockers.push(ground);
  for (const t of TRENCHES) {
    box(t.w, 0.15, t.d, mud, t.x, -t.depth - 0.075, t.z, false);
    // Recessed timber walls, with a small earth lip and sandbags at ground level.
    for (const sign of [-1, 1]) {
      box(0.25, t.depth, t.d, wood, t.x + (sign * t.w) / 2, -t.depth / 2, t.z);
      box(t.w, t.depth, 0.25, wood, t.x, -t.depth / 2, t.z + (sign * t.d) / 2);
      if (t.d > t.w) {
        box(1.3, 0.45, t.d + 1, soil, t.x + sign * (t.w / 2 + 0.7), 0.16, t.z);
        for (let z = t.z - t.d / 2; z < t.z + t.d / 2; z += 1.4)
          box(0.85, 0.38, 1.15, sand, t.x + sign * (t.w / 2 + 0.5), 0.48, z);
      } else {
        box(t.w + 1, 0.45, 1.3, soil, t.x, 0.16, t.z + sign * (t.d / 2 + 0.7));
        for (let x = t.x - t.w / 2; x < t.x + t.w / 2; x += 1.4)
          box(1.15, 0.38, 0.85, sand, x, 0.48, t.z + sign * (t.d / 2 + 0.5));
      }
    }
    // Visible duckboards at the bottom.
    for (let i = 0; i < (t.d > t.w ? t.d : t.w); i += 1.2)
      box(
        t.d > t.w ? t.w - 0.5 : 0.6,
        0.08,
        t.d > t.w ? 0.6 : t.d - 0.5,
        wood,
        t.d > t.w ? t.x : t.x - t.w / 2 + i,
        -t.depth + 0.1,
        t.d > t.w ? t.z - t.d / 2 + i : t.z,
        false,
      );
  }
  const texCanvas = document.createElement("canvas");
  texCanvas.width = 128;
  texCanvas.height = 128;
  const ctx = texCanvas.getContext("2d")!;
  let n = 913;
  const rand = () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  };
  for (let i = 0; i < 240; i++) {
    ctx.fillStyle = ["#3e4b35", "#69734b", "#4b5138", "#333e2d"][i % 4];
    ctx.fillRect(rand() * 128, rand() * 128, 4 + rand() * 12, 3 + rand() * 8);
  }
  const texture = new T.CanvasTexture(texCanvas);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(3, 4);
  const net = mat(0xffffff);
  net.map = texture;
  net.alphaTest = 0.5;
  net.side = T.DoubleSide;
  function canopy(x: number, z: number, w: number, d: number) {
    const mesh = new T.Mesh(new T.PlaneGeometry(w, d, 8, 8), net);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 3.1, z);
    scene.add(mesh);
    // Thin net is visual; solid shelter walls supply cover. Keep the launch opening clear.
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        box(0.18, 3.2, 0.18, wood, x + (a * w) / 2, 1.6, z + (b * d) / 2);
    return mesh;
  }
  canopy(-112, 169, 10, 15);
  box(1.4, 2.8, 17, wood, -117, 1.4, 169);
  box(10, 2.8, 1.2, wood, -112, 1.4, 176);
  box(5, 0.18, 4, wood, LAUNCH.x, 0.09, LAUNCH.z, false);
  box(5, 0.03, 4, mud, LAUNCH.x, 0.01, LAUNCH.z, false);
  for (let i = 0; i < 5; i++) {
    box(1.4, 0.8, 1, metal, -108 + i * 0.2, 0.4, 163 + i * 1.6);
    box(1.1, 0.06, 0.1, pale, -108 + i * 0.2, 0.83, 163 + i * 1.6, false);
  }
  box(2.4, 0.12, 1.4, wood, -110, 1.1, 163);
  box(0.8, 0.5, 0.08, black, -110, 1.4, 162.8, false);
  // Prepared spare quadcopter on the operator's table.
  box(1, 0.07, 0.08, black, -110, 1.25, 163);
  box(0.08, 0.07, 1, black, -110, 1.25, 163);
  for (const a of [-0.45, 0.45])
    for (const b of [-0.45, 0.45]) {
      const rotor = new T.Mesh(new T.TorusGeometry(0.22, 0.025, 4, 12), black);
      rotor.rotation.x = Math.PI / 2;
      rotor.position.set(-110 + a, 1.28, 163 + b);
      scene.add(rotor);
    }
  // Allied operators and a supply van, away from the playable takeoff opening.
  for (const [x, z] of [
    [-97, 158],
    [-108, 172],
    [-119, 159],
  ]) {
    box(0.7, 1, 0.5, camo, x, 0.95, z, false);
    const head = new T.Mesh(new T.SphereGeometry(0.3, 8, 6), camo);
    head.position.set(x, 1.8, z);
    scene.add(head);
    for (const a of [-0.23, 0.23])
      box(0.23, 0.65, 0.3, black, x + a, 0.32, z, false);
    box(0.5, 0.07, 0.08, pale, x, 1.3, z - 0.28, false);
  }
  box(3.6, 2.3, 6.5, metal, -123, 1.7, 180);
  box(3, 0.8, 0.08, black, -123, 2.25, 176.72, false);
  for (const a of [-1.8, 1.8])
    for (const b of [-2.1, 2.1])
      box(0.4, 1, 1.1, black, -123 + a, 0.55, 180 + b);
  canopy(-123, 180, 5, 8);
  // Crater scars and shattered trees give the center a battle-worn silhouette.
  for (let i = 0; i < 24; i++) {
    const x = (rand() - 0.5) * 145,
      z = (rand() - 0.5) * 160;
    if (Math.abs(x) < 10 || Math.abs(z + 55) < 8 || reserved(x, z)) continue;
    const crater = new T.Mesh(new T.CircleGeometry(2 + rand() * 3, 12), mud);
    crater.rotation.x = -Math.PI / 2;
    crater.position.set(x, 0.025, z);
    scene.add(crater);
    const rim = new T.Mesh(new T.TorusGeometry(2.8, 0.35, 4, 12), soil);
    rim.rotation.x = Math.PI / 2;
    rim.scale.z = 0.3;
    rim.position.set(x, 0.08, z);
    scene.add(rim);
    const stump = box(0.65, 3 + rand() * 4, 0.65, wood, x + 4, 1.8, z + 2);
    stump.rotation.z = (rand() - 0.5) * 0.5;
    const log = box(0.6, 0.6, 5, wood, x + 3, 0.35, z - 3);
    log.rotation.y = rand() * Math.PI;
  }
  return { solids, blockers, soil, mud, wood, sand, camo };
}
