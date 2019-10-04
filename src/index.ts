import * as THREE from "three";
import { Game } from "./Game";

window.THREE = THREE;

window.game = new Game(document.querySelector(".game"));
window.game.start();
