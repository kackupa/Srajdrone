import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BATTERY,
  drainBattery,
  batteryLevel,
  clockText,
} from "../src/battery.ts";
test("normal and boosted budgets are bounded and frame-rate independent", () => {
  for (const hz of [20, 60, 144]) {
    let remaining = BATTERY.capacity;
    for (let i = 0; i < hz * 30; i++)
      remaining = drainBattery(remaining, 1 / hz, false);
    assert.ok(Math.abs(remaining - 30) < 1e-8);
    for (let i = 0; i < hz * 10; i++)
      remaining = drainBattery(remaining, 1 / hz, true);
    assert.ok(Math.abs(remaining - 12) < 1e-8);
    assert.equal(drainBattery(remaining, 20, true), 0);
  }
});
test("warning thresholds and countdown never display negative time", () => {
  assert.equal(batteryLevel(15.01), "normal");
  assert.equal(batteryLevel(15), "low");
  assert.equal(batteryLevel(7), "critical");
  assert.equal(clockText(60), "01:00");
  assert.equal(clockText(0.1), "00:01");
  assert.equal(clockText(0), "00:00");
  assert.equal(clockText(-5), "00:00");
});
