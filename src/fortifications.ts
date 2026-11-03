import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
type Mat = (color: number, hot?: boolean) => T.MeshStandardMaterial;
export function weatherTexture(
  kind: "concrete" | "cloth" | "soil" | "uniform",
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const c = canvas.getContext("2d")!;
  let seed = 73;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  c.fillStyle =
    kind === "concrete" ? "#999b8e" : kind === "cloth" ? "#8c9070" : "#92816a";
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) {
    c.fillStyle = i % 3 ? "#23282025" : "#d8cfac30";
    const size = kind === "cloth" ? 2 + rnd() * 10 : 1 + rnd() * 5;
    c.fillRect(rnd() * 256, rnd() * 256, size, 1 + rnd() * size);
  }
  if (kind === "uniform")
    for (let i = 0; i < 400; i++) {
      c.fillStyle = ["#384732bb", "#5c6647cc", "#aaa17fbb", "#727959bb"][i % 4];
      const x = rnd() * 256,
        y = rnd() * 256;
      c.beginPath();
      c.ellipse(
        x,
        y,
        3 + rnd() * 12,
        2 + rnd() * 6,
        rnd() * Math.PI,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
  if (kind === "concrete")
    for (let i = 0; i < 18; i++) {
      let x = rnd() * 256,
        y = rnd() * 256;
      c.strokeStyle = "#363c3545";
      c.lineWidth = 0.5 + rnd();
      c.beginPath();
      c.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (rnd() - 0.5) * 28;
        y += rnd() * 13;
        c.lineTo(x, y);
      }
      c.stroke();
    }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}
export function buildPillbox(group: T.Group, mat: Mat) {
  const concrete = mat(0xb5b7aa),
    earth = mat(0x6b6650),
    bag = mat(0xaba37d),
    black = mat(0x181e1a),
    metal = mat(0x454a42);
  concrete.map = weatherTexture("concrete");
  earth.map = weatherTexture("soil");
  bag.map = weatherTexture("cloth");
  for (const m of [concrete, earth, bag]) {
    m.userData.sensorMap = m.map;
    m.flatShading = false;
  }
  const parts: T.Mesh[] = [];
  function block(
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
  ) {
    const mesh = new T.Mesh(
      new RoundedBoxGeometry(w, h, d, 2, Math.min(0.12, h * 0.2, d * 0.2)),
      m,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    parts.push(mesh);
    return mesh;
  }
  // Open embrasure and rear doorway, with thickness and a visible dark interior.
  block(7.2, 1.15, 0.8, concrete, 0, 0.575, -3);
  block(7.2, 0.7, 0.8, concrete, 0, 2.35, -3);
  for (const side of [-1, 1]) {
    block(1.6, 0.85, 0.8, concrete, side * 2.8, 1.575, -3);
    block(0.8, 2.7, 6.8, concrete, side * 3.2, 1.35, 0);
    block(2.7, 2.7, 0.7, concrete, side * 2.25, 1.35, 3);
    block(1.1, 0.45, 1.1, concrete, side * 2.8, 2.75, -3.1);
  }
  block(2, 0.6, 0.7, concrete, 0, 2.4, 3);
  block(6.5, 0.12, 6, black, 0, 0.05, 0);
  block(8.1, 0.65, 7.8, concrete, 0, 3.02, 0);
  // Soil cover is an uneven low mound, not a perfectly rectangular lid.
  const mound = new T.Mesh(
    new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    earth,
  );
  mound.scale.set(3.9, 0.9, 3.6);
  mound.position.y = 3.34;
  mound.castShadow = mound.receiveShadow = true;
  group.add(mound);
  parts.push(mound);
  for (const side of [-1, 1]) {
    const berm = new T.Mesh(new T.SphereGeometry(1, 12, 6), earth);
    berm.scale.set(1.25, 1.1, 3.6);
    berm.position.set(side * 3.8, 0.45, 0.35);
    group.add(berm);
    parts.push(berm);
  }
  for (let i = 0; i < 14; i++) {
    const sack = new T.Mesh(new T.SphereGeometry(1, 10, 6), bag);
    sack.scale.set(0.45, 0.18, 0.31);
    sack.position.set(
      ((i % 7) - 3) * 0.92,
      1.23 + Math.floor(i / 7) * 0.26,
      -3.43,
    );
    sack.rotation.y = ((i % 3) - 1) * 0.12;
    sack.castShadow = true;
    group.add(sack);
    parts.push(sack);
  }
  // Cosmetic equipment at the opening; arcade aiming/damage remain independent.
  block(0.14, 0.14, 1.35, metal, 0.65, 1.68, -3.25);
  block(0.34, 0.24, 0.48, metal, 0.65, 1.6, -2.68);
  for (let i = 0; i < 7; i++) {
    const rubble = block(
      0.3 + (i % 3) * 0.1,
      0.18,
      0.35,
      concrete,
      -3 + i * 0.9,
      0.12,
      -4.15 + (i % 2) * 0.3,
    );
    rubble.rotation.y = i * 0.73;
  }
  return parts;
}
