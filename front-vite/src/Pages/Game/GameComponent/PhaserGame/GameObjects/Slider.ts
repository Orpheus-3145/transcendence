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

	private toggle: Phaser.GameObjects.Graphics;
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

		this.toggle = this.scene.add.graphics();
		this.drawToggle();

		// Create the circular knob
		this.knob = this.scene.add.circle(this.leftX, this.toggleY, this.knobRadius, 0xffffff)
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerup', this.updateToggle.bind(this))
		.setDepth(1);

		this.callback = callback;
	 }

	drawToggle(): void {
		
		this.toggle.destroy();
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
		this.toggle.fillStyle(this.isActive ? 0x3bb273 : 0xd2d2cf, 1); // Green if active, Red if inactive
		this.toggle.fillRoundedRect(
			this.toggleX - this.toggleWidth / 2,
			this.toggleY - this.toggleHeight / 2,
			this.toggleWidth,
			this.toggleHeight,
			this.borderRadius
		)
		.setDepth(0);
	}

	updateToggle(): void {
		this.isActive = !this.isActive;
		console.log('pressed');

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
		this.borderRadius *= h_ratio;
		this.knobRadius = this.toggleHeight * 0.8;
		this.toggleX *= w_ratio;
		this.toggleY *= h_ratio;
		this.leftX = this.toggleX - (this.toggleWidth / 2) + this.borderRadius;
		this.rightX = this.toggleX + (this.toggleWidth / 2) - this.borderRadius;

		this.drawToggle();

		if (this.isActive)
			this.knob.setPosition(this.rightX, this.toggleY)
		else
			this.knob.setPosition(this.leftX, this.toggleY)
		.setDisplaySize(this.knob.width * w_ratio, this.knob.height * h_ratio)
		.setRadius(this.knobRadius)
		.setDepth(1);
	}
}