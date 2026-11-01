import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { BattleEffects } from "../src/effects.ts";
test("destruction effects stay bounded, ignore aim rays and clean up", () => {
  const scene = new T.Scene(),
    fx = new BattleEffects(scene);
  for (let i = 0; i < 8; i++) fx.burst(new T.Vector3(0, 0, -10), "tank");
  assert.ok(fx.count > 0 && fx.count <= 240);
  const ray = new T.Raycaster(new T.Vector3(0, 0, 0), new T.Vector3(0, 0, -1));
  scene.updateMatrixWorld(true);
  assert.equal(ray.intersectObjects(scene.children, true).length, 0);
  fx.update(100);
  assert.equal(fx.count, 0);
  assert.equal(scene.children.length, 0);
});
