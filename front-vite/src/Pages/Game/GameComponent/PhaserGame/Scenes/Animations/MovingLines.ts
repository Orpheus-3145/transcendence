import BaseAnimation from "./BaseAnimation";

export default class MovingLines extends BaseAnimation {
    private _lines: Phaser.GameObjects.Group | null = null;
	private _timer: Phaser.Time.TimerEvent | null = null;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    create(): void {
        this._lines = this.scene.add.group();
		console.log("Moving Lines animation is created");
        this._timer = this.scene.time.addEvent({
            delay: 500,
            loop: true,
            callback: this.spawnCluster,
            callbackScope: this
        });
    }

    private spawnCluster(): void {
        if (!this._lines) return;

        const clusterSize = Phaser.Math.Between(1, 3);
        const randomY = Phaser.Math.Between(30, this.scene.scale.height - 30);
        const speed = Phaser.Math.Between(2, 5);

        for (let i = 0; i < clusterSize; i++) {
            this.scene.time.delayedCall(Phaser.Math.Between(0, 500), () => {
                if (!this._lines) return;

                const width = Phaser.Math.Between(1, 20);
                const height = 3;
                const offsetY = Phaser.Math.Between(-30, 30);
                const line = this.scene.add.rectangle(0, randomY + offsetY, width, height, 0xD3D3D3);
                line.setDepth(0);
                (line as any).speed = speed;
                this._lines.add(line);
            });
        }
    }

    update(): void {
        if (!this._lines) return;

        this._lines.getChildren().forEach((line: Phaser.GameObjects.Rectangle) => {
            (line as any).x += (line as any).speed;
            if ((line as any).x > this.scene.scale.width) {
                line.destroy();
            }
        });
    }

    destroy(): void {
        if (this._lines) {
            // this._lines.clear(true, true);
			this._lines.destroy();
        }
		if (this._timer)
			this.scene.time.removeEvent(this._timer);
    }
}
