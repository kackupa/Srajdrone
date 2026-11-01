export const CONVOY = { count: 3, warning: 12, limit: 155 };
export type VehicleState = "waiting" | "active" | "destroyed" | "escaped";
export type MissionPhase = "approach" | "intercept" | "success" | "failure";
export class ConvoyMission {
  time = 0;
  phase: MissionPhase = "approach";
  vehicles: VehicleState[] = ["waiting", "waiting", "waiting"];
  reason = "";
  constructor(public variant = 0) {}
  get direction() {
    return this.variant % 2 ? -1 : 1;
  }
  get gap() {
    return [12, 15, 10][this.variant % 3];
  }
  get speed() {
    return [4.2, 4, 4.5][this.variant % 3];
  }
  get over() {
    return this.phase === "success" || this.phase === "failure";
  }
  get destroyed() {
    return this.vehicles.filter((v) => v === "destroyed").length;
  }
  get remaining() {
    return Math.max(0, CONVOY.limit - this.time);
  }
  arrival(index: number) {
    return CONVOY.warning + index * this.gap;
  }
  tick(dt: number) {
    if (this.over) return;
    this.time += dt;
    if (this.time >= CONVOY.warning) this.phase = "intercept";
    if (this.time >= CONVOY.limit) this.fail("Time expired");
  }
  enter(index: number) {
    if (!this.over && this.vehicles[index] === "waiting")
      this.vehicles[index] = "active";
  }
  destroy(index: number) {
    if (this.over || this.vehicles[index] !== "active") return;
    this.vehicles[index] = "destroyed";
    if (this.destroyed === CONVOY.count) {
      this.phase = "success";
      this.reason = "All convoy vehicles stopped";
    }
  }
  escape(index: number) {
    if (this.over || this.vehicles[index] !== "active") return;
    this.vehicles[index] = "escaped";
    this.fail("A convoy vehicle escaped");
  }
  fail(reason: string) {
    if (!this.over) {
      this.phase = "failure";
      this.reason = reason;
    }
  }
  score(sorties: number) {
    return (
      this.destroyed * 1000 +
      (this.phase === "success"
        ? Math.ceil(this.remaining) * 10 + Math.max(0, 6 - sorties) * 150
        : 0)
    );
  }
}
