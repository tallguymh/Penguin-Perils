const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width:1024, height:576 },
    render: { pixelArt: true },
    physics: { default:'arcade', arcade:{ gravity:{ y:1000 }, debug:false } },
    scene: [BootScene, TitleScene, GameScene, EditorScene]
};
window.game = new Phaser.Game(config);
