import { Socket } from 'socket.io';

export default interface Player {
  
  clientSocket: Socket,
  intraId: number,
  nameNick: string,
};

export enum GameMode {
  single = 'single',
  multi = 'multi',
  unset = 'unset',
};