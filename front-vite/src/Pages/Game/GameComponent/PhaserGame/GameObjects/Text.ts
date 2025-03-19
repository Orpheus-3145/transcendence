import GameScene from "../Scenes/Game";

export default class TextButton extends Phaser.GameObjects.Text{
  
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);
  private readonly basicFontSize!: number | string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ) {
    super(scene, x, y, text, style);
    if (style.fontSize)
      this.basicFontSize = style.fontSize;
    super.setFontSize(scene.scale.width * this._textFontRatio + Number(style.fontSize));
    scene.add.existing(this);
  }


}