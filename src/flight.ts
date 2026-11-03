export type V = { x: number; y: number; z: number };
export const FLIGHT = {
  speed: 36,
  boost: 58,
  response: 14,
  brake: 19,
  radius: 0.45,
  limit: 235,
};
export function steer(v: V, wanted: V, dt: number): V {
  const k =
    1 -
    Math.exp(
      -(Math.hypot(wanted.x, wanted.y, wanted.z) < 0.01
        ? FLIGHT.brake
        : FLIGHT.response) * dt,
    );
  return {
    x: v.x + (wanted.x - v.x) * k,
    y: v.y + (wanted.y - v.y) * k,
    z: v.z + (wanted.z - v.z) * k,
  };
}
// Earliest segment/sphere contact, including a segment starting inside a collider.
export function contact(a: V, b: V, c: V, r: number): number | null {
  const x = a.x - c.x,
    y = a.y - c.y,
    z = a.z - c.z,
    dx = b.x - a.x,
    dy = b.y - a.y,
    dz = b.z - a.z;
  const C = x * x + y * y + z * z - r * r;
  if (C <= 0) return 0;
  const A = dx * dx + dy * dy + dz * dz;
  if (A < 1e-12) return null;
  const B = 2 * (x * dx + y * dy + z * dz),
    D = B * B - 4 * A * C;
  if (D < 0) return null;
  const t = (-B - Math.sqrt(D)) / (2 * A);
  return t >= 0 && t <= 1 ? t : null;
}

export function movingContact(a: V, b: V, from: V, to: V, r: number) {
  return contact(
    { x: a.x - from.x, y: a.y - from.y, z: a.z - from.z },
    { x: b.x - to.x, y: b.y - to.y, z: b.z - to.z },
    { x: 0, y: 0, z: 0 },
    r,
  );
}

export function boxContact(a: V, b: V, min: V, max: V): number | null {
  let lo = 0,
    hi = 1;
  for (const axis of ["x", "y", "z"] as const) {
    const d = b[axis] - a[axis];
    if (Math.abs(d) < 1e-9) {
      if (a[axis] < min[axis] || a[axis] > max[axis]) return null;
      continue;
    }
    let p = (min[axis] - a[axis]) / d,
      q = (max[axis] - a[axis]) / d;
    if (p > q) [p, q] = [q, p];
    lo = Math.max(lo, p);
    hi = Math.min(hi, q);
    if (lo > hi) return null;
  }
  return lo;
}

// Sweep against the same height field used for rendering, including horizontal
// flight into slopes. Sampling is finer than terrain features; bisect first hit.
export function groundContact(
  a: V,
  b: V,
  height: (x: number, z: number) => number,
  r = 0.45,
): number | null {
  const steps = Math.max(
    1,
    Math.ceil(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / 0.5),
  );
  const clearance = (t: number) =>
    a.y +
    (b.y - a.y) * t -
    height(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) -
    r;
  let previous = 0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    if (clearance(t) < -1e-5) {
      let lo = previous,
        hi = t;
      for (let j = 0; j < 12; j++) {
        const m = (lo + hi) / 2;
        if (clearance(m) < 0) hi = m;
        else lo = m;
      }
      return hi;
    }
    previous = t;
  }
  return null;
}
