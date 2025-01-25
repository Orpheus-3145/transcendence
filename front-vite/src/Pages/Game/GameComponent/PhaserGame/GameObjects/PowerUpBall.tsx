export default class PowerUpBall extends Phaser.GameObjects.Graphics {
  private readonly radius: number;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene);

		// Add this graphics object to the scene
		scene.add.existing(this);

		this.radius = scene.scale.width / (parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_BALL_RADIUS));
	
		// Set position and draw the initial circle
		this.setPosition(x, y);
		this.fillStyle(0xffff00, 1); // Yellow fill color
		this.fillCircle(0, 0, this.radius);
	}

	// Update position and redraw ball with new coordinates
	updatePosition(x: number, y: number) {
		this.clear(); // Clear previous drawing
		this.fillStyle(0xffff00, 1); // Reset fill color
		this.fillCircle(0, 0, this.radius); // Redraw the ball
		this.setPosition(x, y); // Update position
	}

	destroy(): void {
		this.clear(); // Clear graphics (optional, not strictly necessary since destroy will handle cleanup)
		super.destroy(); // Call the parent class's destroy method
	}
}
