import BaseAnimation from "./BaseAnimation";

export default class ParticleSystem extends BaseAnimation {

	constructor(scene: Phaser.Scene) {
		super(scene);
	}

	create(): void {
		const n_particles = this.scene.scale.width / 3;
		// const n_particles = 0;
		console.log("Particles System animation created");
		for (let i = 0; i < n_particles; i++) {
			this.createBouncingParticle();
		}
	}

	createBouncingParticle(): void {
		const x = Phaser.Math.Between(0, this.scene.scale.width);
		const y = Phaser.Math.Between(0, this.scene.scale.height);
		        // Create a small circle texture dynamically
		const radius = this.scene.scale.width / this.scene.scale.height * 2;
        const circleTexture = this.createCircleTexture("circleParticle", radius);

		const particle = this.scene.physics.add.sprite(x, y, circleTexture);
		particle.setVelocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(-20, 20));
		particle.setBounce(1); // Full bounce effect
		particle.setCollideWorldBounds(true); // Bounce off walls
		particle.setScale(Phaser.Math.FloatBetween(0.5, 1));

		// // Optional: Fade out over time
		// this.scene.tweens.add({
		// 	targets: particle,
		// 	alpha: 0,
		// 	duration: 50000,
		// 	onComplete: () => particle.destroy(),
		// });

	}

	// Remove the ball stuff the the disconneted error persists
	update(): void {
		this.updateParticleInteractions();
	}


	updateParticleInteractions(): void {
	
		if (!this._ball) return;

		const ballPos = this._ball.getPos();
		const particles = this.scene.children.list.filter(obj => obj instanceof Phaser.Physics.Arcade.Sprite) as Phaser.Physics.Arcade.Sprite[];

		particles.forEach(particle => {
			const dx = particle.x - ballPos.x;
			const dy = particle.y - ballPos.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const repelRadius = 50; // Area where particles get pushed
			const repelForce = 300; // Strength of push
			const damping = 0.98; // How much speed is reduced (closer to 1 = less slowdown)
			const minSpeed = 50; // Minimum movement speed to keep floating
			const maxSpeed = 80; // Cap speed to avoid infinite acceleration

			if (distance < repelRadius && distance > 0) {
				const forceX = (dx / distance) * repelForce;
				const forceY = (dy / distance) * repelForce;
				particle.setAcceleration(forceX, forceY);
			} else {
				particle.setAcceleration(0, 0);
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

	destroy(): void {
		this.scene.children.list.forEach((gameObject) => {
			if (gameObject instanceof Phaser.GameObjects.Sprite) {
				gameObject.destroy(); // Remove all particles
			}
		});
	}


}
