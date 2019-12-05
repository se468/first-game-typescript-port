import * as Phaser from 'phaser';
import Scenes from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'My First Name',

  type: Phaser.AUTO,

  scale: {
    width: 1000,
    height: 750,
  },

  scene: Scenes,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      fps: 60,
      debug: false,
    },
  },

  parent: 'game',
};

export const game = new Phaser.Game(gameConfig);
