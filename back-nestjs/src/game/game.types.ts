import { Socket } from 'socket.io';

export interface Player {
  
  clientSocket: Socket,
  intraId: number,
  nameNick: string,
  score: number,
  posY: number,
};

// export interface GameState { 
// 	ball: { 
// 		x: number, 
// 		y: number
// 	}, 
// 	player1: { 
// 		y: number 
// 	}, player2: { 
// 		y: number
// 	},
// 	score: {
// 		p1: number, 
// 		p2: number}
// };

export enum GameMode {
  single = 'single',
  multi = 'multi',
  unset = 'unset',
};

export enum PaddleDirection {
  up = 'up',
  down = 'down',
};
