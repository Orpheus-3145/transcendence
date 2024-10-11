// import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../GameData'

export default class Game extends Scene
{
  background: Phaser.GameObjects.Image = null!;

  constructor ()
  {
    super({ key: 'Game' })
  }

  preload()
  {
  }

  create()
  {
  }
}
