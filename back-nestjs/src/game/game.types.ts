import { Socket } from 'socket.io';

export enum GameMode {
	single = 'single',
	multi = 'multi',
	unset = 'unset',
}

export enum GameDifficulty {
	easy = 'easy',
	medium = 'medium',
	hard = 'hard',
	unset = 'unset', // This is only the case when the variable is initialised, it is always overwritten with 'single' or 'multi'
}

export enum PaddleDirection {
	up = 'up',
	down = 'down',
}

export enum PlayerIdentity {
	self = 0,
	opponent = 1,
}

export enum PowerUpType {
	speedBall = 'speedBall',
	speedPaddle = 'speedPaddle',
	slowPaddle = 'slowPaddle',
	shrinkPaddle = 'shrinkPaddle',
	stretchPaddle = 'stretchPaddle'
}

export interface WaitingPlayer {
	clientSocket: Socket;
	extras: Array<PowerUpType>;
}

export interface PlayingPlayer {
	clientSocket: Socket;
	intraId: number;
	nameNick: string;
	score: number;
	posY: number;
}

export interface GameState {
	ball: {
		x: number;
		y: number;
	};
	p1: {
		y: number;
	};
	p2: {
		y: number;
	};
	score: {
		p1: number;
		p2: number;
	};
}
