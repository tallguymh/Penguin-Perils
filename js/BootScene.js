export default class BootScene extends Phaser.Scene{
  constructor(){ super('BootScene'); }
  preload(){ this.load.image('preloader','assets/bg_layer1.png'); }
  create(){ this.scene.start('PreloadScene'); }
}