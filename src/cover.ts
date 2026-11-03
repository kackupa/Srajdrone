import * as T from "three";
// Invisible, spatially grouped cover volumes. Rays reject distant cells before
// visiting individual trees; dense forest visuals remain a few instanced draws.
export function coverInstances(
  scene: T.Scene,
  geometry: T.BufferGeometry,
  matrices: T.Matrix4[],
) {
  const cells = new Map<string, T.Matrix4[]>(),
    material = new T.MeshBasicMaterial({ visible: false });
  for (const m of matrices) {
    const x = m.elements[12],
      z = m.elements[14];
    if (Math.abs(x) > 250 || Math.abs(z) > 250) continue;
    const key = Math.floor(x / 48) + ":" + Math.floor(z / 48);
    const list = cells.get(key) || [];
    list.push(m);
    cells.set(key, list);
  }
  return [...cells.values()].map((list) => {
    const mesh = new T.InstancedMesh(geometry, material, list.length);
    list.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.computeBoundingSphere();
    scene.add(mesh);
    return mesh;
  });
}
