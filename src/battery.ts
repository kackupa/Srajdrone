// Fictional arcade balance: seconds of normal-power flight, not real hardware endurance.
export const BATTERY = { capacity: 60, boostDrain: 1.8, low: 15, critical: 7 };
export function drainBattery(
  remaining: number,
  dt: number,
  boosting: boolean,
): number {
  return Math.max(
    0,
    remaining - Math.max(0, dt) * (boosting ? BATTERY.boostDrain : 1),
  );
}
export function batteryLevel(remaining: number): "normal" | "low" | "critical" {
  return remaining <= BATTERY.critical
    ? "critical"
    : remaining <= BATTERY.low
      ? "low"
      : "normal";
}
export function clockText(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return (
    String(Math.floor(whole / 60)).padStart(2, "0") +
    ":" +
    String(whole % 60).padStart(2, "0")
  );
}
