export default class PowerUp extends Phaser.GameObjects.Graphics {
  private readonly sizeRatio: number;
  private readonly size: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene);

    // Add this graphics object to the scene
    scene.add.existing(this);

    this.sizeRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_BALL_RADIUS);
    this.size = scene.scale.width / this.sizeRatio * 3;

    // Set position and draw the initial triangle
    this.setPosition(x, y);
    this.drawTriangle();

    const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2); // Random angle in radians (0° to 360°)
    this.setRotation(randomAngle); // Apply random rotation    const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2); // Random angle in radians (0° to 360°)
  }

  // Draw a triangle
  private drawTriangle() {
    this.clear();
	// Also nice: d80032, e70e02
    this.fillStyle(0xef233c, 1); // Yellow fill color

    // Triangle vertices (centered at 0,0 for easier positioning)
    const halfSize = this.size / 2;
    this.fillTriangle(
      0, -halfSize,  // Top vertex
      -halfSize, halfSize,  // Bottom-left vertex
      halfSize, halfSize  // Bottom-right vertex
    );
  }

  // Update position and redraw triangle with new coordinates
  updatePosition(x: number, y: number) {
    this.setPosition(x, y);
  }

  destroy(): void {
    this.clear(); // Clear graphics
    super.destroy(); // Call parent destroy method
  }
}
