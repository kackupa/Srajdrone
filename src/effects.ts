import * as T from "three";
type Particle = {
  mesh: T.Mesh;
  velocity: T.Vector3;
  age: number;
  life: number;
  grow: number;
  gravity: number;
};
export class BattleEffects {
  private particles: Particle[] = [];
  private wrecks: {
    p: T.Vector3;
    age: number;
    emit: number;
    fireLife: number;
    smokeLife: number;
    cache: boolean;
  }[] = [];
  private sphere = new T.IcosahedronGeometry(1, 1);
  private chip = new T.BoxGeometry(1, 1, 1);
  private ring = new T.RingGeometry(0.8, 1, 32);
  constructor(private scene: T.Scene) {}
  get count() {
    return this.particles.length;
  }
  private add(
    p: T.Vector3,
    velocity: T.Vector3,
    color: number,
    size: number,
    life: number,
    grow: number,
    gravity = 0,
    shape: T.BufferGeometry = this.sphere,
  ) {
    if (this.particles.length >= 240) return;
    const material = new T.MeshBasicMaterial({
      color,
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
    });
    const mesh = new T.Mesh(shape, material);
    mesh.position.copy(p);
    mesh.scale.setScalar(size);
    mesh.raycast = () => {}; // Cosmetic effects cannot intercept aim or collision rays.
    this.scene.add(mesh);
    this.particles.push({ mesh, velocity, age: 0, life, grow, gravity });
    return mesh;
  }
  burst(p: T.Vector3, kind = "drone") {
    const cache = kind === "cache";
    const heavy =
      cache || kind === "tank" || kind === "truck" || kind === "pillbox";
    const scale = cache ? 3.8 : heavy ? 2 : 0.8;
    for (let i = 0; i < (heavy ? 38 : 16); i++) {
      const v = new T.Vector3(
        (Math.random() - 0.5) * 22,
        Math.random() * 17 + 3,
        (Math.random() - 0.5) * 22,
      );
      this.add(
        p,
        v,
        i % 3 ? 0xffb34c : 0x373d39,
        (0.15 + Math.random() * 0.45) * scale,
        1.2 + Math.random() * 1.8,
        0,
        13,
        this.chip,
      );
    }
    this.add(p, new T.Vector3(0, 2, 0), 0xffd382, scale, 0.38, 14);
    this.add(p, new T.Vector3(0, 3, 0), 0xf66b26, scale * 0.8, 0.65, 8);
    for (let i = 0; i < 8; i++)
      this.add(
        p,
        new T.Vector3(
          (Math.random() - 0.5) * 6,
          3 + Math.random() * 4,
          (Math.random() - 0.5) * 6,
        ),
        0x454b46,
        scale,
        3.5,
        1.3,
      );
    const ring = this.add(
      new T.Vector3(p.x, 0.15, p.z),
      new T.Vector3(),
      0xb9ae8c,
      1,
      0.8,
      24,
      0,
      this.ring,
    );
    if (ring) ring.rotation.x = -Math.PI / 2;
    if (heavy)
      this.wrecks.push({
        p: p.clone(),
        age: 0,
        emit: 0,
        fireLife: cache ? 180 : 14,
        smokeLife: cache ? 180 : 40,
        cache,
      });
  }
  get burningCaches() {
    return this.wrecks.filter((w) => w.cache && w.age < w.fireLife).length;
  }
  update(dt: number) {
    if (dt <= 0) return;
    for (const w of this.wrecks) {
      w.age += dt;
      w.emit -= dt;
      if (w.age < w.smokeLife && w.emit <= 0) {
        w.emit = 0.3;
        this.add(w.p, new T.Vector3(0.7, 2.4, 0.3), 0x353b38, 1.1, 5, 0.65);
        if (w.age < w.fireLife) {
          const flame = w.p
            .clone()
            .add(
              new T.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2,
              ),
            );
          this.add(
            flame,
            new T.Vector3(0, w.cache ? 3 : 1.8, 0),
            0xff8b32,
            w.cache ? 1.2 : 0.65,
            w.cache ? 1.2 : 0.6,
            1,
          );
          if (w.cache)
            this.add(flame, new T.Vector3(0, 2, 0), 0xffdb75, 0.5, 0.65, 0.8);
        }
      }
    }
    this.wrecks = this.wrecks.filter((w) => w.age < w.smokeLife);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      p.velocity.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.mesh.scale.addScalar(p.grow * dt);
      if (p.gravity) {
        p.mesh.rotation.x += dt * 4;
        p.mesh.rotation.z += dt * 2;
      }
      (p.mesh.material as T.MeshBasicMaterial).opacity = Math.max(
        0,
        1 - p.age / p.life,
      );
      if (p.age >= p.life) {
        this.scene.remove(p.mesh);
        (p.mesh.material as T.Material).dispose();
        this.particles.splice(i, 1);
      }
    }
  }
}
