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

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  private gameOver: boolean = false;
  private paused: boolean = false;

  private platforms;
  private player;
  private stars;
  private bombs;

  // UI
  private scoreText;
  private levelText;
  private pauseBtn;

  // Gameover
  private gameoverText;
  private toMainMenuBtn;

  // Sounds
  private sounds = {
    bg: null,
    jump: null,
  };

  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.gameOver = false;

    this.add.image(1000 / 2, 750 / 2, 'background');

    // Platforms
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('grass', 'tiles');
    this.platforms = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
    this.platforms.setCollisionByExclusion([-1], true);

    // Player
    this.player = this.physics.add.sprite(100, 600, 'character-walk').setScale(0.18);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(300, 450).setOffset(75, 0);
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
    this.physics.add.collider(this.player, this.platforms);

    // Stars
    this.stars = this.physics.add.group({
        key: 'star',
        repeat: 13,
        setXY: { x: 12, y: 0, stepX: 70 },
    });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    // Bombs
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    // UI
    this.scoreText = this.add.text(1000 - 16, 16, `${this.score}`, {
      fill: '#FFB533',
      fontFamily: 'Fredoka One',
    }).setStroke('#FFFFFF', 3).setFontSize(40).setOrigin(1.0, 0);

    this.levelText = this.add.text(1000 / 2, 16, `Level: ${this.level}`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One',
    }).setStroke('#FFFFFF', 3).setFontSize(25).setOrigin(0.5, 0);

    this.pauseBtn = this.add.image(16, 16, 'pause').setOrigin(0, 0).setScale(0.5);
    this.pauseBtn.setInteractive({ useHandCursor: true });
    this.pauseBtn.on('pointerup', this.playOrPause);

    // Gameover
    this.gameoverText = this.add.text(1000 / 2, 180, `Game Over`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One',
    }).setFontSize(85).setOrigin(0.5, 0.5).setStroke('#FFFFFF', 16);
    this.gameoverText.visible = false;

    this.toMainMenuBtn = new MenuButton(this, 1000 / 2 - 180, 450, 'Back to Menu', () => {
      this.sounds.bg.stop();
      this.scene.start('MainMenu');
    });
    this.toMainMenuBtn.hide();

    // Background Music
    this.sounds.bg = this.sound.add('background-music', {
      loop: true,
    });
    this.sounds.bg.play();
    this.sounds.jump = this.sound.add('jump-sound');

    // Start Game
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.createBomb();
  }

  public update() {

    if (this.gameOver) {
      return;
    }

    if (this.cursorKeys.left.isDown) {
        this.player.setVelocityX(-300);
        this.player.anims.play('left', true);
        this.player.flipX = true;
    } else if (this.cursorKeys.right.isDown) {
        this.player.setVelocityX(300);
        this.player.anims.play('right', true);
        this.player.flipX = false;

    } else {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
    }

    if (this.cursorKeys.space.isDown && this.player.body.onFloor()) {
        this.player.setVelocityY(-560);
        this.sounds.jump.play();
    }
  }

  private playOrPause() {
    this.paused = !this.paused;
    if (this.paused) {
      game.scene.pause('Game');
    } else {
      game.scene.resume('Game');
    }
  }

  private hitBomb(player, bomb) {
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.handleGameOver();
  }

  private collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText(this.score);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
          child.enableBody(true, child.x, 0, true, true);
      });
      this.createBomb();

      this.level += 1;
      this.levelText.setText('Level: ' + this.level);
    }
  }

  private handleGameOver() {
    this.gameOver = true;
    const bestScore: number = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    localStorage.setItem('bestScore', Math.max(this.score, bestScore).toString());
    this.score = 0;
    this.level = 1;

    this.gameoverText.visible = true;
    this.toMainMenuBtn.show();
  }

  private createBomb() {
    const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    const bomb = this.bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-100, 100), 20);
  }
}
