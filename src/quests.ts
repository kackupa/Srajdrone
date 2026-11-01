import { ConvoyMission } from "./mission";
import { CACHES, COURIER_ROUTES } from "./layout";
export type QuestKind = "convoy" | "cache" | "courier";
export const QUESTS: {
  id: QuestKind;
  title: string;
  tag: string;
  summary: string;
}[] = [
  {
    id: "convoy",
    title: "Convoy intercept",
    tag: "INTERCEPT · 2:35",
    summary:
      "Find and stop three moving vehicles before they leave the forest.",
  },
  {
    id: "cache",
    title: "Hidden arsenal",
    tag: "SEARCH + STRIKE · 5:00",
    summary:
      "Search a rough sector for a concealed weapons cache, then destroy it.",
  },
  {
    id: "courier",
    title: "Courier trail",
    tag: "IDENTIFY + FOLLOW · 6:00",
    summary:
      "Identify a courier, follow his trail and destroy the stash he leads you to.",
  },
];
export function questKind(value: string | null): QuestKind {
  return value === "cache" || value === "courier" ? value : "convoy";
}
export class QuestMission extends ConvoyMission {
  identified = false;
  trailDistance = 0;
  revealed = false;
  constructor(
    public kind: QuestKind = "convoy",
    variant = 0,
  ) {
    super(Number.isFinite(variant) ? Math.abs(Math.trunc(variant)) % 3 : 0);
    if (kind !== "convoy") this.phase = "intercept";
  }
  get title() {
    return QUESTS.find((q) => q.id === this.kind)!.title;
  }
  get cacheId() {
    return 10 + (this.variant % 3);
  }
  get courierId() {
    return 13;
  }
  get limit() {
    return this.kind === "convoy" ? 155 : this.kind === "cache" ? 300 : 360;
  }
  override get remaining() {
    return Math.max(0, this.limit - this.time);
  }
  get route() {
    return COURIER_ROUTES[this.variant % 3];
  }
  get trailLength() {
    return this.route
      .slice(1)
      .reduce(
        (d, p, i) =>
          d + Math.hypot(p.x - this.route[i].x, p.z - this.route[i].z),
        0,
      );
  }
  get stage() {
    return this.over
      ? this.phase
      : this.kind === "convoy"
        ? "intercept"
        : this.kind === "cache"
          ? "destroy"
          : !this.identified
            ? "identify"
            : !this.revealed
              ? "follow"
              : "destroy";
  }
  get sector() {
    return ["WEST WOODS", "SOUTH-EAST WOODS", "NORTH-EAST WOODS"][
      this.variant % 3
    ];
  }
  get briefing() {
    if (this.kind === "convoy")
      return "Three vehicles are approaching the main road. Find and stop all three before any escapes. A 12-second warning gives you time to search. Vehicles stay unmarked until you left-click them.";
    if (this.kind === "cache")
      return (
        "A weapons stash is reported in the " +
        this.sector.toLowerCase() +
        ". Search the amber circle for stacked crates under a green tarp, beside a fallen log. A small warm equipment box is the thermal clue. Destroy that sector's cache; other caches are optional bonuses."
      );
    return (
      "A fictional enemy courier was last seen in the " +
      this.sector.toLowerCase() +
      ". Look for an orange backpack and dark hand-carried case. Left-click him to confirm identity. Keep him alive and follow him to the stash, then find and destroy the cache. Other soldiers are not the courier."
    );
  }
  get objective() {
    if (this.kind === "convoy") return "Find and stop the convoy";
    if (this.kind === "cache") return "Find the weapons cache";
    return this.stage === "identify"
      ? "Identify the courier"
      : this.stage === "follow"
        ? "Follow the courier · keep him alive"
        : "Find and destroy his stash";
  }
  get searchArea() {
    const p =
      this.kind === "courier" && !this.revealed
        ? this.route[0]
        : CACHES[this.variant % 3];
    return {
      x: p.x + 10,
      z: p.z - 7,
      r: this.kind === "courier" && this.revealed ? 22 : 48,
    };
  }
  courierPosition() {
    let left = this.trailDistance;
    for (let i = 1; i < this.route.length; i++) {
      const a = this.route[i - 1],
        b = this.route[i],
        length = Math.hypot(b.x - a.x, b.z - a.z);
      if (left <= length) {
        const u = left / length;
        return { x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u };
      }
      left -= length;
    }
    return this.route[this.route.length - 1];
  }
  identify(id: number) {
    if (!this.over && this.kind === "courier" && id === this.courierId)
      this.identified = true;
  }
  override arrival(index: number) {
    return this.kind === "convoy" ? super.arrival(index) : Infinity;
  }
  override tick(dt: number) {
    if (this.kind === "convoy") {
      super.tick(dt);
      return;
    }
    if (this.over) return;
    this.time += dt;
    if (this.time >= this.limit) {
      this.fail("Time expired");
      return;
    }
    if (this.kind === "courier" && this.identified && !this.revealed) {
      this.trailDistance = Math.min(
        this.trailLength,
        this.trailDistance + dt * 1.6,
      );
      if (this.trailDistance >= this.trailLength) this.revealed = true;
    }
  }
  override destroyCache(id: number) {
    if (this.over) return;
    super.destroyCache(id);
    if (this.kind === "convoy" || id !== this.cacheId) return;
    if (this.kind === "courier" && !this.revealed) {
      this.fail("Stash destroyed before the courier trail was confirmed");
      return;
    }
    this.phase = "success";
    this.reason =
      this.kind === "cache"
        ? "Weapons cache destroyed"
        : "Courier trail confirmed and stash destroyed";
  }
  courierLost() {
    if (this.kind === "courier" && !this.revealed)
      this.fail("Courier lost before he revealed the stash");
  }
  override enter(index: number) {
    if (this.kind === "convoy") super.enter(index);
  }
  override destroy(index: number) {
    if (this.kind === "convoy") super.destroy(index);
  }
  override escape(index: number) {
    if (this.kind === "convoy") super.escape(index);
  }
  override score(sorties: number) {
    if (this.kind === "convoy") return super.score(sorties);
    return (
      this.cachesDestroyed * 750 +
      (this.phase === "success"
        ? 2000 + Math.ceil(this.remaining) * 5 + Math.max(0, 6 - sorties) * 100
        : 0)
    );
  }
}
