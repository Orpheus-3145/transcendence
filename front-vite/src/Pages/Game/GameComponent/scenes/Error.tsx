import { Scene } from 'phaser';

export default class Error extends Scene
{
  errorData: { trace: string } = { trace: ''};

  constructor () {
    
    super({ key: 'Error' });
  }

  init( errorData : { trace: string }) {

    this.errorData = errorData
  }
  
  preload() {

  }

  create () {

    this.add.text(400, 100, this.errorData.trace, {
      fontSize: '32px',
      align: 'center',
      color: '0xff0000',
    });

    // do something else, either kill the game, reload, ...
  }
}