export default class EditorScene extends Phaser.Scene{
  constructor(){ super('EditorScene'); }
  create(){
    this.add.text(20,20,'Level Editor - Mobile drag/drop supported',{fontFamily:'monospace'});
    this.selected='platform';
    const saveBtn = this.add.text(20,240,'Save Level',{fontFamily:'monospace',backgroundColor:'#333',padding:6}).setInteractive();
    const loadBtn = this.add.text(150,240,'Load Level',{fontFamily:'monospace',backgroundColor:'#333',padding:6}).setInteractive();
    const playBtn = this.add.text(300,240,'Playtest',{fontFamily:'monospace',backgroundColor:'#333',padding:6}).setInteractive();
    saveBtn.on('pointerdown', ()=>{ const data = {time:Date.now(), items: this._items || []}; localStorage.setItem('penguin_perils_user_level', JSON.stringify(data)); this.add.text(20,270,'Saved to localStorage',{fontFamily:'monospace'}); });
    loadBtn.on('pointerdown', ()=>{ const s = localStorage.getItem('penguin_perils_user_level'); if(!s) return; const d = JSON.parse(s); this.add.text(20,300,'Loaded: '+ new Date(d.time).toLocaleString(),{fontFamily:'monospace'}); });
    playBtn.on('pointerdown', ()=>{ this.scene.start('GameScene'); });
    // pointer place example
    this.input.on('pointerdown', (p)=>{
      this._items = this._items || [];
      this._items.push({x:p.x, y:p.y, type: this.selected});
      this.add.rectangle(p.x, p.y, 16,16, 0x66bbff).setOrigin(0.5);
    });
  }
}