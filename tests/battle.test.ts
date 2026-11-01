import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BATTLE,
  orbitVelocity,
  awareness,
  inEnvelope,
  trafficStep,
} from "../src/battle.ts";
test("orbit remains high and bounded over multiple circuits", () => {
  let p = { x: 0, y: 155, z: 175 };
  for (let i = 0; i < 18000; i++) {
    const v = orbitVelocity(p);
    p = { x: p.x + v.x / 60, y: p.y + v.y / 60, z: p.z + v.z / 60 };
  }
  assert.ok(Math.abs(Math.hypot(p.x, p.z) - 175) < 1);
  assert.equal(p.y, 155);
});
test("autopilot recovers manual altitude and offset continuously", () => {
  let p = { x: 220, y: 20, z: 0 };
  for (let i = 0; i < 2400; i++) {
    const v = orbitVelocity(p);
    assert.ok(Math.abs(v.y) <= 18);
    p = { x: p.x + v.x / 60, y: p.y + v.y / 60, z: p.z + v.z / 60 };
  }
  assert.ok(p.y > 154);
  assert.ok(Math.abs(Math.hypot(p.x, p.z) - 175) < 1);
});
test("cover breaks tracking and prevents instant reacquisition", () => {
  let a = 0;
  for (let i = 0; i < 70; i++) a = awareness(a, true, 1 / 60);
  assert.equal(a, 1);
  for (let i = 0; i < 40; i++) a = awareness(a, false, 1 / 60);
  assert.equal(a, 0);
  assert.ok(awareness(a, true, 0.1) < 1);
});
test("high orbit is safe; low nearby drones can be spotted", () => {
  assert.equal(
    inEnvelope({ x: 0, y: 2, z: 0 }, { x: 0, y: BATTLE.orbitHeight, z: 0 }),
    false,
  );
  assert.equal(inEnvelope({ x: 0, y: 2, z: 0 }, { x: 0, y: 15, z: 30 }), true);
  assert.equal(
    inEnvelope({ x: 0, y: 2, z: 0 }, { x: 200, y: 15, z: 30 }),
    false,
  );
});
test("traffic exits in both directions without wrapping inside the map", () => {
  assert.equal(trafficStep(230, 1, 8, 1).exited, false);
  assert.equal(trafficStep(264, 1, 8, 1).exited, true);
  assert.equal(trafficStep(-264, -1, 8, 1).exited, true);
  assert.equal(trafficStep(0, -1, 8, 1).next, -8);
});
