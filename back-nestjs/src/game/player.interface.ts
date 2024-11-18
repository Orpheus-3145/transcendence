import { Socket } from 'socket.io';

export default interface Player {
  
  clientSocket: Socket,
  intraId: number,
  nameNick: string,
};