import * as THREE from "three";

const BLEED = 0.001;
const CORNERS = [
  [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
];

const createTile = ({
  index,
  material,
  tilesize
}: {
  index: number;
  material: THREE.MeshBasicMaterial;
  tilesize: number;
}) => {
  const geometry = new THREE.PlaneGeometry(1, 1);

  const columns = material.map.image.width / tilesize;
  const rows = material.map.image.height / tilesize;

  const size = new THREE.Vector2(
    1 / columns - BLEED * 2,
    -1 / rows + BLEED * 2
  );
  const uv = new THREE.Vector2(
    (index % columns) / columns + BLEED,
    1 - (Math.floor(index / columns) + 1) / rows + BLEED
  );

  geometry.faceVertexUvs[0].forEach((face, i) => {
    face.forEach((vert, j) => {
      vert.x = uv.x + size.x * CORNERS[i][j].x;
      vert.y = uv.y - size.y * CORNERS[i][j].y;
    });
  });

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};

export { createTile };
