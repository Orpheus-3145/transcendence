export default class ToggleWidget {

  private readonly scene: Phaser.Scene;
  private toggleWidth: number;
  private toggleHeight: number;
  private borderRadius: number;
  private knobRadius: number;
  private toggleX: number;
  private toggleY: number;
  private leftX: number;
  private rightX: number;

  private readonly toggle: Phaser.GameObjects.Graphics;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly callback: Function;
  private isActive: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    callback: Function,
  ) {
    this.scene = scene;
    this.toggleWidth = this.scene.scale.width * 0.07;       // Toggle width
    this.toggleHeight = this.scene.scale.height * 0.03;     // Toggle height
    this.borderRadius = this.toggleHeight / 2;              // Half height for full rounding
    this.knobRadius = this.toggleHeight * 0.8;              // Slightly smaller for a better fit
    this.toggleX = x;                                       // Toggle's center X position
    this.toggleY = y;                                       // Toggle's Y position
    this.leftX = this.toggleX - (this.toggleWidth / 2) + this.borderRadius;     // Leftmost knob position
    this.rightX = this.toggleX + (this.toggleWidth / 2) - this.borderRadius;    // Rightmost knob position

    this.toggle = this.scene.add.graphics()
    .setInteractive(
      new Phaser.Geom.Rectangle(
        this.toggleX - this.toggleWidth / 2,
        this.toggleY - this.toggleHeight / 2,
        this.toggleWidth,
        this.toggleHeight
      ),
      Phaser.Geom.Rectangle.Contains
    )
    .on('pointerup', this.updateToggle.bind(this));
    this.drawToggle(); // Default to inactive state

    // Create the circular knob
    this.knob = this.scene.add.circle(this.leftX, this.toggleY, this.knobRadius, 0xffffff)
    .setOrigin(0.5, 0.5)
    .setInteractive()
    .on('pointerup', this.updateToggle.bind(this));

    this.callback = callback;
   }

  drawToggle(): void {
    
    this.toggle.clear();
    this.toggle.fillStyle(this.isActive ? 0x3bb273 : 0xd2d2cf, 1); // Green if active, Red if inactive
    this.toggle.fillRoundedRect(
      this.toggleX - this.toggleWidth / 2,
      this.toggleY - this.toggleHeight / 2,
      this.toggleWidth,
      this.toggleHeight,
      this.borderRadius
    );
  }

  updateToggle(): void {
    this.isActive = !this.isActive;
    
    this.callback(this.isActive);
  
    this.scene.tweens.add({
        targets: this.knob,
        x: this.isActive ? this.rightX : this.leftX, // Move knob left or right
        duration: 200,
        ease: 'Power2'
    });

    this.drawToggle(); // Redraw background with correct color
  }

  resize(old_width: number, old_height: number): void {

    const w_ratio = this.scene.scale.width / old_width;
    const h_ratio = this.scene.scale.height / old_height;

    this.toggleWidth *= w_ratio;
    this.toggleHeight *= h_ratio;
    this.borderRadius *= h_ratio;              // Half height for full rounding
    this.knobRadius = this.toggleHeight * 0.8;              // Slightly smaller for a better fit
    this.toggleX *= w_ratio;
    this.toggleY *= h_ratio;
    this.leftX = this.toggleX - (this.toggleWidth / 2) + this.borderRadius;     // Leftmost knob position
    this.rightX = this.toggleX + (this.toggleWidth / 2) - this.borderRadius;    // Rightmost knob position
    
    this.drawToggle();
    // this.updateToggle();
    // this.x *= w_ratio;
    // this.y *= h_ratio;
    // this.setDisplaySize(this.width * w_ratio, this.height * h_ratio);
    // super.setFontSize(Math.round(this.scene.scale.width * this._textFontRatio) + this.baseFontSize);

    this.knob.setPosition(this.leftX, this.toggleY);
    this.knob.setDisplaySize(this.knob.width * w_ratio, this.knob.height * h_ratio);
    this.knob.setRadius(this.knobRadius);
  }
}