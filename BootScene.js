class BootScene extends Phaser.Scene {
    constructor(){ super('BootScene'); }
    preload(){
        this.load.image('bg','assets/bg_layer.png');
        this.load.spritesheet('penguin','assets/penguin_spritesheet.png',{frameWidth:32,frameHeight:32});
        this.load.spritesheet('enemy','assets/enemy_spritesheet.png',{frameWidth:16,frameHeight:16});
        this.load.spritesheet('coin','assets/coin_spritesheet.png',{frameWidth:12,frameHeight:12});
        this.load.image('btnLeft','assets/btn_left.png'); this.load.image('btnRight','assets/btn_right.png'); this.load.image('btnJump','assets/btn_jump.png');
        this.load.audio('jump','assets/jump.wav'); this.load.audio('coin','assets/coin.wav'); this.load.audio('hit','assets/hit.wav'); this.load.audio('music','assets/chiptune.wav');
        const w=this.cameras.main.width,h=this.cameras.main.height;
        this.add.text(w/2,h/2,'Loading...',{font:'18px Courier',fill:'#fff'}).setOrigin(0.5);
    }
    create(){ this.scene.start('TitleScene'); }
}
