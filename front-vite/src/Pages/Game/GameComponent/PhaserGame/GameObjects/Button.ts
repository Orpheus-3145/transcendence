import TextWidget from "./TextWidget";

export default class ButtonWidget extends TextWidget {

  private activeColor;
  private border: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    callback: () => void,
    fontSize: number = 10,
    color: string = '#ffffff',
    align: string = 'center',
  ) {
    super(scene, x, y, text, fontSize, '#ffffff', align);
    this.activeColor = parseInt(color.replace("#", ""), 16);
    this.setInteractive()
    .on('pointerover', () => {    // Change color on hover
      this.setStroke(color, 2);
      this.drawBorder(this.activeColor);
    })
    .on('pointerout', () => {    // Change color on hover
      if (this.border) {
        this.border.destroy();
        this.border = null;
      }
      this.setStroke(color, 0);
    })
    .on('pointerup', () => callback());
    
    // set to 1 so frame won't cover the text
    this.setDepth(1);
  }

  drawBorder(color: number): void {
		
    this.border = this.scene.add.graphics();
    this.border.lineStyle(3, color);
    
    const bounds = this.getBounds();
    this.border.strokeRect(bounds.x - 10, bounds.y - 10, bounds.width + 20, bounds.height + 20);
	}

  resize(old_width: number, old_height: number): void {
    
    super.resize(old_width, old_height);
    if (this.border) {
      this.border.destroy();
      this.drawBorder(this.activeColor);
    }
  }

  hide(): void {
    super.hide();

    if (this.border) {
      this.border.destroy();
      this.border = null;
    }
  }
}