import * as THREE from "three";
import OrbitControls from "orbit-controls-es6";
import { Player, Map } from "./entities";
import { Input, Physics } from "./systems";
import { Loader } from "./utils/Loader";
import { MeshTilesetMaterial } from "./utils/MeshTilesetMaterial";
import sandbox from "./assets/sandbox";

class Game {
  width: number;
  height: number;
  depth: number;
  zoom: number;

  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  physics: Physics;
  input: Input;
  map: Map;
  player: Player;
  controls: OrbitControls;
  loader: Loader;

  static TILE = 16;

  constructor(domElement: HTMLElement) {
    this.width = domElement.clientWidth;
    this.height = domElement.clientHeight;
    this.depth = 10;
    this.zoom = 4.5;
    const aspect = this.width / this.height;

    this.scene = new THREE.Scene();
    this.physics = new Physics(this);
    this.input = new Input(this);

    this.camera = new THREE.OrthographicCamera(
      -this.depth * aspect,
      this.depth * aspect,
      this.depth,
      -this.depth,
      0.001,
      1000
    );
    this.camera.position.set(
      this.depth * Game.TILE,
      this.depth * Game.TILE,
      this.depth * Game.TILE
    );
    this.camera.lookAt(new THREE.Vector3());
    this.camera.zoom = this.zoom / Game.TILE;
    this.camera.updateProjectionMatrix();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xe3e4df);

    domElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, domElement);
    this.loader = new Loader();

    this.render = this.render.bind(this);
  }

  start() {
    this.loader.load({ tileset: require("./assets/tileset.png") });
    this.loader.manager.onLoad = () => {
      this.loader.assets.tileset = new MeshTilesetMaterial({
        tilesize: 16,
        map: this.loader.assets.tileset,
        alphaTest: 0.5
      });

      sandbox.tilesets[0].material = this.loader.assets.tileset;

      this.player = new Player(this);
      this.map = new Map(this);
      this.map.load(sandbox);

      this.scene.add(this.map);
      this.scene.add(this.player);

      this.render();
    };
  }

  render() {
    requestAnimationFrame(this.render);

    this.input.update();

    this.player.update();
    this.map.update();
    this.camera.position
      .copy(this.player.position)
      .add(
        new THREE.Vector3(
          (this.depth * Game.TILE) / 1.2,
          (this.depth * Game.TILE) / 1.5,
          this.depth * Game.TILE
        )
      );
    this.camera.lookAt(this.player.position);

    this.physics.update();
    this.renderer.render(this.scene, this.camera);
  }
}

export { Game };
