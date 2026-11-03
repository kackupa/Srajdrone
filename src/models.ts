import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { weatherTexture } from "./fortifications";
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
  for (const m of [uniform, ally, canvas, webbing]) {
    m.map = weatherTexture(m === uniform || m === ally ? "uniform" : "cloth");
    m.userData.sensorMap = m.map;
    m.flatShading = false;
  }
  skin.flatShading = false;
  rubber.flatShading = false;
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
  ) =>
    mesh(
      new RoundedBoxGeometry(w, h, d, 2, Math.min(0.04, w / 4, h / 4, d / 4)),
      m,
      x,
      y,
      z,
      p,
    );
  function soldier(g: T.Group, friendly = false) {
    const cloth = friendly ? ally : uniform,
      legs: T.Mesh[] = [];
    const torso = mesh(
      new T.CapsuleGeometry(0.25, 0.45, 5, 12),
      cloth,
      0,
      1.25,
      0,
      g,
    );
    torso.scale.set(1.35, 1, 0.85);
    const hips = mesh(new T.SphereGeometry(0.25, 12, 8), cloth, 0, 0.87, 0, g);
    hips.scale.set(1.25, 0.7, 0.9);
    mesh(new T.CylinderGeometry(0.1, 0.12, 0.2, 10), skin, 0, 1.7, 0, g);
    box(0.61, 0.58, 0.24, webbing, 0, 1.3, -0.2, g);
    for (const x of [-0.2, 0, 0.2])
      box(0.16, 0.22, 0.13, cloth, x, 1.22, -0.38, g);
    box(0.49, 0.58, 0.3, webbing, 0, 1.32, 0.3, g);
    box(0.48, 0.18, 0.25, canvas, 0, 1.05, 0.36, g);
    mesh(new T.SphereGeometry(0.19, 12, 8), skin, 0, 1.86, -0.02, g);
    mesh(
      new T.SphereGeometry(0.245, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.57),
      cloth,
      0,
      1.92,
      0,
      g,
    );
    box(0.4, 0.065, 0.14, cloth, 0, 1.92, -0.18, g);
    box(0.32, 0.09, 0.08, steel, 0, 1.86, -0.19, g);
    box(0.07, 0.23, 0.08, webbing, -0.2, 1.82, 0, g);
    box(0.07, 0.23, 0.08, webbing, 0.2, 1.82, 0, g);
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
      const joint = (from: T.Vector3, to: T.Vector3, r: number) => {
        const delta = to.clone().sub(from),
          o = mesh(
            new T.CapsuleGeometry(
              r,
              Math.max(0.01, delta.length() - r * 2),
              4,
              10,
            ),
            cloth,
            0,
            0,
            0,
            g,
          );
        o.position.copy(from).add(to).multiplyScalar(0.5);
        o.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          delta.normalize(),
        );
      };
      const shoulder = new T.Vector3(side * 0.34, 1.5, 0),
        elbow = new T.Vector3(side * 0.41, 1.12, -0.08),
        hand = new T.Vector3(side * 0.13, 1.2, -0.4);
      joint(shoulder, elbow, 0.105);
      joint(elbow, hand, 0.09);
      mesh(new T.SphereGeometry(0.09, 8, 6), skin, hand.x, hand.y, hand.z, g);
      box(0.18, 0.24, 0.08, webbing, side * 0.2, 0.49, -0.12, g);
      box(0.08, 0.44, 0.05, webbing, side * 0.23, 1.47, -0.25, g);
      if (friendly) box(0.27, 0.13, 0.29, blue, side * 0.4, 1.47, -0.07, g);
    }
    if (friendly) box(0.42, 0.08, 0.25, steel, 0, 1.05, -0.4, g);
    return legs;
  }
  return { ...createVehicles(mat), soldier };
}
