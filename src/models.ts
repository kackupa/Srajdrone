import * as T from "three";
type Mat = (color: number, hot?: boolean) => T.MeshStandardMaterial;
export function createModels(mat: Mat) {
  const armor = mat(0x58604a, true),
    panel = mat(0x747963, true),
    rubber = mat(0x252b27, true),
    steel = mat(0x394139, true),
    glass = mat(0x243f42),
    canvas = mat(0x687050, true),
    webbing = mat(0x414735, true),
    uniform = mat(0x6e7254, true),
    skin = mat(0xa58d70, true),
    ally = mat(0x526c4e, true),
    pale = mat(0xb2ad83, true),
    lamps = mat(0xd9c896, true);
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
  function bevel(
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    p: T.Object3D,
  ) {
    const geo = new T.BoxGeometry(w, h, d),
      a = geo.getAttribute("position");
    for (let i = 0; i < a.count; i++)
      if (a.getY(i) > 0) {
        a.setX(i, a.getX(i) * 0.82);
        a.setZ(i, a.getZ(i) * 0.86);
      }
    geo.computeVertexNormals();
    return mesh(geo, m, x, y, z, p);
  }
  function wheel(x: number, z: number, p: T.Group, r = 0.67) {
    const tyre = mesh(
      new T.CylinderGeometry(r, r, 0.38, 12),
      rubber,
      x,
      r,
      z,
      p,
    );
    tyre.rotation.z = Math.PI / 2;
    const hub = mesh(
      new T.CylinderGeometry(r * 0.45, r * 0.45, 0.4, 8),
      steel,
      x,
      r,
      z,
      p,
    );
    hub.rotation.z = Math.PI / 2;
    const cap = mesh(
      new T.CylinderGeometry(r * 0.16, r * 0.16, 0.43, 8),
      panel,
      x,
      r,
      z,
      p,
    );
    cap.rotation.z = Math.PI / 2;
  }
  function tank(g: T.Group) {
    bevel(3.9, 1.05, 6.2, armor, 0, 1.25, 0, g);
    box(3.8, 0.22, 6.5, panel, 0, 1.8, 0, g);
    const nose = box(3.6, 0.2, 1.5, armor, 0, 1.5, -2.55, g);
    nose.rotation.x = -0.25;
    for (const side of [-1, 1]) {
      box(0.72, 1.25, 6.5, rubber, side * 1.95, 0.72, 0, g);
      for (let i = 0; i < 6; i++) wheel(side * 2.18, -2.45 + i * 0.98, g, 0.55);
      box(0.65, 0.2, 6.7, armor, side * 2, 1.46, 0, g);
      for (let i = 0; i < 6; i++)
        box(0.13, 0.17, 0.75, steel, side * 2.35, 1.08, -2.5 + i, g);
      for (let i = 0; i < 3; i++)
        box(
          0.13,
          0.65,
          1.7,
          i % 2 ? panel : armor,
          side * 2.36,
          1.22,
          -1.9 + i * 1.9,
          g,
        );
    }
    const turret = mesh(
      new T.CylinderGeometry(1.26, 1.6, 0.86, 8),
      armor,
      0,
      2.35,
      -0.15,
      g,
    );
    turret.scale.z = 1.32;
    bevel(1.5, 0.6, 0.75, panel, 0, 2.33, -1.7, g);
    const barrel = mesh(
      new T.CylinderGeometry(0.14, 0.18, 3.45, 10),
      armor,
      0,
      2.35,
      -3.42,
      g,
    );
    barrel.rotation.x = Math.PI / 2;
    const tip = mesh(
      new T.CylinderGeometry(0.21, 0.21, 0.42, 10),
      steel,
      0,
      2.35,
      -5.03,
      g,
    );
    tip.rotation.x = Math.PI / 2;
    for (const x of [-0.65, 0.65])
      mesh(
        new T.CylinderGeometry(0.43, 0.43, 0.12, 10),
        panel,
        x,
        2.85,
        -0.15,
        g,
      );
    box(0.55, 0.2, 0.4, glass, 0.65, 2.98, -0.5, g);
    box(1.1, 0.55, 0.55, webbing, -1.1, 2.12, 1.3, g);
    box(1.8, 0.35, 0.55, canvas, 0.3, 2.1, 1.75, g);
    for (const x of [-1, 1]) box(0.025, 1.1, 0.025, steel, x, 3.25, 0.9, g);
    box(0.55, 0.04, 0.8, pale, 0, 2.81, 0.5, g);
    for (const x of [-1.4, 1.4]) box(0.28, 0.18, 0.1, lamps, x, 1.5, -3.28, g);
  }
  function truck(g: T.Group) {
    box(2.65, 0.38, 6.4, steel, 0, 0.85, 0, g);
    bevel(2.9, 1.85, 2.1, armor, 0, 1.95, -1.88, g);
    box(2.8, 0.65, 1.05, armor, 0, 1.65, -3, g);
    box(3.05, 0.2, 0.2, steel, 0, 0.95, -3.62, g);
    for (const x of [-0.68, 0.68]) {
      box(1.18, 0.65, 0.07, glass, x, 2.38, -2.96, g);
      box(0.42, 0.27, 0.08, lamps, x * 1.75, 1.43, -3.56, g);
    }
    for (let i = 0; i < 4; i++)
      box(1.25, 0.06, 0.05, rubber, 0, 1.45 + i * 0.12, -3.55, g);
    for (const side of [-1, 1]) {
      box(0.06, 0.65, 0.85, glass, side * 1.45, 2.38, -1.92, g);
      box(0.08, 0.12, 0.45, steel, side * 1.48, 1.65, -1.5, g);
      box(0.35, 0.15, 0.65, steel, side * 1.6, 0.9, -1.5, g);
      box(0.06, 0.5, 0.06, steel, side * 1.65, 2.1, -2.65, g);
      box(0.2, 0.35, 0.12, glass, side * 1.72, 2.34, -2.65, g);
      for (const z of [-2.3, 0.8, 2.25]) wheel(side * 1.5, z, g);
      box(0.25, 0.15, 2.9, armor, side * 1.65, 1.45, 1.5, g);
    }
    box(3.1, 0.8, 3.7, armor, 0, 1.45, 1.12, g);
    const roof = mesh(
      new T.CylinderGeometry(
        1.55,
        1.55,
        3.7,
        10,
        1,
        false,
        -Math.PI / 2,
        Math.PI,
      ),
      canvas,
      0,
      1.85,
      1.12,
      g,
    );
    roof.rotation.x = -Math.PI / 2;
    for (const z of [-0.55, 0.55, 1.65, 2.75]) {
      const rib = mesh(
        new T.CylinderGeometry(
          1.57,
          1.57,
          0.06,
          10,
          1,
          true,
          -Math.PI / 2,
          Math.PI,
        ),
        webbing,
        0,
        1.85,
        z,
        g,
      );
      rib.rotation.x = -Math.PI / 2;
      for (const x of [-1.58, 1.58])
        box(0.04, 0.85, 0.07, webbing, x, 1.46, z, g);
    }
    box(3, 0.15, 0.15, steel, 0, 1.1, 3.1, g);
    for (const x of [-1.2, 1.2]) box(0.2, 0.18, 0.06, pale, x, 1.23, 3.03, g);
    box(0.025, 1.1, 0.025, steel, -1.2, 3.05, -1.35, g);
  }
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
  return { tank, truck, soldier };
}
