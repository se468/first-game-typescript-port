import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {

  public score: number = 0;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  
  private gameOver: boolean = false;

  private platforms;
  private player;
  private stars;
  private bombs;
  private scoreText;

  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.add.image(1000/2, 750/2, 'background');
        
    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(0, 750 - 60, 'ground').setOrigin(0, 0).setScale(3,2).refreshBody();
    this.platforms.create(50, 560, 'ground');
    this.platforms.create(600, 400, 'ground'); //mid 2
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // Player
    this.player = this.physics.add.sprite(100, 600, 'character-walk').setScale(0.2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
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
        frames: [ { key: 'character-walk', frame: 4 } ],
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
    this.stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    // Bombs
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  public update() {
    
    if (this.gameOver)
    {
        return;
    }

    if (this.cursorKeys.left.isDown)
    {
        this.player.setVelocityX(-160);
        this.player.anims.play('left', true);
    } else if (this.cursorKeys.right.isDown)
    {
        this.player.setVelocityX(160);
        this.player.anims.play('right', true);
        
    } else
    {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
    }

    if (this.cursorKeys.space.isDown && this.player.body.touching.down)
    {
        this.player.setVelocityY(-330);
    }
  }

  private hitBomb (player, bomb)
  {
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.gameOver = true;
  }

  private collectStar (player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.stars.countActive(true) === 0)
    {
      this.stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
      });

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
}
