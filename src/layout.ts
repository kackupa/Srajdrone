export const CACHES = [
  { x: -72, z: 80 },
  { x: 46, z: 115 },
  { x: 112, z: -125 },
];
// Clear narrow walking corridors for the officer search quests.
export const OFFICER_PATROLS = CACHES.map((c) => [
  { x: c.x + 38, z: c.z + 12 },
  { x: c.x + 20, z: c.z + 10 },
  { x: c.x + 5, z: c.z + 5 },
]);
function officerCorridor(x: number, z: number) {
  return OFFICER_PATROLS.some((route) =>
    route.slice(1).some((b, i) => {
      const a = route[i],
        dx = b.x - a.x,
        dz = b.z - a.z;
      const u = Math.max(
        0,
        Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)),
      );
      return Math.hypot(x - a.x - u * dx, z - a.z - u * dz) < 2.7;
    }),
  );
}
export const HIDEOUTS = [
  { x: -78, z: 125 },
  { x: 30, z: 60 },
  { x: 43, z: -85 },
  { x: -80, z: -105 },
];
export const LAUNCH = { x: -100, y: 1.2, z: 165 };
export const TRENCHES = [
  { x: -112, z: 170, w: 4, d: 22, depth: 1.4 },
  { x: -52, z: 12, w: 4, d: 42, depth: 1.4 },
  { x: 65, z: -105, w: 34, d: 4, depth: 1.4 },
];
export const PILLBOXES = [
  { x: -52, z: -16 },
  { x: 87, z: -105 },
];
export function groundHeight(x: number, z: number) {
  const t = TRENCHES.find(
    (t) => Math.abs(x - t.x) < t.w / 2 && Math.abs(z - t.z) < t.d / 2,
  );
  return t ? -t.depth : terrainHeight(x, z);
}
export function reserved(x: number, z: number) {
  return (
    officerCorridor(x, z) ||
    CACHES.some((c) => Math.hypot(x - c.x, z - c.z) < 8) ||
    HIDEOUTS.some((h) => Math.abs(x - h.x) < 10 && Math.abs(z - h.z) < 10) ||
    (Math.abs(x + 108) < 23 && Math.abs(z - 170) < 25) ||
    TRENCHES.some(
      (t) => Math.abs(x - t.x) < t.w / 2 + 6 && Math.abs(z - t.z) < t.d / 2 + 6,
    ) ||
    PILLBOXES.some((t) => Math.hypot(x - t.x, z - t.z) < 15)
  );
}

export const CRATERS = [
  { x: -34, z: 46, r: 5 },
  { x: -92, z: -40, r: 6 },
  { x: 42, z: 15, r: 4 },
  { x: 132, z: 66, r: 6 },
  { x: -146, z: 98, r: 5 },
  { x: 142, z: -166, r: 7 },
];
const smooth = (n: number) => {
  const t = Math.max(0, Math.min(1, n));
  return t * t * (3 - 2 * t);
};
function rectDistance(
  x: number,
  z: number,
  cx: number,
  cz: number,
  w: number,
  d: number,
) {
  return Math.hypot(
    Math.max(0, Math.abs(x - cx) - w),
    Math.max(0, Math.abs(z - cz) - d),
  );
}
export function terrainHeight(x: number, z: number) {
  let clearance = Math.min(
    Math.max(0, Math.abs(x) - 12),
    Math.max(0, Math.abs(z + 55) - 8),
    rectDistance(x, z, -108, 170, 26, 28),
  );
  for (const t of TRENCHES)
    clearance = Math.min(
      clearance,
      rectDistance(x, z, t.x, t.z, t.w / 2 + 5, t.d / 2 + 5),
    );
  for (const p of [...CACHES, ...PILLBOXES])
    clearance = Math.min(
      clearance,
      Math.max(0, Math.hypot(x - p.x, z - p.z) - 11),
    );
  for (const h of HIDEOUTS)
    clearance = Math.min(clearance, rectDistance(x, z, h.x, h.z, 11, 11));
  for (const route of OFFICER_PATROLS)
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1],
        b = route[i],
        dx = b.x - a.x,
        dz = b.z - a.z;
      const u = Math.max(
        0,
        Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)),
      );
      clearance = Math.min(
        clearance,
        Math.max(0, Math.hypot(x - a.x - u * dx, z - a.z - u * dz) - 4),
      );
    }
  const mask = smooth(clearance / 16);
  if (mask === 0) return 0;
  let h =
    8 +
    4.5 * Math.sin(x * 0.026) +
    3.5 * Math.sin(z * 0.032 + 1) +
    2.2 * Math.sin((x + z) * 0.046);
  for (const c of CRATERS) {
    const r = Math.hypot(x - c.x, z - c.z) / c.r;
    h -= 2.2 * Math.exp(-r * r * 2.5);
    h += 0.65 * Math.exp(-Math.pow((r - 1.05) * 5, 2));
  }
  return h * mask;
}
