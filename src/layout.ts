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
  return t ? -t.depth : 0;
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
    PILLBOXES.some((t) => Math.hypot(x - t.x, z - t.z) < 11)
  );
}
