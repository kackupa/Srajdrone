import * as T from "three";
import { CACHES, HIDEOUTS, reserved } from "./layout";
type MaterialFactory = (color: number, hot?: boolean) => T.MeshStandardMaterial;
export function buildUnderstory(scene: T.Scene, mat: MaterialFactory) {
  const vision: T.Object3D[] = [],
    solids: T.Mesh[] = [];
  const colors = [mat(0x384c2d), mat(0x4c6137), mat(0x687341)],
    wood = mat(0x443c2c),
    soil = mat(0x5c6543);
  const rows: T.Matrix4[][] = [[], [], []],
    grass: T.Matrix4[] = [];
  const dummy = new T.Object3D();
  let seed = 1587;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function shrub(x: number, z: number, size = 1) {
    for (let i = 0; i < 3; i++) {
      dummy.position.set(
        x + (rand() - 0.5) * 1.8,
        (0.7 + rand() * 0.45) * size,
        z + (rand() - 0.5) * 1.8,
      );
      dummy.scale.set(
        (1.1 + rand()) * size,
        (0.8 + rand() * 0.6) * size,
        (1 + rand()) * size,
      );
      dummy.rotation.set(rand() * 0.4, rand() * Math.PI, rand() * 0.3);
      dummy.updateMatrix();
      rows[i].push(dummy.matrix.clone());
    }
  }
  // Scattered low vegetation leaves roads, launch and existing fortifications accessible.
  for (let i = 0; i < 700; i++) {
    const x = (rand() - 0.5) * 450,
      z = (rand() - 0.5) * 450;
    if (Math.abs(x) < 12 || Math.abs(z + 55) < 10 || reserved(x, z)) continue;
    shrub(x, z, 0.65 + rand() * 0.7);
    dummy.position.set(x + 3, 0.4, z);
    dummy.rotation.set(0, rand() * Math.PI, 0);
    dummy.scale.set(1.5, 0.8, 1.5);
    dummy.updateMatrix();
    grass.push(dummy.matrix.clone());
  }
  function solid(
    w: number,
    h: number,
    d: number,
    x: number,
    z: number,
    m: T.Material,
    rotation = 0,
  ) {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    mesh.position.set(x, h / 2, z);
    mesh.rotation.y = rotation;
    scene.add(mesh);
    solids.push(mesh);
    return mesh;
  }
  // U-shaped thickets have open centres and exits; solid banks and logs are deliberate obstacles.
  for (const h of HIDEOUTS) {
    for (let i = -2; i <= 2; i++) {
      shrub(h.x + i * 2.5, h.z - 6, 1.8);
      shrub(h.x - 6, h.z + i * 2.5, 1.6);
    }
    solid(10, 1.7, 1.5, h.x, h.z - 8, soil);
    const log = solid(8, 0.85, 0.9, h.x + 2, h.z + 6, wood, 0.2);
    const rings = new T.Mesh(new T.CircleGeometry(0.37, 8), mat(0x8f8060));
    rings.position.set(log.position.x + 4, 0.45, log.position.z);
    rings.rotation.y = Math.PI / 2;
    rings.raycast = () => {};
    scene.add(rings);
  }
  // Caches have partial foliage screening with a clear approach on their south side.
  for (const c of CACHES) {
    shrub(c.x - 4.5, c.z, 1.5);
    shrub(c.x + 4.5, c.z - 2, 1.6);
    shrub(c.x, c.z - 4.8, 1.6);
    solid(6, 0.65, 0.7, c.x, c.z - 6, wood);
  }
  for (let i = 0; i < 3; i++) {
    const bush = new T.InstancedMesh(
      new T.IcosahedronGeometry(1, 1),
      colors[i],
      rows[i].length,
    );
    rows[i].forEach((matrix, j) => bush.setMatrixAt(j, matrix));
    scene.add(bush);
    vision.push(bush);
  }
  const blades = new T.InstancedMesh(
    new T.ConeGeometry(1, 1, 3),
    colors[1],
    grass.length,
  );
  grass.forEach((matrix, i) => blades.setMatrixAt(i, matrix));
  blades.raycast = () => {};
  scene.add(blades);
  return { vision, solids };
}
