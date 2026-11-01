import * as T from "three";
import { createVehicles } from "./vehicles";
type Mat = (color: number, hot?: boolean) => T.MeshStandardMaterial;
export function createModels(mat: Mat) {
  const rubber = mat(0x252b27, true),
    steel = mat(0x394139, true),
    canvas = mat(0x687050, true),
    webbing = mat(0x414735, true),
    uniform = mat(0x6e7254, true),
    skin = mat(0xa58d70, true),
    ally = mat(0x526c4e, true);
  const blue = new T.MeshBasicMaterial({ color: 0x78dfff });
  function mesh(
    g: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D,
  ) {
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  const box = (
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    p: T.Object3D,
  ) => mesh(new T.BoxGeometry(w, h, d), m, x, y, z, p);
  function soldier(g: T.Group, friendly = false) {
    const cloth = friendly ? ally : uniform,
      legs: T.Mesh[] = [];
    const torso = mesh(
      new T.CapsuleGeometry(0.25, 0.45, 3, 6),
      cloth,
      0,
      1.25,
      0,
      g,
    );
    torso.scale.set(1.35, 1, 0.85);
    box(0.61, 0.58, 0.24, webbing, 0, 1.3, -0.2, g);
    for (const x of [-0.2, 0, 0.2])
      box(0.16, 0.22, 0.13, cloth, x, 1.22, -0.38, g);
    box(0.49, 0.58, 0.3, webbing, 0, 1.32, 0.3, g);
    box(0.48, 0.18, 0.25, canvas, 0, 1.05, 0.36, g);
    mesh(new T.SphereGeometry(0.23, 8, 6), skin, 0, 1.96, -0.02, g);
    mesh(
      new T.SphereGeometry(0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.57),
      cloth,
      0,
      2.01,
      0,
      g,
    );
    box(0.46, 0.09, 0.15, cloth, 0, 2, -0.19, g);
    for (const side of [-1, 1]) {
      const leg = mesh(
        new T.CylinderGeometry(0.14, 0.12, 0.8, 7),
        cloth,
        side * 0.2,
        0.4,
        0,
        g,
      );
      legs.push(leg);
      box(0.24, 0.22, 0.37, rubber, 0, -0.29, -0.07, leg);
      const arm = mesh(
        new T.CapsuleGeometry(0.12, 0.4, 2, 6),
        cloth,
        side * 0.4,
        1.3,
        -0.07,
        g,
      );
      arm.rotation.z = side * 0.2;
      mesh(new T.SphereGeometry(0.12, 6, 4), skin, side * 0.46, 1.02, -0.15, g);
      if (friendly) box(0.27, 0.13, 0.29, blue, side * 0.4, 1.47, -0.07, g);
    }
    if (friendly) box(0.42, 0.08, 0.25, steel, 0, 1.05, -0.4, g);
    return legs;
  }
  return { ...createVehicles(mat), soldier };
}
