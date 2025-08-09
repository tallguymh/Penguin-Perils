// Single-file Phaser 3 build for Penguin Perils (all scenes + editor)
const config = {
    type: Phaser.AUTO,
    width: 1024, height: 576,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width:1024, height:576 },
    render: { pixelArt: true },
    physics: { default:'arcade', arcade:{ gravity:{ y:1000 }, debug:false } },
    scene: [BootScene, TitleScene, GameScene, EditorScene]
};

let isTouch = false;

// Boot / Preload inside one
class BootScene extends Phaser.Scene {
    constructor(){ super('BootScene'); }
    preload(){
        this.load.image('bg','assets/bg_layer.png');
        this.load.spritesheet('penguin','assets/penguin_spritesheet.png',{frameWidth:32,frameHeight:32});
        this.load.image('btnLeft','assets/btn_left.png'); this.load.image('btnRight','assets/btn_right.png'); this.load.image('btnJump','assets/btn_jump.png');
        this.load.audio('jump','assets/jump.wav'); this.load.audio('coin','assets/coin.wav'); this.load.audio('hit','assets/hit.wav'); this.load.audio('music','assets/chiptune.wav');
        const w = this.cameras.main.width, h = this.cameras.main.height;
        this.loadingText = this.add.text(w/2,h/2,'Loading...',{font:'24px Courier',fill:'#fff'}).setOrigin(0.5);
    }
    create(){ this.scene.start('TitleScene'); }
}

// Title
class TitleScene extends Phaser.Scene {
    constructor(){ super('TitleScene'); }
    create(){
        this.add.image(512,288,'bg').setOrigin(0.5);
        this.add.text(512,160,'Penguin Perils',{fontFamily:'Courier',fontSize:'64px',color:'#ffffff'}).setOrigin(0.5);
        this.add.text(512,480,'Click or Tap to Start (Press E for Editor)',{fontFamily:'Courier',fontSize:'20px',color:'#cccccc'}).setOrigin(0.5);
        this.input.once('pointerdown', ()=>this.scene.start('GameScene'));
        this.input.keyboard.on('keydown-E', ()=>this.scene.start('EditorScene'));
    }
}

// Game
class GameScene extends Phaser.Scene {
    constructor(){ super('GameScene'); }
    create(){
        this.add.tileSprite(0,0,1024,576,'bg').setOrigin(0,0);
        this.music = this.sound.add('music',{loop:true,volume:0.5});
        let started=false;
        this.input.once('pointerdown', ()=>{ if(!started){ this.music.play(); started=true; } });
        // player
        this.player = this.physics.add.sprite(120,400,'penguin').setScale(2);
        this.player.setCollideWorldBounds(true); this.player.body.setSize(20,28).setOffset(6,2);
        this.anims.create({key:'run',frames:this.anims.generateFrameNumbers('penguin',{start:0,end:3}),frameRate:10,repeat:-1});
        this.anims.create({key:'idle',frames:[{key:'penguin',frame:0}],frameRate:1});
        this.player.play('run');
        // platforms
        this.platforms = this.physics.add.staticGroup();
        for(let i=0;i<20;i++){ let x=i*64+32; let y=576-32; let t=this.add.rectangle(x,y,64,64,0x228B22).setOrigin(0.5); this.physics.add.existing(t,true); this.platforms.add(t); }
        this.physics.add.collider(this.player,this.platforms);
        // controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpSnd = this.sound.add('jump');
        // touch detection
        isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        if(isTouch) this.createTouchControls();
        // entities
        this.enemies = this.physics.add.group({runChildUpdate:true});
        this.coins = this.physics.add.group({runChildUpdate:true});
        this.time.addEvent({ delay:3000, loop:true, callback:()=>this.spawnEnemy() });
        this.time.addEvent({ delay:2000, loop:true, callback:()=>this.spawnCoin() });
        this.physics.add.overlap(this.player,this.coins,(p,c)=>{ if(c.collect) c.collect(); });
        this.physics.add.collider(this.player,this.enemies,(p,e)=>{ this.hitEnemy(p,e); });
        this.score=0; this.scoreText = this.add.text(16,16,'Score: 0',{fontFamily:'Courier',fontSize:'24px',color:'#fff'}).setScrollFactor(0);
        this.input.keyboard.on('keydown-E', ()=>{ this.scene.start('EditorScene'); });
        if(isTouch) this.sys.game.loop.targetFps = 50;
    }
    createTouchControls(){
        this.leftDown=false; this.rightDown=false;
        const y = this.scale.height - 88;
        this.btnL=this.add.image(80,y,'btnLeft').setScrollFactor(0).setInteractive().setAlpha(0.8).setDepth(10);
        this.btnR=this.add.image(180,y,'btnRight').setScrollFactor(0).setInteractive().setAlpha(0.8).setDepth(10);
        this.btnJ=this.add.image(this.scale.width-80,y,'btnJump').setScrollFactor(0).setInteractive().setAlpha(0.9).setDepth(10);
        this.btnL.on('pointerdown',()=>this.leftDown=true); this.btnL.on('pointerup',()=>this.leftDown=false); this.btnL.on('pointerout',()=>this.leftDown=false);
        this.btnR.on('pointerdown',()=>this.rightDown=true); this.btnR.on('pointerup',()=>this.rightDown=false); this.btnR.on('pointerout',()=>this.rightDown=false);
        this.btnJ.on('pointerdown',()=>{ if(this.player.body.touching.down){ this.player.setVelocityY(-520); this.jumpSnd.play(); } });
        this.input.keyboard.on('keydown', ()=>{ this.btnL.setVisible(false); this.btnR.setVisible(false); this.btnJ.setVisible(false); });
    }
    spawnEnemy(){
        let x=1100,y=576-64-16;
        let enemy=this.physics.add.sprite(x,y,'enemy'); enemy.setImmovable(false); enemy.body.setVelocityX(-80); enemy.patrolSpeed=80; enemy.chaseSpeed=140; enemy.detectionRadius=220;
        enemy.update=function(){ if(Math.abs(this.x - this.scene.player.x) < this.detectionRadius){ if(this.x > this.scene.player.x) this.body.setVelocityX(-this.chaseSpeed); else this.body.setVelocityX(this.chaseSpeed); } };
        this.enemies.add(enemy); this.physics.add.collider(enemy,this.platforms);
        this.tweens.add({targets:enemy,y:enemy.y-6,duration:800,yoyo:true,repeat:-1}); this.time.addEvent({delay:12000,callback:()=>{ if(enemy && enemy.destroy) enemy.destroy(); }});
    }
    spawnCoin(){ let x=1100,y=576-140-Math.random()*120; let coin=this.physics.add.sprite(x,y,'coin'); coin.setImmovable(true); coin.body.allowGravity=false; coin.body.setVelocityX(-100); coin.collect=()=>{ coin.destroy(); this.sound.play('coin'); this.score+=1; }; this.tweens.add({targets:coin,angle:360,duration:800,repeat:-1}); this.coins.add(coin); this.time.addEvent({delay:9000,callback:()=>{ if(coin && coin.destroy) coin.destroy(); }}); }
    hitEnemy(p,e){ if(p.body.velocity.y>0 && p.body.bottom < e.body.top + 12){ this.sound.play('hit'); e.destroy(); p.setVelocityY(-320); this.score+=2; } else { this.sound.play('hit'); p.disableBody(true,true); this.time.delayedCall(1000, ()=>{ p.enableBody(true,120,400,true,true); p.play('run'); }); } }
    update(){ if(!isTouch){ if(this.cursors.left.isDown){ this.player.setVelocityX(-160); this.player.flipX=true; this.player.play('run',true); } else if(this.cursors.right.isDown){ this.player.setVelocityX(160); this.player.flipX=false; this.player.play('run',true); } else{ this.player.setVelocityX(0); this.player.play('idle',true); } if(this.cursors.up.isDown && this.player.body.touching.down){ this.player.setVelocityY(-520); this.jumpSnd.play(); } } else { if(this.leftDown){ this.player.setVelocityX(-160); this.player.flipX=true; this.player.play('run',true); } else if(this.rightDown){ this.player.setVelocityX(160); this.player.flipX=false; this.player.play('run',true); } else{ this.player.setVelocityX(0); this.player.play('idle',true); } } this.enemies.children.iterate((en)=>{ if(en && en.update) en.update(); }); // simple parallax
        if(this.cameras && this.cameras.main) this.cameras.main.scrollX += 0.5; this.scoreText.setText('Score: ' + this.score); }
}

// EditorScene with toolbar and JSON save/load
class EditorScene extends Phaser.Scene {
    constructor(){ super('EditorScene'); }
    create(){
        this.add.image(512,288,'bg').setOrigin(0.5);
        this.add.text(512,48,'Level Editor',{fontFamily:'Courier',fontSize:'36px',color:'#fff'}).setOrigin(0.5);
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

window.game = new Phaser.Game(config);
