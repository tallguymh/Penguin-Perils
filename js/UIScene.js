export default class UIScene extends Phaser.Scene{
  constructor(){ super('UIScene'); }
  init(data){ this.wasPaused = data.paused || false; }
  create(){
    if(this.wasPaused){
      const resume = this.add.text(240,120,'Resume',{fontFamily:'monospace', backgroundColor:'#333', padding:6}).setOrigin(0.5).setInteractive();
      const quit = this.add.text(240,160,'Quit',{fontFamily:'monospace', backgroundColor:'#333', padding:6}).setOrigin(0.5).setInteractive();
      resume.on('pointerdown', ()=>{ this.scene.stop(); this.scene.resume('GameScene'); });
      quit.on('pointerdown', ()=>{ this.scene.stop(); this.scene.stop('GameScene'); this.scene.start('TitleScene'); });
    }
  }
}