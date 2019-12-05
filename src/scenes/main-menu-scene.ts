import { MenuButton } from '../ui/menu-button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class MainMenuScene extends Phaser.Scene {
  // Sounds
  private bgmusic;

  constructor() {
    super(sceneConfig);
  }

  public create() {
    // console.log(this.sys.game);
    this.add.image(1000 / 2, 750 / 2, 'background');

    this.add.text(1000 / 2, 180, `FOX LIKES STARS`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One',
    }).setFontSize(85).setOrigin(0.5, 0.5).setStroke('#FFFFFF', 16);

    const bestScore: number = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    this.add.text(1000 / 2, 350, `Best Score: ${bestScore}`, {
      fill: '#FFB533',
      fontFamily: 'Fredoka One',
    }).setFontSize(40).setOrigin(0.5, 0.5).setStroke('#FFFFFF', 3);

    const startBtn: MenuButton = new MenuButton(this, 1000 / 2 - 80, 450, 'PLAY', () => {
      this.bgmusic.stop();
      this.scene.start('Game');
    });

    const muteBtn = this.add.image(16, 16, 'sound').setOrigin(0, 0).setScale(0.5);
    muteBtn.setInteractive({ useHandCursor: true });
    muteBtn.on('pointerup', () => {this.toggleSound(); });

    // Background Music
    this.bgmusic = this.sound.add('background-music', {
      loop: true,
    });
    this.bgmusic.play();
  }

  private toggleSound() {
    if (this.bgmusic.isPlaying) {
      this.bgmusic.stop();
    } else {
      this.bgmusic.play();
    }
  }
}
