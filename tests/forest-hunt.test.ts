import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { reconOrbit, BATTLE } from "../src/battle.ts";
import { CACHES, HIDEOUTS, LAUNCH, reserved } from "../src/layout.ts";
import { buildUnderstory } from "../src/understory.ts";
import { ConvoyMission } from "../src/mission.ts";
import { BattleEffects } from "../src/effects.ts";
test("fixed recon orbit keeps exact height and radius throughout the operation", () => {
  for (let time = 0; time < 3600; time += 0.37) {
    const p = reconOrbit(time);
    assert.equal(p.y, BATTLE.orbitHeight);
    assert.ok(Math.abs(Math.hypot(p.x, p.z) - BATTLE.orbitRadius) < 1e-9);
  }
  assert.notDeepEqual(reconOrbit(0), reconOrbit(10));
});
test("cache bonuses count once and never substitute for convoy objectives", () => {
  const m = new ConvoyMission();
  m.destroyCache(10);
  m.destroyCache(10);
  m.destroyCache(11);
  assert.equal(m.cachesDestroyed, 2);
  assert.equal(m.score(1), 1500);
  assert.equal(m.destroyed, 0);
  assert.equal(m.over, false);
  m.fail("Time expired");
  m.destroyCache(12);
  assert.equal(m.cachesDestroyed, 2);
});
test("cache fire outlasts ordinary wreck flames, freezes when paused and remains bounded", () => {
  const scene = new T.Scene(),
    fx = new BattleEffects(scene);
  fx.burst(new T.Vector3(), "cache");
  const before = fx.count;
  fx.update(0);
  assert.equal(fx.count, before);
  for (let i = 0; i < 1200; i++) fx.update(0.05);
  assert.equal(fx.burningCaches, 1);
  assert.ok(fx.count > 0 && fx.count <= 240);
  fx.update(190);
  assert.equal(fx.burningCaches, 0);
  assert.equal(fx.count, 0);
});
test("thickets obscure sight at low altitude while solid cover leaves an open centre", () => {
  const scene = new T.Scene();
  const foliage = buildUnderstory(
    scene,
    (color) => new T.MeshStandardMaterial({ color }),
  );
  scene.updateMatrixWorld(true);
  const h = HIDEOUTS[0];
  const ray = new T.Raycaster(
    new T.Vector3(h.x, 2.5, h.z - 14),
    new T.Vector3(0, 0, 1),
    0,
    16,
  );
  assert.ok(ray.intersectObjects(foliage.vision, false).length > 0);
  assert.equal(ray.intersectObjects(foliage.solids, false).length, 0);
  for (const o of foliage.solids) {
    const bounds = new T.Box3().setFromObject(o).expandByScalar(0.45);
    assert.equal(bounds.containsPoint(new T.Vector3(h.x, 1.2, h.z)), false);
    assert.equal(
      bounds.containsPoint(new T.Vector3(LAUNCH.x, LAUNCH.y, LAUNCH.z)),
      false,
    );
  }
  for (const c of CACHES) assert.equal(reserved(c.x, c.z), true);
});
