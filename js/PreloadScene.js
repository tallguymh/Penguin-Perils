export default class PreloadScene extends Phaser.Scene{
  constructor(){ super('PreloadScene'); }
  preload(){
    const images = ['penguin_spritesheet.png','snowman_spritesheet.png','seal_spritesheet.png','icicle.png','fish_spritesheet.png','heart.png','cracked_ice.png','snowflake.png','bg_layer1.png','bg_layer2.png','bg_layer3.png','bg_layer4.png','editor_icons.png','animations.json'];
    for(let i of images) this.load.image(i.replace('.','_'),'assets/'+i);
    // audio
    this.load.audio('chiptune',['assets/chiptune.ogg','assets/chiptune.wav']);
    this.load.audio('jump',['assets/jump.wav']);
    this.load.audio('coin',['assets/fish.wav']);
    this.load.audio('hit',['assets/hit.wav']);
    this.load.audio('ice_break',['assets/ice_break.wav']);
    this.load.audio('boss_roar',['assets/boss_roar.wav']);
    this.load.audio('secret',['assets/secret.wav']);
    // spritesheets
    this.load.spritesheet('penguin','assets/penguin_spritesheet.png',{frameWidth:48,frameHeight:48});
    this.load.spritesheet('snowman','assets/snowman_spritesheet.png',{frameWidth:32,frameHeight:32});
    this.load.spritesheet('seal','assets/seal_spritesheet.png',{frameWidth:32,frameHeight:24});
    this.load.spritesheet('coin','assets/fish_spritesheet.png',{frameWidth:8,frameHeight:8});
    this.load.json('animations','assets/animations.json');
  }
  create(){ this.scene.start('TitleScene'); }
}