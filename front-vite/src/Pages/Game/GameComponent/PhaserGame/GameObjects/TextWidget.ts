export default class TextWidget extends Phaser.GameObjects.Text{
  
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);
  private readonly baseFontSize: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    fontSize: number = 20,
    color: string = '#fff',
    align: string = 'center',
  ) {
    super(
      scene, x, y, text, {
        fontSize: 0,
        align: align,
        color: color,
      }
    );
    this.baseFontSize = fontSize;
    super.setFontSize(Math.round(this.scene.scale.width * this._textFontRatio) + this.baseFontSize);
		super.setOrigin(0.5, 0.5);
    this.scene.add.existing(this);
  }

  resize(old_width: number, old_height: number): void {

    const w_ratio = this.scene.scale.width / old_width;
    const h_ratio = this.scene.scale.height / old_height;
  
    this.x *= w_ratio;
    this.y *= h_ratio;
    this.setDisplaySize(this.width * w_ratio, this.height * h_ratio);
    super.setFontSize(Math.round(this.scene.scale.width * this._textFontRatio) + this.baseFontSize);
  }
}