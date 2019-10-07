import * as THREE from "three";

type MeshTilesetMaterialParameters = {
  tilesize: number;
} & THREE.MeshBasicMaterialParameters;

class MeshTilesetMaterial extends THREE.MeshBasicMaterial {
  tilesize: number;
  columns?: number;
  rows?: number;

  constructor({ tilesize, ...parameters }: MeshTilesetMaterialParameters) {
    super(parameters);

    this.tilesize = tilesize;
    this.rows = this.map.image.height / this.tilesize;
    this.columns = this.map.image.width / this.tilesize;
    this.vertexColors = THREE.FaceColors;
  }
}

export { MeshTilesetMaterial };
