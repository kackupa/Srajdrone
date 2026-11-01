import { test } from "node:test";
import assert from "node:assert/strict";
import { vehicleSees, evadeOffset } from "../src/battle.ts";
import { LAUNCH, groundHeight, reserved, TRENCHES } from "../src/layout.ts";
import { boxContact } from "../src/flight.ts";
test("vehicle front visibility rotates with road and travel direction", () => {
  const p = { x: 0, y: 0, z: 0 };
  assert.equal(vehicleSees(p, { x: 0, y: 5, z: -50 }, "z", -1), true);
  assert.equal(vehicleSees(p, { x: 0, y: 5, z: 50 }, "z", -1), false);
  assert.equal(vehicleSees(p, { x: 50, y: 5, z: 0 }, "x", 1), true);
  assert.equal(vehicleSees(p, { x: -50, y: 5, z: 0 }, "x", 1), false);
});
test("trucks dodge faster, both stay in road bounds and recover their lane", () => {
  const truck = evadeOffset(0, 0, 1, true, true, 0.5, 5),
    tank = evadeOffset(0, 0, 1, true, false, 0.5, 5);
  assert.ok(truck > tank);
  assert.ok(evadeOffset(4.9, 3.3, 1, true, true, 10, 5) <= 5);
  assert.equal(evadeOffset(5, 3.3, 1, false, true, 10, 5), 3.3);
});
test("launch is reserved off road and trench floor is genuinely recessed", () => {
  assert.ok(Math.abs(LAUNCH.x) > 30);
  assert.ok(reserved(LAUNCH.x, LAUNCH.z));
  assert.equal(groundHeight(LAUNCH.x, LAUNCH.z), 0);
  for (const t of TRENCHES) assert.equal(groundHeight(t.x, t.z), -t.depth);
  assert.equal(groundHeight(0, 0), 0);
});
test("fast flight hits a thin shelter wall without tunneling", () => {
  assert.equal(
    boxContact(
      { x: -20, y: 1, z: 0 },
      { x: 20, y: 1, z: 0 },
      { x: -0.5, y: 0, z: -3 },
      { x: 0.5, y: 3, z: 3 },
    ),
    0.4875,
  );
  assert.equal(
    boxContact(
      { x: -20, y: 5, z: 0 },
      { x: 20, y: 5, z: 0 },
      { x: -0.5, y: 0, z: -3 },
      { x: 0.5, y: 3, z: 3 },
    ),
    null,
  );
});
