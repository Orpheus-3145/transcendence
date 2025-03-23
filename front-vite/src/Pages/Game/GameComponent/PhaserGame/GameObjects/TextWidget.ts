import Resizable from "./Resizable";

export default class TextWidget extends Phaser.GameObjects.Text implements Resizable{
  
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);
  private readonly baseFontSize: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    fontSize: number = 10,
    fontColor: string = '#fff',
    align: string = 'center',
  ) {
    super(
      scene, x, y, text, {
        fontSize: 0,
        align: 'center',
        color: fontColor,
      }
    );
    this.baseFontSize = fontSize;
    this.setFontSize(Math.round(this.scene.scale.width * this._textFontRatio) + this.baseFontSize);
    if (align === 'left')
  		this.setOrigin(0, 0.5);
    else if (align === 'right')
  		this.setOrigin(1, 0.5);
    else
      this.setOrigin(0.5, 0.5);
    this.scene.add.existing(this);
  }

  resize(old_width: number, old_height: number): void {
    
    const w_ratio = this.scene.scale.width / old_width;
    const h_ratio = this.scene.scale.height / old_height;
  
    this.setPosition(this.x * w_ratio, this.y * h_ratio);
    this.setDisplaySize(this.width * w_ratio, this.height * h_ratio);
    this.setFontSize(Math.round(this.scene.scale.width * this._textFontRatio) + this.baseFontSize);
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
}