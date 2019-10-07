import * as THREE from "three";
import { Game } from "../Game";
import { createTile, updateTile } from "../utils/createTile";

class Wave extends THREE.Group {
  game: Game;
  mesh: THREE.Mesh;
  frame: number;

  static FRAMERATE = 40;

  static animations = {
    wave: [32, 33, 34, 33]
  };

  constructor(game: Game) {
    super();

    this.game = game;

    this.mesh = createTile(game.loader.assets.tileset, 32);
    this.mesh.rotation.x = Math.PI / -2;
    this.add(this.mesh);

    this.frame = 0;
  }

  update() {
    this.frame += 1;
    updateTile(
      this.mesh,
      Wave.animations.wave[
        Math.floor(this.frame / Wave.FRAMERATE) % Wave.animations.wave.length
      ]
    );
  }
}

export { Wave };
