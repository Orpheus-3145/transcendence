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

export interface PowerUpSelection {
	speedball: boolean;
	powerup_2: boolean;
	powerup_3: boolean;
	powerup_4: boolean;
	powerup_5: boolean;
}

export interface WaitingPlayer {
	clientSocket: Socket;
	extras: PowerUpSelection;
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
