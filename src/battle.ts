import type { V } from "./flight";
// Deliberately fictional arcade values, tuned for readable warnings and short sorties.
export const BATTLE = {
  orbitHeight: 155,
  orbitRadius: 175,
  orbitSpeed: 11,
  manualGrace: 0.65,
  enemyCeiling: 68,
  enemyRange: 125,
  spotSeconds: 1.15,
  forgetSeconds: 0.6,
  bulletSpeed: 100,
  fpvHealth: 100,
  reconHealth: 100,
  reentryDelay: 5,
};
export function orbitVelocity(p: V): V {
  const r = Math.hypot(p.x, p.z),
    nx = r > 0.01 ? p.x / r : 0,
    nz = r > 0.01 ? p.z / r : 1;
  const correction = Math.max(
    -10,
    Math.min(10, (BATTLE.orbitRadius - r) * 0.3),
  );
  return {
    x: nz * BATTLE.orbitSpeed + nx * correction,
    y: Math.max(-18, Math.min(18, (BATTLE.orbitHeight - p.y) * 0.55)),
    z: -nx * BATTLE.orbitSpeed + nz * correction,
  };
}
export function awareness(
  previous: number,
  visible: boolean,
  dt: number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      previous +
        (visible ? dt / BATTLE.spotSeconds : -dt / BATTLE.forgetSeconds),
    ),
  );
}
export function inEnvelope(shooter: V, drone: V): boolean {
  return (
    drone.y < BATTLE.enemyCeiling &&
    Math.hypot(drone.x - shooter.x, drone.y - shooter.y, drone.z - shooter.z) <
      BATTLE.enemyRange
  );
}
export function trafficStep(
  at: number,
  direction: number,
  speed: number,
  dt: number,
) {
  const next = at + direction * speed * dt;
  return { next, exited: direction > 0 ? next > 265 : next < -265 };
}
export function patrolAt(time: number, phase: number) {
  return Math.sin(time * 0.22 + phase) * 12;
}

export function vehicleSees(
  from: V,
  to: V,
  axis: "x" | "z",
  direction: number,
): boolean {
  const dx = to.x - from.x,
    dz = to.z - from.z,
    length = Math.hypot(dx, dz);
  return length < 2 || ((axis === "x" ? dx : dz) * direction) / length > 0.2;
}
export function evadeOffset(
  current: number,
  base: number,
  side: number,
  active: boolean,
  truck: boolean,
  dt: number,
  limit: number,
) {
  const desired = active
    ? Math.max(-limit, Math.min(limit, base + side * (truck ? 3.5 : 2)))
    : base;
  const step = (truck ? 4 : 1.4) * dt;
  return current + Math.max(-step, Math.min(step, desired - current));
}
