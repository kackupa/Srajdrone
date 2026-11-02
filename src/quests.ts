import { ConvoyMission } from "./mission";
import { CACHES, OFFICER_PATROLS } from "./layout";
export type QuestKind = "convoy" | "cache" | "officer";
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
    id: "officer",
    title: "Officer hunt",
    tag: "IDENTIFY + STRIKE · 6:00",
    summary: "Identify a fictional enemy officer, then launch an FPV strike.",
  },
];
export function questKind(value: string | null): QuestKind {
  // Preserve links to the person quest from the previous prototype.
  return value === "officer" || value === "courier"
    ? "officer"
    : value === "cache"
      ? "cache"
      : "convoy";
}
export class QuestMission extends ConvoyMission {
  identified = false;
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
    return 10 + this.variant;
  }
  get officerId() {
    return 13;
  }
  get objectiveId() {
    return this.kind === "convoy"
      ? null
      : this.kind === "officer"
        ? this.officerId
        : this.cacheId;
  }
  get limit() {
    return this.kind === "convoy" ? 155 : this.kind === "cache" ? 300 : 360;
  }
  override get remaining() {
    return Math.max(0, this.limit - this.time);
  }
  get route() {
    return OFFICER_PATROLS[this.variant];
  }
  get stage() {
    return this.over
      ? this.phase
      : this.kind === "convoy"
        ? "intercept"
        : this.kind === "cache"
          ? "destroy"
          : this.identified
            ? "strike"
            : "identify";
  }
  get sector() {
    return ["WEST WOODS", "SOUTH-EAST WOODS", "NORTH-EAST WOODS"][this.variant];
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
      "A fictional enemy officer is patrolling the " +
      this.sector.toLowerCase() +
      ". Look for red shoulder panels and a dark map case. Use normal vision and zoom to check the clues, then left-click him to confirm identity. Once confirmed, launch an FPV and destroy that officer. Other soldiers and caches do not complete this quest. Striking him before identification fails the mission."
    );
  }
  get objective() {
    if (this.kind === "convoy") return "Find and stop the convoy";
    if (this.kind === "cache") return "Find the weapons cache";
    return this.identified
      ? "Launch FPV · strike the officer"
      : "Find and identify the officer";
  }
  get searchArea() {
    const p = this.kind === "officer" ? this.route[0] : CACHES[this.variant];
    return { x: p.x + 10, z: p.z - 7, r: 48 };
  }
  officerPosition() {
    const a = this.route[0],
      b = this.route[1],
      length = Math.hypot(b.x - a.x, b.z - a.z);
    const leg = ((this.time * 1.15) / length) % 2,
      u = leg <= 1 ? leg : 2 - leg;
    return { x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u };
  }
  identify(id: number) {
    if (!this.over && this.kind === "officer" && id === this.officerId)
      this.identified = true;
  }
  destroyOfficer(id: number) {
    if (this.over || this.kind !== "officer" || id !== this.officerId) return;
    if (!this.identified) {
      this.fail("Officer struck before identity was confirmed");
      return;
    }
    this.phase = "success";
    this.reason = "Identified officer destroyed";
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
    if (this.time >= this.limit) this.fail("Time expired");
  }
  override destroyCache(id: number) {
    if (this.over) return;
    super.destroyCache(id);
    if (this.kind === "cache" && id === this.cacheId) {
      this.phase = "success";
      this.reason = "Weapons cache destroyed";
    }
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
