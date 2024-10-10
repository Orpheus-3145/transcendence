// import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../GameData'

export default class MainGame extends Scene
{
    // camera: Phaser.Cameras.Scene2D.Camera = null!;
    // background: Phaser.GameObjects.Image = null!;
    // gameText: Phaser.GameObjects.Text = null!;

    // constructor ()
    // {
    //     super('Game');
    // }

    preload()
    {
        this.load.spritesheet('bars', 'assets/texture/sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('background', 'assets/texture/background.png')
    }

    create ()
    {
        // this.camera = this.cameras.main;
        // this.camera.setBackgroundColor(0x00ff00);
        // this.background = 
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
        // this.background = this.add.image(512, 384, 'background');
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
