import BootScene from './BootScene.js';
import PreloadScene from './PreloadScene.js';
import TitleScene from './TitleScene.js';
import GameScene from './GameScene.js';
import EditorScene from './EditorScene.js';
import UIScene from './UIScene.js';
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 272,
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 700 }, debug: false } },
  scene: [ BootScene, PreloadScene, TitleScene, GameScene, EditorScene, UIScene ]
};
window.game = new Phaser.Game(config);
