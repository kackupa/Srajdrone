import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import {
  groundHeight,
  terrainHeight,
  TRENCHES,
  LAUNCH,
  CACHES,
  PILLBOXES,
  OFFICER_PATROLS,
} from "../src/layout.ts";
import { groundContact } from "../src/flight.ts";
import { terrainMeshes } from "../src/terrain.ts";
test("rolling terrain preserves roads, launch and objective clearings", () => {
  for (let z = -230; z <= 230; z += 5) assert.equal(terrainHeight(0, z), 0);
  for (let x = -230; x <= 230; x += 5) assert.equal(terrainHeight(x, -55), 0);
  for (const p of [LAUNCH, ...CACHES, ...PILLBOXES, ...OFFICER_PATROLS.flat()])
    assert.equal(terrainHeight(p.x, p.z), 0);
  let max = 0;
  for (let x = -230; x < 230; x += 8)
    for (let z = -230; z < 230; z += 8) {
      const h = groundHeight(x, z);
      assert.ok(Number.isFinite(h));
      max = Math.max(max, h);
    }
  assert.ok(max > 12);
  for (const t of TRENCHES) assert.equal(groundHeight(t.x, t.z), -t.depth);
});
test("terrain sweep catches horizontal rise and intermediate hill with clear endpoints", () => {
  const hill = (x: number) => 5 * Math.exp(-x * x);
  const a = { x: -4, y: 2, z: 0 },
    b = { x: 4, y: 2, z: 0 };
  const hit = groundContact(a, b, hill);
  assert.ok(hit !== null && hit > 0 && hit < 0.5);
  assert.equal(groundContact({ ...a, y: 8 }, { ...b, y: 8 }, hill), null);
  assert.equal(
    groundContact({ x: 0, y: 0.45, z: 0 }, { x: 2, y: 0.45, z: 0 }, () => 0),
    null,
  );
  assert.ok(
    groundContact({ x: 0, y: 3, z: 0 }, { x: 0, y: -2, z: 0 }, () => 0)! < 1,
  );
});
test("rendered terrain vertices use the collision height field and leave trench openings", () => {
  const chunks = terrainMeshes(new T.MeshBasicMaterial());
  for (const mesh of chunks) {
    const p = mesh.geometry.getAttribute("position"),
      index = mesh.geometry.index!;
    for (let i = 0; i < p.count; i += 37)
      assert.ok(
        Math.abs(p.getY(i) - terrainHeight(p.getX(i), p.getZ(i))) < 0.0001,
      );
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
      const x = ids.reduce((n, j) => n + p.getX(j), 0) / 3,
        z = ids.reduce((n, j) => n + p.getZ(j), 0) / 3;
      assert.ok(
        !TRENCHES.some(
          (t) =>
            Math.abs(x - t.x) < t.w / 2 - 1e-5 &&
            Math.abs(z - t.z) < t.d / 2 - 1e-5,
        ),
      );
    }
  }
});

test("accelerated ground rays agree with ordinary mesh intersections", () => {
  const chunks = terrainMeshes(new T.MeshBasicMaterial());
  for (const [x, y, z, dx, dy, dz] of [
    [-130, 60, 90, 0, -1, 0],
    [-52, 50, 12, 0, -1, 0],
    [35, 30, 20, 1, -0.4, 0],
    [-140, 18, 150, 1, -0.1, -1],
  ]) {
    const ray = new T.Raycaster(
      new T.Vector3(x, y, z),
      new T.Vector3(dx, dy, dz).normalize(),
      0,
      500,
    );
    const fast: T.Intersection[] = [],
      reference: T.Intersection[] = [];
    for (const mesh of chunks) {
      mesh.raycast(ray, fast);
      T.Mesh.prototype.raycast.call(mesh, ray, reference);
    }
    fast.sort((a, b) => a.distance - b.distance);
    reference.sort((a, b) => a.distance - b.distance);
    const unique = (hits: T.Intersection[]) =>
      hits
        .filter(
          (h, i) =>
            i === 0 || Math.abs(h.distance - hits[i - 1].distance) > 1e-6,
        )
        .map((h) => h.distance);
    const actual = unique(fast),
      expected = unique(reference);
    assert.equal(actual.length, expected.length);
    actual.forEach((d, i) => assert.ok(Math.abs(d - expected[i]) < 1e-6));
    if (fast.length)
      assert.ok(Math.abs(fast[0].distance - reference[0].distance) < 0.00001);
  }
});
