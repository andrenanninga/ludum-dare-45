import * as THREE from "three";
import OrbitControls from "orbit-controls-es6";
import sample from "lodash/sample";
import { Loader } from "./utils/Loader";
import { MeshTilesetMaterial } from "./utils/MeshTilesetMaterial";
import { createTile } from "./utils/createTile";

class Game {
  width: number;
  height: number;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  loader: Loader;

  constructor(domElement: HTMLElement) {
    this.width = domElement.clientWidth;
    this.height = domElement.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xe3e4df);

    domElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, domElement);
    this.loader = new Loader();

    this.render = this.render.bind(this);
  }

  start() {
    this.scene.add(new THREE.AxesHelper());
    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(new THREE.Vector3());

    this.loader.load({ scut: require("./assets/scut-tileset.png") });
    this.loader.manager.onLoad = () => {
      const tileset = new MeshTilesetMaterial({ map: this.loader.assets.scut });
      // tileset.color.con();

      for (let i = 0; i < 8; i++) {
        const roof = createTile({
          index: sample([1, 2, 3]),
          material: tileset,
          tilesize: 8
        });
        roof.position.x = i;
        roof.rotation.x = Math.PI / -2;

        const floor = createTile({
          index: 23,
          material: tileset,
          tilesize: 8
        });
        floor.position.x = i;
        floor.position.y = -1;
        floor.position.z = 1;
        floor.rotation.x = Math.PI / -2;

        const wall = createTile({
          index: sample([20, 21, 22]),
          material: tileset,
          tilesize: 8
        });
        wall.position.x = i;
        wall.position.y = -0.5;
        wall.position.z = 0.5;

        this.scene.add(roof);
        this.scene.add(wall);
        this.scene.add(floor);
      }

      this.render();
    };
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }
}

export { Game };
