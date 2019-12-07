
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Pause',
};

export class PauseScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create() {
    const rect = new Phaser.Geom.Rectangle(0, 0, 1000, 750);
    const graphics = this.add.graphics({
      fillStyle: { color: 0x000000 },
    }).setAlpha(0.8);

    graphics.fillRectShape(rect);

    this.input.once('pointerup', function() {
      this.scene.resume('Game');
      this.scene.stop('Pause');
    }, this);
  }
}
