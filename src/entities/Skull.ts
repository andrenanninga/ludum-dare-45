import * as THREE from "three";
import Matter from "matter-js";
import { Game } from "../Game";
import { createTile, updateTile } from "../utils/createTile";

class Skull extends THREE.Group {
  game: Game;
  mesh: THREE.Mesh;
  frame: number;

  static FRAMERATE = 10;

  static animations = {
    Skull: [40, 40, 41, 42, 41, 43]
  };

  constructor(game: Game) {
    super();

    this.game = game;

    this.mesh = createTile(game.loader.assets.tileset, 32);
    this.mesh.position.y += Game.TILE / 2;
    this.mesh.rotation.y = Math.PI / 4;
    this.add(this.mesh);

    this.frame = 0;

    this.game.physics.addBody(
      this,
      Matter.Bodies.circle(0, 0, 0.3 * Game.TILE, { frictionAir: 0.2 })
    );
  }

  update() {
    this.frame += 1;
    const body: Matter.Body = this.userData.body;
    const player = this.game.player;

    const index =
      Skull.animations.Skull[
        Math.floor(this.frame / Skull.FRAMERATE) % Skull.animations.Skull.length
      ];
    updateTile(this.mesh, index);

    const force = player.position.clone().sub(this.position);

    this.mesh.scale.x =
      force.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / -4).x >
      0
        ? 1
        : -1;

    if (force.length() > 10) {
      force.clampLength(-1, 1);
      force.multiplyScalar((body.mass / 14000) * Game.TILE);

      if (index === 41 || index === 42) {
        force.multiplyScalar(index === 41 ? 0.1 : 0.2 + Math.random() / 10);
        Matter.Body.applyForce(body, body.position, { x: force.x, y: force.z });
      }
    }
  }
}

export { Skull };
