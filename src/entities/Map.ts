import * as THREE from "three";
import Matter from "matter-js";
import { createTile } from "../utils/createTile";
import { Game } from "../Game";
import { MeshTilesetMaterial } from "../utils/MeshTilesetMaterial";
import { Wave, Skull } from ".";

namespace Tiled {
  export type Map = {
    layers: Layer[];
    tilesets: Tileset[];
    width: number;
    height: number;
  };

  export type Chunk = {
    width: number;
    height: number;
    x: number;
    y: number;
    data: number[];
  };

  export type Object = {
    name: string;
    gid: number;
    height: number;
    width: number;
    rotation: number;
    x: number;
    y: number;
  };

  export type Layer = {
    name: string;
    chunks: Chunk[];
    objects: Object[];
    height: number;
    width: number;
    x: number;
    y: number;
  };

  export type Tileset = {
    name: string;
    firstgid: number;
    material: MeshTilesetMaterial;
  };
}

class Map extends THREE.Group {
  game: Game;
  elevation: { [coord: string]: number };
  entities: THREE.Object3D[];

  constructor(game: Game) {
    super();

    this.game = game;
    this.entities = [];
  }

  load(map: Tiled.Map) {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(128 * Game.TILE, 128 * Game.TILE),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    plane.rotation.x = Math.PI / -2;
    plane.position.y = -5.5;
    this.add(plane);

    this.setElevation(map, map.layers.filter(x => x.name === "elevation")[0]);
    this.setEntities(map, map.layers.filter(x => x.name === "entities")[0]);

    map.layers.forEach(layer => {
      switch (layer.name) {
        case "ground":
          return this.drawGround(map, layer);

        case "walls":
          return this.drawWalls(map, layer);

        case "billboards":
          return this.drawBillboards(map, layer);

        default:
          console.warn(`Unknown layer "${layer.name}"`);
      }
    });
  }

  getElevation(x: number, y: number): number {
    return this.elevation[`${x}x${y}`] || 0;
  }

  private setElevation(map: Tiled.Map, layer: Tiled.Layer) {
    this.elevation = {};

    layer.chunks.forEach(chunk => {
      chunk.data.forEach((gid, index) => {
        if (gid === 0 || gid === 7) return;

        const x = ((index % chunk.width) + chunk.x) * Game.TILE;
        const y = (Math.floor(index / chunk.width) + chunk.y) * Game.TILE;
        this.elevation[`${x}x${y}`] = (gid - 7) * (Game.TILE / -6);

        if (gid === 8) {
          console.log(this.elevation[`${x}x${y}`]);
        }

        Matter.World.addBody(
          this.game.physics.engine.world,
          Matter.Bodies.rectangle(x, y, Game.TILE, Game.TILE, {
            isStatic: true
          })
        );
      });
    });
  }

  private setEntities(map: Tiled.Map, layer: Tiled.Layer) {
    const Entity = {
      wave: Wave,
      skull: Skull
    };

    layer.objects.forEach(object => {
      const rotation = (object.rotation * Math.PI) / 180;

      let x = object.x;
      let y = object.y;

      if (rotation === Math.PI / 2) {
        y += Game.TILE;
      }
      if (rotation === Math.PI / -2) {
        x -= Game.TILE;
      }
      if (rotation === Math.PI) {
        x -= Game.TILE;
        y += Game.TILE;
      }

      const elevation = this.getElevation(x, y);

      if (object.name === "player") {
        this.game.player.position.y = elevation;
        Matter.Body.setPosition(this.game.player.userData.body, {
          x,
          y: y - Game.TILE
        });
      } else if (Entity[object.name]) {
        const entity = new Entity[object.name](this.game);
        entity.position.set(x, elevation + 0.001, y - Game.TILE);
        entity.rotation.y -= rotation;
        this.add(entity);
        this.entities.push(entity);

        if (entity.userData.body) {
          Matter.Body.setPosition(entity.userData.body, {
            x,
            y: y - Game.TILE
          });
        }
      }
    });
  }

  private drawGround(map: Tiled.Map, layer: Tiled.Layer) {
    layer.chunks.forEach((chunk, i) => {
      const group = new THREE.Group();
      group.position.set(chunk.x * Game.TILE, 0, chunk.y * Game.TILE);

      chunk.data.forEach((gid, index) => {
        if (gid === 0) return;

        const x = (index % chunk.width) * Game.TILE;
        const y = Math.floor(index / chunk.width) * Game.TILE;
        const elevation = this.getElevation(
          x + group.position.x,
          y + group.position.z
        );

        const tile = createTile(map.tilesets[0].material, gid - 1);
        tile.rotation.x = Math.PI / -2;
        tile.position.set(x, elevation, y);
        group.add(tile);
      });

      this.add(group);
    });
  }

  private drawWalls(map: Tiled.Map, layer: Tiled.Layer) {
    const sides = [
      { x: Game.TILE / 2, y: 0, rotation: Math.PI / 2, shade: 0xcccccc },
      { x: 0, y: Game.TILE / 2, rotation: 0, shade: 0xaaaaaa }
    ];

    layer.chunks.forEach((chunk, i) => {
      const group = new THREE.Group();
      group.position.set(chunk.x * Game.TILE, 0, chunk.y * Game.TILE);

      chunk.data.forEach((gid, index) => {
        if (gid === 0) return;

        const x = (index % chunk.width) * Game.TILE;
        const y = Math.floor(index / chunk.width) * Game.TILE;
        const elevation = this.getElevation(
          x + group.position.x,
          y + group.position.z
        );

        sides.forEach(side => {
          const tile = createTile(map.tilesets[0].material, gid - 1);
          tile.position.set(x + side.x, elevation - Game.TILE, y + side.y);
          tile.rotation.y = side.rotation;
          tile.scale.y = 2;
          (tile.geometry as THREE.Geometry).faces.forEach(face => {
            face.color = new THREE.Color(side.shade);
          });
          group.add(tile);
        });
      });

      this.add(group);
    });
  }

  private drawBillboards(map: Tiled.Map, layer: Tiled.Layer) {
    layer.chunks.forEach((chunk, i) => {
      const group = new THREE.Group();
      group.position.set(chunk.x * Game.TILE, 0, chunk.y * Game.TILE);

      chunk.data.forEach((gid, index) => {
        if (gid === 0) return;

        const x = (index % chunk.width) * Game.TILE;
        const y = Math.floor(index / chunk.width) * Game.TILE;
        const elevation =
          this.getElevation(x + group.position.x, y + group.position.z) +
          Game.TILE / 2;

        const tile = createTile(map.tilesets[0].material, gid - 1);
        tile.rotation.y = Math.PI / 4;
        tile.position.set(x, elevation, y);
        group.add(tile);

        // tree
        if (gid === 25 || gid === 26) {
          Matter.World.addBody(
            this.game.physics.engine.world,
            Matter.Bodies.circle(
              x + group.position.x,
              y + group.position.z,
              0.2 * Game.TILE,
              {
                isStatic: true
              }
            )
          );
        }
      });

      this.add(group);
    });
  }

  update() {
    this.entities.forEach(entity => {
      entity.update();
    });
  }
}

export { Map };
