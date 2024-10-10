import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../GameData'

export default class CreatingGame extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera = null!;
    background: Phaser.GameObjects.Image = null!;
    gameText: Phaser.GameObjects.Text = null!;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
    }
    create ()
    {
        // this.camera = this.cameras.main;
        // this.camera.setBackgroundColor(0x00ff00);
        
        // this.background.setAlpha(0.5);

        // this.gameText = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5).setDepth(100);

        // EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}