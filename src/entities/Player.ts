import * as THREE from "three";
import Matter from "matter-js";
import { Game } from "../Game";
import { createTile, updateTile } from "../utils/createTile";

class Player extends THREE.Group {
  game: Game;
  mesh: THREE.Mesh;
  frame: 0;

  state: "walking" | "idle";
  direction: "left" | "right";

  static FRAMERATE = 10;

  static animations = {
    idle: [52, 53, 53, 52, 52, 52, 52, 52, 54, 54, 52, 52],
    walk: [44, 45, 46, 47]
  };

  constructor(game: Game) {
    super();

    this.game = game;

    this.mesh = createTile(game.loader.assets.tileset, 44);
    this.mesh.position.y = Game.TILE / 2;
    this.mesh.rotation.y = Math.PI / 4;
    this.add(this.mesh);
    this.scale.set(0.6666, 0.6666, 0.6666);

    this.frame = 0;
    this.state = "idle";
    this.direction = "right";

    this.position.x = 0.5;
    this.position.z = 0.5;

    this.game.physics.addBody(
      this,
      Matter.Bodies.circle(0, 0, 0.3 * Game.TILE, { frictionAir: 0.4 })
    );
  }

  update() {
    const body: Matter.Body = this.userData.body;
    const force = new THREE.Vector2();

    this.frame += 1;
    this.state = "idle";

    if (this.game.input.up.down) {
      this.direction = "left";
      this.state = "walking";
      force.x -= 1;
      force.y -= 1;
    }
    if (this.game.input.down.down) {
      this.direction = "right";
      this.state = "walking";
      force.x += 1;
      force.y += 1;
    }
    if (this.game.input.left.down) {
      this.direction = "left";
      this.state = "walking";
      force.x -= 1;
      force.y += 1;
    }
    if (this.game.input.right.down) {
      this.direction = "right";
      this.state = "walking";
      force.x += 1;
      force.y -= 1;
    }

    force.clampLength(-1, 1);
    force.multiplyScalar((body.mass / 14000) * Game.TILE);

    if (this.state === "walking") {
      updateTile(
        this.mesh,
        Player.animations.walk[
          Math.floor(this.frame / Player.FRAMERATE) %
            Player.animations.walk.length
        ]
      );
    } else if (this.state === "idle") {
      updateTile(
        this.mesh,
        Player.animations.idle[
          Math.floor(this.frame / Player.FRAMERATE) %
            Player.animations.idle.length
        ]
      );
    }

    this.mesh.lookAt(this.game.camera.position);
    this.mesh.scale.setX(this.direction === "left" ? -1 : 1);

    Matter.Body.applyForce(body, body.position, force);
  }
}

export { Player };
