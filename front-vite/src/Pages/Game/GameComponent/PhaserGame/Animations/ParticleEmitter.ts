import BaseAnimation from "./BaseAnimation";

export default class ParticleEmitter extends BaseAnimation {
	private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

	constructor(scene: Phaser.Scene) {
		super(scene);
		window.addEventListener("resize", this.onResize.bind(this)); // Listen for window resize
	}

	create(): void {
		// Create a small circle texture dynamically
		const radius = this.scene.scale.width / this.scene.scale.height * 2;
		const circleTexture = this.createCircleTexture("circleParticle", radius);

		this.emitter = this.createEmitter(circleTexture);
	}

	createEmitter(texture: string): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(0, 0, texture, {
			speedX: { min: -50, max: 50 }, // Move slowly in X direction
			speedY: { min: -50, max: 50 }, // Move slowly in Y direction
			lifespan: { min: 10000, max: 50000 },
			quantity: 2,
			frequency: 50,
			scale: { start: 1, end: 0 }, // Fade out over time
			blendMode: 'ADD',
			tint: [0x6600ff, 0xffa500],

			bounce: 1
		});
		this.centreEmitter(emitter);
		emitter.addParticleBounds(0, 0, this.scene.scale.width, this.scene.scale.height);
		return (emitter);
	}

	centreEmitter(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
		const x_pos = this.scene.scale.width / 2;
		const y_pos = this.scene.scale.height / 2;
		emitter.setPosition(x_pos, y_pos);
	}

	/** Called when the window resizes */
	onResize(): void {
		this.scene.scale.refresh(); // Update Phaser's scale manager
		this.centreEmitter(this.emitter); // Recenter the emitter
	}

	update(): void {}

	stopAndKill(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
		if (!emitter) return;
		emitter!.stop();
		emitter!.killAll();
	}

	destroy(): void {
		window.removeEventListener("resize", this.onResize.bind(this));
		this.stopAndKill(this.emitter);
	}
}
