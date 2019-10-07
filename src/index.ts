import * as THREE from "three";
import Matter from "matter-js";
import { Game } from "./Game";

window.THREE = THREE;
window.Matter = Matter;

window.game = new Game(document.querySelector(".game"));
window.game.start();
