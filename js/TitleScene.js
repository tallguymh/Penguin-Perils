export default class TitleScene extends Phaser.Scene{
  constructor(){ super('TitleScene'); }
  create(){
    this.add.tileSprite(240,136,480,272,'bg_layer1_png');
    this.add.tileSprite(240,136,480,272,'bg_layer2_png').setScrollFactor(0.2);
    this.add.tileSprite(240,136,480,272,'bg_layer3_png').setScrollFactor(0.4);
    this.add.tileSprite(240,136,480,272,'bg_layer4_png').setScrollFactor(0.6);
    this.peng = this.add.sprite(140,190,'penguin').setScale(1.5);
    this.anims.create({key:'breath',frames:[{key:'penguin',frame:0},{key:'penguin',frame:1}],frameRate:2,repeat:-1});
    this.peng.play('breath');
    this.title = this.add.text(240,70,'Penguin Perils',{fontFamily:'monospace',fontSize:40, color:'#fff'}).setOrigin(0.5);
    const start = this.add.text(240,240,'Start Game', {fontFamily:'monospace',fontSize:20, backgroundColor:'#333', padding:6}).setOrigin(0.5).setInteractive();
    const edit = this.add.text(240,275,'Edit Level', {fontFamily:'monospace',fontSize:18, backgroundColor:'#333', padding:6}).setOrigin(0.5).setInteractive();
    const instr = this.add.text(240,310,'Instructions', {fontFamily:'monospace',fontSize:14, backgroundColor:'#333', padding:6}).setOrigin(0.5).setInteractive();
    start.on('pointerdown',()=>{ this.scene.start('GameScene'); });
    edit.on('pointerdown',()=>{ this.scene.start('EditorScene'); });
    instr.on('pointerdown', ()=>{ this.showInstructions(); });
    // high score display
    const hi = localStorage.getItem('penguin_perils_highscore') || 0;
    this.add.text(240,340,'High Score: '+hi,{fontFamily:'monospace',fontSize:14,color:'#fff'}).setOrigin(0.5);
  }
  showInstructions(){
    const msg = "Move: ← →  Jump: ↑ / Space  On mobile use touch buttons. Collect coins, find secret rooms, defeat the boss.";
    alert(msg);
  }
}