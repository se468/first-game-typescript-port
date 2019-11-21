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
  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.add.image(1000/2, 750/2, 'background');

    this.add.text(1000/2, 180, `SEYONG's ADVANTURE`, { 
      fill: '#000000',
      fontFamily: 'Fredoka One'
    }).setFontSize(50).setOrigin(0.5, 0.5);

    new MenuButton(this, 50, 350, 'Start Game', () => {
      this.scene.start('Game');
    });

    new MenuButton(this, 400, 350, 'Settings', () => {
      console.log('settings button clicked');
    });

    new MenuButton(this, 750, 350, 'Help', () => {
      console.log('help button clicked');
    });
  }
}
