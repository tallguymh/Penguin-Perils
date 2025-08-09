export default class GameScene extends Phaser.Scene{
  constructor(){ super('GameScene'); }
  create(){
    // background
    this.bg1=this.add.tileSprite(240,136,480,272,'bg_layer1_png');
    this.bg2=this.add.tileSprite(240,136,480,272,'bg_layer2_png');
    this.bg3=this.add.tileSprite(240,136,480,272,'bg_layer3_png');
    this.bg4=this.add.tileSprite(240,136,480,272,'bg_layer4_png');
    // world
    this.physics.world.setBounds(0,0,2400,272);
    // player
    this.player=this.physics.add.sprite(120,180,'penguin').setScale(1.5).setCollideWorldBounds(true);
    this.player.isInvincible=false; this.player.lives=3;
    this.anims.create({key:'p_breath',frames:[{key:'penguin',frame:0},{key:'penguin',frame:1}],frameRate:2,repeat:-1});
    this.anims.create({key:'p_hop',frames:[{key:'penguin',frame:2},{key:'penguin',frame:3},{key:'penguin',frame:4}],frameRate:10,repeat:0});
    this.player.play('p_breath');
    // controls
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys({space:Phaser.Input.Keyboard.KeyCodes.SPACE});
    // touch overlay simple HTML
    this.createTouchControls();
    // platforms group
    this.platforms=this.physics.add.staticGroup();
    this.addPlatform(200,250,'cracked_ice_png',{slippery:true,cracked:true});
    this.addPlatform(480,220,'cracked_ice_png',{slippery:false,snowdrift:true});
    this.addPlatform(800,240,'cracked_ice_png',{slippery:true});
    // secret room entrance: hidden at x=1000 - standing on a special cracked tile reveals a passage
    this.addPlatform(1000,240,'cracked_ice_png',{slippery:false,secret:true});
    // coins
    this.coins=this.physics.add.group();
    for(let i=0;i<20;i++){ let c=this.coins.create(160+100*(i%6),100+20*Math.floor(i/6),'coin').setScale(2); c.body.setAllowGravity(false); }
    this.physics.add.overlap(this.player,this.coins,this.collectCoin,null,this);
    // enemies
    this.enemies=this.physics.add.group();
    this.spawnSnowman(600,200); this.spawnSeal(900,200);
    this.physics.add.collider(this.enemies,this.platforms);
    this.physics.add.collider(this.player,this.enemies,this.hitEnemy,null,this);
    // boss (spawn later in level)
    this.boss = null; this.time.delayedCall(8000, ()=>{ this.spawnBoss(1400,160); }, [], this);
    // HUD
    this.score=0; this.scoreText=this.add.text(12,10,'Score:0',{fontFamily:'monospace'}).setScrollFactor(0).setDepth(10);
    this.livesText=this.add.text(360,10,'Lives:3',{fontFamily:'monospace'}).setScrollFactor(0).setDepth(10);
    // particles snow
    this.snowEmitter=this.add.particles('snowflake_png').createEmitter({x:{min:0,max:2400},y:-10,lifespan:5000,speedY:{min:20,max:60},quantity:2});
    // cracked tile timers
    this.crackedTimers=new Map();
    // camera
    this.cameras.main.setBounds(0,0,2400,272); this.cameras.main.startFollow(this.player,true,0.08,0.08);
    // collisions world/platforms
    this.physics.add.collider(this.player,this.platforms,this.onPlayerPlatform,null,this);
    // secret room flag
    this.secretUnlocked=false;
    // high score
    this.highScore = parseInt(localStorage.getItem('penguin_perils_highscore')||'0',10);
  }

  update(time,delta){
    // parallax
    const vx=this.player.body.velocity.x/100;
    this.bg2.tilePositionX+=vx*0.2; this.bg3.tilePositionX+=vx*0.4; this.bg4.tilePositionX+=vx*0.6;
    // basic movement with slippery/snowdrift influence
    const onGround = this.player.body.blocked.down;
    let speed = 160;
    if(this.isOnSnowdrift(this.player)) speed = 110;
    if(this.cursors.left.isDown || this._touchLeft){ this.player.setVelocityX(-speed); this.player.flipX=true; }
    else if(this.cursors.right.isDown || this._touchRight){ this.player.setVelocityX(speed); this.player.flipX=false; }
    else { if(onGround && this.getPlatformProperty(this.player,'slippery')){ this.player.setVelocityX(this.player.body.velocity.x*0.98); } else { this.player.setVelocityX(this.player.body.velocity.x*0.6); } }
    // variable jump
    if((this.keys.space.isDown || this._touchJump) && onGround){
      if(!this._jumpStart) this._jumpStart = performance.now();
      const held = Math.min(300, performance.now() - this._jumpStart);
      if(held>20) this.player.setVelocityY(-200 - (held/300)*220);
    } else { this._jumpStart = null; }
    // update enemies & boss AI
    this.enemies.getChildren().forEach(e=> this.updateEnemy(e, delta) );
    if(this.boss && this.boss.active) this.updateBoss(this.boss, delta);
    // handle cracked tiles timers
    for(let [p,t] of this.crackedTimers){ this.crackedTimers.set(p, t+delta); if(t+delta>1400){ p.destroy(); this.crackedTimers.delete(p); this.sound.play('ice_break'); } }
    // update HUD
    this.scoreText.setText('Score:'+this.score);
    this.livesText.setText('Lives:'+this.player.lives);
  }

  // Platform helpers
  addPlatform(x,y,key,props={}){ const p = this.platforms.create(x,y,key).setScale(1).refreshBody(); p.props = props; return p; }
  getPlatformUnder(sprite){ let found=null; this.platforms.getChildren().forEach(p=>{ if(Phaser.Geom.Rectangle.Overlaps(sprite.getBounds(), p.getBounds())) found=p; }); return found; }
  getPlatformProperty(sprite,prop){ const p=this.getPlatformUnder(sprite); return p && p.props && p.props[prop]; }
  isOnSnowdrift(sprite){ return this.getPlatformProperty(sprite,'snowdrift'); }
  onPlayerPlatform(player, platform){ if(platform.props && platform.props.cracked){ if(!this.crackedTimers.has(platform)) this.crackedTimers.set(platform,0); } if(platform.props && platform.props.secret && !this.secretUnlocked){ // reveal secret room
    this.secretUnlocked = true; this.sound.play('secret'); // spawn secret room coins/heart
    for(let i=0;i<8;i++){ let c=this.coins.create(1000+30*(i%4), 120+30*Math.floor(i/4),'coin').setScale(2); c.body.setAllowGravity(false); }
    const h = this.physics.add.sprite(1040,100,'heart').setScale(1);
    h.body.setAllowGravity(false);
    this.physics.add.overlap(this.player, h, ()=>{ h.destroy(); this.player.lives +=1; }, null, this);
  } }

  collectCoin(player, coin){ coin.disableBody(true,true); this.score+=10; this.sound.play('coin'); }

  // Enemies
  spawnSnowman(x,y){ const s = this.enemies.create(x,y,'snowman').setScale(1.0); s.patrol={left:x-80,right:x+80,dir:-1}; s.type='snowman'; s.health=2; s.setCollideWorldBounds(true); return s; }
  spawnSeal(x,y){ const s = this.enemies.create(x,y,'seal').setScale(1.0); s.patrol={left:x-60,right:x+60,dir:1}; s.type='seal'; s.health=1; s.setCollideWorldBounds(true); return s; }
  updateEnemy(e,delta){
    if(!e.active) return;
    const dx = this.player.x - e.x; const dist=Math.abs(dx); const detect=180;
    if(dist < detect && Math.abs(this.player.y - e.y) < 40){ // chase
      const s = dx>0?60:-60; e.setVelocityX(s); e.flipX = s<0;
    } else { // patrol
      if(!e.patrol) e.patrol={left:e.x-80,right:e.x+80,dir:-1};
      if(e.x <= e.patrol.left) e.patrol.dir = 1;
      if(e.x >= e.patrol.right) e.patrol.dir = -1;
      e.setVelocityX(40 * e.patrol.dir);
      e.flipX = e.patrol.dir>0?false:true;
    }
  }
  hitEnemy(player, enemy){
    if(this.player.isInvincible) return;
    if(player.body.velocity.y > 0 && player.y < enemy.y){
      // stomp
      enemy.health -= 1;
      player.setVelocityY(-180);
      if(enemy.health <= 0){ enemy.destroy(); this.score += 50; this.sound.play('coin'); }
      else { this.sound.play('hit'); }
      return;
    }
    // take damage
    this.takeDamage();
    const dir = (player.x < enemy.x) ? -1 : 1;
    player.setVelocityX(-200 * dir);
    player.setVelocityY(-120);
    this.cameras.main.shake(200, 0.01);
  }

  takeDamage(){ if(this.player.isInvincible) return; this.player.lives -= 1; this.sound.play('hit'); this.player.isInvincible = true; this.player.setTint(0xff9999); this.time.delayedCall(1500, ()=>{ this.player.isInvincible = false; this.player.clearTint(); }, [], this); if(this.player.lives <= 0){ this.onGameOver(); } }

  // Boss implementation
  spawnBoss(x,y){
    this.boss = this.physics.add.sprite(x,y,'snowman').setScale(2.0);
    this.boss.maxHealth = 10; this.boss.health = 10; this.boss.phase = 1; this.boss.setImmovable(true);
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.collider(this.player, this.boss, (p,b)=>{ this.hitBoss(p,b); }, null, this);
    this.sound.play('boss_roar');
  }
  updateBoss(boss, delta){
    if(!boss.active) return;
    // boss AI: simple periodic slam + spawn minions when damaged
    if(!boss._timer) boss._timer = 0;
    boss._timer += delta;
    if(boss._timer > 2200){
      boss._timer = 0;
      // slam: brief area attack
      this.cameras.main.shake(300,0.02);
      // spawn minions
      for(let i=0;i<2;i++) this.spawnSnowman(boss.x + (i? -80:80), boss.y - 10);
    }
    // phase change
    if(boss.health <= 6 && boss.phase === 1){ boss.phase = 2; boss.setTint(0xffaaaa); boss.setScale(2.4); }
  }
  hitBoss(player, boss){
    if(player.body.velocity.y > 0 && player.y < boss.y){
      boss.health -= 1;
      player.setVelocityY(-220);
      this.score += 100;
      this.sound.play('hit');
      if(boss.health <= 0){ boss.destroy(); this.onBossDefeated(); }
      return;
    }
    this.takeDamage();
  }
  onBossDefeated(){
    this.score += 500;
    // save high score
    const hi = parseInt(localStorage.getItem('penguin_perils_highscore')||'0',10);
    if(this.score > hi) localStorage.setItem('penguin_perils_highscore', this.score.toString());
    // celebratory coins
    for(let i=0;i<12;i++){ let c=this.coins.create(this.cameras.main.midPoint.x - 60 + i*10, 80 + (i%3)*10,'coin').setScale(2); c.body.setAllowGravity(false); }
  }

  onGameOver(){
    // save high score
    const hi = parseInt(localStorage.getItem('penguin_perils_highscore')||'0',10);
    if(this.score > hi) localStorage.setItem('penguin_perils_highscore', this.score.toString());
    // restart to title after short delay
    this.time.delayedCall(800, ()=>{ this.scene.start('TitleScene'); }, [], this);
  }

  // Touch controls: create minimal HTML overlay
  createTouchControls(){
    try{
      const dom = this.add.dom(0,0);
      const html = `<div class="touch-controls" id="touch-controls">
        <div style="display:flex;gap:8px">
          <div class="btn" id="btn-left">◀</div>
          <div class="btn" id="btn-right">▶</div>
        </div>
        <div style="display:flex;align-items:center">
          <div class="btn" id="btn-jump">▲</div>
        </div>
      </div>`;
      dom.createFromHTML(html);
      // Attach listeners on next tick (DOM may not be ready synchronously)
      setTimeout(()=>{
        const left = document.getElementById('btn-left');
        const right = document.getElementById('btn-right');
        const jump = document.getElementById('btn-jump');
        if(!left || !right || !jump) return;
        left.addEventListener('touchstart', e=>{ e.preventDefault(); this._touchLeft = true; }, {passive:false});
        left.addEventListener('touchend', e=>{ e.preventDefault(); this._touchLeft = false; }, {passive:false});
        right.addEventListener('touchstart', e=>{ e.preventDefault(); this._touchRight = true; }, {passive:false});
        right.addEventListener('touchend', e=>{ e.preventDefault(); this._touchRight = false; }, {passive:false});
        jump.addEventListener('touchstart', e=>{ e.preventDefault(); this._touchJump = true; }, {passive:false});
        jump.addEventListener('touchend', e=>{ e.preventDefault(); this._touchJump = false; }, {passive:false});
        // hide when keyboard detected
        window.addEventListener('keydown', ()=>{ const el=document.getElementById('touch-controls'); if(el) el.style.display='none'; });
      }, 200);
    }catch(e){ /* ignore DOM overlay errors in non-browser env */ }
  }
}
