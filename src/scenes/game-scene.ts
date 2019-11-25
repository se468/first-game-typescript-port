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

  private platforms;
  private player;
  private stars;
  private bombs;
  private scoreText;
  private levelText;
  //Gameover
  private gameoverText;
  private toMainMenuBtn;

  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.gameOver = false;
    
    this.add.image(1000/2, 750/2, 'background');

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
          end: 9 
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'character-walk', frame: 2 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('character-walk', { 
          start: 0, 
          end: 9 
        }),
        frameRate: 10,
        repeat: -1
    });
    this.physics.add.collider(this.player, this.platforms);

    // Stars
    this.stars = this.physics.add.group({
        key: 'star',
        repeat: 13,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    // Bombs
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    this.scoreText = this.add.text(1000 - 16, 16, `${this.score}`, { 
      fill: '#FFB533',
      fontFamily: 'Fredoka One'
    }).setStroke("#FFFFFF", 3).setFontSize(40).setOrigin(1.0, 0);

    this.levelText = this.add.text(1000 / 2, 16, `Level: ${this.level}`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One'
    }).setStroke("#FFFFFF", 3).setFontSize(25).setOrigin(0.5, 0);
    
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.createBomb();

    // Gameover
    this.gameoverText= this.add.text(1000 / 2, 180, `Game Over`, {
      fill: '#3386FF',
      fontFamily: 'Fredoka One'
    }).setFontSize(85).setOrigin(0.5, 0.5).setStroke("#FFFFFF", 16);
    this.gameoverText.visible = false;

    this.toMainMenuBtn = new MenuButton(this, 1000 / 2 - 180, 450, 'Back to Menu', () => {
      this.scene.start('MainMenu');
    });
    this.toMainMenuBtn.hide();
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
    }
  }

  private hitBomb (player, bomb)
  {
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.handleGameOver();
  }

  private collectStar (player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText(this.score);

    if (this.stars.countActive(true) === 0)
    {
      this.stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
      });
      this.createBomb();

      this.level += 1;
      this.levelText.setText('Level: ' + this.level);
    }
  }

  private handleGameOver() {
    this.gameOver = true;
    let bestScore: number = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    localStorage.setItem('bestScore', Math.max(this.score, bestScore).toString());
    this.score = 0;

    this.gameoverText.visible = true;
    this.toMainMenuBtn.show();
  }

  private createBomb() {
    let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    let bomb = this.bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-100, 100), 20);
  }
}
