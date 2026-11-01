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
test("courier quest requires identification, a completed trail and the correct cache", () => {
  const m = new QuestMission("courier");
  m.identify(4);
  m.tick(10);
  assert.equal(m.stage, "identify");
  assert.equal(m.trailDistance, 0);
  m.identify(13);
  assert.equal(m.stage, "follow");
  m.tick(1);
  assert.ok(m.trailDistance > 0);
  assert.equal(m.revealed, false);
  m.tick(m.trailLength / 1.6);
  assert.equal(m.stage, "destroy");
  assert.deepEqual(m.courierPosition(), m.route[m.route.length - 1]);
  m.destroyCache(11);
  assert.equal(m.over, false);
  m.courierLost();
  assert.equal(m.over, false);
  m.destroyCache(10);
  assert.equal(m.phase, "success");
});
test("lost courier, premature destruction and timeout cannot become late successes", () => {
  for (const cause of ["courier", "cache", "timeout"]) {
    const m = new QuestMission("courier");
    if (cause === "courier") m.courierLost();
    else if (cause === "cache") m.destroyCache(10);
    else m.tick(360);
    m.identify(13);
    m.tick(100);
    m.destroyCache(10);
    assert.equal(m.phase, "failure");
    assert.equal(m.identified, false);
  }
  const m = new QuestMission("cache");
  m.tick(300);
  assert.equal(m.phase, "failure");
});
test("quest variants have contained search targets and reserved courier paths", () => {
  for (let v = 0; v < 3; v++) {
    const m = new QuestMission("courier", v);
    const a = m.searchArea,
      start = m.route[0];
    assert.ok(Math.hypot(a.x - start.x, a.z - start.z) < a.r);
    m.identify(13);
    for (let i = 0; i < 100; i++) {
      m.tick(0.4);
      const p = m.courierPosition();
      assert.ok(reserved(p.x, p.z));
    }
    assert.equal(m.cacheId, 10 + v);
  }
  assert.equal(questKind("invalid"), "convoy");
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

test("quest variants normalize malformed and out-of-range URL values", () => {
  for (const value of [NaN, Infinity, -Infinity, -4, 8.8]) {
    const m = new QuestMission("courier", value);
    assert.ok(m.variant >= 0 && m.variant < 3);
    assert.ok(m.route.length > 1);
    assert.ok(Number.isFinite(m.searchArea.x));
  }
});
