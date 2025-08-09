class TitleScene extends Phaser.Scene {
    constructor(){ super('TitleScene'); }
    create(){
        this.add.image(256,144,'bg').setOrigin(0.5).setDisplaySize(512,288);
        this.add.text(512,160,'Penguin Perils',{fontFamily:'Courier',fontSize:'48px',color:'#fff'}).setOrigin(0.5);
        this.add.text(512,460,'Click or Tap to Start (Press E for Editor)',{fontFamily:'Courier',fontSize:'16px',color:'#ccc'}).setOrigin(0.5);
        this.input.once('pointerdown', ()=>this.scene.start('GameScene'));
        this.input.keyboard.on('keydown-E', ()=>this.scene.start('EditorScene'));
    }
}
