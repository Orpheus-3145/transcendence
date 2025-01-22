import { Socket } from 'socket.io';

export enum GameMode {
	single = 'single',
	multi = 'multi',
	unset = 'unset',
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
	speedBall = 0,
	speedPaddle = 1,
	slowPaddle = 2,
	shrinkPaddle = 3,
	stretchPaddle = 4
}

export interface WaitingPlayer {
	clientSocket: Socket;
	extras: boolean;
}

export interface Player {
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
