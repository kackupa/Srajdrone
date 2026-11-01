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
