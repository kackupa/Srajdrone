import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type Mat = (color: number, hot?: boolean) => T.MeshStandardMaterial;
const textures = new Map<string, T.CanvasTexture>();
// Original painted camouflage, wear and fabric grain; no downloaded images.
function texture(kind: "paint" | "cloth" | "grain") {
  if (textures.has(kind)) return textures.get(kind)!;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  let seed = kind === "paint" ? 901 : 1127;
  const rand = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  ctx.fillStyle =
    kind === "paint" ? "#61694a" : kind === "cloth" ? "#696a4c" : "#929292";
  ctx.fillRect(0, 0, 512, 512);
  if (kind === "paint")
    for (let i = 0; i < 16; i++) {
      const x = rand() * 512,
        y = rand() * 512;
      ctx.fillStyle =
        i % 3 === 0 ? "#303a2c" : i % 3 === 1 ? "#858267" : "#4c5840";
      ctx.beginPath();
      for (let j = 0; j < 10; j++) {
        const a = (j * Math.PI) / 5,
          r = 25 + rand() * 65;
        const px = x + Math.cos(a) * r,
          py = y + Math.sin(a) * r;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  for (let i = 0; i < 28000; i++) {
    ctx.fillStyle = i % 2 ? "#fff8d319" : "#161b1422";
    ctx.fillRect(rand() * 512, rand() * 512, 1 + rand() * 2, 1 + rand() * 2);
  }
  if (kind === "paint")
    for (let i = 0; i < 320; i++) {
      ctx.fillStyle = i % 3 ? "#bcb69a50" : "#282c2460";
      ctx.fillRect(rand() * 512, rand() * 512, 1 + rand() * 12, 0.4 + rand());
    }
  if (kind === "cloth") {
    ctx.strokeStyle = "#22251d16";
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }
  const map = new T.CanvasTexture(c);
  if (kind !== "grain") map.colorSpace = T.SRGBColorSpace;
  map.wrapS = map.wrapT = T.RepeatWrapping;
  map.anisotropy = 4;
  textures.set(kind, map);
  return map;
}

export function createVehicles(mat: Mat) {
  function material(
    color: number,
    hot: boolean,
    roughness = 0.8,
    metalness = 0.05,
  ) {
    const m = mat(color, hot);
    m.flatShading = false;
    m.roughness = roughness;
    m.metalness = metalness;
    return m;
  }
  const paint = material(0xffffff, true),
    canvas = material(0xffffff, true, 0.98, 0),
    rubber = material(0x242722, true, 0.95, 0),
    steel = material(0x45493e, true, 0.65, 0.35),
    olive = material(0x596347, true),
    mud = material(0x635b43, true, 0.98, 0),
    glass = material(0x273f45, false, 0.19, 0.35),
    black = material(0x161c1c, false),
    lens = material(0xc8c8ab, true, 0.25, 0.1),
    red = material(0x78382e, true),
    wood = material(0x6d6248, false);
  paint.map = texture("paint");
  canvas.map = texture("cloth");
  for (const m of [paint, canvas]) {
    m.userData.sensorMap = m.map;
    m.bumpMap = texture("grain");
    m.bumpScale = m === paint ? 0.016 : 0.035;
  }
  const mesh = (
    geo: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    p: T.Object3D,
  ) => {
    const o = new T.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    p.add(o);
    return o;
  };
  const box = (
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    p: T.Object3D,
    round = 0,
  ) =>
    mesh(
      round
        ? new RoundedBoxGeometry(w, h, d, 2, round)
        : new T.BoxGeometry(w, h, d),
      m,
      x,
      y,
      z,
      p,
    );
  function cylinder(
    r: number,
    length: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    p: T.Object3D,
    axis: "x" | "y" | "z" = "y",
    r2 = r,
  ) {
    const o = mesh(new T.CylinderGeometry(r, r2, length, 20), m, x, y, z, p);
    if (axis === "x") o.rotation.z = Math.PI / 2;
    if (axis === "z") o.rotation.x = Math.PI / 2;
    return o;
  }
  function line(
    a: T.Vector3,
    b: T.Vector3,
    r: number,
    m: T.Material,
    p: T.Object3D,
  ) {
    const o = mesh(
      new T.CylinderGeometry(r, r, a.distanceTo(b), 8),
      m,
      0,
      0,
      0,
      p,
    );
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    return o;
  }
  // Batch small static parts by material so detailed tread/bolts do not cost hundreds of draw calls.
  function bake(g: T.Group) {
    g.updateMatrixWorld(true);
    const batches = new Map<T.Material, T.BufferGeometry[]>();
    for (const o of [...g.children])
      if (o instanceof T.Mesh) {
        o.updateMatrix();
        let geo = o.geometry.clone().applyMatrix4(o.matrix);
        if (geo.index) {
          const plain = geo.toNonIndexed();
          geo.dispose();
          geo = plain;
        }
        if (o.material === paint) {
          const a = geo.getAttribute("position"),
            n = geo.getAttribute("normal"),
            uv = geo.getAttribute("uv");
          for (let i = 0; i < a.count; i++) {
            const nx = Math.abs(n.getX(i)),
              ny = Math.abs(n.getY(i)),
              nz = Math.abs(n.getZ(i));
            uv.setXY(
              i,
              (nx > ny && nx > nz ? a.getZ(i) : a.getX(i)) * 0.24,
              (ny > nx && ny > nz ? a.getZ(i) : a.getY(i)) * 0.24,
            );
          }
        }
        const material = o.material as T.Material;
        if (!batches.has(material)) batches.set(material, []);
        batches.get(material)!.push(geo);
        o.geometry.dispose();
        g.remove(o);
      }
    for (const [m, geos] of batches) {
      const merged = mergeGeometries(geos)!;
      mesh(merged, m, 0, 0, 0, g);
      geos.forEach((geo) => geo.dispose());
    }
  }
  function wheel(
    x: number,
    y: number,
    z: number,
    r: number,
    p: T.Group,
    tread = true,
  ) {
    const g = new T.Group();
    g.position.set(x, y, z);
    g.userData.wheelRadius = r;
    p.add(g);
    cylinder(r, 0.42, rubber, 0, 0, 0, g, "x");
    cylinder(r * 0.67, 0.445, olive, 0, 0, 0, g, "x");
    cylinder(r * 0.3, 0.47, steel, 0, 0, 0, g, "x");
    const sign = Math.sign(x) || 1;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      cylinder(
        0.035,
        0.025,
        steel,
        sign * 0.25,
        Math.cos(a) * r * 0.43,
        Math.sin(a) * r * 0.43,
        g,
        "x",
      );
    }
    if (tread)
      for (let i = 0; i < 24; i++)
        for (const side of [-1, 1]) {
          const a = (i * Math.PI) / 12;
          const lug = box(
            0.22,
            0.09,
            0.18,
            mud,
            side * 0.1,
            Math.cos(a) * r,
            Math.sin(a) * r,
            g,
          );
          lug.rotation.x = -a;
          lug.rotation.y = side * 0.28;
        }
    bake(g);
    return g;
  }
  function tank(g: T.Group) {
    // Visual interpretation of the T-72 family: low hull, cast dome, six road wheels.
    box(3.3, 0.82, 5.9, paint, 0, 1.2, 0, g, 0.12);
    box(3.7, 0.18, 6.15, paint, 0, 1.72, 0, g, 0.07);
    const glacis = box(3.25, 0.18, 1.65, paint, 0, 1.45, -2.65, g);
    glacis.rotation.x = -0.3;
    for (const side of [-1, 1]) {
      // Rounded continuous track silhouette and individually visible links.
      box(0.64, 1.26, 6.32, rubber, side * 1.9, 0.72, 0, g, 0.45);
      for (let i = 0; i < 6; i++)
        wheel(side * 2.02, 0.64, -2.25 + i * 0.9, 0.51, g, false);
      for (const end of [-1, 1])
        wheel(side * 2.02, 0.75, end * 2.74, 0.38, g, false);
      for (let i = 0; i < 25; i++)
        for (const y of [0.12, 1.28])
          box(0.69, 0.075, 0.16, steel, side * 1.9, y, -2.75 + i * 0.23, g);
      for (const end of [-1, 1])
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 9;
          const link = box(
            0.69,
            0.08,
            0.17,
            steel,
            side * 1.9,
            0.7 + Math.sin(a) * 0.57,
            end * (2.75 + Math.cos(a) * 0.4),
            g,
          );
          link.rotation.x = end * a;
        }
      box(0.78, 0.12, 6.38, paint, side * 1.88, 1.53, 0, g, 0.03);
      for (let i = 0; i < 6; i++)
        box(
          0.075,
          0.57,
          0.87,
          i < 3 ? paint : rubber,
          side * 2.3,
          1.32,
          -2.35 + i * 0.91,
          g,
          0.02,
        );
      for (let i = 0; i < 3; i++)
        box(0.12, 0.26, 0.76, mud, side * 2.34, 0.98, -2.3 + i * 0.95, g);
      cylinder(0.26, 1.45, paint, side * 0.95, 1.86, 3.08, g, "x");
      for (const x of [side * 0.95 - 0.5, side * 0.95 + 0.5]) {
        const band = mesh(
          new T.TorusGeometry(0.265, 0.022, 6, 20),
          steel,
          x,
          1.86,
          3.08,
          g,
        );
        band.rotation.y = Math.PI / 2;
      }
      box(0.5, 0.36, 1.9, paint, side * 1.48, 1.91, 1.45, g, 0.04);
    }
    const dome = mesh(
      new T.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      paint,
      0,
      1.85,
      -0.37,
      g,
    );
    dome.scale.set(1.5, 0.72, 1.55);
    // Raised armour tiles are cosmetic geometry only.
    for (const side of [-1, 1])
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 5; i++) {
          const a = 0.23 + i * 0.255;
          const tile = box(
            0.38,
            0.2,
            0.57,
            paint,
            side * Math.sin(a) * (1.43 - row * 0.16),
            2.03 + row * 0.24,
            -0.37 - Math.cos(a) * (1.36 - row * 0.2),
            g,
            0.025,
          );
          tile.rotation.set(-0.24, side * a, side * 0.2);
        }
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 6; col++) {
        const tile = box(
          0.43,
          0.13,
          0.5,
          paint,
          (col - 2.5) * 0.48,
          1.68 + row * 0.14,
          -2.86 + row * 0.55,
          g,
          0.02,
        );
        tile.rotation.x = -0.24;
      }
    box(0.7, 0.5, 0.75, canvas, 0, 2.07, -1.85, g, 0.12);
    cylinder(0.115, 3.7, paint, 0, 2.15, -3.65, g, "z");
    cylinder(0.18, 0.7, paint, 0, 2.15, -3.35, g, "z");
    for (const z of [-2.2, -2.85, -3.9, -4.65])
      cylinder(0.135, 0.075, steel, 0, 2.15, z, g, "z");
    cylinder(0.14, 0.09, steel, 0, 2.15, -5.53, g, "z");
    cylinder(0.096, 0.01, black, 0, 2.15, -5.58, g, "z");
    for (const x of [-0.65, 0.65]) {
      cylinder(0.39, 0.13, olive, x, 2.52, -0.3, g);
      box(0.28, 0.14, 0.13, glass, x, 2.63, -0.65, g, 0.025);
      box(0.25, 0.08, 0.35, steel, x, 2.63, -0.22, g);
    }
    for (let i = 0; i < 6; i++) {
      const tube = cylinder(
        0.075,
        0.36,
        steel,
        -1.42,
        2.12,
        -0.85 + i * 0.18,
        g,
        "z",
      );
      tube.rotation.x = 0.8;
      tube.rotation.z = -0.6;
    }
    box(0.65, 0.32, 0.48, olive, 0.5, 2.51, -0.98, g, 0.06);
    box(0.29, 0.12, 0.025, glass, 0.5, 2.52, -1.23, g);
    line(
      new T.Vector3(0.9, 2.3, 0.75),
      new T.Vector3(0.97, 3.55, 0.8),
      0.014,
      steel,
      g,
    );
    // Rear deck grille, tow log and headlamps.
    for (let i = 0; i < 14; i++)
      box(1.8, 0.045, 0.055, black, 0, 1.83, 1.5 + i * 0.075, g);
    cylinder(0.18, 2.85, wood, 0, 0.75, 3.35, g, "x");
    for (const x of [-1.28, 1.28])
      cylinder(0.14, 0.12, lens, x, 1.59, -3.15, g, "z");
    bake(g);
  }
  function truck(g: T.Group) {
    // Long bonnet and three axles distinguish the Ural-style silhouette.
    box(2.15, 0.28, 7.1, steel, 0, 0.87, 0, g, 0.05);
    for (const z of [-2.55, 1.1, 2.48]) {
      cylinder(0.13, 2.7, steel, 0, 0.79, z, g, "x");
      for (const side of [-1, 1]) wheel(side * 1.32, 0.76, z, 0.76, g);
    }
    box(2.45, 1.72, 1.65, paint, 0, 2.05, -1.35, g, 0.11);
    box(2.55, 0.13, 1.77, paint, 0, 2.97, -1.34, g, 0.06);
    box(1.9, 0.84, 1.85, paint, 0, 1.89, -2.98, g, 0.13);
    box(2.65, 0.24, 0.22, steel, 0, 1.05, -4.02, g, 0.04);
    box(1.44, 0.67, 0.07, black, 0, 1.88, -3.94, g);
    for (let i = 0; i < 12; i++)
      box(0.045, 0.65, 0.04, olive, (i - 5.5) * 0.115, 1.88, -3.99, g);
    for (const side of [-1, 1]) {
      cylinder(0.19, 0.1, steel, side * 1.05, 1.76, -3.78, g, "z");
      cylinder(0.145, 0.11, lens, side * 1.05, 1.76, -3.79, g, "z");
      box(0.65, 0.13, 1.95, paint, side * 1.05, 1.66, -2.64, g, 0.07);
      box(0.98, 0.59, 0.035, glass, side * 0.53, 2.58, -2.19, g, 0.03);
      const wiper = box(0.025, 0.36, 0.025, black, side * 0.54, 2.48, -2.22, g);
      wiper.rotation.z = -0.32;
      box(0.035, 0.57, 1.03, glass, side * 1.245, 2.55, -1.37, g, 0.03);
      box(0.045, 0.7, 1.22, olive, side * 1.252, 1.83, -1.35, g, 0.03);
      box(0.06, 0.05, 0.22, steel, side * 1.29, 2.12, -0.99, g);
      box(0.42, 0.12, 0.8, steel, side * 1.33, 1.05, -1.35, g);
      line(
        new T.Vector3(side * 1.2, 2.5, -1.95),
        new T.Vector3(side * 1.65, 2.55, -2.05),
        0.025,
        steel,
        g,
      );
      box(0.2, 0.34, 0.07, glass, side * 1.66, 2.57, -2.05, g, 0.03);
      box(0.09, 0.7, 0.7, rubber, side * 1.34, 0.65, 2.98, g);
      box(0.09, 0.6, 0.7, rubber, side * 1.34, 0.65, -1.8, g);
      box(0.4, 0.55, 1.2, steel, side * 0.9, 0.88, 0.03, g, 0.08);
    }
    // Intake, exhaust, spare wheel behind the cab.
    cylinder(0.09, 1.65, steel, -1.12, 2.58, -2.15, g);
    cylinder(0.19, 0.24, black, -1.12, 3.38, -2.15, g);
    cylinder(0.055, 2.15, steel, 1.1, 2.05, -0.35, g);
    const spare = wheel(-0.9, 1.95, -0.1, 0.68, g);
    delete spare.userData.wheelRadius;
    box(2.55, 0.17, 3.8, paint, 0, 1.42, 1.36, g);
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++)
        box(
          0.07,
          0.18,
          3.75,
          paint,
          side * 1.27,
          1.57 + row * 0.2,
          1.36,
          g,
          0.015,
        );
      for (let i = 0; i < 5; i++)
        box(0.09, 0.66, 0.06, steel, side * 1.32, 1.79, -0.38 + i * 0.86, g);
    }
    // Canvas follows a squared hoop profile with a shallow crown and small folds.
    const geo = new T.BoxGeometry(2.53, 1.42, 3.76, 12, 8, 18),
      a = geo.getAttribute("position");
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i),
        y = a.getY(i),
        z = a.getZ(i);
      if (y > 0.25) a.setY(i, y - 0.2 * Math.pow(Math.abs(x) / 1.265, 3));
      if (Math.abs(x) > 1.2)
        a.setX(i, x + Math.sign(x) * Math.sin(z * 9) * 0.022 * (0.8 - y));
    }
    geo.computeVertexNormals();
    mesh(geo, canvas, 0, 2.64, 1.36, g);
    for (let i = 0; i < 5; i++) {
      const z = -0.43 + i * 0.9;
      for (const side of [-1, 1]) {
        line(
          new T.Vector3(side * 1.29, 1.96, z),
          new T.Vector3(side * 1.29, 3.11, z),
          0.014,
          olive,
          g,
        );
        const seam = (j: number) => {
          const x = side * 1.29 * (1 - j / 8);
          return new T.Vector3(
            x,
            3.38 - 0.2 * Math.pow(Math.abs(x) / 1.265, 3),
            z,
          );
        };
        for (let j = 0; j < 8; j++) line(seam(j), seam(j + 1), 0.012, olive, g);
        line(
          new T.Vector3(side * 1.3, 1.57, z),
          new T.Vector3(side * 1.3, 2.05, z),
          0.012,
          mud,
          g,
        );
      }
    }
    box(2.54, 0.62, 0.08, paint, 0, 1.77, 3.28, g);
    const flap = new T.BoxGeometry(2.53, 1.3, 0.035, 12, 1, 1);
    const flapPosition = flap.getAttribute("position");
    for (let i = 0; i < flapPosition.count; i++)
      if (flapPosition.getY(i) > 0)
        flapPosition.setY(
          i,
          0.65 - 0.2 * Math.pow(Math.abs(flapPosition.getX(i)) / 1.265, 3),
        );
    flap.computeVertexNormals();
    mesh(flap, canvas, 0, 2.67, 3.27, g);
    for (const x of [-1, 1]) box(0.18, 0.15, 0.07, red, x, 1.28, 3.32, g, 0.03);
    box(2.25, 0.17, 0.15, steel, 0, 0.99, 3.4, g);
    bake(g);
  }
  function roll(g: T.Group, distance: number) {
    for (const child of g.children)
      if (child.userData.wheelRadius)
        child.rotation.x -= distance / child.userData.wheelRadius;
  }
  return { tank, truck, roll };
}
