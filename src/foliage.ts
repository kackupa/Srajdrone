import * as T from "three";

// Original hand-drawn branch atlases. Alpha masks remain in thermal, while
// painted colour is removed; foliage never becomes a solid square in that view.
const cache = new Map<
  string,
  { map: T.CanvasTexture; mask: T.CanvasTexture }
>();
export function foliageMaterial(
  m: T.MeshStandardMaterial,
  kind: "pine" | "leaf",
) {
  // Geometry-only rule tests run without a browser canvas.
  if (typeof document === "undefined") return m;
  let atlas = cache.get(kind);
  if (!atlas) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const c = canvas.getContext("2d")!;
    let seed = kind === "pine" ? 818 : 621;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    c.strokeStyle = "#615b46";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(256, 503);
    c.lineTo(251, 22);
    c.stroke();
    for (let i = 0; i < 40; i++) {
      const y = 45 + i * 10.6,
        side = i % 2 ? -1 : 1;
      const reach =
        kind === "pine"
          ? 22 + y * 0.43
          : 65 + Math.sin((i / 40) * Math.PI) * 150;
      const ex = 256 + side * reach,
        ey = y - 25 - rnd() * 24;
      c.strokeStyle = "#605f45";
      c.lineWidth = 1.5 + y / 160;
      c.beginPath();
      c.moveTo(256, y + 22);
      c.lineTo(ex, ey);
      c.stroke();
      for (let j = 0; j < 50; j++) {
        const u = rnd(),
          x = 256 + (ex - 256) * u,
          by = y + 22 + (ey - y - 22) * u;
        const yy = by + (rnd() - 0.5) * (kind === "pine" ? 30 : 64);
        c.fillStyle = ["#536449", "#71805a", "#8c9567", "#455d49", "#a09b6d"][
          j % 5
        ];
        c.beginPath();
        c.ellipse(
          x + (rnd() - 0.5) * 18,
          yy,
          kind === "pine" ? 9 : 7 + rnd() * 8,
          kind === "pine" ? 2 : 3 + rnd() * 4,
          side * -0.5 + rnd(),
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    }
    const mask = document.createElement("canvas");
    mask.width = mask.height = 512;
    const mc = mask.getContext("2d")!;
    mc.drawImage(canvas, 0, 0);
    mc.globalCompositeOperation = "source-in";
    mc.fillStyle = "white";
    mc.fillRect(0, 0, 512, 512);
    // alphaMap reads green; make transparent texels explicitly black.
    mc.globalCompositeOperation = "destination-over";
    mc.fillStyle = "black";
    mc.fillRect(0, 0, 512, 512);
    const map = new T.CanvasTexture(canvas),
      alpha = new T.CanvasTexture(mask);
    map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = alpha.anisotropy = 4;
    atlas = { map, mask: alpha };
    cache.set(kind, atlas);
  }
  m.map = atlas.map;
  m.alphaMap = atlas.mask;
  m.userData.sensorMap = atlas.map;
  m.alphaTest = 0.32;
  m.side = T.DoubleSide;
  m.flatShading = false;
  return m;
}

// Several intersecting branch planes retain volume from above and at ground level.
export function branchCards(broad = false) {
  const positions: number[] = [],
    uv: number[] = [];
  const add = (a: T.Vector3, b: T.Vector3, c: T.Vector3, d: T.Vector3) => {
    for (const p of [a, b, c, a, c, d]) positions.push(p.x, p.y, p.z);
    uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  };
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4,
      x = Math.cos(a),
      z = Math.sin(a);
    add(
      new T.Vector3(-x, -0.5, -z),
      new T.Vector3(x, -0.5, z),
      new T.Vector3(x, 0.5, z),
      new T.Vector3(-x, 0.5, -z),
    );
  }
  // Sloping branches supply foliage coverage from the orbiting recon camera.
  for (let i = 0; i < 3; i++) {
    const y = -0.3 + i * 0.26,
      r = broad ? 0.85 : 1 - i * 0.22;
    add(
      new T.Vector3(-r, y, -r),
      new T.Vector3(r, y, -r),
      new T.Vector3(r, y + 0.2, r),
      new T.Vector3(-r, y + 0.2, r),
    );
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

export function barkTexture(birch = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 512;
  const c = canvas.getContext("2d")!;
  c.fillStyle = birch ? "#a2a69a" : "#817363";
  c.fillRect(0, 0, 128, 512);
  let seed = 914;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 1600; i++) {
    c.fillStyle = i % 3 ? (birch ? "#42473b88" : "#3b382c70") : "#c4b79b55";
    c.fillRect(
      rnd() * 128,
      rnd() * 512,
      birch ? 2 + rnd() * 22 : 1 + rnd() * 3,
      birch ? 1 + rnd() * 4 : 4 + rnd() * 45,
    );
  }
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  map.wrapS = map.wrapT = T.RepeatWrapping;
  map.anisotropy = 4;
  return map;
}

export function grassBlades() {
  const positions: number[] = [],
    colors: number[] = [];
  let seed = 71;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 18; i++) {
    const x = (rnd() - 0.5) * 1.7,
      z = (rnd() - 0.5) * 1.7,
      h = 0.35 + rnd() * 0.65;
    const angle = rnd() * Math.PI,
      w = 0.018 + rnd() * 0.025,
      dx = Math.cos(angle) * w,
      dz = Math.sin(angle) * w;
    const bendX = (rnd() - 0.5) * 0.3,
      bendZ = (rnd() - 0.5) * 0.3;
    const a = [x - dx, -0.5, z - dz],
      b = [x + dx, -0.5, z + dz];
    const c = [
      x + dx * 0.4 + bendX * 0.4,
      -0.5 + h * 0.65,
      z + dz * 0.4 + bendZ * 0.4,
    ];
    const d = [
      x - dx * 0.4 + bendX * 0.4,
      -0.5 + h * 0.65,
      z - dz * 0.4 + bendZ * 0.4,
    ];
    const tip = [x + bendX, -0.5 + h, z + bendZ],
      tint = new T.Color([0x999568, 0xb3aa79, 0x76805a, 0x89845f][i % 4]);
    for (const p of [a, b, c, a, c, d, d, c, tip]) {
      positions.push(...p);
      colors.push(tint.r, tint.g, tint.b);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
