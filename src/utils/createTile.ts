import * as THREE from "three";
import { MeshTilesetMaterial } from "./MeshTilesetMaterial";
import { Game } from "../Game";

const BLEED = 0.001;
const CORNERS = [
  [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
];

const FLAG_FLIPPED_HORIZONTAL = 0x80000000;
const FLAG_FLIPPED_VERTICAL = 0x40000000;
const FLAG_FLIPPED_DIAGONAL = 0x20000000;

const createTile = (material: MeshTilesetMaterial, index: number) => {
  const geometry = new THREE.PlaneGeometry(Game.TILE, Game.TILE);
  const mesh = new THREE.Mesh(geometry, material);

  updateTile(mesh, index);
  return mesh;
};

const updateTile = (mesh: THREE.Mesh, index: number) => {
  const geometry = mesh.geometry as THREE.PlaneGeometry;
  const material = mesh.material as MeshTilesetMaterial;

  const tile =
    index &
    ~(FLAG_FLIPPED_HORIZONTAL | FLAG_FLIPPED_VERTICAL | FLAG_FLIPPED_DIAGONAL);

  const isFlippedHorizontal = !!(index & FLAG_FLIPPED_HORIZONTAL);
  const isFlippedVertical = !!(index & FLAG_FLIPPED_VERTICAL);
  const isFlippedDiagonal = !!(index & FLAG_FLIPPED_DIAGONAL);

  const size = new THREE.Vector2(
    1 / material.columns - BLEED * 2,
    -1 / material.rows + BLEED * 2
  );
  const uv = new THREE.Vector2(
    (tile % material.columns) / material.columns + BLEED,
    1 - (Math.floor(tile / material.columns) + 1) / material.rows + BLEED
  );

  geometry.faceVertexUvs[0].forEach((face, i) => {
    face.forEach((vert, j) => {
      vert.x = uv.x + size.x * CORNERS[i][j].x;
      vert.y = uv.y - size.y * CORNERS[i][j].y;
    });
  });

  geometry.uvsNeedUpdate = true;

  const scale = new THREE.Vector2(1, 1);

  scale.x = isFlippedHorizontal ? -1 : 1;
  scale.y = isFlippedVertical ? -1 : 1;

  mesh.rotation.z = isFlippedDiagonal ? Math.PI / 2 : 0;
  mesh.scale.setX(isFlippedDiagonal ? -scale.y : scale.x);
  mesh.scale.setY(isFlippedDiagonal ? scale.x : scale.y);
};

export { createTile, updateTile };
