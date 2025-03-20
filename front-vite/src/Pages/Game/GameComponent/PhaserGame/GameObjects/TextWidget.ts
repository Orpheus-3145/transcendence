import GameScene from "../Scenes/Game";

export default class TextWidget extends Phaser.GameObjects.Text{
  
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);
  private readonly baseFontSize: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    fontSize = 10,
    color = '#fff',
    align = 'center',
  ) {
    super(
      scene, x, y, text, {
        fontSize: 0,
        align: align,
        color: color,
      }
    );
    super.setFontSize(Math.round(scene.scale.width * parseInt(import.meta.env.GAME_FONT_SIZE_RATIO, 10)) + fontSize);
    console.group(`font: ${Math.round(scene.scale.width * parseInt(import.meta.env.GAME_FONT_SIZE_RATIO, 10)) + fontSize}`);
    this.baseFontSize = fontSize;
		super.setOrigin(0.5, 0.5);
    scene.add.existing(this);
  }
}