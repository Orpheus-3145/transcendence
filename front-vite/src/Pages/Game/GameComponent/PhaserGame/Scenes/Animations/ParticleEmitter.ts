import BaseAnimation from "./BaseAnimation";

export default class ParticleEmitter extends BaseAnimation {
    private emitter1!: Phaser.GameObjects.Particles.ParticleEmitter;
	private emitter2!: Phaser.GameObjects.Particles.ParticleEmitter;
	private emitter3!: Phaser.GameObjects.Particles.ParticleEmitter;
	private emitter4!: Phaser.GameObjects.Particles.ParticleEmitter;
	private emitter5!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    create(): void {
        // Create a small circle texture dynamically
		const radius = this.scene.scale.width / this.scene.scale.height * 2;
        const circleTexture = this.createCircleTexture("circleParticle", radius);

		console.log("Particle Emitter is created");

		// return ;
		this.emitter1 = this.createEmitter(circleTexture);
       
		this.scene.time.delayedCall(Phaser.Math.Between(100, 500), () => {
			this.emitter2 = this.createEmitter(circleTexture)
		});

		this.scene.time.delayedCall(Phaser.Math.Between(100, 500), () => {
			this.emitter3 = this.createEmitter(circleTexture)
		});
		this.scene.time.delayedCall(Phaser.Math.Between(100, 500), () => {
			this.emitter4 = this.createEmitter(circleTexture)
		});
		this.scene.time.delayedCall(Phaser.Math.Between(100, 500), () => {
			this.emitter5 = this.createEmitter(circleTexture)
		});


    }


	createEmitter(texture: string): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(0, 0, texture, {
            speedX: { min: -30, max: 30 }, // Move slowly in X direction
            speedY: { min: -30, max: 30 }, // Move slowly in Y direction
            lifespan: { min: 50000, max: 500000 }, // Longer lifespan
            quantity: 1, // Emit 1 at a time
            frequency: 200, // Emit every 500ms
            scale: { start: 1, end: 0 }, // Fade out over time
            blendMode: 'ADD', // Nice glowing effect
        	tint: [0xff0000, 0x0000ff, 0xff00ff], // Red, Green, Blue, Yellow, Purple
            // bounds: { // Constrain movement to the screen dimensions
            //     x: 0,
            //     y: 0,
            //     width: this.scene.scale.width,
            //     height: this.scene.scale.height
            // },
            // collideLeft: true,
            // collideRight: true,
            // collideTop: true,
            // collideBottom: true
        });
		const x_pos = Phaser.Math.Between(50, this.scene.scale.width - 50);
		const y_pos = Phaser.Math.Between(50, this.scene.scale.height - 50);
		emitter!.setPosition(x_pos, y_pos);
		return (emitter);
	}

	shiftPosition(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
		this.scene.tweens.add({
			targets: emitter!,
			props: {
				x: { value: Phaser.Math.Between(0, this.scene.scale.width), ease: 'Sine.easeInOut' },
				y: { value: Phaser.Math.Between(0, this.scene.scale.height), ease: 'Sine.easeInOut' }
			},
			duration: Phaser.Math.Between(2000, 5000), // Slow movement
			repeat: -1,
			yoyo: true

		});
	}

    update(): void {
        // No need for update logic unless particles need to change dynamically
    }

	stopAndKill(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
		if (!emitter) return;
		emitter!.stop();
		emitter!.killAll();
	}

    destroy(): void {
		this.stopAndKill(this.emitter1);
		this.stopAndKill(this.emitter2);
		this.stopAndKill(this.emitter3);
		this.stopAndKill(this.emitter4);
		this.stopAndKill(this.emitter5);
    }

}
