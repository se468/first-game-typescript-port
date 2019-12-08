import { game } from '../main';
import { MenuButton } from '../ui/menu-button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {

  public score: number = 0;
  public level: number = 1;
  private gameOver: boolean = false;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  private gameObjects = {
    platforms: null,
    player: null,
    stars: null,
    bombs: null,
  };

  // UI
  private UI = {
    scoreText: null,
    levelText: null,
    pauseBtn: null,
    muteBtn: null,

    // GameOver
    gameOverText: null,
    toMainMenuBtn: null,
  };

  // Sounds
  private sounds = {
    bg: null,
    jump: null,
    coin: null,
  };

  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.gameOver = false;
    this.add.image(1000 / 2, 750 / 2, 'background');

    this.initGameObjects();
    this.initUI();

    // Background Music
    this.sounds.bg = this.sound.add('background-music', {
      loop: true,
    });
    this.sounds.bg.play();
    this.sounds.jump = this.sound.add('jump-sound');
    this.sounds.coin = this.sound.add('coin-sound');

    // Start Game
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.createBomb();
  }

  public update() {
    if (this.gameOver) {
      return;
    }

    if (this.cursorKeys.left.isDown) {
        this.gameObjects.player.setVelocityX(-300);
        this.gameObjects.player.anims.play('left', true);
        this.gameObjects.player.flipX = true;
    } else if (this.cursorKeys.right.isDown) {
        this.gameObjects.player.setVelocityX(300);
        this.gameObjects.player.anims.play('right', true);
        this.gameObjects.player.flipX = false;

    } else {
        this.gameObjects.player.setVelocityX(0);
        this.gameObjects.player.anims.play('turn');
    }

    if (this.cursorKeys.space.isDown && this.gameObjects.player.body.onFloor()) {
        this.gameObjects.player.setVelocityY(-650);
        this.sounds.jump.play();
    }
  }

  protected initGameObjects() {
    // Platforms
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('grass', 'tiles');
    this.gameObjects.platforms = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
    this.gameObjects.platforms.setCollisionByExclusion([-1], true);

    // Player
    this.gameObjects.player = this.physics.add.sprite(100, 600, 'character-walk').setScale(0.18);
    this.gameObjects.player.setBounce(0);
    this.gameObjects.player.setCollideWorldBounds(true);
    this.gameObjects.player.body.setSize(300, 450).setOffset(75, 0);
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('character-walk', {
          start: 0,
          end: 9,
        }),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'character-walk', frame: 2 } ],
        frameRate: 20,
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('character-walk', {
          start: 0,
          end: 9,
        }),
        frameRate: 10,
        repeat: -1,
    });
    this.physics.add.collider(this.gameObjects.player, this.gameObjects.platforms);

    // Stars
    this.gameObjects.stars = this.physics.add.group({
        key: 'star',
        repeat: 13,
        setXY: { x: 12, y: 0, stepX: 70 },
    });
    this.physics.add.collider(this.gameObjects.stars, this.gameObjects.platforms);
    this.physics.add.overlap(this.gameObjects.player, this.gameObjects.stars, this.collectStar, null, this);

    // Bombs
    this.gameObjects.bombs = this.physics.add.group();
    this.physics.add.collider(this.gameObjects.bombs, this.gameObjects.platforms);
    this.physics.add.collider(this.gameObjects.player, this.gameObjects.bombs, this.hitBomb, null, this);
  }

  protected initUI() {
    this.UI.scoreText = this.add.text(1000 - 16, 16, `${this.score}`, {
      fill: '#FFB533',
      fontFamily: 'Fredoka One',
    }).setStroke('#FFFFFF', 3).setFontSize(40).setOrigin(1.0, 0);

    this.UI.levelText = this.add.text(1000 / 2, 16, `Level: ${this.level}`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One',
    }).setStroke('#FFFFFF', 3).setFontSize(25).setOrigin(0.5, 0);

    this.UI.muteBtn = this.add.image(16, 16, (this.game.sound.mute ? 'mute' : 'sound')).setOrigin(0, 0).setScale(0.5);
    this.UI.muteBtn.setInteractive({ useHandCursor: true });
    this.UI.muteBtn.on('pointerup', () => {this.toggleSound(); });

    this.UI.pauseBtn = this.add.image(16, 80, 'pause').setOrigin(0, 0).setScale(0.5);
    this.UI.pauseBtn.setInteractive({ useHandCursor: true });
    this.UI.pauseBtn.on('pointerup', () => {this.pauseClicked(); });

    // Gameover
    this.UI.gameOverText = this.add.text(1000 / 2, 180, `Game Over`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One',
    }).setFontSize(85).setOrigin(0.5, 0.5).setStroke('#FFFFFF', 16);
    this.UI.gameOverText.visible = false;

    this.UI.toMainMenuBtn = new MenuButton(this, 1000 / 2 - 180, 450, 'Back to Menu', () => {
      this.sounds.bg.stop();
      this.scene.start('MainMenu');
      this.scene.stop();
    });
    this.UI.toMainMenuBtn.hide();
  }

  private pauseClicked() {
    this.game.scene.pause('Game');
    this.game.scene.start('Pause');
  }

  private toggleSound() {
    if (!this.game.sound.mute) {
      this.game.sound.mute = true;
      this.UI.muteBtn.setTexture('mute', 0);
    } else {
      this.game.sound.mute = false;
      this.UI.muteBtn.setTexture('sound', 0);
    }
  }

  private hitBomb(player, bomb) {
      this.cameras.main.shake(100);
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.handleGameOver();
  }

  private collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.UI.scoreText.setText(this.score);
    this.sounds.coin.play();
    if (this.gameObjects.stars.countActive(true) === 0) {
      this.gameObjects.stars.children.iterate((child) => {
          child.enableBody(true, child.x, 0, true, true);
      });
      this.createBomb();

      this.level += 1;
      this.UI.levelText.setText('Level: ' + this.level);
    }
  }

  private handleGameOver() {
    this.gameOver = true;
    const bestScore: number = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    localStorage.setItem('bestScore', Math.max(this.score, bestScore).toString());
    this.score = 0;
    this.level = 1;

    this.UI.gameOverText.visible = true;
    this.UI.toMainMenuBtn.show();
  }

  private createBomb() {
    const x = (this.gameObjects.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    const bomb = this.gameObjects.bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-100, 100), 20);
  }
}
