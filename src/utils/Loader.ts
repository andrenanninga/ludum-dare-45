import * as THREE from "three";

class Loader {
  assets: {
    [name: string]: any;
  };
  manager: THREE.LoadingManager;
  textureLoader: THREE.TextureLoader;

  constructor() {
    this.manager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.manager);

    this.assets = {};
  }

  load(urls: { [name: string]: string }) {
    Object.keys(urls).forEach(name => {
      const url = urls[name];
      const [, extension] = url.split(/^.+\.([a-z]+$)/);

      switch (extension) {
        case "png":
        case "jpg":
          this.loadTexture(name, url);
          return;

        default:
          console.warn(
            `Could not load ${url}, unrecognized extension "${extension}"`
          );
      }
    });
  }

  private loadTexture(name: string, url: string) {
    const texture = this.textureLoader.load(url);

    texture.minFilter = THREE.NearestMipmapNearestFilter;
    texture.magFilter = THREE.NearestFilter;

    this.assets[name] = texture;
  }
}

export { Loader };
