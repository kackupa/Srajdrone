import * as T from "three";
export function surfaceTexture(kind: "ground" | "road") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d")!;
  let seed = kind === "ground" ? 924 : 551;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  c.fillStyle = kind === "ground" ? "#687252" : "#626761";
  c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1800; i++) {
    c.fillStyle =
      kind === "ground"
        ? ["#7c805c35", "#3d513c30", "#9a8c6430", "#4d604538"][i % 4]
        : ["#a2a39918", "#303d3220", "#737c7020"][i % 3];
    c.beginPath();
    c.ellipse(
      rnd() * 512,
      rnd() * 512,
      3 + rnd() * 30,
      2 + rnd() * 18,
      rnd() * Math.PI,
      0,
      Math.PI * 2,
    );
    c.fill();
  }
  for (let i = 0; i < 18000; i++) {
    c.fillStyle = i % 2 ? "#ffffff12" : "#18271d20";
    c.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(kind === "ground" ? 0.045 : 2, kind === "ground" ? 0.045 : 80);
  tex.anisotropy = 4;
  return tex;
}
// Jagged branch tiers retain the existing tree size and collision envelope.
export function pineCrown() {
  const v: number[] = [];
  for (let tier = 0; tier < 4; tier++) {
    const y = -0.5 + tier * 0.23,
      r = 1 - tier * 0.21,
      h = 0.48 - tier * 0.05;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        b = ((i + 1) * Math.PI) / 6,
        ra = r * (i % 2 ? 0.84 : 1),
        rb = r * (i % 2 ? 1 : 0.84);
      v.push(
        0,
        y + h,
        0,
        Math.sin(a) * ra,
        y,
        Math.cos(a) * ra,
        Math.sin(b) * rb,
        y,
        Math.cos(b) * rb,
      );
      v.push(
        0,
        y - 0.05,
        0,
        Math.sin(b) * rb,
        y,
        Math.cos(b) * rb,
        Math.sin(a) * ra,
        y,
        Math.cos(a) * ra,
      );
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}
export function leafCrown() {
  const positions: number[] = [];
  for (const [x, y, z, r] of [
    [0, 0, 0, 0.72],
    [-0.38, 0.02, 0.05, 0.58],
    [0.38, 0.12, 0.1, 0.56],
    [0, 0.12, -0.4, 0.57],
    [0.05, -0.08, 0.4, 0.6],
  ]) {
    const part = new T.IcosahedronGeometry(r, 1),
      a = part.getAttribute("position");
    for (let i = 0; i < a.count; i++)
      positions.push(a.getX(i) + x, (a.getY(i) + y) * 0.5, a.getZ(i) + z);
    part.dispose();
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
}
