import BaseAnimation from "./BaseAnimation";

export default class ParticleSystem extends BaseAnimation {

	private particles: Array<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody> = [];
	private readonly _textureName: string = 'circleParticle';

	constructor(scene: Phaser.Scene) {
		super(scene);
		window.addEventListener("resize", this.handleResize.bind(this)); 
	}

	create(): void {
		this.createParticles();
	}

	createParticles(): void {
		const n_particles = this.scene.scale.width;
		const radius = this.scene.scale.width / this.scene.scale.height * 2;
		this.createCircleTexture(this._textureName, radius);
		for (let i = 0; i < n_particles; i++) {
			this.createBouncingParticle();
		}
	}
	
	createBouncingParticle(): void {
		
		// console.log("Width: ", this.scene.scale.width);
		// console.log("Height: ", this.scene.scale.height);
		const x = Phaser.Math.Between(0, this.scene.scale.width);
		const y = Phaser.Math.Between(0, this.scene.scale.height);

		const particle = this.scene.physics.add.sprite(x, y, this._textureName);
	
		particle.setVelocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(-20, 20));
		particle.setBounce(1);
		particle.setScale(Phaser.Math.FloatBetween(0.5, 1));

		this.particles.push(particle);
	}

	// Remove the ball stuff the the disconneted error persists
	update(): void {
		this.updateParticleInteractions();


		// Custom boundary check for each particle
		// this.particles.forEach(particle => {
		// 	// Left boundary
		// 	if (particle.x < 0) {
		// 		particle.setX(0); // Prevent particle from going off the left side
		// 		particle.setVelocityX(Math.abs(particle.body.velocity.x)); // Reverse direction to the right
		// 	}

		// 	// Right boundary
		// 	if (particle.x > this.scene.scale.width) {
		// 		particle.setX(this.scene.scale.width); // Prevent particle from going off the right side
		// 		particle.setVelocityX(-Math.abs(particle.body.velocity.x)); // Reverse direction to the left
		// 	}

		// 	// Top boundary
		// 	if (particle.y < 0) {
		// 		particle.setY(0); // Prevent particle from going off the top
		// 		particle.setVelocityY(Math.abs(particle.body.velocity.y)); // Reverse direction down
		// 	}

		// 	// Bottom boundary
		// 	if (particle.y > this.scene.scale.height) {
		// 		particle.setY(this.scene.scale.height); // Prevent particle from going off the bottom
		// 		particle.setVelocityY(-Math.abs(particle.body.velocity.y)); // Reverse direction up
		// 	}
		// });
	}

	handleResize(): void {
		this.destroyParticles();
		this.createParticles();
	}

	updateParticleInteractions(): void {
	
		if (!this._ball) return;

		const ballPos = this._ball.getPos();
		const particles = this.scene.children.list.filter(obj => obj instanceof Phaser.Physics.Arcade.Sprite) as Phaser.Physics.Arcade.Sprite[];

		particles.forEach(particle => {
			const dx = particle.x - ballPos.x;
			const dy = particle.y - ballPos.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const repelRadius = 80; // Area where particles get pushed
			const repelForce = 320; // Strength of push
			const damping = 0.98; // How much speed is reduced (closer to 1 = less slowdown)
			const minSpeed = 50; // Minimum movement speed to keep floating
			const maxSpeed = 80; // Cap speed to avoid infinite acceleration

			if (distance < repelRadius && distance > 0) {
				const forceX = (dx / distance) * repelForce;
				const forceY = (dy / distance) * repelForce;
				particle.setAcceleration(forceX, forceY);
			} else {
				particle.setAcceleration(10, 10);
			}

			// Apply damping, but ensure it keeps moving
			let newVx = particle.body.velocity.x * damping;
			let newVy = particle.body.velocity.y * damping;

			// Ensure minimum movement to keep floating
			if (Math.abs(newVx) < minSpeed) newVx = Phaser.Math.FloatBetween(-minSpeed, minSpeed);
			if (Math.abs(newVy) < minSpeed) newVy = Phaser.Math.FloatBetween(-minSpeed, minSpeed);

			// Cap max speed
			// newVx = Phaser.Math.Clamp(newVx, -maxSpeed, maxSpeed);
			// newVy = Phaser.Math.Clamp(newVy, -maxSpeed, maxSpeed);

			particle.setVelocity(newVx, newVy);
		});
	}

	destroyParticles(): void {
		this.particles.forEach(
			(particle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => particle.destroy()
		);
		this.particles.length = 0;
	}
	
	destroy(): void {
		this.destroyParticles();
		this.scene.scale.off('resize', this.handleResize, this);
	}


}
