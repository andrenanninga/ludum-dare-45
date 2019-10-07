import Matter from "matter-js";
import * as THREE from "three";
import { Game } from "../Game";

class Physics {
  game: Game;
  engine: Matter.Engine;
  objects: THREE.Object3D[];

  constructor(game) {
    this.game = game;

    this.engine = Matter.Engine.create();
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;
    this.objects = [];

    const renderer = Matter.Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: 800,
        height: 600
      }
    });

    Matter.Render.run(renderer);
    Matter.Render.lookAt(renderer, {
      min: { x: -20 * Game.TILE, y: -20 * Game.TILE },
      max: { x: 20 * Game.TILE, y: 20 * Game.TILE }
    });

    // create runner
    const runner = Matter.Runner.create({});
    Matter.Runner.run(runner, this.engine);
  }

  addBody(object: THREE.Object3D, body: Matter.Body) {
    Matter.World.add(this.engine.world, body);

    object.userData.body = body;
    this.objects.push(object);

    return body;
  }

  update() {
    this.objects.forEach(object => {
      const body = object.userData.body as Matter.Body;

      object.position.set(body.position.x, object.position.y, body.position.y);
    });
  }
}

export { Physics };
