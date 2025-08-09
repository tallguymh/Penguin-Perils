class EditorScene extends Phaser.Scene {
    constructor(){ super('EditorScene'); }
    create(){
        this.add.image(256,144,'bg').setOrigin(0.5).setDisplaySize(512,288);
        this.add.text(512,48,'Level Editor',{fontFamily:'Courier',fontSize:'24px',color:'#fff'}).setOrigin(0.5);
        this.grid = this.add.group(); this.tileSize = 64; this.createToolbar();
        let saved = localStorage.getItem('penguin_level'); if(saved){ this.levelData = JSON.parse(saved); this.loadLevel(this.levelData); } else { this.levelData = []; }
    }
    createToolbar(){
        let root = document.getElementById('ui-root'); root.innerHTML = `<div class="toolbar" id="toolbar">
            <button id="btnPlace">Place Tile</button><button id="btnRemove">Remove Tile</button><button id="btnSave">Save (Download)</button><button id="btnLoad">Load (Upload)</button><button id="btnReturn">Return to Game</button><input type="file" id="fileLoader" class="file-input" accept=".json"></div>`;
        document.getElementById('btnPlace').onclick = ()=>{ this.mode='place'; };
        document.getElementById('btnRemove').onclick = ()=>{ this.mode='remove'; };
        document.getElementById('btnSave').onclick = ()=>{ this.saveLevelToFile(); };
        document.getElementById('btnLoad').onclick = ()=>{ document.getElementById('fileLoader').click(); };
        document.getElementById('btnReturn').onclick = ()=>{ document.getElementById('ui-root').innerHTML=''; this.scene.start('GameScene'); };
        document.getElementById('fileLoader').onchange = (e)=>{ let f=e.target.files[0]; if(f){ let reader=new FileReader(); reader.onload=(ev)=>{ try{ let j=JSON.parse(ev.target.result); this.loadLevel(j); localStorage.setItem('penguin_level', JSON.stringify(j)); alert('Level loaded'); }catch(err){ alert('Invalid JSON'); } }; reader.readAsText(f); } };
        this.mode='place';
        this.input.on('pointerdown', (pointer)=>{
            let x = Math.floor(pointer.worldX / this.tileSize) * this.tileSize + this.tileSize/2;
            let y = Math.floor(pointer.worldY / this.tileSize) * this.tileSize + this.tileSize/2;
            if(this.mode==='place'){ this.placeTile(x,y); }
            else if(this.mode==='remove'){ this.removeTileAt(x,y); }
        });
    }
    placeTile(x,y){
        if(y < 120) return;
        if(this.grid.getChildren().some(t=>t.x===x && t.y===y)) return;
        let tile = this.add.rectangle(x,y,this.tileSize,this.tileSize,0x8B4513).setOrigin(0.5);
        this.physics.add.existing(tile,true);
        this.grid.add(tile);
        this.levelData.push({x:x,y:y});
        localStorage.setItem('penguin_level', JSON.stringify(this.levelData));
    }
    removeTileAt(x,y){
        let found = this.grid.getChildren().find(t=>t.x===x && t.y===y);
        if(found){ found.destroy(); this.grid.remove(found); this.levelData = this.levelData.filter(p=>!(p.x===x && p.y===y)); localStorage.setItem('penguin_level', JSON.stringify(this.levelData)); }
    }
    saveLevelToFile(){
        let data = { tiles: this.levelData };
        let blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a'); a.href = url; a.download = 'penguin_level.json'; a.click(); URL.revokeObjectURL(url);
    }
    loadLevel(data){
        let tiles = data.tiles || data;
        this.grid.getChildren().forEach(t=>t.destroy());
        this.grid.clear(true);
        this.levelData = [];
        for(let p of tiles){ this.placeTile(p.x,p.y); }
    }
}
