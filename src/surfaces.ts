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
  c.fillStyle = kind === "ground" ? "#77765b" : "#696a61";
  c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1800; i++) {
    c.fillStyle =
      kind === "ground"
        ? ["#aaa17a65", "#4d514050", "#8e785665", "#62674a50"][i % 4]
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
  if (kind === "ground") {
    // Short broken stems and leaf litter, rather than a clean flat lawn.
    for (let i = 0; i < 5000; i++) {
      const x = rnd() * 512,
        y = rnd() * 512;
      c.strokeStyle = i % 3 ? "#c0af7f55" : "#323f3270";
      c.lineWidth = 0.5 + rnd();
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (rnd() - 0.5) * 11, y + rnd() * 9);
      c.stroke();
    }
  } else {
    // Hairline asphalt fractures; no repeating painted lane stripe.
    for (let i = 0; i < 35; i++) {
      let x = rnd() * 512,
        y = rnd() * 512;
      c.strokeStyle = "#30352d65";
      c.lineWidth = 0.5 + rnd();
      c.beginPath();
      c.moveTo(x, y);
      for (let j = 0; j < 8; j++) {
        x += (rnd() - 0.5) * 24;
        y += rnd() * 10;
        c.lineTo(x, y);
      }
      c.stroke();
    }
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

export function skyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const c = canvas.getContext("2d")!,
    gradient = c.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#708792");
  gradient.addColorStop(0.42, "#a5b8bd");
  gradient.addColorStop(0.5, "#b1bfc0");
  gradient.addColorStop(1, "#b1bfc0");
  c.fillStyle = gradient;
  c.fillRect(0, 0, 1024, 512);
  let seed = 772;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  c.filter = "blur(15px)";
  for (let i = 0; i < 95; i++) {
    const x = rnd() * 1024,
      y = 65 + rnd() * 160,
      w = 25 + rnd() * 110;
    c.fillStyle = i % 3 ? "#e0e4df28" : "#5b717c18";
    for (const dx of [-1024, 0, 1024]) {
      c.beginPath();
      c.ellipse(x + dx, y, w, 8 + rnd() * 20, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.mapping = T.EquirectangularReflectionMapping;
  return texture;
}
