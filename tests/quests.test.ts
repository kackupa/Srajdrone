import { test } from "node:test";
import assert from "node:assert/strict";
import { QuestMission, questKind } from "../src/quests.ts";
import { reserved } from "../src/layout.ts";

test("cache quest ignores convoy arrivals and requires the selected stash", () => {
  const m = new QuestMission("cache", 1);
  assert.equal(m.arrival(0), Infinity);
  m.enter(0);
  m.escape(0);
  assert.equal(m.phase, "intercept");
  m.destroyCache(10);
  assert.equal(m.over, false);
  assert.equal(m.cachesDestroyed, 1);
  m.destroyCache(11);
  assert.equal(m.phase, "success");
  const points = m.score(2);
  m.destroyCache(11);
  m.tick(999);
  assert.equal(m.score(2), points);
  assert.equal(m.cachesDestroyed, 2);
});
test("officer quest requires identification and a hit on that officer", () => {
  const m = new QuestMission("officer");
  assert.equal(m.objectiveId, 13);
  m.identify(4);
  m.destroyOfficer(4);
  m.tick(10);
  assert.equal(m.stage, "identify");
  m.identify(13);
  assert.equal(m.stage, "strike");
  assert.equal(m.over, false);
  m.destroyOfficer(7);
  assert.equal(m.over, false);
  m.destroyOfficer(13);
  assert.equal(m.phase, "success");
  const score = m.score(1),
    position = m.officerPosition();
  m.destroyOfficer(13);
  m.tick(100);
  assert.equal(m.score(1), score);
  assert.deepEqual(m.officerPosition(), position);
});
test("caches are optional bonuses and never replace the officer objective", () => {
  const m = new QuestMission("officer");
  m.destroyCache(m.cacheId);
  assert.equal(m.phase, "intercept");
  assert.equal(m.identified, false);
  assert.equal(m.score(1), 750);
  m.identify(13);
  m.destroyCache(11);
  assert.equal(m.stage, "strike");
  m.destroyOfficer(13);
  assert.equal(m.phase, "success");
  assert.equal(m.cachesDestroyed, 2);
});
test("premature officer strike and timeout cannot become late successes", () => {
  for (const cause of ["strike", "timeout"]) {
    const m = new QuestMission("officer");
    if (cause === "strike") m.destroyOfficer(13);
    else m.tick(360);
    assert.equal(m.phase, "failure");
    m.identify(13);
    m.destroyOfficer(13);
    m.destroyCache(10);
    assert.equal(m.phase, "failure");
    assert.equal(m.identified, false);
    assert.equal(m.cachesDestroyed, 0);
  }
  const cache = new QuestMission("cache");
  cache.tick(300);
  assert.equal(cache.phase, "failure");
});
test("officer patrols move before identification and stay in reserved search areas", () => {
  for (let v = 0; v < 3; v++) {
    const m = new QuestMission("officer", v),
      area = m.searchArea,
      start = m.officerPosition();
    m.tick(3);
    assert.notDeepEqual(m.officerPosition(), start);
    for (let i = 0; i < 600; i++) {
      m.tick(0.4);
      const p = m.officerPosition();
      assert.ok(reserved(p.x, p.z));
      assert.ok(Math.hypot(p.x - area.x, p.z - area.z) < area.r);
    }
    assert.equal(m.identified, false);
    assert.equal(m.cacheId, 10 + v);
  }
});
test("convoy quest keeps original completion and escape rules", () => {
  const m = new QuestMission("convoy");
  assert.equal(m.arrival(0), 12);
  for (let i = 0; i < 3; i++) {
    m.enter(i);
    m.destroy(i);
  }
  assert.equal(m.phase, "success");
  assert.equal(m.destroyed, 3);
  const failure = new QuestMission("convoy");
  failure.enter(0);
  failure.escape(0);
  assert.equal(failure.phase, "failure");
});
test("quest URLs normalize legacy person links and malformed variants", () => {
  assert.equal(questKind("courier"), "officer");
  assert.equal(questKind("officer"), "officer");
  assert.equal(questKind("invalid"), "convoy");
  for (const value of [NaN, Infinity, -Infinity, -4, 8.8]) {
    const m = new QuestMission("officer", value);
    assert.ok(m.variant >= 0 && m.variant < 3);
    assert.ok(m.route.length > 1);
    assert.ok(Number.isFinite(m.searchArea.x));
  }
});
