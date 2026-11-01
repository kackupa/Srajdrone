import { test } from "node:test";
import assert from "node:assert/strict";
import { ConvoyMission, CONVOY } from "../src/mission.ts";
test("convoy warning, arrivals and three confirmed kills complete the mission once", () => {
  const m = new ConvoyMission();
  m.tick(11);
  assert.equal(m.phase, "approach");
  m.tick(1);
  assert.equal(m.phase, "intercept");
  assert.deepEqual(
    [0, 1, 2].map((i) => m.arrival(i)),
    [12, 24, 36],
  );
  for (let i = 0; i < 3; i++) {
    m.enter(i);
    m.destroy(i);
    m.destroy(i);
  }
  assert.equal(m.destroyed, 3);
  assert.equal(m.phase, "success");
  const time = m.time,
    score = m.score(3);
  m.tick(100);
  m.escape(0);
  assert.equal(m.time, time);
  assert.equal(m.score(3), score);
  assert.ok(m.score(3) > m.score(5));
});
test("escape, time expiry and recon loss fail with no late success", () => {
  for (const cause of ["escape", "time", "recon"]) {
    const m = new ConvoyMission();
    m.enter(0);
    m.destroy(0);
    m.enter(1);
    if (cause === "escape") m.escape(1);
    else if (cause === "time") m.tick(CONVOY.limit);
    else m.fail("Recon UAV lost");
    m.enter(2);
    m.destroy(1);
    m.destroy(2);
    assert.equal(m.phase, "failure");
    assert.equal(m.destroyed, 1);
    assert.equal(m.score(1), 1000);
  }
});
test("encounter variants reverse route and vary gaps while leaving time to intercept", () => {
  for (let i = 0; i < 3; i++) {
    const m = new ConvoyMission(i);
    assert.ok(m.arrival(2) < CONVOY.limit);
    assert.ok(m.speed > 0);
  }
  assert.equal(new ConvoyMission(1).direction, -1);
});
