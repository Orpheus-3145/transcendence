import Resizable from "./Resizable";
import TextWidget from "./TextWidget";

export default class PopupWidget extends Phaser.GameObjects.Container implements Resizable {

  private _widgets: Array<Resizable> = [];
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly title: TextWidget;

  constructor(scene: Phaser.Scene, title: string = '') {

    super(scene, scene.scale.width / 4, scene.scale.height / 4);

    this.background = this.scene.add.rectangle(scene.scale.width / 4,
      scene.scale.height / 4,
      scene.scale.width / 2,
      scene.scale.height / 2,
      0xfff,
    )
    .setStrokeStyle(2, 0xffffff)
    .setInteractive()
    .setOrigin(0.5, 0.5);
    this.add(this.background);
      
    this.title = new TextWidget(
      this.scene,
      this.background.width * 0.5,
      this.background.height * 0.1,
      title,
      -5
    );
    this.add(this.title);
  
    this.scene.add.existing(this);
    this.hide();
  }

  add<T extends Phaser.GameObjects.GameObject>(child: (T|T[])): this {
    super.add(child);
    
    if ( child instanceof TextWidget )
      this._widgets.push(child);
  
    return this;
  }

  resize(old_width: number, old_height: number): void {
    this._widgets.forEach((child: any) => child.resize(old_width, old_height));

    const w_ratio = this.scene.scale.width / old_width;
		const h_ratio = this.scene.scale.height / old_height;

    this.background.setPosition(this.background.x * w_ratio, this.background.y * h_ratio);
    this.background.setDisplaySize(this.background.width * w_ratio, this.background.height * h_ratio);
  }

  setTitle(title: string): void {
    this.title.setText(title);
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
}