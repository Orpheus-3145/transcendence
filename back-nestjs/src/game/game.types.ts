import { Socket } from 'socket.io';

export enum GameMode {
  single = 'single',
  multi = 'multi',
  unset = 'unset',
};

export enum PaddleDirection {
  up = 'up',
  down = 'down',
};

export interface Player {
  
  clientSocket: Socket,
  intraId: number,
  nameNick: string,
  score: number,
  posY: number,
};

export interface GameState {

	ball: { 
		x: number, 
		y: number
	}, 
	p1: { 
		y: number 
	},
  p2: { 
		y: number
	},
	score: {
		p1: number, 
		p2: number}
};
