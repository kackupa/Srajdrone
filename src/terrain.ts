import * as T from "three";
import { TRENCHES, terrainHeight } from "./layout";

// Chunked ground keeps camera/weapon raycasts bounded. Every trench edge is an
// explicit grid coordinate, so the surface and excavated openings agree.
export function terrainMeshes(material: T.Material) {
  const meshes: T.Mesh[] = [];
  for (let ox = -768; ox < 768; ox += 128)
    for (let oz = -768; oz < 768; oz += 128) {
      const step = Math.abs(ox + 64) < 320 && Math.abs(oz + 64) < 320 ? 4 : 16;
      const xs = new Set<number>(),
        zs = new Set<number>();
      for (let n = 0; n <= 128; n += step) {
        xs.add(ox + n);
        zs.add(oz + n);
      }
      for (const t of TRENCHES) {
        for (const x of [t.x - t.w / 2, t.x + t.w / 2])
          if (x > ox && x < ox + 128) xs.add(x);
        for (const z of [t.z - t.d / 2, t.z + t.d / 2])
          if (z > oz && z < oz + 128) zs.add(z);
      }
      const xx = [...xs].sort((a, b) => a - b),
        zz = [...zs].sort((a, b) => a - b);
      const p: number[] = [],
        uv: number[] = [],
        indices: number[] = [];
      for (const z of zz)
        for (const x of xx) {
          p.push(x, terrainHeight(x, z), z);
          uv.push(x, -z);
        }
      for (let z = 0; z < zz.length - 1; z++)
        for (let x = 0; x < xx.length - 1; x++) {
          const cx = (xx[x] + xx[x + 1]) / 2,
            cz = (zz[z] + zz[z + 1]) / 2;
          if (
            TRENCHES.some(
              (t) =>
                Math.abs(cx - t.x) < t.w / 2 && Math.abs(cz - t.z) < t.d / 2,
            )
          )
            continue;
          const a = z * xx.length + x,
            b = a + 1,
            c = a + xx.length,
            d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(p, 3));
      g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      g.setIndex(indices);
      g.computeVertexNormals();
      g.computeBoundingSphere();
      const mesh = new T.Mesh(g, material);
      mesh.receiveShadow = true;
      accelerateTerrain(mesh);
      meshes.push(mesh);
    }
  return meshes;
}

type Node = { box: T.Box3; triangles?: number[]; left?: Node; right?: Node };
function accelerateTerrain(mesh: T.Mesh) {
  const g = mesh.geometry,
    p = g.getAttribute("position"),
    index = g.index!;
  const vertices = [new T.Vector3(), new T.Vector3(), new T.Vector3()];
  const read = (i: number, target: T.Vector3) =>
    target.fromBufferAttribute(p, index.getX(i));
  function build(ids: number[], depth = 0): Node {
    const box = new T.Box3();
    for (const id of ids)
      for (let j = 0; j < 3; j++) box.expandByPoint(read(id + j, vertices[j]));
    box.expandByScalar(1e-6);
    if (ids.length <= 24) return { box, triangles: ids };
    const axis = depth % 2 === 0 ? "x" : "z";
    const centre = (id: number) => {
      let v = 0;
      for (let j = 0; j < 3; j++)
        v +=
          axis === "x"
            ? p.getX(index.getX(id + j))
            : p.getZ(index.getX(id + j));
      return v;
    };
    ids.sort((a, b) => centre(a) - centre(b));
    const middle = Math.floor(ids.length / 2);
    return {
      box,
      left: build(ids.slice(0, middle), depth + 1),
      right: build(ids.slice(middle), depth + 1),
    };
  }
  const root = build(Array.from({ length: index.count / 3 }, (_, i) => i * 3)),
    hit = new T.Vector3();
  // Terrain vertices are in world coordinates and these static root meshes never move.
  mesh.raycast = (raycaster, hits) => {
    const ray = raycaster.ray;
    function visit(node: Node) {
      if (!ray.intersectsBox(node.box)) return;
      if (node.triangles)
        for (const id of node.triangles) {
          for (let j = 0; j < 3; j++) read(id + j, vertices[j]);
          if (
            ray.intersectTriangle(
              vertices[0],
              vertices[1],
              vertices[2],
              true,
              hit,
            )
          ) {
            const distance = ray.origin.distanceTo(hit);
            if (distance >= raycaster.near && distance <= raycaster.far)
              hits.push({
                distance,
                point: hit.clone(),
                object: mesh,
                faceIndex: id / 3,
              });
          }
        }
      else {
        visit(node.left!);
        visit(node.right!);
      }
    }
    visit(root);
  };
}
