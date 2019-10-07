import keycode from "keycode";

import { Game } from "../Game";

type Key = {
  down: boolean;
};

class Input {
  game: Game;
  keys: { [key: number]: Key };

  up: Key;
  down: Key;
  left: Key;
  right: Key;

  static initial: Key = {
    down: false
  };

  constructor(game) {
    this.game = game;

    this.keys = {
      [keycode("w")]: Input.initial,
      [keycode("s")]: Input.initial,
      [keycode("a")]: Input.initial,
      [keycode("d")]: Input.initial
    };

    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  }

  keydown = (e: KeyboardEvent) => {
    this.keys[e.keyCode] = {
      ...this.keys[e.keyCode],
      down: true
    };
  };

  keyup = (e: KeyboardEvent) => {
    this.keys[e.keyCode] = {
      ...this.keys[e.keyCode],
      down: false
    };
  };

  update() {
    this.up = this.keys[keycode("w")];
    this.down = this.keys[keycode("s")];
    this.left = this.keys[keycode("a")];
    this.right = this.keys[keycode("d")];
  }
}

export { Input };
